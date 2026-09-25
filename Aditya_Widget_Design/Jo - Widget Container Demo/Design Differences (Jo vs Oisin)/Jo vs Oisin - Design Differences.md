# Design Differences — Jo vs Ours

This document records, per widget, how **our** finalized version differs from **Jo Lopez's** version in the `design-sandbox` Widget Container Demo (`index.html`), and why each difference exists. "Jo" means her original widget block in that file; "Ours" means the finalized version in this repo (the built Final in the mockup, locked in the Step 4 doc, specced in Step 5). Our ported widgets sit alongside Jo's originals in her shell as namespaced "(MB updated)" cards; this doc explains the deltas a reviewer will see between the two.

Every difference row is grounded in a concrete source using the evidence key below. Where we deliberately kept something identical to Jo, it is listed under "Parity kept" so the scope of change is clear.

## Evidence key
- **[DESIGN — ...]** a final design decision: an owner-directed change or a locked choice in the widget's Step 4 - Widget Final Design doc.
- **[API — ...]** a data-contract or API-shape reason from the widget's Step 5 API spec.
- **[CODE — ...]** a backend-logic reason traced in the MBAccounting codebase.

---

## W01 — Budget Compared to Actual
Our version = Jo's Budget widget with the reusable **Time Window Module** layered on; everything else is kept at parity.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Interval grains | Month / Quarter / Period / Year (M Q P Y) | Day / Week / Month / Period / Quarter / Year (D W M P Q Y), toggle reads smallest-first with Period before Quarter | Users asked to slice the comparison finer than month; standardised on the reusable Time Window Module | [DESIGN — Step 4 Views/Filters, Time Window Module; owner "add day and week"] |
| Grain availability | All grains always offered | A grain is offered only when it yields 2 to 31 data points for the chosen window; each window defaults to its smallest available grain | Keeps charts legible (no 1-point or 100-point charts) and gives a sensible default per window | [DESIGN — Step 4 Time Window Module availability law] |
| Time windows | Spans: this fiscal year, last fiscal year, all time | This month · This period · This quarter (rolling 3 months) · This year (rolling 12 months) · This fiscal year (YTD) | Standardised window set from the Time Window Module, shared across widgets | [DESIGN — Step 4 Time Window Module] |
| Weekly grain | Not offered | Week grain offered (Large / Expanded only), confirmed feasible | A code review indicates a weekly grain is derivable from the GL data, so Week ships rather than staying gated | [DESIGN — owner confirmed 2026-08-05; API — Step 5] |
| Fiscal year scope | Fixed fiscal-year handling | Fiscal year treated as per-organisation (not a global July-June constant); consolidated/master-company rollup must combine child accounts | The org's fiscal calendar varies, and the modern API currently returns empty for master companies, a regression to fix | [API — Step 5 spec requirement; CODE — modern API CompanyNumber=0 returns empty] |

**Parity kept (identical to Jo):** the Income / Expense / Special-report account-scope dropdown with the two-part (Report, then Report line) branded searchable picker; two-purple bars (light budget, dark actual) with favourability shown only in the KPI pill and hover popover, never on the bars; the running YTD total; the two-independent-panel Detail (Explore) layout; the "No trend to show" guard for line view with fewer than 2 points; the no-budget empty state; and the KPI header strip. [DESIGN — parity with Jo]

_Section updated 2026-08-04._

---

## W02 — Pension Plans
Our version = Jo's Pension widget plus a new grouped-bar-by-district view and an all-districts aggregate; the rest is kept at parity.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Views | Plan table as the body, with a bar/pie toggle offered only at her largest size | Three views under a Table / Pie / By district toggle, Table as the default; Detail shows table (left) and the active chart (right) as two synced panels | Users compare the plan mix and the district mix, so both a whole-org chart and a per-district chart are first-class, not a largest-size extra | [DESIGN — Step 4 Views v2; Size behaviour] |
| Grouped Bar by District | Not offered | New view: district groups on the x-axis, one bar per plan (same fixed amethyst plan ramp as the table dots and pie), a group total per district, and each bar drills to that plan and that district | Surfaces a second real dimension already in the data (plan spend by district) that a single donut cannot show | [DESIGN — Step 4 View 2; API — Step 5 grouped-bar matrix] |
| District scope | District filter narrows the snapshot | Same, plus an explicit All Districts aggregate that sums every district (48,252.43); a specific district narrows to its own total (District 1 = 22,873.84 / 4 appointees) | The all-districts rollup is the headline a finance user opens on; the district list is shown by Name | [API — Step 5 Example 1; CODE — district = PB_ControlTable ControlTableID shown as Name] |

