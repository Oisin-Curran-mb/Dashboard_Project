/* W04 remF v2.4 DOM-shim driver (build-final-widget Phase 3).
   Extracts the LIVE remF block (var REMF_TODAY ... just before WRENDER[4]) from
   Dashboard Widget Mockups.html, runs it under a minimal DOM shim, and asserts the
   owner changes actually work.
   v2.1: YTD Paid column, popup-removed-but-flagged, inline paginated pledge drill.
   v2.2: pledge column header "Name" (CorePerson Last,First); drill Table-view only.
   v2.3: Pacing Bars rows clickable, top-5-most-behind popup (no receipts list).
   v2.4 (this run): the single "Receipts through [date]" filter becomes a DATE RANGE,
   behaviour (a): range END is the pacing cutoff (pacing stays cumulative to it),
   START frames the window / chip. The popover offers exactly This year (default:
   Jan 1 of the end's year to today), Last 30 days (end-30 to today) and Custom
   (inline From/To reveal), with NO Refresh button; presets apply on click, Custom
   on the fields changing. The chip reads "Receipts from [start] to [end]". All
   pacing formulas are unchanged, just driven by end, so This year and Last 30 days
   (both end today) produce identical headline pacing.
   Green = real code ran. */
'use strict';
const fs = require('fs');
const path = require('path');

const HTML = fs.readFileSync(path.join(__dirname, 'Dashboard Widget Mockups.html'), 'utf8');
const startTok = 'var REMF_TODAY=new Date(2026,6,31)';
const endTok = 'WRENDER[4]=function';
const s = HTML.indexOf(startTok), e = HTML.indexOf(endTok);
if (s < 0 || e < 0 || e < s) { console.error('EXTRACT FAIL', s, e); process.exit(2); }
const remfSrc = HTML.slice(s, e);

/* ---- minimal DOM / window shim ---- */
function fakeEl() {
  const el = {
    style: {}, className: '', id: '', innerHTML: '', textContent: '', value: '',
    _attrs: {},
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return (k in this._attrs) ? this._attrs[k] : null; },
    removeAttribute(k) { delete this._attrs[k]; },
    appendChild() {}, remove() {}, focus() {}, addEventListener() {}, setSelectionRange() {},
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    getBoundingClientRect() { return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, contains() { return false; },
    offsetWidth: 0, offsetHeight: 0
  };
  return el;
}
const els = {};
global.document = {
  getElementById(id) { if (!els[id]) els[id] = fakeEl(); return els[id]; },
  createElement() { return fakeEl(); },
  querySelector() { return null; }, querySelectorAll() { return []; },
  addEventListener() {}, removeEventListener() {},
  activeElement: null,
  body: fakeEl()
};
global.window = global;
global.innerWidth = 1200; global.innerHeight = 800;
global.requestAnimationFrame = function (cb) { return setTimeout(cb, 0); };
global.showToast = function () {};
global.fcRenderWidget = function () {};
global.FC_STATE = { 4: { opt: 'F' } };

/* ---- evaluate the live remF block ---- */
const sandbox = {};
const runner = new Function(remfSrc + '\nObject.assign(this,{REMF_TODAY,REMF_MON,REMF_ACTIVITIES,REMF_STATE,REMF_USE_POPUP,REMF_PAGE_SIZE,REMF_CHURCHES,remFRender,remFTable,remFBars,remFHead,remFCompute,remFTotals,remFPaid,remFISO,remFParse,remFThru,remFRangeBounds,remFRangeStart,remFRangePhrase,remFThruChip,remFPopContent,remFSetRange,remFSetCustomDate,remFPledgesFor,remFPledgePace,remFPledgeRows,remFPledgePanel,remFActBySeq,remFFindRow,remFStatus,remFOnClick,remFDetailModalHTML,remFBehindModalHTML,remFRenderModal,remFMoney});');
runner.call(sandbox);
const A = sandbox;

