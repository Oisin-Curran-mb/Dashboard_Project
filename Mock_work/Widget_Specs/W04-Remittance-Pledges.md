# W04 — Remittance Pledges

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [04 - Remittance Pledges.md](../../Dashboard Research/04 - Remittance Pledges.md)

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
