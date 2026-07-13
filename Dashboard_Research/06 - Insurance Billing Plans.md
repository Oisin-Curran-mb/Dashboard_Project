# Purpose Document: Insurance Billing Plans

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Insurance Billing

---

## 1. Purpose
To show how many people are enrolled in each insurance plan, with the option to filter by insurance type. It gives staff a quick overview of insurance plan uptake across the organisation.

## 2. Where the Data Comes From
This widget pulls from the Insurance Billing module. It counts the number of people enrolled in each plan — importantly, the enrollment count includes both employees and their dependents, not just employees alone.

The list of insurance types available in the filter dropdown is also pulled from the same module.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| IB_Plan | Insurance plan records — names and types |
| IB_Type | Insurance type categories, used to populate the filter dropdown |
| IB_EmployeePlan | Records of employees enrolled in each plan |
| IB_EmployeeDependent | Records of dependents enrolled in each plan |

**Confirmed correct** against the legacy `InsuranceBillingPlans : DataPanelControl` class (`/InsuranceBilling`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. One addition: the last-selected Type is saved per widget and restored on refresh (not previously documented).

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Plan list:** `IB_Plan WHERE IB_Type.CompanyID = ctx`, optionally `WHERE TypeID = {selected}`, `ORDER BY Name`
- **NumberEnrolled per plan** = `COUNT(IB_EmployeePlan WHERE PlanID = plan) + COUNT(IB_EmployeeDependent WHERE PlanID = plan)` — this is a **live count computed at query time**, not a stored point-in-time snapshot, which **answers Open Question 2**
- Type dropdown source: `IB_Type WHERE CompanyID = ctx, ORDER BY Name`, with "All Types" prepended

## 3. What It's Telling Us
A side-by-side view of a table and a pie chart, both showing the number of people enrolled in each insurance plan. Plans with zero enrollments appear in the table but not in the pie chart. The total row at the bottom of the table shows the overall enrollment count across all visible plans.

## 4. How It's Displayed
- **Left:** A table listing each insurance plan name alongside its total enrollment count, with a highlighted total row at the bottom
- **Right:** A pie chart — one segment per plan that has at least one enrollment, labelled with the plan name
- Both the table and chart reflect the same filtered data

## 5. Filters & Controls
- **Type dropdown** (top left) — defaults to "All Types"; filters both the table and pie chart to show only plans belonging to the selected insurance type (e.g. Dental, Medical, Property, Vision)
- **Refresh** — reloads the data

## 6. How It Connects to Other Parts of the Dashboard
- Changing the type filter updates both the table and pie chart simultaneously
- Hovering over a pie segment shows the enrollment count for that plan
- No drill-down available — clicking a row or chart segment does not open further detail
- _Whether this chart responds to any filters applied elsewhere on the dashboard is not yet confirmed — needs investigation_

## 7. Open Questions
- Does this widget respond to any global filters applied across the whole dashboard?
- Is the enrollment count a live figure or does it reflect a specific point in time?

