# W06 — Insurance Billing Plans

**Module:** HR
**Status:** 🟢 Final design — locked (built 2026-07-30, Jo design, tagged v2.0 in the build). Locked-doc rule: the body below describes only the current final design. Superseded design thinking is not deleted, it is dated and moved to the "Design History (superseded)" section at the end of this doc.
**Full history / rejected ideas:** [Widget_Specs/W06-Insurance-Billing-Plans.md](../Step%203%20-%20Mock_Work/Widget_Specs/W06-Insurance-Billing-Plans.md)
**Data source & formulas:** [Step 1 - Dashboard Research/06 - Insurance Billing Plans.md](../Step 1 - Dashboard Research/06%20-%20Insurance%20Billing%20Plans.md)
**Confluence dossier:** none yet
**Last verified against build:** 2026-07-30 via build-final-widget (Final, Jo design: ~202-assertion Node driver, 0 failures + final-check-rules.py 0 HIGH + browser-faithful CSS parse, 0 dropped rules). Previous: not yet audited.

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a named written source · `[CODE]` confirmed by a codebase trace on a stated date · `[TO CONFIRM]` assumed, with a named owner to confirm. Conflicting evidence coexists; neither side wins by default.

---

# Final Design (current)

Everything in this part describes what actually shipped: Jo Lopez's Insurance widget carried into the Final Check tab one-to-one (the additive `insF` block), plus owner-directed enhancements to the table. Anything the project considered earlier, tested, or dropped lives in Design History at the end.

## Purpose
Shows how many people are enrolled in each insurance plan, with the option to filter by insurance type, giving staff a quick overview of insurance plan uptake across the organisation. The data shape (enrollment count per plan, filterable by insurance type) matches the legacy widget [DOC — Step 1 research]. The enrollment count includes both employees and their dependents, not just employees alone [DOC — Step 1 research].

