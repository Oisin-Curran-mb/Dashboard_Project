/* w15-owner-check.js  --  written 2026-09-04, independent of the build agent's own driver.
   Reads the LIVE Dashboard Widget Mockups.html every run and re-tests, from scratch, the
   claims that matter to the owner rather than the ones the builder chose to assert. Nothing
   here is inlined: if the file changes, this re-reads it and the answer changes with it. */

const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, 'Dashboard Widget Mockups.html');
const html = fs.readFileSync(FILE, 'utf8');

let pass = 0, fail = 0;
const bad = [];
function ok(cond, label, detail) {
  if (cond) { pass++; }
  else { fail++; bad.push(label + (detail ? '   -> ' + detail : '')); }
}

/* ---- carve the regions out of the live file ------------------------------ */
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>', styleStart);
const styleBlock = html.slice(styleStart, styleEnd);

/* every CSS rule whose selector mentions .bankf-root, taken from the STYLE BLOCK ONLY.
   Parsing the whole document instead is how a previous pass injected JavaScript into
   the CSS, which node --check cannot see. */
const bankCss = styleBlock
  .split('}')
  .filter(r => r.includes('.bankf-root'))
  .map(r => r + '}')
  .join('\n');

/* The bkF javascript, from its OPENING BANNER to its closing marker. Starting at
   bkfServerQuery instead, as a first version of this did, silently excluded the
   constants declared above it, so BKF_VIEWS fell outside the region and a check
   counting the presentations found none. Region boundaries are worth being exact
   about: too narrow reads as absence, too wide reads as another widget's code. */
const jsStart = html.indexOf('/* ===== W15 FINAL, Bank Balances');
const jsEnd = html.indexOf('/* ==== END W15 bkF block ==== */') >= 0
  ? html.indexOf('/* ==== END W15 bkF block ==== */')
  : html.indexOf('WRENDER[15]=function');
const bkfJs = html.slice(jsStart, jsEnd);

/* the Final Check card markup */
const cardStart = html.indexOf('id="fc-widget-15"');
const cardEnd = html.indexOf('id="fc-widget-16"');
const card = html.slice(cardStart, cardEnd);

/* CSS comments must be stripped before any token test. The project's own
   css-token-resolve-check.py shipped 9 false positives for exactly this reason:
   a comment that mentions var(--x) is not a use of --x. */
