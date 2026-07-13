# Shelby Financials Dashboard Re-platform — Project Index

> **What this file is:** A navigation and context document for Claude (and anyone else picking this up). It lists every file in this project, explains why it was created, what it was built from, and what state it's in. Do not edit the files listed here — come back to this index first to understand what exists before starting new work.

**Project:** Shelby Financials dashboard re-platform investigation  
**Owner:** Oisin Curran — oisin.curran@ministrybrands.com  
**Last updated:** 2026-07-07  
**Note:** After initial creation, `Design Improvement Options.md`, `Dashboard Widget Reference.md`, and `Dashboard Widget Mockups.html` were moved into the `Mock work/` folder. Delete the originals from their old locations manually (sandbox cannot delete Windows files).

---

## Project Goal

Investigate the existing Shelby Financials dashboard, document what each widget does and where it gets its data, then produce design improvement options for use in a re-platform to Ministry Brands' Pathway Design System (MB 2.0).

The work moves in three steps:
1. **Purpose documents** — what does each widget do right now? (Step 1: document reality)
2. **Design improvement options** — what should each widget become? (Step 2: design direction)
3. **Visual mockups** — show three design options per widget using the actual design system (Step 3: prototype)

---

## File Map

### Root level — `For Dashboard/`

| File | What it is | Status |
|------|------------|--------|
| `Dashboard Tracker.xlsx` | Master tracker spreadsheet. Contains a status table for all 17 widgets (review status, chart type, data source, complexity) plus a Purpose tab with the full widget data dump. | ✅ Complete |
| `PROJECT INDEX.md` | This file. | — |

---

### Mock work folder — `Mock work/`

The output/deliverable files — the things produced from the research, intended to be shared with design and development.

| File | What it is | Status |
|------|------------|--------|
| `Dashboard Widget Mockups.html` | Single-file HTML prototype. All 17 widgets × 3 design options each. Interactive sidebar, live dummy-data visualisations, improvement notes, and inspiration links. Built with Pathway DS styling. | ⚠️ Built — JS syntax error being investigated (see notes below) |
| `Dashboard Widget Reference.md` | Consolidated table of all 17 widgets: description, content type, review status, data sources, and whether it should be on the Accounting Home default. Widgets are colour-coded 🟢🔵🔴 by how much design work they need. | ✅ Complete |
| `Design Improvement Options.md` | For each widget: current problems, then 3 named design options (A/B/C) with improvement rationale and inspiration links. This is the Step 2 deliverable — feeds directly into the mockup HTML. Links point to `../Dashboard Research/` purpose docs. | ✅ Complete |

---

### Research folder — `Dashboard Research/`

The raw investigation layer — source material that the Mock work files were built from. Do not move these; the links in `Design Improvement Options.md` depend on them staying here.

#### Core reference documents

| File | What it is | Why it was made |
|------|------------|-----------------|
| `README.md` | Top-level description of what the research folder contains. | Created at project start as orientation for anyone opening the folder. |
| `TEMPLATE.md` | Standard template for widget purpose documents (Sections 1–7: purpose, data source, display, filters, interactions, known issues, re-platform notes). | Made so every widget document follows the same structure and is easy to compare. |
| `Chart Inventory.md` | Running list of all 17 dashboard widgets, with investigation status. | Created as a checklist so nothing gets missed. |

#### Widget purpose documents (01–17)

Each file follows the `TEMPLATE.md` structure. Written in plain English — not technical, readable by design, product, and development.

| File | Widget |
|------|--------|
| `01 - Budget Compared to Actual.md` | GL actuals vs budget, period bars + YTD line |
| `02 - Pension Plans.md` | Pension contributions by plan type and district |
| `03 - Payroll Distributions.md` | Payroll cost breakdown by category |
| `04 - Remittance Pledges.md` | Pledge tracking — received vs outstanding |
| `05 - Receivable Invoices Outstanding.md` | AR aging — overdue invoices by age band |
| `06 - Insurance Billing Plans.md` | Insurance enrolment and billing plan status |
| `07 - Deposit Accounts.md` | Bank account balances and reconciliation status |
| `08 - My Status.md` | Personal task/approval queue for the logged-in user |
| `09 - Payroll Scheduled Time Off.md` | Upcoming leave calendar view |
| `10 - Loans With Balance Due.md` | Active loans and balance due |
| `11 - Fixed Asset Values.md` | Asset register with depreciation schedule |
| `12 - None.md` | Slot 12 is currently empty — recommended for removal |
| `13 - Purchasing Management.md` | Purchase orders by status and amount |
| `14 - Main Content Tasks.md` | Quick-action shortcuts / task launcher |
| `15 - Bank Balances.md` | Checking/savings/investment account overview |
| `16 - Accounts Payable By Due Date.md` | AP aging by due date |
| `17 - Gifts Pledges.md` | Donor pledge progress by giving category |

