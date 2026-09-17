#!/usr/bin/env python3
"""css-token-resolve-check.py -- does every var() a widget root uses actually resolve?

WHY THIS EXISTS
W11 was restyled six times and looked unstyled every time. The rules were correct.
The cause was that .faf-root declared ZERO custom properties while every other root
declares its own block (insf 93, loanf 38). So every var(--stroke-widget),
var(--surface-widget), var(--txt-*), var(--wn-*) and var(--am-*) in its stylesheet
resolved to nothing, and an undefined var() is VALID CSS that silently drops the whole
declaration. No border, no background, no colour, no error.

Nothing else in this project catches it. node --check reads script. final-check-rules
reads prose and JS. css-scope-matrix compares class NAMES, not property resolution.
chart-fill-check needs a browser. An undefined token is invisible to all of them.

WHAT IT DOES
For each .<x>-root in the file, collect every var(--token) its rules reference, and
every custom property that root declares. Report any token used but not declared by
the root itself. Tokens may legitimately come from an ancestor, so a root that
declares none at all is reported as the loud case.
"""
import io,re,sys,collections
p = sys.argv[1] if len(sys.argv)>1 else "Dashboard Widget Mockups.html"
t = io.open(p,encoding="utf-8",errors="replace").read()
css = "\n".join(re.findall(r'<style>([\s\S]*?)</style>', t))
# strip CSS comments FIRST. Without this, a rule preceded by a comment block has the
# comment glued onto its selector, so an anchored match on ".<x>-root" fails and the
# root looks like it declares nothing. That bug made the first run of this script
# report 9 false HIGHs, including insf which demonstrably declares 93 properties.
css = re.sub(r"/\*[\s\S]*?\*/", "", css)
rules = [(b,d) for b,d in re.findall(r'([^{}]+)\{([^{}]*)\}', css)]
roots = sorted({m for m in re.findall(r'\.([a-z0-9]+f)-root', css)})
used, declared = collections.defaultdict(set), collections.defaultdict(set)
for block, body in rules:
    for s in block.split(","):
        s = s.strip()
        m = re.match(r'\.([a-z0-9]+f)-root\b', s)
        if not m: continue
        r = m.group(1)
        used[r] |= set(re.findall(r'var\((--[\w-]+)\)', body))
        declared[r] |= set(re.findall(r'(--[\w-]+)\s*:', body))
print("=== token resolution by widget root ===")
bad = 0
for r in roots:
    u, d = used[r], declared[r]
    missing = sorted(u - d)
    if not d and u:
        bad += 1
        print(f"  [HIGH] .{r}-root declares NO custom properties but uses {len(u)} tokens."
              f" Every one silently drops its declaration. e.g. {', '.join(sorted(u)[:5])}")
    elif missing:
        bad += 1
        print(f"  [CHECK] .{r}-root uses {len(missing)} token(s) it does not declare:"
              f" {', '.join(missing)}")
    else:
        print(f"  ok      .{r}-root: {len(u)} tokens used, all declared ({len(d)} declared)")
print()
print(f"{'FAIL' if bad else 'PASS'} -- {bad} root(s) with unresolved tokens")
sys.exit(0)
