#!/usr/bin/env python3
"""Split-selector detector. The bug: inserting CSS between a selector and its own
rule body leaves a dangling prefix, which silently merges into the NEXT rule as a
descendant selector that can never match (.remf-root .remf-root .rem-pcards) and
strips the scope off the rule that was split. Neither shows up in node --check or
in a DOM-shim driver, because it is pure cascade."""
import re,sys
src=open("Dashboard Widget Mockups.html",encoding='utf-8').read()
# style blocks only
blocks=[]; i=0
while True:
    a=src.find('<style',i)
    if a<0: break
    b=src.find('>',a); c=src.find('</style>',b)
    if c<0: break
    blocks.append((b+1,src[b+1:c])); i=c+1
issues=[]
ROOTS=re.compile(r'\.(remf|penf|prf|purf|apf|gpf|loanf|bgtf|insf|arf|depf)-root',re.I)
for off,css in blocks:
    css_nc=re.sub(r'/\*.*?\*/',lambda m:' '*len(m.group(0)),css,flags=re.S)
    depth=0; start=0
    for m in re.finditer(r'[{}]',css_nc):
        if m.group(0)=='{':
            if depth==0:
                sel=css_nc[start:m.start()]
                sel_clean=sel.strip().strip(';').strip()
                # doubled root class = the split-selector signature
                roots=ROOTS.findall(sel_clean)
                for part in sel_clean.split(','):
                    toks=part.split()
                    for k in range(len(toks)-1):
                        if toks[k]==toks[k+1] and ROOTS.match(toks[k]):
                            issues.append(("DOUBLED ROOT", sel_clean[:120]))
                if sel_clean=="":
                    issues.append(("EMPTY SELECTOR", "(at offset %d)"%(off+m.start())))
            depth+=1
        else:
            depth-=1
            if depth==0: start=m.end()
# targeted checks on rules this build depends on
def has(sel_sub, decl):
    return re.search(re.escape(sel_sub)+r'\s*\{[^}]*'+re.escape(decl), src) is not None
checks=[
 (".remf-root .rem-pcards", "display:grid"),
 (".remf-root .rem-pledge-panel", "background:var(--am-50)"),
 (".penf-root .pen-c-cnt", "flex:0 0 74px"),
]
print("=== split-selector scan ===")
if issues:
    for kind,txt in issues[:20]: print(f"  [{kind}] {txt}")
    print(f"  {len(issues)} issue(s)")
else:
    print("  clean: no doubled root prefixes, no empty selectors")
print("=== rules this build depends on ===")
bad=0
for sel,decl in checks:
    okk=has(sel,decl)
    print(f"  {'OK ' if okk else 'MISSING'} {sel} {{ {decl} ... }}")
    if not okk: bad+=1
sys.exit(1 if (issues or bad) else 0)
