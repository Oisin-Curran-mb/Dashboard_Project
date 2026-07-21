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
