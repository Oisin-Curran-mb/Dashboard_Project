/* w15-bkf-final.driver.js -- DOM-shim driver for W15 Bank Balances, Final (bkF).
 *
 * EXTRACT THEN RUN. The widget's code is read VERBATIM FROM THE LIVE FILE on every
 * run and eval'd. Nothing is inlined here. A previous driver in this project had the
 * widget's code pasted inside it, so re-running it after an edit re-tested a stale
 * copy and reported a perfect score regardless of what the build actually said. If
 * this file and the build disagree, this file fails.
 *
 * Run:  cd "Step 3 - Mock_Work" && node w15-bkf-final.driver.js
 */
/* deliberately NOT strict mode: the widget code is brought in with a direct eval,
   and in strict mode eval gets its own scope so none of its var declarations would
   be visible to the assertions below. */
const fs = require('fs');
const path = require('path');

/* argv[2] exists only so the extraction itself can be proved: point this at a
   deliberately broken COPY of the build and the run must fail. It defaults to the
   live file, which is what a normal run reads. */
const FILE = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'Dashboard Widget Mockups.html');
const src  = fs.readFileSync(FILE, 'utf8');

const w15Region = src.slice(src.indexOf('/* ===== W15 FINAL, Bank Balances'), src.indexOf('/* ==== END W15 bkF block ==== */'));
/* EVERY ABSENCE CHECK MUST READ CODE, NOT COMMENTS, AND MUST BE SCOPED TO W15.
   Three separate assertions in this file failed on 2026-09-04 not because the build
   was wrong but because the FC_VERSION[15] changelog NAMES the very strings they
   search for, while recording that they were removed. A whole-file existence check
   cannot tell "this identifier is used here" from "this identifier is discussed
   here", and the same trap caught a selector count and a CSS token check earlier
   the same day. w15Code is the region with comments stripped: search that. */
const w15Code = w15Region.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ---------- 1. EXTRACT, verbatim, from the live file ---------------------- */
const JS_START = '/* ===== W15 FINAL, Bank Balances (prefix bkf / BKF_) ===';
const JS_END   = '/* ==== END W15 bkF block ==== */';
const a = src.indexOf(JS_START), b = src.indexOf(JS_END);
if (a < 0 || b < a) { console.error('FATAL: could not find the bkF JS block in the live file.'); process.exit(1); }
const widgetCode = src.slice(a, b + JS_END.length);

const CSS_START = '/* ===== W15 FINAL (bkF) styling, rebuilt 2026-09-04 ==';
const CSS_END   = '/* ==== END W15 bkF styles ==== */';
const ca = src.indexOf(CSS_START), cb = src.indexOf(CSS_END);
if (ca < 0 || cb < ca) { console.error('FATAL: could not find the .bankf-root CSS block in the live file.'); process.exit(1); }
const widgetCss = src.slice(ca, cb + CSS_END.length);

/* the fc-widget-15 Final Check card block, also verbatim */
const fa = src.indexOf('<div class="fc-widget" id="fc-widget-15">');
const fb = src.indexOf('/fc-widget-15', fa);
if (fa < 0 || fb < fa) { console.error('FATAL: could not find the fc-widget-15 markup block.'); process.exit(1); }
const fcBlock = src.slice(fa, fb);

/* the WRENDER[15] dispatch line, verbatim */
const wa = src.indexOf('WRENDER[15]=function(opt,wid,sz){');
const wrenderHead = wa < 0 ? '' : src.slice(wa, wa + 1400);

/* ---------- 2. MINIMAL SHIM ---------------------------------------------- */
const listeners = {};
const capturedEls = [];
function makeEl(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(), id: '', className: '', _html: '', style: {},
    _attrs: {}, offsetWidth: 260, offsetHeight: 300, parentNode: null,
    setAttribute(k, v) { this._attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; },
    appendChild(c) { c.parentNode = this; return c; },
    remove() { const i = capturedEls.indexOf(this); if (i >= 0) capturedEls.splice(i, 1); },
    getBoundingClientRect() { return { left: 100, top: 100, right: 260, bottom: 130, width: 160, height: 30 }; },
    closest() { return null; },
    addEventListener() {},
    classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }
  };
  Object.defineProperty(el, 'innerHTML', { get() { return this._html; }, set(v) { this._html = String(v); }, enumerable: true });
  capturedEls.push(el);
  return el;
}
const document = {
  getElementById(id) { for (const e of capturedEls) if (e.id === id) return e; return null; },
  createElement(t) { return makeEl(t); },
  body: makeEl('body'),
  addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); }
};
const window = { innerWidth: 1440, innerHeight: 900, addEventListener() {} };
global.document = document; global.window = window;
global.requestAnimationFrame = fn => fn();
let toasts = [];
global.showToast = m => { toasts.push(String(m)); };
/* FC_STATE / fcRenderWidget exist so the widget's guarded rerender path is real
   rather than silently skipped, and so we can count re-renders. */
let renderCount = 0;
global.FC_STATE = { 15: { opt: 'F', sz: { k: 'k', s: 's', m: 'm', l: 'l' } } };
global.fcRenderWidget = () => { renderCount++; };

/* ---------- 3. RUN the extracted code ------------------------------------ */
try { eval(widgetCode); } catch (e) { console.error('FATAL: extracted widget code threw on load:', e.message); process.exit(1); }

/* ---------- 4. ASSERTIONS ------------------------------------------------ */
let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? '  [' + detail + ']' : '')); }
}
function reset(over) {
  BKF_STATE.acct = BKF_ALL; BKF_STATE.view = 'table'; BKF_STATE.page = 0;
  BKF_STATE.sort = BKF_DEFAULT_SORT; BKF_STATE.dataset = null; BKF_STATE.size = 'wide';
  BKF_STATE.over = false;   /* added with the overdrawn filter: a reset that leaves it
                               set would silently filter every later assertion */
  BKF_POP = null;
  if (over) Object.assign(BKF_STATE, over);
}
const SIZES = ['k', 'xk', 's', 'm', 'l', 'x'];
const VIEWS = ['table', 'bars'];
const strip = h => String(h).replace(/<[^>]*>/g, ' ');

/* --- 4a. every size renders non-empty, in both modes --- */
const firstAcct = BKF_ACCOUNTS[0].id;
for (const sz of SIZES) {
  reset(); const all = bkfRender(15, sz);
  ok('size ' + sz + ' All Accounts renders non-empty', typeof all === 'string' && all.length > 200, 'len=' + (all || '').length);
  reset({ acct: firstAcct }); const one = bkfRender(15, sz);
  ok('size ' + sz + ' Single Account renders non-empty', typeof one === 'string' && one.length > 200, 'len=' + (one || '').length);
}
/* the s slot is hidden in F mode but must still render safely as the MID tier */
reset(); const sOut = bkfRender(15, 's'); const mOut = bkfRender(15, 'm');
ok('s slot renders as the mid tier (Explore), identical to m', sOut === mOut);
ok('s slot carries data-tier="wide"', /data-tier="wide"/.test(sOut));

