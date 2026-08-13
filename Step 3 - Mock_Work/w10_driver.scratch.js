/* W10 loanF DOM-shim driver (build-final-widget Phase 3).
   Extracts the loanF data + render fns + handlers VERBATIM from the live
   mockup, runs them under a minimal DOM shim, and asserts the Final's
   interactions actually produce DOM. Green required. */
const fs=require('fs');
const path='Dashboard Widget Mockups.html';
const html=fs.readFileSync(path,'utf8');

// --- extract the loanF block verbatim ---
const START='/* (1) DATA (Jo\'s LOAN_* renamed LOANF_*)';
const END='\n// W10 — Loans With Balance Due';
const si=html.indexOf(START); const ei=html.indexOf(END, si);
if(si<0||ei<0){ console.error('EXTRACT FAIL: markers not found',si,ei); process.exit(1); }
const block=html.slice(si,ei);
if(block.indexOf('var LOANF_STATE')<0){ console.error('EXTRACT FAIL: LOANF_STATE not in block; len='+block.length); process.exit(1); }

// --- minimal DOM shim ---
const captures={}; global.captures=captures;
function mkEl(id){ return {id:id||'',_html:'',className:'',style:{},attrs:{},
  set innerHTML(v){this._html=v; if(this.id)captures[this.id]=v;}, get innerHTML(){return this._html;},
  setAttribute(k,v){this.attrs[k]=v;}, getAttribute(k){return this.attrs[k]||null;},
  appendChild(){}, remove(){}, getBoundingClientRect(){return {left:10,top:10,right:110,bottom:40,width:100,height:30};},
  offsetWidth:120, offsetHeight:80, querySelector(){return null;}, closest(){return null;},
  focus(){}, click(){} }; }
const elStore={};
global.document={
  getElementById(id){ if(!elStore[id])elStore[id]=mkEl(id); return elStore[id]; },
  createElement(){ return mkEl(''); },
  body:{ appendChild(){}, style:{} },
  addEventListener(){}, querySelector(){return null;}, querySelectorAll(){return [];}
};
global.window={ innerWidth:1400, innerHeight:900, addEventListener(){}, requestAnimationFrame(fn){fn&&fn();} };
global.innerWidth=1400; global.innerHeight=900;
global.requestAnimationFrame=fn=>{fn&&fn();};
global.setTimeout=(fn)=>0; global.clearTimeout=()=>{};
let toasts=[]; global.showToast=(m)=>{toasts.push(m);};
global.FC_STATE={10:{opt:'F',sz:{k:'k',s:'s',m:'m',l:'l'}}};
let rerenders=0; global.fcRenderWidget=()=>{rerenders++;};

// eval block + harness in one scope
const results=[]; let pass=0, fail=0;
function ok(name,cond,extra){ if(cond){pass++;results.push('  PASS  '+name);} else {fail++;results.push('  FAIL  '+name+(extra?'  ['+extra+']':''));} }

