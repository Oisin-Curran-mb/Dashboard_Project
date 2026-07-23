# Market Research: Remittance Pledges

> Step 2 — Feedback / Market Research. Captures how other companies present this kind of information — visuals, layout, framing — so a widget's design options can be checked against real precedent (or an honest "no direct precedent found") before Step 3 locks in Options A/B/C.

**Widget:** W04 — Remittance Pledges
**Module:** Finance
**Researched:** 2026-07-21
**Status:** ✅ Researched — via the `widget-market-research` skill

## What This Widget Shows Today

Per `Step 1 - Dashboard Research/04 - Remittance Pledges.md`: a table, one row per remittance activity type (an apportionment or mission-fund obligation owed to a conference/denominational body), showing Annual pledged, YTD Expected (pro-rated by how far through the calendar year the selected date falls), YTD Paid, Outstanding, and % Paid, with a totals row. No chart today — table only.

## Data Used

Confirmed available per `Step 1 - Dashboard Research/04 - Remittance Pledges.md` and `Step 3 - Mock_Work/Data and Build Readiness - Developer Punch List.md`'s `## W04` section: `RM_Activity` (activity types), `RM_PledgeDetail` (Annual pledge amounts), `RM_History`/`RM_HistoryDetail`/`RM_HistoryBatch` (payments, posted/non-voided only). Activity Type filter, all three chart views, and the overall % Paid KPI are all ✅ available today. Two things are **not** available or not yet decided: the Fiscal Year filter is 🔴 decided-removed (the old design has no fiscal-year dimension at all), and the Date Range filter is 🟡 blocked on two unresolved questions — rolling-window vs. calendar-month interpretation, and whether % Paid/YTD Expected re-baseline per period or always use the full fiscal year. Drill-through to the Remittance module is 🔴 missing — a new feature with no target confirmed yet.

## Competitor / Industry Findings

**No direct competitor exists for denominational apportionment/remittance tracking specifically.** Checked Realm (ACS Technologies), PowerChurch, and IconCMO directly — none document or advertise a dedicated apportionment/remittance report or progress view. IconCMO's "Denomination Management" line is built for the denominational *office* to roll up member-church data, not for a local church to track what it owes — the reverse direction from this widget. — [PowerChurch Budget Setup/Entry/Reporting](https://www.powerchurch.com/support/573/1/budget-setup-entry-and-reporting) (undated); [IconCMO Denomination Management](https://www.iconsystemsinc.com/products-services/denomination-management/) (undated) — Confidence: **single source per product, but the absence held consistently across three separately-searched products** — treat as a well-supported negative finding, not a gap in searching. Matches and reinforces the "no dedicated competitor" note already on file in `Widget_Specs/W04-Remittance-Pledges.md`.

