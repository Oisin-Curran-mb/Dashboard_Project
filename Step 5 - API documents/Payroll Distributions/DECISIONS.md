# Payroll Distributions (W03) - Spec Decisions Log

Dated log of decisions, conflicts and history for this widget's API specs. The V2 spec in `v2/` is a present-tense contract and carries none of this; this file is where the history lives.

## 2026-09-02 - V2 spec written (unattended-policy run)

**What:** `v2/Payroll Distributions - API Spec.md` (+ Confluence HTML) written from scratch against the built Final, `FC_VERSION[3]` = 2.6 (the `prF` block in `Dashboard Widget Mockups.html`'s Final Check tab), and the Step 4 doc as stamped "Last verified 2026-09-02". Lint: 0 HIGH, 0 MED, 4 LOW (informational: API count, plus three prose lines containing "reconcile/reconciliation" with no arithmetic to check, by design).

**Conflict gate:** no material disagreement found between the built Final and the Step 4 doc; the Step 4 doc was re-stamped against build 2.6 on 2026-09-02 by the final-check audit, and every contract-relevant claim in it was re-verified against the build code during this pass. The Final Check tab's own Logic prose and `Widget_Specs/W03-Payroll-Distributions.md` still describe the 2026-07-27 v2.0 build; per the skill's rule the version and behaviour were taken from the code (`FC_VERSION`, the `prF` functions), not the prose.

**Contract shape decided by the frameworks (not carried from V1):**
- Four APIs: distribution filter lookup (lifetime gap), distribution-by-pay-type summary (base read, bounded), paginated permission-gated employee drill (trigger + cardinality gap + conditional weight), server-side export (trigger gap + conditional weight).
- The summary always returns distribution x pay-type grain; V1's `byPayType` toggle and `distributionId` param on the data endpoint are gone. The pay-type filter runs client-side over that bounded set; the old "By pay type" grouping mode does not exist in the v2.6 build (replaced by the independent Pay type chip at build v2.3).
- The employee drill is specced as MUST PAGINATE even though the mock drill does not paginate: the mock generates 3-7 employees per distribution in the page, which is a fixture property, not a bound (the build-volume trap rule). Pagination forces server-side sort (`sortBy`/`sortDir`, `employeeId` tiebreaker), `totalCount`, and full-filtered-set aggregates into the contract.
- Export is a server endpoint (not client-side file generation, which V1 left open): once the employee list paginates, the client never holds the full set the built export is defined to cover ("whatever the filters currently resolve to").
- The summary response gains an envelope (`asOf` + resolved `window` + `rows[]`) replacing the legacy bare list, because API 2 and API 3 must reconcile on screen and need a shared echoed anchor.

**Sign-off findings honoured (statuses in the Step 6 reconciliation file were still "not actioned"; the build implements all three per owner/audit direction, and this run's directives instructed honouring F3):**
- Finding 2 / F3 (comparison rejected): no `prior`, `diffAmount`, `diffPct` anywhere; stated as a contract boundary. (Note: the audit directive for this run said the V1 spec "still carries" those fields; in fact the V1 spec in this folder was already rewritten on 2026-07-27 to exclude them. The V2 keeps them out and cites F3 regardless.)
- Finding 3 / F8 (drill in-widget, not a link out): the drill is the in-widget nested table; no link-out contract.
- Finding 4 / F6 (amount sort for trimmed subsets): the build's default sort is amount descending everywhere; the employee list's server default is `totalAmount desc`.
- Finding 1 (pay-type list) was already resolved with evidence on 2026-07-27 (see below).

**Defaults taken by this unattended run (approval-type, reported not asked):**
- Treated F3 / F8 / F6 as accepted-in-effect from the build + audit directives despite the reconciliation file's stale "not actioned" statuses; flagged for the owner in the spec's sign-off list.
- Speccing the export as a server endpoint (V1 had left client-vs-server export open); reasoned from the pagination rule, decider recorded as closed by framework.
- `pageSize` default 50 / max 200, and API 4's `format` set (csv/xlsx/pdf mirroring the build's menu), as dev-tunable contract values.
- Did not reconcile the parallel Step 6 sign-off-aligned spec (out of this run's mandate); flagged in the spec's sign-off list instead.

**Facts NOT defaulted (left as [TO CONFIRM] with named owners in the spec):** `this_period` semantics for payroll; the exact payroll permission right; `PR_Employee` key/name columns; distribution count ceiling; worst-case employees per distribution; orphaned `CompensationDistributionID` handling; null/zero `SubType` possibility; PDF export scope.

## History harvested from the V1 spec (kept here so the V2 body stays clean)

- **2026-07-21** - V1 spec reopened and rewritten in place: the pay-type/earnings-code breakdown was missing from the spec entirely, and the only confirmed field (`PR_CompensationDistribution.Name`) did not establish whether the grouping was a Department or a pay-type Category dimension. The single-department Category view was flagged not buildable until resolved.
- **2026-07-21** - Reconciliation pass against management's sign-off doc (`Payroll+Distributions.doc`, live audit dated 2026-07-15) compiled four contradictions (pay-type list invented / comparison rejected / drill should be in-widget / top-N needs amount sort) and one confirm (recurring + per-department scheduling cut, already aligned).
- **2026-07-27** - The grouping question closed with evidence: `Payroll Distributions - Pay Type Breakdown Analysis (proof).html` establishes both dimensions live in `PR_HistoryCompensation` (org-defined distributions via `CompensationDistributionID`, fixed pay types via `SubType` 1-10, labels 6-9 org-configured on `PR_Company`), no schema changes. Reconciliation finding 1 resolved: both sides were right at different data levels.
- **2026-07-27** - V1 spec updated for the built Final v2.0 (window/custom params; pay-type breakdown; comparison fields excluded per F3). **Owner decision the same day: zero personal data** - no employee names, check numbers, hours or rates at any scope; the deeper per-employee drill was "evidenced possible but deliberately not part of this contract and not planned".
- **2026-08-19** - V1 spec's DRAFT header replaced with "Complete at Step 5 - awaiting management sign-off" per owner decision, matching the index.
- **2026-08-25** - Feargal call (SME): asked for the full chain, distribution group to pay types to an individual employee and that employee's pay breakdown, with export; access limited to users with payroll permission. Terminology confirmed: a distribution (staff) group is an organisational grouping; a pay type is a component of pay. **This supersedes the 2026-07-27 zero-personal-data decision** for the employee level, which is why the V2 contract has a permission-gated employee API where the V1 forbade one. Hours, rates, check numbers and per-check detail remain excluded (the built design shows amounts only).
- **2026-08-30** - Owner decision (build v2.2-v2.6): nested drill replaces the standalone Employees view; pay types are the leaf, reached through a person (deliberately reordering Feargal's chain); Pay type becomes its own filter chip (v2.3) and the old "By pay type" grouping is dropped; one view-scoped Export to Excel button replaces the per-row exports (v2.3-v2.6, the rest presentational). Permission gate moved to the rows themselves (`PRF_PAYROLL_PERM`).
- The V1 spec (folder root) stays frozen and read-only per the V2 process; its "zero personal data" boundary is historical as of 2026-08-25 and is not carried into V2.
