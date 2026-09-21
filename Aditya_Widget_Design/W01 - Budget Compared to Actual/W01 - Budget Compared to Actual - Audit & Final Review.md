# W01 — Budget Compared to Actual — Audit & Final Review

> **How to use this template:**
> 1. Copy this file into the widget's own folder inside `Aditya_Widget_Design/`.
> 2. Replace `[WNN]`, `[Widget Name]`, and all `[PLACEHOLDER]` values throughout.
> 3. Work through every section in order — do not skip sections or mark items done without evidence.
> 4. A widget is not eligible for "✅ Done" status until every section is complete and the Final Sign-Off block is filled.
> 5. This template is version-controlled — if a rule or section becomes outdated, update the master copy in `Aditya_Widget_Design/TEMPLATE - Audit & Final Review.md`, not a per-widget copy.

---

> ### ⚠️ Source of Truth — Read Before Starting
>
> | Step | Folder | Role |
> |---|---|---|
> | **Step 6 — Sign off document** | [`Step 6 - Sign off document/`](../../Step%206%20-%20Sign%20off%20document/) | **Final source of truth.** The signed-off version of the widget's design is what this document records. Any conflict between Step 4 and Step 6 must be resolved in favour of Step 6. |
> | **Step 4 — Widget Final Design** | [`Step 4 - Widget Final Design/`](../../Step%204%20-%20Widget%20Final%20Design/) | **Reference document.** Consult Step 4 when Step 6 does not yet cover a detail, when tracing the history of a decision, or when a design section has not yet been formally signed off. Do not treat Step 4 as authoritative if a Step 6 entry exists for the same point. |
>
> **In practice:** complete this audit against Step 6. Where Step 6 is silent on a specific detail, consult Step 4 and note in the relevant section that the detail is "from Step 4 — not yet in Step 6." Escalate those gaps to the sign-off owner before closing the final gate.

---

## Header Block

| Field | Value |
|---|---|
| **Widget number** | W01 |
| **Widget name** | Budget Compared to Actual |
| **Module** | [Finance / Payroll / HR / Other] |
| **Reviewer** | [Name or initials] |
| **Review date** | [YYYY-MM-DD] |
| **Sign-off doc (Step 6 — final source of truth)** | [`Step 6 - Sign off document/`](../../Step%206%20-%20Sign%20off%20document/) |
| **Final Design doc (Step 4 — reference when Step 6 is silent)** | [`Step 4 - Widget Final Design/W01 - Budget Compared to Actual.md`](../../Step%204%20-%20Widget%20Final%20Design/) |
| **Widget Spec doc (Step 3 — full history & rejected ideas)** | [`Step 3 - Mock_Work/Widget_Specs/W01-Budget-Compared-to-Actual.md`](../../Step%203%20-%20Mock_Work/Widget_Specs/) |
| **Research doc (Step 1 — legacy baseline)** | [`Step 1 - Dashboard Research/01 - Budget Compared to Actual.md`](../../Step%201%20-%20Dashboard%20Research/) |
| **Build file** | [`Step 3 - Mock_Work/Dashboard Widget Mockups.html`](../../Step%203%20-%20Mock_Work/Dashboard%20Widget%20Mockups.html) — Final Check tab |
| **Review status** | 🔵 In review |

**Status options:** `🔵 In review` → `🟡 Review complete, pending sign-off` → `✅ Signed off — locked`

---

## 1. Pre-Review Setup

Complete these items before starting any section below. If any item cannot be confirmed, stop and resolve it first.

- [ ] **Step 6 (Sign off document)** has been checked — any signed-off decisions for this widget are noted.
- [ ] **Step 4 (Final Design doc)** has been read in full to cover any detail not yet in Step 6.
- [ ] Where Step 4 and Step 6 conflict, Step 6 takes precedence — any such conflict is logged in the Findings Log (Section 9) before proceeding.
- [ ] The Widget Spec doc (`Step 3 / Widget_Specs`) has been read in full — especially the Fine-Tuning Notes and What Got Cut sections.
- [ ] The Research doc (`Step 1`) has been read to understand the legacy baseline.
- [ ] The live build has been opened in a **real browser** (not just read as source) and the console is clear of errors.
- [ ] The Final Check tab in `Dashboard Widget Mockups.html` is accessible and this widget's card is visible.
- [ ] `check-rules.py` has been run against the build file and the output has been reviewed:
  ```
  python3 "Step 3 - Mock_Work/check-rules.py" "Step 3 - Mock_Work/Dashboard Widget Mockups.html"
  ```
  Result: `[ ] PASS` / `[ ] HIGH-severity findings` (list below if any):
  > _[Paste check-rules.py output or "PASS" here]_
- [ ] All sizes offered by this widget are reachable from the Final Check page: `[ ] KPI` `[ ] Small` `[ ] Medium` `[ ] Large` `[ ] Expanded` *(strike out sizes this widget does not offer, with a note in Section 9 if a size is omitted — Rule 9)*

