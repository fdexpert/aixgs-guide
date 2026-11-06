/* AIXGS 互動學習指南 v1.4 — 純前端、離線可用 */
(function(){
'use strict';
var C=window.COURSE; if(!C){return;}
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function cite(s,cx){return '<span class="cite"'+(cx?' data-cx="'+esc(cx)+'"':'')+'>'+esc(s)+'</span>'}
function nw(s){return esc(s).replace(/講義沒寫/g,'<span class="nw">尚未公布</span>')}
function ext(t,u,ctx){return '<a class="ext" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer"'+(ctx?' data-ctx="'+esc(ctx)+'"':'')+'>'+esc(t)+'</a>'}
var store={get:function(k,d){try{var v=localStorage.getItem('aixgs.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
           set:function(k,v){try{localStorage.setItem('aixgs.'+k,JSON.stringify(v))}catch(e){}}};
function today(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function pd(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function days(a,b){return Math.round((b-a)/86400000)}
function md(s){var d=pd(s);return (d.getMonth()+1)+'/'+('0'+d.getDate()).slice(-2)}
var DOW='日一二三四五六';
var GCOL={Government:'var(--g-gov)',Governance:'#3d4f7a',Geopolitics:'var(--g-geo)',Generations:'var(--g-gen)',Generation:'var(--g-gen)',Gender:'var(--g-gender)',Green:'var(--g-green)'};
var T0=today();

/* ---------- hero stats ---------- */
(function(){
  var dues=C.timeline.filter(function(e){return e.k==='due'&&pd(e.d)>=T0});
  var nx=dues[0];
  var html='<div class="stat"><b>4</b><span>次週六全天課程</span></div><div class="stat"><b>'+C.people.speakers.length+'</b><span>位分享業師（立體個案）</span></div>';
  if(nx){var n=days(T0,pd(nx.d));html+='<div class="stat next"><span>下一個截止</span><b>'+esc(md(nx.d))+'（週'+DOW[pd(nx.d).getDay()]+'）'+esc(nx.t)+'</b><span>'+(n===0?'就是今天':'還有 '+n+' 天')+'（依裝置日期）</span></div>';}
  else html+='<div class="stat next"><span>下一個截止</span><b>講義中已無未來截止日</b></div>';
  $('#heroStats').innerHTML=html;
})();

/* ---------- progress bar ---------- */
(function(){
  var s=pd('2026-09-10'),e=pd('2026-12-12'),span=e-s;
  var pct=Math.max(0,Math.min(1,(T0-s)/span));
  var marks=[['2026-09-10','說明會',0],['2026-10-03','模組一',1],['2026-10-17','模組二',0],['2026-11-10','期中',1],['2026-12-05','模組三',0],['2026-12-12','模組四',1]];
  var h='<div class="bar" style="width:'+(pct*100).toFixed(1)+'%"></div>';
  marks.forEach(function(m,i){var p=(pd(m[0])-s)/span*100;h+='<div class="tick'+(m[2]?' up':'')+(i===0?' first':'')+(i===marks.length-1?' last':'')+'" style="left:calc('+p.toFixed(2)+'% - 1px)"><span>'+esc(md(m[0]))+' <em>'+esc(m[1])+'</em></span></div>'});
  h+='<div class="today" style="left:'+(pct*100).toFixed(1)+'%" title="今天"></div>';
  var el=$('#progress');el.innerHTML=h;
  el.setAttribute('aria-label','課程進度：今天 '+(T0.getMonth()+1)+'/'+T0.getDate()+'，約完成 '+Math.round(pct*100)+'%');
})();

/* ---------- overview cards ---------- */
(function(){
  var cards=[
    ['🧭','框架','AI-X-Gs（看見外部變局）＋ S.O.F.T.（轉譯為組織與資源配置）＋ C.L.E.A.R.（形成判斷）','教學大綱 v1.1｜教學目標','#framework'],
    ['🗓️','節奏','09/10 說明會 → 10/03、10/17 → EIP（10/18～12/04）→ 12/05、12/12','課程航線 Tab 1｜課程時間、EIP','#timeline'],
    ['📝','評分','課堂參與 15%、互評 15%、期中 30%、期末 30%、業師加值 10%','教學大綱 v1.1｜評分標準','#assignments'],
    ['🎯','現在','EIP 期間：11/10（二）前 Email 期末報告提案書（期中報告）','課程航線 Tab 1｜⭐️2026/11/10 期中報告','#assignments']
  ];
  /* v1.4：卡片不再整張是連結，讓裡面的出處小標可以單獨點開；標題仍可跳到對應段落 */
  $('#ovCards').innerHTML=cards.map(function(c){return '<div class="card kpi"><span class="ico" aria-hidden="true">'+c[0]+'</span><span><a class="kpi-a" href="'+c[4]+'"><b>'+esc(c[1])+'</b> <span aria-hidden="true">→</span></a><br><span style="font-size:.92rem">'+esc(c[2])+'</span><br>'+cite(c[3])+'</span></div>'}).join('');
})();

/* ---------- pyramid ---------- */
var F=C.framework;
function pyramid(){
  var W=560,H=440,top=[280,14],bl=[4,428],br=[556,428];
  function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
  var y1=0.32,y2=0.58; // band split
  var L1=lerp(top,bl,y1),R1=lerp(top,br,y1),L2=lerp(top,bl,y2),R2=lerp(top,br,y2);
  function pts(a){return a.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1)}).join(' ')}
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="group" aria-label="AI-X-Gs 金字塔，可點選各層">';
  s+='<polygon class="seg" tabindex="0" role="button" data-id="AI" aria-label="AI 層" fill="#9b1c2e" points="'+pts([top,R1,L1])+'"/>';
  s+='<text x="280" y="'+(L1[1]-30)+'" text-anchor="middle" font-size="34">AI</text>';
  s+='<polygon class="seg" tabindex="0" role="button" data-id="X" aria-label="X 層" fill="#1b2f5e" points="'+pts([L1,R1,R2,L2])+'"/>';
  s+='<text x="280" y="'+((L1[1]+L2[1])/2+4)+'" text-anchor="middle" font-size="34">X</text>';
  var cols=['var(--g-gov)','var(--g-geo)','var(--g-gen)','var(--g-gender)','var(--g-green)'];
  F.gs.forEach(function(g,i){
    var a=lerp(L2,R2,i/5),b=lerp(L2,R2,(i+1)/5),c=lerp(bl,br,(i+1)/5),d=lerp(bl,br,i/5);
    s+='<polygon class="seg" tabindex="0" role="button" data-id="'+g.id+'" aria-label="'+g.id+' '+g.zh+'" style="fill:'+cols[i]+'" points="'+pts([a,b,c,d])+'"/>';
    var cy=lerp(a,d,.6)[1]+4, cx=(lerp(a,d,.66)[0]+lerp(b,c,.66)[0])/2;
    var SPL={Government:['Govern-','ment'],Geopolitics:['Geo-','politics'],Generations:['Gener-','ations']}[g.id]||[g.id,''];var nm=SPL[0],nm2=SPL[1];
    s+='<text x="'+cx.toFixed(1)+'" y="'+(cy-(nm2?18:8)).toFixed(1)+'" text-anchor="middle" font-size="13">'+nm+'</text>';
    if(nm2)s+='<text x="'+cx.toFixed(1)+'" y="'+(cy-2).toFixed(1)+'" text-anchor="middle" font-size="13">'+nm2+'</text>';
    s+='<text x="'+cx.toFixed(1)+'" y="'+(cy+(nm2?18:12)).toFixed(1)+'" text-anchor="middle" font-size="14">'+g.zh+'</text>';
  });
  s+='<text x="280" y="'+(L2[1]-8)+'" text-anchor="middle" font-size="13" style="fill:#fff">底層 5Gs</text>';
  s+='</svg>';
  $('#pyramid').innerHTML=s;
  $$('#pyramid .seg').forEach(function(p){
    p.addEventListener('click',function(){showLayer(p.getAttribute('data-id'))});
    p.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();showLayer(p.getAttribute('data-id'))}});
  });
}
function casesForG(id){
  var alias={Generations:['Generation','Generations'],Government:['Government','Governance']};
  var names=alias[id]||[id];
  return C.potential.items.filter(function(it){return it.g.some(function(x){return names.indexOf(x[0])>=0})}).map(function(it){
    var hit=it.g.filter(function(x){return names.indexOf(x[0])>=0}).map(function(x){return x[0]+'（'+x[1]+'）'}).join('、');
    return '<li>'+esc(it.t)+'：'+esc(hit)+'</li>'}).join('');
}
function showLayer(id){
  $$('#pyramid .seg').forEach(function(p){p.classList.toggle('on',p.getAttribute('data-id')===id);p.setAttribute('aria-pressed',p.getAttribute('data-id')===id)});
  var h='';
  if(id==='AI'||id==='X'){
    var L=F.layers.filter(function(l){return l.id===id})[0];
    h+='<span class="tag" style="background:'+(id==='AI'?'#9b1c2e':'#1b2f5e')+'">'+esc(L.name)+'｜'+esc(L.zh)+'</span>';
    h+='<h3>'+esc(L.def)+'</h3>'+cite(L.src);
    if(L.qa)h+='<p>'+esc(L.qa)+' '+cite(L.qaSrc)+' '+ext(L.qaLink[0],L.qaLink[1])+'</p>';
    if(L.note)h+='<p>'+esc(L.note)+' '+cite(L.noteSrc)+'</p>';
    h+='<h4>在課程中的提問方式</h4><p>'+esc(F.aixgsPrompt)+' '+cite('課程航線 Tab 1｜EIP「2. 框架」')+'</p>';
    if(id==='AI')h+='<h4>模組一的提問</h4><ul class="clean"><li>這個技術趨勢改變了哪些產業權力關係？</li><li>哪些政府政策、金融資本與國際競爭會被牽動？</li><li>有哪些我們原本沒看見的風險或機會？</li></ul>'+cite('教學大綱 v1.1｜模組一學習目標');
    if(id==='X')h+='<h4>連到模組二的任務</h4><p>請帶著 1～3 個跟 AI-X-5G 有關的需求來到課程（想學的、想了解的、想找人一起做的事…）。</p>'+cite('課程航線 Tab 1｜❶ 下次課程準備事項');
  }else{
    var G=F.gs.filter(function(g){return g.id===id})[0];
    h+='<span class="tag" style="background:'+GCOL[id]+'">5Gs｜'+esc(G.id)+'</span><h3>'+esc(G.id)+'：'+esc(G.zh)+'</h3>';
    h+='<p>'+esc(F.gsDef)+' '+cite(G.src)+'</p>';
    if(G.theater)h+='<h4>五劇場中的這一幕</h4><p>'+esc(G.theater)+' '+cite(F.theaterSrc)+' '+ext(F.theaterLink[0],F.theaterLink[1])+'</p>';
    if(id==='Government')h+='<p style="font-size:.9rem">'+nw(F.gsNote)+'</p>';
    var li=casesForG(id);
    h+='<h4>潛在案例中用到這個面向的</h4>'+(li?'<ul class="clean">'+li+'</ul>':'<p>講義的潛在案例沒有用到這個面向。</p>')+cite(C.potential.src);
  }
  $('#fwDetail').innerHTML=h;
}
pyramid();
(function(){
  $('#fwDetail').innerHTML='<h3>AI-X-Gs 是什麼？</h3><p>'+esc(F.aixgsRole)+'</p>'+cite('教學大綱 v1.1｜教學目標')+
  '<p class="mt">大綱把它稱為「AI＋X＋Gs」金字塔思維模式，用來解構真實世界的複雜問題。'+cite('教學大綱 v1.1｜教學目標二-1')+'</p>'+
  '<h4>延伸閱讀與影片</h4><ul class="clean"><li>'+ext(F.aixgsReading[0],F.aixgsReading[1])+'</li><li>'+ext(F.video[0],F.video[1])+'</li></ul>'+
  '<p style="color:var(--muted)">← 點金字塔任一層開始探索（也可用 Tab 鍵選取後按 Enter）。</p>';
})();

/* ---------- concept flow ---------- */
(function(){
  var n=[
    ['① 看見','AI-X-Gs',F.aixgsRole,'教學大綱 v1.1｜教學目標',F.aixgsPrompt],
    ['② 轉譯','S.O.F.T.',F.soft.def,F.soft.src,F.soft.prompt],
    ['③ 判斷','C.L.E.A.R.',F.clear.def,F.clear.src,F.clear.prompt],
    ['④ 行動與修正','鄰近可能／決策的風洞','用可驗證的小步嘗試讓真實世界回饋，擴大投入前先讓異議、實驗與現場訊號進來。','課程航線 Tab 1｜2026/10/04、2026/10/24','行動之後，哪些假設要改？']
  ];
  $('#flow').innerHTML=n.map(function(x,i){return '<div class="node"><div class="step">'+esc(x[0])+(i===3?' <span class="ta">助教補充</span>':'')+'</div><h4>'+esc(x[1])+'</h4><p style="margin:0 0 6px;font-size:.92rem">'+esc(x[2])+'</p><p style="margin:0 0 6px;font-size:.88rem;color:var(--ink2)"><b>自問：</b>'+esc(x[4])+'</p>'+cite(x[3])+'</div>'}).join('');
  var W=C.eipWeek3;
  if(W&&document.getElementById('flowT')){
    $('#flowT').innerHTML=W.linkage.map(function(x){return '<div class="node"><div class="step"><span aria-hidden="true">'+x[0]+'</span> '+esc(x[2])+'</div><h4 lang="en">'+esc(x[1])+'</h4><p style="margin:0;font-size:.92rem">'+esc(x[3])+'</p></div>'}).join('');
    $('#flowTNote').innerHTML=esc(W.linkNote)+' '+cite(W.src);
  }
  var s=F.soft,c=F.clear;
  var sl=s.letters.map(function(x){return '<li><span class="lt" aria-hidden="true">'+esc(x.k)+'</span><span><b lang="en">'+esc(x.en)+'</b>　'+esc(x.zh)+'</span></li>'}).join('');
  var cl=c.letters.map(function(x){return '<li><span class="lt" aria-hidden="true">'+esc(x.k)+'</span><span><b lang="en">'+esc(x.en)+'</b>　'+esc(x.zh)+'<br><span class="lx">「'+esc(x.x)+'」</span><br><span class="lth">理論：'+esc(x.th)+'</span></span></li>'}).join('');
  $('#letters').innerHTML='<div class="card" id="softCard"><h4 style="margin-top:0">S.O.F.T.　策略・組織・財務・技術</h4><ul class="letters">'+sl+'</ul>'+cite(s.lettersSrc)+
    '<p>'+esc(s.replaces)+'</p><p style="font-size:.92rem">'+esc(s.combos)+' '+cite(s.combosSrc)+'</p><p>📖 原文：'+ext(s.reading[0],s.reading[1])+'</p></div>'+
    '<div class="card" id="clearCard"><h4 style="margin-top:0">C.L.E.A.R.　決策羅盤</h4><ul class="letters">'+cl+'</ul>'+cite(c.lettersSrc)+
    '<p style="font-size:.92rem">'+esc(c.org)+'</p><p style="font-size:.88rem">課程航線 EIP 段的說明：'+esc(c.L)+' '+cite(c.Lsrc)+'</p><p>📖 原文：'+ext(c.reading[0],c.reading[1])+'</p></div>';
  $('#moreFw').innerHTML=C.moreFw.map(function(f){return '<div class="card"><h4 style="margin-top:0">'+esc(f.t)+'</h4><ul class="clean">'+f.items.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'+(f.note?'<p style="font-size:.9rem">'+esc(f.note)+'</p>':'')+cite(f.src)+'<p style="margin:6px 0 0">📖 '+ext(f.link[0],f.link[1])+'</p></div>'}).join('');
})();

/* ---------- effectuation ---------- */
(function(){
  var E=C.effectuation;
  var h='<thead><tr><th scope="col">決策觀點</th><th scope="col" class="e">Effectuation 效果推理</th><th scope="col" class="c">Causation 因果推理</th></tr></thead><tbody>';
  E.rows.forEach(function(r){h+='<tr><th scope="row" style="background:#fff;font-weight:600">'+esc(r[0])+'</th><td class="e">'+esc(r[1])+'</td><td class="c">'+esc(r[2])+'</td></tr>'});
  $('#effTable').innerHTML=h+'</tbody>';
  $('#effText').innerHTML='<p style="font-size:.85rem">'+cite(E.src)+'</p><p><b>效果邏輯</b>：'+esc(E.eff)+'</p><p><b>因果邏輯</b>：'+esc(E.cau)+'</p><p>'+esc(E.both)+' '+cite(E.textSrc)+'</p>';
  $$('#framework [data-mode]').forEach(function(b){b.addEventListener('click',function(){
    $$('#framework [data-mode]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    var t=$('#effTable');t.classList.remove('mode-e','mode-c');if(b.dataset.mode!=='both')t.classList.add('mode-'+b.dataset.mode);
  })});
  var used=store.get('mottos',[]);
  $('#mottos').innerHTML=C.mottos.items.map(function(m,i){return '<button aria-pressed="'+(used.indexOf(i)>=0)+'" data-i="'+i+'">'+esc(m)+'</button>'}).join('');
  $$('#mottos button').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.i,k=used.indexOf(i);if(k>=0)used.splice(k,1);else used.push(i);b.setAttribute('aria-pressed',k<0);store.set('mottos',used)})});
  $('#mottoSrc').innerHTML=cite(C.mottos.src)+' '+ext('播放清單',C.mottos.playlist);
})();

