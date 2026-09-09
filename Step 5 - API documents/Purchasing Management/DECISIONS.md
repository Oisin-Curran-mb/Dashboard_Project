# Purchasing Management - Spec Decisions Log

Dated log for everything historical or procedural that must stay out of the V2 spec body. The spec at `v2/Purchasing Management - API Spec.md` is the present-tense contract; this file is where its history lives.

## 2026-09-07 - First V2 spec written (unattended run, owner-authorised run-to-completion policy)

**Context.** First-ever API spec for W13; no V1 exists (the folder was created by this pass). Written against the built Final (`FC_VERSION[13]` = 2.6, all build rounds dated 2026-08-19) and the Step 4 doc, itself audit-stamped 2026-09-07 by widget-final-check-audit and treated as ground truth. Codebase grounding: `Widget_Comparison_Classic.html` (legacy `PurchasingManagement : DataPanelControl` and the modern `purchasing-management` endpoints) and the Step 1 research doc. The Step 6 dossier (Confluence pull 2026-07-27) was read in full; `Pending Questions - Codebase Findings (2026-07-30)` contains no purchasing entries.

**Conflict gate.** No material build-vs-doc conflict found; the Step 4 doc was verified against the build the same day this spec was written. One internal tension in the Step 4 doc was resolved by interpretation rather than halting (recorded here per the run policy): the Interaction Spec calls the record popup "a read-only modal replica" while the record-parity build round made it fully interactive. Resolution taken: the popup is the mock's stand-in for the drill navigation to Requests/Update; the record screen's own edit surface is out of the dashboard contract, and only the board-level actions the Final demonstrates (transition, hold, payment submit) are specced as writes. If the owner instead wants the full record-edit surface served through dashboard APIs, the spec needs a substantial extension.

**Defaults taken (unattended; each is reversible):**
1. **API count seven**, derived by the frameworks. Close/Void folded into the transition write (API 5) because the build routes them through the same guarded state-change function as approve/reject; hold kept separate (orthogonal to state).
2. **API 7 (payment entry) written but gated**: specced from the built behaviour with a prominent do-not-build-before-ruling banner, because the redirect-vs-rebuild dispute (Feargal, held on action item C3) is Disputed and the spec may not pick a side. If the redirect reading wins, API 7 is dropped and the unpaid-card click becomes a navigation.
3. **Board endpoint capped** at `cardsPerState` default 25 / max 100, and the table at `pageSize` default 10 / max 100. The build renders every card client-side at the large tier; that is the build-volume trap, so the contract caps and routes overflow to the table. Caps are provisional pending volume ceilings (Still needs sign-off item 13).
4. **`isOverdue` served by the server** rather than shipping a due date for the client to compare, so the overdue display and the `overdueOnly` filter share one implementation. Consequence: the expected-by date itself is not in any response.
5. **Named owners for [TO CONFIRM] items**: backend confirmations assigned to Feargal Phelan (the dossier's own @-mention and the backend contact); product decisions to the project owner (Oisin Curran). Step 4's owner cells for rows 1-3 read "TBD"; this pass names Feargal Phelan as the confirmation route rather than leaving them unowned.
6. **Glance summary takes `approvalPathId` only, no `state` param**, mirroring the build (`purFGlance` respects the path filter and ignores status).
7. **Sequence-based personal-queue reads left out of the contract** (they are no longer columns or filters in the design); the legacy sequence-chain logic is carried instead as the open write-authority question.

**Sign-off findings handling (statuses respected):**
- 11.2 inline actioning: Accepted in drag form (per Step 4); specced as the writes.
- Aging / item age: Accepted; built and specced (oldest-first order, age from `issuedDate`).
- Encumbrance chart "keep both jobs": Not adopted (owner ruling recorded in Step 4); chart endpoint declared out of contract, one line in the spec's sign-off section.
- Empty/caught-up states and Glance actionable read: Accepted; specced as zero-shape state contracts.
- **11.5 stable-columns half and 11.6: Unreviewed.** Per the run policy these did not halt the pass: the parts they touch are specced as built but flagged as provisional in Still needs sign-off items 14-15, awaiting the owner's status call.
- Feargal call items (2026-08-25): item 3 (redirect vs rebuild) and item 5 (voided assumptions) carried both-sides as Still needs sign-off items 1-2, no side picked. Items 1, 2 and 6 (path ordering/viewer position, permission-aware actions, PO-vs-invoice filter separation) are documented-not-built; recorded in Not in scope and sign-off item 10 as future contract extensions.

**Lint.** spec_lint.py: HIGH 0, MED 0, LOW 4 (the api-count note and three prose lines that use the word "reconcile" without checkable arithmetic; all three are cross-references, not sum claims). Two fix cycles used.

**Deferred deliverable.** The Confluence HTML is deliberately not generated this pass; the owner reviews draft .md files first. Generate it with `scripts/build_confluence_html.py` once the draft is reviewed.

**History harvested from V1:** none; no V1 spec ever existed for this widget.
