# Purpose Document: Fixed Asset Values

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Fixed Assets

---

## 1. Purpose
To show the financial values of the organisation's fixed assets (owned physical items such as buildings, vehicles, and equipment), broken down by a chosen grouping. Users can control how assets are grouped, which specific group they want to look at in detail, and which financial figure to focus on.

## 2. Where the Data Comes From
This widget pulls from the Fixed Assets module. It shows all assets grouped by whichever classification the user selects. All three dropdown selections are saved per user and remembered across sessions.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| FA_Asset | Individual asset records — tag number, name, capitalized value, cost, class/building/room/account groupings — **answers Open Question 1**, confirmed via Classic Widget Comparison |
| FA_AssetDepreciation | Book depreciation records per asset (excluding tax depreciation), used to derive Accumulated Depreciation |
| SSUserTenantPreferenceRepository | Each user's saved Group By / Specific Group / Financial Measure selections (key: `UserPreferences.WidgetFixedAssets`) |

**Confirmed correct** against the legacy `FixedAssets : DataPanelControl` class (`/FixedAssets`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. **Correction to Section 3's Net Value definition below** — see formulas.

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Capitalized Value** and **Cost** — direct fields on `FA_Asset`, not derived
- **Depreciable Value** = `Cost − SalvageValue` (computed, not a stored field)
- **Accumulated Depreciation** = `SUM(FA_AssetDepreciation.Depreciation) WHERE !Tax`, grouped by AssetID
- **Net Value** = `DepreciableValue − Accumulated Depreciation` — **this corrects Section 3's description below, which says "Cost minus Accumulated Depreciation"; the actual base is Depreciable Value (Cost minus Salvage Value), not Cost directly**
- **Grouping** for the table: `FA_Asset WHERE CompanyID = ctx`, then grouped by whichever of Class/Building/Room/AssetAccount/AccumDepAccount/ExpenseAccount was selected
- **Chart:** all group items, filtered to exclude any group where the selected Dollar Type totals to 0
- ⚠️ **Known Modern API gap:** only Class/Building/Room groupings are actually implemented for the "Specific Group" dropdown; selecting Asset Account, Accumulated Depreciation Account, or Expense Account as the Group By returns an **empty list** (unimplemented switch case) — the grid/chart then filter to nothing. Also, the three dropdown selections aren't persisted server-side in the Modern API (client-managed only). Both worth flagging before rebuild.

## 3. What It's Telling Us
A side-by-side view of a table and a pie chart. The table shows individual assets within the selected group, with a full breakdown of their financial values across five measures. The pie chart shows how the selected financial measure is distributed across all groups — giving the bigger picture at a glance.

The five financial measures available are:
- **Capitalized Value** — the value at which the asset was formally recorded in the books
- **Cost** — the original purchase price
- **Depreciable Value** — the portion of the asset's value that can be depreciated over time
- **Accumulated Depreciation** — how much of the asset's value has been written off to date
- **Net Value** — the current book value after depreciation (Depreciable Value minus Accumulated Depreciation, where Depreciable Value = Cost minus Salvage Value — see formulas in Section 2)

The total row at the bottom shows the asset count and column totals for the selected group.

## 4. How It's Displayed
- **Left:** A table listing individual assets within the selected group — Tag #, Name, and all five financial values. The column for the currently selected financial measure is always shown first in the data columns.
- **Right:** A pie chart showing how the selected financial measure is spread across all groups. Groups with a zero value for the selected measure are excluded from the chart.
- Both table and chart update when the dropdowns are changed

## 5. Filters & Controls
Three dropdowns work together to control what is shown:

- **First dropdown — Group By:** How to group the assets. Options: Class, Building, Room, Asset Account, Accumulated Depreciation Account, Expense Account. Changing this also resets the second dropdown.
- **Second dropdown — Specific Group:** Which group within the selected grouping to display in the table. The options here change based on what was selected in the first dropdown. Items not assigned to a group appear as "not assigned".
- **Third dropdown — Financial Measure:** Which of the five financial figures to highlight in both the chart and as the first column in the table. Options: Capitalized Value, Cost, Depreciable Value, Accumulated Depreciation, Net Value.
- All three selections are saved per user and remembered across sessions
- **Refresh** — reloads the data

## 6. How It Connects to Other Parts of the Dashboard
- Changing any of the three dropdowns updates both the table and the pie chart
- The pie chart always shows all groups; the table shows only the selected group
- No drill-down or navigation away observed — the widget is view-only
- Hovering over a pie segment shows the value for that group

## 7. Open Questions
- What are the exact database tables used for fixed asset records?

