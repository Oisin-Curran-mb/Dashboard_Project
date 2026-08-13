/* W09 Payroll Scheduled Time Off - DOM-shim driver (build-final-widget Phase 3).
   Extracts the live payF F-branch code verbatim, runs it under a minimal shim, and
   asserts the v2.7 owner changes (per-day lines, Rejected removed, Group by Department
   default, leave-type icons removed) on top of the pre-existing F-branch assertions
   (sizes, filters, views, empty, em-dash, approve/undo/bulk, Info overlap, day detail). */
const fs=require('fs'); const vm=require('vm'); const path=require('path');
const FILE=path.join(__dirname,'Dashboard Widget Mockups.html');
const html=fs.readFileSync(FILE,'utf8');
const lines=html.split(/\r?\n/);
const startIdx=lines.findIndex(l=>l.includes("var PAYF_ME='You'"));
const endIdx=lines.findIndex(l=>l.includes('WRENDER[9]=function'));
if(startIdx<0||endIdx<0||endIdx<=startIdx){console.error('EXTRACT FAIL',startIdx,endIdx);process.exit(1);}
const src=lines.slice(startIdx,endIdx).join('\n');

// --- minimal shim -----------------------------------------------------------
const sandbox={Date:Date, console:console, Object:Object, Array:Array, String:String,
  Math:Math, JSON:JSON, parseInt:parseInt, isNaN:isNaN, RegExp:RegExp};
sandbox.document={addEventListener:function(){}, getElementById:function(){return null;}};
sandbox.window=sandbox;
sandbox.requestAnimationFrame=function(){};
vm.createContext(sandbox);
vm.runInContext(src, sandbox);

let fails=0, passes=0;
function ok(name,cond,extra){ if(cond){passes++; console.log('  PASS  '+name);} else {fails++; console.log('  FAIL  '+name+(extra?('  -> '+extra):''));} }
function reset(){ sandbox.PAYF_STATE.view='queue'; sandbox.PAYF_STATE.status='pending';
  sandbox.PAYF_STATE.queueGroup='dept'; sandbox.PAYF_STATE.calGroup='dept';
  sandbox.PAYF_STATE.size='explore'; sandbox.PAYF_STATE.approvals={}; sandbox.PAYF_STATE.dataset='full';
  sandbox.PAYF_STATE.calY=sandbox.PAYF_TODAY_Y; sandbox.PAYF_STATE.calM=sandbox.PAYF_TODAY_M;
  sandbox.PAYF_STATE.dayDetail=null; sandbox.PAYF_STATE.infoPerson=null; }
const W=sandbox.PAYF_STATE;
function monthEnts(){ return sandbox.payFMonthEntries(W, W.calY, W.calM); }
function findFe(name){ return monthEnts().filter(f=>f.person===name)[0]; }
function workFlat(){ return sandbox.payFWorkFlat(W); }
function firstPending(){ return workFlat().filter(f=>sandbox.payFEff(W,f)==='Pending')[0]; }
function personKeyOf(name){ var fe=workFlat().filter(f=>f.person===name)[0]; return fe&&fe.personKey; }
function makeTarget(attrs){ return { getAttribute:function(k){return attrs[k]!=null?String(attrs[k]):null;},
  closest:function(sel){ if(sel==='.payf-root')return {}; if(sel==='[data-payf]')return this; return null; } }; }

console.log('=== W09 driver: v2.7 owner changes (per-day, no Rejected, Dept default, no type icons) ===');

