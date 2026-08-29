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

---

## 2026-08-19 — FINAL built into Final Check (opt 'F', gpF), goal-focused pivot

Built the first Final version of W17 into `Dashboard Widget Mockups.html`'s Final Check tab as a new `opt==='F'` branch in `WRENDER[17]` (prefix `gpF`), tagged `FC_VERSION[17]='1.0'`. Composed with the project owner from the confirmed sheet below. Owner directives this session: focus on goals (adopt the modern campaign Goal model), keep the live product's exact table columns, and add a Remittance-style per-donor breakdown; date control = W04-style range.

**Two build-blockers cleared (owner-accepted, 2026-08-19):**
- Sign-off Readiness #2 (% Due definition conflict): RESOLVED by ground truth. The live product screenshot and the legacy code agree that Percent Due = Due Remaining / Pledge Due ("percent still outstanding"): 2020 Pledge 904/1000 = 90.40%, Stoke Sell -655/1200 = -54.58%. The Step 1 definition is correct; the Step 3 "Received / Due" KPI wording was wrong.
- Sign-off Readiness #1 (preset math for Current Month / YTD): dissolved by the goal-model pivot. Goal figures are server-defined in the modern campaign-giving-tracker DTO; the baseline table uses the live product's columns computed exactly as the code does (Pledge Due = per-pledge frequency proration, Received = gifts on/before the range end). No undefined preset math remains.

**Confirmed composition sheet (source per component):**
- Date-range filter (This year default / Last 30 days / Custom From-To, no Refresh, chip "Gifts from X to Y", END = as-of cutoff): from W04 remF v2.4.
- Per-pledge term pacing (own begin/end term, full once past end date): from W04 remF.
- Inline paginated per-donor breakdown drill (most-behind first, 20/page): from W04 remF v2.1.
- Top-5 most-behind popup off the goal bars: from W04 remF v2.3.
- Paired-text pacing status, person "Last, First" names: from W04 remF v2.2.
- Rule-12 sizing (Glance/Explore/Detail): mirrored from W10/W04 Final mechanism.
- Glance goal KPI, per-campaign goal bars, Detail goal panel, status colours (blue<75 / amber>=75 / green>=100 "Goal Met"): NEW for W17.
- Baseline Summary Table (Purpose (Campaign), Pledge Total, Pledge Due, Received, Due Remaining, Percent Due + totals row summing first four): NEW, live-product columns.
- Donut by Campaign view, over-received parenthesised green: NEW.

**Goal field:** modern campaign Goal is mocked per Rule 11 (rendered as if real). It is NOT in the legacy GF_Purpose/GF_Pledge data; it comes from the Phase 2 campaign-giving-tracker API (Goal/HasGoal/ProgressPercent/RemainingBalance/IsClosed). Caveat carried here and in the fc chrome.

**Data:** standalone constants GPF_CAMPAIGNS / GPF_DONORS near WRENDER[17], not MOCK_DATA entries, so mock-data.master.js needs no re-sync. Two campaigns seeded to match the live product exactly (FRNKSTOK Stoke Sell; 2020PLED 2020 Pledge).

**Verification:** final-check-rules.py --widget 17 = 2 HIGH (the owner-waived doc rows only), F2 node --check all pass, F7 em-dash clean in the F branch and fc-widget-17 chrome. DOM-shim driver (outputs/_w17_driver.js): 69 assertions, 0 failures, covering Glance/Explore/Detail non-empty, the two exact campaigns and totals, all 6 campaign filters, all date-range presets, all 3 views at Explore and Detail, empty state at every size, most-behind popup, pagination + exact per-campaign reconciliation, and an em-dash sweep across 316 outputs.

**Left for an eyeball (not machine-verified):** Detail two-column layout (table + goal panel), the donut, and goal-bar colours in the browser.

### 2026-08-19 — math correction: Pledge Due now matches the GF code (installment based)

Owner flagged the design math as not fully correct. The first build reused Remittance Pledges' linear day-fraction pacing (`pl.pledge * elapsed / termDays`) for Pledge Due. That is not how Gifts & Pledges computes it. Corrected the gpF branch to follow the legacy `GFPledge.PledgeDue(beginningOfCycle=true, dateThru)`:
- full pledge once the as-of date is at or past the pledge end date;
- otherwise per-installment amount (Pledge / installment count) times the number of frequency cycles elapsed from BeginDate, plus one for beginning-of-cycle, capped at the installment count (full pledge if the cap is reached).

