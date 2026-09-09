# Run Handoff: W01-W10, Step 4 -> Step 5 -> Port (written 2026-09-02)

For a fresh chat session. Point the session at this file and say which widget to run.
It continues the V2 refresh of widgets W01-W10 in the Shelby Financials Dashboard
Re-platform project: Step 4 doc verified, Step 5 V2 API spec written, then (where
applicable) a port into Jo's design-sandbox shell, one widget at a time.

**The one rule that overrides everything: run ONE widget end to end, then STOP and
report to Oisin. Never start the next widget without an explicit go-ahead. A batch
of nine in parallel was tried on 2026-08-30 and produced one deliverable for over a
million tokens; per-widget sequential runs since then have a 100% completion rate.**

---

## 1. Current standing (verified 2026-09-02)

W08 is out of scope: it is Jo's own widget, Completed by Jo (Steps 3-6, owner ruling 2026-09-07), never ported or modified here; the same ruling covers W14. So W01-W10 means nine widgets.

| Widget | Step 4 doc | Step 5 V2 spec | Port to Jo's shell |
|---|---|---|---|
| W01 Budget Compared to Actual | done, stamped 08-30 (build v2.0) | done, lint 0H/0M | shipped pre-V2 (in her main) |
| W02 Pension Plans | done, 08-30 (v2.2) | done, lint 0H/0M | shipped pre-V2 |
| W03 Payroll Distributions | done, 09-02 (v2.6) | done, lint 0H/0M | shipped pre-V2 |
| W04 Remittance Pledges | done, 08-30 (v3.5a) | done, lint 0H/0M | shipped pre-V2 |
| W05 Receivable Invoices Outstanding | done, 08-30 (v2.3) | done, lint 0H/0M | shipped pre-V2 |
| W06 Insurance Billing Plans | done, 09-02 (v2.4) | **PARTIAL** (see queue) | shipped pre-V2 |
| W07 Deposit Accounts | done, 08-30 | done, lint 0H/0M | shipped pre-V2 |
| W09 Payroll Scheduled Time Off | done, 08-30 (v2.8) | none yet (first ever) | **not ported** |
| W10 Loans With Balance Due | done, 08-30 (v3.1) | none yet (first ever) | **not ported** |

"Shipped pre-V2" means the OLD port of that widget is already merged to Jo's
`origin/main`; whether those seven get RE-ported against their V2 Finals is an open
owner decision, not part of this queue unless Oisin says so.

Specs live at `Step 5 - API documents/<Widget Name>/v2/` with a `DECISIONS.md` at the
widget folder root and a row in `Step 5 - API documents/00 - INDEX.md`'s V2 table.

## 2. The queue (in order, one per session-turn, stop between)

1. **W06 - finish the partial spec.** `Insurance Billing Plans/v2/Insurance Billing
   Plans - API Spec.md` exists but the writing agent was cut off mid-document: treat
   it as untrusted. Diff it against the build facts, complete it, run the lint,
   write DECISIONS.md and the index row. Known inputs: conflict gate was verified
   CLEAR against build v2.4 before the cutoff. Carry the open approval item: pie as
   Explore default was never confirmed, Table stays default.
2. **W10 - spec, then port, then diff doc.** Oisin chose W10 as the port pilot.
   Reserved names (already in the manifest): kind `loans-mb`, prefix `lon`, entry
   `lonFContent`. Jo has her own `loan` prefix; ours must not collide. Known: v3.0
   had 2 HIGH gate findings waived for that build only (the waiver is NOT standing;
   surface them again), and the v3.1 changelog has no recorded driver figures (a
   `[TO CONFIRM]` in the Step 4 doc; do not re-run the Step 3 driver for it, the
   port driver covers ported behaviour).
3. **W09 - spec, then port, then diff doc.** Reserved: kind `pto-mb`, prefix `pto`,
   entry `ptoFContent`. First-ever spec; no V1 to mine.
4. Then stop entirely: the W01-W07 re-port question and the PR to Jo are owner
   decisions.

### Per-widget recipe

- Spec: invoke `widget-api-spec-writer` (V2 default mode). Ground truth: the built
  Final (Final Check tab only) + the freshly stamped Step 4 doc. W09/W10 have no V1
  spec: codebase grounding comes from `Widget_Comparison_Classic.html` /
  `Widget_Comparison_New_Widgets.html` and the MBAccounting repo. Lint with
  `Step 5 - API documents/v2-toolkit/spec_lint.py`, max 3 cycles, stop on surviving
  HIGH. **Defer the Confluence .html** until Oisin approves the draft (regenerate by
  script then); the six finished specs already have HTML pairs which need
  regenerating if review edits land.
- Port: invoke `mb-widget-port` and obey its Safety section to the letter. Fold the
  `widget-diff-doc` section for that widget into the SAME agent run at the end
  (saves a third full-context read).
- After each widget: append to the questions doc (section 6), update the port
  manifest, report the DEFAULTED / BLOCKED split, STOP.

## 3. Access needed

