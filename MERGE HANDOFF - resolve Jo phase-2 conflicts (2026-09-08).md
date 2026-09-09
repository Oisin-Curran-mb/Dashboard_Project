# Merge Handoff: resolve the 5 conflicts between our V2 re-port and Jo's live phase-2

Written 2026-09-08 for a Claude Code session. Everything below was verified against the
working tree, not assumed. Read section 1 before touching anything.

---

## 1. Exact state right now (verified)

Repo: `C:\Users\ocurran\Desktop\For Dashboard\Jo\repo\design-sandbox`

- Branch **`oisin-v2-rebuild`**, HEAD = **`a548419`** ("widget demo update 2026-09-08 11:23:16").
  That is Jo's latest `origin/phase-2`. We are 0 ahead, 0 behind her.
- **A `git stash pop` is half-applied and conflicted.** There is NO merge or rebase in
  progress (no `MERGE_HEAD`, no `rebase-merge/`), so `git merge --abort` will not help and
  is not what you want.
- `Widget Container Demo/index.html` is **`UU` (both modified)** with **5 conflict hunks**.
  `node --check` on it currently FAILS at the first `<<<<<<<` marker. That is expected.
- The two `Design Differences (Jo vs Oisin)/` files applied **cleanly** and are staged (`M`).
- **`stash@{0}` "v2 re-port work" is still retained.** That is the full backup of our
  re-port. Do not drop it until the merge is verified green.
- Our work IS present in the conflicted file: `kind:"loans-mb"` x5 and `id:"cmp"` x3 both
  found, so the 14 ported widgets and the comparison tab survived the pop.

### How we got here
Our re-port was never committed. The work was stashed, `git merge origin/phase-2`
fast-forwarded the branch to Jo's tip (nothing of ours was on the branch to merge), then
`git stash pop` conflicted on `index.html`. Nothing is lost.

---

## 2. What Jo changed while we were porting (23 commits, +290 / -85 lines)

She is actively editing **our adopted blocks**, not just her own. Three groups:

**(a) A systematic Glance sparkline push.** 17 functions she changed and we did not, almost
all `*Glance`: `apGlance`, `arGlance`, `arFGlance`, `bankGlance`, `insGlance`, `insFGlance`,
`penGlance`, `penFGlance`, `loanGlance`, `ptoGlance`, plus `glance`, `apHeaderBlock`,
`apPanel`, `bankDrillModalHTML`, `bankShowBpop`, `arFDetailInvoices`, and the shared
`depSparkHTML` helper itself. New helpers she added: `bankSpark`, `bankRunning`,
`bankBeginTotal`, `apWeekPill`, `insFHeadRow`, `arFDetailModalInner`.

**This answers the "where is the graph" question.** Her `bgtFGlance` now builds a series from
`bgtFViewRows` and renders it through `depSparkHTML` inside `.kpi-row`. The sparkline is hers,
added today. Our re-port removed nothing. She also dropped the "vs budget ·" caption prefix.

**(b) A substantial W05 receivables rework**, still in flight: nine new `arF*` functions
(`arFCustPanel`, `arFCustGroups`, `arFInlineList`, `arFExportPreview`, `arFContact`,
`arFDetailModalInner`, ...). She has also brought back `bgtFDetailToggle`, the function our
W01 port deliberately deleted.

**(c) Her own widgets**, which do not concern us.

---

## 3. The 5 conflicts, with what each one is

All in W01 (one) and W05 (four). Line numbers are from the conflicted file and will move as
you resolve, so locate by enclosing function, not by number.

| # | Line | Function | Widget | Upstream side (HERS) | Stashed side (OURS) |
|---|---|---|---|---|---|
| 1 | ~8129 | `bgtFGlance` | W01 | adds `_sr`/`_ss`/`_sl` + `depSparkHTML` spark; caption is span label only, class `trend-range` | headline adds `hv.pct` (quiet %); caption "vs. budget, " with `bgt-caption bgtF-cap-btn` |
| 2 | ~9948 | `arFHeaderBlock` | W05 | (empty on her side) | adds `var ctx='Owed to you, oldest balances first.'` |
| 3 | ~10067 | `arFContent` | W05 | xwide branch keyed on `w.arFGroup` ("Top overdue customers" / "By aging") | our v2.3 six-band Explore/Detail layout |
| 4 | ~10215 | `arFDetailModalHTML` | W05 | modal gains `arF-wl-modal` class | our V2 bordered-checkbox + post-Confirm note modal |
| 5 | ~10283 | `arFHandleClick` | W05 | `arF-open` carries `mode`/`key`/`q`/`sort` state | our handler set |

Note `renderModal` appeared in my function-level analysis as a both-changed function but git
resolved it without a marker. Re-check it by hand anyway (section 5).

---

## 4. How to resolve (recommended approach)

**W01 conflict 1: take BOTH.** Her sparkline is her house pattern now, applied across ten
Glance functions, and Oisin has said he wants it in ours too. Our quiet-% headline is a Step 4
decision. They do not fight: keep her `_sr`/`_ss`/`_sl` + `_spark` lines and her `+_spark+`
placement inside `.kpi-row`, AND keep our `hv.html+hv.pct` headline. For the caption, prefer
HERS (`trend-range`, span label only) so the shell stays consistent, and record ours as a
superseded Step 4 note rather than silently keeping it.

**W05 conflicts 2-5: STOP and ask Oisin first.** She is mid-rework of the same widget we
re-ported. Resolving these by picking sides guesses at design intent on four separate
behaviours. Two honest options:
- **Defer W05**: take HER side for all four conflicts, leaving her rework intact, and drop
  our W05 V2 re-port from this integration (it stays recorded in the diff doc and the stash).
  Cleanest, and puts the reconciliation where it belongs, with her.
