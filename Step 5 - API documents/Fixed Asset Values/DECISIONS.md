# Fixed Asset Values — DECISIONS

Dated log for the W11 spec folder. History and rulings live here, never in the spec body.

## 2026-09-07 — First V2 spec written (unattended run, owner run-to-completion policy)

**Context.** First-ever API spec for W11: no V1 exists, nothing harvested. Written against the built Final in the Final Check tab (`faF`/`FAF_` branch, build version 3.6, the 2026-09-03 from-scratch rebuild; the earlier 2026-08-30 port of Jo's build was deleted by owner instruction and nothing from it is reused). Ground truth: the Step 4 doc `W11 - Fixed Asset Values.md`, audit-stamped 2026-09-07. Codebase grounding: `Widget_Comparison_Classic.html` (FixedAssets legacy panel + fixed-assets Modern API panel) and the Step 1 research doc. Confluence HTML deliberately NOT generated this pass: owner reviews drafts first; regenerate from the .md when instructed.

**Conflict gate — default view (material, gate defaulted, not resolved).** The amended build-requirements handoff says the Donut is the default view; the build initialises `FAF_STATE.view='assets'`, so the widget opens on the Asset Detail table. The skill's rule is to halt; the owner's standing run-to-completion instruction for this run defaults the gate instead. The spec specs the BUILT behaviour (initial Explore/Detail load fires API 3) and carries the conflict as Still-needs-sign-off item 1 with the consequence stated (if Donut wins, API 3 drops from initial load). Owner to rule.

**Jo's dossier findings J1-J7 — all Unreviewed (gate defaulted).** Per the skill, Unreviewed findings block the parts they touch. Under the same run-to-completion instruction the spec was completed anyway, with all seven carried verbatim into Still-needs-sign-off item 11 and the touched surfaces named (API 1 field set, API 2 group naming, localisation). No finding was treated as accepted or rejected.

**Precision correction to the audit wording.** The 2026-09-07 audit note said the grid endpoint "exists nowhere in the comparison docs". Checked directly: `Widget_Comparison_Classic.html` DOES document `GET /api/dashboard/fixed-assets/grid?valueType&valueId&dollarType` returning the full unpaged `FixedAssetsGridRowDto` list. What exists nowhere is the paged / server-sorted / totalled contract the build mocks (`sortBy`, `sortDir`, `page`, `pageSize`, `totalCount`, `totals`, `pageIndex`, `pageCount`) and any per-asset SalvageValue exposure. The spec words the finding that way (Still-needs-sign-off item 2) rather than repeating the broader claim.

**Decomposition verdict.** Five APIs: org summary (NEW), group totals (NEW re-shape merging the existing `/values` + `/chart` reads: zero-total groups included so the client can name them, `assetCount` added, `dollarType` dropped), paged grid (NEW extension of the existing grid), preferences read and write (NEW; Modern API persists nothing today). The existing `/type-options` and `/dollar-options` static-array endpoints are declared out of contract; both enums ship in the client.

**Defaults taken this pass (defaulted, not owner-ruled; each reversible):**
- `pageSize` default 10 (owner instruction in the build) with a spec-imposed maximum of 100.
- Non-whitelisted `sortBy` / unknown `valueType` / out-of-range `pageSize` rejected HTTP 400 (the mock silently falls back to tag order; treated as fixture behaviour, not contract).
- Stale/unknown `valueId` returns a well-formed zero response, not an error (a stale saved preference is an everyday state); client falls back to the first group.
- Page-past-end clamps to the last page and echoes the served `pageIndex` (matches the build's clamping).
- Sort order always terminates `tagNumber ASC, assetId ASC`; the build uses tag alone, but tag uniqueness is unconfirmed, so the id terminates the order.
- Groups response server-ordered (alphabetical, "not assigned" last) so menu and donut share one ordering; the build sorts client-side.
- No shared snapshot param across calls; per-response `asOf` echo, drift between API 2 and API 3 accepted and stated (the two views never render simultaneously).
- "not assigned" wire sentinel shown as the zero guid in examples, flagged [TO CONFIRM - backend team].
- Preferences modelled as a widget-scoped GET/PUT pair against the legacy `SSUserTenantPreferenceRepository` store; whether a shared dashboard preference service should own this is [TO CONFIRM - backend team].
- Download control carried as an unfunded gap (possible sixth API), not improvised.

**Lint.** spec_lint.py: HIGH 0, MED 0, LOW 2 (informational API-count listing; one prose sentence containing "reconcile" with no arithmetic, by design). Two cycles.

**Rule 11 caveat carried.** The build's asset register is illustrative mock data, never verified against Shelby's real fixed-asset tables; every example figure in the spec is illustrative and internally reconciled, nothing more.