/* --- 4b. Rule 12 tiers on the root --- */
reset();
ok('k maps to tier kpi',    /class="bankf-root bankf-w" data-tier="kpi"/.test(bkfRender(15, 'k')));
ok('xk maps to tier kpi',   /data-tier="kpi"/.test(bkfRender(15, 'xk')));
ok('m maps to tier wide',   /data-tier="wide"/.test(bkfRender(15, 'm')));
ok('l maps to tier xwide',  /data-tier="xwide"/.test(bkfRender(15, 'l')));
ok('x maps to tier xwide',  /data-tier="xwide"/.test(bkfRender(15, 'x')));

/* --- 4c. every presentation renders, and each produces different output --- */
reset();
const perView = {};
for (const v of VIEWS) { reset({ view: v }); perView[v] = bkfRender(15, 'm'); ok('presentation ' + v + ' renders non-empty', perView[v].length > 400); }
ok('table presentation is a real table',        /<table class="bank-tbl"/.test(perView.table));
ok('bars presentation is Jo\'s diverging bar',  /bank-hb-row/.test(perView.bars) && /bank-hb-zero/.test(perView.bars));
ok('the cards presentation is GONE (owner instruction 2026-09-04)', !/bank-card/.test(perView.table + perView.bars) && !/bkfAccountCards/.test(w15Code));
ok('the two presentations differ from each other', perView.table !== perView.bars);

/* --- 4d. both modes render, and Single Account is a DIFFERENT SHAPE --- */
reset(); const allM = bkfRender(15, 'l');
reset({ acct: firstAcct }); const oneM = bkfRender(15, 'l');
ok('All Accounts mode renders the account population', /Total, all \d+ account/.test(allM));
ok('Single Account mode renders the seven row breakdown', /Beginning Balance/.test(oneM) && /Ending Balance/.test(oneM));
ok('Single Account mode is a different shape, not a filtered list', !/Total, all \d+ account/.test(oneM));
ok('Detail adds the four activity categories in Single Account mode', /bank-cats/.test(oneM) && /bank-cols/.test(oneM));
reset({ acct: firstAcct }); const oneExplore = bkfRender(15, 'm');
ok('Explore does NOT add the activity categories', !/bank-cols/.test(oneExplore));
ok('Explore still renders the full seven row breakdown', (oneExplore.match(/scope="row"/g) || []).length >= 7);

/* --- 4e. the empty-data guard --- */
reset({ dataset: 'none' });
for (const sz of SIZES) {
  const out = bkfRender(15, sz);
  ok('empty data at size ' + sz + ' renders the guard, not a throw or a blank', /class="state" data-kind="empty"/.test(out) && /No active bank accounts/.test(out));
}
reset({ dataset: 'none', acct: firstAcct });
ok('empty data with a stale account selection still renders the guard', /data-kind="empty"/.test(bkfRender(15, 'l')));

/* --- 4f. THE PAGER SERVES EACH ACCOUNT EXACTLY ONCE ACROSS ALL PAGES --- */
reset();
const q0 = bkfServerQuery(BKF_STATE);
ok('the mock set is big enough to force paging', q0.pageCount > 1, 'pageCount=' + q0.pageCount);
ok('about 50 accounts, per section 5', q0.totalCount >= 45 && q0.totalCount <= 60, 'totalCount=' + q0.totalCount);
const seen = [];
for (let p = 0; p < q0.pageCount; p++) {
  reset({ page: p });
  const r = bkfServerQuery(BKF_STATE);
  for (const row of r.rows) seen.push(row.id);
}
const uniq = new Set(seen);
ok('paging serves every account exactly once (no repeats)', uniq.size === seen.length, seen.length + ' rows, ' + uniq.size + ' unique');
ok('paging serves every account exactly once (no skips)', uniq.size === q0.totalCount, uniq.size + ' of ' + q0.totalCount);

/* --- 4g. THE TOTAL IS IDENTICAL ON EVERY PAGE, in the response and on screen --- */
const totalsSeen = new Set(), renderedTotals = new Set();
for (let p = 0; p < q0.pageCount; p++) {
  reset({ page: p });
  totalsSeen.add(bkfServerQuery(BKF_STATE).totals.ending.toFixed(2));
  const html = bkfRender(15, 'm');
  const m = html.match(/Total, all \d+ accounts<\/th><td class="wt-c2 bank-bal[^"]*"[^>]*>([^<]+)</);
  if (m) renderedTotals.add(m[1]);
}
ok('res.totals.ending is identical on every page', totalsSeen.size === 1, [...totalsSeen].join(' / '));
ok('the RENDERED total string is identical on every page', renderedTotals.size === 1, [...renderedTotals].join(' / '));
/* and it is the whole-set total, not a page total */
reset();
let handSum = 0; for (const acc of BKF_ACCOUNTS) handSum += bkfEnding(acc);
ok('the total is the sum over the WHOLE set', Math.abs(bkfServerQuery(BKF_STATE).totals.ending - handSum) < 0.005);
reset({ page: 0 });
let pageSum = 0; for (const r of bkfServerQuery(BKF_STATE).rows) pageSum += bkfEnding(r);
ok('the whole-set total is not the page total (so a page total would be visibly wrong)', Math.abs(pageSum - handSum) > 1);

/* --- 4h. an unknown sort key FALLS BACK rather than throwing --- */
for (const bad of ['balance-desc', 'nope', '', 'id-asc', 'nm; DROP TABLE', null, undefined, 42, {}]) {
  reset({ sort: bad });
  let r = null, threw = null;
  try { r = bkfServerQuery(BKF_STATE); } catch (e) { threw = e.message; }
  ok('unknown sort key ' + JSON.stringify(bad) + ' falls back without throwing', !threw && r && r.sortBy === 'nm' && r.sortDir === 'asc', threw || (r && r.sortBy + '-' + r.sortDir));
  reset({ sort: bad });
  let html = null; try { html = bkfRender(15, 'm'); } catch (e) { html = null; }
  ok('unknown sort key ' + JSON.stringify(bad) + ' still renders', typeof html === 'string' && html.length > 400);
}

/* --- 4i. the page index CLAMPS in both directions --- */
for (const lo of [-1, -99, -0.5]) { reset({ page: lo }); ok('page index clamps up from ' + lo, bkfServerQuery(BKF_STATE).pageIndex === 0); }
for (const hi of [q0.pageCount, q0.pageCount + 5, 9999]) { reset({ page: hi }); ok('page index clamps down from ' + hi, bkfServerQuery(BKF_STATE).pageIndex === q0.pageCount - 1); }
for (const junk of [NaN, undefined, null, 'x', 1.7]) {
  reset({ page: junk });
  let r = null, threw = null; try { r = bkfServerQuery(BKF_STATE); } catch (e) { threw = e.message; }
  ok('junk page index ' + JSON.stringify(junk) + ' clamps into range without throwing', !threw && r && r.pageIndex >= 0 && r.pageIndex <= q0.pageCount - 1, threw || (r && r.pageIndex));
}
/* clamping on an empty set must still give one page */
reset({ dataset: 'none', page: 7 });
const qe = bkfServerQuery(BKF_STATE);
ok('empty set clamps to a single page 0', qe.pageIndex === 0 && qe.pageCount === 1 && qe.rows.length === 0);