Added a `gpFCycles(begin, asOf, freq)` helper mirroring the GF frequency switch (1 annual, 2 biennial, 4 quarterly, 6 bi-monthly, 12 monthly, 24 semi-monthly, 26 biweekly, 52 weekly), and seeded each donor pledge with a `freq` and an `inst` (installments over its own term). Pacing status is now derived from the installment-based expected fraction so the paired-text pacing agrees with the numbers.

Deliberate deviation from the shipped legacy code: the legacy `PledgeDue` counts cycles to `DateTime.Today` regardless of the selected date (a known defect that makes a back-dated "as of" inconsistent between Pledge Due and Received). This design anchors the cycle count on the selected range end, i.e. how the code should behave. Recorded as a dev note, not a silent change.

The two live-product campaigns (FRNKSTOK, 2020PLED) are past their end dates, so Pledge Due stays the full pledge total (1200, 1000) and Due Remaining / Percent Due are unchanged (($655.00) / -54.58% and $904.00 / 90.40%). Re-ran the DOM-shim driver: 69 assertions, 0 failures; F2 node --check all pass.

### 2026-08-19 — gifts vs pledges: Received scope confirmed against code + owner decision

Owner noted this is Gifts AND Pledges, not pledges only, so it "won't be 100% the same" as Remittance. Investigated the GF data model:
- `GFHistoryDetail` (a gift line) has `PurposeID` NOT NULL (every gift belongs to a campaign/purpose) and `PledgeID` NULLABLE (a gift may or may not be applied to a pledge). Association: `GFPledge.GFHistoryDetails` is keyed on `PledgeID` (OtherKey="PledgeID").
- The legacy widget `GFPledgeRepository.GetWidgetData` computes Received via `p1.GFHistoryDetails` (walking each active pledge's linked gift lines), so it counts ONLY pledge-linked gifts. A one-off gift with `PledgeID = null` to the same purpose is NOT counted in the legacy Received, even though its `PurposeID` ties it to the campaign. (Note: Step 1 research described Received as "by PurposeID", which would include unpledged gifts; the actual code is pledge-linked only. Recording the discrepancy.)

**Owner decision (2026-08-19): match legacy exactly — Received = pledge-linked gifts only.** Unpledged one-off gifts are intentionally excluded (a known legacy limitation, preserved deliberately). Consequence documented: a pledge may be over-received (linked gifts > pledge), so campaign Received can exceed Pledge Total (e.g. the seeded Stoke Sell: $1,855 received against $1,200 pledged). No build change was required: the gpF model already attributes all Received to pledge rows and supports over-receipt, so it already matches this decision. If a future "full gift picture" is wanted (pledged + unpledged, matching the modern TotalRaised), that is a separate build adding unpledged-gift rows.

### 2026-08-19 — refinements v1.1 (donut removed, Goal Progress scroll, gift-level drill)

Owner feedback: drop the Donut view, Goal Progress does not fit on screen (needs a scroll), and the deep dive showed pledges but never gifts. Changes (FC_VERSION[17] 1.0 -> 1.1):
- Donut by Campaign removed from the view toggle, the content dispatch, and both fc-widget-17 size menus; stale view state falls back to Goal Progress. gpFDonut left defined but unreachable. Views now: Goal Progress (default) and Summary Table.
- Goal Progress bars wrapped in a scroll container (gpf-barscroll, overflow-y auto, per-tier caps Explore 196px / Detail 300px); the Detail two-column layout and the aside are scroll-contained so nothing spills off the card.
- Gift-level drill added: gpFMakeGifts splits each pledge's Received into 1-5 gift transactions (Gift Date, Amount, Reference) summing EXACTLY to it, dated within the term and on or before the range end; each pledge row in the breakdown expands to a "Gifts applied to this pledge" sub-table with a total footer. Pledge and campaign math unchanged; gifts stay pledge-linked per the earlier decision.

Verification: DOM-shim driver extended to 90 assertions, 0 failures (donut absent, scroll class present, gifts sum to Received and respect the range end for This year and a Custom earlier end, the two live campaigns still exact, em-dash sweep clean). final-check-rules.py: F2 node --check pass; only the 2 owner-waived F9 rows remain HIGH.

NOTE (file integrity): during this build the mock file was also modified in the W13 Purchasing Management region (purF, FC_VERSION[13] now 2.2) by a process outside this W17 work, and one W17 edit was reverted mid-run and re-applied. The final file parses clean and W17 is intact, but there may be another writer/session on Dashboard Widget Mockups.html to be aware of.

### 2026-08-24 — v1.2: the two views stop overlapping

Owner reviewed the Detail render and struck out the goal panel sitting under the Summary Table. The underlying problem was wider than that one box: **neither view owned its own content.** At Explore the Goal Progress view rendered bars *plus* a trimmed table; at Detail the table rendered unconditionally regardless of the selected view, with a goal panel in an aside. So one card could show bars, a table and an overall goal read at once, and the overall goal read appeared twice (panel and Glance).

Changes, all behind a rollback flag:

1. **Goal Progress is bars only.** The trimmed Summary Table is gone from that view. The 4-bar cap is lifted, so every campaign gets a bar inside the scroll container v1.1 already added — the cap only existed because a table sat underneath.
2. **Summary Table is the table only**, with the totals row at Explore as well as Detail. The Explore trim (top 4 by highest Percent Due) is superseded.
3. **The Detail goal panel is removed** and Detail becomes a single full-width panel showing one view at a time, matching W04's Explore/Detail pattern and Jo's single-column xwide. The overall goal read now lives only on the Glance card. Worth noting the two-column grid was already failing in practice: `.gpf-detail` is a flex row with a fixed 230px aside, and at the owner's viewport it had wrapped, which is why the panel appeared *below* the table rather than beside it.
4. **Nothing was lost.** The status counts (Goal Met / Close to goal / In progress) and "Remaining to goal overall" were the only figures the panel carried that Glance does not, so they moved into the Goal Progress legend — counted over the **full** campaign set, so they never shift with the bar list.
5. **Fixed an internal inconsistency on the way.** The bars ranked campaigns **best-first** (highest goal progress) while the trimmed table ranked **worst-first** (highest Percent Due). Same widget, two opposite ideas of "top". With no trim, the conflict dissolves; the bars keep their existing best-first order, which is the shipped and reviewed behaviour.

**Rollback.** `GPF_V12_LAYOUT`, defined next to `gpFContent`, default `true`. Set it to `false` and the v1.1 arrangement returns exactly — bars plus trimmed table at Explore, two-column Detail with the goal panel in its aside. `gpFGoalPanel` and the trimmed-table path were never deleted, the same discipline as `REMF_USE_POPUP` on W04. The driver asserts the rollback path works, not just that it compiles.

**Judgement calls made without the owner** (flagged for review, since the owner said they were unsure on this widget): lifting the bar cap; removing the Explore table trim rather than keeping it and realigning its ranking; putting the counts in the legend rather than on Glance; and keeping the bars' best-first order rather than switching to worst-first. Any of the four can be changed independently.

**Verification.** `final-check-rules.py --widget 17`: 0 HIGH, 2 MED (pre-existing em dashes in the A/B/C option strings), 1 LOW, F2 `node --check` pass. DOM-shim driver `outputs/_w17_driver.js`: **121 assertions, 0 failures** — every size at the right tier; Goal Progress carrying bars and no table or table head at every non-Glance size; Summary Table carrying the table and totals and no bars; **no goal panel, no aside and no two-column grid anywhere**; Glance still showing received, goal and its bar and no lists; the legend carrying counts that match a recomputed tally and summing to the full campaign set, plus the correct remaining-to-goal figure; one bar per campaign with the "Top 4" caption gone; the trim note gone from the table caption at both tiers; stale `donut`/unknown/null view states falling back to bars; the rollback flag restoring the trimmed table, the two-column grid, the aside and the panel, then the flag back on removing them again; the donor drill reachable from the table and NOT from the bars; every range preset in both views at three sizes; the empty state at every size; and an em-dash sweep across state x view x range x size.

**Still open, unchanged by this pass:** the Received-vs-Goal basis mismatch (Received is pledge-linked gifts only per the 2026-08-19 decision, while the modern campaign DTO measures goal progress on `TotalRaised`, all posted gifts) — this pass makes the Glance goal figure the widget's single headline, so that question is now more load-bearing, not less. Also unchanged: Goal ($399,500 in the mock) and Pledge Total ($400,200) are different fields that now sit close together with nothing labelling why they differ.
