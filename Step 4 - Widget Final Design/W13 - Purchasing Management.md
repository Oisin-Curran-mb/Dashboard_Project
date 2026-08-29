# W13 — Purchasing Management

**Module:** Finance
**Status:** 🟢 Final design — locked (built 2026-08-19, composed per the owner-confirmed sheet; v2.2 same day: approval-process Kanban with drag-to-action). Locked-doc rule: the body below describes only the current final design. Superseded design thinking is not deleted, it is dated and moved to the "Design History (superseded)" section at the end of this doc.
**Full history / rejected ideas:** [Widget_Specs/W13-Purchasing-Management.md](../Step%203%20-%20Mock_Work/Widget_Specs/W13-Purchasing-Management.md)
**Data source & formulas:** [Step 1 - Dashboard Research/13 - Purchasing Management.md](../Step 1 - Dashboard Research/13%20-%20Purchasing%20Management.md)
**Confluence dossier:** Step 6 pull, 2026-07-27 (Purchasing Management). Findings handled with statuses; see Sign-off Input below.
**[2026-08-25, Feargal call] Six requirements for the purchasing board. Two of them supersede recent build work, so nothing was rebuilt yet.**

1. **Make the approval path explicit and user-specific.** Approval paths contain **ordered users and thresholds** (one person approves before the next). A viewer must be able to see which approvals are complete and which are **awaiting them**. The current build shows an approval-path filter but does not express the ordering or the viewer's own position in it.
2. **Show only actions the viewer may take.** Dragging a card represents an action, so the visible actions must respect both the approval path and the **permissions of the user viewing the board**. Currently drag is permission-blind.
3. ⚠️ **Payment approval: redirect, do not rebuild. This supersedes v2.4/v2.5.** Feargal clarified the dashboard should **preserve the existing payment functionality** and may **redirect users to the established payment screen**. The v2.4/v2.5 build instead reproduces the payment flow in the record modal, where entering invoice numbers and submitting turns the card green. **Held pending confirmation** (action list item C3) rather than ripped out, because the two readings conflict and the built version was itself owner-directed on 2026-08-19.
4. **Closed state.** Approved or completed purchase orders should move to **Closed** and leave the active board, remaining discoverable through a closed filter or view. Partly built already (v2.6 added a Finish column with Close and Void), so this is reconciliation rather than new work.
5. ⚠️ **Voided requests are unresolved.** Feargal did not settle their treatment, and the design "should avoid assuming what underlying financial reversal process occurs." The v2.6 build already makes assumptions about voiding. **Needs review against this before more is built on top.**
6. **Filter separation.** Filters must distinguish **purchase orders awaiting approval** from **invoices or payments awaiting approval**, and surface the intermediate approval steps rather than presenting only broad approved or paid end states.

**Status: documented, not built.** Items 1, 2, 4 and 6 are actionable once items 3 and 5 are settled, since all six touch the same board and rebuilding twice would be wasteful.

**Last verified against build:** 2026-08-19 via build-final-widget (Final v2.2: 66-assertion DOM-shim Node driver, 0 failures + final-check-rules.py 0 HIGH). Previous: not yet audited.

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (named) · `[TO CONFIRM]` assumed, with the owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists: if two sources disagree, both claims stay recorded, each with its own mark, until someone with backend access settles it.

---

# Final Design (current)

