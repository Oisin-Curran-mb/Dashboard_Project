# Dashboard Widgets — Data & Build Readiness (Developer Punch List)

> **Purpose of this doc:** for each of the 14 locked widget designs (`Step 4 - Widget Final Design/`), list every filter/field/view the design needs, and mark whether the underlying data actually supports it today. Cross-referenced against the verified data sources and formulas in `Step 1 - Dashboard Research/` and the known Legacy-vs-Modern-API gaps found while comparing the two codebases.
>
> **Deliberately not pre-trimmed.** Per direction: list everything the design calls for, including items that aren't buildable today — the goal is a complete picture for developers to react to, not a scoped-down list. Refinement happens after this is reviewed, not before.
>
> **Next step:** once this is groomed and reviewed, it gets converted into an Excel tracker for delivery.
>
> **Out of scope:** W08 (My Status, still deferred) and W14 (Main Content Tasks, no longer deferred — being actively worked on at Step 3, but no Step 4 final design exists yet to check against).

## Status Legend
| Status | Meaning |
|---|---|
| ✅ Available | Confirmed real table/field/formula exists and matches what the design needs |
| 🟡 Needs new query/logic | The underlying data exists, but the exact aggregation, filter, or endpoint the design calls for hasn't been built yet |
| 🔴 Missing / unconfirmed | No confirmed data support found — either genuinely absent, or needs backend confirmation before assuming it exists |

## Executive Summary — Highest-Risk Items
Four widgets carry gaps serious enough to affect their core purpose, not just a nice-to-have filter:

- **W09 Payroll Scheduled Time Off** — the approve/reject action (the entire reason this widget exists) is not implemented in the Modern API at all, and the department-authorization filter would leak all-company data to any supervisor if built today.
- **W10 Loans With Balance Due** — ✅ *Decided:* rebuild the legacy oldest-first payment allocation server-side (confirmed as matching real industry standard, not a legacy-only quirk). No longer an open question — a scoped, must-fix item for dev.
- **W11 Fixed Asset Values** — 3 of the 6 Group By options (Asset Account, Accumulated Depreciation Account, Expense Account) return an empty list in the Modern API today. Half the widget's core filter doesn't work.
- **W15 Bank Balances** — Single Account mode (the 7-row activity breakdown + bar chart, arguably the more valuable of the widget's two modes) isn't implemented in the Modern API at all; only a summary balance is available.

Everything else below is either fully available or needs new query logic rather than new data capture — the good news is that almost nothing on this list requires a new table or a new field to be added to the database; most gaps are "hasn't been built yet," not "can't be built."

---

## W01 — Budget Compared to Actual
| Requirement | Status | Notes |
|---|---|---|
| Account Type filter (Income/Expense/Custom Report) | ✅ Available | `GLAccount` StatementType + `ReportHelpers.SpecialReportAccounts` |
| Special Report Title (dependent field, shown when Account Type = Custom Report) | 🟡 Needs new query/logic | Restored from the legacy design — missed in the original consolidation pass. Customer-created elsewhere (Special Reports module); `ReportHelpers.SpecialReportAccounts` above suggests the backing table already exists, but the endpoint to list a customer's saved report titles for this widget's dropdown isn't confirmed built. |
| Line Description (dependent field, shown when Account Type = Custom Report) | 🟡 Needs new query/logic | Closed (2026-07-21) as the same mechanism as Special Report Title — stronger evidence found against `Widget_Comparison_Classic.html` suggests it actually maps to the already-built Special Report Line endpoint (`GL_SpecialReportLine`/`special-report-lines`) rather than needing new backend work. See the Step 5 API spec's Correction note. Mock option list only for now. |
| Fiscal Year filter | ✅ Available | `GLYear`/`GLPeriod` structure |
| Period View — Monthly | ✅ Available | Native period grain |
| Period View — Quarterly | 🟡 Needs new query | Requires grouping periods into 3-period buckets; not natively stored as quarters |
| Period View — Weekly (Large/Expanded) | 🔴 Missing | GL data is period-based; no confirmed weekly transaction grain. **Decided: keep in the design anyway, pending developer feasibility confirmation** — not dropped. |
| Variance Bar / Data Table views | ✅ Available | All derive from the same confirmed Actual/Budget/Variance formula |
| Waterfall view | ➖ N/A — cut from the design (2026-07-21) | Was designed/coded but never wired into the live Switch Chart Type menu; formally cut ("not enough time to consider more," not a quality rejection). Not a build item anymore. |
| KPI header strip (YTD Budget/Actual/Variance/%Used) | ✅ Available | Straightforward aggregation of already-confirmed fields |
| Drill-through to GL | ➖ N/A — decided cut (2026-07-21) | No target page/URL exists; decided this won't be built, not merely pending confirmation. |
| Consolidated/master company rollup | 🔴 **Decided — must-fix before launch** | Modern API currently returns an empty list for master companies (CompanyNumber=0). This was real legacy behaviour, not a nice-to-have — **reinstate it**, don't accept the regression. |

## W02 — Pension Plans
| Requirement | Status | Notes |
|---|---|---|
| Church District filter | ✅ Available | `PB_ControlTable WHERE Type=District` |
| Plan Type filter (Defined Benefit/Contribution/403(b)) | ✅ **Resolved — confirmed correct** | Plan-type names are user-configurable elsewhere in the system, the same pattern as account types/leave types on other widgets. Dynamic list, not a fixed enum — matches the design as-is. |
| Fiscal Year filter | 🔴 **Decided — removed** | Confirmed formula is a point-in-time "active as of today" snapshot with no year dimension. Dropped from the design rather than building new date-scoping logic to support it. |
| Grouped Bar / Donut / Table views | ✅ Available | Same underlying data |
| KPI — Total Annual Contribution | ✅ Available | |
| Drill-through to Pension Billing | 🔴 Missing | No target URL confirmed |
| Appointee drill-down "Charge" field | 🔴 Known gap | Returns empty string in Modern API today |

## W03 — Payroll Distributions
**Note (2026-07-16):** this widget reports payroll already *paid* within a period — an after-the-fact check, not an outstanding/owed amount. Doesn't change anything below, just context for anyone reading "Pay Date"/period rows as if they were a receivable.

| Requirement | Status | Notes |
|---|---|---|
| Pay Period (Weekly/Bi-Weekly/Monthly/Custom, anchored on Pay Date) | ✅ Available | Straightforward `CheckDate` range; updated 2026-07-13 from the original rolling-7/30-day design — still just a `CheckDate` range under the hood |
| Recurring flag + per-department Pay Period | 🟡 UI only, no backend concept | Stored/displayed in the mockup (2026-07-15); no scheduling/recurrence logic exists behind it yet — needs real scheduling design, not just a flag |
| Department filter | 🔴 Missing/unconfirmed | No department field confirmed on `PRHistory`/`PRHistoryCompensation` |
| Horizontal Bars / Donut / Table / Pie views | ✅ Available | |
| Period Comparison (current vs. prior) | 🟡 Needs new query | Same aggregation run twice + delta calc — no new data, just doubled query logic |
| KPI — Total Payroll Amount | ✅ Available | |
| Drill-through to Payroll History | 🔴 Missing | New feature, no target page confirmed |
| Pay-type breakdown when drilled into a department (Regular/Vacation/OverTime/Sick/Double Time/Personal/Holiday/Misc/Other) | 🔴 Missing/unconfirmed | Changed 2026-07-16 from the old Net Pay/Fed Tax/Benefits/State Tax/Retirement/Overtime breakdown, per direct instruction — that was a paycheck-stub view, not a pay-group breakdown. The Purpose doc's confirmed formula groups by `CompensationDistributionID/Name`, not by pay type — this likely needs a different field/table (an earnings/pay-type code) that hasn't been identified yet. Should be linkable since pay groups already tie to compensation records, but needs a developer to dig into the schema before this can be built for real. |

## W04 — Remittance Pledges
| Requirement | Status | Notes |
|---|---|---|
| Date Range (Current Month/Last Month/Custom) | 🟡 Needs a decision | Two unresolved questions block this: (1) rolling vs. calendar-month interpretation, (2) whether % Paid/YTD Expected re-baseline per period or always use the full fiscal year |
| Activity Type filter | ✅ Available | `RM_Activity` |
| Fiscal Year filter | 🔴 **Decided — removed** | Old design has no fiscal-year dimension for this widget at all — dropped from the design, same resolution as W02 and W10 |
| Progress Bars / Paired Bars / Table views | ✅ Available | |
| KPI — overall % Paid | ✅ Available | |
| Drill-through to Remittance module | 🔴 Missing | New feature, no target confirmed |

## W05 — Receivable Invoices Outstanding
| Requirement | Status | Notes |
|---|---|---|
| Age Band / Revenue Center / Source filters | ✅ Available | All three confirmed real and dynamic |
| KPI Tiles + Aging Bars / Aging Table views | ✅ Available | |
| KPI — Total Outstanding | ✅ Available | |
| In-page detail panel — Bill-To name | ✅ **Decided — resolved via drill-through** | `BillToDisplay` always empty in Modern API. Instead of waiting on a fix, added a "View full invoice" link out to the real AR invoice record for this field specifically. |
| In-page detail panel — Attachments/Note/Payments tabs | ✅ **Decided — resolved via drill-through** | Data sources for these sub-tabs weren't verified — same "View full invoice" link covers them instead of building new endpoints to reproduce this data in-widget. |

## W06 — Insurance Billing Plans
| Requirement | Status | Notes |
|---|---|---|
| Plan Type filter | ✅ Available | |
| Horizontal Bar / Donut / Table views | ✅ Available | |
| KPI — Total Enrollment | ✅ Available | |
| **Everything on this widget is fully available.** | ✅ | Lowest-risk widget on this list — worth prioritising as an early/quick build. |

## W07 — Deposit Accounts
| Requirement | Status | Notes |
|---|---|---|
| Account Type filter | ✅ Available | |
| Balance Table + Pie view | ✅ Available | |
| KPI — Total Balance | ✅ Available | |
| Compare To filter (Last Month/Quarter/LY) | 🟡 Needs new query | Same `DH_Transaction` formula, different as-of-date cutoff — confirmed feasible, not yet built |
| Balance Trend view (12-month line chart) | 🟡 Needs new query | Requires a new monthly-snapshot query (grouped cumulative sums); also need to confirm how far back `DH_Transaction` history actually goes per organisation — a short history would make the trend incomplete |
| Declining-account flag | 🟡 Needs new logic | Derived from the Trend data above, no new data needed |
| Balance calculation match vs. legacy | 🟡 Needs verification | Legacy's `CalcBalance()` may apply adjustments beyond the Modern API's plain transaction sum — verify totals tie out |

## W09 — Payroll Scheduled Time Off ⚠️ highest-risk widget
| Requirement | Status | Notes |
|---|---|---|
| Calendar Year / View / Leave Type / Department filters | ✅ Available | |
| Leave Calendar view | ✅ Available | Read-only rendering of confirmed data |
| **Confirmation Dashboard view — inline approve/reject** | 🔴 **Major gap** | Not implemented in the Modern API at all. This is the widget's whole reason for existing per its Purpose statement. |
| Approval-authority scoping | 🔴 **Major gap** | Modern API returns all company schedules, not filtered to the logged-in supervisor's authorised departments — a real data-exposure issue, not just a missing convenience |
| Custom column labels (Vacation/Sick/etc., renamable per org) | 🔴 Missing | Modern API returns static labels; `PRCompany` custom names not implemented |
| KPI — Pending Approvals + Out today/this week | 🟡 Needs new query | Derivable from `PR_EmployeeOffSchedule`, no confirmed existing endpoint |

## W10 — Loans With Balance Due ⚠️ high-risk widget
| Requirement | Status | Notes |
|---|---|---|
| Loan Type filter | ✅ Available | |
| Status filter (Active/In Arrears) | 🔴 Missing/unconfirmed | No explicit field — today's "arrears" concept is only derived from aging buckets, which have their own gap below |
| Balance Bars / Summary Table views | ✅ Available | Basic balance data only |
| **Aging buckets (Current/30-59/60-89/90+)** | 🔴 **Decided — must-fix before launch** | Modern API does not replicate the legacy oldest-first payment allocation. Confirmed via research this isn't a legacy quirk — oldest-first is the actual industry standard for both AR and loan-servicing payment application, so the Modern API's current bucketing is the one that's non-standard. **Decision: rebuild this calculation server-side to match legacy; keep everything else already confirmed available (filters API, grid/chart endpoints, KPI) as-is.** Affects any feature built on top of aging, including the Status filter and "In Arrears" badges. |
| KPI — Total Balance Due | ✅ Available | Unaffected by the aging gap above |
| Drill-through (existing account-name links) | 🔴 Missing | Destination unconfirmed |

## W11 — Fixed Asset Values ⚠️ high-risk widget
| Requirement | Status | Notes |
|---|---|---|
| Group By — Class / Building / Room | ✅ Available | |
| **Group By — Asset Account / Accumulated Depreciation Account / Expense Account** | 🔴 **Major gap** | Confirmed unimplemented — Modern API returns an empty list for these 3 of 6 Group By options |
| Specific Group cascading dropdown | 🟡 Depends on Group By | Works for Class/Building/Room, broken for the other 3 |
| Financial Measure (5 measures), all 3 views | ✅ Available | For the working Group By dimensions |
| KPI — Total Net Value | ✅ Available | |
| Data Table Sort by Tag # | 🟡 Not confirmed | Proposed default, not verified against old design |

## W13 — Purchasing Management
| Requirement | Status | Notes |
|---|---|---|
| PO Status filter | ✅ **Decided — use real stage names** | Design now uses the confirmed real filter set (Awaiting my approval next / Awaiting my approval / Unapproved / Approved), global across all views, replacing the earlier invented All/Pending Approval/Approved/Overdue set |
| PO Status filter — "Awaiting my approval next" logic | 🟡 Partially available | Sequence-based logic is only approximately reimplemented in the Modern API — re-verify before relying on it |
| Department filter | 🔴 **Decided — Table view only, still unconfirmed** | Scoped down to the Table view (doesn't suit Kanban/Donut); still needs backend confirmation the field exists |
| Year filter | 🔴 **Decided — Table view only, still unconfirmed** | Kept specifically for looking up old purchases in the table; not a global filter; still needs backend confirmation |
| "Overdue" flag | 🔴 **Decided — Table view only, still unconfirmed** | Doesn't map to a Kanban column since it isn't a real approval stage; kept as a table filter/highlight only; still needs a confirmed field to filter on |
| Kanban / Donut / Table views | ✅ Available | Using the confirmed real status set |
| KPI — multi-status bar + cards | ✅ Available | |
| Drill-through (existing PO edit link) | ✅ Available | Already confirmed working |
| Data Table Sort by Date Issued | 🟡 Not confirmed | Proposed default only |

## W15 — Bank Balances ⚠️ high-risk widget
| Requirement | Status | Notes |
|---|---|---|
| Account filter | ✅ Available | |
| All Accounts — Table / Bar / Cards views | ✅ Available | |
| KPI — Total Balance | ✅ Available | |
| **Single Account mode — 7-row breakdown + bar chart** | 🔴 **Major gap** | Modern API returns only a summary balance for a single account — the detailed breakdown and activity-type bar chart aren't implemented at all. This is arguably the more valuable of the widget's two modes per its Purpose statement. |
| Reconciliation status display | 🔴 Open question | Not decided whether this becomes a real visible field — raised for experts/dev, not resolved |

## W16 — Accounts Payable By Due Date
| Requirement | Status | Notes |
|---|---|---|
| Due Date / Vendor filters | ✅ Available | |
| Due Date Cards / Aging Donut / AP Table views | ✅ Available | |
| KPI — Total AP Outstanding | ✅ Available | |
| Drill-through | 🔴 Missing | Pending expert/dev confirmation, no target yet |
| Module access enforcement | 🔴 Security gap | Any authenticated user can call this endpoint regardless of AP module license — not a functionality gap, but worth flagging alongside the others |

## W17 — Gifts Pledges
| Requirement | Status | Notes |
|---|---|---|
| Campaign filter | ✅ Available | Using Pledge Purpose as the underlying grouping |
| Date Range filter (Current Month/YTD/Campaign Total) | 🟡 Needs a decision | Same kind of unresolved re-baselining question as W04 |
| Campaign Progress Bars / Donut / Table views | ✅ / 🟡 mixed | Pledge Total & Received are available; Due Remaining & % Due depend on the unresolved math below |
| **Pledge Due / Due Remaining / % Due fields** | 🔴 Gap | Confirmed **not returned by the Modern API endpoint at all today** — currently computed client-side only, not server-side |
| KPI — overall % Due | 🟡 Depends on above | Blocked on the same unresolved Pledge Due math |

---

## What's Next
This list is deliberately unscoped — everything the locked designs ask for is here, whether or not it's buildable today. Suggested next steps once you've reviewed it:
1. Decide which 🔴 items are must-fix-before-launch vs. ship-without-and-revisit (the Executive Summary's four widgets are the strongest candidates for "must-fix").
2. Get backend confirmation on the "unconfirmed" items (Department fields, plan types, PO status set) — several of these might turn out to already exist under a different name.
3. Once grooming is done, this converts into the Excel tracker for delivery.