- **Folder mounts:** `C:\Users\ocurran\Desktop\For Dashboard` is the project root
  and the ONLY copy that matters (the Documents "For Dashboard." copy has no Step 3
  mockups; do not work there). File tools use the Windows path; the shell mount path
  varies per session (this one was `/sessions/<session>/mnt/For Dashboard`) so
  verify with `ls` before assuming.
- **Shell** with git and node and python3: needed for extraction, spec_lint.py, the
  syntax gate and the DOM-shim driver, and git inside the Jo clone. Quirk: file
  DELETION is blocked in the mounts (create and modify work); never build a step
  that relies on rm.
- **Skills** (saved to the account, all carry an unattended mode where relevant):
  `widget-api-spec-writer`, `mb-widget-port`, `widget-diff-doc`,
  `widget-final-check-audit`, `build-final-widget`.
- **Not needed:** ADO, Confluence MCP, browser tools. Pendo: never, permanently
  unavailable, do not mention or connect it.

## 4. Git safety (do not skim this)

- Work ONLY in `Jo/repo/design-sandbox/` (real clone). `Jo/repo/design-sandbox-main/`
  is a stale unzipped copy with no `.git`: editing it is silent failure.
- The clone must be on branch **`oisin-v2-port`** (created off `phase-2` at
  `a9bc157`). If it is on `main` or `phase-2`, STOP: Jo's `deploy.sh` watcher is
  branch-aware and auto-commits + auto-pushes `Widget Container Demo/index.html` to
  whatever branch is checked out, straight into her live preview.
- Never run `git commit`, `git push`, or `deploy.sh`. Edit, verify, stop. Publishing
  is Oisin's manual step.
- Snapshot `index.html` before the first edit of a session:
  `cp index.html "index.BACKUP-<W##>-$(date +%Y%m%d-%H%M%S).html"` (one from 08-30
  already exists: `index.BACKUP-batch-20260830-061519.html`, still byte-identical to
  the live file). Record the base commit (`git log --oneline -1`) in the report and
  diff doc.

## 5. Token economy (the scratchpad extraction idea)

The single biggest waste in earlier runs: every agent independently hunted through
the 964KB `Dashboard Widget Mockups.html` and Jo's 964KB `index.html` for its
widget's code (~100k tokens per agent, per run). Instead, the ORCHESTRATOR extracts
once, agents read small files:

1. Before dispatching a spec agent, cut the widget's code into the session
   scratchpad with shell (near-zero tokens): the `fc-widget-N` section (from
   `id="fc-widget-N"` to the `<!-- /fc-widget-N -->` comment), the `WRENDER[N]` F
   branch (extract generously by line range around the anchors), the widget's F data
   constants, and `FC_VERSION[N]` + its changelog comment.
2. Before a port agent, also extract Jo's matching block from HER `index.html`
   (her render fns + registry entries + handlers + CSS for the equivalent widget).
3. Hand agents the scratch file paths. They read those, not the big files. The port
   agent still runs its final syntax gate against the REAL file after editing it.

Other standing economies: trust a fresh Step 4 stamp (2026-08-30 or later) and skip
Design History sections entirely; run agents SEQUENTIALLY (a parallel wave front-
loads spend and dies at the hourly cap mid-write); if an agent dies mid-task in the
SAME session, resume it with SendMessage rather than restarting (its reading is
sunk cost); cap agent reports to: paths written, lint result, API surface one line
each, DEFAULTED list, BLOCKED list, expected disagreements. Reuse
`_port-drivers/jo-port-driver.js` once it exists (W10's port builds it; W09 reuses).

## 6. Decision policy + where things get logged

Oisin's standing policy for these runs: **approval gates are defaulted and logged;
fact gates are never defaulted.** A choice with a defensible source (Step 4 intent,
option history, Jo's pattern) gets taken and logged. Anything requiring invented
product truth (a field with no source, a Disputed sign-off finding, a view no option
produces) is rendered as a labelled placeholder / `[TO CONFIRM]` with a named owner,
never guessed. No em dashes in any user-facing or document text.

- Questions/decisions log: `Step 3 - Mock_Work/Unattended Run - Decisions and
  Questions (2026-08-30).md` (append a dated section per widget: "Defaulted" and
  "Blocked on a fact" checklists). Only the orchestrator writes it, never subagents.
- Port ledger: `Jo/repo/design-sandbox/Widget Container Demo/_port-drivers/PORT-MANIFEST.md`.
- Never move status in `PROJECT INDEX.md` or `Dashboard Tracker.xlsx` (the xlsx is
  usually open and locked on Oisin's machine anyway); log proposed moves instead.

## 7. Open items a new session should not trip over

- W06's partial spec .md is UNTRUSTED until diffed and linted (queue item 1).
- The Compare-To trend overlay conflict on W07 (doc says overlay, build has none) is
  recorded in that spec's sign-off items; it is Oisin's call, not a bug to fix.
- W02's spec introduces a NEW `/summary` endpoint reversing the V1 1-to-1 posture:
  flagged as the likeliest owner disagreement in the batch; do not "fix" it either way.
- Three inert zero-byte test files await manual deletion (listed in the questions
  doc's Housekeeping section).
- The PR to Jo happens only after Oisin has read the questions doc. Not before.
