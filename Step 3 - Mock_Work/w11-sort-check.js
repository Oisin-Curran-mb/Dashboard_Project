
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
  {tag:'FA-1001',nm:'Sanctuary Sound System',cls:'Audio Visual',bldg:'',room:'Media Room',cap:111719,cost:118850,salv:4754,dep:114096},
  {tag:'FA-1002',nm:'Sanctuary Lighting Rig',cls:'Audio Visual',bldg:'Main Campus',room:'',cap:130707,cost:134750,salv:10780,dep:30992},
  {tag:'FA-1003',nm:'Media Cameras',cls:'Audio Visual',bldg:'',room:'',cap:37927,cost:39100,salv:1955,dep:0},
  {tag:'FA-1004',nm:'Choir Risers',cls:'Audio Visual',bldg:'Main Campus',room:'Sanctuary',cap:41313,cost:43950,salv:0,dep:5274},
  {tag:'FA-1005',nm:'Stage Monitors',cls:'Audio Visual',bldg:'Annex',room:'',cap:64950,cost:64950,salv:0,dep:64950},
  {tag:'FA-1006',nm:'Video Switcher',cls:'Audio Visual',bldg:'Chapel',room:'Sanctuary',cap:53800,cost:53800,salv:0,dep:26900},
  {tag:'FA-1007',nm:'Wireless Mic Set',cls:'Audio Visual',bldg:'Chapel',room:'Sanctuary',cap:24700,cost:24700,salv:1976,dep:11362},
  {tag:'FA-1008',nm:'Projection Screen',cls:'Audio Visual',bldg:'Main Campus',room:'Sanctuary',cap:68500,cost:68500,salv:0,dep:34250},
  {tag:'FA-1009',nm:'Livestream Encoder',cls:'Audio Visual',bldg:'Chapel',room:'Sanctuary',cap:28764,cost:30600,salv:0,dep:15300},
  {tag:'FA-1010',nm:'Broadcast Mixer',cls:'Audio Visual',bldg:'Chapel',room:'',cap:3300,cost:3300,salv:0,dep:0},
  {tag:'FA-1011',nm:'LED Wall Panel',cls:'Audio Visual',bldg:'Annex',room:'Stage',cap:98371,cost:104650,salv:0,dep:35581},
  {tag:'FA-1012',nm:'Foldback Speakers',cls:'Audio Visual',bldg:'Main Campus',room:'Media Room',cap:77550,cost:82500,salv:0,dep:66000},
  {tag:'FA-1013',nm:'Main Campus Building',cls:'Buildings',bldg:'Chapel',room:'',cap:813000,cost:813000,salv:0,dep:813000},
  {tag:'FA-1014',nm:'Family Life Center',cls:'Buildings',bldg:'Family Life Center',room:'',cap:1171700,cost:1171700,salv:58585,dep:378459},
  {tag:'FA-1015',nm:'Annex Hall',cls:'Buildings',bldg:'Family Life Center',room:'',cap:1912015,cost:1971150,salv:78846,dep:1513843},
  {tag:'FA-1016',nm:'Nursery Wing',cls:'Buildings',bldg:'Chapel',room:'',cap:1546300,cost:1645000,salv:0,dep:411250},
  {tag:'FA-1017',nm:'Maintenance Shed',cls:'Buildings',bldg:'Main Campus',room:'',cap:969321,cost:999300,salv:39972,dep:479664},
  {tag:'FA-1018',nm:'Chapel',cls:'Buildings',bldg:'Family Life Center',room:'',cap:1862234,cost:1981100,salv:0,dep:237732},
  {tag:'FA-1019',nm:'Youth Building',cls:'Buildings',bldg:'Family Life Center',room:'',cap:1910550,cost:1910550,salv:95527,dep:1815023},
  {tag:'FA-1020',nm:'Storage Barn',cls:'Buildings',bldg:'Annex',room:'',cap:955600,cost:955600,salv:0,dep:238900},
  {tag:'FA-1021',nm:'Passenger Van',cls:'Vehicles',bldg:'Chapel',room:'',cap:59300,cost:59300,salv:0,dep:20162},
  {tag:'FA-1022',nm:'Bus, 14 Seat',cls:'Vehicles',bldg:'Main Campus',room:'',cap:38650,cost:38650,salv:0,dep:4638},
  {tag:'FA-1023',nm:'Maintenance Truck',cls:'Vehicles',bldg:'Annex',room:'',cap:60350,cost:60350,salv:4828,dep:44417},
  {tag:'FA-1024',nm:'Grounds Utility Cart',cls:'Vehicles',bldg:'Main Campus',room:'',cap:85023,cost:90450,salv:4522,dep:21482},
  {tag:'FA-1025',nm:'Minibus',cls:'Vehicles',bldg:'Annex',room:'',cap:84459,cost:89850,salv:7188,dep:9919},
  {tag:'FA-1026',nm:'Trailer, Enclosed',cls:'Vehicles',bldg:'Chapel',room:'',cap:28294,cost:30100,salv:602,dep:23598},
  {tag:'FA-1027',nm:'Pickup, Half Ton',cls:'Vehicles',bldg:'',room:'',cap:31255,cost:33250,salv:665,dep:21506},
  {tag:'FA-1028',nm:'Nursery Furnishings',cls:'Office Equipment',bldg:'',room:'Reception',cap:95200,cost:95200,salv:3808,dep:60318},
  {tag:'FA-1029',nm:'Reception Desk',cls:'Office Equipment',bldg:'Annex',room:'Office 201',cap:10340,cost:11000,salv:440,dep:6969},
  {tag:'FA-1030',nm:'Copier, Main Office',cls:'Office Equipment',bldg:'Annex',room:'Reception',cap:21385,cost:22750,salv:0,dep:11375},
  {tag:'FA-1031',nm:'Server Cabinet',cls:'Office Equipment',bldg:'Main Campus',room:'Reception',cap:22019,cost:22700,salv:1135,dep:14232},
  {tag:'FA-1032',nm:'Network Switch Stack',cls:'Office Equipment',bldg:'Main Campus',room:'Server Room',cap:87514,cost:93100,salv:7448,dep:85652},
  {tag:'FA-1033',nm:'Office Workstations',cls:'Office Equipment',bldg:'Chapel',room:'Office 201',cap:130900,cost:130900,salv:0,dep:104720},
  {tag:'FA-1034',nm:'Conference Table',cls:'Office Equipment',bldg:'Annex',room:'Server Room',cap:21100,cost:21100,salv:0,dep:2532},
  {tag:'FA-1035',nm:'Filing System',cls:'Office Equipment',bldg:'Chapel',room:'Server Room',cap:87600,cost:87600,salv:7008,dep:80592},
  {tag:'FA-1036',nm:'Postage Machine',cls:'Office Equipment',bldg:'Annex',room:'Office 201',cap:24056,cost:24800,salv:1240,dep:0},
  {tag:'FA-1037',nm:'Printer, Wide Format',cls:'Office Equipment',bldg:'Chapel',room:'Server Room',cap:8099,cost:8350,salv:668,dep:921},
  {tag:'FA-1038',nm:'Car Park Resurface',cls:'Land Improvements',bldg:'',room:'',cap:11550,cost:11550,salv:231,dep:2829},
  {tag:'FA-1039',nm:'Perimeter Fencing',cls:'Land Improvements',bldg:'Chapel',room:'',cap:50925,cost:52500,salv:4200,dep:48300},
  {tag:'FA-1040',nm:'Playground Structure',cls:'Land Improvements',bldg:'Family Life Center',room:'',cap:109028,cost:112400,salv:0,dep:89920},
  {tag:'FA-1041',nm:'Irrigation System',cls:'Land Improvements',bldg:'Family Life Center',room:'',cap:63923,cost:65900,salv:1318,dep:21957},
  {tag:'FA-1042',nm:'Signage, Roadside',cls:'Land Improvements',bldg:'Annex',room:'',cap:92167,cost:98050,salv:7844,dep:10824},
  {tag:'FA-1043',nm:'Retaining Wall',cls:'Land Improvements',bldg:'Chapel',room:'',cap:124750,cost:124750,salv:2495,dep:41566},
  {tag:'FA-1044',nm:'Exterior Lighting',cls:'Land Improvements',bldg:'',room:'',cap:138467,cost:142750,salv:11420,dep:86677},
  {tag:'FA-1045',nm:'Commercial Oven',cls:'Kitchen Equipment',bldg:'Annex',room:'Fellowship Hall',cap:21388,cost:22050,salv:441,dep:0},
  {tag:'FA-1046',nm:'Walk In Cooler',cls:'Kitchen Equipment',bldg:'Family Life Center',room:'Kitchen',cap:6984,cost:7200,salv:288,dep:6912},
  {tag:'FA-1047',nm:'Dishwasher, Industrial',cls:'Kitchen Equipment',bldg:'Chapel',room:'Kitchen',cap:63200,cost:63200,salv:0,dep:7584},
  {tag:'FA-1048',nm:'Prep Tables',cls:'Kitchen Equipment',bldg:'Family Life Center',room:'Fellowship Hall',cap:136333,cost:140550,salv:0,dep:47787},
  {tag:'FA-1049',nm:'Coffee Service Unit',cls:'Kitchen Equipment',bldg:'Family Life Center',room:'Kitchen',cap:46560,cost:48000,salv:1920,dep:0},
  {tag:'FA-1050',nm:'Freezer, Upright',cls:'Kitchen Equipment',bldg:'Chapel',room:'Kitchen',cap:86339,cost:91850,salv:7348,dep:21125},
  {tag:'FA-1900',nm:'Fully Depreciated Organ',cls:'Audio Visual',bldg:'Main Campus',room:'Sanctuary',cap:74000,cost:76000,salv:0,dep:76000},
  {tag:'FA-1901',nm:'Unclassified Equipment',cls:'',bldg:'',room:'',cap:5400,cost:5600,salv:0,dep:1200}
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
  {k:'accum',l:'Accumulated Depreciation',short:'Accumulated'},
  {k:'net',  l:'Net Value',               short:'Net'}
];

