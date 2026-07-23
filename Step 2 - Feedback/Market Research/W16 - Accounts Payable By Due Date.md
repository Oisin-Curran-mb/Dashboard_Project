# Market Research: Accounts Payable By Due Date

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W16 — Accounts Payable By Due Date
**Module:** Accounts Payable
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/16 - Accounts Payable By Due Date.md`: a table of outstanding vendor invoices filterable by due date, plus a pie chart ("By Due Date") that always shows the total amount due across all due dates regardless of the table's filter. **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W16 - Accounts Payable By Due Date.md`) — keeps Due Date Cards, an Aging Donut, and a PO-style Table as peer views.

## Data Used

`AP_Invoice`, `AP_InvoiceDetail`, `AP_Vendor` (per Step 1). Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W16` section: Due Date and Vendor filters ✅ available; Due Date Cards / Aging Donut / AP Table views ✅ available; KPI Total AP Outstanding ✅ available; drill-through 🔴 missing (pending expert/dev confirmation, no target yet); **module access enforcement 🔴 security gap** — any authenticated user can call this endpoint regardless of whether their organisation holds an AP module license, confirmed directly in the Step 1 doc as well.

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- AP aging is standard practice with 30-day-increment buckets (Current/1-30/31-60/61-90/91+) and stacked-bar or column-by-age visualisations, plus a by-vendor or by-account pie as a secondary cut; clicking a bucket to filter a detail table is a standard interaction. *Sources: [NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/accounts-payable-AP-dashboard.shtml); [Coefficient](https://coefficient.io/dashboard-examples/accounts-payable-ap-aging-report).* The by-vendor-pie idea was noted at the time but not adopted, "flagged below as a future idea rather than folded in now."

**New this pass — upgrades that shelved idea from speculative to confirmed:**
- **Confirmed pattern (2 independent sources)** — a by-vendor pie/donut as a genuine peer cut to a by-date aging view is real, shipped precedent, not a speculative idea. Coupler.io's commercial AP Dashboard template explicitly ships a "Distribution of unpaid bills amount by vendor" donut chart alongside a separate aging-by-period breakdown and a vendor bills table. *Source: [Coupler.io — Accounts Payable Dashboard](https://www.coupler.io/dashboard-examples/accounts-payable-dashboard).* Sage Intacct's own Vendor Aging Graph documentation confirms the *same* underlying aging report can be rendered as pie/donut grouped **either** by aging-period totals **or** by vendor totals/top vendors — the clearest evidence a major platform treats by-date and by-vendor as interchangeable, render-time-selectable peer cuts of the same data. *Source: [Sage Intacct — Vendor Aging Graph](https://www.intacct.com/ia/docs/en_US/help_action/Reporting/Graphs/Application_graphs/vendor-aging-graph.htm) (modified Jul 16, 2026).* Together, these two independent sources upgrade the by-vendor idea from a single generic mention to a confirmed, real pattern.
- **Single source, alternative approach** — Tableau-based AP dashboard examples use a treemap sized by creditor for the by-vendor cut, reserving donut charts for single-vendor deep-dives rather than an all-vendor breakdown. *Source: [Quantize Analytics — 6 AP Dashboard Examples](https://www.quantizeanalytics.co.uk/accounts-payable-dashboard-examples/) (2024-10-28, updated 2025-05-10).*
- **Nonprofit-specific gap confirmed** — MIP Fund Accounting's built-in Aged Payables dashboard widget is a bar chart only; donut charts are reserved for Revenue/Expense By Designation, not AP. *Source: [MIP — Dashboard documentation](https://documentation.mip.com/MIPModern/Content/MAD/Dashboard.htm).* No by-vendor pie/donut exists for AP in the one nonprofit-specific tool checked.

## Visual Options (aim for 3)

1. **Revisit the by-vendor donut as a genuine option, not a shelved future idea.** It's now backed by two independent, concrete sources (Coupler.io's shipped template, Sage Intacct's own docs) rather than the single generic mention on file when it was originally set aside. Based on: the Coupler.io/Sage Intacct findings. Data needed: ✅ likely available today — vendor is already a field on `AP_Invoice`/`AP_Vendor`; this would be a display-format addition using data already present, not new data.
2. **No change to Due Date Cards / Aging Donut (by-date) / Table** as currently locked — still well supported by the original NetSuite/Coefficient citations, unaffected by this pass.
3. **Not competitively urgent, but worth noting:** MIP (the one nonprofit-specific tool checked) has no by-vendor cut at all for AP — adding one here would put this widget ahead of at least that competitor, echoing the "ahead of the sector" pattern already seen with W03, W05, and W11.

## Net Assessment

**Supports the current design, and meaningfully upgrades a previously-shelved idea.** The by-vendor donut, previously noted as "considered but not adopted... a future idea" on thin, single-mention grounds, is now backed by two independent, concrete examples — Coupler.io's shipped commercial template and Sage Intacct's own official documentation both treating by-vendor as a legitimate peer cut to by-date aging. This is worth raising again as a real option for a future design pass, not because the current lock is wrong, but because the evidence behind reconsidering it is now meaningfully stronger than it was.

## Sources

- [NetSuite — Accounts Payable Dashboard](https://www.netsuite.com/portal/resource/articles/accounting/accounts-payable-AP-dashboard.shtml)
- [Coefficient — Accounts Payable (AP) Aging Report](https://coefficient.io/dashboard-examples/accounts-payable-ap-aging-report)
- [Coupler.io — Accounts Payable Dashboard](https://www.coupler.io/dashboard-examples/accounts-payable-dashboard)
- [Sage Intacct — Vendor Aging Graph](https://www.intacct.com/ia/docs/en_US/help_action/Reporting/Graphs/Application_graphs/vendor-aging-graph.htm)
- [Quantize Analytics — 6 AP Dashboard Examples](https://www.quantizeanalytics.co.uk/accounts-payable-dashboard-examples/)
- [MIP — Dashboard documentation](https://documentation.mip.com/MIPModern/Content/MAD/Dashboard.htm)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W16-Accounts-Payable-By-Due-Date.md` and `Step 4 - Widget Final Design/W16 - Accounts Payable By Due Date.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (NetSuite, Coefficient), including the note that a by-vendor donut was considered and shelved. Nothing there has been moved or deleted — this file cites the same sources plus the new evidence that upgrades that shelved idea. Whether to update those two sections is still an open decision.
