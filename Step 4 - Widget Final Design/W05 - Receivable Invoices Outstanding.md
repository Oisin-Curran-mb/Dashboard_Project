# W05 — Receivable Invoices Outstanding

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W05-Receivable-Invoices-Outstanding.md](../Step%203%20-%20Mock_Work/Widget_Specs/W05-Receivable-Invoices-Outstanding.md)
**Data source & formulas:** [Step 1 - Dashboard Research/05 - Receivable Invoices Outstanding.md](../Step 1 - Dashboard Research/05%20-%20Receivable%20Invoices%20Outstanding.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (name it) · `[TO CONFIRM]` assumed, with the named owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists; neither side wins by default.

## Purpose
Shows how much money is currently owed to the organisation in unpaid invoices and how long those invoices have been outstanding, so staff can prioritise which outstanding amounts need attention first.

The data shapes named above (outstanding amounts, aging by days overdue) match the legacy widget's documented behaviour [DOC — Step 1 research].

## How Other Companies Fulfil This Purpose
- AR aging dashboards commonly combine a **bar or donut chart** for the aging-bucket breakdown with a **sortable, full-detail table** — a pie chart as the *sole* view is explicitly called out as the wrong choice for aging data ([Vertaccount](https://www.vertaccount.com/blog/best-accounts-receivable-dashboard-examples-templates-for-2026/), [Coupler.io](https://www.coupler.io/dashboard-examples/accounts-receivable-dashboard)) — this directly confirms the old design's pie chart was a real defect, already fixed here. [RESEARCH]
- **KPI snapshot tiles above the aging breakdown** (Total Outstanding, Overdue, Current, Oldest Invoice) is a directly recommended combination. [RESEARCH]

**Net assessment:** the design already matches the standard closely — the main risk this widget carried (a pie chart on aging data) has already been removed.

## Data Contract
What the widget consumes, stated here rather than only linked out. Source tables and formulas below come from the Step 1 research doc, which was confirmed correct against the legacy `ReceivableInvoices : DataPanelControl` class (`/AccountsReceivable`), verified via `Widget_Comparison_Classic.html`, 2026-07-08 [DOC — Step 1 research].

| Field / value shown | Source table / endpoint | Formula (if computed) | Evidence |
|---|---|---|---|
| Invoice inclusion rule | `ARInvoice` (individual AR invoices, including posted status, amounts, and due dates); only invoices that have been formally posted and have an outstanding balance remaining; voided invoices are excluded | `Posted = true AND UndoJournalID = null AND Outstanding != 0` | [DOC — Step 1 research] |
| Outstanding (per invoice) | `ARInvoice` | `TotalAmount + SalesTax − Payments − Discounts − WriteOffs` | [DOC — Step 1 research] |
| Age bucket assignment | Derived per invoice | `Age = Today − DueDate` (in days) → Current (<31), 31–60, 61–90, 91–120, 121+ | [DOC — Step 1 research] |
| Invoice line items (detail panel Details tab) | `ARInvoiceDetail` | n/a | [DOC — Step 1 research] |
| Revenue Center / Source dropdown lists | `ARRevenueCenterRepository` / `ARSourceRepository`; both filter lists are dynamically populated from the data, not fixed | n/a | [DOC — Step 1 research] |
| KPI headline (Total Outstanding $) | Derived | Sum of outstanding across all buckets (legacy totals row shows the full outstanding balance across all buckets) | [DOC — this doc, Views section; totals behaviour DOC — Step 1 research] |
| KPI tiles: Overdue, Current, Oldest Invoice | Derived | Exact tile math is *Not yet specified* in any source | [TO CONFIRM — owner TBD] |
| Bill To (detail panel) | `BillToDisplay` | ⚠️ Known Modern API gap: `BillToDisplay` (the "Bill To" customer name in the detail panel) is always empty in the Modern API — not yet resolved. Design routes around it via the "View full invoice" link (see Drill-Through). | [DOC — Step 1 research] / [TO CONFIRM — owner TBD] |
| Attachments / Note / Payments (detail panel tabs) | Data sources aren't yet verified; design routes to the real AR invoice record via the "View full invoice" link instead (see Drill-Through) | n/a | [TO CONFIRM — owner TBD] |

- **Favourability / direction logic:** invoices in the 121+ bucket always shown in red; 91-120 in amber (see Fine-Tuning Notes) [DOC — this doc].
- **Rounding / currency / locale rules:** *Not yet specified*.
- **Freshness / "data as of" behaviour:** aging is an as-of-today snapshot [DOC — this doc, Filters]. Legacy refresh clears cached data and reloads with the current filter settings [DOC — Step 1 research]. New-design freshness signal: *Not yet specified*.
- **Adjacent Modern API note:** the Modern API defines an `ap-ar-aging` widget (`GET /api/dashboard/ap-ar-aging`) whose AR side uses the same Outstanding formula but a slightly different bucket boundary (Current / 1-30 / 31-60 / 61-90 / 91+) than W05's own 5 buckets — "worth reconciling if both are ever shown side by side" [DOC — Step 3 spec]. Tracked in Sign-off Readiness.

## Widget States
| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified* |
| Empty (org has no outstanding invoices) | *Not yet specified* |
| Partial (some buckets empty) | *Not yet specified* for the new design. Legacy behaviour: rows with a zero balance are not clickable in the bucket-to-detail drill [DOC — Step 1 research]. |
| Loading | *Not yet specified* |
| Error / API failure | *Not yet specified* |
| Stale data | *Not yet specified* for the new design. Aging is an as-of-today snapshot [DOC — this doc]; legacy refresh clears cached data and reloads [DOC — Step 1 research]. |

## Interaction Spec
- **Hover:** *Not yet specified* for the new views. Legacy baseline: hovering over a pie segment shows the outstanding amount for that bucket [DOC — Step 1 research].
- **Click (bucket to detail):** clicking an age bucket row with a value greater than zero opens a detail panel titled "Receivable Invoices Outstanding – Detail", showing individual invoices within that bucket; rows with a zero balance are not clickable [DOC — Step 1 research]. This in-page detail panel is kept as this widget's primary drill answer [DOC — this doc, Drill-Through].
- **Detail panel contents:** Customer name, Bill To (if different from the customer), Due Date, Invoice number, Days Past Due, and Outstanding amount. Each row has an expand arrow revealing four tabs: Details (line items: item name and amount), Attachments, Note, Payments. An Export to Excel and a Close button are available in the detail panel header. [DOC — Step 1 research]
- **Per-invoice "View full invoice" link:** on the Bill-To field and the Attachments/Note/Payments tabs, out to the real AR invoice record (see Drill-Through) [DOC — this doc].
- **Sort interaction:** full invoice-level table is click-to-sort on any column (Invoice #, Customer, Amount, Age, Due Date) [DOC — this doc, Data Table Sort].
- **Filter highlight:** Age Band filter highlights the matching bar in the Aging Bars view [DOC — this doc, Fine-Tuning Notes].
- **Filter behaviour (legacy baseline):** Revenue Center and Source filters are combinable and both narrow table + chart together; filter selections are preserved when the page is refreshed [DOC — Step 1 research].
- **Keyboard / focus behaviour:** *Not yet specified*.

## Filters
| Filter | Values |
|--------|--------|
| Age Band | All Ages · Current (0-30) · 31-60 · 61-90 · 91-120 · 121+ |
| Revenue Center | All Revenue Centers · Church · Insurance Billing · Pension Billing · School |
| Source | All Sources · Insurance Billing · Pension Billing |

No Fiscal Year filter — aging is an as-of-today snapshot with no fiscal-year dimension in the old design. KPI size shows no filter at all (no time dimension exists to fall back to).

**Open question retained from the Step 3 spec** (now tracked in Sign-off Readiness): "raise with backend/dev: is a fiscal-year-scoped filter on invoice *posting* date (not a change to the aging math itself) something worth adding later?" [DOC — Step 3 spec]. The Step 3 spec also flags the KPI-size no-filter arrangement "as an exception to confirm with the wider Hard Rules review" [DOC — Step 3 spec].

## Data Table Sort
Age-band summary: fixed sort by age band ascending, matching bucket severity order. Full invoice-level table: click-to-sort on any column (Invoice #, Customer, Amount, Age, Due Date).

**Trimmed-view rule:** Small shows "2 KPI tiles only (most critical)" (see Size behaviour); which two tiles count as most critical is *Not yet specified*. Default sort of the trimmed invoice-level table before any user click, and the top-N rule for trimmed table rows, is *Not yet specified*.

## Drill-Through
No separate page link for the widget as a whole — Revenue Center/Source data spans multiple originating modules, so there's no single unambiguous source page to link to. The in-page detail panel (bucket → invoice list → expandable Details/Attachments/Note/Payments tabs, Export, Close) remains this widget's primary answer to the requirement.

**Targeted exception, added this round:** the Bill-To field and the Attachments/Note/Payments tabs specifically get a **"View full invoice" link** per invoice, out to the real AR invoice record, instead of trying to reproduce that data inside the widget. Bill-To is a confirmed empty-field bug in the Modern API today, and the Attachments/Note/Payments data sources aren't yet verified — rather than wait on a bug fix or build new endpoints just to duplicate data that already displays correctly elsewhere, the widget points straight to the source for those specific pieces. The Details tab (line items) and the rest of the panel (Customer, Invoice #, Due Date, Days Past Due, Outstanding) stay in-page as before, since those are already confirmed working.

Verified target for the "View full invoice" link (page + URL pattern): *Not yet specified*.

## Refresh
Standalone icon, present at every size including KPI.

What refresh does in the new design (spinner, timestamp update, full re-fetch): *Not yet specified*. Legacy behaviour: clears cached data and reloads with the current filter settings [DOC — Step 1 research].

---

## Views (Switch View)

### View 1 — KPI Tiles + Aging Bars *(default)*
Four headline tiles (Total Outstanding, Overdue, Current, Oldest Invoice) above the 5-bucket aging bar chart.

**CONFLICT (recorded, not resolved):** this doc's fourth tile is **Oldest Invoice** [DOC — this doc]. The Step 3 spec's 2026-07-23 build record describes the built Design 2's tiles as "KPI tiles (Total Outstanding, Overdue, Current, 121+ days) above aging bars" [DOC — Step 3 spec / BUILD record]. Both versions are preserved here; tracked in Sign-off Readiness.

### View 2 — Aging Table
Invoice # · Customer · Amount · Age · Due Date, click-to-sort on any column.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 2 KPI tiles only (most critical), no Switch View |
| **Medium (2×2)** | 4 KPI tiles + small bar; Switch View available |
| **Large (4×4)** | 4 KPI tiles + full aging bars (5 buckets); Switch View available |
| **KPI (1×0.5)** | Headline: **Total Outstanding ($)**. No filter, no download, no switch. |
| **Expanded** | Active view, full detail, no filters to move into the modal (Revenue Center/Source stay in the overflow menu) |

Per-size overflow behaviour at real volumes, truncation rules, and which-N tie-breaks: *Not yet specified* (see Data Table Sort's trimmed-view rule).

**Build divergence note (recorded, not resolved):** this doc specifies two views (KPI Tiles + Aging Bars, Aging Table) [DOC — this doc]. The Step 3 spec's 2026-07-23 entry records that the live mockup was rebuilt into three designs: a Restyled Original (aging table + "Invoice Aging" donut), a Competitor Match (KPI tiles + aging bars with an on-screen By Amount / By Count toggle), and a Maximum Freedom "Collections Priority" design [DOC — Step 3 spec, 2026-07-23]. Neither version is deleted here; reconciliation is tracked in Sign-off Readiness.

## Accessibility
Stated for this widget, not globally assumed:
- Colour is never the only signal: the 121+ red / 91-120 amber convention gets a sign/label pairing, not colour alone. *Not yet reviewed against the build*.
- Chart values exist as text in the DOM (sr-only or visible table), not hover-only. *Not yet reviewed against the build*.
- Table semantics are real (`th`/scope), and interactive controls are reachable by keyboard. *Not yet reviewed against the build*.

## What Got Cut (and why)
- **Plain aging bar chart (no KPI tiles)** — removed before this pass; judged too similar to the KPI+Bars view, which does the same job better. [DOC — Step 3 spec; decision owner not recorded]
- **"Under review" KPI status** — resolved here: **Total Outstanding ($)** is now the locked KPI headline, since it's the clearest single figure and consistent with the pattern used across the rest of the dashboard. [DOC — this doc; decision owner not recorded]

## Sign-off Readiness
| # | Open item | Type (field / math / product decision) | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Fiscal-year filter question: "raise with backend/dev: is a fiscal-year-scoped filter on invoice *posting* date (not a change to the aging math itself) something worth adding later?" [DOC — Step 3 spec] | Product decision | Backend/dev team | No |
| 2 | "The Attachments/Note/Payments data sources aren't yet verified" (Drill-Through section); design routes around them via the "View full invoice" link. | Field | TBD | No (routed around) |
| 3 | "Bill-To is a confirmed empty-field bug in the Modern API today"; `BillToDisplay` is always empty in the Modern API, not yet resolved [DOC — Step 1 research]. Routed around via the "View full invoice" link. | Field / bug | TBD | No (routed around) |
| 4 | Aging bands not yet validated/reconciled: W05's 5 buckets (Current / 31-60 / 61-90 / 91-120 / 121+) vs the Modern API `ap-ar-aging` widget's boundaries (Current / 1-30 / 31-60 / 61-90 / 91+), "worth reconciling if both are ever shown side by side" [DOC — Step 3 spec]. | Field / math | TBD | No |
| 5 | Count-vs-dollar question: the Punch List's "count vs dollar amount" open question; the built Design 2's per-band invoice count and derived average invoice size "are proposed and should be confirmed with the dev team" before that design is finalized [DOC — Step 3 spec]. | Field | Dev team | No |
| 6 | CONFLICT: fourth KPI tile is "Oldest Invoice" in this doc vs "121+ days" in the Step 3 build record. See the View 1 note. | Doc reconciliation | TBD | No |
| 7 | KPI tile math for Overdue, Current (as a tile), and Oldest Invoice is not documented anywhere. | Math | TBD | No |
| 8 | KPI-size no-filter exception: "Flag this as an exception to confirm with the wider Hard Rules review" [DOC — Step 3 spec]. | Product decision | Hard Rules review | No |
| 9 | Doc-vs-build divergence: this doc's two views vs the three designs rebuilt in the mockup on 2026-07-23 [DOC — Step 3 spec]. See the Views section note. | Reconciliation | TBD | No |
| 10 | Trimmed-view rule: which "2 KPI tiles only (most critical)" show at Small, and the trimmed table's default sort / top-N rule. | Product decision | TBD | No |

This doc has 10 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Age Band filter highlights the matching bar in the Aging Bars view
- Invoices in the 121+ bucket always shown in red; 91-120 in amber
