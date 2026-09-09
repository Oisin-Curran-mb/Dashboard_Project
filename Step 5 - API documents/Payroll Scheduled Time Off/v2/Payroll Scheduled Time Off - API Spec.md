# Payroll Scheduled Time Off - API Spec

**Status: Done - awaiting sign-off (drafting complete, owner review pending)**

---

## Overview

Payroll Scheduled Time Off is the dashboard's time-off approval queue. It answers two questions for a supervisor: *what time off is waiting for my approval*, and *who is out when*. It is the only widget in the set that writes, and the approval action is its reason for existing, so the write is a first-class part of this contract rather than an afterthought.

The data grain is the **day-line**: one row per employee per calendar day of time off. A request covering three days is three day-lines, each shown, counted and approved on its own.

This contract defines **seven APIs**: a rarely-changing label lookup, a bounded snapshot summary that feeds the compact tier, a paginated person-grain approval queue, a server-aggregated month day-map for the Leave Calendar, a paginated single-day detail read, a per-employee context read fired only when a supervisor asks for it, and a single-entry approval write. The count is derived from the decomposition triggers in the API inventory, not chosen. Three of the reads and the whole of the write are backend work that does not exist today.

Framework verdicts, stated once and justified in their own sections below:

- **Filter execution.** Every filter except the person expander and the initials shown on a marker executes **SERVER**-side. The queue paginates, so nothing over it may be filtered client-side.
- **Volume.** Three datasets are `MUST PAGINATE`, one is `MUST AGGREGATE SERVER-SIDE`, three are `BOUNDED`. No worst-realistic row count has a documented basis, so four are `[TO CONFIRM]` against a named owner.
- **Decomposition.** Seven APIs, each citing a trigger. Two merges were considered and rejected; one was considered and taken.
- **Computation.** Every count, every status classification and the whole sort order are server-side. The client derives initials and picks between two badge labels, and nothing else.

---

## Design → API coverage

| Design element | Type | API | Field(s) | Provenance |
|---|---|---|---|---|
| Pending figure (compact tier) | KPI | API 2, API 7 | `pendingUpcomingCount`, `summary.pendingUpcomingCount` | DERIVED count(`ApprovedDate IS NULL AND OffDate >= date(asOf)`) [BUILD] |
| Outstanding figure (compact tier) | KPI | API 2, API 7 | `pendingOutstandingCount`, `summary.pendingOutstandingCount` | DERIVED count(`ApprovedDate IS NULL AND OffDate < date(asOf)`) [BUILD] |
| Compact-tier zero state | State | API 2 | `pendingUpcomingCount`, `pendingOutstandingCount` both `0` | DERIVED [BUILD] |
| View toggle (Approval Queue / Leave Calendar) | View | API 3, API 4 | switches which endpoint is called; no field | DERIVED client state [BUILD] |
| Queue header count line | KPI | API 3 | `pendingTotalCount`, `scheduledDayCount` | DERIVED count over the full window, ignoring `status` [BUILD] |
| Status filter (All / Pending / Approved) | Filter | API 3 | `status` param, echoed as `status` | DERIVED from `ApprovedDate` [DOC - Step 1 research] |
| Group by (Department / Pay Group) | Filter | API 3 | `groupBy` param, echoed as `groupBy` | DERIVED [BUILD] |
| Group subheading label | Table heading | API 3 | `groups[].groupLabel`, `people[].groupKey` | STORED HomeDepartment, or STORED `PRCompany.PayGroupName` [DOC - Step 1 research] |
| Group pending badge / all-approved badge | KPI | API 3 | `groups[].groupPendingCount`, `groups[].groupKey` | DERIVED count over the full window, ignoring `status` [BUILD] |
| Person row name | Table column | API 3 | `people[].employeeName`, `people[].employeeId` | UNVERIFIED (backend team) employee display name [TO CONFIRM] |
| Person row secondary label | Table column | API 3 | `people[].department`, `people[].payGroup` | STORED HomeDepartment [DOC]; UNVERIFIED (backend team) `PREmployeeCompensationDetail.PayGroup` join [TO CONFIRM] |
| Person pending badge / all-resolved badge | KPI | API 3 | `people[].pendingCount`, `people[].dayLineCount` | DERIVED count over the full window, ignoring `status` [BUILD] |
| Person expander (open / closed) | Drill | API 3 | `people[].dayLines[]` already present in the row; client-side toggle | DERIVED client state [BUILD] |
| Day-line date | Table column | API 3 | `people[].dayLines[].offDate` | STORED `PR_EmployeeOffSchedule.OffDate` [DOC - Step 1 research] |
| Day-line leave type | Table column | API 3, API 1 | `people[].dayLines[].leaveType`, `leaveTypes[]` | STORED `PR_EmployeeOffSchedule` [DOC]; label NEW from `PRCompany` [DOC - Step 1 research] |
| Day-line hours | Table column | API 3 | `people[].dayLines[].hours` | STORED `PR_EmployeeOffSchedule` hours by leave type [DOC - Step 1 research] |
| Day-line status badge | Table column | API 3 | `people[].dayLines[].approvalStatus`, `people[].dayLines[].approvedBy`, `people[].dayLines[].approvedDate` | DERIVED from `ApprovedDate` [DOC]; approver identity UNVERIFIED (backend team) [TO CONFIRM] |
| Outstanding tag on a queue day-line | State | API 3 | `people[].dayLines[].isOutstanding` | DERIVED `ApprovedDate IS NULL AND OffDate < date(asOf)` [BUILD] |
| Approve action on a pending day-line | Action | API 7 | `offScheduleId`, `approved` (request), `approvalStatus` | NEW [DOC - Step 1 research: not implemented] |
| Undo action on an approved day-line | Action | API 7 | `offScheduleId`, `approved: false` (request), `approvalStatus` | NEW [DOC - Step 1 research: not implemented] |
| Approve affordance suppressed without authority | State | API 3 | `people[].canApprove` | NEW [DOC - Step 1 research] |
| Compact-tier person cap and remaining-people note | State | API 3 | `pageSize`, `totalCount`, `page` | DERIVED `totalCount - (page * pageSize)` [BUILD] |
| Queue empty-for-this-filter state | State | API 3 | `people[]` empty with `groups[]` empty | DERIVED [BUILD] |
| Queue column header row | Table heading | API 3 | static labels over `people[].dayLines[]`; no field | DERIVED client-side [BUILD] |
| Month navigation title | Heading | API 4 | `year`, `month` | DERIVED echo [BUILD] |
| Calendar Department filter | Filter | API 4 | `department` param, `departments[]`, `unfilteredPeopleOut` | DERIVED distinct HomeDepartment with per-option people counts [BUILD] |
| Calendar summary line | KPI | API 4 | `peopleOut`, `departmentsOut`, `dayLineCount`, `department` | DERIVED over the filtered month [BUILD] |
| Weekday header row and adjacent-month cells | Table heading | API 4 | calendar arithmetic over `year`, `month`; no field | DERIVED client-side [BUILD] |
| Day cell status band | State | API 4 | `days[].dayStatus`, `days[].date` | DERIVED priority any-outstanding, else any-pending, else all-approved [BUILD] |
| Today marker on a day cell | State | API 4 | `asOf` compared to `days[].date` client-side | DERIVED client-side from the shared anchor [BUILD] |
| Day marker (person initials, status band) | Table cell | API 4 | `days[].markers[]` | DERIVED per marker from that row's `ApprovedDate` and `OffDate` [BUILD] |
| Marker overflow chip | Table cell | API 4 | `days[].overflowCount`, `days[].peopleOut` | DERIVED `peopleOut - count(markers)` over the full day [BUILD] |
| Calendar legend | Table heading | API 4 | fixed three-state key over `days[].dayStatus`; no field | DERIVED client-side [BUILD] |
| Empty-month state | State | API 4 | `days[]` empty, `department` null | DERIVED [BUILD] |
| Filtered-empty-month state | State | API 4 | `days[]` empty with `department` set and `unfilteredPeopleOut > 0` | DERIVED [BUILD] |
| Day detail popover title and footer count | Drill | API 5 | `date`, `peopleOut` | DERIVED [BUILD] |
| Day detail person rows | Drill | API 5 | `people[]` | STORED and DERIVED per field, as API 5's schema states [DOC / BUILD] |
| Person Info popover header | Drill | API 6 | `employeeName`, `department`, `payGroup`, `employeeId` | STORED [DOC]; pay group UNVERIFIED (backend team) [TO CONFIRM] |
| Info: time off this year by leave type | Drill | API 6 | `leaveTypeTotals[]`, `totalDays`, `year` | NEW aggregation over `PR_EmployeeOffSchedule` [TO CONFIRM - backend team] |
| Info: same-dates coverage overlap list | Drill | API 6 | `overlaps[]` | NEW aggregation over `PR_EmployeeOffSchedule` [TO CONFIRM - backend team] |
| Info: no-one-overlaps state | State | API 6 | `overlaps[]` empty with `totalCount` `0` | NEW [TO CONFIRM - backend team] |
| Refresh control | Action | API 2, API 3, API 4 | re-issues the active reads with a fresh `asOf` | DERIVED [BUILD] |
| Loading state | State | all reads | no field; request in flight | DERIVED client-side [TO CONFIRM - presentation unspecified] |
| Error state | State | all reads | HTTP status plus `partialReason` where the read still returns | NEW [TO CONFIRM - presentation unspecified] |
| Partial state | State | API 3, API 4, API 5, API 6 | `partial`, `partialReason` | NEW [TO CONFIRM - presentation unspecified] |
| No-approval-authority state | State | API 2 | `authorisedDepartmentCount` `0` with every count `0` | NEW [TO CONFIRM - project owner] |
| Pay group labels for the Group by dimension | Table heading | API 1 | `payGroups[]` | STORED `PRCompany.PayGroupName` [DOC - Step 1 research] |
| Hidden leave-type slots omitted from labelling | State | API 1 | `leaveTypes[].hidden` | NEW [DOC - Step 1 research] |
| Data freshness anchor shared by every call | State | all APIs | `asOf` | DERIVED server clock at request time [TO CONFIRM - time zone basis] |
| Window echoed by the counting reads | State | API 2, API 3, API 7 | `windowFrom`, `windowTo` | DERIVED echo [TO CONFIRM - default window] |

Nothing on screen is unfunded. The three elements with no field are the weekday header row, the queue's static column header and the fixed legend key: all three are constants the client owns, and all three appear in *Where computation lives*.

---

## Tables

| Table / repository | Fields and members used |
|---|---|
| `PR_EmployeeOffSchedule` | The day-line itself: primary key, `CompanyID`, `EmployeeID`, `OffDate`, hours by leave type, `ApprovedDate`. Read by every API; the write updates `ApprovedDate` |
| `PREmployeeTimeOffApprovals` | `HomeDepartmentIDs` for the logged-in user. The approval-authority scope for every read and the write |
| Employee master and home department | `HomeDepartmentID` and the employee display name. Neither the table nor the display-name column is named in any source, so both are `UNVERIFIED (backend team)` |
| `PREmployeeCompensationDetail` | `PayGroup` (smallint, `0` = Normal Payroll, `1` to `5` = A to E). The only route from an employee to a pay group |
| `PRCompany` | `PayGroupName` for pay-group labels; the leave-type custom name fields, for example `VacationLongName`, for leave-type labels |
| `SSUserTenantPreference` | Key `PayrollScheduledTimeOffFilters`. Per-user filter persistence |
| `PRTimeCardRepository` | Not read by this contract. Cited as the existing precedent for filtering payroll data by pay group |

**No new tables and no new columns are required for the reads.** Every read is a new query or a new aggregation over the tables above. The write updates an existing column. The one thing that may force a schema change is the approver identity behind the "Approved by" stamp: no source names the column that holds it, so if none exists it has to be added.

Core formulas, each quotable on its own:

1. **Row filter.** `PR_EmployeeOffSchedule WHERE CompanyID = <X-Company-ID> AND OffDate BETWEEN from AND to`. [DOC - Step 1 research, which states the same filter at `OffDate.Year = selectedYear` grain]
2. **Approval authority filter.** `AND EmployeeID IN (employees whose HomeDepartmentID appears in the caller's PREmployeeTimeOffApprovals.HomeDepartmentIDs)`. Applied to every read and re-checked on the write. [DOC - Step 1 research] `NEW` in the Modern API.
3. **Pending.** `ApprovedDate IS NULL`. **Approved.** `ApprovedDate IS NOT NULL`. There is no third stored status. [DOC - Step 1 research]
4. **Outstanding.** `ApprovedDate IS NULL AND OffDate < date(asOf)`. A past date that is approved is not outstanding; a pending date on or after the anchor date is not outstanding. Approving an outstanding day-line clears it. [BUILD]
5. **Compact-tier partition.** `pendingUpcomingCount + pendingOutstandingCount = pendingTotalCount`, and the two are mutually exclusive by construction, so nothing is double counted. [BUILD]
6. **Day-line grain.** One response row per `OffDate`. `PR_EmployeeOffSchedule` already stores per-`OffDate` rows, so this needs no expansion step and no schema change. Per-day `hours` are `STORED`, never a request total divided across its span. [DOC - Step 4 design; BUILD]
7. **Day cell priority.** Any outstanding day-line on that date wins; else any pending; else all approved; a date with no day-lines is not returned at all. [BUILD]
8. **Coverage overlap.** Two entries overlap when they share the same month and year and their day ranges intersect, `startA <= endB AND startB <= endA`. At day-line grain that reduces to the same `OffDate`. [DOC - Step 4 design; BUILD]
9. **Year totals by leave type.** For one employee, the count of day-lines per leave type across the requested year. The counting unit is the day-line, which is a design choice rather than a documented legacy formula. [BUILD]
10. **Queue order.** Group dimension alphabetical, then employee name alphabetical, then `OffDate` chronological. [DOC - Step 4 design, Data Table Sort]

