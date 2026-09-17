# Technical Frameworks for Widget API Specs (V2)

> Read this before writing any V2 spec. These are decision rules, not suggestions. Each one exists to close a question the V1 specs left open or never asked. Where a rule produces a verdict, the spec states the verdict — it does not present the question back to the reader as an option.

The premise behind all four frameworks:

**The browser is not a query engine.** What the client cannot hold, it cannot filter, sort, aggregate, search or paginate. Every decision below follows from that one sentence.

---

## Framework 1 — Filter execution

A filter is not "a param". It is a decision about where a query runs, and it has a cost.

### The rule

> A filter may execute **client-side** only if all three hold:
> 1. The full unfiltered set it operates on is **already present** in a response the client has, and
> 2. That set is **provably bounded** (a stated maximum row count, with a cited basis), and
> 3. Filtering it changes **no aggregate that the server computed**.
>
> If any one of the three fails, it is a **server-side param** and the widget re-queries.

Condition 3 is the one that gets missed. If the server returns `total` over the full set and the client then filters the rows, the visible rows and the visible total describe different populations. That is not a rounding problem, it is a wrong number on screen.

### Per-filter, the spec must state

| Column | What goes in it |
|---|---|
| Filter | The control as the user sees it |
| Option source | `STATIC` enum (list the values) · `LOOKUP` endpoint (name the table/repository behind it) · `DERIVED` from the data response itself |
| Cardinality | Realistic option count, with basis. Under ~20 → plain dropdown. Over ~200 → searchable server-side lookup, and say so |
| Execution | `SERVER` (re-query, name the param) or `CLIENT` (view over an existing response) — plus which of the three conditions justifies `CLIENT` |
| Aggregate effect | Does applying it change a KPI, total, subtotal or series the server computed? Yes/No |
| Cascade | Does this filter's option list depend on another filter's current value? If yes, the lookup endpoint takes that value as a param |
| "All" wire form | Omit the param, or send an explicit sentinel. Pick one and state it — it changes the SQL and the cache key |
| Round trips | Calls fired when this filter changes |

### Combination and conflict

The spec states, once:

- **Combination semantics** across filters — normally AND, and narrowing. If any pair is OR, or any pair is mutually exclusive in the UI, say which.
- **Conflict rule** for params that can contradict each other (an entity id that does not belong to the selected type; a grain that is invalid for the selected window). One of: reject with a stated error, or one param wins with a stated precedence. Never "undefined".
- **Empty-result semantics** — a filter combination matching nothing returns a well-formed zero response, not an error, and the spec says what "zero" looks like field by field.

### Cascading lookups

If filter B's options depend on filter A, the spec must give B's lookup endpoint an A-shaped param and state what happens to a B value that is no longer valid after A changes (cleared to All, or kept and errors). This is a real interaction bug source and costs one line to close.

---

## Framework 2 — Volume, and what it forces into the contract

### Per dataset returned, state

| Item | Requirement |
|---|---|
| Typical rows | Expected count at a normal org |
| Worst realistic rows | Count at a large org, **with a cited basis** — a dossier statement, an SME number, or a live query. **The built Final's dataset size is not a basis for a ceiling**; it is a demo figure and belongs in the typical-rows column only. A number with no basis is not acceptable; write `[TO CONFIRM]` with a named owner instead |
| Row width | Field count and rough bytes per row |
| Payload verdict | The size at worst-realistic |
| Verdict | `BOUNDED` · `MUST PAGINATE` · `MUST AGGREGATE SERVER-SIDE` |
| Server cost model | What the server actually does: single indexed scan · per-row subquery · N entities × M periods · repeated window reconstruction. Name the multiplier |
| Cache posture | `LIVE` per request · `TTL` (state it) · `PRECOMPUTED` (state the job cadence) — and the staleness that implies for the response's `asOf` field |

### The verdicts

