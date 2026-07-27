# W13 — Purchasing Management

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W13-Purchasing-Management.md](../Step%203%20-%20Mock_Work/Widget_Specs/W13-Purchasing-Management.md)
**Data source & formulas:** [Step 1 - Dashboard Research/13 - Purchasing Management.md](../Step 1 - Dashboard Research/13%20-%20Purchasing%20Management.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (named) · `[TO CONFIRM]` assumed, with the owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists: if two sources disagree, both claims stay recorded, each with its own mark, until someone with backend access settles it.

## Purpose
Tracks purchase orders by status — pending approval, approved, and overdue — so finance and procurement staff can manage the PO pipeline without leaving the dashboard.

*Evidence note:* "pending approval, approved, and overdue" is this widget's framing, not the confirmed status vocabulary. The confirmed real approval-workflow stages are Awaiting my approval next · Awaiting my approval · Unapproved · Approved [DOC — Step 1 research, confirmed via Widget_Comparison_Classic.html, 2026-07-08]. "Overdue" exists in this design only as a proposed Table-view flag and is not a confirmed field [TO CONFIRM — owner TBD]. See Data Contract.

## How Other Companies Fulfil This Purpose
- Procurement/PO approval workflows are commonly visualised as **Kanban boards** with status columns (Requested → Approved → Ordered → Received), explicitly recommended for approval pipelines with SLA/overdue tracking ([Ramp](https://ramp.com/blog/streamline-procurement-processes-kanban-board), [ProcBay](https://procbay.com/blog/approval-workflow-visualization-optimizing-your-process/)).

**Net assessment:** Kanban is a near-exact match for the industry-standard approach to this problem — strong external confirmation for making it the default view here.

## Data Contract

All rows are drawn from the Step 1 research doc unless marked otherwise. Legacy source class: `PurchasingManagement : DataPanelControl` (`/PurchasingManagement`), confirmed via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| PO list (Kanban cards, donut counts, table rows) | `PO_Order` | Purchase order/requisition records: status, vendor, date, total/outstanding amount. Access-scoped: administrators see all orders; other users only see orders on approval paths they are part of. Rejected orders are never shown. | [DOC — Step 1 research] |
| Approval Path filter values | `PO_ApprovalPath` / `PO_ApprovalUser` | Distinct paths from the orders matching the currently selected status, filtered to paths the user is authorised on. | [DOC — Step 1 research] |
| Stage: Awaiting my approval next (status 0) | `PO_Order` | `WHERE Status=0 AND NOT Rejected AND user IN PO_ApprovalPath` AND either no approvals yet and the user is sequence 1, or the max approved sequence + 1 equals the user's sequence. | [DOC — Step 1 research]. ⚠️ The complex sequence-based chain check is only partially/approximately reimplemented in the Modern API; re-verify against the legacy logic before relying on it in the rebuild [DOC — Step 1 research, Modern API gap]. |
| Stage: Awaiting my approval (status 1) | `PO_Order` | Orders on paths the user submitted/is part of, not yet approved by them. | [DOC — Step 1 research] |
| Stage: Unapproved (status 2) | `PO_Order` | All pending orders the user is authorised to see (path member, admin, or override permission). | [DOC — Step 1 research] |
| Stage: Approved (status 3) | `PO_Order` | `PO_Order WHERE Status=1` | [DOC — Step 1 research] |
| KPI figures (counts per approval stage) | derived | Count of POs per stage using the stage logic above. No single headline number, by design (see Views: KPI size). | [DOC — Step 1 research, derived; presentation decision recorded in Widget_Specs/W13] |
| Department (Table column/filter) | not confirmed | No known source field on purchasing records. If it turns out not to be real: the Department column and filter drop from the Table view; no other view uses it. | [TO CONFIRM — owner TBD] |
| Year (Table filter) | not confirmed | No known source field. If not real: the Year filter drops and the Table loses historical lookup by FY. | [TO CONFIRM — owner TBD] |
| Overdue (Table flag/filter/highlight) | not confirmed | Needs a flag or date field marking POs past an expected turnaround. If not real: the Overdue filter, highlight, and red row treatment drop from the Table view. | [TO CONFIRM — owner TBD] |
| Filter persistence | legacy behaviour | Both filter selections are saved per user and remembered across sessions. | [DOC — Step 1 research]. ⚠️ User preference persistence (last-used status + approval path) is not implemented server-side in the Modern API yet [DOC — Step 1 research, Modern API gap]. |
| Encumbrance (historical, chart cut) | `PO_OrderDetail` | Encumbrance per period = `SUM(Quantity × UnitPrice − DollarsApplied)`, `WHERE PeriodID != null`, `GROUP BY GLPeriod`; the chart was filtered by the same Status and Approval Path selections as the table. Recorded for history only: the encumbrance chart is cut from this design (see What Got Cut). | [DOC — Step 1 research] |

- **Headline math:** no single headline; the KPI size shows counts per approval stage (see table above).
- **Favourability/direction logic:** Overdue POs are the unfavourable signal and are always highlighted red in the Table view (see Fine-Tuning Notes); no other good/bad logic is defined.
- **Rounding / currency / locale rules:** *Not yet specified*.
- **"Data as of" freshness:** *Not yet specified*. Refresh reloads the data [DOC — Step 1 research].

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified*. Access within the module is scoped (admins see all orders; others only orders on approval paths they are part of) [DOC — Step 1 research], but what renders for a user with no Purchasing Management rights at all is undefined. |
| Empty (org has no POs at all) | *Not yet specified*. |
| Partial (some data missing) | Rejected orders are never shown [DOC — Step 1 research]. Behaviour of a stage with zero POs (empty Kanban column vs hidden column, empty donut segment) is *not yet specified*. |
| Loading | *Not yet specified*. |
| Error / API failure | *Not yet specified*. |
| Stale data | No "data as of" signal specified. Refresh reloads the data [DOC — Step 1 research]; see Refresh. |

## Interaction Spec

- **Table view, edit icon (per row):** navigates away from the dashboard to the full PO record in the Purchasing Management module, with Detail / Approvals / Attachments / Note / Payment Approval tabs [DOC — Step 1 research]. **The action flow around this edit is undefined:** no confirmation step, success state, failure state, undo, or return path back to the dashboard is specified. *Not yet specified.*
- **Kanban card hover and click:** *Not yet specified*.
- **Donut segment hover and click:** *Not yet specified*. (The old design's only documented hover, a tooltip on the encumbrance bar showing that period's encumbrance amount [DOC — Step 1 research], belonged to the cut encumbrance chart and does not carry over.)
- **KPI bar / status-card hover and click:** *Not yet specified*.
- **Keyboard / focus behaviour** for filters, Switch View, and edit icons: *Not yet specified*.

## Filters — decided this round
| Filter | Scope | Values |
|--------|-------|--------|
| PO Status | Global (all views) | **Awaiting my approval next · Awaiting my approval · Unapproved · Approved** — the confirmed real approval-workflow stages, replacing the earlier invented All/Pending Approval/Approved/Overdue set |
| Approval Path | Global (all views) | Dynamic, depends on Status; disabled if only one path exists — matches old design |
| Department | **Table view only** | All Departments · Finance · Admin · Ministry · Facilities · IT — kept, but scoped down: a department breakdown mainly makes sense as a table column/filter, not as a Kanban or Donut dimension |
| Year | **Table view only** | FY 2026 · FY 2025 · FY 2024 — kept specifically for looking up old purchases in the table; not offered as a global filter since it doesn't add value to the live Kanban/Donut views |
| Overdue *(flag, separate from PO Status)* | **Table view only** | Flags POs past an expected turnaround — useful as a table filter/highlight, but doesn't map to a Kanban column since it isn't one of the real approval-workflow stages |

**Still needs backend/data confirmation:** Department and Year as real fields on purchasing records, and an "Overdue" flag/date field to filter on — none are confirmed to exist yet. The decision above is about how these behave *if* they exist, not confirmation that they do.

**No Small size for this widget**, for any view.

## Data Table Sort
Proposed default: Date Issued, most recent first. **Not explicitly confirmed — flag for confirmation before build.**

**Trimmed-view rule:** wherever a size shows a subset (Kanban: top 2 POs per column at Medium; Table: 5 rows at Medium, up to 10 at Large), the subset follows the table sort above. Because that default (Date Issued, most recent first) is itself proposed only [TO CONFIRM — owner TBD], what "top" means in the trimmed views (most recent vs largest amount) is also unconfirmed; see Sign-off Readiness.

## Drill-Through
**Already exists, kept as-is:** each row's edit icon navigates to the full PO record (Detail/Approvals/Attachments/Note/Payment Approval tabs) — one of only two dashboard widgets with direct action capability.

*Target evidence:* destination is the PO record in the Purchasing Management module [DOC — Step 1 research]. The page URL pattern has not been captured with a `[LIVE]` check; *not yet verified*.

## Refresh
Standalone icon, present at every size including KPI.

What refresh does: reloads the data [DOC — Step 1 research]. Whether it shows a spinner, updates a timestamp, or performs a full re-fetch is *not yet specified*.

---

## Views (Switch View)

### View 1 — Kanban *(default)*
Columns — Awaiting my approval next · Awaiting my approval · Unapproved · Approved — with PO cards. Pipeline view makes status progression clear and scannable. No Overdue column — that flag lives in the Table view only (see Filters above).

### View 2 — Status Donut
PO count split by the same four approval stages — a quick proportional view of the backlog.

### View 3 — PO Table
PO # · Vendor · Amount · Department · Status · Date, with Department, Year, and Overdue available as filters/highlights here specifically. Full list for detailed review, export, and historical lookup.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | Kanban: 2 columns visible, top 2 POs each. Donut: + legend + counts. Table: 5 rows. Switch View available. |
| **Large (4×4)** | Kanban: all 4 stage columns, full cards, scrollable. Donut: + legend + total value. Table: all rows (up to 10), totals row, Department/Year/Overdue filters visible. Switch View available. |
| **KPI (1×0.5)** | Small horizontal bar (counts per approval stage) + compact status-count cards — a deliberate exception to the single-number KPI pattern, since this data is inherently multi-category. PO Status filter only, no download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

*(No Small size — see note above.)*

## Accessibility

- Colour is never the only signal: the red Overdue highlight in the Table view must be paired with a label, icon, or text flag, not colour alone. *Not yet reviewed against the build.*
- Chart values (Kanban card counts, donut segments, KPI bar) exist as text in the DOM (sr-only or visible table), not hover-only. *Not yet reviewed against the build.*
- Table semantics are real (`th`/scope), and interactive controls (filters, Switch View, edit icons) are reachable by keyboard. *Not yet reviewed against the build.*

---

## What Got Cut (and why)
- **Encumbrance chart (budget committed by accounting period)** — dropped earlier in this project; the three status-based views above are the confirmed replacement. *(Decision recorded in the Step 3 spec: "Encumbrance chart — dropped... by decision this session" [DOC — Widget_Specs/W13-Purchasing-Management.md]. The formula is preserved in the Data Contract for history.)*

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Department as a real field on purchasing records: "none are confirmed to exist yet" | field | TBD | Table view only |
| 2 | Year as a real field on purchasing records: "none are confirmed to exist yet" | field | TBD | Table view only |
| 3 | An "Overdue" flag/date field to filter on: "none are confirmed to exist yet" | field | TBD | Table view only (filter, highlight, and red treatment) |
| 4 | Data Table Sort default (Date Issued, most recent first): "Not explicitly confirmed — flag for confirmation before build." Also determines what "top" means in trimmed views. | product decision | TBD | Yes, confirm before build |
| 5 | Whether POs should be groupable by department or vendor, beyond status, is listed as still fully open [DOC — PROJECT INDEX] | product decision | TBD | No |
| 6 | PO edit action flow (confirmation, success, failure, undo, return path after editing) is undefined | interaction spec | TBD | Yes, for the Table view's edit action |
| 7 | Modern API gap: the sequence-based "Awaiting my approval next" chain check is only partially/approximately reimplemented; "worth re-verifying against the legacy logic above before relying on it in the rebuild" | backend / math | TBD | Yes |
| 8 | Modern API gap: "User preference persistence (last-used status + approval path) is also not implemented server-side yet" | backend | TBD | No (degrades filter persistence, does not block rendering) |

This doc has 8 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Overdue POs always highlighted in red in the Table view (the only view that surfaces this flag)
- PO Status filter hides irrelevant Kanban columns
- Department and Year filters narrow the Table view only, pending confirmation both are real fields