/* --- 4j. a UNIQUE TIEBREAKER makes the ordering deterministic --- */
reset();
const orderA = bkfServerQuery(BKF_STATE).rows.map(r => r.id).join(',');
const orderB = bkfServerQuery(BKF_STATE).rows.map(r => r.id).join(',');
ok('repeated identical queries return the identical order', orderA === orderB);
ok('the ordering code has a unique tiebreaker on id', /localeCompare\(b\.id\)/.test(widgetCode));
/* fixed alphabetical by account name, per section 7 */
const names = [];
for (let p = 0; p < q0.pageCount; p++) { reset({ page: p }); for (const r of bkfServerQuery(BKF_STATE).rows) names.push(r.nm); }
let sortedOk = true;
for (let i = 1; i < names.length; i++) if (names[i - 1].localeCompare(names[i]) > 0) sortedOk = false;
ok('ordering is fixed alphabetical by account name across all pages', sortedOk);
ok('the source array is NOT pre-sorted, so the ordering code really ran',
   !(BKF_ACCOUNTS.every((x, i) => i === 0 || BKF_ACCOUNTS[i - 1].nm.localeCompare(x.nm) <= 0)));

/* --- 4k. NO RENDERER CALLS .sort( / .slice( / .reduce( ------------------
   The server stand-in is allowed to, because it stands for the server. Every other
   function in the block must not, or the mockup would be lying about where paging,
   ordering and aggregation happen. */
