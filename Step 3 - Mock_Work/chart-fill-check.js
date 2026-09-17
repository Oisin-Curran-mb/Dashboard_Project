/* chart-fill-check.js — measure whether a widget's chart actually fills its space.
 * ---------------------------------------------------------------------------------
 * WHY THIS EXISTS
 * Neither `node --check`, `final-check-rules.py`, nor the DOM-shim drivers can see
 * rendered geometry. Three real defects reached the owner this session because of
 * that gap: a stacked card grid (a selector that could never match), an unstyled
 * segmented control (a per-root rule that was never declared), and a chart using
 * under half its available width. All three were invisible to every existing gate
 * and obvious the moment anything measured pixels.
 *
 * THE KEY LESSON THIS SCRIPT ENCODES
 * Measuring a flex child's BOUNDING BOX tells you nothing about empty space, because
 * `flex:1` makes the box fill the row whatever its contents. The first two attempts at
 * this measurement both reported "0px empty" for a chart area that was visibly ~47%
 * blank. Only measuring TEXT INK — the union of every text node's client rects, via a
 * Range, plus the non-text dots — matched what the eye sees. Measure ink, not boxes.
 *
 * HOW TO RUN
 *   1. Serve the folder (the Chrome extension cannot script file:// URLs):
 *        cd "Step 3 - Mock_Work" && python -m http.server 8765
 *   2. Open http://localhost:8765/Dashboard%20Widget%20Mockups.html
 *   3. Final Check tab, click the widget in the left nav so its section is DISPLAYED.
 *      A hidden section measures 0 in every dimension and silently yields nonsense.
 *   4. Paste this file into the console, then call:
 *        chartFillCheck({ wid: 6, view: 'pie', chartSel: '.donut', legendSel: '.legend-col' })
 *
 * NOTE ON VIEWPORT vs CONTAINER
 * A widget's width is set by its CARD, not the browser window, and a maximized window
 * refuses programmatic resize. So this sweeps `.fc-content`'s max-width instead. That
 * also means any `@media (max-width: ...)` rule written against the VIEWPORT will not
 * fire during the sweep — which is itself the finding that such a rule is the wrong
 * mechanism for card-driven layout. `mediaFired` is reported so you can see it.
 */