## How Other Companies Fulfil This Purpose
- Benefits dashboards typically use **bar charts** to compare plan enrollment across categories, with **donut** for proportional split, drawn from ADP/Gusto-style benefits platforms ([Milliman](https://www.milliman.com/en/insight/how-enrollment-insights-can-drive-eb-plan-design), [Gusto](https://support.gusto.com/article/112462198100000/Gusto-benefits-dashboard)). [RESEARCH]

**Net assessment:** this is a single-dimension dataset (enrollment count per plan), so both standard visualisations apply cleanly with no missing dimension. The Final ships Jo's dense, scannable table rather than a chart, adding a proportional Share column so the "which plan dominates" reading a donut would give is still present as text.

## Data Contract
What the widget consumes, stated here rather than only linked out. The legacy source tables and formulas come from the Step 1 research doc, confirmed correct against the legacy `InsuranceBillingPlans : DataPanelControl` class (`/InsuranceBilling`), verified via `Widget_Comparison_Classic.html`, 2026-07-08 [DOC — Step 1 research]. The current-code IB table names below were confirmed against the Insurance Billing module by a codebase trace, 2026-07-30 [CODE].

| Field / value shown | Source table / endpoint | Formula (if computed) | Evidence |
|---|---|---|---|
| Insurance type (parent row) | `IBType` (insurance type categories: Medical, Dental, Vision, Property) | Type list scoped to the company; the nested table groups plans under their type | [CODE 2026-07-30] / [DOC — Step 1 research] |
| Plan (child row / name) | `IBPlan` (insurance plan records, linked to a type via TypeID) | Plan list under each type, ordered by name | [CODE 2026-07-30] / [DOC — Step 1 research] |
| Enrolled (count per plan / per type) | `IBEmployeePlan` (employees enrolled) + `IBEmployeeDependent` (dependents enrolled) | `Enrolled = COUNT(IBEmployeePlan WHERE PlanID = plan) + COUNT(IBEmployeeDependent WHERE PlanID = plan)`; a **live count computed at query time**, not a stored point-in-time snapshot; type rows sum their plans | [CODE 2026-07-30] / [DOC — Step 1 research] |
| Cost (per plan / per type) | `IBEmployeePlan.Rate` (rate carried on each enrollment row), standard-rate fallback `IBPlanRate` | `Cost = SUM(IBEmployeePlan.Rate) grouped by PlanID`; **derivable with query logic only, no new stored field** [confirmed in code]. Which figure "total cost" means (total premium vs employer share `EmployerBilled` / `RateIndividual` vs employee share, and `PreTax` handling) is a definition choice, not a data gap | [CODE 2026-07-30] / [TO CONFIRM — product/SME] |
| Share (per plan / per type) | Derived | `Share = row Enrolled ÷ grand total Enrolled`; shown on both parent (type) and child (plan) rows, and rendered as an inline amethyst bar | [BUILD] |
| Insurance type filter list | `IBType` (insurance type categories) | Type list, with an all-types option; the ONLY fetch in the widget | [CODE 2026-07-30] / [DOC — Step 1 research] |
| Total enrolled (footer / Glance KPI) | Derived | Count across all plans; the Glance KPI card shows total enrolled plus a plan-count pill | [BUILD] / [DOC — Step 1 research] |
| Coverage-tier level | `IBTypeElection` (the Type -> Plan -> coverage tier hierarchy) | Real hierarchy exists (`IBType` -> `IBPlan` via TypeID -> `IBTypeElection`); the nested table uses the Type -> Plan level only, tier is not surfaced yet. No self-referencing sub-plan tree exists (no ParentPlanID on IBPlan) | [CODE 2026-07-30] |

- **Enrollment status / pending / COBRA / approval:** no such concept exists on plan enrollment in the real IB module [CODE 2026-07-30]. Enrollment is a live count; there is no active/inactive, pending, or approval field. The COBRA/pending idea from the project's own earlier mock (Option C) is a design invention with no backing in the module; it is NOT carried in the Final. See What Got Cut and Design History.
- **Favourability / direction logic:** none; enrollment counts are neutral. Colour is decorative (the amethyst Share bar), not a status signal.
- **Rounding / currency / locale rules:** *Not yet specified*.
- **Freshness / "data as of" behaviour:** enrollment is a live count computed at query time [CODE 2026-07-30 / DOC — Step 1 research]. New-design freshness signal: *Not yet specified*. Legacy note: the last-selected Type is saved per widget and restored on refresh [DOC — Step 1 research].

## Widget States
| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified* |
| Empty (org has no plans or enrollments) | Renders an empty state reading "No insurance plans yet" rather than a broken table; every total and share is computed from the plan rows, never hardcoded. [BUILD] |
| Partial (some plans have zero enrollments) | A plan with zero enrolled still appears as a row with a zero count and 0% share (e.g. the Building / Property plan in the sample set); it is not hidden. [BUILD] Legacy behaviour: plans with zero enrollments appear in the table but not in the pie chart [DOC — Step 1 research]. |
| Loading | An ~800ms skeleton shows ONLY when the insurance-type filter chip is committed (the only fetch). Sort and the Type -> Plan expand/collapse toggle are instant client interactions, never a fetch. [BUILD] |
| Error / API failure | *Not yet specified* |
| Stale data | *Not yet specified*. Enrollment is a live count at query time, not a stored snapshot [CODE 2026-07-30 / DOC — Step 1 research]. |

## Interaction Spec
- **Type filter chip (the ONLY fetch):** committing the insurance-type filter chip triggers an ~800ms skeleton, then a re-render. Clearing it re-fetches the same way. This is the single fetch in the widget. [BUILD]
- **Sort:** the table is client-side sortable; sorting is instant, never a fetch. [BUILD]
- **Expandable Type -> Plan nesting (Explore and Detail):** insurance TYPE rows are parents (Medical, Dental, Vision, Property) carrying subtotals; clicking a type expands its plan sub-rows (Medical -> Base, Buy Up). Rows are **collapsed by default**; the toggle is instant with no fetch; each type row is keyboard-operable (`role="button"`, `aria-expanded`). The nesting is present in BOTH Explore and Detail (it began Detail-only, then was extended to Explore per direct owner instruction). [BUILD]
- **Glance card:** at Glance the widget is a KPI card (total enrolled + plan-count pill + an "employees and dependents" caption); the nested table renders at Explore and Detail. [BUILD]
- **Click (drill):** no drill modal and no drill-through; clicking a type row only expands/collapses it; it does not open further detail or surface individual employee/dependent names (legacy behaviour, kept by design) [DOC — Step 1 research / this doc].
- **Keyboard / focus behaviour:** type rows are reachable and toggleable by keyboard (`role="button"`, `aria-expanded`); other focus behaviour *Not yet specified*.

## Filters
| Filter | Values |
|--------|--------|
| Insurance type | All types · dynamic list (`IBType`) |

The insurance-type filter chip is the only filter and the only fetch. Plan/type names are entered elsewhere in the system and vary per organisation; the specific values shown are illustrative mock data, not a fixed hardcoded list [DOC — Step 3 spec]. There is no status filter: no active/inactive, pending, or approval field exists on enrollment [CODE 2026-07-30]. The KPI/Glance-size filter arrangement is carried forward as an open item in Sign-off Readiness.

## Drill-Through
None. It matches the old design, and avoids surfacing individual employee/dependent names at the dashboard level. Legacy grounding: the Step 1 research doc confirms no drill-down exists today [DOC — Step 1 research].

## Refresh
Standalone icon, present at every size including Glance. What refresh does in the new design (spinner, timestamp update, full re-fetch): *Not yet specified*. Legacy behaviour: reloads the data; the last-selected Type is saved per widget and restored on refresh [DOC — Step 1 research].

## Views (layout) and sizing
The Final carries Jo's Insurance layout one-to-one: a **Glance KPI card** (total enrolled + plan-count pill + "employees and dependents" caption), a **sortable table**, the **insurance-type filter chip** (the only fetch), inline **amethyst Share bars**, and a **"Total enrolled" footer**. There is no donut and no drill modal. On top of Jo's base, the Final adds the owner enhancements: the expandable **Type -> Plan nested table** (Explore and Detail), a **Cost total column**, and Jo's **Share column kept** alongside Cost. [BUILD]

**Nested-table columns (Explore / Detail):** Insurance type / plan | Share | Enrolled | Cost. A small Explore width trim (Share bar 104px) lets the four columns fit at 592px. Glance is unchanged (the KPI card). [BUILD]

**Cross-foot (sample data):** Medical Base 128, Medical Buy Up 54, Delta Dental 96, Vision 71, Building 0 = 349 total enrolled. By type: Medical 182 / $91,080, Dental 96 / $3,648, Vision 71 / $639, Property 0 / $0; grand total 349 enrolled / $95,367. Share on both tiers: Medical type 52%, Medical Base 37%, Medical Buy Up 15%, Delta Dental 28%, Vision 20%, Building / Property 0%. Mock cost rates are illustrative (Rule 11); the derivation they model (SUM of `IBEmployeePlan.Rate`) is real [CODE 2026-07-30]. [BUILD]

**Size behaviour:** three sizes only, per General Widget Design Rules Rule 12: **Glance / Explore / Detail**, no Small. Implemented via the `fc-fmode` mechanism, mapping Jo's kpi / wide / xwide layouts. Glance is the KPI card; Explore and Detail render the nested Type -> Plan table. [BUILD]

## Accessibility
Stated for this widget, not globally assumed:
- **Values exist as text:** every enrolled count, Share percent, and Cost figure is DOM text (the amethyst Share bar is a visual echo of the text share, not the only carrier of the value). [BUILD]
- **`aria-expanded` on type rows:** each parent (type) row is a `role="button"` with `aria-expanded` reflecting its collapsed/expanded state, and is keyboard-toggleable. [BUILD]
- **Colour is never the sole signal:** the amethyst Share bar is paired with its share value and label; it is decorative reinforcement, not a status colour. [BUILD]
- **Table semantics:** header cells and interactive controls are reachable by keyboard. [BUILD]

## What Got Cut (and why)
- **Small size**, cut per General Widget Design Rules Rule 12. The Final ships three sizes (Glance / Explore / Detail); the mock's A/B/C design options keep their old sizes.
- **The COBRA / pending flag (mock Option C's "Enrollment Spotlight + Pending Flag")** is NOT carried into the Final. A codebase trace (2026-07-30) confirmed there is no status / pending / COBRA / approval concept on plan enrollment in the real IB module; the idea was a design invention, not real data or a real workflow. Recorded in Design History as "considered, not real." [CODE 2026-07-30]
- **The project's earlier three-view concept** (Horizontal Bar by Plan / Donut by Plan / Summary Table) and the three mock A/B/C design options are not in the Final. The Final is Jo's dense scannable table (KPI card + sortable table + Share bars) plus the owner enhancements. Full detail of what was considered and tested is in Design History below.

## Sign-off Readiness
| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | **"Total cost" definition:** which figure the Cost column means: total premium vs employer share (`EmployerBilled` / `RateIndividual`) vs employee share, and `PreTax` handling. The data is derivable (`SUM(IBEmployeePlan.Rate)`); this is a definition choice, not a data gap. Left open for the Step 5 API doc / SME [CODE 2026-07-30]. | Product decision / API | Product / SME | No |
| 2 | **Mock cost rates are illustrative** (Rule 11), pending confirmation of the real per-enrollee rates the derivation would use. | Field | Backend/dev | No |
| 3 | **Coverage-tier level exists but is not surfaced yet:** the real `IBType` -> `IBPlan` -> `IBTypeElection` hierarchy has a third (tier) level; the Final nests only Type -> Plan. Whether to surface the tier level later is open. [CODE 2026-07-30] | Product decision | TBD | No |
| 4 | **KPI/Glance-size filter arrangement:** whether the Glance KPI card carries the type filter or none (Step 3 spec: "flag for review"). | Product decision | Hard Rules review | No (Glance only) |
| 5 | **Core user question fully open:** no interview content exists specifically for this widget; the only mention of Insurance Billing is a usage-rarity aside ("Pension and Insurance Billing Widgets... specifically for Methodist conferences... used by about 5% of clients"), about adoption, not design [DOC — Step 3 spec, citing the Ben Lane interview]. | Product decision | TBD | No |
| 6 | **Future columns/filters:** "could Employer Contribution ($), Monthly Amount ($), and Status be added as future columns/filters? Not in scope for this build, but worth raising" [DOC — Step 3 spec]. Partly addressed: a Cost column now ships; Status is confirmed NOT to exist as a field [CODE 2026-07-30]. Residual open piece is any other future column. | Product decision | Product/backend | No (out of scope) |

Resolved by the built Final (2026-07-30) and retired from the open list: the doc-vs-build divergence (the Final supersedes both the three-view concept and the mock A/B/C designs); the Small trimmed-view / "top 3 / top 5 plans" sort-by-what question (moot, the Final ships Glance / Explore / Detail with no Small trimmed view); and the "backend availability of `cost` and `s` fields" question (resolved by the codebase trace: `cost` is derivable via `SUM(IBEmployeePlan.Rate)`, and `s` / status has no real field, the earlier mock's use of it was invented). Their original wording is preserved in Design History.

This doc is not sign-off-ready until this table is empty or every open row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- **2026-07-30: Built as the Final, Jo design.** Jo Lopez's Insurance widget ported one-to-one (the `insF` block): Glance KPI card (total enrolled + plan-count pill + "employees and dependents" caption), a sortable table, the insurance-type filter chip (the only fetch, ~800ms skeleton; sort instant), inline amethyst Share bars, a "Total enrolled" footer, empty ("No insurance plans yet") and loading states, no donut, no drill modal. Sample data: Medical Base 128, Medical Buy Up 54, Delta Dental 96, Vision 71, Building 0 = 349 total enrolled. **Plus three owner-directed enhancements:** (1) an expandable **Type -> Plan nested table** in both Explore and Detail (types as parents with subtotals, collapsed by default, instant no-fetch toggle, `role="button"` / `aria-expanded`); (2) a **Cost total column** (Cost = enrolled x per-enrollee rate, modelling `SUM(IBEmployeePlan.Rate)`, mock rates illustrative), cross-footing Medical 182/$91,080, Dental 96/$3,648, Vision 71/$639, Property 0/$0, grand total 349/$95,367; (3) **Jo's Share column kept** alongside Cost on both tiers (Medical type 52%, Medical Base 37%, Medical Buy Up 15%, Delta Dental 28%, Vision 20%, Building/Property 0%). Nested-table columns: Insurance type / plan | Share | Enrolled | Cost, with a small Explore Share-bar trim (104px) to fit at 592px. Sizes Glance / Explore / Detail, no Small, per Rule 12. Tagged v2.0 with "Final" and "Jo design" title badges (`FC_VERSION[6]`). Verification: ~202-assertion Node DOM-shim driver (0 failures: subtotals, grand total, expand/collapse, cost math, Share percents on both tiers, `aria-expanded`, no-fetch-on-toggle), browser-faithful CSS parse (0 dropped rules), final-check-rules.py 0 HIGH, W01-W05 + W06 regressions green, Dashboard tab byte-identical. Full detail in the 2026-07-30 Widget_Specs completion entry.
- Historical guidance (superseded, kept): "if a specific plan named COBRA exists in an organisation's data, it should be visually distinct (e.g. amber)". This was org-defined guidance, never a fixed rule; the Final does not implement a COBRA colour, and the related pending/COBRA status concept has since been confirmed to have no backing in the real module (see Design History).

---

# Design History (superseded, kept for the record)

> Everything below is superseded by the Final Design above. It is kept, dated, and moved here (never deleted) so the reasoning is traceable without cluttering the live spec. Read top-down as a timeline: what existed, what the project designed and tested before adopting Jo's widget, and what got dropped.

## Original / legacy behaviour (what existed before any redesign)
Sourced from the Step 1 research doc, confirmed against the legacy `InsuranceBillingPlans : DataPanelControl` class.
- **Layout:** a table (Plan / Enrolled) beside a pie chart of proportional enrolment; both reflected the same filtered data.
- **Legacy query grounding:** the plan list was `IB_Plan ... ORDER BY Name` (underscore-form legacy naming); the type filter list was `IB_Type WHERE CompanyID = ctx, ORDER BY Name` with "All Types" prepended. Enrolled was `NumberEnrolled = COUNT(IB_EmployeePlan WHERE PlanID = plan) + COUNT(IB_EmployeeDependent WHERE PlanID = plan)`, a live count. (These underscore-form names are the legacy research doc's; the current-code IB tables are `IBType` / `IBPlan` / `IBEmployeePlan` / `IBEmployeeDependent` per the 2026-07-30 codebase trace.)
- **Hover:** hovering a pie segment showed the enrollment count for that plan.
- **Partial data:** plans with zero enrollments appeared in the table but not in the pie chart.
- **Drill:** none; no drill-down existed.
- **Filter:** changing the type filter updated both the table and chart simultaneously; the filter defaulted to "All Types"; the last-selected Type was saved per widget and restored on refresh.

## Project's earlier concept design (pre-Jo), tested in Step 3, superseded 2026-07-30
Before adopting Jo's widget, the project designed and mocked its own W06 concept. Recorded here as superseded.

**Three-view model this doc previously specified:**
- **View 1, Horizontal Bar by Plan (default):** one bar per plan showing enrolment count.
- **View 2, Donut by Plan:** proportional enrolment split, best when an organisation has a small, stable number of plans.
- **View 3, Summary Table:** Plan · Enrolled · % of Total, sorted alphabetically by Plan name with a user toggle to Enrolled-count descending (the Payroll/HR domain default).

Market research judged this a single-dimension dataset where both bar and donut apply cleanly with no missing dimension; no view was flagged as the wrong choice for this data (unlike W05, where a pie-as-sole-view was called out as wrong).

**Old size behaviour table (before Rule 12's three-size model):**

| Size | Behaviour |
|------|-----------|
| Small (1×1) | Active view, top 3 plans, no Switch View |
| Medium (2×2) | Active view, top 5 plans; Switch View available |
| Large (4×4) | Active view, all plans + total enrolment count; Switch View available |
| KPI (1×0.5) | Headline: Total Enrollment (count, across all plans). No download, no switch. |
| Expanded | Active view, full detail, all filters live in the modal |

**What was tested in the mockup (Step 3, 2026-07-23):** the live mockup was rebuilt into three design options that never lined up 1:1 with this doc's three views or the HTML's pre-existing cards [DOC — Step 3 spec, 2026-07-23]:
- **Option A, Table + Pie by Plan** (Restyled Original): table and pie side by side at Large; the table corrected to sort alphabetically by Plan name to match the documented legacy `ORDER BY Name`.
- **Option B, Donut by Plan + Cost Watch** (Competitor Match): a true donut (conic-gradient with a centre hole), later given an on-screen **By Enrollment / By Cost toggle** and a per-plan cost-per-enrolled "Cost watch" outlier callout. Grounded in Market Research citing Businessolver's "Benefits Participation & Premium Cost Analytics Dashboard."
- **Option C, Enrollment Spotlight + Pending Flag** (Maximum Freedom): a Spotlight callout (top plan + its enrolled count) over one continuous segmented proportion bar, plus a **Pending-status callout** flagging any plan whose status field read "Pending" (in the mock data, COBRA: 4 enrolled, pending).

These A/B/C options remain reachable from the design-option switch in the Final Check tab, but the Final that shipped is Jo's widget.

**COBRA / pending, considered NOT real (recorded so it is never treated as real):** Option C's Pending flag and Option B's status handling leaned on `cost` and `s` (status) fields carried in the mock data array, and on this doc's own earlier Fine-Tuning guidance that a "COBRA" plan should be visually distinct (e.g. amber). The Step 3 spec (Rule 11 entry) already flagged that the design "visibly depends on `cost` and `s` being real, org-specific, backend-available fields" and that "that dependency is open, not confirmed." The 2026-07-30 codebase trace resolved it: **there is no status / pending / COBRA / approval concept on plan enrollment in the real IB module**; enrollment is a plain live count. The "1 plan pending: COBRA" idea was a design invention, not real data or a real workflow. `cost`, by contrast, turned out to be real-derivable (`SUM(IBEmployeePlan.Rate)`), so the Cost column survived into the Final while the pending/COBRA flag did not.

**Superseded Data Contract note:** an earlier version of this doc's Data Contract recorded an "Active/Inactive status field" row noting the tension between the doc claim "the real data only supports Plan and Enrolled count; there's no active/inactive field today" and the mockup's use of `cost`, `p`, and `s` per plan in Options B/C. That tension is now resolved (status has no real field; cost is derivable), and the row is superseded by the current Data Contract above.

**Old accessibility baseline (pre-build, aspirational, superseded by the built Accessibility section above):** colour never the only signal (the COBRA amber distinction paired with a label/marker, not colour alone); chart values as DOM text; real table semantics and keyboard-reachable controls. All were marked "not yet reviewed against the build" at the time; the Final now implements text-as-values, `aria-expanded` type rows, and decorative (non-status) colour (see the current Accessibility section).

**Superseded open items (kept for the record):**
- Doc-vs-build divergence (this doc's three views vs the three mock A/B/C designs, plus the earlier flagged Final Check "locked" badge mismatch), resolved: the built Final supersedes both.
- Trimmed-view rule ("top 3 / top 5 plans" sorted by what, when the default sort was alphabetical), moot: the Final ships Glance / Explore / Detail with no Small trimmed view.
- Backend availability of `cost` and `s`, resolved by the codebase trace (cost derivable, status non-existent).

## Superseded by
The built Final, Jo design, 2026-07-30 (see Final Design above). Tagged v2.0 with "Final" and "Jo design" badges in the Final Check tab.
