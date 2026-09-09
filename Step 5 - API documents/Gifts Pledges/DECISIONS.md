# Gifts Pledges (W17) - Decisions log

Dated log for everything historical or procedural that must not live in the V2 spec body. The spec at `v2/Gifts Pledges - API Spec.md` is the present-tense contract.

## 2026-09-07 - First-ever spec written (V2; no V1 exists)

Written against the built Final: Final Check tab, `opt==='F'` / gpF branch, **FC_VERSION[17] = 1.3** (latest changelog entry dated 2026-08-25). Ground truth was the Step 4 doc `W17 - Gifts Pledges.md`, stamped this same day (2026-09-07) by an unattended widget-final-check-audit run against build v1.3 and trusted per that stamp. Run mode: owner-authorised run-to-completion; approval gates defaulted and logged below rather than halting.

### Conflict gate result

No material build-vs-Step 4 conflict found: the doc was audited against this exact build version today and records the build's reality (campaign filter narrows with no highlight, no alphabetical sort, bar click opens the top-5 modal, donut retired, export-only actions, Rule 11 navigation stub). All conflicts carried in the spec are DATA-side conflicts between sources, listed under Still needs sign-off, and were deliberately carried rather than resolved:

1. **Received basis** - build/owner decision of 2026-08-19 (pledge-linked gift lines only, mirroring the legacy `pledge.GFHistoryDetails` navigation; unpledged `PledgeID = null` gifts excluded) vs the Modern API's live basis (gifts-pledges DTO `Received` and campaign-giving-tracker `TotalRaised` both sum ALL posted gift detail). Spec follows the build; conflict flagged for owner + backend.
2. **Goal keying** - modern Goal lives on `GF_Campaign` (campaign-giving-tracker DTO); the widget keys by `GF_Purpose`. Mapping [TO CONFIRM - backend team].
3. **% Due doc-internal inconsistency** - the Step 4 doc simultaneously carries a CONFLICT row (disputed, blocks build), a Sign-off Readiness v3 note declaring it RESOLVED with live numeric proof (2020 Pledge 904/1000 = 90.40%, Stoke Sell -655/1200 = -54.58%), and the build computing Due Remaining / Pledge Due. Spec follows the build + live proof; the inconsistency is recorded in the spec, not collapsed, for the owner to reconcile in the Step 4 doc.
4. **Goal-met status naming** - build and Step 4 treat goal-met as the positive band; Widget_Comparison_New_Widgets records the modern ProgressStatus enum as "red (goal met)". Spec serves raw `progressPercent` and bands client-side; backend to confirm the enum is ignorable.
5. **Jo's dossier flags, all Unreviewed** (Confluence pull 2026-07-27; no reconciliation file exists): % Due to % Fulfilled relabel; data-as-of timestamp; live pound-sign localisation defect; entitlement/empty behaviour. The skill's normal rule is to stop on Unreviewed findings; under the run-to-completion policy they are instead carried in Still needs sign-off item 5 with the owner named to status them.

### Defaults taken this pass (owner to confirm or overturn)

- **Five APIs** derived from the Framework 3 triggers: summary, campaign lookup, paginated donor pledge list (also serving the top-5 modal via `behindOnly`), pledge gifts, view-scoped export. The top-5 modal deliberately got no endpoint of its own; the modal's summary cells ride in API 3's full-set `summary` block (the W04 pattern).
- **API 3 paginates** (page size default 20 matching the build, maximum 100 defaulted). Sort fixed server-side at `dueRemaining` desc + `pledgeId` tiebreaker; no `sortBy` offered, recorded as a decision with what the user loses.
- **`rangeStart` is not a wire param.** In the build the range start changes only the chip text; no figure is windowed by it, so the APIs take `rangeEnd` alone. A W04-style windowed figure would be new work; noted as Not in scope.
- **Received basis specced as pledge-linked only** (the build's basis), with the conflict flagged as sign-off item 1 rather than picking the Modern API's basis.
- **Raw numbers over enum**: `progressPercent` served raw, status bands client-side (thresholds 0.75 / 1.00 locked in Step 4); the modern ProgressStatus enum not imported.
- **Export format**: the built control names Excel; kept as the default pending owner confirmation. Export is a GET returning a file; volume verdict MUST AGGREGATE SERVER-SIDE.
- **Pledge Due anchoring**: the contract anchors the frequency-cycle count on `rangeEnd`, per the build's code comment, which also records that the shipped legacy code anchors on today and calls that a known defect. The spec instructs backend not to replicate the defect.
- **Purpose list rule** kept from legacy: active purposes with pledge activity only.
- Confluence HTML **deferred** this pass per the run instruction; regenerate from the .md once the owner has reviewed the draft.

### History harvested from the build changelog (FC_VERSION[17]) and Step 4

- 2026-08-19: Final built (gpF), derived from the W04 Remittance Pledges Final per direct owner instruction; goal-model pivot adopted (Step 4 blockers #1 preset math and #2 % Due definition declared resolved; #3 Goal field and #5 campaign-giving-tracker overlap adopted).
- 2026-08-19 v1.1: Donut by Campaign view removed by the owner (code kept unreachable, the gpFDonut rollback pattern); goal bars gained a scroll container; the deep dive extended to actual gift transactions per pledge.
- 2026-08-24 v1.2: views separated (Goal Progress bars only, Summary Table table only, Detail goal panel removed, status counts and remaining-to-goal moved into the legend); rollback flag `GPF_V12_LAYOUT`. Same day, the W04/W17 split was set by direct instruction: W04 owns the exception (behind-pace) framing, W17 owns goal progress.
- 2026-08-25 v1.3 (Feargal call): EXPORT added and recorded as the widget's ONLY action by design; two export points (header, donor breakdown); standing constraint against inventing further actions. Feargal also resolved the W04-vs-W17 product distinction (separate modules that can both pledge toward a purpose).
- 2026-09-07: Step 4 doc audited unattended against build v1.3; audit recorded the no-sort build reality and the "Open in Gifts and Pledges" stub's tension with the v1.3 export-only constraint [TO CONFIRM - Oisin].