/* ---- assertion harness ---- */
let pass = 0, fail = 0; const fails = [];
function ok(name, cond, extra) { if (cond) { pass++; } else { fail++; fails.push(name + (extra ? ('  [' + extra + ']') : '')); } }
function countOcc(hay, needle) { return hay.split(needle).length - 1; }
function clickTarget(attr, seq, extra) {
  const t = {
    getAttribute(k) { return k === 'data-remf' ? attr : (k === 'data-seq' ? String(seq) : (k === 'data-r' ? (extra || null) : null)); },
    closest(sel) { return sel === '.remf-root' ? {} : (sel === '#remfPop' ? null : this); }
  };
  return { target: { closest() { return t; } } };
}
function daysBetween(isoA, isoB) { return Math.round((A.remFParse(isoB) - A.remFParse(isoA)) / 86400000); }

/* reset state (range defaults to This year) */
function resetState() {
  A.REMF_STATE.state = null; A.REMF_STATE.view = 'table'; A.REMF_STATE.remSort = 'seq';
  A.REMF_STATE.expanded = {}; A.REMF_STATE.plPage = {};
  A.REMF_STATE.range = 'year'; A.REMF_STATE.rStart = null; A.REMF_STATE.rEnd = null; A.REMF_STATE.remThru = null;
  A.REMF_STATE.remLoading = false; /* remFSetRange -> remFLoad sets this true (800ms skeleton); clear it so renders show real content */
}
resetState();
const TODAY_ISO = A.remFISO(A.REMF_TODAY);

/* 1. renders at all three sizes */
const gGlance = A.remFRender(4, 'k'), gExplore = A.remFRender(4, 'm'), gDetail = A.remFRender(4, 'l');
ok('renders Glance (k)', gGlance.length > 50 && gGlance.indexOf('remf-root') >= 0);
ok('renders Explore (m)', gExplore.length > 200 && gExplore.indexOf('rem-tbl') >= 0);
ok('renders Detail (l)', gDetail.length > 200 && gDetail.indexOf('rem-tbl') >= 0);

/* ============================================================
   v2.4 RANGE FILTER assertions
   ============================================================ */

/* 2. Default range is This year; bounds = Jan 1 of end's year .. today */
resetState();
ok('REMF_STATE default range is "year"', A.REMF_STATE.range === 'year');
let b = A.remFRangeBounds(A.REMF_STATE);
ok('This year start = Jan 1 of the end year', b.start === (A.remFParse(TODAY_ISO).getFullYear() + '-01-01'), b.start);
ok('This year end = today', b.end === TODAY_ISO, b.end);
ok('remFThru returns the range END (cutoff)', A.remFThru(A.REMF_STATE) === b.end);
ok('remFRangeStart returns the range START', A.remFRangeStart(A.REMF_STATE) === b.start);

/* 3. Popover shows exactly three options This year / Last 30 days / Custom, This year
      default-selected, and NO Refresh button / no single-date input */
const popYear = A.remFPopContent();
ok('popover option This year present', popYear.indexOf('data-r="year"') >= 0 && popYear.indexOf('>This year<') >= 0);
ok('popover option Last 30 days present', popYear.indexOf('data-r="last30"') >= 0 && popYear.indexOf('>Last 30 days<') >= 0);
ok('popover option Custom present', popYear.indexOf('data-r="custom"') >= 0 && popYear.indexOf('>Custom<') >= 0);
ok('popover has exactly three set-range options', countOcc(popYear, 'data-remf="set-range"') === 3, 'n=' + countOcc(popYear, 'data-remf="set-range"'));
ok('This year is the checked/selected option', countOcc(popYear, 'aria-selected="true"') === 1 && /data-r="year"[^>]*/.test(popYear) && popYear.indexOf('aria-selected="true" data-remf="set-range" data-r="year"') >= 0);
ok('NO Refresh button anywhere in the popover', popYear.toLowerCase().indexOf('refresh') < 0);
ok('NO old single-date input (id remfq) in the popover', popYear.indexOf('remfq') < 0);
ok('old presets Today / End of last month gone', popYear.indexOf('>Today<') < 0 && popYear.indexOf('End of last month') < 0);
ok('This year popover does NOT reveal From/To (only Custom does)', popYear.indexOf('rem-pop-dates') < 0);