**Parity kept (identical to Jo):** the two-row header with the district filter chip on the left and the KPI money + appointee badge on the left; the sortable plan table; the donut pie and share bars in the fixed amethyst plan ramp; the loading skeleton that fires only on a district change (not on a view toggle); the appointee drill modal; the empty state; and values carried as DOM text. [DESIGN — parity with Jo]

**Open items (carried, not invented):** the Pension Billing drill-through still has no target URL [DESIGN — Step 4 open item]; export is a stub toast pending a backend decision [API — Step 5]; the Charge / church-organisation column shows mock org names because the real API returns an empty string today, a pre-existing defect [CODE — pension-plans grid].

_Section updated 2026-08-05._

---

## W03 — Payroll Distributions
Our version = Jo's Payroll widget with a standardised period set and an explicit zero-personal-data rule; the rest is kept at parity.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Period presets | This month / This quarter / All time / This year | This month (default) / This period / This quarter / This year / All time, smallest-first, with the Custom From/To row kept | Standardised, ordered period set matching the project's window conventions; adds an explicit fiscal Period option | [DESIGN — Step 4 Filters v2] |
| Rolling window definitions | Calendar-style | This quarter = rolling last 3 months, This year = rolling last 12 months; This period is a distinct fiscal-period param | Matches how finance reads a rolling payroll window rather than a calendar cut | [DESIGN — Step 4 Filters v2] |
| Data exposed | Distribution breakdown | Breakdown stops at distribution x pay-type dollar amounts only: no hours, no rates, no employee names, no check numbers | Owner decision for zero personal data on this widget; the grouping is org-defined distribution labels, which carry no personal detail | [DESIGN — owner decision, Step 4; API — Step 5 zero-personal-data; CODE — grouping = PR_CompensationDistribution.Name over PR_HistoryCompensation] |
| Grain / comparison | Not present | Deliberately not added (no grain toggle, no prior-period comparison) | Sign-off decision F3 kept comparison out of scope for this widget | [DESIGN — Step 4 sign-off F3] |

**Parity kept (identical to Jo):** the two-row header with the period and scope chips on the left and the view toggle on the right; the percent bars and the blue-ramp donut with legend hover-sync; the Custom From/To date fields; the one clean empty state; and the instant client-side recompute (no fetch, no skeleton) since a period change is already in hand. [DESIGN — parity with Jo]

**Open items (carried, not invented):** exports are honest stubs via Jo's existing export menu (no backend decided) [API — Step 5]; no Department filter, pay-date anchoring, recurrence, or drill-through-to-module link were added (all cut or rejected in Step 4) [DESIGN — Step 4 What Got Cut].

_Section updated 2026-08-05._

---

