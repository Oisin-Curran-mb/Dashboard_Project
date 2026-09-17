// Minimal DOM shim. Real faF code is required verbatim from the live file below.
var TOASTS=[];
function showToast(m){TOASTS.push(m);}
var POP_EL=null, LISTENERS={};
function mkEl(){
  return {
    id:'', className:'', innerHTML:'', style:{}, _attrs:{},
    offsetWidth:240, offsetHeight:200,
    setAttribute:function(k,v){this._attrs[k]=v;},
    getAttribute:function(k){return (k in this._attrs)?this._attrs[k]:null;},
    appendChild:function(){}, remove:function(){ POP_EL=null; },
    getBoundingClientRect:function(){return {left:100,right:220,top:100,bottom:126,width:120,height:26};},
    closest:function(sel){ return sel==='.faf-root'?this:null; }
  };
}
global.document={
  getElementById:function(id){ return id==='fafPop'?POP_EL:null; },
  createElement:function(){ var e=mkEl(); POP_EL=e; return e; },
  body:{appendChild:function(){}},
  addEventListener:function(t,fn){ (LISTENERS[t]=LISTENERS[t]||[]).push(fn); },
  querySelector:function(){return null;},
  querySelectorAll:function(){return [];}
};
global.window={innerWidth:1440,innerHeight:900,addEventListener:function(){}};
global.requestAnimationFrame=function(fn){fn();};
var RENDERS=0;
global.FC_STATE={11:{opt:'F',sz:{k:'k',s:'s',m:'m',l:'l'}}};
global.fcRenderWidget=function(){RENDERS++;};
global.FC_KPI_HEADLINE={};
global.WRENDER={};
// a synthetic click target that satisfies closest()/getAttribute()
function target(attrs){
  var o={_a:attrs||{}};
  o.getAttribute=function(k){return (k in o._a)?o._a[k]:null;};
  o.getBoundingClientRect=function(){return {left:100,right:220,top:100,bottom:126,width:120,height:26};};
  o.closest=function(sel){
    if(sel==='.faf-root') return o;
    var m=/^\[data-faf(?:="([^"]*)")?\]$/.exec(sel);
    if(m){ if(!('data-faf' in o._a)) return null; if(m[1]!==undefined&&o._a['data-faf']!==m[1]) return null; return o; }
    if(sel==='#fafPop') return null;
    return null;
  };
  return o;
}
function click(attrs){ fafOnClick({target:target(attrs)}); }
/* ===== W11 FINAL, Fixed Asset Values (prefix faF / FAF_) =====================
   Built from scratch 2026-09-03 against
   "Step 3 - Mock_Work/W11 - Fixed Asset Values - BUILD REQUIREMENTS (handoff).md",
   which is the ONLY source for what this widget does. The Step 4 doc was read for
   background; where the two differ the handoff doc wins, because it was written from
   the Step 4 doc plus the Step 1 research and is the owner's current statement of
   requirements. The previous Final was deleted on purpose and none of it is reused:
   not its data, not its layout, not its logic.

   Everything here is faF- / FAF_-prefixed. WRENDER[11]'s A/B/C branches below are
   untouched, as are their MOCK_DATA.series[11] rows. The FAF_ sample data are
   STANDALONE constants, not MOCK_DATA entries, so mock-data.master.js needs no
   re-sync.

   THE TWO DATA RULES THE HANDOFF DOC SINGLES OUT AS EASY TO GET WRONG (section 2),
   both implemented in fafValue below:
     Net Value is NOT Cost minus Accumulated Depreciation. The base is Depreciable
     Value, which is already Cost minus Salvage Value. Step 1 records this as a
     correction to its own earlier wording, so any build using Cost as the base is
     wrong.
     Accumulated Depreciation EXCLUDES tax depreciation. The !Tax condition is part
     of the definition, not an optimisation, so the sample dep field below is book
     depreciation only.

   NO TIME FILTER OF ANY KIND (section 3, and section 10's cut list): no fiscal
   year, no date range, no period. These are current book values. Nor is there a
   Depreciation Method filter, a dominant-group percentage KPI, any drill-through,
   row click, segment click or navigation away, or any write, approval or status
   action. The widget is view only.

   THE NINE UNSETTLED FACTS (section 9) ARE NOT RESOLVED BY THIS BUILD. Each one is
   rendered as a visible, labelled placeholder naming what is missing and who
   settles it (fafGap / fafOpenPanel below), never as a plausible-looking value.
   Most consequential: three of the six Group By options (Asset Account,
   Accumulated Depreciation Account, Expense Account) return an empty list on the
   target Modern API today, and what the widget should render in that case is
   unspecified, so it renders a placeholder rather than a guess. The handoff doc
   calls that the state a user is most likely to hit.
   ========================================================================== */

/* (1) SAMPLE DATA ----------------------------------------------------------
   Sixteen assets, enough to exercise every path the requirements describe: a low
   cardinality dimension (Class, 5 groups), a mid one (Building, 3 groups plus
   "not assigned") and a higher one (Room, 5 groups plus "not assigned"); the real
   "not assigned" group, which section 2 says is a real selectable group and not an
   error state; and three fully depreciated assets so that Room grouped by Net Value
   contains a genuinely zero-value group, which the chart must exclude and the table
   must keep (section 4's chart population rule).
   NOTE, deliberately: no Asset Account, Accumulated Depreciation Account or Expense
   Account values are carried on these records. Those three dimensions return an
   empty list on the target API (section 9 item 4), and inventing account codes so
   they appeared to work would be exactly the plausible value the handoff doc
   forbids. They render the placeholder state instead.
   salv is Salvage Value, used only to derive Depreciable Value.
   dep is BOOK accumulated depreciation, SUM(Depreciation) WHERE !Tax. */
