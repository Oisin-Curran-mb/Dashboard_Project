# Unattended Run — Decisions and Questions (2026-08-30)

Overnight batch requested by Oisin: widgets W01–W10, Step 4 doc refresh → Step 5 V2 API spec → port into Jo's shell.

**Decision policy for this run** (as instructed): approval gates are defaulted and logged here rather than blocking. Fact gates are never defaulted — anything that would require inventing product truth (a field with no source, a view no option can produce, a Disputed sign-off finding) is rendered as a labelled placeholder and listed under "Blocked on a fact".

**Read this before opening the PR to Jo.** Everything under "Defaulted" is a choice this run made on your behalf.

## Run setup

- Branch created: `oisin-v2-port`, off `phase-2` at base commit `a9bc157`.
  This was done **before** any edit to `index.html`. The clone was sitting on `phase-2`, which is Jo's own active branch (309 commits ahead of `main`, all her watcher commits), and her `deploy.sh` auto-pushes whatever branch is checked out. Editing on `phase-2` would have auto-published unreviewed work into her live preview.
- Snapshot taken: `Widget Container Demo/index.BACKUP-batch-20260830-061519.html`
- Scope note: W08 has no Step 4 doc and is recorded as out of scope in `Final Check - Items Needing Your Review.md`, so the range W01–W10 covers nine widgets: W01–W07, W09, W10.

## Housekeeping left for you

- [ ] Three zero-byte test files could not be removed (this environment blocks delete): `Jo/repo/design-sandbox/.write-test`, `Jo/repo/design-sandbox/.sed-test`, `Jo/repo/design-sandbox/Widget Container Demo/_write-test.txt`. They are inert and cannot be auto-committed (the watcher only stages `Widget Container Demo/index.html`), but delete them when convenient.
- [ ] A stale `.git/index.lock` was present in the clone before this run started. `deploy.sh` clears it on its own, but if git complains, delete it.

---

# RUN OUTCOME: interrupted part-way. Read this first.

The run was stopped by the owner during the Step 4 / Step 5 wave. Several worker agents were killed mid-task, so the state on disk is partial and is recorded here exactly as found at the stop.

## Jo's repo was never touched

- `Widget Container Demo/index.html` is **byte-identical** to the pre-run snapshot. Verified with `cmp`.
- No commit, no push, no `deploy.sh` run. The clone is on `oisin-v2-port` at `a9bc157`.
- **No widget was ported.** W09 and W10, the only genuinely new ports in the W01-W10 range, were not started.

## What completed

- **W05 Receivable Invoices Outstanding: V2 spec written and it looks sound.**
  `Step 5 - API documents/Receivable Invoices Outstanding/v2/` holds a 723-line `.md` plus its Confluence `.html`. It ends with a proper open-questions section and it did the right thing on the fact gates: worst-case row ceilings left `[TO CONFIRM]`, and the drill-modal scope question flagged as the largest scope risk in the contract, with the note that if it resolves toward navigate-out then two of the five APIs are dropped. Worth reading before anything else.
  - Two disagreements it recorded against the Step 4 doc, both needing Feargal: the build carries **six** age bands and the spec specifies six, while the Step 4 doc still says five and still records the band change as held pending the 2026-08-25 call. And the Step 4 doc wants the widget to open the existing invoice screen rather than reproduce the transaction screen inline, while the spec describes the modal the build actually has.

## What is misleading on disk and needs your eye

- **Two empty `v2/` folders** were created and never filled, because their agents were killed first: `Step 5 - API documents/Pension Plans/v2/` and `Step 5 - API documents/Payroll Distributions/v2/`. They are empty directories, not partial specs, but an empty `v2/` folder now outranks the V1 spec in `mb-widget-port`'s path-resolution rule, so **delete them or fill them before running the port**, otherwise the port will look for a v2 spec, find nothing, and may fall through in a way nobody intended.
- **Nine Step 4 docs carry edits from tonight** (W01-W07, W09, W10, timestamps 06:03-06:25), applied by the unattended audits as doc-catches-up-to-build corrections. These were applied without review, by design of the run policy, but some agents were interrupted mid-pass, so a doc may be half-updated. Nothing here recorded per-hunk before/after text, because the agents were killed before reporting back. **Use `git diff` on `Step 4 - Widget Final Design/` to see exactly what changed.** That diff is the real record, and it is complete because the folder is under git.
- The working tree also shows modifications to files this run never opened (a `.vtt` transcript, two `.doc` files, `desktop.ini`, `Widget_Comparison_*.html`, `Dashboard Widget Mockups.html`, several `Widget_Specs` files). Those are pre-existing uncommitted changes from your own earlier work today, not from this run. Do not attribute them here.

## Why it stalled, and what to do differently

Nine widgets in parallel was the wrong shape for this work. One agent spent 2.5 hours and 166k tokens on a single widget and still had not finished writing its spec when it died. A V2 spec against the built Final is a genuinely large job, not a batch item.

The realistic unit is **one widget end to end per run**, in this order: audit, spec, lint, port, diff doc, report. W05 is the proof that one widget done properly produces something worth having.

Suggested next run, in priority order:

1. Read the W05 spec and settle its two Feargal questions, since they change its API surface.
2. Delete or fill the two empty `v2/` folders.
3. `git diff "Step 4 - Widget Final Design/"` and accept or revert tonight's unreviewed doc edits.
4. Then W09 and W10 one at a time: audit, first-ever V2 spec, port, diff doc.

---

# Continuation, 2026-09-02 (owner said "continue")

The two half-finished Step 4 audits were completed. Every hunk the interrupted 08-30 pass had applied was re-verified against the build code before being kept.

