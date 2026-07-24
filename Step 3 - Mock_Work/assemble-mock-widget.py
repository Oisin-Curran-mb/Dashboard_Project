#!/usr/bin/env python3
"""
assemble-mock-widget.py  --  deterministic merge step for the Create Mock Designs pipeline.

Purpose: take a scaffold + three independently-drafted option fragments (written by three
isolated sub-agents to separate files) and splice them into Dashboard Widget Mockups.html
in ONE fast, scripted operation -- instead of a long free-form agent edit, which is what
kept getting its connection dropped mid-stream. Agents draft short (low drop risk); this
script does the big, error-prone splices (no agent turn to drop).

Inputs, all under  _build/W<N>/ :
  scaffold.js   -- the shared WRENDER preamble + KPI branch (authored ONCE by the coordinator,
                   never by the 3 option agents). Everything common to all 3 options lives here:
                   the var fk=wid+'-'+opt per-option filter key, the data lookup, the KPI-size
                   return. Must NOT contain any if(opt==='A'/'B'/'C') block and must NOT close
                   the function (no trailing '}').
  optA.js       -- exactly one  if(opt==='A'){ ... }  block (option A's render only).
  optB.js       -- exactly one  if(opt==='B'){ ... }  block.
  optC.js       -- exactly one  if(opt==='C'){ ... }  block.
  meta.json     -- { "widget": N,
                     "options": [ {num,title,sub,imp,il?,iu?} x3 ],   # MOCK_DATA.options[N]
                     "cards":   [ {opt,title,sub,default_size,sizes:[..],
                                   views:[{sv,icon,label}..]} x3 ],    # per-card chrome
                     "series_js": "<optional full 'MOCK_DATA.series[N] = {...}' replacement>" }

What it does (deterministically, with asserts):
  1. Assemble WRENDER[N] = header + scaffold + optA + optB + optC + '}'  -> splice over existing.
  2. Rebuild MOCK_DATA.options[N] from meta.options.
  3. (optional) replace MOCK_DATA.series[N] from meta.series_js.
  4. Rewrite each Dashboard-tab card's title/sub, Switch-view buttons, size buttons, default
     size class, and openFilter(N,event) -> openFilter(N,event,'X'). Scoped to the card region
     only -- never touches #fc-widget-N (Final Check tab).
  5. Extend the shared per-option filter branches to include wid===N / _filterWid===N.
  6. Re-sync mock-data.master.js for options[N] and series[N].
  7. node --check the script blocks + run check-rules.py --widget N; print results.

Cross-option collisions (the thing the 3 blind agents can't see) are prevented by CONTRACT:
each agent is told to (a) write body-only, (b) namespace every local var/data-key by its option
letter (segA/segB/segC, rowsA...), (c) read only its own fk state, (d) never author preamble/KPI.
This script asserts each optX.js contains exactly its own if(opt==='X') block and nothing else.
"""
import sys, re, json, subprocess, os

HTML="Dashboard Widget Mockups.html"
MIRROR="mock-data.master.js"

def die(m): print("ERROR:",m); sys.exit(1)

def brace_span(t, start_idx, open_c='{', close_c='}'):
    b=t.find(open_c,start_idx); d=0; i=b
    while i<len(t):
        c=t[i]
        if c==open_c: d+=1
        elif c==close_c:
            d-=1
            if d==0: return b,i+1
        i+=1
    die("unbalanced "+open_c)

def wrender_span(t,n):
    m=re.search(r"WRENDER\["+str(n)+r"\]=function",t)
    if not m: die(f"WRENDER[{n}] not found")
    s=m.start(); _,e=brace_span(t,s)
    return s,e

def options_entry_span(t,n):
    m=re.search(r"MOCK_DATA\.options\s*=\s*\{",t); s=m.start()
    b,e=brace_span(t,s); blk=t[b:e]
    mm=re.search(r"[\s{,]"+str(n)+r"\s*:\s*\[",blk)
    if not mm: die(f"options[{n}] not found")
    st=mm.end()-1; d=0; i=st
    while i<len(blk):
        c=blk[i]
        if c=='[': d+=1
        elif c==']':
            d-=1
            if d==0: return b+st, b+i+1
        i+=1
    die("options entry unbalanced")

