# W16 — Accounts Payable by Due Date

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W16-Accounts-Payable-By-Due-Date.md](../Step%203%20-%20Mock_Work/Widget_Specs/W16-Accounts-Payable-By-Due-Date.md)
**Data source & formulas:** [Step 1 - Dashboard Research/16 - Accounts Payable By Due Date.md](../Step 1 - Dashboard Research/16%20-%20Accounts%20Payable%20By%20Due%20Date.md)
**Confluence dossier:** [Step 6 - Sign off document/Accounts Payable By Due Date/Accounts Payable By Due Date (Confluence pull 2026-07-27).html](../Step%206%20-%20Sign%20off%20document/Accounts%20Payable%20By%20Due%20Date/) — page 7371554882, Part A/B/C, 14 sections, live-audited 23 Jul 2026. No reconciliation file yet; Jo's flags carry no Accepted/Rejected/Disputed statuses in this doc yet.
**[2026-08-25, Feargal call] This widget stays a focused due-date and aging view. Do not grow it into a super-widget.** Feargal was explicit that it should not become a container for every payment function, and preferred **separate action widgets** for distinct tasks (unposted invoices, payment processing, posting to the general ledger), with this widget remaining a useful overview. Those separate action widgets are **assigned to Aditya**, outside this project's queue, but the outcome affects this widget's boundary so it is recorded here. Documentation only, no build change.

**Last verified against build:** 2026-09-07 via widget-final-check-audit (unattended). Previous: 2026-08-19 via build-final-widget (Final, Jo design 1-to-1 plus owner horizon picker: 107-assertion Node DOM-shim driver, 0 failures + final-check-rules.py node gate clean); not yet audited before that.

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
| Empty (org has no qualifying invoices) | Built: a positive "Nothing outstanding" state ("All supplier invoices are paid. Nothing is due right now."), short variant at Glance [BUILD]. Known exclusions: fully paid invoices, invoices without a due date, and unposted invoices never appear [DOC — Step 1 research]. |
| Partial (some data missing) | Invoices whose AmountDue resolves to 0 are excluded [DOC — Step 1 research]. Behaviour of an empty urgency bucket (hidden card vs zero-amount card) is *not yet specified*. |
| Loading | Built: a due-filter or horizon change is the only fetch; 800ms header skeleton plus 5 skeleton table rows with "Updating outstanding invoices...". Sort changes never show loading [BUILD]. Initial-load treatment *not yet specified*. |
| Error / API failure | *Not yet specified*. |
| Stale data | No "data as of" signal specified. Refresh preserves the current Due Date selection [DOC — Step 1 research]; see Refresh. |

## Interaction Spec

