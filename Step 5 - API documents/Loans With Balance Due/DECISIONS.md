# Loans With Balance Due (W10) - API Spec Decisions Log

Dated record of decisions, superseded thinking and change history for this widget's API spec. Kept **outside** the spec so the spec itself stays a present-tense contract. The spec may state an outcome here as fact; it never narrates the decision.

---

## 2026-09-02 - First V2 spec, written against build v3.1

W10's first ever API spec. There is no V1 at the folder root to freeze or mine, so `v2/` holds the only contract this widget has ever had. Written the same day its Step 4 doc was audited and its port into Jo's shell was built.

**Owner ruling that unblocked the work.** The 2026-08-25 Feargal banner records that the loan-entry process does not provide start and end dates, so date-based and past-due calculation should be removed, and the Step 4 doc's own assessment was that if that holds, the aging bands are computed from assumed dates and would be "fabricated rather than merely unnecessary". Builds v3.0 and v3.1 had moved in the opposite direction, making the range ladder the widget's primary filter. This was put to the owner before any spec was written. **Ruling: the v3.1 built design is confirmed good and is what gets specced.** Item C2 is recorded in the spec's sign-off list as a live product question whose resolution would drop the range machinery, but the contract is not hedged around it and no dateless alternative is specced.

**The two waived gate findings were resurfaced, and stay open.** Sign-off rows 1 and 5 were waived by the owner for the v3.0 build only, and that waiver is not standing. Both are fact gates and neither was defaulted:

1. **Status (Active / In Arrears) has no backing field.** No explicit active/arrears field exists in the source data. It is not built (`LONF_STATE` carries loan type, sort, range and view only) and it is not specced. Owner: backend team, not yet named.
2. **The Modern API does not replicate the legacy oldest-first (LIFO) payment allocation.** Legacy bucketed invoices by age then subtracted each posted payment starting from the oldest bucket, overflow carrying into the newer one. The modern handler just buckets by raw `today - InvoiceDate` with no payment subtraction. The Step 4 doc has decided the legacy allocation must be replicated server-side, so every range figure in this contract is `NEW` provenance and a raw-age implementation returns different numbers. Step 1 calls this the single most consequential data-accuracy gap in the whole comparison exercise. Owner: backend team, not yet named.

