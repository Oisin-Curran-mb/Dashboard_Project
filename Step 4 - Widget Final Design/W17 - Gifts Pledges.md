# W17 — Gifts & Pledges

**Module:** Finance
**Status:** 🟢 Final design — locked
**Full history / rejected ideas:** [Widget_Specs/W17-Gifts-Pledges.md](../Step%203%20-%20Mock_Work/Widget_Specs/W17-Gifts-Pledges.md)
**Data source & formulas:** [Step 1 - Dashboard Research/17 - Gifts Pledges.md](../Step 1 - Dashboard Research/17%20-%20Gifts%20Pledges.md)
**Confluence dossier:** none yet
**Last verified against build:** not yet audited

**Evidence key:** `[LIVE]` verified in beta1/test1 on a stated date · `[SME]` interview-sourced (name + date) · `[RESEARCH]` desktop/market research · `[BUILD]` true of the mockup build · `[DOC]` backed by a written source document (named) · `[TO CONFIRM]` assumed, with the owner who can confirm. Claims with no mark are template boilerplate only. Conflicting evidence coexists: if two sources disagree, both claims stay recorded, each with its own mark, until someone with backend access settles it.

## Purpose
Tracks gift and pledge campaigns — showing how much has been given, how much is still outstanding, and overall campaign progress — helping leadership and fundraising staff monitor giving health across active campaigns.

*Terminology note* [DOC — Step 1 research / Widget_Specs/W17]: legacy's "Pledge Purpose" = the UI's "Campaign". The old design groups by Pledge Purpose; "Campaign" is kept as the friendlier UI label for the same underlying grouping.

