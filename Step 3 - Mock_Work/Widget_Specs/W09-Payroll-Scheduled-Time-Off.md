# W09 — Payroll Scheduled Time Off

**Module:** Payroll  
**Status:** ✅ Minor tweaks  
**Research doc:** [09 - Payroll Scheduled Time Off.md](../../Step 1 - Dashboard Research/09 - Payroll Scheduled Time Off.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Gives supervisors a view of all scheduled time-off requests across their departments, organised by department and employee, with the ability to approve or reject requests directly. *(Corrected — the earlier draft dropped the approval workflow entirely; see note below.)*

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** leave-management dashboards should surface leave balances, pending requests, and a calendar view, with one-click approve/reject as the core manager interaction ([Synergy Codes](https://sub.synergycodes.com/our-work/leave-management-dashboard-for-hr-department-purposes/), [Factorial](https://help.factorialhr.com/en_US/absences-approvals/how-to-create-time-off-approval-systems)).

**Fit-check:** the two current options map directly onto the two standard leave-management views — Option A (Leave Calendar) matches the recommended calendar visualisation for planning, and Option B (Confirmation Dashboard) matches the recommended one-click approve/reject workflow closely, including bulk actions. The decision already made in this file to restore the approval workflow (rather than the earlier read-only draft) is strongly supported by the standard — a read-only version would have been a regression against typical leave-management UX, not just against the old design.

---

## ⚠️ Major mismatch found and resolved this session

The old design's defining feature is a 3-level expandable list (Department → Employee → Day) with inline approve/reject — bulk-approve at employee level, per-day approve/unapprove — and it's explicitly the **only** dashboard widget where users take direct action. The earlier draft's three options (Leave List, Department Bars, Calendar) were all read-only, dropping that capability entirely.

**Resolved this session:**
- This widget has **two** options, not three. Option C (Department Summary Bars) is dropped.
- **Option A — Leave Calendar**, kept from the old Option C concept.
- **Option B — Confirmation Dashboard**, rebuilt around the old approval workflow: a drill-in view for reviewing and confirming (approving/rejecting) time-off requests, preserving the 3-level expand + checkbox behaviour.
- **No Small size for this widget.** Only KPI, Medium, and Large apply — this is the first confirmed example of a widget where Small isn't offered (the approval workflow and calendar view both need more room than a 1×1 tile can give).

## Filter Options
| Filter | Values |
|--------|--------|
| Calendar Year | Dynamic — only years that have time-off records appear (matches old design); defaults to the most recent year |
| View | Show All · Show Pending · Show Approved (matches old design — this is the filter the earlier draft dropped entirely) |
| Leave Type | Dynamic — populated from the organisation's configured leave-type labels (Vacation/Sick/Personal/Misc. by default, but renamable and some hidden per org) |
| Department | Only shown/useful if a supervisor is authorised for more than one department; otherwise redundant since supervisors already only see their own departments |

Both Calendar Year and View are saved per user and persist across sessions, matching old design.

**KPI size (3-dot menu):** Calendar Year only (time filter default), no View/Leave Type/Department at this size.

## Data Table Sort
Fixed — Department alphabetical, then Employee alphabetical within department, then Day chronological within employee. Not user-changeable — matches the natural structure of the approval workflow, where predictable order matters more than flexible sorting.

## Drill-Through
No separate external link — Option B's entire purpose *is* the drill-in confirmation view (Department → Employee → Day), so it already satisfies this requirement internally rather than via a page link out.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A — Leave Calendar *(Redesign)*

**Chart:** Mini calendar grid showing leave days marked per employee  
**Views available:** Calendar (default) · List  
**Improvement note:** Visual week-by-week view — ideal for planning rosters.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | 2-week view with employee initials |
| **Large (4×4)** | Month view, full names, hover for details |
| **KPI (1×0.5)** | Headline: **Pending Approvals** count, with **Out today/this week** as a secondary figure — two numbers in one tile, needs a fit test at 1×0.5 (same pattern as W01 Version A's dual-figure KPI); fall back to just Pending Approvals if it doesn't fit cleanly. |
| **Expanded** | Month view, all filters live inside the modal |

*(No Small size — see note above.)*

---

## Option B — Confirmation Dashboard *(Redesign — preserves old approval workflow)*

**Chart:** 3-level expandable list — Department → Employee → Day — matching the old design exactly: employee-level bulk-approve checkbox, per-day approve/unapprove checkbox, status shown as "Pending" or "Approved by: [name] [date]"  
**Views available:** Expandable list only (no chart/table toggle — the expand/collapse structure *is* the view)  
**Improvement note:** This is the widget's core interaction; visual polish only, not a structural redesign.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Medium (2×2)** | Departments collapsed by default; expanding one shows its employees (collapsed); a fixed-height, internally-scrolling region once expanded (Hard Rule 2 table exception) |
| **Large (4×4)** | All levels expanded by default on load (matches old design), fixed-height scrolling region for the day-level detail |
| **KPI (1×0.5)** | Same as Option A's KPI — Pending Approvals + Out today/this week |
| **Expanded** | Full 3-level view, all filters live inside the modal, same approve/reject interactivity |

*(No Small size — see note above.)*

---

## Fine-Tuning Notes
- Leave type should use consistent colour coding across both options (colours per org-configured type, not a fixed green/amber/blue — labels themselves are renamable per org)
- Department filter (where shown) should narrow both options consistently

---

## 2026-07-23 — Create Mock Designs run (Rules 8-11): 3 options rebuilt

Built via the Create step of the 3-skill pipeline. Options A/B/C in `Dashboard Widget Mockups.html` and `WRENDER[9]` replaced in place; per-option filter scoping added. Prior entries above are unchanged (additive history).

### Option A — Approval Workflow *(Keep/Refresh — Restyled Original)*
Legacy approval/calendar screen restyled with Pathway. Default view is a per-request **approval list**: colour-coded leave-type bar, employee, dept · type, date range, and a **Pending/Approved status chip**, with a "N pending of M requests" header. A **Calendar** alternate view (colour-coded month grid) is offered via the on-menu view switch. No competitor citation — faithful restyle.

### Option B — Approval Queue *(Improve — Competitor Match)*
Matches the Gusto "Manage Requests" / Rippling **pending-first queue** pattern (Market Research confirmed): requests sorted Pending-first, each pending row showing an inline approve (`check_circle`) / decline (`cancel`) affordance; a Table alternate view. **Rule 10 second dimension:** a **days-by-type composition strip** above the list, aggregating `days` by leave `type` (Annual/Sick/Personal) across the current selection — a real second breakdown, not a restyle of the same list.

### Option C — Coverage Breakdown *(Redesign — Maximum Freedom)*
Reframes the widget around **coverage risk**: per-department **horizontal stacked bars of leave DAYS by type**, showing where cover is thin, plus a Table view of the same **department × leave-type × days** cross-tab. **Rule 10 second dimension:** the dept × type × days aggregation. Purpose-driven, no citation.

### Rule 8 — per-option filter scoping
`WRENDER[9]` uses `var fk=wid+'-'+opt` and reads all filters via `fv(fk,…)` / `ftags(fk)`, so 9-A / 9-B / 9-C keep independent filter state. The shared `_renderFltBody` / `applyFilter` scoping conditions were extended to include `wid===9` alongside the existing 4/5/6 (those left intact); `openFilter` needed no change (it already captures `opt`). Dashboard cards call `openFilter(9,event,'A'|'B'|'C')`.

### Rule 9 — sizes, and the no-Small exception
KPI, Medium, and Large all render real content for all three options. **Small is intentionally absent** for W09 — the pre-existing confirmed exception (General Widget Design Rules, Rule 6: the approval workflow / calendar need more room than 1×1). The Dashboard cards offer Medium / Large / KPI size buttons only (no Small button), and each card now defaults to Medium rather than Small. This is a documented exception, not a silent omission.

### KPI headline
KPI size shows the live **Pending Approvals count** (from the `st` field). `kpiTimeFilter[9]` is set to `Calendar Year` so the KPI-size filter modal has a valid time filter rather than showing the "No filters" toast.

### Rule 11 — data caveats (documented here, not shown on-screen)
This build surfaces approval **status** (`st`: Pending/Approved) — a field added to `MOCK_DATA.series[9]` this pass (every leave row now carries `st`; a realistic ~30% Pending mix). **Backend availability of an approval-status field, and especially an approve/reject action + status endpoint, is an open gap** (Modern API per the Developer Punch List does not implement inline approve/reject or a per-request status). Also unconfirmed and noted for finalisation: approval-authority department scoping (the Modern API returns all company schedules, not just those the viewer can approve) and custom org-defined leave-type labels (static Annual/Sick/Personal used). None of these are marked on the mockup itself — the cards render as if real; this note is the record for whoever finalises the design.

### Where written
`Dashboard Widget Mockups.html` — `MOCK_DATA.options[9]` (titles/subs/imp/citations), the three Option A/B/C cards' markup (titles, per-option filter calls, view-switch labels, size buttons), `WRENDER[9]` (all three branches + KPI), `MOCK_DATA.series[9]` (added `st` per leave row), `MOCK_DATA.kpiTimeFilter[9]`, and the shared filter-scoping branches (extended to include 9). `mock-data.master.js` re-synced for `options[9]` and `series[9]`. **Final Check tab `#fc-widget-9` was not edited** — it still shows its "Final design — locked" badge and its old "Month Calendar / Upcoming List / Department View" chrome; because it renders live through this same `WRENDER[9]`, it now shows the new render under stale labels (the known, already-documented shared-render carryover — to be reconciled separately, out of scope for this skill).

---

## 2026-08-07 — build-final-widget run: Final (opt 'F') composed and built

Built the FINAL version into the Final Check tab (`#fc-widget-9`) as a new additive `opt==='F'` branch in `WRENDER[9]` (prefix `payF`). Options A/B/C, the Dashboard-tab markup, and every other widget are untouched. This entry is append-only; nothing above was edited.

### Confirmed composition sheet (owner-directed 2026-08-07, mapped to source)

This sheet supersedes the Step 4 doc's Department -> Employee -> Day structure (recorded as a version-tagged update; the superseded structure was moved to that doc's Design History, not deleted).

| Component | Final build | Source |
|---|---|---|
| Views | TWO. View 1 = Approval Queue (DEFAULT). View 2 = Leave Calendar. In-card segmented toggle + a Switch view menu item at Explore/Detail. | Owner sheet 2026-08-07; Step 4 two-view structure |
| Approval Queue hierarchy | Pay Group (subheading) -> Person (by name, visible) -> entries (date, hours, leave type, status). NOT grouped by department. | Owner sheet 2026-08-07 (supersedes Step 4 Dept->Emp->Day) |
| Entry row | Dates, leave type (colour swatch + text label), hours, status ("Pending" or "Approved by [name], [date]"). | Step 4 Interaction Spec + owner sheet |
| Approve controls | Person-level "Approve all (N)" bulk approve; per-entry Approve; Undo on approved entries. | Step 4 Interaction Spec (employee bulk + per-day) reframed to pay-group/person |
| Status filter | Show Pending (DEFAULT) / All / Approved, inline chips. | Owner sheet; Step 4 Filters (View) + Option B pending-first |
| Leave Calendar | Month grid (August 2026) of who is out; each out-day carries person initials + leave-type text label, coloured by type (colour never the only signal). Explore = first two weeks; Detail = full month. Below the grid, a who-is-out breakdown. | Owner sheet; Step 4 View 2; old Option A calendar |
| Calendar group toggle | Department vs Pay Group, defaulting to Pay Group. Regroups the who-is-out breakdown. | Owner sheet 2026-08-07 |
| Glance (KPI) | Pending Approvals count headline + "N out this week" secondary (both fit at 288x176; fallback to Pending alone allowed if they ever do not). | Owner sheet; Step 4 KPI (Sign-off Readiness #1) |
| Sizes | Glance / Explore / Detail, no Small (Rule 12), via the generic `fc-fmode` mechanism (W01-W07 pattern). | Rule 12; owner sheet |
| Leave types | Vacation / Sick / Personal / Misc, colour + text label + legend. | Owner sheet |
| Empty state | Clean "No time off scheduled" state at every size (glance shows 0 Pending). | Step 4 Widget States (empty was unspecified; now specified) |

### Pay-group data note (Rule 11 — mock, rendered as if real; caveat lives here only)

The Final groups the queue by pay group using an indirect backend join, not a confirmed direct field:
- Pay group is a fixed 5-slot model (A to E) plus "Normal Payroll", with admin-named labels. In code it lives on `PREmployeeCompensationDetail.PayGroup` (smallint: 0 = Normal, 1 to 5 = A to E via `PRCompany.PayGroupName`).
- It links to an employee INDIRECTLY through their compensation detail. The time-off record `PREmployeeOffSchedule` has NO pay-group field, so grouping time off by pay group requires a backend join through compensation detail. There is a working precedent for pay-group filtering in `PRTimeCardRepository`.
- Do NOT present this as a confirmed direct field. The org-configured labels ("Weekly Staff", "Monthly Clergy", "Seasonal" used as mock) are also org-defined.
- Carried Modern-API gaps (from Step 1, still open): inline approve/reject action endpoint not implemented; approval-authority (who-can-approve) scoping not implemented; custom org leave-type labels not implemented (static labels used).
- None of this is shown on-screen (Rule 11); it is recorded here for whoever takes this to development.

Mock data lives in standalone `PAYF_*` constants next to `WRENDER[9]` (NOT `MOCK_DATA`), so `mock-data.master.js` needs no re-sync. Data: 3 pay groups, 7 named people, 11 time-off entries across the four leave types with a realistic pending/approved mix.

### What was built (insertion points)
- CSS: `#fc-widget-9.fc-fmode` block (from ~line 482), mirroring W01-W07.
- `WRENDER[9]`: `if(opt==='F') return payFRender(wid,sz);` as the first line; the `payF` module + `PAYF_*` data inserted immediately above `WRENDER[9]`.
- `#fc-widget-9` chrome: version badge, design-option switch (Final default + A/B/C), Glance/Explore/Detail size labels (abc/f spans), Switch view menu (Approval Queue / Leave Calendar), rewritten Purpose / Sources / Logic.
- `FC_STATE[9]` default opt set to 'F'; `FC_KPI_HEADLINE[9]` registered (Glance title = "Pending Approvals (N)"); `FC_VERSION[9]` bumped 0.1 -> 2.0; `FC_READY_FOR_REVIEW[9]=false` (owner has not yet marked it ready for Jo).

### Verification
- `final-check-rules.py --widget 9`: 0 HIGH. Remaining MED are explained (F3 view/filter name drift resolved by the Step 4 doc update below; F6 "August 2026" is a legitimate absolute calendar-month label for scheduled dates, not a selectable date preset). F5 LOW: the Sick colour #e53935 is always paired with the text label "Sick" and a legend, so colour is not the only signal.
- Per-widget Node DOM-shim driver (`/tmp/w09-driver.js`, method archived in this session): **34 assertions, all pass** on the first cycle. Covered: non-empty render at Glance/Explore/Detail; status filter (Pending/All/Approved) changes output; both views render (pay-group subheadings + people by name in the queue, weekday grid + out-day text labels in the calendar); calendar Department vs Pay Group toggle changes grouping; empty-data renders a clean empty state at every size with no throw; approve-entry / bulk approve-person / unapprove run through the real delegated handler and change state; and a no-em-dash sweep across 96 combinations (size x view x status x group x dataset).

---

## 2026-08-08 — Refine pass (owner feedback on the built Final)

Iteration on the F branch built 2026-08-07 (not a rebuild). All changes are additive to the payF branch, the `PAYF_*` data, the `fc-widget-9` chrome, and a new scoped `.payf-root` CSS block; A/B/C branches, other widgets, and the Dashboard-tab markup were not touched. `FC_VERSION[9]` 2.0 -> 2.1.

### What changed, mapped to the owner feedback

| # | Feedback | What was built | Source / judgement |
|---|---|---|---|
| 1 | Approval Queue controls must match Jo's demo (segmented view toggle + Show filter), tighter spacing/typography | Restyled the view toggle (Approval Queue / Leave Calendar) and the Show Pending / All / Approved filter to Jo's `.vtoggle` / `.vt` segmented pattern, via a new `.payf-root`-scoped CSS block that inlines the same Pathway tokens the other Finals (bgtF/penF/prF/remF/insF/depF) use. Controls now sit in a `.payf-controls` row with an uppercase micro-label, matching the other Finals in this mock. | Jo's `index.html` `.vtoggle`/`.vt`; the other Finals' scoped-root pattern |
| 2 | Add a Group by (Pay Group / Department) control to the Approval Queue, styled like the calendar's group-by | Added `PAYF_STATE.queueGroup` ('paygroup' default / 'dept') and a shared `payFGroupToggle(w,which)` used by BOTH views so they look identical. The queue now groups by the active dimension as subheadings, with the person shown by name under whichever subheading is active; the secondary label on each person row shows the OTHER dimension (dept when grouped by pay group, and vice versa). | Owner feedback 2026-08-08 |
| 3 | Rebuild the Leave Calendar as a real month grid (weekday headers, weeks x days, adjacent months greyed, today marked) | `payFCalendar` rewritten to compute the grid from `new Date(y,m,...)`: Sun-Sat weekday header row, leading/trailing greyed adjacent-month cells, `daysInMonth` real cells, today (Aug 7 2026) outlined. | Owner feedback; week-start = Sunday (US payroll convention) is a judgement call |
| 4 | Remove the table/breakdown list below the calendar | The who-is-out breakdown list was deleted. The grid plus a one-line summary and a legend are the whole view. | Owner feedback |
| 5 | Per-day leave-type ICONS, colour + accessible label, multi-person overflow | Each leave type carries a distinct material-symbols glyph (Vacation = `beach_access`, Sick = `sick`, Personal = `person`, Misc = `more_horiz`) added to `PAYF_LEAVE_TYPES`. Day markers render the coloured glyph + an sr-only text label (person, type, dates, group) + a `title`; Detail size also shows visible initials. Days with more people than fit show a "+N" overflow. A legend maps every icon+colour to its type name as visible text. Colour is never the only signal (icon shape is redundant with colour). | Owner feedback; icon glyph choices are a judgement call |
| 6 | Month prev/next navigation + current-month label; clean empty month | Added `PAYF_STATE.calY/calM`, a `payFCalNav` header (chevron_left / month + year / chevron_right), and `payFCalStep` with year rollover. `cal-prev`/`cal-next` handlers re-render. Months with no entries render a clean empty-month state (icon + "No time off scheduled in <Month>"), no throw. | Owner feedback |
| 7 | Keep calendar Group by working with the new grid | `calGroup` now drives the summary line ("N people out across M pay groups / departments in <Month>") and each marker's group label. | Owner feedback |
| - | Keep the Glance KPI headline as-is | Unchanged. To keep the KPI + queue counts stable while the calendar can browse other months, entries now carry a month (`mo`, 0-based, default August) and the queue + KPI are scoped to the working month via `payFWorkFlat`; the calendar filters to the displayed month via `payFMonthEntries`. A few July 2026 and September 2026 entries were added so navigation shows real data; other months are empty (drives the empty-month state). Driver confirms Pending Approvals = 7 and Out this week = 5 are unchanged. | Rule 11 mock |

### Judgement calls (flagged for owner)
- **Week start = Sunday** (Sun-Sat header). US payroll convention; Jo's demo does not ship a month calendar to copy. Change to Mon-Sun if preferred.
- **Icon glyphs**: Vacation `beach_access`, Sick `sick`, Personal `person`, Misc `more_horiz`. Distinct shapes, all in material-symbols-rounded. Swap freely.
- **Multi-person day**: up to 2 markers at Explore, 3 at Detail, then a "+N" overflow chip with a title. No per-day popover was built (out of scope for this pass).
- **Group by on the calendar** now affects the summary line and marker labels only (the breakdown list it used to regroup was removed per item 4). It remains functionally live and changes rendered output.
- **Visual polish** (marker wrapping density at Explore, exact cell heights) was not machine-verified and wants a browser eyeball.

### Verification
- `final-check-rules.py --widget 9`: **0 HIGH, 0 MED**, 1 LOW (F5: Sick #e53935 paired with the `sick` icon + "Sick" text + legend, so colour is not the only signal), 1 INFO (F2 node --check on all script blocks passes).
- Per-widget Node DOM-shim driver (`/tmp/payf_driver.js`): **61 assertions, all pass** on the first cycle. Covers: non-empty render at Glance/Explore/Detail (slots k/m/l/x); Glance headline preserved (Pending 7 + Out this week 5); queue Group by Pay Group vs Department both render correct subheadings and differ; status Pending/All/Approved change output; approve-entry / undo / bulk approve-person / view / group / status / cal-prev / cal-next handlers fire through the real delegated `payFOnClick`; calendar renders a whole number of weeks (>=35 cells) with Sun-Sat headers, day numbers, today marked, adjacent months greyed; month prev/next changes the rendered month (Aug -> Jul, Aug -> Sep, Dec 2026 -> Jan 2027 year roll); empty month (December) renders the clean empty state with no throw; per-day icon glyphs + sr-only text labels + legend present as DOM text; empty dataset renders the clean empty state at every size; no-em-dash sweep across 90+ state x size x filter combinations (0 hits).

## 2026-08-08 — Calendar refine: colour-by-group + click-a-day detail (owner feedback)

Second refine on the built Final, **Leave Calendar view only**, per owner feedback dated 2026-08-08. Additive to the payF branch: no A/B/C branch, no other widget, and the Approval Queue / Glance were not changed. `FC_VERSION[9]` bumped 2.1 -> **2.2**.

### What changed, mapped to the two feedback items

| # | Owner feedback | What was built | Source / notes |
|---|---|---|---|
| 1 | **Colour by group, not by leave type.** Markers coloured by the active Group by dimension; a stable distinct colour per group value; legend shows the active dimension's group -> colour mapping plus a leave-type icon key, and switches when the toggle flips. | Added `PAYF_PALETTE` (8 distinct hues) and `payFGroupOrder(dim)` / `payFGroupColor(w,val)` / `payFCalGroupVal(fe,w)`. Marker colour now comes from the group's **fixed index** in the dimension's full ordered value list, so a given group is always the same colour across months (deterministic). The marker glyph still encodes the leave TYPE (beach_access / sick / person / more_horiz) and every marker keeps its text label (title + sr-only + legend + day detail), so colour is never the only signal. The legend (`payFLegend`) is now two parts: a group colour-swatch key captioned "Colour = pay group" / "Colour = department" (only the groups present that month, in palette order) plus a "Leave type" icon key; flipping Group by recolours the markers and swaps the group key. | Owner feedback 2026-08-08; palette + week-of-index mapping are judgement calls (see below) |
| 2 | **Click a day or an icon to expand detail.** A popover listing each person out that day with name, both Pay Group and Department, leave type (icon + label), hours, and status (Pending / "Approved by [name], [date]"). Keyboard reachable, dismissible; no approve action (informational; approvals stay in the queue). | Added `PAYF_STATE.dayDetail` and `payFDayDetail(w)` rendering a `role="dialog" aria-modal` popover using Jo's `bgt-pop` card pattern, scoped to `.payf-root` (new `.payf-dd-*` CSS). Day cells with entries and each marker carry `role="button" tabindex="0"` + `data-payf="day-open"`/`"mark-open"` with `data-day`/`data-id`; a marker click sets `focusId` and highlights that person's row (`.payf-dd-focus`). New handlers `day-open` / `mark-open` / `day-close` / `day-noop` in `payFOnClick`; Escape handled in the keydown listener; click-away closes via the backdrop while the panel (`day-noop`) swallows its own clicks. View change and month nav clear `dayDetail`. Footer hint: "Approvals are handled in the Approval Queue." Empty days are not clickable; an empty month never opens it. | Owner feedback 2026-08-08; replaces the earlier "no per-day popover" limitation from the 2026-08-07 pass |

Everything else kept working: month grid, weekday headers, month prev/next, empty-month state, the Group by toggle (now also drives marker colour + legend), the Approval Queue view, and the Glance KPI headline.

### Judgement calls (flagged for owner)
- **Palette / colour choices**: `PAYF_PALETTE` = blue `#4b6ec3`, green `#2e9e4f`, amber `#e0952b`, purple `#8e6cc0`, red `#c0392b`, teal `#1f8f8f`, pink `#d24d8c`, slate `#5b6b7f`. Assigned by fixed index (pay groups: Weekly Staff=blue, Monthly Clergy=green, Seasonal=amber; departments in encounter order: Finance=blue, Facilities=green, Admin=amber, Ministry=purple, IT=red). Swap freely; colour is never the only signal.
- **Multi-group day colouring**: a day with people from several groups shows one marker per person, each in its own group colour, so a mixed day is visibly multi-coloured (matches the "+N" overflow behaviour). There is no single "day colour".
- **Day-detail interaction**: clicking anywhere on a populated day cell opens the day (whole cell is `role=button`); clicking a specific marker opens the same popover and pre-focuses that person's row. Nested cell+marker buttons are a minor a11y nesting wart accepted for the mock (marker takes click precedence via `closest`). Dismiss = close control, backdrop click-away, or Escape.
- **Popover placement / visual density** (panel size, marker background tint at Explore) were not machine-verified and want a browser eyeball.

### Verification
- `final-check-rules.py --widget 9 --step4 <doc>`: **0 HIGH, 0 MED**, 1 LOW (F5: Sick `#e53935` in the leave-type constant / Approval Queue, paired with the `sick` icon + "Sick" text, so colour is not the only signal), 1 INFO (F2 node --check on all script blocks passes).
- Per-widget Node DOM-shim driver (extended, `/tmp/payf-driver.js`): **44 assertions, all pass on cycle 1**. New assertions: markers carry group-based colour with >=2 distinct group colours; colour is deterministic to the palette index; flipping Group by changes both marker colours AND legend contents (group key swaps pay-group <-> department names, leave-type key stays); clicking a day fires the real delegated handler and produces a non-empty day-detail with each person's name + both groups + leave type + hours + status as DOM text; clicking a marker opens the same popover focused on that person; the popover closes via close control, Escape, and is NOT closed by a panel-body (day-noop) click; view change clears it; clickable-day count equals the month's distinct out-days (empty days not clickable); empty month and empty dataset stay clean with no throw; no-em-dash sweep across every view x status x group x dataset x size combination plus an open day-detail (0 hits). Retained: renders at Glance/Explore/Detail, queue group-by, status filter, approve/undo, month nav.

## 2026-08-08 — Calendar refine: person initials on day markers (owner feedback)

Third refine on the built Final, **Leave Calendar day markers only**, per owner feedback dated 2026-08-08. Additive to the payF branch: no A/B/C branch, no other widget, and the Approval Queue / Glance / day-detail popover were not changed. `FC_VERSION[9]` bumped 2.2 -> **2.3**.

### What changed, mapped to the feedback

| Owner feedback | What was built | Source / notes |
|---|---|---|
| On the calendar day markers, show each person's **initials** next to their icon (e.g. "DW" for Dana Whitfield) for a rough who-is-who at a glance. Keep the group colour, the leave-type icon, the "+N" overflow, and click-to-open the day detail. Derive initials from the name (first + last initial; single-name fallback to first two letters). Keep it legible at Explore and Detail. Full name stays in the marker title/tooltip and in the detail. | Two tiny additive edits inside the payF branch. (1) `payFInitials(n)` rewritten to return the **first + last** initial (`Dana Whitfield` -> `DW`, `Mary Jane Watson` -> `MW`), with a single-name fallback to the first two letters (`Cher` -> `CH`) and an empty-string guard for empty/undefined names. (2) `payFMarker` now always emits the `.payf-mark-tx` initials span next to the leave-type icon (previously only at Detail size), so initials show at **both Explore and Detail**. The marker keeps its group colour (`payFGroupColor`), its leave-type glyph, the accessible `title` tooltip and sr-only text (both carry the FULL name), and the "+N" overflow rule (`maxMarks` unchanged: 2 at Explore, 3 at Detail). Day-cell and marker click-to-open (`day-open` / `mark-open`) are untouched. | Owner feedback 2026-08-08. Prior baseline showed initials at Detail only and derived them from the first letter of up to three words; both were corrected here. |

Everything else kept working: group-colour markers, the two-part legend, month grid + nav, empty states, the Group by toggle, the day-detail popover, the Approval Queue and the Glance KPI.

### Judgement calls (flagged for owner)
- **Initials at Glance**: the calendar is not rendered at Glance (Glance is the KPI card), so this is moot in practice; `payFMarker` would still emit initials safely if invoked at any size.
- **Single-name / edge cases**: none of the seven mock people have single-part names (all read as two letters, e.g. `PN`, `TA`), so the single-name "first two letters" fallback and the empty-string guard are covered by the driver but not visible in the mock data. Hyphenated or multi-word surnames still reduce to first-part + last-part initials by design.
- **Legibility / overflow at Explore**: two-character initials at `font-size:8px` beside a 12px icon inside the compact Explore cells (min-height 46px), with `.payf-marks` flex-wrap and the unchanged "+N" overflow. Machine-verified for presence/order/overflow but the visual fit and density at Explore want a browser eyeball.

### Verification
- `final-check-rules.py --widget 9 --step4 <doc>`: **0 HIGH, 0 MED**, 1 LOW (pre-existing F5: Sick `#e53935` in the leave-type constant / Approval Queue, paired with the `sick` icon + "Sick" text, so colour is not the only signal), 1 INFO (F2 node --check on all script blocks passes).
- Per-widget Node DOM-shim driver (`w09_driver.scratch.js`, extends the prior driver): **41 assertions, all pass on cycle 1.** New/initials assertions: `payFInitials` derives `DW`/`PN`/`MW`/`CH`/`""` (first+last, single-name fallback, empty guard); each rendered marker at BOTH Explore and Detail includes the initials as DOM text (`payf-mark-tx">DW`) positioned AFTER (next to) the leave-type icon; the full name stays in the marker `title` and the sr-only text; the group colour (`border-color`/`background` from the palette) and the type glyph are still present; colour recomputes when Group by flips to Department; the "+N" overflow still fires (synthetic 3-person day at Explore -> `+1`, shown markers still carry initials); day-click and marker-click still set `dayDetail` and open the popover (marker click pre-focuses the person); `day-close` clears it. Retained green: non-empty render at every size, status-filter changes, both views render, two-part legend present, empty-data + empty-month clean, and a no-em/en-dash sweep across every dataset x size x view x status x group combination plus an open day-detail (0 hits).

## 2026-08-08 — Approval Queue: Info panel, Approve + Reject actions, Rejected status, four filters (owner feedback)

Fourth refine on the built Final, **Approval Queue only** (the Leave Calendar is untouched except where the shared status model requires). Additive to the payF branch: no A/B/C branch and no other widget were touched. `FC_VERSION[9]` bumped 2.3 -> **2.4**.

### What changed, mapped to the three feedback items

| # | Owner feedback | What was built | Source / notes |
|---|---|---|---|
| 1 | **Three actions**: a per-person **Info** icon, plus per-pending-entry **Approve** and **Reject** buttons; keep person bulk actions (Approve all (N)) and add a matching Reject all (N); Undo still reverses either back to Pending. The Info popover shows (a) that person's time off this year totalled by leave type (day counts) and (b) a list of other staff off this year (name + group + total days) for coverage context; informational, keyboard-reachable, dismissible. | `payFPersonRow` now emits an always-present Info icon (`data-payf="info-open"`, `role=button`, tabbable, aria-label) and, when the person has pending entries, both a green `Approve all (N)` and a red `Reject all (N)` bulk chip; when none pending it reads "All resolved". `payFEntryRow` renders both an Approve (`approve-entry`) and a Reject (`reject-entry`) button on a pending entry, and an Undo (`unapprove-entry`) on a resolved one. New `payFInfoPanel(w)` reuses the day-detail popover card (`.payf-dd-*`, new `.payf-info-*` CSS) as a `role="dialog" aria-modal` popover: section (a) is `payFPersonYearByType` (all four leave types as day counts, excluding rejected), section (b) is `payFOtherStaffYear` (other people with year entries, name + pay group + total days, sorted desc). Day count per entry = `payFEntryDays` = `dEnd - d + 1`. State `PAYF_STATE.infoPerson`; handlers `info-open`/`info-close`; Escape and click-away close it; view change clears it. | Owner feedback 2026-08-08. Reuses the payFDayDetail popover pattern per instruction. |
| 2 | **Rejected is a real status** alongside Pending and Approved. A rejected entry shows "Rejected by [name], [date]" (mirroring "Approved by [name], [date]"), with a distinct visual treatment (colour + text label + icon, never colour alone). | Entries can carry `st:'Rejected'` with `rejBy`/`rejDate` (mirroring `appBy`/`appDate`); the in-session `approvals` map can also hold `'Rejected'`, so `payFEff` returns it. New `payFRejecterText(w,fe)` mirrors `payFApproverText`. New `payFStatusCell(w,fe)` renders all three statuses as a chip where colour is always paired with an icon AND text: Approved green + `check_circle`, Rejected red (`#c0392b` / `#fdecea`) + `cancel`, Pending amber + `schedule`. Both the queue entry rows and the calendar day-detail rows now use `payFStatusCell`. | Owner feedback 2026-08-08. |
| 3 | **Four status filter chips**: All / Pending / Approved / Rejected (was Pending / All / Approved). Pending stays the default; Approved shows approved, Rejected shows rejected, All shows everything. | `payFStatusFilter` now emits four `.vt` chips in the order All, Pending, Approved, Rejected. `payFStatusMatch` gained a `rejected` branch (`eff==='Rejected'`). Default `PAYF_STATE.status` stays `'pending'`. | Owner feedback 2026-08-08. |

**Mock data extended** so the new surfaces have real data: two already-Rejected entries in the working month (Marcus Bell Personal Aug 29, Elena Sokolova Vacation Aug 20-22) plus one historical rejected (Thomas Ade Personal Jul 15), and earlier-month per-person history (mo 0-6) across all people so the Info panel's this-year totals by leave type and the other-staff list aggregate to non-trivial numbers (e.g. Dana Whitfield 2026: Vacation 9, Sick 2, Personal 1, Misc 0 days; Thomas Ade 13 days total). The working-month pending count (7) is unchanged. Per Rule 11 the mockup renders these as if real.

Everything else kept working: the calendar (grid, markers, colour-by-group, initials, month nav, legend, day-detail popover), the Group by toggle on both views, the Glance KPI, and the empty states.

### Backend-reality caveats (recorded here, NOT shown on screen, NOT presented as confirmed)
- **Rejected is a NEW workflow state this design introduces.** The current legacy/Modern model (`PR_EmployeeOffSchedule`) has only approve/unapprove via `ApprovedDate` — there is no "Rejected" state today. Implementing this needs a new backend field (e.g. a rejected/denied flag with rejecter + date) and a reject action endpoint. This is on top of the already-recorded Modern API gap that the inline approval action endpoint itself is not implemented (Sign-off Readiness rows 3-4 in the Step 4 doc).
- **The Info panel aggregations are not existing endpoints.** The per-person year-to-date totals by leave type and the other-staff-off list are aggregations over `PR_EmployeeOffSchedule` (feasible, and should be scoped to the supervisor's authorised groups per the existing authority-scoping gap), but no such endpoint exists today; they would need to be built. The day-count unit used here (`dEnd - d + 1`, excluding rejected) is a design choice, not a documented formula.

### Judgement calls (flagged for owner)
- **Action layout**: Info is per-PERSON (one row-level icon), while Approve and Reject are per-ENTRY (each pending row), with person-level bulk Approve all / Reject all. This matches the owner feedback (Info per person; Approve/Reject per pending entry; bulk to match). An alternative would be per-entry Info too, but year totals + coverage are a person-level question, so Info sits on the person row.
- **Reject colour**: red `#c0392b` on a `#fdecea` tint with a `cancel` icon and the "Reject" / "Rejected by ..." text. Distinct from Sick's palette red `#e53935`; both are always paired with icon + text. Swap freely.
- **Icons on all three chips**: to satisfy "never colour alone" for Rejected, all three status chips now carry an icon (Approved check, Rejected cancel, Pending schedule), a small change to the previously icon-less Approved/Pending chips.
- **Year totals exclude Rejected and count scheduled (pending + approved) days**; rejected/denied leave is not counted as time off. Reasonable for coverage but a product choice.
- **Layout density at Explore**: the entry row now carries a status chip plus two action buttons (or Undo) in a ~138px action cell; at Explore with the Approved/Rejected filter the "Approved by ..." chip can be long. Not machine-verified for visual fit; wants a browser eyeball.

### Verification
- `final-check-rules.py --widget 9 --step4 <doc>`: **0 HIGH, 0 MED**, 1 LOW (pre-existing F5: Sick `#e53935` in the leave-type constant, paired with the `sick` icon + "Sick" text, so colour is not the only signal), 1 INFO (F2 node --check on all script blocks passes).
- Per-widget Node DOM-shim driver (`w09_driver.scratch.js`, extends the prior driver): **79 assertions, all pass on cycle 1.** New v2.4 assertions: each pending entry renders both Approve and Reject buttons plus a per-person Info icon; the person row shows both Approve all and Reject all; clicking Reject sets the entry to Rejected and renders "Rejected by You, ..." with a red + cancel-icon chip; Undo reverses Rejected back to Pending; bulk Approve-all and Reject-all both clear the person's pending and set the entries Approved / Rejected; all four filter chips render and each changes output correctly (Rejected shows only rejected with no Approve buttons, Approved only approved, Pending only pending, All shows all three together); the Info popover opens with the person's this-year totals by leave type as DOM text (Dana Vac 9 / Sick 2 / Personal 1 / Misc 0 days) AND the other-staff list (Thomas Ade, Monthly Clergy, 13 days) and dismisses via close control and Escape; and each status chip pairs colour with icon + text. Retained green from prior cycles: initials markers at Explore + Detail, colour-by-group, "+N" overflow, day/marker click day-detail, non-empty render at every size, both views, two-part legend, empty-data + empty-month clean, and a no-em/en-dash sweep across every dataset x size x view x status (now four) x group combination plus an open day-detail AND an open Info panel (0 hits).

## 2026-08-08 — Leave Calendar colour language: group to STATUS (owner feedback, v2.5)

Owner feedback (2026-08-08) changed the **Leave Calendar's colour language from group to approval STATUS**. This **supersedes the v2.2 "colour = group" scheme**: the group colour-swatch legend is replaced by a status legend, and person initials (added v2.3) now carry who-is-who. Additive to the `payF` branch only; the Approval Queue, both views' Group by control, month nav, day-detail, +N overflow and all other behaviour are unchanged. A/B/C and every other widget untouched.

### What changed, mapped to the owner feedback
| # | Owner feedback | What was built | Source / notes |
|---|---|---|---|
| 1 | **Colour by request STATUS**: Approved green, Rejected red, Pending yellow/amber; align with the widget's existing chip colours; keep the amber legible. | New `payFStatusColor(st)` maps Approved -> `#2e7d32` (the approved-chip green), Rejected -> `#c0392b` (the reject red), Pending -> `#c77d00` (a legible amber take on the pending amber `#b75a00`/`#fff8e1`). `payFMarker` and the `payFDayDetail` dot now read this instead of `payFGroupColor`. | Owner feedback 2026-08-08. |
| 2 | **Day cell priority** when a day has multiple statuses: any Pending -> yellow; else any Rejected -> red; else (all approved) -> green; no-request days stay neutral. | New `payFDayStatus(hit,w)` returns `pending` / `rejected` / `approved` / `''` by that exact priority (reads `payFEff`, so in-session approve/reject/undo re-colours live). The day loop adds a `st-<status>` class; new CSS `.payf-day.st-approved/.st-pending/.st-rejected` gives a light tint plus an inset accent bar. No-request days keep the neutral `.payf-day` look. | Owner feedback 2026-08-08. Priority Pending > Rejected > Approved. |
| 3 | **Each person marker coloured by that person's own status**, so a mixed day shows different-coloured markers under the priority-coloured cell. | `payFMarker` colours border/background/type-glyph by that entry's `payFEff` status via `payFStatusColor`, independent of the Group by dimension. | Owner feedback 2026-08-08. |
| 4 | **Replace the group colour legend with a STATUS legend** (green Approved, yellow Pending, red Rejected); colour never the only signal (keep leave-type icon, initials, text; add a status word/letter or icon). | `payFLegend` now emits a fixed status key: three swatches, each paired with its status glyph (`check_circle` / `schedule` / `cancel`) and its status word; the leave-type icon key stays. Each marker keeps its leave-type glyph, initials, a paired status glyph, and a title + sr-only label naming the status word; the day cell aria-label names its overall status (`some pending` / `some rejected` / `all approved`). | Owner feedback 2026-08-08. Status is never conveyed by colour alone. |
| 5 | **Keep Group by** driving grouping in the queue and day-detail (and labels), NOT the colour. | `payFCalGroupVal` / the calendar summary still use `w.calGroup` for the grouping count + marker group label; the day-detail still lists both Pay Group and Department. Group by no longer feeds any colour. | Owner feedback 2026-08-08. |

**Retained (dead but kept):** `payFGroupColor` / `payFGroupOrder` / `PAYF_PALETTE` remain defined but are no longer called for any calendar colour; retained only for the marker's group-label context. No mock data changed (statuses already present from v2.4).

### Judgement calls (flagged for owner)
- **Pending amber `#c77d00`** was chosen over the raw pending-chip text colour `#b75a00` for a touch more legibility as a marker/glyph hue; the day-cell pending tint is a light `#fff4d6`. Swap freely.
- **Two status glyphs vs one:** each marker now carries the leave-type glyph AND a small status glyph; at Explore, cells are narrow, so the initials ellipsis before the glyphs drop. Layout density at Explore is **not machine-verified** and wants a browser eyeball.
- **Cell accent** is an inset 3px bar (box-shadow) so it adds no layout shift; the tint carries the colour. A full border was avoided to keep the grid gaps even.

### Verification
- `final-check-rules.py --widget 9 --step4 <doc>`: **0 HIGH, 0 MED**, 1 LOW (pre-existing F5: Sick `#e53935` in the leave-type constant, paired with the `sick` icon + "Sick" text), 1 INFO (F2 node --check passes). The status greens/reds carry adjacent hyphen/arrow characters in the surrounding code so F5 does not flag them; each is paired with a glyph + word regardless.
- Per-widget Node DOM-shim driver (`w09_driver.scratch.js`, extended): **99 assertions, all pass on cycle 1.** New v2.5 assertions, priority rule called out explicitly: **unit** `payFDayStatus` returns pending for pending+approved+rejected, rejected for approved+rejected, approved for all-approved, pending for a single pending, and `''` (neutral) for an empty day; **rendered** a day with pending+approved+rejected renders the `st-pending` (amber) cell, a day with only approved+rejected renders `st-rejected` (red), a day with only approved renders `st-approved` (green), a no-request day is neutral (no `st-` class, not clickable). Individual markers carry their own status colour (all three of green/amber/red present in one grid); a marker's status colour is identical under Pay Group vs Department (colour != group); flipping Group by to Department leaves every day cell's status class unchanged (colour is not group). The legend is now a status key (Colour = status, three status words + hues), no longer a pay-group/department key. Status is paired with a non-colour signal in the DOM (marker status glyph + title/sr status word; day-cell aria-label status word; legend words). All prior green retained (renders at Glance/Explore/Detail, queue group-by, four status filters, approve/reject/undo, month nav, day/marker click day-detail, initials, +N overflow, empty states, and the no-em/en-dash sweep across every dataset x size x view x status x group combination, now including the status-coloured calendar). `FC_VERSION[9]` bumped to **2.5**.

## 2026-08-08 — Approval Queue Info popover: lower section from yearly totals to same-dates overlap (owner feedback, v2.6)

Owner feedback (2026-08-08) reworked the **lower section only** of the per-person Info popover in the Approval Queue. The **top section is unchanged** (that person's time off this year totalled by leave type, excluding rejected). The old lower list showed "other staff and how much time off they have this year" — the wrong signal — and is **superseded**: it now shows a **coverage-overlap list**, who else is off during the SAME dates as this person. Additive to the `payF` branch only; queue actions, filters, calendar, month nav, day-detail and everything else unchanged. A/B/C and every other widget untouched.

### What changed, mapped to the owner feedback
| # | Owner feedback | What was built | Source / notes |
|---|---|---|---|
| 1 | **Keep the top section** (this person's time off this year by leave type). | `payFPersonYearByType` / `payFPersonYearTotal` and the `typesHtml` block are untouched. | Owner feedback 2026-08-08. |
| 2 | **Replace the lower list**: not "other staff and how much time off", but who else is requesting/taking time off during the SAME dates (overlapping this person's requests). For each: name, dept + pay group, overlapping dates, leave type (status if easy). | New `payFOverlapStaff(w,pk)`: for the subject's own entries, finds every OTHER person's entry whose range overlaps any of them (same month + year, `startA<=endB && startB<=endA`), listed once per overlapping entry with `{person, dept, pg, dates, type, status}`, sorted by name then dates. Rendered as `.payf-info-oth` rows: name + `dept &middot; pg` on the left, overlapping dates (with type icon) + `type &middot; status` on the right. The old `payFOtherStaffYear` helper and `.payf-info-oth-n` days-total element were removed. | Owner feedback 2026-08-08. Overlap is status-agnostic (full coverage picture); status shown per row. |
| 3 | **Show the subject's own dept + pay group** next to their name in the panel header. | New `payFPersonMeta(w,pk)`; the header now renders `.payf-info-hd-main` = name + `.payf-info-hd-sub` (`dept &middot; pg`), and the panel aria-label names dept + pay group too. | Owner feedback 2026-08-08. |
| 4 | **Empty case**: if no one overlaps, show a clean line. | `payFOverlapStaff` empty -> `<div class="payf-info-empty">No one else is off during these dates.</div>`. | Owner feedback 2026-08-08. |

### Mock data (Rule 11)
- Added ONE `PAYF_GROUPS` entry: **Grace Lin** (Monthly Clergy / Ministry) Vacation **Aug 13-14 Pending**, so the demo overlap list is populated across different pay groups/departments. With this, **Dana Whitfield** (Weekly Staff / Finance, Vacation Aug 12-14) overlaps **Elena Sokolova** (Seasonal / IT, Personal Aug 13) and **Grace Lin** (Monthly Clergy / Ministry, Vacation Aug 13-14) — two conflicts across three different pay groups/departments. **Priya Nandakumar** (Weekly Staff / Admin) overlaps no one, demonstrating the clean empty line. Additive only; not a `MOCK_DATA` entry, so `mock-data.master.js` needs no re-sync.

### Overlap definition + how multiple overlaps are listed (flagged)
- **Overlap definition used:** two entries overlap when they fall in the **same month of the same year** and their day ranges intersect (`startA <= endB AND startB <= endA`). Each entry's range sits within one month in this data model, so month+day comparison is exact.
- **How multiple overlaps are listed:** **one row per overlapping entry** of another person (not merged per-person), so if one person overlaps the subject on two separate ranges they appear twice with each range — clearer for a supervisor scanning dates. Rows are de-duplicated by entry id and sorted by name then dates.

### Backend-reality caveat (recorded here, NOT shown on screen, NOT presented as confirmed)
- The coverage-overlap list is an **aggregation over PR_EmployeeOffSchedule**: find other employees with an OffDate range overlapping any of the subject's OffDate ranges, **scoped to the supervisor's authorised groups**. This is **feasible but is NOT an existing endpoint** — a new query/endpoint would be needed. (This joins the earlier carried caveats: Rejected as a new workflow state, and pay-group grouping via a compensation-detail join.)

### Verification
- `final-check-rules.py --widget 9 --step4 <doc>`: **0 HIGH, 0 MED**, 1 LOW (pre-existing F5: Sick `#e53935` in the leave-type constant, paired with the `sick` icon + "Sick" text — out of scope of this refine), 1 INFO (F2 node --check on all script blocks passes).
- Per-widget Node DOM-shim driver (`w09_driver.scratch.js`, extended): **110 assertions, all pass on cycle 1** (one assertion was corrected mid-run: an initial substring check for `payf-info-oth-n` false-matched the still-valid name class `payf-info-oth-nm`, tightened to the exact `class="payf-info-oth-n"`). New v2.6 assertions, overlap + dept/pay-group called out explicitly: opening Info for **Dana Whitfield** (whose Aug 12-14 overlaps others) shows **Elena Sokolova** with dept **IT** AND pay group **Seasonal** AND overlapping dates **Aug 13**, and **Grace Lin** with dept **Ministry** AND pay group **Monthly Clergy** AND overlapping range **Aug 13 to 14**, each as DOM text with leave type + status; the old **"Other staff off this year"** caption and the per-other-person **days-off total element** (`class="payf-info-oth-n"`) are **gone** from the lower list, and `payFOtherStaffYear` is removed; the **subject's dept + pay group** render in the panel header (`Finance &middot; Weekly Staff`); a **no-overlap** person (**Priya Nandakumar**) shows the clean **"No one else is off during these dates."** line while its top year-totals and header dept/pay group still render; and the **top per-person year totals still render** (Dana Vac 9 / Sick 2 / Personal 1 / Misc 0 days as DOM text). All prior green retained: queue actions incl. Reject/Undo and bulk Approve-all/Reject-all, four filters, calendar status colours + priority rule, month nav, day/marker day-detail, initials, +N overflow, non-empty render at every size, both views, two-part status legend, empty-data + empty-month clean, and the no-em/en-dash sweep across every dataset x size x view x status x group combination plus an open day-detail AND an open Info panel (0 hits). `FC_VERSION[9]` bumped to **2.6**.

### Needs a browser eyeball (not machine-verified)
- Visual density of the overlap row's right column (dates + type/status) at Explore vs Detail, and whether long dept + pay group strings wrap cleanly under a name. Layout fit is not machine-verified.

## 2026-08-08 — Owner changes v2.7: per-day lines, Rejected removed, Department default, leave-type icons removed

Owner instruction (2026-08-08) applied FOUR changes together. All additive to the `payF` branch, its `PAYF_*` data, the `payf` CSS and the `fc-widget-9` chrome only. A/B/C branches, other widgets and the Dashboard-tab markup untouched. `FC_VERSION[9]` bumped to **2.7**.

### What changed, mapped to the four owner changes

| # | Owner change | What was built | Source / notes |
|---|---|---|---|
| 1 | **Each day is its own entry/line.** A multi-day request becomes one line per calendar day (12th-14th = three lines), each individually shown, counted and approvable, in the queue, the counts, the calendar and the overlap logic. | `payFFlat` now **expands** each source entry to one flat entry per calendar day: single-day `d===dEnd`, per-day hours (`round(hours/span)`), and a unique per-day `_id` (`pg#name#entryIndex#day`). Everything downstream runs through `payFFlat`, so the Approval Queue lists one day-line per day per person, `payFPendingCount` / `payFPersonPending` / `payFGroupPending` count DAY-lines, `payFPersonYearByType` / `payFPersonYearTotal` sum day-lines (via `payFEntryDays`, now 1 per line), the Leave Calendar marks each day, and `payFOverlapStaff` / `payFRangesOverlap` compare at day level (same-day intersection). The queue header reads "N pending of M scheduled days". | Owner instruction 2026-08-08. Source mock data keeps the compact `d`/`dEnd` range form; expansion happens at render, so no per-day hand-authoring. |
| 2 | **Remove Rejected completely** from both views. Statuses are only Pending and Approved. Remove the Reject button, bulk Reject all, the Rejected status value + "Rejected by" text, the Rejected filter chip (filters become All / Pending / Approved), any Rejected mock entries and the red status colour. Undo still reverses Approved to Pending. Calendar priority becomes any Pending -> yellow, else all-approved -> green. | Removed: `payFRejecterText`; the Rejected branch of `payFStatusCell`; the `rejected` clauses in `payFStatusMatch` and `payFStatusColor` (now green/amber only) and `payFStatusGlyph`; the Rejected day-status from `payFDayStatus` / `payFDayStatusLabel`; the Reject-all bulk chip in `payFPersonRow`; the Reject button in `payFEntryRow`; the `reject-entry` / `reject-person` handlers in `payFOnClick`; the Rejected chip in `payFStatusFilter`; the Rejected legend item; the `.payf-day.st-rejected` CSS rule. The three Rejected mock entries (Marcus Bell, Thomas Ade, Elena Sokolova) were converted to Pending/Approved. `unapprove-entry` (Undo -> Pending) kept. | Owner instruction 2026-08-08. Supersedes the v2.4 Rejected workflow. |
| 3 | **Group by Department is first and the DEFAULT** in both views; Pay Group is the second option. | `PAYF_STATE.queueGroup` and `calGroup` default to `'dept'`. `payFGroupToggle` lists Department before Pay Group in both the queue and the calendar. | Owner instruction 2026-08-08. Supersedes the earlier Pay-Group-default. |
| 4 | **Remove leave-type icons entirely.** No Vacation/Sick/Personal/Misc glyphs anywhere; the type shows as a plain text label. Calendar marker becomes the person's initials coloured by status (green approved / yellow pending), no leave-type icon and no separate status glyph; keep status in the marker title/label + day-cell aria-label; legend drops the leave-type icon key (keep a status colour key). Day-detail + Info panel still show type as text. | `payFMarker` now renders just the initials in a status-coloured pill; the leave-type glyph and the paired status glyph are gone (status word stays in `title`, the sr-only label and the day-cell aria-label). `payFEntryRow`, `payFDayDetail`, and `payFInfoPanel` (both the this-year totals and the overlap rows) show the type as text with no icon. `payFLegend` is a single status colour key (green Approved, yellow Pending). `payFTypeColor` / `payFTypeIcon` removed (dead); `PAYF_LEAVE_TYPES` kept as the type enumeration only (icon/color fields dropped). Marker initials font bumped for legibility now that they stand alone. | Owner instruction 2026-08-08. Supersedes the v2.2 icon markers and the v2.5 3-colour priority (which relied on the Rejected red). |

### Ripple effects (recorded)
- **Counts are now day-based.** "N pending of M scheduled days", "Approve all (N)", and the group/person pending badges all count day-lines, not requests. A 3-day pending request contributes 3 to every pending count and 3 approvable lines.
- **Overlap is day-level.** Because entries are single-day after expansion, two people overlap only when off on the exact same day, and each overlapping day is listed as its own row (e.g. Grace Lin now shows as Aug 13 and Aug 14 rather than one "Aug 13 to 14" range). This is the intended day-level coverage read.
- **Info this-year totals unchanged in value** (day counts already equalled the sum of spans), just computed as a sum of day-lines now.

### Backend-reality caveats (recorded here, NOT shown on screen, unchanged from prior passes)
- Pay-group grouping still needs the compensation-detail join; the Info this-year-totals and the coverage-overlap list are still aggregations over `PR_EmployeeOffSchedule` scoped to the supervisor's authorised groups (feasible, not existing endpoints). Removing Rejected simplifies the backend need (approve/unapprove via `ApprovedDate` already exists; no rejected field required).

### Verification
- `final-check-rules.py --widget 9 --step4 <doc>`: **0 HIGH, 0 MED**, 1 LOW (pre-existing F5: Sick `#e53935` in the A/B/C leave-type colour map, out of scope of the F branch), 1 INFO (F2 node --check passes on all script blocks).
- Per-widget Node DOM-shim driver (`w09_driver.scratch.js`, rewritten for v2.7): **80 assertions, all pass on cycle 1** (two over-eager assertions were tightened mid-run: a broad `" to "` substring check, and a Vacation-row count that correctly also caught Grace Lin's overlapping Aug 13-14 Vacation, retargeted to Dana's per-day `_id`). Change-by-change: **per-day** (Dana's Aug 12-14 request = 3 flat day-lines days 12/13/14 with 8h each and distinct `_id`s; queue renders 3 separate day-lines and NO "Aug 12 to 14" range; calendar renders 3 Dana day-markers; person bulk reads "Approve all (3)"); **no Rejected** (a full sweep of every size x view x status x group with an open day-detail AND an open Info panel finds zero "Reject"/"Rejected" text, zero `#c0392b` red, zero reject handlers, zero `cancel` glyph; filter chips are exactly All/Pending/Approved; priority is any Pending -> yellow else all-approved -> green with no `st-rejected`; Undo reverses Approved -> Pending); **Department default** (`queueGroup`/`calGroup` default `dept`; the Group by toggle lists Department before Pay Group and marks it on in both views; queue groups by department by default; Pay Group still selectable); **no leave-type icons** (calendar marker has zero `material-symbols-rounded`, just status-coloured initials; queue rows, day-detail and Info panel show type as text with no `beach_access`/`sick`/`person`/`more_horiz` glyph; legend is a status colour key with no leave-type key and no red swatch). Still-green: Info overlap + this-year totals as text (Dana Vac9/Sick2/Per1/Misc0), no-overlap clean line (Priya), bulk approve-all, day/marker day-detail, month nav, all sizes render, both views, empty-data + empty-month, and the no-em/en-dash sweep (0 hits).

### Needs a browser eyeball (not machine-verified)
- Legibility of the initials-only markers at Explore density (they are now the sole marker content); whether two-letter initials plus the "+N" overflow still read cleanly in a tight cell.
- Queue row rhythm now that a multi-day request is several stacked single-day lines under one person (vertical length at Explore's 6-unit cap vs Detail).

## 2026-08-08 — Owner change v2.8: Outstanding = past-due pending (calendar red, Glance figure, queue tag)

Owner instruction (2026-08-08) introduced a new **Outstanding** state as an additive iteration on the working v2.7 F branch. Additive to the `payF` branch, its `PAYF_*` data, the `payf` CSS and the `fc-widget-9` chrome only. A/B/C branches, other widgets and the Dashboard-tab markup untouched. `FC_VERSION[9]` bumped to **2.8**.

### Definition
An entry (day-line) is **Outstanding** when its date is strictly **BEFORE** the current date (the established today anchor, `PAYF_TODAY_Y/M/D` = Aug 7 2026) **AND** it is still **Pending** (not Approved). A past date that is Approved is NOT outstanding. A pending date that is today or in the future is normal Pending, NOT outstanding. Outstanding is a past-due pending day. Implemented as `payFDateBeforeToday(fe)` (year, then month, then day comparison against the anchor) and `payFIsOutstanding(w,fe)` = effective-Pending AND before-today. `payFEffState(w,fe)` returns the state word used for colour and labels: `Approved` | `Outstanding` | `Pending`.

### The three placements

| Placement | What was built | Notes |
|---|---|---|
| **Calendar** | An Outstanding marker is **RED** (`#c0392b`). Day-cell colour priority is now, in order: any Outstanding -> red; else any (future/current) Pending -> yellow; else all approved -> green (`payFDayStatus` rewritten to walk `payFEffState` per entry). New CSS rule `.payf-day.st-outstanding` (red tint + red inset accent). Each marker is coloured by its own state via `payFStatusColor(payFEffState(...))`, so a mixed past day shows a red Outstanding marker beside a green Approved one inside a red-priority cell. Colour is never the only signal: the marker `title` and sr-only label name the state word (`Outstanding`/`Pending`/`Approved`), and the day-cell `aria-label` names the day state (`some outstanding`/`some pending`/`all approved`). Red = Outstanding added to the status legend (`payFLegend`, third item with the `error` glyph). | `payFStatusColor` and `payFStatusGlyph` gained the Outstanding branch (red / `error`). |
| **Glance (KPI)** | Two figures side by side: a **Pending** count and a separate **Outstanding** count (`payFGlance` rebuilt as a two-column layout, Pending amber, Outstanding red). Crucially the **Pending figure EXCLUDES outstanding** (`payFPendingNotOutstanding` = pending dated today or later); Outstanding is `payFOutstandingCount` = pending dated before today. The two are mutually exclusive and partition the pending set with no double count. The old **"Out this week"** secondary was **dropped** here so the two priority figures read cleanly at 288x176 (owner sheet allowed the fallback to the priority figures). `payFOutThisWeek` is retained in code but no longer called. The empty-data Glance mirrors the two-figure layout (0 / 0). | Queue header/person pending counts (`payFPendingCount` etc.) were deliberately NOT changed and still include outstanding this pass. |
| **Approval Queue (light touch)** | Outstanding day-lines are flagged with a red **"Outstanding"** tag (`.payf-otag`, red pill + `error` glyph) and a red left accent on the row (`payFEntryRow`). They are still Pending, so they still appear under the Pending filter and still count in the existing queue header and per-person pending counts for this pass. **No new filter chip** was added and the queue counts were NOT changed. The day-detail popover rows also carry the tag and a state-coloured dot for consistency. | See flag below. |

### Flag returned to owner (queue behaviour, deliberately unchanged this pass)
Should the queue's **Pending filter** and its **header/person pending counts** also **exclude** outstanding (matching the Glance split), or should the queue gain a dedicated **Outstanding filter chip**? This pass left both as-is (outstanding rows remain under Pending and are still counted) and only added the visual tag. Awaiting owner direction.

### Mock data
Two Outstanding examples added to `PAYF_GROUPS` (both pending, dated before the Aug 7 anchor): **Grace Lin, Aug 1 Personal** (the only entry that day -> a clean solid-red calendar cell) and **Kofi Mensah, Aug 4 Sick** (shares Aug 4 with Elena Sokolova's Approved Sick -> a red-priority cell with mixed-colour markers). Existing data already provides normal future/current Pending (e.g. Dana Aug 12-14, Marcus Aug 7 = today) and Approved (e.g. Dana Aug 3, Priya Aug 5, Elena Aug 4/20-22), so all three calendar colours and both Glance figures are non-zero and demonstrable. Outstanding count in the working month = 2.

### Verification
- `final-check-rules.py --widget 9 --step4 <doc>`: **0 HIGH, 0 MED**, 1 LOW (pre-existing F5: `#e53935` in the A/B/C leave-type colour map at lines ~4674-5303, out of scope of the F branch), 1 INFO (F2 node --check passes on all script blocks). The new Outstanding red is `#c0392b` and the driver proves it never appears without the word "Outstanding" alongside it (colour is never the only signal), so F5 does not apply to the F branch.
- Per-widget Node DOM-shim driver (`w09_driver.scratch.js`, extended for v2.8): **107 assertions, all pass on cycle 1.** New v2.8 assertions: the **classifier** (Grace Aug 1 and Kofi Aug 4 ARE Outstanding; Dana Aug 3 approved-past is NOT; Marcus Aug 7 = today is NOT; Dana Aug 12 future is NOT; `payFEffState` returns the right state word); **calendar red** (day 1 clean-past-pending cell = `st-outstanding`, day 4 mixed cell = `st-outstanding` by priority, day 3 approved = `st-approved` green, day 11 future pending = `st-pending` yellow; Grace Aug 1 marker red and labelled "Outstanding"; mixed day 4 has a red Kofi marker beside a green Elena marker; day-cell aria-label reads "some outstanding"); **legend** includes green Approved / yellow Pending / red Outstanding with a red swatch; **Glance partition** (Outstanding count = 2; Pending figure < total pending; Pending + Outstanding = total pending exactly, no double count; Glance renders both labelled figures with the Outstanding figure red); **queue tag** (outstanding row carries `payf-otag` "Outstanding", still shown under the Pending filter, per-person pending count still includes it = 4 for Grace); **approve/undo** (approving Grace Aug 1 makes it Approved/green and drops it from BOTH the outstanding and total-pending counts while Pending-excl is unchanged; Undo returns it to Pending -> Outstanding again). All prior v2.7 assertions stay green (per-day lines, no Rejected, Department default, no leave-type icons, Info overlap + this-year totals, day/marker detail, month nav, all sizes, both views, empty-data, no-em/en-dash sweep). Two prior v2.7 legend assertions were updated (not new failures): the legend legitimately gains a red Outstanding swatch, and the empty Glance now reads "Pending / Outstanding" rather than "Pending Approvals".

### Needs a browser eyeball (not machine-verified)
- Legibility of the two red states together: the red Outstanding marker/tag (`#c0392b`) against the yellow Pending and green Approved, and whether the red day-cell tint plus the red marker inside reads clearly at Explore density.
- Glance two-figure balance at 288x176 (two 30px numbers with the divider) and whether dropping "Out this week" leaves the card feeling sparse or clean.
- The queue row's red left accent + "Outstanding" tag rhythm when several outstanding day-lines stack under one person.

### Backend-reality caveats (recorded here, NOT shown on screen)
- Outstanding is a pure client-side classification (date-before-today AND pending) over the existing `PR_EmployeeOffSchedule` request date + approval state; it needs no new backend field. It does assume a reliable "today" / current-date reference and the same authority scoping as the rest of the widget.
