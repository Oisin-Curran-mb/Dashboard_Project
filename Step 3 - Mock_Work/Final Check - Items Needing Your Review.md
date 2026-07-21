# Final Check — Items Needing Your Review

Compiled from the overnight Final Check pass (W01–W17, minus W08/W12/W14 which are out of scope) plus this morning's W02 change. Check items off as you review them. Anything not checked off is still open.

---

## W02 — Pension Plans (just changed, please sanity-check)

- [ ] Confirm the new default (Pie by Plan Type, with Grouped Bar by District as a Switch Chart Type alternate, available at every size including Small) matches what you meant.
- [ ] Confirm Large showing the chart **and** the Summary Table together (instead of Table being a third switchable view) is the right call.
- [ ] The real Dashboard-tab gallery (not the Final Check page) has its per-widget dropdown menus baked into one very large block of HTML that this session's tools couldn't safely read or edit tonight (a caching issue, not a data issue). The WRENDER logic change is live everywhere, but please manually check that the Small-size card for W02 in the actual Dashboard tab shows the "Switch chart type" option — it may still need that button added by hand.

---

## W01 — Budget Compared to Actual

- [ ] Line Description dropdown: confirmed **not** whether its list is user-created elsewhere (like Special Report Title) or a fixed/hard-coded list — needs a data/dev answer before build.
- [ ] Weekly Period View: kept in the design pending developer feasibility confirmation — no confirmed weekly transaction grain in GL data today.
- [ ] Drill-through target page/URL for the underlying GL data not yet available.

## W05 — Receivable Invoices Outstanding

- [ ] The locked doc's real default view ("KPI Tiles + Aging Bars," 4 tiles above a 5-bucket chart) isn't buildable from any single existing option — Option A (bars only) is shown as the closest substitute. Needs a decision on how to actually combine tiles + bars, and what "Oldest Invoice" should mean (that figure doesn't exist in mock data at all).
- [ ] Age bands mismatch: doc wants 5 buckets (0-30/31-60/61-90/91-120/121+), render only has 4 (0-30/31-60/61-90/90+).
- [ ] Bill-To field: confirmed empty-field bug in the Modern API today.
- [ ] Attachments/Note/Payments tabs: data sources not yet verified.
- [ ] Data Table Sort not explicitly confirmed in the old design.

## W06 — Insurance Billing Plans

- [ ] Donut by Plan view (doc's View 2) isn't built — only Bar and Table exist today.
- [ ] Data Table Sort: doc wants a user toggle between alphabetical and Enrolled-count descending — no sort control exists in the render today.

## W07 — Deposit Accounts (rebuilt 2026-07-09, sixth pass just done, please sanity-check)

- [x] ~~Distribution's drill-down behaviour.~~ Confirmed matching: All Accounts groups by type; picking a specific type drills into that type's own accounts.
- [x] ~~Trend chart rendered nothing.~~ Fixed — root cause was a sizing bug (it relied on flex-fill sizing that only actually works for W01, due to a W01-only CSS rule); switched to a fixed pixel height.
- [x] ~~Trend's "All accounts / 2 account types" toggle wasn't working.~~ Removed entirely, per direct instruction — Trend now just plots whatever the Account Type filter (inline at the top) resolves to, with no separate toggle/picker.
- [x] ~~KPI/Small used different, unfiltered logic than Large.~~ Fixed (2026-07-13) — KPI and Small now read the exact same filtered dataset and Compare To calculation as Medium/Large. Small also gained the filter-tag chips and a % Change column it was missing; KPI's title now names the active Account Type filter on this Final Check page (the real gallery's KPI title is still static — see note below).
- [x] ~~Compare To had too many options (None/Last Month/Last Quarter/Last Financial Year) and defaulted to off.~~ Simplified (2026-07-13) to just Last Month and Last Year, per direct instruction — Last Month is now the default everywhere, so a comparison always shows.
- [x] ~~Account Type filter always returned exactly 2 accounts per type, which read as broken.~~ Fixed (2026-07-13) — added 2 accounts (Petty Cash Checking, Grant Reserve 2024) so the filter now returns 3/2/2/2/3 accounts depending on type. Mock data is 12 accounts total now; new total balance is $7,451,630.
- [ ] **Trend, still worth a look:** one month of data at daily granularity (~30 points), Compare To overlaying the same scope (all accounts, or the currently-filtered type) from a comparable prior month — 1 or 12 months back. Daily figures are interpolated from monthly mock data (no real daily-balance data exists in the mock) — worth flagging to dev if daily granularity is genuinely wanted in production.
- [x] ~~Inline filters at Large.~~ Moved to the very top of the card (was previously below the filter-tag chips); the chip row is now dropped at this size to avoid showing the same two filters twice.
- [ ] Real bug found and fixed while testing this rebuild: resizing a card's Widget size never correctly showed/hid the Switch chart type section for any widget except W01 (the trim logic only recognised W01's markup). Fixed generically — now works for every widget. Also added the missing Switch chart type section to the KPI and Small slots' own dropdowns in Final Check, so resizing them larger no longer strands you without a way to reach Distribution/Trend.
- [ ] The real Dashboard-tab gallery's own Switch View menu for this widget still shows the old two-item "Account Cards / Table" list and can't reach Distribution or Trend — that markup lives inside the gallery's single giant HTML line, which this session's tools couldn't safely read or edit (same caching issue as W02's Small-dropdown gap below). Final Check reflects the full rebuild; the live gallery's menu needs a manual pass to add the two new options.
- [ ] New (2026-07-13): the real gallery's KPI/Small card titles for this widget will keep showing static "Total Balance" text — the dynamic "— Account Type" suffix only works on the Final Check page (same unreadable/uneditable giant-HTML-line issue as the line above). Underlying figures are correctly filtered either way; only the title text is stuck.
- [ ] Options B ("Balance Bars") and C ("Compact Table") are the old reconciliation-based concepts — left untouched, not reachable from Final Check, still closed per the doc.
- [ ] Drill-through (link to Deposits On Hand module): open item, needs expert/dev input.