---

## 2. Standard Review — Design Rules (UX / Behaviour)

> **Source of truth for this section:** Step 6. Consult Step 4 where Step 6 is silent.

Drawn from `General Widget Design Rules.md` — Rules 1–11 and Universal Defaults.

### 2a. Chrome & Universal Defaults

| # | Check | Pass | Notes |
|---|---|---|---|
| U1 | **Refresh icon** is standalone (not in the 3-dot menu) and present at every size including KPI (Rule 7) | `[ ]` | |
| U2 | **Info Eye (👁)** is present at every size; its header = widget name; body = purpose text confirmed in Step 6 (or Step 4 if Step 6 is silent) (Rule 3) | `[ ]` | |
| U3 | **Download (Excel/CSV)** is present at Small/Medium/Large/Expanded and **removed at KPI** (Universal Default) | `[ ]` | |
| U4 | **Switch chart/view** is present at every size that offers more than one view, and **removed at KPI** (Rule 1, Universal Default) | `[ ]` | |
| U5 | Active view/chart option is **greyed out and non-clickable**; inactive options are clickable (Rule 4) | `[ ]` | |
| U6 | **Card footer text** (rationale/explanatory text at card bottom) is not visible in the live card (Rule 3) | `[ ]` | |

### 2b. Filter & State Rules

| # | Check | Pass | Notes |
|---|---|---|---|
| F1 | **Filter state is widget-scoped** — changing a filter here does not change any other widget on the dashboard (Rule 5) | `[ ]` | |
| F2 | **KPI-size filter** is time-only (Fiscal Year or widget-appropriate time dimension per Step 6 / Step 4) — no other filter types at KPI (Rule 1) | `[ ]` | |
| F3 | **Filter state is option-scoped** (for widgets built/rewritten from 2026-07-23 onward) — changing a filter on Option A does not change Option B or C (Rule 8) | `[ ]` / N/A (pre-2026-07-23 widget) | |
| F4 | Every filter's values and defaults match the **Step 6 sign-off** (or Step 4 Filters section if Step 6 is silent) exactly | `[ ]` | |
| F5 | Any filter marked "unconfirmed / pending backend" in any step doc is flagged in the Findings Log (Section 9), not silently accepted | `[ ]` | |

### 2c. Size & Layout Rules

| # | Check | Pass | Notes |
|---|---|---|---|
| S1 | Grid footprints match spec: Small 1×1, Medium 2×2, Large 4×4, KPI 1×0.5, Expanded full-screen (Rule 6) | `[ ]` | |
| S2 | **KPI, Medium, and Large** all have a real, reachable render for every design option (Rule 9) | `[ ]` | |
| S3 | If **Small is dropped** for any option, this is stated as a proposed omission awaiting confirmation — not decided silently (Rule 9) | `[ ]` / N/A (Small offered for all options) | |
| S4 | Medium/Large chart or table **fills the card** — no visible dead space (Rule T2, Whitespace Ladder Rule T8) | `[ ]` | |
| S5 | Whitespace escalation ladder was followed in order (header → filter bar → enlarge chart) before any scroll was considered (Rule T8) | `[ ]` | |
| S6 | Nothing **scrolls** except Expanded, table row-bodies, or a card explicitly approved for card-body scroll by name (Rule 2) | `[ ]` | |

### 2d. Data Table Sort

