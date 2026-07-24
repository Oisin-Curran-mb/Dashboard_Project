#!/usr/bin/env python3
"""
check-rules.py -- static scan of Dashboard Widget Mockups.html against
"Widget concepts/03 - Technical Build Rules & Definition of Done.md" (now
folded into Widget_Specs/General Widget Design Rules.md -- see this folder's
00 - INDEX.md for that history; the rule content below hasn't been re-verified
against that doc's current wording, so treat this as a lint pass, not the
rules themselves).

This is a lint pass, not a replacement for actually looking at the rendered
cards at all 5 sizes. It automates the checks that are reliably regex-
detectable (T1, T4, T6, T9) and prints reminders for the ones that require
judgment (T2, T3, T5, T8) so they don't get skipped.

Usage:
    python3 check-rules.py "Dashboard Widget Mockups.html"
    python3 check-rules.py "Dashboard Widget Mockups.html" --widget 10

With --widget N, findings are limited to widget N's own markup section
(id="ws-N"..next id="ws-M") and its WRENDER[N] function -- not the whole
file. This matters more than it might look: the entire dashboard markup body
for every widget lives on a single ~120,000-character line in this file, so
without --widget, a HIGH/MED finding's reported "line" number is shared by
every widget's markup and tells you nothing about which one actually has the
problem. Without --widget, this scans (and can flag) every widget in the
file, including ones you never touched.

Exit code reflects HIGH severity only: 0 = no HIGH findings, 1 = at least one
HIGH finding. MED and LOW findings do NOT affect the exit code -- a caller
that only checks the exit code will silently miss every MED finding (that
includes both T4 and T9, the two automated MED-severity rules). Read the
printed summary counts, don't rely on the exit code alone.
"""
import re
import sys

SHARED_CLASSES = ['kpis', 'hbars', 'hr', 'hl', 'ht', 'hf', 'hv',
                   'bars', 'bw', 'bl', 'bv', 'aleg', 'ali', 'asw', 'tbl']
LOW_CONTRAST_HEX = ['#aaa', '#aaaaaa', '#ccc', '#cccccc', '#ddd', '#dddddd',
                     '#e8e8e8', '#eee', '#eeeeee', '#f0f0f0']
AXIS_KEYWORDS = ['axis', 'grid', 'scale', 'yaxis', 'gbar-grid', 'ht-grid', 'scalerow']

PER_BAR_GRID_CLASSES = ['ht-grid']


