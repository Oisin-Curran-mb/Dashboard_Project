
function mkNode(){return {innerHTML:'',style:{},dataset:{},setAttribute:function(){},getAttribute:function(){return null;},
 appendChild:function(){},removeChild:function(){},remove:function(){},querySelector:function(){return mkNode();},
 querySelectorAll:function(){return [];},addEventListener:function(){},closest:function(){return null;},
 getBoundingClientRect:function(){return {top:0,left:0,width:600,height:400,bottom:400,right:600};},
 classList:{add:function(){},remove:function(){},contains:function(){return false;},toggle:function(){}},
 offsetWidth:600,offsetHeight:400,children:[],textContent:''};}
var document={getElementById:function(){return mkNode();},querySelector:function(){return mkNode();},
 querySelectorAll:function(){return [];},createElement:function(){return mkNode();},body:mkNode(),
 documentElement:mkNode(),addEventListener:function(){}};
var window={addEventListener:function(){},innerWidth:1400,innerHeight:900};
function requestAnimationFrame(){} function setTimeout(){} function clearTimeout(){}
function ICON(n){return '<span class="material-symbols-rounded">'+n+'</span>';}
function money(v){return '$'+v;} function fmtAxis(v){return ''+v;} function find(){return null;}
function showToast(){} function setStatus(){} var FC_STATE={}, TIMERS={};
function fcRenderWidget(){}
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

   THE NINE UNSETTLED FACTS (section 9) ARE NOT RESOLVED BY THIS BUILD, and as of
   2026-09-03 they are also NOT RENDERED. Owner instruction removed the gap notes and
   the open-items panel from every size, so the widget no longer carries them on
   screen. Removing the notes did not settle anything: the nine remain recorded in the
   handoff doc's section 9 and in the Step 4 doc's Sign-off Readiness table, which are
   the places that track them. What this build still refuses to do is invent a value
   for any of them, which is why an unimplemented dimension renders an explicit
   empty-state frame rather than a plausible-looking figure.
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
   view defaults to 'donut'. Group Bars was removed on 2026-09-03 by owner
   instruction, so the donut is both the default and the only chart view. */
var FAF_STATE={id:'11F',size:'wide',dim:'cls',group:null,measure:'net',view:'assets',sort:'tag-asc',dataset:null,state:null};
var FAF_POP=null;

/* The amethyst chart ramp, styling reference section 8.2: largest share darkest, no
   red on bars or arcs. Colour is never the only signal; every bar and every arc
   carries its group name and its value as text in the DOM (accessibility
   requirements 1 and 2 in the handoff doc). */
var FAF_COLORS=['--am-600','--am-500','--am-400','--am-300','--am-200'];

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
/* 2026-09-03: the table no longer promotes or marks a selected measure, so its column
   order is FIXED, in the canonical FAF_MEASURES order. This matters for a reason worth
   stating: the old behaviour reordered the columns to put the selected measure first,
   and once the measure chip is hidden in the table view that reordering would be
   driven by a control the user cannot see. Columns silently moving is worse than
   columns being in a fixed order. The donut still reads w.measure directly, which is
   the only place the selection now has an effect. */
function fafMeasureOrder(){
  return FAF_MEASURES.slice();
}

/* (5) CONTROLS, section 3: three selections and no others ------------------ */
function fafChip(type,label,aria,dead){
  return '<button class="filter-chip'+(dead?' faf-chip-dead':'')+'" data-faf="'+type+'"'+
    ' aria-haspopup="listbox" aria-expanded="'+((FAF_POP&&FAF_POP.type===type)?'true':'false')+'"'+
    ' aria-label="'+fafEsc(aria)+'">'+
    '<span class="fc-label">'+fafEsc(label)+'</span>'+fafIcon('expand_more')+'</button>';
}
/* 2026-09-03, owner instruction: THE MEASURE CHIP IS SHOWN ONLY IN THE DONUT VIEW.
   The reasoning holds: the asset table shows ALL FIVE measures as columns, so there is
   nothing for a measure selection to do there, and offering the control implied it
   changed something. The donut plots exactly one measure, so the control belongs to
   that view and only that view. Group by and Specific group stay in both, because
   both views are scoped by them. The selection itself is not reset when the table is
   active; it persists and takes effect again the moment the donut is shown. */