---

### Design system — `Desgin/pathway-ds-main/`

The Ministry Brands Pathway Design System (MB 2.0), cloned locally from GitHub. This is the source of truth for all visual styling in the mockup HTML.

| File | What it is | How it was used |
|------|------------|-----------------|
| `pathway-for-claude.md` | AI-specific prototyping guide. Contains exact CSS variable names, hex values, TopNav/SideNav specs, typography, spacing, and explicit "what NOT to do" rules. | **Primary reference** for every styling decision in the mockup HTML. |
| `pathway-design-kit.md` | Higher-level design system overview. | Supplementary context. |
| `src/tokens/tokens.css` | The compiled CSS custom property file (all design tokens). | Loaded in the mockup HTML via CDN (see CDN references below). |
| `components/top-nav/` | TopNav component spec and HTML reference. | Used to implement the 56px brand-blue top bar in the mockup. |
| `components/sidenav/` | SideNav component spec and HTML reference. | Used to implement the 240px sidebar with active-item left stripe. |

---

## Key Design Decisions and Why

**Why a single HTML file?**  
The mockup needs to be openable by anyone without a build step, server, or Node. A single `.html` file opens in any browser directly from Windows Explorer. All CSS, JS, and dummy data are self-contained.

**Why the Pathway Design System tokens?**  
The re-platform target IS the Pathway DS. Using the real tokens (colours, fonts, spacing) from day one means the mockup looks like the real product, not a generic wireframe. It also means any developer picking this up can copy the token names directly into production code.

**Why Red Hat Text / Red Hat Display?**  
These are the official MB 2.0 typefaces, specified in `pathway-for-claude.md`. Loaded from Google Fonts.

**Why Material Symbols Rounded (not Outlined, not Sharp)?**  
`pathway-for-claude.md` explicitly specifies Rounded variant. Using the wrong variant would produce visually inconsistent icons.

**Why three options per widget?**  
Design reviews go better with choices. Option A is typically a light refresh (low effort), Option B is a meaningful improvement, Option C is a fuller redesign or more exploratory direction. This follows a standard design decision pattern — give stakeholders a spectrum, not a single take-it-or-leave-it.

**Why is widget 12 marked for removal?**  
Slot 12 is "None" — it has no content. The purpose document explains it's a placeholder. Keeping an empty widget in a re-platformed dashboard wastes real estate and confuses users.

---

## CDN References Used in the Mockup HTML

These are the external resources loaded by `Dashboard Widget Mockups.html`. If internet access is unavailable, the mockup will fall back to system fonts but the tokens will not load.

| Resource | URL | Why |
|----------|-----|-----|
| Pathway DS tokens | `https://cdn.jsdelivr.net/gh/helloimjolopez-collab/pathway-ds@main/src/tokens/tokens.css` | Loads all CSS custom properties (colours, spacing, radius, etc.) |
| Material Symbols Rounded | `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded` | Icons used in sidebar and widget cards |
| Red Hat Text | `https://fonts.googleapis.com/css2?family=Red+Hat+Text:wght@400;500;600` | Body font per Pathway DS spec |
| Red Hat Display | `https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@600;700` | Heading font per Pathway DS spec |

---

## External Inspiration Links (used in Design Improvement Options + Mockup)

These are the real URLs embedded as "Inspiration" links in each widget's design options. They were selected to show real-world examples of each pattern being recommended.

