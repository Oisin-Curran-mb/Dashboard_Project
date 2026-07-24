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
