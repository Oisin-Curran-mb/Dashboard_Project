# W13 — Purchasing Management

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [13 - Purchasing Management.md](../../Step 1 - Dashboard Research/13 - Purchasing Management.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Tracks purchase orders by status — pending approval, approved, and overdue — so finance and procurement staff can manage the PO pipeline without leaving the dashboard.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** procurement/PO approval workflows are commonly visualised as Kanban boards with status columns (Requested → Approved → Ordered → Received), explicitly recommended for approval pipelines with SLA/overdue tracking ([Ramp](https://ramp.com/blog/streamline-procurement-processes-kanban-board), [ProcBay](https://procbay.com/blog/approval-workflow-visualization-optimizing-your-process/)).

**Fit-check:** Option A (Kanban View) is a near-exact match for the industry-standard approach to this problem, strongly supporting its status here as "the primary/recommended solution." Option B (Status Donut) matches the standard proportional-backlog view, and Option C (PO Table) matches the standard detailed-list companion. The competitor research adds confidence to a decision already made in this file — no change recommended.

---

## Filter Options — kept as designed, flagged for review
| Filter | Values |
|--------|--------|
| PO Status | All · Pending Approval · Approved · Overdue |
| Department | All Departments · Finance · Admin · Ministry · Facilities · IT |
| Year | FY 2026 · FY 2025 · FY 2024 |

**Flagged, not changed this session:** old design's confirmed real filters are Status (Awaiting my approval next / Awaiting my approval / Unapproved / Approved — approval-workflow stages) + a dynamic Approval Path filter (depends on Status, disabled if only one path exists). None of Department, Year, or an "Overdue" status are confirmed to exist in the real purchasing data. **Decided: keep the filters above as designed anyway**, but flag clearly for backend/data review before build — don't assume they're confirmed just because they're kept.

**Encumbrance chart — dropped.** The old design's actual "Encumbrances" bar chart (budget committed by accounting period) is not carried forward. The three status-based options below (Kanban/Donut/Table) are the intended replacement, by decision this session.

**No Small size for this widget, for any of the three options** — same kind of exception as W09 Payroll Scheduled Time Off. Only KPI, Medium, and Large apply.

**KPI size — richer than a single number, by design decision:** shows a small horizontal bar (counts per status: Pending/Approved/Overdue) plus compact status-count cards, rather than one headline figure. This is a deliberate exception to the single-number KPI pattern used elsewhere, because this widget's data is inherently multi-category (no single number tells the whole story). Filter: PO Status only, no download, no switch.

## Data Table Sort
Proposed default (not explicitly confirmed in the old design): fixed sort by Date Issued, most recent first. Flag for confirmation before build.

## Drill-Through
**Already exists, kept as-is:** each row's edit icon navigates away to the full PO record in the Purchasing Management module (Detail/Approvals/Attachments/Note/Payment Approval tabs). This is one of only two dashboard widgets with direct action capability (the other being W09 Payroll Scheduled Time Off) — no changes needed here, just preserve it.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A — Kanban View *(Redesign — the primary/recommended solution for this widget)*

**Chart:** Kanban columns — Pending · Approved · Overdue — with PO cards  
**Views available:** Kanban (default) · Table  
**Improvement note:** Pipeline view makes status progression clear and scannable. Confirmed as the intended primary design for this widget.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | 2 columns visible with top 2 POs each |
| **Large (4×4)** | All 3 columns with full PO cards, scrollable (fixed sort per Data Table Sort above, applies within each column) |
| **KPI (1×0.5)** | Small horizontal bar (counts per status) + compact status cards — see KPI note above |
| **Expanded** | All 3 columns, full cards, all filters live inside the modal |

*(No Small size — see note above.)*

---

## Option B — Status Donut *(Keep/Refresh)*

**Chart:** Donut showing PO count split by status  
**Views available:** Donut (default) · Bar · Table  
**Improvement note:** Quick proportional view of the PO backlog.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | Donut + legend + counts |
| **Large (4×4)** | Donut + legend + total value + table toggle (fixed sort per Data Table Sort above) |
| **KPI (1×0.5)** | Small horizontal bar (counts per status) + compact status cards — see KPI note above |
| **Expanded** | Same as Large, all filters live inside the modal |

*(No Small size — see note above.)*

---

## Option C — PO Table *(Keep/Refresh — kept as the alternative design, not the primary)*

**Chart:** Table — PO # · Vendor · Amount · Department · Status · Date  
**Views available:** Table (default) · Kanban  
**Improvement note:** Full PO list, best for detailed review and export. Confirmed as a valid alternative to Kanban, not the primary recommendation.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | 5 rows (fixed sort per Data Table Sort above), rows scroll internally, header fixed |
| **Large (4×4)** | All rows (up to 10), totals row, same sort/scroll pattern |
| **KPI (1×0.5)** | Small horizontal bar (counts per status) + compact status cards — see KPI note above |
| **Expanded** | Same as Large, all filters live inside the modal |

*(No Small size — see note above.)*

---

## Fine-Tuning Notes
- Overdue POs should always be highlighted in red across all views
- Status filter on Kanban should hide the irrelevant columns
- Department filter narrows the PO list to that department only (pending confirmation Department is a real field — see Filter Options note above)

---

## 2026-07-23 — Create Mock Designs run (fragment/assembler flow): 3 options rebuilt

Built with the revised Create pipeline (isolated fragment files + `assemble-mock-widget.py`). Real `series[13]` is a per-PO list keyed `['All'][FY]{pos:[{ref,vendor,dept,amt,due,s}]}`. Prior entries above unchanged.

### Option A — PO Status Table *(Keep/Refresh — Restyled Original)*
All purchase orders with ref, vendor, department, amount, status chip and due date; Kanban view as the alternate. Restyled legacy list.

### Option B — Kanban by Status *(Redesign — Competitor Match)*
POs grouped into status columns (Pending Approval / Approved / Overdue) as a Kanban board; Table view alternate. The procurement-workflow pattern (AppSmith / Uizard). Rule 10 second dimension: workflow status as the primary grouping axis.

### Option C — Spend by Department *(Improve)*
Aggregates PO `amt` by department as horizontal bars, Pie view alternate — reframes from an individual-PO list to spend distribution. Rule 10 second dimension: departmental spend total (a summary the list/kanban don't compute).

### Rules 8/9
Per-option filter scoping via `fk=wid+'-'+opt` (both filters — PO Status and Department — read via `fv(fk,…)`); shared `_renderFltBody`/`applyFilter` branches extended to include `wid===13` (4/5/6/9/10/11 intact). KPI shows status-count cards (a documented exception to the single-number KPI). **No Small size for any option** — the confirmed W13 exception (Kanban/Bars/Table all need more room than 1×1); cards offer Medium / Large / KPI only, and the `sz==='s'` branches were removed from the render. Stated plainly here per Rule 9, not a silent omission.

### Rule 11 — data caveats (documented here, not shown on-screen)
The status vocabulary in the mock data (Pending Approval / Approved / Overdue) differs from the four real approval stages the locked doc describes (Awaiting my approval next / Awaiting my approval / Unapproved / Approved); not renamed here. Department filtering assumes a `dept` field per PO (present in mock data; confirm backend availability at finalisation). Neither is surfaced on the mockup.

### Where written
`Dashboard Widget Mockups.html` — `WRENDER[13]` (scaffold + 3 branches), `MOCK_DATA.options[13]`, the three `opt-13-*` cards, shared filter branches. `mock-data.master.js` re-synced for `options[13]` (`series[13]` unchanged). Final Check tab `#fc-widget-13` not edited (known shared-render carryover). Built via `_build/W13/` fragments + `assemble-mock-widget.py`.

---

## 2026-08-19 — Final build (purF, v2.0), composed per the owner-confirmed sheet

Built with the `build-final-widget` skill as a new additive `opt==='F'` branch in `WRENDER[13]` (the purF block); A/B/C untouched and reachable from the Final Check section's design-option switch, Final default. Gate context: the three Step 4 blocking rows were settled by the owner this session (sort default: oldest first / aging; PO open action: navigate to the existing record screen, dossier inline approve/reject deferred; Modern API "awaiting my approval next" chain gap: accepted as a known risk), and the W13 conflicts recorded in `Final Check - Items Needing Your Review.md` were each resolved or decided (vocabulary replaced, built forward from Option B's Kanban, Status Donut dropped, Approval Path filter added, Department/Year/Overdue scoped Table-only).

### Confirmed composition sheet (traceability spine)
| Component | Source |
|---|---|
| Kanban default view, PO Table alternate | Option B's code (only branch defaulting to Kanban) |
| Columns = the 4 REAL approval stages (Awaiting my approval next / Awaiting my approval / Unapproved / Approved) | Step 4 Filters table + owner instruction 2026-08-19 (resolves the recorded vocabulary conflict) |
| Approval Path filter (dynamic per status, disabled if one path; mock values Administration / Education Ministry / Everyone / QA Path) | Step 4 doc + owner's live beta1 screenshots 2026-08-19 |
| Oldest-first ordering + item age on cards | Owner decision 2026-08-19; aging read per Step 6 dossier + Jo's design-sandbox purchasing build (psort age-desc), with attribution |
| Card/row click opens a read-only modal mock of today's PO record screen (Detail / Approvals / Attachments / Note / Payment Approval) | Owner decision 2026-08-19 ("same screen as today"; live product navigates to Requests, Update; dossier 11.2 inline approve/reject deferred) |
| Status dropdown kept, hides irrelevant Kanban columns | Owner decision 2026-08-19 + Step 4 fine-tuning note |
| Explore trim: all 4 columns, top 2 cards, "+N more" into Table view | Owner decision 2026-08-19 |
| Table-only Department / Year / Overdue filters, overdue red + text flag | Step 4 Filters table; Rule 11 fields |
| Glance = 4 stage-count cards, actionable first, open count + outstanding total | Step 4 multi-category KPI exception, re-voweled to the real stages |
| Empty states ("Nothing needs your approval", filter-specific message, "None waiting" columns) | Jo's Widget Container Demo purchasing empty copy, adapted with attribution |
| Status Donut dropped; encumbrance chart stays cut | Owner decisions 2026-08-19 (dossier's "keep both jobs" recorded as not adopted, both positions kept in Step 4) |

### Rule 11 — data caveats (documented here, not shown on-screen)
Department, Year (FY) and the Overdue expected-by date are unconfirmed backend fields rendered as if real. The Modern API only approximately reimplements the "Awaiting my approval next" sequence-chain check (accepted risk, must be verified before dev relies on it), and server-side filter persistence does not exist yet. Approver names in the modal's Approvals tab are mock data; the approval-sequence read (approved / next to approve / waiting) is derived presentation, not a confirmed API shape.

### 2026-08-19, same day — v2.1, owner feedback round
Two problems reported after eyeballing the build: no way back after going deeper (drilling into the Table via "+N more" left no visible route back to Kanban), and view switching needed to be a visible toggle, not a 3-dot menu item. Fix: an always-visible **Kanban / Table segmented toggle** in the widget header at Explore and Detail, routed through the shared fcSetView state so the menu item stays in sync; aria-pressed marks the active view. FC_VERSION[13] bumped 2.0 to 2.1.

Same round, code-configurability check (owner question: is the approval process hardcoded or configurable?). Checked against `Widget_Comparison_Classic.html`, this project's read-only code-trace baseline of the legacy widget and Modern API (the MBAccounting repo itself is not connected to this session): the four approval STAGES are hardcoded in both codebases (legacy fixed 4-option filter with fixed WHERE logic; Modern API static `status-options` endpoint), with only the display wording differing between surfaces; the approval PATHS and approver sequences are customer-configured data (`PO_ApprovalPath` / `PO_ApprovalUser`; dynamic `approval-paths?status=` endpoint). Recorded in the Step 4 Data Contract as a new "Status/stage set" row. The mock matches this split: fixed stage columns, data-driven path list.

### 2026-08-19, same day — v2.2, owner correction: the Kanban IS the approval process
The owner, after checking the real record screen's Approvals tab (Approved / Rejected checkboxes + Reason fields), corrected the column model: "this is the approval process, this is how kanban should be, pending, accept or reject. remove the current options." Changes: Kanban columns are now **Pending / Approved / Rejected** (the four-stage column set moved to Step 4 Design History; those four remain the widget's hardcoded status-filter options in the codebases, they are just no longer columns); every card is **draggable** between columns, and dropping on a different column opens a **Reason/note popup** mirroring the real Approvals tab (Confirm applies the move and records the note on the request, shown in the record modal's Note tab and as the rejection Reason on its Approvals tab; Cancel reverts; same-column drops are a no-op); the status filter becomes All statuses / Pending / Approved / Rejected; Glance becomes three state-count cards with a "N pending approval" live title; two rejected mock requests added so the Rejected column demos populated. This REVERSES the morning's "inline actioning deferred" decision: dossier 11.2 is now adopted, in drag form. Two new backend requirements recorded in Step 4 Sign-off Readiness: the legacy widget never returns rejected orders (row 9), and no dashboard approve/reject write API exists (row 10, the dossier's own open question). Accessibility gap flagged: drag is pointer-only, keyboard action pattern needed before dev build. FC_VERSION[13] bumped 2.1 to 2.2.

### 2026-08-19, same day — v2.3, payment-approval code check and badge decision
Owner question: what is the code difference between the record screen's Approvals and Payment Approval tabs, and does the widget need the latter? Finding (from `Widget_Comparison_Classic.html`, the code-trace baseline, plus the owner's live screenshot of the Payment Approval tab): order approval is a state change on the Approval Path and is all the dashboard widget's code ever touches; payment approval is a SEPARATE invoice-level workflow on its own Payment Approval Path with real data entry (invoice number, tax/freight/other, check number and date, GL account distributions, per-invoice Submit for Approval), living only on the record screen, with **no dashboard API exposure in either codebase**. Because a drag cannot enter invoice data, it cannot be a Kanban action. Owner decision: **read-only payment-status badge on Approved cards** (Payment: pending / submitted / paid), repeated with an explanatory line in the record modal's Payment Approval tab; the record screen stays where payment work happens. Rule 11 forward-design field; new Sign-off Readiness row 11 (a new read API field is a dev-build prerequisite for the badge). Colour is never the only signal: every badge state is spelled out as text. FC_VERSION[13] bumped 2.2 to 2.3.

### 2026-08-19, same day — v2.4, colour-state cards, hold, one-step payment entry
Owner design round: "different states... like paid or not... the state changes to green... a hold option that makes the card turn yellow and can't be moved without someone clicking and removing the hold. Would that fit the old design?" Fit check against the code and screenshots: YES on both counts. Hold is real on the legacy Approvals tab (Hold checkbox + Reason per approval row, owner's live screenshot); payment sub-states are real (invoice entry then check number/date when paid). Owner clarifications: no new columns, the card COLOUR carries the sub-state (green = paid), one-step entry; hold "follows the code", so it applies wherever something is in progress (Pending and Approved-unpaid, never Paid or Rejected; payment-side hold not visible in the trace, marked TO CONFIRM). Built: payment simplifies to two states, not paid (neutral card, amber badge) and paid (green card); clicking an unpaid Approved card opens the record modal directly on Payment Approval with invoice number + amount fields, Submit turns the card green and logs the entry (dev note: treat green as check-issued); Put on hold / Remove hold in the record modal with reason notes; held cards yellow + lock + reason, dragstart blocked and the move guard refuses them; PO-2891 ships held for the demo; hold and pay states also flagged in the Table view's Status cell and the modal's Detail/Status field. Colour never the only signal (every state paired with text). Step 4: Data Contract rows for payment state and hold; Sign-off Readiness row 11 reshaped and new row 12 (hold + payment-entry write APIs, payment-side hold confirmation). FC_VERSION[13] bumped 2.3 to 2.4.

### 2026-08-19, same day — v2.5, record-screen parity for the popup
Owner correction after the beta1 verification round: the earlier check never clicked through to the payments/invoice detail, and "I want the pop ups to have the same abilities as that page." A live click-through of Requests/Update (the approved check request PO #2, plus the owner's screenshots of a PO with invoice distributions) captured every tab, and the modal was rebuilt to match: full header form (Vendor block with address/terms from a new PURF_VENDOR_META map, Ship To, Email, Type, record Status in its own Unapproved/Approved/Closed/Voided vocabulary, Approval Path editable while Pending, Payment Approval Path, Requisition/Check Request # and dates, Issued To, Agent, Shipping); Detail line-item grid with Fund/Department/Account # (new PURF_DEPT_ACCT map) and the Tax/Freight/Other/Total strip; the Approvals tab rebuilt as the REAL grid (one "Ends with" row, Approved/Rejected checkboxes + Reason, Hold checkbox + Reason, Approval Updated By), fully interactive and routed through the same guarded move/hold logic as drag (held requests refuse approval changes; paid requests locked); Attachments tab with an Add New Attachment stub; editable Note above the activity log; and the Payment Approval tab rebuilt to the real shape (Add Invoice Payment Approval link, invoice grid with Check #/Check Date/Setup Information, per-invoice account distribution, and the real Submit for Approval checkbox as the paid/green trigger, replacing v2.4's simplified two-field form, whose purFPaySubmit was removed as dead code). All edits persist in-memory per session. PO-2864 is typed as a Check Request mirroring the real record #2. Also observed live and recorded in Step 4: the record screen exposes Closed and Voided statuses the widget never surfaces. Backend needs unchanged (rows 10-12 cover these write abilities). FC_VERSION[13] bumped 2.4 to 2.5.

### 2026-08-19, same day — v2.5, record-screen parity for the popup
Owner instruction after noting the earlier browser check never clicked into the record page: "I want the pop ups to have the same abilities as that page." A live click-through of beta1's Requests/Update (an approved check request, every tab) grounded a full modal rebuild: header form (Vendor block with address/terms, Ship To, Email, Type, record Status in its own vocabulary, Approval Path editable while Pending, Payment Approval Path, Requisition/Check Request # and dates, Issued To, Agent, Shipping); Detail line-item grid with Fund/Department/Account # and the Tax/Freight/Other/Total strip; the Approvals tab as the REAL interactive grid ("Ends with" row, Approved/Rejected checkboxes + Reason, Hold checkbox + Reason, Approval Updated By) where ticking boxes drives the card through the same guards as drag (held refuses changes, paid locked); Attachments with an Add stub; editable Note + activity log; and the full Payment Approval tab (Add Invoice Payment Approval, invoice grid with Check #/Check Date/Setup Information, per-invoice account distribution, real Submit for Approval checkbox that marks paid/green and fills the mock check). PO-2864 typed as a Check Request mirroring the real record #2. All edits in-memory. FC_VERSION[13] 2.4 to 2.5.

### 2026-08-19, same day — v2.6, the split Finish column (Close / Void)
Owner questions answered from the live code first: Closed (2) and Voided (3) are MANUAL statuses on the record screen's own Status dropdown, verified editable on an Unapproved record and locked once Approved; the widget's queries only select statuses 0 and 1, which is why the dashboard never shows them. Owner design confirmed: a standing end column split lengthwise, Void one side and Close the other, with a confirm popup, and a confirmed card disappears; plus the two-views principle, "kanban for approval flow but the table is to view everything over time". Built: the Finish column (Close top, paid cards only; Void bottom, unpaid only; paid orders cannot be voided from the dashboard, check reversal is an AP flow), confirm popups with reasons, confirmed cards leave the board; the Table's status filter gains Closed and Voided and its All statuses includes the archive, while the Kanban's filter stays the three live states (an archive selection left over from the Table resets to All on the board). Closed/voided records are final: approvals grid locked, payment history read-only, no return to the board. New Sign-off Readiness row 13: the Table archive needs the API to serve statuses 2 and 3, and the Finish actions need a status write. FC_VERSION[13] 2.5 to 2.6.

### Verification
`final-check-rules.py --widget 13`: 0 HIGH, 1 MED, 1 LOW. The MED (F7 em dash) sits in a pre-existing A/B/C scaffold comment, out of scope for the F build; the LOW (F8 empty-guard heuristic) is answered by the driver. DOM-shim driver (`w13-driver.js`, session outputs): **49 assertions, 0 failures**, covering every size (Glance/Explore/Detail + safe `s` fallback), all 4 Kanban columns with the real vocabulary and correct counts, oldest-first ordering, the Explore "+N more" trim, status-filter column hiding, path-filter narrowing, dynamic path derivation + impossible-selection reset, Table view (headers, totals row, oldest-first, overdue flag, Table-only filter visibility at Detail vs Explore, Department/Year/Overdue narrowing), all five modal tabs + mount/tab-switch/close through the DOM shim, whole-empty and filter-empty states, and an em-dash sweep across every state x size x filter combination plus every modal tab (clean). Data lives in standalone `PURF_` constants (not `MOCK_DATA`), so `mock-data.master.js` needs no re-sync; `series[13]`/`options[13]` untouched.
