/* =============================================================
 * MASTER DATA FILE — extracted mirror of the live MOCK_DATA block
 * Extracted: 2026-07-20, from Dashboard Widget Mockups.html (first inline <script>)
 * This is a MIRROR, not the source of truth — the HTML's inline block is what
 * actually renders the page. If you edit data here, it does NOT affect the
 * live mockup; you must copy the change into the HTML too (or edit the HTML
 * directly and re-extract this file). There is no automatic sync.
 * If this file and the HTML ever disagree, the HTML wins.
 * Superseded snapshots (historical only, do not edit expecting live effect):
 *   mock-data.v1.js, mock_data_new.v1.js (2026-07-07), extracted_check.v2.js (2026-07-09)
 * ============================================================= */

// =============================================================
// ★ MASTER — this is the live, authoritative data source. ★
// Files like mock-data.v1.js, mock_data_new.v1.js, and extracted_check.v2.js
// in this same folder are old, superseded snapshots — NOT loaded by this page.
// See "Mock_work/00 - INDEX.md" for the full version history.
// =============================================================
// Shelby Financials Dashboard — Mock Data (expanded)
// Edit this file to improve/add mock data for any widget.
// =============================================================
var MOCK_DATA = {};

MOCK_DATA.meta = [
  {id:1,  name:"Budget Compared to Actual",          status:"g",icon:"balance",         mod:"Finance", desc:"Compares actual vs budgeted GL amounts by fiscal period.",              note:"",
   purpose:"Shows how the organisation’s actual income or spending compares to what was budgeted across each period of the financial year. Helps users quickly see where they are ahead of or behind their financial plan — both month by month and as a running total."},
  {id:2,  name:"Pension Plans",                       status:"b",icon:"savings",          mod:"Finance", desc:"Pension contributions by plan type and church district.",               note:"",
   purpose:"Gives a clear overview of how much is being contributed annually across each pension plan type, with the ability to filter by church district. Lets users drill into individual appointees per plan."},
  {id:3,  name:"Payroll Distributions",               status:"g",icon:"payments",         mod:"Payroll", desc:"Payroll cost breakdown by category.",                                  note:"",
   purpose:"Shows a breakdown of payroll amounts by compensation type across a chosen date range. Helps users understand how total payroll spend is distributed across different pay categories such as salary, benefits, and allowances."},
  {id:4,  name:"Remittance Pledges",                  status:"b",icon:"volunteer_activism",mod:"Finance", desc:"Pledge tracking — received vs outstanding.",                     note:"Known issue: date filter resets on page refresh.",
   purpose:"Shows how well the organisation is keeping up with its remittance pledge commitments. For each activity type, users can see what was pledged, how much has been paid, what remains outstanding, and the percentage paid so far."},
  {id:5,  name:"Receivable Invoices Outstanding",     status:"r",icon:"receipt_long",     mod:"Finance", desc:"AR aging — overdue invoices by age band.",                        note:"Critical fix: pie chart replaced with correct bar chart.",
   purpose:"Shows how much money is currently owed to the organisation in unpaid invoices and how long those invoices have been outstanding. Grouping by age helps staff prioritise which outstanding amounts need attention first."},
  {id:6,  name:"Insurance Billing Plans",             status:"b",icon:"health_and_safety",mod:"HR",      desc:"Staff insurance enrolment by plan type.",                              note:"",
   purpose:"Shows how many people are enrolled in each insurance plan, with the option to filter by insurance type. Gives staff a quick overview of insurance plan uptake across the organisation."},
  {id:7,  name:"Deposit Accounts",                    status:"g",icon:"account_balance",  mod:"Finance", desc:"Bank account balances and reconciliation status.",                     note:"Known issue: filter previously only updated the table.",
   purpose:"Shows the current balances of all active deposit accounts, grouped by account type. Gives staff a snapshot of how much is held across different account categories as of today."},
  {id:8,  name:"My Status",                           status:"r",icon:"assignment_ind",   mod:"Finance", desc:"Personal task and approval queue for the logged-in user.",              note:"",
   purpose:"A personalised summary panel showing the user a count of records relevant to them across different areas of the system. Designed to surface things that need attention — unposted entries, pending approvals, and upcoming reviews."},
  {id:9,  name:"Payroll Scheduled Time Off",          status:"b",icon:"event_available",  mod:"Payroll", desc:"Upcoming staff leave.",                                                note:"",
   purpose:"Gives supervisors a view of all scheduled time-off requests across their departments, organised by department and employee. Supervisors can approve or reject requests directly from this widget without navigating elsewhere."},
  {id:10, name:"Loans With Balance Due",              status:"b",icon:"account_balance_wallet",mod:"Finance",desc:"Active loans, remaining balances, and payment schedules.",         note:"",
   purpose:"Shows all loans that currently have an outstanding balance, along with how overdue each one is. Gives staff a quick view of who owes money, when they last made a payment, and how the overall loan book is ageing."},
  {id:11, name:"Fixed Asset Values",                  status:"g",icon:"domain",           mod:"Finance", desc:"Asset register showing current value by category.",                   note:"",
   purpose:"Shows the financial values of the organisation’s fixed assets — buildings, vehicles, and equipment — broken down by a chosen grouping. Users can control which group to view and which financial figure to focus on."},
  {id:12, name:"None — Empty Slot",              status:"r",icon:"block",            mod:"Other",   desc:"Slot 12 is currently empty.",                                          note:"Recommended: remove this slot.",
   purpose:"‘None’ is a selectable option that renders an empty widget space with no content. It exists to allow a user to leave a widget slot blank rather than displaying a chart."},
  {id:13, name:"Purchasing Management",               status:"b",icon:"shopping_cart",    mod:"Finance", desc:"Purchase orders by status and total spend.",                           note:"",
   purpose:"Gives users a view of purchase order requests filtered by where they are in the approval process. Lets staff see what needs approval, what has been submitted, and the financial commitment those orders represent."},
  {id:14, name:"Main Content Tasks",                  status:"g",icon:"task_alt",         mod:"Finance", desc:"Quick-action shortcuts for common operations.",                        note:"",
   purpose:"Provides a set of quick-access links to common tasks relevant to the current page. Acts as a shortcut panel letting users jump directly to frequently used areas of the system without navigating through menus."},
  {id:15, name:"Bank Balances",                       status:"r",icon:"savings",          mod:"Finance", desc:"Checking, savings, and investment account balances.",                  note:"Two fixes: wrong reconciliation badge + missing total.",
   purpose:"Shows the current balances across all bank accounts and allows users to drill into a single account to see a breakdown of activity — deposits, checks, and withdrawals — since the last bank reconciliation."},
  {id:16, name:"Accounts Payable By Due Date",        status:"r",icon:"calendar_today",   mod:"Finance", desc:"AP aging — what is owed and when.",                               note:"Two fixes: pie labels showed amounts not dates; filter wired.",
   purpose:"Shows all outstanding unpaid supplier invoices grouped by the date they are due. Helps staff see what needs to be paid and when, giving a clear picture of upcoming payment obligations."},
  {id:17, name:"Gifts Pledges",                       status:"b",icon:"redeem",           mod:"Finance", desc:"Donor pledge progress by giving category.",                            note:"",
   purpose:"Shows how gift pledges are tracking against what has been received for each pledge purpose. By selecting a date, users can see how much had been received up to that point — useful for reporting on pledge progress at any given moment."}
];

MOCK_DATA.filters = {
  1: [
    {label:"Account Type",opts:["Income Accounts","Expense Accounts","Custom Report"]},
    {label:"Fiscal Year",opts:["FY 2026","FY 2025","FY 2024"]},
    {label:"Period View",opts:["Monthly","Quarterly","Weekly"]}
  ],
  2: [
    // Year/Fiscal Year removed here — locked design doc: "Fiscal Year filter — removed. The underlying data is
    // an 'active as of today' snapshot, not year-scoped." Also confirmed dead in the render: WRENDER[2] never
    // reads a Year filter value at all.
    {label:"Church District",opts:["All Districts","Central","North","South","East","West"]},
    {label:"Plan Type",opts:["All Plans","Defined Benefit","Defined Contribution","403(b)"]}
  ],
  3: [
    // Changed per direct instruction (2026-07-09): Pay Period is now Weekly/Bi-Weekly/Monthly/Custom (was
    // Last 7 Days/Last 30 Days/Custom). Custom reveals Beginning/Ending date inputs via _renderFltBody below —
    // same dependent-field pattern as W01's Custom Report. Weekly/Bi-Weekly/Monthly instead reveal a single
    // "Pay Date" field (added 2026-07-13, per direct instruction) — the date payroll is issued, which the
    // period is then counted backward from (see w3PeriodRange() in WRENDER[3]). Both dependent-field sets live
    // in _renderFltBody, not here, since they're single date inputs rather than another opts list.
    {label:"Pay Period",opts:["Weekly","Bi-Weekly","Monthly","Custom"]},
    {label:"Department",opts:["All Departments","Finance","Admin","Ministry","Facilities"]}
  ],
  4: [
    // Date Range values corrected to match the locked design doc ("Current Month · Last Month · Custom
    // (Beginning/Ending fields)") — was "...Year to Date", which doesn't match. Custom's date-field reveal is
    // NOT built yet — flagged separately, same open item as W03's Pay Period.
    // Year removed — doc: "Fiscal Year filter — removed... no fiscal-year dimension exists anywhere in the old
    // design's data for this widget" — also never read anywhere in WRENDER[4].
    // Label kept as "Campaign" (not doc's "Activity Type") — the render, MOCK_DATA and citations are all
    // consistently built around real campaign names; flagged as a naming mismatch to reconcile, not silently
    // renamed either direction.
    {label:"Date Range",opts:["Current Month","Last Month","Custom"]},
    {label:"Campaign",opts:["All Campaigns","Spring Appeal","Year-End","Capital Campaign","Mission Drive"]}
  ],
  5: [
    // "Account" renamed to "Revenue Center" + "Source" added to match the locked design doc's filter list
    // (neither was ever read by WRENDER[5], so this is a metadata-only correction, no render logic touched).
    // Year removed — doc: "No Fiscal Year filter — aging is an as-of-today snapshot," and it was never read
    // either. NOTE — not fixed, flagged instead: the doc specifies 5 age bands (0-30/31-60/61-90/91-120/121+);
    // the mock data and render only have 4 (0-30/31-60/61-90/90+). Splitting the last bucket needs a mock-data
    // change plus touching the 91-120=amber/121+=red colour rule — bigger than a safe same-night fix.
    {label:"Age Band",opts:["All Ages","0-30 days","31-60 days","61-90 days","90+ days"]},
    {label:"Revenue Center",opts:["All Revenue Centers","Church","Insurance Billing","Pension Billing","School"]},
    {label:"Source",opts:["All Sources","Insurance Billing","Pension Billing"]}
  ],
  6: [
    // Status filter removed — doc: "Status filter dropped, no active/inactive field today."
    {label:"Plan Type",opts:["All Plans","PPO Plus","HSA Basic","HMO Core","COBRA","Dental","Vision"]}
  ],
  7: [
    // Renamed "Account"→"Account Type" per doc; rebuilt 2026-07-09 with a real multi-account-per-type mock
    // dataset (10 accounts across 5 types) so type-grouping (Distribution view) is actually verifiable.
    // "Display" filter stays removed — never read by WRENDER[7], and its old "Reconciliation Status" option
    // contradicts the doc's "cut entirely... remains closed" ruling on reconciliation for this widget.
    {label:"Account Type",opts:["All Accounts","Checking","Savings","Certificate of Deposit","Restricted Funds","Grant Funds"]},
    // New 2026-07-09 — Trend view comparison, per direct instruction. Lives in the 3-dot "Change filters"
    // menu (incl. at KPI size, trimmed like W01's Fiscal Year), not an inline dropdown on the card.
    // Simplified 2026-07-13, per direct instruction: only two real comparisons exist now — last month vs
    // this month, and this time last year vs this time this year. "Last Quarter" and "None" are removed;
    // Last Month is first (and the default everywhere) — every Table/KPI/Trend now always shows a comparison.
    {label:"Compare To",opts:["Last Month","Last Year"]}
  ],
  8: [
    {label:"Item Type",opts:["All Items","Invoices","Timesheets","Purchase Orders","Approvals"]},
    {label:"Priority",opts:["All","High Priority","Normal"]}
  ],
  9: [
    {label:"Department",opts:["All Departments","Finance","Admin","Ministry","Facilities","IT"]},
    {label:"Leave Type",opts:["All Types","Annual","Sick","Personal"]},
    // Renamed "Year"→"Calendar Year" per doc (this widget is calendar-year based, not fiscal — the doc is
    // explicit about that). Values still FY-shaped since the mock data is bucketed by fiscal-year key —
    // flagged in Final Check, not reshaped tonight.
    // Missing per doc, not added — needs an approval-status field that doesn't exist in mock data yet:
    // "View | Show All · Show Pending · Show Approved".
    {label:"Calendar Year",opts:["FY 2026","FY 2025","FY 2024"]}
  ],
  10: [
    // Dead "Year" filter removed — doc: "No Fiscal Year filter — loan balance due is an as-of-today snapshot."
    // yrData() falls back to the FY 2026 bucket automatically with no year filter present, so this is safe.
    {label:"Loan Type",opts:["All Types","Property","Vehicle","Equipment"]},
    {label:"Status",opts:["All","Active","In Arrears"]}
  ],
  11: [
    // "Depreciation" (Straight Line/Declining Balance) filter removed — doc's "What Got Cut" section says
    // this exact invented filter "already cut earlier in this project; nothing in the real data supports it,"
    // yet it was still live here and actually changing displayed NBV/annual-depreciation figures by a
    // hardcoded 1.3x/1.4x multiplier — a real numbers bug, not just an extra control.
    // Flag: doc's real filter model is Group By / Specific Group / Financial Measure (see Final Check
    // Logic) — "Asset Category" below is a flat stand-in, not a rebuild of that model.
    {label:"Asset Category",opts:["All Categories","Buildings","Vehicles","Equipment","IT Assets","Furniture"]}
  ],
  12: [],
  13: [
    {label:"PO Status",opts:["All","Pending Approval","Approved","Overdue"]},
    {label:"Department",opts:["All Departments","Finance","Admin","Ministry","Facilities","IT"]},
    {label:"Year",opts:["FY 2026","FY 2025","FY 2024"]}
  ],
  14: [
    {label:"Task Type",opts:["All Tasks","Finance","HR","Payroll","Purchasing"]}
  ],
  15: [
    // "Show" filter removed — doc: "Invented 'Show' filter (Balance+Reconciliation/Balance Only/
    // Reconciliation Only) — cut; didn't correspond to anything in the old design. The real toggle is the
    // Account dropdown's mode switch." Never read by WRENDER[15] either.
    {label:"Account",opts:["All Accounts","Main Checking","Savings Reserve","Investment CD","Petty Cash"]}
  ],
  16: [
    {label:"Due Date",opts:["All","Overdue Now","Due This Week","Due This Month"]},
    {label:"Vendor",opts:["All Vendors","Office Depot","Tech Supplies","Catering Co.","Print Works","IT Direct","Facilities Plus","Cleaning Services"]}
  ],
  17: [
    // Dead "Year" filter removed — doc: "No Fiscal Year filter — old design has no fiscal-year dimension
    // for this widget." yrData() falls back to the FY 2026 bucket automatically with no year filter present.
    {label:"Campaign",opts:["All Campaigns","Building Fund","Youth Ministry","Outreach","Missions","Capital Fund","Music Ministry"]},
    {label:"Date Range",opts:["Current Month","Year to Date","Campaign Total"]}
  ]
};

