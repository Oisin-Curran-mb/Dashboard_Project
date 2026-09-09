/* ===== W11 faF DOM-shim driver ===================================
   The faF data, render functions and handlers above are the LIVE code, extracted
   verbatim from Dashboard Widget Mockups.html. Nothing is reimplemented here. */
var PASS=0,FAIL=0,LOG=[];
function ok(name,cond,extra){
  if(cond){PASS++;LOG.push('  PASS  '+name);}
  else{FAIL++;LOG.push('  FAIL  '+name+(extra?('  ['+extra+']'):''));}
}
function has(h,s){return h.indexOf(s)>=0;}
function reset(){ FAF_STATE.dim='cls';FAF_STATE.group=null;FAF_STATE.measure='net';FAF_STATE.view='bars';FAF_STATE.sort='tag-asc';FAF_STATE.dataset=null;FAF_STATE.state=null;FAF_POP=null; }
var EMSWEEP=[];
function render(sz){var h=fafRender(11,sz);EMSWEEP.push(h);return h;}

/* ---- A. a render at each of the three sizes (Rule 12: Glance, Explore, Detail) */
reset();
var gK=render('k'), gM=render('m'), gL=render('l'), gS=render('s'), gX=render('x');
ok('A1 Glance (slot k) renders non-empty', gK.length>200);
ok('A2 Glance carries data-tier="kpi"', has(gK,'data-tier="kpi"'));
ok('A3 Explore (slot m) renders non-empty', gM.length>400);
ok('A4 Explore carries data-tier="wide"', has(gM,'data-tier="wide"'));
ok('A5 Detail (slot l) renders non-empty', gL.length>400);
ok('A6 Detail carries data-tier="xwide"', has(gL,'data-tier="xwide"'));
ok('A7 hidden s slot still renders safely as the mid tier', has(gS,'data-tier="wide"')&&gS.length>400);
ok('A8 x slot maps to Detail', has(gX,'data-tier="xwide"'));
ok('A9 every size emits the .faf-root token-bearing wrapper', [gK,gM,gL,gS,gX].every(function(h){return has(h,'class="faf-root faf-w"');}));

/* ---- B. Glance: ONE figure, Total Net Value org-wide, ignoring all selections */
reset();
var orgTotal=fafOrgNetTotal(FAF_STATE);
ok('B1 org-wide Total Net Value is the sum of every asset Net Value', orgTotal===FAF_ASSETS.reduce(function(s,a){return s+((a.cost-a.salv)-a.dep);},0));
ok('B2 Glance shows that figure, shortened', has(gK,fafMoneyShort(orgTotal)));
ok('B3 Glance carries the exact figure for hover and assistive tech', has(gK,fafMoneyFull(orgTotal)));
var kBefore=render('k');
FAF_STATE.dim='room';FAF_STATE.group='Kitchen';FAF_STATE.measure='cost';
var kAfter=render('k');
ok('B4 Glance IGNORES Group By, Specific Group and Financial Measure', kBefore===kAfter);
ok('B5 Glance has no controls', !has(gK,'data-faf="dim"')&&!has(gK,'data-faf="group"')&&!has(gK,'data-faf="measure"'));
ok('B6 Glance has no view switch', !has(gK,'data-faf="view"'));
ok('B7 Glance has no download', !has(gK,'data-faf="download"'));
ok('B8 Glance names the unspecified org-wide summation as a gap', has(gK,'not spelled out in any source')&&has(gK,'Settled by: Owner.'));

/* ---- C. the three Group By dimensions that work */
['cls','bldg','room'].forEach(function(d,i){
  reset(); FAF_STATE.dim=d;
  var names=fafGroupNames(FAF_STATE), h=render('m');
  ok('C'+(i+1)+' Group By '+fafDimDef(d).l+' returns groups', names.length>0, 'got '+names.length);
  ok('C'+(i+1)+'a every group name is text in the DOM', names.every(function(n){return has(h,fafEsc(n));}));
  ok('C'+(i+1)+'b no unimplemented placeholder for a working dimension', !has(h,'No groups returned for'));
});
reset(); FAF_STATE.dim='bldg';
ok('C4 Building includes the real "not assigned" group', fafGroupNames(FAF_STATE).indexOf('not assigned')>=0);
reset(); FAF_STATE.dim='room';
ok('C5 Room includes the real "not assigned" group', fafGroupNames(FAF_STATE).indexOf('not assigned')>=0);
ok('C6 "not assigned" sorts last, it is a real group not an error', fafGroupNames(FAF_STATE).slice(-1)[0]==='not assigned');
reset(); FAF_STATE.dim='room'; FAF_STATE.group='not assigned';
ok('C7 "not assigned" is selectable and yields assets', fafAssetsInGroup(FAF_STATE).length>0);

