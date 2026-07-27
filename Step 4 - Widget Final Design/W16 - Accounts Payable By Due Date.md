# W16 — Accounts Payable by Due Date

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W16-Accounts-Payable-By-Due-Date.md](../Step%203%20-%20Mock_Work/Widget_Specs/W16-Accounts-Payable-By-Due-Date.md)
**Data source & formulas:** [Step 1 - Dashboard Research/16 - Accounts Payable By Due Date.md](../Step 1 - Dashboard Research/16%20-%20Accounts%20Payable%20By%20Due%20Date.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (named) · `[TO CONFIRM]` assumed, with the owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists: if two sources disagree, both claims stay recorded, each with its own mark, until someone with backend access settles it.

## Purpose
Shows outstanding payables grouped by due date so finance staff can prioritise which vendors to pay and when, helping prevent late payments and manage cash outflow timing.

## How Other Companies Fulfil This Purpose
- AP aging is standard practice with **30-day-increment buckets** (Current/1-30/31-60/61-90/91+) and stacked-bar or column-by-age visualisations, plus a **by-vendor or by-account pie** as a secondary cut ([NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/accounts-payable-AP-dashboard.shtml), [Coefficient](https://coefficient.io/dashboard-examples/accounts-payable-ap-aging-report)).
- Clicking an aging bucket to reorder/filter a detail table is a standard interaction.

**Net assessment:** the urgency-bucket cards, donut, and table below match the standard directly. One improvement idea surfaced by the research — reorienting the donut to a by-vendor cut instead of by-date — was considered but not adopted here, since it would add a new dimension beyond what any of the original concepts modelled; flagged below as a future idea rather than folded in now.

## Data Contract

All rows are drawn from the Step 1 research doc unless marked otherwise. Legacy source class: `AccountsPayableByDueDate : DataPanelControl` (`/AccountsPayable`), confirmed via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| Qualifying invoices | `AP_Invoice` | Only invoices that have been formally posted, have a due date, and still have an outstanding balance: `Posted = true AND DueDate != null AND AllPaid = false`. Fully paid invoices are excluded. | [DOC — Step 1 research] |
| Amount Due per invoice | `AP_InvoiceDetail` | `SUM(AP_InvoiceDetail.Amount − Discount) WHERE Status IN ('U','X')` (Unpaid/partial); invoices whose resulting AmountDue = 0 are excluded. | [DOC — Step 1 research] |
| Vendor names / Vendor filter | `AP_Vendor` | Vendor records linked to each invoice; dynamic list, a real confirmed table. | [DOC — Step 1 research] |
| Due dates | invoice data | The dates are not user-configured; they are the actual due dates of real invoices in the system. As new invoices are entered and given due dates, those dates automatically appear. | [DOC — Step 1 research] |
| Donut / chart | derived | `GROUP BY DueDate`, `SUM(AmountDue)` using absolute value; all dates always shown regardless of filter. | [DOC — Step 1 research] |
| Urgency buckets (Overdue Now / Due This Week / Due This Month) | derived from `AP_Invoice.DueDate` | Derived from the same real due-date field on the invoice [DOC — Widget_Specs/W16]. Exact boundary math (calendar week vs rolling 7 days; calendar month vs rolling 30 days; whether Due This Month includes Due This Week) is undefined. | [TO CONFIRM — owner TBD] |
| KPI headline: Total AP Outstanding ($) | derived | Sum of AmountDue across all qualifying invoices, across all due dates. | [DOC — Step 1 research, derived] |
| Module access / entitlement | Modern API | ⚠️ Known Modern API gap: "the widget's module access is metadata-only in the Modern API and **not actually enforced** — any authenticated user can call the endpoint regardless of whether their organisation has an Accounts Payable license." Flagged as a security gap for the rebuild. | [DOC — Step 1 research, Modern API gap] |

*Related Phase 2 widget (informational, not part of this widget's contract):* the Modern API defines an `ap-ar-aging` widget (`GET /api/dashboard/ap-ar-aging`) that combines this widget's AP side with W05's AR side; its bucket boundaries (Current/1-30/31-60/61-90/91+) differ from this widget's due-date approach, "worth reconciling if the two are ever unified" [DOC — Widget_Specs/W16, from Widget_Comparison_New_Widgets.html].

- **Favourability/direction logic:** overdue is the unfavourable signal; overdue items are always red regardless of filter selection (see Fine-Tuning Notes).
- **Rounding / currency / locale rules:** *Not yet specified*.
- **"Data as of" freshness:** *Not yet specified*. Refresh preserves the current Due Date selection [DOC — Step 1 research].

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified* in the design. ⚠️ Backend note: the Modern API does not enforce module access for this widget (see Data Contract), so entitlement handling must be decided client-side or fixed server-side; see Sign-off Readiness. |
| Empty (org has no qualifying invoices) | *Not yet specified*. Known exclusions: fully paid invoices, invoices without a due date, and unposted invoices never appear [DOC — Step 1 research]. |
| Partial (some data missing) | Invoices whose AmountDue resolves to 0 are excluded [DOC — Step 1 research]. Behaviour of an empty urgency bucket (hidden card vs zero-amount card) is *not yet specified*. |
| Loading | *Not yet specified*. |
| Error / API failure | *Not yet specified*. |
| Stale data | No "data as of" signal specified. Refresh preserves the current Due Date selection [DOC — Step 1 research]; see Refresh. |

## Interaction Spec

- **Donut hover:** labels show the due date, with amount as a secondary/tooltip detail (see Filters). In the old design, hovering over a pie segment shows the due date and amount [DOC — Step 1 research].
- **Donut segment / bucket click:** the research notes clicking an aging bucket to reorder/filter a detail table is a standard interaction [RESEARCH — NetSuite/Coefficient], but whether this widget adopts it is *not yet specified*.
- **Due Date Card click and AP Table row click:** *Not yet specified*. No drill-down or navigation away from the dashboard was observed in the old design [DOC — Step 1 research]; a drill-through to the AP module is pending confirmation (see Drill-Through).
- **Keyboard / focus behaviour** for filters, Switch View, and chart elements: *Not yet specified*.

## Filters
| Filter | Values |
|--------|--------|
| Due Date | All · Overdue Now · Due This Week · Due This Month |
| Vendor | All Vendors · dynamic list |

Filtering narrows the **table only**; the donut always shows **all** due dates regardless of the filter (matches old design). Pie/donut labels show the due date, with amount as a secondary/tooltip detail. KPI size shows Due Date only.

## Data Table Sort
Fixed — Due Date ascending, then Vendor alphabetical within the same date. Not user-changeable.

**Trimmed-view rule:** at Small (3 cards/rows) and Medium (5 cards/rows), the subset is the first N in the fixed sort above, i.e. earliest due date first, so the trimmed views surface the most urgent items by construction [DOC — derived from the fixed sort].

## Drill-Through
**Leaning yes, pending expert/dev confirmation:** a link out to the full Accounts Payable module (filtered to the same due date/vendor) would be a meaningful improvement over view-only behaviour. Raise with experts/dev before building.

No verified target page or URL pattern exists yet; nothing has been checked `[LIVE]`.

## Refresh
Standalone icon, present at every size including KPI. Preserves the current Due Date selection.

What refresh does: reloads the data, preserving the current date selection [DOC — Step 1 research]. Whether it shows a spinner, updates a timestamp, or performs a full re-fetch is *not yet specified*.

---

## Views (Switch View)

### View 1 — Due Date Cards *(default)*
Cards grouped by urgency — Overdue · Due This Week · Due This Month. Immediately actionable.

### View 2 — Aging Donut
Donut showing AP balance split by due-date band. Proportion of overdue vs. upcoming payables visible at a glance.

### View 3 — AP Table
Vendor · Invoice # · Amount · Due Date · Status. Complete list for payment processing.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, 3 cards/rows, no Switch View |
| **Medium (2×2)** | Active view, 5 cards/rows + total AP; Switch View available |
| **Large (4×4)** | Active view, all invoices + totals row; Switch View available |
| **KPI (1×0.5)** | Headline: **Total AP Outstanding ($)**, across all due dates. No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

## Accessibility

- Colour is never the only signal: the always-red overdue treatment must be paired with a text label or badge (e.g. "Overdue"), not colour alone. *Not yet reviewed against the build.*
- Chart values (donut segments, card amounts) exist as text in the DOM (sr-only or visible table), not hover-only. *Not yet reviewed against the build.*
- Table semantics are real (`th`/scope), and interactive controls (filters, Switch View) are reachable by keyboard. *Not yet reviewed against the build.*

---

## What Got Cut (and why)
- **Donut reoriented to a by-vendor cut** — considered per the competitor research, but not adopted in this lock; it would introduce a new grouping dimension beyond what any original concept modelled. Worth raising as a future enhancement, not built into this version. *(Deferral recorded in the Step 3 spec's fit-check [DOC — Widget_Specs/W16-Accounts-Payable-By-Due-Date.md]; owner TBD if revived.)*

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Drill-through: "Leaning yes, pending expert/dev confirmation: a link out to the full Accounts Payable module (filtered to the same due date/vendor) would be a meaningful improvement over view-only behaviour. Raise with experts/dev before building." | product decision | experts/dev | Yes, for the drill-through element only |
| 2 | Possible mislabeling bug carryover, per PROJECT INDEX: "Possibly still open, and only indirectly tagged: a mislabeling bug ('Over 60' actually meaning 90+ days) confirmed for W10 may also apply here — never confirmed per-widget." This widget's own old design filters by exact due date rather than banded labels [DOC — Step 1 research], so the carryover is unconfirmed either way; check before reusing any aging-band labels. | bug check | TBD | No |
| 3 | Modern API security gap: module access is metadata-only and not actually enforced; any authenticated user can call the endpoint regardless of AP license | backend | dev | No (but must be fixed server-side before release) |
| 4 | Urgency bucket boundary math (Overdue Now / Due This Week / Due This Month) is undefined | math | TBD | Yes (the primary filter and default view depend on it) |

This doc has 4 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Overdue items always red regardless of filter selection
- Due Date filter filters all views independently
- Total AP Outstanding shown as the KPI headline and as a header figure on all views at Large size