---

## Old vs. new

| | Old (live today) | New (needed) |
|---|---|---|
| Filter lookup | `GET .../filters` returns `PayrollTimeOffFiltersDto {Years:[string]}` | A label lookup returning leave-type labels from `PRCompany` and pay-group labels from `PRCompany.PayGroupName`. The year list is not consumed, because there is no Calendar Year control. `NEW` |
| Grid read | `GET .../grid?year={int}&view={0,1,2}` returns `List<PayrollTimeOffDeptGroupDto>` with `{HomeDepartment, Employees[EmployeeId, Name, AllApproved, Details[]]}` | Four purpose-shaped reads: a snapshot summary, a paginated person-grain queue, a month day-map and a single-day detail. Re-shaped existing read plus `NEW` aggregation |
| Scope of the read | All company schedules for the year | The window, scoped to the caller's authorised departments. The authority filter is **not implemented today**, so every supervisor currently sees every employee's time off. `NEW` |
| Employee approval roll-up | `AllApproved` boolean per employee | `pendingCount` per person and `groupPendingCount` per group, because the badge shows a number, and a group's badge has to be right on every page it appears on. `DERIVED` |
| Approval action | No endpoint. The legacy control approves inline via checkboxes | `PUT .../entries/{offScheduleId}/approval` with an idempotent desired-state body, a stale-anchor guard and a conflict response. `NEW` |
| Leave-type labels | Static labels returned; the `PRCompany` custom names are **not implemented** | `leaveTypes[]` carrying the configured label and whether the slot is hidden. `NEW` |
| Pay group | Not exposed. `PR_EmployeeOffSchedule` has no pay-group field | Joined through `PREmployeeCompensationDetail.PayGroup` so the queue can group by it. `UNVERIFIED (backend team)`, an indirect join rather than a confirmed direct field |
| Coverage view | A month calendar grid exists in the legacy control | A server-aggregated day-map: per-date status priority, distinct-people count, a bounded marker list and an overflow count. `NEW` |
| Per-person context | Nothing equivalent | Year totals by leave type and a same-dates coverage-overlap list. `NEW` |
| Freshness | None returned | A shared `asOf` anchor on every call, which is also what the outstanding boundary is measured against. `NEW` |

---

## API inventory

| API | Purpose | Trigger (when it fires) | Cardinality | R/W | Cache posture | Split trigger |
|---|---|---|---|---|---|---|
| API 1 labels | Leave-type and pay-group labels from `PRCompany` | Once per session, before or alongside the first data read | 4 leave types, 6 pay groups | R | `TTL` 1 hour | Lifetime gap: organisation configuration changes rarely and is shared by four other reads, so repeating it on every data response would cost payload and lose cacheability |
| API 2 summary | The two compact-tier figures and the shared `asOf` anchor | Widget render, at every tier; and on Refresh | 1 object | R | `LIVE` | Cardinality gap: two integers must not pay for an unbounded row list. Trigger gap: at the compact tier this is the only call. Grain gap: a point-in-time aggregate, not rows |
| API 3 queue | Paginated person-grain approval queue with each person's day-lines | Approval Queue view render; status or group change; page change; after a write | Page of people, unbounded total | R | `LIVE` | Grain gap: per-entity detail rows keyed by employee. Cardinality gap: the row set is bounded only by headcount, so it paginates |
| API 4 calendar | Month day-map: per-date status priority, people count, bounded markers, overflow, plus the department option list | Leave Calendar view render; month navigation; department change | At most 31 day objects | R | `LIVE` | Grain gap: a per-date aggregate, not per-person rows. Trigger gap: fires only in the Leave Calendar. Conditional weight: a heavy scan reduced to a light response the queue never needs |
| API 5 day detail | Every person out on one date, with department, pay group, hours and status | Click on a populated day cell or a marker | Page of people out on one date, unbounded total | R | `LIVE` | Trigger gap: fires on a click that may never happen. Cardinality gap: a company-wide closure day is unbounded, so it paginates |
| API 6 person context | One employee's year totals by leave type, plus the paginated same-dates coverage-overlap list | Click the Info control on a person row | 4 total rows plus a page of overlaps | R | `LIVE` | Trigger gap: fires only when a supervisor asks. Conditional weight: two aggregations nobody needs to render the queue |
| API 7 approval write | Approve or unapprove one day-line | Approve or Undo on a single day-line | 1 row | W | none, `LIVE` read-back | Read vs write: a mutation is never a variant of a read |

Three pairings were tested against the counter-pressures and closed:

- **API 4 and API 5 stay separate.** Returning every day's full row list so a grid can render three markers per date is exactly the payload API 4 exists to avoid, and the click may never happen.
- **API 2 and API 3 stay separate.** The compact tier renders no rows at all, and API 3 paginates, so its window-level aggregates would have to be computed over the full filtered set regardless. Keeping them apart means the compact tier never touches the row query.
- **API 6's two halves are one call.** The totals block and the overlap list always fire together, both are required to render the popover, and the totals block is four rows. Splitting them would buy nothing and cost a round trip.

---

## Call sequence

| Interaction | Calls fired | Notes |
|---|---|---|
| Initial widget load, compact tier | API 1, API 2 | API 2 establishes `asOf`. API 1 is served from cache after the first session request |
| Initial widget load, queue view | API 1, API 2, API 3 | API 2 first, then API 3 with API 2's `asOf`, so the header counts and the rows cannot straddle a write |
| Initial widget load, calendar view | API 1, API 2, API 4 | API 4 takes API 2's `asOf`, so the outstanding boundary is identical in both |
| Change filter *Status* | API 3 | Same `asOf`. Rows change; the header, group and person counts do not |
| Change filter *Group by* | API 3 | Same `asOf`. Group membership, group counts and the whole sort order change, so the page is re-fetched from page 1 |
| Change filter *Department* (calendar) | API 4 | Same `asOf`. Any open day-detail popover is discarded, so API 5 is not re-fired |
| Month navigation (previous / next) | API 4 | Same `asOf`. The selected department is kept and re-sent |
| Switch view | API 3 or API 4 | The other view's last response is discarded. API 2 is not re-fetched, so `asOf` is stable across the switch |
| Open drill: person expander | none | The person's `dayLines[]` are already in the API 3 row |
| Open drill: day cell or marker | API 5 | Carries the calendar's current `department` and the shared `asOf` |
| Open drill: person Info control | API 6 | Carries the shared `asOf` and the working year |
| Page the queue | API 3 | Same `asOf`, `page` incremented. Aggregates are identical across pages |
| Page the day detail or the overlap list | API 5 or API 6 | Same `asOf` |
| Submit action: Approve or Undo | API 7, then API 3 | API 7 returns the updated entry and a recomputed `summary`, so the compact figures update without calling API 2. API 3 is re-fetched so the badges and any status filter re-settle. A new `asOf` is adopted from the write response |
| Refresh | API 2, then API 3 or API 4 | A fresh `asOf` is taken from API 2 and passed to whichever view is active |

