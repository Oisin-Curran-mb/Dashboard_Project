# 04 - Remittance Pledges - Payment History Popup Field Source Map (2026-08-08)

**Scope:** Maps every element of the "General Fund Apportionment · Payment history" popup to where its data comes from in the MBAccounting database, grounded strictly in the real code. Each element is classified as **STORED COLUMN** (maps to a real table column, possibly aggregated), **DERIVED** (computed at runtime, not stored), or **MOCK-ONLY** (shown in the popup with no backing in the schema or code). Classification is about *which column or derivation feeds each field* — not the specific illustrative numbers.

> **Note on the numbers:** All dollar values, dates, counts, and the status text shown in the popup are **mock / illustrative data**. This document maps the *source of each field*, not the exact figures. Where a mock number happens to be reproducible from real columns, that is called out; where it is not, it is flagged.

> **Important context:** The only live Remittance-Pledges widget code that exists today is `RMPledges.ascx(.cs)` backed by `RMActivityRepository.GetWidgetData(...)`, which returns **per-activity aggregate rows** (`RMWidgetActivityRecord`) rendered as a **grid** (Seq., Activity, Annual, YTD Expected, YTD Paid, Outstanding, % Paid). There is **no payment-history popup and no per-receipt list in the current code**. The popup is a new dashboard design; several of its elements have no backing query yet (see "Backend gaps").

---

## Field source mapping