| # | Check | Pass | Notes |
|---|---|---|---|
| DT1 | Sort order matches the **Step 6 sign-off** (or Step 4 Data Table Sort section if Step 6 is silent) | `[ ]` | |
| DT2 | If a user sort toggle exists, it works correctly and state is widget-scoped | `[ ]` / N/A | |
| DT3 | Sort domain pattern followed: Finance → fixed alphabetical/chronological; Payroll/HR → fixed alphabetical with amount-descending toggle (unless the widget's own spec says otherwise) | `[ ]` | |

### 2e. Drill-Through

| # | Check | Pass | Notes |
|---|---|---|---|
| DR1 | Drill-through behaviour matches the **Step 6 sign-off** (or Step 4 Drill-Through section if Step 6 is silent) exactly | `[ ]` | |
| DR2 | If drill-through target page/URL is unconfirmed, this is logged in the Findings Log as an open item | `[ ]` / N/A | |

---

## 3. Design Every State & Edge Case

> **Principle:** Don't stop at the happy path. Every state listed below must be designed, implemented, and verified at **all sizes this widget offers** — including the smallest (KPI or Small). A state that works at Large but breaks at KPI is not complete.
>
> **Source of truth for state design decisions:** Step 6. Where Step 6 does not specify a state treatment, consult Step 4. Where neither document specifies it, the behaviour must be decided, documented in Step 6, and then verified here.

Work through each state category. Mark each sub-item as: `[ ] Designed` (a state treatment exists in Step 6 or Step 4) · `[ ] Verified` (confirmed working in the live build) · `[ ] N/A` (this state cannot occur for this widget — explain why in Notes).

---

### 3a. Loading State

The widget must show a loading/in-progress indicator while data is being fetched. This must render at every size.

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| L1 | **Skeleton / placeholder UI** is shown while data loads — not a blank white card or a spinner alone | `[ ]` | `[ ]` | |
| L2 | The loading state renders correctly at **KPI / Small** (smallest size) without overflow or broken layout | `[ ]` | `[ ]` | |
| L3 | The loading animation matches the project standard (3-bubble loading animation, 0–5s random delay on page load, per project convention) | `[ ]` | `[ ]` | |
| L4 | The skeleton placeholder approximates the shape of the loaded content (e.g. bars, rows, a KPI number block) — not a generic spinner that gives no content hint | `[ ]` | `[ ]` | |

---

### 3b. Empty State — No Data Available

This state occurs when the data source returns zero records for the **default filter configuration** (no user action has been taken). It is **different from No Results** (Section 3c), which results from a user filter action.

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| E1 | A **helpful, plain-language message** is shown explaining that no data is available (e.g. "No accounts found for this period") — not a blank card or a raw "0 results" label | `[ ]` | `[ ]` | |
| E2 | A **primary action** is offered where appropriate (e.g. "Add Account", "Set up a plan", "Contact your administrator") — only include if a real action exists and is confirmed in Step 6 or Step 4; do not add a placeholder button that does nothing | `[ ]` | `[ ]` | N/A if no action available |
| E3 | The empty state renders correctly at **KPI / Small** — message is readable, primary action (if present) is reachable, layout does not break | `[ ]` | `[ ]` | |
| E4 | The empty state is **visually distinct from the error state** — no red colour, no error icon | `[ ]` | `[ ]` | |
| E5 | Filters remain accessible in the empty state so the user can try a different configuration | `[ ]` | `[ ]` | |

---

### 3c. No Results State — Filter Produced Zero Matches

This state occurs when the user applies a filter combination that returns zero records, but data **does** exist for other configurations. It is distinct from Empty (Section 3b): the data exists; the user's selection excluded it.

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| NR1 | A **"No results found"** message (or equivalent) is shown — clearly distinguishable from the Empty state message | `[ ]` | `[ ]` | |
| NR2 | A **"Clear filters"** or **"Change filters"** action is offered and functional | `[ ]` | `[ ]` | |
| NR3 | The active filter chips/labels remain visible in the no-results state so the user can see why there are no results | `[ ]` | `[ ]` | |
| NR4 | The no-results state renders correctly at **KPI / Small** — message and action are both reachable without overflow | `[ ]` | `[ ]` | |
| NR5 | "Clear filters" resets to the **default filter state** (as confirmed in Step 6, or Step 4 Filters section if Step 6 is silent) — not to a blank/no-filter state | `[ ]` | `[ ]` | |

---

### 3d. Error State — Failed to Load

This state occurs when the data fetch fails (network error, API timeout, server error, permissions error).

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| ER1 | A **"Failed to load"** message (or equivalent) is shown — clearly distinct from Empty and No Results states | `[ ]` | `[ ]` | |
| ER2 | A **"Retry"** action is offered and functional — clicking it re-triggers the data fetch without a full page reload | `[ ]` | `[ ]` | |
| ER3 | The error message does **not** expose raw technical detail (stack traces, HTTP status codes, API endpoint URLs) to the end user | `[ ]` | `[ ]` | |
| ER4 | The error state renders correctly at **KPI / Small** — message and retry action are both visible without overflow | `[ ]` | `[ ]` | |
| ER5 | After a successful retry, the widget returns to its normal loaded state (not stuck in an error state) | `[ ]` | `[ ]` | |

---

### 3e. Permissions State — Hidden or Restricted Data

This state occurs when the current user does not have access to some or all of the widget's data (e.g. a payroll widget for a user without payroll permissions, or a multi-department widget for a user with only one department's access).

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| P1 | The widget handles **fully restricted access** — shows a clear "You don't have access" message, not a broken or empty card | `[ ]` | `[ ]` | N/A if this widget has no permission gating |
| P2 | The widget handles **partially restricted access** — restricted items are hidden cleanly, totals reflect only what the user can see | `[ ]` | `[ ]` | N/A if partial access is not applicable |
| P3 | The **Department filter** (or equivalent scope-limiting filter) is hidden or disabled when the user has access to only one scope — not shown unconditionally (see W09 precedent) | `[ ]` | `[ ]` | N/A if no role-scoped filter |
| P4 | The permissions state renders correctly at **KPI / Small** — restricted-access message is readable; the widget does not silently show $0 / 0 records as if real data were present | `[ ]` | `[ ]` | |

---

