/* =============================================================
 * SNAPSHOT — NOT LIVE
 * Version: v2 (data)  |  Captured: 2026-07-09
 * One step later than mock-data.v1.js / mock_data_new.v1.js (already has
 * MOCK_DATA.kpiTimeFilter), but still predates later fixes and decisions —
 * see "Mock_work/00 - INDEX.md" for the full comparison. Nothing here is
 * missing from the live build; this file is historical reference only.
 * MASTER / LIVE SOURCE: Dashboard Widget Mockups.html (first inline <script>)
 * ============================================================= */


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
    {label:"Period View",opts:["Monthly","Quarterly"]}
  ],
  2: [
    {label:"Church District",opts:["All Districts","Central","North","South","East","West"]},
    {label:"Plan Type",opts:["All Plans","Defined Benefit","Defined Contribution","403(b)"]},
    {label:"Year",opts:["FY 2026","FY 2025","FY 2024"]}
  ],
  3: [
    {label:"Pay Period",opts:["Current Period","Last Period","Year to Date"]},
    {label:"Department",opts:["All Departments","Finance","Admin","Ministry","Facilities"]}
  ],
  4: [
    {label:"Date Range",opts:["Current Month","Last Month","Year to Date"]},
    {label:"Campaign",opts:["All Campaigns","Spring Appeal","Year-End","Capital Campaign","Mission Drive"]},
    {label:"Year",opts:["FY 2026","FY 2025","FY 2024"]}
  ],
  5: [
    {label:"Age Band",opts:["All Ages","0-30 days","31-60 days","61-90 days","90+ days"]},
    {label:"Account",opts:["All Accounts","Main Account","Secondary Account"]},
    {label:"Year",opts:["FY 2026","FY 2025","FY 2024"]}
  ],
  6: [
    {label:"Plan Type",opts:["All Plans","PPO Plus","HSA Basic","HMO Core","COBRA","Dental","Vision"]},
    {label:"Status",opts:["All","Active","Inactive"]}
  ],
  7: [
    {label:"Account",opts:["All Accounts","Main Checking","Savings Reserve","Investment CD","Petty Cash"]},
    {label:"Display",opts:["Balance + Status","Balance Only","Reconciliation Status"]}
  ],
  8: [
    {label:"Item Type",opts:["All Items","Invoices","Timesheets","Purchase Orders","Approvals"]},
    {label:"Priority",opts:["All","High Priority","Normal"]}
  ],
  9: [
    {label:"Department",opts:["All Departments","Finance","Admin","Ministry","Facilities","IT"]},
    {label:"Leave Type",opts:["All Types","Annual","Sick","Personal"]},
    {label:"Year",opts:["FY 2026","FY 2025","FY 2024"]}
  ],
  10: [
    {label:"Loan Type",opts:["All Types","Property","Vehicle","Equipment"]},
    {label:"Status",opts:["All","Active","In Arrears"]},
    {label:"Year",opts:["FY 2026","FY 2025","FY 2024"]}
  ],
  11: [
    {label:"Asset Category",opts:["All Categories","Buildings","Vehicles","Equipment","IT Assets","Furniture"]},
    {label:"Depreciation",opts:["Straight Line","Declining Balance"]}
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
    {label:"Account",opts:["All Accounts","Main Checking","Savings Reserve","Investment CD","Petty Cash"]},
    {label:"Show",opts:["Balance + Reconciliation","Balance Only","Reconciliation Only"]}
  ],
  16: [
    {label:"Due Date",opts:["All","Overdue Now","Due This Week","Due This Month"]},
    {label:"Vendor",opts:["All Vendors","Office Depot","Tech Supplies","Catering Co.","Print Works","IT Direct","Facilities Plus","Cleaning Services"]}
  ],
  17: [
    {label:"Campaign",opts:["All Campaigns","Building Fund","Youth Ministry","Outreach","Missions","Capital Fund","Music Ministry"]},
    {label:"Date Range",opts:["Current Month","Year to Date","Campaign Total"]},
    {label:"Year",opts:["FY 2026","FY 2025","FY 2024"]}
  ]
};

// Hard Rule 1 — at KPI size, only the time filter is offered. Default is Fiscal Year everywhere; a widget can
// override here if Fiscal Year isn't its right time dimension (none do yet).
MOCK_DATA.kpiTimeFilter = {
  1: 'Fiscal Year'
};