var FAF_ASSETS=[
  {tag:'FA-1001',nm:'Sanctuary Sound System',cls:'Audio Visual',bldg:'Main Campus',room:'Sanctuary',cap:128400,cost:132000,salv:6000,dep:47250},
  {tag:'FA-1002',nm:'Sanctuary Lighting Rig',cls:'Audio Visual',bldg:'Main Campus',room:'Sanctuary',cap:61800,cost:63500,salv:2500,dep:28900},
  {tag:'FA-1003',nm:'Main Campus Building',cls:'Buildings',bldg:'Main Campus',room:'',cap:2450000,cost:2450000,salv:200000,dep:612500},
  {tag:'FA-1004',nm:'Family Life Center',cls:'Buildings',bldg:'Family Life Center',room:'',cap:1180000,cost:1180000,salv:90000,dep:218000},
  {tag:'FA-1005',nm:'Passenger Van',cls:'Vehicles',bldg:'Main Campus',room:'',cap:42600,cost:43900,salv:5000,dep:31200},
  {tag:'FA-1006',nm:'Bus, 14 Seat',cls:'Vehicles',bldg:'Annex',room:'',cap:68250,cost:70000,salv:8000,dep:55800},
  {tag:'FA-1007',nm:'Nursery Furnishings',cls:'Office Equipment',bldg:'Family Life Center',room:'Nursery',cap:18400,cost:19100,salv:0,dep:12650},
  {tag:'FA-1008',nm:'Office Workstations',cls:'Office Equipment',bldg:'Main Campus',room:'Office 201',cap:24750,cost:25400,salv:0,dep:19300},
  {tag:'FA-1009',nm:'Commercial Kitchen Range',cls:'Office Equipment',bldg:'Family Life Center',room:'Kitchen',cap:31900,cost:32800,salv:1500,dep:14400},
  {tag:'FA-1010',nm:'Fellowship Hall Tables',cls:'Office Equipment',bldg:'Family Life Center',room:'Fellowship Hall',cap:9600,cost:9900,salv:0,dep:9900},
  {tag:'FA-1011',nm:'Parking Lot Resurfacing',cls:'Land Improvements',bldg:'',room:'',cap:86000,cost:86000,salv:0,dep:34400},
  {tag:'FA-1012',nm:'Playground Equipment',cls:'Land Improvements',bldg:'Annex',room:'',cap:47300,cost:48500,salv:2000,dep:18600},
  {tag:'FA-1013',nm:'Annex HVAC Units',cls:'Office Equipment',bldg:'Annex',room:'',cap:54200,cost:55800,salv:3000,dep:22300},
  {tag:'FA-1014',nm:'Choir Risers',cls:'Audio Visual',bldg:'Main Campus',room:'Sanctuary',cap:7400,cost:7600,salv:0,dep:7600},
  {tag:'FA-1015',nm:'Media Cameras',cls:'Audio Visual',bldg:'Main Campus',room:'Office 201',cap:22100,cost:22800,salv:900,dep:11450},
  {tag:'FA-1016',nm:'Storage Shed',cls:'Land Improvements',bldg:'Annex',room:'',cap:12800,cost:13200,salv:0,dep:13200}
];
var FAF_ASSETS_EMPTY=[];
var FAF_NA='not assigned';

/* Group By, section 3. All six are offered, as the design does, and the three the
   Modern API does not implement are marked so on the menu rather than silently
   presented as working (section 9 item 4: a build that offers all six without
   acknowledging this produces three dead selections). */
var FAF_DIMS=[
  {k:'cls',      l:'Class',                              impl:true},
  {k:'bldg',     l:'Building',                           impl:true},
  {k:'room',     l:'Room',                               impl:true},
  {k:'acctAsset',l:'Asset Account',                      impl:false},
  {k:'acctAccum',l:'Accumulated Depreciation Account',   impl:false},
  {k:'acctExp',  l:'Expense Account',                    impl:false}
];
/* Financial Measure, section 3, in the order the handoff doc lists them, which is
   also the order the table's measure columns keep once the selected one has moved
   to the front (section 6). */
var FAF_MEASURES=[
  {k:'cap',  l:'Capitalized Value',       short:'Capitalized'},
  {k:'cost', l:'Cost',                    short:'Cost'},
  {k:'depr', l:'Depreciable Value',       short:'Depreciable'},
  {k:'accum',l:'Accumulated Depreciation',short:'Accum. Depn'},
  {k:'net',  l:'Net Value',               short:'Net Value'}
];

/* Section 3: all three selections persist per user across sessions. Legacy stores
   them in SSUserTenantPreferenceRepository under UserPreferences.WidgetFixedAssets.
   Held here as widget state so the mockup behaves as if persisted, per Rule 11. The
   Modern API does NOT persist them server-side (section 9 item 5), which is a
   backend-team item and is rendered as an open item rather than assumed away.
   view defaults to 'bars' (Group Bars), which section 6 lists first and the Step 4
   doc marks as the default view. */
var FAF_STATE={id:'11F',size:'wide',dim:'cls',group:null,measure:'net',view:'bars',sort:'tag-asc',dataset:null,state:null};
var FAF_POP=null;

/* The amethyst chart ramp, styling reference section 8.2: largest share darkest, no
   red on bars or arcs. Colour is never the only signal; every bar and every arc
   carries its group name and its value as text in the DOM (accessibility
   requirements 1 and 2 in the handoff doc). */
var FAF_COLORS=['--am-600','--am-500','--am-400','--am-300','--am-200'];

/* (2) THE NINE UNSETTLED FACTS, as renderable placeholders --------------------
   One entry per row of the handoff doc's section 9. Nothing here invents an answer;
   each states what is missing and who settles it. */
