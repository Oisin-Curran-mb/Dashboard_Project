# W03 Payroll Distributions — Comparing the DR Research Doc to Our Work

**Comparing:** `DR-Payroll Distributions-160726-145036.pdf` (dated 15–16 Jul 2026, live audit + SME interview + design brief) against the Purpose doc, the locked design doc, the mockup (`Dashboard Widget Mockups.html`, W03), the Developer Punch List, and the Backend SME Questions doc.

The DR doc is a much deeper artifact than anything we had — it includes a live accessibility audit on real data (beta1), a proper SME interview (Ben Lane) mapped to jobs-to-be-done, and — in its Section 11 — a direct review of our mockup by name, with flags F1–F8. Some of that review agrees with what we built. Some of it directly contradicts decisions made in this conversation, including ones I implemented at your explicit instruction. Laying out where each stands below.

---

## Where we align

**"Paid, not owed" framing.** The DR doc calls this out by name as correct ("the 'Paid, not owed' framing is right"). This validates the reframe we did across the mockup, Final Check Logic section, and Punch List.

**Data source.** `PRHistory` + `PRHistoryCompensation`, no caching, live query every load — matches our Purpose doc exactly and is independently confirmed live on beta1.

**Bars with visible values over hover-only pie.** The DR doc flags hover-only pie values as a live accessibility failure and credits designs that show values as text. Our Bar and Table views already show numbers as text. Our Pie legend currently shows **percentage only**, not the dollar amount — worth a small fix so Pie doesn't reintroduce a lesser version of the same problem (see "Won't work as intended" below).

**Department/pay-group field is unconfirmed.** This is the same open item we already have in the Punch List and Backend SME Questions (Q13). The DR doc goes further and independently confirms via SME interview that this dimension, if it exists at all, is called **pay group**, not "department" — and that pay group is an existing payroll function orgs would actually use to scope a school/daycare/church combo.

**No drill-down today; Earnings Inquiry is the wrong grain.** We'd already flagged the drill-through target as unconfirmed. The DR doc confirms Earnings Inquiry exists but is per-employee only — same conclusion, now with a name and a reason.

**Open-items discipline.** Called out directly as "exactly right for a locked doc" — validates how we've been flagging assumptions rather than guessing throughout this project.

---

## Where we differ — direct conflicts

### 1. The Pay Date / recurring / per-department scheduling model (F2)

We built: a Pay Date field anchoring the period, Weekly/Bi-Weekly/Monthly counting backward from it, a "Make this recurring" checkbox, and a "Separate By Department" option giving each department its own start date/period/recurring setting.

The DR doc (Section 10.2) evaluates exactly this idea — retrospective pay dates, counting back from real check dates — as **Option C**, and rejects it: "the most recent pay date" is only well-defined if there's one; an org running a monthly church and a weekly daycare has no single last pay date, and "last 3 pay dates" could silently return three daycare runs and omit the church entirely. F2 names our mockup directly: it calls the Pay Period model "a scheduling feature in a filter's clothes" and says to cut the recurring flag and per-department scheduling outright — that's payroll-processing territory, not a read widget.

**Their recommendation instead:** calendar spans (Month / Quarter / YTD / Calendar Year / Custom), matching the widget shell's own documented period vocabulary (Week/Month/Quarter/Fiscal Year/Calendar Year), with pay group handled separately as a scoping filter (see #3 below).

### 2. Current-vs-prior period comparison (F3)

We built: bar chart % up/down badges, a Prior/Current/Change table, and a stacked-bar breakdown — all resting on a period-over-period comparison.

The DR doc rejects this **entirely** for this widget (Section 10.3), and not casually — it's reasoned from the "three-paycheck-month" effect: biweekly pay produces 26 periods a year, so two months annually carry a third paycheck, making calendar-based period comparisons misleading on a regulated figure. It also notes no SME asked for comparison on this specific widget (it was requested for Budget vs. Actual, not Payroll Distributions). What survives: **proportion** — percent-of-total within a single period — which we already show via bar length/percentage, so that part is fine. The delta/trend/badge/change-column machinery is the part that's flagged for removal.

### 3. Department as a grouping dimension vs. pay group as a scoping filter

We built Department as the default grouping axis for "All Departments" — department rollup rows, drill into a department for category detail.