| # | Element | Classification | Exact table.column(s) or formula | Evidence (file:line) |
|---|---------|----------------|----------------------------------|----------------------|
| 1 | Header activity name ("General Fund Apportionment") | **STORED COLUMN** | `RM_Activity.Name` (surfaced as `RMWidgetActivityRecord.Activity = a.Name`) | `RMActivityRepository.cs:89` (`Activity = a.Name`); `RMActivity.cs:347` (`[Column(Name="Name" ...)]`); `RMWidgetActivityRecord.cs:14` |
| 2 | "Total pledge" ($24,000) | **STORED COLUMN (aggregated)** | `SUM(RM_PledgeDetail.Pledge)` grouped by `ActivityID`, restricted to pledges where `RM_Pledge.BeginDate <= asOf <= RM_Pledge.EndDate` (property `RMWidgetActivityRecord.Annual`) | `RMActivityRepository.cs:82` (`Annual = x.Sum(pd => pd.Pledge)`); filter `RMActivityRepository.cs:77`; `RMPledgeDetail.cs:117` (`[Column(Name="Pledge" ...)]`); `RMWidgetActivityRecord.cs:15` |
| 3 | "Expected by now" ($13,912) | **DERIVED** (not stored) | Code formula: `YtdExpected = ROUND((Annual / 12) * asOf.Month, 2)` — a **month-based** proration. **The popup's $13,912 does NOT match this** (month 7 -> $14,000); the popup uses a **day/term-based** proration (see #8), which is a design figure, not the code formula. | `RMWidgetActivityRecord.cs:16` (`YtdExpected => Math.Round((Annual / 12) * DateReceiptsThru.Month, 2 ...)`) |
| 4 | "Paid to date" ($7,200) | **STORED COLUMN (aggregated, conditional)** | `SUM(RM_HistoryDetail.Amount)` WHERE `RM_HistoryBatch.Posted = 1` AND `RM_History.VoidJournalID IS NULL` AND `RM_History.CheckDate <= asOf`, for that activity's pledge details (property `RMWidgetActivityRecord.YtdPaid`) | `RMActivityRepository.cs:83` (`hd.RMHistory.RMHistoryBatch.Posted == true && hd.RMHistory.VoidJournalID == null && hd.RMHistory.CheckDate <= dateReceiptsThru).Sum(hd => hd.Amount)`); `RMHistoryDetail.cs:126`; `RMHistoryBatch.cs:247` (`Posted`); `RMHistory.cs:366` (`VoidJournalID`); `RMHistory.cs:192` (`CheckDate`); `RMWidgetActivityRecord.cs:17` |
| 5 | "Outstanding" ($16,800) | **DERIVED** (not stored) | `Outstanding = Annual - YtdPaid` (i.e. Total pledge − Paid to date). 24000 − 7200 = 16800 (reproducible). | `RMWidgetActivityRecord.cs:18` (`Outstanding => Annual - YtdPaid`) |
| 6 | "% Paid" (30%) | **DERIVED** (not stored) | `PercentPaid = YtdPaid / Annual` (null when `Annual == 0`). 7200/24000 = 30% (reproducible). | `RMWidgetActivityRecord.cs:19` (`PercentPaid => Annual == 0m ? null : YtdPaid / Annual`) |
| 7 | Status pill ("60+ days behind") | **MOCK-ONLY (no backing)** | No status/days-behind column and no code computes it. `RMWidgetActivityRecord` and `GetWidgetData` produce no status/behind-schedule value. Design-only label. | No source; absence confirmed in `RMWidgetActivityRecord.cs:10-28` and `RMActivityRepository.cs:74-95` |
| 8a | "Pledge term Jan 1, 2026 to Dec 31, 2026" | **STORED COLUMN** | `RM_Pledge.BeginDate` and `RM_Pledge.EndDate`. NOTE: currently used only as a *filter* in `GetWidgetData`; they are **not returned** in `RMWidgetActivityRecord`, so the widget endpoint does not surface them today. | `RMPledge.cs:162` (`BeginDate`); `RMPledge.cs:242` (`EndDate`); filter use `RMActivityRepository.cs:77`; not present in `RMWidgetActivityRecord.cs:10-28` |
| 8b | "Expected-to-date reflects 58% of this term elapsed" | **DERIVED (design-only, not in widget code)** | Term-elapsed fraction `(asOf - BeginDate) / (EndDate - BeginDate)`. Not computed anywhere in the widget path. The nearest real code is a **calendar-year** percentage `PercentOfYear = (days since Jan 1 + 1) / 365` (a page label, not term-based), and the month-based `YtdExpected`. The "58% of term" figure is a design construct. | `RMPledges.ascx.cs:16-17` (`PercentOfYear`); `RMWidgetActivityRecord.cs:16` (month-based expected); term columns `RMPledge.cs:162,242` |
| 9 | Narrative ("About 102 days behind schedule ($6,712 behind the expected pace)...") | **MOCK-ONLY (no backing)** | No "days behind" or "dollars behind" is stored or computed in code. The dollar figure is arithmetically Expected − Paid ($13,912 − $7,200 = $6,712), but "Expected" here is the mock day-based number (#3/#8), and no code produces days-behind. Design narrative. | No source; absence confirmed in `RMWidgetActivityRecord.cs:10-28`, `RMActivityRepository.cs:74-95` |
| 10a | Receipts table — **Date** column | **STORED COLUMN** | `RM_History.CheckDate`. (Not returned by the widget endpoint; nearest existing query `GetAllForInquiry` orders receipts by `CheckDate`.) | `RMHistory.cs:192` (`CheckDate`); `RMHistoryDetailRepository.cs:63` (`OrderBy(x => x.RMHistory.CheckDate)`) |
| 10b | Receipts table — **Reference** column | **STORED COLUMN** | `RM_History.CheckNumber` (`nvarchar(15) NULL`, free text — the inquiry filter matches on `CheckNumber`). It is a free-text field with no controlled vocabulary, so a shown value like "ACH"/"ONLINE"/a check number is simply whatever string is stored (owner's live data showed a number, "ONLINE", "test"). A label such as "ACH" is therefore a stored/mock string, not an enumerated type. (`RM_History.TransactionNumber` also exists but the code's reference/matching field is `CheckNumber`.) | `RMHistory.cs:210` (`CheckNumber ... nvarchar(15)`); inquiry match `RMHistoryDetailRepository.cs:54`; alt col `RMHistory.cs:348` (`TransactionNumber`) |
| 10c | Receipts table — **Amount** column (per receipt) | **STORED COLUMN** | `RM_HistoryDetail.Amount` (the per-activity split), **NOT** `RM_History.Amount` (the whole-check total). A single check (`RM_History`) can split across multiple activities via multiple `RM_HistoryDetail` rows, so the per-activity receipt amount is the detail amount — consistent with Paid-to-date summing `hd.Amount`. | `RMHistoryDetail.cs:126` (`Amount ... money`); whole-check total `RMHistory.cs:156` (`RM_History.Amount`); paid sum uses detail amount `RMActivityRepository.cs:83` |
| 11a | "3 receipts through Jul 31, 2026" (count) | **DERIVED** (not stored; not returned today) | `COUNT` of qualifying `RM_HistoryDetail` rows for the activity (same conditions as #4: `Posted = 1` AND `VoidJournalID IS NULL` AND `CheckDate <= asOf`). No stored count column; `GetWidgetData` only `Sum`s, it does not count, so this is not currently produced by the widget endpoint. | Conditions `RMActivityRepository.cs:83`; no count in `RMWidgetActivityRecord.cs:10-28` |
| 11b | Receipts row total ($7,200) | **DERIVED / STORED-COLUMN aggregate** | Same value as Paid to date (#4): `SUM(RM_HistoryDetail.Amount)` over the qualifying receipts. | `RMActivityRepository.cs:83`; `RMHistoryDetail.cs:126` |
| 12a | Button — "Export to Excel" | **MOCK-ONLY / UI action (no data source)** | UI control; no backing column. No export exists in the current `RMPledges.ascx`. | Absence in `RMPledges.ascx:1-48` |
| 12b | Button — "Open in Remittance" | **UI navigation action (no data value)** | Navigates to the Remittance module. The control declares `AccessUri = "/Remittance"`. No data field. | `RMPledges.ascx.cs:13` (`[DataPanelUri(... AccessUri = "/Remittance")]`) |
| 12c | Button — "Close" | **UI action (no data source)** | Dismisses the popup. No backing column. | n/a (UI-only) |

---

## Stored vs derived summary

**Truly stored (come from a real column):**
- Header activity name — `RM_Activity.Name`
- Total pledge — `SUM(RM_PledgeDetail.Pledge)` (aggregate of a stored column, term-filtered)
- Paid to date & receipts row total — `SUM(RM_HistoryDetail.Amount)` (aggregate, with Posted / not-void / CheckDate conditions)
- Pledge term dates — `RM_Pledge.BeginDate` / `RM_Pledge.EndDate` (stored, but currently only used as a filter, not surfaced by the widget)
- Receipt Date — `RM_History.CheckDate`
- Receipt Reference — `RM_History.CheckNumber` (free-text nvarchar(15))
- Receipt per-line Amount — `RM_HistoryDetail.Amount`

**Derived (computed at runtime, not stored):**
- Expected by now — code = `ROUND((Annual/12) * month, 2)` (month-based); popup shows a different day/term-based figure
- Outstanding — `Annual − YtdPaid`
- % Paid — `YtdPaid / Annual`
- "% of term elapsed" — term-fraction `(asOf − BeginDate)/(EndDate − BeginDate)` (design; code only has a calendar-year `PercentOfYear` and month-based expected)
- "3 receipts" count — `COUNT` of qualifying `RM_HistoryDetail` rows (not returned today)

**Mock-only (no backing in schema or code):**
- Status pill ("60+ days behind")
- Narrative "days behind" / "dollars behind the expected pace"
- "Export to Excel" button (UI action)
- Any specific Reference label (e.g. "ACH") beyond whatever free-text string is stored in `RM_History.CheckNumber`

---

## Backend gaps / to confirm

1. **No per-receipt data from the widget endpoint.** `GetWidgetData` returns per-activity aggregates only (`RMWidgetActivityRecord` = ActivityID, Sequence, Activity, Annual, YtdPaid + derived). The receipts table (Date / Reference / Amount / count) has **no backing query today**. `RMHistoryDetailRepository.GetAllForInquiry(...)` is the closest existing shape (returns `RM_HistoryDetail` rows joined to `RM_History`, ordered by `CheckDate`, filtered to Posted + not-void), and would need to be adapted/added, filtered by activity and `CheckDate <= asOf`, to populate the popup. (`RMActivityRepository.cs:74-95`, `RMHistoryDetailRepository.cs:48-65`)

2. **Pledge term not surfaced.** `RM_Pledge.BeginDate` / `EndDate` exist and are stored, but `RMWidgetActivityRecord` does not expose them; the popup's "Pledge term …" line requires adding them to the widget payload. (`RMPledge.cs:162,242`; `RMWidgetActivityRecord.cs:10-28`)

3. **Expected pacing has no stored schedule and two competing derivations.** The live code prorates expected linearly by *month* (`(Annual/12)*month`), while the popup prorates by *day/term-elapsed* (~58%). Neither "days behind" nor a day-based expected is stored. If a true payment schedule is required, `RM_PledgePercent` (columns `ActivityID` at RMPledgePercent.cs:80, `Percent` (`real NOT NULL`) at RMPledgePercent.cs:124, `StartDate` (`date NOT NULL`) at RMPledgePercent.cs:160) could provide a stored pacing schedule — **but `GetWidgetData` does not use it today**. Confirm which pacing definition is intended. (`RMWidgetActivityRecord.cs:16`; `RMPledges.ascx.cs:16-17`)

4. **Status pill and narrative are design-only.** "60+ days behind", "About 102 days behind schedule", and "$6,712 behind the expected pace" are not computed or stored anywhere in the widget code and depend on decisions in #3. They must be defined server-side before they can be non-mock. (absence in `RMWidgetActivityRecord.cs`, `RMActivityRepository.cs`)

5. **Reference field is free text.** `RM_History.CheckNumber` is `nvarchar(15)` with no controlled vocabulary; values like "ONLINE"/"test"/a number are all legal. A displayed "ACH" would be either a literal stored `CheckNumber` string or a mock label — there is no enum to validate against. Confirm whether the popup should show `CheckNumber` verbatim or a normalized payment-method label (which does not exist as a column). (`RMHistory.cs:210`)

6. **"Total pledge" depends on term-overlap filtering.** `Annual` sums `RM_PledgeDetail.Pledge` only for pledges whose `BeginDate <= asOf <= EndDate`. Confirm the popup's "Total pledge" uses the same as-of/overlap rule (it will change if the pledge term does not straddle the as-of date). (`RMActivityRepository.cs:77,82`)