## Purpose
An actionable approval-process board for purchase order requests. The default Kanban view shows one column per approval state (Pending, Approved, Rejected, the states on the real record screen's Approvals tab), oldest and longest-waiting first. Dragging a card to another column actions the request through a Reason/note popup; selecting a card or table row opens the full PO record, the same screen as today. [BUILD, 2026-08-19 v2.2, owner correction: "this is the approval process, this is how kanban should be"; approval states confirmed [LIVE — owner screenshot of the Approvals tab, 2026-08-19]]

## How Other Companies Fulfil This Purpose
- Procurement/PO approval workflows are commonly visualised as **Kanban boards** with status columns, explicitly recommended for approval pipelines with SLA/overdue tracking ([Ramp](https://ramp.com/blog/streamline-procurement-processes-kanban-board), [ProcBay](https://procbay.com/blog/approval-workflow-visualization-optimizing-your-process/)). [RESEARCH]
- Approval queues in procure-to-pay tools (Tipalti, Bill.com, Planergy) are aging, actionable lists; the Step 6 dossier recommends surfacing item age. [DOC — Step 6 dossier, 2026-07-27]

**Net assessment:** Kanban is a near-exact match for the industry-standard approach; it is the default view of the built Final, with item age shown per card.

## Data Contract

All rows are drawn from the Step 1 research doc unless marked otherwise. Legacy source class: `PurchasingManagement : DataPanelControl` (`/PurchasingManagement`), confirmed via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| PO list (Kanban cards, table rows, Glance counts) | `PO_Order` | Purchase order/requisition records: status, vendor, date issued, total/outstanding amount. Access-scoped: administrators see all orders; other users only see orders on approval paths they are part of. Rejected orders are never shown. | [DOC — Step 1 research] |
| Approval Path filter values | `PO_ApprovalPath` / `PO_ApprovalUser` | Distinct paths from the orders matching the currently selected status, filtered to paths the user is authorised on. Disabled if only one path exists. **Configurable, customer data:** paths and their approver sequences are set up by the customer in the Purchasing module; the dropdown is a live query, not a fixed list (Modern API: `GET /api/dashboard/purchasing-management/approval-paths?status={int}` returns `{ApprovalId, Name}`). | [DOC — Step 1 research; DOC — Widget_Comparison_Classic.html code trace, checked 2026-08-19] |
| Status/stage set | code, not data | **Hardcoded, not configurable:** the widget's status options are a fixed set in both codebases. Legacy: a 4-option status filter with fixed WHERE logic per option. Modern API: `GET /api/dashboard/purchasing-management/status-options` returns a **static** 4-item array (Needs My Approval / Waiting for Others / All Pending / All Orders; live beta1 UI words them Awaiting my approval next / Awaiting my approval / Unapproved / Approved [LIVE, owner screenshot 2026-08-19]). | [DOC — Widget_Comparison_Classic.html code trace, checked 2026-08-19] |
| Kanban approval state (Pending / Approved / Rejected) | derived + new | The Final's three states regroup the legacy data: Pending = status 0 (pending orders the user can see), Approved = status 1, **Rejected = new to the dashboard** (rejected orders exist in the data but the legacy widget never returns them). The personal-queue distinction (awaiting my approval next vs awaiting my approval) is no longer a column or filter; it moves to Design History. Serving the Rejected column needs a data/API change (Sign-off Readiness row 9). | [BUILD, 2026-08-19 v2.2; legacy exclusions per DOC — Step 1 research] |
| Approve / reject action + Reason note | new, no API today | Drag to Approved or Rejected records the state change plus a Reason/note (the field on the real Approvals tab [LIVE — owner screenshot 2026-08-19]). No dashboard approve/reject write API exists in either codebase today; the Step 6 dossier's own open question ("Can approve/reject be done via API?"). Mock updates in memory only. | [TO CONFIRM — backend; Sign-off Readiness row 10] |
| Payment state (Approved cards, v2.3/v2.4) | new, no API today | Two states carried by card colour + badge: **not paid** (neutral card, amber "Payment: not paid" badge) and **paid** (green card, "Payment: paid"). Clicking an unpaid Approved card opens the record modal's Payment Approval tab, where entering the invoice numbers and submitting turns the card green (one step, owner decision 2026-08-19; on the real screen the paid signal is the check number/date being filled [LIVE — owner screenshot of the Payment Approval tab, 2026-08-19], so dev should treat green as check-issued). Payment approval is a **separate invoice-level workflow on its own Payment Approval Path**, living only on the record screen; neither codebase serves any of it to the dashboard. | [TO CONFIRM — backend; Sign-off Readiness rows 11-12; Rule 11 in the mock] |
| Record status vocabulary, Closed / Voided (v2.6) | record screen, `PO_Order` status 2 / 3 | The Requests/Update screen's own Status field offers **Unapproved (0) / Approved (1) / Closed (2) / Voided (3)** and is **manually editable while a record is Unapproved, locked once Approved** [LIVE, beta1 click-throughs 2026-08-19, both states checked]. The widget's queries only ever select statuses 0 and 1, so archived orders never reach the dashboard today. In the Final: Close and Void are the split Finish column's drop targets (Close = paid only; Void = unpaid only; confirm popup with reason); a confirmed card leaves the board and is served to the PO Table under the Closed / Voided status filter values, which needs the API to start serving statuses 2 and 3 (Sign-off row 13). Both states are final: approvals locked, payment history read-only, no return to the board. | [LIVE — beta1, 2026-08-19; DOC — Widget_Comparison_Classic.html status logic] |
| Hold (v2.4) | `PO_Approval` rows (legacy) | The real Approvals tab has a **Hold checkbox + Reason per approval row** [LIVE — owner screenshot, 2026-08-19], confirming hold exists in the legacy approval model. In the widget: hold is available while something is in progress (Pending cards, Approved-unpaid cards), never on Paid or Rejected; a held card turns yellow with a lock + reason and cannot be dragged until the hold is removed (both actions record a reason note). Whether the payment side has its own hold is not visible in the code trace. No dashboard API serves or writes hold today. | [LIVE — Approvals tab screenshot; TO CONFIRM — payment-side hold + backend fields; Sign-off Readiness row 12] |
| Stage: Awaiting my approval next (status 0) | `PO_Order` | `WHERE Status=0 AND NOT Rejected AND user IN PO_ApprovalPath` AND either no approvals yet and the user is sequence 1, or the max approved sequence + 1 equals the user's sequence. | [DOC — Step 1 research]. ⚠️ Modern API gap, accepted as a known risk 2026-08-19 (see Sign-off Readiness row 7). |
| Stage: Awaiting my approval (status 1) | `PO_Order` | Orders on paths the user submitted/is part of, not yet approved by them. | [DOC — Step 1 research] |
| Stage: Unapproved (status 2) | `PO_Order` | All pending orders the user is authorised to see (path member, admin, or override permission). | [DOC — Step 1 research] |
| Stage: Approved (status 3) | `PO_Order` | `PO_Order WHERE Status=1` | [DOC — Step 1 research] |
| Item age (per card) | derived | Days elapsed since the order's date issued, as of the current date. Shown as "waiting N days" on pending stages, "issued N days ago" on Approved. | [BUILD, 2026-08-19; aging read per Step 6 dossier recommendation] |
| Glance figures (counts per approval stage) | derived | Count of POs per stage using the stage logic above, actionable stage first, plus open-request count and outstanding total. No single headline number, by design. | [DOC — Step 1 research, derived; presentation decision in Widget_Specs/W13] |
| Department (Table column/filter) | not confirmed | No known source field on purchasing records. If it turns out not to be real: the Department column and filter drop from the Table view; no other view uses it. | [TO CONFIRM — owner TBD; rendered as if real per Rule 11] |
| Year (Table filter) | not confirmed | No known source field. If not real: the Year filter drops and the Table loses historical lookup by FY. | [TO CONFIRM — owner TBD; rendered as if real per Rule 11] |
| Overdue (Table flag/filter/highlight) | not confirmed | Needs a flag or date field marking POs past an expected turnaround. Built as: expected-by date in the past on a not-yet-approved order. If not real: the Overdue filter, highlight, and red row treatment drop from the Table view. | [TO CONFIRM — owner TBD; rendered as if real per Rule 11] |
| Filter persistence | legacy behaviour | Both global filter selections are saved per user and remembered across sessions. | [DOC — Step 1 research]. ⚠️ Not implemented server-side in the Modern API yet (see Sign-off Readiness row 8). |

- **Headline math:** no single headline; Glance shows counts per approval stage (see table above). The Glance card title reads the live "N awaiting my approval next" figure. [BUILD, 2026-08-19]
- **Favourability/direction logic:** Overdue POs are the unfavourable signal, Table view only: red row highlight always paired with a text flag, never colour alone. [BUILD, 2026-08-19]
- **Rounding / currency / locale rules:** amounts render as dollars with two decimals in the build; org-currency localisation is *not yet specified* beyond that.
- **"Data as of" freshness:** *Not yet specified*. Refresh reloads the data [DOC — Step 1 research].

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified* for a user with no Purchasing Management rights at all. Access within the module is scoped (admins see all orders; others only orders on approval paths they are part of) [DOC — Step 1 research]. |
| Empty (org has no POs at all / user not on any path) | Purposeful empty state: "Nothing needs your approval" with guidance copy (adapted from Jo's design-sandbox purchasing build, with attribution). [BUILD, 2026-08-19] |
| Empty (filters match nothing) | Filter-specific message: "No purchase requests match" with a prompt to change the filters. Table view shows an in-table empty row plus the totals row at zero. [BUILD, 2026-08-19] |
| Partial (a state with zero POs) | The column stays visible with a quiet "None waiting" line (not hidden, not blank). [BUILD, 2026-08-19]. Note: the legacy rule "rejected orders are never shown" [DOC — Step 1 research] is deliberately superseded by the v2.2 Rejected column (Sign-off Readiness row 9). |
| Loading | *Not yet specified* (no fetch in this mock; the pattern to adopt is the standard chip spinner + skeleton used by the other Finals). |
| Error / API failure | *Not yet specified*. |
| Stale data | No "data as of" signal specified. Refresh reloads the data [DOC — Step 1 research]. |

## Interaction Spec

- **Card click (Kanban) and row click (Table), plus the row's edit icon:** open the full PO record, the same screen as today: Purchasing Management, Requests, Update, with Detail / Approvals / Attachments / Note / Payment Approval tabs [DOC — Step 1 research; owner decision 2026-08-19]. In the mock this is a read-only modal replica of that screen with all five tabs; the live product navigates. The record screen is view/edit today and its own flow is unchanged by this design (see Sign-off Readiness row 6, settled).
- **Drag to action (v2.2):** every Kanban card is draggable; dropping it on a different column opens a popup with a Reason/note field (mirroring the real Approvals tab's Reason). Confirm applies the move and records the note on the request (visible in the record modal's Note tab, and as the rejection Reason on its Approvals tab); Cancel reverts with no change. Same-column drops are a no-op. [BUILD, 2026-08-19 v2.2, per direct instruction]
- **Payment entry, one step (v2.4, upgraded v2.5 to record-screen parity):** clicking an unpaid Approved card opens the record modal directly on its Payment Approval tab, which now mirrors the real tab exactly: Add Invoice Payment Approval, the invoice grid (Invoice Number / Tax / Freight / Other / Check # / Check Date / Setup Information), per-invoice account distribution (Account, Description, Project, Amount, Fund / Department / Account #), and the real **Submit for Approval** checkbox, which marks the request paid, fills the mock check fields, and turns the card green. Green = paid; dev should treat it as check-issued. [BUILD, 2026-08-19 v2.5, per direct instruction; grid verified against the live Requests/Update screen, beta1, 2026-08-19]
- **PO record modal, record-screen parity (v2.5):** the popup now has the same abilities as Requests/Update [LIVE click-through, beta1, 2026-08-19]: header form (Vendor block with address and terms, Ship To, Email, Type, record Status in its own vocabulary (Unapproved / Approved / Closed / Voided), Approval Path editable while Pending, Payment Approval Path, Requisition or Check Request # and date, Issued To, Agent, Shipping, Date Requested); Detail line-item grid (Period / Account / Description / Project / Amount, Fund / Department / Account #, Tax / Freight / Other / Total); the Approvals tab as the real interactive grid ("Ends with" row, Approved / Rejected checkboxes + Reason, Hold checkbox + Reason, Approval Updated By), where ticking boxes drives the card through the same guards as drag (held requests refuse approval changes, paid requests are locked); Attachments with an Add New Attachment stub; editable Note + activity log. All edits persist in-memory for the session; an Update button and Cancel mirror the real footer. [BUILD, 2026-08-19 v2.5]
- **Hold / remove hold (v2.4):** Put on hold / Remove hold buttons in the record modal (available on Pending and Approved-unpaid requests), each recording a reason note. A held card turns yellow with a lock icon + reason, and cannot be dragged: dragstart is blocked with a toast and the move guard refuses held cards, until someone removes the hold. Mirrors the real Approvals tab's Hold + Reason. [BUILD, 2026-08-19 v2.4, per direct instruction]
- **Inline approve/reject:** **adopted in drag form** (v2.2, owner instruction 2026-08-19), superseding the same morning's "deferred" decision. The Step 6 dossier's recommendation 11.2 (make approvals actionable in-widget) is thereby adopted, in drag-with-note form rather than her focus-overlay form.
- **Kanban / Table view toggle:** an always-visible segmented toggle in the widget header at Explore and Detail (added v2.1, owner feedback 2026-08-19: switching views, and getting back after drilling deeper, must never require the 3-dot menu). Kept in sync with the menu's Switch chart type. [BUILD, 2026-08-19]
- **"+N more" under a trimmed Kanban column (Explore):** switches to the PO Table view; the header toggle is the way back. [BUILD, 2026-08-19]
- **Keyboard / focus behaviour:** cards are real buttons, table rows are focusable with Enter-to-open, filters are native selects, the modal is role=dialog with a Close button. [BUILD, 2026-08-19] Full audit *not yet reviewed against the build*.

## Filters
| Filter | Scope | Values |
|--------|-------|--------|
| PO Status | Global, view-aware (v2.6) | Kanban: All statuses · **Pending · Approved · Rejected** (the live approval states; picking one hides the other columns). Table adds **Closed · Voided**, and its "All statuses" includes the archive. Maps to legacy statuses: Pending = 0, Approved = 1, Closed = 2, Voided = 3; Rejected is new to the dashboard (see Data Contract). |
| Approval Path | Global (all views) | Dynamic, depends on Status; disabled if only one path exists; defaults to "All approval paths". Paths are customer-defined (mock set: Administration, Education Ministry, Everyone, QA Path, per the live beta1 screenshots, 2026-08-19). |
| Department | **Table view only** | All Departments · Finance · Admin · Ministry · Facilities · IT. Unconfirmed field, Rule 11. |
| Year | **Table view only** | All years · FY 2026 · FY 2025. Unconfirmed field, Rule 11. |
| Overdue | **Table view only** | A toggle: show overdue POs only. Overdue rows always get the red highlight plus a text flag regardless of the toggle. Unconfirmed field, Rule 11. |

**No Small size for this widget**, for any view (standing exception).

## Data Table Sort
**Default: oldest first (Date Issued, ascending), settled by owner decision 2026-08-19.** This is the aging read: the longest-waiting POs surface first, in both the Table view and inside each Kanban column, and it defines what "top" means in trimmed views.

**Trimmed-view rule:** wherever a size shows a subset (Kanban: top 2 POs per column at Explore; Table: 5 rows at Explore, up to 10 at Detail), the subset follows the sort above (oldest first).

## Drill-Through
**Already exists, kept as-is:** card click, row click, or the row's edit icon opens the full PO record (Detail/Approvals/Attachments/Note/Payment Approval tabs) — one of only two dashboard widgets with direct action capability.

*Target evidence:* destination is the PO record in the Purchasing Management module, Requests, Update [DOC — Step 1 research; URL pattern seen in the owner's beta1 screenshot, 2026-08-19: `/PurchasingManagement/Requests/Update/<guid>`].

## Refresh
Standalone icon, present at every size including Glance. What refresh does: reloads the data [DOC — Step 1 research]. Whether it shows a spinner, updates a timestamp, or performs a full re-fetch is *not yet specified*.

## Views (Switch View) and sizing

### View 1 — Kanban *(default, actionable: the live approval flow)*
Columns — **Pending · Approved · Rejected** (the approval process) — with PO cards (ref, vendor, amount, item age; overdue age reads red with text). Cards sorted oldest first within each column. Drag a card to another column to action it (Reason/note popup, see Interaction Spec). **Card colour carries the sub-state (v2.4), always paired with a text label:** neutral = in its column's normal state; amber "Payment: not paid" badge on unpaid Approved cards; **green card = paid**; **yellow card + lock = on hold** (undraggable until the hold is removed). **The board ends with the split Finish column (v2.6):** Close on top (paid cards only) and Void below (unpaid only), each behind a confirm popup with a reason; a confirmed card leaves the board. The board shows only open or in-approval work; the archive lives in the Table. The status filter hides irrelevant columns. No Overdue column: that flag lives in the Table view only.

### View 2 — PO Table *(everything over time)*
PO # · Vendor · Amount · Department · Status · Issued (+ open-record icon), with Department, Year, and Overdue available as filters/highlights here specifically (visible at Detail). Totals row: request count + combined amount. **The Table's job differs from the board's (owner decision, v2.6): it views everything over the selected time window, so its status filter adds Closed and Voided values and its "All statuses" includes the archive**, while the Kanban stays the live approval flow. Full list for detailed review and historical lookup.

### Size behaviour
Rule 12 applies: Glance / Explore / Detail, no Small.

| Size | Behaviour |
|------|-----------|
| **Glance (Jo's KPI size)** | Three compact state-count cards (Pending first), plus pending-request count and outstanding total. Card title reads the live "N pending approval" figure. No switch, no download. |
| **Explore (mid tier)** | Kanban: all 4 columns, top 2 POs each, "+N more" into the Table view. Table: 5 rows. Global filters (Status, Approval Path) and the header Kanban/Table toggle visible. |
| **Detail (largest tier)** | Kanban: all 4 columns, full cards, column scroll. Table: up to 10 rows, totals row, Department/Year/Overdue filters visible. Header Kanban/Table toggle visible. |
| **Expanded** | Active view, full detail, all filters live in the modal. |

## Accessibility
- Colour is never the only signal: the red Overdue treatment is always paired with a text flag and icon; stage colours are paired with the stage name and count. [BUILD, 2026-08-19]
- Values exist as text in the DOM (stage counts, amounts, ages; sr-only stage names on Glance cards). [BUILD, 2026-08-19]
- Table semantics are real (`th` + scope); cards are buttons with descriptive aria-labels; rows are keyboard-openable; filters are native selects with aria-labels; the PO record and move-note modals are role=dialog aria-modal. [BUILD, 2026-08-19] Full audit *not yet reviewed against the build*.
- **Known gap (v2.2): drag-to-action is pointer-only.** No keyboard equivalent for moving a card between columns is built yet; the record modal is the keyboard route to a request today. A keyboard action pattern is needed before dev build. [BUILD, 2026-08-19; flagged, not resolved]

## What Got Cut (and why)
- **Encumbrance chart (budget committed by accounting period)** — dropped earlier in this project and confirmed cut by owner decision 2026-08-19, when the Step 6 dossier's "keep both jobs" recommendation was considered and the queue-only scope was chosen. The formula is preserved in Design History for the record.
- **Status Donut (old View 2)** — dropped by owner decision 2026-08-19. It was never built by any option, and the Kanban columns already give the per-stage proportional read.

## Sign-off Input (Jo / Step 6 dossier, pulled 2026-07-27)
- **11.2 inline approve/reject (focus overlay):** **Adopted in drag form** (v2.2, owner instruction 2026-08-19, superseding the same morning's Deferred status): approvals are actionable in-widget via drag-with-note; card click still opens the existing PO record screen for the deep case, exactly the dossier's "keep an open-full-record route" pairing.
- **Aging / item age in the queue:** **Accepted**; built (age per card, oldest-first sort).
- **Keep the encumbrance chart ("two jobs, keep both"):** **Not adopted** for this Final (owner decision 2026-08-19); the chart stays cut. Recorded as a divergence, both positions kept.
- **Purposeful empty / caught-up states:** **Accepted**; built with copy adapted from Jo's build.
- **Glance "N awaiting my approval" actionable read:** **Accepted**; the Glance card title reads the live figure.
- Other dossier items (currency inconsistency, chart-vs-filter coupling) attach to the cut encumbrance chart and are moot for this Final.

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Department as a real field on purchasing records: not confirmed to exist | field | TBD | Table view only (Rule 11 in the mock) |
| 2 | Year as a real field on purchasing records: not confirmed to exist | field | TBD | Table view only (Rule 11 in the mock) |
| 3 | An "Overdue" flag/date field to filter on: not confirmed to exist | field | TBD | Table view only (filter, highlight, red treatment; Rule 11 in the mock) |
| 4 | Data Table Sort default | product decision | Owner | No — **settled 2026-08-19: oldest first (aging)**, defines "top" in trimmed views |
| 5 | Whether POs should be groupable by department or vendor, beyond status | product decision | TBD | No |
| 6 | PO open/edit action flow | interaction spec | Owner | No — **settled 2026-08-19: card/row click opens the existing PO record screen, same as today; no new in-widget action flow. Dossier 11.2 inline approve/reject deferred** |
| 7 | Modern API gap: the sequence-based "Awaiting my approval next" chain check is only partially/approximately reimplemented; re-verify against the legacy logic before relying on it in the rebuild | backend / math | TBD | No — **accepted as a known risk by the owner, 2026-08-19** (build proceeds on mock data; must be verified before dev relies on it; also flagged in the developer punch list) |
| 8 | Modern API gap: user preference persistence (last-used status + approval path) not implemented server-side yet | backend | TBD | No (degrades filter persistence, does not block rendering) |
| 9 | Rejected orders on the dashboard: the legacy widget **never returns rejected orders**; the Rejected column needs the API to start serving them (new, v2.2) | backend / data | TBD | No (owner-accepted forward design, 2026-08-19; a dev-build prerequisite for the Rejected column, tracked for backend) |
| 10 | Approve/reject write API with a Reason/note: none exists for the dashboard in either codebase; the Step 6 dossier's own open question ("Can approve/reject be done via API?") (new, v2.2) | backend | TBD | No (owner-accepted forward design, 2026-08-19; a dev-build prerequisite for drag-to-action, tracked for backend) |
| 11 | Payment status as a dashboard read field: payment approval lives only on the record screen today, no dashboard API serves it; the Approved-card paid/not-paid state needs a new read field (v2.4: green = paid, treat as check-issued) (new, v2.3, reshaped v2.4) | backend | TBD | No (owner-accepted forward design, 2026-08-19; a dev-build prerequisite for the payment state, tracked for backend) |
| 12 | Write APIs for the v2.4 in-widget actions: hold / remove hold with a reason (hold is real on legacy approval rows, but not writable from the dashboard) and invoice payment entry (Add Invoice Payment Approval from the widget). Also confirm whether the payment side has its own hold. (new, v2.4) | backend | TBD | No (owner-accepted forward design, 2026-08-19; dev-build prerequisites for hold and payment entry, tracked for backend) |
| 13 | Archive on the dashboard: the widget's queries only select statuses 0 and 1, so the PO Table's Closed / Voided filter values need the API to serve statuses 2 and 3, and the Finish column's Close / Void actions need a status write (manual on the record screen today, verified live). (new, v2.6) | backend | TBD | No (owner-accepted forward design, 2026-08-19; dev-build prerequisites for the Finish column and Table archive, tracked for backend) |

Rows 1-3, 7, 9 and 10 stay open as backend confirmations; none block the mock build after the 2026-08-19 decisions above.

## Fine-Tuning Notes
- Overdue POs always highlighted in red plus a text flag in the Table view (the only view that surfaces this flag)
- PO Status filter hides irrelevant Kanban columns
- Department and Year filters narrow the Table view only, pending confirmation both are real fields
- Approval Path options re-derive from the orders matching the selected status; an impossible path selection resets to "All approval paths"

---

# Design History (superseded — kept for the record)

## 2026-08-19 (later the same day) — v2.2 supersedes the four-stage Kanban columns
The v2.0/v2.1 Final built that morning used the four status-filter options as Kanban columns (Awaiting my approval next · Awaiting my approval · Unapproved · Approved) with no in-widget actioning ("inline approve/reject deferred"). The owner corrected this after checking the real record screen's Approvals tab: the Kanban should be the approval PROCESS (Pending / Approved / Rejected) with drag-to-action and a Reason/note popup. Superseded and kept for the record: the four-stage column set (those four remain the widget's hardcoded status-FILTER options in both codebases, see Data Contract; they are just no longer columns); the personal-queue distinction (awaiting my approval next vs awaiting my approval) as a surfaced dimension; the "inline actioning deferred" decision (dossier 11.2 now adopted in drag form); the Glance four-stage-count card design; and the unqualified "rejected orders are never shown" access rule (now a recorded divergence, Sign-off Readiness row 9).

## 2026-08-19 — Final build supersedes the pre-build design body
The sections above describe the built Final (purF branch, v2.0). The following pre-build content is kept for the record:

- **Old View 2 — Status Donut:** "PO count split by the same four approval stages — a quick proportional view of the backlog." Never built by any option; dropped by owner decision 2026-08-19.
- **Old size table (Small/Medium/Large/KPI model):** Medium (2×2): Kanban 2 columns visible, top 2 POs each; Donut + legend + counts; Table 5 rows. Large (4×4): all 4 stage columns, full cards, scrollable; Donut + legend + total value; Table all rows (up to 10), totals row, Department/Year/Overdue filters visible. KPI (1×0.5): small horizontal bar (counts per approval stage) + compact status-count cards, PO Status filter only, no download, no switch. Superseded by the Rule 12 Glance/Explore/Detail table above; the "small horizontal bar" element of the KPI design was simplified to the four stage-count cards.
- **Old Data Table Sort proposal:** "Date Issued, most recent first. Not explicitly confirmed — flag for confirmation before build." Superseded by the owner's 2026-08-19 decision: oldest first (aging).
- **Old Purpose framing:** "Tracks purchase orders by status — pending approval, approved, and overdue…" with the evidence note that this was the widget's invented framing, not the confirmed status vocabulary. The confirmed four real stages are now the design's own vocabulary everywhere, so the framing note is history.
- **Encumbrance chart (cut earlier, formula kept):** Encumbrance per period = `SUM(Quantity × UnitPrice − DollarsApplied)`, `WHERE PeriodID != null`, `GROUP BY GLPeriod`, from `PO_OrderDetail`; the chart was filtered by the same Status and Approval Path selections as the table [DOC — Step 1 research]. The old design's only documented hover (a tooltip on the encumbrance bar) belonged to this chart and did not carry over.
- **Old Sign-off Readiness rows 4/6/7 as blocking:** rows 4 and 6 were settled and row 7 accepted as a known risk by the owner on 2026-08-19 (recorded in the live table above; this history entry preserves that they previously read "Yes, blocks build").
- **Old interaction spec gaps:** "Kanban card hover and click: not yet specified. Donut segment hover and click: not yet specified. KPI bar / status-card hover and click: not yet specified." All either specified by the 2026-08-19 decisions or moot (donut dropped).