## W03 - Payroll Distributions (now stamped 2026-09-02, against FC_VERSION[3] = 2.6)

### Defaulted — applied automatically, confirm or correct
- [ ] Preamble arithmetic fixed: "Four build rounds" corrected to "Five build tags (v2.2 to v2.6)".
- [ ] v2.5 export claim narrowed from "markup byte-identical" to "styling byte-identical (only the action data attribute and title differ)", per the build's own change record.
- [ ] Data Table Sort: superseded-note added recording the build fact (`prSort:'amt-desc'` default, sortable headers, no alphabetical rule); v1 text kept as history. Does NOT settle reconciliation finding 4.
- [ ] Drill-Through: superseded-note added recording that no link-out exists through v2.6 (drill is in-widget); v1 kept as history. Does NOT settle reconciliation finding 3.

### Blocked on a fact — your call
- [ ] Reconciliation finding 2 (Jo F3): status still "Not actioned, top-priority" though build and doc already respect it; the V1 Step 5 spec still carries `total.prior`/`diffAmount`/`diffPct`. Confirm the V2 spec drops them and update the reconciliation status. (Passed to the W03 V2 spec run as a directive.)
- [ ] Reconciliation findings 3 (F8) and 4 (F6): both likely moot given the v2.6 build, but closing them is yours.
- [ ] "How Other Companies..." section still argues the rejected three-view structure with no superseded marker; left alone deliberately (twice now). Add a pointer or keep as research history?
- [ ] Build-side staleness (not doc): fc-widget-3 Purpose/Logic prose still describes v2.0; belongs to a build-final-widget pass.
- [ ] Unlogged shared gap: `.gpf-root`/`.apf-root`/`.purf-root`/`.insf-root` all miss the `.btn` family fix W03 needed (W17 export will render unstyled). Needs its own work item.

## W06 - Insurance Billing Plans (now stamped 2026-09-02, against FC_VERSION[6] = 2.4)