function fafControls(w){
  var d=fafDimDef(w.dim),m=fafMeasDef(w.measure),g=fafCurrentGroup(w);
  var groupLbl=(g===null)?'No groups returned':g;
  var showMeasure=(w.view!=='assets');
  /* 2026-09-03: one line, never wrapping. See .faf-chiprow. */
  return '<div class="faf-chiprow">'+
    fafChip('dim','Group by: '+d.l,'Group by, currently '+d.l,false)+
    fafChip('group','Group: '+groupLbl,'Specific group, currently '+groupLbl,g===null)+
    (showMeasure?fafChip('measure','Measure: '+m.l,'Financial measure, currently '+m.l,false):'')+
  '</div>';
}
/* Section 6: three views, switchable at Explore and Detail. A segmented control
   rather than a dropdown, per the styling reference's rule for a small fixed set of
   options, and it lives in the widget's OWN header the way every other Final in
   this file does. The card menu's "Switch chart type" block is not the route: the
   shared fcApplyMenuTrim hides that block generically for any widget whose opt is
   'F', because it drives gs(wid).view for A/B/C and would no-op here. */
/* 2026-09-03, owner instruction: GROUP BARS IS REMOVED. Two views remain, Donut and
   Asset Detail, and Donut is the default. The handoff doc's section 6 listed three;
   this supersedes it, and the doc should be updated to match rather than the other way
   round. fafBars and its helper are deleted rather than left uncalled, because they
   were the only caller of the ranked-bar layout. */
function fafViewToggle(w){
  var v=w.view||'assets';
  function seg(val,lbl,ic,tip){
    return '<button class="vt'+(v===val?' on':'')+'" data-faf="view" data-v="'+val+'" aria-pressed="'+(v===val)+'" title="'+fafEsc(tip)+'">'+fafIcon(ic)+lbl+'</button>';
  }
  return '<div class="vtoggle faf-vtoggle" role="group" aria-label="View">'+
    seg('assets','Asset Detail','table_rows','Individual assets within the selected specific group, with all five financial measures and a totals row.')+
    seg('donut','Donut','donut_small','The selected measure split across the groups of the chosen dimension.')+
  '</div>';
}
/* Section 6: download is available at Explore and Detail and carries the full
   unshortened figures for every measure, not the shortened display values. */
function fafDownloadBtn(){
  return '<button class="btn sm naked" data-faf="download" title="Download every measure at full precision, not the shortened figures shown on screen.">'+fafIcon('download')+'Download</button>';
}
/* 2026-09-03, owner instruction: THE CONTEXT LINE IS REMOVED. It restated what the
   three chips already say and what the widget's own absence of a time control already
   shows, so it was explanation of visible facts rather than information. The header is
   now one row: the three chips on the left, the view toggle and Download on the right.
   The dep-hd-num row is gone with it, so .faf-ctx is dead and deleted. */