// Hard Rule 1 — at KPI size, only the time filter is offered. Default is Fiscal Year everywhere; a widget can
// override here if Fiscal Year isn't its right time dimension (none do yet).
MOCK_DATA.kpiTimeFilter = {
  1: 'Fiscal Year',
  3: 'Pay Period',
  7: 'Compare To'
};

// W01 — dependent fields revealed only when Account Type = "Custom Report" (legacy label: "Selected Accounts").
// Mock data added per request — not real data. Special Report Title is confirmed user-created elsewhere (the
// Special Reports module); Line Description's source is NOT confirmed — see the open question logged in the
// Final Design doc and developer punch list (may be user-created the same way, or a fixed/hard-coded list).
MOCK_DATA.specialReportTitles = {
  1: ['1 JF','2 GH','3 Ministry Payroll Allocation','Year-End Board Report']
};
MOCK_DATA.lineDescriptions = {
  1: ['Accounts rec-registrations','Accounts pay-vendor holds','Payroll clearing suspense','Interfund transfer clearing']
};

MOCK_DATA.options = {
  1: [
    {num:"A",title:"Variance Bar",sub:"Keep/Refresh",imp:"Show bars + variance row. Green/red variance row beneath bars answers 'by how much?' without arithmetic.",il:"Bold BI Budget vs Actual",iu:"https://samples.boldbi.com/solutions/finance/budget-vs-actual-dashboard"},
    {num:"B",title:"KPI Cards + Bars",sub:"Improve",imp:"Lead with 4 headline KPI tiles (YTD budget, YTD actual, variance, % used) above bars. Users get the answer before they read the chart.",il:"QuickBooks Budget Report",iu:"https://coefficient.io/templates/quickbooks-budget-vs-actual-report"},
    {num:"C",title:"Waterfall Chart",sub:"Redesign",imp:"Cumulative variance waterfall — each period stacks on the last. Shows drift clearly for board-level review.",il:"Google Looker Waterfall",iu:"https://cloud.google.com/looker/docs/best-practices/how-to-create-waterfall-charts"}
  ],
  2: [
    // Title/imp updated 2026-07-09: Option A now defaults to Pie by Plan Type (Grouped Bar by District moved
    // to its Switch Chart Type alternate) — this is what drives the eye-icon Purpose popover, so it needs to
    // describe what actually renders now, not the pre-redesign default.
    {num:"A",title:"Pie by Plan Type",sub:"Keep/Refresh",imp:"Pie by plan type is the default view, with Grouped Bar by District and a Data Table available via Switch Chart Type.",il:"Mercer Plan Dashboard",iu:"https://www.mercer.com/en-us/solutions/retirement/defined-benefit-pensions/plan-dashboard/"},
    {num:"B",title:"Pie by Plan Type (alt.)",sub:"Keep/Refresh",imp:"Donut pie showing plan type split. Right chart when the question is proportional.",il:"PayCaptain Pensions",iu:"https://www.paycaptain.com/features/pensions-dashboard"},
    {num:"C",title:"Summary Table",sub:"Improve",imp:"Table with totals per district and per plan type. Best for reporting.",il:"Mercer Plan Dashboard",iu:"https://www.mercer.com/en-us/solutions/retirement/defined-benefit-pensions/plan-dashboard/"}
  ],
  3: [
    {num:"A",title:"Horizontal Bars",sub:"Keep/Refresh",imp:"Horizontal bar per category. Clear proportional comparison.",il:"Figma Payroll Dashboard",iu:"https://www.figma.com/community/file/1356263393257478402/free-payroll-dashboard"},
    {num:"B",title:"Donut Chart",sub:"Keep/Refresh",imp:"Donut showing payroll cost split. Centre label shows total.",il:"Behance Payroll UI",iu:"https://www.behance.net/gallery/221873503/HR-Payroll-Management-Dashboard-UI-Design"},
    {num:"C",title:"Period Comparison",sub:"Improve",imp:"Side-by-side bars for current vs prior period. Tracks cost trends.",il:"ADP Workforce Analytics",iu:"https://www.adp.com/what-we-offer/workforce-analytics.aspx"}
  ],
  4: [
    {num:"A",title:"Progress Bars",sub:"Keep/Refresh",imp:"One bar per campaign showing received vs pledged. Clear for pledge tracking.",il:"Virtuous Pledge Tracking",iu:"https://virtuous.org/blog/donor-pledge-tracking/"},
    {num:"B",title:"Paired Bars",sub:"Improve",imp:"Pledged and received as side-by-side bars per campaign. Gap is immediately visible.",il:"DonorPerfect Giving Report",iu:"https://www.donorperfect.com/giving-report-pledge-progress/"},
    {num:"C",title:"Summary Table",sub:"Keep/Refresh",imp:"Table with pledged, received, outstanding, and % per campaign.",il:"Bloomerang Pledge Tracking",iu:"https://bloomerang.co/blog/pledge-tracking/"}
  ],
  5: [
    {num:"A",title:"Bar by Age Band",sub:"Redesign",imp:"Bar chart replacing the incorrect pie. Aging is sequential — bars respect that order.",il:"GlobalData365 AR Dashboard",iu:"https://globaldata365.com/accounts-receivable-dashboard/"},
    {num:"B",title:"Aging Strip + Table",sub:"Improve",imp:"Segmented colour strip (yellow to red) + detail table. Two views in one.",il:"Coupler.io AR Dashboard",iu:"https://www.coupler.io/dashboard-examples/accounts-receivable-dashboard"},
    {num:"C",title:"KPI Cards + Table",sub:"Improve",imp:"Total outstanding and total overdue as KPI tiles, then detail below.",il:"Vertaccount AR",iu:"https://www.vertaccount.com/blog/best-accounts-receivable-dashboard-examples-templates-for-2026/"}
  ],
  6: [
    {num:"A",title:"Plan Table",sub:"Keep/Refresh",imp:"Horizontal bar per plan by enrolled count (default), with a plan-table alternate view.",il:"Staffbase HR Widgets",iu:"https://support.staffbase.com/hc/en-us/articles/27956507092114-Overview-of-HR-Widgets"},
    {num:"B",title:"Bar by Enrolment",sub:"Improve",imp:"Bar showing enrolled headcount per plan. Good for spotting uptake.",il:"ADP Benefits Admin",iu:"https://www.adp.com/what-we-offer/benefits-administration.aspx"},
    {num:"C",title:"Plan Cards",sub:"Improve",imp:"One card per plan with enrolled count and cost.",il:"ADP Benefits Admin",iu:"https://www.adp.com/what-we-offer/benefits-administration.aspx"}
  ],
  7: [
    // Retitled/rewritten 2026-07-09 — Option A is now the real design: Table (default) / Distribution / Trend,
    // switchable, built off a colleague's design + direct instruction to add period comparison. B/C below are
    // the old reconciliation-based concepts, already closed per doc ("cut entirely... remains closed") —
    // left as-is/untouched, not reachable from Final Check, flagged as superseded rather than rebuilt.
    {num:"A",title:"Table / Distribution / Trend",sub:"Redesign",imp:"Balance table with % change vs a comparison point, a By Type/Top Accounts distribution donut, and a Total/By Account trend line — three switchable views, one dataset.",il:"Treasury/Liquidity Dashboards",iu:"https://www.usedatabrain.com/blog/financial-dashboard-examples"},
    {num:"B",title:"Balance Bars (superseded)",sub:"Improve",imp:"Horizontal bars make balance differences immediately visible.",il:"Xero Customise",iu:"https://central.xero.com/s/article/Customise-your-Xero-dashboard"},
    {num:"C",title:"Compact Table (superseded)",sub:"Keep/Refresh",imp:"Account, balance, status, last reconciled in a compact table.",il:"Xero Dashboard",iu:"https://central.xero.com/s/article/Your-Xero-dashboard"}
  ],
  8: [
    {num:"A",title:"Count Cards",sub:"Improve",imp:"Count tiles per item type with urgency colour. Good at-a-glance summary.",il:"ADP Workforce Analytics",iu:"https://www.adp.com/what-we-offer/workforce-analytics.aspx"},
    {num:"B",title:"Priority List",sub:"Redesign",imp:"Items sorted by due date. Most urgent always at top.",il:"ADP Workforce Analytics",iu:"https://www.adp.com/what-we-offer/workforce-analytics.aspx"},
    {num:"C",title:"Grouped by Type",sub:"Improve",imp:"Items under type headers with counts. Role-based scanning.",il:"ADP Workforce Analytics",iu:"https://www.adp.com/what-we-offer/workforce-analytics.aspx"}
  ],
  9: [
    {num:"A",title:"Month Calendar",sub:"Keep/Refresh",imp:"Calendar with colour-coded leave. Good for payroll coverage planning.",il:"BambooHR Time Off",iu:"https://www.bamboohr.com/hr-software/time-off-management/"},
    {num:"B",title:"Upcoming List",sub:"Improve",imp:"List of upcoming absences sorted by start date. Fastest to scan.",il:"TeamHub HR",iu:"https://www.figma.com/community/file/1552262349953288359/teamhub-hr-team-management-admin-dashboard-ui-design"},
    {num:"C",title:"Department View",sub:"Redesign",imp:"Per-department rows with colour-coded absence chips.",il:"BambooHR Time Off",iu:"https://www.bamboohr.com/hr-software/time-off-management/"}
  ],
  10: [
    {num:"A",title:"Loan Cards",sub:"Keep/Refresh",imp:"Card per loan with progress bar for term completion.",il:"LoanPro Portfolio",iu:"https://loanpro.io/resources/loan-portfolio-management/"},
    {num:"B",title:"Balance Bars",sub:"Improve",imp:"Horizontal bars showing remaining balance per loan.",il:"Tableau Loans",iu:"https://public.tableau.com/app/profile/tableau.finance/viz/LoanPortfolioDashboard"},
    {num:"C",title:"Loan Table",sub:"Keep/Refresh",imp:"All key fields: original, balance, rate, monthly payment.",il:"LoanPro Portfolio",iu:"https://loanpro.io/resources/loan-portfolio-management/"}
  ],
  11: [
    {num:"A",title:"Bar by Category",sub:"Keep/Refresh",imp:"Net book value bar per asset category.",il:"GlobalData365 Fixed Assets",iu:"https://globaldata365.com/fixed-assets-dashboard/"},
    {num:"B",title:"Depreciation Table",sub:"Improve",imp:"Cost, accumulated depreciation, NBV, and annual charge.",il:"BlueTally Assets",iu:"https://bluetally.com/blog/best-fixed-asset-management-software"},
    {num:"C",title:"Pie by Category",sub:"Keep/Refresh",imp:"Pie shows which categories make up the largest share of asset base.",il:"GlobalData365 Fixed Assets",iu:"https://globaldata365.com/fixed-assets-dashboard/"}
  ],
  12: [
    {num:"A",title:"Remove Slot",sub:"Recommended",imp:"Empty slots confuse users and waste dashboard real estate.",il:"Nielsen Norman",iu:"https://www.nngroup.com/articles/dashboard-design/"},
    {num:"B",title:"Finance Health Summary",sub:"Alternative",imp:"Traffic-light tiles for payroll, AP, bank reconciliation, and budget.",il:"Nielsen Norman",iu:"https://www.nngroup.com/articles/dashboard-design/"},
    {num:"C",title:"Add Widget Slot",sub:"Future State",imp:"+ Add Widget tile lets users customise their dashboard.",il:"Xero Dashboard",iu:"https://central.xero.com/s/article/Customise-your-Xero-dashboard"}
  ],
  13: [
    {num:"A",title:"PO Status Table",sub:"Keep/Refresh",imp:"All POs listed with ref, vendor, amount, status, and due date.",il:"Uizard PO Dashboard",iu:"https://uizard.io/templates/web-app-templates/purchase-order-management-system-web-app/"},
    {num:"B",title:"Kanban by Status",sub:"Redesign",imp:"Three columns: Pending, Approved, Overdue.",il:"AppSmith Orders",iu:"https://www.appsmith.com/use-case/customer-order-dashboard"},
    {num:"C",title:"Spend by Department",sub:"Improve",imp:"Horizontal bars showing PO spend per department.",il:"AppSmith Orders",iu:"https://www.appsmith.com/use-case/customer-order-dashboard"}
  ],
  14: [
    {num:"A",title:"Action Grid",sub:"Keep/Refresh",imp:"Large icon tiles for the 6 most common finance actions.",il:"QuickBooks Quick Create",iu:"https://quickbooks.intuit.com/learn-support/en-us/help-article/quick-create-transactions/quickbooks-online-quick-create-menu/L0vvVKH1c"},
    {num:"B",title:"Action List",sub:"Improve",imp:"List with icon + description. Helps new users discover what each action does.",il:"QuickBooks Quick Create",iu:"https://quickbooks.intuit.com/learn-support/en-us/help-article/quick-create-transactions/quickbooks-online-quick-create-menu/L0vvVKH1c"},
    {num:"C",title:"Compact Chips",sub:"Improve",imp:"Small icon + label chips. Minimal space, hover shows description.",il:"Xero Dashboard",iu:"https://central.xero.com/s/article/Your-Xero-dashboard"}
  ],
  15: [
    {num:"A",title:"Balance Cards",sub:"Redesign",imp:"Card per account with balance, status badge, and combined total row.",il:"Xero Bank Reconciliation",iu:"https://www.xero.com/us/features-and-tools/accounting-software/bank-reconciliation/"},
    {num:"B",title:"Balance Bars",sub:"Improve",imp:"Horizontal bars showing account balances. Includes total.",il:"Xero Bank Reconciliation",iu:"https://www.xero.com/us/features-and-tools/accounting-software/bank-reconciliation/"},
    {num:"C",title:"Compact Table",sub:"Keep/Refresh",imp:"Account, balance, status, and reconciliation date with total row.",il:"Xero Bank Reconciliation",iu:"https://www.xero.com/us/features-and-tools/accounting-software/bank-reconciliation/"}
  ],
  16: [
    {num:"A",title:"AP Aging Table",sub:"Improve",imp:"Table sorted by due date with overdue status. Days overdue column.",il:"Coupler.io AP Dashboard",iu:"https://www.coupler.io/marketing-dashboards/looker-studio-quickbooks-accounts-payable-dashboard"},
    {num:"B",title:"Aging Bar Chart",sub:"Redesign",imp:"Bar per age band (0-30, 31-60, 61-90, 90+). Correct replacement for broken pie.",il:"Coefficient AP Dashboard",iu:"https://coefficient.io/dashboard-examples/qbo-accounts-payable-dashboard"},
    {num:"C",title:"Vendor Breakdown",sub:"Improve",imp:"Bars per vendor showing total owed. Red = overdue.",il:"Coupler.io AP Dashboard",iu:"https://www.coupler.io/marketing-dashboards/looker-studio-quickbooks-accounts-payable-dashboard"}
  ],
  17: [
    {num:"A",title:"Progress Bars",sub:"Keep/Refresh",imp:"One bar per campaign showing % received of pledged amount.",il:"Virtuous Pledge Tracking",iu:"https://virtuous.org/blog/donor-pledge-tracking/"},
    {num:"B",title:"Paired Bars",sub:"Improve",imp:"Pledged vs received side-by-side per campaign.",il:"DonorPerfect Giving Report",iu:"https://www.donorperfect.com/giving-report-pledge-progress/"},
    {num:"C",title:"Campaign Table",sub:"Keep/Refresh",imp:"Campaign, pledged, received, outstanding, % — with totals row.",il:"Bloomerang Pledge Tracking",iu:"https://bloomerang.co/blog/pledge-tracking/"}
  ]
};