var FAF_OPEN=[
  {n:1,txt:'Table sort default. Tag number ascending is proposed only and was never confirmed against the legacy design.',who:'Owner'},
  {n:2,txt:'Whether this widget is for tracking total asset value or for flagging assets needing attention, such as fully depreciated or due for replacement. Posed to the UX specialist, unanswered.',who:'Owner and SME'},
  {n:3,txt:'Whether a depreciation curve, value over time, belongs on this widget, or whether current book value is all that is needed. Posed, unanswered.',who:'Owner and SME'},
  {n:4,txt:'The Modern API implements Specific Group for Class, Building and Room only. Asset Account, Accumulated Depreciation Account and Expense Account hit an unimplemented switch case and return an empty list. This design offers all six.',who:'Backend team'},
  {n:5,txt:'The Modern API does not persist the three selections server-side; it is client managed only. This design commits to per-user persistence across sessions.',who:'Backend team'},
  {n:6,txt:'The organisation-wide Total Net Value summation behind the Glance figure is not spelled out in any source.',who:'Owner'},
  {n:7,txt:'How the asset table trims at the smallest size it appears at. All seven columns are kept here and the table scrolls sideways instead, because no trim rule exists to follow.',who:'Design'},
  {n:8,txt:'The unspecified states: no module rights, no fixed assets at all, an unimplemented Group By dimension, loading, error or API failure, and stale data or a "data as of" signal.',who:'Design and owner'},
  {n:9,txt:'Hover content, click behaviour and keyboard behaviour for the bars and the donut. Hover shows the group value, which is the one documented behaviour; click and keyboard are not defined.',who:'Design'}
];
/* (3) HELPERS -------------------------------------------------------------- */
function fafRerender(){ if(typeof FC_STATE!=='undefined'&&FC_STATE[11]&&FC_STATE[11].opt==='F'&&typeof fcRenderWidget==='function') fcRenderWidget(11); }
function fafIcon(n){return '<span class="material-symbols-rounded" aria-hidden="true">'+n+'</span>';}
function fafEsc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
/* The full, unshortened figure. This is what the download carries and what goes in
   every title and aria-label (section 6, "Numbers in the table"). */
function fafMoneyFull(n){return '$'+Number(Math.round(n)).toLocaleString();}
/* The shortened display figure. Section 6: the shortening happens in the FRONT END
   from the same underlying values, and no separate rounded dataset is created. */
function fafMoneyShort(n){
  var v=Number(n)||0, sign=v<0?'-':'', a=Math.abs(v), out;
  if(a>=1e9) out=(a/1e9).toFixed(1)+'B';
  else if(a>=1e6) out=(a/1e6).toFixed(1)+'M';
  else if(a>=1e3) out=(a/1e3).toFixed(1)+'K';
  else return sign+'$'+Math.round(a).toLocaleString();
  out=out.replace(/\.0([BMK])$/,'$1');
  return sign+'$'+out;
}
function fafDimDef(k){for(var i=0;i<FAF_DIMS.length;i++){if(FAF_DIMS[i].k===k)return FAF_DIMS[i];}return FAF_DIMS[0];}
function fafMeasDef(k){for(var i=0;i<FAF_MEASURES.length;i++){if(FAF_MEASURES[i].k===k)return FAF_MEASURES[i];}return FAF_MEASURES[FAF_MEASURES.length-1];}
function fafDataset(w){return (w.dataset==='none')?FAF_ASSETS_EMPTY:FAF_ASSETS;}
/* The five financial measures, section 2. Depreciable Value and Net Value are
   derived here rather than stored, and Net Value's base is Depreciable Value. */
function fafValue(a,mk){
  if(mk==='cap')  return a.cap;
  if(mk==='cost') return a.cost;
  if(mk==='depr') return a.cost-a.salv;
  if(mk==='accum')return a.dep;
  return (a.cost-a.salv)-a.dep;
}
/* Section 2: an asset with no group appears under a group named "not assigned",
   which is a real group and must be selectable. */
function fafGroupOf(a,dimk){var v=a[dimk];return (v===undefined||v===null||v==='')?FAF_NA:v;}
/* The groups that exist within the selected Group By, "not assigned" last. An
   unimplemented dimension returns an empty list, which is what the target API does
   today (section 7, section 9 item 4). */
function fafGroupNames(w){
  var d=fafDimDef(w.dim);
  if(!d.impl) return [];
  var seen={},out=[];
  fafDataset(w).forEach(function(a){var g=fafGroupOf(a,d.k);if(!seen[g]){seen[g]=1;out.push(g);}});
  out.sort(function(x,y){
    if(x===FAF_NA) return 1;
    if(y===FAF_NA) return -1;
    return x.localeCompare(y);
  });
  return out;
}
/* Every group in the dimension with its selected-measure total and asset count.
   NOT filtered here: the chart filters this list, the table does not (section 4). */
function fafGroupTotals(w){
  var d=fafDimDef(w.dim),mk=w.measure;
  return fafGroupNames(w).map(function(g){
    var items=fafDataset(w).filter(function(a){return fafGroupOf(a,d.k)===g;});
    return {name:g,count:items.length,total:items.reduce(function(s,a){return s+fafValue(a,mk);},0)};
  });
}
function fafCurrentGroup(w){
  var names=fafGroupNames(w);
  if(!names.length) return null;
  return (w.group!==null&&names.indexOf(w.group)>=0)?w.group:names[0];
}
function fafAssetsInGroup(w){
  var d=fafDimDef(w.dim),g=fafCurrentGroup(w);
  if(g===null) return [];
  return fafDataset(w).filter(function(a){return fafGroupOf(a,d.k)===g;});
}
/* Section 6: proposed default is Tag number ascending, and that default is NOT
   confirmed (open item 1). Name is the one alternative sort; the five measure
   columns carry aria-sort="none" because they have no sort control. */
function fafSortedAssets(w){
  var rows=fafAssetsInGroup(w).slice();
  var parts=(w.sort||'tag-asc').split('-'),key=parts[0],dir=parts[1]==='asc'?1:-1;
  rows.sort(function(a,b){
    if(key==='nm') return dir*a.nm.localeCompare(b.nm);
    return dir*a.tag.localeCompare(b.tag);
  });
  return rows;
}
/* Section 5, Glance: Total Net Value across ALL fixed assets, organisation wide. It
   ignores Group By, Specific Group and Financial Measure entirely. It is always Net
   Value and always org-wide, so it reads the whole dataset and no selection. */
