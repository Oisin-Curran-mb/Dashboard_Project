# Pending Questions - Codebase Findings

Date: 2026-07-30
Codebase: `C:\Users\ocurran\source\repos\MBAccounting`
Method: read-only trace of the legacy web layer (`Shelby.Web.Financials\DataPanelControls`, drill-down controls, `Shelby.Web.UI\DataPanelControl.cs`), the repository layer (`Shelby.Repository\EntityRepositories\*`), and generated entity classes (`Shelby.Data\EntityClasses\*`, `Shelby.Data\EntityClassExtensions\*`).

## Top summary

- **Questions with a concrete code answer: 21 of 21** (every numbered question is answered from legacy + repository + entity code).
- **Genuinely left open:** the explicit SME/product decisions listed at the bottom, plus a handful of *modern-side* sub-parts that cannot be verified because **the modern .NET Core REST API / React frontend is NOT present in this repo** (see note below), and the exact *semantic* of `RM_Pledge.Frequency`/`Duration` (fields exist; meaning is not documented in code).
- **Answers that would CHANGE / correct a spec** are flagged **[CHANGES SPEC]**. Answers that merely **confirm** an existing claim are flagged **[CONFIRMS]**.

### Important scope note - modern API not in this repo
I searched for `[ApiController]`, and for the widget keys (`pension-plans`, `ap-ar-aging`, `budget-vs-actual`, `receivable-invoices`, `payroll-distributions`) across `Shelby.APIWrapper`, `Shelby.Web.Financials`, `Shelby.Wire`, `Shelby.Web.UI`, `Shelby.Agents`, `Shelby.Client`. **No `[ApiController]` class, no widget-key string, no React/`package.json` frontend was found.** The legacy widgets live in `Shelby.Web.Financials\DataPanelControls\*.ascx.cs` (WebForms `DataPanelControl` user controls). All findings below are therefore from the **legacy + repository + entity** layers. Wherever a question asks "is the modern API missing X", I confirm what the **legacy/data layer** does have (so the data is available) but mark the modern-specific claim as not verifiable here.

---

## W01 - Budget Compared to Actual
File: `Shelby.Web.Financials\DataPanelControls\BudgetComparedToActual.ascx.cs`

**1. Master-company (CompanyNumber=0) rollup via MasterAccountID?**
FOUND. `LoadRecords()` lines 399-402:
```
if (ShelbyContext.Current.Company != null && ShelbyContext.Current.Company.CompanyNumber == 0)
    query = query.Join(accountRepository.GetAll(), masterAccount => masterAccount.AccountID,
        linkedAccounts => linkedAccounts.MasterAccountID, (masterAccountID, linkedAccounts) => linkedAccounts);
```
Legacy DOES roll up child accounts via `MasterAccountID` when the current company is the master (CompanyNumber == 0). **[CONFIRMS]** the consolidation logic exists. Whether the modern side omits it cannot be verified (modern API not in repo).

**2. GLSummary period-grain only? Any daily/transaction table with real dates?**
FOUND. Legacy actuals come from `GLSummaryRepository` joined and grouped by `GLPeriod.Period` (lines 404-411) - period grain. But a transaction-level table exists: `Shelby.Data\EntityClasses\GLJournalDetail.cs` has `DetailDate` (line 136, `date NOT NULL`) and `Amount` (line 118, `money`). So **day/week actuals are technically possible via `GLJournalDetail.DetailDate`**, not via `GLSummary`. **[CHANGES SPEC]** - contradicts any assumption that only period-grain GL data exists.

**3. GLBudgetDetail + RevisionStartingPeriodID; cross-FY budget fetch?**
FOUND. Lines 412-421 join `GLBudgetDetail` and filter `.Where(x => x.GLBudget.RevisionStartingPeriodID == null)` = original (un-revised) budget only. Budget is scoped to a single fiscal year via `new GLYearRepository().GetByCurrentContext()` (line 387). **No code fetches budget across two fiscal years.** **[CONFIRMS]** original-budget filter; single-FY only.