- **Keep ours**: take OUR side for all four, which overwrites her in-flight work on the
  branch. Only do this if Oisin has agreed it with her.
Do not mix sides inside W05 without a specific ruling per conflict, because her `arFContent`,
`arFDetailModalHTML` and `arFHandleClick` changes reference each other and her new
`arFCustPanel`/`arFInlineList` helpers.

**Preserve CRLF.** The file is CRLF throughout. Resolve with an editor that keeps it, or do
scripted edits with Python `newline=''`. A whole-file line-ending flip turns a 5-hunk change
into a 16,000-line diff and destroys the additive story.

---

## 5. Verification (the gate, in order)

```
cd "C:\Users\ocurran\Desktop\For Dashboard\Jo\repo\design-sandbox\Widget Container Demo"

:: 1. no markers left
findstr /n "<<<<<<< ======= >>>>>>>" index.html

:: 2. syntax gate
python -c "import re;h=open('index.html',encoding='utf-8').read();open('c.js','w').write(re.search(r'<script>([\s\S]*)</script>',h).group(1))"
node --check c.js

:: 3. all 15 drivers, every one must pass
for %d in (w01-budget w02-pension w03-payroll w04-remittance w05-receivables w06-insurance w07-deposits w09-pto w10-loans w11-fixedassets w13-purchasing w15-bank w16-payables w17-gifts) do node "_port-drivers/%d-mb.driver.js"
node "_port-drivers/cmp-dashboard.driver.js"
```

Expected baseline before the merge: 14 widget drivers = **5,473 assertions**, cmp dashboard =
**1,872**, total **7,345 / 0 failures**.

**Expect real failures now, and treat them as information.** Her edits touched shared
plumbing (`depSparkHTML`, `renderModal`, `glance`) that our drivers pin behaviour on. When a
driver fails, fix the code, not the assertion, unless the assertion is testing HER code that
she legitimately changed. Several of our drivers pin raw token occurrence counts against their
own snapshots; those particular assertions are brittle and it is fine to loosen a count-based
one to a behavioural one, but say so in the report.

Also re-verify the additive story after resolving:
```
git diff --stat a548419 -- "Widget Container Demo/index.html"
git diff a548419 -- "Widget Container Demo/index.html" | findstr /b /c:"-" | find /c /v ""
```
Removed lines should be only our own old blocks. Zero of Jo's functions should disappear:
check by extracting `function X(` names from `git show a548419:...` versus the resolved file
and confirming no non-`bgtF/penF/prF/remF/arF/insF/depF/ptoF/lonF/faF/purF/bkF/apF/gpF` name
is missing.

---

## 6. Rules for this session

- **Never `git push`, and never run `deploy.sh`.** Publishing is Oisin's. (Her watcher is
  macOS-only, so it is not running on this Windows machine; the risk is only a manual push.)
- **Do not drop `stash@{0}`** until section 5 is fully green. It is the only backup of the
  re-port besides the `index.BACKUP-*.html` snapshots.
- **Commit once, at the end**, after verification, so there is a single clean change to PR.
- If `.git/index.lock` blocks a command: `del .git\index.lock`, after checking
  `tasklist | findstr /i git` for a stuck process. This has recurred repeatedly this week.
- File deletion is blocked from the Claude sandbox; anything needing `rm`/`del` is Oisin's to run.

---

## 7. Housekeeping worth doing while you are here

- **The 21 `index.BACKUP-*.html` / `index.SAFETY-*.html` snapshots and `_port-drivers/` are
  untracked** and would otherwise land in the PR. Add a `.gitignore` in
  `Widget Container Demo/` with `index.BACKUP-*.html` and `index.SAFETY-*.html`, and decide
  whether `_port-drivers/` belongs in the PR (it is our verification harness, arguably yes) or
  stays local (arguably no, it is not Jo's concern).
- **Three inert test files should be deleted**: `.write-test`, `.sed-test`,
  `Widget Container Demo/_write-test.txt`. Oisin must run the delete.

---

## 8. Open decisions for Oisin, not for the session to guess

1. **W05 ownership** — defer to her rework, or keep our V2 re-port? Blocks conflicts 2-5.
2. **Glance sparklines on our widgets** — she has made it the house pattern across ten Glance
   functions. Adopting it for our ported widgets is a Step 4 change first, then the Step 3
   Final, then the port. It is not a merge decision.
3. **The `(OC)` titles on W01-W07** — she adopted those seven as *the* widget in commit
   `faa6507`, so there is no version of hers beside them any more. The `(OC)` suffix arguably
   should not be there for those seven, and applying it renames titles already live on her
   `main` and `phase-2`.
4. **Two defects in her own code**, found and deliberately left untouched: `.bank-hb-zero`
   points at `var(--wn-500)`, a token declared nowhere, so her diverging bar's zero axis is
   invisible in her build; and `.gft-empty` is never declared. Both are hers to fix, and worth
   telling her.

---

## 9. Where the record lives

- `Widget Container Demo/_port-drivers/PORT-MANIFEST.md` — per-widget port ledger, driver
  counts, and the comparison-dashboard section.
- `Widget Container Demo/Design Differences (Jo vs Oisin)/` — the .md and Confluence .html
  pair, one section per widget, W01-W17.
- `Step 3 - Mock_Work/Unattended Run - Decisions and Questions (2026-08-30).md` — every
  defaulted choice and open question from the doc/spec runs.
- `RUN HANDOFF - W01-W10 Step4-Step5-Port (2026-09-02).md` — the per-widget port protocol.