/* ---------- modules ---------- */
(function(){
  var M=C.modules;
  $('#modTabs').innerHTML=M.map(function(m,i){return '<button role="tab" id="mt'+i+'" aria-controls="modPanel" aria-selected="'+(i===0)+'" data-i="'+i+'">'+esc(m.n)+'｜'+esc(md(m.date))+'</button>'}).join('');
  function show(i){
    var m=M[i];$$('#modTabs button').forEach(function(b){b.setAttribute('aria-selected',+b.dataset.i===i)});
    $('#modPanel').setAttribute('aria-labelledby','mt'+i);
    var d=pd(m.date);
    var h='<div class="mod-head"><div class="date-badge"><small>'+esc(m.n)+'</small><b>'+esc(md(m.date))+(m.end?'–'+esc(md(m.end)):'')+'</b><small>'+(m.dow?'週'+esc(m.dow):'')+'</small></div><div style="flex:1;min-width:220px"><h3>'+esc(m.title)+'</h3>'+(m.sub?'<p style="margin:0;color:var(--muted)">'+esc(m.sub)+'</p>':'')+'<p style="margin:6px 0 0">🕜 '+esc(m.time)+'<br>🚩 <span class="'+(m.room.indexOf('⚠️')>=0?'warn':'')+'">'+esc(m.room)+'</span></p></div></div>';
    h+='<div class="grid g2 mt"><div><h4>學習目標／提問</h4><ul class="clean">'+m.goals.map(function(g){return '<li>'+esc(g)+'</li>'}).join('')+'</ul>';
    if(m.cases.length)h+='<h4>案例思問</h4><ul class="clean">'+m.cases.map(function(g){return '<li>'+esc(g)+'</li>'}).join('')+'</ul>'+(m.casesNote?'<p style="font-size:.88rem;color:var(--muted)">'+esc(m.casesNote)+'</p>':'');
    if(m.interact)h+='<h4>互動實踐</h4><p style="margin:0">'+esc(m.interact)+'</p>';
    if(m.extra)h+='<p>'+esc(m.extra)+'</p>';
    h+='</div><div>';
    if(m.speakers.length)h+='<h4>立體個案（分享業師）</h4>'+m.speakers.map(function(s){return '<div class="speaker"><span class="av" aria-hidden="true">'+esc(s[1].charAt(0))+'</span><div><b>'+esc(s[0])+'</b><br><span style="font-size:.92rem">'+esc(s[1])+'</span></div></div>'}).join('');
    if(m.materials.length)h+='<h4>教材連結</h4><ul class="clean">'+m.materials.map(function(x){return '<li>'+ext(x[0],x[1])+'</li>'}).join('')+'</ul>';
    if(m.pending)h+='<p><span class="nw">尚未公布</span> '+esc(m.pending)+'</p>';
    h+='</div></div><p>'+cite(m.src)+'</p>';
    $('#modPanel').innerHTML=h;
  }
  $$('#modTabs button').forEach(function(b){b.addEventListener('click',function(){show(+b.dataset.i)});
    b.addEventListener('keydown',function(e){var i=+b.dataset.i;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var j=(i+(e.key==='ArrowRight'?1:-1)+M.length)%M.length;show(j);$('#mt'+j).focus()}})});
  // default: next upcoming module
  var idx=0;M.forEach(function(m,i){if(pd(m.end||m.date)<T0)idx=Math.min(i+1,M.length-1)});
  show(idx);
})();