function fafHeader(w){
  return '<div class="dep-hd faf-hd"><div class="dep-hd-top">'+fafControls(w)+
    '<div class="dep-hd-toggle">'+fafViewToggle(w)+fafDownloadBtn()+'</div></div></div>';
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
  return '';
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
/* 2026-09-03, owner instruction: the "selected" marker is REMOVED from the table
   entirely. No lead column, no faf-c-lead emphasis, no faf-lead-tag label. All five
   measures are peers here, which is what the table is for. */
function fafAssetHead(w){
  var cells=fafMeasureOrder().map(function(m){
    return '<span class="faf-c" role="columnheader" aria-sort="none">'+fafEsc(m.short)+'</span>';
  }).join('');
  return '<div class="wt-row wt-head faf-arow" role="row">'+
    '<span class="faf-tag" role="columnheader" aria-sort="'+fafSortAria(w,'tag')+'">'+fafSortBtn(w,'tag','Tag #')+'</span>'+
    '<span class="faf-nm" role="columnheader" aria-sort="'+fafSortAria(w,'nm')+'">'+fafSortBtn(w,'nm','Name')+'</span>'+
    cells+'</div>';
}
/* 2026-09-03: no lead cell and no lead-driven zero marker. The zero treatment keyed
   off the SELECTED measure being zero, which cannot mean anything once no measure is
   selected in this view, so a row is marked only when its Net Value is zero, Net Value
   being the measure the widget's own headline figure uses. */
function fafAssetRow(w,a){
  var netZero=fafValue(a,'net')===0;
  var cells=fafMeasureOrder().map(function(m){
    var v=fafValue(a,m.k);
    var exact=a.tag+', '+a.nm+', '+m.l+' '+fafMoneyFull(v);
    return '<span class="faf-c" role="cell" title="'+fafEsc(exact)+'" aria-label="'+fafEsc(exact)+'">'+fafMoneyShort(v)+'</span>';
  }).join('');
  return '<div class="wt-row faf-arow'+(netZero?' faf-zero':'')+'" role="row">'+
    '<span class="faf-tag" role="cell">'+fafEsc(a.tag)+'</span>'+
    '<span class="faf-nm" role="cell" title="'+fafEsc(a.nm)+'">'+fafEsc(a.nm)+'</span>'+
    cells+'</div>';
}
function fafAssetTotalRow(w,rows){
  var cells=fafMeasureOrder().map(function(m){
    var t=rows.reduce(function(s,a){return s+fafValue(a,m.k);},0);
    var exact='Total '+m.l+', '+fafMoneyFull(t)+' across '+rows.length+' asset'+(rows.length===1?'':'s');
    return '<span class="faf-c" role="cell" title="'+fafEsc(exact)+'" aria-label="'+fafEsc(exact)+'">'+fafMoneyShort(t)+'</span>';
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
    /* 2026-09-03, two owner instructions. The shortened-figures info footnote is
       REMOVED: fafShortenNote is deleted, and the behaviour it described is unchanged
       and still reachable, since every figure carries its exact value in both title
       and aria-label and Download states full precision in its own tooltip. The GAP
       NOTES and the OPEN-ITEMS PANEL are also removed, at every size: fafGap,
       fafOpenPanel and the FAF_OPEN list are all deleted. The nine unsettled facts
       are NOT resolved by removing them, they are simply no longer rendered in the
       widget; they remain recorded in the handoff doc's section 9 and in the Step 4
       doc's Sign-off Readiness table, which are the places that track them. */
    '';
}

/* (10) STATES, section 7. Most are unspecified in every source, so each renders
   something obvious and leaves the gap visible rather than inventing behaviour. */
function fafUnimplemented(w){
  var d=fafDimDef(w.dim);
  return '<div class="state" data-kind="empty">'+fafIcon('layers_clear')+
    '<div class="state-title">No groups returned for '+fafEsc(d.l)+'</div>'+
    '<div class="state-sub">On the current Modern API this dimension hits an unimplemented switch case and returns an empty list, so neither the table nor the chart has anything to show.</div>'+
    '<div class="faf-state-gaps">'+


    '</div></div>';
}
function fafNoAssets(w){
  if(w.size==='kpi'){
    return '<div class="kpi-row"><div class="kpi-num"><div class="dep-hd-kpigrp"><span class="metric-value" style="font-size:20px;color:var(--txt-subtle)">No assets</span></div>'+
      '<div class="gl-sub"><span>no fixed asset records for this organisation</span></div>'+

    '</div></div>';
  }
  return '<div class="state" data-kind="empty">'+fafIcon('inventory_2')+
    '<div class="state-title">No fixed assets</div>'+
    '<div class="state-sub">There are no fixed asset records for this organisation.</div>'+
    '<div class="faf-state-gaps">'+

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

  '</div></div>';
}

/* (12) BODY AND ENTRY --------------------------------------------------- */
/* 2026-09-03: bars removed, so anything that is not the asset table is the donut,
   including a stale 'bars' value left in state from before the change. */
function fafActiveView(w){
  if(w.view==='assets') return fafAssetTable(w);
  return fafDonut(w);
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
  if(!fafGroupNames(w).length) return fafHeader(w)+'<div class="faf-body">'+fafUnimplemented(w)+'</div>';
  if(w.size==='xwide'){
    /* Detail. 2026-09-03, owner instruction: THE DONUT VIEW NO LONGER CARRIES THE
       ASSET TABLE AT DETAIL, because the pair does not fit. Each view now gets the
       full width at every size it appears at, so Detail renders exactly one view and
       differs from Explore only in the room it has. This supersedes the handoff doc's
       section 5, which asked for the active view PLUS the asset table at Detail; the
       side-by-side split is what did not fit, so the requirement is retired rather
       than worked around. faf-body-split and faf-col are now unused. */
    return fafHeader(w)+'<div class="faf-body">'+fafActiveView(w)+'</div>';
  }
  /* Explore, section 5: the active view across all groups in the dimension. */
  return fafHeader(w)+'<div class="faf-body">'+fafActiveView(w)+'</div>';
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
    '<div class="sep"></div>';
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
  if(a==='view'){ w.view=t.getAttribute('data-v')||'assets'; fafClosePop(); fafRerender(); return; }
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




var P=0,F=0;
function ok(n,c){ if(c){P++;} else {F++; console.log('  FAIL  '+n);} }
function has(h,s){return h.indexOf(s)>=0;}
function W(o){var w={}; for(var k in FAF_STATE) w[k]=FAF_STATE[k]; for(var k2 in (o||{})) w[k2]=o[k2]; return w;}

// measure chip: hidden in the table, shown in the donut
['wide','xwide'].forEach(function(sz){
  var ta=fafContent(W({size:sz,view:'assets'}));
  var dn=fafContent(W({size:sz,view:'donut'}));
  ok('1 '+sz+' table hides the Measure chip', !has(ta,'Measure:'));
  ok('2 '+sz+' donut shows the Measure chip', has(dn,'Measure:'));
  ok('3 '+sz+' table keeps Group by', has(ta,'Group by:'));
  ok('4 '+sz+' table keeps Group', has(ta,'Group:'));
  ok('5 '+sz+' table has 2 chips', (ta.match(/class="filter-chip/g)||[]).length===2);
  ok('6 '+sz+' donut has 3 chips', (dn.match(/class="filter-chip/g)||[]).length===3);
  // the SELECTED marker is gone from the table
  ok('7 '+sz+' no selected tag', !has(ta,'faf-lead-tag'));
  ok('8 '+sz+' no selected word', ta.toLowerCase().indexOf('>selected<')<0);
  ok('9 '+sz+' no lead cell class', !has(ta,'faf-c-lead'));
});
// column order is fixed regardless of the measure selection
var canon=['Capitalized','Cost','Depreciable','Accum. Depn','Net Value'];
['cap','cost','depr','accum','net'].forEach(function(mk){
  var h=fafContent(W({size:'wide',view:'assets',measure:mk}));
  /* strip the trailing '<' the match keeps: a greedy .*> leaves it behind, which is
     what made this assertion fail against a correct fixed order. */
  var heads=(h.match(/role="columnheader"[^>]*>([^<]+)</g)||[]).map(function(x){return x.replace(/.*>/,'').replace(/<$/,'');});
  var money=heads.filter(function(x){return canon.indexOf(x)>=0;});
  ok('10 column order fixed with measure='+mk, JSON.stringify(money)===JSON.stringify(canon));
});
// the selection still drives the donut and persists across a view switch
var d1=fafContent(W({size:'wide',view:'donut',measure:'cost'}));
var d2=fafContent(W({size:'wide',view:'donut',measure:'net'}));
ok('11 the donut still follows the measure', d1!==d2);
ok('12 donut names the measure', has(d2,'Net Value')||has(d2,'Measure: Net Value'));
// nothing else regressed
ok('13 table still renders', has(fafContent(W({size:'wide',view:'assets'})),'role="table"'));
ok('14 totals row still there', has(fafContent(W({size:'wide',view:'assets'})),'Total'));
ok('15 five money columns still present', (fafContent(W({size:'wide',view:'assets'})).match(/role="columnheader"/g)||[]).length===7);
ok('16 exact figures still on hover', /title="FA-\d+, [^"]+, [A-Za-z. ]+ \$[\d,]+"/.test(fafContent(W({size:'wide',view:'assets'}))));
ok('17 download still present', has(fafContent(W({size:'wide',view:'assets'})),'data-faf="download"'));
ok('18 Glance unaffected', fafContent(W({size:'kpi'}))===fafContent(W({size:'kpi',measure:'cost',view:'donut'})));
ok('19 no em dash anywhere', !['assets','donut'].some(function(v){return ['kpi','wide','xwide'].some(function(s){return fafContent(W({size:s,view:v})).indexOf('\u2014')>=0;});}));

console.log('');
console.log((F?'FAIL':'PASS')+' -- '+P+' passed, '+F+' failed');