- **BOUNDED** — the whole set fits in one response at worst-realistic volume. Client-side sort and filter over it are then legitimate (subject to Framework 1 condition 3).
- **MUST PAGINATE** — the row list is unbounded or large. See the pagination consequences below.
- **MUST AGGREGATE SERVER-SIDE** — the client never needs the rows at all, only figures derived from them. Do not ship rows the UI does not render.

### The hard rule

> **If a dataset is paginated, then sort, filter, search and aggregation are all server-side.**
> Client-side sort, filter, search or totals over a paginated set is a defect, not a shortcut.

Everything that rule forces into the contract, all of which must appear explicitly:

1. **`sortBy` / `sortDir` params**, with a whitelist of sortable fields. A paginated table the user cannot sort is a regression from a table that fit on one page — and "sort is fixed server-side" is a design decision that must be stated deliberately, not arrived at by omission.
2. **A deterministic total order.** Pagination over a non-unique sort key returns duplicated and skipped rows across pages. The sort must end in a unique tiebreaker (an id). State it.
3. **`totalCount`** (and page/pageSize echo) in the response, so the client can render a pager without a second call.
4. **Aggregates span the full filtered set, never the page.** State it in words, per aggregate. Switching pages must never change a KPI, a donut, or a trend line.
5. **`pageSize` bounds** — default and maximum. An unbounded `pageSize` re-creates the problem pagination solved.
6. **Behaviour past the last page** — empty rows, correct `totalCount`, correct aggregates, not an error.

### The build-volume trap

**A mockup holds its whole dataset in the browser. Production does not.** So every operation the built Final performs instantly and client-side — grouping, ranking, sorting, totalling, searching, paging — is instant *because the demo dataset is small*, not because the design permits it. That is a property of the fixture, never evidence about the contract.

The test is Framework 1's second condition: is the set **provably bounded**? A set bounded by definition (a fixed number of aging bands, a fixed number of view tiers) stays client-side legitimately. A set bounded only by how much test data someone typed does not. When a build groups or ranks an unbounded set client-side, that work moves to the server in the spec, and the spec says so plainly rather than mirroring the build's behaviour.

This is one of the most valuable things a spec can catch, because the build will look and feel correct right up until the first large organisation opens it.

### Time series and the N × M trap

A series is not one dataset, it is entities × periods. Before speccing a per-entity series, compute the multiplier and write it down: *N accounts × M points, per request*. If that number is large, the spec must state the posture (live, cached, precomputed) rather than leaving performance as an open item. Note explicitly that **pagination does not help a series**, because an aggregate series at a parent level sums over every child, not just the visible page.

### Consistency across calls

If two calls must agree with each other (a summary and the list behind it), they need a **shared snapshot anchor** — an `asOf` / `asOfDate` param the client passes to both, echoed in both responses. Without it the two calls can straddle a write and disagree, and the user sees a total that does not match the rows. State the anchor, or state explicitly that drift is acceptable and why.

---

## Framework 3 — API decomposition: one, two or three APIs

A widget's API count is derived, not chosen. Apply the triggers; the count falls out.

### Split triggers — separate endpoints when ANY of these fire

1. **Cardinality gap.** A bounded summary and an unbounded list are different endpoints. The summary must never pay for the list.
2. **Trigger gap.** Fetched on widget render vs fetched on user action (opening a drill, expanding a row). Never ship data for an interaction that has not happened.
3. **Lifetime gap.** Filter option lists change rarely and are often shared across widgets; the data changes constantly. Different cache posture ⇒ different endpoint.
4. **Read vs write.** Always separate. A mutation is never a variant of a read.
5. **Grain gap.** Point-in-time snapshot vs time series vs per-entity detail keyed by id are three different questions of the data.
6. **Conditional weight.** A heavy part that is only sometimes needed splits from a light part that is always needed.

### Counter-pressures — reasons to combine

- **Consistency.** Two calls can straddle a write. If both halves must reconcile exactly on screen, either combine them or give them a shared `asOf` anchor (Framework 2).
- **N+1.** Never one call per row. A per-entity endpoint is legitimate for a drill the user opens; it is not legitimate as the way a table gets populated.
- **Always-together latency.** Two calls that always fire together, both cheap, both required to render anything, are one call.

