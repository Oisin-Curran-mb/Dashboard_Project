# Market Research: Purchasing Management

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W13 — Purchasing Management
**Module:** Purchasing Management
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/13 - Purchasing Management.md`: a table of purchase order requests filtered by approval-process status (Awaiting my approval next / Awaiting my approval / Unapproved / Approved), plus a bar chart ("Encumbrances") of money committed but not yet spent, broken down by accounting period. **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W13 - Purchasing Management.md`) — Kanban board is the default view, with Status Donut and PO Table as peers.

## Data Used

`PO_Order`, `PO_ApprovalPath`/`PO_ApprovalUser`, `PO_OrderDetail` (per Step 1). Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W13` section: PO Status filter ✅ decided — uses the real stage names (Awaiting my approval next / Awaiting my approval / Unapproved / Approved), replacing an earlier invented set; the "Awaiting my approval next" sequence-based logic 🟡 only approximately reimplemented, needs re-verification; Department, Year, and "Overdue" flag filters are all 🔴 decided — scoped to the Table view only, and all three still need backend confirmation the underlying fields exist; Kanban/Donut/Table views ✅ available using the confirmed real status set; KPI (multi-status bar + cards) ✅ available; drill-through via the existing PO edit link ✅ already confirmed working; Data Table Sort by Date Issued 🟡 proposed default, not yet confirmed.

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- Procurement/PO approval workflows are commonly visualised as Kanban boards with status columns (Requested → Approved → Ordered → Received), explicitly recommended for approval pipelines with SLA/overdue tracking. *Sources: [Ramp](https://ramp.com/blog/streamline-procurement-processes-kanban-board); [ProcBay](https://procbay.com/blog/approval-workflow-visualization-optimizing-your-process/).*

**New this pass — a genuine gap on the encumbrance chart specifically:**
- **Honest gap** — no nonprofit/church fund-accounting vendor researched (MIP, Sage Intacct for Nonprofits, NonProfit+, Aplos, ACS Technologies/Realm) documents a Kanban board, donut chart, or bar-chart-of-encumbrance-by-period for PO approvals. Everywhere encumbrance and PO status show up, it's in tabular registers/ledgers or generic budget-vs-actual dashboards. MIP's Purchase Order Register is tabular; Sage Intacct nonprofit's AP Manager dashboard has generic "graphs" but no dedicated encumbrance-by-period chart found; NonProfit+ claims dashboards that "visually represent encumbered data" but this is a single-sourced, unverified marketing claim with no chart type or screenshot found. *Sources: [MIP — Nonprofit Procurement Software](https://www.mip.com/product/nonprofit-procurement-software); [MIP — Purchase Orders documentation](https://documentation.mip.com); [NonProfit+ — Encumbrance Accounting](https://www.nonprofitplus.net); [Aplos — Encumbrance glossary](https://www.aplos.com/glossary/encumbrance); [ACS Technologies — Purchase Orders](https://www.acstechnologies.com/acs/church-accounting-software/acs-purchase-orders).* The locked Kanban/Donut/Table design has no nonprofit-specific precedent to point to for validation — it appears to be ahead of the sector norm, which is still registers and GL-embedded encumbrance tracking.
- **Confirmed pattern, worth flagging as a real design consideration** — the government/public-sector and fund-accounting sector, where encumbrance accounting actually originates, consistently favours a **live, current, point-in-time view of open encumbrances** (or a declining-balance "draw down" framing) over a discrete period-bucketed bar chart. UC Berkeley's Encumbrances report deliberately has no fiscal-period prompt, "the intended use is to understand what is still open... not what was open at a point in time." UC Irvine's Kuali system's Encumbrance Report "displays the most current detail." Solver's Government Encumbrance Report template uses period/fund as filter prompts, not chart axes. GFOA — the authoritative US/Canada public-sector finance standards body — frames encumbrance monitoring around tracking "draw down" via real-time data, prescribing no specific chart type. *Sources: [UC Berkeley Cal Answers](https://calanswers.berkeley.edu/node/1082); [UC Irvine Kuali Financial System](https://accounting.uci.edu); [Solver — Government Encumbrance Report template](https://www.solverglobal.com/product/template-marketplace/government-encumbrance-report); [GFOA — Budget Monitoring](https://www.gfoa.org/materials/budget-monitoring).* **Confidence: confirmed pattern (4 independent sources)** that this widget's period-bar-chart framing for encumbrances is a genuine design choice, not an established convention from the sector the concept comes from.

## Visual Options (aim for 3)

1. **No change to Kanban/Donut/Table for PO approval status** — well supported by general procurement-software precedent (Ramp, ProcBay); no nonprofit-specific competitor contradicts it, though none confirm it either — it's simply ahead of the sector norm, similar to the pattern already seen with W03/W05/W11.
2. **Add a live/current-snapshot view of open encumbrances alongside (not replacing) the period-bar chart**, mirroring how the government/fund-accounting sector this concept actually comes from typically frames it — "what's still open right now" rather than only "how much was committed per period." Based on: the UC Berkeley/UC Irvine/Solver/GFOA finding. Data needed: ✅ likely available today — the same `PO_OrderDetail` records already back the period chart; this would be a display-format addition, not new data.
3. **Flag the encumbrance chart explicitly as a novel design choice, not a validated pattern**, when this work gets discussed further — worth knowing before treating "Encumbrances by period" as if it already matches an established standard. Data needed: N/A — a documentation/framing note, not a design change.

## Net Assessment

**Mixed.** The PO-approval-status visualization (Kanban, as the default) remains well-supported by general procurement-software precedent and unopposed by anything found in the nonprofit-specific search. The Encumbrance-by-period bar chart specifically is the one piece of this widget with no precedent anywhere researched — including, notably, the government/fund-accounting sector where the concept of encumbrance accounting actually originates, which consistently favours a live/current-snapshot or running-total framing over discrete period bars. This isn't necessarily the wrong choice, but it's worth being explicit that this piece is a genuine design decision rather than an industry-standard pattern being followed — and pairing it with a live-snapshot view, rather than replacing it, would bring the widget closer to how its own originating sector actually thinks about the concept.

## Sources

- [Ramp — Streamline Procurement Processes with a Kanban Board](https://ramp.com/blog/streamline-procurement-processes-kanban-board)
- [ProcBay — Approval Workflow Visualization](https://procbay.com/blog/approval-workflow-visualization-optimizing-your-process/)
- [MIP — Nonprofit Procurement Software](https://www.mip.com/product/nonprofit-procurement-software)
- [MIP — Purchase Orders documentation](https://documentation.mip.com)
- [NonProfit+ — Encumbrance Accounting](https://www.nonprofitplus.net)
- [Aplos — Encumbrance glossary](https://www.aplos.com/glossary/encumbrance)
- [ACS Technologies — ACS Purchase Orders](https://www.acstechnologies.com/acs/church-accounting-software/acs-purchase-orders)
- [UC Berkeley — Cal Answers Encumbrances Report](https://calanswers.berkeley.edu/node/1082)
- [UC Irvine — Kuali Financial System, Encumbrances](https://accounting.uci.edu)
- [Solver — Government Encumbrance Report Template](https://www.solverglobal.com/product/template-marketplace/government-encumbrance-report)
- [GFOA — Budget Monitoring](https://www.gfoa.org/materials/budget-monitoring)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W13-Purchasing-Management.md` and `Step 4 - Widget Final Design/W13 - Purchasing Management.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (Ramp, ProcBay). Nothing there has been moved or deleted — this file cites the same sources and adds a genuinely new finding on the encumbrance chart specifically. Whether to update those two sections to point here is still an open decision.