def series_span(t,n):
    m=re.search(r"MOCK_DATA\.series\["+str(n)+r"\]\s*=\s*\{",t)
    if not m: return None
    s=m.start(); b,e=brace_span(t,s); return s,e

def main():
    if len(sys.argv)<2: die("usage: assemble-mock-widget.py <N>")
    N=int(sys.argv[1])
    bdir=f"_build/W{N}"
    for f in ["scaffold.js","optA.js","optB.js","optC.js","meta.json"]:
        if not os.path.exists(os.path.join(bdir,f)): die(f"missing {bdir}/{f}")
    scaffold=open(f"{bdir}/scaffold.js",encoding="utf-8").read().strip("\n")
    branches={}
    for L in "ABC":
        code=open(f"{bdir}/opt{L}.js",encoding="utf-8").read().strip()
        # contract check: contains its own block, and not the other options'
        if f"opt==='{L}'" not in code: die(f"opt{L}.js does not contain if(opt==='{L}')")
        for other in "ABC".replace(L,""):
            if f"opt==='{other}'" in code: die(f"opt{L}.js leaks opt==='{other}' -- fragments must be isolated")
        branches[L]=code
    if "if(opt===" in scaffold: die("scaffold.js must not contain any if(opt===...) block")
    if scaffold.count("{")!=scaffold.count("}"): die("scaffold.js braces are unbalanced -- it would prematurely open/close the function")
    meta=json.load(open(f"{bdir}/meta.json",encoding="utf-8"))
    assert meta["widget"]==N, "meta.widget mismatch"

    t=open(HTML,encoding="utf-8",errors="ignore").read()

    # 1. WRENDER[N]
    s,e=wrender_span(t,N)
    new_wr=(f"WRENDER[{N}]=function(opt,wid,sz){{\n"+scaffold.rstrip()+"\n"
            +branches['A'].strip()+"\n"+branches['B'].strip()+"\n"+branches['C'].strip()+"\n}")
    t=t[:s]+new_wr+t[e:]

    # 2. options[N]
    def optjs(o):
        parts=[f'num:{json.dumps(o["num"])}',f'title:{json.dumps(o["title"])}',
               f'sub:{json.dumps(o["sub"])}',f'imp:{json.dumps(o["imp"])}']
        if o.get("il"): parts.append(f'il:{json.dumps(o["il"])}')
        if o.get("iu"): parts.append(f'iu:{json.dumps(o["iu"])}')
        return "{"+",".join(parts)+"}"
    opt_txt="[\n    "+",\n    ".join(optjs(o) for o in meta["options"])+"\n  ]"
    s,e=options_entry_span(t,N); t=t[:s]+opt_txt+t[e:]

    # 3. series[N] (optional)
    if meta.get("series_js"):
        sp=series_span(t,N)
        if sp: t=t[:sp[0]]+meta["series_js"].strip()+t[sp[1]:]

    # 4. cards (scoped to Dashboard card region only)
    cstart=t.find(f'id="opt-{N}-A"')
    cend=t.find(f'id="viz-{N}-C"')
    if cstart<0 or cend<0: die("card region not found")
    # back up to include the class attr preceding id
    cstart=t.rfind('<div class="opt ',0,cstart)
    region=t[cstart:cend]; before,after=t[:cstart],t[cend:]
    for card in meta["cards"]:
        L=card["opt"]
        # default size class
        region=re.sub(r'class="opt sz-\w+" id="opt-'+str(N)+'-'+L+'"',
                      f'class="opt sz-{card["default_size"]}" id="opt-{N}-{L}"',region,count=1)
        # title/sub: replace the opt-t/opt-s pair inside this card's title-wrap after its badge
        bidx=region.find(f'id="opt-{N}-{L}"')
        tw=region.find('<div class="opt-title-wrap">',bidx)
        twe=region.find('</div></div>',tw)
        seg=region[tw:twe]
        seg2=re.sub(r'<div class="opt-t">.*?</div>',f'<div class="opt-t">{card["title"]}</div>',seg,count=1,flags=re.S)
        seg2=re.sub(r'<div class="opt-s">.*?</div>',f'<div class="opt-s">{card["sub"]}</div>',seg2,count=1,flags=re.S)
        region=region[:tw]+seg2+region[twe:]
        # openFilter
        ai=region.find(f'id="dd-{N}-{L}"'); nx=region.find(f'id="viz-{N}-{L}"')
        block=region[ai:nx]
        block=block.replace(f'openFilter({N},event)',f"openFilter({N},event,'{L}')",1)
        # switch-view buttons: replace consecutive setView(...) buttons after the 'Switch chart type' label
        vbtns="".join(f'<button class="wc-dd-item" onclick="setView({N},\'{L}\',\'{v["sv"]}\',event)"><span class="material-symbols-rounded">{v["icon"]}</span>{v["label"]}</button>' for v in card["views"])
        block=re.sub(r'(<div class="wc-dd-lbl">Switch chart type</div>)(?:<button class="wc-dd-item" onclick="setView\('+str(N)+r',\''+L+r'\'.*?</button>)+',
                     lambda mo: mo.group(1)+vbtns, block, count=1, flags=re.S)
        # size buttons
        szmap={'s':('crop_square','Small'),'m':('crop_landscape','Medium'),'l':('crop_free','Large'),'k':('crop_7_5','KPI'),'x':('open_in_full','Expanded')}
        szbtns="".join(f'<button class="wc-sz-btn" onclick="setSize({N},\'{L}\',\'sz-{s}\',event)"><span class="material-symbols-rounded">{szmap[s][0]}</span><span class="wc-sz-label">{szmap[s][1]}</span></button>' for s in card["sizes"])
        block=re.sub(r'<div class="wc-dd-size">.*?</div>\s*</div></div></div>',
                     '<div class="wc-dd-size">'+szbtns+'</div></div></div></div>', block, count=1, flags=re.S)
        region=region[:ai]+block+region[nx:]
    t=before+region+after

    # 5. filter-branch wiring
    def extend(cond_prefix, token):
        nonlocal t
        # find "(<prefix>...===A||...) && _filterOpt" style; add token if missing
        pat=re.compile(r'\(('+re.escape(cond_prefix)+r'[^)]*?)\)\s*&&\s*_filterOpt')
        def rep(mo):
            inner=mo.group(1)
            if token in inner: return mo.group(0)
            return "("+inner+"||"+token+") && _filterOpt"
        t=pat.sub(rep,t)
    extend("wid===", f"wid==={N}")
    extend("_filterWid===", f"_filterWid==={N}")

    open(HTML,"w",encoding="utf-8").write(t)

    # 6. mirror sync (options[N] + series[N])
    def sync(name):
        h=open(HTML,encoding="utf-8",errors="ignore").read()
        m=open(MIRROR,encoding="utf-8",errors="ignore").read()
        if name=="options":
            hs=options_entry_span(h,N); ms=options_entry_span(m,N)
        else:
            hs=series_span(h,N); ms=series_span(m,N)
            if not hs or not ms: return
        m2=m[:ms[0]]+h[hs[0]:hs[1]]+m[ms[1]:]
        open(MIRROR,"w",encoding="utf-8").write(m2)
    sync("options"); sync("series")

    # 7. checks
    print("=== node --check ===")
    h=open(HTML,encoding="utf-8",errors="ignore").read()
    scripts=re.findall(r"<script>(.*?)</script>",h,re.S)
    open("/tmp/_asm_check.js","w").write("\n;\n".join(scripts))
    r=subprocess.run(["node","--check","/tmp/_asm_check.js"],capture_output=True,text=True)
    print("SYNTAX OK" if r.returncode==0 else "SYNTAX ERROR:\n"+r.stderr)
    print("=== check-rules.py --widget",N,"===")
    r=subprocess.run(["python3","check-rules.py",HTML,"--widget",str(N)],capture_output=True,text=True)
    print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr)
    print("=== assemble complete for W"+str(N)+" ===")

if __name__=="__main__": main()
