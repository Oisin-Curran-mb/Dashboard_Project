# Payroll Scheduled Time Off (W09) - API Spec Decisions Log

Dated record of decisions, superseded thinking and change history for this widget's API spec. Kept **outside** the spec so the spec itself stays a present-tense contract. The spec may state an outcome here as fact; it never narrates the decision.

---

## 2026-09-03 - First V2 spec, written against build v3.3

W09's first ever API spec. No V1 exists at the folder root, so `v2/` holds the only contract this widget has ever had. Written the day after its Step 4 doc was audited, and ported into Jo's shell in the same run.

**The Step 4 doc was less stale than its own stamp claimed.** Its "Last verified against build" line read 2026-08-08 against v2.8 while `FC_VERSION[9]` was already 3.3, which reads as five unverified version bumps. In fact the body had caught up on 2026-08-30: the Filters, Views and Size behaviour sections correctly describe v3.2's calendar Department filter and v3.3's removal of Group by from the calendar. Only the stamp and four older sections had fallen behind. Five fixes were applied (see the questions doc for each one's before and after text).

**This widget has a WRITE, and the endpoint does not exist.** Approval is the widget's headline feature and its reason for existing, and the Modern API has no inline approval action endpoint at all. `PUT /entries/{offScheduleId}/approval` is specced as `NEW`, as a desired-state write so that idempotency comes by construction and a double click cannot rewrite an audit date.

**Three Modern API gaps, all `NEW` backend work, all recorded in the contract:**

1. **The approval-authority filter is not implemented.** The Modern API returns all company schedules rather than only those the logged-in user is authorised to approve. Legacy filtered employees to the departments in the user's `PREmployeeTimeOffApprovals`. This is a correctness and confidentiality gap, not a nicety: without it every supervisor sees every employee's time off. The contract applies approval authority to the reads as well as the write, since Step 1 documents it as a read-scope filter.
2. **No inline approval action endpoint** (above).
3. **Custom column names from `PRCompany` are not implemented**, static labels being returned instead. Legacy took leave-type labels from fields such as `VacationLongName`, and unused columns could be hidden. API 1 exists to serve those labels.

**Volume shaped the contract more than anywhere else in the batch.** The build renders a whole month client-side, which is only viable because the demo dataset is 27 day-lines held in the browser. Per-dataset verdicts: labels `BOUNDED` (4 leave slots plus 6 pay-group slots, bounded by the data model); the summary figures `MUST AGGREGATE SERVER-SIDE`; the queue `MUST PAGINATE` at person grain, with day-lines per person bounded by definition at one per calendar day; the month day-map `MUST AGGREGATE SERVER-SIDE` and then bounded at 31 day objects, giving 31 x `markerLimit` = 93 marker objects per request; the department option list `BOUNDED`; single-date people `MUST PAGINATE`, because a company closure day is unbounded; year totals by type `BOUNDED` at 4 fixed slots; and the coverage-overlap list `MUST PAGINATE`, the heaviest query in the widget at subject day-lines x overlapping employees per date.

**Seven APIs, derived from the decomposition triggers:** labels (lifetime gap, 1 hour TTL, shared by four reads), summary (cardinality plus trigger plus grain gap: the compact tier fires this and nothing else), queue (grain plus cardinality gap), calendar (grain plus trigger gap plus conditional weight), one date's people (trigger plus cardinality gap), per-employee context (trigger gap plus conditional weight), and the approval write (read versus write).

**Build facts the contract is grounded in.** `FC_VERSION[9]` = 3.3. Two views, Approval Queue (default) and Leave Calendar. Per-day model: a multi-day request is one line per calendar day, individually shown, counted and approvable, and `PR_EmployeeOffSchedule` already stores per-`OffDate` rows so no schema change is needed. Two levels of grouping, not three: a group subheading contains person rows, each person an expander collapsed by default. Two stored statuses (Pending, Approved via `ApprovedDate`) plus **Outstanding as a derived state**, a day-line still pending and dated strictly before the anchor. Demo dataset: 3 pay groups, 7 people, 5 departments, and for August 27 day-lines = 20 pending + 7 approved, the 20 splitting 18 upcoming and 2 outstanding (Grace Lin Aug 1, Kofi Mensah Aug 4). Verified independently against `PAYF_GROUPS`, twice.

**Two build behaviours discovered in code that materially shaped the contract, neither stated in any doc:**

- **The queue's pending counts ignore the Status filter.** `payFQueue` computes from unfiltered data and `payFGroupPending` / `payFPersonPending` use `payFWorkFlat`, so the header, group and person pending badges do not move when Status changes. That is Framework 1's third condition for that filter, and the contract says so explicitly rather than leaving a developer to "fix" it.
- **The calendar's department option list and its counts come from different scopes.** The list is derived from the whole dataset (`payFFlat`) while each option's count is scoped to the displayed month, so a zero-count option is legitimately reachable.

**Decisions taken during this pass, each with a defensible source:**

- **Pagination at person grain, not day-line.** v3.0 deliberately changed the Explore cap unit from day-lines to people, because a day-based cap could show 3 of a person's 5 days with no sign the rest existed. The contract follows that unit.
- **Sort fixed server-side to the documented order**, with `sortBy` and `sortDir` present and whitelisted. Step 4 states a fixed order and the build exposes no sort control.
- **The window parameters default to the month containing the anchor**, matching the build's own working-month scope.
- **The `asOf` anchor doubles as the outstanding boundary**, shared across all reads. The derived state needs one reference, not each client's clock, and the header total and the table footer must not straddle a write.
- **The department option list spans the window while its counts are scoped to the displayed month**, matching `payFCalDepts` against `payFDeptFilter`.
- **`pageSize` maxima of 200 across all three paginated arrays**, defensive, since no measured ceiling exists.
- **`approvedCount` and `totalDayLineCount` were dropped** as unconsumed: nothing on screen renders them.
- **The two pending populations are named differently** (`pendingTotalCount` versus `pendingUpcomingCount`) rather than letting "pending" mean two things in one contract.

**Open item raised by the spec pass, not by any doc.** With a one-month window, pending day-lines from earlier months are neither counted nor reachable, so an outstanding line can never be cleared from this widget. Raised, not resolved. Owner: project owner.

**Still open, nothing defaulted:** the queue ordering gap (the doc specifies Department then Employee then Day, while `payFQueueOrdered` sorts groups only under Group by Department and never sorts people or day-lines); bulk approve, which Jo's dossier asks to add and v3.0 removed, recorded with both positions and no side taken; an explicit reject state, which the dossier asks for and the project reduced to two statuses; the counting-window default and the time-zone basis of the outstanding split; whether the queue's "pending" should exclude outstanding to match the compact tier; what a no-authority user sees, and the confirm, success and failure treatment for approve; the pay-group indirect join through `PREmployeeCompensationDetail.PayGroup` plus the employee master, display-name and approver-identity columns; the display-name sort basis; whether a hidden leave-type slot counts toward a year total; and worst-realistic row counts for four datasets, which have no basis in any source. With no `Reconciliation - Payroll Scheduled Time Off.md` in place, every dossier flag is unreviewed.

**Confluence HTML deliberately not generated.** Deferred until the owner has read the draft.

**Lint:** 0 HIGH, 0 MED, 1 LOW (the informational api-count line). Three cycles used. Linter unchanged.