### What the spec must produce

**API inventory** — one row per API, and the split trigger is mandatory:

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Why separate |
|---|---|---|---|---|---|---|

A row with no split trigger cited means that API should not exist separately. Merge it.

**Call sequence** — per user interaction, the calls that fire:

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | | |
| Change filter *X* | | |
| Switch view | | |
| Open drill / row expand | | |
| Submit action | | |
| Refresh | | |

Every API in the inventory must appear in at least one row of the call sequence. An API nothing calls is dead weight; an interaction with no calls listed is unspecified behaviour.

### On options

Applying these triggers **produces an answer**. A V2 spec does not present the decomposition as Option A vs Option B — that is the framework's job to close. Labelled options survive only where the trade-off is genuinely outside this framework's reach (a platform constraint, an infrastructure cost only the dev team can price), and then each option gets two sentences and a named decider.

---

## Framework 4 — Where computation lives

One table, covering every derived value the widget displays: KPI, percentage, delta, subtotal, grand total, series point, status band, sort order, count.

| Value | Server or client | Basis | Why |
|---|---|---|---|

### The rule

> **Server** computes anything that requires data the client does not hold — which is everything spanning a paginated, filtered-away, or never-transmitted set.
> **Client** computes pure arithmetic over values already present in the response.

Corollaries worth stating in the spec:

- **Pre-sign deltas server-side.** Return `diffAmount` and `diffPct` already signed, so the client formats and never does math or sign-checking.
- **Division-by-zero rules belong to whoever divides.** If the server computes a percentage, the server states what it returns when the denominator is zero (`null`, omitted, or `0`) — one explicit rule, not per-consumer improvisation.
- **Presentation bands are client-side.** Colour thresholds, ahead/behind labels, status pills: the API returns raw numbers and the client bands them. But the **threshold values themselves** are a business rule — if they are not yet approved, that is an open item, not a silent default.
- **Never return raw history for the client to subtract.** If the client needs a delta, return the delta.

---

## Provenance classes (used in every field table)

Every response field carries exactly one:

| Class | Meaning |
|---|---|
| `STORED` | Read directly from a named `Table.Column` |
| `DERIVED` | Computed from stored values — the formula is given inline |
| `NEW` | Requires backend work that does not exist today in any form |
| `UNVERIFIED` | Believed available but not confirmed in code or data — carries a named owner to confirm |

And the evidence tags carried forward from the Step 4 design docs, so provenance survives the handoff instead of collapsing into the word "confirmed":

`[LIVE]` verified in a running environment on a stated date · `[CODE]` confirmed in the codebase, file named · `[SME]` interview-sourced, name + date · `[BUILD]` true of the mockup build · `[DOC]` backed by a named written source · `[TO CONFIRM]` assumed, named owner to confirm.

A field that is `UNVERIFIED` or `[TO CONFIRM]` must never sit in a schema table looking as authoritative as a `STORED [CODE]` field beside it. That is the single most common way a spec misleads a developer.

---

## The no-history rule

A V2 spec is a **present-tense contract**. It describes the design as it is, and nothing about how it got there.

Banned from the spec body:

- Dated decision parentheticals — *"(decided 2026-08-05, owner)"*, *"(DRAFT header removed …)"*
- Change narration — *"Why v3 changed this spec"*, *"this replaces"*, *"previously"*, *"superseded"*, *"was rewritten"*, *"carried from the pre-Final concept"*
- Option archaeology — *"the rest of this section records the options that were weighed"*
- Version numbers inside the document body

All of it goes to `DECISIONS.md` in the same widget folder — a dated log, outside the spec, where it is genuinely useful and cannot dilute the contract. The spec may cite a decision's outcome as fact; it may not narrate the decision.

The linter enforces this. It is not a style preference — a developer reading a contract should not have to work out which sentences are still true.
