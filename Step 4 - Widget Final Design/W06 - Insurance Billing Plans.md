# W06 — Insurance Billing Plans

**Module:** HR
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W06-Insurance-Billing-Plans.md](../Step%203%20-%20Mock_Work/Widget_Specs/W06-Insurance-Billing-Plans.md)
**Data source & formulas:** [Step 1 - Dashboard Research/06 - Insurance Billing Plans.md](../Step 1 - Dashboard Research/06%20-%20Insurance%20Billing%20Plans.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists; neither side wins by default.

## Purpose
Shows how many people are enrolled in each insurance plan, with the option to filter by insurance type, giving staff a quick overview of insurance plan uptake across the organisation.

The data shape above (enrollment count per plan, filterable by insurance type) matches the legacy widget [DOC — Step 1 research]. The enrollment count includes both employees and their dependents, not just employees alone [DOC — Step 1 research].

## How Other Companies Fulfil This Purpose
- Benefits dashboards typically use **bar charts** to compare plan enrollment across categories, with **donut** for proportional split, drawn from ADP/Gusto-style benefits platforms ([Milliman](https://www.milliman.com/en/insight/how-enrollment-insights-can-drive-eb-plan-design), [Gusto](https://support.gusto.com/article/112462198100000/Gusto-benefits-dashboard)). [RESEARCH]

**Net assessment:** this is a single-dimension dataset (enrollment count per plan), so both standard visualisations apply cleanly with no missing dimension — the design matches what's typically shipped in commercial benefits platforms.

## Data Contract
What the widget consumes, stated here rather than only linked out. Source tables and formulas below come from the Step 1 research doc, which was confirmed correct against the legacy `InsuranceBillingPlans : DataPanelControl` class (`/InsuranceBilling`), verified via `Widget_Comparison_Classic.html`, 2026-07-08 [DOC — Step 1 research].

| Field / value shown | Source table / endpoint | Formula (if computed) | Evidence |
|---|---|---|---|
| Plan (name) | `IB_Plan` (insurance plan records: names and types) | Plan list: `IB_Plan WHERE IB_Type.CompanyID = ctx`, optionally `WHERE TypeID = {selected}`, `ORDER BY Name` | [DOC — Step 1 research] |
| Enrolled (count per plan) | `IB_EmployeePlan` (employees enrolled in each plan) + `IB_EmployeeDependent` (dependents enrolled in each plan) | `NumberEnrolled = COUNT(IB_EmployeePlan WHERE PlanID = plan) + COUNT(IB_EmployeeDependent WHERE PlanID = plan)`; a **live count computed at query time**, not a stored point-in-time snapshot | [DOC — Step 1 research] |
| Plan Type filter list | `IB_Type` (insurance type categories) | `IB_Type WHERE CompanyID = ctx, ORDER BY Name`, with "All Types" prepended | [DOC — Step 1 research] |
| % of Total (Summary Table view) | Derived | Enrolled ÷ total enrolment across visible plans; rounding rule *Not yet specified* | [DOC — this doc, Views section] |
| KPI headline (Total Enrollment) | Derived | Count, across all plans; the legacy total row shows the overall enrollment count across all visible plans | [DOC — this doc, Views section; totals behaviour DOC — Step 1 research] |
| Active/Inactive status field | Does not exist today: "the real data only supports Plan and Enrolled count; there's no active/inactive field today" [DOC — this doc / Step 3 spec]. Counter-observation: the mockup's mock data array "has carried `cost`, `p`, and `s` per plan all along" and the built Options B/C now render `cost` (Employer $ monthly) and `s` (status) as if real; "that dependency is open, not confirmed" [BUILD / DOC — Step 3 spec, Rule 11 entry]. Both claims recorded; not resolved here. | n/a | [TO CONFIRM — owner TBD] |
| Employer Contribution ($), Monthly Amount ($), Status as future columns/filters | Not in scope for this build (see Sign-off Readiness) | n/a | [TO CONFIRM — owner TBD] |

- **Favourability / direction logic:** none documented; enrollment counts are neutral. The only colour rule is the COBRA guidance in Fine-Tuning Notes [DOC — this doc].
- **Rounding / currency / locale rules:** *Not yet specified*.
- **Freshness / "data as of" behaviour:** enrollment is a live count computed at query time [DOC — Step 1 research]. New-design freshness signal: *Not yet specified*. Legacy note: the last-selected Type is saved per widget and restored on refresh [DOC — Step 1 research].

## Widget States
| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified* |
| Empty (org has no plans or enrollments) | *Not yet specified* |
| Partial (some plans have zero enrollments) | *Not yet specified* for the new design. Legacy behaviour: plans with zero enrollments appear in the table but not in the pie chart [DOC — Step 1 research]. |
| Loading | *Not yet specified* |
| Error / API failure | *Not yet specified* |
| Stale data | *Not yet specified* for the new design. Enrollment is a live count at query time, not a stored snapshot [DOC — Step 1 research]. |

## Interaction Spec
- **Hover:** *Not yet specified* for the new views. Legacy baseline: hovering over a pie segment shows the enrollment count for that plan [DOC — Step 1 research].
- **Click:** no drill-down — clicking a row or chart segment does not open further detail (legacy behaviour, kept by design; see Drill-Through) [DOC — Step 1 research / this doc].
- **Filter interaction:** changing the type filter updates both the table and chart simultaneously (legacy behaviour) [DOC — Step 1 research]. Filter defaults to "All Types" in the legacy widget [DOC — Step 1 research].
- **Sort toggle:** a user toggle switches the table from alphabetical by Plan name to Enrolled-count descending [DOC — this doc, Data Table Sort].
- **Keyboard / focus behaviour:** *Not yet specified*.

## Filters
| Filter | Values |
|--------|--------|
| Plan Type | All Plans · dynamic list |

**Status filter dropped** — the real data only supports Plan and Enrolled count; there's no active/inactive field today. KPI size shows Plan Type only (or no filter, if judged too heavy for KPI chrome).

The KPI-size filter choice above is undecided (Step 3 spec: "flag for review") and is tracked in Sign-off Readiness. Plan/type names are entered elsewhere in the system and vary per organisation; the specific values shown in the old and new designs are illustrative mock data, not a fixed hardcoded list [DOC — Step 3 spec].

## Data Table Sort
Fixed alphabetical by Plan name, with a user toggle to switch to Enrolled-count descending — the Payroll/HR domain default.

**Trimmed-view rule:** Small shows "top 3 plans" and Medium "top 5 plans" (see Size behaviour), but what "top" is sorted by is *Not yet specified*. Note the tension: the default sort is alphabetical, and an alphabetical top-N is not a meaningful "top"; this needs a decision (tracked in Sign-off Readiness).

## Drill-Through
None — matches the old design, and avoids surfacing individual employee/dependent names at the dashboard level.

Legacy grounding: the Step 1 research doc confirms no drill-down exists today [DOC — Step 1 research].

## Refresh
Standalone icon, present at every size including KPI.

What refresh does in the new design (spinner, timestamp update, full re-fetch): *Not yet specified*. Legacy behaviour: reloads the data; the last-selected Type is saved per widget and restored on refresh [DOC — Step 1 research].

---

## Views (Switch View)

### View 1 — Horizontal Bar by Plan *(default)*
One bar per plan, showing enrolment count. Scales cleanly regardless of how many plans an organisation has configured.

### View 2 — Donut by Plan
Proportional enrolment split — best when an organisation has a small, stable number of plans.

### View 3 — Summary Table
Plan · Enrolled · % of Total. Sort per Data Table Sort above.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, top 3 plans, no Switch View |
| **Medium (2×2)** | Active view, top 5 plans; Switch View available |
| **Large (4×4)** | Active view, all plans + total enrolment count; Switch View available |
| **KPI (1×0.5)** | Headline: **Total Enrollment** (count, across all plans). No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

Per-size overflow behaviour at real volumes, truncation rules, and which-N tie-breaks: *Not yet specified* (see Data Table Sort's trimmed-view rule).

**Build divergence note (recorded, not resolved):** this doc's three views are Horizontal Bar by Plan / Donut by Plan / Summary Table [DOC — this doc]. The Step 3 spec's 2026-07-23 entries record that "the Widget_Specs Options A/B/C above, the live HTML's pre-existing A/B/C, and the 3 new designs below are now three different sets that don't line up 1:1", with the live mockup rebuilt as "Table + Pie by Plan" / "Donut by Plan + Cost Watch" (with a By Enrollment / By Cost toggle) / "Enrollment Spotlight + Pending Flag", and the Final Check tab's "Final design — locked" badge sitting over markup that "describes a render that no longer matches what Option A actually produces" [DOC — Step 3 spec, 2026-07-23]. Neither version is deleted here; reconciliation is tracked in Sign-off Readiness.

## Accessibility
Stated for this widget, not globally assumed:
- Colour is never the only signal: the COBRA amber distinction gets a label/marker pairing, not colour alone. *Not yet reviewed against the build*.
- Chart values exist as text in the DOM (sr-only or visible table), not hover-only. *Not yet reviewed against the build*.
- Table semantics are real (`th`/scope), and interactive controls are reachable by keyboard. *Not yet reviewed against the build*.

## What Got Cut (and why)
- **"Plan with highest enrollment" and "dominant plan + % of total" as KPI headlines** — both dropped in favour of a single **Total Enrollment** figure, for consistency with the rest of the dashboard's KPI pattern; the view-specific insights remain visible at Medium/Large size. [DOC — this doc; decision owner not recorded]
- **Active/Inactive status column** — already dropped before this pass; not backed by real data today. [DOC — this doc / Step 3 spec; decision owner not recorded]

## Sign-off Readiness
| # | Open item | Type (field / math / product decision) | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | KPI-size filter undecided: "Plan Type only (or no filter, if judged too heavy for KPI chrome)" (Filters section); Step 3 spec says "flag for review". | Product decision | TBD | KPI size only |
| 2 | Core user question fully open: no interview content exists specifically for this widget; the only mention of Insurance Billing is a usage-rarity aside ("Pension and Insurance Billing Widgets... specifically for Methodist conferences... used by about 5% of clients"), about adoption, not design [DOC — Step 3 spec, citing the Ben Lane interview]. | Product decision | TBD | No |
| 3 | "Could Employer Contribution ($), Monthly Amount ($), and Status be added as future columns/filters? Not in scope for this build, but worth raising" [DOC — Step 3 spec]. | Product decision | Product/backend | No (out of scope) |
| 4 | Backend availability of `cost` and `s` fields: the built mockup's Options B/C "visibly depend on `cost` and `s` being real, org-specific, backend-available fields. That dependency is open, not confirmed" [DOC — Step 3 spec, Rule 11 entry]. This doc's own three views do not use those fields, but the doc-level claim "there's no active/inactive field today" and the build's rendered Status/cost data currently coexist unreconciled (see Data Contract). | Field | Product/backend | No for this doc's views; open for the built B/C designs |
| 5 | Doc-vs-build divergence: this doc's three views vs the three designs rebuilt in the mockup on 2026-07-23, plus the flagged Final Check "locked" badge mismatch [DOC — Step 3 spec]. See the Views section note. | Reconciliation | TBD | No |
| 6 | Trimmed-view rule: "top 3 / top 5 plans" is sorted by what? Default sort is alphabetical, so "top" is currently undefined. | Product decision | TBD | No |

This doc has 6 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- If a specific plan named "COBRA" exists in an organisation's data, it should be visually distinct (e.g. amber) — plan names are org-defined, not a fixed rule about a specific plan