### 3f. Stale Data State

This state occurs when the data displayed may be older than expected — for example, a refresh has not run, or the data was last updated outside the current period.

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| SD1 | A **"Last updated"** timestamp is accessible (via the Info Eye, a footer note, or an inline label) so the user can judge data freshness | `[ ]` | `[ ]` | |
| SD2 | If data is older than a defined threshold (confirm threshold from Step 6, or Step 4 / backend spec if Step 6 is silent), a **visual stale-data indicator** is shown | `[ ]` | `[ ]` | N/A if no stale threshold is defined |
| SD3 | The **Refresh icon** (always present per Rule 7) is clearly available — the user has a self-service path to request fresh data | `[ ]` | `[ ]` | |
| SD4 | The stale-data indicator is **distinct from the error state** — it communicates "old data", not "broken widget" | `[ ]` | `[ ]` | |

---

### 3g. Cross-Control Conflicts

This state occurs when two or more user interactions produce a logically inconsistent or technically invalid combined state.

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| CC1 | **Company / organisation change** — if the user switches company/entity context, filters referencing the previous company's data are reset or invalidated gracefully, not left showing stale selections | `[ ]` | `[ ]` | N/A if no company-switcher context |
| CC2 | **Sort + Filter combination** — applying a sort and then a filter (or vice versa) produces a consistent, correct result; the sort is applied to the filtered dataset, not the unfiltered one | `[ ]` | `[ ]` | |
| CC3 | **Cascading / dependent filters** — when a parent filter changes, dependent child filters are either reset to their default, disabled (with a visual indicator), or kept if their current value is still valid. The resolution strategy matches Step 6 (or Step 4 if Step 6 is silent). | `[ ]` | `[ ]` | |
| CC4 | **Switch view while filtered** — switching between chart and table view (or between design options) preserves the active filter state and applies it correctly to the new view | `[ ]` | `[ ]` | |
| CC5 | **Size change while filtered** — resizing the widget preserves the active filter state and re-renders correctly at the new size | `[ ]` | `[ ]` | |
| CC6 | The chosen conflict-resolution strategy for each case above (reset / disable / keep) is **documented in Step 6** — not decided implicitly in code | `[ ]` | `[ ]` | |

---

### 3h. Data Scale

This state covers both extremes: too little data and too much data.

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| DS1 | **Too few items** (1 or 2 rows/bars/segments) — the widget renders sensibly; a single-bar chart does not look broken; a single-row table does not have excessive whitespace | `[ ]` | `[ ]` | |
| DS2 | **Too many items** — the widget applies the per-size cap correctly (confirm cap values from Step 6, or Step 4 Size behaviour table if Step 6 is silent) | `[ ]` | `[ ]` | |
| DS3 | When capped, an **"Others" rollup** or **"+N More"** label is shown so the user knows the list is truncated — not silently cut | `[ ]` | `[ ]` | |
| DS4 | The **Expanded view shows all items** (no cap) so the user has a path to the full dataset | `[ ]` | `[ ]` | |
| DS5 | The **KPI / Small** size handles both extremes (1 item and maximum items) without layout breakage | `[ ]` | `[ ]` | |
| DS6 | Totals and aggregates are computed from the **full untruncated dataset**, not from the capped visible set — a "Top 6 of 24" display must not show a total that covers only the top 6 | `[ ]` | `[ ]` | |

---

### 3i. Extreme Content

This state covers text, number, and value edge cases that can silently break a polished layout.

| # | Check | Designed | Verified | Notes |
|---|---|---|---|---|
| XC1 | **Long names truncate** cleanly with an ellipsis (`…`) — no label overflows its bounding box or obscures a neighbouring element | `[ ]` | `[ ]` | |
| XC2 | The **full value of a truncated label** is accessible — via a tooltip on hover, or visible in the Expanded view | `[ ]` | `[ ]` | |
| XC3 | **Numbers stay aligned** — currency amounts, percentages, and counts are right-aligned in tables and do not wrap mid-value | `[ ]` | `[ ]` | |
| XC4 | **Very large numbers** (e.g. $1,234,567,890) are formatted with appropriate abbreviation (e.g. $1.2B) at small sizes where the full value would overflow | `[ ]` | `[ ]` | |
| XC5 | **Zero values** render correctly — $0, 0%, or 0 items shows as a valid zero, not a missing bar, a broken chart, or a blank cell | `[ ]` | `[ ]` | |
| XC6 | **Negative values** render correctly — negative currency or variance values show a minus sign or a distinct colour (confirm treatment from Step 6, or Step 4 if Step 6 is silent), not as a bar in the wrong direction or a garbled number | `[ ]` | `[ ]` | |
| XC7 | Every extreme content case above also works at **KPI / Small** — the smallest sizes are the most constrained and the most likely to break first | `[ ]` | `[ ]` | |

---

### 3j. State Coverage Summary