def load_text(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def line_number_at(full_text, offset):
    """1-based line number of a character offset in the unscoped file."""
    return full_text.count('\n', 0, offset) + 1


def numbered_lines_whole_file(full_text):
    """Default (unscoped) mode: every physical line, real line numbers."""
    return [(i, line) for i, line in enumerate(full_text.splitlines(), 1)]


def extract_widget_region(full_text, start_marker, next_marker_pattern):
    """Find start_marker, then return the text from there up to (not
    including) the next match of next_marker_pattern, or end of file."""
    start = full_text.find(start_marker)
    if start == -1:
        return None, None
    search_from = start + len(start_marker)
    m = next_marker_pattern.search(full_text, search_from)
    end = m.start() if m else len(full_text)
    return start, full_text[start:end]


def find_matching_brace_end(full_text, func_start):
    """Given the start of a `WRENDER[n]=function(...){` declaration, find the
    offset just past its matching closing brace by counting braces from the
    first '{' after func_start.

    This exists because "the next WRENDER[m]=function occurrence" is NOT a
    safe end boundary: shared helper functions (e.g. kpiLineTile(), used by
    every widget) are sometimes defined physically between one widget's
    WRENDER function and the next one's, and a naive "up to the next
    WRENDER[m]" boundary sweeps that shared code into whichever widget
    happens to be queried -- confirmed in practice on 2026-07-23, where
    --widget 6 falsely attributed a finding that was actually inside
    kpiLineTile(), a helper sitting between WRENDER[6] and WRENDER[7].

    Best-effort: this is a plain brace counter, it does not understand JS
    string/comment syntax, so a literal '{' or '}' character inside a
    string would throw it off. That hasn't been observed in this file's
    actual style (strings here are HTML/CSS attribute values using ':' and
    ';', not '{}'), but if scoped mode ever looks obviously wrong, this is
    the first thing to suspect."""
    brace_start = full_text.find('{', func_start)
    if brace_start == -1:
        return None
    depth = 0
    i = brace_start
    n = len(full_text)
    while i < n:
        c = full_text[i]
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    return None


def numbered_lines_for_widget(full_text, widget_num):
    """Scoped mode: only widget_num's markup block and its WRENDER[n]
    function -- and ONLY that function, not whatever shared code happens to
    sit after it before the next widget's WRENDER starts. Real line numbers
    where the underlying text actually has line breaks (the WRENDER
    function); a single labeled pseudo-line for the markup block, since
    that whole block is one enormous physical line in this file and a real
    line number would be meaningless."""
    numbered = []

    markup_start, markup_text = extract_widget_region(
        full_text, f'id="ws-{widget_num}"', re.compile(r'id="ws-\d+"'))
    if markup_text is not None:
        numbered.append((f'widget-{widget_num}-markup', markup_text))
    else:
        print(f'  (note: no id="ws-{widget_num}" markup block found)', file=sys.stderr)

    render_marker = f'WRENDER[{widget_num}]=function'
    render_start = full_text.find(render_marker)
    if render_start != -1:
        render_end = find_matching_brace_end(full_text, render_start)
        render_text = full_text[render_start:render_end] if render_end else full_text[render_start:]
        base_line = line_number_at(full_text, render_start)
        for offset_line, line in enumerate(render_text.splitlines()):
            numbered.append((base_line + offset_line, line))
    else:
        print(f'  (note: no WRENDER[{widget_num}] function found)', file=sys.stderr)

    return numbered


def check_t1_svg(numbered):
    """Rule T1 -- non-uniform SVG stretching against a fluid-width card."""
    findings = []
    for label, line in numbered:
        if 'preserveAspectRatio="none"' in line or "preserveAspectRatio='none'" in line:
            findings.append(('HIGH', label,
                'preserveAspectRatio="none" found -- this stretches shapes AND text '
                'non-uniformly if the viewBox width does not match the rendered width. '
                'Prefer plain flex/CSS bars instead.'))
        for m in re.finditer(r'<svg\b[^>]*>', line):
            tag = m.group(0)
            if 'height=' not in tag:
                findings.append(('HIGH', label,
                    'An <svg> tag with no explicit height= attribute -- height will be '
                    'inferred from the viewBox aspect ratio, which balloons in a wide/fluid '
                    'container. (Check whether height is set via CSS instead before treating '
                    'this as a real bug -- this check only looks for the HTML attribute.) '
                    + tag.strip()))
    return findings


def check_t4_css_scope(numbered):
    """Rule T4 -- shared class overrides that aren't scoped to a widget/size."""
    findings = []
    css_rule = re.compile(r'([^{};]+)\{[^{}]*\}')
    for label, line in numbered:
        for m in css_rule.finditer(line):
            selector = m.group(1).strip()
            for cls in SHARED_CLASSES:
                token = '.' + cls
                if token in selector and re.search(r'\.sz-[a-z]+', selector) and '#ws-' not in selector:
                    findings.append(('MED', label,
                        'Size-qualified override of shared class "' + cls + '" with no #ws-<id> '
                        'widget scope -- verify this is meant to apply to every widget that uses .'
                        + cls + ', not just one. Selector: ' + selector))
    return findings


def check_t9_gridline_scope(numbered):
    """Rule T9 -- gridlines drawn per-bar (inside each item's own track) instead of once,
    spanning the whole chart. Known-bad pattern: a "grid" class instantiated inside a
    .map()/per-item template rather than once at the top of a shared, position:relative
    wrapper around every bar.

    Caveat: this is a substring match on the class name, not a structural check -- it
    cannot actually tell a per-bar instantiation from a single correct wrapper use, so
    treat a hit as "go look," not as a confirmed violation."""
    findings = []
    for label, line in numbered:
        for cls in PER_BAR_GRID_CLASSES:
            if cls in line:
                findings.append(('MED', label,
                    'Class "' + cls + '" found -- confirm this is one continuous line '
                    "spanning the whole chart, not a mark instantiated inside each bar's own "
                    'track (Rule T9). This check only matches the class name as a substring '
                    'and cannot tell the two apart on its own -- verify by reading the '
                    'surrounding markup. Prefer the .gbar-grid pattern: absolutely positioned, '
                    'left:0;right:0, inside a single wrapper around every bar.'))
    return findings


def check_t6_contrast(numbered):
    """Rule T6 -- low-contrast color literals near axis/gridline/scale context.

    Caveat: this only fires when a low-contrast hex and an axis/grid keyword share the
    same physical line. In this file, the entire per-widget markup block is one very
    long line, so this can both over-fire (an unrelated color on the same giant line as
    an unrelated mention of "grid") and under-fire (a real violation whose keyword
    context lives on a different line, e.g. set via a CSS class rather than inline)."""
    findings = []
    for label, line in numbered:
        lower = line.lower()
        if not any(k in lower for k in AXIS_KEYWORDS):
            continue
        for hexval in LOW_CONTRAST_HEX:
            if hexval in lower:
                findings.append(('LOW', label,
                    'Low-contrast color ' + hexval + ' used on a line mentioning '
                    'axis/grid/scale -- confirm it is still readable against a white card. '
                    '(Rule T6 minimum: text >= #666, lines >= rgba(0,0,0,.25))'))
    return findings


def main():
    args = [a for a in sys.argv[1:] if a != '--widget' and not a.isdigit()]
    widget_num = None
    if '--widget' in sys.argv:
        idx = sys.argv.index('--widget')
        if idx + 1 < len(sys.argv) and sys.argv[idx + 1].isdigit():
            widget_num = int(sys.argv[idx + 1])
        else:
            print('Error: --widget requires a widget number, e.g. --widget 10')
            sys.exit(1)

    if not args:
        print(__doc__)
        sys.exit(1)
    path = args[0]
    full_text = load_text(path)

    if widget_num is not None:
        numbered = numbered_lines_for_widget(full_text, widget_num)
        scope_label = f'widget {widget_num} only (markup block + WRENDER[{widget_num}])'
    else:
        numbered = numbered_lines_whole_file(full_text)
        scope_label = 'whole file -- all widgets'

    all_findings = []
    all_findings += check_t1_svg(numbered)
    all_findings += check_t4_css_scope(numbered)
    all_findings += check_t9_gridline_scope(numbered)
    all_findings += check_t6_contrast(numbered)

    sev_order = {'HIGH': 0, 'MED': 1, 'LOW': 2}
    all_findings.sort(key=lambda f: sev_order[f[0]])

    print(f'=== check-rules.py - automated findings (T1 / T4 / T6 / T9) -- scope: {scope_label} ===')
    if not all_findings:
        print('No automated findings.')
    for sev, label, msg in all_findings:
        print('[{}] {}: {}'.format(sev, label, msg))

    print()
    print('=== Manual-only reminders (not automatable -- judgment calls) ===')
    print("T2  Fill, don't pin: open each Medium/Large card and confirm the chart/table")
    print('    fills the card with no dead space at the bottom.')
    print("T3  Frozen paths: diff this round's Expanded ('x'/'xk') and KPI ('k') output")
    print('    against the last approved version. Check whether the size you changed')
    print('    (e.g. Medium) has its own dedicated branch, or silently shares code with')
    print('    Expanded/KPI.')
    print('T5  Axis/value match: for every chart, confirm the number printed on/next to')
    print("    each bar is the same metric the axis it's measured against actually plots.")
    print('T8  Whitespace ladder: if a Medium/Large card is over half empty, fix it in order')
    print('    (header, then filter, then enlarge+values+gridlines) -- never skip a step or')
    print("    apply one the card didn't need. Reverse the same order if a card is too full.")

    high_count = sum(1 for f in all_findings if f[0] == 'HIGH')
    med_count = sum(1 for f in all_findings if f[0] == 'MED')
    low_count = sum(1 for f in all_findings if f[0] == 'LOW')
    print()
    print('{} HIGH, {} MED, {} LOW finding(s).'.format(high_count, med_count, low_count))
    if med_count or low_count:
        print('NOTE: exit code below reflects HIGH only -- {} MED and {} LOW finding(s) '
              'above will NOT make this process exit non-zero. Read the counts, not just '
              'the exit code.'.format(med_count, low_count))
    sys.exit(1 if high_count else 0)


if __name__ == '__main__':
    main()
