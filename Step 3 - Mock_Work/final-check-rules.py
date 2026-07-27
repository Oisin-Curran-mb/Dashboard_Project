#!/usr/bin/env python3
"""
final-check-rules.py -- verification pass for ONE widget's Final Check build in
Dashboard Widget Mockups.html, plus an optional whole-file cleanup scan.

This is the companion to check-rules.py, NOT a replacement for it:
- check-rules.py lints the Dashboard tab's design-option work (rules T1/T4/T6/T9).
- this script verifies a widget's FINAL version: the fc-widget-N section, its
  WRENDER[N] render, its mock data, and its agreement with the widget's
  Step 4 - Widget Final Design doc.

The checks are adapted from Jo Lopez's widget-verification method (execute and
inspect the real code, never trust prose) combined with this project's own
upgraded Step 4 template (Data Contract / Widget States / Sign-off Readiness).

Usage:
    python3 final-check-rules.py "Dashboard Widget Mockups.html" --widget 7
    python3 final-check-rules.py "Dashboard Widget Mockups.html" --widget 5 \
        --step4 "../Step 4 - Widget Final Design/W05 - Receivable Invoices Outstanding.md"
    python3 final-check-rules.py "Dashboard Widget Mockups.html" --cleanup

Checks (per widget):
  F1  completeness   HIGH  fc-widget-N section, closing comment, WRENDER[N],
                           MOCK_DATA.series[N] all present; notes whether a
                           final branch (opt==='F') exists yet.
  F2  syntax gate    HIGH  every <script> block passes `node --check`.
  F3  doc-vs-code    MED   every View subsection and Filter named in the
                           Step 4 doc appears somewhere in the widget's
                           region (needs --step4).
  F4  values-in-DOM  MED   charts (svg/canvas markup) without sr-only /
                           aria-label / visible text values nearby.
  F5  colour-only    LOW   pos/neg colour signals with no adjacent +/- or
                           arrow character (colour must never be the only
                           signal).
  F6  fixed dates    MED   literal month-year date strings in presets
                           (date presets must be relative concepts).
  F7  em-dash sweep  MED   em dashes in the widget region's strings
                           (never in user-facing text).
  F8  empty-state    LOW   WRENDER[N] has no visible empty-data guard.
  F9  sign-off gate  HIGH  Step 4 doc's Sign-off Readiness table has a row
                           marked as blocking build (needs --step4).

Cleanup mode (--cleanup, whole file):
  C1  fc section with no WRENDER function (broken tab)         HIGH
  C2  WRENDER with no fc section (dashboard-only; normal for
      W8/W12/W14-style widgets, reported as INFO)              INFO
  C3  MOCK_DATA.series/options entries with no WRENDER          MED
  C4  fc-widget open marker with no matching closing comment    HIGH

Exit code: 1 if any HIGH finding, else 0. Read the printed report either way;
MED/LOW never affect the exit code.

What this deliberately does NOT do: execute the render interactively. The
per-widget Node DOM-shim driver (asserting clicks/toggles/filters actually
work) is generated per widget by the build-final-widget skill -- see that
skill's instructions. This script is the static gate that runs before and
after the driver.
"""
import argparse
import os
import re
import subprocess
import sys
import tempfile

EM_DASH = '—'
HIGH, MED, LOW, INFO = 'HIGH', 'MED', 'LOW', 'INFO'

MONTHS = ('January|February|March|April|May|June|July|August|September|'
          'October|November|December')
FIXED_DATE_RE = re.compile(
    r'(?:End of|Start of|Beginning of)?\s*(?:' + MONTHS + r')\s+20\d\d', re.I)
POSNEG_HEX = ['#36a14f', '#b03a3a', '#e53935', '#2e7d32', '#43a047', '#c62828']
SIGN_CHARS = ['▲', '▼', '↑', '↓', '+', '−', '-']