Before proceeding to Section 4, confirm that every state above has been evaluated for every size this widget offers.

| State | KPI | Small | Medium | Large | Expanded |
|---|---|---|---|---|---|
| Loading | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Empty | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| No Results | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Error | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Permissions | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Stale Data | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Cross-Control Conflicts | N/A | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Data Scale (few / many) | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |
| Extreme Content | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` |

> **Note:** Mark a cell N/A only if that size is not offered by this widget (with justification in Section 5) or if the state genuinely cannot occur at that size (explain in the Notes column of the relevant sub-section above).

---

## 4. Standard Review — Technical Build Rules

> **Source of truth for intended behaviour:** Step 6. Consult Step 4 where Step 6 is silent.

Drawn from `General Widget Design Rules.md` — Rules T1–T11.

| # | Rule | Check | Notes |
|---|---|---|---|
| T1 | No SVG uses `preserveAspectRatio="none"` against a fluid-width container; bar charts use plain flex/CSS divs | `[ ]` | |
| T2 | Chart/table content at Medium/Large uses `flex:1` inside a flex-column card — not fixed-centered inside a bigger container | `[ ]` | |
| T3 | Expanded and KPI render paths are unchanged from before this review (unless explicitly changed this round) | `[ ]` | |
| T4 | Every CSS override is scoped tightly to exactly one size + widget + option — no unscoped shared-class edits | `[ ]` | |
| T5 | Every bar/point label matches the scale/axis metric it represents — no label/axis mismatch | `[ ]` | |
| T6 | Gridlines ≥ `rgba(0,0,0,.25)` and axis text ≥ `#666` on white — no invisible/near-invisible scale elements | `[ ]` | |
| T7 | File integrity confirmed via the Read tool for any file edited this round (not only bash/grep) | `[ ]` | |
| T8 | Whitespace escalation ladder followed in correct order on both the way in and the way out | `[ ]` | |
| T9 | Every gridline spans the full chart once, continuously behind all bars — no per-bar decoration | `[ ]` | |
| T10 | Charts use Recharts via `chartCanvas()`/`h()`; any new `innerHTML=WRENDER[...]` call routes through `setVizHtml()` | `[ ]` | |
| T11 | Any custom hover-info bubble uses `showHoverTip()`/`hideHoverTip()` appended to `document.body` — not a nested `position:absolute` + CSS `:hover` inside `.opt-v` | `[ ]` | |

---

## 5. Standard Review — Views & Sizes (Per-View Checklist)

> **Source of truth for views and sizes:** Step 6. Consult Step 4 Size behaviour table where Step 6 is silent.

Complete one row per view/option. Add or remove rows to match this widget's actual offering.

### Option A — [Option A Name]

| Size | Rendered | Fills card | Correct view | Filters work | Notes |
|---|---|---|---|---|---|
| KPI | `[ ]` | N/A | `[ ]` | `[ ]` (time only) | |
| Small | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Medium | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Large | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Expanded | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |

### Option B — [Option B Name]

| Size | Rendered | Fills card | Correct view | Filters work | Notes |
|---|---|---|---|---|---|
| KPI | `[ ]` | N/A | `[ ]` | `[ ]` (time only) | |
| Small | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Medium | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Large | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Expanded | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |

### Option C — [Option C Name]

| Size | Rendered | Fills card | Correct view | Filters work | Notes |
|---|---|---|---|---|---|
| KPI | `[ ]` | N/A | `[ ]` | `[ ]` (time only) | |
| Small | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Medium | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Large | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |
| Expanded | `[ ]` | `[ ]` | `[ ]` | `[ ]` | |

---

## 6. Standard Review — Documentation Completeness

> **Primary source:** Step 6 (Sign off document) — **this is the final source of truth**. The items below must match the live build. Where Step 6 does not yet cover a section, note it as "from Step 4 — not yet in Step 6" and flag it as a gap to the sign-off owner.

| Section | Source | Verified accurate | Notes |
|---|---|---|---|
| **Widget overview / purpose** | Step 6 | `[ ]` | |
| **Filters** (all filters, values, defaults, unconfirmed items) | Step 6 | `[ ]` | |
| **Data Table Sort** | Step 6 | `[ ]` | |
| **Drill-Through** decision | Step 6 | `[ ]` | |
| **Refresh** icon placement | Step 6 | `[ ]` | |
| **Views (Switch View)** — every view described and confirmed | Step 6 | `[ ]` | |
| **Size behaviour** (KPI / Small / Medium / Large / Expanded) | Step 6 | `[ ]` | |
| **State treatments** (empty, error, no results, permissions, stale) | Step 6 | `[ ]` | |
| **What was cut and why** — nothing live contradicts this | Step 6 | `[ ]` | |
| **Final sign-off decisions** — dated, attributed | Step 6 | `[ ]` | |
| Step 4 — Purpose paragraph still accurate (check for drift) | Step 4 | `[ ]` | Consult Step 4 only; if Step 6 conflicts, Step 6 wins |
| Step 4 — Fine-Tuning Notes most recent entry matches current state | Step 4 | `[ ]` | Consult Step 4 only; if Step 6 conflicts, Step 6 wins |
| Step 4 — Header block links and Status line are up to date | Step 4 | `[ ]` | Consult Step 4 only; if Step 6 conflicts, Step 6 wins |
| Widget_Specs (`Step 3`) status column is up to date | Step 3 | `[ ]` | |
| `Step 4 - Widget Final Design/00 - INDEX.md` status row is up to date | Step 4 | `[ ]` | |

