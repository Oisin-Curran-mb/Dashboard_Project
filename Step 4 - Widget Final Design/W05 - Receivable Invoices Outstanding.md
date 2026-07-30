# W05 — Receivable Invoices Outstanding

**Module:** Finance
**Status:** 🟢 Final design — locked (built 2026-07-28, Jo design, tagged v2.0 in the build). Locked-doc rule: the body below describes only the current final design. Superseded design thinking is not deleted, it is dated and moved to the "Design History (superseded)" section at the end of this doc.
**Full history / rejected ideas:** [Widget_Specs/W05-Receivable-Invoices-Outstanding.md](../Step%203%20-%20Mock_Work/Widget_Specs/W05-Receivable-Invoices-Outstanding.md)
**Data source & formulas:** [Step 1 - Dashboard Research/05 - Receivable Invoices Outstanding.md](../Step 1 - Dashboard Research/05%20-%20Receivable%20Invoices%20Outstanding.md)
**Confluence dossier:** none yet
**Last verified against build:** 2026-07-28 via build-final-widget (Final, Jo design: ~95-assertion Node driver, 0 failures + final-check-rules.py 0 HIGH + browser-faithful CSS parse, 0 dropped rules). Previous: not yet audited.

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a named written source · `[TO CONFIRM]` assumed, with a named owner to confirm. Conflicting evidence coexists; neither side wins by default.

---

# Final Design (current)

Everything in this part describes what actually shipped: Jo Lopez's Accounts Receivable widget carried into the Final Check tab one-to-one (the additive `arF` block), plus one owner-added enhancement in the drill modal. Anything the project considered earlier, tested, or dropped lives in Design History at the end.

## Purpose
Shows how much money is currently owed to the organisation in unpaid invoices and how long those invoices have been outstanding, so staff can prioritise which outstanding amounts need attention first. The data shapes (outstanding amounts, aging by days overdue) match the legacy widget's documented behaviour [DOC — Step 1 research].