## W09 — Payroll Scheduled Time Off

- [ ] Core interaction is missing: no inline approve/reject anywhere (bulk-approve at employee level, per-day approve/unapprove). Neither existing view (Calendar, flat List) matches the doc's "Confirmation Dashboard" (3-level Department → Employee → Day expandable list).
- [ ] "View" filter (Show All / Show Pending / Show Approved) doesn't exist — no approval-status field in mock data to filter on.
- [ ] KPI card shows a placeholder ("Total Scheduled Time-Off") instead of the doc's real "Pending Approvals" headline — no pending/approved data to compute the real figure.
- [ ] Department filter is shown unconditionally; doc says it should only appear for supervisors authorised across more than one department — no role/permissions model exists in this mockup.
- [ ] Calendar Year filter values are still fiscal-year-shaped (FY 2026 etc.) even though it's now labelled "Calendar Year" — underlying mock data wasn't reshaped.

## W10 — Loans With Balance Due

- [ ] Status filter (Active/In Arrears) is flagged by the doc itself as unconfirmed — no explicit active/arrears field found in the source data.
- [ ] Aging bucket payment-allocation calculation (oldest-first, matching legacy behaviour) is a backend calculation change, not visible in this render to verify.
- [ ] Drill-through: account names are clickable but the destination isn't confirmed.
- [ ] Data Table Sort not explicitly confirmed.

## W11 — Fixed Asset Values

- [ ] The doc's real filter model — Group By (dimension switcher) / Specific Group (dependent field) / Financial Measure (which of 5 $ figures) — isn't built. Today there's just one flat "Asset Category" filter.
- [ ] Asset Detail Table (doc's View 3 — individual assets, Tag #, Name, all 5 measures) isn't built; the Table view today is a category-level summary.
- [ ] Data Table Sort (proposed Tag # ascending) not explicitly confirmed in the old design.

## W13 — Purchasing Management

- [ ] Biggest item overall: the entire PO-status vocabulary in the render (Pending Approval / Approved / Overdue) is exactly the "earlier invented" set the doc says was replaced by four real approval stages (Awaiting my approval next / Awaiting my approval / Unapproved / Approved). Touches mock data, every Kanban/colour map, and the filter itself.
- [ ] This page uses Option B instead of Option A, since only B's code actually defaults to the Kanban board the doc calls for — worth confirming that's the right option to build forward from.
- [ ] Status Donut (doc's View 2) isn't built — no option renders a donut by approval stage.
- [ ] Approval Path filter (dynamic, depends on Status) is missing entirely.
- [ ] Department/Year/Overdue aren't scoped to the Table view only, as the doc specifies — Department and Year are both global filters today.
- [ ] Data Table Sort (proposed Date Issued, most recent first) not explicitly confirmed.

## W15 — Bank Balances

- [ ] Single Account mode — described in the doc as "the most significant view-switching behaviour of any widget on the dashboard" — isn't built. Selecting a specific account just re-filters the same cards/table/bars instead of switching to the 7-row breakdown + 4-category bar chart.
- [ ] Reconciliation status badges: still a genuinely open, undecided item per the doc (not a defect) — needs expert/dev input on whether to surface it visibly.

## W16 — Accounts Payable By Due Date

- [ ] No option groups cards by urgency tier (Overdue / Due This Week / Due This Month) as three visual sections — today it's a flat, capped list of invoice cards.
- [ ] Aging Donut (doc's View 2) only exists in Option B, uses 30-day age bands instead of the widget's own three Due Date categories, and is filtered by Due Date when the doc says it should always show all due dates — a real bug, not yet fixed since Option B isn't the option shown on the Final Check page.
- [ ] Option C ("Vendor Breakdown") is exactly the by-vendor donut idea the doc says was considered and explicitly **not** adopted — yet it's fully live and selectable today.
- [ ] Drill-through to the AP module: doc is "leaning yes," pending expert/dev confirmation.

## W17 — Gifts & Pledges

- [ ] Nothing flagged — filters, views, and KPI already matched the doc after tonight's fixes. The doc's own open items (how Pledge Due/% Due are computed per Date Range, and whether a Goal field gets added later) are data/product questions the doc itself defers, not render mismatches.

---

## Cross-cutting / tooling note

- [ ] The real Dashboard-tab gallery's per-widget dropdown menus live in one very large block of static HTML that couldn't be safely inspected or edited this session (a stale caching issue in the tooling, not a data problem). Every fix made tonight was to the underlying render logic (`WRENDER`) and mock data, which **does** apply to both the Dashboard tab and the Final Check tab — but any change that specifically involves adding/removing a *menu button* (like W02's new Small-size Switch Chart Type option) may only be visible on the Final Check page until someone verifies/edits that block directly.
