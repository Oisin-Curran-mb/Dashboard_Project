# Remittance Pledges (W04) — Legacy Behaviour + Data-Source Pass

_Findings addendum to `04 - Remittance Pledges.md`, written 2026-08-08 from a direct read of the MBAccounting code. Two parts: (1) exactly how the old widget worked on the old UI, and (2) a data-source pass that found a table the current spec is missing._

## Part 1 — How the old system worked (legacy UI)

**The control:** `RMPledges : DataPanelControl` at `Shelby.Web.Financials/DataPanelControls/RMPledges.ascx(.cs)`, access URI `/Remittance`, titled "Remittance Pledges". Table only, no chart.

**Chrome and controls:**
- A single filter: **Date Receipts Thru** (`dateReceiptsThru`), defaulting to today.
- A **Refresh** button (`AllowRefresh = true`).
- A header note: **"Percent of year completed X%."** (see the formula wrinkle below).
- A **file-backed cache** (`RMWidgetRecord`) holding the activities and the chosen date; it is reloaded when the cached `CompanyID` differs from the current context (so switching company forces a reload). Refresh deletes the cached record and reloads.

**The grid columns** (`gridPledges`, Telerik, sorting off, no multi-select), in order:
`Seq.` · `Activity` · `Annual` · `YTD Expected` · `YTD Paid` · `Outstanding` · `% Paid`.

> **[CORRECTIONS — 2026-09-14]** Two of the three calculation lines below are wrong, and both
> errors were inherited from the Step 1 doc. Originals kept underneath, unedited.
>
> - **No `Active` filter exists.** The line below says Annual counts "only for rows whose parent
>   `RM_Pledge.Active = true`". `GetWidgetData` applies **no `Active` check** — the term test is the
>   only pledge-side filter. Confirmed in live data 2026-09-14: a pledge with `Active` unticked still
>   appears in the widget. The v2 API spec in this folder states this correctly.
> - **YTD Paid is not "per activity".** It is summed by walking `RM_PledgeDetail → RMHistoryDetails`,
>   so it counts **only pledge-linked receipts**. "Nonpledge details" (`PledgeDetailID IS NULL`),
>   which the reports treat as a first-class named case, are **excluded** — so this figure is less
>   than what the activity actually received. The v2 spec's `paid` formula carries the same wording
>   and cites `RMActivityRepository.cs:83` for it, but that line goes through the detail table; if
>   the new contract intends to include nonpledge receipts, that is a **change in definition**, not
>   the legacy behaviour, and should be marked as one.
> - The `YTD Expected` line below is **correct** and already flags the month/12 versus day/365
>   split. Verified live at 1 Sep 2019: header 66.85%, column 75%.

**The calculations** (from `RMActivityRepository.GetWidgetData(dateReceiptsThru)` and the `RMWidgetActivityRecord` POCO):
- **Annual (pledged)** = `SUM(RM_PledgeDetail.Pledge)` grouped by activity, only for rows whose parent `RM_Pledge.Active = true` and whose pledge term brackets the date (`RM_Pledge.BeginDate <= ReceiptsThru <= RM_Pledge.EndDate`).
- **YTD Paid** = `SUM(RM_HistoryDetail.Amount)` per activity, counting a receipt only if `RM_HistoryBatch.Posted = true` AND `RM_History.VoidJournalID IS NULL` AND `RM_History.CheckDate <= ReceiptsThru`.
- **Outstanding** = `Annual − YTD Paid`.
- **% Paid** = `YTD Paid / Annual` (null when Annual is 0).
- **YTD Expected** = **`ROUND((Annual / 12) * ReceiptsThru.Month, 2)`** — i.e. Annual × (month-number / 12). This is a whole-month step, not a day proportion.

