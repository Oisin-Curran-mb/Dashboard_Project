# Budget Compared to Actual - Spec Decisions Log

Dated log for the W01 spec pair. History lives here, never in the V2 spec body.

## 2026-09-02 - V2 spec written (unattended-policy run)

**Sources and gate.** Written against the built Final (`WRENDER[1]` F branch / `bgtF` block, Final Check tab, `FC_VERSION[1]` = 2.0) and the Step 4 doc `W01 - Budget Compared to Actual.md` (last verified against the build 2026-08-30). Conflict gate result: **no material conflict** - the Step 4 doc's v2 blocks and the build agree on scope chip, Time Window Module, three views, two independent Detail panels, sortable table, posted-total footer, headline shape, special-report modal, and states. V1 spec mined for codebase facts only.

**Defaulted this run (approval-type calls, owner may reverse):**
- Proceeded to spec with dossier flags F1-F9 all **Unreviewed** (no reconciliation file exists). Rather than halting, the unaffected contract was specced and every flag is listed unresolved in Still needs sign-off, with the data-shape-touching ones (F3, F7, F8, F9) called out. No flag was honoured or overruled.
- `specialReportLineId` with `accountType` 0/1, or `accountType=2` without a line id: **reject with HTTP 400 invalidParams**. The V1 spec left this as "needs a dev decision"; V2 states a verdict per the framework's no-undefined-conflicts rule.
- Deleted/unknown special report line: **404-style `unknownSpecialReportLine` error**, never a silent empty payload. V1 left 404-vs-empty open.
- Unentitled-user treatment recommended as a state contract (403) but the user-facing form stays a product decision in Still needs sign-off.

**Substantive changes from the V1 spec (all grounded in the build or the code trace):**
- **`total` basis corrected to posted-buckets-only.** V1 said `total.budget` "at period-and-above grains sums every bucket's budget". The built Final's headline (`bgtFSpanVariance`) and its posted-so-far footer both compare posted actuals against the budget of posted buckets only. The V2 contract follows the build.
- **`ActualYTD` / `BudgetYTD` explicitly dropped** - no view in the Final consumes a cumulative series (the waterfall alternate was cut in Step 3/4).
- **Excel/CSV export removed from the contract.** V1 carried it as an open item on the grounds that the pre-Final design's menu assumed it; the built Final has no export control at any tier, so V2 lists export under Not in scope instead.
- **`lineType` moved forward to API 3** (`type` per line) because the built modal shows each line's account-type tag and the favourability preview before Apply; the data response still echoes `lineType` so the headline never depends on stale lookup state.
- **`lineCount` added to the report list** (API 2) because the built dialog shows "N lines" per report.
- **Legacy `X-Year-ID` header dropped** (fiscal years derive from window + asOf + GLPeriod), carried over from V1's posture.
- Decomposition verdict: three APIs (data read + two lookups); the lookups are the pre-existing `filters` and `special-report-lines` endpoints extended by one field each.

**Lint:** HIGH 0, MED 0, LOW 4 (informational: API count note plus three companion reconciliation lines without inline arithmetic). Confluence HTML regenerated from the .md by the skill's build script.

## History harvested from the V1 spec and project record

- **2026-07-20 (owner):** drill-through dropped entirely, not deferred - no target page exists and none is planned. Reaffirmed 2026-08-25 (Feargal call): account-level drilldown is out of scope for phase one, revisit during UAT.
- **2026-07-20 (owner):** fiscal year confirmed to vary per organisation; carried into Step 5 as the derive-from-GLPeriod requirement.
- **2026-07-21 (owner):** Line Description source question closed - it is the existing Special Report Line dropdown (`GLSpecialReportLine.Name`, a customer-created list), confirmed in code by the V1 spec's trace; not a fixed/hard-coded list. The Final Check review checkbox for this item is still unticked, so V2 lists it for formal closure only.
- **2026-07-27:** V1 spec rewritten as a clean dev handoff around the Time Window Module contract (window/grain/asOf, bucket response, validation matrix).
- **2026-07-30 (codebase findings):** sub-period actuals confirmed feasible via `GLJournalDetail.DetailDate`; master-company `MasterAccountID` rollup confirmed present in legacy; no cross-FY budget fetch exists; fiscal calendars per-company via `GLYear.BeginDate`; special report tables and repos confirmed.
- **2026-08-19 (owner):** V1 spec's DRAFT header removed, status set to "Complete at Step 5 - awaiting management sign-off" to match the index. The V1 file is now frozen at the folder root; V2 supersedes it as the working contract.