// =============================================================
// SERIES DATA — keyed by widget id, then by primary filter value
// Year-filtered widgets: data[filterKey]['FY 20XX']
// =============================================================
MOCK_DATA.series = {};

// W1 — Budget vs Actual
// FY2026 = 6 months (Jan-Jun); FY2025 = 12 months (Jul-Jun); FY2024 = 12 months (Jul-Jun)
MOCK_DATA.series[1] = {
  'Income Accounts': {
    // 'Jul' added (2026-07-09): FY2026 was missing the current in-progress month/quarter entirely, so Quarterly
    // could only ever produce Q1+Q2 (6 months = exactly 2 quarters) — never a 3rd. A partial month with a low
    // Actual (Budget stays a normal full-month figure; Actual is low because the month/quarter just started,
    // not because less was budgeted) now gives a real, honestly-low Q3. Totals/varr recomputed as exact sums
    // of the periods below (they previously didn't quite match — corrected as part of this pass too).
    'FY 2026': {periods:[['Jan',78,82],['Feb',72,68],['Mar',88,94],['Apr',76,71],['May',84,88],['Jun',95,91],['Jul',90,8]],totals:['$583k','$502k','-$81k','86%'],varr:[4,-4,6,-5,4,-4,-82]},
    'FY 2025': {periods:[['Jul',74,78],['Aug',80,76],['Sep',82,86],['Oct',71,68],['Nov',88,92],['Dec',96,94],['Jan',78,81],['Feb',70,66],['Mar',84,90],['Apr',75,72],['May',82,85],['Jun',91,88]],totals:['$971k','$976k','+$5k','101%'],varr:[4,-4,4,-3,4,-2,3,-4,6,-3,3,-3]},
    'FY 2024': {periods:[['Jul',68,72],['Aug',75,71],['Sep',79,83],['Oct',66,62],['Nov',83,87],['Dec',90,86],['Jan',72,76],['Feb',65,62],['Mar',80,84],['Apr',70,66],['May',78,82],['Jun',86,90]],totals:['$912k','$921k','+$9k','101%'],varr:[4,-4,4,-4,4,-4,4,-3,4,-4,4,4]}
  },
  'Expense Accounts': {
    // 'Jul' added (2026-07-09) — same partial-quarter fix as Income Accounts above. Totals recomputed as
    // exact sums of the periods (they previously didn't match — corrected as part of this pass).
    'FY 2026': {periods:[['Jan',60,65],['Feb',55,58],['Mar',70,74],['Apr',65,61],['May',75,79],['Jun',80,86],['Jul',78,7]],totals:['$483k','$430k','-$53k','89%'],varr:[-5,-3,-4,4,-4,-6,71]},
    'FY 2025': {periods:[['Jul',58,62],['Aug',62,60],['Sep',68,72],['Oct',63,60],['Nov',72,76],['Dec',78,82],['Jan',60,64],['Feb',54,57],['Mar',69,73],['Apr',64,60],['May',74,78],['Jun',79,84]],totals:['$801k','$828k','+$27k','103%'],varr:[-4,2,-4,3,-4,-4,-4,-3,-4,4,-4,-5]},
    'FY 2024': {periods:[['Jul',55,58],['Aug',59,57],['Sep',64,68],['Oct',60,57],['Nov',68,72],['Dec',74,78],['Jan',57,60],['Feb',51,54],['Mar',65,69],['Apr',61,57],['May',70,74],['Jun',75,80]],totals:['$759k','$784k','+$25k','103%'],varr:[-3,2,-4,3,-4,-4,-3,-3,-4,4,-4,-5]}
  },
  'Custom Report': {
    // 'Jul' added (2026-07-09) — same partial-quarter fix as above. Totals recomputed as exact sums.
    'FY 2026': {periods:[['Jan',85,80],['Feb',78,75],['Mar',92,88],['Apr',70,73],['May',88,90],['Jun',95,93],['Jul',90,9]],totals:['$598k','$508k','-$90k','85%'],varr:[5,3,4,-3,-2,2,81]},
    // FY 2025/2024 totals[0]/[1] fixed (2026-07-09): both were exactly $100k too high (e.g. '$1,094k' where the
    // periods actually sum to $994k) — a data-entry error found while re-verifying all of this widget's numbers
    // as part of the dollar-figure correction. Variance/% Used were already right (the +100 offset cancels out
    // in a subtraction), so only the two absolute totals needed correcting.
    'FY 2025': {periods:[['Jul',82,78],['Aug',76,73],['Sep',89,85],['Oct',68,71],['Nov',85,88],['Dec',92,90],['Jan',84,79],['Feb',77,74],['Mar',91,87],['Apr',69,72],['May',87,89],['Jun',94,92]],totals:['$994k','$978k','-$16k','98%'],varr:[4,3,4,-3,-3,2,5,3,4,-3,-2,2]},
    'FY 2024': {periods:[['Jul',78,74],['Aug',72,69],['Sep',85,81],['Oct',64,67],['Nov',81,84],['Dec',88,86],['Jan',80,75],['Feb',73,70],['Mar',87,83],['Apr',65,68],['May',83,85],['Jun',90,88]],totals:['$946k','$930k','-$16k','98%'],varr:[4,3,4,-3,-3,2,5,3,4,-3,-2,2]}
  }
};

