/* AIXGS 互動學習指南 v1.3 — 左側固定導覽：scroll-spy、閱讀進度、收合、手機漢堡選單（無外部腳本） */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var NAV=[
 ['overview','總','總覽',[['ov-progress','課程進度條'],['ov-features','課程特色與教學目標']]],
 ['framework','框','AI-X-Gs 框架',[['fw-flow','三套思維工具'],['fw-letters','S.O.F.T.／C.L.E.A.R. 逐字'],['fw-more','更多課程框架'],['fw-eff','效果邏輯 vs 因果邏輯'],['fw-mottos','九個實務行動口訣']]],
 ['modules','模','模組與課程地圖','MODULES'],
 ['timeline','時','時間軸與截止日',[]],
 ['assignments','作','作業與評分',[['as-grade','評分標準'],['as-rules','修課規定']]],
 ['readings','讀','閱讀',[['rd-pre','課前必讀'],['rd-arts','日更文章瀏覽器']]],
 ['cases','案','案例',[['cs-qs','案例思問'],['cs-fb','老師的共同提醒'],['cs-pc','潛在案例 × 5Gs']]],
 ['mentors','師','老師與業師',[['mt-spk','分享業師'],['mt-roles','三種業師角色'],['mt-list','隨堂業師名單'],['mt-check','小組自我檢核']]],
 ['games','遊','闖關遊戲區',[['gm-count','截止倒數'],['gm-5g','5Gs 配對'],['gm-chain','三框架串接'],['gm-quest','模組闖關'],['gm-draw','日更速讀卡'],['gm-dil','兩難十字路口']]],
 ['practice','練','互動練習',[['sim','決策風洞模擬器'],['pr-fc','概念字卡'],['pr-quiz','自我檢測']]],
 ['sources','源','來源與版本',[]]
];
var list=$('#snList'),side=$('#sidenav'),html=document.documentElement,MOB=window.matchMedia('(max-width: 760px)');
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* 模組子項目直接取自模組分頁按鈕 */
var modBtns=$$('#modTabs button');
list.innerHTML=NAV.map(function(n){
  var subs=n[3]==='MODULES'?modBtns.map(function(b,i){return ['modules','mod:'+i,b.textContent.split('｜')[0]]}):n[3].map(function(s){return [s[0],s[0],s[1]]});
  return '<li data-sec="'+n[0]+'"><a class="sn-a" href="#'+n[0]+'" title="'+esc(n[2])+'"><span class="sn-ic" aria-hidden="true">'+n[1]+'</span><span class="sn-t">'+esc(n[2])+'</span></a>'+
    (subs.length?'<ul class="sn-sub">'+subs.map(function(s){return '<li><a href="#'+s[0]+'" data-key="'+s[1]+'">'+esc(s[2])+'</a></li>'}).join('')+'</ul>':'')+'</li>';
}).join('');

/* 點選：模組子項目切換分頁；手機點完關閉選單 */
list.addEventListener('click',function(e){
  var a=e.target.closest('a');if(!a)return;
  var k=a.dataset.key;
  if(k&&k.indexOf('mod:')===0){var b=$('#mt'+k.slice(4));if(b)b.click()}
  if(MOB.matches)closeMenu(false);
});

/* scroll-spy 與閱讀進度 */
var secs=NAV.map(function(n){return document.getElementById(n[0])}),cur=null,curSub=null,ticking=false;
var tbCur=$('#tbCur');
function spy(){
  ticking=false;
  var line=window.innerHeight*0.3,si=0;
  secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<=line)si=i});
  var n=NAV[si],li=list.children[si],sub=null;
  $$('.sn-sub a',li).forEach(function(a){
    var k=a.dataset.key;
    if(k.indexOf('mod:')===0){var b=$('#mt'+k.slice(4));if(b&&b.getAttribute('aria-selected')==='true')sub=a}
    else{var t=document.getElementById(k);if(t&&t.getBoundingClientRect().top<=line)sub=a}
  });
  if(cur!==li){
    $$('#snList > li').forEach(function(x){x.classList.toggle('on',x===li)});
    $$('#snList .sn-a').forEach(function(a){a.removeAttribute('aria-current')});
    $('.sn-a',li).setAttribute('aria-current','location');
    cur=li;
    if(!MOB.matches){var r=li.getBoundingClientRect(),sr=side.getBoundingClientRect();if(r.top<sr.top+80||r.bottom>sr.bottom-20)li.scrollIntoView({block:'nearest'})}
  }
  if(curSub!==sub){$$('#snList .sn-sub a').forEach(function(a){a.classList.toggle('on',a===sub)});curSub=sub}
  tbCur.textContent=n[2]+(sub?'｜'+sub.textContent:'');
  var max=document.documentElement.scrollHeight-window.innerHeight,p=max>0?Math.min(100,Math.round(window.scrollY/max*100)):0;
  $('#snFill').style.width=$('#tbFill').style.width=p+'%';
  $('#snBar').setAttribute('aria-valuenow',p);$('#snPct').textContent='已讀 '+p+'%';$('#tbPct').textContent=p+'%';
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(spy)}}
window.addEventListener('scroll',req,{passive:true});window.addEventListener('resize',req);
$('#modTabs').addEventListener('click',function(){setTimeout(spy,0)});
spy();

/* 桌機：收合成窄欄 */
var cbtn=$('#snCollapse');
function setCollapsed(c){
  html.classList.toggle('nav-collapsed',c);cbtn.setAttribute('aria-expanded',String(!c));
  cbtn.title=c?'展開導覽列':'收合導覽列';$('.sr',cbtn).textContent=cbtn.title;$('[aria-hidden]',cbtn).textContent=c?'»':'«';
  try{localStorage.setItem('aixgs-nav-collapsed',c?'1':'0')}catch(e){}
}
cbtn.addEventListener('click',function(){setCollapsed(!html.classList.contains('nav-collapsed'))});
try{if(localStorage.getItem('aixgs-nav-collapsed')==='1')setCollapsed(true)}catch(e){}

/* 手機：漢堡選單抽屜 */
var menu=$('#tbMenu'),bd=$('#snBackdrop');
function openMenu(){side.classList.add('open');bd.hidden=false;menu.setAttribute('aria-expanded','true');side.setAttribute('role','dialog');side.setAttribute('aria-modal','true');document.body.classList.add('menu-open');var a=$('.sn-a[aria-current]',side)||$('.sn-a',side);setTimeout(function(){a.focus()},50)}
function closeMenu(refocus){if(!side.classList.contains('open'))return;side.classList.remove('open');bd.hidden=true;menu.setAttribute('aria-expanded','false');side.setAttribute('role','navigation');side.removeAttribute('aria-modal');document.body.classList.remove('menu-open');if(refocus!==false)menu.focus()}
menu.addEventListener('click',openMenu);$('#snClose').addEventListener('click',function(){closeMenu()});bd.addEventListener('click',function(){closeMenu()});
document.addEventListener('keydown',function(e){
  if(!side.classList.contains('open'))return;
  if(e.key==='Escape'){e.preventDefault();closeMenu();return}
  if(e.key==='Tab'){var f=$$('a,button',side).filter(function(x){return x.offsetParent!==null});var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
});
MOB.addEventListener&&MOB.addEventListener('change',function(){if(!MOB.matches)closeMenu(false)});
})();