**Shared snapshot anchor.** `asOf` is minted by API 2 (or by API 7's response after a write) and passed to API 3, API 4, API 5, API 6 and API 7. All six echo it. It fixes two things that would otherwise drift: the window defaults, and the date the outstanding boundary is measured against. Without it the compact figures and the queue can disagree across a midnight boundary or across another approver's write.

---

## Filter architecture

**Verdict: every filter executes SERVER-side except the person expander.** The queue paginates, and the hard rule that follows from that is absolute: sort, filter, search and aggregation over a paginated set are all server-side.

| Filter | Option source | Cardinality | Execution | Aggregate effect | Cascade | "All" wire form | Round trips |
|---|---|---|---|---|---|---|---|
| View toggle | `STATIC` enum: `queue`, `calendar` | 2 | `SERVER` (selects the endpoint: API 3 or API 4) | No. Neither view's aggregates are derived from the other | None | Not applicable, exactly one value is always active | 1 |
| Status | `STATIC` enum: `all`, `pending`, `approved` | 3 | `SERVER` param `status` on API 3 | **No.** `pendingTotalCount`, `scheduledDayCount`, `groups[].groupPendingCount` and `people[].pendingCount` are all computed over the full window ignoring `status`; only `people[]` membership and `dayLines[]` change | None | Explicit sentinel `status=all`. Omission cannot mean All, because the server default is `pending` | 1 (API 3) |
| Group by | `STATIC` enum: `department`, `payGroup` | 2 | `SERVER` param `groupBy` on API 3 | **Yes.** Changes which groups exist, each group's pending count and the whole sort order | None | Not applicable, exactly one dimension is always active | 1 (API 3), reset to `page=1` |
| Department (Leave Calendar) | `DERIVED` from API 4's own `departments[]`, itself derived from distinct `HomeDepartment` across the window | 5 in the build fixture; ceiling `[TO CONFIRM - project owner]` | `SERVER` param `department` on API 4 and API 5 | **Yes.** Changes `peopleOut`, `departmentsOut`, `dayLineCount`, every `days[].dayStatus`, `days[].markers[]` and `days[].overflowCount` | The option *list* spans the window and does not move with the month; each option's *count* is scoped to the displayed month, so the list ships with the month data rather than from a lookup endpoint | Omit the param. `department` echoes back `null` | 1 (API 4); any open popover is dropped so API 5 does not re-fire |
| Month (Leave Calendar navigation) | `DERIVED` from the anchor, then stepped | Unbounded in principle, one step at a time | `SERVER` params `year` and `month` on API 4 | **Yes.** Every figure in the response is month-scoped | Feeds the Department option counts | Not applicable, exactly one month is always displayed | 1 (API 4) |
| Person expander | `DERIVED` from the row already held | At most one day-line per calendar day in the window: 31 at a month window, 366 at a year window | `CLIENT` view over an existing response | No | None | Not applicable | 0 |
| Page size at the compact tier | `STATIC`: `6` | 1 | `SERVER` param `pageSize` on API 3 | No. `totalCount` spans the full filtered set, which is what the remaining-people note is computed from | None | Not applicable | 1 (API 3) |

**The one CLIENT verdict, justified against all three of Framework 1's conditions.** The person expander qualifies because (1) the full set is already present, since API 3 returns every day-line for each person on the page, (2) the set is provably bounded by definition and not by fixture size, at one day-line per calendar day in the requested window, and (3) expanding or collapsing changes no server-computed aggregate, since `pendingCount` and `dayLineCount` are already whole-person figures. The person's initials on a calendar marker are the same case: a pure string derivation from `employeeName`.

**Why the Department filter is not client-side.** API 4 returns per-date aggregates and a bounded marker list, not the underlying rows, so the client cannot re-derive a filtered day-map from what it holds. Condition 1 fails outright and condition 3 fails as well.

**Why the option list is unaffected by its own filter.** `departments[]` and `unfilteredPeopleOut` are computed **ignoring** the `department` param, and the option list itself is computed over the window rather than the displayed month. Selecting one department must never collapse the option list to that one department, which is what would happen if the option list were derived from the filtered result. This is the same defect as filtering rows client-side while the server's total spans everything, and it is closed here by construction.

**Combination semantics.** AND, and narrowing, across every filter that can co-occur. The filters partition by view rather than combining across it: `status` and `groupBy` are API 3 only, `department`, `year` and `month` are API 4 and API 5 only.

**Conflict rule.** Params that can contradict resolve as follows, never as undefined behaviour.

- `status` or `groupBy` sent to API 4 or API 5, or `department` sent to API 3: **rejected**, `400 unknown-parameter`. The filters are view-scoped by design and silently ignoring one would leave the caller believing a filter applied.
- `department` naming a value that is not in the company's department set: **rejected**, `400 unknown-department`. A valid department with no rows in the requested month is a different case and returns a well-formed empty response.
- `groupBy=payGroup` for an employee with no `PREmployeeCompensationDetail` row: the employee is grouped under a single reserved `Unassigned` group and `payGroup` returns `null`. A blank pay group is never treated as a wildcard, so it neither matches every group nor disappears.
- Employees with a null `HomeDepartmentID`: grouped under `Unassigned` when `groupBy=department`, included when no `department` filter is set, and excluded when a specific `department` is requested. A blank is not a wildcard here either.
- `from` later than `to`, or `month` outside 1 to 12: **rejected**, `400 invalid-window`.
- `sortBy` outside the whitelist: **rejected**, `400 unknown-sort`, rather than falling back to the default, so a client bug is visible.

**Empty-result semantics.** Any filter combination that matches nothing returns `200` with a well-formed zero response, never an error: `people[]` and `groups[]` empty with `totalCount` `0` and the window aggregates still correct for the window (API 3); `days[]` empty with `departments[]` and `unfilteredPeopleOut` still populated so the client can tell a filtered miss from an empty month (API 4); `people[]` empty with `peopleOut` `0` (API 5); `overlaps[]` empty with `leaveTypeTotals[]` still returned (API 6).

**Cascade invalidation.** The Department selection survives month navigation. If the selected department has no rows in the newly displayed month, the value is **kept, not cleared**, and the response is the filtered-empty case: `days[]` empty, `department` echoed, `unfilteredPeopleOut` greater than zero. Clearing it silently would move the user's filter without their asking.

**Lookup endpoints.** The only `LOOKUP` option source in this contract is API 1, which supplies the pay-group labels for the Group by dimension and the leave-type labels used for display. It appears in the API inventory. The Department option list is `DERIVED` and ships inside API 4, so it needs no lookup endpoint. The existing `GET .../filters` year list is not consumed by any control in this design.

**Leave type is not a filter.** It is a display dimension and an aggregation key only. There is no leave-type param on any endpoint.

---

## Volume and performance

**Verdict: three datasets must paginate, one must aggregate server-side, three are bounded.** The build fixture holds 27 day-lines for 7 people across 5 departments in one month, entirely in the browser, which is why its grouping, its person cap and all of its counts are instant. That is a property of the fixture and is used below only as a typical-case figure. **It is never a basis for a ceiling.** No source in this project states an employee count, a day-lines-per-employee figure or a departments-per-company figure, so every worst-realistic cell below is either bounded by definition or `[TO CONFIRM]` against a named owner.

| Dataset | Typical rows | Worst realistic rows (basis) | Row width | Payload at worst | Verdict | Server cost model | Cache posture |
|---|---|---|---|---|---|---|---|
| API 1 labels | 4 leave types, 6 pay groups | 4 leave types, 6 pay groups. Bounded by definition: `PRCompany` has a fixed set of leave-type name fields, and `PayGroup` is a fixed 6-slot model, `0` plus `1` to `5` [DOC - Step 1 research] | 3 fields, roughly 60 bytes | under 1 KB | `BOUNDED` | Single row read of `PRCompany`, no multiplier | `TTL` 1 hour. Staleness is at most one hour on a label rename, which the `asOf` field does not need to reflect |
| API 2 summary | 1 object over 27 day-lines | 1 object. The response shape is bounded by definition; the scan behind it is day-lines in window | 11 fields, roughly 250 bytes | under 1 KB | `MUST AGGREGATE SERVER-SIDE` | Single indexed scan of `PR_EmployeeOffSchedule` on `CompanyID` and `OffDate`, joined to the authorised-department set. Multiplier: day-lines in window. No per-row subquery | `LIVE` per request. A TTL would show a stale pending figure immediately after an approval, which is the one moment the figure is looked at |
| API 3 queue people page | 7 people, 27 day-lines [BUILD fixture, typical only] | `[TO CONFIRM - project owner]`. Structurally: employees in the caller's authorised departments, times day-lines per employee in the window. Day-lines per person are bounded by definition at one per calendar day in the window, 31 at a month window and 366 at a year window | Person: 8 fields. Day-line: 8 fields, roughly 190 bytes | `pageSize` 25 times 31 day-lines equals at most 775 day-line objects, roughly 150 KB, at the default page and a month window | `MUST PAGINATE` | One indexed page query, plus a join to `PREmployeeCompensationDetail` when `groupBy=payGroup`, plus three aggregate passes over the full filtered set for the window, group and person counts. Multiplier: 4 passes over day-lines in window, not one pass per row | `LIVE` per request |
| API 4 month day-map | 21 populated dates over 27 day-lines [BUILD fixture, typical only] | At most 31 day objects, bounded by definition by the length of a month. The scan behind it is employees times day-lines in month, `[TO CONFIRM - project owner]` | Day: 5 fields plus up to `markerLimit` markers of 5 fields each | 31 dates times 3 markers equals at most 93 marker objects plus 31 day objects, roughly 25 KB | `MUST AGGREGATE SERVER-SIDE`, and the response is then `BOUNDED` at 31 day objects | One indexed scan of the month, grouped by `OffDate` for the status priority and the distinct-people count, with the marker list truncated in the query. Multiplier: 31 dates times `markerLimit`, computed and stated per request rather than left open. The department option list is a second grouping over the same scan, not a second query | `LIVE` per request |
| API 4 department option list | 5 options [BUILD fixture, typical only] | `[TO CONFIRM - project owner]`. Bounded by the company's department count, which no source states | 2 fields, roughly 45 bytes | under 5 KB | `BOUNDED` | Group-by over the window scan for the option list, and over the month scan for each count. No extra query and no multiplier | `LIVE`, shipped with the month it describes |
| API 5 single-day people page | 2 to 3 people [BUILD fixture: 2 on the mixed-status date, 3 on the busiest date, typical only] | `[TO CONFIRM - project owner]`. Structurally unbounded in employees: an organisation-wide closure date puts the whole authorised headcount on one date | 11 fields, roughly 280 bytes | `pageSize` 50 times 280 bytes, roughly 14 KB per page | `MUST PAGINATE` | One indexed equality scan on `OffDate`, joined to compensation detail for the pay group. Multiplier: people out on one date | `LIVE` per request |
| API 6 year totals by leave type | 4 rows | 4 rows. Bounded by definition by the fixed `PRCompany` leave-type slots | 2 fields, roughly 40 bytes | under 1 KB | `BOUNDED` | One grouped scan of the employee's year. Multiplier: that employee's day-lines in the year, at most 366 | `LIVE` per request |
| API 6 coverage overlap list | 3 overlapping entries [BUILD fixture, typical only] | `[TO CONFIRM - project owner]`. Structurally the subject's day-lines times people out on each of those dates: at most 366 dates times the authorised headcount | 8 fields, roughly 220 bytes | `pageSize` 25 times 220 bytes, roughly 6 KB per page | `MUST PAGINATE` | A semi-join of the subject's `OffDate` set against every other employee's day-lines in the same year. Multiplier: subject day-lines times overlapping employees per date. This is the heaviest query in the contract, which is why it fires only on an explicit request | `LIVE` per request |
| API 7 approval write | 1 row updated | 1 row updated. Bounded by definition: one day-line per call, there is no batch form | Entry: 8 fields. Recomputed summary: 5 fields | under 2 KB | `BOUNDED` | One primary-key update, then one aggregate pass over the window to recompute the summary. Multiplier: day-lines in window, once | none. The read-back is `LIVE` and carries a fresh `asOf` |

**The entities-times-points product, stated per request.** This widget has no time series, but two of its responses are a product rather than a list, and both are written down rather than left as an open performance question:

- API 4: at most **31 dates times `markerLimit`** markers, so 93 marker objects at the default `markerLimit` of 3. Pagination does not and cannot reduce this, because a month grid is a fixed shape and each date's `dayStatus`, `peopleOut` and `overflowCount` are aggregates spanning every row on that date, including the rows the marker list truncates away.
- API 6: **subject day-lines times overlapping employees per date**, at most 366 times the authorised headcount before paging. Paging the `overlaps[]` array reduces the payload but not the scan, and `totalCount` still spans the full set.

### Pagination contract

Three arrays paginate: `people[]` in API 3, `people[]` in API 5, and `overlaps[]` in API 6. `days[]`, `departments[]`, `groups[]`, `leaveTypes[]`, `payGroups[]` and `leaveTypeTotals[]` do not, because each is bounded by definition.

- **Params.** `page`, 1-based, default `1`. `pageSize`, defaults `25` (API 3), `50` (API 5) and `25` (API 6), **maximum `200`** on all three. An unbounded `pageSize` re-creates the problem pagination solves and is rejected with `400 invalid-page-size`.
- **What paginates.** API 3 pages at **person** grain, never at day-line grain. A person is returned whole or not at all, so a page never shows three of somebody's five days with no sign the other two exist. Each person on the page carries all of their day-lines in the window, which is bounded by definition.
- **What does not paginate.** `pendingTotalCount`, `scheduledDayCount` and `totalCount` (API 3), every `groups[].groupPendingCount`, every `people[].pendingCount`, `peopleOut`, `departmentsOut`, `dayLineCount`, `unfilteredPeopleOut` and every `departments[].peopleOut` (API 4), `peopleOut` (API 5), `totalDays` and every `leaveTypeTotals[].days` (API 6). **All of these compute over the full filtered set, never over the current page.** Changing page changes no count, no badge and no compact-tier figure. A group that spans two pages shows the same `groupPendingCount` on both, because that count is a full-set aggregate rather than a page sum.
- **Sort params.** `sortBy` and `sortDir` on all three paginated reads, each with a whitelist. API 3: `default`, `department`, `payGroup`, `employeeName`, `pendingCount`. API 5: `employeeName`. API 6: `employeeName`, `offDate`. `sortDir` is `asc` or `desc`, default `asc`.
- **Sort is deliberately fixed in the shipped design.** No sort control is exposed on any of the three reads, so the default value is what ships: `default` on API 3 means the documented queue order, group dimension alphabetical, then employee name alphabetical, then `OffDate` chronological. The params exist so the order is explicit in the contract and so a later control needs no new endpoint. What the user loses by having no control is the ability to bring the largest pending backlog to the top; that is a deliberate trade for a predictable order in an approval workflow.
- **Deterministic total order.** Every sort ends in a unique tiebreaker so paging cannot duplicate or skip rows. API 3: group key, then `employeeName`, then `employeeId`; within a person, `offDate` then `offScheduleId`. API 5: `employeeName` then `employeeId` then `offScheduleId`. API 6: `employeeName` then `offDate` then `offScheduleId`. `days[].markers[]` is truncated rather than paged, so it too is ordered by `employeeName` then `employeeId`, which makes the truncation and therefore `overflowCount` reproducible.
- **`totalCount`** is returned alongside every page, counting people in the full filtered set, so the client can render a pager and the remaining-people note without a second call.
- **Past the last page.** `200` with an empty array, the correct `totalCount` and every aggregate unchanged. Never a `404` and never an error: a page beyond the end is a legitimate request, not a fault.

---

## Where computation lives

**Verdict: the server computes every count, every status classification and the entire sort order. The client derives initials, picks between two badge labels and lays out the calendar frame.**

| Value | Server or client | Basis | Why |
|---|---|---|---|
| Compact-tier Pending figure | `SERVER` | `count(ApprovedDate IS NULL AND OffDate >= date(asOf))` over the window | Spans the whole authorised set, which the client never holds |
| Compact-tier Outstanding figure | `SERVER` | `count(ApprovedDate IS NULL AND OffDate < date(asOf))` over the window | Same span, and the boundary depends on the shared anchor rather than the browser clock |
| Queue header pending count | `SERVER` | `count(ApprovedDate IS NULL)` over the full window, ignoring `status` | Spans rows the status filter removes and pages the client does not hold |
| Queue header scheduled-days count | `SERVER` | `count(*)` over the full window, ignoring `status` | Same. The approved figure is deliberately not returned, because nothing renders it |
| Group pending count | `SERVER` | `count(ApprovedDate IS NULL)` per group over the full window | A group can span pages; a page sum would show a different number on each |
| Group badge wording, count or all-approved | `CLIENT` | `groupPendingCount > 0` | Pure branch on a value already in the response |
| Person pending count | `SERVER` | `count(ApprovedDate IS NULL)` per employee over the full window | Independent of the status filter and of which day-lines are expanded |
| Person badge wording, count or all-resolved | `CLIENT` | `pendingCount > 0` | Pure branch on a value already in the response |
| Day-line approval status | `SERVER` | `ApprovedDate IS NULL` to `Pending`, else `Approved` | The classification is the stored fact, returned as a word so no consumer re-implements it |
| Day-line outstanding flag | `SERVER` | `ApprovedDate IS NULL AND OffDate < date(asOf)` | Depends on the shared anchor. The client's clock is not the anchor, and two clients must not disagree about which day-lines are past due |
| Day cell status priority | `SERVER` | any outstanding, else any pending, else all approved | Spans every row on that date, including the rows the marker list truncates and never transmits |
| Marker status per person-date | `SERVER` | that row's own classification | Each marker carries its own state, so a mixed date is legible |
| Marker overflow count | `SERVER` | `peopleOut - count(markers returned)` | Counts rows the response deliberately omits |
| Marker initials | `CLIENT` | first and last initial of `employeeName`, falling back to the first two letters of a single-word name | Pure string derivation over a value already present |
| Calendar summary people and department counts | `SERVER` | distinct employees and distinct departments over the filtered month | Distinct counts over rows the client does not hold |
| Department option counts | `SERVER` | distinct employees per department over the **unfiltered** displayed month, against an option list drawn from the whole window | Must not move when the filter is applied, and an option must not vanish in a month where nobody in it is out |
| Info year totals by leave type | `SERVER` | count of day-lines per leave type for the employee across the year | Spans the whole year, well outside any window the client holds |
| Info year total days | `SERVER` | count of the employee's day-lines across the year | Returned rather than summed client-side, because a hidden leave-type slot can hold days that no listed row would account for |
| Coverage overlap rows and count | `SERVER` | semi-join of the subject's `OffDate` set against other employees' day-lines | An aggregation over the whole authorised set |
| Sort order, all three paginated reads | `SERVER` | the whitelisted `sortBy` and `sortDir`, ending in a unique tiebreaker | Mandatory: a paginated set sorted client-side sorts only the visible page |
| Remaining-people note at the compact tier | `CLIENT` | `totalCount - (page * pageSize)` | Pure arithmetic over two values already in the response |
| Weekday header row, adjacent-month cells, today marker | `CLIENT` | calendar arithmetic over `year`, `month` and `asOf` | Pure date arithmetic, no data involved |
| Queue column header row and the calendar legend key | `CLIENT` | fixed labels | Constants, not data |
| Status visual treatment, tags and badges | `CLIENT` | the returned `approvalStatus` and `isOutstanding` words | Presentation over a server classification. The classification is data, the treatment is not |

**Division by zero.** This contract computes no percentage and no ratio. The only ratio-shaped thing on screen is the header line pairing `pendingTotalCount` with `scheduledDayCount`, which the client renders as two integers and never divides. Should a rate ever be added, the rule is fixed now: the server computes it, and returns `null` rather than `0` when the denominator is zero, so a genuine zero and an undefined value are never confused.

**Deltas.** There is no delta, trend or period comparison on screen, so nothing is returned for the client to subtract. Should one be added it comes back pre-signed.

**Presentation thresholds.** There are none. The three states are a server classification derived from stored data and the shared anchor, not a banding of a continuous value against a threshold, so there is no unapproved threshold hiding as a default.

---

## API 1: labels

### Endpoint

```
GET /api/dashboard/payroll-scheduled-time-off/labels
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| (none) | - | - | - | - | The response is company configuration only, so the context header is the whole input |

Context header: `X-Company-ID`, required on this and every other call in this contract.

### Example requests

```
GET /api/dashboard/payroll-scheduled-time-off/labels
GET /api/dashboard/payroll-scheduled-time-off/labels    (identical for every caller in the company; the response is cacheable for one hour)
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED server clock at request time [TO CONFIRM - time zone basis, project owner] | When the configuration was read |
| `leaveTypes` | array | DERIVED [DOC - Step 1 research] | The four configured leave-type slots, in fixed order |
| `leaveTypes[].code` | string | STORED `PR_EmployeeOffSchedule` leave-type slot [DOC - Step 1 research] | Stable slot key: `Vacation`, `Sick`, `Personal`, `Misc`. Never renamed |
| `leaveTypes[].label` | string | NEW from `PRCompany` custom name fields, for example `VacationLongName` [DOC - Step 1 research] | The organisation's own wording. Not implemented today, so static labels are returned instead |
| `leaveTypes[].hidden` | boolean | NEW from `PRCompany` [DOC - Step 1 research] | True when the organisation does not use the slot. A hidden slot is still returned so a consumer can tell "unused" from "absent" |
| `payGroups` | array | DERIVED [DOC - Step 1 research] | The fixed six-slot pay-group model |
| `payGroups[].code` | integer | STORED `PREmployeeCompensationDetail.PayGroup` [DOC - Step 1 research] | `0` is Normal Payroll, `1` to `5` are A to E |
| `payGroups[].label` | string | STORED `PRCompany.PayGroupName` [DOC - Step 1 research] | The organisation's own name for the slot |

### Example response

```json
{
  "asOf": "2026-08-07T09:15:00Z",
  "leaveTypes": [
    {"code": "Vacation", "label": "Vacation", "hidden": false},
    {"code": "Sick", "label": "Sick Leave", "hidden": false},
    {"code": "Personal", "label": "Personal", "hidden": false},
    {"code": "Misc", "label": "Other", "hidden": false}
  ],
  "payGroups": [
    {"code": 0, "label": "Normal Payroll"},
    {"code": 1, "label": "Weekly Staff"},
    {"code": 2, "label": "Monthly Clergy"},
    {"code": 3, "label": "Seasonal"},
    {"code": 4, "label": "Pay Group D"},
    {"code": 5, "label": "Pay Group E"}
  ]
}
```

Reconciliation: the slot counts are fixed by the data model, 4 leave-type slots and 6 pay-group slots, so 4 + 6 = 10 label rows in total and no figure here needs to agree with another API.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | Not reachable. The slots are fixed, so an unconfigured organisation returns every slot with `label` falling back to the slot key and `hidden` true |
| Partial (data exists for only part of the requested span) | Not applicable, there is no span. A `PRCompany` row missing a single name field returns that slot with the code as its label |
| Not-yet-existing entity (predates the requested window) | Not applicable, there is no window |
| Permission denied | `403` with no body. A caller without the Payroll read right gets nothing, including no label list |
| Upstream unavailable | `503`. The client falls back to the slot keys as labels and renders the rest of the widget, because a label outage must not blank an approval queue |

---

## API 2: summary

### Endpoint

```
GET /api/dashboard/payroll-scheduled-time-off/summary
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `asOf` | string (date-time) | No | Any ISO 8601 instant not in the future | Server clock at request time | The snapshot anchor. Also the date the outstanding boundary is measured against. Minted here and passed to every other read |
| `from` | string (date) | No | ISO 8601 date | First day of the month containing `asOf` | Inclusive start of the counting window. The default is `[TO CONFIRM - project owner]`: the build counts the working month, the legacy control counted the calendar year |
| `to` | string (date) | No | ISO 8601 date, on or after `from` | Last day of the month containing `asOf` | Inclusive end of the counting window |

Context header: `X-Company-ID`.

### Example requests

```
GET /api/dashboard/payroll-scheduled-time-off/summary
GET /api/dashboard/payroll-scheduled-time-off/summary?asOf=2026-08-07T09%3A15%3A00Z&from=2026-08-01&to=2026-08-31
```

The `asOf` value is URL-encoded because an ISO instant contains colons.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED echo of the param, or the server clock [TO CONFIRM - time zone basis, project owner] | The anchor every other call must be given |
| `windowFrom` | string (date) | DERIVED echo [TO CONFIRM - default window, project owner] | Inclusive start of the counted window |
| `windowTo` | string (date) | DERIVED echo [TO CONFIRM - default window, project owner] | Inclusive end of the counted window |
| `pendingUpcomingCount` | integer | DERIVED `count(ApprovedDate IS NULL AND OffDate >= date(asOf))` [BUILD] | The figure shown under the Pending label. **Excludes** outstanding day-lines |
| `pendingOutstandingCount` | integer | DERIVED `count(ApprovedDate IS NULL AND OffDate < date(asOf))` [BUILD] | The figure shown under the Outstanding label. Past due and still pending |
| `pendingTotalCount` | integer | DERIVED `pendingUpcomingCount + pendingOutstandingCount` [BUILD] | Every pending day-line. This, not `pendingUpcomingCount`, is what the queue header shows |
| `scheduledDayCount` | integer | DERIVED `count(*)` [BUILD] | Every day-line in the window, pending and approved. The approved figure is not returned, because nothing on screen renders it; it is `scheduledDayCount - pendingTotalCount` |
| `authorisedDepartmentCount` | integer | NEW from `PREmployeeTimeOffApprovals.HomeDepartmentIDs` [DOC - Step 1 research] | How many departments the caller may approve for. `0` means the caller has the module right but no approval authority |
| `partial` | boolean | NEW [TO CONFIRM - presentation, project owner] | True when some rows could not be fully resolved |
| `partialReason` | string or null | NEW [TO CONFIRM - presentation, project owner] | Machine-readable cause when `partial` is true, otherwise `null` |

### Example response

```json
{
  "asOf": "2026-08-07T09:15:00Z",
  "windowFrom": "2026-08-01",
  "windowTo": "2026-08-31",
  "pendingUpcomingCount": 18,
  "pendingOutstandingCount": 2,
  "pendingTotalCount": 20,
  "scheduledDayCount": 27,
  "authorisedDepartmentCount": 5,
  "partial": false,
  "partialReason": null
}
```

Reconciliation: the two compact-tier figures partition the pending set with no double count, 18 + 2 = 20, which is `pendingTotalCount` and is the same number API 3 returns as its header count; and the 20 pending day-lines plus the 7 approved ones account for every day-line in the window, 20 + 7 = 27, which is `scheduledDayCount` and is the same number API 3 returns beside its header count. The 7 is not a returned field; it is `scheduledDayCount - pendingTotalCount`.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | `200` with every count `0` and `authorisedDepartmentCount` greater than `0`. The compact tier renders two zeros, which is a real answer rather than an error |
| Partial (data exists for only part of the requested span) | `200` with `partial` true and `partialReason` naming the cause. Counts cover what resolved, and the client must show the figures as incomplete rather than authoritative |
| Not-yet-existing entity (predates the requested window) | `200` with every count `0`. An organisation with no time-off history is the empty case, not a fault |
| Permission denied | `403` with no body when the caller lacks the Payroll read right. A caller with the read right but no approval authority gets `200` with `authorisedDepartmentCount` `0` and every count `0`, so the client can distinguish the two |
| Upstream unavailable | `503`. The client shows the error state and does not substitute zeros, because a zero pending count and an unreachable service look identical on screen and mean opposite things |

---

## API 3: approval queue

### Endpoint

```
GET /api/dashboard/payroll-scheduled-time-off/queue
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `asOf` | string (date-time) | No | Any ISO 8601 instant not in the future | Server clock at request time | The shared anchor, taken from API 2 so the header counts and the rows cannot straddle a write |
| `from` | string (date) | No | ISO 8601 date | First day of the month containing `asOf` | Inclusive start of the window. Default is `[TO CONFIRM - project owner]` |
| `to` | string (date) | No | ISO 8601 date, on or after `from` | Last day of the month containing `asOf` | Inclusive end of the window |
| `status` | string | No | `all`, `pending`, `approved` | `pending` | Which day-lines appear as rows. Sent as the explicit sentinel `all`, never by omission |
| `groupBy` | string | No | `department`, `payGroup` | `department` | The subheading dimension. Also determines group membership, group counts and the sort order |
| `page` | integer | No | 1 or greater | `1` | 1-based page of **people** |
| `pageSize` | integer | No | 1 to 200 | `25` | People per page. The compact tier requests `6` |
| `sortBy` | string | No | `default`, `department`, `payGroup`, `employeeName`, `pendingCount` | `default` | `default` is the documented order: group dimension alphabetical, then employee name alphabetical, then date chronological |
| `sortDir` | string | No | `asc`, `desc` | `asc` | Direction for the leading sort key. The tiebreakers stay ascending so the total order is stable |

Context header: `X-Company-ID`.

### Example requests

```
GET /api/dashboard/payroll-scheduled-time-off/queue?asOf=2026-08-07T09%3A15%3A00Z
GET /api/dashboard/payroll-scheduled-time-off/queue?asOf=2026-08-07T09%3A15%3A00Z&from=2026-08-01&to=2026-08-31&status=pending&groupBy=department&page=1&pageSize=2
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED echo [TO CONFIRM - time zone basis, project owner] | The shared anchor this page was built against |
| `windowFrom` | string (date) | DERIVED echo [TO CONFIRM - default window, project owner] | Inclusive start of the window |
| `windowTo` | string (date) | DERIVED echo [TO CONFIRM - default window, project owner] | Inclusive end of the window |
| `status` | string | DERIVED echo [DOC - Step 1 research] | The applied status filter |
| `groupBy` | string | DERIVED echo [BUILD] | The applied grouping dimension |
| `sortBy` | string | DERIVED echo [DOC - Step 4 design] | The applied sort key |
| `sortDir` | string | DERIVED echo [DOC - Step 4 design] | The applied direction |
| `page` | integer | DERIVED echo [BUILD] | 1-based page of people |
| `pageSize` | integer | DERIVED echo [BUILD] | People per page |
| `totalCount` | integer | DERIVED count of **people** in the full filtered set [BUILD] | Drives the remaining-people note. Never a page count |
| `pendingTotalCount` | integer | DERIVED `count(ApprovedDate IS NULL)` over the full window, **ignoring `status`** [BUILD] | The header pending figure. Matches API 2's `pendingTotalCount` for the same window and anchor |
| `scheduledDayCount` | integer | DERIVED `count(*)` over the full window, **ignoring `status`** [BUILD] | The header total. Matches API 2's `scheduledDayCount` |
| `partial` | boolean | NEW [TO CONFIRM - presentation, project owner] | True when some rows could not be fully resolved |
| `partialReason` | string or null | NEW [TO CONFIRM - presentation, project owner] | Cause when `partial` is true |
| `groups` | array | DERIVED [BUILD] | Every group in the full filtered set, in display order. Not paged, so a group spanning two pages shows the same badge on both |
| `groups[].groupKey` | string | DERIVED stable key for the group value [BUILD] | Joins a person row to its subheading |
| `groups[].groupLabel` | string | STORED HomeDepartment, or STORED `PRCompany.PayGroupName` [DOC - Step 1 research] | The subheading text |
| `groups[].groupPendingCount` | integer | DERIVED `count(ApprovedDate IS NULL)` per group over the full window, ignoring `status` [BUILD] | The group badge. A full-set aggregate, never a page sum |
| `people` | array | DERIVED [BUILD] | This page of people, in the total order below |
| `people[].employeeId` | string | UNVERIFIED (backend team) employee identifier [TO CONFIRM] | Also the final sort tiebreaker |
| `people[].employeeName` | string | UNVERIFIED (backend team) employee display name [TO CONFIRM] | The person row label. Whether this is given-name-first or surname-first follows the existing display-name convention, which no source states |
| `people[].department` | string or null | STORED HomeDepartment [DOC - Step 1 research] | Null for an employee with no `HomeDepartmentID`, who groups under `Unassigned` |
| `people[].payGroup` | string or null | UNVERIFIED (backend team) join through `PREmployeeCompensationDetail.PayGroup`, labelled from `PRCompany.PayGroupName` [TO CONFIRM] | Null when the employee has no compensation-detail row. An indirect join, not a confirmed direct field |
| `people[].groupKey` | string | DERIVED [BUILD] | Which `groups[]` entry this person sits under |
| `people[].pendingCount` | integer | DERIVED `count(ApprovedDate IS NULL)` for this employee over the full window, ignoring `status` [BUILD] | The person badge |
| `people[].dayLineCount` | integer | DERIVED `count(*)` for this employee over the full window, ignoring `status` [BUILD] | Lets the client show an all-resolved chip without inspecting the array |
| `people[].canApprove` | boolean | NEW from `PREmployeeTimeOffApprovals` [DOC - Step 1 research] | Whether the caller may approve this employee's day-lines. The write re-checks server-side and never trusts this flag |
| `people[].dayLines` | array | DERIVED [BUILD] | Every day-line for this person in the window that the status filter admits. Bounded by definition at one per calendar day |
| `people[].dayLines[].offScheduleId` | string | STORED `PR_EmployeeOffSchedule` primary key [DOC - Step 1 research] | The write target and the innermost sort tiebreaker |
| `people[].dayLines[].offDate` | string (date) | STORED `PR_EmployeeOffSchedule.OffDate` [DOC - Step 1 research] | The single calendar day this line covers |
| `people[].dayLines[].leaveType` | string | STORED `PR_EmployeeOffSchedule` leave-type slot [DOC - Step 1 research] | Slot key, resolved to a label through API 1 |
| `people[].dayLines[].hours` | number | STORED `PR_EmployeeOffSchedule` hours by leave type [DOC - Step 1 research] | Hours for this day. Stored per row, never a request total divided across a span |
| `people[].dayLines[].approvalStatus` | string | DERIVED `Pending` when `ApprovedDate IS NULL`, else `Approved` [DOC - Step 1 research] | Two values only. There is no rejected state |
| `people[].dayLines[].isOutstanding` | boolean | DERIVED `ApprovedDate IS NULL AND OffDate < date(asOf)` [BUILD] | Past due and still pending. Derived against the shared anchor, not the client clock |
| `people[].dayLines[].approvedBy` | string or null | UNVERIFIED (backend team) approver identity [TO CONFIRM] | The name in the audit stamp. No source names the column that holds it |
| `people[].dayLines[].approvedDate` | string (date) or null | STORED `PR_EmployeeOffSchedule.ApprovedDate` [DOC - Step 1 research] | Null exactly when the line is pending |

### Example response

```json
{
  "asOf": "2026-08-07T09:15:00Z",
  "windowFrom": "2026-08-01",
  "windowTo": "2026-08-31",
  "status": "pending",
  "groupBy": "department",
  "sortBy": "default",
  "sortDir": "asc",
  "page": 1,
  "pageSize": 2,
  "totalCount": 6,
  "pendingTotalCount": 20,
  "scheduledDayCount": 27,
  "partial": false,
  "partialReason": null,
  "groups": [
    {"groupKey": "dept-104", "groupLabel": "Facilities", "groupPendingCount": 8},
    {"groupKey": "dept-101", "groupLabel": "Finance", "groupPendingCount": 3},
    {"groupKey": "dept-106", "groupLabel": "IT", "groupPendingCount": 1},
    {"groupKey": "dept-109", "groupLabel": "Ministry", "groupPendingCount": 8}
  ],
  "people": [
    {
      "employeeId": "e-3311",
      "employeeName": "Kofi Mensah",
      "department": "Facilities",
      "payGroup": "Seasonal",
      "groupKey": "dept-104",
      "pendingCount": 4,
      "dayLineCount": 4,
      "canApprove": true,
      "dayLines": [
        {"offScheduleId": "os-88401", "offDate": "2026-08-04", "leaveType": "Sick", "hours": 8, "approvalStatus": "Pending", "isOutstanding": true, "approvedBy": null, "approvedDate": null},
        {"offScheduleId": "os-88431", "offDate": "2026-08-26", "leaveType": "Vacation", "hours": 8, "approvalStatus": "Pending", "isOutstanding": false, "approvedBy": null, "approvedDate": null},
        {"offScheduleId": "os-88432", "offDate": "2026-08-27", "leaveType": "Vacation", "hours": 8, "approvalStatus": "Pending", "isOutstanding": false, "approvedBy": null, "approvedDate": null},
        {"offScheduleId": "os-88433", "offDate": "2026-08-28", "leaveType": "Vacation", "hours": 8, "approvalStatus": "Pending", "isOutstanding": false, "approvedBy": null, "approvedDate": null}
      ]
    },
    {
      "employeeId": "e-2044",
      "employeeName": "Marcus Bell",
      "department": "Facilities",
      "payGroup": "Weekly Staff",
      "groupKey": "dept-104",
      "pendingCount": 4,
      "dayLineCount": 4,
      "canApprove": true,
      "dayLines": [
        {"offScheduleId": "os-88112", "offDate": "2026-08-07", "leaveType": "Personal", "hours": 8, "approvalStatus": "Pending", "isOutstanding": false, "approvedBy": null, "approvedDate": null},
        {"offScheduleId": "os-88121", "offDate": "2026-08-24", "leaveType": "Vacation", "hours": 8, "approvalStatus": "Pending", "isOutstanding": false, "approvedBy": null, "approvedDate": null},
        {"offScheduleId": "os-88122", "offDate": "2026-08-25", "leaveType": "Vacation", "hours": 8, "approvalStatus": "Pending", "isOutstanding": false, "approvedBy": null, "approvedDate": null},
        {"offScheduleId": "os-88131", "offDate": "2026-08-29", "leaveType": "Personal", "hours": 8, "approvalStatus": "Pending", "isOutstanding": false, "approvedBy": null, "approvedDate": null}
      ]
    }
  ]
}
```

Reconciliation of the page against its group: the two people shown carry four pending day-lines each, 4 + 4 = 8, which is the Facilities `groupPendingCount`. Three more figures must cross-foot with it:

- That badge would read 8 on any page Facilities appeared on, because it is a full-set aggregate rather than a page sum.
- The four group badges account for every pending day-line in the window, 8 + 3 + 1 + 8 = 20, which is `pendingTotalCount` and matches API 2's `pendingTotalCount` for the same window and anchor.
- The 20 pending day-lines plus the 7 approved ones account for every day-line, 20 + 7 = 27, which is `scheduledDayCount` and matches API 2's `scheduledDayCount`.
- Kofi Mensah's four day-lines carry eight hours each, 8 + 8 + 8 + 8 = 32 hours, and one of them is outstanding because 4 August precedes the anchor date while 7 August, Marcus Bell's first line, does not.

At `pageSize` 2 there are three pages of people. `totalCount` 6, `pendingTotalCount` 20 and `scheduledDayCount` 27 are identical on all three pages.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | `200` with `people` and `groups` both empty arrays, `totalCount` `0`, and `pendingTotalCount` and `scheduledDayCount` still correct for the window. A status filter that admits nothing is this case, and it is not an error |
| Partial (data exists for only part of the requested span) | `200` with `partial` true and `partialReason` set. The most likely cause is `pay-group-join-incomplete`: rows resolved but `payGroup` is null for some people because they have no compensation-detail row. Under `groupBy=payGroup` those people appear in an `Unassigned` group rather than being dropped |
| Not-yet-existing entity (predates the requested window) | An employee with no day-lines in the window does not appear at all, in any `status` mode, and is not returned as an empty person row |
| Permission denied | `403` with no body without the Payroll read right. With the read right but no approval authority, `200` with empty `people` and `groups`; the client reads `authorisedDepartmentCount` `0` from API 2 to tell that apart from a genuinely clear queue |
| Upstream unavailable | `503`. The client shows the error state for the queue body and leaves the compact figures alone if API 2 already succeeded |

---

## API 4: leave calendar month

### Endpoint

```
GET /api/dashboard/payroll-scheduled-time-off/calendar
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `asOf` | string (date-time) | No | Any ISO 8601 instant not in the future | Server clock at request time | The shared anchor. Fixes the outstanding boundary so the day-map and the compact figures agree |
| `year` | integer | No | 1900 to 2200 | Year of `asOf` | Displayed month's year |
| `month` | integer | No | 1 to 12 | Month of `asOf` | Displayed month, 1-based |
| `department` | string | No | Any department present in the company | omitted, meaning all departments | Scopes the whole response except the option list. Omission is the wire form of All |
| `markerLimit` | integer | No | 1 to 10 | `3` | How many markers the caller renders per date. Anything beyond it is counted, not sent |

Context header: `X-Company-ID`.

### Example requests

```
GET /api/dashboard/payroll-scheduled-time-off/calendar?asOf=2026-08-07T09%3A15%3A00Z&year=2026&month=8
GET /api/dashboard/payroll-scheduled-time-off/calendar?asOf=2026-08-07T09%3A15%3A00Z&year=2026&month=8&department=Ministry&markerLimit=3
```

A department containing a space or an ampersand is URL-encoded.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED echo [TO CONFIRM - time zone basis, project owner] | The shared anchor |
| `year` | integer | DERIVED echo [BUILD] | Displayed year |
| `month` | integer | DERIVED echo [BUILD] | Displayed month, 1-based |
| `department` | string or null | DERIVED echo, `null` when all departments [BUILD] | The applied filter, so the client can render the filtered-empty state correctly |
| `peopleOut` | integer | DERIVED distinct employees over the **filtered** month [BUILD] | The summary line's people figure |
| `departmentsOut` | integer | DERIVED distinct departments over the **filtered** month [BUILD] | The summary line's department figure |
| `dayLineCount` | integer | DERIVED `count(*)` over the filtered month [BUILD] | Every day-line the month contains under the filter |
| `unfilteredPeopleOut` | integer | DERIVED distinct employees over the displayed month **ignoring `department`** [BUILD] | The count on the All option, and what tells a filtered miss from an empty month |
| `partial` | boolean | NEW [TO CONFIRM - presentation, project owner] | True when some rows could not be fully resolved |
| `partialReason` | string or null | NEW [TO CONFIRM - presentation, project owner] | Cause when `partial` is true |
| `departments` | array | DERIVED distinct HomeDepartment across the whole window, alphabetical, **ignoring `department`** [BUILD] | The filter's own option list. Spans the window rather than the displayed month, so an option does not vanish when its people are not out this month, and it never narrows when the filter is applied |
| `departments[].department` | string | STORED HomeDepartment [DOC - Step 1 research] | Option value and label |
| `departments[].peopleOut` | integer | DERIVED distinct employees in that department over the unfiltered **displayed month** [BUILD] | People, not day-lines, so the reader can see where to look before committing to a filter. Can legitimately be `0` for a department that has time off elsewhere in the window but none this month |
| `days` | array | DERIVED [BUILD] | Only dates that have at least one day-line, ascending. Dates with none are absent, and the client renders them neutral |
| `days[].date` | string (date) | STORED `PR_EmployeeOffSchedule.OffDate` [DOC - Step 1 research] | The calendar date |
| `days[].dayStatus` | string | DERIVED priority: `outstanding` if any, else `pending` if any, else `approved` [BUILD] | The date's overall state, spanning every row on it including the truncated ones |
| `days[].peopleOut` | integer | DERIVED distinct employees on that date under the filter [BUILD] | The full figure, not the number of markers returned |
| `days[].overflowCount` | integer | DERIVED `peopleOut - count(markers returned)` [BUILD] | Drives the overflow chip. Zero when every person fits |
| `days[].markers` | array | DERIVED, truncated to `markerLimit`, ordered by `employeeName` then `employeeId` so the truncation is reproducible [BUILD] | One entry per person out, up to the limit |
| `days[].markers[].employeeId` | string | UNVERIFIED (backend team) employee identifier [TO CONFIRM] | Marker identity and truncation tiebreaker |
| `days[].markers[].employeeName` | string | UNVERIFIED (backend team) employee display name [TO CONFIRM] | The client derives the initials from this |
| `days[].markers[].department` | string or null | STORED HomeDepartment [DOC - Step 1 research] | The marker's group label. The calendar's grouping dimension is fixed to department |
| `days[].markers[].approvalStatus` | string | DERIVED `Pending` when `ApprovedDate IS NULL`, else `Approved` [DOC - Step 1 research] | Each marker carries its own state, so a mixed date stays legible under one date-level state |
| `days[].markers[].isOutstanding` | boolean | DERIVED `ApprovedDate IS NULL AND OffDate < date(asOf)` [BUILD] | Past due and still pending, for this person on this date |

### Example response

```json
{
  "asOf": "2026-08-07T09:15:00Z",
  "year": 2026,
  "month": 8,
  "department": "Ministry",
  "peopleOut": 2,
  "departmentsOut": 1,
  "dayLineCount": 9,
  "unfilteredPeopleOut": 7,
  "partial": false,
  "partialReason": null,
  "departments": [
    {"department": "Admin", "peopleOut": 1},
    {"department": "Facilities", "peopleOut": 2},
    {"department": "Finance", "peopleOut": 1},
    {"department": "IT", "peopleOut": 1},
    {"department": "Ministry", "peopleOut": 2}
  ],
  "days": [
    {"date": "2026-08-01", "dayStatus": "outstanding", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5120", "employeeName": "Grace Lin", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": true}]},
    {"date": "2026-08-06", "dayStatus": "approved", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5077", "employeeName": "Thomas Ade", "department": "Ministry", "approvalStatus": "Approved", "isOutstanding": false}]},
    {"date": "2026-08-11", "dayStatus": "pending", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5120", "employeeName": "Grace Lin", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": false}]},
    {"date": "2026-08-13", "dayStatus": "pending", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5120", "employeeName": "Grace Lin", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": false}]},
    {"date": "2026-08-14", "dayStatus": "pending", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5120", "employeeName": "Grace Lin", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": false}]},
    {"date": "2026-08-18", "dayStatus": "pending", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5077", "employeeName": "Thomas Ade", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": false}]},
    {"date": "2026-08-19", "dayStatus": "pending", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5077", "employeeName": "Thomas Ade", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": false}]},
    {"date": "2026-08-20", "dayStatus": "pending", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5077", "employeeName": "Thomas Ade", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": false}]},
    {"date": "2026-08-21", "dayStatus": "pending", "peopleOut": 1, "overflowCount": 0,
     "markers": [{"employeeId": "e-5077", "employeeName": "Thomas Ade", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": false}]}
  ]
}
```

Reconciliation of the filtered month: the nine dated objects carry one person each and split between the two Ministry employees, Grace Lin with four and Thomas Ade with five, 4 + 5 = 9, which is `dayLineCount`.

Reconciliation of the option list: a person belongs to exactly one department, so the option counts partition the displayed month's distinct people, 1 + 2 + 1 + 1 + 2 = 7, which is `unfilteredPeopleOut`. Every one of the window's five departments has somebody out this month, so no option carries a zero here. The filtered `peopleOut` of 2 equals the Ministry option's own count, which is what makes the option list usable as a preview.

A busy date from the unfiltered call for the same month, at `markerLimit` 2, shows the truncation and the overflow chip:

```json
{
  "date": "2026-08-13",
  "dayStatus": "pending",
  "peopleOut": 3,
  "overflowCount": 1,
  "markers": [
    {"employeeId": "e-1180", "employeeName": "Dana Whitfield", "department": "Finance", "approvalStatus": "Pending", "isOutstanding": false},
    {"employeeId": "e-5120", "employeeName": "Grace Lin", "department": "Ministry", "approvalStatus": "Pending", "isOutstanding": false}
  ]
}
```

Reconciliation of the truncated date: markers returned plus the overflow count account for everyone out, 2 + 1 = 3, which is `peopleOut`. The third person, Elena Sokolova of IT, is counted but not sent, and `dayStatus` already spans her row.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | `200` with `days` empty. Two distinguishable cases: `department` `null` and `unfilteredPeopleOut` `0` is an empty month; `department` set and `unfilteredPeopleOut` greater than `0` is a filtered miss, and the client says so and points back to All. A filter matching nothing is not the same as an empty month |
| Partial (data exists for only part of the requested span) | `200` with `partial` true and `partialReason` set. A month is either scanned or it is not, so the realistic cause is `department-resolution-incomplete`: day-lines whose employee has no `HomeDepartmentID` are counted in `peopleOut` and `dayLineCount` but carry `department` `null` on their marker and appear under no option |
| Not-yet-existing entity (predates the requested window) | A month before the organisation's first time-off record returns `days` empty, with `departments` still listing the window's departments at a count of `0` each. Navigation still works; it is not a boundary error |
| Permission denied | `403` with no body without the Payroll read right. With the read right and no approval authority, `200` with everything empty and `unfilteredPeopleOut` `0` |
| Upstream unavailable | `503`. The client shows the error state in place of the grid and keeps the month navigation usable so a retry does not lose the user's position |

---

## API 5: calendar day detail

### Endpoint

```
GET /api/dashboard/payroll-scheduled-time-off/calendar/days/{date}
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `date` | string (date), path | Yes | ISO 8601 date | none | The date clicked. Path segment, not a query param |
| `asOf` | string (date-time) | No | Any ISO 8601 instant not in the future | Server clock at request time | The shared anchor, so the popover's states match the grid it opened from |
| `department` | string | No | Any department present in the company | omitted, meaning all departments | Must carry the calendar's current filter. Clicking a date while filtered must not list the whole organisation |
| `page` | integer | No | 1 or greater | `1` | 1-based page of people out on the date |
| `pageSize` | integer | No | 1 to 200 | `50` | People per page |
| `sortBy` | string | No | `employeeName` | `employeeName` | Single-value whitelist. The order is fixed by design |
| `sortDir` | string | No | `asc`, `desc` | `asc` | Direction for the leading key |

Context header: `X-Company-ID`.

### Example requests

```
GET /api/dashboard/payroll-scheduled-time-off/calendar/days/2026-08-04?asOf=2026-08-07T09%3A15%3A00Z
GET /api/dashboard/payroll-scheduled-time-off/calendar/days/2026-08-04?asOf=2026-08-07T09%3A15%3A00Z&department=Facilities&page=1&pageSize=50
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED echo [TO CONFIRM - time zone basis, project owner] | The shared anchor |
| `date` | string (date) | DERIVED echo [BUILD] | The date the popover describes |
| `department` | string or null | DERIVED echo, `null` when unfiltered [BUILD] | The applied filter, inherited from the calendar |
| `peopleOut` | integer | DERIVED distinct employees on the date under the filter, over the **full** set [BUILD] | The popover's footer count. Never a page count |
| `page` | integer | DERIVED echo [BUILD] | 1-based page |
| `pageSize` | integer | DERIVED echo [BUILD] | People per page |
| `totalCount` | integer | DERIVED count of rows in the full filtered set [BUILD] | Equals `peopleOut`, because one employee has at most one day-line per date |
| `sortBy` | string | DERIVED echo [BUILD] | The applied sort key |
| `sortDir` | string | DERIVED echo [BUILD] | The applied direction |
| `partial` | boolean | NEW [TO CONFIRM - presentation, project owner] | True when some rows could not be fully resolved |
| `partialReason` | string or null | NEW [TO CONFIRM - presentation, project owner] | Cause when `partial` is true |
| `people` | array | DERIVED [BUILD] | This page of people out on the date |
| `people[].offScheduleId` | string | STORED `PR_EmployeeOffSchedule` primary key [DOC - Step 1 research] | Row identity and final sort tiebreaker |
| `people[].employeeId` | string | UNVERIFIED (backend team) employee identifier [TO CONFIRM] | Sort tiebreaker, and how a marker click pre-focuses a row |
| `people[].employeeName` | string | UNVERIFIED (backend team) employee display name [TO CONFIRM] | The row label |
| `people[].department` | string or null | STORED HomeDepartment [DOC - Step 1 research] | Shown alongside the pay group, because the popover names both |
| `people[].payGroup` | string or null | UNVERIFIED (backend team) join through `PREmployeeCompensationDetail.PayGroup` [TO CONFIRM] | Null when the employee has no compensation-detail row |
| `people[].leaveType` | string | STORED `PR_EmployeeOffSchedule` leave-type slot [DOC - Step 1 research] | Slot key, resolved to a label through API 1 |
| `people[].hours` | number | STORED `PR_EmployeeOffSchedule` hours by leave type [DOC - Step 1 research] | Hours for this date |
| `people[].approvalStatus` | string | DERIVED `Pending` when `ApprovedDate IS NULL`, else `Approved` [DOC - Step 1 research] | Two values only |
| `people[].isOutstanding` | boolean | DERIVED `ApprovedDate IS NULL AND OffDate < date(asOf)` [BUILD] | Past due and still pending |
| `people[].approvedBy` | string or null | UNVERIFIED (backend team) approver identity [TO CONFIRM] | The name in the audit stamp |
| `people[].approvedDate` | string (date) or null | STORED `PR_EmployeeOffSchedule.ApprovedDate` [DOC - Step 1 research] | Null exactly when pending |

### Example response

```json
{
  "asOf": "2026-08-07T09:15:00Z",
  "date": "2026-08-04",
  "department": null,
  "peopleOut": 2,
  "page": 1,
  "pageSize": 50,
  "totalCount": 2,
  "sortBy": "employeeName",
  "sortDir": "asc",
  "partial": false,
  "partialReason": null,
  "people": [
    {"offScheduleId": "os-88510", "employeeId": "e-4402", "employeeName": "Elena Sokolova", "department": "IT", "payGroup": "Seasonal", "leaveType": "Sick", "hours": 8, "approvalStatus": "Approved", "isOutstanding": false, "approvedBy": "M. Reyes", "approvedDate": "2026-08-01"},
    {"offScheduleId": "os-88401", "employeeId": "e-3311", "employeeName": "Kofi Mensah", "department": "Facilities", "payGroup": "Seasonal", "leaveType": "Sick", "hours": 8, "approvalStatus": "Pending", "isOutstanding": true, "approvedBy": null, "approvedDate": null}
  ]
}
```

Reconciliation: one approved row plus one pending row accounts for everyone out on the date, 1 + 1 = 2, which is both `peopleOut` and `totalCount`; the hours on the date total 8 + 8 = 16. This is the mixed-state case, so API 4 returns `dayStatus` `outstanding` for 4 August by priority while the two rows here keep their own separate states.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | `200` with `people` empty, `peopleOut` `0` and `totalCount` `0`. Reachable when the department filter excludes everyone on the date, or when a write cleared the date between the grid render and the click. The client closes the popover rather than showing an empty card |
| Partial (data exists for only part of the requested span) | `200` with `partial` true and `partialReason` `pay-group-join-incomplete`. The row is still returned with `payGroup` `null`, because the popover's purpose is who is out, and a missing pay group must not hide a person |
| Not-yet-existing entity (predates the requested window) | A date with no records is the empty case above. A date outside the anchor's plausible range is still answered, not rejected |
| Permission denied | `403` with no body without the Payroll read right. With the read right and no approval authority, `200` with `people` empty |
| Upstream unavailable | `503`. The popover shows the error state and stays dismissible, so a failed drill never traps the user in a dialog |

---

## API 6: person context

### Endpoint

```
GET /api/dashboard/payroll-scheduled-time-off/employees/{employeeId}/context
```

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `employeeId` | string, path | Yes | An employee in the caller's authorised departments | none | The subject of the popover |
| `asOf` | string (date-time) | No | Any ISO 8601 instant not in the future | Server clock at request time | The shared anchor, so the overlap rows' states match the queue behind the popover |
| `year` | integer | No | 1900 to 2200 | Year of `asOf` | The year both aggregations cover |
| `page` | integer | No | 1 or greater | `1` | 1-based page of overlap rows |
| `pageSize` | integer | No | 1 to 200 | `25` | Overlap rows per page |
| `sortBy` | string | No | `employeeName`, `offDate` | `employeeName` | Leading key for the overlap list |
| `sortDir` | string | No | `asc`, `desc` | `asc` | Direction for the leading key |

Context header: `X-Company-ID`.

### Example requests

```
GET /api/dashboard/payroll-scheduled-time-off/employees/e-5120/context?asOf=2026-08-07T09%3A15%3A00Z
GET /api/dashboard/payroll-scheduled-time-off/employees/e-5120/context?asOf=2026-08-07T09%3A15%3A00Z&year=2026&page=1&pageSize=25&sortBy=employeeName&sortDir=asc
```

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED echo [TO CONFIRM - time zone basis, project owner] | The shared anchor |
| `year` | integer | DERIVED echo [BUILD] | The year both aggregations cover |
| `employeeId` | string | UNVERIFIED (backend team) employee identifier [TO CONFIRM] | The subject |
| `employeeName` | string | UNVERIFIED (backend team) employee display name [TO CONFIRM] | Popover header |
| `department` | string or null | STORED HomeDepartment [DOC - Step 1 research] | The subject's own department, shown in the header |
| `payGroup` | string or null | UNVERIFIED (backend team) join through `PREmployeeCompensationDetail.PayGroup` [TO CONFIRM] | The subject's own pay group, shown in the header |
| `totalDays` | integer | NEW aggregation: count of the subject's day-lines across the year [TO CONFIRM - backend team] | The header total. Returned rather than summed client-side, because a hidden leave-type slot can hold days no listed row accounts for |
| `leaveTypeTotals` | array | NEW aggregation over `PR_EmployeeOffSchedule` [TO CONFIRM - backend team] | Every configured slot, in fixed order, including slots with zero days |
| `leaveTypeTotals[].leaveType` | string | STORED `PR_EmployeeOffSchedule` leave-type slot [DOC - Step 1 research] | Slot key, resolved to a label through API 1 |
| `leaveTypeTotals[].days` | integer | NEW aggregation: count of the subject's day-lines in that slot across the year [TO CONFIRM - backend team] | Day counts, not hours. The counting unit is a design choice rather than a documented legacy formula |
| `page` | integer | DERIVED echo [BUILD] | 1-based page of overlaps |
| `pageSize` | integer | DERIVED echo [BUILD] | Overlap rows per page |
| `totalCount` | integer | NEW: count of overlapping rows in the **full** set [TO CONFIRM - backend team] | Spans every page. Zero drives the no-one-overlaps state |
| `sortBy` | string | DERIVED echo [BUILD] | The applied sort key |
| `sortDir` | string | DERIVED echo [BUILD] | The applied direction |
| `partial` | boolean | NEW [TO CONFIRM - presentation, project owner] | True when some rows could not be fully resolved |
| `partialReason` | string or null | NEW [TO CONFIRM - presentation, project owner] | Cause when `partial` is true |
| `overlaps` | array | NEW aggregation over `PR_EmployeeOffSchedule` [TO CONFIRM - backend team] | Every other employee's day-line falling on any date the subject is off, one row per overlapping day-line |
| `overlaps[].offScheduleId` | string | STORED `PR_EmployeeOffSchedule` primary key [DOC - Step 1 research] | Row identity and final sort tiebreaker |
| `overlaps[].employeeId` | string | UNVERIFIED (backend team) employee identifier [TO CONFIRM] | The overlapping employee |
| `overlaps[].employeeName` | string | UNVERIFIED (backend team) employee display name [TO CONFIRM] | Row label and leading sort key |
| `overlaps[].department` | string or null | STORED HomeDepartment [DOC - Step 1 research] | Shown with the pay group, because coverage is judged against both |
| `overlaps[].payGroup` | string or null | UNVERIFIED (backend team) join through `PREmployeeCompensationDetail.PayGroup` [TO CONFIRM] | Null when the employee has no compensation-detail row |
| `overlaps[].offDate` | string (date) | STORED `PR_EmployeeOffSchedule.OffDate` [DOC - Step 1 research] | The overlapping date, which is by definition one of the subject's own dates |
| `overlaps[].leaveType` | string | STORED `PR_EmployeeOffSchedule` leave-type slot [DOC - Step 1 research] | Slot key, resolved to a label through API 1 |
| `overlaps[].approvalStatus` | string | DERIVED `Pending` when `ApprovedDate IS NULL`, else `Approved` [DOC - Step 1 research] | Status-agnostic list, so a supervisor sees the whole coverage picture rather than the approved half of it |

### Example response

```json
{
  "asOf": "2026-08-07T09:15:00Z",
  "year": 2026,
  "employeeId": "e-5120",
  "employeeName": "Grace Lin",
  "department": "Ministry",
  "payGroup": "Monthly Clergy",
  "totalDays": 7,
  "leaveTypeTotals": [
    {"leaveType": "Vacation", "days": 2},
    {"leaveType": "Sick", "days": 3},
    {"leaveType": "Personal", "days": 2},
    {"leaveType": "Misc", "days": 0}
  ],
  "page": 1,
  "pageSize": 25,
  "totalCount": 3,
  "sortBy": "employeeName",
  "sortDir": "asc",
  "partial": false,
  "partialReason": null,
  "overlaps": [
    {"offScheduleId": "os-88201", "employeeId": "e-1180", "employeeName": "Dana Whitfield", "department": "Finance", "payGroup": "Weekly Staff", "offDate": "2026-08-13", "leaveType": "Vacation", "approvalStatus": "Pending"},
    {"offScheduleId": "os-88202", "employeeId": "e-1180", "employeeName": "Dana Whitfield", "department": "Finance", "payGroup": "Weekly Staff", "offDate": "2026-08-14", "leaveType": "Vacation", "approvalStatus": "Pending"},
    {"offScheduleId": "os-88512", "employeeId": "e-4402", "employeeName": "Elena Sokolova", "department": "IT", "payGroup": "Seasonal", "offDate": "2026-08-13", "leaveType": "Personal", "approvalStatus": "Pending"}
  ]
}
```

Reconciliation of the year totals: the four configured slots account for the subject's whole year, 2 + 3 + 2 + 0 = 7, which is `totalDays`. The zero slot is returned rather than omitted, so the reader can see that no misc leave was taken instead of guessing why a row is missing.

Reconciliation of the overlap list: the rows group into two overlapping colleagues, Dana Whitfield on two of the subject's dates and Elena Sokolova on one, 2 + 1 = 3, which is `totalCount`. Every `offDate` here is one of the subject's own dates, which is what makes the list a coverage answer rather than a general absence list.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | `200` with `overlaps` empty and `totalCount` `0`, while `leaveTypeTotals` is still returned in full. The two halves are independent: a person can have time off and still overlap nobody. The client renders the no-one-overlaps line |
| Partial (data exists for only part of the requested span) | `200` with `partial` true and `partialReason` `pay-group-join-incomplete`. Overlap rows are returned with `payGroup` `null` rather than dropped, because an unresolved pay group must not hide a coverage conflict |
| Not-yet-existing entity (predates the requested window) | An employee with no day-lines in the requested year returns `totalDays` `0`, every `leaveTypeTotals[].days` `0`, and `overlaps` empty. Not an error: a person with no time off is a legitimate answer |
| Permission denied | `403` with no body without the Payroll read right. `403` also when the subject is outside the caller's authorised departments, because the popover would otherwise leak an employee the caller may not see |
| Upstream unavailable | `503`. The popover shows the error state and stays dismissible. The queue behind it is untouched, because the aggregations are not needed to render it |

---

## API 7: approval write

### Endpoint

```
PUT /api/dashboard/payroll-scheduled-time-off/entries/{offScheduleId}/approval
```

A `PUT` of a desired state, not a `POST` of an event, so the call is idempotent by construction: sending the same intent twice leaves the same state and the same `ApprovedDate`.

### Parameters

| Name | Type | Required | Allowed values | Default | Description |
|---|---|---|---|---|---|
| `offScheduleId` | string, path | Yes | A `PR_EmployeeOffSchedule` primary key in the caller's authorised departments | none | The single day-line being approved or returned to pending |
| `approved` | boolean, body | Yes | `true`, `false` | none | The desired state. `true` sets `ApprovedDate`, `false` clears it |
| `asOf` | string (date-time), body | Yes | The anchor the client last read this entry under | none | The stale-anchor guard. Required, so a blind overwrite is not expressible |
| `from` | string (date), query | No | ISO 8601 date | First day of the month containing the server clock | Inclusive start of the window the returned summary is recomputed over |
| `to` | string (date), query | No | ISO 8601 date, on or after `from` | Last day of the month containing the server clock | Inclusive end of that window |

Context header: `X-Company-ID`.

### Example requests

```
PUT /api/dashboard/payroll-scheduled-time-off/entries/os-88401/approval
{"approved": true, "asOf": "2026-08-07T09:15:00Z"}

PUT /api/dashboard/payroll-scheduled-time-off/entries/os-88401/approval?from=2026-08-01&to=2026-08-31
{"approved": false, "asOf": "2026-08-07T09:16:12Z"}
```

The second request is the Undo: it clears `ApprovedDate` and returns the day-line to pending.

### Response schema

| Field | Type | Provenance | Description |
|---|---|---|---|
| `asOf` | string (date-time) | DERIVED server clock after the update [TO CONFIRM - time zone basis, project owner] | A fresh anchor the client adopts for its follow-up reads |
| `windowFrom` | string (date) | DERIVED echo [TO CONFIRM - default window, project owner] | Inclusive start of the recomputed summary window |
| `windowTo` | string (date) | DERIVED echo [TO CONFIRM - default window, project owner] | Inclusive end of that window |
| `offScheduleId` | string | STORED `PR_EmployeeOffSchedule` primary key [DOC - Step 1 research] | The row that was written |
| `employeeId` | string | UNVERIFIED (backend team) employee identifier [TO CONFIRM] | Lets the client locate the row it just changed |
| `offDate` | string (date) | STORED `PR_EmployeeOffSchedule.OffDate` [DOC - Step 1 research] | The day-line's date |
| `approvalStatus` | string | DERIVED `Pending` when `ApprovedDate IS NULL`, else `Approved` [DOC - Step 1 research] | The state after the write |
| `isOutstanding` | boolean | DERIVED `ApprovedDate IS NULL AND OffDate < date(asOf)` [BUILD] | Approving a past-due line clears this. Undoing one can set it again |
| `approvedBy` | string or null | UNVERIFIED (backend team) approver identity [TO CONFIRM] | The caller after an approve, `null` after an undo |
| `approvedDate` | string (date) or null | STORED `PR_EmployeeOffSchedule.ApprovedDate` [DOC - Step 1 research] | Set on approve, cleared on undo |
| `summary` | object | DERIVED [BUILD] | The same four counts API 2 returns, recomputed over the window after the write, so the compact figures update without a second call |
| `summary.pendingUpcomingCount` | integer | DERIVED `count(ApprovedDate IS NULL AND OffDate >= date(asOf))` [BUILD] | The Pending figure after the write |
| `summary.pendingOutstandingCount` | integer | DERIVED `count(ApprovedDate IS NULL AND OffDate < date(asOf))` [BUILD] | The Outstanding figure after the write |
| `summary.pendingTotalCount` | integer | DERIVED sum of the two above [BUILD] | Every pending day-line after the write |
| `summary.scheduledDayCount` | integer | DERIVED `count(*)` [BUILD] | Unchanged by a write, since approving creates and removes no day-line |

### Example response

Approving the outstanding 4 August day-line from API 3's example:

```json
{
  "asOf": "2026-08-07T09:16:12Z",
  "windowFrom": "2026-08-01",
  "windowTo": "2026-08-31",
  "offScheduleId": "os-88401",
  "employeeId": "e-3311",
  "offDate": "2026-08-04",
  "approvalStatus": "Approved",
  "isOutstanding": false,
  "approvedBy": "M. Reyes",
  "approvedDate": "2026-08-07",
  "summary": {
    "pendingUpcomingCount": 18,
    "pendingOutstandingCount": 1,
    "pendingTotalCount": 19,
    "scheduledDayCount": 27
  }
}
```

Reconciliation against the pre-write figures: the approved line was outstanding, so Outstanding drops by one while Pending is untouched, and the partition still holds, 18 + 1 = 19, which is `summary.pendingTotalCount`. One day-line moved from pending to approved, so the 19 remaining pending plus the 8 now approved still account for everything, 19 + 8 = 27, which is `summary.scheduledDayCount` and is the same 27 API 2 and API 3 return. The day-line count itself does not move, because a write changes a status and never a row count.

### Idempotency, conflict and authority

- **Idempotency.** A repeated `PUT` with the same `approved` value returns `200` and does **not** touch `ApprovedDate`. The stamp records when the entry was first approved, not when it was last confirmed, so a double click cannot silently rewrite an audit date. No idempotency key is needed: the desired-state form supplies it.
- **Stale anchor with a divergent intent.** If the entry was written by another user after the caller's `asOf`, and the requested state differs from the current state, the server returns `409` with the entry's current state in the body, including `approvedBy` and `approvedDate`, so the client can say who got there first rather than reporting a generic failure.
- **Stale anchor with a matching intent.** If the entry was written by another user after `asOf` but the requested state equals the current state, the server returns `200`. Two approvers reaching the same conclusion is not a conflict.
- **Authority.** The caller's `PREmployeeTimeOffApprovals.HomeDepartmentIDs` is re-checked on every write against the entry's employee's `HomeDepartmentID`. `403` when it does not match. The `canApprove` flag on the read is a hint for suppressing an affordance and is never trusted as authorisation.
- **No bulk form.** One day-line per call. There is no batch body, no person-level endpoint and no transactional group, so a supervisor clearing four days issues four calls, each independently reversible.

### State contracts

| State | Response |
|---|---|
| Empty (no rows match) | Not applicable. A write names exactly one row, and a missing row is the unknown-id case below rather than an empty result |
| Partial (data exists for only part of the requested span) | `200` with the entry written and `summary` computed over whatever the window resolved. A partial summary never blocks the write, because the approval is the point and the counts are secondary |
| Not-yet-existing entity (predates the requested window) | `404 unknown-entry` when `offScheduleId` does not exist or has been deleted. The client refreshes the queue rather than retrying, because the row it drew is gone |
| Permission denied | `403` with no body without the Payroll write right, and `403 not-authorised-department` when the entry's employee is outside the caller's authorised departments. The two are distinguishable so the client can tell a rights problem from a scoping one |
| Upstream unavailable | `503`, and the client must treat the outcome as **unknown**, re-read with API 3 and re-render before offering the action again. It must not assume the write failed, because a `503` after a committed update would otherwise show a stale pending state |

---

## Auth and scoping

- **Company scoping.** `X-Company-ID` is required on all seven calls. Every query is filtered by it: `PR_EmployeeOffSchedule WHERE CompanyID = <X-Company-ID>`. There is no cross-company rollup in this contract.
- **Read right.** The Payroll module read right, matching the Modern API's Payroll module field. Without it, every endpoint returns `403` with no body.
- **Approval authority is a second, narrower scope, and it applies to reads as well as the write.** Every read is restricted to employees whose `HomeDepartmentID` appears in the caller's `PREmployeeTimeOffApprovals.HomeDepartmentIDs`. This is the single most important gap in the current Modern API: today it returns all company schedules, so every supervisor sees every employee's time off. It is a security and correctness defect, not a convenience feature, and it is `NEW` backend work.
- **Write right.** The same approval authority, re-checked per entry at write time. A caller may hold the Payroll read right through a wider oversight role and still be unable to approve, which is why `people[].canApprove` exists on the read.
- **What a user with read but not write sees.** The full queue and calendar for whatever they may read, with `canApprove` `false` on every person, so the Approve and Undo affordances are absent rather than present and failing.
- **What a user with the read right but no approval authority at all sees.** `200` from every read, with `authorisedDepartmentCount` `0` and every row list empty. Whether the widget then hides itself or shows an explicit no-access message is a product decision that is not yet made, and it is listed in *Still needs sign-off*.

---

## Edge cases

1. **Empty results.** Any read matching nothing returns `200` with well-formed zeros and empty arrays, never an error.
2. **No comparison baseline.** There is none to miss: this widget shows no delta, no prior period and no target, so there is no baseline case to handle.
3. **A request spanning a month boundary.** A request from 30 July to 2 August is four day-lines. The queue window admits whichever of them fall inside it, and the calendar shows each in its own month, so the same request legitimately appears in two months with no row duplicated.
4. **Division by zero.** No percentage or ratio is computed anywhere in this contract, so the case cannot arise. The rule for any future rate is stated in *Where computation lives*: `null`, not `0`.
5. **Pagination past the end.** `200`, empty array, correct `totalCount`, every aggregate unchanged.
6. **Contradicting params.** `status` or `groupBy` sent to a calendar endpoint, or `department` sent to the queue, is `400 unknown-parameter` rather than silently ignored.
7. **Employee hired mid-window.** Only their day-lines inside the window appear. They are absent from the queue entirely rather than shown as an empty person row.
8. **Employee terminated mid-window.** Their existing day-lines stay in the window and stay approvable, because a terminated employee's approved time off is still a payroll fact. Whether a terminated employee should still appear in a supervisor's queue is not stated in any source.
9. **Stale snapshot on write.** `409` with the current entry when another user changed it after the caller's `asOf` and the intent differs; `200` when the intent matches.
10. **Unknown `offScheduleId`.** `404 unknown-entry`. The client refreshes rather than retries.
11. **Unknown department value.** `400 unknown-department`. A valid department with no rows this month is the empty case instead.
12. **Blank `HomeDepartmentID`.** The employee groups under `Unassigned`, is included when no department filter is set, and is excluded when a specific department is requested. A blank is never a wildcard.
13. **Missing `PREmployeeCompensationDetail` row.** `payGroup` returns `null`, the person still appears, and under `groupBy=payGroup` they land in `Unassigned`. The row is never dropped for want of a pay group.
14. **Approving an already-approved day-line.** `200`, no change to `ApprovedDate`.
15. **Undoing an already-pending day-line.** `200`, no change. Both directions are idempotent.
16. **The outstanding boundary at a date change.** Outstanding is measured against `date(asOf)`, so a session held open across midnight keeps its original classification until the next read. The time zone the date is taken in is not stated in any source and is listed in *Still needs sign-off*.
17. **Outstanding day-lines dated before the requested window.** They are outside the window and therefore invisible in both the queue and the counts, so a past-due line from an earlier month cannot be found or cleared. This follows from the window default and is listed in *Still needs sign-off*.
18. **A leave-type slot with no configured label.** `leaveTypes[].label` falls back to the slot key and `hidden` is true. Day-lines in a hidden slot are still returned and still counted in `totalDays`.
19. **More people out on a date than `markerLimit`.** The markers are truncated by a deterministic order and `overflowCount` carries the remainder. `dayStatus` and `peopleOut` still span every row on the date, including the truncated ones.
20. **A department with rows this month and none next month.** The option survives month navigation with a count of `0`, the selection is kept, and the response is the filtered-empty case. The user's filter is never silently moved and the option never disappears from under them.
21. **Adjacent-month cells in the grid.** `days[]` contains only dates inside the requested month. Leading and trailing cells are calendar arithmetic the client performs, and they are never populated from a neighbouring month's data.
22. **Two day-lines for the same employee on the same date.** Each is its own row with its own `offScheduleId` and is approved independently. `peopleOut` counts distinct employees, so it does not double count, which is why `totalCount` and `peopleOut` can differ on API 5.
23. **A day-line with zero or null hours.** Returned as stored. The hours are display data and never a divisor, so a zero is rendered as a zero rather than suppressed.
24. **A multi-day request whose hours do not divide evenly across its days.** The case does not arise: `PR_EmployeeOffSchedule` stores hours per `OffDate`, so per-day hours are read, never computed by dividing a request total across a span.

---

## Not in scope

- **Bulk approve, at person, group or queue level.** There is no batch endpoint and no person-level write. Approval is one day-line per call. Jo's dossier asks for bulk approve to be added, which cuts against the project's design; both positions are recorded in *Still needs sign-off* and neither is specced.
- **Reject or deny.** There is no rejected state and no reject endpoint. Undo clears `ApprovedDate` and returns the day-line to pending, which is the only reversal.
- **The Calendar Year control and the existing year list.** No control selects a year, so `GET .../filters` and its `Years` array are not consumed by this contract. The window is set by `from` and `to` instead.
- **A leave-type filter.** Leave type is a display dimension and an aggregation key. No endpoint takes it as a param.
- **Employee leave balances, accruals and blackout dates.** The dossier raises all three as questions. None is in this contract and none has a named source table.
- **An approval audit history.** Only the current `approvedBy` and `approvedDate` are returned. There is no endpoint listing prior approvals, undos or who changed what when.
- **Persisting the Status, Group by and Department selections.** `SSUserTenantPreference` holds a year and a view selection today; whether these three controls persist is undecided and no read or write of that key is specced here.
- **Export.** No export endpoint, in any format.
- **Drill-through to another page.** The queue and the popovers are the whole drill. Nothing navigates away from the dashboard.
- **Cross-company rollup.** Every query is scoped to one `X-Company-ID`.
- **Presentation of the freshness anchor.** `asOf` is returned on every call. Whether a data-as-of line is shown, and where, is not specified.

---

## Still needs sign-off

1. **Queue ordering is documented but not implemented.** The contract's ordering requirement is the documented rule: group dimension alphabetical, then employee name alphabetical, then date chronological. The build sorts the group level alphabetically only under the department dimension, never sorts people, and never sorts day-lines chronologically. **Decides:** project owner, either implement the documented sort or restate the rule. **Blocked until then:** API 3's `default` sort value has a documented definition the build does not yet match, so a developer implementing this contract will produce a different order from the mock.
2. **Bulk approve: unreviewed conflict, no side taken.** Jo's dossier asks for bulk approve to be **added**, in its target composition ("Add bulk approve (absent today)"), in decision 11.1, and in its states table ("Bulk approve should confirm"). The project's design **removed** person-level bulk approve by owner direction, on the reasoning that with day-lines collapsed behind an expander a bulk control would let an approver clear a whole month without seeing the days. No file assigning statuses to her flags exists for this widget, so this is **Unreviewed**. This contract specs the project's design, per-day approval only. **Decides:** project owner, by assigning the dossier a status. **Blocked until then:** whether a bulk write endpoint exists at all.
3. **Explicit reject state: unreviewed conflict, no side taken.** The dossier asks for approve, reject and pending as distinct recorded states with an audit trail (section 9, decision 11.4, and its gaps table at Med/High impact). The project's design has two stored statuses and no rejected state, so it needs no new status field and no reject endpoint. **Unreviewed**, same reason as above. This contract specs two statuses. **Decides:** project owner. **Blocked until then:** whether a status column and a reject endpoint are needed.
4. **The counting window.** The default `from` and `to` are the month containing the anchor, following the build. The legacy control counted a calendar year. No source states which the compact figures should use. **Decides:** project owner. **Blocked until then:** the default value of `from` and `to` on API 2, API 3 and API 7, and therefore what the compact figures mean.
5. **The current-date reference behind the outstanding split.** Outstanding is measured against `date(asOf)`. Which time zone that date is taken in, the company's or the caller's, is not stated in any source, and it decides the classification of every day-line on the boundary date. **Decides:** project owner. **Blocked until then:** a reproducible outstanding count.
6. **Outstanding day-lines outside the window are unreachable.** Because the window defaults to one month, a pending day-line from an earlier month is neither counted nor listed, so it cannot be cleared from this widget. This follows directly from items 4 and 5 and is stated separately because it is the practical consequence. **Decides:** project owner. **Blocked until then:** whether the queue needs a separate all-outstanding read.
7. **The queue's treatment of outstanding day-lines.** The queue's pending filter and its header, group and person counts all **include** outstanding day-lines, and there is no separate outstanding filter. The compact tier splits them. So "pending" means two different populations in two places, which is why `pendingTotalCount` and `pendingUpcomingCount` are named separately in this contract rather than both being called pending. **Decides:** project owner, either align the queue with the compact split or add a dedicated outstanding filter. **Blocked until then:** whether API 3 needs a fourth `status` value.
8. **What a user with no approval authority sees.** The response shape is specced: `200`, `authorisedDepartmentCount` `0`, empty rows. Whether the widget hides itself or shows an explicit no-access message is undecided, and the dossier's states table raises the same question. **Decides:** project owner. **Blocked until then:** nothing in the contract; the presentation only.
9. **Confirmation, success feedback and failure presentation for approve and undo.** The write's error, conflict and idempotency semantics are specced above. Whether an approval is confirmed before it fires, what the client shows on success, and how a `409` or a `503` is surfaced are product decisions with no source. **Decides:** project owner. **Blocked until then:** nothing in the contract; the client behaviour only.
10. **Loading, error and partial presentation.** Response shapes are specced per API. How each is rendered is unspecified in every source. **Decides:** design. **Blocked until then:** nothing in the contract.
11. **The pay-group join.** Reaching a pay group from a day-line goes through `PREmployeeCompensationDetail.PayGroup`, an indirect join rather than a confirmed direct field, with precedent in `PRTimeCardRepository`. Every `payGroup` field in this contract is `UNVERIFIED`. **Decides:** backend team. **Blocked until then:** `groupBy=payGroup` on API 3, and the pay-group line in three popovers.
12. **The employee master, the display name and the approver identity.** No source names the table holding employees, the column holding the display name, or the column behind the "Approved by" stamp. All three are `UNVERIFIED` in every schema above. If no approver column exists, adding one is the contract's only schema change. **Decides:** backend team. **Blocked until then:** `employeeName`, `employeeId` and `approvedBy` everywhere.
13. **Whether the display name sorts on the given name or the surname.** It sets the queue's person order and the calendar's marker truncation, and therefore which people appear on page 1 and which markers are shown before the overflow chip. No source states the convention. **Decides:** project owner. **Blocked until then:** a reproducible order for API 3 and API 4.
14. **Whether a hidden leave-type slot still counts toward the year total.** This contract counts it, so `totalDays` can exceed the sum of the labelled rows when an organisation hides a slot that holds days. **Decides:** project owner. **Blocked until then:** whether `totalDays` and `leaveTypeTotals` are guaranteed to cross-foot.
15. **Worst-realistic row counts.** Four datasets have no documented basis for a ceiling: the queue's people and day-lines, the department option list, a single date's people, and the coverage overlap list. The build fixture is a typical-case figure and is not a basis. **Decides:** project owner, to supply a headcount and a day-lines-per-employee figure, or to commission a live query. **Blocked until then:** the `pageSize` maxima are set defensively at 200 rather than to a measured ceiling.
16. **The rest of Jo's dossier is unreviewed but not in conflict.** Its pending-count figure, its pending-first default and its coverage calendar all match what this contract funds, and its accessibility asks are design-side. Two further divergences are worth a status: the dossier's compact-tier figure is a request count plus the number of employees affected, whereas this contract returns two day-line counts and no employee figure; and the dossier asks for a data-as-of timestamp, which `asOf` supplies but which nothing displays. **Decides:** project owner. **Blocked until then:** nothing; recorded so a dossier reader is not left guessing.

This list is not empty, and items 1, 2, 3, 4, 5 and 11 each change what a developer builds.