const bankCssBare = bankCss.replace(/\/\*[\s\S]*?\*\//g, '');
/* Same for the JS: a comment saying "NOT Jo's Load more" is evidence the rule was
   followed, not broken, so the prose tests below run against code only. */
const bkfCode = () => bkfJs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

ok(bankCss.length > 5000, 'A1 .bankf-root CSS found in the style block', bankCss.length + ' chars');
ok(bkfJs.length > 5000, 'A2 bkF JS region found', bkfJs.length + ' chars');
ok(card.length > 5000, 'A3 fc-widget-15 card markup found', card.length + ' chars');

/* ---- 1. the CSS block is CSS, not smuggled JavaScript -------------------- */
ok((bankCss.match(/{/g) || []).length === (bankCss.match(/}/g) || []).length,
  '1a braces balanced in the .bankf-root CSS');
const jsSmell = /\b(function|var |return |=>|\.push\(|Math\.)/.exec(bankCssBare);
ok(!jsSmell, '1b no JavaScript smuggled into the CSS block', jsSmell && jsSmell[0]);

/* ---- 2. the per-root token block, the W11 six-pass failure --------------- */
const declared = new Set();
for (const m of bankCssBare.matchAll(/(--[a-z0-9-]+)\s*:/g)) declared.add(m[1]);
const used = new Set();
for (const m of bankCssBare.matchAll(/var\((--[a-z0-9-]+)/g)) used.add(m[1]);
const undeclared = [...used].filter(x => !declared.has(x));
ok(declared.size >= 25, '2a .bankf-root declares its own token block', declared.size + ' tokens');
ok(undeclared.length === 0, '2b every token used is declared', undeclared.join(', '));
ok(!used.has('--wn-500'), '2c does not use --wn-500, undeclared in Jo\'s file and ours');

/* ---- 3. the sort must NOT happen in the browser -------------------------- */
ok(/function bkfServerQuery/.test(bkfJs), '3a bkfServerQuery exists');
for (const shape of ['rows', 'totalCount', 'totals', 'pageIndex', 'pageCount']) {
  ok(new RegExp(shape + '\\s*:').test(bkfJs), '3b response carries ' + shape);
}
/* the deleted client helpers must be gone, not merely unused */
for (const gone of ['bkfSortedAccounts', 'bkfPageRows', 'bkfPageIndex', 'bkfPageCount',
                    'bankFSorted', 'bankFPageRows']) {
  ok(!new RegExp('function\\s+' + gone).test(bkfJs), '3c client helper deleted: ' + gone);
}
/* no renderer may sort, slice or reduce its way to rows, pages or totals */
const renderFns = [...bkfJs.matchAll(/function\s+(bkf[A-Za-z]*)\s*\(([^)]*)\)\s*{/g)];
ok(renderFns.length > 10, '3d found the bkF functions', renderFns.length + ' functions');
/* Take each function body by BRACE MATCHING, not by scanning for the next
   "\nfunction". That heuristic silently over-runs whenever the next declaration is
   not a bare top-level function, and it made this check accuse bkfIsAllMode of a
   sort that actually lives in bkfServerQuery further down the file. */
function bodyOf(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return src.slice(openIdx, i + 1); }
  }
  return src.slice(openIdx);
}
const offenders = [];
for (const m of renderFns) {
  const name = m[1];
  if (name === 'bkfServerQuery') continue;           // the server stand-in may do the work
  const brace = bkfJs.indexOf('{', m.index + m[0].length - 1);
  const body = bodyOf(bkfJs, brace);
  for (const op of ['.sort(', '.slice(', '.reduce(']) {
    if (body.includes(op)) offenders.push(name + ' uses ' + op);
  }
}
ok(offenders.length === 0, '3e no renderer sorts, slices or reduces', offenders.join('; '));

/* the server-side rules the mock has to model */
ok(/whitelist|WHITELIST|SORTABLE|allow/i.test(bkfJs), '3f sort key is whitelisted, not trusted');
ok(/localeCompare|tiebreak|tie-break/i.test(bkfJs), '3g ordering has a tiebreaker');
ok(/Math\.max|Math\.min|clamp/i.test(bkfJs), '3h page index is clamped');

/* ---- 4. the pager is Next/Previous, not Load more ----------------------- */
ok(!/load\s*more/i.test(bkfCode()), '4a no "Load more" control in the code');
ok(/next/i.test(bkfJs) && /prev/i.test(bkfJs), '4b a Next and a Previous control exist');

/* ---- 5. volume: paging must actually be exercised ----------------------- */
const acctBlock = html.slice(html.indexOf('var BKF_ACCOUNTS=['),
                             html.indexOf('\n];', html.indexOf('var BKF_ACCOUNTS=[')));
const acctMatches = acctBlock.match(/\{id:'/g) || [];
const pageSize = (html.match(/BKF_PAGE_SIZE=(\d+)/) || [])[1];
ok(pageSize && acctMatches.length > Number(pageSize) * 2,
  '5b the account count exceeds two pages, so Next is genuinely needed',
  acctMatches.length + ' accounts / page size ' + pageSize);
ok(acctMatches.length >= 40, '5a about 50 mock accounts present, so paging is real',
  acctMatches.length + ' account literals');

/* ---- 6. no sortable columns: open item 7, left for the owner ------------- */
ok(!/data-bkf="sort"|data-bkf='sort'/.test(bkfJs), '6a no column-sort control is wired');

/* ---- 7. accessibility the gate has a standing finding about -------------- */
ok(/<th[ >]/.test(bkfJs), '7a real table headers');
ok(/scope=/.test(bkfJs), '7b th carries scope');
ok(/sr-only|aria-label|visually-hidden/.test(bkfJs), '7c chart values exist as DOM text');
ok(/data-tier/.test(bkfJs), '7d charts carry data-tier for sizing');

/* ---- 8. Rule 12: Glance, Explore, Detail, and no Small ------------------ */
for (const word of ['Glance', 'Explore', 'Detail']) {
  ok(card.includes(word), '8a card names the size: ' + word);
}
ok(/fc-szhd-abc/.test(card) && /fc-szhd-f/.test(card),
  '8b the two-span size-heading pattern is present');
const abc = (card.match(/fc-szhd-abc/g) || []).length;
const f = (card.match(/fc-szhd-f/g) || []).length;
ok(abc === f && abc >= 10, '8c the abc and f heading spans are paired', abc + ' vs ' + f);
/* style block only: the FC_VERSION changelog NAMES this selector while recording
   that the widget used to have none of it, and a whole-file count would count that. */
const fmode = (styleBlock.match(/#fc-widget-15\.fc-fmode/g) || []).length;
ok(fmode >= 8, '8d the F-mode card-proportion rules exist', fmode + ' rules');
ok(/#fc-widget-15\.fc-fmode[^{]*\.opt\.sz-l\s*{[^}]*grid-column\s*:\s*1\s*\/\s*-1/.test(html),
  '8e Detail spans the full grid width, the W11 sideways-scroll bug');

/* ---- 9. the stale chrome that made this rebuild necessary --------------- */
ok(!/isn't built|isn.t built/i.test(card), '9a the false "Single Account isn\'t built" claim is gone');
ok(!/Balance Cards<\/div>/.test(card) || /Final \(v2\)/.test(card),
  '9b the card is an F-mode card, not the old A/B/C ladder');
ok(/Final \(v2\)/.test(card), '9c the design-option switch offers Final (v2)');
ok(html.includes("fcInitState(15,'F')"), '9d Final is the default option again');
ok(/if\(opt===.F.\)\s*return\s+bkfRender/.test(html), '9e WRENDER[15] dispatches to the F build');

/* ---- 10. the discarded port leaves no live code behind ------------------ */
ok(!/function bankF/.test(html), '10a no bankF functions survive');
ok(!/data-bankf=/.test(html), '10b no data-bankf handlers survive');
ok(!/\.bkf-root/.test(html), '10c the abandoned first-attempt root is gone');

/* ---- 11. no em dashes in anything this build renders -------------------- */
const emJs = (bkfJs.match(/—/g) || []).length;
const emCss = (bankCssBare.match(/—/g) || []).length;
ok(emJs === 0, '11a no em dash in the bkF JS', emJs + ' found');
ok(emCss === 0, '11b no em dash in the .bankf-root CSS', emCss + ' found');

/* ---- 11b. THE OVERDRAWN CHIP, added by owner instruction 2026-09-04 ----- */
/* It is a count AND a filter, so the thing worth checking independently is that the
   filtering is a server-side concern like the paging, and that the count is over the
   whole set. A count taken from the filtered set would be circular, and a count taken
   from the page would change as the user paged. */
const code = bkfCode();
ok(/function bkfOverdrawnChip/.test(code), '11b-a the chip function exists');
ok(/data-bkf="overdrawn"/.test(code), '11b-b the chip is a wired control, not decoration');
ok(/overdrawnCount/.test(code) && /overdrawnOnly/.test(code), '11b-c the response carries the count and the applied filter');
ok(/aria-pressed/.test(code), '11b-d the chip carries aria-pressed, so state is not colour alone');
ok(/\.bank-odchip\{/.test(bankCssBare), '11b-e the chip has a rule of its own under .bankf-root');
ok(/--red-100/.test(bankCssBare), '11b-f the red marking uses the declared red token');
/* the count is taken BEFORE the filter is applied: prove it by source order */
const qStart = code.indexOf('function bkfServerQuery');
const countAt = code.indexOf('overdrawnCount++', qStart);
const filterAt = code.indexOf('set.push', qStart);
ok(countAt > 0 && filterAt > countAt,
  '11b-g the count is computed over the whole set BEFORE the filter narrows it');
ok(/w\.over=!w\.over/.test(code), '11b-h the handler toggles the filter');
ok(/w\.over=!w\.over;\s*w\.page=0/.test(code), '11b-i toggling resets to page 1');
ok(/w\.over=false/.test(code), '11b-j the mode switch clears the filter');

/* ---- 12. removed by owner instruction, 2026-09-04 ---------------------- */
/* The download control and the Account Cards presentation were both REMOVED. The
   W11 convention originally called for the download, so these assert absence
   rather than presence: the risk is that a later pass re-adds it from the
   convention without checking whether this widget still wants it. */
ok(!/data-bkf="download"/.test(bkfCode()), '12a no download control is wired');
ok(!/bkfActionRow/.test(bkfCode()), '12b no download action row survives');
ok(!/bank-actionrow/.test(bankCssBare), '12c no download action row CSS survives');
ok(!/bkfAccountCards/.test(bkfCode()), '12d no Account Cards presentation survives');
ok(!/bank-card/.test(bankCssBare), '12e no card CSS survives');
ok(!/data-fc-view="cards"/.test(card), '12f no Account Cards entry in the card chrome menu');
/* Count inside the BKF_VIEWS array ONLY. A bare {k:' pattern also matches the
   seven breakdown rows and the four activity categories, which are not views. */
const viewsArr = bkfJs.slice(bkfJs.indexOf('var BKF_VIEWS=['),
                             bkfJs.indexOf('\n];', bkfJs.indexOf('var BKF_VIEWS=[')));
const viewKeys = (viewsArr.match(/\{k:'[a-z]+'/g) || []);
ok(viewKeys.length === 2, '12g exactly two presentations remain', viewKeys.join(' '));
ok(!viewsArr.includes("'cards'"), '12h the cards view is gone from BKF_VIEWS');

/* ---- report ------------------------------------------------------------- */
console.log('\nw15-owner-check  (independent of the build agent\'s driver)');
console.log('  .bankf-root CSS   ' + bankCss.length + ' chars, ' + declared.size + ' tokens declared');
console.log('  bkF JS            ' + bkfJs.length + ' chars, ' + renderFns.length + ' functions');
console.log('  fc-widget-15 card ' + card.length + ' chars');
if (bad.length) {
  console.log('\nFAILURES:');
  bad.forEach(b => console.log('  x ' + b));
}
console.log('\n' + (fail === 0 ? 'PASS' : 'FAIL') + ' -- ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