| Widget | Link label | URL |
|--------|-----------|-----|
| 1 — Budget vs Actual | Bold BI Budget vs Actual | https://samples.boldbi.com/solutions/finance/budget-vs-actual-dashboard |
| 1 — Budget vs Actual | QuickBooks Budget Report (Coefficient) | https://coefficient.io/templates/quickbooks-budget-vs-actual-report |
| 2 — Pension Plans | Mercer Plan Dashboard | https://www.mercer.com/en-us/solutions/retirement/defined-benefit-pensions/plan-dashboard/ |
| 2 — Pension Plans | PayCaptain Pensions | https://www.paycaptain.com/features/pensions-dashboard |
| 3 — Payroll Distributions | Behance Payroll Dashboard UI | https://www.behance.net/gallery/221873503/HR-Payroll-Management-Dashboard-UI-Design |
| 3 — Payroll Distributions | Figma Payroll Dashboard | https://www.figma.com/community/file/1356263393257478402/free-payroll-dashboard |
| 4 — Remittance Pledges | Virtuous Pledge Tracking | https://virtuous.org/blog/donor-pledge-tracking/ |
| 4 — Remittance Pledges | DonorPerfect Giving Report | https://www.donorperfect.com/giving-report-pledge-progress/ |
| 5 — Receivable Invoices | GlobalData365 AR Dashboard | https://globaldata365.com/accounts-receivable-dashboard/ |
| 5 — Receivable Invoices | Coupler.io AR Dashboard | https://www.coupler.io/dashboard-examples/accounts-receivable-dashboard |
| 6 — Insurance Billing | ADP Benefits Admin | https://www.adp.com/what-we-offer/benefits-administration.aspx |
| 6 — Insurance Billing | Staffbase HR Widgets | https://support.staffbase.com/hc/en-us/articles/27956507092114-Overview-of-HR-Widgets |
| 7 — Deposit Accounts | Xero Dashboard | https://central.xero.com/s/article/Your-Xero-dashboard |
| 7 — Deposit Accounts | Xero Customise Dashboard | https://central.xero.com/s/article/Customise-your-Xero-dashboard |
| 8 — My Status | ADP Workforce Analytics | https://www.adp.com/what-we-offer/workforce-analytics.aspx |
| 9 — Payroll Time Off | BambooHR Time Off | https://www.bamboohr.com/hr-software/time-off-management/ |
| 9 — Payroll Time Off | TeamHub HR Figma | https://www.figma.com/community/file/1552262349953288359/teamhub-hr-team-management-admin-dashboard-ui-design |
| 10 — Loans | Loan Pro Portfolio | https://loanpro.io/resources/loan-portfolio-management/ |
| 10 — Loans | Tableau Loan Portfolio | https://public.tableau.com/app/profile/tableau.finance/viz/LoanPortfolioDashboard |
| 11 — Fixed Assets | GlobalData365 Fixed Assets | https://globaldata365.com/fixed-assets-dashboard/ |
| 11 — Fixed Assets | BlueTally Asset Management | https://bluetally.com/blog/best-fixed-asset-management-software |
| 13 — Purchasing | Uizard PO Dashboard | https://uizard.io/templates/web-app-templates/purchase-order-management-system-web-app/ |
| 13 — Purchasing | AppSmith Order Dashboard | https://www.appsmith.com/use-case/customer-order-dashboard |
| 15 — Bank Balances | Xero Bank Reconciliation | https://www.xero.com/us/features-and-tools/accounting-software/bank-reconciliation/ |
| 16 — Accounts Payable | Coupler.io AP Dashboard | https://www.coupler.io/marketing-dashboards/looker-studio-quickbooks-accounts-payable-dashboard |
| 16 — Accounts Payable | Coefficient AP Dashboard | https://coefficient.io/dashboard-examples/qbo-accounts-payable-dashboard |
| 17 — Gifts Pledges | Bloomerang Pledge Tracking | https://bloomerang.co/blog/pledge-tracking/ |
| 17 — Gifts Pledges | Nielsen Norman — Consistency | https://www.nngroup.com/articles/consistency-and-standards/ |

---

## Current Issues / Open Items

**Dashboard Widget Mockups.html — JS syntax error**  
The HTML file was built and passes `node --check`, but the browser throws `Uncaught SyntaxError: Unexpected token ']'`. The sidebar and content area render blank (only the TopNav is visible). Root cause is likely triple-nested template literals inside the widget 15 (Bank Balances) viz string — a `.map()` callback returning a template literal which itself contains a ternary with two template literal branches. Chrome may not parse this correctly even though Node.js 22 accepts it. Fix: replace nested backtick strings with string concatenation in the affected viz blocks. This is the next task.

---

## How Files Connect

```
Dashboard Research/README.md           ← start here for orientation
        │
        ├── Chart Inventory.md         ← checklist of all 17 widgets
        ├── TEMPLATE.md                ← the format used for every purpose doc
        ├── 01–17 purpose docs         ← one per widget, what it is and how it works
        │
        ├── Mock work/Dashboard Widget Reference.md   ← consolidated table + review status
        └── Mock work/Design Improvement Options.md   ← 3 options per widget (feeds the mockup)
                │
                └── Mock work/Dashboard Widget Mockups.html   ← visual prototype
                        │
                        └── Desgin/pathway-ds-main/pathway-for-claude.md   ← DS reference
```

```
Dashboard Tracker.xlsx   ← master status tracker (separate from the MD files)
```
