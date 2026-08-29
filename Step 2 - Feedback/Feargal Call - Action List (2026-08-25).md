# Feargal Call — Action List (2026-08-25)

**Source:** AI-generated meeting notes from a call between Oisin and Feargal, pasted 2026-08-25. The notes carry their own "check for accuracy" caveat, so anything below marked ⚠️ is a claim I could not confirm, or one that disagrees with the build.

> ## ✅ Section B worked through 2026-08-25
>
> **Built and verified:** B1, B2 (W17), B5 (W03), B6 (W02), B7 (W06). **Documented, no build needed:** B9, B10, B11, B12, and the non-conflicting parts of B4 and B8.
> **Deliberately HELD, not built:** **B3 (W10)** and the aging band in **B8 (W05)**, plus the payment-approval rebuild in **B4 (W13)** — all three are the items this file's own Section C says to confirm first, and all three would have meant demolishing or duplicating driver-verified builds on the strength of AI-generated notes. Each is documented in its widget's Step 4 doc with the evidence and the reason for holding.
> **Verification:** every touched widget re-gated (0 HIGH each) and driver-run: W02 51 assertions, W03 93, W04 143, W17 141, all 0 failures. 277 changed lines in the build, confined to the four widgets touched.
>
> Remaining before the held items can move: **C1** (which widget the 90-120 band belongs to), **C2** (confirm the W10 rebuild), **C3** (confirm W13 payment approval).

**How to use this file:** work top to bottom. Section A needs no work and is here so nobody redoes it. Section B is the actual queue. Section C must be settled before the items that depend on it. Tick items as they close.

---

## A. Confirmed by the call — already built, no work needed

Recording these because several are things we had been treating as open.

- [x] **W04 is the missed/late-installment widget.** Feargal and Oisin separated remittance monitoring from gift-goal reporting, with remittance "focused on missed or late installments". This is exactly the v3.0 exception pivot, made on 2026-08-24 before this call. No change.
- [x] **W04 pacing basis independently confirmed.** The notes state pacing is "based on each pledge's own term and cumulative expected-versus-paid amounts rather than relying on an activity end date." That confirms three separate things we had built or fixed: per-pledge-term pacing (v2, dev-confirmed 2026-07-28), the **cumulative** correction made mid-build on 2026-08-24 (the bug where windowing `paid` made every pledge look catastrophically behind), and Edward Eoff's finding that activity dates are cosmetic. Strong validation.
- [x] **W04's three drill levels.** "Activities, the people who pledged to them, amounts behind schedule, and installment histories… show skipped or missed payments." All built: activity rows → per-donor pledges → per-pledge payment schedule with the skipped payment flagged (v3.1).
- [x] **W04 keeps activity context.** Feargal questioned whether activities were needed, then agreed they give useful grouping context. The build groups by activity throughout. No change.
- [x] **W09 exposes both department and pay-group views.** Matches Edward Eoff's resolution of 2026-08-10 exactly (department default because approval security is department-scoped, pay group as an option). No change.
- [x] **W09 keeps approval actions, plus calendar / status / detail views showing hours, outstanding requests and overlapping leave.** All built across v2.6 to v2.8 (coverage-overlap panel, Outstanding state, day-level model).
- [x] **W17 goal framing.** "Received amounts against goals, remaining balances, campaign status, and donor-level detail" — all present, and *remaining balance* is now in the Goal Progress legend as of v1.2.

---

## B. The queue

### B1 — W04 / W17: record the answer to the question that was open across two interviews

- [x] **DONE 2026-08-25. The W04-vs-W17 distinction is now answered.** Feargal confirmed remittances and gifts are **separate modules that can both pledge toward purposes**, so the distinction is primarily **the source or route of the contribution**. This closes Q10 and Q38 in `UX Specialist Questions - Master Tracker.md`, open since 13.07.2026 and unanswered by both Ben Lane and Edward Eoff.
  - Update the master tracker (Q10, Q38 and the "Still fully open" list).
  - Update both Step 4 docs: W04 Sign-off Readiness row 4 and W17 row 4 both record this as unconfirmed.
  - **Note the nuance for the record:** the module/route distinction is the *product* answer. Our own split (W04 = exception, W17 = goal) is a *design* layer on top of it, decided 2026-08-24. Both are true and they are not the same statement.

### B2 — W17 Gifts and Pledges