## How Other Companies Fulfil This Purpose
- Same named metric as W04: **"Pledge vs. Received"** with an established fulfillment-rate formula, typically shown as progress bars, paired bars, or a pie/table ([Fanruan](https://www.fanruan.com/en/blog/fundraising-dashboard), [DonorSearch](https://www.donorsearch.net/resources/dashboards-chart-progress-measure-performance-on-one-screen/)) — this is the direct justification for the KPI headline and the three views below.
- Nonprofit fundraising dashboards commonly track a **campaign goal** explicitly, distinct from the pledge total. The old design here has no such separate field — that's a real, named gap against standard practice, not a chart-type issue. It's noted as an open opportunity (see Widget_Specs history for detail) rather than built into this lock, since it isn't backed by real data today.

**Net assessment:** the chart/view choices already match standard practice well. The more valuable finding from competitor research isn't about visualisation — it's that a Goal field is standard elsewhere and missing here; flagged as a future data question, not resolved in this design.

## Data Contract

All rows are drawn from the Step 1 research doc unless marked otherwise. Legacy source class: `GiftsPledges : DataPanelControl` (`/DonorsAndGifts`), confirmed via `Widget_Comparison_Classic.html`, 2026-07-08.

| Field / value shown | Source table / endpoint | Formula / logic | Evidence |
|---|---|---|---|
| Campaign list (Pledge Purpose) | `GF_Purpose` | `WHERE CompanyID = ctx AND Active = true`. Corrects the earlier single-table "GFPledge" listing. | [DOC — Step 1 research] |
| Pledge Total | `GF_Pledge` | `SUM(GF_Pledge.AnnualAmount) WHERE PurposeID = purpose AND Active = true` (only rows where the pledge itself is Active count). | [DOC — Step 1 research] |
| Received | `GF_History` / `GF_HistoryDetail` | `SUM(GF_HistoryDetail.Amount) WHERE PurposeID = purpose`, for history rows where `JournalID != null AND UnDoJournalID = null AND GiftDate <= DateGiftsThru` (posted, not voided, on or before the as-of date). | [DOC — Step 1 research] |
| Pledge Due / Due Remaining / % Due | computed client-side, no server source | **Not returned by either the legacy repository or the Modern API endpoint**; the Modern API's data endpoint only returns `{PurposeId, PurposeName, Pledged, Received}` [DOC — Step 1 research]. **How these compute under the new Current Month / Year to Date presets is explicitly unresolved: this doc deliberately records no formula for them, because defining one is the open product/dev decision (see Filters and Sign-off Readiness).** The only defined case is Campaign Total: Pledge Total vs Received vs Due Remaining (= Total − Received), no time-proration [DOC — Widget_Specs/W17]. | [TO CONFIRM — product/dev, blocks build] |
| % Due definition | disputed | **CONFLICT, recorded not resolved:** the Step 1 research defines Percent Due as "the percentage of the pledge amount still outstanding" [DOC — Step 1 research], while this doc's KPI line (carried from Step 3) defines overall % Due as "Received ÷ Due, across all campaigns" [DOC — this doc's size table / Widget_Specs/W17]. These are not the same quantity: one measures what is still outstanding, the other what has come in against what was due. Both claims stay recorded; settle alongside the preset-math decision above. | Disputed — [DOC] vs [DOC], owner: product/dev |
| Old design date control (superseded) | UI state | "Date Gifts Thru" date picker: defaults to today, controls which gifts are counted (only gifts received on or before the selected date are included), and the selected date is saved and remembered when the page is refreshed [DOC — Step 1 research]. Replaced in this design by the Date Range presets. Step 1's open question is recorded for history: unlike Remittance Pledges, the date persists on refresh; "worth confirming whether this is intentional and consistent behaviour across the two widgets." | [DOC — Step 1 research] |
| Goal | no source field | The old data has no separate Goal field distinct from Pledge Total [DOC — Step 1 research / Widget_Specs/W17]. The Phase 2 `campaign-giving-tracker` API widget has a real Goal field (`HasGoal`/`Goal`) and a genuine `[GF_Campaign]` table [DOC — Widget_Specs/W17, from Widget_Comparison_New_Widgets.html]. Unresolved as a data question; kept out of this locked design. | [TO CONFIRM — owner TBD] |
| Totals row | derived | Sums the first four columns (Pledge Total, Pledge Due, Received, Due Remaining) across all purposes; % Due is not summed. | [DOC — Step 1 research] |

- **Headline math (KPI):** overall % Due; see the CONFLICT row above, its exact definition is disputed and unresolved.
- **Favourability/direction logic:** campaigns exceeding their Pledge Total are favourable (green, "✓ Goal Met" badge); Due Remaining amounts are amber/red and can be negative if ahead of schedule (see Fine-Tuning Notes).
- **Rounding / currency / locale rules:** *Not yet specified*.
- **"Data as of" freshness:** in the old design the as-of date was the user-selected "Date Gifts Thru" [DOC — Step 1 research]; the equivalent under the new presets is part of the unresolved math question above.

## Widget States

| State | Behaviour |
|---|---|
| No module rights / entitlement | *Not yet specified*. |
| Empty (org has no active pledge purposes) | *Not yet specified*. Known rule: the purpose list requires `Active = true` [DOC — Step 1 research]. |
| Partial (some data missing) | Gifts count only if posted (`JournalID != null`), not voided (`UnDoJournalID = null`), and dated on or before the as-of date [DOC — Step 1 research]. A campaign with active pledges but no gifts yet, or gifts but no active pledge rows: *not yet specified*. |
| Loading | *Not yet specified*. |
| Error / API failure | *Not yet specified*. |
| Stale data | The old design saved the selected date across page refreshes [DOC — Step 1 research]; whether the new Date Range preset persists the same way is *not yet specified*. No "data as of" stamp specified. |

## Interaction Spec

- **Old design baseline:** table only, no chart; no drill-down or navigation away from the dashboard observed, and no interactions with other widgets [DOC — Step 1 research].
- **Campaign filter:** highlights the selected campaign across all views (see Fine-Tuning Notes). The visual form of that highlight is *not yet specified*.
- **Progress bar hover, donut segment hover/click, table row click:** *Not yet specified*.
- **Keyboard / focus behaviour** for filters, Switch View, and chart elements: *Not yet specified*.

## Filters
| Filter | Values |
|--------|--------|
| Campaign (Pledge Purpose) | All Campaigns · dynamic list |
| Date Range | Current Month · Year to Date · Campaign Total |

No Fiscal Year filter — old design has no fiscal-year dimension for this widget. **Open item, needs product/dev decision before build:** how Pledge Due and % Due are computed for Current Month/Year to Date vs. Campaign Total — see Widget_Specs history for the full math question. KPI size shows Date Range only.

## Data Table Sort
Fixed — Campaign (Pledge Purpose) name, alphabetical. Not user-changeable.

**Trimmed-view rule:** at Small (2-3 campaigns) and Medium (4-5 campaigns), the subset is the first N in the fixed sort above, i.e. alphabetical by campaign name. An alphabetical top-N does not surface the campaigns that most need attention; whether the trimmed views should instead rank by need (for example % Due or Due Remaining) is [TO CONFIRM — owner TBD]. See Sign-off Readiness.

## Drill-Through
None — matches old design. Flag if a link to the Donors and Gifts module is wanted later.

## Refresh
Standalone icon, present at every size including KPI.

What refresh does in the old design: clears the cached data and reloads with the currently selected date [DOC — Step 1 research]. Spinner/timestamp behaviour for the rebuild is *not yet specified*.

---

## Views (Switch View)

### View 1 — Campaign Progress Bars *(default)*
Horizontal progress bar per campaign — gifts received vs. Pledge Total. The single most common visualisation for this metric.

### View 2 — Donut by Campaign
Proportion of total giving per campaign — useful for showing which campaign is driving the most giving.

### View 3 — Summary Table
Campaign · Pledge Total · Received · Due Remaining · % Due, totals row.

### Size behaviour
| Size | Behaviour |
|------|-----------|
| **Small (1×1)** | Active view, 2-3 campaigns, no Switch View |
| **Medium (2×2)** | Active view, 4-5 campaigns; Switch View available |
| **Large (4×4)** | Active view, all campaigns, full values + %; Switch View available |
| **KPI (1×0.5)** | Headline: **overall % Due** (Received ÷ Due, across all campaigns). No download, no switch. |
| **Expanded** | Active view, full detail, all filters live in the modal |

*Note:* the KPI headline's "Received ÷ Due" parenthetical is part of the disputed % Due definition; see the CONFLICT row in the Data Contract.

## Accessibility

- Colour is never the only signal: the green "✓ Goal Met" state already pairs colour with a badge; the amber/red Due Remaining treatment must likewise carry a sign or label, not colour alone. *Not yet reviewed against the build.*
- Chart values (progress bar percentages, donut segments) exist as text in the DOM (sr-only or visible table), not hover-only. *Not yet reviewed against the build.*
- Table semantics are real (`th`/scope), and interactive controls (filters, Switch View) are reachable by keyboard. *Not yet reviewed against the build.*

---

## What Got Cut (and why)
- **"Campaign furthest behind pace" and "Total Giving Received" as KPI headlines** — both dropped in favour of a single **overall % Due**, since that's the named industry benchmark (pledge fulfillment rate) rather than an internally invented figure — mirrors the same decision made for W04. *(Decision recorded across the Step 3 options' KPI rows [DOC — Widget_Specs/W17-Gifts-Pledges.md].)*
- **Goal/Spent tracking** — not built into this design; the old data has no separate Goal field distinct from Pledge Total, so this stays out of the locked design until that's resolved as a data question (see Widget_Specs history). *(Deferral, not rejection; owner TBD [DOC — Widget_Specs/W17-Gifts-Pledges.md].)*

