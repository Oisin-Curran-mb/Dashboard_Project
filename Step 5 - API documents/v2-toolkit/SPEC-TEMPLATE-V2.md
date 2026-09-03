# <Widget Name> — API Spec

**Status: DRAFT — not final**

> Delete this quote block before shipping. This is the V2 template. Section order is fixed. Sections marked **(required)** must be present and non-empty for the linter to pass — if a section genuinely does not apply, keep the heading and write one line saying why it does not apply, rather than deleting it. Read `../v2-toolkit/TECHNICAL-FRAMEWORKS.md` before filling any of this in.
>
> **This document is a present-tense contract.** No dates, no change narration, no "previously", no version numbers, no record of options that were weighed. All of that belongs in `DECISIONS.md` in this folder.

---

## Overview (required)

Three to six sentences. What business question the widget answers, what the user does with it, and how many APIs this contract defines and why. No frontend description beyond what is needed to understand the data.

State the API count up front, e.g.: *This contract defines two APIs — a bounded summary read fired on render, and a paginated row list fired when the user opens a bucket.* The justification lives in the API Inventory below.

---

## Design → API coverage (required)

Every element of the built Final, mapped to what feeds it. Nothing on screen may be unfunded; nothing in the API may be unused.

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| | KPI / chart series / table column / filter / view toggle / drill / action / state | | | |

Rules:

- Every KPI, chart series, table column, filter, view, drill target, action and non-default state in the build gets a row.
- Every field in every response schema below appears in at least one row. A field nothing consumes is removed from the contract.
- A design element with no field is either a client-side derivation (say so, and it must appear in *Where computation lives*) or a gap — and a gap is a blocking open item, not a footnote.

---

## Tables (required)

| Table / repository | Fields and members used |
|---|---|

State plainly whether new tables or schema changes are needed. Usually they are not, and the answer is "new queries against existing tables" — say it explicitly either way.

Below the table, give the confirmed **core formulas** and **filters applied to every read** as standalone statements, each with its evidence tag. These are the statements a developer will check their query against, so they must be quotable in isolation.

---

## Old vs. new (required)

| | Old (live today) | New (needed) |
|---|---|---|

Real differences only. Do not pad with things that are not changing. Mark each "new" row with its provenance class so it is obvious which rows are `NEW` backend work versus re-shaped existing reads.

---

## API inventory (required)

One row per API. **The split trigger is mandatory** — a row that cannot cite one should not be a separate API.

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|

Split triggers (Framework 3): cardinality gap · trigger gap · lifetime gap · read vs write · grain gap · conditional weight.

If any API pair was considered for merging and kept separate, or considered for splitting and kept together, state the reasoning in one line each — as a conclusion, not as an open option.

---

## Call sequence (required)

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load | | |
| Change filter *X* | | |
| Change filter *Y* | | |
| Switch view | | |
| Open drill / expand row | | |
| Submit action | | |
| Refresh | | |

Every API in the inventory appears in at least one row. Every interaction the build supports appears as a row. Where two calls must reconcile on screen, name the shared `asOf` anchor that keeps them consistent.

---

## Filter architecture (required)

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|

- **Execution** is `SERVER` (name the param) or `CLIENT`. Every `CLIENT` verdict must cite which of Framework 1's three conditions justify it — full set present, provably bounded (with the bound), and no server-computed aggregate affected.
- **Combination semantics:** state once — AND/narrowing across all filters, or name the exceptions.
- **Conflict rule:** for any two params that can contradict, state the resolution (reject with a named error, or a stated precedence). Not "undefined".
- **Cascade invalidation:** if filter B's options depend on filter A, state what happens to a stale B value when A changes.
- **Lookup endpoints:** any `LOOKUP` option source needs its own endpoint specced (it may be an existing shared one — say which) and it appears in the API inventory or is explicitly declared out of contract as pre-existing.

---

## Volume and performance (required)

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|