## W04 — Remittance Pledges
Our version = Jo's Remittance widget with a report-style table (Version A), a separate Pacing Bars view (Version B), a corrected per-pledge-term pacing calculation, and a day-based colour scale.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Table view | Table with pacing shown inline | Version-A report table (Activity, Pledge, Expected, Paid, Outstanding, % Paid, Total), strictly table-only with no in-cell bar or status column | Owner wanted the report table as the base look, kept clean | [DESIGN — Step 4 Views v2, Version A] |
| Pacing bars | Inline with the table | A separate Pacing Bars view behind a Table / Pacing bars toggle (Explore and Detail); bars do not appear in the table view | Owner wanted pacing as its own view (Version B), not mixed into the report table | [DESIGN — Step 4 Views v2, Version B; "remove the bars in the table view"] |
| Pacing calculation | Calendar-year approximation | Per pledge term: Expected = TotalPledge x daysSinceBeginDate / totalTermDays, using each pledge's own BeginDate/EndDate | The calendar-year approach mis-paces multi-year and off-cycle pledges; this is the dev-confirmed calculation-only fix, no new data needed | [API — Step 5 formula; CODE — RM_Pledge.BeginDate / EndDate already queried] |
| Colour scale | Not a day-based scale | Exactly four day-based bands keyed to daysAhead: 30+ ahead (dark green), on track within +/-30 (green), about 30 days behind (amber), 60+ days behind (red); colour is always paired with the status chip text and values | Owner-specified four-band ahead/behind scale so users read pacing at a glance without colour being the only signal | [DESIGN — owner four-band scale; API — Step 5 returns raw numbers, bands are frontend] |

**Parity kept (identical to Jo):** the receipts-through chip (Today / End of last month presets); the per-pledge drill modal; the refresh-commits fetch with the ~800ms skeleton (loading only on a receipts-through commit); Escape/backdrop close; and export / open-in-Remittance stubs. [DESIGN — parity with Jo]

**Resolved (owner, 2026-08-05):** pacing stays linear-by-days; the stepped-by-payment-schedule alternative is not pursued. Frequency/Duration remain in the data, unused for pacing [DESIGN — owner].

_Section updated 2026-08-05._

---

## W05 — Receivable Invoices Outstanding
Our version = Jo's AR widget one-to-one, with one addition inside the bucket pop-up: a select-and-confirm "move to unposted" action.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Bucket pop-up (invoice list) | Read-only list, Close only | Same list plus a row-level checkbox per invoice (no select-all), an always-enabled Confirm button beside Close, and a live "(N invoices selected)" count | Owner wants to select invoices in a bucket and act on them, not just view them | [DESIGN — Step 4 Interaction Spec; owner screenshot] |
| Confirm action | None | On Confirm, an inline footer note reading "Move to unposted transactions" appears; the action is a dev-intent signal only, it does not model or name any transaction type | The action is wanted, but the underlying transaction type is not yet settled, so the UI signals intent without inventing backend behaviour | [DESIGN — Step 4; API — Step 5 Move to Unposted logic notes] |