> **Step 6 gaps:** Any row above where Step 6 is silent must be noted in the Notes column as *"from Step 4 — not yet in Step 6"* and escalated to the sign-off owner. Do not close Gate 3 while Step 6 gaps remain unresolved.

---

## 7. Approval Stages

Three gates. A widget cannot advance past a gate until all items at that gate are resolved or formally deferred with documented reasoning.

### Gate 1 — Design Review

**Criterion:** All items in Sections 2, 3, and 5 are checked or explicitly deferred with a finding logged in Section 9.

| Approver | Date | Outcome |
|---|---|---|
| [Name] | [YYYY-MM-DD] | `[ ] Approved` / `[ ] Blocked — see findings` |

**Blocking findings at Gate 1** (reference finding IDs from Section 9):
> _[List any F-001, F-002 etc. that block Gate 1 here, or write "None"]_

---

### Gate 2 — Technical Review

**Criterion:** All items in Section 4 are checked or explicitly deferred. `check-rules.py` exits 0 (no HIGH-severity findings).

| Approver | Date | Outcome |
|---|---|---|
| [Name] | [YYYY-MM-DD] | `[ ] Approved` / `[ ] Blocked — see findings` |

**Blocking findings at Gate 2** (reference finding IDs from Section 9):
> _[List any F-001, F-002 etc. that block Gate 2 here, or write "None"]_

---

### Gate 3 — Documentation & Sign-Off

**Criterion:** All items in Section 6 are checked. Step 6 is the confirmed source of truth — all Step 6 gaps have been escalated and resolved. No open HIGH findings remain unresolved.

| Approver | Date | Outcome |
|---|---|---|
| [Name] | [YYYY-MM-DD] | `[ ] Approved` / `[ ] Blocked — see findings` |

**Blocking findings at Gate 3** (reference finding IDs from Section 9):
> _[List any F-001, F-002 etc. that block Gate 3 here, or write "None"]_

---

## 8. Runtime & Audit Edge Cases

> **Purpose:** This section documents how to handle scenarios that fall outside the standard review path — things that are found during an audit pass rather than designed in advance. Each category includes a detection signal and the required response. Log any triggered edge case in Section 9 using the Finding template.

---

### 8a. Empty & Zero-Data States (Runtime)

**Detection:** Filter the widget to a combination that returns no data (e.g. a date range with no transactions, an account type with no balances). Observe all sizes.

| Signal | Severity | Action |
|---|---|---|
| Widget renders an empty card with no message | 🟡 MEDIUM | Log finding — empty state message or visual treatment required (see Section 3b) |
| Widget shows `NaN`, `undefined`, `null`, or a JS console error | 🔴 HIGH | Log finding — data guard missing; do not publish |
| KPI tile collapses or breaks layout at $0 | 🔴 HIGH | Log finding |
| Widget renders cleanly with a zero/empty state indicator | ✅ Pass | Note the evidence |

---

### 8b. Boundary & Cap Conditions (Runtime)

**Detection:** Check with mock data that includes more items than the per-size cap allows at each size. Confirm cap values from Step 6 or Step 4.

| Signal | Severity | Action |
|---|---|---|
| Cap applied but no overflow indicator shown | 🔵 LOW | Log finding — consider adding "+N More" or "Others" label |
| Cap inconsistent between chart and table views | 🟡 MEDIUM | Log finding — caps must align |
| Cap not applied at all (all items shown regardless of size) | 🔴 HIGH | Log finding — violates Rule 2 (no card scroll) |
| Totals computed from capped set rather than full dataset | 🔴 HIGH | Log finding — totals must cover the full untruncated data |
| Expanded correctly shows all items (no cap) | ✅ Pass | — |

---

### 8c. Long Labels & Text Overflow (Runtime)

**Detection:** Inspect the longest label in the mock data at Small and KPI sizes. Also check Medium bars/rows with labels longer than ~20 characters.

| Signal | Severity | Action |
|---|---|---|
| Label overflows and obscures another element | 🔴 HIGH | Log finding |
| Label truncates with ellipsis; full value accessible (tooltip or Expanded) | ✅ Pass | — |
| Label truncates but full value is inaccessible | 🟡 MEDIUM | Log finding — add tooltip or note in Fine-Tuning |
| KPI tile label wraps to two lines and breaks layout | 🔴 HIGH | Log finding |