**Important legacy wrinkle (two different "expected" numbers):** the grid's **YTD Expected uses month/12**, but the header note's "percent of year completed" uses a **day-of-year** proportion: `((ReceiptsThru − Jan 1).Days + 1) / 365`. So the two figures on the same screen are computed on different bases and do not agree. Both are also **calendar-year** based (Jan 1 anchor, /12 or /365), which is the root of the two pacing bugs already flagged for this widget: they ignore each pledge's own term (`BeginDate`/`EndDate`) entirely.

## Part 2 — Data-source pass (and the missed table)

Tables the widget actually touches, confirmed in code:

| Table | Role in the widget | Where |
|---|---|---|
| `RM_Activity` | The activity rows (Seq, Name), scoped by `CompanyID` | `RMActivityRepository.GetWidgetData` |
| `RM_Pledge` | Parent pledge: `Active`, `BeginDate`, `EndDate` (term/active filter) | joined in `GetWidgetData` |
| `RM_PledgeDetail` | `Pledge` amount per activity -> **Annual** | `GetWidgetData` |
| `RM_History` | Receipt header: `CheckDate` (Date), `CheckNumber` (Reference), `Amount`, `VoidJournalID`, `Note`, `ChurchID` | payment sum + drill-down |
| `RM_HistoryDetail` | `Amount` applied to an activity (`ActivityID`) -> **YTD Paid** and the per-payment breakup | `GetWidgetData`, `RMHistoryDetailRepository.GetAllForInquiry` |
| `RM_HistoryBatch` | `Posted`, `Online`, `CompanyID` (which receipts count / their status) | payment sum |
| `RM_Church` | Donor/church (`PersonID`) — used to scope the payment inquiry | `GetAllForInquiry` |

### The table being missed: `RM_PledgePercent`
There is a table the dashboard widget **does not use at all** but which is the real source for a correct "expected by now" figure:

- **`RM_PledgePercent`** — columns `PledgePercentID`, `ActivityID`, `CompanyID`, **`Percent`**, **`StartDate`**. Multiple rows per activity: a **percent-by-date schedule** (what proportion of the annual pledge is expected in by each StartDate). It is configured by the org through the admin screen **Remittance → Company Preferences → Pledge Percent Grid** (`Shelby.Web.Financials/Remittance/CompanyPreferences/PledgePercentGrid.ascx`, which edits `Percent` rows). 

This is almost certainly the "missing table" the vendor sensed: the system already stores a **configurable, stepped expected-pacing schedule per activity**, and the legacy widget ignores it in favour of the crude calendar month/12 (grid) and day/365 (header) formulas. It directly answers the open **linear-by-days vs stepped-by-payment-schedule** question in the W04 API spec — a real stepped schedule exists in the data (`RM_PledgePercent`), so "YTD Expected" could be driven by the org's own configured percentages rather than a flat calendar proportion.

### One caution — do not confuse two "percent" tables
- **`RM_PledgePercent`** (above) = the **expected-pacing schedule** (`Percent` by `StartDate`). This is the pacing source.
- **`RM_ActivityPercent`** = a **GL revenue-distribution** table (`AccountID`, `PercentDistribution`, `ProjectID`) — it splits an activity's receipts across GL accounts, nothing to do with pacing. A developer searching for "percent" could grab the wrong one.

## What this means for the spec
1. **Add `RM_PledgePercent` to the W04 data sources** (Step 1 table list currently omits it, and Step 5 doesn't mention it). It is the correct source for a scheduled "YTD Expected."
2. **The linear-vs-stepped open question is now answerable in principle:** the stepped schedule is `RM_PledgePercent.Percent` keyed by `StartDate`; Expected = `Annual × (the scheduled percent as of ReceiptsThru)`. Whether to adopt that vs the per-pledge-term linear formula is a product call, but the data is there.
3. **The activity payment drill-down** (Date / Reference / Amount / Status) comes from `RM_HistoryDetail` + `RM_History` + `RM_HistoryBatch` (see the `GetAllForInquiry` method and the SQL in the Step 5 discussion) — also not yet in the Step 5 spec.