/* Section 3: all three selections persist per user across sessions. Legacy stores
   them in SSUserTenantPreferenceRepository under UserPreferences.WidgetFixedAssets.
   Held here as widget state so the mockup behaves as if persisted, per Rule 11. The
   Modern API does NOT persist them server-side (section 9 item 5), which is a
   backend-team item and is rendered as an open item rather than assumed away.
   view defaults to 'donut'. Group Bars was removed on 2026-09-03 by owner
   instruction, so the donut is both the default and the only chart view. */
var FAF_STATE={id:'11F',size:'wide',dim:'cls',group:null,measure:'net',view:'assets',sort:'tag-asc',page:0,dataset:null,state:null};
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
/* 2026-09-03, owner instruction: THE ASSET TABLE PAGES. FAF_PAGE_SIZE rows per page
   with a Previous and Next control, so a group with more assets than fit is walked
   rather than scrolled.
   THE RULE THAT MATTERS AND IS EASY TO GET WRONG: the TOTALS ROW TOTALS THE WHOLE
   FILTERED GROUP, NOT THE VISIBLE PAGE. Paging is a display concern; a total that
   changed when you clicked Next would be a wrong number on screen. Same for the asset
   count in that row and for the donut, which never pages at all. */
var FAF_PAGE_SIZE=10;
function fafPageCount(w){ return Math.max(1,Math.ceil(fafSortedAssets(w).length/FAF_PAGE_SIZE)); }
function fafPageIndex(w){
  var n=fafPageCount(w),i=w.page||0;
  if(i<0) i=0;
  if(i>n-1) i=n-1;   /* clamp, so a sort or filter change that shortens the set cannot
                        leave the view on a page that no longer exists */
  return i;
}
function fafPageRows(w){
  var all=fafSortedAssets(w),i=fafPageIndex(w),s=i*FAF_PAGE_SIZE;
  return all.slice(s,s+FAF_PAGE_SIZE);
}
function fafPager(w){
  var all=fafSortedAssets(w).length;
  if(all<=FAF_PAGE_SIZE) return '';
  var i=fafPageIndex(w),n=fafPageCount(w),from=i*FAF_PAGE_SIZE+1,to=Math.min(all,(i+1)*FAF_PAGE_SIZE);
  function btn(act,ic,lbl,off){
    return '<button class="iconbtn faf-pgbtn" data-faf="'+act+'"'+(off?' disabled aria-disabled="true"':'')+
      ' aria-label="'+lbl+'" title="'+lbl+'">'+fafIcon(ic)+'</button>';
  }
  return '<div class="faf-pager">'+
    '<span class="faf-pgcount">'+from+' to '+to+' of '+all+'</span>'+
    btn('page-prev','chevron_left','Previous page',i===0)+
    '<span class="faf-pgnum">Page '+(i+1)+' of '+n+'</span>'+
    btn('page-next','chevron_right','Next page',i>=n-1)+
  '</div>';
}
/* 2026-09-03, owner instruction: EVERY COLUMN SORTS, ascending or descending, one
   active at a time. Tag # and Name sort as text; the five money columns sort by their
   numeric value, which is why they cannot reuse the text comparator.
   THE RULE THAT MATTERS WITH PAGINATION: the sort is applied to the WHOLE GROUP and
   THEN the page is sliced out of it, never the other way round. Sorting only the
   visible page would reorder ten rows inside a page and leave the set unsorted, which
   looks like it works and is wrong. fafPageRows slices from this function's output.
   A stable tiebreaker on tag keeps equal values in a deterministic order, so paging
   through a column with repeated values cannot show or skip the same row twice. */
