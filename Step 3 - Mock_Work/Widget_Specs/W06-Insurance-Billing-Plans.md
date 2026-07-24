# W06 — Insurance Billing Plans

**Module:** HR  
**Status:** 🔵 Improvement needed  
**Research doc:** [06 - Insurance Billing Plans.md](../../Step 1 - Dashboard Research/06 - Insurance Billing Plans.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows how many people are enrolled in each insurance plan, with the option to filter by insurance type. Gives staff a quick overview of insurance plan uptake across the organisation.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** benefits dashboards typically use bar charts to compare plan enrollment across categories, with donut for proportional split, drawn from ADP/Gusto-style benefits platforms ([Milliman](https://www.milliman.com/en/insight/how-enrollment-insights-can-drive-eb-plan-design), [Gusto](https://support.gusto.com/article/112462198100000/Gusto-benefits-dashboard)).

**Fit-check:** Option A (Horizontal Bar) and Option B (Donut) both match standard practice directly — this is a single-dimension dataset (enrollment count per plan), so unlike W02, no option is missing a dimension. Option C (Summary Table) is the standard reporting companion. All three are reasonably interchangeable as default vs. alternate view — the deciding factor for Phase 2 is likely how many plans a typical org has (donut degrades past roughly 5–6 slices, the same principle noted for W03).

---

## Filter Options
| Filter | Values |
|--------|--------|
| Plan Type | All Plans · *(dynamic list — plan/type names are entered elsewhere in the system and vary per organisation; the specific values shown in both the old and new designs are illustrative mock data, not a fixed hardcoded list)* |

**Status filter — dropped for now.** The real data currently only supports Plan and Enrolled count; there's no active/inactive field today. **Open question for product/backend:** could Employer Contribution ($), Monthly Amount ($), and Status be added as future columns/filters? Not in scope for this build, but worth raising.

**KPI size (3-dot menu):** No time-based filter exists for this widget — KPI size shows Plan Type only (or no filter at all, if Plan Type is judged too heavy for KPI chrome — flag for review), plus Widget size + Fullscreen.

## Data Table Sort
Fixed — alphabetical by Plan name, with a user-facing toggle to switch to Enrolled-count descending. This follows the Payroll/HR domain default established for W03 (fixed alphabetical + amount-toggle, not fully open column sort).

## Drill-Through
No drill-through — matches the old design (confirmed no drill-down exists today) and avoids surfacing individual employee/dependent names at the dashboard level.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A — Horizontal Bar by Plan *(Keep/Refresh)*

**Chart:** Horizontal bar per plan type showing enrolment count  
**Views available:** Bar (default) · Pie · Table  
**Improvement note:** Clear for comparing enrolment across plans.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Top 3 plans |
| **Medium (2×2)** | Top 5 plans |
| **Large (4×4)** | All plans + total enrolment count + table toggle (sort per Data Table Sort above) |
| **KPI (1×0.5)** | Headline: **plan with the highest enrollment** (e.g. "PPO Plus: 214 enrolled"). No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option B — Donut by Plan *(Improve)*

**Chart:** Donut showing proportional enrolment split across plans  
**Views available:** Donut (default) · Table  
**Improvement note:** Good for showing which plan is most popular at a glance.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Donut only |
| **Medium (2×2)** | Donut + legend |
| **Large (4×4)** | Donut + legend + enrolment numbers + table toggle (sort per Data Table Sort above) |
| **KPI (1×0.5)** | Headline: **dominant plan + its % of total enrollment** (e.g. "PPO Plus: 38%"). No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option C — Summary Table *(Improve)*

**Chart:** Table — Plan · Enrolled · % of Total *(Active/Inactive columns removed — not backed by real data today; see Status filter note above)*  
**Views available:** Table (default) · Bar  
**Improvement note:** Best for HR reporting and headcount reconciliation.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 rows (sort per Data Table Sort above), rows scroll internally, header fixed |
| **Medium (2×2)** | 5 rows, same sort/scroll pattern |
| **Large (4×4)** | Full table + totals row, same sort/scroll pattern |
| **KPI (1×0.5)** | Headline: **Total Enrollment** (count, across all plans). No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Fine-Tuning Notes
- ~~Status filter (Active/Inactive) should work across all three options~~ — dropped; see Status filter note above.
- If a specific plan named "COBRA" exists in an organisation's data, it should be visually distinct (e.g. amber colour) — kept as guidance since plan names are org-defined, not a fixed rule about a specific plan.

---

## 2026-07-23 — Create Mock Designs run: Options A/B/C replaced

**Flagging plainly, first:** `PROJECT INDEX.md`'s Widget pipeline table and `Step 3 - Mock_Work/00 - INDEX.md`'s tracker-status table both showed this widget's Step 3 Mock_Work column as **⚪ Not started** going into this run — that's the status this run was told to treat as "proceed without asking," per the standing rule that the tracker column is hand-synced, not re-audited, against the live file. But `Dashboard Widget Mockups.html`'s DESIGN OPTIONS section for widget 6 was **not actually empty** — it already held 3 real, populated cards (**A = "Plan Table" / Keep-Refresh**, **B = "Bar by Enrolment" / Improve**, **C = "Plan Cards" / Improve**), matching neither this file's own Options A/B/C above (Horizontal Bar / Donut / Summary Table) nor a blank slate. This is a known, accepted staleness risk in this project (the tracker column can lag the real file), not something this run stopped to ask about — but it's worth recording here plainly rather than letting the mismatch sit undocumented: **the Widget_Specs Options A/B/C above, the live HTML's pre-existing A/B/C, and the 3 new designs below are now three different sets that don't line up 1:1.** All 3 of the live HTML's pre-existing cards were replaced in full by this run.

Per Market Research (`Step 2 - Feedback/Market Research/W06 - Insurance Billing Plans.md`) and the Developer Punch List, this remains the lowest-risk widget in the project — Plan Type filter, all chart/table views, and the KPI Total Enrollment figure are **all already available** with no data gap. No Ben Lane interview content exists specifically for this widget (confirmed by checking `Step 2 - Feedback/Ben Lane Interview - Tagged Q&A by Widget (2026-07-13).md` directly this run, not assumed from the index) — its only mention of Insurance Billing is a usage-rarity aside ("Pension and Insurance Billing Widgets... specifically for Methodist conferences... used by about 5% of clients"), about adoption, not design. So Design 1's tweak below is purpose-driven rather than interview-driven, as expected for this widget.

### Option A (new) — Table + Pie by Plan *(Keep/Refresh — Restyled Original)*
Restyles the Step 1 legacy shape as literally as the current grid allows: at Large, the table and pie render **side by side simultaneously**, matching the legacy doc's "Left: table; Right: pie chart" description exactly, instead of treating them as switchable alternates. Small/Medium show the pie first (closer to the legacy's "quick overview" framing), with the table available via Switch Chart Type.

**The one grounded tweak:** the table now sorts alphabetically by Plan name. Step 1's confirmed legacy query is `IB_Plan ... ORDER BY Name` — but the live mock data array (`MOCK_DATA.series[6]['All Plans'].plans`) was never actually in that order (PPO Plus, HSA Basic, HMO Core, COBRA, Dental, Vision). This wasn't a stylistic choice; it corrects the render to match the already-documented legacy behaviour.

Columns are Plan / Enrolled / % of Total only — Employer Contribution ($), Monthly Amount ($), and Status are deliberately left out, since this file's own Filter Options section above already flags all three as explicitly out of scope. (Noted in passing: the *prior* live-HTML Option A/C actually did render a "Monthly" cost column and an "Employer %" column sourced from `p.cost`/`p.p` in the mock data — which contradicts that out-of-scope note. This run's replacement doesn't carry that forward; not fixing it elsewhere, just not repeating it.)

### Option B (new) — Donut by Plan *(Improve — Competitor Match)*
Market Research's Visual Options for this widget leave only one genuinely actionable choice this pass: "No change — Bar/Donut/Table peer views remain the best-supported, lowest-risk choice" (Milliman + Gusto, 2 independent sources, confirmed pattern). The enrollment-trend-over-time idea (Option 2) is flagged not-actionable — no historical snapshot table exists, enrollment is a live COUNT at query time. With only one real candidate, the "tie-break toward current" rule for this slot resolves itself: the closest-fitting competitor pattern already **is** close to current.

Rebuilt as a **true donut** (`donutChart()` — conic-gradient with a centre hole) rather than a relabelled pie — the prior live-HTML Option B used the same solid-circle `pieChart()` helper as Option A, so the two looked visually identical despite being named differently. This version actually delivers the Gusto-cited "donut for proportional split" framing. Table remains the alternate view. KPI headline is the dominant plan + its % of total (e.g. "Dental: 32%"), matching this option's own proportional framing rather than a flat total.

### Option C (new) — Enrollment Spotlight *(Redesign — Maximum Freedom)*
No tie-break toward "current" applies here, per instruction. Reframes the widget's purpose — "give staff a quick overview of insurance plan uptake" — around **which plan wins**, not a neutral list: a Spotlight callout (icon + top plan name + its enrolled count) leads every size, backed by **one continuous segmented proportion bar** (every plan's share of total enrollment as adjoining segments in a single bar, not separate bars and not a pie/donut slice set). This is a genuinely different visual grammar from both A (table+pie) and B (donut) — not a relabelling of either. Table remains available as an alternate view. KPI headline is the top plan + its raw enrolled count (e.g. "Dental: 201 enrolled") — a highlight, not a total or a percentage, consistent with the "spotlight" framing. Purpose-driven; no direct competitor citation (Market Research's only new-this-pass idea, the trend-over-time view, isn't buildable today per the Punch List, so it isn't the basis for this option).

### Where this was written
`Dashboard Widget Mockups.html` — `MOCK_DATA.options[6]` (title/sub/description/source link) and the static Option A/B/C card markup (title, subtitle, Switch Chart Type labels) both updated; `WRENDER[6]`'s three `if(opt===...)` branches rewritten in full (shared preamble — `sz`, `view`, `key`, `d`, `plans`, `totalEnrolled`, `palette`, `topPlan` — kept, since all three branches were being replaced together). `mock-data.master.js` re-synced to match `MOCK_DATA.options[6]` exactly; `MOCK_DATA.series[6]`'s actual data values were not changed (no new field was needed — everything used here, `n` and `e` per plan, already existed). The Final Check tab's own markup (`#fc-widget-6`) was **not edited** — see the flag below.

### Final Check tab — flagging its "locked" badge
`#fc-widget-6` (the Final Check tab's widget-6 section) **already shows a "Final design — locked" badge** in its header, and its three cards (KPI/Small/Medium/Large) are all hardcoded to Option A (`togglePurpose(6,'A',...)`, `openExpand(6,'A')` throughout). Because Final Check renders through this same `WRENDER[6]` function and the same `MOCK_DATA`, editing Option A's branch changes what Final Check now visually shows for this "locked" widget too — even though its own markup (labels, the "Horizontal Bar by Plan" / "Summary Table" Switch Chart Type button text, the Logic section's prose) was left completely untouched, per instruction. That markup now describes a render that no longer matches what Option A actually produces (Table+Pie by Plan, not "Horizontal Bar by Plan"). This is a real, flagged mismatch — this run did not attempt to reconcile it, since fixing/re-auditing the Final Check tab's own text is outside what `Create Mock Designs` touches; it's left here as an explicit note for whoever picks this widget up next, and is the kind of thing `widget-final-check-audit` exists to catch.

---

## 2026-07-23 — Fix Mock Designs run: Findings 1 & 3 resolved (Option C, Small)

**What was wrong (Verify Findings 1 & 3, same root cause):** In `WRENDER[6]`, Option C's Small branch — `if(sz==='s'){ return ftags(wid)+spotlightC; }` — returned before the `if(view==='table')` check that every other size/option in this widget reaches. The card's own "Switch Chart Type" menu (Segmented Bar / Table) is present unconditionally in the static markup at every size, so a user at Small who selected "Table" saw no change — the card kept showing only the Spotlight callout regardless of `view`. This also left Option C's Small card visibly emptier than Option A's (pie + legend) and Option B's (donut + legend) Small cards, since Small never rendered the segmented bar (`segC`) that Medium/Large/Expanded already use.

**What changed:** Moved the `segC`/`legC` variable declarations above the size check and removed the early `sz==='s'` return, so Small now reaches the same `if(view==='table')` check as every other size before rendering anything. Small now behaves exactly like Medium:
- `view==='table'` → `spotlightC` + a compact `tbl(hdrsC,rowsC)` (the same table helper Option A/B already use at Small — Small never uses `tblScroll`, only Large/Expanded do).
- default view → `spotlightC` + `segC` (the segmented proportion bar), with `legC` omitted via the existing `lOnly()` helper — identical to what Medium already renders (`lOnly` only shows content at Large/Expanded, so Medium and Small now match exactly).

No `MOCK_DATA` change was needed — this was a render-logic-only fix (control flow reordering), no new fields or values were required. `mock-data.master.js` was not touched.

**Scope:** Only Option C's Small branch inside `WRENDER[6]` was touched. Options A and B, all other widgets, and the Final Check tab (`#fc-widget-6`, line ~1312) were not modified. Finding 2 (Option A's Large/Expanded dead affordance — documented intent) and Finding 4 (project-wide Large-fill convention) were left alone per instruction, as was the pre-existing Final Check staleness flagged above.

---

## 2026-07-23 — Re-run under Rules 8-11: Options B/C deepened

**Why this run happened, plainly:** the project owner reviewed the two entries above (same day, earlier) and felt Options B and C came out as "3 different graphs using the same data idea" — a donut and a spotlight/segmented-bar that both, in the end, only ever restated enrollment count per plan with a different chart shape. Four new rules landed in `General Widget Design Rules.md` today (Rules 8-11) specifically in response to this kind of feedback, and this widget was re-run under them immediately rather than waiting for the next widget to hit the same problem. This entry is additive — nothing in the two entries above was edited or removed, and the tracker-staleness / Final Check "locked" flags raised there still stand, unchanged.

### Rule 8 — filter state is now scoped per option
`WRENDER[6]` previously read the Plan Type filter via `fv(wid,'Plan Type')` and rendered active-filter chips via `ftags(wid)` — both keyed on the shared `WS[6]` object, so changing the filter on Option A's card silently changed what B and C showed too. This run introduces a per-option key local to this widget only: `var fk=wid+'-'+opt;` at the top of `WRENDER[6]`, then `fv(fk,'Plan Type')` and `ftags(fk)` everywhere those were previously called with bare `wid`. This produces three independent state objects — `WS['6-A']`, `WS['6-B']`, `WS['6-C']` — instead of one shared `WS[6]`.

The card chrome itself needed two fixes to make this reachable at all, both pre-existing gaps from the morning build, not new regressions:
- Each of the 3 cards' "Change filters" button called `openFilter(6,event)` with no option letter — changed to `openFilter(6,event,'A'/'B'/'C')` so the modal knows which option it was opened from.
- `openFilter`/`_renderFltBody`/`applyFilter` (the shared filter-modal functions used by every widget) each gained a narrow `wid===6`-scoped branch — a new `_filterOpt` global (set in `openFilter`, alongside the existing `_filterWid`) lets `_renderFltBody` prefill from `gs(wid+'-'+_filterOpt)` and `applyFilter` write back to the same key, instead of the shared `gs(wid)`, **only when `wid===6`**. Every other widget's filter modal is byte-for-byte unchanged — this follows the same "scoped `if(wid===N)` branch inside a shared function" pattern the file already uses for W01/W03's own filter special-cases. `rerender(_filterWid)` still runs with the plain numeric `6` (it has to — it indexes `MOCK_DATA.options[6]`), which re-renders all three cards on every filter change, but since each card's own `WRENDER[6]` call reads its own scoped `fv('6-'+opt,...)`, only the option actually changed shows different output; the other two re-render to the same HTML they already had.

The Final Check tab's own "Change filters" buttons already called `openFilter(6,event,'A')` (it was always locked to Option A) — so it automatically inherits the same scoped state (`gs('6-A')`) that Option A's Dashboard-tab card now uses, with no edit needed to Final Check's own markup.

### Rule 9 — KPI/Medium/Large confirmed, one real gap found and fixed
KPI, Medium, and Large were already reachable in `WRENDER[6]`'s own logic for all three options (the `kpiTileMini(...)` branches for A/B/C already existed from the morning build). What wasn't reachable: the Dashboard-tab card chrome's "Widget size" menu only had Small/Medium/Large buttons — **no KPI button at all** — for all three of this widget's cards, unlike every other widget's 4-button pattern (e.g. W01). Added a fourth `setSize(6,<opt>,'sz-k',event)` button (icon `crop_7_5`, label "KPI") to each of the 3 cards, matching the existing convention exactly. Small remains offered for all three options — no omission to flag here.

### Rule 10 — Options B and C given a genuine second dimension
Per the owner's "3 different graphs, same data idea" feedback, and per this widget's own `MOCK_DATA.series[6]` plan records already carrying `cost` (Employer $ monthly cost) and `s` (status: Active/Pending) unused by any option:

- **Option B (Donut by Plan → Donut by Plan + Cost Watch, Competitor Match).** Kept the Milliman/Gusto-confirmed donut as the primary view (no reason to abandon the one Market Research pattern this widget's research actually supports) but added a computed cost-per-enrolled figure per plan and a "Cost watch" callout flagging whichever plan costs disproportionately more per enrollee than the others (in the current mock data, that's COBRA — $180/enrolled vs. $20-60/enrolled for every other plan). The Table alternate view gained two columns (Employer $/mo, $/Enrolled) so the same dimension is visible there too. This is grounded in Market Research, not invented: the same doc's "new this pass" section cites Businessolver's live dashboard by name — "Benefits Participation **& Premium Cost Analytics** Dashboard" — as confirming that plan-level cost analytics is a real, current feature alongside participation, which is exactly the pairing built here.
- **Option C (Enrollment Spotlight → Enrollment Spotlight + Pending Flag, Maximum Freedom).** Kept the Spotlight callout + segmented proportion bar (still the most different visual grammar from A/B) but added a distinct Pending-status callout that surfaces any plan whose `s` field is `'Pending'` (in the current mock data, COBRA again — 4 enrolled, pending) instead of only ever re-describing enrollment share a second time. This isn't a new idea invented for this run — this file's own pre-existing Fine-Tuning Note ("If a specific plan named 'COBRA' exists... it should be visually distinct, e.g. amber colour") called for exactly this and was never actually built until now. The Table alternate view for C gained a Status column for the same reason.
- **Option A was deliberately left alone in concept** — the owner's complaint was about B/C, not A, and Rule 10 doesn't ask Design 1 to change. Only the Rule 8 filter-scoping fix touches A's code.
- **Both callouts are omitted at Small** (via the existing `mUp()` helper, which already hides content below Medium) — Small keeps exactly the same content it had after this morning's Fix Mock Designs pass (donut-only for B; spotlight+segmented-bar for C), not because the callout can't fit in principle, but as a deliberate glance-size simplification consistent with Small being optional-richness per Rule 9. Stating this plainly per Rule 9's spirit even though it's a sub-feature omission, not a whole-size omission — Medium and Large both show the full breakdown, and the Table view surfaces the same data at every size including Small.

### Rule 11 — real-backend status of `cost`/`s` is still open, flagged here not in the mockup
Both new callouts, and Option B's new table columns, render as if `cost` and `s` are confirmed real fields — no "unconfirmed"/"TBD" badge or disclaimer was added anywhere in `Dashboard Widget Mockups.html`, per instruction. Their actual status is **not resolved by this run**:
- The Developer Punch List's `## W06` section lists exactly three confirmed-available items — Plan Type filter, Horizontal Bar/Donut/Table views, KPI Total Enrollment — and says nothing about cost or status either way (neither confirmed available nor confirmed unavailable).
- This same Widget_Specs file's own **Filter Options** section (above, unedited) and the code comment that sat directly above `WRENDER[6]` before this run both stated "the real data only supports Plan and Enrolled count; there's no active/inactive field today" — while the mock data array has carried `cost`, `p`, and `s` per plan all along. The 2026-07-23 morning "Create Mock Designs run" entry above already flagged this exact contradiction as a documentation-accuracy note, not a resolved question, and this run does not resolve it either.
- **Net: this design now visibly depends on `cost` and `s` being real, org-specific, backend-available fields. That dependency is open, not confirmed.** Whoever finalizes this widget's design should get an explicit yes/no from product/backend on whether Employer $ Cost and Plan Status are actually available per plan before this ships — if either isn't, Option B's cost callout/columns or Option C's pending callout/column need to come back out, not be silently kept.

### Where this was written
`Dashboard Widget Mockups.html` — `MOCK_DATA.options[6]` (titles/imp text for B and C updated to describe the new callouts; A's imp text updated only to note the Rule 8 scoping), the three option cards' static markup (`openFilter(6,event)` → `openFilter(6,event,'A'/'B'/'C')`, plus an added KPI `setSize` button per card), `WRENDER[6]` (per-option `fk` filter key throughout; new cost-watch logic in Option B; new pending-flag logic in Option C), and the shared `openFilter`/`_renderFltBody`/`applyFilter` functions (each gained a narrow `wid===6` branch, new `_filterOpt` global). `mock-data.master.js` re-synced for the `MOCK_DATA.options[6]` text change — `MOCK_DATA.series[6]`'s actual values were not changed (no new field was needed; `cost` and `s` already existed in both the live HTML and the mirror). The Final Check tab's own markup (`#fc-widget-6`) was **not edited** — its pre-existing "Final design — locked" badge and the render/text mismatch flagged in the first 2026-07-23 entry above both still stand, unchanged by this pass. `check-rules.py --widget 6` ran clean afterward: 0 HIGH / 0 MED / 0 LOW findings.

---

## 2026-07-23 — Fix Mock Designs run: MEDIUM finding resolved (Options B/C card titles)

**What was wrong:** The Rule 10 re-run above (same day, earlier) renamed `MOCK_DATA.options[6]`'s titles for B and C to "Donut by Plan + Cost Watch" and "Enrollment Spotlight + Pending Flag" — and updated the Eye popover text and the actual rendered content to match — but missed the Dashboard-tab card chrome's own static `opt-t` title text for both `#opt-6-B` and `#opt-6-C`, which still read the old, shorter "Donut by Plan" and "Enrollment Spotlight". Option A's title was already correct and untouched. This was caught by a real Verify Mock Designs pass and logged as a MEDIUM finding in `Verify Findings.md`.

**What changed:** In `Dashboard Widget Mockups.html`, updated only the two static `opt-t` strings:
- `#opt-6-B`: `<div class="opt-t">Donut by Plan</div>` → `<div class="opt-t">Donut by Plan + Cost Watch</div>`
- `#opt-6-C`: `<div class="opt-t">Enrollment Spotlight</div>` → `<div class="opt-t">Enrollment Spotlight + Pending Flag</div>`

Both now match `MOCK_DATA.options[6]`'s `title` field for B and C exactly, per the project's own established convention (verified against W10). No other text on either card, no other widget, and the Final Check tab (`#fc-widget-6`) were touched. `mock-data.master.js` was not touched — the mismatch was only in the static HTML card markup, not in the mirrored data file.

**Scope confirmed:** a direct before/after comparison of the HTML showed exactly these two string replacements and nothing else — Option A's title, both cards' other text, `WRENDER[6]`, and `#fc-widget-6` are unchanged.

---

## 2026-07-23 — Option B: on-screen By Enrollment / By Cost toggle added (direct request)

**What prompted this:** direct feedback that the previous pass's "Cost watch" callout only ever *mentioned* cost as a side note next to a donut that still visualized enrollment share — not a real total-cost comparison across plans. Confirmed with the project owner that this should be **total cost per plan**, not a cost-per-enrolled efficiency ratio, and that the toggle should sit **on-screen above the chart**, not folded into the existing 3-dot "Switch chart type" menu (which stays as-is, switching Donut ↔ Table, unrelated to this).

**Why it's a real, distinct comparison, not just enrollment restated:** checked the actual mock numbers before building — enrollment share is Dental 31% / Vision 29% / PPO Plus 22% / HSA Basic 12% / HMO Core 5% / COBRA 1%, while cost share is PPO Plus 33% / Dental 24% / HSA Basic 19% / Vision 15% / HMO Core 7% / COBRA 3%. PPO Plus and Dental swap relative rank between the two views — this genuinely shows which plans drive spend versus which just have headcount, not a relabelled version of the same chart.

**What changed:**
- New function `setChartMetric(wid,opt,val,e)` (added directly after `setView()`) — writes to the same per-option state key Rule 8 already established for this widget (`gs(wid+'-'+opt).metric`), then re-renders just that one card's `viz-6-B` element. Deliberately separate from `setView()`, which still only handles Donut ↔ Table.
- `WRENDER[6]`'s Option B branch, Medium/Large/Expanded only: a new pill-button toggle ("By Enrollment" / "By Cost") renders inside the card body, above the donut — the active choice greys out and is non-clickable, the other stays clickable, per Rule 4. Switching to "By Cost" re-sizes the donut's own slices by each plan's total `cost` field (not enrollment count) against total cost across all plans, and the caption beneath switches from "Total enrolled: N" to "Total cost: $N" to match (Rule T5 — the printed value always matches what's actually plotted). The existing $/enrolled "Cost watch" outlier callout is unchanged and still shows underneath regardless of which metric is toggled — it's a distinct insight (cost efficiency per head) from the toggle (total cost distribution), not a duplicate.
- **Small keeps the plain enrollment-only donut, no toggle** — same simplification precedent already used for the Cost Watch callout at this size (not enough room for a toggle to read as anything but clutter), stated here per Rule 9 rather than left silent.
- Table view is unaffected — it already shows both enrollment% and cost columns side by side, so there's nothing for this toggle to add there.

**Data used:** `cost` (Employer $ monthly, per plan) — already in `MOCK_DATA.series[6]`, unchanged, no new field added, no mirror re-sync needed (confirmed `mock-data.master.js` still matches the live HTML's `options[6]`/`series[6]` blocks byte-for-byte). Its real-backend-availability caveat from the earlier Rule 11 entry above still applies unchanged — nothing about this pass resolves or worsens that open question.

**Scope confirmed:** `check-rules.py --widget 6` → 0 HIGH/MED/LOW. Every other widget's `WRENDER[n]` confirmed byte-identical to before this edit. `openFilter`/`_renderFltBody`/`applyFilter`/`gs`/`fv`/`sv`/`setView` all confirmed unchanged from their state after the earlier Rule 8 pass — `setChartMetric` was added as a new function, not by editing any of those. `#fc-widget-6` (Final Check tab) confirmed byte-identical, untouched.