/* ---------- timeline ---------- */
(function(){
  var items=C.timeline.slice();
  function render(k){
    var h='',placed=false;
    items.forEach(function(e){
      var d=pd(e.d),end=e.end?pd(e.end):d;
      if(!placed&&d>T0){h+='<li class="today-marker"><div class="it"><b>▼ 今天 '+(T0.getMonth()+1)+'/'+T0.getDate()+'（依裝置日期）</b></div></li>';placed=true}
      if(k!=='all'&&e.k!==k)return;
      var past=end<T0, n=days(T0,d), cd='';
      if(e.end&&d<=T0&&end>=T0)cd='<span class="cd mid">進行中，至 '+md(e.end)+'</span>';
      else if(!past){cd='<span class="cd '+(n<=10?'soon':'mid')+'">'+(n===0?'今天':'D-'+n)+'</span>'}
      else cd='<span class="cd">已過</span>';
      h+='<li class="k-'+e.k+(past?' past':'')+'"><div class="it"><div class="d">'+md(e.d)+(e.end?'–'+md(e.end):'')+'（'+DOW[d.getDay()]+'）</div><div><b>'+esc(e.t)+'</b><br><span style="font-size:.92rem">'+esc(e.x)+'</span><br>'+cite(e.src)+'</div>'+cd+'</div></li>';
    });
    $('#tl').innerHTML=h;
  }
  render('all');
  $$('#tlFilter .chip').forEach(function(b){b.addEventListener('click',function(){$$('#tlFilter .chip').forEach(function(x){x.setAttribute('aria-pressed',x===b)});render(b.dataset.k)})});
})();