// ===== CHANGE 1: each day is its own entry/line ================================
console.log('\n--- CHANGE 1: per-day model ---');
(function(){ reset();
  // Dana Whitfield has a 3-day Vacation request Aug 12-14 in the source data.
  const dana=workFlat().filter(f=>f.person==='Dana Whitfield' && f.type==='Vacation' && f.mo===sandbox.PAYF_WORK_M);
  ok('3-day request expands to 3 flat day-lines (Dana Aug 12-14)', dana.length===3, 'len='+dana.length);
  const days=dana.map(f=>f.d).sort((a,b)=>a-b);
  ok('the 3 day-lines are days 12,13,14 (single-day each, d===dEnd)', days.join(',')==='12,13,14' && dana.every(f=>f.d===f.dEnd), JSON.stringify(days));
  ok('each day-line has a distinct _id', new Set(dana.map(f=>f._id)).size===3);
  ok('per-day hours = request hours / span (24h/3 = 8h)', dana.every(f=>f.hours===8), JSON.stringify(dana.map(f=>f.hours)));
})();
// rendered QUEUE: the 3-day request is 3 separate lines with 3 distinct dates (not one range)
(function(){ reset(); W.view='queue'; W.size='detail'; W.status='all';
  const q=sandbox.payFQueue(W);
  ok('QUEUE renders 3 separate day-lines for Aug 12, 13, 14', q.indexOf('>Aug 12<')>=0 && q.indexOf('>Aug 13<')>=0 && q.indexOf('>Aug 14<')>=0, 'dates');
  ok('QUEUE shows NO range row for the request (no "Aug 12 to 14")', q.indexOf('Aug 12 to 14')<0 && q.indexOf('12 to 14')<0);
  // count Dana's 3 Vacation day-lines precisely via their per-day _id (entry index 0, days 12/13/14)
  const danaVacRows=(q.match(/data-id="Weekly Staff#Dana Whitfield#0#1[234]"/g)||[]).length;
  ok('QUEUE has exactly 3 day-lines (Approve controls) for Dana Aug 12-14 request', danaVacRows===3, 'rows='+danaVacRows);
})();
// rendered CALENDAR: the 3-day request is 3 day-markers (days 12,13,14), not one bar
(function(){ reset(); W.view='calendar'; W.size='detail';
  const cal=sandbox.payFCalendar(W);
  const danaMarks=(cal.match(/data-id="Weekly Staff#Dana Whitfield#0#1[234]"/g)||[]).length;
  ok('CALENDAR marks each of the 3 days (3 Dana markers, days 12/13/14)', danaMarks===3, 'marks='+danaMarks);
  ok('CALENDAR marker days 12,13,14 each present', /data-day="12"/.test(cal) && /data-day="13"/.test(cal) && /data-day="14"/.test(cal));
})();
// counts count DAY-lines
(function(){ reset();
  const pk=personKeyOf('Dana Whitfield');
  ok('per-person pending count = DAY-lines (Dana = 3 pending days)', sandbox.payFPersonPending(W,pk)===3, sandbox.payFPersonPending(W,pk));
  reset(); W.view='queue'; W.size='detail'; W.status='all';
  const q=sandbox.payFQueue(W);
  ok('person bulk shows "Approve all (3)" counting day-lines', /Approve all \(3\)/.test(q));
})();