**A third divergence surfaced while writing the spec, and is new.** Even with the oldest-first allocation replicated, the donut will still not equal the legacy pie. The built design assigns **one range per loan** (`lonFBucketOf` returns the first range where `days <= hi`, keyed off the loan's oldest unpaid invoice), where legacy split a single loan's balance **across** ranges, per invoice. This is a design-level difference, not a backend bug, and it is recorded for the owner rather than resolved. Owner: Oisin Curran with the backend team.

**Build facts the contract is grounded in.** `FC_VERSION[10]` = 3.1. `LOANF_BUCKETS` is a five range ladder in severity order: Current (not yet due, `hi:0`) / 1-30 / 31-60 / 61-90 / 90+ (`hi:Infinity`). The 61-90 range was added by the C1 fix, closing a latent gap where loans between 61 and 89 days fell through and were labelled "90+ days"; it was latent rather than visible because the demo data holds no loan in that window. Demo dataset is 9 loans totalling 112037.96, ranges cross-footing as Current 53890.00 (3) + 1-30 8386.86 (2) + 31-60 10820.97 (2) + 61-90 0.00 (0) + 90+ 38940.13 (2), past due 58147.96 across 6 loans at 52%, and 90+ at 35%. The 61-90 range holding exactly zero is deliberate: it is what the muted, inert, $0 ladder row exists to display.

**Corrected during the run.** The orchestrator's first pass at the dataset totals read 124092.96, 18750.00 and 13900.00. Those were wrong: the extraction regex had swept in the nested `payments[].amount` values alongside each loan's own `amount`. The code-true figures are 112037.96, 16720.00 and 13400.00, independently confirmed against the `fc-widget-10` prose ("nine loans across three types totalling $112,037.96") and recomputed from the constants. Every worked example in the spec uses the code-true figures.

**Decisions taken during this pass, each with a defensible source:**

- **`MUST PAGINATE` on the loan list.** The live system shows 3 loans, but that measures adoption, not portfolio size, and the build's demo dataset is never a basis for a ceiling. No citable bound exists, so the set is not provably bounded and sort, filter and totals all move server-side. `pageSize` default 50, maximum 200, `loanId` as the unique tiebreaker, nulls last on `lastPaymentDate`. A confirmed real ceiling would collapse this back to one bounded read with client-side sort.
- **Four APIs, derived not chosen.** Portfolio summary (cardinality plus trigger gap: Glance fires this and nothing else), loan list (cardinality plus conditional weight), loan-type lookup (lifetime gap: types change monthly, balances continuously, TTL 15 minutes), loan detail (trigger, grain and conditional weight). Payment history stays inside the detail call: always fired together, cheap, and bounded by `LNLoan.NumberPayments`.
- **The range filter does not re-fire the summary.** `lonFBuckets` and `lonFTotal` ignore the selected range, because the donut is the control being selected from rather than a filter applied to it. Stated explicitly in the spec so a developer does not "correct" it into the 11.3 antipattern.
- **The server owns the five range ladder** and always returns all five entries including zeros, so the full-ladder and inert-$0-row behaviour is funded without the client hardcoding the ranges. Keys are readable (`current`, `d1to30`, `d31to60`, `d61to90`, `over90`) rather than the build's internal `b25`.
- **Footer total is the server's `filteredTotal`** over the full filtered set, not the sum of the visible page. The build sums visible rows, which is correct only while everything fits on one page.
- **`borrowerName` maps to `LNLoan.Name`**, matching the legacy grid's "Borrower Name" column. `CorePerson` via `LNLoan.PersonID` is declared out of scope because nothing on screen consumes a separate person field.
- **`payments[].reference` maps to `LNPayment.CheckNumber`.** No payment-method enum is confirmed anywhere, so none was invented for the modal's "Method" column.
- **`ninetyPlusPct` is not in the contract.** Nothing renders it: the context line pairs the 90+ amount with the overall past-due percent, and the 90+ percent existed only in the now-uncalled `loanFAgingPanel`. The amount is kept because the context line uses it.
- **Permission right `/LoanProcessing` at Inquiry level**, from the legacy AccessUri plus the gate pattern confirmed in `DataPanelControl.cs`. The modern module label reads "Loans" while the legacy AccessUri is `/LoanProcessing`, a recorded inconsistency, so the label is noted as non-authoritative.
- **Unentitled user gets 403 and the widget is not offered in the picker**, matching the legacy gate. Whether the UI hides it or says something explicit is left open for Product.
- **A shared `asOf` anchor across all four reads**, so the header total and the table footer cannot straddle a write.
- **`400` on an unknown `loanTypeId`, `rangeKey` or `sortBy`** rather than a silent fallback, because silently substituting a sort key skips and duplicates rows across a paginated set.

**Also recorded:** the modern chart endpoint `/api/dashboard/loans-with-balance-due/chart` takes no `loanTypeId` parameter, which is exactly the filter-affects-table-only antipattern Jo's dossier flags at 11.3. The built design deliberately fixes it (the loan type filter drives the donut, the chips, the header total, the past-due pill and the Glance bar together), so the parameter has to be added server-side.

**Still open beyond rows 1 and 5:** worst realistic volume is uncited (Marvin); the `X-BankAccountID` context header versus `[LN_Type] WHERE TenantID=ctx` is a scoping mismatch needing a ruling; `nextPaymentDueDate` has no traced due-date column on `LNInvoice` and is marked `UNVERIFIED`; the 90-day dormancy threshold is unapproved; "Open loan", "Record a contact" and an Excel export are all unfunded; and with no `Reconciliation - Loans With Balance Due.md` in place, every dossier flag is unreviewed, so the ladder shape, a PAR metric, an org currency field and a "data as of" stamp are surfaced as questions with no side picked.

**Confluence HTML deliberately not generated.** Deferred until the owner has read the draft.

**Lint:** 0 HIGH, 0 MED, 1 LOW (the informational api-count line). Linter unchanged.