const harness=`
(function(){
  var R={};
  // 1) non-empty render at every supported size
  LOANF_STATE.loanType='All'; LOANF_STATE.loanBucket='total'; LOANF_STATE.loanSort='days-desc'; LOANF_STATE.state=null; LOANF_STATE.dataset=null; LOANF_STATE.loanloading=false;
  R.glance=loanFRender(10,'k');
  R.explore=loanFRender(10,'m');
  R.detailL=loanFRender(10,'l');
  R.detailX=loanFRender(10,'x');
  // 2) filter (loan type) changes output
  var outByType={};
  LOANF_TYPES.forEach(function(t){ LOANF_STATE.loanType=t; outByType[t]=loanFRender(10,'m'); });
  LOANF_STATE.loanType='All';
  R.outByType=outByType;
  R.typesAllDistinctFromChurchExp=(outByType['All']!==outByType['Church Expansion']);
  R.typeIndividualNonEmpty=(outByType['Individual']&&outByType['Individual'].length>0);
  // 3) aging band toggle changes output (Detail shows the aging panel filter)
  var outByBucket={};
  ['total','cur','b1','b2','b3'].forEach(function(b){ LOANF_STATE.loanBucket=b; outByBucket[b]=loanFRender(10,'l'); });
  LOANF_STATE.loanBucket='total';
  R.bucketTotalVsB3=(outByBucket['total']!==outByBucket['b3']);
  R.bucketB2Distinct=(outByBucket['b2']!==outByBucket['total']);
  // 4) sort toggles change output
  LOANF_STATE.loanSort='days-desc'; var sA=loanFRender(10,'m');
  LOANF_STATE.loanSort='amt-desc'; var sB=loanFRender(10,'m');
  LOANF_STATE.loanSort='name-asc'; var sC=loanFRender(10,'m');
  LOANF_STATE.loanSort='days-desc';
  R.sortChanges=(sA!==sB)&&(sA!==sC);
  // 5) KPI Total Balance Due renders (headline number present in Glance)
  var tot=loanFTotal(LOANF_STATE);
  R.kpiHasTotal=(R.glance.indexOf(loanFMoney(tot))>=0);
  R.kpiHeadlineFn=(typeof FC_KPI_HEADLINE!=='undefined');
  // 6) aging bands render (all four labels present at Detail)
  R.bandsRender=['Current','1-30 days','31-60 days','90+ days'].every(function(l){return R.detailL.indexOf(l)>=0;});
  // 7) drill modal opens (simulate a loan-open click, then check modal root captured)
  var openTarget={ getAttribute:function(k){return k==='data-loanf'?'loan-open':(k==='data-acct'?'LN-1301':null);},
    closest:function(sel){ return (sel==='[data-loanf]')?openTarget:(sel==='.loanf-root'?{}:null); } };
  loanFOnClick({target:{closest:function(sel){return openTarget.closest(sel);}}});
  R.modalHtml=(typeof captures['loanfModalRoot']==='string')?captures['loanfModalRoot']:'';
  R.modalOpened=(R.modalHtml.indexOf('Loan detail')>=0 && R.modalHtml.indexOf('Third Presbyterian Church')>=0 && R.modalHtml.indexOf('Payment history')>=0);
  // close it
  var closeTarget={ getAttribute:function(k){return k==='data-loanf'?'loan-detail-close':null;}, closest:function(sel){return (sel==='[data-loanf]')?closeTarget:(sel==='.loanf-root'?{}:null);} };
  loanFOnClick({target:{closest:function(sel){return closeTarget.closest(sel);}}});
  R.modalClosed=(captures['loanfModalRoot']==='');
  // 8) empty-data state renders cleanly (no throw), at Explore and Glance
  LOANF_STATE.state='empty';
  R.emptyExplore=loanFRender(10,'m');
  R.emptyGlance=loanFRender(10,'k');
  LOANF_STATE.state=null;
  R.emptyExploreClean=(R.emptyExplore.indexOf('Nothing outstanding')>=0);
  R.emptyGlanceClean=(R.emptyGlance.indexOf('All settled')>=0);
  // also dataset='none' path
  LOANF_STATE.dataset='none'; R.emptyNone=loanFRender(10,'l'); LOANF_STATE.dataset=null;
  R.emptyNoneClean=(R.emptyNone.indexOf('Nothing outstanding')>=0);
  // 9) em-dash sweep across states x sizes x filters
  var emHits=0, samples=[];
  ['All','Church Expansion','Individual','Church - Special'].forEach(function(ty){
    LOANF_STATE.loanType=ty;
    ['total','cur','b1','b2','b3'].forEach(function(bk){
      LOANF_STATE.loanBucket=bk;
      ['k','m','l','x'].forEach(function(sz){
        var out=loanFRender(10,sz);
        if(out.indexOf('\\u2014')>=0){emHits++; if(samples.length<3)samples.push(ty+'/'+bk+'/'+sz);}
      });
    });
  });
  LOANF_STATE.loanType='All'; LOANF_STATE.loanBucket='total';
  // modal em-dash sweep
  loanFOnClick({target:{closest:function(sel){return openTarget.closest(sel);}}});
  if((captures['loanfModalRoot']||'').indexOf('\\u2014')>=0){emHits++; samples.push('modal');}
  loanFOnClick({target:{closest:function(sel){return closeTarget.closest(sel);}}});
  R.emHits=emHits; R.emSamples=samples;
  return R;
})();
`;

let R;
try { R=(new Function(block+'\n;var __R='+harness+'\nreturn __R;'))(); }
catch(e){ console.error('RUNTIME ERROR:',e.message,'\n',e.stack); process.exit(1); }

ok('Glance renders non-empty', R.glance&&R.glance.length>50, 'len='+(R.glance||'').length);
ok('Explore renders non-empty', R.explore&&R.explore.length>50, 'len='+(R.explore||'').length);
ok('Detail (l) renders non-empty', R.detailL&&R.detailL.length>50, 'len='+(R.detailL||'').length);
ok('Detail (x) renders non-empty', R.detailX&&R.detailX.length>50, 'len='+(R.detailX||'').length);
ok('Loan-type filter changes output', R.typesAllDistinctFromChurchExp);
ok('Loan-type Individual renders content', R.typeIndividualNonEmpty);
ok('Aging band toggle total vs 90+ changes output', R.bucketTotalVsB3);
ok('Aging band toggle 31-60 distinct from total', R.bucketB2Distinct);
ok('Sort toggle changes output', R.sortChanges);
ok('KPI Total Balance Due renders in Glance', R.kpiHasTotal);
ok('Four aging bands render at Detail', R.bandsRender);
ok('Drill modal opens with loan detail', R.modalOpened, 'htmlLen='+(R.modalHtml||'').length);
ok('Drill modal closes cleanly', R.modalClosed);
ok('Empty state renders cleanly at Explore', R.emptyExploreClean);
ok('Empty state renders cleanly at Glance', R.emptyGlanceClean);
ok('Empty dataset=none renders cleanly at Detail', R.emptyNoneClean);
ok('No em dashes across states x sizes x filters (+modal)', R.emHits===0, 'hits='+R.emHits+' '+(R.emSamples||[]).join(','));

console.log('\n=== W10 loanF DOM-shim driver ===');
console.log(results.join('\n'));
console.log('\n--- '+pass+' PASS, '+fail+' FAIL ---');
process.exit(fail?1:0);