**Parity kept (identical to Jo, one-to-one):** the aging summary and buckets; the Received-through and Source filters; the Details / Attachments / Note / Payments invoice drill modal; the KPI and view chrome; the empty and single-bucket states; and the Bill To column showing blank by design (the modern API's BillToDisplay gap). [DESIGN — parity with Jo]

**Narrowed (owner, 2026-08-05):** Confirm does NOT stage to an entry screen; it creates the transaction through an existing code path (Payment Processing / ARPayment is the likely mechanism), but the exact process still has to be added and the target is not specifiable yet, so the UI keeps only the intent label and models no transaction type [API — Step 5 logic notes; DESIGN — owner]. The Bill To blank remains a pre-existing modern-API defect, not a design choice [CODE — BillToDisplay].

_Section updated 2026-08-05._

---

## W06 — Insurance Billing Plans
Our version = Jo's Insurance widget one-to-one, with an expandable Type-to-Plan table that adds a Cost column while keeping her Share.

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Breakdown table | Flat plan list at Explore; a non-expandable group only at Detail | Plans nested under their insurance TYPE as an expandable table (types as parents with subtotals, collapsed by default, instant no-fetch toggle) in both Explore and Detail | Owner wanted the sub-categories shown in table form, plans grouped under their type, expandable, in the view | [DESIGN — Step 4 owner change, both views] |
| Cost | Enrolled count only | Adds a Cost column per plan and per type, alongside the enrolled count | Owner wanted both count and cost per plan and per type | [DESIGN — Step 4 owner change; API — Step 5 Cost = SUM of enrolment Rate; CODE — IBEmployeePlan.Rate / IBPlanRate] |
| Share | Shown | Kept in both Explore and Detail, on both parent (type) and child (plan) rows, same meaning as Jo (row enrolled / grand total in view) | Owner asked to keep the Share in both views like Jo's design | [DESIGN — Step 4 owner "keep the share in both views"] |

**Parity kept (identical to Jo):** the Glance KPI card (total enrolled + plan-count pill + "employees and dependents" caption); the insurance-type filter chip as the only fetch (800ms skeleton, sort/expand instant); the amethyst Share bars; the "No insurance plans yet" empty state; and a zero-enrolment plan shown as a 0 / 0% row. [DESIGN — parity with Jo]

**Resolved (owner + code, 2026-08-05):** Cost is the per-enrolment premium; the Cost column shows the **total premium** (SUM of each enrolment's Rate). The code splits every enrolment into an employer share (Rate minus RateIndividual) and an employee share (RateIndividual), so employer-only or employee-only totals are derivable from the same data later if wanted; EmployerBilled and PreTax are flags on the enrolment [CODE — IBEmployeeRepository; DESIGN — owner default = total premium]. Dependents carry their own premium and are counted. **Still open:** the coverage-tier (IBTypeElection) third level is intentionally not surfaced (future); a Step 5 build follow-up (type filter as a client-side view over one nested response, no fetch) is noted but not applied here [API — Step 5].

_Section updated 2026-08-05._

---

## W07 — Deposits on Hand
Our version = Jo's Deposits widget with four owner-directed changes; everything else is kept at parity. (Jo titles it "Deposits"; the widget was renamed "Deposits on Hand" by management, rename not yet executed project-wide.)

| Aspect | Jo's design | Our design | Why | Source |
|---|---|---|---|---|
| Table pagination | Full list, unpaginated | 50 accounts per page with a pager over a 125-account dataset; the KPI total and all subtotals compute over the full filtered set (pagination is display-only); grand total 106,726,837 | Real orgs run to hundreds of depositor accounts, so the table needs paging while the headline stays a true total | [DESIGN — Step 4 owner change 1; API — Step 5 Pagination] |
| Breakdown toggle | A breakdown that did not depend on scope | Scope-dependent: at All Accounts the toggle offers Total / By Account Type only (the standalone all-accounts By Account is removed); with a single account type in scope it offers Total / By Account (that type's own accounts) | Removes a confusing all-accounts account-level view and makes the breakdown mean the same thing as the current scope | [DESIGN — Step 4 owner change 2] |
| Chart click | Clicking a chart series expanded / opened a drill-modal | Clicking an account-TYPE series (donut slice or trend line) re-scopes the top-left filter to that type and switches the breakdown to By Account; clicking an individual ACCOUNT series is inert; the old chart click-to-expand / drill-modal is removed; the table-row detail modal is kept | Owner wanted charts to drill by re-scoping, not to open a separate focus/modal | [DESIGN — Step 4 owner change 3] |
| Compare To scale | Did not include a fiscal Period option | Six options: Previous week / month / period / quarter / fiscal year / calendar year, with the fiscal Period sitting between month and quarter | Owner added a real intermediate fiscal-period delta between month and quarter | [DESIGN — Step 4 owner change 4] |

**Parity kept (identical to Jo):** the account-scope chip (All Accounts / a type / an individual account, searchable); the three views Table (default) / Distribution (donut) / Trend (multi-line); the KPI headline with delta pill and scrubbable sparkline; the account/type detail modal (opened from a table row); the empty and loading states; and values carried as DOM text. Jo's fourth size tier (large) is dropped, mapping her four tiers to our three (Glance / Explore / Detail = kpi / wide / xwide). [DESIGN — parity with Jo; Rule 12 sizing]

**Resolved (owner, 2026-08-05):** the out-of-widget drill-through is dropped for v1 (the in-widget row detail modal is enough; there is no jump to a module screen, since none exists) [DESIGN — owner]. Historical period-end balances for Trend and non-current Compare To are computed **on demand** for the first draft, to be optimized (precomputed) later if needed [DESIGN — owner; API — Step 5]. **Still open:** the balance tie-out against the modern DHAccount.CalcBalance is a backend concern not addressed here [CODE — DHAccount].

_Section updated 2026-08-05._