/* ---- D. an unimplemented Group By: the empty-list state, placeholdered not guessed */
['acctAsset','acctAccum','acctExp'].forEach(function(d,i){
  reset(); FAF_STATE.dim=d;
  ok('D'+(i+1)+' '+fafDimDef(d).l+' returns an EMPTY group list', fafGroupNames(FAF_STATE).length===0);
  var hm=render('m'), hl=render('l');
  ok('D'+(i+1)+'a Explore renders the labelled placeholder', has(hm,'No groups returned for '+fafDimDef(d).l)&&has(hm,'unimplemented switch case'));
  ok('D'+(i+1)+'b Detail renders the labelled placeholder', has(hl,'No groups returned for '+fafDimDef(d).l));
  ok('D'+(i+1)+'c the placeholder names who settles it', has(hm,'Settled by: Design and owner.')&&has(hm,'Settled by: Backend team.'));
  ok('D'+(i+1)+'d no invented figure inside the placeholder state', !/No groups returned[\s\S]{0,900}\$\d/.test(hm));
  ok('D'+(i+1)+'e the three controls stay live so a working dimension can be picked', has(hm,'data-faf="dim"')&&has(hm,'data-faf="group"')&&has(hm,'data-faf="measure"'));
  ok('D'+(i+1)+'f the Specific Group chip reads as having nothing to offer', has(hm,'No groups returned')&&has(hm,'faf-chip-dead'));
  FAF_STATE.view='assets';
  var ha=render('m');
  ok('D'+(i+1)+'g the asset table view also placeholders rather than throwing', has(ha,'No groups returned for'));
});
reset(); FAF_POP={type:'dim'};
ok('D4 the Group By menu marks the three dead dimensions "not on API"', (function(){var p=fafPopContent();EMSWEEP.push(p);return (p.match(/faf-mi-tag">not on API</g)||[]).length===3;})());
ok('D5 the Group By menu names the backend team for those three', has(fafPopContent(),'Settled by: Backend team.'));
FAF_POP={type:'group'}; FAF_STATE.dim='acctExp';
ok('D6 the Specific Group menu says nothing was returned', (function(){var p=fafPopContent();EMSWEEP.push(p);return has(p,'No groups returned for this dimension');})());
FAF_POP=null;

/* ---- E. the Specific Group reset when Group By changes (handoff section 4) */
reset(); FAF_STATE.dim='room'; FAF_STATE.group='Kitchen';
ok('E1 a specific group can be held', fafCurrentGroup(FAF_STATE)==='Kitchen');
click({'data-faf':'set-dim','data-v':'cls'});
ok('E2 changing Group By RESETS the stored Specific Group', FAF_STATE.group===null);
ok('E3 the reset lands on a group that exists in the NEW dimension', fafGroupNames(FAF_STATE).indexOf(fafCurrentGroup(FAF_STATE))>=0);
ok('E4 the stale value is gone, not carried over', fafCurrentGroup(FAF_STATE)!=='Kitchen');
reset(); FAF_STATE.dim='cls'; FAF_STATE.group='Vehicles';
click({'data-faf':'set-dim','data-v':'cls'});
ok('E5 re-picking the SAME dimension does not reset the selection', FAF_STATE.group==='Vehicles');
reset();
click({'data-faf':'set-group','data-v':'Buildings'});
ok('E6 picking a specific group stores it', FAF_STATE.group==='Buildings');

/* ---- F. the five measures: lead column and chart both follow the selection */
reset();
var leadSeen={},chartSeen={};
FAF_MEASURES.forEach(function(m,i){
  reset(); FAF_STATE.measure=m.k; FAF_STATE.view='assets';
  var tbl=render('m');
  ok('F'+(i+1)+' '+m.l+': the selected measure leads the table', has(tbl,'>'+m.short+'<span class="faf-lead-tag">selected</span>'));
  ok('F'+(i+1)+'a all five measures stay visible in the table', FAF_MEASURES.every(function(x){return has(tbl,'>'+x.short+'<');}));
  ok('F'+(i+1)+'b the lead is marked by text, not colour alone', has(tbl,'faf-lead-tag">selected'));
  leadSeen[m.k]=tbl;
  FAF_STATE.view='bars';
  var bars=render('m');
  ok('F'+(i+1)+'c '+m.l+': the bars plot that measure', has(bars,m.short)&&has(bars,'faf-barfill'));
  FAF_STATE.view='donut';
  var don=render('m');
  ok('F'+(i+1)+'d '+m.l+': the donut plots that measure', has(don,m.l)&&has(don,'faf-seg'));
  chartSeen[m.k]=bars;
});
ok('F6 the five measures produce five DIFFERENT lead columns', (function(){var s={};Object.keys(leadSeen).forEach(function(k){s[leadSeen[k]]=1;});return Object.keys(s).length===5;})());
ok('F7 the five measures produce five DIFFERENT charts', (function(){var s={};Object.keys(chartSeen).forEach(function(k){s[chartSeen[k]]=1;});return Object.keys(s).length===5;})());
ok('F8 the measure order puts the selection first then the doc order', (function(){FAF_STATE.measure='depr';var o=fafMeasureOrder(FAF_STATE).map(function(m){return m.k;});return o.join(',')==='depr,cap,cost,accum,net';})());

/* ---- G. the three views render, at Explore and Detail */
[['bars','faf-bars'],['donut','faf-seg'],['assets','role="table"']].forEach(function(v,i){
  reset(); FAF_STATE.view=v[0];
  var hm=render('m'), hl=render('l');
  ok('G'+(i+1)+' view '+v[0]+' renders at Explore', has(hm,v[1]));
  ok('G'+(i+1)+'a view '+v[0]+' renders at Detail', has(hl,v[1]));
  ok('G'+(i+1)+'b the view toggle marks '+v[0]+' as the current segment', has(hm,'data-v="'+v[0]+'" aria-pressed="true"'));
});
reset(); click({'data-faf':'view','data-v':'donut'});
ok('G4 the view toggle handler switches the view', FAF_STATE.view==='donut');
click({'data-faf':'view','data-v':'assets'});
ok('G5 and again, to the asset table', FAF_STATE.view==='assets');
reset();
ok('G6 Group Bars is the default view', FAF_STATE.view==='bars');
reset(); FAF_STATE.view='bars';
var dl=render('l');
ok('G7 Detail shows the active view AND the asset table', has(dl,'faf-bars')&&has(dl,'role="table"')&&has(dl,'faf-body-split'));
reset(); FAF_STATE.view='donut';
dl=render('l');
ok('G8 Detail shows the donut AND the asset table', has(dl,'faf-seg')&&has(dl,'role="table"'));
reset(); FAF_STATE.view='assets';
dl=render('l');
ok('G9 Detail with the asset table as the active view renders it once, full width', (dl.match(/role="table"/g)||[]).length===1&&!has(dl,'faf-body-split'));
reset();
ok('G10 Explore shows the active view only, no second panel', !has(render('m'),'faf-body-split'));

/* ---- H. the totals row */
reset(); FAF_STATE.dim='cls'; FAF_STATE.group='Office Equipment'; FAF_STATE.view='assets';
var ht=render('l');
var hrows=fafSortedAssets(FAF_STATE);
ok('H1 a totals row is present', has(ht,'faf-totalrow')&&has(ht,'role="rowheader"'));
ok('H2 the totals row shows the asset count', has(ht,'>'+hrows.length+' assets<'));
ok('H3 the totals row carries a total for EVERY measure', FAF_MEASURES.every(function(m){
  var t=hrows.reduce(function(s,a){return s+fafValue(a,m.k);},0);
  return has(ht,'Total '+m.l+', '+fafMoneyFull(t));
}));
ok('H4 header, body and totals are three rowgroups', (ht.match(/role="rowgroup"/g)||[]).length===3);

/* ---- I. the data rules the handoff doc singles out */
var a1=FAF_ASSETS[0];
ok('I1 Depreciable Value is Cost minus Salvage Value', fafValue(a1,'depr')===a1.cost-a1.salv);
ok('I2 Net Value is Depreciable Value minus Accumulated Depreciation, NOT Cost minus it', fafValue(a1,'net')===(a1.cost-a1.salv)-a1.dep && fafValue(a1,'net')!==a1.cost-a1.dep);
ok('I3 Capitalized Value and Cost are direct fields, not derived', fafValue(a1,'cap')===a1.cap&&fafValue(a1,'cost')===a1.cost);
ok('I4 Accumulated Depreciation is the book figure only, no tax field exists to include', fafValue(a1,'accum')===a1.dep && !('depTax' in a1));

/* ---- J. the chart population rule: chart excludes zero, table keeps it */
reset(); FAF_STATE.dim='room'; FAF_STATE.measure='net';
var cj=fafChartRows(FAF_STATE);
ok('J1 there is a group whose selected measure totals zero', cj.zero.length>0, 'zero groups '+cj.zero.length);
ok('J2 the chart EXCLUDES it', cj.charted.every(function(g){return g.total!==0;}));
FAF_STATE.view='bars'; var jb=render('m');
ok('J3 the excluded group is named in a visible note, not silently dropped', cj.zero.every(function(g){return has(jb,fafEsc(g.name));}));
ok('J4 the note says the table is not filtered that way', has(jb,'still appears in the asset table'));
FAF_STATE.group=cj.zero[0].name; FAF_STATE.view='assets';
var jt=render('l');
ok('J5 the zero-value group is still selectable and its assets still appear in the table', has(jt,'role="table"')&&fafAssetsInGroup(FAF_STATE).length>0);
FAF_STATE.view='donut'; var jd=render('m');
ok('J6 the donut applies the same exclusion and the same note', cj.zero.every(function(g){return has(jd,fafEsc(g.name));}));
ok('J7 table and chart read the same state, so neither shows a population the other does not', (function(){
  reset();FAF_STATE.dim='cls';FAF_STATE.measure='cost';FAF_STATE.view='bars';
  var b=render('m');
  return fafGroupTotals(FAF_STATE).filter(function(g){return g.total!==0;}).every(function(g){return has(b,fafEsc(g.name));});
})());

/* ---- K. the empty and placeholder states */
reset(); FAF_STATE.dataset='none';
var eK=render('k'), eM=render('m'), eL=render('l');
ok('K1 no fixed assets at all: Glance renders a clean state, not a throw or a blank', eK.length>150&&has(eK,'No assets'));
ok('K2 no fixed assets at all: Explore renders a clean state', has(eM,'No fixed assets')&&has(eM,'class="state"'));
ok('K3 no fixed assets at all: Detail renders a clean state', has(eL,'No fixed assets'));
ok('K4 the empty state is LABELLED as unspecified rather than presented as designed', has(eM,'not specified in any source')&&has(eM,'Settled by: Design and owner.'));
ok('K5 the empty state invents no figure', !/\$\d/.test(eM));
ok('K6 org totals are 0 with no assets, and nothing throws', fafOrgNetTotal(FAF_STATE)===0&&fafOrgAssetCount(FAF_STATE)===0);
reset(); FAF_STATE.state='unspecified';
var uM=render('m');
ok('K7 the remaining unspecified states render one honest placeholder naming them all', has(uM,'State not specified')&&has(uM,'No module rights, loading, error or API failure'));
ok('K8 that placeholder names who settles it', has(uM,'Settled by: Design and owner.'));
reset();

/* ---- L. the nine unsettled facts are rendered, not resolved */
var oM=render('m'), oL=render('l');
ok('L1 the open-items panel renders at Explore', has(oM,'faf-open')&&has(oM,'9 facts about this widget are not settled'));
ok('L2 the open-items panel renders at Detail', has(oL,'faf-open'));
ok('L3 all nine items are present with an owner', FAF_OPEN.every(function(o){return has(oL,'Settled by: '+o.who+'.');})&&(oL.match(/faf-gap/g)||[]).length>=9);
ok('L4 the panel does not appear at Glance, which has no room and no controls', !has(gK,'class="faf-open"'));

/* ---- M. download, shortening, and the visible note */
reset(); FAF_STATE.view='assets';
var dM=render('m'); var dL=render('l');
ok('M1 download is available at Explore', has(dM,'data-faf="download"'));
ok('M2 download is available at Detail', has(dL,'data-faf="download"'));
ok('M3 a visible note says the figures are shortened and where the full ones are', has(dM,'Figures on screen are shortened')&&has(dM,'Download carries the full unshortened figure'));
ok('M4 the download handler fires and says it carries full figures', (function(){TOASTS.length=0;click({'data-faf':'download'});return TOASTS.length===1&&has(TOASTS[0],'full unshortened figures');})());
ok('M5 shortening happens in the front end from the same values', fafMoneyShort(2784150)==='$2.8M'&&fafMoneyShort(78750)==='$78.8K'&&fafMoneyShort(0)==='$0');
ok('M6 the exact value is in both title and aria-label wherever a figure is shortened', (function(){
  var a=FAF_ASSETS[2];
  reset();FAF_STATE.dim='cls';FAF_STATE.group='Buildings';FAF_STATE.view='assets';
  var h=render('l');
  var exact=a.tag+', '+a.nm+', Net Value '+fafMoneyFull(fafValue(a,'net'));
  return has(h,'title="'+fafEsc(exact)+'" aria-label="'+fafEsc(exact)+'"');
})());

/* ---- N. accessibility and view-only guarantees */
reset(); FAF_STATE.view='assets';
var nL=render('l');
ok('N1 real table semantics: role=table with row and column counts', has(nL,'role="table"')&&has(nL,'aria-rowcount=')&&has(nL,'aria-colcount="7"'));
ok('N2 columnheader, cell and rowheader roles are used', has(nL,'role="columnheader"')&&has(nL,'role="cell"')&&has(nL,'role="rowheader"'));
ok('N3 aria-sort is real where a sort control exists and "none" where it does not', has(nL,'aria-sort="ascending"')&&has(nL,'aria-sort="none"'));
ok('N4 the sort control is a real button, keyboard reachable', has(nL,'<button class="wt-sort'));
ok('N5 the three dropdowns are real buttons with listbox semantics', (function(){reset();var h=render('m');return (h.match(/aria-haspopup="listbox"/g)||[]).length===3;})());
ok('N6 the view switch segments are real buttons with aria-pressed', (function(){var h=render('m');return (h.match(/aria-pressed=/g)||[]).length===3;})());
ok('N7 chart values are text in the DOM, not hover only', (function(){reset();FAF_STATE.view='bars';var h=render('m');return has(h,'faf-barval-amt');})());
ok('N8 donut values are text in the legend too', (function(){reset();FAF_STATE.view='donut';var h=render('m');return has(h,'lg-meta');})());
ok('N9 no drill, no row click, no segment click anywhere in the output', (function(){
  reset();var all='';['k','m','l'].forEach(function(s){['bars','donut','assets'].forEach(function(v){FAF_STATE.view=v;all+=render(s);});});
  return !/data-faf="(row|asset|seg|drill|open)/.test(all)&&!has(all,'onclick');
})());
ok('N10 clicking an inert target is a no-op', (function(){reset();var before=JSON.stringify(FAF_STATE);click({'data-faf':'stop'});return JSON.stringify(FAF_STATE)===before;})());
ok('N11 nothing in the build offers a time filter or a depreciation method', (function(){
  reset();var all='';['k','m','l'].forEach(function(s){['bars','donut','assets'].forEach(function(v){FAF_STATE.view=v;all+=render(s);});});
  /* the prose deliberately SAYS "no fiscal year", so this tests for the absence of
     actual controls plus the presence of the statement, not for the absence of words */
  return !/Straight Line|Declining Balance|data-faf="(year|period|date|method)"/i.test(all)&&has(all,'no time filter');
})());

/* ---- O. sort */
reset(); FAF_STATE.dim='cls'; FAF_STATE.group='Office Equipment';
ok('O1 the proposed default is Tag number ascending', FAF_STATE.sort==='tag-asc'&&fafSortedAssets(FAF_STATE)[0].tag==='FA-1007');
ok('O2 that default is rendered as unconfirmed, not asserted', (function(){FAF_STATE.view='assets';return has(render('l'),'proposed only and was never confirmed');})());
click({'data-faf':'sort','data-k':'tag'});
ok('O3 clicking the Tag # sort flips its direction', FAF_STATE.sort==='tag-desc');
click({'data-faf':'sort','data-k':'nm'});
ok('O4 clicking Name switches the key and starts ascending', FAF_STATE.sort==='nm-asc');
ok('O5 the trim rule for the narrower size is flagged, not invented', (function(){FAF_STATE.view='assets';return has(render('m'),'all seven columns are kept');})());

/* ---- P. the chip popovers open, close and set state */
reset();
click({'data-faf':'measure'});
ok('P1 the Financial Measure chip opens its popover', !!(FAF_POP&&FAF_POP.type==='measure'));
ok('P2 the popover lists exactly the five measures', (function(){var p=fafPopContent();EMSWEEP.push(p);return (p.match(/data-faf="set-measure"/g)||[]).length===5;})());
click({'data-faf':'set-measure','data-v':'cost'});
ok('P3 picking a measure sets it and closes the popover', FAF_STATE.measure==='cost'&&FAF_POP===null);
click({'data-faf':'dim'});
ok('P4 the Group By chip opens its popover', !!(FAF_POP&&FAF_POP.type==='dim'));
ok('P5 the popover lists exactly the six dimensions', (function(){var p=fafPopContent();EMSWEEP.push(p);return (p.match(/data-faf="set-dim"/g)||[]).length===6;})());
click({'data-faf':'dim'});
ok('P6 clicking the chip again closes it', FAF_POP===null);
click({'data-faf':'group'});
ok('P7 the Specific Group chip opens its popover', !!(FAF_POP&&FAF_POP.type==='group'));
ok('P8 it lists the groups of the CURRENT dimension only', (function(){
  var p=fafPopContent();EMSWEEP.push(p);
  return (p.match(/data-faf="set-group"/g)||[]).length===fafGroupNames(FAF_STATE).length;
})());
FAF_POP=null;

/* ---- Q. the em-dash sweep, over every state x size x view x measure x dimension */
reset();
var COMBOS=0;
FAF_DIMS.forEach(function(d){
  FAF_MEASURES.forEach(function(m){
    ['bars','donut','assets'].forEach(function(v){
      ['k','s','m','l','x'].forEach(function(sz){
        reset();FAF_STATE.dim=d.k;FAF_STATE.measure=m.k;FAF_STATE.view=v;
        EMSWEEP.push(fafRender(11,sz));COMBOS++;
        var g=fafGroupNames(FAF_STATE);
        if(g.length){FAF_STATE.group=g[g.length-1];EMSWEEP.push(fafRender(11,sz));COMBOS++;}
      });
    });
  });
});
[['none',null],[null,'unspecified']].forEach(function(st){
  ['k','m','l'].forEach(function(sz){
    reset();FAF_STATE.dataset=st[0];FAF_STATE.state=st[1];
    EMSWEEP.push(fafRender(11,sz));COMBOS++;
  });
});
var joined=EMSWEEP.join('\n');
var em=(joined.match(/—/g)||[]).length, en=(joined.match(/–/g)||[]).length;
ok('Q1 no em dash in any rendered string, across '+COMBOS+' combinations', em===0, 'found '+em);
ok('Q2 no en dash either', en===0, 'found '+en);
ok('Q3 the sweep actually exercised every combination', COMBOS>=180, 'combos '+COMBOS);
ok('Q4 no combination threw and none rendered blank', EMSWEEP.every(function(h){return typeof h==='string'&&h.length>100;}));
ok('Q5 no combination leaked an undefined, NaN or [object Object]', !/undefined|NaN|\[object Object\]/.test(joined));

reset();
console.log('=== W11 faF DOM-shim driver ===');
LOG.forEach(function(l){console.log(l);});
console.log('');
console.log((FAIL?'FAIL':'PASS')+' -- '+PASS+' assertions passed, '+FAIL+' failed');
process.exit(FAIL?1:0);