// W2 — Pension Plans
MOCK_DATA.series[2] = {
  'All Districts': {
    'FY 2026': {districts:['Central','North','South','East','West'],db:[44000,40000,33000,29000,18000],dc:[30000,25000,21000,17000,11000],f403:[16000,14000,11000,10000,7000]},
    'FY 2025': {districts:['Central','North','South','East','West'],db:[42000,38000,31000,27000,17000],dc:[28000,24000,19000,16000,10000],f403:[15000,13000,10000,9000,6500]},
    'FY 2024': {districts:['Central','North','South','East','West'],db:[39000,35000,29000,25000,16000],dc:[26000,22000,18000,15000,9500],f403:[14000,12000,9500,8500,6000]}
  },
  'Central': {
    'FY 2026': {districts:['Central'],db:[44000],dc:[30000],f403:[16000]},
    'FY 2025': {districts:['Central'],db:[42000],dc:[28000],f403:[15000]},
    'FY 2024': {districts:['Central'],db:[39000],dc:[26000],f403:[14000]}
  },
  'North': {
    'FY 2026': {districts:['North'],db:[40000],dc:[25000],f403:[14000]},
    'FY 2025': {districts:['North'],db:[38000],dc:[24000],f403:[13000]},
    'FY 2024': {districts:['North'],db:[35000],dc:[22000],f403:[12000]}
  },
  'South': {
    'FY 2026': {districts:['South'],db:[33000],dc:[21000],f403:[11000]},
    'FY 2025': {districts:['South'],db:[31000],dc:[19000],f403:[10000]},
    'FY 2024': {districts:['South'],db:[29000],dc:[18000],f403:[9500]}
  },
  'East': {
    'FY 2026': {districts:['East'],db:[29000],dc:[17000],f403:[10000]},
    'FY 2025': {districts:['East'],db:[27000],dc:[16000],f403:[9000]},
    'FY 2024': {districts:['East'],db:[25000],dc:[15000],f403:[8500]}
  },
  'West': {
    'FY 2026': {districts:['West'],db:[18000],dc:[11000],f403:[7000]},
    'FY 2025': {districts:['West'],db:[17000],dc:[10000],f403:[6500]},
    'FY 2024': {districts:['West'],db:[16000],dc:[9500],f403:[6000]}
  }
};

// W3 — Payroll Distributions
// Categories changed 2026-07-16, per direct instruction: the old set — Net Pay/Fed Tax/Benefits/State Tax/
// Retirement/Overtime — was a gross-to-net paycheck-stub breakdown (pay minus tax/deduction withholdings).
// That's not what should show when drilling into a pay group. Replaced with pay-TYPE codes — the categories
// hours/earnings are actually coded under on a pay run: Regular, Vacation, OverTime, Sick, Double Time,
// Personal, Holiday, Misc, Other. This should be linkable in the real system — pay groups already tie to
// compensation records — but the exact field/table (a pay-type or earnings-code dimension, likely somewhere
// off `PRHistoryCompensation` or a related detail table, not the `CompensationDistributionID/Name` pairing the
// original Purpose doc's formula relies on) isn't confirmed. Flagged for the dev to dig into — see the
// Developer Punch List and this widget's Final Check Logic notes. Values below are illustrative mock numbers
// only, not derived from anything real; department totals still sum to the same "All Departments" total as
// before for internal consistency.
MOCK_DATA.series[3] = {
  'All Departments': {cats:['Regular','Vacation','OverTime','Sick','Double Time','Personal','Holiday','Misc','Other'],vals:[126800,7600,6200,3200,700,2050,4900,970,1780],prev:[122600,7300,5550,3060,590,1970,4730,935,1730]},
  'Finance':         {cats:['Regular','Vacation','OverTime','Sick','Double Time','Personal','Holiday','Misc','Other'],vals:[38000,2200,1400,900,200,600,1500,300,780],prev:[36700,2100,1200,850,150,580,1450,290,750]},
  'Admin':           {cats:['Regular','Vacation','OverTime','Sick','Double Time','Personal','Holiday','Misc','Other'],vals:[27500,1600,800,700,100,450,1100,250,800],prev:[26600,1550,650,680,80,430,1050,240,770]},
  'Ministry':        {cats:['Regular','Vacation','OverTime','Sick','Double Time','Personal','Holiday','Misc','Other'],vals:[44500,2600,2800,1100,300,700,1600,280,0],prev:[43000,2500,2400,1050,260,670,1550,270,0]},
  'Facilities':      {cats:['Regular','Vacation','OverTime','Sick','Double Time','Personal','Holiday','Misc','Other'],vals:[16800,1200,1200,500,100,300,700,140,200],prev:[16300,1150,1300,480,100,290,680,135,210]}
};

// W4 — Remittance Pledges
MOCK_DATA.series[4] = {
  'All Campaigns': {
    'FY 2026': {items:[
      {l:'Building Renewal', p:120000,r:96000, c:'#4caf50'},
      {l:'Youth Ministry',   p:85000, r:51000, c:'#ff9800'},
      {l:'Outreach',         p:50000, r:47500, c:'#4caf50'},
      {l:'Missions',         p:32000, r:12800, c:'#e53935'},
      {l:'Staff Benevolence',p:18000, r:15300, c:'#4caf50'},
      {l:'Scholarship Fund', p:14000, r:7000,  c:'#ff9800'},
      {l:'Community Food',   p:9500,  r:9025,  c:'#4caf50'},
      {l:'Music Ministry',   p:7800,  r:3900,  c:'#ff9800'}
    ]},
    'FY 2025': {items:[
      {l:'Building Renewal', p:110000,r:99000, c:'#4caf50'},
      {l:'Youth Ministry',   p:78000, r:58500, c:'#4caf50'},
      {l:'Outreach',         p:45000, r:40500, c:'#4caf50'},
      {l:'Missions',         p:28000, r:19600, c:'#ff9800'},
      {l:'Staff Benevolence',p:16000, r:14400, c:'#4caf50'},
      {l:'Scholarship Fund', p:12000, r:7200,  c:'#ff9800'},
      {l:'Community Food',   p:8500,  r:8500,  c:'#4caf50'},
      {l:'Music Ministry',   p:7000,  r:4200,  c:'#ff9800'}
    ]},
    'FY 2024': {items:[
      {l:'Building Renewal', p:98000, r:88200, c:'#4caf50'},
      {l:'Youth Ministry',   p:70000, r:63000, c:'#4caf50'},
      {l:'Outreach',         p:40000, r:34000, c:'#4caf50'},
      {l:'Missions',         p:25000, r:12500, c:'#ff9800'},
      {l:'Staff Benevolence',p:14000, r:12600, c:'#4caf50'},
      {l:'Scholarship Fund', p:11000, r:5500,  c:'#e53935'},
      {l:'Community Food',   p:7500,  r:7500,  c:'#4caf50'},
      {l:'Music Ministry',   p:6200,  r:3720,  c:'#ff9800'}
    ]}
  },
  'Spring Appeal': {
    'FY 2026': {items:[{l:'Congregation',p:60000,r:48000,c:'#4caf50'},{l:'Outreach',p:20000,r:14000,c:'#ff9800'},{l:'Admin',p:10000,r:8000,c:'#4caf50'},{l:'Youth',p:8000,r:4800,c:'#ff9800'}]},
    'FY 2025': {items:[{l:'Congregation',p:55000,r:49500,c:'#4caf50'},{l:'Outreach',p:18000,r:16200,c:'#4caf50'},{l:'Admin',p:9000,r:8100,c:'#4caf50'},{l:'Youth',p:7500,r:5250,c:'#ff9800'}]},
    'FY 2024': {items:[{l:'Congregation',p:50000,r:42500,c:'#4caf50'},{l:'Outreach',p:16000,r:12800,c:'#ff9800'},{l:'Admin',p:8000,r:7200,c:'#4caf50'},{l:'Youth',p:6800,r:3400,c:'#ff9800'}]}
  },
  'Year-End': {
    'FY 2026': {items:[{l:'Building Fund',p:180000,r:144000,c:'#4caf50'},{l:'Missions',p:50000,r:30000,c:'#ff9800'},{l:'Youth',p:40000,r:20000,c:'#e53935'},{l:'Operations',p:25000,r:22500,c:'#4caf50'}]},
    'FY 2025': {items:[{l:'Building Fund',p:165000,r:148500,c:'#4caf50'},{l:'Missions',p:45000,r:36000,c:'#4caf50'},{l:'Youth',p:36000,r:25200,c:'#ff9800'},{l:'Operations',p:22000,r:20900,c:'#4caf50'}]},
    'FY 2024': {items:[{l:'Building Fund',p:150000,r:127500,c:'#4caf50'},{l:'Missions',p:40000,r:28000,c:'#ff9800'},{l:'Youth',p:32000,r:16000,c:'#e53935'},{l:'Operations',p:20000,r:18000,c:'#4caf50'}]}
  },
  'Capital Campaign': {
    'FY 2026': {items:[{l:'Main Sanctuary',p:500000,r:320000,c:'#ff9800'},{l:'Fellowship Hall',p:200000,r:80000,c:'#e53935'},{l:'Parking',p:150000,r:120000,c:'#4caf50'},{l:'Audio/Visual',p:80000,r:64000,c:'#4caf50'}]},
    'FY 2025': {items:[{l:'Main Sanctuary',p:500000,r:275000,c:'#ff9800'},{l:'Fellowship Hall',p:200000,r:60000,c:'#e53935'},{l:'Parking',p:150000,r:105000,c:'#ff9800'},{l:'Audio/Visual',p:80000,r:56000,c:'#ff9800'}]},
    'FY 2024': {items:[{l:'Main Sanctuary',p:500000,r:200000,c:'#ff9800'},{l:'Fellowship Hall',p:200000,r:40000,c:'#e53935'},{l:'Parking',p:150000,r:75000,c:'#e53935'},{l:'Audio/Visual',p:80000,r:32000,c:'#e53935'}]}
  },
  'Mission Drive': {
    'FY 2026': {items:[{l:'Local Outreach',p:35000,r:28000,c:'#4caf50'},{l:'International',p:28000,r:14000,c:'#ff9800'},{l:'Disaster Relief',p:20000,r:18000,c:'#4caf50'},{l:'Sponsorship',p:12000,r:6000,c:'#ff9800'}]},
    'FY 2025': {items:[{l:'Local Outreach',p:32000,r:28800,c:'#4caf50'},{l:'International',p:25000,r:17500,c:'#ff9800'},{l:'Disaster Relief',p:18000,r:18000,c:'#4caf50'},{l:'Sponsorship',p:10000,r:7000,c:'#ff9800'}]},
    'FY 2024': {items:[{l:'Local Outreach',p:28000,r:23800,c:'#4caf50'},{l:'International',p:22000,r:13200,c:'#ff9800'},{l:'Disaster Relief',p:15000,r:15000,c:'#4caf50'},{l:'Sponsorship',p:9000,r:4500,c:'#e53935'}]}
  }
};