function fafOrgNetTotal(w){return fafDataset(w).reduce(function(s,a){return s+fafValue(a,'net');},0);}
function fafOrgAssetCount(w){return fafDataset(w).length;}
/* The measure order the table uses: the selected measure first, then the rest in
   the handoff doc's own order (section 6). */
function fafMeasureOrder(w){
  var sel=fafMeasDef(w.measure);
  return [sel].concat(FAF_MEASURES.filter(function(m){return m.k!==sel.k;}));
}

/* (4) PLACEHOLDER ATOMS ----------------------------------------------------
   A placeholder names what is missing and who settles it, and carries no figure.
   That way a later reader, human or spec writer, sees an absence rather than a
   contract built around an invented field. */
function fafGap(txt,who){
  return '<div class="faf-gap">'+fafIcon('help')+'<span>'+fafEsc(txt)+' <span class="faf-gap-who">Settled by: '+fafEsc(who)+'.</span></span></div>';
}
function fafOpenPanel(){
  var items=FAF_OPEN.map(function(o){
    return '<div class="faf-gap">'+fafIcon('help')+'<span>'+o.n+'. '+fafEsc(o.txt)+' <span class="faf-gap-who">Settled by: '+fafEsc(o.who)+'.</span></span></div>';
  }).join('');
  return '<div class="faf-open">'+
    '<div class="faf-open-hd">'+fafIcon('rule')+'<span>'+FAF_OPEN.length+' facts about this widget are not settled. This build decided none of them.</span></div>'+
    '<div class="faf-open-list">'+items+'</div></div>';
}
/* (5) CONTROLS, section 3: three selections and no others ------------------ */
function fafChip(type,label,aria,dead){
  return '<button class="filter-chip'+(dead?' faf-chip-dead':'')+'" data-faf="'+type+'"'+
    ' aria-haspopup="listbox" aria-expanded="'+((FAF_POP&&FAF_POP.type===type)?'true':'false')+'"'+
    ' aria-label="'+fafEsc(aria)+'">'+
    '<span class="fc-label">'+fafEsc(label)+'</span>'+fafIcon('expand_more')+'</button>';
}
function fafControls(w){
  var d=fafDimDef(w.dim),m=fafMeasDef(w.measure),g=fafCurrentGroup(w);
  var groupLbl=(g===null)?'No groups returned':g;
  return '<div class="faf-chiprow">'+
    fafChip('dim','Group by: '+d.l,'Group by, currently '+d.l,false)+
    fafChip('group','Group: '+groupLbl,'Specific group, currently '+groupLbl,g===null)+
    fafChip('measure','Measure: '+m.l,'Financial measure, currently '+m.l,false)+
  '</div>';
}
/* Section 6: three views, switchable at Explore and Detail. A segmented control
   rather than a dropdown, per the styling reference's rule for a small fixed set of
   options, and it lives in the widget's OWN header the way every other Final in
   this file does. The card menu's "Switch chart type" block is not the route: the
   shared fcApplyMenuTrim hides that block generically for any widget whose opt is
   'F', because it drives gs(wid).view for A/B/C and would no-op here. */
function fafViewToggle(w){
  var v=w.view||'bars';
  function seg(val,lbl,ic,tip){
    return '<button class="vt'+(v===val?' on':'')+'" data-faf="view" data-v="'+val+'" aria-pressed="'+(v===val)+'" title="'+fafEsc(tip)+'">'+fafIcon(ic)+lbl+'</button>';
  }
  return '<div class="vtoggle faf-vtoggle" role="group" aria-label="View">'+
    seg('bars','Group Bars','bar_chart','One bar per group in the selected Group By, valued by the selected measure. This is the view that copes with a high cardinality dimension such as Room.')+
    seg('donut','Donut','donut_small','The same data as a donut. Suited to a low cardinality dimension such as Class, and closest to the legacy widget chart.')+
    seg('assets','Asset Detail','table_rows','Individual assets within the selected specific group, with all five financial measures and a totals row.')+
  '</div>';
}
/* Section 6: download is available at Explore and Detail and carries the full
   unshortened figures for every measure, not the shortened display values. */
function fafDownloadBtn(){
  return '<button class="btn sm naked" data-faf="download" title="Download every measure at full precision, not the shortened figures shown on screen.">'+fafIcon('download')+'Download</button>';
}
function fafHeader(w){
  var m=fafMeasDef(w.measure),d=fafDimDef(w.dim);
  var ctx='Current book values, grouped by '+d.l+' and valued by '+m.l+'. This widget has no time filter: no fiscal year, no date range, no period.';
  return '<div class="dep-hd faf-hd"><div class="dep-hd-top">'+fafControls(w)+
    '<div class="dep-hd-toggle">'+fafViewToggle(w)+fafDownloadBtn()+'</div></div>'+
    '<div class="dep-hd-num"><div class="faf-ctx">'+fafEsc(ctx)+'</div></div></div>';
}
function fafShortenNote(){
  return '<div class="faf-note">'+fafIcon('info')+'<span>Figures on screen are shortened. Download carries the full unshortened figure for every measure, and the exact figure is on hover and available to a screen reader.</span></div>';
}

/* (6) CHART POPULATION, section 4 ----------------------------------------
   The rule a build must not get wrong in either direction: the chart plots all
   groups in the dimension EXCLUDING any group whose selected measure totals zero,
   and the TABLE is not filtered that way. The excluded groups are named in a note
   beneath the chart, so the information stays in the DOM as text rather than
   silently disappearing. */