def load(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def find_matching_brace_end(text, func_start):
    first = text.find('{', func_start)
    if first == -1:
        return None
    depth = 0
    for i in range(first, len(text)):
        c = text[i]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return i + 1
    return None


def extract_wrender(html, n):
    m = re.search(r'WRENDER\[' + str(n) + r'\]\s*=\s*function', html)
    if not m:
        return None
    end = find_matching_brace_end(html, m.start())
    return html[m.start():end] if end else None


def extract_fc_section(html, n):
    start = html.find('id="fc-widget-%d"' % n)
    if start == -1:
        return None, False
    close = html.find('<!-- /fc-widget-%d -->' % n, start)
    if close == -1:
        return html[start:start + 20000], False
    return html[start:close], True


def string_literals(js):
    """Crude but effective: contents of '...' and "..." literals in JS."""
    out = []
    for m in re.finditer(r"'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"", js):
        out.append(m.group(1) if m.group(1) is not None else m.group(2))
    return out


# ---------------------------------------------------------------- per-widget
def check_f1_completeness(html, n, findings):
    fc, closed = extract_fc_section(html, n)
    wr = extract_wrender(html, n)
    if fc is None:
        findings.append((HIGH, 'F1', 'No fc-widget-%d section in the Final '
                         'Check tab. The final build for this widget does not '
                         'exist yet.' % n))
    elif not closed:
        findings.append((HIGH, 'F1', 'fc-widget-%d has no closing '
                         '<!-- /fc-widget-%d --> comment; section boundary is '
                         'broken (other tools rely on it).' % (n, n)))
    if wr is None:
        findings.append((HIGH, 'F1', 'No WRENDER[%d] function found -- the '
                         'widget cannot render at all.' % n))
    if not re.search(r'MOCK_DATA\.series\[' + str(n) + r'\]', html):
        findings.append((HIGH, 'F1', 'No MOCK_DATA.series[%d] entry -- the '
                         'widget has no data to render.' % n))
    if wr and "opt==='F'" not in wr.replace(' ', '').replace('"', "'"):
        findings.append((INFO, 'F1', "WRENDER[%d] has no final branch "
                         "(opt==='F') yet -- the Final Check tab is still "
                         "rendering a design option, not a composed final "
                         "version." % n))
    return fc, wr


def check_f2_syntax(html, findings):
    scripts = re.findall(r'<script[^>]*>([\s\S]*?)</script>', html)
    ok = True
    for i, body in enumerate(scripts):
        if not body.strip() or 'src=' in body[:100]:
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False,
                                         encoding='utf-8') as tf:
            tf.write(body)
            tmp = tf.name
        try:
            r = subprocess.run(['node', '--check', tmp],
                               capture_output=True, text=True, timeout=60)
            if r.returncode != 0:
                ok = False
                findings.append((HIGH, 'F2', 'Script block %d fails node '
                                 '--check: %s' % (i + 1,
                                 (r.stderr or '').strip()[:300])))
        except FileNotFoundError:
            findings.append((INFO, 'F2', 'node not available on this machine; '
                             'syntax gate skipped. Run it where node exists.'))
            return
        except subprocess.TimeoutExpired:
            findings.append((MED, 'F2', 'node --check timed out on script '
                             'block %d.' % (i + 1)))
        finally:
            os.unlink(tmp)
    if ok:
        findings.append((INFO, 'F2', 'All script blocks pass node --check.'))


def parse_step4(step4_path):
    doc = load(step4_path)
    views = re.findall(r'^###\s+(?:View\s*\d+\s*[-—:]*\s*)?(.+)$',
                       _section(doc, 'Views'), re.M)
    views = [re.sub(r'\s*\*\(.*?\)\*?\s*$', '', v).strip().strip('*`').strip()
             for v in views if v.strip()]
    NOT_VIEWS = ('size behaviour', 'size behavior', 'overflow', 'notes')
    views = [v for v in views if v.lower() not in NOT_VIEWS]
    filters = []
    for row in _section(doc, 'Filters').splitlines():
        cells = [c.strip().strip('*`') for c in row.strip().strip('|').split('|')]
        if len(cells) >= 2 and cells[0] and not set(cells[0]) <= {'-', ' ', ':'}:
            if cells[0].lower() not in ('filter', 'filter name', 'name'):
                filters.append(cells[0])
    blocks = []
    for row in _section(doc, 'Sign-off Readiness').splitlines():
        cells = [c.strip() for c in row.strip().strip('|').split('|')]
        if len(cells) >= 3 and cells[0] and not set(cells[0]) <= {'-', ' ', ':'}:
            last = cells[-1].lower()
            if 'yes' in last and 'block' not in cells[0].lower():
                blocks.append(' | '.join(cells[:2])[:120])
    return views, filters, blocks


def _section(doc, name):
    m = re.search(r'^##\s+.*' + re.escape(name) + r'.*$', doc, re.M)
    if not m:
        return ''
    rest = doc[m.end():]
    nxt = re.search(r'^##\s+', rest, re.M)
    return rest[:nxt.start()] if nxt else rest


def check_f3_doc_vs_code(region, views, filters, findings):
    for v in views:
        key = re.sub(r'[^A-Za-z ]', '', v).strip()
        if key and key.lower() not in region.lower():
            findings.append((MED, 'F3', 'View "%s" is named in the Step 4 doc '
                             'but its name appears nowhere in the widget\'s '
                             'code/markup region. Verify it is actually built '
                             '(name match is a heuristic; confirm by eye '
                             'before treating as missing).' % v))
    for f in filters:
        key = re.sub(r'[^A-Za-z ]', '', f).strip()
        if key and key.lower() not in region.lower():
            findings.append((MED, 'F3', 'Filter "%s" is in the Step 4 doc\'s '
                             'Filters table but not found in the widget '
                             'region.' % f))


def check_f4_values_in_dom(region, findings):
    has_chart = ('<svg' in region or 'canvas' in region.lower()
                 or 'chart' in region.lower())
    if has_chart and 'sr-only' not in region and 'aria-label' not in region:
        findings.append((MED, 'F4', 'Chart markup present but no sr-only text '
                         'or aria-label found in the widget region. Values '
                         'must exist in the DOM as text, not hover-only '
                         '(WCAG; a live-audit finding on the real product).'))


def check_f5_colour_only(region, findings):
    for hexv in POSNEG_HEX:
        for m in re.finditer(re.escape(hexv), region):
            ctx = region[max(0, m.start() - 200):m.end() + 200]
            if not any(s in ctx for s in SIGN_CHARS):
                findings.append((LOW, 'F5', 'Favourability colour %s used '
                                 'with no +/-/arrow character within 200 '
                                 'chars. Check colour is not the only '
                                 'signal.' % hexv))
                break


def check_f6_fixed_dates(region, findings):
    seen = set()
    for lit in string_literals(region):
        m = FIXED_DATE_RE.search(lit)
        if m and m.group(0) not in seen:
            seen.add(m.group(0))
            findings.append((MED, 'F6', 'Literal date "%s" in a string. Date '
                             'presets must be relative concepts (Today, End '
                             'of last month), computed from today.'
                             % m.group(0)))


def check_f7_em_dash(region, findings):
    hits = []
    for lit in string_literals(region):
        if EM_DASH in lit:
            hits.append(lit.strip()[:80])
    for h in hits[:10]:
        findings.append((MED, 'F7', 'Em dash in string: "%s..." -- no em '
                         'dashes in user-facing text; use commas, colons, '
                         'parentheses.' % h))
    if len(hits) > 10:
        findings.append((MED, 'F7', '...and %d more em-dash strings.'
                         % (len(hits) - 10)))


def check_f8_empty_state(wr, findings):
    if wr is None:
        return
    guards = ['length===0', 'length === 0', '.length?', '.length ?',
              '!rows', '!data', 'No data', 'no data', 'empty', 'Empty']
    if not any(g in wr for g in guards):
        findings.append((LOW, 'F8', 'No obvious empty-data guard in '
                         'WRENDER. Confirm the widget renders a clean empty '
                         'state (not a crash or a blank card) when its '
                         'series is empty -- the DOM-shim driver should '
                         'assert this.'))


def check_f9_signoff(blocks, findings):
    for b in blocks:
        findings.append((HIGH, 'F9', 'Step 4 Sign-off Readiness row marked '
                         'as BLOCKING BUILD: %s -- this widget is not '
                         'build-ready regardless of what the render looks '
                         'like. Settle the row or get it explicitly accepted '
                         'as a risk first.' % b))


# ------------------------------------------------------------------ cleanup
def cleanup_scan(html):
    findings = []
    fc_ids = set(int(x) for x in re.findall(r'id="fc-widget-(\d+)"', html))
    fc_closed = set(int(x) for x in
                    re.findall(r'<!-- /fc-widget-(\d+) -->', html))
    wrs = set(int(x) for x in
              re.findall(r'WRENDER\[(\d+)\]\s*=\s*function', html))
    series = set(int(x) for x in
                 re.findall(r'MOCK_DATA\.series\[(\d+)\]', html))
    for n in sorted(fc_ids - wrs):
        findings.append((HIGH, 'C1', 'fc-widget-%d exists but WRENDER[%d] '
                         'does not -- broken Final Check section.' % (n, n)))
    for n in sorted(wrs - fc_ids):
        findings.append((INFO, 'C2', 'WRENDER[%d] has no Final Check section '
                         '(dashboard-only widget; normal for out-of-scope '
                         'slots).' % n))
    for n in sorted(series - wrs):
        findings.append((MED, 'C3', 'MOCK_DATA.series[%d] exists but no '
                         'WRENDER[%d] -- orphaned data, candidate for '
                         'cleanup.' % (n, n)))
    for n in sorted(fc_ids - fc_closed):
        findings.append((HIGH, 'C4', 'fc-widget-%d has no closing comment '
                         'marker.' % n))
    return findings


# --------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('html')
    ap.add_argument('--widget', type=int)
    ap.add_argument('--step4', help='path to the widget\'s Step 4 doc')
    ap.add_argument('--cleanup', action='store_true')
    args = ap.parse_args()

    html = load(args.html)
    findings = []

    if args.cleanup:
        findings += cleanup_scan(html)
    if args.widget is not None:
        n = args.widget
        fc, wr = check_f1_completeness(html, n, findings)
        check_f2_syntax(html, findings)
        region = (fc or '') + '\n' + (wr or '')
        if args.step4:
            views, filters, blocks = parse_step4(args.step4)
            check_f3_doc_vs_code(region, views, filters, findings)
            check_f9_signoff(blocks, findings)
        else:
            findings.append((INFO, 'F3', 'No --step4 path given; doc-vs-code '
                             'and sign-off gate skipped. Pass the widget\'s '
                             'Step 4 doc for the full pass.'))
        check_f4_values_in_dom(region, findings)
        check_f5_colour_only(region, findings)
        check_f6_fixed_dates(region, findings)
        check_f7_em_dash(region, findings)
        check_f8_empty_state(wr, findings)
    if args.widget is None and not args.cleanup:
        print('Nothing to do: pass --widget N and/or --cleanup.')
        return 0

    order = {HIGH: 0, MED: 1, LOW: 2, INFO: 3}
    findings.sort(key=lambda f: order[f[0]])
    counts = {s: 0 for s in order}
    scope = ('widget %d' % args.widget) if args.widget is not None else ''
    if args.cleanup:
        scope = (scope + ' + cleanup').strip(' +')
    print('=== final-check-rules.py -- scope: %s ===' % scope)
    for sev, rule, msg in findings:
        counts[sev] += 1
        print('[%s] %s: %s' % (sev, rule, msg))
    print('--- %d HIGH, %d MED, %d LOW, %d INFO ---' % (
        counts[HIGH], counts[MED], counts[LOW], counts[INFO]))
    print('Reminder: this is the static gate. The per-widget DOM-shim driver '
          '(build-final-widget skill) is what proves interactions work.')
    return 1 if counts[HIGH] else 0


if __name__ == '__main__':
    sys.exit(main())