**4. GLPeriod / GLYear per-company (non-July-June orgs)?**
FOUND. `GLYear.cs` has `CompanyID` (line 341) and `BeginDate` (line 283); `GLPeriod.cs` links via `YearID` (line 369) and has `Period` (smallint). `GLPeriodRepository.GetAllByCurrentContext()` (line 39) orders by `GLYear.BeginDate`. Fiscal calendars are per-company (each company's `GLYear.BeginDate` sets its own year start). **[CONFIRMS]** non-July-June orgs are supported by the schema.

**5. GLSpecialReport titles + GL_SpecialReportLine shape / endpoint?**
FOUND. `GLSpecialReport.cs`: `SpecialReportID` (PK), `Name`, `CompanyID`, `Note`, `Password`, `SecurityLevel`. `GLSpecialReportLine.cs`: `SpecialReportLineID` (PK), `SpecialReportID`, `LineNumber`, `Name`, `ReverseSign`. Repos `GLSpecialReportRepository` + `GLSpecialReportLineRepository` exist and are used (widget lines 58, 246, 256). **[CONFIRMS]** the shape. No modern `special-report-lines` endpoint found (modern API not in repo).

---

## W02 - Pension Plans
File: `Shelby.Web.Financials\DataPanelControls\PensionPlans.ascx.cs`; repo `Shelby.Repository\EntityRepositories\PB\`

**6. All-districts when districtId omitted?**
FOUND. `gridPlans_NeedDataSource` lines 116-121 and `Details` lines 60-63 apply the district filter **only** when a district is chosen:
```
var districtID = ddlDistricts.SelectedValue.ToGuid();
if (districtID != Guid.Empty)
    records = records.Where(x => x.Details.Any(y => y.DistrictID == districtID)).ToList();
```
Omitting the district (Guid.Empty = "All Districts", added at line 256) returns all districts aggregated. **[CONFIRMS]** - the WHERE DistrictID clause is conditional, not always required.

**7. Charge empty-string - is the join missing?**
FOUND (legacy populates it). `LoadRecords()` line 279:
```
Charge = x.PBAppointment.PBCharge.CorePerson.DisplayNameLastFirst,
```
The legacy join `PBAppointment -> PBCharge -> CorePerson` exists and fills `Charge`. So the church/org name **is** available in the data layer. If the modern API returns empty, that is a modern-side omission (the join/data exists); the modern code itself is not in this repo to confirm. **[CHANGES SPEC]** for the "join is missing" framing - the legacy join is present.

**8. Entitlement gate + unentitled behaviour?**
FOUND. Widget attribute (line 17): `[DataPanelUri(... AccessUri = "/PensionBilling")]`. Gate is enforced in `Shelby.Web.UI\DataPanelControl.cs`:
- lines 154-165: if `!ShelbyContext.Current.Allowed("/PensionBilling", SecurityAccessType.Inquiry)` the widget hides every control after `pnlHeader` (body/chart hidden).
- lines 185-192 (`GetDataPanelControls`): the widget is only offered in the picker when the user is Allowed.
Gate is **`/PensionBilling` Inquiry, NOT a right called "PensionBenefits"**. Unentitled user: widget not listed, and if present its body renders hidden. **[CHANGES SPEC]** if the spec named the right "PensionBenefits".

---

## W03 - Payroll Distributions
File: `Shelby.Web.Financials\DataPanelControls\PayrollDistributions.ascx.cs`

**9. Org-configurable pay-type labels (SubType 6-9)?**
FOUND. Custom labels are stored on **`PRCompany`** (`Shelby.Data\EntityClasses\PRCompany.cs`): `VacationLongName`/`VacationShortName` (lines 1012/1030), `SickLongName`/`SickShortName` (900/918), `PersonalLongName`/`PersonalShortName` (864/882), `MiscLongName`/`MiscShortName` (676/694). They are **resolved server-side** by `PRHistoryCompensation.GetSubTypeName` / `GetSubTypeNameLong` in `Shelby.Data\EntityClassExtensions\PRHistoryCompensation.cs` (lines 8-94), reading `ShelbyContext.Current.Company.PRCompany`:
```
case 6: return company == null ? "Vac"  : company.VacationShortName;
case 7: return company == null ? "Sick" : company.SickShortName;
case 8: return company == null ? "Pers" : company.PersonalShortName;
case 9: return company == null ? "Misc" : company.MiscShortName;
```
SubType map: 6=Vacation, 7=Sick, 8=Personal, 9=Misc (fallback defaults if PRCompany null). **[CONFIRMS]** labels live in PR_Company and are resolvable server-side.
NUANCE **[CHANGES SPEC]**: the distributions **widget itself** does NOT split by SubType - `Search()` line 94 groups only by `{ historyComp.CompensationDistributionID, historyComp.PRCompensationDistribution.Name }`. The pay-type labels are used elsewhere (EarningsInquiry, PayrollProcessing), not in this widget's current query.

**10. Orphaned / unknown CompensationDistributionID - fallback name?**
FOUND (no fallback). `Search()` lines 86-101 inner-joins `PRHistoryCompensation` to `PRCompensationDistribution` and groups by `PRCompensationDistribution.Name`. A deleted distribution (null navigation) is dropped by the inner join - there is **no fallback name and no empty placeholder** in the widget. No orphan handling exists in this code.

**11. this_period meaning - fiscal period vs pay periods?**
FOUND. No PayCycle / pay-period / fiscal-period table exists in the PR entities (no `PR*Cycle`/`PR*Period` entity found). `PRHistory.cs` has only `CheckDate` (line 221, `date NULL`). The widget is purely date-range driven: it defaults `dateBeginning = Jan 1 of current year`, `dateEnding = today` (lines 27-28) and filters on `history.CheckDate` between them (lines 89-90). **Payroll has no fiscal-period concept; "this period" has no payroll meaning and would resolve to a date range (calendar YTD by default).**

---

## W04 - Remittance Pledges
File: `Shelby.Web.Financials\DataPanelControls\RMPledges.ascx.cs`; repo `Shelby.Repository\EntityRepositories\RM\RMActivityRepository.cs`

**12. Which pledges are included at a given receipts-through date?**
FOUND. `RMActivityRepository.GetWidgetData(dateReceiptsThru)` lines 76-84:
```
.Where(x => x.RMPledge.BeginDate <= dateReceiptsThru && x.RMPledge.EndDate >= dateReceiptsThru)
```
Inclusion is a **date window on BeginDate/EndDate** (Begin <= date <= End). It does **NOT** reference the `Active` flag, and it **EXCLUDES ended pledges** (EndDate < date) - so ended pledges with an outstanding balance are NOT included. `YtdPaid` is summed from `RMHistoryDetail` where `RMHistoryBatch.Posted == true && VoidJournalID == null && CheckDate <= dateReceiptsThru`. **[CHANGES SPEC]** - the real filter is `BeginDate <= date <= EndDate`, not `Active=true AND BeginDate<=date`, and it drops ended-but-unpaid pledges.

**13. Frequency / Duration on RM_Pledge?**
FOUND (fields exist). `Shelby.Data\EntityClasses\RMPledge.cs`: `Frequency` (line 260, `int NOT NULL`), `Duration` (line 224, `int NOT NULL`), plus `Active` (144, bit), `BeginDate` (162), `EndDate` (242). **[CONFIRMS]** both fields exist to support a stepped expected curve. The exact **semantic** (payments-per-year vs number-of-periods) is not documented anywhere in the entity or the widget code - NO CODE ANSWER for the meaning; fields confirmed present.

---

## W05 - Receivable Invoices Outstanding
Files: `Shelby.Web.Financials\DataPanelControls\ReceivableInvoicesOutstanding.ascx.cs`; `...\GeneralLedger\PostedJournals\DrillDownControls\ARInvoiceDetail.ascx.cs`; `...\AccountsReceivable\PaymentProcessing\Default.aspx.cs`; repos in `Shelby.Repository\EntityRepositories\AR\`

**14. Double-processing guard on payments?**
FOUND (implicit, Outstanding-based). `ARPaymentRepository.cs` auto-apply logic (lines 1054-1097): eligible invoices are filtered to `Posted && Outstanding != 0`, where Outstanding is recomputed as `TotalAmount + SalesTax - sum(non-void ARPaymentDetail.Amount+Discount+WriteOff)` (lines 1057-1082), and the applied amount is capped at the invoice's Outstanding (`amount = unappliedCash > invoice.Outstanding ? invoice.Outstanding : unappliedCash`, line 1085). This prevents over-/re-application beyond outstanding. **No explicit "invoice already has an unposted payment" lock was found** in `ProcessPayments.aspx.cs`. The guard is the `Outstanding != 0` filter + the min() cap, not a duplicate-payment flag.

**15. Permission gating payment posting?**
FOUND. `AccountsReceivable\PaymentProcessing\Default.aspx.cs` lines 341-342:
```
ShelbyContext.Current.Allowed("/AccountsReceivable/PaymentProcessing/ProcessPayments", SecurityAccessType.Update)
```
Posting is gated by the `/AccountsReceivable/PaymentProcessing/ProcessPayments` right at **Update** level. (The read-only widget itself is gated by `/AccountsReceivable` Inquiry via its `DataPanelUri`.) **[CONFIRMS]**.

**16. BillToDisplay empty - missing join?**
FOUND (empty BY DESIGN, not a missing join). `Details` getter lines 104-106:
```
BillToDisplay = x.CustomerID == x.BillToCustomerID
    ? ""
    : x.ARCustomerBillTo.CorePerson.LastFirstMiddleNames,
```
`BillToDisplay` is intentionally blank when the invoice's bill-to customer equals the customer; it is only populated when they differ. The join (`ARCustomerBillTo.CorePerson`) is present. **[CHANGES SPEC]** - it is not "the field/join is not populated"; it is deliberately empty when bill-to == customer.

**17. Attachments / Note / Payments detail sources for an invoice?**
FOUND. `ARInvoiceDetail.ascx.cs` `OnPreRender` (lines 36-70):
- Line items: `invoice.ARInvoiceDetails` (repo `ARInvoiceDetailRepository`).
- Payment history: `invoice.ARPaymentDetails.Where(Posted && VoidJournalID==null)` -> `ARPayment` fields CheckNumber/CheckDate/Amount/Discount/WriteOff (repos `ARPaymentDetailRepository`, `ARPaymentRepository`).
- Attachments: `attachment.LoadAttachments<ARInvoiceAttachment>(InvoiceID, ModuleIDs.AccountsReceivable)` (repo `ARInvoiceAttachmentRepository`).
- Note: `invoice.Note` (single field on `ARInvoice`).
**[CONFIRMS]** the backing tables/repos.

**18. Aging bands vs modern ap-ar-aging boundaries?**
FOUND (legacy). `LoadRecords()` lines 395-399 and the `AgingSelected` switch lines 78-95:
```
Amounts[0] = Age < 31            (Current)
Amounts[1] = Age 31..60
Amounts[2] = Age 61..90
Amounts[3] = Age 91..120
Amounts[4] = Age > 120           (121 & over)
```
Legacy bands = Current<31 / 31-60 / 61-90 / 91-120 / 121+, matching W05's stated bands exactly. **[CONFIRMS].** The modern `ap-ar-aging` widget/handler was **not found in this repo**, so its bucket boundaries cannot be compared directly here.

**19. Revenue Center / Source list endpoints (id + display name)?**
FOUND. `ARRevenueCenterRepository.GetAllByCurrentContextAsListItems()` (lines 78-86) returns `ListItem(Name, RevenueCenterID)` for Active revenue centers. `ARSourceRepository.GetAllAsListItems()` (lines 55-64) returns `ListItem(Name, SourceID)` with a "not assigned" item inserted at index 0. Both return id + display name. **[CONFIRMS].**

---

## Cross-cutting (factual only)

**20. Legacy in-page Excel export; no modern export endpoint?**
FOUND. Legacy widgets export Excel in-page:
- `BudgetComparedToActual.buttonExportToExcel_Click` builds an `ExcelDocument` and streams it (lines 175-231).
- `PensionPlans.buttonExportExcel_Click` and `ReceivableInvoices.buttonExportExcel_Click` call `Page.ExportToExcel(...)` (PensionPlans lines 97-101; ReceivableInvoices lines 271-274).
`buttonExportToExcel` / `buttonExportExcel` controls confirmed. **No modern export endpoint found** (modern API not in repo). Fact stated; the build-or-not decision is not code-answerable.

**21. SSUserTenantPreferenceRepository = legacy per-user preference store?**
FOUND. `BudgetComparedToActual.ascx.cs` uses `SSUserTenantPreferenceRepository.GetPreference / UpdatePreference` keyed by the `UserPreferences.WidgetBudgetComparedToActual` enum and company id (lines 99-138) to persist per-user widget settings. **[CONFIRMS]** it is the legacy per-user preference store. Whether the modern API uses it cannot be verified (modern API not in repo). Fact only.

---

## Left entirely as-is (SME / product decisions - not code-answerable)

- **W05 - payment create-vs-stage intent** - SME/product decision - left as is.
- **W07 - declining-account threshold and Last Month / Last Year compare options** - SME/product decision - left as is.
- **Decide whether to build a modern export endpoint** (see Q20) - product decision - left as is.
- **Decide whether to rebuild preference persistence in the modern API** (see Q21) - product decision - left as is.
- **RM_Pledge Frequency/Duration exact semantic** (see Q13) - NO CODE ANSWER (fields exist; meaning not documented) - left as is.
- **Modern-API-specific sub-claims** (Q1 modern rollup, Q7 modern Charge empty, Q18 modern bucket boundaries, Q20/Q21 modern usage) - NO CODE ANSWER because the modern .NET Core API / React project is not in this repository.