// ===== CHANGE 2: Rejected removed everywhere ==================================
console.log('\n--- CHANGE 2: no Rejected anywhere ---');
(function(){ // sweep every rendered combination and prove Rejected/red absence
  let hitsRej=[], hitsRed=[], hitsBtn=[], hitsCancel=[];
  const sizes=['k','m','l','x'], views=['queue','calendar'], statuses=['all','pending','approved'], groups=['dept','paygroup'];
  ['full'].forEach(function(ds){ sizes.forEach(function(sz){ views.forEach(function(v){ statuses.forEach(function(st){ groups.forEach(function(g){
    reset(); W.dataset=ds; W.view=v; W.status=st; W.queueGroup=g; W.calGroup=g;
    let out=sandbox.payFRender(9,sz);
    if(v==='calendar'){ W.dayDetail={y:W.calY,m:W.calM,d:12,focusId:null}; out+=sandbox.payFRender(9,sz); }
    if(v==='queue'){ W.infoPerson='Weekly Staff|Dana Whitfield'; out+=sandbox.payFRender(9,sz); }
    if(/Reject/i.test(out)) hitsRej.push([sz,v,st,g]);
    /* v2.8: red (#c0392b) is now legitimate for Outstanding. It must never appear WITHOUT the
       word "Outstanding" alongside it (colour is never the only signal). */
    if(out.indexOf('#c0392b')>=0 && out.indexOf('Outstanding')<0) hitsRed.push([sz,v,st,g]);
    if(out.indexOf('data-payf="reject-entry"')>=0||out.indexOf('data-payf="reject-person"')>=0) hitsBtn.push([sz,v,st,g]);
    if(out.indexOf('>cancel<')>=0) hitsCancel.push([sz,v,st,g]);
  });});});});});
  ok('NO "Reject"/"Rejected" text in any rendered output', hitsRej.length===0, JSON.stringify(hitsRej.slice(0,4)));
  ok('red (#c0392b) never appears without the word "Outstanding" (colour not the only signal)', hitsRed.length===0, JSON.stringify(hitsRed.slice(0,4)));
  ok('NO reject-entry / reject-person action handlers rendered', hitsBtn.length===0, JSON.stringify(hitsBtn.slice(0,4)));
  ok('NO cancel (reject) icon glyph anywhere', hitsCancel.length===0, JSON.stringify(hitsCancel.slice(0,4)));
})();
ok('status filter has NO rejected chip (data-v="rejected" gone)', sandbox.payFStatusFilter(W).indexOf('data-v="rejected"')<0);
ok('filter chips are EXACTLY All / Pending / Approved', (function(){var sf=sandbox.payFStatusFilter(W);return sf.indexOf('data-v="all"')>=0 && sf.indexOf('data-v="pending"')>=0 && sf.indexOf('data-v="approved"')>=0 && sf.indexOf('data-v="rejected"')<0;})());
ok('payFStatusColor: Approved green, Pending amber, Outstanding red (v2.8); Rejected is not a real status', sandbox.payFStatusColor('Approved')==='#2e7d32' && sandbox.payFStatusColor('Pending')==='#c77d00' && sandbox.payFStatusColor('Outstanding')==='#c0392b' && sandbox.payFStatusColor('Rejected')==='#c77d00');
ok('payFRejecterText helper removed (superseded)', typeof sandbox.payFRejecterText==='undefined');
ok('no data source carries a Rejected status', workFlat().every(f=>f.st!=='Rejected') && sandbox.payFFlat(W).every(f=>f.st!=='Rejected'));
// Undo still reverses Approved back to Pending
(function(){ reset(); const fe=firstPending();
  sandbox.payFOnClick({target:makeTarget({'data-payf':'approve-entry','data-id':fe._id})});
  ok('Approve sets day to Approved', sandbox.payFEff(W,fe)==='Approved');
  sandbox.payFOnClick({target:makeTarget({'data-payf':'unapprove-entry','data-id':fe._id})});
  ok('Undo reverses Approved back to Pending', sandbox.payFEff(W,fe)==='Pending');
})();
// calendar day-colour priority = any Pending -> yellow, else all-approved -> green (no red)
(function(){ reset(); const ds=sandbox.payFDayStatus; function fe(st){return {_id:'x'+Math.random(),st:st};}
  ok('priority: pending+approved -> pending (yellow)', ds([fe('Approved'),fe('Pending')],W)==='pending');
  ok('priority: all approved -> approved (green)', ds([fe('Approved'),fe('Approved')],W)==='approved');
  ok('priority: no rejected status produced', ds([fe('Approved'),fe('Pending')],W)!=='rejected');
  ok('priority: no-request day -> "" (neutral)', ds([],W)==='');
})();
(function(){ reset(); W.view='calendar'; W.size='detail';
  const inject={pg:'ZZ Test PG', people:[
    {name:'Mix Pending', dept:'ZZDept', entries:[{type:'Vacation', d:16, hours:8, st:'Pending'}]},
    {name:'Mix Approved', dept:'ZZDept', entries:[{type:'Sick', d:16, hours:8, st:'Approved', appBy:'X', appDate:'Aug 1'}]},
    {name:'App Only', dept:'ZZDept', entries:[{type:'Misc', d:15, hours:8, st:'Approved', appBy:'X', appDate:'Aug 1'}]}]};
  sandbox.PAYF_GROUPS.push(inject);
  try{
    const cal=sandbox.payFCalendar(W);
    ok('rendered: day16 (pending+approved) cell = st-pending (yellow)', /class="payf-day has st-pending"[^>]*data-day="16"/.test(cal));
    ok('rendered: day15 (approved only) cell = st-approved (green)', /class="payf-day has st-approved"[^>]*data-day="15"/.test(cal));
    ok('rendered: NO st-rejected class anywhere', cal.indexOf('st-rejected')<0);
    ok('rendered: day cells name status in aria-label (some pending / all approved)', cal.indexOf('some pending, open detail')>=0 && cal.indexOf('all approved, open detail')>=0);
  } finally { sandbox.PAYF_GROUPS.pop(); }
})();