- [x] **DONE. Add export. Confirmed missing.** I grepped the build: there is no `gpF` export of any kind, while seven other widgets have "Export to Excel". Feargal's conclusion was explicit — for the initial version, exposing the report data and allowing export is sufficient.
- [x] **DONE, recorded as a standing constraint in the Step 4 doc, and the driver now asserts no invented action verb appears on the card.** Do not add operational actions. "Additional actions should not be invented without a demonstrated user need." Worth writing into the Step 4 doc as a standing constraint, because it is the kind of thing a later session will otherwise "improve".
- [x] **DONE. Campaign filter narrows to a purpose, the row expands to its donors, and both levels export.** Verify the purpose → donor filter chain. Feargal asked for filtering from purpose to donor. We have a Campaign filter and a per-donor drill; confirm that satisfies it rather than assuming, since "filter" and "drill" are not the same interaction.

### B3 — W10 Loans With Balance Due ⚠️ largest change in the list

- [ ] ⚠️ **HELD pending C2 — documented in W10's Step 4 doc with the full evidence.** Remove all date-based and past-due calculation. Feargal confirmed the loan-entry process does not provide start and end dates, and that these loans function more like assistance or charitable loans. Keep amount due, last payment, loan type, and only aging that real data supports.
- [ ] ⚠️ **This contradicts a built, driver-verified Final.** W10's `loanF` Final (v2.0, 2026-08-11) is built *around* aging: four bands in severity order, an aging-band table filter, days-past-due, a dormancy flag, a portfolio-risk panel and a most-overdue collections list. Removing date logic guts most of it. This is a rebuild, not a tweak — worth a composition conversation before touching it.
- [ ] **Corroborating evidence already on file:** Ben Lane (13.07.2026) said of these loans "we give them a loan, but we don't really expect them to pay it back… we just want to know what the balance is" and "it's more of a donation than a loan". Feargal has now confirmed the same thing from the data side. Two sources agree, so this is well-founded.

### B4 — W13 Purchasing Management

- [ ] **Documented in W13's Step 4 doc, not built (all six items touch the same board, so building before C3/C5 are settled would mean doing it twice).** Make the approval path explicit and user-specific. Approval paths contain ordered users and thresholds; a viewer must be able to see which approvals are complete and which await *them*.
- [ ] **Show only actions the viewer may take.** Drag represents an action, so visible actions must respect the approval path and the viewer's permissions.
- [ ] **Payment approval: redirect, do not rebuild.** Feargal clarified the dashboard should preserve existing payment functionality and may send users to the established payment screen. ⚠️ This supersedes the v2.4/v2.5 design where entering invoice numbers in the record modal turned the card green.
- [ ] **Closed state.** Approved or completed POs move to Closed and leave the active board, remaining discoverable through a closed filter or view. Partly built already (v2.6 added a Finish column with Close/Void), so this is reconciliation rather than new work.
- [ ] ⚠️ **Voided requests unresolved.** "The treatment of voided requests was not fully resolved, so the design should avoid assuming what underlying financial reversal process occurs." The v2.6 build already makes assumptions here — check them against this.
- [ ] **Add filters separating POs awaiting approval from invoices/payments awaiting approval**, and surface intermediate approval steps rather than only broad approved/paid end states.

### B5 — W03 Payroll Distributions

- [x] **DONE, cents-exact reconciliation to the existing pay-type totals.** Add the drill chain: distribution group → pay types → individual employee → that employee's pay breakdown.
- [x] **DONE, at both the employee list and the individual breakdown.** Export at the relevant views.
- [x] **DONE. `PRF_PAYROLL_PERM` gates the toggle segment, the view dispatch, every handler and the table function itself.** Gate on payroll permission. Employee-level pay data is the most sensitive thing in this dashboard; access limited to users with payroll permission.
- [ ] Terminology confirmed for the docs: distribution/staff groups are organisational groupings; pay types are components (regular, overtime, housing allowance, vacation, and similar).

### B6 — W02 Pension Plans

- [x] **DONE, as a new Districts view; districts were previously only a filter value.** Expand a district to see participating people.
- [x] **DONE, scoped to the expanded district.** Make the expanded view exportable to Excel.

### B7 — W06 Insurance Billing Plans

- [x] **DONE in both insF tables, flat and grouped.** Rename the percentage label to "Share of total" so it reads against the total row.
- [x] **CONFIRMED already built — that is exactly what the Detail grouped parent/child table does.** Multiple plans under one insurance type are exposed (types and plans both visible).

### B8 — W05 Receivable Invoices Outstanding

- [ ] ⚠️ **HELD pending C1 — W05 already has 91-120 and 121+; the gap is in W10. Documented in W05's Step 4 doc.** Aging band: add 90-120 and keep a 120+ category. ⚠️ See accuracy flag C1 — the build may already do this.
- [ ] **Documented in W05's Step 4 doc, with a flag that the v2.0 drill modal reproduces much of the transaction screen and sits awkwardly against this.** Selecting an item opens the existing invoice detail page rather than duplicating the transaction interface in the dashboard. Partly built: the v2.0 drill modal replicates a lot of the transaction screen, so this needs a look.
- [x] **DONE, including the no-auto-refresh caveat.** Document the navigation behaviour: opens the existing screen, possibly in a separate window or tab to preserve dashboard context, and **the dashboard will not auto-refresh** after changes — the user closes and reopens or refreshes. That last point is a real UX caveat worth stating in the Step 4 doc rather than discovering in UAT.

