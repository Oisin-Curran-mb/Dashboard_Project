
var WS = {};
function gs(wid) { if (!WS[wid]) WS[wid]={filters:{},view:{}}; return WS[wid]; }
function fv(wid,label){ return gs(wid).filters[label]||null; }
function sv(wid,opt)  { return gs(wid).view[opt]||'default'; }

// ── HELPERS ──────────────────────────────────────────────────────────────────
function $m(n){ return '$'+Number(n).toLocaleString(); }
function pct(v,t){ return t?Math.round(v/t*100):0; }
function ftags(wid){
  var s=gs(wid),h='';
  Object.keys(s.filters).forEach(function(k){ if(s.filters[k]) h+='<span class="filter-tag"><span class="material-symbols-rounded" style="font-size:10px">tune</span>'+s.filters[k]+'</span>'; });
  return h?'<div class="filter-tags">'+h+'</div>':'';
}
function hbar(label,val,pctW,color){
  return '<div class="hr"><div class="hl">'+label+'</div><div class="ht"><div class="hf" style="width:'+pctW+'%;background:'+color+'"></div></div><div class="hv">'+val+'</div></div>';
}
function vbars(items,h){
  h=h||70; var w=Math.floor(100/items.length);
  var b=items.map(function(it,i){
    var bh=Math.max(Math.round((it.pct||0)*h/100),2);
    return '<g><rect x="'+(i*w+2)+'" y="'+(h-bh)+'" width="'+(w-4)+'" height="'+bh+'" rx="2" fill="'+it.color+'"/>'
      +'<text x="'+(i*w+w/2)+'" y="'+(h+11)+'" text-anchor="middle" font-size="8" fill="#aaa">'+it.label+'</text></g>';
  }).join('');
  return '<svg width="100%" viewBox="0 0 100 '+(h+14)+'" preserveAspectRatio="none" style="display:block">'+b+'</svg>';
}
function progBar(label,received,pledged,color){
  var p=pct(received,pledged);
  return '<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span style="color:#484848">'+label+'</span><span style="font-weight:600;color:'+color+'">'+p+'%</span></div>'
    +'<div class="pt" style="height:8px"><div class="pf" style="width:'+p+'%;background:'+color+'"></div></div>'
    +'<div style="font-size:10px;color:#aaa;margin-top:2px">'+$m(received)+' received of '+$m(pledged)+'</div></div>';
}
function tbl(hdrs,rows){
  var h='<table class="tbl"><thead><tr>'+hdrs.map(function(x){return '<th'+(x&&x.r?' class="r"':'')+'>'+(x&&x.l?x.l:x)+'</th>';}).join('')+'</tr></thead><tbody>';
  h+=rows.map(function(r){return '<tr>'+r.map(function(c,i){return '<td'+(hdrs[i]&&hdrs[i].r?' class="r"':'')+'>'+(c||'')+'</td>';}).join('')+'</tr>';}).join('');
  return h+'</tbody></table>';
}
// Scrollable table: sticky header, scrollable body
function tblScroll(hdrs,rows,maxH){
  var hHtml='<thead><tr>'+hdrs.map(function(x){return '<th'+(x&&x.r?' class="r"':'')+'>'+(x&&x.l?x.l:x)+'</th>';}).join('')+'</tr></thead>';
  var bHtml='<tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c,i){return '<td'+(hdrs[i]&&hdrs[i].r?' class="r"':'')+'>'+(c||'')+'</td>';}).join('')+'</tr>';}).join('')+'</tbody>';
  return '<div class="tbl-wrap"><div class="tbl-head-wrap"><table class="tbl">'+hHtml+'</table></div><div class="tbl-body-scroll" style="max-height:'+maxH+'px;overflow-y:auto"><table class="tbl">'+bHtml+'</table></div></div>';
}
function pieChart(slices,sz){
  sz=sz||90; var pos=0;
  var stops=slices.map(function(s){var st=s.c+' '+pos+'% '+(pos+s.p)+'%';pos+=s.p;return st;}).join(',');
  var leg=slices.map(function(s){return '<div class="ali"><div class="asw" style="background:'+s.c+'"></div>'+s.l+' <strong>'+s.p+'%</strong></div>';}).join('');
  return '<div style="display:flex;align-items:center;gap:16px"><div style="width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:conic-gradient('+stops+');flex-shrink:0"></div><div class="aleg">'+leg+'</div></div>';
}
function donutChart(slices,sz){
  sz=sz||90; var pos=0;
  var stops=slices.map(function(s){var st=s.c+' '+pos+'% '+(pos+s.p)+'%';pos+=s.p;return st;}).join(',');
  var leg=slices.map(function(s){return '<div class="ali"><div class="asw" style="background:'+s.c+'"></div>'+s.l+' <strong>'+s.p+'%</strong></div>';}).join('');
  var hole='<div style="position:absolute;width:'+(sz*.55)+'px;height:'+(sz*.55)+'px;background:#fff;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%)"></div>';
  return '<div style="display:flex;align-items:center;gap:16px"><div style="width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:conic-gradient('+stops+');flex-shrink:0;position:relative">'+hole+'</div><div class="aleg">'+leg+'</div></div>';
}
function cardRow(ico,bg,tc,name,sub,val,badge,badgec){
  return '<div class="acard"><div class="aico" style="background:'+bg+'"><span class="material-symbols-rounded" style="font-size:16px;color:'+tc+'">'+ico+'</span></div><div style="flex:1"><div class="an">'+name+'</div><div class="as">'+sub+'</div></div><div class="aa"><div class="ab">'+val+'</div><div class="ac" style="color:'+badgec+'">'+badge+'</div></div></div>';
}

// ── SIZE HELPERS ─────────────────────────────────────────────────────────────
function getSz(wid,opt){
  var c=document.getElementById('opt-'+wid+'-'+opt);
  if(!c) return 'l';
  if(c.classList.contains('sz-s')) return 's';
  if(c.classList.contains('sz-m')) return 'm';
  return 'l';
}
function capN(arr,sz){
  if(sz==='s') return arr.slice(0,3);
  if(sz==='m') return arr.slice(0,5);
  return arr;
}
function lOnly(html,sz){ return (sz==='l'||sz==='x')?html:''; }
function mUp(html,sz){ return sz==='s'?'':html; }

// ── YEAR-KEYED DATA HELPER ────────────────────────────────────────────────────
// For widgets with a Year filter, resolve data[filterKey][yr] with fallback
function yrData(seriesObj,key,wid){
  var yr=fv(wid,'Year')||'FY 2026';
  var bucket=seriesObj[key];
  if(!bucket) return null;
  // If bucket has year keys, return the year sub-object
  if(bucket['FY 2026']||bucket['FY 2025']||bucket['FY 2024']){
    return bucket[yr]||bucket['FY 2026']||bucket;
  }
  return bucket;
}

// ── TABLE HEIGHT BY SIZE ──────────────────────────────────────────────────────
function tH(sz){ if(sz==='x') return 440; if(sz==='l') return 340; return 110; }


var WRENDER={};

// W1 — Budget vs Actual
WRENDER[1]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Account Type')||'Income Accounts';
  var pv=fv(wid,'Period View')||'Monthly';
  var d=yrData(MOCK_DATA.series[1],key,wid)||MOCK_DATA.series[1]['Income Accounts']['FY 2026'];
  var periods=pv==='Quarterly'
    ?[['Q1',d.periods[0][1],d.periods[0][2]],['Q2',d.periods[Math.min(2,d.periods.length-1)][1],d.periods[Math.min(2,d.periods.length-1)][2]],['Q3',d.periods[Math.min(4,d.periods.length-1)][1],d.periods[Math.min(4,d.periods.length-1)][2]]]
    :d.periods;
  var maxBars=sz==='s'?4:sz==='m'?6:periods.length;
  var shownP=periods.slice(0,maxBars);
  var barH=sz==='s'?80:sz==='m'?90:110;

  if(opt==='A'){
    if(view==='table'){
      var rows=shownP.map(function(p){var v=p[2]-p[1];return [p[0],p[1]+'%',p[2]+'%','<span style="color:'+(v>=0?'#2e7d32':'#e53935')+';font-weight:600">'+(v>=0?'+':'')+v+'%</span>'];});
      if(sz==='l'||sz==='x') rows.push(['<strong>YTD</strong>','<strong>'+d.totals[0]+'</strong>','<strong>'+d.totals[1]+'</strong>','<strong style="color:'+(d.totals[2].charAt(0)==='-'?'#e53935':'#2e7d32')+'">'+d.totals[2]+'</strong>']);
      return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Period',{l:'Budget',r:true},{l:'Actual',r:true},{l:'Variance',r:true}],rows,tH(sz)):tbl(['Period',{l:'Budget',r:true},{l:'Actual',r:true},{l:'Variance',r:true}],rows));
    }
    var bars='<div class="bars" style="height:'+barH+'px">';
    shownP.forEach(function(p){bars+='<div class="bw"><div style="display:flex;gap:2px;align-items:flex-end;height:'+(barH-15)+'px"><div style="height:'+p[1]+'%;background:#a0b5e6;border-radius:2px 2px 0 0;width:9px"></div><div style="height:'+p[2]+'%;background:#4b6ec3;border-radius:2px 2px 0 0;width:9px"></div></div><div class="bl">'+p[0]+'</div></div>';});
    bars+='</div>';
    var vrow=mUp('<div style="display:flex;gap:3px;margin-top:4px">',sz);
    if(vrow) shownP.forEach(function(p,i){var v=d.varr[i]||0;var c=v>=0?'#4caf50':'#e53935';vrow+='<div style="flex:1;text-align:center;font-size:9px;font-weight:600;color:'+c+'">'+(v>=0?'+':'')+v+'%</div>';});
    if(vrow) vrow+='</div>';
    var leg=lOnly('<div class="aleg" style="margin-top:8px"><div class="ali"><div class="asw" style="background:#a0b5e6"></div>Budget</div><div class="ali"><div class="asw" style="background:#4b6ec3"></div>Actual</div></div>',sz);
    return ftags(wid)+bars+vrow+leg;
  }
  if(opt==='B'){
    var kh=lOnly('<div class="kpis" style="margin-bottom:10px">',sz);
    if(kh){['YTD Budget','YTD Actual','Variance','% Used'].forEach(function(l,i){var cv=d.totals[i];var cc=(i===2&&cv&&cv.charAt(0)==='-')?'color:#e53935':(i===2?'color:#2e7d32':'');kh+='<div class="kpi"><div class="kl">'+l+'</div><div class="kv" style="font-size:16px;'+cc+'">'+cv+'</div></div>';});kh+='</div>';}
    var hbarsHtml='<div class="hbars">'+shownP.map(function(p){var v=p[2]-p[1];return hbar(p[0],(v>=0?'+':'')+v+'%',p[2],v>=0?'#4caf50':'#e53935');}).join('')+'</div>';
    return ftags(wid)+kh+hbarsHtml;
  }
  if(opt==='C'){
    if(view==='table'){
      var rows2=shownP.map(function(p){return [p[0],p[1]+'%',p[2]+'%'];});
      if(sz==='l'||sz==='x') rows2.push(['<strong>Total</strong>','<strong>'+d.totals[0]+'</strong>','<strong>'+d.totals[1]+'</strong>']);
      return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Period',{l:'Budget',r:true},{l:'Actual',r:true}],rows2,tH(sz)):tbl(['Period',{l:'Budget',r:true},{l:'Actual',r:true}],rows2));
    }
    var wItems=[{label:'Base',pct:40,color:'#e1e1e1'}];
    (d.varr||[]).slice(0,sz==='s'?3:5).forEach(function(v,i){wItems.push({label:periods[i]?periods[i][0]:'',pct:Math.abs(v)*5+2,color:v>=0?'#4caf50':'#e53935'});});
    return ftags(wid)+mUp('<div style="font-size:10px;color:#888;margin-bottom:8px">Cumulative variance waterfall</div>',sz)+vbars(wItems,barH-20);
  }
};

