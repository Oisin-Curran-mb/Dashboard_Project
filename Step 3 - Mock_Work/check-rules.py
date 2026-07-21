#!/usr/bin/env python3
"""
check-rules.py -- static scan of Dashboard Widget Mockups.html against
"Widget concepts/03 - Technical Build Rules & Definition of Done.md".

This is a lint pass, not a replacement for actually looking at the rendered
cards at all 5 sizes. It automates the checks that are reliably regex-
detectable (T1, T4, T6, T9) and prints reminders for the ones that require
judgment (T2, T3, T5, T8) so they don't get skipped.

Usage:
    python3 check-rules.py "Dashboard Widget Mockups.html"
Exit code is non-zero if any HIGH severity finding is present, so it can be
used as a pass/fail gate if you want one.
"""
import re
import sys

SHARED_CLASSES = ['kpis', 'hbars', 'hr', 'hl', 'ht', 'hf', 'hv',
                   'bars', 'bw', 'bl', 'bv', 'aleg', 'ali', 'asw', 'tbl']
LOW_CONTRAST_HEX = ['#aaa', '#aaaaaa', '#ccc', '#cccccc', '#ddd', '#dddddd',
                     '#e8e8e8', '#eee', '#eeeeee', '#f0f0f0']
AXIS_KEYWORDS = ['axis', 'grid', 'scale', 'yaxis', 'gbar-grid', 'ht-grid', 'scalerow']

PER_BAR_GRID_CLASSES = ['ht-grid']


def load(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.readlines()


def check_t1_svg(lines):
    """Rule T1 -- non-uniform SVG stretching against a fluid-width card."""
    findings = []
    for i, line in enumerate(lines, 1):
        if 'preserveAspectRatio="none"' in line or "preserveAspectRatio='none'" in line:
            findings.append(('HIGH', i,
                'preserveAspectRatio="none" found -- this stretches shapes AND text '
                'non-uniformly if the viewBox width does not match the rendered width. '
                'Prefer plain flex/CSS bars instead.'))
        for m in re.finditer(r'<svg\b[^>]*>', line):
            tag = m.group(0)
            if 'height=' not in tag:
                findings.append(('HIGH', i,
                    'An <svg> tag with no explicit height= attribute -- height will be '
                    'inferred from the viewBox aspect ratio, which balloons in a wide/fluid '
                    'container. ' + tag.strip()))
    return findings


def check_t4_css_scope(lines):
    """Rule T4 -- shared class overrides that aren't scoped to a widget/size."""
    findings = []
    css_rule = re.compile(r'^([^{]+)\{')
    for i, line in enumerate(lines, 1):
        m = css_rule.match(line.strip())
        if not m:
            continue
        selector = m.group(1).strip()
        for cls in SHARED_CLASSES:
            token = '.' + cls
            if token in selector and re.search(r'\.sz-[a-z]+', selector) and '#ws-' not in selector:
                findings.append(('MED', i,
                    'Size-qualified override of shared class "' + cls + '" with no #ws-<id> '
                    'widget scope -- verify this is meant to apply to every widget that uses .'
                    + cls + ', not just one. Selector: ' + selector))
    return findings


def check_t9_gridline_scope(lines):
    """Rule T9 -- gridlines drawn per-bar (inside each item's own track) instead of once,
    spanning the whole chart. Known-bad pattern: a "grid" class instantiated inside a
    .map()/per-item template rather than once at the top of a shared, position:relative
    wrapper around every bar."""
    findings = []
    for i, line in enumerate(lines, 1):
        for cls in PER_BAR_GRID_CLASSES:
            if cls in line:
                findings.append(('MED', i,
                    'Class "' + cls + '" found -- this draws a gridline mark inside each '
                    "bar's own track rather than one continuous line spanning the whole "
                    'chart (Rule T9). Prefer the .gbar-grid pattern: absolutely positioned, '
                    'left:0;right:0, inside a single wrapper around every bar.'))
    return findings


def check_t6_contrast(lines):
    """Rule T6 -- low-contrast color literals near axis/gridline/scale context."""
    findings = []
    for i, line in enumerate(lines, 1):
        lower = line.lower()
        if not any(k in lower for k in AXIS_KEYWORDS):
            continue
        for hexval in LOW_CONTRAST_HEX:
            if hexval in lower:
                findings.append(('LOW', i,
                    'Low-contrast color ' + hexval + ' used on a line mentioning '
                    'axis/grid/scale -- confirm it is still readable against a white card. '
                    '(Rule T6 minimum: text >= #666, lines >= rgba(0,0,0,.25))'))
    return findings


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    path = sys.argv[1]
    lines = load(path)

    all_findings = []
    all_findings += check_t1_svg(lines)
    all_findings += check_t4_css_scope(lines)
    all_findings += check_t9_gridline_scope(lines)
    all_findings += check_t6_contrast(lines)

    sev_order = {'HIGH': 0, 'MED': 1, 'LOW': 2}
    all_findings.sort(key=lambda f: (sev_order[f[0]], f[1]))

    print('=== check-rules.py - automated findings (T1 / T4 / T6 / T9) ===')
    if not all_findings:
        print('No automated findings.')
    for sev, ln, msg in all_findings:
        print('[{}] line {}: {}'.format(sev, ln, msg))

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
    print()
    print('{} HIGH, {} MED, {} LOW finding(s).'.format(
        high_count,
        sum(1 for f in all_findings if f[0] == 'MED'),
        sum(1 for f in all_findings if f[0] == 'LOW')))
    sys.exit(1 if high_count else 0)


if __name__ == '__main__':
    main()
