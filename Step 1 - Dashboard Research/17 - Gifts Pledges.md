# Purpose Document: Gifts Pledges

> This is a **Purpose document** — Step 1 in the dashboard project lifecycle. Its job is to capture what currently exists, so that Feedback, Design, and Development can be based on documented reality rather than assumptions. It is written for all readers, not just technical ones.

**Date:** 2026-07-06
**Investigated by:** Oisin / Claude
**Module / Area of the system:** Donors and Gifts

---

## 1. Purpose
To show how gift pledges are tracking against what has been received, for each pledge purpose. By selecting a date, users can see how much had been received up to that point — making it useful for reporting on pledge progress at any given moment in time.

## 2. Where the Data Comes From
This widget pulls from the Donors and Gifts module. The "Date Gifts Thru" date controls which gifts are counted — only gifts received on or before the selected date are included in the figures. The selected date is saved and remembered when the page is refreshed.

**Database tables used:**

| Table Name | What it holds |
|---|---|
| GF_Purpose | Pledge purpose records, scoped by company and Active status — corrects the earlier single-table "GFPledge" listing, confirmed via Classic Widget Comparison |
| GF_Pledge | Annual pledge amount per purpose (only rows where the pledge itself is Active count) |
| GF_History / GF_HistoryDetail | Payment (gift) history — a gift counts only if it's posted (`JournalID != null`), not voided (`UnDoJournalID = null`), and its gift date is on or before the selected "Gifts Thru" date |

**Confirmed correct** against the legacy `GiftsPledges : DataPanelControl` class (`/DonorsAndGifts`) — verified via `Widget_Comparison_Classic.html`, 2026-07-08. Note the terminology mapping already flagged in the companion `Widget_Specs/W17` doc: legacy's "Pledge Purpose" = the UI's "Campaign."

**Formulas / calculation logic (from Classic Widget Comparison):**
- **Purpose list:** `GF_Purpose WHERE CompanyID = ctx AND Active = true`
- **Pledge Total** = `SUM(GF_Pledge.AnnualAmount) WHERE PurposeID = purpose AND Active = true`
- **Received** = `SUM(GF_HistoryDetail.Amount) WHERE PurposeID = purpose`, for history rows where `JournalID != null AND UnDoJournalID = null AND GiftDate <= DateGiftsThru`
- **Pledge Due, Due Remaining, and Percent Due are NOT returned by either the legacy repository or the Modern API endpoint** — the Modern API's data endpoint only returns `{PurposeId, PurposeName, Pledged, Received}`. This means Pledge Due (time-prorated) and the two figures derived from it are computed **client-side**, not server-side — an important detail for the rebuild, and directly relevant to the open date-range/schedule-aware-math question already flagged in the `Widget_Specs/W17` doc.

## 3. What It's Telling Us
A table showing each pledge purpose with five financial columns:

- **Pledge Total** — the full amount pledged for this purpose
- **Pledge Due** — the amount that should have been received by the selected date
- **Received** — the amount actually received up to the selected date
- **Due Remaining** — the gap between what was due and what was received (can be negative if more has been received than was due by that date)
- **Percent Due** — the percentage of the pledge amount still outstanding

A totals row at the bottom sums the first four columns across all purposes.

## 4. How It's Displayed
- **Table only** — no chart
- One row per pledge purpose, with a totals row at the bottom

## 5. Filters & Controls
- **Date Gifts Thru** — a date picker that controls which gifts are counted. Defaults to today. The selected date is remembered when the page is refreshed — it does not reset.
- **Refresh** — clears the cached data and reloads with the currently selected date

## 6. How It Connects to Other Parts of the Dashboard
- No drill-down or navigation away from the dashboard observed
- No interactions with other widgets

## 7. Open Questions
- Similar to Remittance Pledges, the date defaults to today — but unlike Remittance Pledges, the date persists on refresh. Worth confirming whether this is intentional and consistent behaviour across the two widgets.