- **No donut or chart exists in the Final** (Jo's v2 dropped all charts); the old donut hover notes apply only to the superseded A/B/C options [BUILD].
- **Bucket click is adopted, as selector rows rather than chart segments:** the Detail cash-requirements band rows and the due-date popover entries filter the invoice list — the standard aging-bucket interaction [RESEARCH — NetSuite/Coefficient] realised through Jo's selector panel [BUILD].
- **Sortable headers:** every table column header is a sort button whose aria-label announces the current direction; sorting never triggers loading [BUILD].
- **Due Date Card click and AP Table row click:** *Not yet specified*. No drill-down or navigation away from the dashboard was observed in the old design [DOC — Step 1 research]; a drill-through to the AP module is pending confirmation (see Drill-Through).
- **Keyboard / focus behaviour** for filters, Switch View, and chart elements: *Not yet specified*.

## Filters
| Filter | Values |
|--------|--------|
| Due date | All due dates (default, with grand total) · By aging: Overdue / Due this week / Due this month / Due later (only non-empty bands listed) · By specific date: every distinct due date earliest-first with per-date totals and Overdue tags; a search input appears past 8 distinct dates |
| Due-date horizon | All outstanding (default) · Next 7 / 30 / 60 / 90 days. Scopes the working invoice set; overdue always included; if the current due filter becomes empty or invalid under a new horizon it snaps back to All due dates |

There is no Vendor filter chip in the Final: a vendor search input appears above the table past 6 rows (client-side row filter within the card), and Detail adds a Top vendors owed rollup instead [BUILD]. Filtering is widget-wide, not table-only: every figure (KPI total, overdue pill, bands, table, cash panel, popover contents, footer) computes from the horizon-scoped set. A due-filter or horizon change is the only fetch (800ms skeleton); Glance (KPI size) has no filters [BUILD].

## Data Table Sort
User-sortable — every column (Vendor / Invoice / Due date / Amount) is a sort button. Default: Due date ascending, date ties broken by larger amount first, not vendor-alphabetical [BUILD]. Sort changes never show loading. At All due dates the table groups under tinted aging-band subheaders with per-band counts and subtotals, keeping the current sort within each band; picking a band or a specific date flattens the grouping [BUILD].

**Trimmed-view rule:** none in the Final. Jo's three-tier model has no Small tier; Explore and Detail show the full invoice list in a scrolling table (vendor search past 6 rows) rather than a capped subset [BUILD].

## Drill-Through
**Leaning yes, pending expert/dev confirmation:** a link out to the full Accounts Payable module (filtered to the same due date/vendor) would be a meaningful improvement over view-only behaviour. Raise with experts/dev before building.

No verified target page or URL pattern exists yet; nothing has been checked `[LIVE]`.

## Refresh
Standalone icon, present at every size including KPI. Preserves the current Due Date selection.

What refresh does: reloads the data, preserving the current date selection [DOC — Step 1 research]. Whether it shows a spinner, updates a timestamp, or performs a full re-fetch is *not yet specified*.

---

## Views (Switch View)

The Final has no Switch View: one hero presentation per tier, per Jo's v2 (no charts, no donut, no cards) [BUILD].

### Hero — Aging-band grouped invoice table
Vendor · Invoice · Due date (two-line cell: the date plus "Overdue by N days" in red with a warning glyph, "Due today", or "Due in N days") · Amount. Grouped under Overdue / Due this week / Due this month / Due later subheaders with per-band counts and subtotals at All due dates; selection-labelled totals footer.

### Detail side panel — Cash requirements + Top vendors owed
The All-due-dates row and the four band rows double as the due filter (aria-hidden share mini-bars, "N invoices, X% of total" or a disabled "nothing due"); Top vendors owed is a top-5 rollup flagging per-vendor overdue amounts in red.

*(The old Due Date Cards / Aging Donut / AP Table views survive only in the A/B/C design options, which stay reachable from the Final Check design-option switch; the Final supersedes them.)*

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Glance (KPI)** | Accounts payable scope chip, total payable, and one pill: red "$X overdue" (with count tooltip) or green "Nothing overdue". No filters, no switch. The figure computes from the horizon-scoped set, not unconditionally across all due dates [BUILD]. |
| **Explore (wide)** | Two-row header (due-date chip + horizon chip above total payable + overdue pill) over the aging-band grouped table. |
| **Detail (xwide)** | Same header and table beside the Cash requirements panel and Top vendors owed rollup. |

Jo's three-tier model via the generic fc-fmode mechanism; no Small tier under the Final, and Expanded maps to the Detail render [BUILD].

## Accessibility

- Colour is never the only signal: reviewed against the build 2026-09-07 — overdue always carries a warning glyph plus text ("Overdue by N days", "Overdue" tags, the "$X overdue" pill), never colour alone [BUILD].
- Values as text: reviewed 2026-09-07 — the Final has no charts; every amount renders as text, and the cash-panel share mini-bars are aria-hidden magnitude cues beside text values [BUILD].
- Table semantics: reviewed 2026-09-07 — **not met**. The hero table is div-based (`.wt-row`) with no `table`/`columnheader` roles and no `th`/scope; filter chips and sort buttons do carry aria-labels and focus-visible styles, and both popovers use `role="listbox"`/`role="option"` [BUILD]. Whether to require role=table parity (as W11 built) is undecided [TO CONFIRM — owner: Oisin].

---

## What Got Cut (and why)
- **Donut reoriented to a by-vendor cut** — considered per the competitor research, but not adopted in this lock; it would introduce a new grouping dimension beyond what any original concept modelled. Worth raising as a future enhancement, not built into this version. *(Deferral recorded in the Step 3 spec's fit-check [DOC — Widget_Specs/W16-Accounts-Payable-By-Due-Date.md]; owner TBD if revived.)*

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Drill-through: "Leaning yes, pending expert/dev confirmation: a link out to the full Accounts Payable module (filtered to the same due date/vendor) would be a meaningful improvement over view-only behaviour. Raise with experts/dev before building." **Update 2026-08-19, per direct instruction: the Final was built without any drill-through element (matching Jo's view-only v2 design), so nothing blocked was built; the question stays open with experts/dev for a possible later addition.** | product decision | experts/dev | No (element not built; question open) |
| 2 | Possible mislabeling bug carryover, per PROJECT INDEX: "Possibly still open, and only indirectly tagged: a mislabeling bug ('Over 60' actually meaning 90+ days) confirmed for W10 may also apply here — never confirmed per-widget." This widget's own old design filters by exact due date rather than banded labels [DOC — Step 1 research], so the carryover is unconfirmed either way; check before reusing any aging-band labels. | bug check | TBD | No |
| 3 | Modern API security gap: module access is metadata-only and not actually enforced; any authenticated user can call the endpoint regardless of AP license | backend | dev | No (but must be fixed server-side before release) |
| 4 | Urgency bucket boundary math (Overdue Now / Due This Week / Due This Month) is undefined. **Resolved 2026-08-19, per direct instruction: adopted Jo's band math from her v2 build (overdue = due before today; due this week = 0-7 days out; due this month = 8-30; due later = 31+), including her fourth "Due later" band. The Final build implements exactly this.** | math | Resolved (owner) | No (resolved) |

This doc has 4 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Overdue items always red regardless of filter selection
- **2026-08-19, per direct instruction — Final built (v2.0).** A 1-to-1 copy of Jo Lopez's Widget Container Demo v2 `ap` block (aging + cash requirements, per her dossier 7371554882 Part C decisions 11.1/11.3/11.4/11.5): four aging bands (Overdue / Due this week / Due this month / Due later, math per her `apBandOf`), grouped hero table with per-band subtotals, Cash requirements selector panel + Top vendors owed at Detail, due-date filter chip and popover as the only fetch, no charts, no timeline, no drill-through. PLUS one owner addition: a due-date horizon picker in the standard v2 chip pattern (All outstanding / Next 7 / 30 / 60 / 90 days; scopes the invoice set; overdue always included; due filter snaps to All due dates when invalidated), deliberately not identical to any other widget's picker. Built as the additive `opt==='F'` branch in `WRENDER[16]` (`apF`/`APF_` namespaces); verified by a 107-assertion Node DOM-shim driver (0 failures) plus final-check-rules.py. Sizing per Rule 12 (Glance / Explore / Detail). `FC_VERSION[16]` = 2.0. Full composition sheet in Widget_Specs (2026-08-19 entry).
- Due Date filter filters all views independently *(A/B/C-era note; in the Final the due filter and horizon are widget-wide — see Filters)*
- Total AP Outstanding shown as the KPI headline and as a header figure on all views at Large size