// W2 — Pension Plans by District
WRENDER[2]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Church District')||'All Districts';
  var pt=fv(wid,'Plan Type')||'All Plans';
  var d=yrData(MOCK_DATA.series[2],key,wid)||MOCK_DATA.series[2]['All Districts']['FY 2026'];
  var colors={'Defined Benefit':'#4b6ec3','Defined Contribution':'#6e8bd4','403(b)':'#a0b5e6'};
  var plans=pt==='All Plans'?['Defined Benefit','Defined Contribution','403(b)']:[pt];
  var pData={'Defined Benefit':d.db,'Defined Contribution':d.dc,'403(b)':d.f403};
  var tots=plans.map(function(p){return (pData[p]||[]).reduce(function(a,b){return a+b;},0);});
  var grand=tots.reduce(function(a,b){return a+b;},0)||1;
  var dists=capN(d.districts||[],sz);
  if(opt==='A'){
    if(view==='table'){
      var rows=dists.map(function(dn){var i=d.districts.indexOf(dn);var row=[dn],dt=0;plans.forEach(function(p){var v=(pData[p]||[])[i]||0;row.push($m(v));dt+=v;});row.push('<strong>'+$m(dt)+'</strong>');return row;});
      return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['District'].concat(plans).concat([{l:'Total',r:true}]),rows,tH(sz)):tbl(['District'].concat(plans).concat([{l:'Total',r:true}]),rows));
    }
    var max=Math.max.apply(null,(d.db||[]).concat(d.dc||[],d.f403||[]))||1;
    var h='<div style="display:flex;flex-direction:column;gap:8px">';
    dists.forEach(function(dn){
      var i=d.districts.indexOf(dn);
      h+='<div><div style="font-size:10px;color:#888;margin-bottom:3px">'+dn+'</div>';
      if(view==='stacked'){
        var tot=plans.reduce(function(s,p){return s+((pData[p]||[])[i]||0);},0);
        h+='<div style="display:flex;height:18px;border-radius:3px;overflow:hidden">';
        plans.forEach(function(p){var v=(pData[p]||[])[i]||0;h+='<div style="width:'+pct(v,tot)+'%;background:'+colors[p]+'" title="'+p+': '+$m(v)+'"></div>';});
        h+='</div><div style="font-size:9px;color:#aaa;margin-top:2px">'+$m(tot)+'</div>';
      } else {
        h+='<div style="display:flex;gap:2px;height:22px">';
        plans.forEach(function(p){var v=(pData[p]||[])[i]||0;h+='<div style="width:'+Math.round(v/max*100)+'%;background:'+colors[p]+';border-radius:2px" title="'+p+': '+$m(v)+'"></div>';});
        h+='</div>';
      }
      h+='</div>';
    });
    h+='</div>';
    var legH=mUp('<div class="aleg" style="margin-top:8px">',sz);
    if(legH){plans.forEach(function(p){legH+='<div class="ali"><div class="asw" style="background:'+colors[p]+'"></div>'+p+'</div>';});legH+='</div>';}
    return ftags(wid)+h+legH;
  }
  if(opt==='B'){
    var psz=sz==='s'?80:sz==='m'?80:100;
    var slices=plans.map(function(p,i){return {l:p,p:pct(tots[i],grand),c:colors[p]};});
    var caption=mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total: '+$m(grand)+'</div>',sz);
    var chartFn=sz==='s'?function(){return '<div style="display:flex;flex-direction:column;gap:4px">'+plans.map(function(p,i){return hbar(p.split(' ')[0],$m(tots[i]),Math.round(tots[i]/grand*100),colors[p]);}).join('')+'</div>';}:null;
    if(sz==='s') return ftags(wid)+(chartFn?chartFn():hbar(plans[0]||'',$m(tots[0]||0),100,colors[plans[0]]||'#4b6ec3'));
    if(view==='donut') return ftags(wid)+donutChart(slices,psz)+caption;
    if(view==='bar'){var mxT=Math.max.apply(null,tots)||1;return ftags(wid)+'<div class="hbars">'+plans.map(function(p,i){return hbar(p,$m(tots[i]),Math.round(tots[i]/mxT*100),colors[p]);}).join('')+'</div>'+caption;}
    return ftags(wid)+pieChart(slices,psz)+caption;
  }
  if(opt==='C'){
    if(view==='bar'||sz==='s'){var mxT2=Math.max.apply(null,dists.map(function(dn){var i=d.districts.indexOf(dn);return plans.reduce(function(s,p){return s+((pData[p]||[])[i]||0);},0);}));if(!mxT2)mxT2=1;return ftags(wid)+'<div class="hbars">'+dists.map(function(dn){var i=d.districts.indexOf(dn);var t=plans.reduce(function(s,p){return s+((pData[p]||[])[i]||0);},0);return hbar(dn,$m(t),Math.round(t/mxT2*100),'#4b6ec3');}).join('')+'</div>';}
    var rows2=dists.map(function(dn){var i=d.districts.indexOf(dn);var row=[dn],dt=0;plans.forEach(function(p){var v=(pData[p]||[])[i]||0;row.push($m(v));dt+=v;});row.push('<strong>'+$m(dt)+'</strong>');return row;});
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['District'].concat(plans).concat([{l:'Total',r:true}]),rows2,tH(sz)):tbl(['District'].concat(plans).concat([{l:'Total',r:true}]),rows2));
  }
};

// W3 — Payroll Distributions
WRENDER[3]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Department')||'All Departments';
  var d=MOCK_DATA.series[3][key]||MOCK_DATA.series[3]['All Departments'];
  var colors=['#4b6ec3','#6e8bd4','#a0b5e6','#c4d4f0','#e0e8fa','#bcc8e8'];
  var total=d.vals.reduce(function(a,b){return a+b;},0)||1;
  var maxV=Math.max.apply(null,d.vals)||1;
  var barH=sz==='s'?80:sz==='m'?90:110;
  var cats=capN(d.cats,sz);
  if(opt==='A'){
    if(view==='table'){
      var rows=cats.map(function(c){var ri=d.cats.indexOf(c);return [c,$m(d.vals[ri]),pct(d.vals[ri],total)+'%'];});
      return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Category',{l:'Amount',r:true},{l:'Share',r:true}],rows,tH(sz)):tbl(['Category',{l:'Amount',r:true},{l:'Share',r:true}],rows))+lOnly('<div style="font-size:10px;color:#888;margin-top:6px;text-align:right">Total: '+$m(total)+'</div>',sz);
    }
    if(sz==='s'){
      var topCat=d.cats[0];var topVal=d.vals[0];
      return ftags(wid)+'<div style="text-align:center;padding:8px 0"><div style="font-size:22px;font-weight:700;color:#4b6ec3">'+$m(topVal)+'</div><div style="font-size:11px;color:#888">'+topCat+'</div><div style="font-size:10px;color:#aaa;margin-top:4px">Total: '+$m(total)+'</div></div>'+'<div class="hbars">'+d.cats.slice(0,3).map(function(c){var ri=d.cats.indexOf(c);return hbar(c.split(' ')[0],$m(d.vals[ri]),Math.round(d.vals[ri]/maxV*100),colors[ri]);}).join('')+'</div>';
    }
    return ftags(wid)+'<div class="hbars">'+cats.map(function(c){var ri=d.cats.indexOf(c);return hbar(c,$m(d.vals[ri]),Math.round(d.vals[ri]/maxV*100),colors[ri]);}).join('')+'</div>'+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:right">Total: '+$m(total)+'</div>',sz);
  }
  if(opt==='B'){
    var slices=d.cats.map(function(c,i){return {l:c,p:pct(d.vals[i],total),c:colors[i]};});
    var cap=mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total payroll: '+$m(total)+'</div>',sz);
    var psz=sz==='s'?80:90;
    if(view==='pie') return ftags(wid)+pieChart(slices.slice(0,sz==='s'?3:slices.length),psz)+cap;
    if(view==='bar') return ftags(wid)+'<div class="hbars">'+cats.map(function(c){var ri=d.cats.indexOf(c);return hbar(c,$m(d.vals[ri]),Math.round(d.vals[ri]/maxV*100),colors[ri]);}).join('')+'</div>'+cap;
    if(sz==='s') return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:18px;font-weight:700;color:#4b6ec3">'+$m(total)+'</div><div style="font-size:10px;color:#888">Total Payroll</div></div>'+donutChart(slices.slice(0,3),70);
    return ftags(wid)+donutChart(slices,psz)+cap;
  }
  if(opt==='C'){
    if(view==='table'){
      var rows2=cats.map(function(c){var ri=d.cats.indexOf(c);return [c,$m(d.prev[ri]),$m(d.vals[ri]),'<span style="color:'+(d.vals[ri]>=d.prev[ri]?'#2e7d32':'#e53935')+';font-weight:600">'+(d.vals[ri]>=d.prev[ri]?'+':'')+$m(d.vals[ri]-d.prev[ri])+'</span>'];});
      return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Category',{l:'Prior',r:true},{l:'Current',r:true},{l:'Change',r:true}],rows2,tH(sz)):tbl(['Category',{l:'Prior',r:true},{l:'Current',r:true},{l:'Change',r:true}],rows2));
    }
    if(sz==='s'){return ftags(wid)+'<div class="hbars">'+d.cats.slice(0,3).map(function(c){var ri=d.cats.indexOf(c);var chg=d.vals[ri]-d.prev[ri];return hbar(c.split(' ')[0],(chg>=0?'+':'')+$m(chg),Math.round(d.vals[ri]/maxV*100),chg>=0?'#4caf50':'#e53935');}).join('')+'</div>';}
    var bars='<div class="bars" style="height:'+barH+'px">';
    cats.forEach(function(c){var ri=d.cats.indexOf(c);var mxC=Math.max(d.vals[ri],d.prev[ri])||1;bars+='<div class="bw"><div style="display:flex;gap:2px;align-items:flex-end;height:'+(barH-15)+'px"><div style="height:'+Math.round(d.prev[ri]/mxC*(barH-15))+'px;background:#d2d2d2;border-radius:2px 2px 0 0;width:7px"></div><div style="height:'+Math.round(d.vals[ri]/mxC*(barH-15))+'px;background:'+colors[ri]+';border-radius:2px 2px 0 0;width:7px"></div></div><div class="bl" style="font-size:7px">'+c.split(' ')[0]+'</div></div>';});
    var legC=mUp('<div class="aleg" style="margin-top:8px"><div class="ali"><div class="asw" style="background:#d2d2d2"></div>Prior</div><div class="ali"><div class="asw" style="background:#4b6ec3"></div>Current</div></div>',sz);
    return ftags(wid)+bars+'</div>'+legC;
  }
};

// W4 — Remittance Pledges
WRENDER[4]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Campaign')||'All Campaigns';
  var d=yrData(MOCK_DATA.series[4],key,wid)||MOCK_DATA.series[4]['All Campaigns']['FY 2026'];
  var totalP=d.items.reduce(function(s,x){return s+x.p;},0)||1;
  var totalR=d.items.reduce(function(s,x){return s+x.r;},0);
  var overallPct=pct(totalR,totalP);
  var items=capN(d.items,sz);
  if(opt==='A'){
    if(sz==='s'){
      var top=d.items[0]||{l:'',p:1,r:0,c:'#4caf50'};
      return ftags(wid)+'<div style="text-align:center;padding:6px 0 4px"><div style="font-size:22px;font-weight:700;color:#4b6ec3">'+overallPct+'%</div><div style="font-size:10px;color:#888">Overall received</div></div>'+progBar(top.l,top.r,top.p,top.c);
    }
    if(view==='pie'){var slices=[{l:'Received',p:overallPct,c:'#4b6ec3'},{l:'Outstanding',p:100-overallPct,c:'#d2d2d2'}];return ftags(wid)+pieChart(slices)+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">'+$m(totalR)+' received of '+$m(totalP)+'</div>',sz);}
    if(view==='table'){var rows=items.map(function(it){var p2=pct(it.r,it.p);return [it.l,$m(it.p),$m(it.r),$m(it.p-it.r),'<span style="color:'+(p2>=80?'#2e7d32':p2>=50?'#b75a00':'#9d2d2d')+';font-weight:600">'+p2+'%</span>'];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'Remaining',r:true},{l:'%',r:true}],rows,tH(sz)):tbl(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'Remaining',r:true},{l:'%',r:true}],rows));}
    var h=''; items.forEach(function(it){h+=progBar(it.l,it.r,it.p,it.c);});
    h+=lOnly('<div style="font-size:11px;color:#484848;border-top:.5px solid #f0f0f0;padding-top:6px;margin-top:4px">Overall: <strong>'+overallPct+'%</strong> ('+$m(totalR)+' of '+$m(totalP)+')</div>',sz);
    return ftags(wid)+h;
  }
  if(opt==='B'){
    if(sz==='s'){
      var maxP0=Math.max.apply(null,d.items.map(function(x){return x.p;}))||1;
      return ftags(wid)+'<div style="font-size:10px;color:#888;margin-bottom:6px">'+overallPct+'% received overall</div>'+'<div class="hbars">'+d.items.slice(0,3).map(function(it){return hbar(it.l.split(' ')[0],$m(it.r),Math.round(it.r/maxP0*100),it.c);}).join('')+'</div>';
    }
    if(view==='table'){var rows2=items.map(function(it){return [it.l,$m(it.p),$m(it.r),'<span style="color:'+it.c+';font-weight:600">'+pct(it.r,it.p)+'%</span>'];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'%',r:true}],rows2,tH(sz)):tbl(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'%',r:true}],rows2));}
    var barH=sz==='m'?100:110;
    var maxP=Math.max.apply(null,d.items.map(function(x){return x.p;}))||1;
    var bars='<div class="bars" style="height:'+barH+'px">'; items.forEach(function(it){bars+='<div class="bw"><div style="display:flex;gap:2px;align-items:flex-end;height:'+(barH-15)+'px"><div style="height:'+Math.round(it.p/maxP*(barH-15))+'px;background:#d2d2d2;border-radius:2px 2px 0 0;width:9px"></div><div style="height:'+Math.round(it.r/maxP*(barH-15))+'px;background:'+it.c+';border-radius:2px 2px 0 0;width:9px"></div></div><div class="bl" style="font-size:7.5px">'+it.l.split(' ')[0]+'</div></div>';});
    var legB=mUp('<div class="aleg" style="margin-top:8px"><div class="ali"><div class="asw" style="background:#d2d2d2"></div>Pledged</div><div class="ali"><div class="asw" style="background:#4b6ec3"></div>Received</div></div>',sz);
    return ftags(wid)+bars+'</div>'+legB;
  }
  if(opt==='C'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+overallPct+'%</div><div style="font-size:10px;color:#888">of pledges received</div><div style="font-size:12px;font-weight:600;margin-top:4px">'+$m(totalR)+'</div><div style="font-size:10px;color:#aaa">of '+$m(totalP)+'</div></div>';}
    if(view==='cards'){var h2='';items.forEach(function(it){var p2=pct(it.r,it.p);h2+=cardRow('volunteer_activism','#eef2fb',it.c,it.l,$m(it.r)+' of '+$m(it.p),$m(it.r),p2+'%',it.c);});return ftags(wid)+h2;}
    var rows3=items.map(function(it){var p2=pct(it.r,it.p);return [it.l,$m(it.p),$m(it.r),$m(it.p-it.r),'<span style="color:'+(p2>=80?'#2e7d32':p2>=50?'#b75a00':'#9d2d2d')+';font-weight:600">'+p2+'%</span>'];});
    if(sz==='l'||sz==='x') rows3.push(['<strong>Total</strong>',$m(totalP),$m(totalR),$m(totalP-totalR),'<strong>'+overallPct+'%</strong>']);
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'Outstanding',r:true},{l:'%',r:true}],rows3,tH(sz)):tbl(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'Outstanding',r:true},{l:'%',r:true}],rows3));
  }
};