// W5 — AR Invoices Outstanding
MOCK_DATA.series[5] = {
  'All Ages': {
    'FY 2026': {bands:[{l:'0-30 days',v:8200,c:'#4caf50',n:3},{l:'31-60 days',v:15400,c:'#ff9800',n:5},{l:'61-90 days',v:9800,c:'#ff7043',n:4},{l:'90+ days',v:6200,c:'#e53935',n:2}]},
    'FY 2025': {bands:[{l:'0-30 days',v:11500,c:'#4caf50',n:5},{l:'31-60 days',v:18200,c:'#ff9800',n:7},{l:'61-90 days',v:7400,c:'#ff7043',n:3},{l:'90+ days',v:4100,c:'#e53935',n:2}]},
    'FY 2024': {bands:[{l:'0-30 days',v:6800,c:'#4caf50',n:3},{l:'31-60 days',v:12600,c:'#ff9800',n:4},{l:'61-90 days',v:11200,c:'#ff7043',n:5},{l:'90+ days',v:8900,c:'#e53935',n:3}]}
  },
  '0-30 days': {
    'FY 2026': {bands:[{l:'0-30 days',v:8200,c:'#4caf50',n:3}]},
    'FY 2025': {bands:[{l:'0-30 days',v:11500,c:'#4caf50',n:5}]},
    'FY 2024': {bands:[{l:'0-30 days',v:6800,c:'#4caf50',n:3}]}
  },
  '31-60 days': {
    'FY 2026': {bands:[{l:'31-60 days',v:15400,c:'#ff9800',n:5}]},
    'FY 2025': {bands:[{l:'31-60 days',v:18200,c:'#ff9800',n:7}]},
    'FY 2024': {bands:[{l:'31-60 days',v:12600,c:'#ff9800',n:4}]}
  },
  '61-90 days': {
    'FY 2026': {bands:[{l:'61-90 days',v:9800,c:'#ff7043',n:4}]},
    'FY 2025': {bands:[{l:'61-90 days',v:7400,c:'#ff7043',n:3}]},
    'FY 2024': {bands:[{l:'61-90 days',v:11200,c:'#ff7043',n:5}]}
  },
  '90+ days': {
    'FY 2026': {bands:[{l:'90+ days',v:6200,c:'#e53935',n:2}]},
    'FY 2025': {bands:[{l:'90+ days',v:4100,c:'#e53935',n:2}]},
    'FY 2024': {bands:[{l:'90+ days',v:8900,c:'#e53935',n:3}]}
  }
};

// W6 — Insurance Billing Plans
MOCK_DATA.series[6] = {
  'All Plans': {plans:[
    {n:'PPO Plus', e:139,p:56,cost:8340,s:'Active'},
    {n:'HSA Basic',e:79, p:32,cost:4740,s:'Active'},
    {n:'HMO Core', e:30, p:12,cost:1800,s:'Active'},
    {n:'COBRA',    e:4,  p:0, cost:720, s:'Pending'},
    {n:'Dental',   e:201,p:80,cost:6030,s:'Active'},
    {n:'Vision',   e:185,p:74,cost:3700,s:'Active'}
  ]},
  'PPO Plus':  {plans:[{n:'PPO Plus', e:139,p:56,cost:8340,s:'Active'}]},
  'HSA Basic': {plans:[{n:'HSA Basic',e:79, p:32,cost:4740,s:'Active'}]},
  'HMO Core':  {plans:[{n:'HMO Core', e:30, p:12,cost:1800,s:'Active'}]},
  'COBRA':     {plans:[{n:'COBRA',    e:4,  p:0, cost:720, s:'Pending'}]},
  'Dental':    {plans:[{n:'Dental',   e:201,p:80,cost:6030,s:'Active'}]},
  'Vision':    {plans:[{n:'Vision',   e:185,p:74,cost:3700,s:'Active'}]}
};

// W7 — Deposit Accounts — rebuilt 2026-07-09 to match the locked design's Table/Distribution/Trend rebuild
// (old shape was keyed by filter value and had no history at all — couldn't support a trend/comparison view).
// `months` is the trailing-12-month DISPLAY window (oldest→newest, ending this month). Each account's `trend`
// has 24 points (extended same day, per direct instruction, to support full comparison LINES rather than a
// single baseline point): indices 12-23 line up with `months[0..11]` (the displayed window); indices 0-11 are
// one more full year further back, needed so the Trend view can plot a full "Last Year" comparison line (a
// 12-point window shifted back 12 months). Compare To simplified 2026-07-13 to just Last Month (shift 1) and
// Last Year (shift 12) — both land safely inside this same 24-point range. Two accounts (Building Fund
// Restricted, State Grant Q3) are deliberately declining for 4+ straight months to exercise the
// declining-account flag (shown in the Table).
// Account count per type made uneven 2026-07-13, per direct instruction ("only ever two type accounts are
// showing" read as a real bug — a perfectly uniform 2-per-type split looked broken/fake): added Petty Cash
// Checking and Grant Reserve 2024 so the Account Type filter now returns 3/2/2/2/3 accounts, not a flat 2/2/2/2/2.
MOCK_DATA.series[7] = {
  months:['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul'],
  accts:[
    {n:'Main Checking',type:'Checking',inc:'Mar 12, 2014',num:'••4821',
      trend:[783125,788750,794375,800000,805625,811250,816875,822500,828125,833750,839375,845000,850200,858900,861200,867500,872100,878300,881900,884600,887200,889100,891767,936355]},
    {n:'Petty Cash Checking',type:'Checking',inc:'Aug 3, 2021',num:'••5512',
      trend:[118500,118976,119452,119929,120405,120881,121357,121833,122310,122786,123262,123738,124214,124690,125167,125643,126119,126595,127071,127548,128024,128500,128885,135329]},
    {n:'Payroll Checking',type:'Checking',inc:'Jun 1, 2018',num:'••7734',
      trend:[432000,430000,428000,426000,424000,422000,420000,418000,416000,414000,412000,410000,395000,405000,398000,402000,396000,404000,399000,401000,397000,403000,404209,424419]},
    {n:'Savings Reserve',type:'Savings',inc:'Sep 22, 2015',num:'••2290',
      trend:[826375,831250,836125,841000,845875,850750,855625,860500,865375,870250,875125,880000,884500,889200,894800,899500,905200,910800,916500,922100,928700,934300,937103,983958]},
    {n:'Emergency Fund',type:'Savings',inc:'Jan 15, 2020',num:'••5567',
      trend:[435900,439000,442100,445200,448300,451400,454500,457600,460700,463800,466900,470000,473000,476500,479800,482400,485700,488900,491600,493800,495900,497200,498692,523627]},
    {n:'CD 12-Month',type:'Certificate of Deposit',inc:'Apr 30, 2023',num:'••9012',
      trend:[631400,634000,636600,639200,641800,644400,647000,649600,652200,654800,657400,660000,662500,665100,667800,670400,673000,675700,678300,680900,683600,686200,688259,722672]},
    {n:'CD 24-Month',type:'Certificate of Deposit',inc:'Nov 18, 2022',num:'••3345',
      trend:[518200,522000,525800,529600,533400,537200,541000,544800,548600,552400,556200,560000,563800,567600,571400,575200,579000,582800,586600,590400,593200,595800,597587,627466]},
    {n:'Building Fund Restricted',type:'Restricted Funds',inc:'Jul 9, 2019',num:'••6678',
      trend:[610550,610500,610450,610400,610350,610300,610250,610200,610150,610100,610050,610000,615000,618200,614500,609800,600200,590500,578200,562800,548900,535200,522800,512505]},
    {n:'Missions Restricted',type:'Restricted Funds',inc:'Feb 28, 2021',num:'••1123',
      trend:[316300,318000,319700,321400,323100,324800,326500,328200,329900,331600,333300,335000,337200,338900,340100,341800,343200,344600,345900,347100,348000,348700,349746,367233]},
    {n:'Federal Grant 2025',type:'Grant Funds',inc:'Oct 1, 2024',num:'••4456',
      trend:[758150,766500,774850,783200,791550,799900,808250,816600,824950,833300,841650,850000,858200,866900,875100,883400,891200,898700,905900,912600,918800,924500,927273,973637]},
    {n:'State Grant Q3',type:'Grant Funds',inc:'Jan 5, 2025',num:'••8890',
      trend:[1186250,1167500,1148750,1130000,1111250,1092500,1073750,1055000,1036250,1017500,998750,980000,965000,948000,928000,905000,882000,858000,835000,822000,814000,809000,804200,800000]},
    {n:'Grant Reserve 2024',type:'Grant Funds',inc:'Feb 14, 2024',num:'••3367',
      trend:[398000,399143,400286,401429,402571,403714,404857,406000,407143,408286,409429,410571,411714,412857,414000,415143,416286,417429,418571,419714,420857,422000,423266,444429]}
  ]
};

// W8 — My Status (12 items)
MOCK_DATA.series[8] = {
  'All Items': {items:[
    {t:'Invoice #1847',        type:'Invoices',        pri:'High',  due:'Today', ico:'receipt',        bg:'#faefef',c:'#9d2d2d'},
    {t:'Payroll Timesheet',    type:'Timesheets',      pri:'High',  due:'Today', ico:'schedule',       bg:'#faefef',c:'#9d2d2d'},
    {t:'PO #2851',             type:'Purchase Orders', pri:'High',  due:'Jul 8', ico:'shopping_cart',  bg:'#faefef',c:'#9d2d2d'},
    {t:'Invoice #1853',        type:'Invoices',        pri:'High',  due:'Jul 9', ico:'receipt',        bg:'#faefef',c:'#9d2d2d'},
    {t:'PO #2860',             type:'Purchase Orders', pri:'High',  due:'Jul 8', ico:'shopping_cart',  bg:'#faefef',c:'#9d2d2d'},
    {t:'New Hire Approval',    type:'Approvals',       pri:'High',  due:'Jul 9', ico:'event_available',bg:'#faefef',c:'#9d2d2d'},
    {t:'Invoice #1851',        type:'Invoices',        pri:'Normal',due:'Jul 10',ico:'receipt',        bg:'#fff8e1',c:'#b75a00'},
    {t:'Leave Approval — Lee', type:'Approvals',       pri:'Normal',due:'Jul 10',ico:'event_available',bg:'#fff8e1',c:'#b75a00'},
    {t:'PO #2855',             type:'Purchase Orders', pri:'Normal',due:'Jul 12',ico:'shopping_cart',  bg:'#fff8e1',c:'#b75a00'},
    {t:'Timesheet — Mitchell', type:'Timesheets',      pri:'Normal',due:'Jul 11',ico:'schedule',       bg:'#fff8e1',c:'#b75a00'},
    {t:'Budget Approval',      type:'Approvals',       pri:'Normal',due:'Jul 14',ico:'event_available',bg:'#fff8e1',c:'#b75a00'},
    {t:'Invoice #1858',        type:'Invoices',        pri:'Normal',due:'Jul 15',ico:'receipt',        bg:'#fff8e1',c:'#b75a00'}
  ]},
  'Invoices':        {items:[
    {t:'Invoice #1847',type:'Invoices',pri:'High',  due:'Today', ico:'receipt',bg:'#faefef',c:'#9d2d2d'},
    {t:'Invoice #1853',type:'Invoices',pri:'High',  due:'Jul 9', ico:'receipt',bg:'#faefef',c:'#9d2d2d'},
    {t:'Invoice #1851',type:'Invoices',pri:'Normal',due:'Jul 10',ico:'receipt',bg:'#fff8e1',c:'#b75a00'},
    {t:'Invoice #1858',type:'Invoices',pri:'Normal',due:'Jul 15',ico:'receipt',bg:'#fff8e1',c:'#b75a00'}
  ]},
  'Timesheets':      {items:[
    {t:'Payroll Timesheet',   type:'Timesheets',pri:'High',  due:'Today', ico:'schedule',bg:'#faefef',c:'#9d2d2d'},
    {t:'Timesheet — Mitchell',type:'Timesheets',pri:'Normal',due:'Jul 11',ico:'schedule',bg:'#fff8e1',c:'#b75a00'}
  ]},
  'Purchase Orders': {items:[
    {t:'PO #2851',type:'Purchase Orders',pri:'High',  due:'Jul 8', ico:'shopping_cart',bg:'#faefef',c:'#9d2d2d'},
    {t:'PO #2860',type:'Purchase Orders',pri:'High',  due:'Jul 8', ico:'shopping_cart',bg:'#faefef',c:'#9d2d2d'},
    {t:'PO #2855',type:'Purchase Orders',pri:'Normal',due:'Jul 12',ico:'shopping_cart',bg:'#fff8e1',c:'#b75a00'}
  ]},
  'Approvals': {items:[
    {t:'New Hire Approval',    type:'Approvals',pri:'High',  due:'Jul 9', ico:'event_available',bg:'#faefef',c:'#9d2d2d'},
    {t:'Leave Approval — Lee', type:'Approvals',pri:'Normal',due:'Jul 10',ico:'event_available',bg:'#fff8e1',c:'#b75a00'},
    {t:'Budget Approval',      type:'Approvals',pri:'Normal',due:'Jul 14',ico:'event_available',bg:'#fff8e1',c:'#b75a00'}
  ]}
};