function fafChartRows(w){
  var all=fafGroupTotals(w);
  var charted=all.filter(function(g){return g.total!==0;}).slice().sort(function(a,b){return Math.abs(b.total)-Math.abs(a.total);});
  var zero=all.filter(function(g){return g.total===0;});
  return {all:all,charted:charted,zero:zero,total:charted.reduce(function(s,g){return s+g.total;},0)};
}
function fafZeroNote(w,cut){
  if(!cut.length) return '';
  var m=fafMeasDef(w.measure);
  var names=cut.map(function(g){return g.name;}).join(', ');
  return '<div class="faf-note">'+fafIcon('info')+'<span>'+cut.length+' group'+(cut.length===1?'':'s')+' with no '+fafEsc(m.l)+' ('+fafEsc(names)+') '+(cut.length===1?'is':'are')+' excluded from the chart, as the widget defines it. A zero value group still appears in the asset table.</span></div>';
}
function fafChartHoverGap(what){
  return fafGap('Hover shows the group value, which is the only documented chart behaviour. Click and keyboard behaviour for the '+what+' are not specified, so they are inert.','Design');
}

/* (7) VIEW 1, GROUP BARS, section 6 -------------------------------------- */
function fafBars(w){
  var m=fafMeasDef(w.measure),d=fafDimDef(w.dim),c=fafChartRows(w);
  if(!c.charted.length){
    return '<div class="faf-chart-empty">'+fafIcon('bar_chart')+'<span>No group in '+fafEsc(d.l)+' has a '+fafEsc(m.l)+' to chart.</span></div>'+fafZeroNote(w,c.zero);
  }
  var max=Math.abs(c.charted[0].total)||1;
  var bars=c.charted.map(function(g,i){
    var col=FAF_COLORS[i%FAF_COLORS.length];
    var pctW=Math.max(1,Math.round(Math.abs(g.total)/max*100));
    var tip=g.name+', '+m.l+' '+fafMoneyFull(g.total)+', '+g.count+' asset'+(g.count===1?'':'s')+'.';
    return '<div class="faf-barrow" title="'+fafEsc(tip)+'" aria-label="'+fafEsc(tip)+'">'+
      '<span class="faf-barlbl"><span class="faf-barlbl-nm">'+fafEsc(g.name)+'</span><span class="faf-barlbl-sub">'+g.count+' asset'+(g.count===1?'':'s')+'</span></span>'+
      '<span class="faf-bartrack" aria-hidden="true"><span class="faf-barfill" style="width:'+pctW+'%;background:var('+col+')"></span></span>'+
      '<span class="faf-barval"><span class="faf-barval-amt">'+fafMoneyShort(g.total)+'</span><span class="faf-barval-cnt">'+fafEsc(m.short)+'</span></span>'+
    '</div>';
  }).join('');
  return '<div class="faf-barscroll"><div class="faf-bars">'+bars+'</div></div>'+
    fafZeroNote(w,c.zero)+fafChartHoverGap('bars');
}

/* (8) VIEW 2, DONUT BY GROUP, section 6 ---------------------------------- */
function fafDonut(w){
  var m=fafMeasDef(w.measure),d=fafDimDef(w.dim),c=fafChartRows(w);
  if(!c.charted.length||c.total===0){
    return '<div class="faf-chart-empty">'+fafIcon('donut_small')+'<span>No group in '+fafEsc(d.l)+' has a '+fafEsc(m.l)+' to chart.</span></div>'+fafZeroNote(w,c.zero);
  }
  var DS=({wide:320,xwide:240})[w.size]||200;
  var R=52,C=2*Math.PI*R,off=0,arcs='',legend='';
  c.charted.forEach(function(g,i){
    var col=FAF_COLORS[i%FAF_COLORS.length];
    var frac=Math.abs(g.total)/Math.abs(c.total),len=frac*C,pct=Math.round(frac*100);
    var lbl=g.name+', '+m.l+' '+fafMoneyFull(g.total)+', '+pct+' percent of the charted total, '+g.count+' asset'+(g.count===1?'':'s')+'.';
    arcs+='<circle class="faf-seg" cx="70" cy="70" r="'+R+'" fill="none" stroke="var('+col+')" stroke-width="20" stroke-dasharray="'+Math.min(len+0.9,C).toFixed(2)+' '+Math.max(0,C-len-0.9).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 70 70)"><title>'+fafEsc(lbl)+'</title></circle>';
    off+=len;
    legend+='<div class="leg faf-leg" title="'+fafEsc(lbl)+'"><span class="dot" style="background:var('+col+')"></span>'+
      '<span class="lg-main">'+fafEsc(g.name)+'</span>'+
      '<span class="lg-meta">'+fafMoneyShort(g.total)+' &middot; '+pct+'%</span></div>';
  });
  var aria=m.l+' by '+d.l+', '+fafMoneyFull(c.total)+' across '+c.charted.length+' group'+(c.charted.length===1?'':'s');
  return '<div class="faf-pie"><div class="pie-wrap row">'+
    '<svg class="donut" viewBox="0 0 140 140" width="'+DS+'" height="'+DS+'" role="img" aria-label="'+fafEsc(aria)+'">'+arcs+
    '<text x="70" y="67" text-anchor="middle" class="donut-c1">'+fafMoneyShort(c.total)+'</text>'+
    '<text x="70" y="86" text-anchor="middle" class="donut-c2">'+fafEsc(m.short)+'</text></svg>'+
    '<div class="legend-col"><div class="legend-head"><span class="legend-hd">'+fafEsc(m.l)+' by '+fafEsc(d.l)+'</span></div>'+
    '<div class="legend" style="max-height:'+DS+'px">'+legend+'</div></div></div>'+
    fafZeroNote(w,c.zero)+fafChartHoverGap('donut segments')+
  '</div>';
}
/* (9) VIEW 3, ASSET DETAIL TABLE, section 6 -----------------------------
   Tag number, Name and all five financial measures; the selected measure's column
   FIRST among the measures and identifiable as the lead figure; and a totals row
   showing the asset count and the column total for every measure.
   Real table semantics per the handoff doc's accessibility section and the styling
   reference's 7.1 pattern: role="table" with aria-rowcount and aria-colcount, three
   display:contents rowgroups so no box comes between the scroller and the flex
   rows, role="columnheader" / "cell" / "rowheader", aria-sort on the two sortable
   columns and "none" on the five that have no sort control, and the EXACT figure in
   aria-label as well as title wherever the display figure is shortened.
   The lead measure is marked by weight, a tinted cell AND the word "selected" in
   its header, so the distinction is never carried by colour alone. */