// W5 — AR Invoices Outstanding
WRENDER[5]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Age Band')||'All Ages';
  var d=yrData(MOCK_DATA.series[5],key,wid)||MOCK_DATA.series[5]['All Ages']['FY 2026'];
  var total=d.bands.reduce(function(s,b){return s+b.v;},0)||1;
  var maxV=Math.max.apply(null,d.bands.map(function(b){return b.v;}))||1;
  var overdueAmt=d.bands.filter(function(b){return b.l!=='0-30 days';}).reduce(function(s,b){return s+b.v;},0);
  var bands=sz==='s'?d.bands.slice(0,3):d.bands;
  if(opt==='A'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:6px 0 4px"><div style="font-size:20px;font-weight:700;color:#e53935">'+$m(total)+'</div><div style="font-size:10px;color:#888">Total outstanding</div></div>'+'<div class="hbars">'+d.bands.slice(0,3).map(function(b){return hbar(b.l,$m(b.v),Math.round(b.v/maxV*100),b.c);}).join('')+'</div>';}
    if(view==='pie'){var slices=d.bands.map(function(b){return {l:b.l,p:pct(b.v,total),c:b.c};});return ftags(wid)+pieChart(slices)+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total: '+$m(total)+'</div>',sz);}
    if(view==='table'){var rows=bands.map(function(b){return [b.l,String(b.n),$m(b.v),pct(b.v,total)+'%'];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Age Band','Inv.',{l:'Amount',r:true},{l:'Share',r:true}],rows,tH(sz)):tbl(['Age Band','Inv.',{l:'Amount',r:true},{l:'Share',r:true}],rows))+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);}
    return ftags(wid)+'<div class="hbars">'+bands.map(function(b){return hbar(b.l,$m(b.v),Math.round(b.v/maxV*100),b.c);}).join('')+'</div>'+mUp('<div style="font-size:11px;color:#484848;margin-top:10px">Total outstanding: <strong>'+$m(total)+'</strong></div>',sz);
  }
  if(opt==='B'){
    if(sz==='s'){return ftags(wid)+'<div class="hbars">'+d.bands.slice(0,2).map(function(b){return hbar(b.l,$m(b.v),Math.round(b.v/maxV*100),b.c);}).join('')+'</div><div style="font-size:10px;color:#888;margin-top:4px">+2 more bands · Total: '+$m(total)+'</div>';}
    if(view==='bar'){return ftags(wid)+'<div class="hbars">'+bands.map(function(b){return hbar(b.l,$m(b.v),Math.round(b.v/maxV*100),b.c);}).join('')+'</div>'+mUp('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);}
    var strip='<div class="aging">'; d.bands.forEach(function(b){strip+='<div style="width:'+pct(b.v,total)+'%;background:'+b.c+'" title="'+b.l+': '+$m(b.v)+'"></div>';}); strip+='</div>';
    strip+=mUp('<div class="aleg" style="margin-bottom:10px">'+d.bands.map(function(b){return '<div class="ali"><div class="asw" style="background:'+b.c+'"></div>'+b.l+'</div>';}).join('')+'</div>',sz);
    var rows2=bands.map(function(b){return [b.l,String(b.n),$m(b.v),pct(b.v,total)+'%'];});
    return ftags(wid)+strip+(sz==='l'||sz==='x'?tblScroll(['Age Band','Inv.',{l:'Amount',r:true},{l:'Share',r:true}],rows2,tH(sz)):tbl(['Age Band','Inv.',{l:'Amount',r:true},{l:'Share',r:true}],rows2));
  }
  if(opt==='C'){
    var kh=lOnly('<div class="kpis" style="margin-bottom:10px"><div class="kpi"><div class="kl">Total Outstanding</div><div class="kv dn" style="font-size:16px">'+$m(total)+'</div></div><div class="kpi"><div class="kl">Overdue 30+ days</div><div class="kv dn" style="font-size:16px;color:#e53935">'+$m(overdueAmt)+'</div></div></div>',sz);
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:18px;font-weight:700;color:#e53935">'+$m(overdueAmt)+'</div><div style="font-size:10px;color:#888">Overdue 30+ days</div><div style="font-size:11px;color:#484848;margin-top:4px">Total: '+$m(total)+'</div></div>'+'<div class="hbars">'+d.bands.slice(0,3).map(function(b){return hbar(b.l,String(b.n),Math.round(b.v/maxV*100),b.c);}).join('')+'</div>';}
    var rows3=bands.map(function(b){return [b.l,String(b.n),$m(b.v),pct(b.v,total)+'%'];});
    return ftags(wid)+kh+(sz==='l'||sz==='x'?tblScroll(['Age Band','#',{l:'Amount',r:true},{l:'Share',r:true}],rows3,tH(sz)):tbl(['Age Band','#',{l:'Amount',r:true},{l:'Share',r:true}],rows3));
  }
};

// W6 — Insurance Billing Plans
WRENDER[6]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Plan Type')||'All Plans';
  var st=fv(wid,'Status')||'All';
  var d=MOCK_DATA.series[6][key]||MOCK_DATA.series[6]['All Plans'];
  var plans=st==='All'?d.plans:d.plans.filter(function(p){return p.s===st;});
  if(!plans.length) plans=d.plans;
  var totalCost=plans.reduce(function(s,p){return s+p.cost;},0);
  var totalEnrolled=plans.reduce(function(s,p){return s+p.e;},0);
  var maxE=Math.max.apply(null,plans.map(function(p){return p.e;}))||1;
  var plansV=capN(plans,sz);
  if(opt==='A'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+totalEnrolled+'</div><div style="font-size:10px;color:#888">Total enrolled</div></div>'+'<div class="hbars">'+plans.slice(0,3).map(function(p){return hbar(p.n.split(' ')[0],p.e+' enrolled',Math.round(p.e/maxE*100),p.s==='Active'?'#4b6ec3':'#d2d2d2');}).join('')+'</div>';}
    if(view==='bar') return ftags(wid)+'<div class="hbars">'+plansV.map(function(p){return hbar(p.n,p.e+' enrolled',Math.round(p.e/maxE*100),p.s==='Active'?'#4b6ec3':'#d2d2d2');}).join('')+'</div>'+lOnly('<div style="font-size:10px;color:#888;margin-top:8px">Total monthly cost: '+$m(totalCost)+'</div>',sz);
    var rows=plansV.map(function(p){var bc=p.s==='Active'?'#f0faf1':'#fff8e1';var tc=p.s==='Active'?'#2e7d32':'#b75a00';return [p.n,String(p.e),p.p+'%',$m(p.cost),'<span style="background:'+bc+';color:'+tc+';padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600">'+p.s+'</span>'];});
    if(sz==='l'||sz==='x') rows.push(['<strong>Total</strong>','<strong>'+plans.reduce(function(s,p){return s+p.e;},0)+'</strong>','','<strong>'+$m(totalCost)+'</strong>','']);
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Plan','Enrolled','Employer %',{l:'Monthly',r:true},'Status'],rows,tH(sz)):tbl(['Plan','Enrolled','Employer %',{l:'Monthly',r:true},'Status'],rows));
  }
  if(opt==='B'){
    if(sz==='s'){return ftags(wid)+'<div class="hbars">'+plans.slice(0,3).map(function(p){return hbar(p.n.split(' ')[0],p.e+'',Math.round(p.e/maxE*100),p.s==='Active'?'#4b6ec3':'#d2d2d2');}).join('')+'</div>';}
    if(view==='pie'){var total2=totalEnrolled||1;var slices=plans.map(function(p){return {l:p.n,p:pct(p.e,total2),c:p.s==='Active'?'#4b6ec3':'#d2d2d2'};});return ftags(wid)+pieChart(slices,sz==='m'?80:100)+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total enrolled: '+total2+'</div>',sz);}
    return ftags(wid)+'<div class="hbars">'+plansV.map(function(p){return hbar(p.n,p.e+' enrolled',Math.round(p.e/maxE*100),p.s==='Active'?'#4b6ec3':'#d2d2d2');}).join('')+'</div>'+lOnly('<div style="font-size:10px;color:#888;margin-top:8px">Total monthly cost: '+$m(totalCost)+'</div>',sz);
  }
  if(opt==='C'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:18px;font-weight:700;color:#4b6ec3">'+$m(totalCost)+'</div><div style="font-size:10px;color:#888">Monthly cost</div></div>'+'<div class="hbars">'+plans.slice(0,3).map(function(p){var bc=p.s==='Active'?'#4b6ec3':'#d2d2d2';return hbar(p.n.split(' ')[0],$m(p.cost),Math.round(p.cost/totalCost*100),bc);}).join('')+'</div>';}
    if(view==='table'){var rows2=plansV.map(function(p){var bc=p.s==='Active'?'#f0faf1':'#fff8e1';var tc=p.s==='Active'?'#2e7d32':'#b75a00';return [p.n,String(p.e),$m(p.cost),'<span style="background:'+bc+';color:'+tc+';padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600">'+p.s+'</span>'];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Plan','Enrolled',{l:'Monthly',r:true},'Status'],rows2,tH(sz)):tbl(['Plan','Enrolled',{l:'Monthly',r:true},'Status'],rows2));}
    var h=''; plansV.forEach(function(p){var bc=p.s==='Active'?'#eef2fb':'#fff8e1';var tc=p.s==='Active'?'#4b6ec3':'#b75a00';h+=cardRow('health_and_safety',bc,tc,p.n,p.e+' enrolled',$m(p.cost)+'/mo',p.s,tc);}); return ftags(wid)+h;
  }
};

// W7 — Deposit Accounts
WRENDER[7]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Account')||'All Accounts';
  var d=MOCK_DATA.series[7][key]||MOCK_DATA.series[7]['All Accounts'];
  var total=d.accts.reduce(function(s,a){return s+a.b;},0);
  var maxB=Math.max.apply(null,d.accts.map(function(a){return a.b;}))||1;
  var accts=capN(d.accts,sz);
  if(opt==='A'){
    if(sz==='s'){var top=d.accts[0];return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+$m(total)+'</div><div style="font-size:10px;color:#888">Total balance</div></div>'+cardRow(top.ico,'#eef2fb','#4b6ec3',top.n,top.d,$m(top.b),top.s,top.sc);}
    if(view==='table'){var rows=accts.map(function(a){return [a.n,$m(a.b),'<span style="color:'+a.sc+';font-weight:600">'+a.s+'</span>',a.d];});if(sz==='l'||sz==='x')rows.push(['<strong>Total</strong>','<strong>'+$m(total)+'</strong>','','']);return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Account',{l:'Balance',r:true},'Status','Note'],rows,tH(sz)):tbl(['Account',{l:'Balance',r:true},'Status','Note'],rows));}
    var h=''; accts.forEach(function(a){h+=cardRow(a.ico,'#eef2fb','#4b6ec3',a.n,a.d,$m(a.b),a.s,a.sc);});
    if((sz==='l'||sz==='x')&&d.accts.length>1) h+='<div style="display:flex;justify-content:space-between;font-size:11px;padding:6px 2px;border-top:.5px solid #f0f0f0;margin-top:4px"><span style="color:#888">Total</span><strong>'+$m(total)+'</strong></div>';
    return ftags(wid)+h;
  }
  if(opt==='B'){
    if(sz==='s'){return ftags(wid)+'<div class="hbars">'+d.accts.slice(0,3).map(function(a){return hbar(a.n.split(' ')[0],$m(a.b),Math.round(a.b/maxB*100),'#4b6ec3');}).join('')+'</div>';}
    if(view==='vertical'){var items=accts.map(function(a){return {label:a.n.split(' ')[0],pct:Math.round(a.b/maxB*100),color:'#4b6ec3'};});return ftags(wid)+vbars(items,sz==='m'?90:110)+mUp('<div style="font-size:11px;color:#484848;margin-top:8px">Combined balance: <strong>'+$m(total)+'</strong></div>',sz);}
    return ftags(wid)+'<div class="hbars">'+accts.map(function(a){return hbar(a.n.split(' ')[0],$m(a.b),Math.round(a.b/maxB*100),'#4b6ec3');}).join('')+'</div>'+lOnly('<div style="font-size:11px;color:#484848;margin-top:8px">Combined balance: <strong>'+$m(total)+'</strong></div>',sz);
  }
  if(opt==='C'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+$m(total)+'</div><div style="font-size:10px;color:#888">Total across '+d.accts.length+' accounts</div></div>'+'<div class="hbars">'+d.accts.slice(0,3).map(function(a){return hbar(a.n.split(' ')[0],$m(a.b),Math.round(a.b/maxB*100),a.sc);}).join('')+'</div>';}
    if(view==='cards'){var h2='';accts.forEach(function(a){h2+=cardRow(a.ico,'#eef2fb','#4b6ec3',a.n,a.d,$m(a.b),a.s,a.sc);});return ftags(wid)+h2;}
    var rows2=accts.map(function(a){return [a.n,$m(a.b),'<span style="color:'+a.sc+';font-weight:600">'+a.s+'</span>',a.d];});
    if(sz==='l'||sz==='x') rows2.push(['<strong>Total</strong>','<strong>'+$m(total)+'</strong>','','']);
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Account',{l:'Balance',r:true},'Status','Note'],rows2,tH(sz)):tbl(['Account',{l:'Balance',r:true},'Status','Note'],rows2));
  }
};

// W8 — My Status
WRENDER[8]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Item Type')||'All Items';
  var pri=fv(wid,'Priority')||'All';
  var d=MOCK_DATA.series[8][key]||MOCK_DATA.series[8]['All Items'];
  var items=pri==='High Priority'?d.items.filter(function(x){return x.pri==='High';}):d.items;
  if(!items.length) items=d.items;
  var itemsV=capN(items,sz);
  var allItems=MOCK_DATA.series[8]['All Items'].items;
  var types=['Invoices','Timesheets','Purchase Orders','Approvals'];
  if(opt==='A'){
    var typeTots=types.map(function(t){return allItems.filter(function(x){return x.type===t;}).length;});
    var grand=typeTots.reduce(function(a,b){return a+b;},0)||1;
    if(sz==='s'){
      var urgTotal=allItems.filter(function(x){return x.pri==='High';}).length;
      return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:24px;font-weight:700;color:#9d2d2d">'+urgTotal+'</div><div style="font-size:10px;color:#888">High priority items</div><div style="font-size:12px;color:#484848;margin-top:4px">'+grand+' total</div></div>';
    }
    var h='<div class="kpis">'; types.forEach(function(t){var cnt=allItems.filter(function(x){return x.type===t;}).length;var urg=allItems.filter(function(x){return x.type===t&&x.pri==='High';}).length;var bc=urg>0?'#faefef':'#f0faf1';var cc=urg>0?'#9d2d2d':'#2e7d32';h+='<div class="kpi" style="background:'+bc+'"><div class="kl">'+t+'</div><div class="kv" style="color:'+cc+';font-size:18px">'+cnt+'</div>'+(urg?'<div class="kt" style="color:'+cc+'">'+urg+' urgent</div>':'')+'</div>';}); return ftags(wid)+h+'</div>';
  }
  if(opt==='B'){
    if(sz==='s'){
      return ftags(wid)+'<div>'+items.slice(0,3).map(function(x){return '<div style="display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:.5px solid #f6f6f6"><span class="material-symbols-rounded" style="font-size:14px;color:'+x.c+'">'+x.ico+'</span><span style="font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+x.t+'</span><span style="font-size:10px;font-weight:600;color:'+x.c+';flex-shrink:0">'+x.due+'</span></div>';}).join('')+'</div>';
    }
    if(view==='table'){var rows=itemsV.map(function(x){return [x.t,x.type,'<span style="color:'+x.c+';font-weight:600">'+x.pri+'</span>',x.due];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Item','Type','Priority','Due'],rows,tH(sz)):tbl(['Item','Type','Priority','Due'],rows));}
    var h2=''; itemsV.forEach(function(x){h2+='<div style="display:flex;align-items:center;gap:9px;padding:6px 0;border-bottom:.5px solid #f6f6f6"><div class="aico" style="background:'+x.bg+';width:26px;height:26px"><span class="material-symbols-rounded" style="font-size:14px;color:'+x.c+'">'+x.ico+'</span></div><div style="flex:1"><div style="font-size:12px;font-weight:500">'+x.t+'</div><div style="font-size:10px;color:#888">'+x.type+'</div></div><div style="text-align:right"><div style="font-size:11px;font-weight:600;color:'+x.c+'">'+x.due+'</div><div style="font-size:9px;color:#aaa">'+x.pri+'</div></div></div>';}); return ftags(wid)+h2;
  }
  if(opt==='C'){
    if(sz==='s'){
      var byTypeCnt={};types.forEach(function(t){byTypeCnt[t]=allItems.filter(function(x){return x.type===t;}).length;});
      return ftags(wid)+'<div style="display:flex;flex-direction:column;gap:4px">'+types.map(function(t){var cnt=byTypeCnt[t];var urg=allItems.filter(function(x){return x.type===t&&x.pri==='High';}).length;var bc=urg?'#faefef':'#f0faf1';var cc=urg?'#9d2d2d':'#2e7d32';return '<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:'+bc+';border-radius:5px"><span style="font-size:11px;flex:1;font-weight:500">'+t+'</span><span style="font-size:14px;font-weight:700;color:'+cc+'">'+cnt+'</span></div>';}).join('')+'</div>';
    }
    if(view==='list'){var h3='';itemsV.forEach(function(x){h3+='<div style="display:flex;align-items:center;gap:9px;padding:5px 0;border-bottom:.5px solid #f6f6f6"><span class="material-symbols-rounded" style="font-size:14px;color:'+x.c+'">'+x.ico+'</span><span style="font-size:12px;flex:1">'+x.t+'</span><span style="font-size:10px;color:#888">'+x.type+'</span><span style="font-size:10px;color:'+x.c+';font-weight:600">'+x.due+'</span></div>';});return ftags(wid)+h3;}
    var byType={}; itemsV.forEach(function(x){if(!byType[x.type])byType[x.type]=[];byType[x.type].push(x);});
    var h4=''; Object.keys(byType).forEach(function(t){h4+='<div style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.5px;margin-top:8px;margin-bottom:3px">'+t+' <span style="background:#e1e1e1;color:#606060;border-radius:10px;padding:1px 5px;font-size:9px">'+byType[t].length+'</span></div>';byType[t].forEach(function(x){h4+='<div style="display:flex;align-items:center;gap:6px;padding:3px 0"><span class="material-symbols-rounded" style="font-size:13px;color:'+x.c+'">'+x.ico+'</span><span style="font-size:12px;flex:1">'+x.t+'</span><span style="font-size:10px;color:'+x.c+';font-weight:600">'+x.due+'</span></div>';});});
    return ftags(wid)+h4;
  }
};

// W9 — Payroll Scheduled Time Off
WRENDER[9]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Department')||'All Departments';
  var lt=fv(wid,'Leave Type')||'All Types';
  var d=yrData(MOCK_DATA.series[9],key,wid)||MOCK_DATA.series[9]['All Departments']['FY 2026'];
  if(!d||!d.leave) d={leave:[]};
  var leave=lt==='All Types'?d.leave:d.leave.filter(function(l){return l.type===lt;});
  if(!leave.length) leave=d.leave;
  var tC={'Annual':'#4b6ec3','Sick':'#e53935','Personal':'#ff9800'};
  var leaveV=capN(leave,sz);
  if(opt==='A'){
    if(sz==='s'){
      return ftags(wid)+'<div>'+leave.slice(0,3).map(function(l){return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:.5px solid #f6f6f6"><div style="width:4px;border-radius:2px;height:24px;background:'+tC[l.type]+';flex-shrink:0"></div><div style="flex:1"><div style="font-size:11px;font-weight:500">'+l.n+'</div><div style="font-size:9px;color:#888">'+l.type+'</div></div><div style="font-size:10px;font-weight:600;text-align:right">'+l.ms+'</div></div>';}).join('')+'</div>';
    }
    if(view==='list'){
      var h=''; leaveV.forEach(function(l){h+='<div style="display:flex;align-items:center;gap:9px;padding:5px 0;border-bottom:.5px solid #f6f6f6"><div style="width:4px;border-radius:2px;align-self:stretch;background:'+tC[l.type]+';flex-shrink:0"></div><div style="flex:1"><div style="font-size:12px;font-weight:500">'+l.n+'</div><div style="font-size:10px;color:#888">'+l.dept+' &middot; '+l.type+'</div></div><div style="text-align:right;font-size:11px"><div style="font-weight:600">'+l.ms+'&ndash;'+l.me+'</div><div style="color:#888">'+l.days+' day'+(l.days>1?'s':'')+'</div></div></div>';}); return ftags(wid)+h;
    }
    var dayH='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">'; ['M','T','W','T','F','S','S'].forEach(function(dn){dayH+='<div style="text-align:center;font-size:9px;color:#aaa;font-weight:600">'+dn+'</div>';}); dayH+='</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">';
    for(var dd=1;dd<=31;dd++){var hl=leave.some(function(l){return dd>=l.s&&dd<=l.e&&l.s<32;});dayH+='<div style="height:20px;border-radius:3px;background:'+(hl?'#4b6ec3':'transparent')+';display:flex;align-items:center;justify-content:center;font-size:9px;color:'+(hl?'#fff':'#484848')+'">'+dd+'</div>';}
    dayH+='</div>'; var legH='<div class="aleg" style="margin-top:8px">'; Object.keys(tC).forEach(function(t){legH+='<div class="ali"><div class="asw" style="background:'+tC[t]+'"></div>'+t+'</div>';}); return ftags(wid)+dayH+legH+'</div>';
  }
  if(opt==='B'){
    if(sz==='s'){return ftags(wid)+'<div>'+leave.slice(0,3).map(function(l){return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:.5px solid #f6f6f6"><div style="width:4px;border-radius:2px;height:24px;background:'+tC[l.type]+';flex-shrink:0"></div><div style="flex:1"><div style="font-size:11px;font-weight:500">'+l.n+'</div><div style="font-size:9px;color:#888">'+l.dept+'</div></div><div style="font-size:10px;font-weight:600">'+l.days+'d</div></div>';}).join('')+'</div>';}
    if(view==='table'){var rows=leaveV.map(function(l){return [l.n,l.dept,'<span style="color:'+tC[l.type]+';font-weight:600">'+l.type+'</span>',l.ms+'&ndash;'+l.me,String(l.days)];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Name','Dept','Type','Dates','Days'],rows,tH(sz)):tbl(['Name','Dept','Type','Dates','Days'],rows));}
    var h2=''; leaveV.forEach(function(l){h2+='<div style="display:flex;align-items:center;gap:9px;padding:5px 0;border-bottom:.5px solid #f6f6f6"><div style="width:4px;border-radius:2px;align-self:stretch;background:'+tC[l.type]+';flex-shrink:0"></div><div style="flex:1"><div style="font-size:12px;font-weight:500">'+l.n+'</div><div style="font-size:10px;color:#888">'+l.dept+' &middot; '+l.type+'</div></div><div style="text-align:right;font-size:11px"><div style="font-weight:600">'+l.ms+'&ndash;'+l.me+'</div><div style="color:#888">'+l.days+' day'+(l.days>1?'s':'')+'</div></div></div>';}); return ftags(wid)+h2;
  }
  if(opt==='C'){
    if(sz==='s'){
      var deptSummary={};leave.forEach(function(l){if(!deptSummary[l.dept])deptSummary[l.dept]=0;deptSummary[l.dept]+=l.days;});
      return ftags(wid)+'<div style="display:flex;flex-direction:column;gap:4px">'+Object.keys(deptSummary).slice(0,3).map(function(dn){return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:.5px solid #f6f6f6"><span style="font-size:11px;color:#484848">'+dn+'</span><span style="font-size:11px;font-weight:600;color:#4b6ec3">'+deptSummary[dn]+' days</span></div>';}).join('')+'</div>';
    }
    if(view==='table'){var rows2=leaveV.map(function(l){return [l.n,l.dept,'<span style="color:'+tC[l.type]+';font-weight:600">'+l.type+'</span>',l.ms+'&ndash;'+l.me,String(l.days)];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Name','Dept','Type','Dates','Days'],rows2,tH(sz)):tbl(['Name','Dept','Type','Dates','Days'],rows2));}
    var depts=['Finance','Admin','Ministry','Facilities','IT'];
    var deptsV=sz==='m'?depts.slice(0,3):depts;
    var h3='';
    deptsV.forEach(function(dn){var dl=leave.filter(function(l){return l.dept===dn;});if(!dl.length)return;h3+='<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;margin-bottom:4px">'+dn+'</div>';dl.forEach(function(l){h3+='<span style="display:inline-block;margin:1px 2px;padding:2px 7px;border-radius:10px;font-size:10px;background:'+tC[l.type]+'30;color:'+tC[l.type]+';border:.5px solid '+tC[l.type]+'50">'+l.n+' &middot; '+l.ms+'</span>';});h3+='</div>';});
    return ftags(wid)+h3;
  }
};

// W10 — Loans With Balance Due
WRENDER[10]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Loan Type')||'All Types';
  var st=fv(wid,'Status')||'All';
  var d=yrData(MOCK_DATA.series[10],key,wid)||MOCK_DATA.series[10]['All Types']['FY 2026'];
  var loans=st==='In Arrears'?d.loans.filter(function(l){return l.s==='In Arrears';}):d.loans;
  if(!loans.length) loans=d.loans;
  var totalBal=loans.reduce(function(s,l){return s+l.bal;},0);
  var maxB=Math.max.apply(null,loans.map(function(l){return l.orig;}))||1;
  var loansV=capN(loans,sz);
  if(opt==='A'){
    if(sz==='s'){var top=loans[0]||{n:'',bal:0,orig:1,sc:'#4caf50',rate:'',pmt:0};var pp=pct(top.orig-top.bal,top.orig);return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+$m(totalBal)+'</div><div style="font-size:10px;color:#888">Total outstanding</div></div>'+'<div style="padding:4px 0"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span>'+top.n+'</span><span style="color:'+top.sc+'">'+$m(top.bal)+'</span></div><div class="pt" style="height:5px"><div class="pf" style="width:'+pp+'%;background:'+top.sc+'"></div></div></div>';}
    if(view==='table'){var rows=loansV.map(function(l){return [l.n,$m(l.orig),$m(l.bal),l.rate,$m(l.pmt),'<span style="color:'+l.sc+';font-weight:600">'+l.s+'</span>'];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Loan','Original',{l:'Balance',r:true},'Rate',{l:'Payment',r:true},'Status'],rows,tH(sz)):tbl(['Loan','Original',{l:'Balance',r:true},'Rate',{l:'Payment',r:true},'Status'],rows));}
    var h=''; loansV.forEach(function(l){var pp2=pct(l.orig-l.bal,l.orig);h+='<div style="padding:8px 0;border-bottom:.5px solid #f6f6f6"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:12px;font-weight:500">'+l.n+'</span><span style="font-size:12px;font-weight:600;color:'+l.sc+'">'+$m(l.bal)+'</span></div><div class="pt" style="height:6px"><div class="pf" style="width:'+pp2+'%;background:'+l.sc+'"></div></div><div style="display:flex;justify-content:space-between;font-size:10px;color:#888;margin-top:3px"><span>'+pp2+'% repaid &middot; '+l.rate+'</span><span>'+$m(l.pmt)+'/mo</span></div></div>';});
    return ftags(wid)+h+lOnly('<div style="font-size:11px;padding-top:6px">Total balance: <strong>'+$m(totalBal)+'</strong></div>',sz);
  }
  if(opt==='B'){
    if(sz==='s'){return ftags(wid)+'<div class="hbars">'+loans.slice(0,3).map(function(l){return hbar(l.n.split(' ')[0],$m(l.bal),Math.round(l.bal/maxB*100),l.sc);}).join('')+'</div>';}
    if(view==='vertical'){var items=loansV.map(function(l){return {label:l.n.split(' ')[0],pct:Math.round(l.bal/maxB*100),color:l.sc};});return ftags(wid)+vbars(items,sz==='m'?90:110)+mUp('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(totalBal)+'</div>',sz);}
    return ftags(wid)+'<div class="hbars">'+loansV.map(function(l){return hbar(l.n.split(' ')[0],$m(l.bal),Math.round(l.bal/maxB*100),l.sc);}).join('')+'</div>'+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total outstanding: '+$m(totalBal)+'</div>',sz);
  }
  if(opt==='C'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+$m(totalBal)+'</div><div style="font-size:10px;color:#888">'+loans.length+' active loans</div></div>'+'<div class="hbars">'+loans.slice(0,3).map(function(l){return hbar(l.n.split(' ')[0],$m(l.bal),Math.round(l.bal/maxB*100),l.sc);}).join('')+'</div>';}
    if(view==='cards'){var h2='';loansV.forEach(function(l){h2+=cardRow('account_balance_wallet','#eef2fb',l.sc,l.n,l.rate+' &middot; '+$m(l.pmt)+'/mo',$m(l.bal),l.s,l.sc);});return ftags(wid)+h2;}
    var rows2=loansV.map(function(l){return [l.n,$m(l.orig),$m(l.bal),l.rate,$m(l.pmt),'<span style="color:'+l.sc+';font-weight:600">'+l.s+'</span>'];});
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Loan','Original',{l:'Balance',r:true},'Rate',{l:'Monthly',r:true},'Status'],rows2,tH(sz)):tbl(['Loan','Original',{l:'Balance',r:true},'Rate',{l:'Monthly',r:true},'Status'],rows2));
  }
};

// W11 — Fixed Assets
WRENDER[11]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Asset Category')||'All Categories';
  var dep=fv(wid,'Depreciation')||'Straight Line';
  var d=MOCK_DATA.series[11][key]||MOCK_DATA.series[11]['All Categories'];
  var mult=dep==='Declining Balance'?1.3:1;
  var cats=d.cats.map(function(c){return {l:c.l,c:c.c,orig:c.orig,nbv:Math.round(c.orig-(c.depn*mult)),ann:Math.round(c.orig*c.rate*(dep==='Declining Balance'?1.4:1))};});
  var totalNBV=cats.reduce(function(s,c){return s+c.nbv;},0)||1;
  var maxO=Math.max.apply(null,cats.map(function(c){return c.orig;}))||1;
  var catsV=capN(cats,sz);
  if(opt==='A'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+$m(totalNBV)+'</div><div style="font-size:10px;color:#888">Total net book value</div></div>'+'<div class="hbars">'+cats.slice(0,3).map(function(c){return hbar(c.l.split(' ')[0],$m(c.nbv),Math.round(c.nbv/maxO*100),c.c);}).join('')+'</div>';}
    if(view==='pie'){var slices=cats.map(function(c){return {l:c.l,p:pct(c.nbv,totalNBV),c:c.c};});return ftags(wid)+pieChart(slices,sz==='m'?80:100)+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total NBV: '+$m(totalNBV)+'</div>',sz);}
    if(view==='table'){var rows=catsV.map(function(c){return [c.l,$m(c.orig),$m(c.orig-c.nbv),$m(c.nbv)];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Category','Cost','Accum. Depn',{l:'NBV',r:true}],rows,tH(sz)):tbl(['Category','Cost','Accum. Depn',{l:'NBV',r:true}],rows))+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total NBV: '+$m(totalNBV)+'</div>',sz);}
    return ftags(wid)+'<div class="hbars">'+catsV.map(function(c){return hbar(c.l,$m(c.nbv),Math.round(c.nbv/maxO*100),c.c);}).join('')+'</div>'+mUp('<div style="font-size:10px;color:#888;margin-top:6px">Net book value &middot; '+dep+'</div>',sz);
  }
  if(opt==='B'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:18px;font-weight:700;color:#4b6ec3">'+$m(totalNBV)+'</div><div style="font-size:10px;color:#888">Total NBV</div></div>'+'<div class="hbars">'+cats.slice(0,3).map(function(c){return hbar(c.l.split(' ')[0],$m(c.nbv),Math.round(c.nbv/maxO*100),c.c);}).join('')+'</div>';}
    if(view==='cards'){var h='';catsV.forEach(function(c){h+=cardRow('domain','#eef2fb',c.c,c.l,'Ann. depn: '+$m(c.ann),$m(c.nbv),'NBV','#606060');});return ftags(wid)+h;}
    var rows2=catsV.map(function(c){return [c.l,$m(c.orig),$m(c.orig-c.nbv),$m(c.nbv),$m(c.ann)];});
    if(sz==='l'||sz==='x') rows2.push(['<strong>Total</strong>',$m(cats.reduce(function(s,c){return s+c.orig;},0)),$m(cats.reduce(function(s,c){return s+(c.orig-c.nbv);},0)),'<strong>'+$m(totalNBV)+'</strong>','']);
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Category','Cost','Accum. Depn',{l:'NBV',r:true},{l:'Annual',r:true}],rows2,tH(sz)):tbl(['Category','Cost','Accum. Depn',{l:'NBV',r:true},{l:'Annual',r:true}],rows2));
  }
  if(opt==='C'){
    var slices2=cats.map(function(c){return {l:c.l,p:pct(c.nbv,totalNBV),c:c.c};});
    var psz=sz==='s'?80:sz==='m'?80:100;
    var cap=mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total: '+$m(totalNBV)+'</div>',sz);
    if(sz==='s'){return ftags(wid)+'<div style="display:flex;justify-content:center;margin-bottom:6px"><div style="width:80px;height:80px;border-radius:50%;background:conic-gradient('+slices2.map(function(s,i){var pos=slices2.slice(0,i).reduce(function(a,b){return a+b.p;},0);return s.c+' '+pos+'% '+(pos+s.p)+'%';}).join(',')+'"></div></div>';}
    if(view==='donut') return ftags(wid)+donutChart(slices2,psz)+cap;
    if(view==='bar') return ftags(wid)+'<div class="hbars">'+catsV.map(function(c){return hbar(c.l,$m(c.nbv),Math.round(c.nbv/maxO*100),c.c);}).join('')+'</div>'+mUp('<div style="font-size:10px;color:#888;margin-top:6px">Total NBV: '+$m(totalNBV)+'</div>',sz);
    return ftags(wid)+pieChart(slices2,psz)+cap;
  }
};

// W12 — Empty / Scaffold Widget
WRENDER[12]=function(opt){
  if(opt==='A') return '<div style="text-align:center;padding:24px 16px"><div style="width:44px;height:44px;background:#f0f0f0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 10px"><span class="material-symbols-rounded" style="font-size:22px;color:#ccc">block</span></div><div style="font-size:13px;font-weight:600;color:#202020;margin-bottom:4px">Remove this slot</div><div style="font-size:11px;color:#888;line-height:1.5">Empty tiles confuse users.<br>Remove and collapse the layout.</div></div>';
  if(opt==='B') return '<div style="padding:4px 0"><div style="font-size:11px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Finance Health</div><div style="display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#f0faf1;border-radius:6px"><span class="material-symbols-rounded" style="color:#2e7d32;font-size:16px;font-variation-settings:FILL 1">check_circle</span><span style="font-size:12px;font-weight:500;flex:1">Payroll</span><span style="font-size:11px;color:#2e7d32">On schedule</span></div><div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#fff8e1;border-radius:6px"><span class="material-symbols-rounded" style="color:#b75a00;font-size:16px;font-variation-settings:FILL 1">warning</span><span style="font-size:12px;font-weight:500;flex:1">Accounts Payable</span><span style="font-size:11px;color:#b75a00">5 overdue</span></div><div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#faefef;border-radius:6px"><span class="material-symbols-rounded" style="color:#9d2d2d;font-size:16px;font-variation-settings:FILL 1">error</span><span style="font-size:12px;font-weight:500;flex:1">Bank Recon.</span><span style="font-size:11px;color:#9d2d2d">Pending</span></div><div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:#f0faf1;border-radius:6px"><span class="material-symbols-rounded" style="color:#2e7d32;font-size:16px;font-variation-settings:FILL 1">check_circle</span><span style="font-size:12px;font-weight:500;flex:1">Budget vs Actual</span><span style="font-size:11px;color:#2e7d32">+2% ahead</span></div></div></div>';
  return '<div style="text-align:center;padding:24px 16px"><span class="material-symbols-rounded" style="font-size:36px;color:#4b6ec3;display:block;margin-bottom:8px">add_circle</span><div style="font-size:13px;font-weight:600;color:#202020;margin-bottom:4px">Add Widget</div><div style="font-size:11px;color:#888">Let users choose a widget<br>from a library to place here.</div></div>';
};

// W13 — Purchasing Management
WRENDER[13]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'PO Status')||'All';
  var dept=fv(wid,'Department')||'All Departments';
  var d=yrData(MOCK_DATA.series[13],key,wid)||MOCK_DATA.series[13]['All']['FY 2026'];
  var pos=dept==='All Departments'?d.pos:d.pos.filter(function(p){return p.dept===dept;});
  if(!pos.length) pos=d.pos;
  var sC={'Overdue':'#e53935','Pending Approval':'#ff9800','Approved':'#4caf50'};
  var sB={'Overdue':'#faefef','Pending Approval':'#fff8e1','Approved':'#f0faf1'};
  var total=pos.reduce(function(s,p){return s+p.amt;},0);
  var posV=capN(pos,sz);
  if(opt==='A'){
    if(sz==='s'){
      var overdue=pos.filter(function(p){return p.s==='Overdue';}).length;
      var pending=pos.filter(function(p){return p.s==='Pending Approval';}).length;
      return ftags(wid)+'<div style="display:flex;gap:6px;margin-bottom:8px"><div style="flex:1;text-align:center;padding:6px;background:#faefef;border-radius:6px"><div style="font-size:18px;font-weight:700;color:#e53935">'+overdue+'</div><div style="font-size:9px;color:#9d2d2d">Overdue</div></div><div style="flex:1;text-align:center;padding:6px;background:#fff8e1;border-radius:6px"><div style="font-size:18px;font-weight:700;color:#b75a00">'+pending+'</div><div style="font-size:9px;color:#b75a00">Pending</div></div></div>'+'<div style="font-size:10px;color:#888">Total: '+$m(total)+'</div>';
    }
    if(view==='kanban'){
      var statuses=['Pending Approval','Approved','Overdue'];
      var cols=sz==='m'?2:3;
      var h='<div style="display:grid;grid-template-columns:repeat('+cols+',1fr);gap:6px">'; statuses.slice(0,cols).forEach(function(s){var sp=posV.filter(function(p){return p.s===s;});h+='<div style="background:#fafafa;border-radius:6px;padding:7px"><div style="font-size:8px;font-weight:700;text-transform:uppercase;color:'+sC[s]+';margin-bottom:5px">'+s+' ('+sp.length+')</div>'; sp.forEach(function(p){h+='<div style="background:#fff;border:.5px solid #d2d2d2;border-radius:4px;padding:4px 7px;margin-bottom:3px"><div style="font-size:10px;font-weight:500">'+p.ref+'</div><div style="font-size:9px;color:#888">'+$m(p.amt)+'</div></div>';}); h+='</div>';}); return ftags(wid)+h+'</div>';
    }
    var rows=posV.map(function(p){return [p.ref,p.vendor,$m(p.amt),'<span style="background:'+sB[p.s]+';color:'+sC[p.s]+';padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600">'+p.s+'</span>',p.due];});
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['PO','Vendor',{l:'Amount',r:true},'Status','Due'],rows,tH(sz)):tbl(['PO','Vendor',{l:'Amount',r:true},'Status','Due'],rows))+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);
  }
  if(opt==='B'){
    if(sz==='s'){
      var statuses2=['Pending Approval','Approved','Overdue'];
      return ftags(wid)+'<div style="display:flex;gap:4px">'+statuses2.map(function(s){var cnt=pos.filter(function(p){return p.s===s;}).length;return '<div style="flex:1;text-align:center;padding:5px 2px;background:'+sB[s]+';border-radius:5px"><div style="font-size:16px;font-weight:700;color:'+sC[s]+'">'+cnt+'</div><div style="font-size:8px;color:'+sC[s]+'">'+s.split(' ')[0]+'</div></div>';}).join('')+'</div>';
    }
    if(view==='table'){var rows2=posV.map(function(p){return [p.ref,p.vendor,$m(p.amt),'<span style="background:'+sB[p.s]+';color:'+sC[p.s]+';padding:1px 7px;border-radius:10px;font-size:10px;font-weight:600">'+p.s+'</span>',p.due];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['PO','Vendor',{l:'Amount',r:true},'Status','Due'],rows2,tH(sz)):tbl(['PO','Vendor',{l:'Amount',r:true},'Status','Due'],rows2))+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);}
    var statuses3=['Pending Approval','Approved','Overdue'];
    var cols2=sz==='m'?2:3;
    var h2='<div style="display:grid;grid-template-columns:repeat('+cols2+',1fr);gap:6px">'; statuses3.slice(0,cols2).forEach(function(s){var sp=posV.filter(function(p){return p.s===s;});h2+='<div style="background:#fafafa;border-radius:6px;padding:7px"><div style="font-size:8px;font-weight:700;text-transform:uppercase;color:'+sC[s]+';margin-bottom:5px">'+s+'</div>'; sp.forEach(function(p){h2+='<div style="background:#fff;border:.5px solid #d2d2d2;border-radius:4px;padding:4px 7px;margin-bottom:3px"><div style="font-size:10px;font-weight:500">'+p.ref+'</div><div style="font-size:9px;color:#888">'+$m(p.amt)+'</div></div>';}); h2+='</div>';}); return ftags(wid)+h2+'</div>';
  }
  if(opt==='C'){
    if(sz==='s'){var depts2=['Finance','Admin','Ministry','Facilities','IT'];var maxDA=Math.max.apply(null,depts2.map(function(dn){return pos.filter(function(p){return p.dept===dn;}).reduce(function(s,p){return s+p.amt;},0);}));if(!maxDA)maxDA=1;return ftags(wid)+'<div class="hbars">'+depts2.slice(0,3).map(function(dn){var amt=pos.filter(function(p){return p.dept===dn;}).reduce(function(s,p){return s+p.amt;},0);return amt>0?hbar(dn,$m(amt),Math.round(amt/maxDA*100),'#4b6ec3'):'';}).join('')+'</div>';}
    if(view==='pie'){var depts3=['Finance','Admin','Ministry','Facilities','IT'];var dAmt=depts3.map(function(dn){return pos.filter(function(p){return p.dept===dn;}).reduce(function(s,p){return s+p.amt;},0);});var dGrand=dAmt.reduce(function(a,b){return a+b;},0)||1;var slices=depts3.map(function(dn,i){return {l:dn,p:pct(dAmt[i],dGrand),c:['#4b6ec3','#6e8bd4','#a0b5e6','#c4d4f0','#dce7fa'][i]};}).filter(function(s){return s.p>0;});return ftags(wid)+pieChart(slices)+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total: '+$m(total)+'</div>',sz);}
    var depts4=['Finance','Admin','Ministry','Facilities','IT'];
    var deptsV=sz==='m'?depts4.slice(0,3):depts4;
    var maxA=Math.max.apply(null,deptsV.map(function(dn){return pos.filter(function(p){return p.dept===dn;}).reduce(function(s,p){return s+p.amt;},0);}));if(!maxA)maxA=1;
    var h3='<div class="hbars">'; deptsV.forEach(function(dn){var amt=pos.filter(function(p){return p.dept===dn;}).reduce(function(s,p){return s+p.amt;},0);if(amt>0)h3+=hbar(dn,$m(amt),Math.round(amt/maxA*100),'#4b6ec3');}); return ftags(wid)+h3+'</div>'+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);
  }
};

// W14 — Quick Actions
WRENDER[14]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Task Type')||'All Tasks';
  var d=MOCK_DATA.series[14][key]||MOCK_DATA.series[14]['All Tasks'];
  var actions=capN(d.actions,sz);
  if(opt==='A'){
    if(view==='list'){var h='';actions.forEach(function(a){h+='<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:.5px solid #f6f6f6"><div style="width:32px;height:32px;border-radius:8px;background:'+a.c+';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-rounded" style="font-size:18px;color:'+a.tc+';font-variation-settings:FILL 1">'+a.ico+'</span></div><div><div style="font-size:13px;font-weight:500">'+a.l+'</div>'+(sz!=='s'?'<div style="font-size:11px;color:#888">'+a.d+'</div>':'')+'</div><span class="material-symbols-rounded" style="font-size:16px;color:#d2d2d2;margin-left:auto">chevron_right</span></div>';});return ftags(wid)+h;}
    var cols=sz==='s'?2:3;
    var h2='<div style="display:grid;grid-template-columns:repeat('+cols+',1fr);gap:6px">'; actions.forEach(function(a){h2+='<div style="background:'+a.c+';border-radius:8px;padding:10px 8px;text-align:center;cursor:pointer" title="'+a.d+'"><span class="material-symbols-rounded" style="font-size:22px;color:'+a.tc+';display:block;margin-bottom:4px;font-variation-settings:FILL 1">'+a.ico+'</span><div style="font-size:11px;font-weight:600;color:#202020">'+a.l+'</div></div>';}); return ftags(wid)+h2+'</div>';
  }
  if(opt==='B'){
    if(view==='grid'){var cols2=sz==='s'?2:3;var h3='<div style="display:grid;grid-template-columns:repeat('+cols2+',1fr);gap:6px">'; actions.forEach(function(a){h3+='<div style="background:'+a.c+';border-radius:8px;padding:10px 8px;text-align:center;cursor:pointer"><span class="material-symbols-rounded" style="font-size:22px;color:'+a.tc+';display:block;margin-bottom:4px;font-variation-settings:FILL 1">'+a.ico+'</span><div style="font-size:11px;font-weight:600;color:#202020">'+a.l+'</div></div>';}); return ftags(wid)+h3+'</div>';}
    var h4=''; actions.forEach(function(a){h4+='<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:.5px solid #f6f6f6"><div style="width:32px;height:32px;border-radius:8px;background:'+a.c+';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-rounded" style="font-size:18px;color:'+a.tc+';font-variation-settings:FILL 1">'+a.ico+'</span></div><div><div style="font-size:13px;font-weight:500">'+a.l+'</div>'+(sz!=='s'?'<div style="font-size:11px;color:#888">'+a.d+'</div>':'')+'</div><span class="material-symbols-rounded" style="font-size:16px;color:#d2d2d2;margin-left:auto">chevron_right</span></div>';}); return ftags(wid)+h4;
  }
  if(opt==='C'){
    if(view==='list'){var h5=''; actions.forEach(function(a){h5+='<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:.5px solid #f6f6f6"><div style="width:32px;height:32px;border-radius:8px;background:'+a.c+';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-rounded" style="font-size:18px;color:'+a.tc+';font-variation-settings:FILL 1">'+a.ico+'</span></div><div><div style="font-size:13px;font-weight:500">'+a.l+'</div><div style="font-size:11px;color:#888">'+a.d+'</div></div><span class="material-symbols-rounded" style="font-size:16px;color:#d2d2d2;margin-left:auto">chevron_right</span></div>';}); return ftags(wid)+h5;}
    var h6='<div style="display:flex;gap:6px;flex-wrap:wrap">'; actions.forEach(function(a){h6+='<div style="display:flex;align-items:center;gap:5px;padding:5px 10px;background:'+a.c+';border-radius:20px;cursor:pointer" title="'+a.d+'"><span class="material-symbols-rounded" style="font-size:14px;color:'+a.tc+';font-variation-settings:FILL 1">'+a.ico+'</span><span style="font-size:12px;font-weight:500;color:#202020">'+a.l+'</span></div>';}); return ftags(wid)+h6+'</div>';
  }
};

// W15 — Bank Balances
WRENDER[15]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Account')||'All Accounts';
  var d=MOCK_DATA.series[15][key]||MOCK_DATA.series[15]['All Accounts'];
  var total=d.accts.reduce(function(s,a){return s+a.bal;},0);
  var maxB=Math.max.apply(null,d.accts.map(function(a){return a.bal;}))||1;
  var accts=capN(d.accts,sz);
  if(opt==='A'){
    if(sz==='s'){var top=d.accts[0];return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+$m(total)+'</div><div style="font-size:10px;color:#888">Total balance</div></div>'+cardRow(top.ico,'#eef2fb','#4b6ec3',top.n,top.d,$m(top.bal),top.s,top.sc);}
    if(view==='table'){var rows=accts.map(function(a){return [a.n,$m(a.bal),'<span style="color:'+a.sc+';font-weight:600">'+a.s+'</span>',a.d];});if(sz==='l'||sz==='x')rows.push(['<strong>Total</strong>','<strong>'+$m(total)+'</strong>','','']);return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Account',{l:'Balance',r:true},'Status','Note'],rows,tH(sz)):tbl(['Account',{l:'Balance',r:true},'Status','Note'],rows));}
    var h=''; accts.forEach(function(a){h+=cardRow(a.ico,'#eef2fb','#4b6ec3',a.n,a.d,$m(a.bal),a.s,a.sc);});
    if(sz==='l'||sz==='x') h+='<div style="display:flex;justify-content:space-between;font-size:11px;padding:6px 2px;border-top:.5px solid #f0f0f0;margin-top:4px"><span style="color:#888">Combined Balance</span><strong>'+$m(total)+'</strong></div>';
    return ftags(wid)+h;
  }
  if(opt==='B'){
    if(sz==='s'){return ftags(wid)+'<div class="hbars">'+d.accts.slice(0,3).map(function(a){return hbar(a.n.split(' ')[0],$m(a.bal),Math.round(a.bal/maxB*100),a.sc);}).join('')+'</div>';}
    if(view==='vertical'){var items=accts.map(function(a){return {label:a.n.split(' ')[0],pct:Math.round(a.bal/maxB*100),color:a.sc};});return ftags(wid)+vbars(items,sz==='m'?90:110)+mUp('<div style="font-size:11px;color:#484848;margin-top:8px">Total: <strong>'+$m(total)+'</strong></div>',sz);}
    return ftags(wid)+'<div class="hbars">'+accts.map(function(a){return hbar(a.n.split(' ')[0],$m(a.bal),Math.round(a.bal/maxB*100),a.sc);}).join('')+'</div>'+lOnly('<div style="display:flex;justify-content:space-between;font-size:11px;padding:6px 2px;border-top:.5px solid #f0f0f0;margin-top:8px"><span style="color:#888">Total</span><strong>'+$m(total)+'</strong></div>',sz);
  }
  if(opt==='C'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+$m(total)+'</div><div style="font-size:10px;color:#888">Across '+d.accts.length+' accounts</div></div>'+'<div class="hbars">'+d.accts.slice(0,3).map(function(a){return hbar(a.n.split(' ')[0],$m(a.bal),Math.round(a.bal/maxB*100),a.sc);}).join('')+'</div>';}
    if(view==='cards'){var h2='';accts.forEach(function(a){h2+=cardRow(a.ico,'#eef2fb','#4b6ec3',a.n,a.d,$m(a.bal),a.s,a.sc);});return ftags(wid)+h2;}
    var rows2=accts.map(function(a){return [a.n,$m(a.bal),'<span style="color:'+a.sc+';font-weight:600">'+a.s+'</span>',a.d];});
    if(sz==='l'||sz==='x') rows2.push(['<strong>Total</strong>','<strong>'+$m(total)+'</strong>','','']);
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Account',{l:'Balance',r:true},'Status','Note'],rows2,tH(sz)):tbl(['Account',{l:'Balance',r:true},'Status','Note'],rows2));
  }
};

// W16 — Accounts Payable By Due Date
WRENDER[16]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Due Date')||'All';
  var vendor=fv(wid,'Vendor')||'All Vendors';
  var d=MOCK_DATA.series[16][key]||MOCK_DATA.series[16]['All'];
  var ap=vendor==='All Vendors'?d.ap:d.ap.filter(function(x){return x.vendor===vendor;});
  if(!ap.length) ap=d.ap;
  var bC={'0-30':'#4caf50','31-60':'#ff9800','61-90':'#ff7043','90+':'#e53935'};
  var total=ap.reduce(function(s,x){return s+x.amt;},0)||1;
  var apV=capN(ap,sz);
  if(opt==='A'){
    if(sz==='s'){
      var overdueAP=ap.filter(function(x){return x.age>0;}).reduce(function(s,x){return s+x.amt;},0);
      return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#e53935">'+$m(overdueAP)+'</div><div style="font-size:10px;color:#888">Overdue now</div><div style="font-size:11px;color:#484848;margin-top:4px">Total: '+$m(total)+'</div></div>';
    }
    if(view==='cards'){var h='';apV.forEach(function(x){h+=cardRow('receipt','#fff8e1','#b75a00',x.vendor,x.ref+' &middot; Due '+x.due,$m(x.amt),(x.age>0?x.age+'d overdue':'On time'),(x.age>0?'#e53935':'#2e7d32'));});return ftags(wid)+h+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);}
    var rows=apV.map(function(x){return [x.vendor,x.ref,$m(x.amt),'<span style="color:'+x.bc+';font-weight:600">'+x.due+'</span>',(x.age>0?'<span style="color:#e53935">'+x.age+'d overdue</span>':'<span style="color:#2e7d32">On time</span>')];});
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Vendor','Ref',{l:'Amount',r:true},'Due','Status'],rows,tH(sz)):tbl(['Vendor','Ref',{l:'Amount',r:true},'Due','Status'],rows))+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);
  }
  if(opt==='B'){
    var bands=[{l:'0-30 days',b:'0-30'},{l:'31-60 days',b:'31-60'},{l:'61-90 days',b:'61-90'},{l:'90+ days',b:'90+'}];
    var bandsV=sz==='s'?bands.slice(0,2):bands;
    if(sz==='s'){
      var maxBA=Math.max.apply(null,bands.map(function(b){return ap.filter(function(x){return x.band===b.b;}).reduce(function(s,x){return s+x.amt;},0);}));if(!maxBA)maxBA=1;
      return ftags(wid)+'<div class="hbars">'+bandsV.map(function(b){var bAmt=ap.filter(function(x){return x.band===b.b;}).reduce(function(s,x){return s+x.amt;},0);return bAmt>0?hbar(b.l,$m(bAmt),Math.round(bAmt/maxBA*100),bC[b.b]):'';}).join('')+'</div>';
    }
    if(view==='pie'){var slices=bands.map(function(b){var amt=ap.filter(function(x){return x.band===b.b;}).reduce(function(s,x){return s+x.amt;},0);return {l:b.l,p:pct(amt,total),c:bC[b.b]};}).filter(function(s){return s.p>0;});return ftags(wid)+pieChart(slices)+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total: '+$m(total)+'</div>',sz);}
    var maxA=Math.max.apply(null,bands.map(function(b){return ap.filter(function(x){return x.band===b.b;}).reduce(function(s,x){return s+x.amt;},0);}));if(!maxA)maxA=1;
    var h2='<div class="hbars">'; bandsV.forEach(function(b){var bAmt=ap.filter(function(x){return x.band===b.b;}).reduce(function(s,x){return s+x.amt;},0);if(bAmt>0)h2+=hbar(b.l,$m(bAmt),Math.round(bAmt/maxA*100),bC[b.b]);}); return ftags(wid)+h2+'</div>'+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total outstanding: '+$m(total)+'</div>',sz);
  }
  if(opt==='C'){
    var vendors={};ap.forEach(function(x){if(!vendors[x.vendor])vendors[x.vendor]={amt:0,oldest:0};vendors[x.vendor].amt+=x.amt;if(x.age>vendors[x.vendor].oldest)vendors[x.vendor].oldest=x.age;});
    var vKeys=Object.keys(vendors);
    var vKeysV=sz==='s'?vKeys.slice(0,3):sz==='m'?vKeys.slice(0,4):vKeys;
    var maxV=Math.max.apply(null,Object.keys(vendors).map(function(k){return vendors[k].amt;}))||1;
    if(sz==='s'){return ftags(wid)+'<div class="hbars">'+vKeysV.map(function(vn){var v=vendors[vn];var vc=v.oldest>7?'#e53935':v.oldest>0?'#ff9800':'#4caf50';return hbar(vn.split(' ')[0],$m(v.amt),Math.round(v.amt/maxV*100),vc);}).join('')+'</div>';}
    if(view==='pie'){var slices2=vKeys.map(function(vn,i){return {l:vn.split(' ')[0],p:pct(vendors[vn].amt,total),c:['#4b6ec3','#6e8bd4','#a0b5e6','#c4d4f0','#e0e8fa'][i%5]};});return ftags(wid)+pieChart(slices2)+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">Total: '+$m(total)+'</div>',sz);}
    if(view==='table'){var rows2=vKeysV.map(function(vn){var v=vendors[vn];return [vn,$m(v.amt),(v.oldest>0?v.oldest+'d overdue':'On time')];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Vendor',{l:'Amount',r:true},'Status'],rows2,tH(sz)):tbl(['Vendor',{l:'Amount',r:true},'Status'],rows2))+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);}
    var h3='<div class="hbars">'; vKeysV.forEach(function(vn){var v=vendors[vn];var vc=v.oldest>7?'#e53935':v.oldest>0?'#ff9800':'#4caf50';h3+=hbar(vn.split(' ')[0],$m(v.amt),Math.round(v.amt/maxV*100),vc);}); return ftags(wid)+h3+'</div>'+lOnly('<div style="font-size:10px;color:#888;margin-top:6px">Total: '+$m(total)+'</div>',sz);
  }
};

// W17 — Gifts Pledges
WRENDER[17]=function(opt,wid,sz){
  sz=sz||getSz(wid,opt);
  var view=sv(wid,opt);
  var key=fv(wid,'Campaign')||'All Campaigns';
  var dr=fv(wid,'Date Range')||'Current Month';
  var d=yrData(MOCK_DATA.series[17],key,wid)||MOCK_DATA.series[17]['All Campaigns']['FY 2026'];
  var mult=dr==='Year to Date'?1:dr==='Campaign Total'?1.4:0.45;
  var pMult=dr==='Campaign Total'?1.4:1;
  var items=d.items.map(function(x){return {l:x.l,p:Math.round(x.p*pMult),r:Math.round(x.r*mult),c:x.c};});
  var totalP=items.reduce(function(s,x){return s+x.p;},0)||1;
  var totalR=items.reduce(function(s,x){return s+x.r;},0);
  var overallPct=pct(totalR,totalP);
  var itemsV=capN(items,sz);
  if(opt==='A'){
    if(sz==='s'){
      var top=items[0]||{l:'',p:1,r:0,c:'#4caf50'};
      return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:22px;font-weight:700;color:#4b6ec3">'+overallPct+'%</div><div style="font-size:10px;color:#888">Overall received</div></div>'+progBar(top.l,top.r,top.p,top.c);
    }
    if(view==='pie'){var slices=[{l:'Received',p:overallPct,c:'#4b6ec3'},{l:'Outstanding',p:100-overallPct,c:'#d2d2d2'}];return ftags(wid)+pieChart(slices)+mUp('<div style="font-size:10px;color:#888;margin-top:8px;text-align:center">'+$m(totalR)+' of '+$m(totalP)+'</div>',sz);}
    if(view==='table'){var rows=itemsV.map(function(x){var p2=pct(x.r,x.p);return [x.l,$m(x.p),$m(x.r),$m(x.p-x.r),'<span style="color:'+(p2>=80?'#2e7d32':p2>=50?'#b75a00':'#9d2d2d')+';font-weight:600">'+p2+'%</span>'];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'Remaining',r:true},{l:'%',r:true}],rows,tH(sz)):tbl(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'Remaining',r:true},{l:'%',r:true}],rows));}
    var h=''; itemsV.forEach(function(x){h+=progBar(x.l,x.r,x.p,x.c);});
    h+=lOnly('<div style="font-size:11px;color:#484848;border-top:.5px solid #f0f0f0;padding-top:6px;margin-top:4px">Overall: <strong>'+overallPct+'%</strong> ('+$m(totalR)+' of '+$m(totalP)+')</div>',sz);
    return ftags(wid)+h;
  }
  if(opt==='B'){
    if(sz==='s'){
      var maxP0=Math.max.apply(null,items.map(function(x){return x.p;}))||1;
      return ftags(wid)+'<div style="font-size:10px;color:#888;margin-bottom:4px">'+overallPct+'% received overall</div>'+'<div class="hbars">'+items.slice(0,3).map(function(x){return hbar(x.l.split(' ')[0],$m(x.r),Math.round(x.r/maxP0*100),x.c);}).join('')+'</div>';
    }
    if(view==='table'){var rows2=itemsV.map(function(x){var p2=pct(x.r,x.p);return [x.l,$m(x.p),$m(x.r),'<span style="color:'+x.c+';font-weight:600">'+p2+'%</span>'];});return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'%',r:true}],rows2,tH(sz)):tbl(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'%',r:true}],rows2));}
    var barH=sz==='m'?100:110;
    var maxPv=Math.max.apply(null,items.map(function(x){return x.p;}))||1;
    var bars='<div class="bars" style="height:'+barH+'px">'; itemsV.forEach(function(x){bars+='<div class="bw"><div style="display:flex;gap:2px;align-items:flex-end;height:'+(barH-15)+'px"><div style="height:'+Math.round(x.p/maxPv*(barH-15))+'px;background:#d2d2d2;border-radius:2px 2px 0 0;width:9px"></div><div style="height:'+Math.round(x.r/maxPv*(barH-15))+'px;background:'+x.c+';border-radius:2px 2px 0 0;width:9px"></div></div><div class="bl" style="font-size:7.5px">'+x.l.split(' ')[0]+'</div></div>';});
    var legB=mUp('<div class="aleg" style="margin-top:8px"><div class="ali"><div class="asw" style="background:#d2d2d2"></div>Pledged</div><div class="ali"><div class="asw" style="background:#4b6ec3"></div>Received</div></div>',sz);
    return ftags(wid)+bars+'</div>'+legB;
  }
  if(opt==='C'){
    if(sz==='s'){return ftags(wid)+'<div style="text-align:center;padding:4px 0"><div style="font-size:20px;font-weight:700;color:#4b6ec3">'+overallPct+'%</div><div style="font-size:10px;color:#888">of pledges received</div><div style="font-size:12px;font-weight:600;margin-top:4px">'+$m(totalR)+'</div><div style="font-size:10px;color:#aaa">of '+$m(totalP)+' pledged</div></div>';}
    if(view==='cards'){var h2='';itemsV.forEach(function(x){var p2=pct(x.r,x.p);h2+=cardRow('redeem','#eef2fb',x.c,x.l,$m(x.r)+' of '+$m(x.p),$m(x.r),p2+'%',x.c);});return ftags(wid)+h2;}
    var rows3=itemsV.map(function(x){var p2=pct(x.r,x.p);return [x.l,$m(x.p),$m(x.r),$m(x.p-x.r),'<span style="color:'+(p2>=80?'#2e7d32':p2>=50?'#b75a00':'#9d2d2d')+';font-weight:600">'+p2+'%</span>'];});
    if(sz==='l'||sz==='x') rows3.push(['<strong>Total</strong>',$m(totalP),$m(totalR),$m(totalP-totalR),'<strong>'+overallPct+'%</strong>']);
    return ftags(wid)+(sz==='l'||sz==='x'?tblScroll(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'Outstanding',r:true},{l:'%',r:true}],rows3,tH(sz)):tbl(['Campaign',{l:'Pledged',r:true},{l:'Received',r:true},{l:'Outstanding',r:true},{l:'%',r:true}],rows3));
  }
};

// ── INTERACTION ───────────────────────────────────────────────────────────────
var _openMenu=null;
function toggleMenu(e,ddId){
  e.stopPropagation();
  var dd=document.getElementById(ddId);if(!dd)return;
  if(_openMenu&&_openMenu!==dd){
    _openMenu.classList.remove('open');
    var prevC=_openMenu.closest&&_openMenu.closest('.opt');
    if(prevC) prevC.style.zIndex='';
  }
  dd.classList.toggle('open');
  var card=dd.closest&&dd.closest('.opt');
  if(dd.classList.contains('open')){
    _openMenu=dd;
    if(card) card.style.zIndex='200';
  } else {
    _openMenu=null;
    if(card) card.style.zIndex='';
  }
}
function closeMenu(){
  if(_openMenu){
    _openMenu.classList.remove('open');
    var card=_openMenu.closest&&_openMenu.closest('.opt');
    if(card) card.style.zIndex='';
    _openMenu=null;
  }
}
document.addEventListener('click',closeMenu);

// setView: switch chart type within same card, re-render at current size
function setView(wid,opt,subview,e){
  e.stopPropagation();closeMenu();
  gs(wid).view[opt]=subview;
  var el=document.getElementById('viz-'+wid+'-'+opt);
  var sz=getSz(wid,opt);
  if(el&&WRENDER[wid]){
    try{el.innerHTML=WRENDER[wid](opt,wid,sz);}
    catch(err){el.innerHTML='<div style="color:#e53935;font-size:11px;padding:8px">'+err.message+'</div>';}
  }
  showToast('View switched');
}

// rerender: re-render all options for a widget at their current sizes
function rerender(wid){
  var meta=MOCK_DATA.options[wid]||[];
  meta.forEach(function(o){
    var el=document.getElementById('viz-'+wid+'-'+o.num);
    var imp=document.getElementById('imp-'+wid+'-'+o.num);
    var ins=document.getElementById('ins-'+wid+'-'+o.num);
    var sz=getSz(wid,o.num);
    if(el&&WRENDER[wid]){
      try{el.innerHTML=WRENDER[wid](o.num,wid,sz);}
      catch(e){el.innerHTML='<div style="color:#e53935;font-size:11px;padding:8px">Render error: '+e.message+'</div>';}
    }
    if(imp) imp.innerHTML=o.imp||'';
    if(ins) ins.innerHTML='<span class="material-symbols-rounded" style="font-size:13px;color:#aaa;flex-shrink:0">link</span>'+(o.iu?'<a href="'+o.iu+'" target="_blank" style="color:#345499">'+(o.il||o.iu)+'</a>':'');
  });
}

// ── EXPAND MODAL ─────────────────────────────────────────────────────────────
var _expWid=null, _expOpt=null;

function openExpand(wid,opt){
  closeMenu();
  _expWid=wid; _expOpt=opt;
  var opts=MOCK_DATA.options[wid]||[];
  var o=opts.find(function(x){return x.num===opt;})||opts[0]||{};
  var meta=MOCK_DATA.meta.find(function(x){return x.id===wid;})||{};
  _renderExpand(wid,opt,o,meta);
  document.getElementById('exp-modal').classList.add('open');
}
function _renderExpand(wid,opt,o,meta){
  var state=gs(wid);
  var fdefs=MOCK_DATA.filters[wid]||[];
  var fhtml='';
  if(fdefs.length){
    fhtml='<div class="exp-flt-bar">';
    fdefs.forEach(function(f){
      fhtml+='<div class="exp-flt-group"><label>'+f.label+'</label><select data-filter="'+f.label+'" onchange="applyExpFlt('+wid+',\''+opt+'\')">';
      f.opts.forEach(function(ov){var sel=(state.filters[f.label]===ov)?' selected':'';fhtml+='<option'+sel+'>'+ov+'</option>';});
      fhtml+='</select></div>';
    });
    fhtml+='</div>';
  }
  var viz='';
  if(WRENDER[wid]){try{viz=WRENDER[wid](opt,wid,'x');}catch(e){viz='<div style="color:#e53935">Error: '+e.message+'</div>';}}
  document.getElementById('exp-badge').textContent=opt;
  document.getElementById('exp-title').textContent=(meta.name||'')+' — Option '+opt;
  document.getElementById('exp-sub').textContent=(o.title||'')+' · '+(o.sub||'');
  document.getElementById('exp-flt-wrap').innerHTML=fhtml;
  document.getElementById('exp-viz').innerHTML=viz;
  document.getElementById('exp-imp').innerHTML=o.imp||'';
  document.getElementById('exp-ins').innerHTML='<span class="material-symbols-rounded" style="font-size:13px;flex-shrink:0">link</span>'+(o.iu?'<a href="'+o.iu+'" target="_blank" style="color:#345499">'+(o.il||o.iu)+'</a>':'');
  var nEl=document.getElementById('exp-note');
  nEl.innerHTML=meta.note||''; nEl.style.display=(meta.note&&meta.note.trim())?'block':'none';
}

function applyExpFlt(wid,opt){
  var state=gs(wid);
  document.querySelectorAll('#exp-flt-wrap select').forEach(function(sel){
    state.filters[sel.getAttribute('data-filter')]=sel.value;
  });
  var viz='';
  if(WRENDER[wid]){try{viz=WRENDER[wid](opt,wid,'x');}catch(e){viz='<div style="color:#e53935">Error: '+e.message+'</div>';}}
  document.getElementById('exp-viz').innerHTML=viz;
  rerender(wid);
}

function closeExpand(){
  document.getElementById('exp-modal').classList.remove('open');
  _expWid=null; _expOpt=null;
}
document.getElementById('exp-modal').addEventListener('click',function(e){if(e.target===this)closeExpand();});

// ── FILTER MODAL ─────────────────────────────────────────────────────────────
var _filterWid=null;
function openFilter(wid,e){
  e.stopPropagation();closeMenu();_filterWid=wid;
  var state=gs(wid);
  var fdefs=MOCK_DATA.filters[wid]||[];
  if(!fdefs.length){showToast('No filters for this widget');return;}
  var body='';
  fdefs.forEach(function(f){
    body+='<div style="margin-bottom:14px"><label style="display:block;font-size:11px;font-weight:600;color:#484848;margin-bottom:5px">'+f.label+'</label>';
    body+='<select data-filter="'+f.label+'" style="width:100%;padding:7px 10px;border:.5px solid #d2d2d2;border-radius:6px;font-family:inherit;font-size:13px;background:#fff">';
    f.opts.forEach(function(o){var sel=(state.filters[f.label]===o)?' selected':'';body+='<option'+sel+'>'+o+'</option>';});
    body+='</select></div>';
  });
  document.getElementById('flt-body').innerHTML=body;
  document.getElementById('flt-modal').classList.add('open');
}
function closeFilter(){document.getElementById('flt-modal').classList.remove('open');}
function applyFilter(){
  if(_filterWid===null){closeFilter();return;}
  var state=gs(_filterWid);
  document.querySelectorAll('#flt-body select').forEach(function(sel){state.filters[sel.getAttribute('data-filter')]=sel.value;});
  closeFilter();rerender(_filterWid);showToast('Filters applied');
}
document.getElementById('flt-modal').addEventListener('click',function(e){if(e.target===this)closeFilter();});

// setSize: change card size AND re-render at new density
function setSize(wid,num,sz,e){
  e.stopPropagation();closeMenu();
  var c=document.getElementById('opt-'+wid+'-'+num);
  if(c){c.classList.remove('sz-s','sz-m','sz-l');c.classList.add(sz);}
  var el=document.getElementById('viz-'+wid+'-'+num);
  var newSz=sz.replace('sz-','');
  if(el&&WRENDER[wid]){
    try{el.innerHTML=WRENDER[wid](num,wid,newSz);}
    catch(e2){el.innerHTML='<div style="color:#e53935;font-size:11px;padding:8px">'+e2.message+'</div>';}
  }
  showToast('Size changed');
}
function dlData(wid,fmt,e){e.stopPropagation();closeMenu();var meta=MOCK_DATA.meta.find(function(x){return x.id===wid;})||{name:'Widget'};showToast('Downloading '+meta.name+' as '+fmt.toUpperCase()+'...');}
function filterMod(mod,el){document.querySelectorAll('.snav-item').forEach(function(i){i.classList.remove('active');});el.classList.add('active');document.querySelectorAll('.widget-section').forEach(function(s){s.style.display=(mod==='all'||s.getAttribute('data-mod')===mod)?'':'none';});}
var _tt=null;
function showToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');if(_tt)clearTimeout(_tt);_tt=setTimeout(function(){t.classList.remove('show');},2200);}

// ── PURPOSE / EYE — shows widget.purpose from meta (not option.imp) ────────────
function togglePurpose(wid,opt,btn,e){
  e.stopPropagation(); closeMenu();
  var existing=document.getElementById('purp-'+wid+'-'+opt);
  if(existing){existing.remove();btn.classList.remove('wc-eye-on');return;}
  // Close any other open purpose popovers
  document.querySelectorAll('.purp-pop').forEach(function(t){t.remove();});
  document.querySelectorAll('.wc-eye-on').forEach(function(b){b.classList.remove('wc-eye-on');});
  // Get widget purpose from meta (not from option.imp)
  var metaW=MOCK_DATA.meta.find(function(m){return m.id===wid;});
  if(!metaW) return;
  var purposeText=metaW.purpose||'No purpose defined.';
  btn.classList.add('wc-eye-on');
  var pop=document.createElement('div');
  pop.className='purp-pop';
  pop.id='purp-'+wid+'-'+opt;
  pop.innerHTML='<div class="purp-hdr"><span class="material-symbols-rounded" style="font-size:13px;color:#4b6ec3;flex-shrink:0">visibility</span>Widget Purpose</div>'
    +'<div class="purp-body">'+purposeText+'</div>';
  // Fixed positioning — never clipped by card overflow
  var rect=btn.getBoundingClientRect();
  pop.style.cssText='position:fixed;top:'+(rect.bottom+6)+'px;left:'+Math.max(8,Math.min(rect.left,window.innerWidth-280))+'px;z-index:9999;width:260px;';
  document.body.appendChild(pop);
  setTimeout(function(){
    function h(e2){if(!pop.contains(e2.target)&&e2.target!==btn){pop.remove();btn.classList.remove('wc-eye-on');document.removeEventListener('click',h);}}
    document.addEventListener('click',h);
  },50);
}

// Inject eye buttons into each card chrome after DOM is ready
function _injectEyes(){
  MOCK_DATA.meta.forEach(function(w){
    var opts=MOCK_DATA.options[w.id]||[];
    opts.forEach(function(o){
      var card=document.getElementById('opt-'+w.id+'-'+o.num);
      if(!card) return;
      var right=card.querySelector('.opt-chrome-right');
      if(!right||right.querySelector('.wc-eye')) return;
      var expandBtn=right.querySelector('[onclick*="openExpand"]');
      if(!expandBtn) return;
      var btn=document.createElement('button');
      btn.className='wc-btn wc-eye';
      btn.title='Widget Purpose';
      (function(wid,opt){
        btn.onclick=function(e){togglePurpose(wid,opt,btn,e);};
      })(w.id,o.num);
      btn.innerHTML='<span class="material-symbols-rounded">visibility</span>';
      right.insertBefore(btn,expandBtn);
    });
  });
}

MOCK_DATA.meta.forEach(function(w){rerender(w.id);});
_injectEyes();