// W9 — Payroll Scheduled Time Off
MOCK_DATA.series[9] = {
  'All Departments': {
    'FY 2026': {leave:[
      {n:'James Lee',      dept:'Finance',    type:'Annual',  s:8, e:9, ms:'Jul 8', me:'Jul 9', days:2},
      {n:'Sarah Mitchell', dept:'Finance',    type:'Annual',  s:14,e:18,ms:'Jul 14',me:'Jul 18',days:5},
      {n:'Linda Perez',    dept:'Finance',    type:'Personal',s:21,e:21,ms:'Jul 21',me:'Jul 21',days:1},
      {n:'Rachel Brown',   dept:'Admin',      type:'Sick',    s:12,e:12,ms:'Jul 12',me:'Jul 12',days:1},
      {n:'Amy Park',       dept:'Admin',      type:'Annual',  s:35,e:39,ms:'Aug 4', me:'Aug 8', days:5},
      {n:'Tom Hughes',     dept:'Ministry',   type:'Sick',    s:21,e:23,ms:'Jul 21',me:'Jul 23',days:3},
      {n:'Chris Wu',       dept:'Ministry',   type:'Annual',  s:42,e:46,ms:'Aug 11',me:'Aug 15',days:5},
      {n:'Maria Chen',     dept:'Facilities', type:'Personal',s:28,e:28,ms:'Jul 28',me:'Jul 28',days:1},
      {n:'Kevin Okafor',   dept:'Facilities', type:'Annual',  s:28,e:32,ms:'Jul 28',me:'Aug 1', days:5},
      {n:'David Kim',      dept:'IT',         type:'Annual',  s:49,e:53,ms:'Aug 18',me:'Aug 22',days:5}
    ]},
    'FY 2025': {leave:[
      {n:'James Lee',    dept:'Finance',    type:'Annual',  s:15,e:19,ms:'Jul 15',me:'Jul 19',days:5},
      {n:'Amy Park',     dept:'Admin',      type:'Sick',    s:22,e:23,ms:'Jul 22',me:'Jul 23',days:2},
      {n:'Tom Hughes',   dept:'Ministry',   type:'Annual',  s:8, e:9, ms:'Jul 8', me:'Jul 9', days:2},
      {n:'Chris Wu',     dept:'Ministry',   type:'Personal',s:36,e:36,ms:'Aug 5', me:'Aug 5', days:1},
      {n:'Maria Chen',   dept:'Facilities', type:'Annual',  s:29,e:33,ms:'Jul 29',me:'Aug 2', days:5},
      {n:'Kevin Okafor', dept:'Facilities', type:'Sick',    s:12,e:14,ms:'Jul 12',me:'Jul 14',days:3}
    ]},
    'FY 2024': {leave:[
      {n:'Sarah Mitchell',dept:'Finance',    type:'Annual',  s:8, e:12,ms:'Jul 8', me:'Jul 12',days:5},
      {n:'Rachel Brown',  dept:'Admin',      type:'Annual',  s:22,e:26,ms:'Jul 22',me:'Jul 26',days:5},
      {n:'Chris Wu',      dept:'Ministry',   type:'Annual',  s:15,e:19,ms:'Jul 15',me:'Jul 19',days:5},
      {n:'Tom Hughes',    dept:'Ministry',   type:'Personal',s:29,e:29,ms:'Jul 29',me:'Jul 29',days:1},
      {n:'David Kim',     dept:'IT',         type:'Sick',    s:10,e:11,ms:'Jul 10',me:'Jul 11',days:2}
    ]}
  },
  'Finance': {
    'FY 2026': {leave:[{n:'James Lee',dept:'Finance',type:'Annual',s:8,e:9,ms:'Jul 8',me:'Jul 9',days:2},{n:'Sarah Mitchell',dept:'Finance',type:'Annual',s:14,e:18,ms:'Jul 14',me:'Jul 18',days:5},{n:'Linda Perez',dept:'Finance',type:'Personal',s:21,e:21,ms:'Jul 21',me:'Jul 21',days:1}]},
    'FY 2025': {leave:[{n:'James Lee',dept:'Finance',type:'Annual',s:15,e:19,ms:'Jul 15',me:'Jul 19',days:5}]},
    'FY 2024': {leave:[{n:'Sarah Mitchell',dept:'Finance',type:'Annual',s:8,e:12,ms:'Jul 8',me:'Jul 12',days:5}]}
  },
  'Admin': {
    'FY 2026': {leave:[{n:'Rachel Brown',dept:'Admin',type:'Sick',s:12,e:12,ms:'Jul 12',me:'Jul 12',days:1},{n:'Amy Park',dept:'Admin',type:'Annual',s:35,e:39,ms:'Aug 4',me:'Aug 8',days:5}]},
    'FY 2025': {leave:[{n:'Amy Park',dept:'Admin',type:'Sick',s:22,e:23,ms:'Jul 22',me:'Jul 23',days:2}]},
    'FY 2024': {leave:[{n:'Rachel Brown',dept:'Admin',type:'Annual',s:22,e:26,ms:'Jul 22',me:'Jul 26',days:5}]}
  },
  'Ministry': {
    'FY 2026': {leave:[{n:'Tom Hughes',dept:'Ministry',type:'Sick',s:21,e:23,ms:'Jul 21',me:'Jul 23',days:3},{n:'Chris Wu',dept:'Ministry',type:'Annual',s:42,e:46,ms:'Aug 11',me:'Aug 15',days:5}]},
    'FY 2025': {leave:[{n:'Tom Hughes',dept:'Ministry',type:'Annual',s:8,e:9,ms:'Jul 8',me:'Jul 9',days:2},{n:'Chris Wu',dept:'Ministry',type:'Personal',s:36,e:36,ms:'Aug 5',me:'Aug 5',days:1}]},
    'FY 2024': {leave:[{n:'Chris Wu',dept:'Ministry',type:'Annual',s:15,e:19,ms:'Jul 15',me:'Jul 19',days:5},{n:'Tom Hughes',dept:'Ministry',type:'Personal',s:29,e:29,ms:'Jul 29',me:'Jul 29',days:1}]}
  },
  'Facilities': {
    'FY 2026': {leave:[{n:'Maria Chen',dept:'Facilities',type:'Personal',s:28,e:28,ms:'Jul 28',me:'Jul 28',days:1},{n:'Kevin Okafor',dept:'Facilities',type:'Annual',s:28,e:32,ms:'Jul 28',me:'Aug 1',days:5}]},
    'FY 2025': {leave:[{n:'Maria Chen',dept:'Facilities',type:'Annual',s:29,e:33,ms:'Jul 29',me:'Aug 2',days:5},{n:'Kevin Okafor',dept:'Facilities',type:'Sick',s:12,e:14,ms:'Jul 12',me:'Jul 14',days:3}]},
    'FY 2024': {leave:[{n:'Maria Chen',dept:'Facilities',type:'Annual',s:8,e:12,ms:'Jul 8',me:'Jul 12',days:5}]}
  },
  'IT': {
    'FY 2026': {leave:[{n:'David Kim',dept:'IT',type:'Annual',s:49,e:53,ms:'Aug 18',me:'Aug 22',days:5}]},
    'FY 2025': {leave:[]},
    'FY 2024': {leave:[{n:'David Kim',dept:'IT',type:'Sick',s:10,e:11,ms:'Jul 10',me:'Jul 11',days:2}]}
  }
};

