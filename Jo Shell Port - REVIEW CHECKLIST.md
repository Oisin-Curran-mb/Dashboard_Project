# Jo Shell Port (W01-W07) — Review Checklist

_Built unattended 2026-08-04/05. Read this first, then spot-check the file and the diff doc._

## What was done
All seven finalized widgets (W01-W07) were ported into Jo's design-sandbox shell at
`Jo/repo/design-sandbox-main/Widget Container Demo/index.html` as **clean, additive,
namespaced "(MB updated)" cards that sit alongside Jo's originals**. Each was built
from Jo's own widget block, reusing her components, Pathway tokens, and conventions,
with only the owner-directed deltas applied. A shared "Jo vs Oisin" difference doc was
produced (MD + Confluence HTML), now located inside Jo's shell folder at
`Jo/repo/design-sandbox-main/Widget Container Demo/Design Differences (Jo vs Oisin)/`.

**Nothing is pushed.** See "How to push" at the bottom. The file is local only.

## Integrity (verified)
- Whole-file `node --check`: **SYNTAX OK**.
- Jo's original content functions all intact (budget/pen/pr/rem/ar/ins/dep + gft/loan each present once, unmodified).
- Purely additive: only **2** of Jo's lines changed, both single-line functions (`aboutOf()` and `triggerSelector()`) that had a branch appended in place; everything else is new-line additions. File grew 6207 -> 8571 lines.
- Pristine backup of Jo's original: `outputs/_jo_index_backup/index.html.bak-20260804-195616` (also copy into the clone, see below).

## Per-widget summary

| Widget | kind | prefix | Cards | Verify (driver) | Key owner deltas vs Jo |
|---|---|---|---|---|---|
| W01 Budget Compared to Actual | budget-mb | bgtF | bgtF/2/3 | harness: 9 renders, 0 em dash, 0 err | Time Window Module: adds Day+Week grains (D W M P Q Y), availability law, named windows |
| W02 Pension Plans | pension-mb | penF | penF/2/3 | 38 checks, 0 fail | New grouped-bar-by-district view; All-Districts aggregate |
| W03 Payroll Distributions | payroll-mb | prF | prF/2/3/4 | 62 checks, 0 fail | Standardised period presets + rolling windows; zero personal data (amounts only) |
| W04 Remittance Pledges | remittance-mb | remF | remF/2/3 | 45 checks, 0 fail | Version-A report table + separate Pacing Bars view; per-pledge-term pacing; 4 day-based colour bands; table-only in table view |
| W05 Receivable Invoices Outstanding | receivables-mb | arF | arF/2/3/4/5 | 57 checks, 0 fail | Bucket pop-up gains row checkboxes + Confirm + "Move to unposted transactions" note |
| W06 Insurance Billing Plans | insurance-mb | insF | insF/2/3 | 84 checks, 0 fail | Expandable Type->Plan table with Cost + Share in both views |
| W07 Deposits on Hand | deposits-mb | depF | depF/2/3/4/5 | 44 checks, 0 fail | Pagination 50/page over 125 (total 106,726,837); scope-dependent breakdown; click drills not expands; Compare To gains fiscal Period |

Every widget also passed an independent render harness (renders at kpi/wide/xwide across state permutations, no em dashes, no errors) run by the orchestrator on the integrated file.

## Please eyeball in a browser (not machine-verifiable here)
Verification was `node --check` + Node DOM-shim drivers that execute the real handlers and assert output. It did **not** render pixels in a browser (screenshots of this file are unreliable in the sandbox). Worth a human look, especially:
- W07: the pager, the nested/By-Account table, body-level Compare To / scope popovers positioning.
- W06: the expand/collapse Type->Plan table and the inline type popover anchoring.
- W05: the new checkbox column and the Confirm footer note layout in the bucket pop-up.
- W04: pacing-bar heights and band colours; W02: grouped-bar heights at Explore.

## One architectural difference worth a decision
- **W01-W05** hooked Jo's shared popover/handler plumbing (append-only branches in `popContent()` / `triggerSelector()` / `renderModal()` / the delegated click listener).
- **W06 and W07** were built **self-contained** (their own inline popovers and their own delegated listeners), touching only the `contentHTML()` dispatch + `aboutOf()`. This was to honour the strict "only shared edit is the dispatch line" instruction. Both styles work and verify; they differ only in integration approach. If Jo prefers one consistent style, W06/W07 can be re-aligned to the hooked style (or W01-W05 to self-contained) — easy follow-up, flagged so it's a conscious choice.

## Open items carried, NOT invented (per widget)
- **W01:** weekly grain pending dev feasibility (no confirmed weekly GL grain); fiscal-year-per-org and consolidated/master rollup are Step 5 API requirements.
- **W02:** Pension Billing drill-through has no target URL; export is a stub; Charge/org column blank in the real API (pre-existing defect).
- **W03:** exports are stubs; no Department filter / drill-through (cut or rejected).
- **W04:** linear-by-days vs stepped-by-payment-schedule pacing unresolved (built linear as specced).
- **W05:** move-to-unposted transaction type unresolved (not modeled in UI); Bill To blank (pre-existing modern-API defect).
- **W06:** "total cost" definition (total vs employer vs employee, PreTax) unresolved; count-vs-cost basis (dependents in count not cost); coverage-tier level not surfaced; Step 5 build follow-up (client-side type filter over one nested response) not applied.
- **W07:** out-of-widget drill-through has no destination (module has no read layer); historical period-end balances for Trend/Compare To are a data-layer gate (mock interpolates); DHAccount.CalcBalance tie-out is a backend concern.

## Deliverables / where things are
- Updated shell: `Jo/repo/design-sandbox-main/Widget Container Demo/index.html`.
- Difference doc (shared, one section per widget): `Jo/repo/design-sandbox-main/Widget Container Demo/Design Differences (Jo vs Oisin)/Jo vs Oisin - Design Differences.md` and its `... (Confluence).html`.
- Backup of Jo's original: `outputs/_jo_index_backup/index.html.bak-20260804-195616`.
- Skills used: `mb-widget-port` (build) and `widget-diff-doc` (difference doc).

## How to push (the folder here is NOT a git clone)
`Jo/repo/design-sandbox-main/` is an unzipped download (no `.git`, no remote), so you cannot branch/push from it directly. To get this onto a branch of Jo's `design-sandbox` repo:

1. Clone the real repo somewhere separate (once):
   `git clone https://github.com/helloimjolopez-collab/design-sandbox.git`
2. Create a branch:
   `cd design-sandbox && git checkout -b mb-widgets-w01-w07`
3. Copy the updated file over the clone's copy:
   copy `Jo/repo/design-sandbox-main/Widget Container Demo/index.html`
   to  `design-sandbox/Widget Container Demo/index.html`
4. Sanity check it opens in a browser and the seven "(MB updated)" cards render.
5. Commit and push the branch, then open a PR for Jo to review:
   `git add "Widget Container Demo/index.html" && git commit -m "Add MB updated widgets W01-W07 (additive, namespaced)" && git push -u origin mb-widgets-w01-w07`

Note: the difference doc now lives inside `Widget Container Demo/` (next to `index.html`), so if you `git add` that whole folder it WILL be committed to Jo's repo. If you don't want the doc in her repo, add only `index.html` in step 5, or move the doc back out of that folder first. Because the widget block is additive and namespaced, the branch rebases cleanly onto her main even as she keeps working.