// ===== CHANGE 3: Group by Department first + default ==========================
console.log('\n--- CHANGE 3: Department default + first ---');
ok('default queueGroup is dept', sandbox.PAYF_STATE.queueGroup==='dept' || (function(){reset();return W.queueGroup==='dept';})());
(function(){ reset(); ok('reset/default calGroup is dept', W.calGroup==='dept'); })();
(function(){ reset();
  const gt=sandbox.payFGroupToggle(W,'queue');
  const di=gt.indexOf('data-v="dept"'), pi=gt.indexOf('data-v="paygroup"');
  ok('Group by toggle lists Department BEFORE Pay Group (queue)', di>=0 && pi>=0 && di<pi, 'dept@'+di+' pg@'+pi);
  ok('Group by Department is the pressed/on default (queue)', /data-v="dept"[^>]*aria-pressed="true"/.test(gt) || /aria-pressed="true"[^>]*data-v="dept"/.test(gt) || gt.indexOf('vt on" data-payf="queuegroup-set" data-v="dept"')>=0, gt.slice(gt.indexOf('Group by')));
  const cgt=sandbox.payFGroupToggle(W,'cal');
  ok('Group by toggle lists Department BEFORE Pay Group (calendar)', cgtOrder(cgt));
  function cgtOrder(s){return s.indexOf('data-v="dept"')>=0 && s.indexOf('data-v="paygroup"')>=0 && s.indexOf('data-v="dept"')<s.indexOf('data-v="paygroup"');}
})();
(function(){ reset(); W.view='queue'; W.size='detail'; W.status='all';
  const q=sandbox.payFQueue(W);
  // grouped by department: department names appear as subheadings
  ok('QUEUE default grouping is by Department (dept subheadings present)', q.indexOf('Finance')>=0 && q.indexOf('Ministry')>=0);
  // flip to pay group still available
  W.queueGroup='paygroup'; const q2=sandbox.payFQueue(W);
  ok('Pay Group still available as second option (pay-group subheadings render)', q2.indexOf('Weekly Staff')>=0 && q2.indexOf('Monthly Clergy')>=0);
})();

// ===== CHANGE 4: leave-type icons removed =====================================
console.log('\n--- CHANGE 4: no leave-type icons ---');
(function(){ reset(); const fe=findFe('Dana Whitfield');
  const m=sandbox.payFMarker(fe,W,fe.d);
  ok('calendar marker has NO material-symbols icon (initials only)', m.indexOf('material-symbols-rounded')<0, m);
  ok('calendar marker shows initials "DW" as text', /class="payf-mark-tx"[^>]*>DW<\/span>/.test(m), m);
  const eff=sandbox.payFEff(W,fe), col=sandbox.payFStatusColor(eff);
  ok('marker initials coloured by STATUS ('+col+' for '+eff+')', m.indexOf('color:'+col)>=0 && m.indexOf('border-color:'+col+'66')>=0, m);
  ok('marker keeps status WORD in title + sr label (colour not the only signal)', m.indexOf(', '+eff+', ')>=0 && new RegExp('payf-sr">[^<]*'+eff).test(m));
})();
(function(){ reset(); W.view='queue'; W.size='detail'; W.status='all';
  const q=sandbox.payFQueue(W);
  ok('QUEUE row shows leave type as TEXT (Vacation)', q.indexOf('>Vacation</span>')>=0);
  ok('QUEUE has NO leave-type icon glyphs (beach_access/sick/person/more_horiz)', q.indexOf('>beach_access<')<0 && q.indexOf('>sick<')<0 && q.indexOf('>person<')<0 && q.indexOf('>more_horiz<')<0);
})();
(function(){ reset(); W.view='calendar'; const cal=sandbox.payFContent(W);
  ok('LEGEND is a simple status colour key (Colour = status)', cal.indexOf('Colour = status')>=0);
  ok('LEGEND shows green Approved + yellow Pending + red Outstanding (v2.8), no Rejected', cal.indexOf('>Approved</span>')>=0 && cal.indexOf('>Pending</span>')>=0 && cal.indexOf('>Outstanding</span>')>=0 && cal.indexOf('>Rejected</span>')<0);
  ok('LEGEND has NO leave-type icon key', cal.indexOf('payf-legend-types')<0 && cal.indexOf('Leave type')<0);
  ok('LEGEND swatches are green/yellow/red (v2.8 adds red = Outstanding)', cal.indexOf('background:#2e7d32')>=0 && cal.indexOf('background:#c77d00')>=0 && cal.indexOf('background:#c0392b')>=0);
})();
(function(){ reset(); W.view='calendar'; W.dayDetail={y:W.calY,m:W.calM,d:12,focusId:null};
  const dd=sandbox.payFDayDetail(W);
  ok('day-detail shows leave type as text, no icon', dd.indexOf('Vacation')>=0 && dd.indexOf('>beach_access<')<0);
})();