// W10 — Loans With Balance Due
MOCK_DATA.series[10] = {
  'All Types': {
    'FY 2026': {loans:[
      {n:'Main Property',    type:'Property', bal:288000,orig:480000,pmt:4200,rate:'4.2%',s:'Active',    sc:'#4caf50'},
      {n:'Ministry Centre',  type:'Property', bal:152000,orig:220000,pmt:2800,rate:'3.9%',s:'Active',    sc:'#4caf50'},
      {n:'Vehicle Fleet',    type:'Vehicle',  bal:80600, orig:124000,pmt:2100,rate:'5.8%',s:'Active',    sc:'#4caf50'},
      {n:'Van #2',           type:'Vehicle',  bal:22400, orig:38000, pmt:680, rate:'5.2%',s:'Active',    sc:'#4caf50'},
      {n:'Equipment Lease',  type:'Equipment',bal:49200, orig:82000, pmt:1400,rate:'6.1%',s:'Active',    sc:'#4caf50'},
      {n:'IT Infrastructure',type:'Equipment',bal:12800, orig:22000, pmt:640, rate:'0.0%',s:'In Arrears',sc:'#e53935'},
      {n:'Sound System',     type:'Equipment',bal:8600,  orig:14500, pmt:350, rate:'4.5%',s:'Active',    sc:'#4caf50'}
    ]},
    'FY 2025': {loans:[
      {n:'Main Property',    type:'Property', bal:337000,orig:480000,pmt:4200,rate:'4.2%',s:'Active',    sc:'#4caf50'},
      {n:'Ministry Centre',  type:'Property', bal:180000,orig:220000,pmt:2800,rate:'3.9%',s:'Active',    sc:'#4caf50'},
      {n:'Vehicle Fleet',    type:'Vehicle',  bal:102000,orig:124000,pmt:2100,rate:'5.8%',s:'Active',    sc:'#4caf50'},
      {n:'Van #2',           type:'Vehicle',  bal:30200, orig:38000, pmt:680, rate:'5.2%',s:'Active',    sc:'#4caf50'},
      {n:'Equipment Lease',  type:'Equipment',bal:64000, orig:82000, pmt:1400,rate:'6.1%',s:'Active',    sc:'#4caf50'},
      {n:'IT Infrastructure',type:'Equipment',bal:18400, orig:22000, pmt:640, rate:'0.0%',s:'In Arrears',sc:'#e53935'},
      {n:'Sound System',     type:'Equipment',bal:11800, orig:14500, pmt:350, rate:'4.5%',s:'Active',    sc:'#4caf50'}
    ]},
    'FY 2024': {loans:[
      {n:'Main Property',    type:'Property', bal:384000,orig:480000,pmt:4200,rate:'4.2%',s:'Active',    sc:'#4caf50'},
      {n:'Ministry Centre',  type:'Property', bal:208000,orig:220000,pmt:2800,rate:'3.9%',s:'Active',    sc:'#4caf50'},
      {n:'Vehicle Fleet',    type:'Vehicle',  bal:118000,orig:124000,pmt:2100,rate:'5.8%',s:'Active',    sc:'#4caf50'},
      {n:'Equipment Lease',  type:'Equipment',bal:76000, orig:82000, pmt:1400,rate:'6.1%',s:'Active',    sc:'#4caf50'},
      {n:'IT Infrastructure',type:'Equipment',bal:21000, orig:22000, pmt:640, rate:'0.0%',s:'In Arrears',sc:'#e53935'},
      {n:'Sound System',     type:'Equipment',bal:14100, orig:14500, pmt:350, rate:'4.5%',s:'Active',    sc:'#4caf50'}
    ]}
  },
  'Property': {
    'FY 2026': {loans:[{n:'Main Property',type:'Property',bal:288000,orig:480000,pmt:4200,rate:'4.2%',s:'Active',sc:'#4caf50'},{n:'Ministry Centre',type:'Property',bal:152000,orig:220000,pmt:2800,rate:'3.9%',s:'Active',sc:'#4caf50'}]},
    'FY 2025': {loans:[{n:'Main Property',type:'Property',bal:337000,orig:480000,pmt:4200,rate:'4.2%',s:'Active',sc:'#4caf50'},{n:'Ministry Centre',type:'Property',bal:180000,orig:220000,pmt:2800,rate:'3.9%',s:'Active',sc:'#4caf50'}]},
    'FY 2024': {loans:[{n:'Main Property',type:'Property',bal:384000,orig:480000,pmt:4200,rate:'4.2%',s:'Active',sc:'#4caf50'},{n:'Ministry Centre',type:'Property',bal:208000,orig:220000,pmt:2800,rate:'3.9%',s:'Active',sc:'#4caf50'}]}
  },
  'Vehicle': {
    'FY 2026': {loans:[{n:'Vehicle Fleet',type:'Vehicle',bal:80600,orig:124000,pmt:2100,rate:'5.8%',s:'Active',sc:'#4caf50'},{n:'Van #2',type:'Vehicle',bal:22400,orig:38000,pmt:680,rate:'5.2%',s:'Active',sc:'#4caf50'}]},
    'FY 2025': {loans:[{n:'Vehicle Fleet',type:'Vehicle',bal:102000,orig:124000,pmt:2100,rate:'5.8%',s:'Active',sc:'#4caf50'},{n:'Van #2',type:'Vehicle',bal:30200,orig:38000,pmt:680,rate:'5.2%',s:'Active',sc:'#4caf50'}]},
    'FY 2024': {loans:[{n:'Vehicle Fleet',type:'Vehicle',bal:118000,orig:124000,pmt:2100,rate:'5.8%',s:'Active',sc:'#4caf50'}]}
  },
  'Equipment': {
    'FY 2026': {loans:[{n:'Equipment Lease',type:'Equipment',bal:49200,orig:82000,pmt:1400,rate:'6.1%',s:'Active',sc:'#4caf50'},{n:'IT Infrastructure',type:'Equipment',bal:12800,orig:22000,pmt:640,rate:'0.0%',s:'In Arrears',sc:'#e53935'},{n:'Sound System',type:'Equipment',bal:8600,orig:14500,pmt:350,rate:'4.5%',s:'Active',sc:'#4caf50'}]},
    'FY 2025': {loans:[{n:'Equipment Lease',type:'Equipment',bal:64000,orig:82000,pmt:1400,rate:'6.1%',s:'Active',sc:'#4caf50'},{n:'IT Infrastructure',type:'Equipment',bal:18400,orig:22000,pmt:640,rate:'0.0%',s:'In Arrears',sc:'#e53935'},{n:'Sound System',type:'Equipment',bal:11800,orig:14500,pmt:350,rate:'4.5%',s:'Active',sc:'#4caf50'}]},
    'FY 2024': {loans:[{n:'Equipment Lease',type:'Equipment',bal:76000,orig:82000,pmt:1400,rate:'6.1%',s:'Active',sc:'#4caf50'},{n:'IT Infrastructure',type:'Equipment',bal:21000,orig:22000,pmt:640,rate:'0.0%',s:'In Arrears',sc:'#e53935'}]}
  }
};

// W11 — Fixed Assets
MOCK_DATA.series[11] = {
  'All Categories': {cats:[
    {l:'Buildings', c:'#4b6ec3',orig:1800000,depn:240000, rate:0.15},
    {l:'Vehicles',  c:'#6e8bd4',orig:320000, depn:128000, rate:0.40},
    {l:'Equipment', c:'#a0b5e6',orig:215000, depn:107500, rate:0.50},
    {l:'IT Assets', c:'#c4d4f0',orig:95000,  depn:66500,  rate:0.70},
    {l:'Furniture', c:'#dce7fa',orig:48000,  depn:24000,  rate:0.50}
  ]},
  'Buildings': {cats:[{l:'Buildings',c:'#4b6ec3',orig:1800000,depn:240000,rate:0.15}]},
  'Vehicles':  {cats:[{l:'Vehicles', c:'#6e8bd4',orig:320000, depn:128000,rate:0.40}]},
  'Equipment': {cats:[{l:'Equipment',c:'#a0b5e6',orig:215000, depn:107500,rate:0.50}]},
  'IT Assets': {cats:[{l:'IT Assets',c:'#c4d4f0',orig:95000,  depn:66500, rate:0.70}]},
  'Furniture': {cats:[{l:'Furniture',c:'#dce7fa',orig:48000,  depn:24000, rate:0.50}]}
};

// W12 — Empty Slot
MOCK_DATA.series[12] = {};

// W13 — Purchasing Management
MOCK_DATA.series[13] = {
  'All': {
    'FY 2026': {pos:[
      {ref:'PO-2847',vendor:'Office Depot',   dept:'Finance',   amt:4200,due:'Jun 24',s:'Overdue'},
      {ref:'PO-2851',vendor:'Tech Supplies',  dept:'Admin',     amt:1800,due:'Jul 8', s:'Pending Approval'},
      {ref:'PO-2855',vendor:'Catering Co.',   dept:'Ministry',  amt:620, due:'Jul 5', s:'Approved'},
      {ref:'PO-2862',vendor:'Print Works',    dept:'Admin',     amt:340, due:'Jul 6', s:'Approved'},
      {ref:'PO-2864',vendor:'IT Direct',      dept:'Finance',   amt:2900,due:'Jul 12',s:'Pending Approval'},
      {ref:'PO-2870',vendor:'Facilities Plus',dept:'Facilities',amt:780, due:'Jul 15',s:'Pending Approval'},
      {ref:'PO-2874',vendor:'Cleaning Svcs',  dept:'Facilities',amt:550, due:'Jul 10',s:'Approved'},
      {ref:'PO-2878',vendor:'Office Depot',   dept:'Ministry',  amt:290, due:'Jul 8', s:'Approved'},
      {ref:'PO-2881',vendor:'Tech Supplies',  dept:'IT',        amt:3400,due:'Jul 18',s:'Pending Approval'},
      {ref:'PO-2884',vendor:'Catering Co.',   dept:'Admin',     amt:480, due:'Jun 30',s:'Overdue'}
    ]},
    'FY 2025': {pos:[
      {ref:'PO-2600',vendor:'Office Depot',   dept:'Finance',   amt:3800,due:'Jun 20',s:'Overdue'},
      {ref:'PO-2612',vendor:'Tech Supplies',  dept:'IT',        amt:5200,due:'Jul 3', s:'Approved'},
      {ref:'PO-2618',vendor:'Catering Co.',   dept:'Ministry',  amt:710, due:'Jun 28',s:'Overdue'},
      {ref:'PO-2625',vendor:'Print Works',    dept:'Admin',     amt:410, due:'Jul 1', s:'Approved'},
      {ref:'PO-2633',vendor:'IT Direct',      dept:'Finance',   amt:1900,due:'Jul 6', s:'Approved'},
      {ref:'PO-2640',vendor:'Facilities Plus',dept:'Facilities',amt:920, due:'Jul 10',s:'Approved'},
      {ref:'PO-2648',vendor:'Cleaning Svcs',  dept:'Facilities',amt:480, due:'Jun 25',s:'Overdue'},
      {ref:'PO-2655',vendor:'Office Depot',   dept:'Ministry',  amt:350, due:'Jul 14',s:'Pending Approval'}
    ]},
    'FY 2024': {pos:[
      {ref:'PO-2320',vendor:'Tech Supplies',  dept:'IT',        amt:6800,due:'Jun 15',s:'Overdue'},
      {ref:'PO-2335',vendor:'Office Depot',   dept:'Finance',   amt:2900,due:'Jun 18',s:'Overdue'},
      {ref:'PO-2341',vendor:'Catering Co.',   dept:'Ministry',  amt:580, due:'Jun 22',s:'Approved'},
      {ref:'PO-2348',vendor:'IT Direct',      dept:'Finance',   amt:4100,due:'Jul 2', s:'Approved'},
      {ref:'PO-2355',vendor:'Facilities Plus',dept:'Facilities',amt:1100,due:'Jul 5', s:'Approved'},
      {ref:'PO-2362',vendor:'Print Works',    dept:'Admin',     amt:280, due:'Jun 28',s:'Approved'}
    ]}
  },
  'Pending Approval': {
    'FY 2026': {pos:[{ref:'PO-2851',vendor:'Tech Supplies',dept:'Admin',amt:1800,due:'Jul 8',s:'Pending Approval'},{ref:'PO-2864',vendor:'IT Direct',dept:'Finance',amt:2900,due:'Jul 12',s:'Pending Approval'},{ref:'PO-2870',vendor:'Facilities Plus',dept:'Facilities',amt:780,due:'Jul 15',s:'Pending Approval'},{ref:'PO-2881',vendor:'Tech Supplies',dept:'IT',amt:3400,due:'Jul 18',s:'Pending Approval'}]},
    'FY 2025': {pos:[{ref:'PO-2655',vendor:'Office Depot',dept:'Ministry',amt:350,due:'Jul 14',s:'Pending Approval'}]},
    'FY 2024': {pos:[]}
  },
  'Approved': {
    'FY 2026': {pos:[{ref:'PO-2855',vendor:'Catering Co.',dept:'Ministry',amt:620,due:'Jul 5',s:'Approved'},{ref:'PO-2862',vendor:'Print Works',dept:'Admin',amt:340,due:'Jul 6',s:'Approved'},{ref:'PO-2874',vendor:'Cleaning Svcs',dept:'Facilities',amt:550,due:'Jul 10',s:'Approved'},{ref:'PO-2878',vendor:'Office Depot',dept:'Ministry',amt:290,due:'Jul 8',s:'Approved'}]},
    'FY 2025': {pos:[{ref:'PO-2612',vendor:'Tech Supplies',dept:'IT',amt:5200,due:'Jul 3',s:'Approved'},{ref:'PO-2625',vendor:'Print Works',dept:'Admin',amt:410,due:'Jul 1',s:'Approved'},{ref:'PO-2633',vendor:'IT Direct',dept:'Finance',amt:1900,due:'Jul 6',s:'Approved'},{ref:'PO-2640',vendor:'Facilities Plus',dept:'Facilities',amt:920,due:'Jul 10',s:'Approved'}]},
    'FY 2024': {pos:[{ref:'PO-2341',vendor:'Catering Co.',dept:'Ministry',amt:580,due:'Jun 22',s:'Approved'},{ref:'PO-2348',vendor:'IT Direct',dept:'Finance',amt:4100,due:'Jul 2',s:'Approved'},{ref:'PO-2355',vendor:'Facilities Plus',dept:'Facilities',amt:1100,due:'Jul 5',s:'Approved'},{ref:'PO-2362',vendor:'Print Works',dept:'Admin',amt:280,due:'Jun 28',s:'Approved'}]}
  },
  'Overdue': {
    'FY 2026': {pos:[{ref:'PO-2847',vendor:'Office Depot',dept:'Finance',amt:4200,due:'Jun 24',s:'Overdue'},{ref:'PO-2884',vendor:'Catering Co.',dept:'Admin',amt:480,due:'Jun 30',s:'Overdue'}]},
    'FY 2025': {pos:[{ref:'PO-2600',vendor:'Office Depot',dept:'Finance',amt:3800,due:'Jun 20',s:'Overdue'},{ref:'PO-2618',vendor:'Catering Co.',dept:'Ministry',amt:710,due:'Jun 28',s:'Overdue'},{ref:'PO-2648',vendor:'Cleaning Svcs',dept:'Facilities',amt:480,due:'Jun 25',s:'Overdue'}]},
    'FY 2024': {pos:[{ref:'PO-2320',vendor:'Tech Supplies',dept:'IT',amt:6800,due:'Jun 15',s:'Overdue'},{ref:'PO-2335',vendor:'Office Depot',dept:'Finance',amt:2900,due:'Jun 18',s:'Overdue'}]}
  }
};

