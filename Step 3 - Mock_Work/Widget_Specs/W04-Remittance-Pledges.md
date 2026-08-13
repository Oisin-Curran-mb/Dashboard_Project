# W04 — Remittance Pledges

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [04 - Remittance Pledges.md](../../Step 1 - Dashboard Research/04 - Remittance Pledges.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Shows how well the organisation is keeping up with its remittance pledge commitments. For each activity type, users can see what was pledged, how much has been paid, what remains outstanding, and the percentage paid so far.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** "Pledge vs Received" is a named, standard nonprofit fundraising metric with an established fulfillment-rate formula (Received ÷ Pledged × 100; healthy range 85–95%) ([DonorSearch](https://www.donorsearch.net/resources/nonprofit-fundraising-metrics/)), typically shown as progress bars, paired bars, or a pie/table companion. Note: no dedicated competitor product for denominational apportionment/remittance tracking specifically turned up in this research — this is a niche church-finance concept, so the benchmark here is the general pledge-tracking pattern rather than a named direct competitor.

**Fit-check:** all three existing options (A Progress Bars, B Paired Bars, C Summary Table) map directly onto the three standard visualisations for this exact metric — this is one of the best-aligned widgets in the set already. The open question already flagged in this file (how "% Paid" re-baselines against the Date Range presets) matters more here than which chart wins, since all three options inherit whatever that math decision is.

---

## Filter Options
| Filter | Values |
|--------|--------|
| Date Range | Current Month · Last Month · **Custom** *(reveals two date fields — Beginning/Ending — to the right of the filter, matching the W03 pattern)* |
| Activity Type | All Activity Types · *(populated from real `RMActivityRepository` activity names — e.g. apportionments, mission funds — the fundraising-style placeholder values below were a mix-up with a different widget and need replacing before build)* |
| Fiscal Year | FY 2026 · FY 2025 · FY 2024 |

**Corrected from earlier draft:** the filter was called "Campaign" with fundraising-style values (Spring Appeal, Year-End, Capital Campaign, Mission Drive) — that was a mix-up with a different widget (likely W17 Gifts Pledges). This widget tracks denominational remittance obligations, not donor campaigns, so it's renamed to **Activity Type**.

**Open question — needs a decision before build:** is "Current Month" a rolling *last 30 days* window, or the *calendar month currently in progress*? Same question for "Last Month" (rolling 30–60 days back, or the prior calendar month). Do not assume either interpretation without confirming.

**Open question — needs a decision before build:** does "% Paid" / "YTD Expected" always compute against the full fiscal year regardless of which Date Range is selected, or does selecting "Current Month" re-baseline the expectation to that month's pro-rated share (Annual ÷ 12)? This affects the math behind every percentage shown, not just display.

**Date persistence:** whichever Date Range value is selected, it must persist across a page refresh — matching the old Purpose doc's documented behaviour. The earlier draft's "known issue: date filter resets on refresh" note was itself a documentation mistake, not a real regression to fix.

**KPI size (3-dot menu):** Fiscal Year only (per Hard Rule 1) — Activity Type and Date Range are dropped at KPI size.

## Data Table Sort
Fixed — Sequence number (Seq.) ascending, matching the old design's documented row order. Not user-changeable.

## Drill-Through
**NEW FEATURE — not present in the old design** (the Purpose doc confirms no drill-down exists today). Add a link from the widget out to the full Remittance module, filtered to the same activity type/date.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

---

## Option A — Progress Bars *(Keep/Refresh)*

**Chart:** Horizontal progress bar per activity type — received portion filled, outstanding empty  
**Views available:** Bar (default) · Pie · Table  
**Improvement note:** One bar per campaign showing received vs pledged. Clear for pledge tracking.  
**Reference:** [Virtuous Pledge Tracking](https://virtuous.org/blog/donor-pledge-tracking/)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 2 activity types, % label only |
| **Medium (2×2)** | 4 activity types, received/pledged values |
| **Large (4×4)** | All activity types, full values + % + table toggle (fixed sort: Seq. ascending) |
| **KPI (1×0.5)** | Headline: **activity type with the lowest % Paid** (biggest shortfall, e.g. "Mission Fund: 62%"). Fiscal Year filter only, no download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option B — Paired Bars *(Improve)*

**Chart:** Side-by-side bars (pledged vs received) per activity type  
**Views available:** Bar (default) · Table  
**Improvement note:** Gap between bars is immediately visible — better for spotting shortfalls.  
**Reference:** [DonorPerfect Giving Report](https://www.donorperfect.com/giving-report-pledge-progress/)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 activity types, no legend |
| **Medium (2×2)** | 5 activity types + legend |
| **Large (4×4)** | All activity types + legend + outstanding amount labels (fixed sort: Seq. ascending) |
| **KPI (1×0.5)** | Headline: **Total Outstanding ($)** across all activity types. Fiscal Year filter only, no download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option C — Summary Table *(Keep/Refresh)*

**Chart:** Table — Pledged · Received · Outstanding · % per activity type  
**Views available:** Table (default) · Cards  
**Improvement note:** Best for reporting. Totals row at bottom.  
**Reference:** [Bloomerang Pledge Tracking](https://bloomerang.com/)

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 rows (fixed sort: Seq. ascending), rows scroll internally, header fixed |
| **Medium (2×2)** | 5 rows, same sort/scroll pattern |
| **Large (4×4)** | All rows + totals row + % column, same sort/scroll pattern |
| **KPI (1×0.5)** | Headline: **overall % Paid** (YTD Paid ÷ Annual, across all activity types). Fiscal Year filter only, no download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Fine-Tuning Notes
- ~~Known issue: date filter resets on page refresh~~ — superseded above: date must persist across refresh, matching the old Purpose doc.
- Activity Type filter on A/B should highlight the selected activity type's bar
- Outstanding amounts should always be shown in red/amber

---

## 2026-07-23 — Three new design options rebuilt under Rules 8–11 (`create-mock-designs`)

> Additive entry. Nothing above was edited or removed. This run replaced W04's three Dashboard-tab cards and its `WRENDER[4]` function in `Dashboard Widget Mockups.html` with the three concepts below, following the skill's Restyled-Original / Competitor-Match / Maximum-Freedom brief and the new General Widget Design Rules 8–11. It did **not** touch the Final Check tab markup (`id="fc-widget-4"`) — see the "Final Check" note at the end.

### The shared "second dimension" this run introduced
The prior three options (Progress Bars / Paired Bars / Summary Table) all rendered the *same* single relationship — received vs. pledged (`r` vs `p`). Per Rule 10, this run added a genuine second dimension that already exists in the widget's own documented logic but was **not** surfaced by any option: **YTD Expected = Annual × (% of calendar year elapsed)** — the legacy widget's own "pro-rated expected by now" figure (Step 1 doc §2 formula: `DateReceiptsThru.DayOfYear / 365`). From it, each activity gets a **pace variance** (`YTD Paid − YTD Expected`): positive = on/ahead of pace, negative = behind. This is exactly the "budget pacing" pattern the Market Research file flagged as its strongest, best-supported precedent (its Visual Option 1).

### Design 1 — Option A — "Remittance Table" (Restyled Original)
- **What it is:** the legacy widget restyled in Pathway. Per Step 1, the live system is **table-only** (no chart), so the faithful restyle is the table — not the progress-bars that the previous mockup's Option A had drifted to.
- **Field/dimension:** the full legacy column set — Activity · Annual · **YTD Expected** · YTD Paid · Outstanding · % Paid — with a totals row at Large. The purpose-driven tweak is **restoring the YTD Expected column** the prior mockup had dropped, plus % Paid colour-banding (green ≥80 / amber ≥50 / red <50). A secondary "Progress Bars" view is offered via the chart switch.
- **What drove it:** Step 1 legacy baseline (table-only, all six columns). No competitor citation — this is the restyled original.
- **KPI headline:** overall % Paid (YTD Paid ÷ Annual across all activities) — matches the locked doc's specified KPI and is ✅ available per the Punch List.

### Design 2 — Option B — "Pacing Bars" (Competitor Match)
- **What it is:** a horizontal progress bar per activity (received fill vs. annual), with a **pacing tick marker** at the pro-rated "expected by now" point, and the bar coloured green (on/ahead of pace) or amber (behind pace). A legend explains the tick and states the % of year elapsed.
- **Second dimension (Rule 10):** YTD Expected / pace — the tick position and bar colour are driven by `exp` and the sign of `vare`, not just `r/p`.
- **What drove it:** Market Research file, **Visual Option 1 ("Progress bar with a pacing marker per activity")**, the only *genuinely new* option it proposed and its best-supported one — the "budget pacing" pattern confirmed by 2 independent source-pairs (NCOA/HUD Exchange; Adpulse/Basis). Tie-break toward current honoured: it builds directly on the current Option A progress-bar shape.
- **KPI headline:** "N of M activities behind pace" (count with `vare < 0`).

### Design 3 — Option C — "Pace Variance" (Maximum Freedom)
- **What it is:** a **diverging bar chart** centred on a zero axis — each activity's `YTD Paid − YTD Expected`. Behind pace extends left (red), ahead extends right (green), scaled to the largest absolute variance, with the dollar variance printed per row. A single continuous zero line runs down the centre (Rule T9). A "Data Table" view lists Expected · Paid · Variance with a totals row.
- **Second dimension (Rule 10):** pace variance is the *primary* axis here — a genuinely different framing from A/B (not "how much of annual is done" but "are we ahead or behind the expected pace **right now**, and by how much"), which is the widget's actual purpose ("how well are we keeping up").
- **What drove it:** purpose-driven, no direct citation — freest interpretation of "keeping up with pledge commitments." (The pacing concept it visualises is the same one the Market Research budget-pacing finding supports, but the diverging-variance treatment itself is an internal idea.)
- **KPI headline:** total behind-pace shortfall ($) = Σ(Expected − Paid) over behind-pace activities.

### Rule 8 — per-option filter scoping (implemented, not just claimed)
W04 now scopes filter state **per design option**, mirroring the existing W06 pattern exactly:
- Inside `WRENDER[4]`: `var fk=wid+'-'+opt;` and every filter read goes through `fv(fk,'Activity Type')` / `fv(fk,'Fiscal Year')` with `ftags(fk)` for the chips — so `WS['4-A']`, `WS['4-B']`, `WS['4-C']` are three independent state objects. Changing a filter on one option's card no longer changes what the other two render.
- The shared `gs()` / `fv()` / `ftags()` signatures were **not** touched (16 other widgets depend on them).
- The three Dashboard-tab cards' menu calls were updated from `openFilter(4,event)` to `openFilter(4,event,'A'|'B'|'C')`.
- The narrow `wid===4` branch was added alongside the existing `wid===6` one in `_renderFltBody` (`((wid===6||wid===4) && _filterOpt)…`) and `applyFilter` (`((_filterWid===6||_filterWid===4) && _filterOpt)…`). `openFilter` already captures `opt` generically, so no separate branch was needed there. The `wid===6` branches were left intact.

### Rule 9 — mandatory sizes
KPI, Medium, and Large render for all three options (verified: 15/15 option×size renders return non-empty output). A KPI size button was added to each of the three Dashboard-tab cards' size menus (they previously offered only Small/Medium/Large). **Small note:** A and B render the real concept at Small (3-row table / 3 pacing bars). **Option C's Small is a reduced summary variant** (headline shortfall + behind-pace count), not the full diverging chart, which needs Medium+ to be legible at 1×1 — stated here as a deliberate, documented reduction (not a silent omission), awaiting the project owner's confirmation if the full chart is wanted at Small.

### Rule 11 — speculative-data caveat (doc only, nothing rendered on-screen)
**YTD Expected and the pace variance derived from it are a DERIVED figure, not a stored backend field.** The legacy `PercentOfYear` formula is confirmed (Step 1 doc), and "Progress Bars / Paired Bars / Table views" and the overall "% Paid" KPI are ✅ available per the Developer Punch List — but the Punch List marks the **Date Range filter 🟡 "needs a decision"** on two unresolved questions that bear directly on this pacing math: (1) rolling-window vs. calendar-month interpretation, and (2) whether % Paid / YTD Expected **re-baseline per period** or always use the full fiscal year. If the re-baselining decision changes, every pacing tick (B), every variance bar (C), and the YTD Expected column (A) shift with it. Per Rule 11, **no "unconfirmed"/"TBD" badge appears anywhere in the mockup** — the cards render clean as if real; this paragraph is the only place the caveat lives.

### Other notes
- **Filter rename applied:** the filter formerly labelled "Campaign" (with fundraising values Spring Appeal / Year-End / Capital Campaign / Mission Drive — the documented W17 mix-up) is now **"Activity Type"** with a single "All Activity Types" option, matching this spec's own "Corrected from earlier draft" note. Synced in both the live `MOCK_DATA.filters[4]` and the `mock-data.master.js` mirror. The `MOCK_DATA.series[4]` data buckets were left untouched (the render falls back to the `All Campaigns` bucket as the internal key, the same way W03 kept `All Departments` as an internal-only key).
- **Final Check tab:** `id="fc-widget-4"` still carries a **"Final design — locked"** badge and its markup was **not** edited. Because it renders live through the same `WRENDER[4]`, it now shows the new Design-1 (table) output under its existing "Progress Bars" card titles/logic prose — a label-vs-render mismatch in the locked tab that the orchestrator should be aware of and resolve separately (the tab's own Logic text already flagged the "Campaign" vs "Activity Type" naming as an open reconciliation item).
- **check-rules.py** `--widget 4`: 0 HIGH / 0 MED / 0 LOW (exit 0). Both embedded master `<script>` blocks pass `node --check`.

## 2026-07-23 — Fix Mock Designs (attempt 1 of 3): two MEDIUM findings patched (`fix-mock-designs`)

> Additive entry. Nothing above was edited or removed. This run resolved the two actionable MEDIUM findings from the same-day Verify Mock Designs pass (see `Verify Findings.md`), both classed as plain code/markup bugs. Scope was strictly Widget 4's `MOCK_DATA.options[4]` and `WRENDER[4]`'s Option C branch — no other widget, no shared function, and the Final Check tab (`id="fc-widget-4"`) was left byte-identical.

### Fix 1 (was MEDIUM) — `MOCK_DATA.options[4]` metadata was stale
The prior build updated the Dashboard-tab cards' static `opt-t` titles ("Remittance Table" / "Pacing Bars" / "Pace Variance") and `opt-s` subs ("Restyled original" / "Competitor match" / "Maximum freedom") but left `MOCK_DATA.options[4]` holding the OLD concepts ("Progress Bars" / "Paired Bars" / "Summary Table", with Virtuous / DonorPerfect / Bloomerang citations). Because `rerender()` populates each card's improvement note (`imp-4-*`) and citation (`ins-4-*`) live from `options[4]`, and the Expand modal reads `o.title · o.sub` + note + citation from there, every card showed a new title above an old, mismatched note/citation. Updated all three `options[4]` entries so `title` matches the `opt-t` titles exactly and `sub` matches the `opt-s` subs, with new `imp` text and driving sources reflecting each real design:
- **A — "Remittance Table" / "Restyled original":** restyled legacy table (table-only per Step 1), full six-column set with YTD Expected restored and % Paid colour-banding. No competitor citation (restyled original) — `il`/`iu` removed.
- **B — "Pacing Bars" / "Competitor match":** per-activity progress bar with a pro-rated "expected by now" pacing tick; second dimension is YTD Expected / pace. Citation set to the Market Research file's Visual Option 1 budget-pacing source (Adpulse — How is Budget Pacing calculated?).
- **C — "Pace Variance" / "Maximum freedom":** diverging variance-around-zero chart (YTD Paid − YTD Expected). Purpose-driven, no direct citation — `il`/`iu` removed.
Re-synced the identical block into the `mock-data.master.js` mirror. Same class of fix already applied to W06's `options[6]`.

### Fix 2 (was MEDIUM) — Option C "Data Table" was a dead control at Small
In `WRENDER[4]` Option C, the `sz==='s'` reduced-summary early return fired **before** the `view==='table'` check, so toggling Option C to Data Table did nothing at Small (the still-visible menu item was dead). Reordered the branch so `view==='table'` is checked first (its existing `sz==='l'||sz==='x'?tblScroll:tbl` fallback already renders a compact table at Small), and the documented reduced-summary variant now returns only for the default (non-table) view. Same fix pattern already used on W06 Option C and W10 Options B/C. Option C's documented reduced-Small-summary behaviour is preserved for the default view; the table view is now reachable at every size. A and B were already correct.

### Verification
- Diff-confirmed only `MOCK_DATA.options[4]` (three entries) and `WRENDER[4]`'s Option C branch changed in the HTML; `#fc-widget-4` byte-identical to before; mirror re-synced (`options[4]` matches live). No other widget or shared function touched.
- `node --check` on the embedded master `<script>` block: passes.
- `python3 check-rules.py "Dashboard Widget Mockups.html" --widget 4`: 0 HIGH / 0 MED / 0 LOW (no automated findings).

## 2026-07-28 — Final COMPLETE, tagged v2.0, Jo design

The Final Check tab's Final build of this widget is complete and signed off by the project owner. Version badge set to v2.0 (`FC_VERSION[4]`); title badges: "Final" and "Jo design". The Final renders by default; the earlier A/B/C options (Remittance Table / Pacing Bars / Pace Variance) stay reachable from the section's design-option switch. Summary of what shipped:

**Composition (Jo's design, ported wholesale):** the Final is Jo Lopez's remittance widget carried into the Final Check tab (the additive `remF` block beside `WRENDER[4]` in `Dashboard Widget Mockups.html`; the A/B/C branches are byte-untouched). It keeps Jo's look throughout — the money-paid header, the pace badge and the goal pill; a single **receipts-through date chip as the ONLY filter** (presets Today / End of last month plus a date input that is committed by Refresh, which is the only fetch, on an ~800ms skeleton); her drill-to-payment-history modal; her empty state; and her full accessibility layer. Two views sit under a toggle. The **Table view (default)** carries the project's Version A content in Jo's style, and it is strictly tabular: columns Activity (name + a "$paid of $pledged" subtext, NO mini bar — the table is strictly a report table) | Pledge | Expected | Paid | Outstanding | % Paid (day-colour-coded), a cross-footing Total row, and the caption "Expected-to-date reflects each pledge's own term (start to end date)". The **Pacing Bars view (toggle)** carries Option B's flat-bar style: a grey track, a solid left fill, a thin dark-navy expected tick, a "$paid · $expected by now" caption, and a legend.

**Owner decisions layered on Jo's design (v2 deltas):**
- **Receipts-through model.** The only filter and the only fetch is the receipts-through date chip (presets Today / End of last month + a committed date input). There is NO month-preset Date Range dropdown and NO Activity Type dropdown; changing the date is the only thing that re-fetches (with the ~800ms skeleton), and it re-paces and re-bands every pledge.
- **Day-based colour scale** (defined below). Colour is driven by how many days ahead or behind schedule each pledge sits on its own term, not by a raw percentage threshold.
- **Detail is a single full-width panel with the Table / Pacing-bars toggle**, matching Jo's single-column xwide layout — NOT the synced two-panel Detail used on some other widgets. The 2-way toggle is visible at Detail, Table is the default, and sort still applies.
- **Sizes per General Widget Design Rules Rule 12: Glance / Explore / Detail, no Small.** Glance is the KPI card, sharing the flat fill + expected tick with the legend hidden.

**The day-based colour scale (owner decision):** per pledge, `daysAhead = (paid / total) × termDays − elapsedDays`. Bands: `>= +30` dark green "30+ days ahead"; `−30..+30` green "On track"; `−60..−30` amber "About a month behind"; `< −60` red "60+ days behind"; paid-in-full = dark green "Paid in full"; no-pledge = neutral grey "No pledge". Colour is never the only signal — a status-chip text label, the dollar values themselves, and a day count in the hover card all carry the same information. The same scale colours the bar fill, the table's % Paid cell, and the status chip; the expected tick stays navy because it encodes expectation, not status. Confirmed hexes (CSS parse): ahead #1b7a3d, on-track #2e9e4f, behind #e0952b, far-behind #c0392b, neutral `var(--wn-400)`, tick navy #1b2d57.

**Per-pledge term pacing and the multi-year demonstrator:** Expected-to-date is computed from each pledge's OWN term (`Expected = TotalPledge × daysElapsedSinceBeginDate / totalTermDays`), never a calendar-year fraction. The mock seeds six pledges anchored to a receipts-through of 2026-07-31, including a **Capital Campaign Pledge** on a genuine multi-year term (2025-07-01 to 2028-06-30, ~1,095 days): pledged $30,000, paid $11,000 (36.7%), expected $10,822 on its own term (395 days elapsed, ~36%), so it reads ON TRACK (daysAhead +6.5). On a naive calendar-2026 basis the same pledge would look roughly 78 days behind — FAR BEHIND, red — and the per-term math is exactly what corrects that misread. That is the built proof of the dev backend answer below.

**Verification:** 250-assertion per-widget Node DOM-shim driver, 0 failures (`w04f-driver.js`). It independently recomputes each pledge's Expected / pace / paid from scratch and checks the day-based `daysAhead` and every band boundary (+30 / −30 / −60); it asserts the strictly-tabular Table view (no mini bar; the "$paid of $pledged" subtext instead) with its full report columns and cross-footing Total row (pledged $81,000, expected $40,385, outstanding $45,100 across 6 activities; overall 45% of pledged; overall Behind pace); the flat-fill bar geometry (fill width = paid/total, navy tick left = expected/total) coloured by day band; the multi-year Capital Campaign banding ON TRACK on its own term while a calendar-2026 basis reads FAR BEHIND; the receipts-through commit re-fetch (skeleton, re-pace to paid $33,100 / expected $35,193 at 2026-06-30, re-band); the two-preset + Refresh popover; sortable headers including most-days-behind-first; the payment-history drill modal with a catch-up note that references the pledge's own end date; the empty state; the hover-card day count; a 24-render em-dash sweep; and the full-page click path with focus-restore. W01 / W02 / W03 Final regressions green (W02 grand total $48,252.43 unchanged); the A/B/C options still render at every size and the Dashboard tab is byte-identical before and after. Browser-faithful CSS parse check: 0 dropped rules (`w04f-cssparse.py`) — the day-band fills and the navy tick all resolve. `final-check-rules.py --widget 4`: 0 HIGH (the 8 MED are all F7 em-dash findings confined to the untouched legacy A/B/C option code and code comments; the remF Final's own em-dash sweep is clean). `FC_VERSION[4]` = 2.0. Spot values in seq order (receipts-through 2026-07-31): General Fund Apportionment exp $13,912, ~102 days behind => FAR BEHIND; District Mission Share paid in full; Clergy Pension Assessment ~47 days behind => BEHIND; Outreach and Benevolence ~44 days ahead, still outstanding => AHEAD; Capital Campaign Pledge exp $10,822, ON TRACK on its ~3-year term; Youth Ministry Fund no pledge => neutral.

**Dev backend answer (2026-07-28):** the developer confirmed the backend facts that resolve this widget's two long-standing blocking rows. Pledges DO carry their own start and end dates: table `dbo.RM_Pledge` has `BeginDate` (date NOT NULL) and `EndDate` (date NOT NULL), both required. The default term on creation is BeginDate to BeginDate + 1 year − 1 day, but the user can set any EndDate (for example a 3-year capital campaign), persisted on every save. Two supporting fields ride along: `Frequency` (payments per year: one of 2, 4, 6, 12, 24, 26, 52) and `Duration` (total payment periods in the term). The legacy pacing was wrong in two places: **(A)** the header "Percent of year completed" was hardcoded as (days since Jan 1) / 365 — a calendar-year number unrelated to any pledge term; **(B)** the YTD Expected column per row was (Annual / 12) × month-number-of-DateReceiptsThru, assuming a 12-month Jan–Dec cycle and never using BeginDate/EndDate. The correct formula for both is `Expected = Total Pledge × (days elapsed since the pledge's BeginDate) / (total pledge term in days)`. Crucially this is a CALCULATION change only: BeginDate and EndDate are ALREADY read from `dbo.RM_Pledge` in the widget's query (they sit in the WHERE clause that filters active pledges on the selected date), so no schema change and no query change are needed. The built Final already implements this per-pledge term math (the multi-year Capital Campaign demonstrator above is the proof case). This answer is carried into the Step 4 doc's Sign-off Readiness (rows 1 and 2 now Resolved) and into the widget's new Step 5 API spec, `Step 5 - API documents/Remittance Pledges/Remittance Pledges - API Spec.md`.

---

## 2026-08-08 — v2.1 pledge-drill refinement (four owner changes, additive to the working Final)

Additive iteration on the shipped Final (opt==='F', prefix remF); no rebuild. Four owner changes applied together, scoped to WRENDER[4]'s F branch, the REMF_ mock data, the remf CSS and the fc-widget-4 chrome only. A/B/C branches, other widgets and the Dashboard-tab markup untouched.

**Composition (source of each change):**
- **YTD Paid column** (owner instruction, direct): the Table view's existing paid-to-date column relabelled "YTD Paid" in its legacy position (Activity, Pledge, Expected, YTD Paid, Outstanding, % Paid). Only YTD Paid added, not a second YTD Expected; the existing figure reused, not duplicated. Grounded in the Data Contract's YTD Paid row (`SUM(RM_HistoryDetail.Amount)`, posted / non-void / `CheckDate <= asOf`).
- **Popup removed but rollback-able** (owner instruction, direct): activity click no longer opens the payment-history modal. Gated behind a new constant `REMF_USE_POPUP` (default false); `remFDetailModalHTML` / `remFRenderModal` kept intact, so flipping the flag to true restores the old popup on activity click.
- **Inline paginated pledge drill** (owner instruction + Step 5 grounding): with the popup off, an activity click toggles an inline pledge table (dropdown) for that activity. Columns: Church/donor name, Begin date, End date, Goal, Paid, Outstanding, paired-text pacing status. Collapsed by default, expand/collapse per activity, rotating-caret affordance. Default sort most behind pace first (`shortfall = expectedByNow - paid`, descending) so later pages are progressively healthier. Real pagination, 20 per page (`REMF_PAGE_SIZE`), numbered pager. Appears in the Table view when an activity is expanded (and under a bar in the Pacing bars view, for consistency).
- **Aggregate reconciliation** (owner instruction): activity Paid and Outstanding stay aggregates over that activity's pledges. Each activity's pledge set is generated deterministically (a mulberry32 seeded PRNG, memoised on the activity as `_pledges`) so pledge goals sum EXACTLY to the activity Pledge total (largest-remainder allocation) and pledge paids sum EXACTLY to the activity's YTD Paid at the mock anchor. So activity Paid = sum of pledges' Paid and activity Outstanding = sum of pledges' Outstanding.

**Pledge-drill data model.** The widget is pledge-driven: an activity is a display bucket, its Paid/Outstanding are aggregates, and it can carry hundreds of pledges (Step 5 cites 500 to 800), so the drill paginates and never dumps all. Each pledge carries its OWN term and goal and belongs to a church/donor (goal = `RM_PledgeDetail.Pledge`; term = `RM_Pledge.BeginDate`/`EndDate`; owner = `RM_Pledge.ChurchID`). Per-pledge expected-by-now is derived from that pledge's own dates: `expectedByNow = goal * clamp(asOf - begin, 0, termDays) / termDays`, with `asOf` = the receipts-through date. The status ("behind" / "on track" and so on) is a design-only pacing signal (no backing column), computed at render time and paired with text (never colour alone). Church/donor names come from a shared 44-name pool and may repeat across activities, but each activity's pledge SET is unique data. The mock seeds about 60 to 72 pledges per single-year activity (three or more pages); the no-pledge activity (Youth Ministry Fund) instead seeds a few goal-0 gift rows summing to its stray receipts, so it still reconciles.

**Verification (Phase 3).** 53-assertion Node DOM-shim driver (`w04_driver.scratch.js`), 0 failures: renders at Glance/Explore/Detail; YTD Paid header present, positioned after Expected and before Outstanding, with no second YTD column; `REMF_USE_POPUP === false` and the modal code still present (rollback-able); a real delegated activity-click expands rather than opening the modal (`REMF_MODAL` stays null), and a second click collapses; the inline pledge table exposes all seven columns; pledges sorted by shortfall descending with the first row the largest shortfall; page 1 shows exactly 20 rows, a Page 2 button exists, and page 2's max shortfall <= page 1's min shortfall (later pages healthier); every pledge carries its own begin/end/goal with varied terms; for every activity the pledge goals sum to the activity Pledge total and pledge paids sum to the activity YTD Paid (and outstanding to activity Outstanding); the Pacing bars view and a receipts-through date change both alter the render; the empty state renders clean at Explore and Glance; and an em-dash sweep across state x size x view of the F output is clean. `final-check-rules.py --widget 4 --step4 <doc>`: 0 HIGH (the two prior HIGH F9 were the gate misreading the two Sign-off rows literally marked "~~Yes~~ Resolved"; those cells were normalised to "Resolved (previously blocking)" so the gate now reads them correctly). Remaining MED are pre-existing and out of scope: F3 names the v1 superseded views (Paired Bars / Summary Table), and F7 em dashes are all in the untouched A/B/C option code and historical Logic notes; the remF v2.1 additions are em-dash clean. `FC_VERSION[4]` = 2.1. Data lives in standalone `REMF_`/`remF` constants next to `WRENDER[4]`, not `MOCK_DATA`, so `mock-data.master.js` needs no re-sync.

**Flags.** Rollback flag: `REMF_USE_POPUP` (default false). Church/donor names: a shared 44-entry `REMF_CHURCHES` pool, repeated across activities, each pledge assigned by the seeded PRNG. Per-pledge expected basis: each pledge's OWN begin-to-end term (not the activity's, not calendar year). One mock simplification worth an eyeball: pledge paids are anchored to the activity's YTD Paid at the default receipts-through (REMF_TODAY 2026-07-31), so reconciliation is exact at the default state (what the driver checks); when the receipts-through date is changed, the activity's date-filtered header/table Paid re-computes but the inline pledge paids stay at their anchored values, so the inline drill reads as a current-state snapshot rather than re-deriving per date. Visual spacing/hover feel of the inline table and pager was not machine-verified (flag for a browser eyeball).

---

## 2026-08-08 — v2.2 Name column + Pacing Bars drill removal (two owner changes, additive to the working Final)

Small additive iteration on the shipped Final (opt==='F', prefix remF); no rebuild. Two owner changes (2026-08-08), scoped to WRENDER[4]'s F branch, the REMF_ mock data, the remf CSS and the fc-widget-4 chrome only. A/B/C branches, other widgets and the Dashboard-tab markup untouched.

**Composition (source of each change):**
- **Pledge name column renamed to "Name"** (owner instruction, direct, grounded in the legacy screen): the inline pledge table's first column heading changed from "Church / donor" to "Name", matching the legacy Remittance Pledges screen, which labels this column "Name" with data `CorePerson.DisplayNameLastFirst`. The names are PERSON names in "Last, First" form (each remittance church is a CorePerson record), so the seeded pool `REMF_CHURCHES` was replaced with 44 realistic person-style "Last, First" names (for example "Whitfield, Dana", "Bell, Marcus", "O'Neill, Brendan"). Only the heading text and the name values changed; the other columns (Begin, End, Goal, Paid, Outstanding, status) are unchanged. Names still come from a shared pool and may repeat across activities, while each activity's pledge SET stays its own unique seeded data (the deterministic mulberry32 PRNG is unchanged, so reconciliation still holds by construction). The constant name `REMF_CHURCHES` was kept (three references) to minimise churn; its contents and a clarifying comment were updated.
- **Inline pledge drill made Table-view only** (owner instruction, direct): the Pacing Bars view is a quick at-a-glance overview, so its activity rows must not be clickable-to-expand and must not show an expand caret or open the inline pledge table. `remFBars` now emits a plain, non-interactive row (no `data-remf="open"`, no `role="button"`, no `tabindex`, no `aria-expanded`, no caret, and no `remFPledgePanel` append), and its `.rem-barrow` CSS lost `cursor:pointer` and the hover/focus-visible affordances. Because `remFBars` no longer reads `w.expanded`, a row expanded on the Table view shows no pledge panel after switching to Pacing Bars. The Table view (`remFRow`/`remFTable`) keeps the caret, expand, and 20-per-page pagination exactly as in v2.1. The bars, status chips and receipts-through chip on the Pacing Bars view are otherwise unchanged.

**Verification (Phase 3).** 64-assertion Node DOM-shim driver (`w04_driver.scratch.js`), 0 failures. New v2.2 assertions on top of the v2.1 set: the inline pledge table's name column header is "Name" and contains neither "Church" nor "donor"; every seeded name matches the "Last, First" (comma-space) form and a rendered pledge name cell shows such a name; the Table view keeps a caret and `data-remf="open"` and its expand still injects the paginated pledge panel (pager present); the Pacing Bars view render carries no `rem-caret`, no `data-remf="open"`, and no `rem-pledge-panel`, while still rendering `rem-barrow`, `remf-chip` and the "expected by now" caption; and switching Table->expand->Pacing Bars renders no pledge panel (and no caret) even with rows marked expanded. All prior v2.1 assertions (YTD Paid column and position, popup-removed-but-flagged, shortfall-descending sort, 20/page pagination, aggregate reconciliation, sizes/views/states/empty, em-dash sweep) stay green. `final-check-rules.py --widget 4 --step4 <doc>`: 0 HIGH, 10 MED, 1 INFO (F2 all script blocks pass `node --check`). The 10 MED are pre-existing and out of scope: F3 names the v1 superseded views (Paired Bars / Summary Table, heuristic name-match against the doc), and the F7 em-dash hits are all inside the untouched A/B/C option code and dated historical Logic notes; the remF v2.2 additions are em-dash clean. `FC_VERSION[4]` bumped to 2.2. Data lives in standalone `REMF_`/`remF` constants next to `WRENDER[4]`, not `MOCK_DATA`, so `mock-data.master.js` needs no re-sync.

**Flags.** Nothing needing an owner decision. Visual spacing/hover feel of the now non-interactive Pacing Bars rows was not machine-verified (flag for a browser eyeball to confirm the rows no longer read as clickable). The v2.1 mock caveat still stands (inline pledge paids are anchored to the activity's YTD Paid at the default receipts-through date). A/B/C branches and all other widgets confirmed untouched (diff scoped to the CSS `.rem-barrow` rule, the fc-widget-4 chrome note, the remFBars render, the v2.x code comment, `REMF_CHURCHES`, the pledge-table header, and `FC_VERSION[4]`).

---

## 2026-08-08 — v2.3 Pacing Bars popup: top 5 pledges most behind (one owner change, additive to the working Final)

Small additive iteration on the shipped Final (opt==='F', prefix remF); no rebuild. One owner change (2026-08-08), scoped to WRENDER[4]'s F branch, the remf CSS and the fc-widget-4 chrome only. A/B/C branches, other widgets and the Dashboard-tab markup untouched. No REMF_ mock data changed (the popup reuses the existing seeded per-pledge data).

**Composition (source of the change):**
- **Pacing Bars rows clickable again, opening a popup** (owner instruction, direct, 2026-08-08): supersedes v2.2's "Pacing Bars is a non-interactive overview". `remFBars` rows regained `data-remf="baropen"`, `role="button"`, `tabindex="0"` and `aria-haspopup="dialog"`, plus a subtle `open_in_full` affordance icon and a `.rem-barrow-click` CSS rule (cursor, hover tint, focus-visible outline). Clicking a row (or Enter/Space) opens a modal built on the shell's existing modal pattern (the same `.remf-mb` overlay and `remFRenderModal` mount used by the old popup); the Table view's inline paginated pledge drill (`data-remf="open"`) is deliberately left alone, so the two drills use two distinct actions.
- **Popup TOP = activity summary** (owner instruction): the same figures the old popup showed, in the owner's stated order: Total pledge, YTD Paid, Expected by now, Outstanding, % Paid, and the pacing-status chip, plus the pledge-term line. New function `remFBehindModalHTML` renders it with the existing `.rem-sum` grid.
- **Popup LOWER = top 5 pledges most behind** (owner instruction, replacing the receipts/last-payment list): the activity's pledges are sorted most-behind-first via the existing `remFPledgeRows` (shortfall = expectedByNow - paid, using each pledge's own start-to-end term, descending), then filtered to those actually behind (shortfall > 0) and capped at the top 5. No pager. Each row reuses the Table drill's `remFPledgeHead`/`remFPledgeRowHTML` markup, so columns are identical: Name (CorePerson Last,First), Begin date, End date, Goal, Paid, Outstanding, paired-text status. Heading "Most behind pledges" with a note: 5+ behind reads "Showing the 5 furthest behind of N pledges behind pace"; 1 to 4 behind reads "Showing all N pledge(s) behind pace" and shows only those; none behind shows a clean "No pledges are behind pace" message with a check_circle icon and zero rows.
- **Receipts content removed from this popup but preserved and rollback-able** (owner instruction + project rule against deleting rejected/superseded ideas): `remFDetailModalHTML` (the receipts / payment-history popup, with its "Receipts on or before" list, totals row and Export button) is untouched. `remFRenderModal` now branches on `REMF_MODAL.mode`: `'history'` renders the preserved receipts popup, anything else (the Pacing Bars click sets `mode:'behind'`) renders the new top-5 popup. The receipts popup is reachable only via the Table-view activity click while `REMF_USE_POPUP` is true (still default false), so it stays fully rollback-able.

**Verification (Phase 3).** 79-assertion Node DOM-shim driver (`w04_driver.scratch.js`), 0 failures. New v2.3 assertions on top of the retained v2.1/v2.2 set: Pacing Bars rows expose `data-remf="baropen"` + `aria-haspopup="dialog"` + `role="button"` and carry no inline-drill caret and no `data-remf="open"`; firing a real delegated Pacing Bars click through `remFOnClick` mounts a `role="dialog"` modal headed "Most behind pledges"; the popup TOP renders all five summary labels plus the status chip; the popup lower section contains NO receipts markers (`rem-ph-tbl`, "Receipts on or before", `rem-ph-total`) and NO pager (`rem-pl-pager`, `data-remf="ppage"`); for EVERY activity the popup shows exactly min(5, behindCount) pledge rows, the first rendered row is the largest-shortfall pledge, all shown rows have shortfall > 0, names render in Last,First form, and the note text matches the computed behind count (coverage confirmed for all three branches: exactly-5, fewer-than-5, and none-behind); the whole-activity pledge list is shortfall-descending; the Table view still injects the inline paginated pledge panel with a caret and `data-remf="open"` (drill unchanged); `remFDetailModalHTML` still contains its receipts-list code and `remFRenderModal` still branches by mode (rollback intact); aggregate reconciliation, sizes/views/states/empty all stay green; and the em-dash sweep now also covers the popup HTML for every activity (0 hits). `final-check-rules.py --widget 4 --step4 <doc>`: 0 HIGH, 10 MED, 1 INFO (F2 all script blocks pass `node --check`), identical to the pre-edit baseline. The 10 MED are pre-existing and out of scope: F3 names the v1 superseded views (Paired Bars / Summary Table), and the F7 em-dash hits are all inside the untouched A/B/C option code and dated historical Logic notes; the remF v2.3 additions are em-dash clean. `FC_VERSION[4]` bumped to 2.3. No `MOCK_DATA` touched, so `mock-data.master.js` needs no re-sync.

**Flags.**
- **How "behind" is computed for the top 5:** per pledge, on its OWN start-to-end term, shortfall = expectedByNow - paid where expectedByNow = goal * clamp(receipts-through - begin, 0, termDays) / termDays; sort by shortfall descending; a pledge counts as behind when shortfall > 0. The top-5 list is the first 5 of the behind-only subset (already the 5 furthest behind, because the full list is shortfall-descending).
- **Fewer-than-5 handling:** if fewer than 5 pledges are behind, only those are shown and the note says how many ("Showing all N pledge(s) behind pace"); if none are behind, the section shows a clean message and no rows (this is the case for the no-pledge Youth Ministry Fund and for any fully-caught-up activity).
- **Rollback flag for the old receipts content:** unchanged `REMF_USE_POPUP` (default false) plus the new `mode:'history'` branch in `remFRenderModal`; flipping `REMF_USE_POPUP` to true restores the receipts popup on the Table-view activity click, exactly as before. `remFDetailModalHTML` was not modified.
- **Browser eyeball:** popup overlay position/scroll on small viewports, the hover/focus affordance on the Pacing Bars rows, and the visual density of the 5-row table inside the modal were not machine-verified.
- **Untouched:** A/B/C branches and all WRENDER anchors confirmed byte-identical by diff; other widgets untouched; the Table drill, Table/Pacing-bars toggle, receipts-through chip and YTD Paid column unchanged.

---

## 2026-08-08 — v2.4 Receipts window: single cutoff to date range, behaviour (a) (one owner change, additive to the working Final)

Small additive iteration on the shipped Final (opt==='F', prefix remF); no rebuild. One owner change (2026-08-08), scoped to WRENDER[4]'s F branch, the remf CSS and the fc-widget-4 chrome only. A/B/C branches, other widgets and the Dashboard-tab markup untouched. No REMF_ mock data changed (the mock "today" anchor stays REMF_TODAY = 2026-07-31, so every carefully-tuned day-band pledge stays valid).

**Composition (source of the change):**
- **Single "Receipts through [date]" cutoff replaced by a DATE RANGE** (owner instruction, direct, 2026-08-08): supersedes the v2/v2.3 single-cutoff filter. The owner chose behaviour (a): the range END is the pacing cutoff (pacing stays cumulative to it) and the START frames the window (and is reserved to scope a receipts list; this build shows no receipts list, so START currently only drives the chip label).
- **Three popover options, no Refresh** (owner instruction): the popover now offers exactly **This year** (default), **Last 30 days** and **Custom**, and the Refresh button is removed. This year = 1 January of the end's calendar year to today (calendar year to date, never called fiscal). Last 30 days = today minus 30 days to today. Custom reveals inline From/To date fields (the same reveal pattern as W01 `bgtF` and W03 `prF`) and applies when a field changes. The old Today / End of last month presets and the single "choose a date" input plus Refresh are gone. Presets apply on click (This year and Last 30 days both end today); Custom applies on the date fields changing, read from the DOM at change time, with the popover kept open and the caret restored via the existing `REMF_FOCUS_ID` focus/focusout bookkeeping (`remFSyncPop`) so typing never drops focus.
- **Chip wording** (owner instruction): the filter chip now reads **"Receipts from [start] to [end]"** with both dates formatted concisely (a shared year is printed once, e.g. "Receipts from Jan 1 to Jul 31, 2026"; a cross-year window prints both years, e.g. "Receipts from Dec 1, 2025 to Jul 31, 2026"), replacing the old "Receipts through [date]" text.
- **Behaviour (a) wiring** (owner instruction): `REMF_STATE` gains `range` (default `'year'`), `rStart`, `rEnd`. New `remFRangeBounds(w)` derives `{start,end}` for the active option; `remFThru(w)` now returns that **end**, so every pacing formula is UNCHANGED, just driven by end: Expected paced to end, Paid = receipts with check date on or before end (`remFPaid`), Outstanding, % Paid, and the per-pledge shortfall used by the Table drill and the Pacing Bars top-5-behind popup. New `remFRangeStart(w)` and `remFRangePhrase(w)` support the chip. The old `remFCommitThru` is replaced by `remFSetRange` (preset, applies immediately) and `remFSetCustomDate` (Custom From/To). Because This year and Last 30 days both end today, their **headline pacing numbers are identical by design** (the owner's decision), differing only in the displayed window.

**Verification (Phase 3).** 94-assertion Node DOM-shim driver (`w04_driver.scratch.js`), 0 failures. New v2.4 assertions on top of the retained v2.1/v2.2/v2.3 set: default `range` is `year`; This year bounds = Jan 1 of the end's year to today and `remFThru` returns that end / `remFRangeStart` returns that start; the popover shows exactly three `set-range` options (This year default-selected, Last 30 days, Custom), no Refresh button (`refresh` absent), no old `remfq` single-date input, and no Today / End of last month presets, and This year does not reveal From/To; selecting This year sets start=Jan 1 of end year and end=today; selecting Last 30 days sets start=end-30 and end=today; selecting Custom reveals the From/To fields (data-which start/end) and using them sets the entered dates and drives `remFThru`; the chip reads "Receipts from Jan 1 to Jul 31, 2026" (concise, shared year once) and the cross-year form prints both years, and never says "Receipts through"; pacing is computed against end (This year and Last 30 days give identical paid/expected/outstanding/iso since both end today, while an earlier Custom end re-computes and drops paid); the per-pledge shortfall (Table drill + top-5 anchor) responds to the range end; and no Refresh element exists anywhere across sizes/views/popover. The carried-over checks all stay green (YTD Paid column and position, rollback of the receipts popup behind `REMF_USE_POPUP` + `remFRenderModal` mode branch, Table-view inline paginated drill, Pacing Bars top-5-most-behind popup for every activity, aggregate reconciliation, view toggle, empty state, all three sizes) and the em-dash sweep now also covers all three ranges of the chip and popover (0 hits). `final-check-rules.py --widget 4 --step4 <doc>`: 0 HIGH, 10 MED, 1 INFO (F2 all script blocks pass `node --check`), identical to the pre-edit baseline. The 10 MED are pre-existing and out of scope (F3 names the v1 superseded views Paired Bars / Summary Table; the F7 em-dash hits are all inside the untouched A/B/C option code and dated historical Logic notes). `FC_VERSION[4]` bumped to 2.4. No `MOCK_DATA` touched, so `mock-data.master.js` needs no re-sync.

**Flags.**
- **Known consequence (expected, per owner):** This year and Last 30 days share identical headline pacing numbers because both end on today; they differ only in the displayed window (and, when a receipts list is later added, in what START scopes).
- **START is reserved:** with no visible receipts list in this build, the range START currently only drives the chip label. It is stored (`rStart` / `remFRangeStart`) and ready to scope a receipts list when one is added.
- **Browser eyeball:** the From/To two-field layout inside the popover (spacing, the native date-picker widgets side by side), the caret-retention while typing a Custom date, and the ~800ms skeleton on a range change were not machine-verified.
- **Untouched:** A/B/C branches and other widgets confirmed unchanged by diff (changes limited to the remf CSS block, the remF JS region, the fc-widget-4 Purpose + Logic note, and FC_VERSION[4]); the Table drill, Pacing Bars top-5 popup, Table/Pacing-bars toggle, YTD Paid column, Glance/Explore/Detail sizes, states, person Last,First names and the `REMF_USE_POPUP` rollback flag all keep working.
