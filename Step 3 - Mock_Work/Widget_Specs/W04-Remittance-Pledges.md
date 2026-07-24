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