function fafSortBtn(w,k,label){
  var parts=(w.sort||'tag-asc').split('-'),on=parts[0]===k;
  var ic=on?(parts[1]==='asc'?'arrow_upward':'arrow_downward'):'unfold_more';
  return '<button class="wt-sort'+(on?' on':'')+'" data-faf="sort" data-k="'+k+'">'+fafEsc(label)+' '+fafIcon(ic)+'</button>';
}
function fafSortAria(w,k){
  var parts=(w.sort||'tag-asc').split('-');
  if(parts[0]!==k) return 'none';
  return parts[1]==='asc'?'ascending':'descending';
}
function fafAssetHead(w){
  var order=fafMeasureOrder(w),sel=order[0];
  var cells=order.map(function(m){
    var lead=m.k===sel.k;
    return '<span class="faf-c'+(lead?' faf-c-lead':'')+'" role="columnheader" aria-sort="none">'+fafEsc(m.short)+
      (lead?'<span class="faf-lead-tag">selected</span>':'')+'</span>';
  }).join('');
  return '<div class="wt-row wt-head faf-arow" role="row">'+
    '<span class="faf-tag" role="columnheader" aria-sort="'+fafSortAria(w,'tag')+'">'+fafSortBtn(w,'tag','Tag #')+'</span>'+
    '<span class="faf-nm" role="columnheader" aria-sort="'+fafSortAria(w,'nm')+'">'+fafSortBtn(w,'nm','Name')+'</span>'+
    cells+'</div>';
}
function fafAssetRow(w,a){
  var order=fafMeasureOrder(w),sel=order[0];
  var leadZero=fafValue(a,sel.k)===0;
  var cells=order.map(function(m){
    var v=fafValue(a,m.k),lead=m.k===sel.k;
    var exact=a.tag+', '+a.nm+', '+m.l+' '+fafMoneyFull(v);
    return '<span class="faf-c'+(lead?' faf-c-lead':'')+'" role="cell" title="'+fafEsc(exact)+'" aria-label="'+fafEsc(exact)+'">'+fafMoneyShort(v)+'</span>';
  }).join('');
  return '<div class="wt-row faf-arow'+(leadZero?' faf-zero':'')+'" role="row">'+
    '<span class="faf-tag" role="cell">'+fafEsc(a.tag)+'</span>'+
    '<span class="faf-nm" role="cell" title="'+fafEsc(a.nm)+'">'+fafEsc(a.nm)+'</span>'+
    cells+'</div>';
}
function fafAssetTotalRow(w,rows){
  var order=fafMeasureOrder(w),sel=order[0];
  var cells=order.map(function(m){
    var t=rows.reduce(function(s,a){return s+fafValue(a,m.k);},0),lead=m.k===sel.k;
    var exact='Total '+m.l+', '+fafMoneyFull(t)+' across '+rows.length+' asset'+(rows.length===1?'':'s');
    return '<span class="faf-c'+(lead?' faf-c-lead':'')+'" role="cell" title="'+fafEsc(exact)+'" aria-label="'+fafEsc(exact)+'">'+fafMoneyShort(t)+'</span>';
  }).join('');
  return '<div class="wt-row faf-arow faf-totalrow" role="row">'+
    '<span class="faf-tag" role="rowheader">Total</span>'+
    '<span class="faf-nm">'+rows.length+' asset'+(rows.length===1?'':'s')+'</span>'+
    cells+'</div>';
}
function fafAssetTable(w){
  var g=fafCurrentGroup(w);
  if(g===null) return fafUnimplemented(w);
  var rows=fafSortedAssets(w),d=fafDimDef(w.dim);
  var body=rows.length
    ? rows.map(function(a){return fafAssetRow(w,a);}).join('')
    : '<div class="wt-row faf-arow" role="row"><span class="faf-nm" role="cell">No assets in this group.</span></div>';
  var aria='Assets in '+d.l+' '+g+', '+rows.length+' asset row'+(rows.length===1?'':'s')+', 7 columns';
  return '<div class="scroll faf-tscroll" role="table" aria-label="'+fafEsc(aria)+'" aria-rowcount="'+(rows.length+2)+'" aria-colcount="7">'+
      '<div class="faf-tbl">'+
        '<div class="faf-rowgroup" role="rowgroup">'+fafAssetHead(w)+'</div>'+
        '<div class="faf-rowgroup" role="rowgroup">'+body+'</div>'+
        '<div class="faf-rowgroup" role="rowgroup">'+fafAssetTotalRow(w,rows)+'</div>'+
      '</div>'+
    '</div>'+
    fafShortenNote()+
    fafGap('The table sort default, Tag number ascending, is proposed only and was never confirmed against the legacy design.','Owner')+
    fafGap('How this table trims at the narrower size is not specified, so all seven columns are kept and the table scrolls sideways rather than dropping a measure.','Design');
}

/* (10) STATES, section 7. Most are unspecified in every source, so each renders
   something obvious and leaves the gap visible rather than inventing behaviour. */