const fnRe = /function\s+(bkf[A-Za-z0-9_]*)\s*\(/g;
const fnNames = [];
let fm; while ((fm = fnRe.exec(widgetCode))) fnNames.push({ name: fm[1], at: fm.index });
ok('the block declares the expected function set', fnNames.length >= 20, fnNames.length + ' functions');
const SERVER_OK = ['bkfServerQuery'];
const offenders = [];
for (let i = 0; i < fnNames.length; i++) {
  const from = fnNames[i].at;
  const to = (i + 1 < fnNames.length) ? fnNames[i + 1].at : widgetCode.length;
  let body = widgetCode.slice(from, to);
  body = body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
  for (const bad of ['.sort(', '.slice(', '.reduce(']) {
    if (body.indexOf(bad) >= 0 && SERVER_OK.indexOf(fnNames[i].name) < 0) offenders.push(fnNames[i].name + ' uses ' + bad);
  }
}
ok('no renderer calls .sort( / .slice( / .reduce(', offenders.length === 0, offenders.join('; '));
ok('the only .sort( in the block is the server stand-in\'s', (widgetCode.replace(/\/\*[\s\S]*?\*\//g, '').match(/\.sort\(/g) || []).length === 1);
/* the totals row must read res.totals, never reduce over the rows it was handed */
const totalFnStart = widgetCode.indexOf('function bkfBalanceTable');
const totalFn = widgetCode.slice(totalFnStart, widgetCode.indexOf('function bkfBalanceBars'));
ok('the totals row reads res.totals rather than the page it was handed', /res\.totals\.ending/.test(totalFn) && !/\.reduce\(/.test(totalFn));
/* the pager must read the response, never recompute the index or the count */
const pagerFn = widgetCode.slice(widgetCode.indexOf('function bkfPager'), widgetCode.indexOf('function bkfNegativeGap'));
ok('the pager reads res.pageIndex and res.pageCount', /res\.pageIndex/.test(pagerFn) && /res\.pageCount/.test(pagerFn));
ok('the pager does not recompute the page count', !/Math\.ceil/.test(pagerFn));

/* --- 4l. THE SEVEN-ROW BREAKDOWN: every row, fixed order, foots to ending --- */
let brkChecked = 0, brkBad = [];
for (const acc of BKF_ACCOUNTS) {
  reset({ acct: acc.id });
  const q = bkfAccountQuery(BKF_STATE);
  if (!q) { brkBad.push(acc.id + ' no query'); continue; }
  if (q.rows.length !== 7) { brkBad.push(acc.id + ' has ' + q.rows.length + ' rows'); continue; }
  const order = q.rows.map(r => r.k).join(',');
  if (order !== 'beg,dep,vd,chk,wdr,eft,end') { brkBad.push(acc.id + ' order ' + order); continue; }
  /* rule 3: ending equals beginning PLUS all activity, with the STORED signs */
  const foot = q.rows[0].v + q.rows[1].v + q.rows[2].v + q.rows[3].v + q.rows[4].v + q.rows[5].v;
  if (Math.abs(foot - q.rows[6].v) > 0.005) { brkBad.push(acc.id + ' foots to ' + foot + ' not ' + q.rows[6].v); continue; }
  if (Math.abs(q.rows[6].v - bkfEnding(acc)) > 0.005) { brkBad.push(acc.id + ' ending mismatch'); continue; }
  const html = bkfRender(15, 'l');
  for (const label of ['Beginning Balance', 'Deposits', 'Voids', 'Checks', 'Withdrawals', 'EFT', 'Ending Balance'])
    if (html.indexOf('>' + label) < 0) brkBad.push(acc.id + ' missing row ' + label);
  brkChecked++;
}
ok('the seven row breakdown renders every row in the fixed order and foots to the ending balance, for all ' + BKF_ACCOUNTS.length + ' accounts', brkBad.length === 0 && brkChecked === BKF_ACCOUNTS.length, brkBad.slice(0, 4).join(' | '));
/* NO totals row: Ending Balance already is the total */
reset({ acct: firstAcct });
const brkHtml = bkfRender(15, 'm');
ok('the breakdown has no totals row (Ending Balance is the total)', !/dep-total/.test(brkHtml) && !/<tfoot>/.test(brkHtml));
ok('the breakdown renders exactly 7 body rows', (brkHtml.match(/<tr class="wt-row(?! wt-head)[^"]*">/g) || []).length === 7);
ok('the breakdown is not sortable', !/wt-sort/.test(brkHtml) && !/data-bkf="sort"/.test(brkHtml));

/* rule 4: the sign flip is DISPLAY ONLY. The four categories read as positive
   magnitudes while the arithmetic uses the stored signs. */
let signBad = [];
for (const acc of BKF_ACCOUNTS) {
  reset({ acct: acc.id });
  const q = bkfAccountQuery(BKF_STATE);
  for (const c of q.categories) if (c.v < 0) signBad.push(acc.id + '/' + c.k + '=' + c.v);
  const chk = q.categories.find(c => c.k === 'chk');
  if (chk && acc.chk < 0 && Math.abs(chk.v + acc.chk) > 0.005) signBad.push(acc.id + ' chk magnitude wrong');
  if (chk && chk.stored !== acc.chk) signBad.push(acc.id + ' stored sign was mutated');
  if (acc.chk > 0) signBad.push(acc.id + ' checks stored positive, rule 4 violated in the data');
}
ok('the four categories are positive magnitudes and the stored signs are untouched', signBad.length === 0, signBad.slice(0, 4).join(' | '));
ok('EFT is not one of the four comparison categories', BKF_CATEGORIES.every(c => c.k !== 'eft') && BKF_CATEGORIES.length === 4);

/* --- 4m. CHART VALUES EXIST AS TEXT IN THE DOM, never hover only (F4) --- */
reset({ view: 'bars' });
const barsHtml = bkfRender(15, 'm');
reset({ page: 0, view: 'bars' });
const barRows = bkfServerQuery(BKF_STATE).rows;
let barTextBad = [];
for (const r of barRows) {
  const txt = strip(barsHtml);
  if (txt.indexOf(r.nm) < 0) barTextBad.push('name ' + r.nm);
  if (txt.indexOf(bkfMoneyShort(bkfEnding(r))) < 0) barTextBad.push('value for ' + r.nm);
}
ok('every balance bar carries its account name and value as TEXT in the DOM', barTextBad.length === 0, barTextBad.slice(0, 3).join(' | '));
ok('the bar chart also carries an sr-only exact value per row', (barsHtml.match(/class="sr-only"/g) || []).length >= barRows.length);
ok('the bar chart carries data-tier', /class="bank-hb"/.test(barsHtml) && /data-tier="wide"/.test(barsHtml));
reset({ acct: firstAcct });
const catHtml = bkfRender(15, 'l');
const catTxt = strip(catHtml);
let catBad = [];
for (const c of ['Deposits', 'Voids', 'Checks', 'Withdrawals']) if (catTxt.indexOf(c) < 0) catBad.push(c);
ok('every activity category carries its label as text', catBad.length === 0, catBad.join(','));
reset({ acct: firstAcct });
const q1 = bkfAccountQuery(BKF_STATE);
let catValBad = [];
for (const c of q1.categories) { const lab = c.v === 0 ? '$0' : bkfMoneyShort(c.v); if (catTxt.indexOf(lab) < 0) catValBad.push(c.l + ' ' + lab); }
ok('every activity category carries its value as text, not hover only', catValBad.length === 0, catValBad.join(' | '));
ok('the activity chart carries data-tier', /class="bank-chart-wrap" data-tier="xwide"/.test(catHtml));
ok('the activity chart states the direction in words, not colour alone', /bank-xflow/.test(catHtml) && /money out of the account/.test(catHtml));

/* --- 4n. REAL TABLE SEMANTICS: th with scope, on both tables --- */
reset({ view: 'table' });
const tblHtml = bkfRender(15, 'm');
ok('the account table uses th scope="col" for its headers', (tblHtml.match(/<th class="[^"]*" scope="col"/g) || []).length === 2);
ok('the account table uses th scope="row" for each account', (tblHtml.match(/scope="row"/g) || []).length >= 12);
ok('the account table is a native table with thead, tbody and tfoot', /<thead>/.test(tblHtml) && /<tbody>/.test(tblHtml) && /<tfoot>/.test(tblHtml));
ok('the account table has an sr-only caption naming the scope and the paging', /<caption class="sr-only">/.test(tblHtml));
reset({ acct: firstAcct });
const brk2 = bkfRender(15, 'm');
ok('the seven row breakdown uses th scope="col" for its headers', (brk2.match(/scope="col"/g) || []).length === 2);
ok('the seven row breakdown uses th scope="row" for each of its rows', (brk2.match(/scope="row"/g) || []).length === 7);
ok('the seven row breakdown has an sr-only caption', /<caption class="sr-only">/.test(brk2));

/* --- 4o. GLANCE: one figure, always the All Accounts aggregate ----------- */
reset();
const glanceAll = bkfRender(15, 'k');
const wholeTotalShort = bkfMoneyShort(handSum);
ok('Glance shows the All Accounts total', strip(glanceAll).indexOf(wholeTotalShort) >= 0, wholeTotalShort);
let glanceBad = [];
for (const acc of [BKF_ACCOUNTS[0].id, BKF_ACCOUNTS[5].id, BKF_ACCOUNTS[20].id, 'nonexistent']) {
  reset({ acct: acc, page: 3, view: 'bars' });
  const g = bkfRender(15, 'k');
  if (strip(g).indexOf(wholeTotalShort) < 0) glanceBad.push(acc);
}
ok('the Glance figure is ALWAYS the All Accounts aggregate, whatever account is selected', glanceBad.length === 0, glanceBad.join(','));
ok('Glance has no controls: no chip, no view toggle, no pager',
   !/filter-chip/.test(glanceAll) && !/vtoggle/.test(glanceAll) && !/bank-pager/.test(glanceAll));
ok('Glance carries the exact figure for assistive technology', /class="sr-only"/.test(glanceAll) && /aria-label="Total balance across all/.test(glanceAll));

/* THE DOWNLOAD CONTROL WAS REMOVED BY OWNER INSTRUCTION, 2026-09-04. It is not
   hidden, it is gone: no control, no handler, no CSS, no aria string. These four
   assertions exist so it cannot creep back in from the W11 convention that
   originally called for it. */
ok('no download control at any size', ['k','m','l','x'].every(s => !/data-bkf="download"/.test(bkfRender(15, s))));
ok('no download action row markup survives', !/bank-actionrow/.test(w15Code) && !/bank-actionrow/.test(bkfRender(15, 'm') + bkfRender(15, 'l')));
ok('no bkfActionRow function survives', !/bkfActionRow/.test(w15Code));
/* SCOPED TO W15's OWN REGION. W11's faF legitimately has a download handler, and an
   unscoped check on the whole file conflates the two widgets. An unscoped regex of
   exactly this shape is what deleted W11's handler by mistake on 2026-09-04. */
ok('no download click handler survives in W15', !/a==='download'/.test(w15Region));
ok("W11's own download handler is still intact, not collateral damage", /if\(a==='download'\)\{\s*fafClosePop\(\)/.test(src));

/* --- 4p. controls: Switch View is All Accounts mode ONLY --- */
reset(); const allExplore = bkfRender(15, 'm');
ok('Switch View is present in All Accounts mode, now offering TWO views', /class="vtoggle"/.test(allExplore) && (allExplore.match(/data-bkf="view"/g) || []).length === 2);
reset({ acct: firstAcct });
ok('Switch View is absent in Single Account mode (it would be a dead control)', !/data-bkf="view"/.test(bkfRender(15, 'm')));
reset();

reset();

reset();

reset({ acct: firstAcct });

reset();


ok('there is no time filter of any kind', !/fiscal|Fiscal|date range|Date Range|Period|period=/.test(strip(bkfRender(15, 'l'))));

/* --- 4q. the Account chip carries data-bkf, so the section 9.1 chip trio applies */
reset();
ok('the Account chip carries the widget\'s own handler attribute data-bkf', /class="filter-chip bank-acct-chip" data-bkf="acct"/.test(bkfRender(15, 'm')));
ok('the CSS declares the chip trio for data-bkf (fill, hover, glyph)',
   /\.bankf-root \.filter-chip\[data-bkf\]\{/.test(widgetCss) &&
   /\.bankf-root \.filter-chip\[data-bkf\]:hover\{/.test(widgetCss) &&
   /\.bankf-root \.filter-chip\[data-bkf\]::before\{/.test(widgetCss));
ok('filters and chips sit on one line (W11 convention: nowrap)', /\.bankf-root \.bank-hd-left\{[^}]*flex-wrap:nowrap/.test(widgetCss));

/* --- 4r. per-root declaration: every class the render emits has a rule whose
           FINAL COMPOUND is that class under .bankf-root --- */
reset();
let emitted = new Set();
for (const sz of SIZES) for (const v of VIEWS) for (const acct of [BKF_ALL, firstAcct]) {
  reset({ size: 'wide', view: v, acct });
  const h = bkfRender(15, sz);
  let m2; const cre = /class="([^"]+)"/g;
  while ((m2 = cre.exec(h))) for (const c of m2[1].split(/\s+/)) if (c) emitted.add(c);
}
reset({ dataset: 'none' }); { const h = bkfRender(15, 'm'); let m3; const cre2 = /class="([^"]+)"/g; while ((m3 = cre2.exec(h))) for (const c of m3[1].split(/\s+/)) if (c) emitted.add(c); }
BKF_STATE.acct = BKF_ALL; BKF_STATE.dataset = null;
{ const h = bkfPopContent(); let m4; const cre3 = /class="([^"]+)"/g; while ((m4 = cre3.exec(h))) for (const c of m4[1].split(/\s+/)) if (c) emitted.add(c); }
/* Collect the class SETS actually rendered on single elements too, because a
   modifier class (bank-anchor, check) legitimately has no rule of its own: it only
   selects descendants, and the element it sits on is styled by another class in the
   same attribute. What must never happen is an element NO rule reaches at all. */
const classSets = [];
function collectSets(h) { let m6; const re6 = /class="([^"]+)"/g; while ((m6 = re6.exec(h))) classSets.push(m6[1].split(/\s+/).filter(Boolean)); }
for (const sz of SIZES) for (const v of VIEWS) for (const acct of [BKF_ALL, firstAcct]) { reset({ view: v, acct }); collectSets(bkfRender(15, sz)); }
reset({ dataset: 'none' }); collectSets(bkfRender(15, 'm'));
reset(); collectSets(bkfPopContent());

const IGNORE = new Set(['bankf-root', 'bankf-w', 'material-symbols-rounded']);
const cssNoComments = widgetCss.replace(/\/\*[\s\S]*?\*\//g, '');
const selectors = [];
{ const re = /([^{}]+)\{/g; let m5;
  while ((m5 = re.exec(cssNoComments))) for (let sel of m5[1].split(',')) { sel = sel.trim(); if (sel.indexOf('.bankf-root') === 0) selectors.push(sel); } }
ok('the .bankf-root stylesheet declares a substantial rule set', selectors.length >= 90, selectors.length + ' selectors');
const clsRe = c => new RegExp('\\.' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])');
/* DIRECTLY STYLED: the class appears in the last whitespace-separated segment of a
   selector, so the rule reaches this element or its own cells (.dep-total>th). */
function directlyStyled(cls) {
  const r = clsRe(cls);
  for (const sel of selectors) { const segs = sel.split(/\s+/); if (r.test(segs[segs.length - 1])) return true; }
  return false;
}
/* MENTIONED AT ALL: the class appears anywhere in some .bankf-root selector, so it
   is a real marker the stylesheet knows about rather than a dead class name. */
function mentioned(cls) { const r = clsRe(cls); for (const sel of selectors) if (r.test(sel)) return true; return false; }
const direct = new Set([...emitted].filter(directlyStyled));
const notMentioned = [...emitted].filter(c => !IGNORE.has(c) && !mentioned(c));
ok('no class is emitted that the .bankf-root stylesheet never mentions', notMentioned.length === 0, notMentioned.join(', '));
const orphanElements = classSets.filter(set => !set.some(c => IGNORE.has(c) || direct.has(c)));
ok('no rendered element is left with no .bankf-root rule reaching it', orphanElements.length === 0, orphanElements.slice(0, 3).map(s => s.join('+')).join(' | '));
const markers = [...emitted].filter(c => !IGNORE.has(c) && !direct.has(c)).sort();
ok('the only classes without a rule of their own are the documented descendant markers',
   JSON.stringify(markers) === JSON.stringify(['bank-anchor', 'check']), markers.join(','));
ok('each of those markers really does drive a descendant rule',
   /\.bankf-root \.bank-anchor \./.test(cssNoComments) && /\.bankf-root \.mi\.check \./.test(cssNoComments));
ok('the row-level families that DO need their own rule have one on their cells',
   /\.bankf-root \.dep-total>th/.test(cssNoComments) && /\.bankf-root \.bank-brk-end>th/.test(cssNoComments) &&
   /\.bankf-root \.wt-row>th/.test(cssNoComments) && /\.bankf-root \.wt-head>th/.test(cssNoComments));
ok('the render emits a meaningful number of classes (the check is not vacuous)', emitted.size >= 35, emitted.size + ' classes');
ok('the class-set collection is not vacuous', classSets.length >= 200, classSets.length + ' elements');
ok('.bankf-root declares its own token block as the FIRST rule',
   /^\/\*[\s\S]*?\*\/\s*\.bankf-root\{/.test(widgetCss.trim()));

/* --- 4s. things handoff section 11 says must NOT be rebuilt -------------- */
reset();
let allOutput = '';
for (const sz of SIZES) for (const v of VIEWS) for (const acct of [BKF_ALL, firstAcct, BKF_ACCOUNTS[7].id]) {
  reset({ view: v, acct }); allOutput += bkfRender(15, sz);
}
BKF_STATE.acct = BKF_ALL; allOutput += bkfPopContent();
ok('NOT rebuilt: sortable balance columns',        !/wt-sort/.test(allOutput) && !/data-bkf="sort"/.test(allOutput));
ok('NOT rebuilt: Load more paging',                !/Load more/.test(allOutput) && !/data-bkf="more"/.test(allOutput));
/* THE OVERDRAWN CHIP WAS RE-ADDED 2026-09-04 BY OWNER INSTRUCTION, so these two
   assertions changed meaning rather than being deleted. The chip now has to be
   present, and Glance still has to be clean, which section 8 requires. The Glance
   check is now scoped to the Glance render: written against allOutput it could only
   ever have passed while the chip did not exist anywhere. */
ok('RE-ADDED by instruction: the overdrawn chip is present', /bank-odchip/.test(allOutput) && /data-bkf="overdrawn"/.test(allOutput));
ok('Glance still carries NO overdrawn count and NO chip (section 8: no controls)',
   !/\d+ overdrawn/.test(glanceAll) && !/bank-odchip/.test(glanceAll));
/* --- 4t. THE OVERDRAWN FILTER, added 2026-09-04 by owner instruction ------
   The filter is a REQUEST PARAMETER, so what has to be proved is not that rows
   disappear but that the server-side contract holds: the count is over the whole
   set, the totals and the page count follow the FILTERED set, and the browser is
   still doing none of the work. */
reset();
const unfiltered = bkfServerQuery(BKF_STATE);
reset({ over: true });
const filtered = bkfServerQuery(BKF_STATE);
const trueOverdrawn = BKF_ACCOUNTS.filter(a => bkfEnding(a) < 0).length;

ok('the overdrawn count matches the data', unfiltered.overdrawnCount === trueOverdrawn, trueOverdrawn + ' overdrawn');
ok('there IS at least one overdrawn account, so the chip is not vacuous', trueOverdrawn > 0);
ok('the count is identical filtered and unfiltered (it counts the whole set)',
   unfiltered.overdrawnCount === filtered.overdrawnCount);
ok('the filter narrows the result set', filtered.totalCount === trueOverdrawn && filtered.totalCount < unfiltered.totalCount);
ok('every row the filter returns is actually overdrawn', filtered.rows.every(a => bkfEnding(a) < 0));
ok('the filtered total is the overdrawn subtotal, not the org total',
   filtered.totals.ending !== unfiltered.totals.ending && filtered.totals.ending < 0);
ok('the page count follows the filtered set', filtered.pageCount === Math.max(1, Math.ceil(trueOverdrawn / BKF_PAGE_SIZE)));
ok('the response echoes the filter it applied', filtered.overdrawnOnly === true && unfiltered.overdrawnOnly === false);

/* the count must not move with the page either */
reset({ page: 3 });
ok('the count is the same on a later page', bkfServerQuery(BKF_STATE).overdrawnCount === trueOverdrawn);

/* rendered output: the label and the totals row must stop claiming "all accounts" */
reset({ over: true });
const filtHtml = bkfRender(15, 'm');
ok('the chip renders pressed when the filter is on', /aria-pressed="true"/.test(filtHtml));
ok('the chip label names what is being shown when pressed', /overdrawn only/.test(filtHtml));
/* Anchored on the chip's own element, not on a character distance: the aria-label
   is a full sentence, so a 400-character window fell short of the trailing glyph. */
const chipOn = (filtHtml.match(/<button class="bank-odchip on"[\s\S]*?<\/button>/) || [''])[0];
ok('the pressed chip offers a way to clear it', /close<\/span>/.test(chipOn), chipOn.slice(-90));
ok('the totals row stops claiming every account while filtered',
   /Total, \d+ overdrawn account/.test(filtHtml) && !/Total, all \d+ account/.test(filtHtml));
ok('the filter is announced in the live region', /filtered to overdrawn accounts only/.test(filtHtml));
reset();
const unfiltHtml = bkfRender(15, 'm');
ok('unpressed, the chip is a count and not a claim about the view', /aria-pressed="false"/.test(unfiltHtml) && !/overdrawn only/.test(unfiltHtml));
ok('unfiltered, the totals row does claim every account', /Total, all \d+ account/.test(unfiltHtml));

/* the handler: toggle, page reset, and cleared on the mode switch */
reset({ over: false, page: 4 });
fire('overdrawn');
ok('the overdrawn handler toggles the filter on', BKF_STATE.over === true);
ok('turning the filter on resets to page 1', BKF_STATE.page === 0);
fire('overdrawn');
ok('the overdrawn handler toggles back off', BKF_STATE.over === false);
reset({ over: true });
fire('set-acct', firstAcct);
ok('switching to Single Account mode clears the filter (it has no meaning there)', BKF_STATE.over === false);

/* the browser still does none of the filtering */
/* The subject is an indexed expression, bkfEnding(all[i]), which a [a-z]+ character
   class never matched, so this read as zero and looked like the filter was missing. */
const negTests = (w15Code.match(/bkfEnding\([^)]*\)\s*<\s*0/g) || []).length;
ok('the filter test exists in the code', negTests >= 1, negTests + ' negative-balance tests');
ok('no renderer filters the rows it was handed', !/rows\.filter\(/.test(w15Code) && !/res\.rows[\s\S]{0,40}\.filter\(/.test(w15Code));
ok('the only place rows are selected is the server stand-in',
   /var set=\[\];[\s\S]{0,300}set\.push/.test(w15Code));

reset();
ok('NOT rebuilt: a search box over the account table', !/<input/.test(allOutput) && !/dep-search/.test(allOutput) && !/tbl-search/.test(allOutput));
ok('NOT rebuilt: a per-account drill overlay',     !/modal/.test(allOutput) && !/data-bkf="drill"/.test(allOutput));
ok('NOT rebuilt: a pie or a donut, at any size',   !/donut/.test(allOutput) && !/pie-wrap/.test(allOutput) && !/<circle/.test(allOutput));
ok('NOT rebuilt: a Show filter',                   !/Balance Only/.test(allOutput) && !/Reconciliation Only/.test(allOutput));
ok('NOT rebuilt: a SELECTED marker (W11 convention)', !/SELECTED/.test(allOutput));
ok('NOT rebuilt: a footnote or gap-notes panel (W11 convention)', !/footnote/i.test(allOutput) && !/gap-note/i.test(allOutput));
ok('no write, approval or status action anywhere', !/Approve|Reject|Submit|Save|Delete/.test(strip(allOutput)));

/* --- 4t. colour is never the only signal -------------------------------- */
reset({ view: 'table' });
let negFound = false, negSignalled = true;
for (let p = 0; p < q0.pageCount; p++) {
  reset({ page: p, view: 'table' });
  const r = bkfServerQuery(BKF_STATE), h = bkfRender(15, 'm');
  for (const row of r.rows) if (bkfEnding(row) < 0) {
    negFound = true;
    if (h.indexOf('bank-tag-over') < 0) negSignalled = false;
    if (strip(h).indexOf('Overdrawn') < 0) negSignalled = false;
  }
}
ok('the mock set contains overdrawn accounts, so the signal is exercised', negFound);
ok('an overdrawn balance carries the word Overdrawn, not colour alone', negSignalled);
reset({ view: 'bars' });
let bpage = -1;
for (let p = 0; p < q0.pageCount; p++) { reset({ page: p }); if (bkfServerQuery(BKF_STATE).rows.some(r => bkfEnding(r) < 0)) { bpage = p; break; } }
reset({ page: bpage, view: 'bars' });
const negBars = bkfRender(15, 'm');
ok('an overdrawn bar carries a warning glyph as well as its position', /bank-hb-warn/.test(negBars));
ok('the bar chart legend states in words which side of the zero axis means what', /grows right of the zero axis/.test(negBars) && /grows left of the zero axis/.test(negBars));
ok('the negative-balance gap is named where it bites, and only there', /Design settles it/.test(negBars));
reset({ page: 0, view: 'bars' });
const p0bars = bkfRender(15, 'm');
if (!bkfServerQuery({ page: 0, sort: BKF_DEFAULT_SORT, dataset: null }).rows.some(r => bkfEnding(r) < 0))
  ok('the gap line disappears on a page with no overdrawn account', !/Design settles it/.test(p0bars));
else pass++;
ok('the zero axis has a DECLARED colour (Jo\'s reads an undeclared --wn-500)',
   /\.bankf-root \.bank-hb-zero\{[^}]*background:var\(--wn-750\)/.test(widgetCss) && /--wn-750:#87827b/.test(widgetCss));
ok('no red on a bar or a fill (Styling Reference 8.2)',
   !/\.bank-hb-fill\.neg\{background:var\(--red/.test(widgetCss) && !/\.bank-col\.out \.bank-bar\{background:var\(--red/.test(widgetCss));

/* --- 4u. the mode change is ANNOUNCED ----------------------------------- */
reset();
const annAll = bkfRender(15, 'm');
reset({ acct: firstAcct });
const annOne = bkfRender(15, 'm');
ok('a polite live region announces All Accounts mode', /role="status" aria-live="polite"/.test(annAll) && /All Accounts mode\./.test(annAll));
ok('a polite live region announces Single Account mode by name', /role="status" aria-live="polite"/.test(annOne) && /Single Account mode\./.test(annOne) && annOne.indexOf(BKF_ACCOUNTS[0].nm) >= 0);

/* --- 4v. the two beginning-balance origins (rule 2) --------------------- */
const neverRec = BKF_ACCOUNTS.filter(x => !x.rec);
ok('the mock set contains never-reconciled accounts, so rule 2 is exercised', neverRec.length > 0, neverRec.length + ' accounts');
reset({ acct: neverRec[0].id });
const nrHtml = bkfRender(15, 'm');
ok('a never-reconciled account says its beginning balance is the opening balance', /never been reconciled/.test(nrHtml));
ok('a never-reconciled account is not an error state', !/data-kind="error"/.test(nrHtml));
reset({ acct: BKF_ACCOUNTS.find(x => x.rec).id });
ok('a reconciled account says its beginning balance came from the reconciliation', /ending balance of the last reconciliation/.test(bkfRender(15, 'm')));

/* --- 4w. the Account picker: full set, server order, no search ---------- */
reset();
const pop = bkfPopContent();
let popMissing = [];
for (const acc of BKF_ACCOUNTS) if (pop.indexOf('data-bkf="set-acct" data-v="' + acc.id + '"') < 0) popMissing.push(acc.id);
ok('the Account picker lists every account, not just a page', popMissing.length === 0, popMissing.slice(0, 3).join(','));
ok('the Account picker offers All Bank Accounts when more than one account exists', /data-v="all"/.test(pop) && /All Bank Accounts/.test(pop));
ok('the Account picker has no search input (section 11)', !/<input/.test(pop));
ok('the Account picker is in a capped scroller, usable at 50+ accounts', /class="menu-scroll"/.test(pop) && /max-height:300px/.test(widgetCss));
ok('the Account picker rows carry Jo\'s trailing balance', /class="bank-mi-bal/.test(pop));
const popNames = [...pop.matchAll(/<span class="mi-nm">([^<]+)</g)].map(x => x[1]).filter(n => n !== 'All Bank Accounts');
let popSorted = true; for (let i = 1; i < popNames.length; i++) if (popNames[i - 1].localeCompare(popNames[i]) > 0) popSorted = false;
ok('the Account picker is in the same server order as the table', popSorted && popNames.length === BKF_ACCOUNTS.length);

/* --- 4w-bis. the single-account organisation, section 3: "The All Bank Accounts
       option only appears when more than one active account exists." Tested against
       a one-row SUBSET of the existing mock set, so no data is invented for it. */
{
  const full = BKF_ACCOUNTS.slice();
  BKF_ACCOUNTS.length = 0; BKF_ACCOUNTS.push(full[0]);
  reset();
  const onePop = bkfPopContent();
  ok('with one account, the picker does not offer All Bank Accounts', !/data-v="all"/.test(onePop) && !/All Bank Accounts/.test(onePop));
  ok('with one account, the picker still lists that account', onePop.indexOf('data-v="' + full[0].id + '"') >= 0);
  ok('with one account, bkfHasAllOption is false', bkfHasAllOption(BKF_STATE) === false);
  for (const sz of SIZES) {
    const h = bkfRender(15, sz);
    ok('with one account, size ' + sz + ' still renders', typeof h === 'string' && h.length > 150 && !/data-kind="empty"/.test(h));
    if (h.indexOf('—') >= 0) ok('with one account, no em dash at size ' + sz, false); else pass++;
  }
  reset();
  ok('with one account, the chip does not claim an aggregate it cannot make', /The only active account/.test(bkfRender(15, 'm')));
  ok('with one account, there is no pager', !/bank-pager/.test(bkfRender(15, 'm')));
  reset({ acct: full[0].id });
  ok('with one account, selecting it still gives the seven row breakdown', (bkfRender(15, 'm').match(/scope="row"/g) || []).length === 7);
  BKF_ACCOUNTS.length = 0; for (const x of full) BKF_ACCOUNTS.push(x);
  reset();
  ok('the full mock set is restored after the single-account case', BKF_ACCOUNTS.length === full.length && bkfServerQuery(BKF_STATE).totalCount === full.length);
}

/* --- 4x. handlers actually run and change state ------------------------- */
function fire(attr, v) {
  const target = {
    getAttribute: k => (k === 'data-bkf' ? attr : (k === 'data-v' ? v : null)),
    closest: sel => (sel === '[data-bkf]' ? target : (sel === '.bankf-root' ? {} : null))
  };
  bkfOnClick({ target: { closest: sel => (sel === '[data-bkf]' ? target : null) } });
}
reset();
const before = renderCount;
fire('view', 'bars'); ok('the view handler switches presentation', BKF_STATE.view === 'bars');
fire('view', 'cards'); ok('the view handler switches presentation again', BKF_STATE.view === 'cards');
fire('set-acct', firstAcct); ok('the account handler switches mode', BKF_STATE.acct === firstAcct);
ok('switching mode resets the page index', BKF_STATE.page === 0);
fire('set-acct', BKF_ALL); ok('the account handler switches back to All Accounts', BKF_STATE.acct === BKF_ALL);
BKF_STATE.page = 0; fire('page-next'); ok('Next page advances', BKF_STATE.page === 1);
fire('page-prev'); ok('Previous page goes back', BKF_STATE.page === 0);
fire('page-prev'); ok('Previous page on page 1 does not go negative', BKF_STATE.page === 0);
BKF_STATE.page = q0.pageCount - 1; fire('page-next'); ok('Next page on the last page does not overrun', BKF_STATE.page === q0.pageCount - 1);

ok('every handled action re-rendered', renderCount > before);
ok('refresh preserves the Account selection (no render path writes acct)',
   !/BKF_STATE\.acct\s*=/.test(widgetCode.replace(/function bkfOnClick[\s\S]*/, '')));

/* --- 4y. EM DASH SWEEP over every mode x presentation x size ------------ */
let dashHits = [];
for (const sz of SIZES) for (const v of VIEWS) for (const acct of [BKF_ALL, firstAcct, BKF_ACCOUNTS[18].id, 'gone']) {
  for (const ds of [null, 'none']) {
    reset({ view: v, acct, dataset: ds });
    const h = bkfRender(15, sz);
    if (h.indexOf('—') >= 0) dashHits.push('em dash: ' + sz + '/' + v + '/' + acct + '/' + ds);
    if (h.indexOf('–') >= 0) dashHits.push('en dash: ' + sz + '/' + v + '/' + acct + '/' + ds);
  }
}
BKF_STATE.acct = BKF_ALL; BKF_STATE.dataset = null;
const popSweep = bkfPopContent();
if (popSweep.indexOf('—') >= 0) dashHits.push('em dash: account picker');
if (popSweep.indexOf('–') >= 0) dashHits.push('en dash: account picker');
ok('no em or en dash in any rendered string, across ' + (SIZES.length * VIEWS.length * 4 * 2 + 1) + ' combinations', dashHits.length === 0, dashHits.slice(0, 4).join(' | '));
ok('the negative money glyph is Jo\'s U+2212 minus sign, not a hyphen', /−\$/.test(widgetCode));
reset(); ok('a negative figure actually renders with U+2212 on screen', bkfRender(15, 'l').indexOf('−$') >= 0 || bkfMoneyShort(-5).indexOf('−$') === 0);

/* --- 4z. the Final Check card chrome is really in F mode ---------------- */
ok('the fc-widget-15 block carries the two-span fc-szhd pattern', (fcBlock.match(/fc-szhd-abc/g) || []).length >= 4 && (fcBlock.match(/fc-szhd-f/g) || []).length >= 4);
ok('the fc-widget-15 block names Glance, Explore and Detail', /fc-szhd-f">Glance</.test(fcBlock) && /fc-szhd-f">Explore</.test(fcBlock) && /fc-szhd-f">Detail</.test(fcBlock));
ok('the fc-widget-15 block has a design-option switch defaulting to Final (v2)', /fc-optsw-15/.test(fcBlock) && /data-fc-opt="F"[^>]*>Final \(v2\)</.test(fcBlock));
ok('the fc-widget-15 block no longer claims Single Account mode is not built', fcBlock.indexOf("isn't built") < 0);
ok('the fc-widget-15 block no longer says Balance Cards is the card title', fcBlock.indexOf('<div class="opt-t">Balance Cards</div>') < 0);
/* Count inside the <style> block only. Counting across the whole document also
   counts the selector where it is merely NAMED in a comment, and the FC_VERSION[15]
   changelog names it while explaining that this widget once had none. That is the
   same class of mistake as reading a token out of a CSS comment. */
const styleOnly = src.slice(src.indexOf('<style>'), src.indexOf('</style>', src.indexOf('<style>')));
const fmodeRules = (styleOnly.match(/#fc-widget-15\.fc-fmode/g) || []).length;
ok('there are 9 #fc-widget-15.fc-fmode rules, matching W10 and W16', fmodeRules === 9, 'found ' + fmodeRules);
ok('the Detail card spans the full grid width (the W11 sideways-scroll bug)', /#fc-widget-15\.fc-fmode \.opt\.sz-l\{grid-column:1\/-1/.test(src));
ok('the Small card and the Small size buttons hide in F mode', /#fc-widget-15\.fc-fmode #fc-opt-15-s\{display:none/.test(src) && /#fc-widget-15\.fc-fmode \.wc-sz-btn\[data-fc-sz="s"\]\{display:none/.test(src));
ok('the abc and f size headings never render at once', /#fc-widget-15 \.fc-szhd-f\{display:none/.test(src) && /#fc-widget-15\.fc-fmode \.fc-szhd-f\{display:inline/.test(src) && /#fc-widget-15\.fc-fmode \.fc-szhd-abc\{display:none/.test(src));
ok('WRENDER[15] dispatches opt F to bkfRender', /if\(opt==='F'\) return bkfRender\(wid,sz\);/.test(wrenderHead));
ok('fcInitState(15) defaults to F', /fcInitState\(15,'F'\);/.test(src));
ok('the A/B/C branches are still present and untouched', /if\(opt==='A'\)\{/.test(src.slice(wa, wa + 6000)) && /if\(opt==='B'\)\{/.test(src.slice(wa, wa + 8000)));
/* comments are stripped before these two, because both are about EXECUTABLE code:
   the block's own prose legitimately names MOCK_DATA and the discarded prefix in
   order to say they are not used, and FC_VERSION carries dated historical notes
   about the old port which are never rewritten. */
const codeOnly = s => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
ok('MOCK_DATA.series[15] is untouched by this build (the F data is BKF_ constants)',
   !/MOCK_DATA/.test(codeOnly(widgetCode)) && /var BKF_ACCOUNTS=\[/.test(widgetCode));
const scriptCode = codeOnly([...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n'));
ok('no executable residue of the discarded bankF / BANKF_ port',
   (scriptCode.match(/\bbankF[A-Za-z0-9_]*\s*[(=]/g) || []).length === 0 && (scriptCode.match(/\bBANKF_/g) || []).length === 0);
/* the discarded port declared 369 .bankf-root selectors. Every .bankf-root selector
   now in the stylesheet must be inside the rebuilt block, or some of that port's CSS
   survived and is still competing with these rules. */
{
  const s0 = src.indexOf('<style>'), s1 = src.indexOf('</style>');
  const styleBlock = src.slice(s0, s1);
  ok('every .bankf-root selector in the stylesheet is inside the rebuilt block',
     (styleBlock.match(/\.bankf-root/g) || []).length === (widgetCss.match(/\.bankf-root/g) || []).length,
     (styleBlock.match(/\.bankf-root/g) || []).length + ' in stylesheet vs ' + (widgetCss.match(/\.bankf-root/g) || []).length + ' in block');
  ok('no .bkf-root selectors survive from the interrupted intermediate draft', !/\.bkf-root/.test(src));
}

/* the request shape the server stand-in models must be written down */
ok('the modelled request shape is documented in the block',
   /GET \/api\/dashboard\/bank-balances\/accounts\?page=\{n\}&pageSize=\{N\}&sortBy=\{key\}&sortDir=\{asc\|desc\}/.test(widgetCode));
ok('the single-account request shape is documented too',
   /GET \/api\/dashboard\/bank-balances\/accounts\/\{accountId\}\/activity/.test(widgetCode));

/* ---------- 5. REPORT ---------------------------------------------------- */
console.log('');
console.log('=== W15 Bank Balances, Final (bkF): DOM-shim driver ===');
console.log('extracted from: ' + FILE);
console.log('  bkF JS block:      ' + widgetCode.length + ' chars');
console.log('  .bankf-root CSS:   ' + widgetCss.length + ' chars');
console.log('  fc-widget-15 block:' + fcBlock.length + ' chars');
console.log('');
if (failures.length) { console.log('FAILURES:'); for (const f of failures) console.log('  [FAIL] ' + f); console.log(''); }
console.log((fail ? 'FAIL' : 'PASS') + ' -- ' + pass + ' passed, ' + fail + ' failed, ' + (pass + fail) + ' assertions');
process.exit(fail ? 1 : 0);
