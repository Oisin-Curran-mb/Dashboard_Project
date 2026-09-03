# Insurance Billing Plans (W06) - API Spec Decisions Log

Dated record of decisions, superseded thinking and change history for this widget's API spec. Kept **outside** the spec so the spec itself stays a present-tense contract. The spec may state an outcome here as fact; it never narrates the decision.

---

## 2026-09-02 - V2 spec completed against build v2.4

The V2 spec in `v2/` was drafted in the 2026-08-30 batch run but the writing agent was cut off before it wrote this log or the Step 5 index row. This pass treated the drafted `.md` as untrusted, diffed it against build v2.4 and the 2026-09-02 Step 4 doc, and completed the trailing artifacts. The V1 spec stays in place, frozen, at the folder root.

**Build-vs-doc conflict gate: CLEAR.** No material disagreement between build v2.4 and the Step 4 doc. Verified before the cutoff and not re-opened by anything in v2.3 or v2.4, both of which are pure chart presentation (see below).

**What the diff against the build actually found.** The drafted spec holds up:

- Every worked figure cross-foots against the real `INSF_PLANS` dataset in build v2.4. Plan enrolled 128 + 54 + 96 + 71 + 0 = 349 = `total.enrolled`; plan cost 57600 + 33480 + 3648 + 639 + 0 = 95367 = `total.cost`. The five plans, four insurance types and the single zero-enrolment plan (Building, under Property) are the build's, not invented.
- The interaction surface is fully covered: the insurance-type filter chip and its option list, the Table / Pie segment control, both sort keys, expand and collapse per type group, the zero-enrolment row marker, the uncharted-plans note, and the chart-empty, empty and loading states.
- All four of the legacy chart's documented rules survive into the contract: one segment per plan with at least one enrolment, zero-enrolment plans listed in the table but not charted and counted into a note rather than silently dropped, per-segment enrolment on hover, and no drill-down.
- Cost provenance matches the code comment: `cost` is `enrolled x rate` in the build as a deterministic stand-in for the real derivation, which is the SUM of `IBEmployeePlan.Rate` across a plan's enrollees. Building carries cost 0 because Property is not per-enrollee.

**One completion made to the spec body**, both items build-grounded and mechanical:

1. Added an "Initial view, sort and expansion state" row to the coverage matrix: Table view, enrolled descending, all type groups collapsed (`INSF_STATE.insView` `table`, `insSort` `count-desc`, `insExpanded` `{}`). The call sequence already assumed a table default without citing the build fact that establishes it, which matters because the Explore-default question below turns on exactly that.
2. Made the sort row state its per-key default direction: plan name ascending, enrolled descending, either direction on click.

**Chart presentation history, recorded here so the contract does not carry it.** Build v2.2 restored the legacy pie, which `insF` had dropped entirely on the port from Jo's design (`insFPieChart` plus the Table / Pie segment). Build v2.4 then re-sized the donut and capped the legend per tier from browser measurement rather than reasoning, after a measurement script found Explore leaving 47% of its chart area empty, Detail truncating plan names, and a `max-width:900px` media query that never fired because a widget's width comes from its card and not the viewport. None of this touches the contract: the chart renders client-side from the same API 2 rows the table uses.

**Posture change from V1, flagged as the likeliest owner disagreement here.** V1 was a single nested call with the insurance-type filter applied client-side, on an owner instruction that chose a fetch-once shape. V2 makes the type filter a server param with a re-query per change and adds the type lookup as its own API, because no plan-volume bound has a citable basis. The response shape is identical either way, so a fetch-once ruling would remove the `typeId` param and make API 1 derivable from API 2's unfiltered response. This is on the record as sign-off item 4, not resolved in either direction.

**Open items carried forward:**

- **Explore default view.** Whether the chart becomes the default at the mid tier was never put to the owner. The Table view stays the default in this contract. Pure client view state, so nothing in the contract is blocked; recorded so the default is not flipped silently.
- **Dependent rows in `cost`.** Whether dependent enrolments contribute rate rows to the cost SUM. `Rate` sits on `IBEmployeePlan` while `enrolled` includes `IBEmployeeDependent` rows.
- **`cost` and status availability.** The Developer Punch List's W06 entry lists only the Plan Type filter, the Bar / Donut / Table views and the Total Enrollment KPI as confirmed-available. `cost` is not on it either way. The build renders no "unconfirmed" marker, per instruction; the caveat lives in the docs.
- **Sign-off dossier findings are all unstatused.** No reconciliation file assigns Accepted / Rejected / Disputed. The findings that would touch this contract if accepted: employee-vs-dependent split, participation rate, a drill to enrollees, and a data-as-of stamp.
- **Volume ceilings** (Marvin), **entitlement presentation and the modern permission right** (Product, and Oisin Curran for the right from code), and **per-widget filter-state persistence** (Product).

**Confluence HTML deliberately not generated.** Deferred until the owner has read the draft, per the run handoff. The V1 HTML pair at the folder root is untouched.

---

## History harvested out of the V1 spec

Recorded here so the V2 contract does not have to carry it.

- The V1 spec's status line read `Status: Complete at Step 5 - awaiting management sign-off`, with a parenthetical noting *"DRAFT header removed 2026-08-19, owner decision: status now matches the index"*.
- V1 was structured as **one endpoint**: a single nested read returning all insurance types at once, each carrying its name, its subtotals and its plans, with the type chip filtering client-side. It had a dedicated "Cost derivation (the one new field)" section, since `cost` was the only field in it that does not exist today.
- V1 established the codebase facts the V2 contract reuses: `IBPlan.TypeID` already links every plan to its insurance type so the Type-to-Plan grouping is not new data; enrolment is a live count at request time, `COUNT(IBEmployeePlan)` plus `COUNT(IBEmployeeDependent)` per plan, not a stored snapshot [CODE 2026-07-30]; the real hierarchy has a third level, `IBTypeElection`, which neither contract surfaces; and no status, pending, COBRA or approval concept exists on plan enrolment in the real IB module, so none is specced.
- V1 recorded the legacy widget's per-widget persistence of the last selected `TypeID` (`IBDataPanelRecord.TypeID`). V2 moves that to a platform concern rather than a response field.
- The existing `.../grid` and `.../chart` endpoints were out of contract in V1 and remain so in V2. Nothing in this widget's design calls them.