// ===== Still working: Info panel (overlap + year totals as text) ==============
console.log('\n--- still working: Info panel, day detail, month nav ---');
(function(){ reset(); W.view='queue'; const pk=personKeyOf('Dana Whitfield');
  sandbox.payFOnClick({target:makeTarget({'data-payf':'info-open','data-person':pk})});
  const c=sandbox.payFContent(W);
  ok('Info panel opens with this-year totals caption', c.indexOf('Time off this year')>=0);
  const by=sandbox.payFPersonYearByType(W,pk);
  ok('Dana YTD by type = Vac9/Sick2/Per1/Misc0 (day counts)', by.Vacation===9 && by.Sick===2 && by.Personal===1 && by.Misc===0, JSON.stringify(by));
  ok('TOP totals render as TEXT with day counts', c.indexOf('>Vacation<')>=0 && c.indexOf('>9 days<')>=0 && c.indexOf('>2 days<')>=0);
  ok('TOP totals have NO leave-type icon', c.indexOf('>beach_access<')<0 && c.indexOf('>more_horiz<')<0);
  ok('HEADER subject dept + pay group (Finance & Weekly Staff)', /payf-info-hd-sub">Finance &middot; Weekly Staff</.test(c));
  ok('LOWER caption is "Also off during these dates"', c.indexOf('Also off during these dates')>=0);
  const ov=sandbox.payFOverlapStaff(W,pk);
  const el=ov.filter(o=>o.person==='Elena Sokolova');
  const gr=ov.filter(o=>o.person==='Grace Lin');
  ok('overlap: Elena Sokolova present (dept IT, pay group Seasonal) on Aug 13', el.length>=1 && el[0].dept==='IT' && el[0].pg==='Seasonal' && el.some(o=>o.dates==='Aug 13'), JSON.stringify(el));
  ok('overlap: Grace Lin present (dept Ministry, pay group Monthly Clergy), day-level', gr.length>=1 && gr[0].dept==='Ministry' && gr[0].pg==='Monthly Clergy' && gr.some(o=>o.dates==='Aug 13') && gr.some(o=>o.dates==='Aug 14'), JSON.stringify(gr));
  ok('overlap uses day-level dates (single days, no range)', ov.every(o=>o.dates.indexOf(' to ')<0), JSON.stringify(ov.map(o=>o.dates)));
  ok('LOWER DOM: overlap names + dept + pay group + type + status as text', c.indexOf('>Elena Sokolova<')>=0 && /IT &middot; Seasonal</.test(c) && c.indexOf('Personal &middot; Pending')>=0);
  ok('LOWER overlap rows have NO leave-type icon', c.indexOf('payf-info-oth-dt"><span class="material-symbols-rounded"')<0);
  sandbox.payFOnClick({target:makeTarget({'data-payf':'info-close'})});
  ok('info-close dismisses', W.infoPerson===null);
})();
(function(){ reset(); W.view='queue'; const pk=personKeyOf('Priya Nandakumar');
  const ov=sandbox.payFOverlapStaff(W,pk);
  ok('Priya Nandakumar has NO overlap (data)', ov.length===0, JSON.stringify(ov));
  sandbox.payFOnClick({target:makeTarget({'data-payf':'info-open','data-person':pk})});
  ok('no-overlap: clean "No one else is off during these dates." line', sandbox.payFContent(W).indexOf('No one else is off during these dates.')>=0);
})();
// bulk approve-all fires
(function(){ reset(); W.view='queue'; const pk=personKeyOf('Marcus Bell');
  const before=sandbox.payFPersonPending(W,pk);
  sandbox.payFOnClick({target:makeTarget({'data-payf':'approve-person','data-person':pk})});
  ok('bulk Approve all: had pending, now none', before>0 && sandbox.payFPersonPending(W,pk)===0, 'before='+before);
})();
// day click + marker click open detail; month nav works
(function(){ reset(); W.view='calendar';
  sandbox.payFOnClick({target:makeTarget({'data-payf':'day-open','data-day':12})});
  ok('day click opens day detail (day 12)', W.dayDetail && W.dayDetail.d===12);
  ok('day detail lists person out that day', sandbox.payFContent(W).indexOf('Dana Whitfield')>=0);
  reset(); W.view='calendar'; const fe=findFe('Dana Whitfield');
  sandbox.payFOnClick({target:makeTarget({'data-payf':'mark-open','data-day':fe.d,'data-id':fe._id})});
  ok('marker click pre-focuses person', W.dayDetail && W.dayDetail.focusId===fe._id);
})();
(function(){ reset(); W.view='calendar'; const m0=W.calM;
  sandbox.payFOnClick({target:makeTarget({'data-payf':'cal-next'})});
  ok('month nav next advances the month', W.calM===((m0+1)%12));
  sandbox.payFOnClick({target:makeTarget({'data-payf':'cal-prev'})});
  ok('month nav prev returns', W.calM===m0);
})();

// ===== Pre-existing: sizes / filters / views / empty / em-dash ================
console.log('\n--- pre-existing guards ---');
reset();
['k','m','l','x'].forEach(function(slot){ const h=sandbox.payFRender(9,slot);
  ok('render non-empty for slot '+slot, typeof h==='string' && h.length>50 && h.indexOf('payf-root')>=0); });
(function(){ reset(); W.view='queue'; W.size='detail';
  W.status='pending'; const a=sandbox.payFQueue(W);
  W.status='all';     const b=sandbox.payFQueue(W);
  W.status='approved';const c=sandbox.payFQueue(W);
  ok('status filter pending != all', a!==b);
  ok('status filter all != approved', b!==c);
})();
(function(){ reset(); W.view='queue'; ok('view=queue renders queue', sandbox.payFContent(W).indexOf('payf-queue')>=0);
  reset(); W.view='calendar'; const cal=sandbox.payFContent(W); ok('view=calendar renders grid', cal.indexOf('payf-grid')>=0 && cal.indexOf('payf-wk')>=0);
})();
(function(){ reset(); W.dataset='none';
  let ehtml='', threw=false; try{ ehtml=sandbox.payFRender(9,'m'); }catch(e){ threw=true; }
  ok('empty-data renders without throwing', !threw);
  ok('empty-data shows clean empty state', ehtml.indexOf('No time off scheduled')>=0);
  let g=''; try{ g=sandbox.payFRender(9,'k'); }catch(e){ threw=true; }
  ok('empty-data Glance renders clean (Pending + Outstanding, both 0)', !threw && g.indexOf('>Pending<')>=0 && g.indexOf('>Outstanding<')>=0);
})();
(function(){ let hits=[]; const sizes=['k','m','l','x'], views=['queue','calendar'];
  const statuses=['pending','all','approved'], groups=['dept','paygroup'], datasets=['full','none'];
  datasets.forEach(function(ds){ sizes.forEach(function(sz){ views.forEach(function(v){ statuses.forEach(function(st){ groups.forEach(function(g){
    reset(); W.dataset=ds; W.view=v; W.status=st; W.queueGroup=g; W.calGroup=g;
    let out=''; try{ out=sandbox.payFRender(9,sz); }catch(e){ out='THREW:'+e.message; }
    if(v==='calendar' && ds==='full'){ W.dayDetail={y:W.calY,m:W.calM,d:12,focusId:null}; try{ out+=sandbox.payFRender(9,sz);}catch(e){} }
    if(v==='queue' && ds==='full'){ W.infoPerson='Weekly Staff|Dana Whitfield'; try{ out+=sandbox.payFRender(9,sz);}catch(e){} }
    if(out.indexOf('—')>=0) hits.push([ds,sz,v,st,g,'EM']);
    if(out.indexOf('–')>=0) hits.push([ds,sz,v,st,g,'EN']);
  });});});});});
  ok('no em/en dashes in any F output combination', hits.length===0, JSON.stringify(hits.slice(0,5)));
})();

// ===== v2.8 OWNER CHANGE: Outstanding = past-due pending =======================
console.log('\n--- v2.8: Outstanding (date < today AND pending) ---');
function findDay(name,d){ return workFlat().filter(f=>f.person===name && f.d===d)[0]; }
// --- classifier: date<today AND pending; approved-past NOT outstanding; pending-future NOT ---
(function(){ reset();
  const graceAug1=findDay('Grace Lin',1);      // pending, Aug 1 (before Aug 7) -> OUTSTANDING
  const kofiAug4=findDay('Kofi Mensah',4);      // pending, Aug 4 (before Aug 7) -> OUTSTANDING
  const danaAug3=findDay('Dana Whitfield',3);   // APPROVED, Aug 3 (before today) -> NOT outstanding
  const marcusToday=findDay('Marcus Bell',7);   // pending, Aug 7 == today -> NOT outstanding
  const danaAug12=findDay('Dana Whitfield',12); // pending, Aug 12 (future) -> NOT outstanding
  ok('classifier: Grace Aug 1 (pending, past) IS Outstanding', sandbox.payFIsOutstanding(W,graceAug1)===true);
  ok('classifier: Kofi Aug 4 (pending, past) IS Outstanding', sandbox.payFIsOutstanding(W,kofiAug4)===true);
  ok('classifier: Dana Aug 3 (APPROVED, past) is NOT Outstanding (approved-past excluded)', sandbox.payFIsOutstanding(W,danaAug3)===false);
  ok('classifier: Marcus Aug 7 (pending, TODAY) is NOT Outstanding (today is not before today)', sandbox.payFIsOutstanding(W,marcusToday)===false && sandbox.payFDateBeforeToday(marcusToday)===false);
  ok('classifier: Dana Aug 12 (pending, FUTURE) is NOT Outstanding', sandbox.payFIsOutstanding(W,danaAug12)===false);
  ok('effState words: Outstanding / Pending / Approved', sandbox.payFEffState(W,graceAug1)==='Outstanding' && sandbox.payFEffState(W,danaAug12)==='Pending' && sandbox.payFEffState(W,danaAug3)==='Approved');
})();
// --- calendar: past pending = RED; future pending = yellow; approved = green ---
(function(){ reset(); W.view='calendar'; W.size='detail';
  const cal=sandbox.payFCalendar(W);
  ok('CAL day 1 (Grace, past pending, clean) cell is st-outstanding (RED)', /class="payf-day has st-outstanding"[^>]*data-day="1"/.test(cal));
  ok('CAL day 4 (Kofi past pending + Elena approved) cell is st-outstanding (RED by priority)', /class="payf-day has st-outstanding"[^>]*data-day="4"/.test(cal));
  ok('CAL day 3 (Dana approved only) cell is st-approved (GREEN)', /class="payf-day has st-approved"[^>]*data-day="3"/.test(cal));
  ok('CAL day 11 (Grace future pending) cell is st-pending (YELLOW)', /class="payf-day has st-pending"[^>]*data-day="11"/.test(cal));
  // marker colours: Grace Aug1 red, Kofi Aug4 red, Elena Aug4 green (mixed-colour markers in one red cell)
  const gm=sandbox.payFMarker(findDay('Grace Lin',1),W,1);
  ok('CAL Grace Aug 1 marker is RED and names "Outstanding" in its label', gm.indexOf('color:#c0392b')>=0 && gm.indexOf(', Outstanding, ')>=0);
  const km=sandbox.payFMarker(findDay('Kofi Mensah',4),W,4);
  const em=sandbox.payFMarker(findDay('Elena Sokolova',4),W,4);
  ok('CAL mixed day 4: Kofi marker RED (Outstanding), Elena marker GREEN (Approved)', km.indexOf('color:#c0392b')>=0 && km.indexOf(', Outstanding, ')>=0 && em.indexOf('color:#2e7d32')>=0 && em.indexOf(', Approved, ')>=0);
  ok('CAL day-cell aria-label names the state ("some outstanding")', cal.indexOf('some outstanding, open detail')>=0);
})();
// --- legend includes red = Outstanding, paired with the word ---
(function(){ reset(); W.view='calendar'; const cal=sandbox.payFContent(W);
  ok('LEGEND now includes Outstanding (green Approved / yellow Pending / red Outstanding)', cal.indexOf('>Approved</span>')>=0 && cal.indexOf('>Pending</span>')>=0 && cal.indexOf('>Outstanding</span>')>=0);
  ok('LEGEND has a red swatch (#c0392b) for Outstanding', cal.indexOf('background:#c0392b')>=0);
})();
// --- Glance: Pending figure EXCLUDES outstanding; the two partition the pending set ---
(function(){ reset();
  const pend=sandbox.payFPendingNotOutstanding(W), outs=sandbox.payFOutstandingCount(W), total=sandbox.payFPendingCount(W);
  ok('Outstanding count is non-zero and demonstrable (Grace Aug1 + Kofi Aug4 = 2)', outs===2, 'outs='+outs);
  ok('Pending figure EXCLUDES outstanding (Pending < total pending)', pend===total-outs && pend<total, 'pend='+pend+' total='+total+' outs='+outs);
  ok('Pending + Outstanding PARTITION the pending set (no double count)', pend+outs===total, pend+'+'+outs+'!='+total);
  const g=sandbox.payFRender(9,'k');
  ok('Glance renders BOTH figures with labels Pending and Outstanding', g.indexOf('>Pending<')>=0 && g.indexOf('>Outstanding<')>=0 && g.indexOf('>'+pend+'<')>=0 && g.indexOf('>'+outs+'<')>=0);
  ok('Glance Outstanding figure is red (#c0392b)', g.indexOf('color:#c0392b')>=0);
})();
// --- Queue: outstanding day-lines carry a red "Outstanding" tag; still under Pending; counts unchanged ---
(function(){ reset(); W.view='queue'; W.size='detail'; W.status='pending';
  const q=sandbox.payFQueue(W);
  ok('QUEUE outstanding row carries the red "Outstanding" tag (payf-otag)', q.indexOf('payf-otag')>=0 && q.indexOf('Outstanding')>=0);
  // Grace Aug 1 outstanding row is shown under the Pending filter
  ok('QUEUE outstanding rows still appear under the Pending filter', q.indexOf('data-id="Monthly Clergy#Grace Lin#0#1"')>=0);
  // header/person pending counts unchanged (still include outstanding)
  const pk=personKeyOf('Grace Lin');
  ok('QUEUE per-person pending count STILL includes outstanding this pass (Grace has 4 pending day-lines incl. Aug 1)', sandbox.payFPersonPending(W,pk)===4, sandbox.payFPersonPending(W,pk));
})();
// --- approving an outstanding day makes it approved and drops it from BOTH buckets ---
(function(){ reset(); const gd=findDay('Grace Lin',1);
  const out0=sandbox.payFOutstandingCount(W), pen0=sandbox.payFPendingNotOutstanding(W), tot0=sandbox.payFPendingCount(W);
  ok('before approve: Grace Aug1 is Outstanding', sandbox.payFIsOutstanding(W,gd)===true);
  sandbox.payFOnClick({target:makeTarget({'data-payf':'approve-entry','data-id':gd._id})});
  ok('after approve: Grace Aug1 is Approved (green), no longer Outstanding', sandbox.payFEffState(W,gd)==='Approved' && sandbox.payFIsOutstanding(W,gd)===false);
  ok('after approve: Outstanding count drops by 1, Pending(excl) unchanged, total pending drops by 1', sandbox.payFOutstandingCount(W)===out0-1 && sandbox.payFPendingNotOutstanding(W)===pen0 && sandbox.payFPendingCount(W)===tot0-1);
  // undo returns it to Pending -> Outstanding again (past date)
  sandbox.payFOnClick({target:makeTarget({'data-payf':'unapprove-entry','data-id':gd._id})});
  ok('undo returns Grace Aug1 to Pending -> Outstanding again', sandbox.payFEffState(W,gd)==='Outstanding' && sandbox.payFOutstandingCount(W)===out0);
})();

console.log('\n=== '+passes+' passed, '+fails+' failed ===');
process.exit(fails?1:0);