- **Verdict** is `BOUNDED` · `MUST PAGINATE` · `MUST AGGREGATE SERVER-SIDE`.
- Every row-count figure cites a basis (build dataset size, dossier statement, SME name + date, live query). No basis ⇒ write `[TO CONFIRM]` with a named owner instead of a number.
- **Server cost model** names the multiplier: single indexed scan · per-row subquery · N entities × M periods · window reconstruction per point.
- For any time series, compute and state the N × M product per request, and note that pagination does not reduce it for parent-level aggregates.

### Pagination contract

Required whenever any verdict above is `MUST PAGINATE`. Delete this subsection only if nothing paginates, and say so in one line.

- **Params:** `page` (1-based), `pageSize` — default and **maximum**.
- **What paginates:** name the exact array.
- **What does not:** name every aggregate that computes over the **full filtered set**, never the page. State that switching pages changes no total, chart or KPI.
- **Sort params:** `sortBy` (whitelist the sortable fields) and `sortDir`. If sort is deliberately fixed server-side, state that as a decision and name what the user loses.
- **Deterministic total order:** the sort must end in a unique tiebreaker. Name it.
- **`totalCount`** returned alongside the page.
- **Past the last page:** empty rows, correct `totalCount`, correct aggregates, not an error.

---

## Where computation lives (required)

| Value | Server or client | Basis | Why |
|---|---|---|---|

Cover every derived value on screen: KPI, percentages, deltas, subtotals, grand totals, series points, status bands, sort order, counts.

State explicitly: division-by-zero rule for every server-computed percentage; that deltas are returned pre-signed; and that any presentation threshold not yet approved is an open item rather than a silent default.

---

## API *N*: <name> (required — repeat per API)

### Endpoint

```
GET /api/dashboard/...
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|

Every param needs all six columns filled. Note the company/context header separately.

### Example requests

```
GET ...
GET ...   (with filters applied)
```

At least two, showing the default call and a filtered call. URL-encode anything that needs it and say so.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|

**Provenance** is `STORED Table.Column` · `DERIVED <formula>` · `NEW` · `UNVERIFIED (owner)`, each with its evidence tag. Every field in the JSON example appears here; every field here appears in the JSON example.

### Example response

```json
{
}
```

Real, plausible numbers — never `<amount>` placeholders. Follow the example with a **reconciliation line** proving the arithmetic: every subtotal sums to its total, every count sums to its count, and any figure that must match another API's figure is named as matching it. The linter checks these sums.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | |
| Partial (data exists for only part of the requested span) | |
| Not-yet-existing entity (predates the requested window) | |
| Permission denied | |
| Upstream unavailable | |

Well-formed zero responses, not errors, wherever the state is a legitimate data condition rather than a fault.

---

## Auth and scoping (required)

- **Company / tenant scoping:** the header or param, and the fact that every query is scoped by it.
- **Permission right required** to read, and separately to write if there is a write.
- **What a user without the right sees** — an empty widget, a hidden widget, or an error. This is a product decision and needs an answer.

---

## Edge cases (required)

Numbered, one line each. Work through at minimum: empty results · missing comparison baseline · partial date ranges · division by zero · pagination past the end · conflicting params · entity created mid-range · entity closed mid-range · stale snapshot on write · unknown id.

Do not repeat what the State contracts table already covers — edge cases are the data oddities, state contracts are the response shapes.

---

## Not in scope (required)

What a reader might reasonably assume is included but is not being built. One line each, and say what happens instead where there is an alternative.

---

## Still needs sign-off (required)

Genuinely undecided items only — a short list, not prose. Each item names **what is undecided**, **who decides**, and **what is blocked until they do**.

Sign-off findings from Step 6 carry their status here per the rules in the skill: `Accepted` findings are honoured silently in the contract; `Rejected` ones get one line so a reader of the dossier is not confused; `Disputed` ones appear here with **both claims and both pieces of evidence cited and no side picked**; `Unreviewed` ones block the part they touch.

If this list is empty, say so explicitly — an empty list is a meaningful statement, a missing section is not.
