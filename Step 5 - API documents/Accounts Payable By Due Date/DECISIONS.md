# Accounts Payable By Due Date (W16) — API Spec Decisions Log

Dated record of decisions, defaults and change history for this widget's API spec. Kept **outside** the spec so the spec stays a present-tense contract. The spec may state an outcome here as fact; it never narrates the decision.

---

## 2026-09-07 — First-ever spec written (V2, against build v2.0)

**No V1 spec exists for this widget**; the `v2/` spec is the first API document it has ever had. Written against the built Final (`FC_VERSION[16]` = 2.0, built 2026-08-19: Jo Lopez's Widget Container Demo ap v2 block ported 1-to-1 plus the owner-approved due-date horizon picker), the Step 4 doc (stamped 2026-09-07 by a full widget-final-check-audit and trusted as current), the Step 1 research doc, `Widget_Comparison_Classic.html` (legacy `AccountsPayableByDueDate : DataPanelControl`, modern `accounts-payable-by-due-date` filters/grid/chart endpoints), and the Confluence dossier 7371554882 (pull 2026-07-27; **no reconciliation file exists and no dossier finding carries a status**).

**Conflict gate: no material build-vs-doc conflict found.** The Step 4 doc was audited against the build the same day this spec was written; interaction surface, filters, band math, sort rules, tiers and states all agree. The band-boundary math (overdue < 0 days; week 0-7; month 8-30; later 31+) was resolved on 2026-08-19 per direct instruction, adopting Jo's `apBandOf` rule including the fourth "Due later" band; the spec states it as fact.

**Run mode: owner-authorised run-to-completion.** Approval gates that would normally halt were defaulted and are recorded here:

1. **Unreviewed dossier findings 11.3/11.4 (date-ordered chart; chart-table sync across AP/Deposits/Loans) and 11.6 (Bank Balances pairing).** The skill's rule is to stop and ask for a status before speccing the parts they touch. Defaulted: nothing built touches them (the Final has no chart and no cross-widget read), so the unaffected contract was specced in full and all three sit in Still needs sign-off awaiting the owner's status call.
2. **Actionability (dossier 11.2) treated as a recorded dispute, no side picked.** Claim A: SME Marvin (13 Jul 2026) and the dossier brief — pay/schedule/one-step-check from the widget, the top ask. Claim B: Feargal call (2026-08-25, recorded in the Step 4 doc header) — the widget stays a focused overview; separate action widgets go to Aditya outside this project. The spec contracts the built read-only behaviour and flags that any future write surface hangs on this decision.
3. **Defaults taken without owner sign-off, flagged in the spec (item 9):** `pageSize` default 50 / max 200; API 4 `limit` default 5 / max 20; API 3's BOUNDED verdict conditional on an unconfirmed distinct-date ceiling; error codes `AP_FILTER_CONFLICT` / `AP_BAD_PARAM` / `AP_NO_ACCESS` named for concreteness.

**Architectural conclusions recorded during the pass:**

- **The build-volume trap applies to three behaviours.** The build (12 demo invoices, wholly in the browser) sorts, groups into bands, vendor-searches and totals client-side. With no citable ceiling on outstanding AP invoices, the row list is `MUST PAGINATE`, which moves sort, vendor search, band subtotals and all totals server-side. The build's client-side vendor search (a row filter within the card) is deliberately not mirrored.
- **Decomposition verdict: four APIs** (summary / paginated invoice list / due-date facet / top vendors), each with a cited split trigger. The existing modern `/filters` endpoint's role is absorbed by the facet (which adds totals, counts and day offsets); the existing `/grid` is reshaped into the paginated list; the existing `/chart` endpoint is dropped from the contract because the Final has no chart.
- **Scoping of aggregates:** APIs 1, 3 and 4 are horizon-scoped but never due-selection-scoped (the header KPI, popover totals and cash panel always describe the whole horizon-scoped set, per the build); only API 2 takes the due selection. A due-filter change therefore refires API 2 alone.
- **Deterministic order:** the build's due-date tie rule (larger amount first) is kept and extended with `invoiceId ASC` as the unique tiebreaker the build does not need but pagination does.
- **The snap rule** (due selection reverting to All due dates when a horizon change empties it) is contracted as client-side, with the server returning a well-formed zero response for stale values rather than an error, because the snap can race a data change.
- **Worked examples** reproduce the build's demo dataset at its fixture anchor of 2026-07-23 (12 invoices, $35,711.25 total, $7,670.50 overdue across 3), so every reconciliation line is checkable against the build.

**Fact gates carried, not resolved (all in the spec's Still needs sign-off):** the aging basis (due date vs invoice date) as the top, load-bearing item — never confirmed against the real API, per dossier section 10; entitlement enforcement (Modern API module access metadata-only, not enforced); the GBP localisation defect (live-verified 23 Jul 2026) making `currencyCode` UNVERIFIED; data freshness / `asOf` semantics; the `X-BankAccountID` vs `X-Company-ID` context-header oddity found in the comparison doc; volume ceilings; drill-through (open, nothing built); the "Over 60" label-carryover check (Step 4 row 2); and the div-based table's accessibility parity ([TO CONFIRM - Oisin], recorded though it is a frontend concern).

**Lint:** HIGH 0, MED 0, LOW 3 after two cycles (cycle 1: HIGH 0, MED 4 — three container-row provenance cells and one stray "TBD", all fixed; the LOWs are the informational api-count note and two prose reconciliation continuation lines).

**Deferred:** the Confluence HTML pair is deliberately not generated this pass, pending owner review of the draft .md. Regenerate it from the .md with the skill's `build_confluence_html.py` when review lands.