**The pro-rated "expected by now" concept is a confirmed, named pattern in grant/budget tracking — but it's "budget pacing," not a fundraising-CRM concept.** Two independent sources describe the identical formula this widget already uses (Annual × % of period elapsed = Expected): NCOA's grant-tracking tipsheet gives the plain-language version ("if 50% of the grant period has passed but you've only spent 20% of funds, that could be a challenge") — [NCOA, "Grant Funds Tracking Tipsheet"](https://www.ncoa.org/article/grant-funds-tracking-tipsheet), 2026-06-23; HUD Exchange's Burn Rate Tool computes the same thing as "% Expended" per budget line — [HUD Exchange, "Using the Burn Rate Tool"](https://files.hudexchange.info/resources/documents/SCMF-Using-the-Burn-Rate-Tool.pdf), undated. A second, separately-confirmed pair of sources names this exact mechanic "budget pacing" in ad-spend tooling, with the identical formula (Expected = Budget × % time elapsed) and color-banded status (red under-pace, green on-pace, red over-pace): [Adpulse, "How is Budget Pacing calculated?"](https://support.adpulse.app/en/articles/10224019), 2026-04-29; [Basis, "Creating The Ultimate Budget Pacing Dashboard"](https://www.basis.com/blog/budget-pacing-dashboard), 2021-01-27 — Confidence: **confirmed pattern (2 independent sources)**.

**Fundraising-CRM goal-progress views typically do *not* pro-rate by elapsed time — a real contrast worth knowing.** Salsa Labs' Performance Dashboard shows simple raised-vs-goal percentages per fund/campaign/appeal, with no time-elapsed adjustment at all — [Salsa Labs Help Center, "Performance Dashboard"](https://help.salsalabs.com), 2025-10-07 — Confidence: **single source**, but directly relevant: it means this widget's YTD-Expected pro-ration is aligned with grant/budget-tracking convention, not typical donor-fundraising convention — a meaningful distinction given Remittance Pledges is an obligation-tracking widget, not a fundraising one.

**The term "fulfillment rate" is advice-language, not a real on-screen UI label.** Checked Bloomerang, DonorPerfect, and Virtuous directly — none of the three show a labeled "fulfillment rate" or "% fulfilled" metric on any actual product screen. The term only turns up in third-party advice articles (the DonorSearch citation already on file in `Widget_Specs/W04-Remittance-Pledges.md` is one of these). — [Virtuous, "Managing Pledge Payments"](https://support.virtuous.org/hc/en-us/articles/360051023372-Managing-Pledge-Payments), 2025-07-02; [Bloomerang, "Track Your Yearly Revenue Goal"](https://help.bloomerang.com/en/articles/14708929-track-your-yearly-revenue-goal), 2026-04-21 — Confidence: **single source per product, consistent absence across all three** — worth flagging as a mild correction to the existing Step 3 note, which cites the metric's *formula* accurately but shouldn't be read as claiming it's a standard on-screen label.

**Multi-entity pledge tracking (many rows at once) is table-first across every product checked, not chart-first.** Virtuous's Pledge Payment Report, Bloomerang's Pledge/Schedule tabs, and DonorPerfect's Gift Pledge Detail Report are all flat tables (contact/fund, pledge amount, paid-to-date, balance) — none use a bar or progress-bar layout once there's more than one pledge to show at a time. — [Virtuous, "What is the Pledge Payment Report?"](https://support.virtuous.org/hc/en-us/articles/360051245192-What-is-the-Pledge-Payment-Report), 2023-11-01; [DonorPerfect, "Mastering Nonprofit Pledge Fulfillment"](https://www.donorperfect.com/nonprofit-technology-blog/fundraising-software/pledge-fulfillment/), 2024-08-14 — Confidence: **single source per product, consistent across all three checked** — supports keeping Option C (Summary Table) as a full peer, not a lesser third option, once an org has more than a couple of activity types.

## Visual Options (aim for 3)

1. **Progress bar with a pacing marker per activity.** Same received-vs-pledged fill as the existing Option A, plus a small tick mark on each bar at the pro-rated "expected by now" point — directly shows whether an activity is ahead of, on, or behind pace, using the exact formula this widget already computes. Based on: the confirmed budget-pacing pattern (NCOA/HUD Exchange, Adpulse/Basis). Data needed: ✅ available today — Annual, YTD Expected, and YTD Paid are all already computed per `Step 1 - Dashboard Research/04 - Remittance Pledges.md`'s formulas; this is a display addition, not a new query.
2. **Paired bars (Pledged vs. Received).** The existing Option B, cross-checked against Virtuous's "Recurring Gift Fulfillment" widget, which plots expected vs. actual as paired bars over time. Based on: Virtuous (single source). Data needed: ✅ available today.
3. **Summary table with totals row.** The existing Option C — matches the table-first pattern found across Virtuous, Bloomerang, and DonorPerfect once more than a couple of rows are shown. Based on: the multi-entity pledge-tracking finding above (3 products, single source each, consistent pattern). Data needed: ✅ available today.

## Net Assessment

**Supports the existing design.** All three of Step 3's existing options (Progress Bars, Paired Bars, Summary Table) match real precedent from the products checked, and the table-first pattern for multi-row views specifically supports keeping Summary Table as a full peer rather than a lesser option — consistent with `Widget_Specs/W04-Remittance-Pledges.md`'s own fit-check. Two things worth folding in: the pro-rated YTD-Expected math this widget already uses has a real, confirmed name and precedent ("budget pacing" in grant/ad-spend tooling) that could inform a genuinely new pacing-marker visual (Option 1 above) — not previously considered. And the "fulfillment rate" terminology on file should be understood as advice-language, not a real product UI label, and there is still no dedicated competitor for the denominational-remittance niche itself, which lowers the confidence of the industry-standard framing to "adjacent pattern, not direct precedent."

## Sources

- [PowerChurch — Budget Setup, Entry, and Reporting](https://www.powerchurch.com/support/573/1/budget-setup-entry-and-reporting)
- [IconCMO — Denomination Management](https://www.iconsystemsinc.com/products-services/denomination-management/)
- [NCOA — Grant Funds Tracking Tipsheet](https://www.ncoa.org/article/grant-funds-tracking-tipsheet)
- [HUD Exchange — Using the Burn Rate Tool](https://files.hudexchange.info/resources/documents/SCMF-Using-the-Burn-Rate-Tool.pdf)
- [Adpulse — How is Budget Pacing calculated?](https://support.adpulse.app/en/articles/10224019)
- [Basis — Creating The Ultimate Budget Pacing Dashboard](https://www.basis.com/blog/budget-pacing-dashboard)
- [Salsa Labs — Performance Dashboard](https://help.salsalabs.com)
- [Virtuous — Managing Pledge Payments](https://support.virtuous.org/hc/en-us/articles/360051023372-Managing-Pledge-Payments)
- [Bloomerang — Track Your Yearly Revenue Goal](https://help.bloomerang.com/en/articles/14708929-track-your-yearly-revenue-goal)
- [Virtuous — What is the Pledge Payment Report?](https://support.virtuous.org/hc/en-us/articles/360051245192-What-is-the-Pledge-Payment-Report)
- [DonorPerfect — Mastering Nonprofit Pledge Fulfillment](https://www.donorperfect.com/nonprofit-technology-blog/fundraising-software/pledge-fulfillment/)

## Note on Existing Content Elsewhere

The prior research (DonorSearch's fulfillment-rate citation) still lives in `Step 3 - Mock_Work/Widget_Specs/W04-Remittance-Pledges.md` under `## Purpose & Competitive Fit Check`. This file's finding on "fulfillment rate" being advice-language rather than a real UI term is a mild refinement of that citation, not a contradiction of it — whether to fold this file's fuller research into that section, or leave both standing, hasn't been decided.