### B9 — W01 Budget Compared to Actual

- [x] **DONE, recorded in W01's Step 4 doc as a deliberate scope decision so a later audit does not flag it as a gap.** Account-level drilldown is explicitly out of scope for phase one. Feargal decided the current design already materially improves the existing view; revisit during UAT. Record as a scope decision so it is not treated as a gap.

### B10 — W16 Accounts Payable By Due Date

- [x] **DONE, recorded in W16's Step 4 doc.** Keep it a focused due-date and aging view. Do not grow it into a super-widget containing every payment function.
- [x] **Recorded as Aditya's, outside this queue, with the boundary note.** Separate action widgets for unposted invoices, payment processing and posting to the GL — **assigned to Aditya**, not this project's queue, but it affects W16's boundary so we should know the outcome.

### B11 — W11 Fixed Asset Values

- [x] **DONE, recorded in W11's Step 4 doc so nobody infers a design from the notes.** Nothing designed yet and no decisions made in the call. Leave as-is; do not infer a design from the meeting.

### B12 — Outside the widget project (log elsewhere, do not lose)

These came up in the same call but are not dashboard widget work. They need a home — reporting defects, and platform/provisioning work.

- [x] **FILED** in `Feargal Call - Non-Widget Follow-Ups (2026-08-25).md` at the project root. Reporting defects / usability: A4 preview not rendering consistently, no pagination on results, content cut off, scrollbars where a page-oriented preview is expected, inconsistent button formatting, unclear placement of predefined options such as account structure, no confirmation after saving, uncertainty whether settings persisted. Feargal to demo to internal stakeholders and expects substantial feedback on filters, viewer behaviour and layout.
- [x] **FILED.** Good news to record: drilldown after running a report has been reintroduced.
- [x] **FILED**, with your screenshot action flagged as still outstanding. Provisioning / licensing: database-backed licensing keyed by tenant/organisation, replacing file or external-license lookup; provision the Amplify Accounting org first, then assign license via an internal admin screen; license identifier as the Salesforce reference; administrators select org, apply license, confirm, UI updates the DB record. Oisin to send screenshots of the local mock-up so Feargal can circulate it.
- [x] **FILED.** Feature flags at organisation level, not per user, with the option to enable or disable for everyone or a selected organisational scope. Conor is already associated with this work ⚠️ (unverified).

---

## C. Accuracy flags — settle these before acting on the items that depend on them

- [ ] **C1 — The 90-to-120 aging band may be attributed to the wrong widget.** The notes place it under Receivable Invoices, but the build already has **91-120 and 121+** in the W05 region. What genuinely has a gap is **W10 Loans**, whose bands run Current / 1-30 / 31-60 / **90+** — skipping 61-89 entirely, a discrepancy already recorded in W10's build notes. W16 also carries 31-60 / 61-90 / 91-120. So: was Feargal looking at W05, W10 or W16? Worth one message to him rather than changing three widgets.
- [ ] **C2 — W10's rework needs confirming before it starts.** It contradicts a verified Final. Two independent sources (Ben, Feargal) support it, so it is probably right, but it is a big enough demolition to confirm deliberately.
- [ ] **C3 — W13 payment approval supersedes recent build work.** "Preserve existing payment functionality and may redirect" conflicts with the v2.4/v2.5 in-modal payment flow built on 2026-08-19. Confirm which stands before rebuilding either way.
- [ ] **C4 — These are AI-generated notes.** No recording or transcript was supplied, so unlike the Edward Eoff interview none of the quotes above can be checked against a source. Treat attributed positions as paraphrase, not quotation. If a recording exists, filing it in `Interviews Transcripts/` would let this be verified properly.

---

## D. Still open after this call

- **The Received-vs-Goal basis on W17.** Feargal confirmed gifts and remittances are separate modules that can both pledge toward purposes, but that does **not** settle whether W17's Received should be pledge-linked gifts only (the 2026-08-19 decision, matching legacy) or all posted gifts to the campaign (what the modern DTO's own progress measure uses). W17's Glance headline divides one by the other, so this still needs an answer.
- **W04 receipts-only mode** (Step 4 Sign-off Readiness row 7) — still awaiting accept-as-risk or removal.
- **W09's past-due request question** — can a request whose date has passed still be approved, and does approving it late affect payroll? Asked of Edward on 2026-08-10 and never answered.

---

*Compiled 2026-08-25 from the pasted meeting notes, cross-checked against the live build and the Step 2/3/4 record where possible.*