/* ---------- assignments ---------- */
(function(){
  var ST={past:['st-past','已過'],next:['st-next','進行中'],future:['st-future','未來'],ongoing:['st-ongoing','持續']};
  $('#asgList').innerHTML=C.assignments.map(function(a){
    var s=ST[a.status];
    var h='<article class="card asg"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><h3 style="margin:0">'+esc(a.t)+'</h3><span class="status '+s[0]+'">'+s[1]+'</span></div><div class="due">⏰ '+esc(a.due)+'</div><ul class="clean">'+a.body.map(function(b){return '<li>'+nw(b)+'</li>'}).join('')+'</ul>';
    if(a.links)h+='<ul class="clean">'+a.links.map(function(l){return '<li>'+ext(l[0],l[1])+'</li>'}).join('')+'</ul>';
    if(a.fig)h+='<figure class="fig"><button class="zoom" data-full="assets/img/'+a.fig+'" aria-label="放大圖片：'+esc(a.t)+'"><img src="assets/img/'+a.fig+'" alt="'+esc(a.t)+'相關投影片或說明圖" loading="lazy"></button><figcaption><span class="srcnote">圖表來源：林益全老師課程航線</span></figcaption></figure>';
    return h+'<div>'+cite(a.src)+'</div></article>';
  }).join('');
  // donut
  var G=C.grading,cols=['#2a4687','#1d5f86','#9b1c2e','#6b3fa0','#2f7a3b'],r=80,cx=110,cy=110,circ=2*Math.PI*r,off=0;
  var s='<svg viewBox="0 0 220 220" role="img" aria-label="評分比重圓餅圖：'+G.items.map(function(x){return x[0]+' '+x[1]+'%'}).join('、')+'">';
  G.items.forEach(function(it,i){var len=circ*it[1]/100;s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+cols[i]+'" stroke-width="34" stroke-dasharray="'+len.toFixed(2)+' '+(circ-len).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 110 110)"/>';off+=len});
  s+='<text x="110" y="106" text-anchor="middle" font-size="22" font-weight="700" fill="#16213a">100%</text><text x="110" y="128" text-anchor="middle" font-size="12" fill="#5a6478">總分</text></svg>';
  $('#donut').innerHTML=s+'<ul class="lg">'+G.items.map(function(it,i){return '<li><i style="background:'+cols[i]+'"></i>'+esc(it[0])+' <b>'+it[1]+'%</b></li>'}).join('')+'</ul>';
  $('#gradeNote').innerHTML=cite(G.src)+'<br><b>業師加值</b>：'+esc(G.mentorRule)+' '+cite(G.mentorRuleSrc)+'<br>'+nw(G.note);
  var r2='<h4 style="margin-top:0">修課規定</h4><ul class="clean">'+G.rules.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'+cite(G.rulesSrc)+'<h4>注意事項</h4><ul class="clean">'+C.notes.map(function(n){return '<li><b>'+esc(n[0])+'</b>：'+esc(n[1])+' '+cite(n[2])+'</li>'}).join('')+'</ul>';
  $('#rules').innerHTML=r2;
})();

/* ---------- readings ---------- */
(function(){
  $('#preread').innerHTML=C.prereading.items.map(function(x){return '<li>'+ext(x[0],x[1])+(x[2]?'<p class="psum">'+esc(x[2])+' '+cite(x[3])+'</p>':'')+'</li>'}).join('');
  $('#prereadSrc').innerHTML=cite(C.prereading.src);
  $('#books').innerHTML=C.books.items.map(function(b){return '<li>'+esc(b)+'</li>'}).join('');
  $('#practiceList').innerHTML=C.interactPractice.items.map(esc).join('、')+' '+cite(C.interactPractice.src);
  var tags=[];C.articles.forEach(function(a){a.tags.forEach(function(t){if(tags.indexOf(t)<0)tags.push(t)})});
  var cur='all';
  $('#artTags').innerHTML='<button class="chip" data-t="all" aria-pressed="true">全部</button>'+tags.map(function(t){return '<button class="chip" data-t="'+esc(t)+'" aria-pressed="false">'+esc(t)+'</button>'}).join('');
  function render(){
    var q=$('#artQ').value.trim().toLowerCase();
    var list=C.articles.filter(function(a){return (cur==='all'||a.tags.indexOf(cur)>=0)&&(!q||(a.t+a.k+a.d).toLowerCase().indexOf(q)>=0)});
    $('#arts').innerHTML=list.map(function(a){return '<article class="art"><div class="d">2026/'+esc(a.d)+' '+a.tags.map(function(t){return '<span class="tg">'+esc(t)+'</span>'}).join('')+'</div>'+(a.u?ext(a.t,a.u,a.tags.join('、')+'｜'+a.k):'<b>'+esc(a.t)+'</b> <span class="nw">內文在講義中（無外部連結）</span>')+'<p>'+esc(a.k)+'</p>'+cite('課程航線 Tab 1｜2026/'+a.d)+'</article>'}).join('')||'<p>沒有符合的文章。</p>';
    $('#artCount').textContent='共 '+list.length+' 篇';
  }
  $('#artQ').addEventListener('input',render);
  $$('#artTags .chip').forEach(function(b){b.addEventListener('click',function(){cur=b.dataset.t;$$('#artTags .chip').forEach(function(x){x.setAttribute('aria-pressed',x===b)});render()})});
  render();
})();

/* ---------- cases ---------- */
(function(){
  $('#caseQs').innerHTML=C.caseQs.map(function(c){return '<li><b>'+esc(c.t)+'</b><br><span style="font-size:.88rem">'+esc(c.m)+'</span> '+cite(c.src)+'</li>'}).join('');
  $('#fbPoints').innerHTML=C.feedback.points.map(function(p){return '<li>'+esc(p)+'</li>'}).join('');
  $('#fbGroups').innerHTML=C.feedback.groups.map(function(g){return '<li>'+ext(g[0],g[1])+'</li>'}).join('');
  $('#fbSrc').innerHTML=cite(C.feedback.src);
  var gs=['Government','Governance','Geopolitics','Generation','Gender','Green'],cur='all';
  $('#pcFilter').innerHTML='<button class="chip" data-g="all" aria-pressed="true">全部</button>'+gs.map(function(g){return '<button class="chip" data-g="'+g+'" aria-pressed="false">'+g+'</button>'}).join('');
  function render(){
    $('#pcList').innerHTML=C.potential.items.filter(function(it){return cur==='all'||it.g.some(function(x){return x[0]===cur})}).map(function(it){
      return '<div class="pc"><h4>'+esc(it.t)+'</h4><p style="margin:0 0 6px;font-size:.92rem"><b>議題：</b>'+esc(it.issue)+'</p><div>'+it.g.map(function(x){return '<span class="gb" style="background:'+GCOL[x[0]]+'">'+esc(x[0])+'｜'+esc(x[1])+'</span>'}).join('')+'</div></div>'}).join('');
  }
  $$('#pcFilter .chip').forEach(function(b){b.addEventListener('click',function(){cur=b.dataset.g;$$('#pcFilter .chip').forEach(function(x){x.setAttribute('aria-pressed',x===b)});render()})});
  render();
  $('#pcSrc').innerHTML=cite(C.potential.src);
})();

/* ---------- mentors ---------- */
(function(){
  var P=C.people,I=P.instructor;
  $('#people').innerHTML=
   '<div class="card"><h3>授課教師</h3><p style="margin:0"><b>'+esc(I.name)+'</b><br>'+I.titles.map(esc).join('<br>')+'<br>✉️ <a href="mailto:'+esc(I.email)+'">'+esc(I.email)+'</a></p><p style="font-size:.85rem;color:var(--muted)">'+esc(I.posterTitles)+'</p>'+cite(I.src)+'<p>'+ext(I.bio[0],I.bio[1])+'</p></div>'+
   '<div class="card"><h3>助教</h3><p><b>'+esc(P.ta.name)+'</b><br>收「生命的樂章」信封；撰寫〈我眼中的分享業師〉〈我眼中的 12 位隨堂業師〉等課前文章。</p>'+cite(P.ta.src+'；課程航線 Tab 1｜❷ 模組二')+'</div>'+
   '<div class="card"><h3>學生領袖小組 SLC</h3><p>'+esc(P.slc.x)+'</p><p style="font-size:.92rem">'+esc(P.slc.member)+'</p>'+cite(P.slc.src)+'</div>';
  $('#spkTable').innerHTML='<thead><tr><th scope="col">模組</th><th scope="col">業師</th><th scope="col">立體個案主題</th></tr></thead><tbody>'+P.speakers.map(function(s){return '<tr><td>'+esc(s.m)+'</td><td><b>'+esc(s.name)+'</b><br><span style="font-size:.88rem">'+esc(s.org)+'</span></td><td>'+esc(s.topic)+'</td></tr>'}).join('')+'</tbody>';
  $('#spkSrc').innerHTML=cite(P.speakersSrc);
  $('#roles').innerHTML=P.roles.map(function(r){return '<p><b>'+esc(r[0])+'</b>：'+esc(r[1])+'</p>'}).join('')+cite(P.rolesSrc);
  $('#mFacts').innerHTML=P.mentorFacts.map(function(f){return '<li>'+nw(f[0])+' '+cite(f[1])+'</li>'}).join('');
  $('#duties').innerHTML='<ul class="clean">'+P.duties.map(function(d){return '<li>'+esc(d)+'</li>'}).join('')+'</ul>'+cite(P.dutiesSrc);
  $('#mentorList').innerHTML='<thead><tr><th scope="col">隨堂業師</th><th scope="col">背景（模組一簡報）</th><th scope="col">業師頁</th></tr></thead><tbody>'+P.mentors.map(function(m){return '<tr'+''+'><td><b lang="en">'+esc(m[0])+'</b>'+''+'</td><td style="font-size:.9rem">'+esc(m[1])+'</td><td>'+ext('度化智能業師頁',m[2],m[0])+'</td></tr>'}).join('')+'</tbody>';
  $('#mentorSrc').innerHTML=cite(P.mentorsSrc);
  // checklist
  var items=[
    ['研究題目是 AI-X-Gs 跨域議題或產業兩難議題','課程航線 Tab 1｜⭐️期中報告'],
    ['寫清楚問題意識與研究動機（Why this topic matters?）','課程航線 Tab 1｜⭐️期中報告'],
    ['列出預計探討的面向','課程航線 Tab 1｜⭐️期中報告'],
    ['規劃怎麼用 AI-X-Gs、S.O.F.T.、C.L.E.A.R. 論述','課程航線 Tab 1｜⭐️期中報告'],
    ['找到實際的公司、組織、政府機關或國家聯盟作為案例','課程航線 Tab 1｜⭐️期中報告「潛在案例」'],
    ['形式：A4 一頁提案書或三頁簡報檔','課程航線 Tab 1｜⭐️期中報告'],
    ['11/10（二）前 Email 給老師','課程航線 Tab 1｜⭐️期中報告'],
    ['已提出反面論證：什麼情況下結論不再成立？','課程航線 Tab 1｜📊報告反饋建議'],
    ['說得出研究價值：希望釐清什麼、為什麼樣的決策提供參考（Why this topic?）','課程航線 Tab 1｜EIP 11/1～11/7']
  ];
  var st=store.get('midcheck',{});
  $('#midCheck').innerHTML=items.map(function(it,i){return '<div class="check"><input type="checkbox" id="mc'+i+'" '+(st[i]?'checked':'')+'><label for="mc'+i+'" style="font-weight:400">'+esc(it[0])+'<br>'+cite(it[1])+'</label></div>'}).join('');
  $$('#midCheck input').forEach(function(cb,i){cb.addEventListener('change',function(){st[i]=cb.checked;store.set('midcheck',st)})});
  $('#eipStarts').innerHTML=C.eipStarts.items.map(function(x){return '<li><b>'+esc(x[0])+'</b>：'+esc(x[1])+'</li>'}).join('');
  $('#eipSrc').innerHTML=cite(C.eipStarts.src);
  if(C.eipWeek3&&document.getElementById('eip3')){
    var W3=C.eipWeek3;
    $('#eip3').innerHTML='<p style="margin:0 0 6px;font-size:.92rem">'+esc(W3.office)+'</p><ol style="padding-left:1.2em;margin:0 0 6px">'+W3.checks.map(function(x){return '<li><b>'+esc(x[0])+'</b>：'+esc(x[1])+'</li>'}).join('')+'</ol><p style="margin:0 0 6px;font-size:.92rem">🔺 '+esc(W3.push)+'</p>'+cite(W3.src);
  }
  var qs=['你們的結論背後，最依賴的是哪一個假設？它什麼時候會失效？（對應老師提醒：挑戰自己的假設）','這個選項的資源限制、機會成本與時間壓力是什麼？（對應：策略不能只追求面面俱到）','這個問題比較適合從手上的資源出發（效果邏輯），還是從目標反推（因果邏輯）？','如果把問題重新定義，會不會出現新的機會？（對應：從分析問題走向創造機會）','用「我講個例子」「你怎麼看呢」等口訣，讓每位組員都說出自己的判斷。'];
  $('#mentorQs').innerHTML=qs.map(function(q){return '<li>'+esc(q)+'</li>'}).join('');
  $('#mentorQs').insertAdjacentHTML('afterend','<p style="font-size:.88rem"><span class="ta">助教補充</span> 以上問題是把老師的回饋與 EIP 說明改寫成提問。'+cite('課程航線 Tab 1｜📊各小組的案例思問報告反饋建議、EIP')+'</p>');
})();
function download(name,text){var b=new Blob([text],{type:'text/plain;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}

/* ---------- simulation ---------- */
(function(){
  var shocks=[
    ['若關稅休戰破局，美中從「被管理的競爭」回到直接對撞','延伸自 2026/09/27〈從關稅休戰到AI護欄〉'],
    ['若客戶端改由 AI 代理替買方比價與採購','延伸自 2026/10/12〈AI-First for Sales 2.0〉提到的 Gartner 預測'],
    ['若 AI 治理從「軟性原則」轉為「硬法規執行」','延伸自 2026/09/26〈越過「幻滅之谷」的企業生存操典〉'],
    ['若算力擴張撞上電網與能源的物理上限','延伸自 2026/10/11、2026/10/31 兩篇日更'],
    ['若 AI 接手初階工作，新人失去「職涯第一階」','延伸自 2026/10/14〈人才再生〉'],
    ['若世界對美元與制度承諾的信任出現裂痕','延伸自 2026/10/16〈信任如紙，撕裂只需一日〉'],
    ['若 AI 代理出錯，卻找不到誰該負責','延伸自 2026/10/01、2026/10/29 兩篇日更']
  ];
  var opts=C.caseQs.map(function(c){return {t:c.t,g:[]}}).concat(C.potential.items.map(function(p){return {t:p.t+'（潛在案例）',g:p.g.map(function(x){return x[0]}),issue:p.issue}}));
  var S=store.get('sim',null)||{step:0,c:0,who:'',dilemma:'',gs:{},x:'',soft:{S:1,O:1,F:1,T:1},softNote:'',q:[null,null,null],shock:-1,counter:'',decision:''};
  var steps=['選案例','決策者與困境','AI-X-Gs 掃描','S.O.F.T. 耦合','邏輯選擇','壓力測試','決策工作單'];
  var GS=['Government','Governance','Geopolitics','Generation','Gender','Green'];
  function save(){store.set('sim',S)}
  function view(){
    var h='<h3>決策風洞模擬器 <span class="ta">助教補充</span></h3><p style="margin-top:0;color:var(--muted)">把一個案例走一遍：辨識問題 → AI-X-Gs → S.O.F.T. → 邏輯選擇 → 壓力測試 → 決策。步驟取自「案例思問報告」的提問與 EIP 框架提問，最後產出一張可以下載的工作單。</p>';
    h+='<div class="steps" aria-label="步驟">'+steps.map(function(s,i){return '<span class="'+(i===S.step?'on':(i<S.step?'done':''))+'">'+(i+1)+'. '+s+'</span>'}).join('')+'</div><div id="simBody">';
    var c=opts[S.c];
    if(S.step===0){h+='<label for="simCase">要模擬哪個案例？</label><select id="simCase">'+opts.map(function(o,i){return '<option value="'+i+'"'+(i===S.c?' selected':'')+'>'+esc(o.t)+'</option>'}).join('')+'</select><p style="font-size:.88rem;color:var(--muted)">案例清單來自案例思問與潛在案例 '+cite('課程航線 Tab 1；教學大綱 v1.1')+'。本模擬器不提供案例事實，請以實際案例資料為準。</p>'}
    if(S.step===1){h+=(c.issue?'<p><b>講義列出的議題：</b>'+esc(c.issue)+'</p>':'')+'<label for="simWho">案例中的關鍵主角（決策者）是誰？</label><input type="text" id="simWho" value="'+esc(S.who)+'"><label for="simDil" style="display:block;margin-top:10px">他面臨的核心問題或決策困境是什麼？</label><textarea id="simDil">'+esc(S.dilemma)+'</textarea><p>'+cite('課程航線 Tab 1｜2026/10/16 報告內容「問題辨識」')+'</p>'}
    if(S.step===2){h+='<p style="margin-top:0">勾選這個決策牽動的 G，並寫一句理由。'+(c.g.length?'已預先勾選講義「潛在案例」標示的面向。':'')+'</p>'+GS.map(function(g){var on=S.gs[g]!=null;return '<div class="check"><input type="checkbox" id="g_'+g+'" data-g="'+g+'" '+(on?'checked':'')+'><div style="flex:1"><label for="g_'+g+'"><span class="gb" style="background:'+GCOL[g]+'">'+g+'</span></label><input type="text" aria-label="'+g+' 理由" data-gn="'+g+'" value="'+esc(S.gs[g]||'')+'" placeholder="為什麼相關？"></div></div>'}).join('')+'<label for="simX" style="display:block;margin-top:10px">X：這個問題交會了哪些領域？</label><input type="text" id="simX" value="'+esc(S.x)+'" placeholder="例如：國防＋經濟、醫療＋教育…"><p>'+cite('教學大綱 v1.1｜課程資訊；課程航線 Tab 1｜EIP「議題背後不同的跨域切面，以及 5Gs 之間的相互影響？」')+'</p>'}
    if(S.step===3){var lab={S:'策略',O:'組織',F:'財務',T:'技術'};h+='<p style="margin-top:0">外部變局對每個面向的衝擊有多大？（0＝幾乎沒有，3＝很大）</p>'+['S','O','F','T'].map(function(k){return '<div class="slider"><label for="sf'+k+'">'+k+'｜'+lab[k]+'</label><input type="range" min="0" max="3" step="1" id="sf'+k+'" data-k="'+k+'" value="'+S.soft[k]+'"><output id="so'+k+'">'+S.soft[k]+'</output></div>'}).join('')+'<label for="simSoft">哪兩個面向彼此牽動最強？為什麼？</label><textarea id="simSoft">'+esc(S.softNote)+'</textarea><p>'+cite(F.soft.src)+'</p>'}
    if(S.step===4){var qs=['決策目標已經清楚、可以預先設定嗎？','未來的變化大致可以預測嗎？','需要的資源與夥伴主要靠事前分析取得，而不是從手上已有的開始？'];h+=qs.map(function(q,i){return '<fieldset style="border:1px solid var(--line);border-radius:10px;margin:0 0 10px;padding:10px 12px"><legend style="font-weight:600">'+esc(q)+'</legend><label style="font-weight:400;margin-right:16px"><input type="radio" name="lq'+i+'" value="1" '+(S.q[i]===1?'checked':'')+'> 是</label><label style="font-weight:400"><input type="radio" name="lq'+i+'" value="0" '+(S.q[i]===0?'checked':'')+'> 否</label></fieldset>'}).join('')+'<div id="logicOut"></div>'}
    if(S.step===5){h+=S.shock<0?'<p>抽一張壓力情境卡，檢查你的判斷在不同條件下是否仍成立。</p><button class="btn" id="drawShock">抽壓力卡</button>':'<div class="shock"><small>壓力情境（假設性情境，非講義事實）</small><h3 style="color:#fff;margin:6px 0">'+esc(shocks[S.shock][0])+'</h3><small>'+esc(shocks[S.shock][1])+'</small></div><button class="btn sec mt" id="drawShock">換一張</button>';
      h+='<label for="simCounter" style="display:block;margin-top:14px">反面論證：在這個情境下，你原本的結論還成立嗎？什麼情況下會不成立？</label><textarea id="simCounter">'+esc(S.counter)+'</textarea><p>'+cite('課程航線 Tab 1｜📊報告反饋建議「提出反面論證」')+'</p>'}
    if(S.step===6){h+='<label for="simDec">最後的判斷與下一步行動（含何時要回頭修正）</label><textarea id="simDec">'+esc(S.decision)+'</textarea><pre class="out" id="simOut" aria-live="polite"></pre><div class="btns"><button class="btn" id="simCopy">複製工作單</button><button class="btn sec" id="simDl">下載 .txt</button></div>'}
    h+='</div><div class="btns"><button class="btn sec" id="simPrev" '+(S.step===0?'disabled':'')+'>上一步</button><button class="btn" id="simNext" '+(S.step===6?'disabled':'')+'>下一步</button><button class="btn sec" id="simReset">重新開始</button></div>';
    $('#sim').innerHTML=h;bind();
  }
  function logic(){
    if(S.q.some(function(v){return v==null}))return '<p style="color:var(--muted)">三題都回答後，這裡會顯示傾向。</p>';
    var c=S.q.reduce(function(a,b){return a+b},0);
    var lean=c>=2?'偏向因果邏輯（Causation）：從目標反推需要的資訊、方法與步驟。':(c===0?'偏向效果邏輯（Effectuation）：從「我們是誰、知道什麼、認識誰」出發。':'兩種邏輯都需要：先用效果邏輯探索，再用因果邏輯收斂。');
    return '<div class="card" style="background:var(--blue-bg)"><b>傾向：</b>'+esc(lean)+'<p style="margin:6px 0 0;font-size:.9rem">講義提醒：「兩種邏輯並非二選一，而是可以隨著探索進展、不確定程度與掌握的資源，適時切換。」'+cite(C.effectuation.textSrc)+'</p><p style="margin:6px 0 0;font-size:.85rem">判斷規則是本指南的簡化 <span class="ta">助教補充</span></p></div>';
  }
  function sheet(){
    var c=opts[S.c],lab={S:'策略',O:'組織',F:'財務',T:'技術'};
    var gs=Object.keys(S.gs).map(function(g){return '  - '+g+'：'+(S.gs[g]||'（未填）')}).join('\n')||'  （未勾選）';
    return '決策風洞工作單（AIXGS 學習指南 v1.4｜助教補充）\n================================\n案例：'+c.t+'\n決策者：'+(S.who||'（未填）')+'\n核心困境：'+(S.dilemma||'（未填）')+'\n\n[AI-X-Gs]\nX 跨域：'+(S.x||'（未填）')+'\nGs：\n'+gs+'\n\n[S.O.F.T. 衝擊 0-3]\n'+['S','O','F','T'].map(function(k){return '  '+k+' '+lab[k]+'：'+S.soft[k]}).join('\n')+'\n最強耦合：'+(S.softNote||'（未填）')+'\n\n[邏輯選擇]\n'+logic().replace(/<[^>]+>/g,'').replace(/出處｜/g,'')+'\n\n[壓力測試]\n'+(S.shock>=0?shocks[S.shock][0]+'（'+shocks[S.shock][1]+'）':'（未抽卡）')+'\n反面論證：'+(S.counter||'（未填）')+'\n\n[判斷與下一步]\n'+(S.decision||'（未填）')+'\n';
  }
  function bind(){
    var on=function(id,ev,fn){var el=$('#'+id);if(el)el.addEventListener(ev,fn)};
    on('simCase','change',function(e){S.c=+e.target.value;S.gs={};opts[S.c].g.forEach(function(g){S.gs[g]=S.gs[g]||''});save()});
    on('simWho','input',function(e){S.who=e.target.value;save()});
    on('simDil','input',function(e){S.dilemma=e.target.value;save()});
    $$('#sim [data-g]').forEach(function(cb){cb.addEventListener('change',function(){var g=cb.dataset.g;if(cb.checked)S.gs[g]=S.gs[g]||'';else delete S.gs[g];save()})});
    $$('#sim [data-gn]').forEach(function(t){t.addEventListener('input',function(){var g=t.dataset.gn;S.gs[g]=t.value;$('#g_'+g).checked=true;save()})});
    on('simX','input',function(e){S.x=e.target.value;save()});
    $$('#sim input[type=range]').forEach(function(r){r.addEventListener('input',function(){S.soft[r.dataset.k]=+r.value;$('#so'+r.dataset.k).textContent=r.value;save()})});
    on('simSoft','input',function(e){S.softNote=e.target.value;save()});
    $$('#sim input[type=radio]').forEach(function(r){r.addEventListener('change',function(){S.q[+r.name.slice(2)]=+r.value;save();$('#logicOut').innerHTML=logic()})});
    if($('#logicOut'))$('#logicOut').innerHTML=logic();
    on('drawShock','click',function(){var n;do{n=Math.floor(Math.random()*shocks.length)}while(n===S.shock&&shocks.length>1);S.shock=n;save();view()});
    on('simCounter','input',function(e){S.counter=e.target.value;save()});
    on('simDec','input',function(e){S.decision=e.target.value;save();$('#simOut').textContent=sheet()});
    if($('#simOut'))$('#simOut').textContent=sheet();
    on('simCopy','click',function(){var t=sheet();if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){$('#simCopy').textContent='已複製'},function(){});});
    on('simDl','click',function(){download('決策風洞工作單.txt',sheet())});
    on('simPrev','click',function(){S.step=Math.max(0,S.step-1);save();view()});
    on('simNext','click',function(){if(S.step===0&&Object.keys(S.gs).length===0)opts[S.c].g.forEach(function(g){S.gs[g]=''});S.step=Math.min(6,S.step+1);save();view()});
    on('simReset','click',function(){S={step:0,c:0,who:'',dilemma:'',gs:{},x:'',soft:{S:1,O:1,F:1,T:1},softNote:'',q:[null,null,null],shock:-1,counter:'',decision:''};save();view()});
  }
  view();
})();

/* ---------- quiz ---------- */
(function(){
  var Q=C.quiz,ans={};
  function shuffle(n,seed){var a=[];for(var i=0;i<n;i++)a.push(i);for(var j=n-1;j>0;j--){seed=(seed*9301+49297)%233280;var k=Math.floor(seed/233280*(j+1));var t=a[j];a[j]=a[k];a[k]=t}return a}
  function render(){
    $('#quiz').innerHTML=Q.map(function(q,i){var ord=shuffle(q.o.length,i*7+3);return '<div class="q" data-i="'+i+'"><b>'+(i+1)+'. '+esc(q.q)+'</b><div class="opts">'+ord.map(function(k){return '<button class="opt" data-k="'+k+'">'+esc(q.o[k])+'</button>'}).join('')+'</div><div class="fb" aria-live="polite"></div></div>'}).join('');
    $$('#quiz .q').forEach(function(d){var i=+d.dataset.i,q=Q[i];$$('.opt',d).forEach(function(b){b.addEventListener('click',function(){
      if(ans[i]!=null)return;var k=+b.dataset.k;ans[i]=k;
      $$('.opt',d).forEach(function(x){if(+x.dataset.k===q.a)x.classList.add('right');});if(k!==q.a)b.classList.add('wrong');
      $('.fb',d).innerHTML=(k===q.a?'✅ 答對了。':'❌ 正確答案：'+esc(q.o[q.a])+'。')+' '+cite(q.s,q.q+' '+q.o[q.a]);score()})})});
    score();
  }
  function score(){var n=0,t=0;Object.keys(ans).forEach(function(i){t++;if(ans[i]===Q[i].a)n++});$('#qScore').textContent=t?('（'+n+'/'+t+'，共 '+Q.length+' 題）'):('（共 '+Q.length+' 題）')}
  $('#qReset').addEventListener('click',function(){ans={};render()});
  render();
})();

/* ---------- flashcards ---------- */
(function(){
  var cards=C.cards.slice(),i=0,known=store.get('known',[]);
  function render(){
    var c=cards[i];
    $('#flash').innerHTML='<button class="fc" id="fc"><span class="sr">字卡（按一下翻面）：</span><span class="face front">'+esc(c[0])+'</span><span class="face back"><span>'+esc(c[1])+'</span></span></button><p class="fc-src">這張卡的'+cite(c[2],c[0]+' '+c[1])+'</p><div class="fcbar"><button class="btn sec" id="fcPrev">← 上一張</button><span>'+(i+1)+' / '+cards.length+'（已熟 '+known.length+'）</span><button class="btn sec" id="fcNext">下一張 →</button></div><div class="btns" style="justify-content:center"><button class="btn sec" id="fcKnow" aria-pressed="'+(known.indexOf(c[0])>=0)+'">'+(known.indexOf(c[0])>=0?'✓ 已熟':'標記為已熟')+'</button><button class="btn sec" id="fcShuf">洗牌</button></div>';
    $('#fc').addEventListener('click',function(){this.classList.toggle('flipped')});
    $('#fcPrev').addEventListener('click',function(){i=(i-1+cards.length)%cards.length;render()});
    $('#fcNext').addEventListener('click',function(){i=(i+1)%cards.length;render()});
    $('#fcKnow').addEventListener('click',function(){var k=known.indexOf(c[0]);if(k>=0)known.splice(k,1);else known.push(c[0]);store.set('known',known);render()});
    $('#fcShuf').addEventListener('click',function(){for(var j=cards.length-1;j>0;j--){var k=Math.floor(Math.random()*(j+1));var t=cards[j];cards[j]=cards[k];cards[k]=t}i=0;render()});
  }
  render();
})();

/* ---------- gaps & links ---------- */
$('#linkList').innerHTML=C.links.map(function(l){return '<li>'+ext(l[0],l[1])+'</li>'}).join('');

/* lightbox replaced by right-side panel (assets/drawer.js) in v1.1 */

/* nav highlight moved to assets/nav.js in v1.2 */
})();
