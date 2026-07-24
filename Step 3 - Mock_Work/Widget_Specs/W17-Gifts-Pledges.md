# W17 — Gifts & Pledges

**Module:** Finance  
**Status:** 🔵 Improvement needed  
**Research doc:** [17 - Gifts Pledges.md](../../Step 1 - Dashboard Research/17 - Gifts Pledges.md)
**General rules:** [General Widget Design Rules.md](General%20Widget%20Design%20Rules.md)

## Purpose
Tracks gift and pledge campaigns — showing how much has been given, how much is still outstanding, and overall campaign progress. Helps leadership and fundraising staff monitor giving health across active campaigns.

---

## Purpose & Competitive Fit Check (Phase 1)
**Industry standard:** same pattern as W04 — "Pledge vs Received," pledge fulfillment rate, and progress-bar/pie/table visuals are the established nonprofit fundraising pattern ([Fanruan](https://www.fanruan.com/en/blog/fundraising-dashboard), [DonorSearch](https://www.donorsearch.net/resources/dashboards-chart-progress-measure-performance-on-one-screen/)). Nonprofit fundraising dashboards commonly track a **campaign goal** explicitly, distinct from pledge totals — which is exactly the gap the new `campaign-giving-tracker` Phase 2 API widget closes (see the Related New Widgets section below): it has a real Goal field this widget currently lacks entirely.

**Fit-check:** Option A (Campaign Progress Bars) is the closest match to the single most common visualisation for this exact metric across the fundraising-dashboard sources. Option B (Donut by Campaign) and Option C (Summary Table) are both standard companions. This widget is well-aligned already; the bigger opportunity competitor research surfaces isn't the chart type, it's the missing Goal/Spent dimensions that `campaign-giving-tracker` already models — worth folding into scope discussions before Phase 2 locks the final design, not after.

---

## Terminology note
Old design's real data (`GFPledge`) groups by **Pledge Purpose**, not "Campaign" — but in practice a purpose is usually named exactly like a campaign (Building Fund, Youth Ministry, etc.), so "Campaign" is kept here as the friendlier UI label for the same underlying grouping. Values are dynamic, sourced from real `GFPledge` records — the specific names above are illustrative examples, not a fixed list. This is the mirror image of the mix-up found in W04, where "Campaign" values had been borrowed from this widget by mistake — confirming those values genuinely belong here.

Similarly, **"Goal" is renamed to Pledge Total** (matching the real field) and **"Outstanding" maps to Due Remaining** (see Date Range note below) — old design has no separate fundraising "Goal" distinct from the pledge amount itself.

## Filter Options
| Filter | Values |
|--------|--------|
| Campaign (Pledge Purpose) | All Campaigns · dynamic list from `GFPledge` |
| Date Range | Current Month · Year to Date · Campaign Total — **confirmed as the primary filter**, replacing old design's single "Date Gifts Thru" date picker |

**Fiscal Year filter — dropped, flagged as a question for the dev team** (same resolution as W05/W10): old design has no fiscal-year dimension for this widget either.

**Open question flagged for product/dev — Date Range vs. schedule-aware math:** old design's Pledge Due and % Due columns depend on a specific as-of date (Pledge Due = pro-rated amount expected by that date; % Due = how much of that is still outstanding, can go negative if ahead of schedule). Switching to period presets means this math needs to be redefined:
- **Campaign Total:** straightforward — Pledge Total vs Received vs Due Remaining (= Total − Received), no time-proration.
- **Current Month / Year to Date:** Pledge Due would need to be recalculated as of the *end* of the selected period (e.g. YTD → due as of today; Current Month → due as of today within the month), similar to the "% of year completed" logic used in W04 Remittance Pledges. **This isn't fully specified — flag for product/dev before build**, since it directly affects what the numbers mean, not just their display.

**KPI size (3-dot menu):** Date Range only, no Campaign filter at this size.

## Data Table Sort
Fixed — Campaign (Pledge Purpose) name, alphabetical. Not user-changeable.

## Drill-Through
No drill-through — matches old design (confirmed no drill-down or navigation away). Flag if a link (e.g. to the Donors and Gifts module) is wanted later — not requested this session.

## Refresh
Standalone icon on the card (not a 3-dot menu item), present at every size including KPI.

## Related New Widgets (Phase 2 API, no legacy equivalent) — informational, from `Widget_Comparison_New_Widgets.html`

**Important terminology update — may resolve the "Campaign" naming workaround above.** The Modern API introduces a genuine `[GF_Campaign]` table via the new **`campaign-giving-tracker`** widget — this is a real Campaign entity, not the Pledge-Purpose-as-proxy approach this widget's terminology note describes for legacy. Worth revisiting whether W17 should move to using real Campaign data now that it exists, rather than continuing to borrow Pledge Purpose as a "friendlier UI label."
- **Endpoint:** `GET /api/dashboard/campaign-giving-tracker?includeDesignatedFunds={bool}&includeClosedWithBalance={bool}`
- **Shape:** `{Campaigns:[{CampaignId,Name,EndDate,Goal,HasGoal,TotalRaised,TotalSpent,RemainingBalance,ProgressPercent,ProgressStatus,IsClosed}], DesignatedFunds[]}`
- **Logic:** Raised = `SUM(GF_HistoryDetail.Amount)` for posted, non-voided gifts by CampaignID; Spent = `SUM(AP_InvoiceDetail.Amount − Discount)` by CampaignID — **this widget tracks spending against a campaign, which W17 does not do at all today** (W17 only tracks Pledge Total vs Received)
- **Status logic:** blue (<75% of goal), amber (≥75%), red (goal met), or closed-with-balance-remaining
- This genuinely has a real **Goal** field (`HasGoal`/`Goal`) — unlike W17, where the terminology note explicitly says old design has no separate fundraising "Goal" distinct from the pledge amount. **This may resolve that gap too.**

A second related widget, **`giving-trend`**, tracks overall giving (not per-campaign) month over month:
- **Endpoint:** `GET /api/dashboard/giving-trend`
- **Shape:** `{YtdTotal, PriorYearYtdTotal, YtdChangePercent, TwelveMonthAverage, TwelveMonthTotal, VarianceVsPriorYear, Months:[12 x {Year,Month,MonthLabel,Amount,PriorYearAmount,IsBelowAverage}]}`
- Not campaign-specific — this is an organisation-wide trend view, more a complement to W17 than a replacement

**Not yet covered:** filters, sizes, and chart/table options for either widget are not specced — starting point only. Given how directly `campaign-giving-tracker` overlaps with W17's stated purpose and unresolved Campaign/Goal terminology questions, this is a strong candidate to revisit before finalizing W17's build.

---

## Option A — Campaign Progress Bars *(Keep/Refresh)*

**Chart:** Horizontal progress bar per campaign — gifts received vs Pledge Total  
**Views available:** Bar (default) · Pie · Table  
**Improvement note:** Progress bar immediately communicates how close each campaign is to its Pledge Total.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 2 campaigns, % only |
| **Medium (2×2)** | 4 campaigns, received/Pledge Total values |
| **Large (4×4)** | All campaigns, full values, % labels, table toggle (fixed sort: Campaign name, alphabetical) |
| **KPI (1×0.5)** | Headline: **campaign furthest behind its pledge pace** (lowest % Due, e.g. "Missions: 58%"). No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option B — Donut by Campaign *(Improve)*

**Chart:** Donut showing proportion of total giving per campaign  
**Views available:** Donut (default) · Table  
**Improvement note:** Useful for showing which campaign is driving the most giving.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Donut only |
| **Medium (2×2)** | Donut + legend |
| **Large (4×4)** | Donut + legend + total giving figure + table toggle (fixed sort: Campaign name, alphabetical) |
| **KPI (1×0.5)** | Headline: **Total Giving Received**, across all campaigns for the selected Date Range. No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Option C — Summary Table *(Keep/Refresh)*

**Chart:** Table — Campaign · Pledge Total · Received · Due Remaining · % Due  
**Views available:** Table (default) · Cards  
**Improvement note:** Full detail for leadership reporting and stewardship reviews. Closest to old design's actual table.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | 3 rows (fixed sort: Campaign name, alphabetical), rows scroll internally, header fixed |
| **Medium (2×2)** | 5 rows, same sort/scroll pattern |
| **Large (4×4)** | All campaigns + totals row, same sort/scroll pattern |
| **KPI (1×0.5)** | Headline: **overall % Due** (Received ÷ Due, across all campaigns) — or Total Due Remaining ($), whichever tests better. No download, no switch. |
| **Expanded** | Same as Large, all filters live inside the modal |

---

## Fine-Tuning Notes
- Campaigns exceeding their Pledge Total should be shown in green with a "✓ Goal Met" badge
- Due Remaining amounts should be in amber/red (can be negative if ahead of schedule — see Date Range note above)
- Campaign filter should highlight the selected campaign across all views

---

## 2026-07-23 — Create Mock Designs run (fragment/assembler flow): 3 options rebuilt

Built with the revised Create pipeline (isolated fragment files + `assemble-mock-widget.py`). Real `series[17]` is a per-campaign list `items:[{l,p,r,c}]` (l=campaign, p=pledged, r=received, c=health colour). Prior entries above unchanged.

### Option A — Campaign Progress *(Keep/Refresh — Restyled Original)*
A progress bar per campaign showing received as a share of pledged (% funded), colour-coded; Pie and Table views alternate. Legacy giving-progress view restyled.

### Option B — Pledged vs Received *(Improve — Competitor Match)*
Paired bars per campaign — pledged next to received — making the shortfall visible side by side; Table view alternate. Rule 10 second dimension: both the pledged goal and received amount together (not just the percentage). Small-size view toggle fixed (Table reachable at every size).

### Option C — Fundraising Gap *(Redesign — Maximum Freedom)*
Reframes the widget around what's left to raise: the outstanding **gap (pledged − received)** per campaign, sorted largest-gap-first so the campaigns furthest from goal lead; Table view adds pledged / received / gap / % funded. Rule 10 second dimension: the **dollar gap to goal**, a lens neither the progress nor paired views rank on. (T5: gap-bar length = the gap the label shows.)

### Rules 8/9
Per-option filter scoping via `fk=wid+'-'+opt` (Campaign and Date Range filters read via `fv(fk,…)`); shared branches extended to include `wid===17` (4/5/6/9/10/11/13/15/16 intact). KPI = overall % Due (received of pledged, fixed). KPI/Medium/Large render for all three; **Small retained for all three**; each option's view toggle checks `view` before the size default (no dead control); KPI size button added to all cards.

### Rule 11 — data caveats (documented here, not shown on-screen)
The Date Range filter applies a multiplier to pledged/received figures in the mock data (an illustrative device, not real period math); the received/pledged ratio stands in for "% Due" as there's no separate Due field. Confirm real period-scoped figures and a true Due field at finalisation. Not surfaced on the mockup.

### Where written
`Dashboard Widget Mockups.html` — `WRENDER[17]` (scaffold + 3 branches), `MOCK_DATA.options[17]`, the three `opt-17-*` cards, shared filter branches. `mock-data.master.js` re-synced for `options[17]` (`series[17]` unchanged). Final Check tab `#fc-widget-17` not edited (known shared-render carryover). Built via `_build/W17/` fragments + `assemble-mock-widget.py`.
