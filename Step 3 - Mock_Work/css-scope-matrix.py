#!/usr/bin/env python3
"""Per-root scoping matrix for this file's "shared looking" classes.

Several classes that look global are actually declared PER WIDGET ROOT here
(.penf-root .vt, .prf-root .vt, and so on). A widget that RENDERS one without
DECLARING it under its own root gets unstyled native elements. Neither
`node --check` nor a DOM-shim driver can see this: the markup is correct and only
the cascade is missing. W06's Table / Pie toggle shipped unstyled this way.

Fast by design: plain string scans, no regex over the 1.7MB source.
"""
import sys
src=open("Dashboard Widget Mockups.html",encoding='utf-8').read()

SHARED=["vtoggle","vt","pie-wrap","donut","donut-c1","legend","legend-col","leg","dot"]
ROOTS=["arf","apf","bgtf","depf","gpf","insf","loanf","payf","penf","prf","purf","remf"]

# Some widgets render TWO root classes on one element (W17 emits
# class="remf-root gpf-root"), so a rule under either root styles it. Build those
# aliases from the real markup instead of guessing.
ALIAS={}
i=0
while True:
    i=src.find('class="',i)
    if i<0: break
    j=src.find('"',i+7)
    if j<0: break
    toks=[t for t in src[i+7:j].split() if t.endswith("-root")]
    if len(toks)>1:
        for t in toks:
            ALIAS.setdefault(t.replace("-root",""),set()).update(x.replace("-root","") for x in toks)
    i=j

def declared(root,cls):
    stem=".%s-root .%s" % (root,cls)
    i=0
    while True:
        i=src.find(stem,i)
        if i<0: return False
        nxt=src[i+len(stem):i+len(stem)+1]
        if nxt in "{ ,:.":          # a real rule, not a longer class name
            return True
        i+=1

def renders(root,cls):
    """does this widget's own render code emit the class?"""
    # widget code is namespaced by function prefix, e.g. insFPieChart / remFTable
    marker=root[:-1].upper() if root.endswith("f") else root.upper()
    # cheap proxy: the class appears within 4000 chars of a <root>F function name
    key="function %sF" % root[:-1] if root.endswith("f") else "function %s" % root
    i=0
    while True:
        i=src.find(key,i)
        if i<0: return False
        if cls in src[i:i+6000]: return True
        i+=len(key)

rows=[];missing=[]
for root in ROOTS:
    if (".%s-root"%root) not in src: continue
    for cls in SHARED:
        d=any(declared(a,cls) for a in ALIAS.get(root,{root}))
        r=renders(root,cls)
        rows.append((root,cls,r,d))
        if r and not d: missing.append((root,cls))

print("=== rendered-but-not-declared (candidates for unstyled elements) ===")
if missing:
    for root,cls in missing:
        print("  [CHECK] .%s-root renders .%s but declares no .%s-root .%s rule" % (root,cls,root,cls))
    print("  %d candidate(s). Some may be false positives: the proxy scans a window of the"
          "\n  widget's code, so a class merely mentioned nearby can register. Confirm by eye." % len(missing))
else:
    print("  clean: every widget declares the shared classes its own code emits")
sys.exit(1 if missing else 0)