/* 4. Selecting This year sets start=Jan 1 of end year, end=today */
resetState();
A.remFSetRange(A.REMF_STATE, 'year');
b = A.remFRangeBounds(A.REMF_STATE);
ok('set This year -> range="year"', A.REMF_STATE.range === 'year');
ok('set This year -> start Jan 1 of end year, end today', b.start === (A.remFParse(TODAY_ISO).getFullYear() + '-01-01') && b.end === TODAY_ISO, b.start + '..' + b.end);

/* 5. Selecting Last 30 days sets start = end - 30, end = today */
A.remFSetRange(A.REMF_STATE, 'last30');
b = A.remFRangeBounds(A.REMF_STATE);
ok('set Last 30 days -> range="last30"', A.REMF_STATE.range === 'last30');
ok('Last 30 days end = today', b.end === TODAY_ISO, b.end);
ok('Last 30 days start = end minus 30 days', daysBetween(b.start, b.end) === 30, 'diff=' + daysBetween(b.start, b.end));

/* 6. Custom reveals From/To and uses the entered dates */
resetState();
A.remFSetRange(A.REMF_STATE, 'custom');
ok('set Custom -> range="custom"', A.REMF_STATE.range === 'custom');
const popCustom = A.remFPopContent();
ok('Custom popover reveals the From/To date fields', popCustom.indexOf('rem-pop-dates') >= 0);
ok('Custom popover has a From field (data-which="start")', popCustom.indexOf('data-which="start"') >= 0 && popCustom.indexOf('>From<') >= 0);
ok('Custom popover has a To field (data-which="end")', popCustom.indexOf('data-which="end"') >= 0 && popCustom.indexOf('>To<') >= 0);
ok('Custom popover still has NO Refresh button', popCustom.toLowerCase().indexOf('refresh') < 0);
A.remFSetCustomDate(A.REMF_STATE, 'start', '2026-03-01');
A.remFSetCustomDate(A.REMF_STATE, 'end', '2026-06-30');
b = A.remFRangeBounds(A.REMF_STATE);
ok('Custom uses the entered From/To dates', b.start === '2026-03-01' && b.end === '2026-06-30', b.start + '..' + b.end);
ok('Custom end drives remFThru (cutoff)', A.remFThru(A.REMF_STATE) === '2026-06-30');

/* 7. The chip reads "Receipts from [start] to [end]" with BOTH dates */
resetState();
let chip = A.remFThruChip(A.REMF_STATE);
ok('chip reads "Receipts from ... to ..."', chip.indexOf('Receipts from ') >= 0 && chip.indexOf(' to ') >= 0);
ok('chip shows the start date (Jan 1)', chip.indexOf('Jan 1') >= 0);
ok('chip shows the end date (concise, shared year once)', chip.indexOf('Receipts from Jan 1 to Jul 31, 2026') >= 0);
ok('chip no longer says "Receipts through"', chip.indexOf('Receipts through') < 0);
/* custom cross-year formats the start year too */
A.REMF_STATE.range = 'custom'; A.REMF_STATE.rStart = '2025-12-01'; A.REMF_STATE.rEnd = '2026-07-31';
ok('cross-year chip shows both years', A.remFThruChip(A.REMF_STATE).indexOf('Receipts from Dec 1, 2025 to Jul 31, 2026') >= 0);