## Sign-off Readiness

| # | Open item | Type | Owner | Blocks build? |
|---|---|---|---|---|
| 1 | Preset math: "how Pledge Due and % Due are computed for Current Month/Year to Date vs. Campaign Total — see Widget_Specs history for the full math question." Step 3 wording: "This isn't fully specified — flag for product/dev before build, since it directly affects what the numbers mean, not just their display." | math / product decision | product/dev | **Yes** |
| 2 | **CONFLICT** — % Due definition: Step 1 says "the percentage of the pledge amount still outstanding"; this doc's KPI line says "Received ÷ Due, across all campaigns". Both recorded in the Data Contract; neither wins by default. | math | product/dev | **Yes** (the KPI headline depends on it) |
| 3 | Goal field: "the old data has no separate Goal field distinct from Pledge Total, so this stays out of the locked design until that's resolved as a data question" | field / data question | TBD | No |
| 4 | W04 overlap: "The functional difference between this widget and W04 (Remittance Pledges) still hasn't been confirmed" [DOC — PROJECT INDEX] | product decision | TBD | No |
| 5 | `campaign-giving-tracker` overlap: "Given how directly campaign-giving-tracker overlaps with W17's stated purpose and unresolved Campaign/Goal terminology questions, this is a strong candidate to revisit before finalizing W17's build" [DOC — Widget_Specs/W17] | product decision | TBD | No, but revisit before build |
| 6 | Drill-through: "Flag if a link to the Donors and Gifts module is wanted later." | product decision | TBD | No |
| 7 | Trimmed-view ranking at Small/Medium: alphabetical first-N vs a need-based ranking is undecided | design | TBD | No |

This doc has 7 open items; it is not sign-off-ready until this table is empty or every row is explicitly accepted as a known risk.

## Fine-Tuning Notes
- Campaigns exceeding their Pledge Total shown in green with a "✓ Goal Met" badge
- Due Remaining amounts in amber/red (can be negative if ahead of schedule)
- Campaign filter highlights the selected campaign across all views