## How Other Companies Fulfil This Purpose
- AR aging dashboards commonly combine a bar or donut chart for the aging-bucket breakdown with a sortable, full-detail table; a pie chart as the sole view is explicitly called out as the wrong choice for aging data ([Vertaccount](https://www.vertaccount.com/blog/best-accounts-receivable-dashboard-examples-templates-for-2026/), [Coupler.io](https://www.coupler.io/dashboard-examples/accounts-receivable-dashboard)). The Final uses Jo's aging-bucket ladder, not a pie, so this known defect is not present. [RESEARCH]
- A KPI snapshot above the aging breakdown is a directly recommended pattern; the Final's KPI headline (total owed + overdue pill) matches it. [RESEARCH]

## Data Contract
What the widget consumes. Source tables and formulas come from the Step 1 research doc, confirmed correct against the legacy `ReceivableInvoices : DataPanelControl` class (`/AccountsReceivable`), verified via `Widget_Comparison_Classic.html`, 2026-07-08 [DOC — Step 1 research].

| Field / value shown | Source table / endpoint | Formula (if computed) | Evidence |
|---|---|---|---|
| Invoice inclusion rule | `ARInvoice`; only formally posted invoices with an outstanding balance; voided excluded | `Posted = true AND UndoJournalID = null AND Outstanding != 0` | [DOC — Step 1 research] |
| Outstanding (per invoice) | `ARInvoice` | `TotalAmount + SalesTax − Payments − Discounts − WriteOffs` | [DOC — Step 1 research] |
| Age bucket assignment | Derived per invoice | `Age = Today − DueDate` (days) → Current (<31), 31-60, 61-90, 91-120, 121+ | [DOC — Step 1 research] |
| Invoice line items (detail modal) | `ARInvoiceDetail` | n/a | [DOC — Step 1 research] |
| Revenue Center / Source filter lists | `ARRevenueCenterRepository` / `ARSourceRepository`; both dynamically populated from the data, not fixed | n/a | [DOC — Step 1 research] |
| KPI headline (Total Outstanding $) + overdue pill | Derived | Sum of outstanding across all buckets (legacy totals row shows the full outstanding balance) | [BUILD] / [DOC — Step 1 research] |
| Bill To (detail modal) | `BillToDisplay` | Known Modern API gap: always empty today, not yet resolved | [DOC — Step 1 research] / [TO CONFIRM — owner TBD] |

- **Favourability / direction:** 121+ bucket shown in red, 91-120 in amber (see Fine-Tuning Notes) [DOC — this doc].
- **Freshness:** aging is an as-of-today snapshot [DOC — this doc, Filters]. New-design freshness signal: *Not yet specified*.
- **Adjacent Modern API note:** the Modern API defines an `ap-ar-aging` widget whose AR side uses the same Outstanding formula but different bucket boundaries (Current / 1-30 / 31-60 / 61-90 / 91+) than W05's 5 buckets; worth reconciling if both are ever shown side by side [DOC — Step 3 spec]. Tracked in Sign-off Readiness.

## Widget States
| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified* |
| Empty (org has no outstanding invoices) | KPI headline reads zero owed and the aging ladder / table render an empty state rather than a broken chart; every total is computed from the invoice rows, never hardcoded. [BUILD] |
| Partial (some buckets empty) | A bucket with no invoices renders as an empty (zero-value) band and is not drillable; opening the detail modal is guarded to buckets holding at least one invoice. [BUILD] |
| Loading | An ~800ms skeleton shows ONLY when a Revenue Center or Source filter chip is committed (the only fetch). Sort, drill, row-checkbox toggles, and Confirm are all instant client interactions. [BUILD] |
| Error / API failure | *Not yet specified* |
| Stale data | *Not yet specified*. Aging is an as-of-today snapshot [DOC — this doc]. |

## Interaction Spec
- **Filter chips:** Revenue Center and Source are committed as filter chips; committing a chip is the ONLY fetch (~800ms skeleton), then a re-render of the KPI headline, the aging ladder, and the detail set. Clearing a chip re-fetches the same way. [BUILD]
- **Sort:** the invoice table is client-side sortable; sorting is instant, never a fetch. [BUILD]
- **Drill (bucket / row to detail):** opens the modal titled "Receivable Invoices Outstanding: Detail" (`role="dialog"`), columns Customer / Bill To / Due Date / Invoice # / Days Past Due / Outstanding, a footer "N invoices / total", an Export to Excel button, and a Close button. Escape and backdrop click close it. [BUILD]
- **Enhancement (drill modal only), a DEVELOPER-INTENT SIGNAL, not final workflow:** each invoice row in the modal carries a **checkbox** (row-level only; no select-all). Checking or unchecking a row keeps the modal open and does not expand the row or re-fetch; it only updates the selected count. A **"Confirm" button sits beside Close and is always enabled.** On Confirm an **inline note appears in the modal footer reading exactly "Move to unposted transactions"** plus a muted **"(N invoices selected)"**. This signals the developer intent that the selected invoices are meant to move to the system's unposted-transactions queue to begin processing. It is a direction-of-travel marker, NOT finished workflow behaviour and NOT final copy; the exact transaction type it would create is an open SME/API question (see Sign-off Readiness). [BUILD]

## Filters
The Final carries Jo's filter model: **Revenue Center** and **Source** chips, each committed as the only fetch (~800ms skeleton), plus the **Customers cut** (Jo's customer grouping of the invoice set). The aging-bucket ladder (Current / 31-60 / 61-90 / 91-120 / 121+) is Jo's, carried one-to-one. There is no time / Fiscal Year filter (aging is an as-of-today snapshot). [BUILD]

The fiscal-year-filter question and the KPI-size no-filter arrangement are carried forward as open items in Sign-off Readiness.

## Data Table Sort
Age-band summary: fixed sort by age band ascending, matching bucket severity order. Full invoice-level table: client-side click-to-sort on any column (Invoice #, Customer, Amount, Age, Due Date). Trimmed-view / top-N rules for small renders: not applicable, the Final ships Glance / Explore / Detail with no Small trimmed view.

## Drill-Through
No separate page link for the widget as a whole — Revenue Center/Source data spans multiple originating modules, so there is no single unambiguous source page to link to. The in-page detail modal (bucket → invoice list, Export, Close, plus the new checkbox/Confirm enhancement) is this widget's answer to the requirement. A per-invoice "View full invoice" link out to the real AR invoice record is the route for data the widget does not reproduce in-modal (Bill To, and Attachments/Note/Payments); verified target URL pattern: *Not yet specified*.

## Refresh
Standalone icon, present at every size including Glance. What refresh does in the new design (spinner, timestamp, full re-fetch): *Not yet specified*. Legacy behaviour: clears cached data and reloads with the current filters [DOC — Step 1 research].

## Views (Switch View) and sizing
The Final carries Jo's Accounts Receivable layout one-to-one: the **aging-bucket ladder** (Current / 31-60 / 61-90 / 91-120 / 121+), the **KPI headline** (total owed + overdue pill), and the **drill detail modal**, all per Jo. [BUILD]

**Size behaviour:** three sizes only, per General Widget Design Rules Rule 12: **Glance / Explore / Detail**, no Small. Implemented via the `fc-fmode` mechanism, mapping Jo's kpi / wide / xwide layouts. Glance is the KPI card (total owed + overdue pill); Explore and Detail render the aging ladder and open the drill modal. [BUILD]

## Accessibility
- Values exist as text: the KPI headline, the overdue pill, each aging bucket, and every detail-modal row carry their values as DOM text (sr-only where a visual is otherwise the only cue), never hover-only. [BUILD]
- The drill modal is `role="dialog"` with a labelled title; Escape and backdrop click close it, and focus is managed on open / close. [BUILD]
- The row checkboxes are exposed as checkboxes (`role="checkbox"` / native with `aria-checked`), individually keyboard-toggleable; Confirm and Close are keyboard-reachable; the inline "Move to unposted transactions" note and its count are DOM text. [BUILD]
- Colour is never the sole signal: the 121+ red / 91-120 amber convention is paired with the bucket label and dollar values. [BUILD]

## What Got Cut (and why)
- **Small size**, cut per General Widget Design Rules Rule 12. The Final ships three sizes (Glance / Explore / Detail); the mock's A/B/C design options keep their old sizes.
- **The project's earlier two-view concept** (KPI Tiles + Aging Bars default, plus Aging Table) and **the legacy pie-as-primary view** are not in the Final. The Final is Jo's AR widget (aging ladder + KPI headline + drill modal). Full detail of what was considered and tested is in Design History below.

## Sign-off Readiness
| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Fiscal-year filter question: is a fiscal-year-scoped filter on invoice posting date worth adding later? [DOC — Step 3 spec] | Product decision | Backend/dev | No |
| 2 | Attachments/Note/Payments data sources not yet verified; design routes around them via the "View full invoice" link. | Field | TBD | No (routed around) |
| 3 | Bill-To empty-field Modern API gap: `BillToDisplay` always empty, not yet resolved [DOC — Step 1 research]. The Final keeps the Bill To column; it reads empty for this pre-existing gap. | Field / bug | TBD | No (routed around; pre-existing) |
| 4 | Aging bands not yet reconciled: W05's 5 buckets vs the Modern API `ap-ar-aging` boundaries [DOC — Step 3 spec]. | Field / math | TBD | No |
| 5 | Count-vs-dollar question: per-band invoice count and derived average invoice size proposed, to confirm with dev [DOC — Step 3 spec]. | Field | Dev team | No |
| 6 | KPI-size no-filter exception: flag to the wider Hard Rules review [DOC — Step 3 spec]. | Product decision | Hard Rules review | No |
| 7 | **Confirm action:** the mechanism is confirmed by a codebase trace (2026-07-28): Confirm processes **payment** against the selected outstanding invoices via the AR payment path (`ARPayment` / `ARPaymentDetail` applied to the invoices, into Payment Processing, posted by `ARPaymentRepository.ProcessPayments`; the unposted transaction is the payment, not the invoice; these are posted invoices awaiting payment, NOT records from the AR unposted-invoices queue). The one OPEN item is a product nuance: does Confirm create the payment outright (full or partial amount) or stage the invoices into the payment-entry screen for a person to key? The Confirm button and its inline "Move to unposted transactions" note are a developer-intent signal, not finished workflow. See `Step 5 - API documents/Receivable Invoices Outstanding/Move to Unposted Transactions - Logic Notes.md` (section 9). Resolved by the SME / in the Step 5 API doc, not here. | Product decision / API | SME / API doc | No (dev-intent signal only) |

Resolved by the built Final (2026-07-28) and retired from the open list: the doc-vs-build divergence (the Final supersedes both the two-view concept and the mock A/B/C designs), the Small trimmed-view rule (moot, Small is cut), and the "Oldest Invoice vs 121+ days" fourth-tile conflict (moot, the Final has a KPI headline + overdue pill, not the four tiles). Their original wording is preserved in Design History.

This doc is not sign-off-ready until this table is empty or every open row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Age Band filter highlights the matching bar in the aging view.
- Invoices in the 121+ bucket always shown in red; 91-120 in amber.
- **2026-07-28 — Built as the Final, Jo design.** Jo's Accounts Receivable widget ported one-to-one (the `arF` block) plus the drill-modal enhancement (row checkbox, always-enabled Confirm, inline "Move to unposted transactions" dev-intent note with selected count). Sizes Glance / Explore / Detail, no Small, per Rule 12. Tagged v2.0 with "Final" and "Jo design" title badges. Verification: ~95-assertion Node DOM-shim driver (0 failures, incl. the exact "Move to unposted transactions" string, checkbox-toggle-keeps-modal-open, live count 1 to 2), browser-faithful CSS parse (0 dropped rules), final-check-rules.py 0 HIGH, W01-W04 regressions green, Dashboard tab byte-identical. Mock data: 8 invoices totalling $33,530; 121+ bucket = Cornerstone Academy INV-2903 ($9,650, 145 days) + Legacy Insurance Group / Legacy HR Dept INV-2890 ($6,300, 144 days) = $15,950. Full detail in the 2026-07-28 Widget_Specs completion entry.

---

# Design History (superseded — kept for the record)

> Everything below is superseded by the Final Design above. It is kept, dated, and moved here (never deleted) so the reasoning is traceable without cluttering the live spec. Read top-down as a timeline: what existed, what the project designed and tested before adopting Jo's widget, and what got dropped.

## Original / legacy behaviour (what existed before any redesign)
Sourced from the Step 1 research doc, confirmed against the legacy `ReceivableInvoices : DataPanelControl` class.
- **Layout:** a table with one row per age bucket and a highlighted totals row, beside a pie chart titled "Invoice Aging" (one segment per bucket). Both reflected the same filtered data.
- **Hover:** hovering a pie segment showed the outstanding amount for that bucket.
- **Drill:** clicking an age-bucket row with a value greater than zero opened a detail panel "Receivable Invoices Outstanding – Detail"; rows with a zero balance were not clickable. The panel showed Customer, Bill To (if different), Due Date, Invoice #, Days Past Due, Outstanding, with an expand arrow per row revealing four tabs (Details line items, Attachments, Note, Payments) and Export to Excel + Close in the header.
- **Filters:** Revenue Center and Source, combinable, both narrowing table + chart together; selections preserved on refresh. Refresh cleared cached data and reloaded with the current filters.

## Project's earlier concept design (pre-Jo), tested in Step 3, superseded 2026-07-28
Before adopting Jo's widget, the project designed and mocked its own W05 concept. Recorded here as superseded.

**Two-view model this doc previously specified:**
- **View 1 — KPI Tiles + Aging Bars (default):** four headline tiles (Total Outstanding, Overdue, Current, Oldest Invoice) above the 5-bucket aging bar chart.
- **View 2 — Aging Table:** Invoice # · Customer · Amount · Age · Due Date, click-to-sort on any column.

**Old size behaviour table (before Rule 12's three-size model):**

| Size | Behaviour |
|------|-----------|
| Small (1×1) | 2 KPI tiles only (most critical), no Switch View |
| Medium (2×2) | 4 KPI tiles + small bar; Switch View available |
| Large (4×4) | 4 KPI tiles + full aging bars (5 buckets); Switch View available |
| KPI (1×0.5) | Headline: Total Outstanding ($). No filter, no download, no switch. |
| Expanded | Active view, full detail |

**What was tested in the mockup (Step 3, 2026-07-23):** the live mockup was rebuilt into three design options — a Restyled Original (aging table + "Invoice Aging" donut), a Competitor Match (KPI tiles + aging bars with an on-screen By Amount / By Count toggle), and a Maximum Freedom "Collections Priority" design [DOC — Step 3 spec, 2026-07-23]. These A/B/C options remain reachable from the design-option switch in the Final Check tab, but the Final that shipped is Jo's widget.

**Unresolved points from the concept design (now moot for the Final, kept for the record):**
- CONFLICT: this doc's fourth tile was "Oldest Invoice"; the Step 3 build record described the built Design 2's tiles as "Total Outstanding, Overdue, Current, 121+ days." The Final has no four-tile row (KPI headline + overdue pill instead), so the conflict no longer applies.
- KPI tile math for Overdue, Current, and Oldest Invoice was never documented. Moot for the Final for the same reason.
- Old KPI-size arrangement showed no filter at all (no time dimension to fall back to); flagged as an exception for the Hard Rules review (still tracked, Sign-off row 6).

**Old accessibility baseline (pre-build, aspirational, superseded by the built Accessibility section above):** colour never the only signal (121+ red / 91-120 amber paired with a sign/label); chart values as DOM text; real table semantics and keyboard-reachable controls. All were marked "not yet reviewed against the build" at the time; the Final now implements them (see the current Accessibility section).

## Superseded by
The built Final, Jo design, 2026-07-28 (see Final Design above). Tagged v2.0 with "Final" and "Jo design" badges in the Final Check tab.
