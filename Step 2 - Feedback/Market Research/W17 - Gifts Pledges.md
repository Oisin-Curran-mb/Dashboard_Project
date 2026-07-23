# Market Research: Gifts Pledges

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W17 — Gifts Pledges
**Module:** Donors and Gifts
**Researched:** 2026-07-22
**Status:** ✅ Researched — via the `widget-market-research` skill (parallel-agent research pass, manual cross-check in place of automated verification)

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/17 - Gifts Pledges.md`: a table, one row per pledge purpose ("Campaign" in the UI), showing Pledge Total, Pledge Due (time-prorated to a selected date), Received, Due Remaining, and Percent Due, as of a user-selected "Date Gifts Thru" date that persists on refresh. **Note:** already Step 4 — locked (`Step 4 - Widget Final Design/W17 - Gifts Pledges.md`) — adds Campaign Progress Bars and a Donut by Campaign as new views alongside a Summary Table.

## Data Used

`GF_Purpose`, `GF_Pledge`, `GF_History`/`GF_HistoryDetail` (per Step 1). **Confirmed gap:** Pledge Due, Due Remaining, and Percent Due are not returned by either the legacy repository or the Modern API endpoint — they're computed client-side today, not server-side. Per `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W17` section: Campaign filter ✅ available (using Pledge Purpose); Date Range filter 🟡 needs a decision (the same unresolved re-baselining question as W04); Campaign Progress Bars/Donut/Table are ✅/🟡 mixed — Pledge Total and Received are available, but Due Remaining and % Due depend on the unresolved Pledge Due math above; KPI overall % Due 🟡 depends on the same gap.

## Competitor / Industry Findings

**Already on file, carried forward from Step 3/4 rather than re-derived:**
- "Pledge vs. Received" with an established fulfillment-rate formula, shown as progress bars, paired bars, or pie/table, is the standard nonprofit fundraising pattern. *Sources: [Fanruan](https://www.fanruan.com/en/blog/fundraising-dashboard); [DonorSearch](https://www.donorsearch.net/resources/dashboards-chart-progress-measure-performance-on-one-screen/).* Nonprofit fundraising dashboards commonly track an explicit campaign **Goal**, distinct from pledge totals — flagged as a real, named gap this widget has (not a chart-type issue), noted as a future data question rather than resolved in the current lock.

**New this pass — the Goal-field gap upgraded from asserted to field-level confirmed:**
- **Confirmed pattern (3 independent products)** — a distinct campaign "Goal" field, separate from "Pledged"/"Committed" totals, is real and common, not just a general assertion. Virtuous CRM+'s Campaign object has a distinct "Giving Goal" field ("the total goal amount for fundraising efforts") plus a separate "New Giver Goal," while "Amount Pledged" lives entirely on a separate Pledge record — structurally separate fields at the data-model level. *Source: [Virtuous — Campaign setup](https://support.virtuous.org/hc/en-us/articles/360060663552).* Planning Center Giving's pledge campaigns have an optional "collective/overall goal" the org can enable and share with donors, tracked distinctly from the sum of individual pledge commitments. *Source: [Planning Center — Introducing Donor Pledge Campaigns](https://www.planningcenter.com/blog/2020/06/introducing-donor-pledge-campaigns) (2020-06-01, still current).* Kindful's campaign pages have a "Show goal amount?" toggle driving a goal thermometer, independent of the underlying pledge records. *Source: [Kindful support](https://support.kindful.com/hc/en-us/articles/115008040107).* This upgrades the Goal-field gap from a general observation (Fanruan/DonorSearch) to a concrete, field-level pattern confirmed across three real nonprofit fundraising products.
- **Moderate confidence (2 sources, inferential)** — pledge progress tracking is inherently as-of/snapshot-based in the tools checked, not date-range-based, mirroring this widget's own "Date Gifts Thru" single-date design. DonorPerfect frames pledge balance as a point-in-time figure ("pledged $50,000... balance due $50,000" if nothing's been paid yet), and Aplos's Aging Report explicitly categorizes pledges by how long outstanding "as of a reporting date." *Sources: [DonorPerfect — Pledge Fulfillment](https://www.donorperfect.com/nonprofit-technology-blog/fundraising-software/pledge-fulfillment); [Aplos — Aging Report glossary](https://www.aplos.com/glossary/aging-report) (updated 2025-06-02).* No vendor page found offered a true date-*range* selector for pledge progress specifically — this is inferential (absence of a range feature isn't the same as an explicit "we don't do ranges" statement), so treat as moderate, not confirmed, confidence.

## Visual Options (aim for 3)

1. **Add a genuine Goal field on Campaign/Pledge Purpose, separate from Pledge Total**, mirroring the field-level pattern confirmed across Virtuous, Planning Center, and Kindful. Based on: the 3-source Goal-field finding. Data needed: 🔴 real gap — this is new data not currently captured in `GF_Purpose`/`GF_Pledge` per Step 1, not just new query logic; would need a new field, likely a new table relationship too.
2. **No change to the "Date Gifts Thru" single as-of-date design** — now moderately supported by DonorPerfect/Aplos precedent for snapshot-based pledge progress. This also suggests the punch list's open "Date Range filter — needs a decision" item can reasonably lean toward *not* adding a range, consistent with how the competitors checked handle this. Data needed: ✅ already how it works today.
3. **No change to Campaign Progress Bars / Donut / Table peer views** — well supported by the existing Fanruan/DonorSearch citations, unaffected by this pass's findings.

## Net Assessment

**Supports the current design, and substantially strengthens the case for the one already-flagged gap.** The missing Goal field — previously "a real, named gap against standard practice" from general fundraising-dashboard sources — is now confirmed at the field level in three separate, real nonprofit fundraising products, each treating Goal as a distinct concept from Pledged/Committed totals. This moves the gap from "an idea worth exploring" to "a well-established pattern this widget is missing entirely," worth prioritizing in a future data-model conversation alongside the already-known Pledge Due/Due Remaining/% Due computation gap. Separately, the "Date Gifts Thru" single-date snapshot design is reinforced rather than called into question — no evidence found suggests a date-range alternative would better match the market.

## Sources

- [Fanruan — Fundraising Dashboard](https://www.fanruan.com/en/blog/fundraising-dashboard)
- [DonorSearch — Dashboards: Chart Progress, Measure Performance](https://www.donorsearch.net/resources/dashboards-chart-progress-measure-performance-on-one-screen/)
- [Virtuous — Campaign setup](https://support.virtuous.org/hc/en-us/articles/360060663552)
- [Planning Center — Introducing Donor Pledge Campaigns](https://www.planningcenter.com/blog/2020/06/introducing-donor-pledge-campaigns)
- [Kindful support — Campaign goal amount](https://support.kindful.com/hc/en-us/articles/115008040107)
- [DonorPerfect — Pledge Fulfillment](https://www.donorperfect.com/nonprofit-technology-blog/fundraising-software/pledge-fulfillment)
- [Aplos — Aging Report glossary](https://www.aplos.com/glossary/aging-report)

## Note on Existing Content Elsewhere

`Step 3 - Mock_Work/Widget_Specs/W17-Gifts-Pledges.md` and `Step 4 - Widget Final Design/W17 - Gifts Pledges.md` both still carry their own `## Purpose & Competitive Fit Check` / `## How Other Companies Fulfil This Purpose` sections (Fanruan, DonorSearch), including the Goal-field gap noted as a future data question. Nothing there has been moved or deleted — this file cites the same sources and substantially strengthens the case for that gap with field-level evidence. Whether to update those two sections is still an open decision.
