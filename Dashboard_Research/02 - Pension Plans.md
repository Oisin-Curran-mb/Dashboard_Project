# Purpose Document: Pension Plans

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Pension Billing

---

## 1. Purpose
To give a clear overview of how much is being contributed annually across each pension plan type, and to allow staff to filter that view by church district. It also lets users drill into the detail to see which individual appointees are on each plan.

## 2. Where the Data Comes From
This chart pulls from the Pension Billing area of the system. It looks at active pension plan appointments — meaning only people who are currently active, whose plan start date has already passed, and whose plan has not yet ended. Anyone outside those conditions is excluded.

The figures shown are the annual contribution amounts, grouped by plan type and totalled. The list of available districts to filter by comes from the district records held in the same module.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| PB_Appointment | Individual appointment records — Active flag, DateStart, DateEnd |
| PB_AppointmentPlan | Plan assignment per appointment, including AnnualPlanAmount and PlanID/Name |
| PB_ControlTable | District records used to populate the district filter dropdown (filtered to Type = District) |

**Confirmed correct** against the legacy `PensionPlans : DataPanelControl` class (`/PensionBilling`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. One addition: the last-selected District is saved per user and restored on next load (not previously documented).

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Active appointment filter:** `Active = true AND DateStart <= today AND (DateEnd = null OR DateEnd >= today)`
- **Amount per plan** = `SUM(PB_AppointmentPlan.AnnualPlanAmount)`, `GROUP BY PlanID, Name`, optionally filtered further `WHERE DistrictID = {selected}`
- **District dropdown source:** `PB_ControlTable WHERE Type = District`, with `"All Districts"` prepended
- **Drill-down detail rows:** `Appointee, Charge, AnnualAmount, DistrictID` per appointment on the clicked plan
- ⚠️ **Known Modern API gap:** the `Charge` field in the drill-down (appointee's assigned minister/charge name) currently returns an empty string — not yet populated in the new API. Worth flagging for the rebuild so it isn't silently carried forward broken.

## 3. What It's Telling Us
A side-by-side view of a summary table and a pie chart, both showing the same information: how the total annual pension contribution is split across each plan type. This makes it easy to see at a glance which plan carries the most cost and how the overall pension obligation is made up.

## 4. How It's Displayed
- **Left:** A table listing each pension plan name alongside its annual contribution amount, with a highlighted total row at the bottom
- **Right:** A pie chart with one segment per plan type, labelled with the plan name
- Both the table and the chart always show the same data — they update together

## 5. Filters & Controls
- **District dropdown** (top left) — defaults to "All Districts"; selecting a specific district narrows both the table and the chart to only show plans and amounts for appointees in that district
- **Refresh** — reloads the chart with the latest data
- **Export to Excel** — note: the export covers the appointee-level detail (see below), not the plan summary shown on the main view

## 6. How It Connects to Other Parts of the Dashboard
- Changing the district filter updates both the table and pie chart at the same time
- Clicking on a plan row in the table opens a detail view (a second panel) showing the individual appointees on that plan — their name, their church or organisation, and their annual amount. The district filter from the main view carries through into this detail view.
- _Whether this chart responds to any filters applied elsewhere on the dashboard is not yet confirmed — needs investigation_

## 7. Open Questions
- Does this chart respond to any global filters applied across the whole dashboard?
- What exactly is called when the Refresh button is pressed?
- Is the chart type (pie vs. bar) fixed, or can it be changed by the user?