function fafUnimplemented(w){
  var d=fafDimDef(w.dim);
  return '<div class="state" data-kind="empty">'+fafIcon('layers_clear')+
    '<div class="state-title">No groups returned for '+fafEsc(d.l)+'</div>'+
    '<div class="state-sub">On the current Modern API this dimension hits an unimplemented switch case and returns an empty list, so neither the table nor the chart has anything to show.</div>'+
    '<div class="faf-state-gaps">'+
      fafGap('What this widget should render for an unimplemented Group By dimension is not specified in any source, and it is the state a user is most likely to hit, because three of the six Group By options are affected.','Design and owner')+
      fafGap('Implementing Asset Account, Accumulated Depreciation Account and Expense Account for Specific Group is outstanding. Only Class, Building and Room work today.','Backend team')+
    '</div></div>';
}
function fafNoAssets(w){
  if(w.size==='kpi'){
    return '<div class="kpi-row"><div class="kpi-num"><div class="dep-hd-kpigrp"><span class="metric-value" style="font-size:20px;color:var(--txt-subtle)">No assets</span></div>'+
      '<div class="gl-sub"><span>no fixed asset records for this organisation</span></div>'+
      fafGap('The empty state for an organisation with no fixed assets is not specified in any source, so this is a placeholder rather than a designed state.','Design and owner')+
    '</div></div>';
  }
  return '<div class="state" data-kind="empty">'+fafIcon('inventory_2')+
    '<div class="state-title">No fixed assets</div>'+
    '<div class="state-sub">There are no fixed asset records for this organisation.</div>'+
    '<div class="faf-state-gaps">'+
      fafGap('The empty state for an organisation with no fixed assets is not specified in any source, so this frame is a placeholder rather than a designed state.','Design and owner')+
    '</div></div>';
}
/* The remaining section 7 rows (no module rights, loading, error or API failure,
   stale data and a "data as of" signal) have NO defined behaviour anywhere, so
   nothing is designed for them. This one frame stands in for all of them and names
   them, rather than each being quietly invented. Reached by setting
   FAF_STATE.state = 'unspecified'. */
function fafUnbuilt(w){
  return '<div class="state" data-kind="empty">'+fafIcon('help')+
    '<div class="state-title">State not specified</div>'+
    '<div class="state-sub">This state has no defined behaviour in any source, so nothing has been designed for it.</div>'+
    '<div class="faf-state-gaps">'+
      fafGap('No module rights, loading, error or API failure, and stale data or a "data as of" signal are all unspecified for this widget. Refresh exists at every size but no freshness signal is defined.','Design and owner')+
    '</div></div>';
}

/* (11) GLANCE, section 5 -------------------------------------------------
   ONE figure: Total Net Value across all fixed assets, organisation wide. It
   IGNORES all three selections: it is always Net Value and always org-wide, and a
   build that makes it follow the measure selector is wrong. No controls, no view
   switch, no download. Refresh is present, and comes from the card chrome. */
function fafGlance(w){
  var tot=fafOrgNetTotal(w),n=fafOrgAssetCount(w);
  var exact='Total Net Value across all fixed assets, organisation wide, '+fafMoneyFull(tot);
  return '<div class="kpi-row"><div class="kpi-num">'+
    '<div class="dep-hd-kpigrp"><span class="metric-value" title="'+fafEsc(exact)+'" aria-label="'+fafEsc(exact)+'">'+fafMoneyShort(tot)+'</span>'+
      '<span class="bank-pill">'+fafIcon('inventory_2')+n+' asset'+(n===1?'':'s')+'</span></div>'+
    '<div class="gl-sub"><span>Total Net Value, all fixed assets, organisation wide</span></div>'+
    fafGap('The organisation-wide Total Net Value summation behind this figure is not spelled out in any source. Shown here as the sum of every asset Net Value.','Owner')+
  '</div></div>';
}

/* (12) BODY AND ENTRY --------------------------------------------------- */
function fafActiveView(w){
  if(w.view==='donut') return fafDonut(w);
  if(w.view==='assets') return fafAssetTable(w);
  return fafBars(w);
}
function fafContent(w){
  /* The real empty-data guard. It keys off the DATASET being empty, not only off an
     explicitly set state flag: the driver found that setting the flag alone left an
     empty dataset falling through to the normal path, which is the failure mode the
     static gate's F8 finding warns about. Either route now lands on the same state. */
  if(w.state==='empty'||!fafDataset(w).length) return fafNoAssets(w);
  if(w.state==='unspecified') return fafUnbuilt(w);
  if(w.size==='kpi') return fafGlance(w);
  /* An unimplemented Group By has no groups at all, so there is no view to render at
     either Explore or Detail: the placeholder state replaces the body, and the three
     controls stay live so the user can pick a dimension that does work. */
  if(!fafGroupNames(w).length) return fafHeader(w)+'<div class="faf-body">'+fafUnimplemented(w)+'</div>'+fafOpenPanel();
  if(w.size==='xwide'){
    /* Detail, section 5: the active view PLUS the individual-asset table for the
       selected specific group. When the active view IS the asset table the two are
       the same thing, so it renders once, full width, rather than twice. */
    if(w.view==='assets') return fafHeader(w)+'<div class="faf-body">'+fafAssetTable(w)+'</div>'+fafOpenPanel();
    return fafHeader(w)+'<div class="faf-body faf-body-split">'+
      '<div class="faf-col faf-col-chart">'+fafActiveView(w)+'</div>'+
      '<div class="faf-col faf-col-tbl">'+fafAssetTable(w)+'</div>'+
    '</div>'+fafOpenPanel();
  }
  /* Explore, section 5: the active view across all groups in the dimension. */
  return fafHeader(w)+'<div class="faf-body">'+fafActiveView(w)+'</div>'+fafOpenPanel();
}
/* Entry point for WRENDER[11]'s F branch. Rule 12's three sizes, in Jo's order:
   Glance (k), Explore (m, plus the hidden s slot as a safe fallback), Detail (l/x).
   There is no Small under a Final. */
