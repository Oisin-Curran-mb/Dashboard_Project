# Bank Balances (W15) - API Spec Decisions Log

Dated record of decisions, defaults and change history for this widget's API spec. Kept **outside** the spec so the spec itself stays a present-tense contract. The spec may state an outcome here as fact; it never narrates the decision.

---

## 2026-09-07 - First V2 spec, written against the bkF rebuild of 2026-09-04

W15's first ever API spec. There is no V1 at the folder root to freeze or mine; `v2/` holds the only contract this widget has ever had. Written under the owner-authorised run-to-completion policy: approval gates were defaulted and are recorded here, unknowns stay `[TO CONFIRM]` with a named owner, nothing was invented.

**Version record caveat.** The build carries no `FC_VERSION[15]` entry (verified: zero occurrences in the extracted bkF block), so the badge renders empty and the block's dated comments ("Rebuilt 2026-09-04") are its only version record. The index's Build version cell says so rather than quoting a number that does not exist.

**Conflict gate: no material conflict.** The Step 4 doc was re-stamped 2026-09-07 by an unattended widget-final-check-audit against the 2026-09-04 rebuild and matches the build on every contract-bearing point checked while writing (two presentations, page size 12, whitelisted single-member sort with id tiebreaker, overdrawn chip semantics, Glance always-aggregate, no download/search/drill, fixed seven-row breakdown, four activity categories at Detail). Driver evidence: 215 assertions, 0 failures.

**Build facts the contract is grounded in.** `BKF_PAGE_SIZE` 12; `BKF_SORTABLE` = `['nm']` with `BKF_DEFAULT_SORT` `nm-asc`; `bkfServerQuery` models the paged endpoint and returns `{rows, totalCount, totals, pageIndex, pageCount, sortBy, sortDir, overdrawnCount, overdrawnOnly}` with aggregates over the full filtered set, the overdrawn count over the whole active set, a clamped page index, and `maxEnding`/`minEnding` clamped to include zero; `bkfAccountQuery` models the single-account breakdown (seven fixed rows, no totals row, `beginningFromReconciliation`); the picker walks every server page so it can never disagree with the table's order; checks and withdrawals are stored negative and magnitude is taken only at chart display; ending balance is derived, never stored. Demo dataset 52 accounts, 4 overdrawn, 3 never reconciled - a fixture figure, used as typical only, never as a ceiling.

**Fact gates carried, not resolved:**

1. **The paged accounts endpoint exists in NO Modern API document.** `GET /api/dashboard/bank-balances/all` is unpaged with no totals block; API 1 (paging, whitelisted sort, unique tiebreaker, full-set aggregates, `overdrawnOnly`, `overdrawnCount`) is central NEW backend work and the spec says so plainly.
2. **Open item 3 / the waived Rule 11 ask.** The Modern single-account read returns a summary balance only - no seven-row breakdown, no activity categories (confirmed in `Widget_Comparison_Classic.html`). The owner waived the gap as forward design for the build; the spec defines API 2 as the ask and keeps the gate open in Still needs sign-off. Blocks Single Account mode.
3. **Jo's dossier findings are ALL Unreviewed** - no reconciliation file exists for this widget, so no finding has an owner status. Rather than halting on the parts they touch (the skill's default), the run-to-completion policy carries them: the localisation defect (pound sign for a US org, [LIVE, 23 Jul 2026]) and the available-vs-unrestricted-cash "Do now" framing are listed in Still needs sign-off with both sides recorded and no field invented; the API serves raw decimals either way.
4. **SME attribution conflict.** The dossier names the 13 Jul 2026 SME "Marvin"; Step 2 records Ben Lane for the same interview. Both stay recorded in the spec; whoever holds the recording settles it.
5. **Ben Lane's "top 3-5 plus view-all" preference vs the built paged full set** (Step 4 open item 2). The spec specs the build and flags the design question; the paged contract strictly supersets a top-N's data needs, but top-N-by-balance would want the sort whitelist extended.

**Defaults taken this pass (approval gates defaulted, per policy):**

- **`pageSize` maximum 100.** No source states one; the template requires one. Default 12 is the build's. Listed for owner confirmation.
- **`page` is 1-based** on the wire; the build's internal `pageIndex` is 0-based, a mockup detail renamed for the contract (template convention).
- **Past-the-end behaviour is clamp-and-echo**, following the build's rule 3, rather than the template's empty-rows suggestion; stated as a decision in the spec.
- **API 3 (picker lookup) specced as a separate full-set endpoint** rather than N round trips of API 1 (which is how the mockup fakes it) or a giant `pageSize`. Trigger gap + conditional weight; its BOUNDED verdict is conditional on the unconfirmed ceiling and the typeahead fallback is recorded.
- **Unused build aggregates dropped from the contract:** `totals.beginning`, `totals.negativeCount`, `totals.neverReconciledCount` are computed by the stand-in but consumed by no rendered element, so per the coverage rule they are not served. The per-page overdrawn note counts its own page rows client-side.
- **Readable field names** (`endingBalance`, `deposits`, `voids`, `checks`, `withdrawals`, `eft`) replace the build's internal keys (`bal`-less derived ending, `dep/vd/chk/wdr/eft`).
- **Confluence HTML deliberately deferred** pending owner review of the draft .md, matching the W11/W13 precedent. Regenerate with `scripts/build_confluence_html.py` when the draft is accepted.

**Lint:** HIGH 0, MED 0, LOW 20 after two cycles. Every LOW is the reconciliation-arithmetic rule firing on prose lines that legitimately contain the word "reconciliation" (this widget's whole subject); the three real reconciliation lines under the JSON examples all carry checkable arithmetic and pass.