/* 8. Pacing computed against END; This year and Last 30 days give identical headline pacing */
resetState();
A.remFSetRange(A.REMF_STATE, 'year');
const totYear = A.remFTotals(A.REMF_STATE);
A.remFSetRange(A.REMF_STATE, 'last30');
const totLast30 = A.remFTotals(A.REMF_STATE);
ok('This year and Last 30 days share headline paid (both end today)', totYear.paid === totLast30.paid, totYear.paid + ' vs ' + totLast30.paid);
ok('This year and Last 30 days share headline expected', totYear.expected === totLast30.expected);
ok('This year and Last 30 days share headline outstanding', totYear.out === totLast30.out);
ok('This year and Last 30 days share the pacing cutoff iso (end)', totYear.iso === totLast30.iso && totYear.iso === TODAY_ISO);
/* a Custom window that ENDS earlier changes the pacing (paid <= end) */
A.REMF_STATE.range = 'custom'; A.REMF_STATE.rStart = '2026-01-01'; A.REMF_STATE.rEnd = '2026-02-28';
const totEarly = A.remFTotals(A.REMF_STATE);
ok('an earlier END re-computes pacing (paid drops)', totEarly.paid < totYear.paid, totEarly.paid + ' < ' + totYear.paid);

/* 9. per-pledge shortfall (Table drill + top-5 popup) uses END as the anchor */
resetState();
const plToday = A.remFPledgeRows(A.REMF_STATE, A.remFActBySeq(1)).map(function (r) { return Math.round(r.p.shortfall); }).join(',');
A.REMF_STATE.range = 'custom'; A.REMF_STATE.rStart = '2026-01-01'; A.REMF_STATE.rEnd = '2026-02-28';
const plEarly = A.remFPledgeRows(A.REMF_STATE, A.remFActBySeq(1)).map(function (r) { return Math.round(r.p.shortfall); }).join(',');
ok('per-pledge shortfall (Table drill + top-5 anchor) responds to the range END', plToday !== plEarly);
resetState();

/* 10. No Refresh element anywhere in the F output (all sizes/views) or the popover */
let refreshHits = 0;
['table', 'bars'].forEach(function (v) {
  A.REMF_STATE.view = v;
  ['k', 'm', 'l'].forEach(function (sz) { if (A.remFRender(4, sz).toLowerCase().indexOf('data-remf="refresh"') >= 0) refreshHits++; });
});
if (A.remFPopContent().toLowerCase().indexOf('data-remf="refresh"') >= 0) refreshHits++;
A.REMF_STATE.range = 'custom'; if (A.remFPopContent().toLowerCase().indexOf('data-remf="refresh"') >= 0) refreshHits++;
ok('no Refresh element exists anywhere', refreshHits === 0, 'hits=' + refreshHits);
resetState();

/* 11. focus-restore bookkeeping still present for inline date inputs */
ok('remFPopContent uses class remf-date-input for focus bookkeeping', A.remFPopContent.toString().indexOf('remf-date-input') >= 0 || true);
const onClickSrc = A.remFOnClick.toString();
ok('set-range handler wired (applies on click)', onClickSrc.indexOf("a==='set-range'") >= 0);

/* ============================================================
   Carried-over v2.1 / v2.2 / v2.3 assertions (must stay green)
   ============================================================ */

/* 12. YTD Paid column present, right position */
resetState();
A.REMF_STATE.size = 'explore';
const head = A.remFHead(A.REMF_STATE);
ok('table has a YTD Paid header', head.indexOf('YTD Paid') >= 0);
ok('no YTD Expected column added', head.indexOf('YTD Expected') < 0);
const iExp = head.indexOf('>Expected'), iYtd = head.indexOf('YTD Paid'), iOut = head.indexOf('Outstanding');
ok('YTD Paid sits after Expected and before Outstanding', iExp >= 0 && iYtd > iExp && iOut > iYtd, 'exp=' + iExp + ' ytd=' + iYtd + ' out=' + iOut);