function fafRender(wid,sz){
  var tier=(sz==='k'||sz==='xk')?'kpi':((sz==='l'||sz==='x')?'xwide':'wide');
  FAF_STATE.size=tier;
  return '<div class="faf-root faf-w" data-tier="'+tier+'">'+fafContent(FAF_STATE)+'</div>';
}

/* (13) POPOVER, body appended and faf-scoped so it inherits the token block */
function fafPopContent(){
  var w=FAF_STATE;
  if(FAF_POP&&FAF_POP.type==='dim'){
    return '<div class="cap">Group by</div><div class="menu-scroll">'+FAF_DIMS.map(function(d){
      var on=w.dim===d.k;
      return '<button class="mi'+(on?' check':'')+(d.impl?'':' faf-mi-dead')+'" role="option" aria-selected="'+on+'" data-faf="set-dim" data-v="'+d.k+'">'+
        (on?fafIcon('check'):'<span class="mi-gap"></span>')+'<span class="mi-nm">'+fafEsc(d.l)+'</span>'+
        (d.impl?'':'<span class="faf-mi-tag">not on API</span>')+'</button>';
    }).join('')+'</div>'+
    '<div class="sep"></div>'+
    fafGap('Three of these six dimensions return an empty list on the Modern API today and are marked "not on API". Implementing them is outstanding.','Backend team');
  }
  if(FAF_POP&&FAF_POP.type==='group'){
    var names=fafGroupNames(w),cur=fafCurrentGroup(w);
    if(!names.length){
      return '<div class="cap">Specific group</div><div class="mi faf-mi-dead"><span class="mi-gap"></span><span class="mi-nm">No groups returned for this dimension</span></div>';
    }
    return '<div class="cap">Specific group</div><div class="menu-scroll">'+names.map(function(g){
      var on=cur===g;
      return '<button class="mi'+(on?' check':'')+'" role="option" aria-selected="'+on+'" data-faf="set-group" data-v="'+fafEsc(g)+'">'+
        (on?fafIcon('check'):'<span class="mi-gap"></span>')+'<span class="mi-nm">'+fafEsc(g)+'</span></button>';
    }).join('')+'</div>';
  }
  return '<div class="cap">Financial measure</div><div class="menu-scroll">'+FAF_MEASURES.map(function(m){
    var on=w.measure===m.k;
    return '<button class="mi'+(on?' check':'')+'" role="option" aria-selected="'+on+'" data-faf="set-measure" data-v="'+m.k+'">'+
      (on?fafIcon('check'):'<span class="mi-gap"></span>')+'<span class="mi-nm">'+fafEsc(m.l)+'</span></button>';
  }).join('')+'</div>';
}
function fafOpenPop(anchor,type){
  FAF_POP={type:type};
  var el=document.getElementById('fafPop');
  if(!el){el=document.createElement('div');el.id='fafPop';document.body.appendChild(el);}
  el.setAttribute('data-faf','stop');
  el.className='faf-root faf-pop';
  el.setAttribute('role','listbox');
  el.innerHTML=fafPopContent();
  var r=anchor.getBoundingClientRect(),M=8;
  el.style.visibility='hidden';el.style.left='0px';el.style.top='0px';
  var bw=el.offsetWidth,bh=el.offsetHeight;
  var left=Math.min(Math.max(M,r.left),window.innerWidth-bw-M);
  var top=r.bottom+6;if(top+bh>window.innerHeight-M)top=Math.max(M,r.top-bh-6);
  el.style.left=left+'px';el.style.top=top+'px';el.style.visibility='';
}
function fafClosePop(){FAF_POP=null;var el=document.getElementById('fafPop');if(el)el.remove();}

/* (14) DELEGATED HANDLERS ------------------------------------------------
   Section 4: changing Group By RESETS Specific Group, because it cannot carry a
   value that does not exist in the new dimension. Changing any of the three updates
   the table and the chart together, since both read the same state, so neither can
   show a population the other does not.
   Section 4 also says "Anything else: nothing", no row click, no segment click, no
   drill, so there is deliberately no handler for a table row, a bar or an arc. */
function fafOnClick(e){
  var t=e.target.closest?e.target.closest('[data-faf]'):null;
  if(!t){ if(FAF_POP&&!(e.target.closest&&e.target.closest('#fafPop'))) fafClosePop(); return; }
  if(!t.closest('.faf-root')) return;
  var a=t.getAttribute('data-faf'),w=FAF_STATE;
  if(a==='view'){ w.view=t.getAttribute('data-v')||'bars'; fafClosePop(); fafRerender(); return; }
  if(a==='dim'||a==='group'||a==='measure'){
    if(FAF_POP&&FAF_POP.type===a&&document.getElementById('fafPop')) fafClosePop();
    else fafOpenPop(t,a);
    return;
  }
  if(a==='set-dim'){
    var nd=t.getAttribute('data-v');
    if(w.dim!==nd){ w.dim=nd; w.group=null; } /* THE RESET, section 4 */
    fafClosePop(); fafRerender(); return;
  }
  if(a==='set-group'){ w.group=t.getAttribute('data-v'); fafClosePop(); fafRerender(); return; }
  if(a==='set-measure'){ w.measure=t.getAttribute('data-v'); fafClosePop(); fafRerender(); return; }
  if(a==='sort'){
    var k=t.getAttribute('data-k'),p=(w.sort||'tag-asc').split('-');
    w.sort=(p[0]===k)?(k+'-'+(p[1]==='asc'?'desc':'asc')):(k+'-asc');
    fafClosePop(); fafRerender(); return;
  }
  if(a==='download'){
    fafClosePop();
    if(typeof showToast==='function') showToast('Download prepared with the full unshortened figures');
    return;
  }
  /* 'stop' and anything unmatched: no-op on purpose */
}
var FAF_WIRED=false;
(function(){
  if(FAF_WIRED)return;FAF_WIRED=true;
  document.addEventListener('click',fafOnClick);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&FAF_POP) fafClosePop(); });
})();


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