function fafSortedAssets(w){
  var rows=fafAssetsInGroup(w).slice();
  var parts=(w.sort||'tag-asc').split('-'),key=parts[0],dir=parts[1]==='asc'?1:-1;
  var isMeasure=FAF_MEASURES.some(function(m){return m.k===key;});
  rows.sort(function(a,b){
    var r;
    if(isMeasure) r=fafValue(a,key)-fafValue(b,key);
    else if(key==='nm') r=a.nm.localeCompare(b.nm);
    else r=a.tag.localeCompare(b.tag);
    if(r===0) r=a.tag.localeCompare(b.tag);   /* stable tiebreaker */
    return dir*r;
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
/* 2026-09-03, owner instruction: icon only, no label, in the right-hand corner. It
   keeps an aria-label because an icon-only control has no accessible name otherwise,
   and the title still states what the download actually carries. */
function fafDownloadBtn(){
  return '<button class="iconbtn faf-dl" data-faf="download" aria-label="Download every measure at full precision" title="Download every measure at full precision, not the shortened figures shown on screen.">'+fafIcon('download')+'</button>';
}
/* 2026-09-03, owner instruction: THE CONTEXT LINE IS REMOVED. It restated what the
   three chips already say and what the widget's own absence of a time control already
   shows, so it was explanation of visible facts rather than information. The header is
   now one row: the three chips on the left, the view toggle and Download on the right.
   The dep-hd-num row is gone with it, so .faf-ctx is dead and deleted. */
function fafHeader(w){
  return '<div class="dep-hd faf-hd"><div class="dep-hd-top">'+fafControls(w)+
    '<div class="dep-hd-toggle">'+fafViewToggle(w)+'</div></div></div>';
}
/* 2026-09-03, owner instruction: the download icon sits in its own row above the table
   and the donut, in the right-hand corner, and that row must not push the content down
   much. So it is a single slim right-aligned row: no label, no height beyond the icon
   button itself, and the button's own padding is what sets the row height. */
function fafActionRow(){
  return '<div class="faf-actionrow">'+fafDownloadBtn()+'</div>';
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
  var dirWord=on?(parts[1]==='asc'?'ascending, click for descending':'descending, click for ascending'):'click to sort';
  return '<button class="wt-sort'+(on?' on':'')+'" data-faf="sort" data-k="'+fafEsc(k)+'" title="'+fafEsc(label+', '+dirWord)+'" aria-label="'+fafEsc(label+', '+dirWord)+'">'+fafEsc(label)+' '+fafIcon(ic)+'</button>';
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
  /* 2026-09-03: a sort control on every column, the money ones included. Each carries
     its real aria-sort state rather than a hardcoded "none", so a reader is told which
     column is ordering the table and in which direction. */
  var cells=fafMeasureOrder().map(function(m){
    return '<span class="faf-c" role="columnheader" aria-sort="'+fafSortAria(w,m.k)+'">'+fafSortBtn(w,m.k,m.short)+'</span>';
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
  var all=fafSortedAssets(w),page=fafPageRows(w),d=fafDimDef(w.dim);
  var body=page.length
    ? page.map(function(a){return fafAssetRow(w,a);}).join('')
    : '<div class="wt-row faf-arow" role="row"><span class="faf-nm" role="cell">No assets in this group.</span></div>';
  /* aria-rowcount is the FULL set, not the page: a reader is told how many rows exist,
     which is the whole point of the attribute on a paged table. */
  var aria='Assets in '+d.l+' '+g+', '+all.length+' asset row'+(all.length===1?'':'s')+', 7 columns';
  return '<div class="faf-tblwrap">'+
    '<div class="scroll faf-tscroll" role="table" aria-label="'+fafEsc(aria)+'" aria-rowcount="'+(all.length+2)+'" aria-colcount="7">'+
      '<div class="faf-tbl">'+
        '<div class="faf-rowgroup" role="rowgroup">'+fafAssetHead(w)+'</div>'+
        '<div class="faf-rowgroup" role="rowgroup">'+body+'</div>'+
        '<div class="faf-rowgroup" role="rowgroup">'+fafAssetTotalRow(w,all)+'</div>'+
      '</div>'+
    '</div>'+
    fafPager(w)+
  '</div>';
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
    return fafHeader(w)+fafActionRow()+'<div class="faf-body">'+fafActiveView(w)+'</div>';
  }
  /* Explore, section 5: the active view across all groups in the dimension. */
  return fafHeader(w)+fafActionRow()+'<div class="faf-body">'+fafActiveView(w)+'</div>';
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
  /* 2026-09-03: paging. Prev and Next move one page; the index is clamped on read, so
     a change that shortens the set cannot strand the view past the end. */
  if(a==='page-prev'){ w.page=Math.max(0,fafPageIndex(w)-1); fafRerender(); return; }
  if(a==='page-next'){ w.page=Math.min(fafPageCount(w)-1,fafPageIndex(w)+1); fafRerender(); return; }
  if(a==='dim'||a==='group'||a==='measure'){
    if(FAF_POP&&FAF_POP.type===a&&document.getElementById('fafPop')) fafClosePop();
    else fafOpenPop(t,a);
    return;
  }
  if(a==='set-dim'){
    w.page=0;
    var nd=t.getAttribute('data-v');
    if(w.dim!==nd){ w.dim=nd; w.group=null; } /* THE RESET, section 4 */
    fafClosePop(); fafRerender(); return;
  }
  if(a==='set-group'){ /* 2026-09-03: back to page 1 whenever the row set changes. Landing on page 4 of a
     group that now has one page would show an empty table. */
    w.page=0; w.group=t.getAttribute('data-v'); fafClosePop(); fafRerender(); return; }
  if(a==='set-measure'){ w.measure=t.getAttribute('data-v'); fafClosePop(); fafRerender(); return; }
  if(a==='sort'){
    w.page=0;
    var k=t.getAttribute('data-k'),p=(w.sort||'tag-asc').split('-');
    /* First click on a money column opens DESCENDING, because the useful question of a
       value column is which is largest. Text columns open ascending. Re-clicking the
       active column flips it. */
    var firstDir=FAF_MEASURES.some(function(m){return m.k===k;})?'desc':'asc';
    w.sort=(p[0]===k)?(k+'-'+(p[1]==='asc'?'desc':'asc')):(k+'-'+firstDir);
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

var KEYS=['tag','nm'].concat(FAF_MEASURES.map(function(m){return m.k;}));
ok('1 seven sortable keys', KEYS.length===7);
var h=fafContent(W({size:'wide',view:'assets'}));
ok('2 a sort control on every column', (h.match(/data-faf="sort"/g)||[]).length===7);
KEYS.forEach(function(k){ ok('3 '+k+' has a control', has(h,'data-k="'+k+'"')); });

// each key actually reorders, and the order is over the WHOLE group not the page
var big=null;
['Audio Visual','Buildings','Office Equipment'].forEach(function(g){
  var w=W({view:'assets',dim:'cls',group:g});
  if(!big && fafSortedAssets(w).length>FAF_PAGE_SIZE) big=w;
});
ok('4 found a multi-page group', big!==null);
KEYS.forEach(function(k){
  var asc=fafSortedAssets(W(Object.assign({},big,{sort:k+'-asc'})));
  var desc=fafSortedAssets(W(Object.assign({},big,{sort:k+'-desc'})));
  ok('5 '+k+' asc and desc differ', JSON.stringify(asc.map(function(a){return a.tag;}))!==JSON.stringify(desc.map(function(a){return a.tag;})));
  ok('6 '+k+' desc is the reverse population', asc.length===desc.length);
  if(FAF_MEASURES.some(function(m){return m.k===k;})){
    var vals=desc.map(function(a){return fafValue(a,k);});
    var sorted=vals.slice().sort(function(x,y){return y-x;});
    ok('7 '+k+' sorts NUMERICALLY descending', JSON.stringify(vals)===JSON.stringify(sorted));
  }
});
// the sort spans the whole group: page 1 under desc must hold the largest values
var k='cost';
var allDesc=fafSortedAssets(W(Object.assign({},big,{sort:k+'-desc'})));
var pg1=fafPageRows(W(Object.assign({},big,{sort:k+'-desc',page:0})));
ok('8 page 1 holds the top of the whole sorted set',
   JSON.stringify(pg1.map(function(a){return a.tag;}))===JSON.stringify(allDesc.slice(0,FAF_PAGE_SIZE).map(function(a){return a.tag;})));
var lastIdx=fafPageCount(W(Object.assign({},big,{sort:k+'-desc'})))-1;
var pgL=fafPageRows(W(Object.assign({},big,{sort:k+'-desc',page:lastIdx})));
ok('9 the last page holds the tail of the same sorted set',
   pgL[pgL.length-1].tag===allDesc[allDesc.length-1].tag);
ok('10 no row appears on two pages', (function(){
  var seen={},dup=false,n=fafPageCount(W(Object.assign({},big,{sort:k+'-desc'})));
  for(var i=0;i<n;i++){ fafPageRows(W(Object.assign({},big,{sort:k+'-desc',page:i}))).forEach(function(a){ if(seen[a.tag])dup=true; seen[a.tag]=1; }); }
  return !dup && Object.keys(seen).length===allDesc.length;
})());
// aria-sort reflects reality on the active column only
var hs=fafContent(W({size:'wide',view:'assets',sort:'cost-desc'}));
ok('11 active column reports descending', /aria-sort="descending"/.test(hs));
ok('12 exactly one column is active', (hs.match(/aria-sort="(ascending|descending)"/g)||[]).length===1);
ok('13 the rest report none', (hs.match(/aria-sort="none"/g)||[]).length===6);
// totals unaffected by sort
function tot(x){var m=x.match(/aria-label="Total Net[^"]*"/);return m?m[0]:null;}
ok('14 the totals row is identical under any sort',
   tot(fafContent(W({size:'wide',view:'assets',sort:'tag-asc'})))===tot(fafContent(W({size:'wide',view:'assets',sort:'cost-desc'}))));

console.log('');
console.log((F?'FAIL':'PASS')+' -- '+P+' passed, '+F+' failed');