---

### 8d. Filter Interaction Anomalies (Runtime)

**Detection:** Step through every filter in sequence. For each: (1) verify default renders correctly; (2) verify changing it updates the visual; (3) verify resetting returns to default.

| Signal | Severity | Action |
|---|---|---|
| Filter change on Option A silently changes Option B or C (post-2026-07-23 widget) | 🔴 HIGH | Log finding — Rule 8 violation |
| Resetting a parent filter leaves a dependent filter in an invalid selection | 🟡 MEDIUM | Log finding |
| A filter combination produces a recoverable empty state | 🔵 LOW | Log finding — empty state treatment required (Section 3c) |
| A filter combination produces a JS error or broken render | 🔴 HIGH | Log finding |

---

### 8e. Size Transition & Resize Behaviour (Runtime)

**Detection:** On the Final Check page, use the Widget Size menu to cycle through every size. After each resize, confirm the 3-dot menu contents are correct.

| Signal | Severity | Action |
|---|---|---|
| Switch chart/view section missing from menu after a resize | 🔴 HIGH | Log finding — known bug pattern (see W07 history); fix via generic resize trim logic |
| Expanding from KPI-size opens the wrong widget's Expanded view | 🔴 HIGH | Log finding |
| Resizing clears all filter state without warning | 🟡 MEDIUM | Log finding |
| Every size transition renders correctly and correct menu items are shown | ✅ Pass | — |

---

### 8f. Unconfirmed Fields & Speculative Data (Runtime)

**Detection:** Cross-reference every field rendered in the live card against the Developer Punch List and the confirmed API spec.

| Signal | Severity | Action |
|---|---|---|
| Speculative/unconfirmed field is visible as a live UI element in the mockup card | 🔴 HIGH | Log finding — Rule 11 violation; field must be removed from mockup or formally confirmed |
| Speculative field documented in Widget_Specs as "proposed, needs confirmation" only | ✅ Pass | No action in mockup — track through to development |
| Client-side computation that should be pre-computed by the API | 🟡 MEDIUM | Log finding — flag to developer; add to API Spec document |

---

### 8g. Hover & Tooltip Behaviour (Runtime)

**Detection:** Hover over interactive elements near card edges at Small and KPI sizes.

| Signal | Severity | Action |
|---|---|---|
| Hover bubble clipped by `overflow:hidden` on `.opt-v` | 🔴 HIGH | Log finding — T11 violation; refactor to `showHoverTip()`/`hideHoverTip()` on `document.body` |
| Hover bubble renders fully visible at all sizes including Small | ✅ Pass | — |
| No custom hover bubbles used in this widget | ✅ N/A | Mark T11 as N/A in Section 4 |

---

### 8h. Known Deferred Items (Carry-Forward Open Items)

> Some widgets have open items explicitly deferred — pending a product decision, a backend confirmation, or a future phase. These are not defects; they are known exceptions. List them here so they are visible and not treated as new findings.

| Item | Source (doc + section) | Status | Owner |
|---|---|---|---|
| [Description of deferred item] | [Step 6 / Step 4 / Widget_Specs, section name] | Deferred — [reason] | [Name or "Product"] |
| | | | |

*If a deferred item from a previous review session has since been resolved, move it to Section 9 as a CLOSED finding — do not delete it.*

---

## 9. Findings Log

Record every issue found during this review. Never delete a finding — mark it CLOSED instead.

### Severity Scale

| Severity | Meaning | Gate impact |
|---|---|---|
| 🔴 HIGH | Design, data, or rule violation that makes the widget incorrect, misleading, or broken at any size | Blocks all three gates until resolved or formally deferred with documented reasoning |
| 🟡 MEDIUM | Incomplete implementation, UX gap, or spec mismatch that does not break the widget but reduces accuracy or usability | Blocks Gate 3 unless formally deferred |
| 🔵 LOW | Polish issue, minor inconsistency, or enhancement opportunity | Does not block any gate; address before the next major review pass |
| ⚪ DEFERRED | A known open item carried from the spec/design, not introduced by this review | Not a blocker; tracked here for visibility only |
| ✅ CLOSED | Resolved — how and when is recorded in the notes | Removed from gate blocking |

---

### Finding Template

```
### F-NNN — [Short title]
**Severity:** 🔴 HIGH / 🟡 MEDIUM / 🔵 LOW / ⚪ DEFERRED
**Section:** [Section number where detected, e.g. 2b / 3d / 8e]
**Rule:** [Rule number if applicable, e.g. Rule 8 / Rule T11 / N/A]
**Source conflict:** [Step 6 vs build / Step 4 vs build / Step 6 vs Step 4 / None]
**Description:** [What the problem is — specific, observable, reproducible]
**Affected sizes:** [All / KPI / Small / Medium / Large / Expanded]
**Affected options:** [All / A / B / C]
**Evidence:** [What was observed — console output, screenshot reference, specific filter used]
**Required action:** [What must change — specific enough that a developer can act without asking a follow-up]
**Resolved:** [YYYY-MM-DD] / Not yet resolved
**Resolution notes:** [How it was fixed, or why it was formally deferred]
```