function chartFillCheck(opts) {
  opts = opts || {};
  const wid       = opts.wid || 6;
  const view      = opts.view || 'pie';
  const chartSel  = opts.chartSel  || '.donut';
  const legendSel = opts.legendSel || '.legend-col';
  const wrapSel   = opts.wrapSel   || '.pie-wrap';
  const widths    = opts.widths    || [1400, 1100, 900, 760, 600];
  const slots     = opts.slots     || [['m', 'Explore'], ['l', 'Detail']];
  const stateVar  = opts.stateVar  || null;   // e.g. 'INSF_STATE'
  const viewKey   = opts.viewKey   || null;   // e.g. 'insView'

  const section = document.querySelector('#fc-widget-' + wid);
  if (!section) return 'No #fc-widget-' + wid + ' in the page.';
  if (getComputedStyle(section).display === 'none') {
    return 'ABORT: #fc-widget-' + wid + ' is display:none. Click it in the Final Check ' +
           'left nav first, or every measurement will read 0.';
  }

  // TRUE INK: union of text-node rects plus the legend dots. Never a flex box.
  function textInk(el) {
    if (!el) return 0;
    let min = Infinity, max = -Infinity;
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walk.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) {
        if (r.width) { min = Math.min(min, r.left); max = Math.max(max, r.right); }
      }
    }
    for (const d of el.querySelectorAll('.dot')) {
      const r = d.getBoundingClientRect();
      if (r.width) { min = Math.min(min, r.left); max = Math.max(max, r.right); }
    }
    return (max > min) ? Math.round(max - min) : 0;
  }

  const content = document.querySelector('.fc-content');
  const orig = content ? content.style.maxWidth : null;
  const rows = [];
  const findings = [];

  for (const cw of widths) {
    if (content) { content.style.maxWidth = cw + 'px'; void content.offsetWidth; }
    if (stateVar && viewKey && typeof window[stateVar] !== 'undefined') {
      window[stateVar][viewKey] = view;
    }
    if (typeof fcRenderWidget === 'function') fcRenderWidget(wid);

    const mediaFired = window.matchMedia('(max-width:900px)').matches;

    for (const [slot, label] of slots) {
      const body = document.querySelector('#fc-body-' + wid + '-' + slot);
      if (!body) continue;
      const wrap = body.querySelector(wrapSel);
      const chart = body.querySelector(chartSel);
      const legend = body.querySelector(legendSel);
      if (!wrap || !chart) continue;

      const cs = getComputedStyle(wrap);
      const contentW = Math.round(
        wrap.getBoundingClientRect().width -
        parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
      const chartW = Math.round(chart.getBoundingClientRect().width);
      const chartH = Math.round(chart.getBoundingClientRect().height);
      const legBox = legend ? Math.round(legend.getBoundingClientRect().width) : 0;
      const legInk = textInk(legend);
      const gap = parseFloat(cs.gap) || 0;

      // WRAP DETECTION. Once the legend wraps onto its own line, "content minus
      // (chart + gap + ink)" double-counts the row and reports fake negatives. The
      // first version of this script did exactly that and produced -138% figures that
      // meant nothing. Compare vertical positions instead.
      const chartR = chart.getBoundingClientRect();
      const legR = legend ? legend.getBoundingClientRect() : null;
      const wrapped = !!(legR && legR.top >= chartR.bottom - 2);

      // Leftover measured as ACTUAL GUTTERS: distance from the content box edges to the
      // outermost ink. Leftover split evenly is balanced margin, not dead space; the
      // same leftover shoved onto one side is the defect the eye notices.
      const wrapRect = wrap.getBoundingClientRect();
      const cLeft = wrapRect.left + parseFloat(cs.paddingLeft);
      const cRight = wrapRect.right - parseFloat(cs.paddingRight);
      let inkL = Infinity, inkR = -Infinity;
      for (const el of [chart, legend]) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        if (el === legend) {
          // legend box stretches; use its text ink extent, not the box
          const w = legInk;
          inkL = Math.min(inkL, r.left);
          inkR = Math.max(inkR, r.left + w);
        } else {
          inkL = Math.min(inkL, r.left);
          inkR = Math.max(inkR, r.right);
        }
      }
      const gutterL = Math.round(inkL - cLeft);
      const gutterR = Math.round(cRight - inkR);
      const totalGutter = gutterL + gutterR;
      const lopsided = Math.abs(gutterL - gutterR);
      const emptyPct = contentW ? Math.round(totalGutter / contentW * 100) : 0;

      rows.push([cw, label, contentW, chartW, legBox, legInk,
                 gutterL + '/' + gutterR, emptyPct + '%',
                 chartW > contentW ? 'CLIPPED' : 'ok',
                 wrapped ? 'WRAPPED' : 'row',
                 mediaFired ? 'mq' : '-'].join(' | '));

      // thresholds. Leftover is only a defect when it is LOPSIDED, i.e. piled against
      // one edge; leftover shared evenly is just margin.
      if (emptyPct >= 25 && lopsided > contentW * 0.15) {
        findings.push('LOPSIDED: ' + label + ' at container ' + cw + 'px has gutters ' +
                      gutterL + 'px left vs ' + gutterR + 'px right (' + emptyPct +
                      '% total). The leftover is stacked on one side, not shared.');
      }
      if (emptyPct >= 45) {
        findings.push('WASTE: ' + label + ' at container ' + cw + 'px leaves ' + emptyPct +
                      '% of the chart area empty (gutters ' + gutterL + '/' + gutterR +
                      '). Chart ' + chartW + 'px, legend ink ' + legInk + 'px.');
      }
      // labels with no room: only meaningful while side by side
      if (!wrapped && legend && legBox < legInk - 2) {
        findings.push('TRUNCATED: ' + label + ' at container ' + cw + 'px, legend box is ' +
                      legBox + 'px but its text needs ' + legInk + 'px, so plan names clip.');
      }
      if (chartW > contentW) {
        findings.push('CLIPPED: ' + label + ' at container ' + cw + 'px, chart ' + chartW +
                      'px exceeds ' + contentW + 'px of content width.');
      }
      if (Math.abs(chartW - chartH) > 2) {
        findings.push('NOT SQUARE: ' + label + ' at ' + cw + 'px, ' + chartW + 'x' + chartH + '.');
      }
    }
  }

  if (content) { content.style.maxWidth = orig; void content.offsetWidth; }
  if (typeof fcRenderWidget === 'function') fcRenderWidget(wid);

  const header = 'container | tier | content | chart | legendBOX | legendINK | empty | empty% | clip | dir | mq';
  return [header, ...rows, '',
          findings.length ? 'FINDINGS (' + findings.length + '):' : 'FINDINGS: none',
          ...findings.map(f => '  - ' + f)].join('\n');
}

/* W06's invocation, for convenience:
     chartFillCheck({ wid:6, view:'pie', stateVar:'INSF_STATE', viewKey:'insView' })
*/