### Defaulted — applied automatically, confirm or correct
- [ ] Status line now records the build moved v2.0 -> v2.4 (pie restoration + sizing rounds).
- [ ] v2.3 recorded as folded into the v2.4 entry (matches the build's FC_VERSION note and Widget_Specs) rather than fabricating a standalone v2.3 entry.
- [ ] Accessibility: pie bullet added (donut `role="img"` + aria-label, per-segment titles, legend as DOM text).
- [ ] Widget States: pie's chart-empty state added; Interaction Spec: legacy hover tooltip recorded.
- [ ] v2.4 verification figures (78-assertion driver, chart-fill-check clean at five widths) quoted from Widget_Specs, NOT re-run.

### Blocked on a fact — your call
- [ ] Explore default view: pie as main view was never confirmed (`insView:'pie'` if you confirm); Table stays default meanwhile.
- [ ] fc-widget-6 Logic prose in the build stops at 2026-07-30; v2.1-v2.4 live only in the FC_VERSION comment. Needs a build-final-widget pass if you want the HTML prose current.
- [ ] Review-list W06 items (donut not built; sort toggle) describe the pre-Jo design and the drift item was waiting on exactly this audit; closing the W06 half is yours.

## W03 - Payroll Distributions V2 spec (written 2026-09-02, lint 0 HIGH / 0 MED)

`Step 5 - API documents/Payroll Distributions/v2/` + DECISIONS.md; index row 🟡 Draft. Four APIs: filters lookup, bounded summary, paginated per-distribution employee drill (permission-gated), server-streamed export.

### Defaulted — confirm or correct
- [ ] Treated Jo findings F3/F8/F6 as accepted-in-effect (reconciliation file still says "not actioned"); flagged inside the spec.
- [ ] Export specced as a server endpoint (forced by pagination); pageSize 50/200 and format set left dev-tunable.
- [ ] Employee drill specced MUST PAGINATE although the mock drill is unpaginated.
- [ ] The parallel Step 6 sign-off-aligned spec was NOT merged; flagged only.

### Blocked on a fact
- [ ] `this_period` semantics (payroll has no fiscal period in code) - Feargal + you.
- [ ] Exact payroll permission right for the employee level - Feargal + backend.
- [ ] `PR_Employee` key/display-name columns; orphaned `CompensationDistributionID` handling; null/zero SubType - backend.
- [ ] Distribution count ceiling and worst-case employees per distribution - Feargal.

### Corrections to my earlier claims
- [ ] The 08-30 note that the V1 spec "still carries total.prior/diffAmount/diffPct" was STALE: the V1 was rewritten 2026-07-27 to ban them. V2 keeps them out and cites F3 regardless.
- [ ] Conscious-look item: the V2 employee-level APIs reverse the V1's "zero personal data, ever" decision of 2026-07-27, justified by your 2026-08-25 Feargal call and your own v2.2-v2.6 build. Confirm you stand by that reversal.

## W02 - Pension Plans V2 spec (written 2026-09-02, lint 0 HIGH / 0 MED)

`Step 5 - API documents/Pension Plans/v2/` + DECISIONS.md; index row 🟡 Draft. Three APIs: district lookup, one NEW reshaped `/summary` (plans + district cells + counts in one response), existing appointee-detail DTO unchanged.

### Defaulted — confirm or correct
- [ ] W02's Step 6 dossier has no reconciliation file, so every Jo finding is Unreviewed; specced the built Final and queued her contract-touching flags for your statusing instead of halting.
- [ ] Main design call: one NEW `/summary` endpoint replaces the V1 "strict 1-to-1 with existing endpoints" posture (drops `/chart` and the per-district fan-out). Your 2026-07-27 V1 decision said 1-to-1; the fan-out fallback stays viable and is recorded in DECISIONS.md. **This is the likeliest disagreement in the whole batch.**
- [ ] "All Districts" moved from server to client-side prepend.

### Blocked on a fact
- [ ] Worst-case volumes (districts/org, plans/org, appointments on largest plan) - Marvin/SME; conditions all three BOUNDED verdicts.
- [ ] Unentitled-user response shape (403 vs empty 200 vs hidden) - you.
- [ ] Null `DistrictID` rows in production; `PB_ControlTable` column names; appointee-count basis (assignment rows vs distinct persons) - you.
- [ ] Pre-existing `Charge` empty-string defect is the only backend fix item carried forward.

## W01 - Budget Compared to Actual V2 spec (2026-09-02, lint 0 HIGH / 0 MED)

`Budget Compared to Actual/v2/` + DECISIONS.md. Three APIs: bounded data read (max 31 buckets, pre-signed variance, null on zero budget), report lookup + lineCount, report-lines lookup + income/expense/mixed type. Nothing paginates.

- [ ] Defaulted: proceeded past nine Unreviewed dossier flags (F1-F9), all queued in Still needs sign-off; conflicting params -> 400; deleted line -> named error, never silent-empty; grain change specced as server re-query (the build's instant re-render is a fixture property).
- [ ] It reports your review-list item on Line Description as ALREADY ANSWERED in code (`GLSpecialReportLine.Name`, customer-created, closed 2026-07-21) and drill-through as a decided scope cut; only the weekly/day grain is genuinely open (Feargal: perf/rollup posture).
- [ ] Dropped from contract as unconsumed: `ActualYTD`/`BudgetYTD`, the export endpoint, `X-Year-ID` header. Confirm.

## W04 - Remittance Pledges V2 spec (2026-09-02, lint 0 HIGH / 0 MED)

`Remittance Pledges/v2/` + DECISIONS.md. Four APIs: per-activity pacing summary; paginated pledge drill (fixed sort shortfall DESC); derived instalment schedule (receipts oldest-first, firstMissedDate); view-scoped server export. Build v3.5 vs doc v3.5a ruled CSS-only, no halt.

- [ ] Sign-off Readiness row 7 (receipts-only path) carried OPEN and BLOCKING, exactly as standing; the Youth Ministry receipts-only example row is labelled blocked design intent.
- [ ] Likely disagreements it flags: dropped the `receiptsThrough` alias V1 kept; export specced as a real endpoint though the build's button is a Rule 11 stub; activity `expected` redefined as SUM of per-pledge expecteds (V1's single-term pacing breaks under mixed terms); donor names supersede V1's no-personal-data boundary; no user sort on the pledge list.
- [ ] Fact gates: `RM_PledgePercent` linear-vs-stepped (load-bearing); Frequency/Duration semantics; receipt attribution; the garbled 500-800 pledge volume from the Eoff transcript; permission right + denied UX.

## W07 - Deposit Accounts V2 spec (2026-09-02, lint 0 HIGH / 0 MED)

`Deposit Accounts/v2/` + DECISIONS.md. Four APIs: scope options + typeahead; summary (distribution groups, pre-signed diff); paginated table (server search, whitelist sort); point-in-time balance series.

- [ ] **The conflict gate caught a real disagreement:** Step 4 says Compare To drives "the overlaid line in Trend"; the build's `depFTrend` has NO comparison overlay. The spec funds no overlay and records both sides in sign-off item 2. Your call which is right.
- [ ] The Disputed dossier grain finding (type-first vs account-level) is recorded both-sides, no winner, as required.
- [ ] Likely disagreements: table search made server-side across the full scoped set where the build searches only the visible page; no invented cap on account-grain series (conditional on Marvin's volume ceiling instead); V1's one-vs-split question closed at four APIs; `inceptionDate` and per-group counts dropped as unconsumed.

---

# Continuation, 2026-09-07: gates-off completion run, W11 + W13 + W15 + W16 + W17

Owner instruction: all remaining V2 docs completed, nothing halts. Mode used: every doc finishes; approval gates defaulted and logged; unknowns carried as [TO CONFIRM], never invented.

## W11 - Fixed Asset Values (Step 4 stamped 2026-09-07; first-ever spec, lint 0 HIGH / 0 MED)

**The audit found the doc's premise was dead:** the Jo port (v2.0-v2.2) was deleted on your instruction and the built Final is the 2026-09-03 from-scratch rebuild (52-asset register, 2 views, server-paged grid). The doc now describes the rebuild; the "locked"/"still undesigned" contradiction is resolved (your 08-30 hold lifted per your 09-07 instruction, noted in the doc).

### Defaulted — confirm or correct
- [ ] Nine red hunks applied (status, build record, views 3->2, Glance/Explore/Detail sizes, server sort/paging, filters, Rule 11 caveat, What Got Cut, new Sign-off Input section with Jo's J1-J7 recorded Unreviewed).
- [ ] Sign-off Readiness row 7 marked "closed by supersession" (agent's call; reopen if you disagree). Rows 10-11 added; 10 rows now open.
- [ ] Spec: pageSize max 100; invalid sortBy/valueType -> 400 (mock silently falls back; treated as fixture); stale valueId -> well-formed zero; server-ordered groups; five APIs incl. a preferences GET/PUT pair (Modern API persists nothing today).

### Blocked on a fact — your call
- [ ] DEFAULT VIEW CONFLICT: amended handoff says Donut, built code says Asset Detail (`FAF_STATE.view='assets'`). Spec follows the build. Settle it (Sign-off row 10).
- [ ] The paged/sorted/totalled grid contract and any SalvageValue exposure exist NOWHERE in legacy/Modern API docs (the unpaged dollarType grid endpoint does exist): central NEW backend work, unscoped.
- [ ] Six-dimension / five-measure feasibility never verified against real FA tables; three account dimensions deliberately return empty lists; org-wide KPI math stated in no source; volume ceilings uncited.
- [ ] Jo's dossier flags J1-J7 all need accept/reject/dispute statuses (no reconciliation file exists).
- [ ] fc-widget-11 chrome in the BUILD is stale (Logic panel still says the Final was deleted; blurb describes the dead port) and Widget_Specs has no 09-03 rebuild entry: needs a build-side chrome pass, not a doc edit.

## W13 - Purchasing Management (Step 4 stamped 2026-09-07; first-ever spec, lint 0 HIGH / 0 MED)

Audit: build never moved past 08-19 (FC_VERSION 2.6, all rounds same-day); four doc catches applied (headline wording, 2.0 -> 2.6 status line, Explore/Detail column description). The `.purf-root` export-styling worry from W03's audit checked out clean. NOTE: the audit agent also wrote a side file `Unattended Run - Decisions and Questions (2026-09-07).md` in this folder; its W13 audit items live there.

Spec: `Purchasing Management/v2/` + DECISIONS.md. Seven APIs, and this is the first widget with WRITES: summary, board (server TOP-N per state), paginated table incl. archive, approval-paths reuse, POST transition, POST hold, POST payment-approvals.

### Defaulted — confirm or correct
- [ ] POST payment-approvals (API 7) is specced from the built behaviour but GATED with a do-not-build banner pending your C3 redirect-vs-rebuild ruling. Alternative was omitting it; flag if you would rather it were absent.
- [ ] Close/Void folded into the transition endpoint; hold kept separate; Detail board capped at cardsPerState (25/100) where the build renders everything and scrolls.
- [ ] Server-owned `isOverdue` instead of exposing a due date; record-modal edit surface treated as record-screen scope (navigation), not dashboard APIs.

### Blocked on a fact — your call
- [ ] C3 dispute (redirect vs rebuilt payment flow) decides whether API 7 exists at all.
- [ ] Voided-request financial reversal behaviour; Rejected visibility for non-admins; paymentStatus read source; hold read/write backing; archive serving (Sign-off rows 9-13); Department/Year/Overdue fields (rows 1-3); volume ceilings for the caps.
- [ ] Dossier 11.6 and stable-columns 11.5 still Unreviewed; the spec's table-column commitment is provisional on them.
- [ ] Is a submitted-but-unissued payment stage needed? The two-value paymentStatus may be insufficient.

## W15 - Bank Balances (Step 4 re-stamped 2026-09-07; first-ever spec, lint 0 HIGH / 0 MED)

**The 08-30 doc was a rebuild behind:** the Final was rebuilt 2026-09-04 (bkF block; the v2.0 bankF port discarded 09-03). Nine hunks applied: two presentations not three (Account Cards removed 09-04), Jo's horizontal diverging bar, server paging (size 12) replacing trimming, the Overdrawn-only chip, Glance/Explore/Detail sizes, Sign-off Readiness grown 6 -> 10 rows, new Sign-off Input (Jo) section with everything Unreviewed (no reconciliation file).

Spec: `Bank Balances/v2/` + DECISIONS.md. Three read-only APIs: paginated accounts (overdrawnOnly param, whole-set overdrawn count), per-account seven-line activity breakdown (entirely NEW, the waived Rule 11 ask, blocks Single Account mode), and an accounts lookup for the picker.

### Defaulted — confirm or correct
- [ ] pageSize max 100; past-the-end clamps and echoes (build's rule); picker as a separate third endpoint; three unused build aggregates dropped from the contract.
- [ ] Spec follows the built paged-full-set model, NOT Ben Lane's top-3-5-plus-view-all preference (open design question, carried).

### Blocked on a fact — your call
- [ ] The paged accounts endpoint exists in NO Modern API doc: central new backend work, unscoped.
- [ ] Worst-realistic account ceiling ("up to 50, sometimes more" is the only citable figure); permission right + no-right treatment.
- [ ] Jo's dossier all Unreviewed, incl. her available-vs-unrestricted-cash "Do now" and a LIVE localisation defect (pound sign on a US org).
- [ ] SME attribution conflict: dossier says "Marvin", Step 2 says Ben Lane, same 13 Jul interview. Recorded both-sides.
- [ ] No FC_VERSION[15] exists in the build (badge renders empty); dated bkF comments are the only version record. Add one?
- [ ] Build-side stale comments ("three PEER presentations", bar-gap string naming the removed Cards view) need a chrome pass, not doc edits.

## W16 - Accounts Payable By Due Date (Step 4 stamped 2026-09-07; first-ever spec, lint 0 HIGH / 0 MED)

Audit: the doc's Fine-Tuning entry was current but the BODY still described the pre-Final donut/cards design. Ten hunks applied (due-date popover + horizon chip, no view switch, aging-band hero table, all-columns sort with larger-amount tiebreak, Glance/Explore/Detail, empty/loading rows). Full before/after in the 2026-09-07 side questions doc. `.apf-root` btn-family check: clean, not a defect.

Spec: `Accounts Payable By Due Date/v2/` + DECISIONS.md. Four read-only APIs: aging summary (Glance fires it alone), paginated invoices (full-set band subtotals), due-dates facet (replaces the modern /filters read), top-vendors rollup (Detail only). The modern /chart endpoint is dropped: the Final has no chart.

### Defaulted — confirm or correct
- [ ] pageSize 50/200, vendors limit 5/20; snap rule contracted client-side with server zero-response fallback; vendor search moved server-side though the build filters client-side.
- [ ] APIs 1/3/4 deliberately ignore the due-date selection (matches the build) - reads oddly, confirm intended.
- [ ] API 4 could fold into API 1 via a flag if four APIs feels like over-decomposition.

### Blocked on a fact — your call
- [ ] TOP ITEM: aging basis (due date vs invoice date) never confirmed against the real API - load-bearing for every band, overdue and horizon figure. Backend + Feargal.
- [ ] Actionability dispute recorded both-sides, unresolved: Jo/SME 11.2 says pay/schedule from the widget is its biggest reason to exist; Feargal 2026-08-25 says it stays a focused overview. A future write surface hangs on this.
- [ ] Dossier 11.3/11.4 want a date-ordered chart; the Final has none. 11.6 Bank Balances pairing absent everywhere. Both Unreviewed.
- [ ] Entitlement enforcement is NEW (modern module access not enforced today); live GBP localisation defect; X-BankAccountID vs X-Company-ID header oddity in Widget_Comparison_Classic; div-table accessibility parity [TO CONFIRM - you].

## W17 - Gifts Pledges (Step 4 stamped 2026-09-07 vs v1.3; first-ever spec, lint 0 HIGH / 0 MED)

Audit: seven catch-up hunks (no-alphabetical-sort truth, campaign filter narrows not highlights, built interactions, empty/loading states, the "Open in Gifts and Pledges" Rule 11 stub flagged against the export-only constraint). The W03-audit prediction that `.gpf-root` misses the btn styling is FALSE: W17's root is `remf-root gpf-root` so exports render styled; correct that claim at its source when convenient.

Spec: `Gifts Pledges/v2/` + DECISIONS.md. Five read-only APIs: campaign summary (adds pledgeDue/goal/progress to the modern 4-field DTO, nearly all NEW), campaigns lookup, paginated most-behind-first pledges (behindOnly serves the top-5 modal), gifts-per-pledge, server-side export.

### Defaulted — confirm or correct
- [ ] Received basis specced as PLEDGE-LINKED GIFTS ONLY (your 08-19 decision, what the build does). The Modern API's TotalRaised counts all posted gifts. This blocks every summed figure until backend confirms which is truth.
- [ ] Proration anchored on rangeEnd; the legacy anchors on today, flagged as a defect not to replicate. Raw progressPercent served instead of the ProgressStatus enum.
- [ ] pageSize max 100; Excel export; five-API decomposition (may read heavy for a 2-row live org).

### Blocked on a fact — your call
- [ ] % Due status inconsistency INSIDE the Step 4 doc: the CONFLICT row says disputed, Sign-off Readiness #2 says RESOLVED with live proof. Collapse it or keep it, your call; nothing auto-picked.
- [ ] Goal-met colour: build says green, the comparison doc documents the API's status as "red (goal met)". Backend to confirm the mapping.
- [ ] GF_Campaign vs GF_Purpose keying for Goal; GF_Pledge term/frequency/installment columns; volume ceilings.
- [ ] Jo's dossier all Unreviewed: % Due -> % Fulfilled relabel, data-as-of stamp, GBP defect, entitlement/empty behaviour.
- [ ] Four v1.2 judgement calls (bar cap lifted, trim removed, legend counts, best-first order) still await your review; fc-widget-17 Logic prose is stale vs v1.3 (build-side chrome pass, not doc).

---

# BOARD COMPLETE (2026-09-07)

Every in-scope widget (W01-W07, W09-W11, W13, W15-W17; W08/W12/W14 deferred) now has a current, audit-stamped Step 4 doc AND a lint-clean V2 API spec. Confluence HTML for the 09-07 specs (W11, W13, W15, W16, W17) is deferred until you approve the drafts; the six earlier specs already carry theirs. Before the PR to Jo: read this doc top to bottom; the recurring cross-widget themes are the GBP localisation defect (three widgets), Unreviewed Jo dossiers with no reconciliation files (W02, W11, W15, W16, W17), and volume ceilings needed from Marvin/Feargal almost everywhere.

## W06 - Insurance Billing Plans V2 spec (finished 2026-09-02, lint 0 HIGH / 0 MED / 9 LOW)

Attended run, queue item 1. The 08-30 batch drafted the spec `.md` and was then cut off before writing DECISIONS.md or the index row. Treated the draft as untrusted and diffed it against build v2.4: **it held up.** Every worked figure cross-foots against the real `INSF_PLANS` dataset (enrolled 128 + 54 + 96 + 71 + 0 = 349; cost 57600 + 33480 + 3648 + 639 + 0 = 95367), the interaction surface is fully covered, and all four legacy chart rules survive. Conflict gate CLEAR, as recorded before the cutoff. Two APIs: the existing insurance-type lookup reused unchanged, and one bounded nested data read with `typeId` as a server param.

Now complete: `Insurance Billing Plans/v2/` spec, `Insurance Billing Plans/DECISIONS.md`, Step 5 index row.

### Defaulted - applied automatically, confirm or correct

- [ ] Added an "Initial view, sort and expansion state" coverage row from the build: Table view, enrolled descending, all type groups collapsed (`INSF_STATE.insView` `table`, `insSort` `count-desc`, `insExpanded` `{}`). The call sequence already assumed a table default without citing the build fact behind it, which is what the Explore-default question turns on.
- [ ] Made the sort coverage row state its per-key default direction: plan name ascending, enrolled descending, either direction on click.
- [ ] **Table stays the Explore default.** Pie as the Explore default was never put to you, so it was not adopted. Pure client view state, nothing in the contract blocked. Carried as sign-off item 3 so it cannot be flipped silently.
- [ ] Confluence HTML NOT generated, per the run handoff. Deferred until you have read the draft. The V1 HTML pair at the folder root is untouched.
- [ ] Recorded the v2.2 pie restoration and the v2.4 measured re-sizing in DECISIONS.md only, as non-contractual presentation history. The chart renders client-side from the same API 2 rows as the table, so neither build changes the contract.

### Blocked on a fact - your call

- [ ] **Fetch posture, and the likeliest disagreement here.** V1 was a single nested call with a client-side type filter, on an owner instruction that chose fetch-once. V2 makes `typeId` a server param with a re-query per change, because no plan-volume bound has a citable basis. Response shape is identical either way; a fetch-once ruling removes the `typeId` param and makes API 1 derivable from API 2's unfiltered response. Not resolved in either direction (sign-off item 4).
- [ ] Dependent rows in `cost`: whether dependent enrolments contribute rate rows to the SUM. `Rate` sits on `IBEmployeePlan`, `enrolled` includes `IBEmployeeDependent`. Backend dev with the SME.
- [ ] `cost` availability. The Developer Punch List's W06 entry confirms only the Plan Type filter, the Bar / Donut / Table views and the Total Enrollment KPI. `cost` is not on it either way, and per instruction the build renders no unconfirmed marker.
- [ ] All sign-off dossier findings are unstatused (no reconciliation file). The four that would touch this contract if accepted: employee-vs-dependent split, participation rate, a drill to enrollees, a data-as-of stamp.
- [ ] Volume ceilings for types, plans and enrolment rows at a large org - Marvin; the BOUNDED verdict currently stands on org-configuration reasoning alone.
- [ ] Entitlement presentation (Product) and the modern permission right protecting the two endpoints (you, from code). Defaulted to hidden, matching legacy.
- [ ] Per-widget filter-state persistence. Legacy stores the last `TypeID` in `IBDataPanelRecord.TypeID`; V2 treats this as a platform concern, not a response field. Product.

---

## W10 - Loans With Balance Due: Step 4 audit + first V2 spec + port pilot (2026-09-02)

Attended run, queue item 2, all three stages done in order at your instruction (Step 4, then Step 5, then port). Built against Jo's `index.html` at base commit **a9bc157** on branch `oisin-v2-port`. **Nothing pushed.**

Written: 5 accepted doc fixes into the Step 4 doc · `Loans With Balance Due/v2/` spec (lint 0 HIGH / 0 MED / 1 LOW) + `DECISIONS.md` + Step 5 index row · the port into Jo's shell (691 insertions, 1 deletion) + `_port-drivers/jo-port-driver.js` (new shared harness) + `w10-loans-mb.driver.js` · the W10 section of the Jo-vs-Oisin diff doc pair · this manifest row.

### The gate stopped the run, and you ruled

- [ ] **Feargal item C2 ruled NON-BLOCKING for this build.** The Step 4 banner says the loan-entry process does not provide start and end dates, so date-based and past-due calculation should be removed, and the doc's own words were that the aging bands would then be "fabricated rather than merely unnecessary". Builds v3.0/v3.1 had gone the other way and made the ranges the primary filter. You confirmed the v3.1 design is good, so it was specced as-is and C2 is recorded as a live product question, not a hedge in the contract. **I read your "confirmed to be good" as covering the DESIGN, not as closing rows 1 and 5.** Correct me if you meant both.

### Blocked on a fact - your call, nothing defaulted

- [ ] **Sign-off row 1, Status field.** No explicit active/arrears field in the source data. Not built, not specced, no status filter invented. Backend team, not yet named.
- [ ] **Sign-off row 5, the LIFO gap.** The Modern API buckets by raw `today - InvoiceDate` with no payment subtraction; legacy subtracted each posted payment from the oldest bucket with overflow into the newer one. Step 4 has decided the legacy allocation must be replicated, so EVERY range figure in the contract is `NEW` provenance and a raw-age build returns different numbers. Step 1 calls it the most consequential data-accuracy gap in the comparison exercise. Backend team, not yet named.
- [ ] **NEW divergence found while writing the spec: one range per loan vs legacy's per-invoice split.** Even once LIFO is replicated, the donut will not equal the legacy pie, because the build assigns a loan to the single range of its oldest unpaid invoice where legacy spread one loan's balance across ranges. Design-level, not a backend bug. You + backend.
- [ ] Worst realistic volume uncited (Marvin); `X-BankAccountID` context vs `[LN_Type] WHERE TenantID=ctx` scoping mismatch; `nextPaymentDueDate` has no traced due-date column on `LNInvoice` (marked `UNVERIFIED`); 90-day dormancy threshold unapproved.
- [ ] No `Reconciliation - Loans With Balance Due.md` exists, so every dossier flag is unreviewed. Surfaced as questions with no side picked: ladder shape (dossier's four labelled buckets vs the built five ranges), a PAR metric, an org currency field, a "data as of" stamp. You assign statuses.

### Defaulted - applied automatically, confirm or correct

- [ ] **Step 4 doc: 5 fixes applied, all accepted by you in the diff widget.** The doc's v3.0/v3.1 banners and Size behaviour table were already current; four older sections were not. Fixed: the aging ladder (doc said four bands Current 0-29 / 30-59 / 60-89 / 90+, build has five with different boundaries and Current meaning not-yet-due); the Status row (tabled as a filter the build does not have); the Interaction Spec "Switch View toggle available at Medium and Large" (superseded size model); and the Empty and Loading rows (said unspecified, build has `loanFEmpty` and `loanFSkeleton`). I also repointed the Interview Q&A cross-reference that quoted the old Filters wording, since the accepted H1 left it dangling.
- [ ] **`MUST PAGINATE` on the loan list.** 3 loans live measures adoption not portfolio size, and a demo dataset is never a ceiling basis. No citable bound, so sort/filter/totals moved server-side; pageSize 50/max 200, `loanId` tiebreaker. **This is the likeliest thing you will disagree with:** confirming a real ceiling collapses it back to one bounded read with client-side sort.
- [ ] Four APIs (summary / paginated list / type lookup / detail with payment history inside). Server owns the five range ladder and returns all five including zeros, so the muted inert $0 row is funded without the client hardcoding ranges. The range filter deliberately does NOT re-fire the summary (the donut is the control, not a filter on itself), stated in the spec so a dev does not "fix" it into the 11.3 antipattern.
- [ ] `ninetyPlusPct` dropped as unconsumed (only the uncalled `loanFAgingPanel` rendered it) while `ninetyPlusAmount` is kept because the context line uses it. Reads inconsistent; restoring the portfolio-risk block brings the percent straight back.
- [ ] `borrowerName` = `LNLoan.Name`, not `CorePerson` via `PersonID` (nothing on screen consumes a separate person field). `payments[].reference` = `LNPayment.CheckNumber` for the modal's "Method" column; no method enum is confirmed so none invented.
- [ ] Port naming: prefix **`lon`** not `loanF`, per the manifest reservation. Verified the reason is real: Jo already declares `.loan-c-acct`, `.loan-head`, `.loan-body`, `.loan-band-row`, `.loan-empty`, `.loan-allset`, `.loan-sk-row`, all of which our mockup reuses verbatim, so `loanF` with `.loan-*` classes would have restyled her live widget.
- [ ] Port integration style (b), fully self-contained under `data-lon`, following the depF/W07 precedent. Her `click` and `input` listeners, `popContent()`, `triggerSelector()` and `renderModal()` untouched.
- [ ] Her `loanScopedEmpty` / `loanControlsHeader` "No <type> loans" state has no counterpart in our Final and was NOT ported; a type with nothing outstanding renders our header plus a "No loans match this selection." zeroline. Not owner-directed, so recorded in the diff doc as a plain difference rather than justified.

### Placeholdered, never invented

- [ ] "Open loan" out-destination (no confirmed target, Step 4 Sign-off row 3), "Record a contact" (no write endpoint in the v2 contract), and Excel export (no loans export endpoint) are all rendered as visible labelled placeholders.

### Corrections to my own earlier claims

- [ ] My first pass at the dataset totals was **wrong**: I read 124092.96 / 18750.00 / 13900.00 because the extraction regex swept in nested `payments[].amount` values alongside each loan's own `amount`. Code-true is **112037.96** (9 loans) / 16720.00 / 13400.00, confirmed against the `fc-widget-10` prose and recomputed from the constants. The spec agent caught it; every worked example uses the code-true figures.

### Housekeeping

- [ ] The three inert zero-byte test files in Jo's clone are still awaiting manual deletion (deletion is blocked in the mount). Now joined by `index.BACKUP-W10-20260902-174651.html`, the session snapshot, which is byte-identical to the 08-30 baseline and safe to remove once you are happy with the port.

---

## W09 - Payroll Scheduled Time Off: Step 4 audit + first V2 spec + port (2026-09-03)

Queue item 3, the last widget. Same three stages in the same order. Built against Jo's `index.html` at base commit **a9bc157** on branch `oisin-v2-port`. **Nothing pushed.**

Written: 5 doc fixes into the Step 4 doc · `Payroll Scheduled Time Off/v2/` spec (lint 0 HIGH / 0 MED / 1 LOW) + `DECISIONS.md` + Step 5 index row · the port (1575 insertions, 1 replaced line, CRLF preserved) + `w09-pto-mb.driver.js` · the W09 section of the diff doc pair · this manifest row. **The W10 driver was re-run and still passes 228/228**, which is the point of the shared harness.

### Applied automatically - doc caught up to build (reversible, review if you like)

- [ ] **Verification stamp.** was: "Last verified against build: 2026-08-08, build-final-widget driver + final-check-rules.py (v2.8, owner change:" · now: re-stamped to 2026-09-02 against Final v3.3, noting the body describes v3.3, that the Final Check tab's Logic prose still stops at v2.8, and that one build gap stands on Data Table Sort. **Your doc was in better shape than its own stamp implied:** the body had already caught up to v3.3 on 2026-08-30, so the "five versions stale" impression the stamp gave was wrong. Only the stamp and four older sections had fallen behind.
- [ ] **Widget States, Empty row.** was: "What the widget itself renders when no records exist: *Not yet specified - needs a pass.*" · now: describes `payFEmpty` plus the two distinct calendar empty states (an empty month versus a filtered department matching nothing).
- [ ] **Interaction Spec intro.** was: "Documented behaviour, from the legacy build the design preserves:" · now: says the first rows record LEGACY behaviour and the design does not preserve all of it, naming the 2026-08-07 restructure and v3.0's bulk-approve removal.
- [ ] **The three legacy checkbox rows.** was: employee-level checkbox bulk-approves, day-level checkbox approves one, unchecking reverses, all presented as current · now: each marked legacy and labelled either NOT carried (the employee-level bulk approve, deleted in v3.0) or carried-but-not-as-a-checkbox (the per-day Approve button, and Undo).
- [ ] **Expand/collapse and where approve is live.** was: "3-level list, Department to Employee to Day; collapse defaults per size" and "Medium, Large, and Expanded ... in the modal" · now: two grouping levels with a person expander collapsed by default at every size, and Explore/Detail under Rule 12 with no modal.

### Blocked on a fact - your call, nothing defaulted

- [ ] **Queue ordering gap, unchanged from the 08-30 audit.** The doc specifies Department alphabetical, then Employee alphabetical, then Day chronological. `payFQueueOrdered` sorts groups **only** under Group by Department, **never** sorts people, and **never** sorts day-lines. Implement the documented sort, or restate the rule. You.
- [ ] **Bulk approve: your v3.0 removal versus Jo's dossier asking for it to be added** (section 9, decision 11.1, and the dossier's states table "Bulk approve should confirm"). Specced the project's design, per-day only, with both positions recorded and no side taken. You.
- [ ] **An explicit reject state:** the dossier asks for one, the project reduced to two statuses. Unreviewed. You.
- [ ] No `Reconciliation - Payroll Scheduled Time Off.md` exists, so **every dossier flag is unreviewed**. You assign statuses.
- [ ] **The approval-authority filter is not implemented on the Modern API**, so as it stands every supervisor would see every employee's time off. Treated as a confidentiality gap, not a nicety: the spec applies authority to the reads as well as the write, and the port renders it as a labelled placeholder. Backend team, not yet named.
- [ ] **No inline approval write endpoint exists** for the widget's headline action. Specced as NEW. Backend team.
- [ ] **No `PRCompany` custom leave-type column names**, static labels only. Specced as NEW via a labels endpoint. Backend team.
- [ ] Pay-group grouping needs an **indirect join** through `PREmployeeCompensationDetail.PayGroup`; `PREmployeeOffSchedule` has no pay-group field. Plus the employee master, display-name column and approver-identity column. Backend team.
- [ ] Confirm prompt, success feedback and failure handling for approve; what a no-authority user sees; loading, error and partial presentation. You and design.
- [ ] Counting-window default and the time-zone basis of the outstanding split; whether the queue's "pending" should exclude outstanding to match the Glance split; display-name sort basis; whether a hidden leave-type slot counts toward a year total; worst-realistic row counts for four datasets, which have no basis in any source. You / Marvin.
- [ ] **New, raised by the spec pass and not in any doc:** with a one-month window, pending day-lines from earlier months are neither counted nor reachable, so **an outstanding line can never be cleared from this widget**. Raised, not resolved. You.

### Defaulted - applied automatically, confirm or correct

- [ ] **Seven APIs** (labels, summary, paginated queue, calendar month map, one date's people, per-employee context, and the approval write). May read as over-decomposition; labels and the day-detail call are the two most likely you would merge.
- [ ] **The queue paginates, at PERSON grain.** This is the largest gap between the mock's feel and the contract: the build renders a whole month client-side, which only works because the demo dataset is 27 day-lines. Person grain follows v3.0's deliberate change of the cap unit from day-lines to people.
- [ ] The write is a **`PUT` desired-state** call, so idempotency comes by construction and a double click cannot rewrite an audit date.
- [ ] `approvedCount` and `totalDayLineCount` dropped as unconsumed; the two pending populations given distinct names (`pendingTotalCount` versus `pendingUpcomingCount`) rather than letting "pending" mean two things.
- [ ] The shared `asOf` anchor doubles as the outstanding boundary, so the derived state has one reference rather than each client's clock.
- [ ] **Port: the calendar's department control is Jo's `.filter-chip` and menu, not our Final's native `<select>`.** The Final's reason for the select was file-specific (`.filter-chip` was declared under nine roots in the mockup and `.payf-root` was not one), and in Jo's shell `.filter-chip` is global and her own `pto` widget uses it for both filters. Same reasoning moved marker colours to tokens and per-widget state onto the registry object in place of the `PAYF_STATE` singleton.
- [ ] Port naming verified before building: all 66 function renames, 14 constants and 64 classes collide with **none** of Jo's, and `ptof-` is distinct from her `pto-`. **Her `ptoFindEmp`, `ptoFindRec` and `ptoFmtDate` also start with `ptoF` and are hers**, byte-verified untouched.
- [ ] Two undocumented build behaviours found in code and specced deliberately: the queue's pending counts **ignore** the Status filter, and the calendar's department option list spans the whole dataset while each count is month-scoped, so a zero-count option is reachable.

### A defect found in the Final, carried not patched - your call

- [ ] **The Explore "N more in Detail size" note counts DAY-LINES, not people.** The cap itself is right (6 people shown, the 7th withheld whole), but the note reads "4 more" when exactly one person remains, because `seenP[pk]=(people<cap)` stores `false` for an excluded person so the guard cannot tell "unseen" from "seen and excluded". Present identically in the Final and the port. Carried faithfully and asserted at its real value, consistent with how the sort gap is carried.

### Shell gap, flagged not invented

- [ ] **Jo's shell has no amber or warning colour token.** Her `.pto-pill.warn` and `.mys-hpill.warn` both fall back to neutral `--wn-200`; the only semantic colours are the positive greens and negative reds. Approved and Outstanding map onto her tokens, but Pending's amber (fixed by the Step 4 Fine-Tuning Notes) had to be declared locally as `--ptof-st-pend`.

### Housekeeping

- [ ] `index.BACKUP-W09-20260903-102735.html` joins the earlier snapshots awaiting manual deletion.
- [ ] A stale `.git/index.lock` sits in the design-sandbox clone. It did not affect this run, since nothing here commits, but it will likely block your first `git add` when you go to push. Safe to delete if no git process is actually running; deletion is blocked from my side in the mount.

**The queue is now empty.** W01-W07 re-porting against their V2 Finals, and the PR to Jo, are both owner decisions and were deliberately not started.

---