// W14 — Quick Actions
MOCK_DATA.series[14] = {
  'All Tasks': {actions:[
    {ico:'receipt',         l:'New Invoice', d:'Create a customer invoice',    type:'Finance',   c:'#eef2fb',tc:'#4b6ec3'},
    {ico:'payments',        l:'Run Payroll', d:'Submit the next payroll run',  type:'Payroll',   c:'#f0faf1',tc:'#2e7d32'},
    {ico:'add_card',        l:'Add Expense', d:'Record an expense claim',      type:'Finance',   c:'#fff8e1',tc:'#b75a00'},
    {ico:'account_balance', l:'Reconcile',   d:'Reconcile bank accounts',      type:'Finance',   c:'#eef2fb',tc:'#4b6ec3'},
    {ico:'shopping_cart',   l:'New PO',      d:'Create a purchase order',      type:'Purchasing',c:'#eef2fb',tc:'#4b6ec3'},
    {ico:'group_add',       l:'New Employee',d:'Add a new staff member',       type:'HR',        c:'#f3f0ff',tc:'#7c3aed'}
  ]},
  'Finance':    {actions:[
    {ico:'receipt',        l:'New Invoice',d:'Create a customer invoice',  type:'Finance',c:'#eef2fb',tc:'#4b6ec3'},
    {ico:'add_card',       l:'Add Expense',d:'Record an expense claim',    type:'Finance',c:'#fff8e1',tc:'#b75a00'},
    {ico:'account_balance',l:'Reconcile',  d:'Reconcile bank accounts',    type:'Finance',c:'#eef2fb',tc:'#4b6ec3'}
  ]},
  'Payroll':    {actions:[{ico:'payments',      l:'Run Payroll', d:'Submit the next payroll run', type:'Payroll',   c:'#f0faf1',tc:'#2e7d32'}]},
  'HR':         {actions:[{ico:'group_add',     l:'New Employee',d:'Add a new staff member',      type:'HR',        c:'#f3f0ff',tc:'#7c3aed'}]},
  'Purchasing': {actions:[{ico:'shopping_cart', l:'New PO',      d:'Create a purchase order',     type:'Purchasing',c:'#eef2fb',tc:'#4b6ec3'}]}
};

// W15 — Bank Balances
MOCK_DATA.series[15] = {
  'All Accounts': {accts:[
    {n:'Main Checking',  bal:220400,s:'Reconciled',sc:'#4caf50',ico:'account_balance',d:'Reconciled Jul 1'},
    {n:'Savings Reserve',bal:120000,s:'Reconciled',sc:'#4caf50',ico:'savings',        d:'Reconciled Jul 1'},
    {n:'Investment CD',  bal:60000, s:'Pending',   sc:'#ff9800',ico:'show_chart',     d:'Pending — action needed'},
    {n:'Petty Cash',     bal:1200,  s:'Reconciled',sc:'#4caf50',ico:'payments',       d:'Reconciled Jul 1'}
  ]},
  'Main Checking':  {accts:[{n:'Main Checking',  bal:220400,s:'Reconciled',sc:'#4caf50',ico:'account_balance',d:'Reconciled Jul 1'}]},
  'Savings Reserve':{accts:[{n:'Savings Reserve',bal:120000,s:'Reconciled',sc:'#4caf50',ico:'savings',        d:'Reconciled Jul 1'}]},
  'Investment CD':  {accts:[{n:'Investment CD',  bal:60000, s:'Pending',   sc:'#ff9800',ico:'show_chart',     d:'Pending — action needed'}]},
  'Petty Cash':     {accts:[{n:'Petty Cash',     bal:1200,  s:'Reconciled',sc:'#4caf50',ico:'payments',       d:'Reconciled Jul 1'}]}
};

// W16 — Accounts Payable By Due Date
MOCK_DATA.series[16] = {
  'All': {ap:[
    {vendor:'Office Depot',     ref:'INV-0841',amt:4200, due:'Jun 24',age:13,band:'90+',   bc:'#e53935'},
    {vendor:'Tech Supplies',    ref:'INV-0886',amt:3600, due:'Apr 15',age:83,band:'90+',   bc:'#e53935'},
    {vendor:'Cleaning Services',ref:'INV-0875',amt:450,  due:'Jun 10',age:27,band:'31-60', bc:'#ff7043'},
    {vendor:'Tech Supplies',    ref:'INV-0852',amt:1800, due:'Jul 2', age:5, band:'31-60', bc:'#ff7043'},
    {vendor:'Office Depot',     ref:'INV-0880',amt:1100, due:'May 28',age:40,band:'61-90', bc:'#ff7043'},
    {vendor:'Catering Co.',     ref:'INV-0855',amt:620,  due:'Jul 5', age:2, band:'0-30',  bc:'#ff9800'},
    {vendor:'Print Works',      ref:'INV-0862',amt:340,  due:'Jul 6', age:1, band:'0-30',  bc:'#ff9800'},
    {vendor:'IT Direct',        ref:'INV-0863',amt:2900, due:'Jul 8', age:0, band:'0-30',  bc:'#4caf50'},
    {vendor:'Catering Co.',     ref:'INV-0883',amt:280,  due:'Jul 12',age:0, band:'0-30',  bc:'#4caf50'},
    {vendor:'Facilities Plus',  ref:'INV-0871',amt:780,  due:'Jul 15',age:0, band:'0-30',  bc:'#4caf50'}
  ]},
  'Overdue Now': {ap:[
    {vendor:'Office Depot',     ref:'INV-0841',amt:4200, due:'Jun 24',age:13,band:'90+',   bc:'#e53935'},
    {vendor:'Tech Supplies',    ref:'INV-0886',amt:3600, due:'Apr 15',age:83,band:'90+',   bc:'#e53935'},
    {vendor:'Cleaning Services',ref:'INV-0875',amt:450,  due:'Jun 10',age:27,band:'31-60', bc:'#ff7043'},
    {vendor:'Tech Supplies',    ref:'INV-0852',amt:1800, due:'Jul 2', age:5, band:'31-60', bc:'#ff7043'},
    {vendor:'Office Depot',     ref:'INV-0880',amt:1100, due:'May 28',age:40,band:'61-90', bc:'#ff7043'},
    {vendor:'Catering Co.',     ref:'INV-0855',amt:620,  due:'Jul 5', age:2, band:'0-30',  bc:'#ff9800'},
    {vendor:'Print Works',      ref:'INV-0862',amt:340,  due:'Jul 6', age:1, band:'0-30',  bc:'#ff9800'}
  ]},
  'Due This Week': {ap:[
    {vendor:'IT Direct',       ref:'INV-0863',amt:2900,due:'Jul 8', age:0,band:'0-30',bc:'#4caf50'},
    {vendor:'Catering Co.',    ref:'INV-0883',amt:280, due:'Jul 12',age:0,band:'0-30',bc:'#4caf50'}
  ]},
  'Due This Month': {ap:[
    {vendor:'Catering Co.',    ref:'INV-0855',amt:620, due:'Jul 5', age:2,band:'0-30',bc:'#ff9800'},
    {vendor:'Print Works',     ref:'INV-0862',amt:340, due:'Jul 6', age:1,band:'0-30',bc:'#ff9800'},
    {vendor:'IT Direct',       ref:'INV-0863',amt:2900,due:'Jul 8', age:0,band:'0-30',bc:'#4caf50'},
    {vendor:'Catering Co.',    ref:'INV-0883',amt:280, due:'Jul 12',age:0,band:'0-30',bc:'#4caf50'},
    {vendor:'Facilities Plus', ref:'INV-0871',amt:780, due:'Jul 15',age:0,band:'0-30',bc:'#4caf50'}
  ]}
};

// W17 — Gifts Pledges
MOCK_DATA.series[17] = {
  'All Campaigns': {
    'FY 2026': {items:[
      {l:'Building Fund',  p:120000,r:96000, c:'#4caf50'},
      {l:'Youth Ministry', p:85000, r:51000, c:'#ff9800'},
      {l:'Outreach',       p:50000, r:47500, c:'#4caf50'},
      {l:'Missions',       p:32000, r:12800, c:'#e53935'},
      {l:'Capital Fund',   p:250000,r:137500,c:'#ff9800'},
      {l:'Music Ministry', p:18000, r:14400, c:'#4caf50'}
    ]},
    'FY 2025': {items:[
      {l:'Building Fund',  p:110000,r:99000, c:'#4caf50'},
      {l:'Youth Ministry', p:78000, r:62400, c:'#4caf50'},
      {l:'Outreach',       p:45000, r:40500, c:'#4caf50'},
      {l:'Missions',       p:28000, r:19600, c:'#ff9800'},
      {l:'Capital Fund',   p:220000,r:143000,c:'#4caf50'},
      {l:'Music Ministry', p:16000, r:11200, c:'#ff9800'}
    ]},
    'FY 2024': {items:[
      {l:'Building Fund',  p:98000, r:83300, c:'#4caf50'},
      {l:'Youth Ministry', p:70000, r:49000, c:'#ff9800'},
      {l:'Outreach',       p:40000, r:34000, c:'#4caf50'},
      {l:'Missions',       p:25000, r:10000, c:'#e53935'},
      {l:'Capital Fund',   p:180000,r:99000, c:'#ff9800'},
      {l:'Music Ministry', p:14000, r:8400,  c:'#ff9800'}
    ]}
  },
  'Building Fund':  {
    'FY 2026': {items:[{l:'Building Fund', p:120000,r:96000, c:'#4caf50'}]},
    'FY 2025': {items:[{l:'Building Fund', p:110000,r:99000, c:'#4caf50'}]},
    'FY 2024': {items:[{l:'Building Fund', p:98000, r:83300, c:'#4caf50'}]}
  },
  'Youth Ministry': {
    'FY 2026': {items:[{l:'Youth Ministry',p:85000, r:51000, c:'#ff9800'}]},
    'FY 2025': {items:[{l:'Youth Ministry',p:78000, r:62400, c:'#4caf50'}]},
    'FY 2024': {items:[{l:'Youth Ministry',p:70000, r:49000, c:'#ff9800'}]}
  },
  'Outreach': {
    'FY 2026': {items:[{l:'Outreach',      p:50000, r:47500, c:'#4caf50'}]},
    'FY 2025': {items:[{l:'Outreach',      p:45000, r:40500, c:'#4caf50'}]},
    'FY 2024': {items:[{l:'Outreach',      p:40000, r:34000, c:'#4caf50'}]}
  },
  'Missions': {
    'FY 2026': {items:[{l:'Missions',      p:32000, r:12800, c:'#e53935'}]},
    'FY 2025': {items:[{l:'Missions',      p:28000, r:19600, c:'#ff9800'}]},
    'FY 2024': {items:[{l:'Missions',      p:25000, r:10000, c:'#e53935'}]}
  },
  'Capital Fund': {
    'FY 2026': {items:[{l:'Capital Fund',  p:250000,r:137500,c:'#ff9800'}]},
    'FY 2025': {items:[{l:'Capital Fund',  p:220000,r:143000,c:'#4caf50'}]},
    'FY 2024': {items:[{l:'Capital Fund',  p:180000,r:99000, c:'#ff9800'}]}
  },
  'Music Ministry': {
    'FY 2026': {items:[{l:'Music Ministry',p:18000, r:14400, c:'#4caf50'}]},
    'FY 2025': {items:[{l:'Music Ministry',p:16000, r:11200, c:'#ff9800'}]},
    'FY 2024': {items:[{l:'Music Ministry',p:14000, r:8400,  c:'#ff9800'}]}
  }
};