The DR doc (10.4, F1) draws a different line: pay group should be an **optional scoping filter**, parallel to Company — narrowing what's included, not a new grain or a default grouping dimension. And F1 goes further: if a department-like dimension can't actually be derived from the data, the fallback should be to default straight to compensation-category rows (today's grain), not lock in an unbuildable grouped view.

### 4. The new fixed pay-type category list

At your instruction, I changed the drill-down categories from the paycheck-stub list (Net Pay/Fed Tax/Benefits/State Tax/Retirement/Overtime) to Regular/Vacation/OverTime/Sick/Double Time/Personal/Holiday/Misc/Other.

F4 in the DR doc confirms live, on real data, that categories are **org-defined and unpredictable** — beta1 shows "AA Aid" and "Administration Staff," not a standard pay-type taxonomy. The constraint (9.3) is explicit: "never assume a fixed category list." That directly conflicts with the new fixed nine-item list — it's an improvement over the old paycheck-stub list, but it's still an invented fixed list where the real system has org-defined, variable-count labels. Worth flagging back to you since this was a direct instruction in this same conversation, not something I introduced unprompted — the two now sit in tension and are worth reconciling deliberately rather than by default.

### 5. "Top 3 / Top 5" trimming, sort order (F6)

Not something you asked me to change, but worth surfacing: our `capN()` function caps rows at small sizes by taking the first N in array order, which for departments is alphabetical and for categories is whatever order the array happens to be in — not sorted by amount. F6 flags this precisely: if a small view shows "top" rows, the sort has to be amount-descending, or "top 3" is meaningless. This is a real bug independent of the bigger disagreements above.

---

## Things I think won't work as intended

**Pie chart legend only shows percentage, not dollar amount.** Given the DR doc's whole point about hover-only values failing accessibility, our Pie view should show the dollar figure as text in the legend, not just the percentage — otherwise it's a smaller version of the same problem on the one view where we still lean on a pie.

**Table markup.** Not something we've built ourselves, but worth knowing: the DR doc's live audit found the real widget's grid is three separate HTML tables with generic (non-`th`/`td`) cells — a WCAG 1.3.1 failure. If our redesign reuses similar `tbl()`/`tblScroll()` div-based markup rather than semantic table elements, we'd be inheriting the exact failure the brief says must be actively fixed, not carried forward.

**Widget states.** F5 flags that entitlement/rights/empty/loading/error states aren't addressed in our writeup at all. We haven't built any of these in the mockup — currently there's no explicit empty-state design, no loading state, no distinction between "no payroll in range" and "user has no rights."

**The whole Small/Medium/Large/KPI sizing model.** This is the biggest structural mismatch, and it's not scoped to W03 — it runs through the entire mockup file. The DR doc states as a settled platform decision (9.3, 10.8) that the real widget shell uses **content-depth views** — glance/detail/explore, plus a focus overlay — not a size vector, and that views can span different column counts depending on breakpoint. Our whole mockup framework is built around Small/Medium/Large/KPI as size tiers. If the real shell genuinely works this way, every widget in the mockup — not just this one — is modeled on a different axis than the one the platform actually uses. Worth deciding whether that's a deliberate simplification for prototyping purposes or something that needs reconciling before this goes further.

**Localization / currency.** Not something either of us has addressed — the live audit found £ rendering on a US product and dd/mm/yyyy dates on real data. Our mockup hardcodes `$` throughout via `$m()`. Not a redesign decision, just flagging it's an open gap on both sides.

---

## Notable overlaps in open questions

Several things we'd already flagged as unconfirmed in the Punch List / Backend SME Questions turn out to be the same open questions the DR doc lists in its own Section 13 — independent convergence, which is a reasonably strong signal these are the right things to chase:

- Does a department/pay-group dimension exist on or via `PRHistory`/`PRHistoryCompensation`? (our Q13 ↔ their Section 13, blocks their F1)
- Can the query filter by pay group without heavy backend work? (new to us — worth adding to the Punch List)
- Both-panels-update-on-date-change — the DR doc flags this as genuinely untested/inconclusive on the *existing* live widget, separate from anything we've built.

---

## What I'd suggest as next step

This is a comparison, not a set of changes — nothing in the mockup has been touched. The two biggest calls to make before touching anything are: whether to walk back the Pay Date/recurring/per-department period model in favor of calendar spans + a separate pay-group filter, and whether to drop the prior-period comparison entirely per the three-paycheck-month reasoning. Both are reversals of multi-round work in this conversation, so worth deciding deliberately rather than by default — happy to implement either direction once you've weighed in.