MOCK_DATA.options = {
  1: [
    {num:"A",title:"Variance Bar",sub:"Keep/Refresh",imp:"Show bars + variance row. Green/red variance row beneath bars answers 'by how much?' without arithmetic.",il:"Bold BI Budget vs Actual",iu:"https://samples.boldbi.com/solutions/finance/budget-vs-actual-dashboard"},
    {num:"B",title:"KPI Cards + Bars",sub:"Improve",imp:"Lead with 4 headline KPI tiles (YTD budget, YTD actual, variance, % used) above bars. Users get the answer before they read the chart.",il:"QuickBooks Budget Report",iu:"https://coefficient.io/templates/quickbooks-budget-vs-actual-report"},
    {num:"C",title:"Waterfall Chart",sub:"Redesign",imp:"Cumulative variance waterfall — each period stacks on the last. Shows drift clearly for board-level review.",il:"Google Looker Waterfall",iu:"https://cloud.google.com/looker/docs/best-practices/how-to-create-waterfall-charts"}
  ],
  2: [
    {num:"A",title:"Grouped Bar by District",sub:"Redesign",imp:"Bars per district coloured by plan type. Correct for comparing across districts.",il:"Mercer Plan Dashboard",iu:"https://www.mercer.com/en-us/solutions/retirement/defined-benefit-pensions/plan-dashboard/"},
    {num:"B",title:"Pie by Plan Type",sub:"Keep/Refresh",imp:"Donut pie showing plan type split. Right chart when the question is proportional.",il:"PayCaptain Pensions",iu:"https://www.paycaptain.com/features/pensions-dashboard"},
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
    {num:"A",title:"Plan Table",sub:"Keep/Refresh",imp:"Tabular plan data with enrolled count, employer %, cost, and status.",il:"Staffbase HR Widgets",iu:"https://support.staffbase.com/hc/en-us/articles/27956507092114-Overview-of-HR-Widgets"},
    {num:"B",title:"Bar by Enrolment",sub:"Improve",imp:"Bar showing enrolled headcount per plan. Good for spotting uptake.",il:"ADP Benefits Admin",iu:"https://www.adp.com/what-we-offer/benefits-administration.aspx"},
    {num:"C",title:"Plan Cards",sub:"Improve",imp:"One card per plan with enrolled count, cost, and status badge.",il:"ADP Benefits Admin",iu:"https://www.adp.com/what-we-offer/benefits-administration.aspx"}
  ],
  7: [
    {num:"A",title:"Account Cards",sub:"Keep/Refresh",imp:"Card per account — name, balance, reconciliation status.",il:"Xero Dashboard",iu:"https://central.xero.com/s/article/Your-Xero-dashboard"},
    {num:"B",title:"Balance Bars",sub:"Improve",imp:"Horizontal bars make balance differences immediately visible.",il:"Xero Customise",iu:"https://central.xero.com/s/article/Customise-your-Xero-dashboard"},
    {num:"C",title:"Compact Table",sub:"Keep/Refresh",imp:"Account, balance, status, last reconciled in a compact table.",il:"Xero Dashboard",iu:"https://central.xero.com/s/article/Your-Xero-dashboard"}
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
    'FY 2026': {periods:[['Jan',78,82],['Feb',72,68],['Mar',88,94],['Apr',76,71],['May',84,88],['Jun',95,91]],totals:['$482k','$494k','+$12k','102%'],varr:[4,-4,6,-5,4,-4]},
    'FY 2025': {periods:[['Jul',74,78],['Aug',80,76],['Sep',82,86],['Oct',71,68],['Nov',88,92],['Dec',96,94],['Jan',78,81],['Feb',70,66],['Mar',84,90],['Apr',75,72],['May',82,85],['Jun',91,88]],totals:['$971k','$976k','+$5k','101%'],varr:[4,-4,4,-3,4,-2,3,-4,6,-3,3,-3]},
    'FY 2024': {periods:[['Jul',68,72],['Aug',75,71],['Sep',79,83],['Oct',66,62],['Nov',83,87],['Dec',90,86],['Jan',72,76],['Feb',65,62],['Mar',80,84],['Apr',70,66],['May',78,82],['Jun',86,90]],totals:['$912k','$921k','+$9k','101%'],varr:[4,-4,4,-4,4,-4,4,-3,4,-4,4,4]}
  },
  'Expense Accounts': {
    'FY 2026': {periods:[['Jan',60,65],['Feb',55,58],['Mar',70,74],['Apr',65,61],['May',75,79],['Jun',80,86]],totals:['$312k','$321k','+$9k','103%'],varr:[-5,-3,-4,4,-4,-6]},
    'FY 2025': {periods:[['Jul',58,62],['Aug',62,60],['Sep',68,72],['Oct',63,60],['Nov',72,76],['Dec',78,82],['Jan',60,64],['Feb',54,57],['Mar',69,73],['Apr',64,60],['May',74,78],['Jun',79,84]],totals:['$801k','$828k','+$27k','103%'],varr:[-4,2,-4,3,-4,-4,-4,-3,-4,4,-4,-5]},
    'FY 2024': {periods:[['Jul',55,58],['Aug',59,57],['Sep',64,68],['Oct',60,57],['Nov',68,72],['Dec',74,78],['Jan',57,60],['Feb',51,54],['Mar',65,69],['Apr',61,57],['May',70,74],['Jun',75,80]],totals:['$759k','$784k','+$25k','103%'],varr:[-3,2,-4,3,-4,-4,-3,-3,-4,4,-4,-5]}
  },
  'Custom Report': {
    'FY 2026': {periods:[['Jan',85,80],['Feb',78,75],['Mar',92,88],['Apr',70,73],['May',88,90],['Jun',95,93]],totals:['$628k','$618k','-$10k','98%'],varr:[5,3,4,-3,-2,2]},
    'FY 2025': {periods:[['Jul',82,78],['Aug',76,73],['Sep',89,85],['Oct',68,71],['Nov',85,88],['Dec',92,90],['Jan',84,79],['Feb',77,74],['Mar',91,87],['Apr',69,72],['May',87,89],['Jun',94,92]],totals:['$1,094k','$1,078k','-$16k','99%'],varr:[4,3,4,-3,-3,2,5,3,4,-3,-2,2]},
    'FY 2024': {periods:[['Jul',78,74],['Aug',72,69],['Sep',85,81],['Oct',64,67],['Nov',81,84],['Dec',88,86],['Jan',80,75],['Feb',73,70],['Mar',87,83],['Apr',65,68],['May',83,85],['Jun',90,88]],totals:['$1,046k','$1,030k','-$16k','98%'],varr:[4,3,4,-3,-3,2,5,3,4,-3,-2,2]}
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
MOCK_DATA.series[3] = {
  'All Departments': {cats:['Net Pay','Fed Tax','Benefits','State Tax','Retirement','Overtime'],vals:[82900,35500,23700,4000,1900,6200],prev:[80100,34200,23100,3900,1800,5800]},
  'Finance':         {cats:['Net Pay','Fed Tax','Benefits','State Tax','Retirement','Overtime'],vals:[24800,10700,7200,1200,580,1400],prev:[23900,10300,6900,1100,560,1200]},
  'Admin':           {cats:['Net Pay','Fed Tax','Benefits','State Tax','Retirement','Overtime'],vals:[18200,7800,5200,880,420,800],prev:[17600,7500,5000,850,400,700]},
  'Ministry':        {cats:['Net Pay','Fed Tax','Benefits','State Tax','Retirement','Overtime'],vals:[28400,12200,8100,1720,660,2800],prev:[27300,11700,7800,1650,630,2600]},
  'Facilities':      {cats:['Net Pay','Fed Tax','Benefits','State Tax','Retirement','Overtime'],vals:[11500,4800,3200,200,240,1200],prev:[11100,4600,3100,200,210,1300]}
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

// W7 — Deposit Accounts
MOCK_DATA.series[7] = {
  'All Accounts': {accts:[
    {n:'Main Checking',  b:220400,s:'Reconciled',sc:'#4caf50',ico:'account_balance',d:'Reconciled Jul 1'},
    {n:'Savings Reserve',b:120000,s:'Reconciled',sc:'#4caf50',ico:'savings',        d:'Reconciled Jul 1'},
    {n:'Investment CD',  b:60000, s:'Pending',   sc:'#ff9800',ico:'show_chart',     d:'Pending since Jun 30'},
    {n:'Petty Cash',     b:1200,  s:'Reconciled',sc:'#4caf50',ico:'payments',       d:'Reconciled Jul 1'}
  ]},
  'Main Checking':  {accts:[{n:'Main Checking',  b:220400,s:'Reconciled',sc:'#4caf50',ico:'account_balance',d:'Reconciled Jul 1'}]},
  'Savings Reserve':{accts:[{n:'Savings Reserve',b:120000,s:'Reconciled',sc:'#4caf50',ico:'savings',        d:'Reconciled Jul 1'}]},
  'Investment CD':  {accts:[{n:'Investment CD',  b:60000, s:'Pending',   sc:'#ff9800',ico:'show_chart',     d:'Pending — action needed'}]},
  'Petty Cash':     {accts:[{n:'Petty Cash',     b:1200,  s:'Reconciled',sc:'#4caf50',ico:'payments',       d:'Reconciled Jul 1'}]}
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