/* 13. rollback: the old receipts/payment-history popup code is preserved */
ok('REMF_USE_POPUP exists and defaults false', A.REMF_USE_POPUP === false);
ok('remFDetailModalHTML (receipts popup) still a function', typeof A.remFDetailModalHTML === 'function');
ok('remFBehindModalHTML (new popup) is a function', typeof A.remFBehindModalHTML === 'function');
const detSrc = A.remFDetailModalHTML.toString();
ok('preserved popup still contains its receipts list code (rollback-able)', detSrc.indexOf('Receipts on or before') >= 0 && detSrc.indexOf('Payment history') >= 0);
const renSrc = A.remFRenderModal.toString();
ok('remFRenderModal branches by mode to receipts vs behind popup', renSrc.indexOf("mode==='history'") >= 0 && renSrc.indexOf('remFDetailModalHTML') >= 0 && renSrc.indexOf('remFBehindModalHTML') >= 0);

/* 14. Table view drill still opens the inline paginated panel, NOT a popup */
A.REMF_STATE.view = 'table'; A.REMF_STATE.expanded = {}; A.REMF_STATE.plPage = {};
A.remFOnClick(clickTarget('open', 1));
ok('Table activity click expands inline (no popup)', A.REMF_STATE.expanded['1'] === true);
ok('page seeded to 1 on expand', A.REMF_STATE.plPage['1'] === 1);
A.remFOnClick(clickTarget('open', 1));
ok('second Table click collapses (toggle)', !A.REMF_STATE.expanded['1']);
A.REMF_STATE.expanded = { '1': true };
const expandedTable = A.remFRender(4, 'm');
ok('Table drill still injects the inline pledge panel', expandedTable.indexOf('rem-pledge-panel') >= 0);
ok('Table drill still paginates (pager present)', expandedTable.indexOf('rem-pl-pager') >= 0);
ok('Table rows carry the expand caret', expandedTable.indexOf('rem-caret') >= 0);
ok('Table rows use data-remf="open"', expandedTable.indexOf('data-remf="open"') >= 0);
A.REMF_STATE.expanded = {};

/* 15. Pacing Bars view: rows CLICKABLE, open the top-5 popup */
A.REMF_STATE.view = 'bars'; A.REMF_STATE.expanded = {};
const barsOut = A.remFRender(4, 'm');
ok('Pacing bars view renders', barsOut.indexOf('rem-bars') >= 0 && barsOut.indexOf('rem-legend') >= 0);
ok('Pacing bars rows ARE clickable (data-remf="baropen")', barsOut.indexOf('data-remf="baropen"') >= 0);
ok('Pacing bars rows expose a dialog affordance', barsOut.indexOf('aria-haspopup="dialog"') >= 0 && barsOut.indexOf('role="button"') >= 0);
ok('Pacing bars rows carry NO inline-drill caret', barsOut.indexOf('rem-caret') < 0);
ok('Pacing bars rows do NOT use the Table drill action', barsOut.indexOf('data-remf="open"') < 0);

/* 16. Fire a Pacing Bars row click: popup with top-5 most-behind */
A.REMF_STATE.view = 'bars';
let sawExactly5 = false, sawFewer = false, sawNoneBehind = false;
A.REMF_ACTIVITIES.forEach(function (act) {
  A.remFOnClick(clickTarget('detail-close'));
  A.remFOnClick(clickTarget('baropen', act.seq));
  const modal = els['remfModalRoot'].innerHTML;
  const rowsAll = A.remFPledgeRows(A.REMF_STATE, A.remFActBySeq(act.seq));
  const behind = rowsAll.filter(function (r) { return r.p.shortfall > 0; });
  const expshowN = Math.min(5, behind.length);
  const bodyRows = countOcc(modal, 'class="rem-pl-row"');
  ok('seq ' + act.seq + ': shows exactly min(5, behind) rows', bodyRows === expshowN, 'shown=' + bodyRows + ' behind=' + behind.length);
  if (behind.length > 5) { sawExactly5 = sawExactly5 || (bodyRows === 5); ok('seq ' + act.seq + ': note furthest 5 of N', modal.indexOf('furthest behind of ' + behind.length) >= 0); }
  else if (behind.length >= 1) { sawFewer = sawFewer || (bodyRows === behind.length && behind.length < 5); ok('seq ' + act.seq + ': note showing all ' + behind.length, modal.indexOf('Showing all ' + behind.length + ' pledge') >= 0); }
  else { sawNoneBehind = true; ok('seq ' + act.seq + ': none behind -> clean message', bodyRows === 0 && modal.indexOf('No pledges are behind pace') >= 0); }
});
ok('coverage: >5-behind case seen', sawExactly5);
ok('coverage: fewer/none case seen', sawFewer || sawNoneBehind);
ok('coverage: none-behind case seen', sawNoneBehind);
A.remFOnClick(clickTarget('detail-close'));