---

*Add findings below this line. Assign IDs sequentially: F-001, F-002, F-003 …*

### F-001 — [Short title]
**Severity:** [severity]
**Section:** [section]
**Rule:** [rule or N/A]
**Source conflict:** [conflict or None]
**Description:** [description]
**Affected sizes:** [sizes]
**Affected options:** [options]
**Evidence:** [evidence]
**Required action:** [action]
**Resolved:** Not yet resolved
**Resolution notes:** —

---

## 10. Final Sign-Off

All three gates (Section 7) must be approved before completing this section.

> **Reminder — Source of Truth:**
> - **Step 6 (Sign off document)** is the final source of truth. The sign-off recorded here must agree with Step 6.
> - **Step 4 (Widget Final Design)** may be consulted for reference where Step 6 is silent, but Step 4 alone is not sufficient for final sign-off.

### Definition of "Done" — Final Confirmation

Run this list immediately before marking the widget ✅ Done. Every item must be checked.

- [ ] All sizes offered by this widget were rendered and visually inspected — not just the size that was the review focus.
- [ ] `check-rules.py` exits 0 (no HIGH-severity automated findings).
- [ ] Expanded and KPI output compared against the pre-review baseline — identical unless an explicit change was made this session.
- [ ] Medium/Large chart or table fills the card — no visible dead space (Rule T2).
- [ ] No SVG uses `preserveAspectRatio="none"` against a fluid-width container (Rule T1).
- [ ] Every plotted value's label matches the scale/axis it is drawn against (Rule T5).
- [ ] Gridlines/axis text pass the contrast threshold (Rule T6).
- [ ] Every new/changed CSS selector is scoped to exactly the size + widget + option it is meant for (Rule T4).
- [ ] Nothing scrolls except Expanded, table row-bodies, or a card explicitly approved for card-body scroll by name (Rule 2).
- [ ] Filter/size/view state changes stay scoped to one widget instance (Rule 5).
- [ ] File integrity confirmed via the Read tool for any file edited this session (Rule T7).
- [ ] Whitespace escalation ladder followed in order, not skipped, on the way in and in reverse on the way out (Rule T8).
- [ ] Every gridline spans the full chart once, continuously behind all bars (Rule T9).
- [ ] New chart work uses Recharts via `chartCanvas()`/`h()`; any new `innerHTML=WRENDER[...]` call routes through `setVizHtml()` (Rule T10).
- [ ] Any new custom hover-info bubble uses `showHoverTip()`/`hideHoverTip()`, not a nested `position:absolute` + CSS `:hover` inside `.opt-v` (Rule T11).
- [ ] The file was opened in a real browser and the console is clear — a static read-through is not sufficient.
- [ ] *(For widgets built/rewritten from 2026-07-23 onward)* Each option's filter state is scoped per-option, not shared across Options A/B/C (Rule 8).
- [ ] *(For widgets built/rewritten from 2026-07-23 onward)* KPI, Medium, and Large all render something real for every option; any dropped Small is stated as a proposed, unconfirmed omission (Rule 9).
- [ ] Any proposed data breakdown using an unconfirmed field is flagged only in the Widget_Specs entry — never as a visible element in the live mockup (Rule 11).
- [ ] All nine state categories (Section 3) are verified at every size this widget offers.
- [ ] All findings in Section 9 are either CLOSED or formally DEFERRED with documented reasoning.
- [ ] **Step 6 (Sign off document)** has been updated to reflect current state — no gaps remain unresolved.
- [ ] Step 4 (Final Design doc) has been reviewed for drift against the live build and Step 6 — any stale sections are corrected or noted.
- [ ] The widget's row in `Step 4 - Widget Final Design/00 - INDEX.md` is updated to reflect the correct status.
- [ ] The widget's row in `Step 3 - Mock_Work/Widget_Specs/00 - Index.md` is updated to reflect the correct status.

### Sign-Off Declaration

| Field | Value |
|---|---|
| **Widget** | W01 — Budget Compared to Actual |
| **Final status** | ✅ Done — signed off |
| **Signed off by** | [Name] |
| **Date** | [YYYY-MM-DD] |
| **Step 6 entry confirmed** | Yes / No — [note if absent] |
| **Step 4 reviewed for drift** | Yes / Partially — [note any gaps] |
| **Outstanding deferred items** | [None / List finding IDs] |
| **Notes** | [Any final comments, caveats, or follow-up actions for the next session] |