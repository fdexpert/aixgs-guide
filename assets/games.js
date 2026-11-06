/* AIXGS 互動學習指南 — 闖關遊戲區（v1.7／公開版 v2.0 起）
   玩法、角色與提問是助教補充；題目裡的事實一律取自 data.js（講義與連結文件），並附出處。純前端、離線可用。 */
(function(){
'use strict';
var C=window.COURSE; if(!C||!document.getElementById('games'))return;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function cite(s){return '<span class="cite">'+esc(s)+'</span>'}
function ext(t,u,ctx){return '<a class="ext" href="'+esc(u)+'" target="_blank" rel="noopener noreferrer"'+(ctx?' data-ctx="'+esc(ctx)+'"':'')+'>'+esc(t)+'</a>'}
var store={get:function(k,d){try{var v=localStorage.getItem('aixgs.g.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
           set:function(k,v){try{localStorage.setItem('aixgs.g.'+k,JSON.stringify(v))}catch(e){}}};
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function today(){var d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())}
function pd(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function days(a,b){return Math.round((b-a)/86400000)}
function md(s){var d=pd(s);return (d.getMonth()+1)+'/'+('0'+d.getDate()).slice(-2)}
var DOW='日一二三四五六',T0=today();
var GCOL={Government:'var(--g-gov)',Governance:'#3d4f7a',Geopolitics:'var(--g-geo)',Generations:'var(--g-gen)',Generation:'var(--g-gen)',Gender:'var(--g-gender)',Green:'var(--g-green)'};
var F=C.framework,FIVE=F.gs.map(function(g){return g.id});           // Government, Geopolitics, Generations, Gender, Green
var GZH={};F.gs.forEach(function(g){GZH[g.id]=g.zh});
function g5(id){return id==='Generation'?'Generations':id}                // 潛在案例投影片寫 Generation
function gb(id){return '<span class="gb" style="background:'+(GCOL[id]||'#555')+'">'+esc(id)+'</span>'}

/* ---------- 徽章 ---------- */
var BADGES=[['g5','5Gs 配對達人','5Gs 配對拿到 6 分以上'],['chain','框架串接','兩道排序題都排對'],['quest','模組通關','五站闖關全部通過'],['read','日更讀者','速讀卡標記讀完 10 篇'],['dil','兩難決策卡','完成一張兩難決策卡']];
function badge(k){var b=store.get('badges',{});if(!b[k]){b[k]=1;store.set('badges',b)}renderBadges()}
function renderBadges(){
  var b=store.get('badges',{}),n=BADGES.filter(function(x){return b[x[0]]}).length;
  $('#gmBadges').innerHTML='<p class="gm-bh"><b>闖關徽章 '+n+' / '+BADGES.length+'</b>　進度只存在這台裝置的瀏覽器</p><div class="gm-blist">'+BADGES.map(function(x){return '<span class="gm-badge'+(b[x[0]]?' on':'')+'" title="'+esc(x[2])+'"><span aria-hidden="true">'+(b[x[0]]?'🏅':'○')+'</span> '+esc(x[1])+'<small>'+esc(x[2])+'</small></span>'}).join('')+'</div><button class="btn sec gm-reset" id="gmResetAll" type="button">清除遊戲進度</button>';
  $('#gmResetAll').addEventListener('click',function(){if(!confirm('清除所有遊戲進度與徽章？'))return;try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('aixgs.g.')===0)localStorage.removeItem(k)})}catch(e){}location.reload()});
}

/* ---------- 1. 截止倒數看板 ---------- */
(function(){
  var up=C.timeline.filter(function(e){return pd(e.d)>=T0}).slice(0,6);
  var el=$('#gmCount');
  if(!up.length){el.innerHTML='<p>講義中已沒有未來的日期。</p>';return}
  el.innerHTML='<ol class="gm-count">'+up.map(function(e,i){var n=days(T0,pd(e.d));return '<li class="'+(e.k==='due'?'due':'')+(i===0?' first':'')+'"><span class="gm-n"><b>'+(n===0?'今天':n)+'</b>'+(n===0?'':'<small>天後</small>')+'</span><span class="gm-ct"><b>'+esc(md(e.d))+'（週'+DOW[pd(e.d).getDay()]+'）'+esc(e.t)+'</b>'+(e.k==='due'?' <span class="gm-tag">截止／繳交</span>':'')+'<br><span class="gm-x">'+esc(e.x)+'</span><br>'+cite(e.src)+'</span></li>'}).join('')+'</ol>';
})();

/* ---------- 2. 5Gs 配對 ---------- */
(function(){
  var pool=[];C.potential.items.forEach(function(p){p.g.forEach(function(g){var id=g5(g[0]);if(FIVE.indexOf(id)>=0)pool.push({c:p.t,l:g[1],a:id})})});
  var N=8,S;
  function start(){S={q:shuffle(pool).slice(0,N),i:0,sc:0,ans:null};view()}
  function view(){
    var el=$('#gm5g'),best=store.get('g5best',0);
    if(S.i>=S.q.length){
      if(best<S.sc)store.set('g5best',S.sc);
      if(S.sc>=6)badge('g5');
      el.innerHTML='<div class="gm-end"><p class="gm-big">'+S.sc+' / '+N+'</p><p>'+(S.sc===N?'全對！5Gs 的視角已經很熟了。':S.sc>=6?'很好，再玩一輪把錯的補起來。':'再試一次：先想「這個標記背後是誰在做決定、誰受影響」。')+'</p><p style="color:var(--muted)">最佳紀錄 '+Math.max(best,S.sc)+' / '+N+'</p><button class="btn" id="g5again" type="button">再玩一輪</button></div>';
      $('#g5again').addEventListener('click',start);return;
    }
    var it=S.q[S.i];
    var h='<div class="gm-top"><span>第 '+(S.i+1)+' / '+N+' 題</span><span class="score">得分 '+S.sc+'</span></div>'+
      '<p class="gm-case">潛在案例：<b>'+esc(it.c)+'</b></p><p class="gm-prompt">老師在這個案例標了「<b>'+esc(it.l)+'</b>」，它屬於哪一個 G？</p>'+
      '<div class="gm-opts g5">'+FIVE.map(function(g){var cls='';if(S.ans){if(g===it.a)cls=' right';else if(g===S.ans)cls=' wrong'}return '<button type="button" class="gm-opt'+cls+'" data-g="'+g+'"'+(S.ans?' disabled':'')+'>'+gb(g)+'<small>'+esc(GZH[g])+'</small></button>'}).join('')+'</div>';
    if(S.ans){h+='<p class="gm-fb '+(S.ans===it.a?'ok-t':'bad-t')+'" role="status">'+(S.ans===it.a?'✓ 答對了。':'✗ 投影片標的是 '+esc(it.a)+'（'+esc(GZH[it.a])+'）。')+'</p><button class="btn" id="g5next" type="button">'+(S.i+1<N?'下一題':'看結果')+'</button>'}
    h+='<p class="gm-src">'+cite(C.potential.src)+' <span class="ta">助教補充：遊戲玩法</span>　只取標為 5Gs 的項目。</p>';
    el.innerHTML=h;
    $$('.gm-opt',el).forEach(function(b){b.addEventListener('click',function(){S.ans=b.dataset.g;if(S.ans===it.a)S.sc++;view();var n=$('#g5next');if(n)n.focus()})});
    var nx=$('#g5next');if(nx)nx.addEventListener('click',function(){S.i++;S.ans=null;view();var f=$('#gm5g .gm-opt');if(f)f.focus()});
  }
  start();
})();

/* ---------- 3. 三框架串接（排序） ---------- */
(function(){
  var W3=C.eipWeek3||{};
  var P=[];
  if(W3.linkage)P.push({id:'tri',name:'三個框架的連動順序',ask:'把三張卡從「先」排到「後」：研究一個議題時，老師說三個框架怎麼接？',items:W3.linkage.map(function(x){return {k:x[1],h:x[2],x:x[3],ic:x[0]}}),src:W3.src,after:W3.linkNote});
  P.push({id:'clear',name:'C.L.E.A.R. 五步',ask:'把五張卡排回 C.L.E.A.R. 的順序（卡片只寫意思，不寫字母）。',items:F.clear.letters.map(function(l){return {k:l.k+'｜'+l.en,h:l.zh,x:l.x}}),src:F.clear.lettersSrc});
  var cur=0,ST={};
  function state(p){if(!ST[p.id]){var o;do{o=shuffle(p.items.map(function(_,i){return i}))}while(o.every(function(v,i){return v===i}));ST[p.id]={o:o,checked:false}}return ST[p.id]}
  function view(){
    var p=P[cur],s=state(p),solved=store.get('chain',{});
    var ok=s.o.every(function(v,i){return v===i});
    var h='<div class="tabs" role="tablist" aria-label="選擇排序題">'+P.map(function(q,i){return '<button type="button" role="tab" aria-selected="'+(i===cur)+'" data-i="'+i+'">'+esc(q.name)+(solved[q.id]?' ✓':'')+'</button>'}).join('')+'</div>'+
      '<p class="gm-prompt">'+esc(p.ask)+'</p><p style="font-size:.85rem;color:var(--muted);margin-top:-4px">桌機可直接拖拉卡片；手機或鍵盤用 ↑ ↓ 按鈕。</p><ol class="gm-sort" id="gmSort">'+
      s.o.map(function(v,pos){var it=p.items[v],st=s.checked?(v===pos?' right':' wrong'):'';return '<li class="gm-si'+st+'" draggable="true" data-pos="'+pos+'"><span class="gm-grip" aria-hidden="true">⋮⋮</span><span class="gm-sb">'+(s.checked&&ok?'<b>'+esc((it.ic?it.ic+' ':'')+it.k)+'</b>　':'')+'<b>'+esc(it.h)+'</b><br><span>'+esc(it.x)+'</span></span><span class="gm-mv"><button type="button" class="gm-up" aria-label="上移" '+(pos===0?'disabled':'')+'>↑</button><button type="button" class="gm-dn" aria-label="下移" '+(pos===s.o.length-1?'disabled':'')+'>↓</button></span></li>'}).join('')+'</ol>'+
      '<div class="btns"><button class="btn" id="gmChk" type="button">檢查順序</button><button class="btn sec" id="gmShuf" type="button">重新洗牌</button></div><div id="gmChainFb" role="status"></div><p class="gm-src">'+cite(p.src)+' <span class="ta">助教補充：排序玩法</span></p>';
    var el=$('#gmChain');el.innerHTML=h;
    if(s.checked){var n=s.o.filter(function(v,i){return v===i}).length;
      $('#gmChainFb').innerHTML=ok?'<p class="gm-fb ok-t">✓ 全部排對！'+(p.after?esc(p.after):'')+'</p>':'<p class="gm-fb bad-t">排對 '+n+' / '+s.o.length+' 張（綠色是位置正確的卡）。調整後再檢查一次。</p>';}
    $$('.tabs button',el).forEach(function(b){b.addEventListener('click',function(){cur=+b.dataset.i;view()})});
    function move(a,b){var o=s.o;var t=o.splice(a,1)[0];o.splice(b,0,t);s.checked=false;view()}
    $$('.gm-si',el).forEach(function(li){var pos=+li.dataset.pos;
      $('.gm-up',li).addEventListener('click',function(){move(pos,pos-1);var b=$$('#gmSort .gm-up')[pos-1];if(b&&!b.disabled)b.focus()});
      $('.gm-dn',li).addEventListener('click',function(){move(pos,pos+1);var b=$$('#gmSort .gm-dn')[pos+1];if(b&&!b.disabled)b.focus()});
      li.addEventListener('dragstart',function(e){e.dataTransfer.setData('text/plain',String(pos));li.classList.add('drag')});
      li.addEventListener('dragend',function(){li.classList.remove('drag')});
      li.addEventListener('dragover',function(e){e.preventDefault();li.classList.add('over')});
      li.addEventListener('dragleave',function(){li.classList.remove('over')});
      li.addEventListener('drop',function(e){e.preventDefault();var from=+e.dataTransfer.getData('text/plain');if(!isNaN(from)&&from!==pos)move(from,pos)});
    });
    $('#gmChk').addEventListener('click',function(){s.checked=true;if(ok){solved[p.id]=1;store.set('chain',solved);if(P.every(function(q){return solved[q.id]}))badge('chain')}view();$('#gmChk').focus()});
    $('#gmShuf').addEventListener('click',function(){delete ST[p.id];view()});
  }
  view();
})();

/* ---------- 4. 模組闖關 ---------- */
(function(){
  var MODS=C.modules.filter(function(m){return /^模組/.test(m.n)||m.n==='EIP'});
  var SP=C.people.speakers||[];
  function opts(right,pool){var o=[right];shuffle(pool).forEach(function(x){if(o.length<4&&o.indexOf(x)<0)o.push(x)});return shuffle(o)}
  function fmt(m){var d=pd(m.date);return md(m.date)+'（週'+DOW[d.getDay()]+'）'}
  var STAGES=MODS.map(function(m){
    var qs=[];
    if(m.n==='EIP'&&C.eipWeek3){
      var W=C.eipWeek3,names=W.checks.map(function(c){return c[0]});
      qs.push({q:'EIP 的全名是？',o:opts(m.title,MODS.filter(function(x){return x!==m}).map(function(x){return x.title})),a:m.title,s:m.src});
      W.checks.slice(0).sort(function(){return Math.random()-.5}).slice(0,2).forEach(function(c){qs.push({q:'研究議題四個自問中，這一問是哪一點？「'+c[1]+'」',o:shuffle(names),a:c[0],s:W.src})});
      return {m:m,qs:qs};
    }
    var others=MODS.filter(function(x){return x!==m&&x.n!=='EIP'});
    qs.push({q:m.n+'是哪一天？',o:opts(fmt(m),others.map(fmt)),a:fmt(m),s:m.src});
    qs.push({q:'「'+m.title+'」是哪一站的主題？',o:opts(m.n,others.map(function(x){return x.n})),a:m.n,s:m.src});
    var mine=SP.filter(function(s){return s.m===m.n});
    if(mine.length){var s0=mine[Math.floor(Math.random()*mine.length)];
      qs.push({q:m.n+'的立體個案分享，誰講「'+s0.topic+'」？',o:opts(s0.name,SP.map(function(s){return s.name})),a:s0.name,s:C.people.speakersSrc});}
    return {m:m,qs:qs};
  });
  var prog=store.get('quest',{}),cur=-1,S=null;
  function unlocked(i){return i===0||prog[STAGES[i-1].m.n]!=null&&prog[STAGES[i-1].m.n]>=2}
  function map(){
    var el=$('#gmQuest');
    el.innerHTML='<div class="gm-path">'+STAGES.map(function(st,i){var sc=prog[st.m.n],u=unlocked(i);return '<button type="button" class="gm-stage'+(sc!=null&&sc>=2?' pass':'')+'" data-i="'+i+'" '+(u?'':'disabled')+'><span class="gm-sn">'+(u?(sc!=null&&sc>=2?'★':i+1):'🔒')+'</span><b>'+esc(st.m.n)+'</b><small>'+(sc!=null?'最佳 '+sc+' / '+st.qs.length:u?'可挑戰':'先通過上一站')+'</small></button>'}).join('')+'</div><p style="font-size:.88rem;color:var(--muted)">每站 3 題，答對 2 題就解鎖下一站。<span class="ta">助教補充：闖關玩法</span> 題目取自課程地圖與分享業師資料。</p>';
    $$('.gm-stage',el).forEach(function(b){b.addEventListener('click',function(){cur=+b.dataset.i;S={i:0,sc:0,ans:null};play()})});
  }
  function play(){
    var st=STAGES[cur],el=$('#gmQuest');
    if(S.i>=st.qs.length){
      var best=prog[st.m.n];if(best==null||S.sc>best)prog[st.m.n]=S.sc;store.set('quest',prog);
      if(STAGES.every(function(x){return prog[x.m.n]!=null&&prog[x.m.n]>=2}))badge('quest');
      el.innerHTML='<div class="gm-end"><p class="gm-big">'+esc(st.m.n)+'｜'+S.sc+' / '+st.qs.length+'</p><p>'+(S.sc>=2?(cur+1<STAGES.length?'通過！下一站「'+esc(STAGES[cur+1].m.n)+'」已解鎖。':'恭喜全部通關！'):'差一點，再挑戰一次。')+'</p><div class="btns" style="justify-content:center"><button class="btn" id="qmMap" type="button">回到地圖</button>'+(S.sc<2?'<button class="btn sec" id="qmRetry" type="button">再挑戰</button>':'')+'</div></div>';
      $('#qmMap').addEventListener('click',map);var r=$('#qmRetry');if(r)r.addEventListener('click',function(){S={i:0,sc:0,ans:null};play()});return;
    }
    var q=st.qs[S.i];
    var h='<div class="gm-top"><span><b>'+esc(st.m.n)+'</b>　第 '+(S.i+1)+' / '+st.qs.length+' 題</span><span class="score">答對 '+S.sc+'</span></div><p class="gm-prompt">'+esc(q.q)+'</p><div class="gm-opts">'+q.o.map(function(o,i){var cls='';if(S.ans!=null){if(o===q.a)cls=' right';else if(i===S.ans)cls=' wrong'}return '<button type="button" class="gm-opt'+cls+'" data-i="'+i+'"'+(S.ans!=null?' disabled':'')+'>'+esc(o)+'</button>'}).join('')+'</div>';
    if(S.ans!=null)h+='<p class="gm-fb '+(q.o[S.ans]===q.a?'ok-t':'bad-t')+'" role="status">'+(q.o[S.ans]===q.a?'✓ 答對了。':'✗ 正確答案：'+esc(q.a))+'</p><p>'+cite(q.s)+'</p><button class="btn" id="qmNext" type="button">'+(S.i+1<st.qs.length?'下一題':'看結果')+'</button>';
    el.innerHTML=h;
    $$('.gm-opt',el).forEach(function(b){b.addEventListener('click',function(){S.ans=+b.dataset.i;if(q.o[S.ans]===q.a)S.sc++;play();$('#qmNext').focus()})});
    var n=$('#qmNext');if(n)n.addEventListener('click',function(){S.i++;S.ans=null;play();var f=$('#gmQuest .gm-opt');if(f)f.focus()});
  }
  map();
})();

/* ---------- 5. 日更文章速讀卡 ---------- */
(function(){
  var A=C.articles,read=store.get('read',{}),cur=null,flip=false,onlyNew=true;
  function key(a){return a.d+'|'+a.t}
  function cnt(){return A.filter(function(a){return read[key(a)]}).length}
  function draw(){var pool=A.filter(function(a){return !onlyNew||!read[key(a)]});if(!pool.length)pool=A;var n;do{n=pool[Math.floor(Math.random()*pool.length)]}while(pool.length>1&&n===cur);cur=n;flip=false;view()}
  function view(){
    var el=$('#gmDraw'),n=cnt();
    var h='<div class="gm-top"><span>已讀 <b>'+n+'</b> / '+A.length+' 篇</span><label class="gm-tg"><input type="checkbox" id="gdNew" '+(onlyNew?'checked':'')+'> 只抽沒讀過的</label></div><div class="gm-bar" aria-hidden="true"><i style="width:'+(n/A.length*100).toFixed(1)+'%"></i></div>';
    if(!cur){h+='<div class="gm-card empty"><p>按下「抽一篇」，隨機抽一篇老師的日更文章，五分鐘讀完再回來標記。</p></div>'}
    else{
      var a=cur;
      h+='<div class="gm-card'+(flip?' back':'')+'"><p class="gm-d">2026/'+esc(a.d)+' '+a.tags.map(function(t){return '<span class="tg">'+esc(t)+'</span>'}).join('')+(read[key(a)]?' <span class="ok">已讀</span>':'')+'</p><p class="gm-t">'+esc(a.t)+'</p>'+
        (flip?'<p>'+esc(a.k)+'</p><p>'+(a.u?ext('打開原文',a.u,a.tags.join('、')+'｜'+a.k):'<span class="nw">內文在講義中（無外部連結）</span>')+'</p>'+cite('課程航線 Tab 1｜2026/'+a.d):'<p style="color:var(--muted)">先猜猜看：這篇在講什麼？想好了再翻面。</p>')+'</div>';
    }
    h+='<div class="btns"><button class="btn" id="gdDraw" type="button">🎲 抽一篇</button>'+(cur?'<button class="btn sec" id="gdFlip" type="button">'+(flip?'翻回正面':'翻面看摘要')+'</button><button class="btn sec" id="gdRead" type="button">'+(read[key(cur)]?'取消已讀':'標記已讀')+'</button>':'')+'</div><p class="gm-src"><span class="ta">助教補充</span> 主題標籤與一句話摘要由本指南整理，標題與連結來自課程航線。</p>';
    el.innerHTML=h;
    $('#gdNew').addEventListener('change',function(e){onlyNew=e.target.checked});
    $('#gdDraw').addEventListener('click',function(){draw();$('#gdFlip').focus()});
    var f=$('#gdFlip');if(f)f.addEventListener('click',function(){flip=!flip;view();$('#gdFlip').focus()});
    var r=$('#gdRead');if(r)r.addEventListener('click',function(){var k=key(cur);if(read[k])delete read[k];else read[k]=1;store.set('read',read);if(cnt()>=10)badge('read');view();$('#gdRead').focus()});
  }
  view();
})();

/* ---------- 6. 兩難十字路口 ---------- */
(function(){
  var ROLES=['企業決策者','政府／監管者','投資人','受影響的員工或社群'];
  var CASES=C.potential.items, SOFT=F.soft.letters, CL=F.clear.letters;
  var TH={};F.gs.forEach(function(g){TH[g.id]=g.theater});
  var S=store.get('dil',null)||{st:0,c:0,r:0,w:{},pi:0,s1:null,s2:null};
  function save(){store.set('dil',S)}
  function pairs(c){var g=CASES[c].g,p=[];for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++)p.push([i,j]);return p}
  function rank(c){var g=CASES[c].g;return g.map(function(x,i){return {i:i,n:S.w[i]||0}}).sort(function(a,b){return b.n-a.n||a.i-b.i}).map(function(x){return g[x.i]})}
  function lab(x){return '「'+x[1]+'」（'+x[0]+'）'}
  function view(){
    var el=$('#gmDil'),c=CASES[S.c],h='';
    var steps=['選案例與角色','5Gs 取捨','S.O.F.T. 動員','C.L.E.A.R. 決策卡'];
    h+='<div class="steps" aria-label="步驟">'+steps.map(function(s,i){return '<span class="'+(i===S.st?'on':(i<S.st?'done':''))+'">'+(i+1)+'. '+s+'</span>'}).join('')+'</div>';
    if(S.st===0){
      h+='<label for="gdCase">選一個潛在案例</label><select id="gdCase">'+CASES.map(function(p,i){return '<option value="'+i+'"'+(i===S.c?' selected':'')+'>'+esc(p.t)+'</option>'}).join('')+'</select>'+
        '<p><b>議題：</b>'+esc(c.issue)+'</p><p>老師標的面向：'+c.g.map(function(x){return gb(x[0])+' '+esc(x[1])}).join('　')+'</p>'+cite(C.potential.src)+
        '<p class="mt"><b>你扮演誰？</b> <span class="ta">助教補充：角色</span></p><div class="chips" role="group" aria-label="選擇角色">'+ROLES.map(function(r,i){return '<button type="button" class="chip" data-r="'+i+'" aria-pressed="'+(i===S.r)+'">'+esc(r)+'</button>'}).join('')+'</div>'+
        '<div class="btns"><button class="btn" id="gdGo" type="button">開始取捨 →</button></div>';
    }
    if(S.st===1){
      var P=pairs(S.c);
      if(S.pi<P.length){
        var a=c.g[P[S.pi][0]],b=c.g[P[S.pi][1]];
        h+='<p class="gm-prompt">身為<b>'+esc(ROLES[S.r])+'</b>，資源和時間只夠先處理一件事（第 '+(S.pi+1)+' / '+P.length+' 回合）：</p><div class="gm-duel">'+
          [[a,P[S.pi][0]],[b,P[S.pi][1]]].map(function(x){return '<button type="button" class="gm-side" data-k="'+x[1]+'">'+gb(x[0][0])+'<b>'+esc(x[0][1])+'</b><small>先回應這個面向</small></button>'}).join('<span class="gm-vs" aria-hidden="true">VS</span>')+'</div>'+
          '<p style="font-size:.88rem;color:var(--muted)">沒有標準答案。重點是說得出取捨的理由，以及「什麼條件下我會改變選擇」。</p>';
      }else{
        var R=rank(S.c);
        h+='<p class="gm-prompt">你的優先順序：</p><ol class="gm-rank">'+R.map(function(x){return '<li>'+gb(x[0])+' '+esc(x[1])+'</li>'}).join('')+'</ol>';
        var top=g5(R[0][0]),last=R[R.length-1];
        if(TH[top])h+='<div class="card box-ta gm-warn"><p style="margin:0 0 6px"><b>老師的提醒：小心「'+esc(GZH[top])+'劇場」的假象</b></p><p style="margin:0 0 6px">'+esc(TH[top])+'</p>'+cite(F.theaterSrc)+'</div>';
        h+='<p><b>追問自己</b> <span class="ta">助教補充</span>：你最後才處理的'+esc(lab(last))+'，在什麼情況下會反過來變成最關鍵的那一個？</p>'+
          '<div class="btns"><button class="btn sec" id="gdRedo" type="button">重新取捨</button><button class="btn" id="gdGo" type="button">下一步：S.O.F.T. →</button></div>';
      }
    }
    if(S.st===2){
      var top2=rank(S.c)[0];
      h+='<p class="gm-prompt">要把'+esc(lab(top2))+'轉成組織行動，<b>先動哪一個 S.O.F.T. 面向</b>？再選一個要一起連動的面向。</p>'+
        '<div class="gm-opts soft">'+SOFT.map(function(l){var on=S.s1===l.k?' right':S.s2===l.k?' pick2':'';return '<button type="button" class="gm-opt'+on+'" data-k="'+l.k+'"><b>'+esc(l.k)+'｜'+esc(l.en)+'</b><small>'+esc(l.zh)+'</small></button>'}).join('')+'</div>'+
        '<p style="font-size:.88rem">'+(S.s1?'先動：<b>'+esc(S.s1)+'</b>':'點第一下選「先動」')+(S.s2?'　連動：<b>'+esc(S.s2)+'</b>':S.s1?'　再點一個選「連動」':'')+'</p>'+cite(F.soft.lettersSrc)+
        '<div class="card mt gm-note"><p style="margin:0 0 6px"><b>老師提過的組合</b></p><p style="margin:0 0 6px">'+esc(F.soft.combos)+'</p>'+cite(F.soft.combosSrc)+'</div>'+
        '<div class="btns"><button class="btn sec" id="gdBack" type="button">← 上一步</button><button class="btn" id="gdGo" type="button" '+(S.s1&&S.s2?'':'disabled')+'>下一步：C.L.E.A.R. →</button></div>';
    }
    if(S.st===3){
      var R3=rank(S.c),sl=function(k){var l=SOFT.filter(function(x){return x.k===k})[0];return l?l.k+'（'+l.zh+'）':k};
      h+='<div class="gm-sheet" id="gdSheet"><p class="gm-big" style="font-size:1.15rem;margin:0 0 4px">兩難決策卡</p><p style="margin:0 0 8px"><b>'+esc(c.t)+'</b>｜我是 '+esc(ROLES[S.r])+'</p>'+
        '<p style="margin:0 0 6px"><b>5Gs 優先順序：</b>'+R3.map(function(x){return esc(x[1])+'（'+esc(x[0])+'）'}).join(' ＞ ')+'</p>'+
        '<p style="margin:0 0 10px"><b>S.O.F.T.：</b>先動 '+esc(sl(S.s1))+'，連動 '+esc(sl(S.s2))+'</p>'+
        '<p style="margin:0 0 6px"><b>用 C.L.E.A.R. 收斂成決策</b>（每一步寫一句話）：</p><ol class="gm-clear">'+CL.map(function(l){return '<li><label for="gc'+l.k+'"><b>'+esc(l.k)+'｜'+esc(l.en)+'</b>：'+esc(l.x)+'</label><input type="text" id="gc'+l.k+'" data-k="'+l.k+'" value="'+esc((S.cl||{})[l.k]||'')+'" placeholder="我的一句話…"></li>'}).join('')+'</ol>'+cite(F.clear.lettersSrc)+'</div>'+
        '<div class="btns"><button class="btn sec" id="gdBack" type="button">← 上一步</button><button class="btn" id="gdDl" type="button">下載決策卡 .txt</button><button class="btn sec" id="gdNewC" type="button">換一個案例</button></div>'+
        '<p style="font-size:.88rem;color:var(--muted)"><span class="ta">助教補充</span> 這張卡是討論起點，不是作業格式；實際作業要求以課程航線為準。</p>';
    }
    el.innerHTML=h;
    $$('[data-r]',el).forEach(function(b){b.addEventListener('click',function(){S.r=+b.dataset.r;save();view()})});
    var cs=$('#gdCase');if(cs)cs.addEventListener('change',function(){S.c=+cs.value;S.w={};S.pi=0;save();view();$('#gdCase').focus()});
    $$('.gm-side',el).forEach(function(b){b.addEventListener('click',function(){var k=+b.dataset.k;S.w[k]=(S.w[k]||0)+1;S.pi++;save();view();var f=$('#gmDil .gm-side')||$('#gdGo');if(f)f.focus()})});
    $$('.gm-opts.soft .gm-opt',el).forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.k;if(!S.s1||S.s1===k){S.s1=S.s1===k?null:k;if(!S.s1)S.s2=null}else S.s2=(S.s2===k?null:k);save();view()})});
    var go=$('#gdGo');if(go)go.addEventListener('click',function(){if(S.st===0){S.w={};S.pi=0}S.st++;save();view();if(S.st===3)badge('dil');var f=$('#gmDil button:not([disabled])');if(f)f.focus()});
    var bk=$('#gdBack');if(bk)bk.addEventListener('click',function(){S.st--;save();view()});
    var rd=$('#gdRedo');if(rd)rd.addEventListener('click',function(){S.w={};S.pi=0;save();view()});
    var nc=$('#gdNewC');if(nc)nc.addEventListener('click',function(){S={st:0,c:(S.c+1)%CASES.length,r:S.r,w:{},pi:0,s1:null,s2:null};save();view()});
    $$('.gm-clear input',el).forEach(function(i){i.addEventListener('input',function(){S.cl=S.cl||{};S.cl[i.dataset.k]=i.value;save()})});
    var dl=$('#gdDl');if(dl)dl.addEventListener('click',function(){
      var t=$('#gdSheet').innerText+'\n\n我的 C.L.E.A.R.：\n'+CL.map(function(l){return l.k+'｜'+((S.cl||{})[l.k]||'（未填）')}).join('\n')+'\n\n（AI-X-Gs 互動學習指南｜兩難十字路口。內容依林益全老師課程航線整理；玩法為助教補充）';
      var b=new Blob([t],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='AIXGS-兩難決策卡.txt';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)});
  }
  view();
})();

renderBadges();
})();