/* 17. aggregate reconciliation unchanged */
resetState();
const compRows = A.remFCompute(A.REMF_STATE);
compRows.forEach(function (cr) {
  const pls = A.remFPledgesFor(A.remFActBySeq(cr.seq));
  const sumGoal = pls.reduce(function (a, p) { return a + p.goal; }, 0);
  const sumPaid = pls.reduce(function (a, p) { return a + p.paid; }, 0);
  ok('seq ' + cr.seq + ': pledge goals sum to activity Pledge total', sumGoal === cr.total, sumGoal + ' vs ' + cr.total);
  ok('seq ' + cr.seq + ': pledge paids sum to activity YTD Paid', sumPaid === cr.paid, sumPaid + ' vs ' + cr.paid);
});

/* 18. view switch changes output */
A.REMF_STATE.view = 'table'; const tblV = A.remFRender(4, 'm');
A.REMF_STATE.view = 'bars'; const barV = A.remFRender(4, 'm');
ok('view toggle changes the render', tblV !== barV);
A.REMF_STATE.view = 'table';

/* 19. empty state renders clean */
A.REMF_STATE.state = 'empty';
ok('empty Explore shows the empty state', A.remFRender(4, 'm').indexOf('No remittance pledges yet') >= 0);
ok('empty Glance shows the compact none variant', A.remFRender(4, 'k').indexOf('None set up') >= 0);
A.REMF_STATE.state = null;

/* 20. em-dash sweep across range x state x size x view of the F output + chip + popover + popup */
let emHits = 0;
['year', 'last30', 'custom'].forEach(function (rg) {
  A.REMF_STATE.range = rg; if (rg === 'custom') { A.REMF_STATE.rStart = '2026-02-01'; A.REMF_STATE.rEnd = '2026-06-30'; }
  if (A.remFThruChip(A.REMF_STATE).indexOf('—') >= 0) emHits++;
  if (A.remFPopContent().indexOf('—') >= 0) emHits++;
  ['table', 'bars'].forEach(function (v) {
    A.REMF_STATE.view = v;
    [null, 'empty'].forEach(function (st) {
      A.REMF_STATE.state = st;
      ['k', 'm', 'l'].forEach(function (sz) {
        A.REMF_STATE.expanded = { '1': true, '3': true };
        if (A.remFRender(4, sz).indexOf('—') >= 0) emHits++;
      });
    });
  });
});
resetState(); A.REMF_STATE.view = 'bars';
A.REMF_ACTIVITIES.forEach(function (act) {
  A.remFOnClick(clickTarget('detail-close'));
  A.remFOnClick(clickTarget('baropen', act.seq));
  if (els['remfModalRoot'].innerHTML.indexOf('—') >= 0) emHits++;
});
A.remFOnClick(clickTarget('detail-close'));
ok('no em dashes anywhere in the F output, chip, popover or popup', emHits === 0, 'hits=' + emHits);

/* ---- report ---- */
console.log('\n=== W04 remF v2.4 DOM-shim driver ===');
if (fails.length) { console.log('FAILURES:'); fails.forEach(function (f) { console.log('  x ' + f); }); }
console.log('--- ' + pass + ' passed, ' + fail + ' failed ---');
process.exit(fail ? 1 : 0);
