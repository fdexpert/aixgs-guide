/* AIXGS 互動學習指南 v1.4 — 右側面板：外部連結與課程圖片在頁內開啟（無外部腳本） */
(function(){
'use strict';
var D=document.getElementById('drawer'),body=document.getElementById('drBody'),hint=document.getElementById('drHint'),
    tEl=document.getElementById('drTitle'),dEl=document.getElementById('drDomain'),nEl=document.getElementById('drNew'),
    handle=document.getElementById('drHandle'),lastFocus=null;
var MQ=window.matchMedia('(max-width: 760px)');

/* tiny.cc 短網址 → 實際目的地（2026-11-01 以 curl 解析） */
var SHORT={
  'tiny.cc/aixgs2026':'https://docs.google.com/document/d/1UDOadcAU-2M0McRO06dbI3aCFXXaKqnsARuC2M-HnkE/edit',
  'tiny.cc/coursequestions2026':'https://docs.google.com/presentation/d/1rJpFdey469dOvK0zxKHrKxcgFdA5RTvnMF1WrBQbmsI/edit',
  'tiny.cc/wisereading':'https://docs.google.com/spreadsheets/d/1YWjkEwELYHVSAscBhL03GzKv7xVHQd-kg2ba2gvKwjc/edit',
  'tiny.cc/youcanaskme2026':'https://docs.google.com/forms/d/e/1FAIpQLSfxEscd5D1KFhWbxe4B8iJNYRC_wtCoyc172aFQOH9l0_4P4w/viewform'
};
/* 確認會拒絕嵌入的網站（2026-11-01 以 curl 檢查 X-Frame-Options / CSP frame-ancestors） */
var NOFRAME=['facebook.com','fb.com','management.ntu.edu.tw','notion.com','notion.so','notion.site','instagram.com','linkedin.com'];

function hostOf(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return ''}}
function blocked(h){return NOFRAME.some(function(d){return h===d||h.slice(-d.length-1)==='.'+d})}

/* 把 Google 文件 / 雲端硬碟 / YouTube 連結改寫成可嵌入的網址 */
function embed(u){
  var x;try{x=new URL(u)}catch(e){return u}
  var key=x.hostname.replace(/^www\./,'')+x.pathname.replace(/\/$/,'');
  if(SHORT[key]){u=SHORT[key];x=new URL(u)}
  var h=x.hostname,p=x.pathname,m;
  if(h==='docs.google.com'){
    if((m=p.match(/^\/document\/(?:u\/\d+\/)?d\/([\w-]+)/)))return 'https://docs.google.com/document/d/'+m[1]+'/preview';
    if((m=p.match(/^\/spreadsheets\/(?:u\/\d+\/)?d\/([\w-]+)/)))return 'https://docs.google.com/spreadsheets/d/'+m[1]+'/preview';
    if((m=p.match(/^\/presentation\/(?:u\/\d+\/)?d\/([\w-]+)/)))return 'https://docs.google.com/presentation/d/'+m[1]+'/embed';
    if((m=p.match(/^\/forms\/(?:u\/\d+\/)?d\/(e\/)?([\w-]+)/)))return 'https://docs.google.com/forms/d/'+(m[1]||'')+m[2]+'/viewform?embedded=true';
  }
  if(h==='drive.google.com'){
    if((m=p.match(/\/file\/(?:u\/\d+\/)?d\/([\w-]+)/)))return 'https://drive.google.com/file/d/'+m[1]+'/preview';
    if((m=p.match(/\/folders\/([\w-]+)/)))return 'https://drive.google.com/embeddedfolderview?id='+m[1]+'#list';
    if(x.searchParams.get('id'))return 'https://drive.google.com/file/d/'+x.searchParams.get('id')+'/preview';
  }
  if(h==='youtu.be')return 'https://www.youtube.com/embed/'+p.slice(1);
  if(/(^|\.)youtube\.com$/.test(h)){
    if(p==='/watch'&&x.searchParams.get('v'))return 'https://www.youtube.com/embed/'+x.searchParams.get('v')+(x.searchParams.get('list')?'?list='+x.searchParams.get('list'):'');
    if(p==='/playlist'&&x.searchParams.get('list'))return 'https://www.youtube.com/embed/videoseries?list='+x.searchParams.get('list');
  }
  return u;
}
function resolve(u){try{var x=new URL(u),k=x.hostname.replace(/^www\./,'')+x.pathname.replace(/\/$/,'');return SHORT[k]||u}catch(e){return u}}
function isGoogle(u){var h=hostOf(u);return h==='docs.google.com'||h==='drive.google.com'}

function contextOf(a){
  if(a.dataset.ctx)return a.dataset.ctx;
  var sec=a.closest('section'),h=sec&&sec.querySelector('h2');
  return h?'出現在「'+h.textContent.trim()+'」段落':'';
}
function setWidth(v){v=Math.max(28,Math.min(60,v));document.documentElement.style.setProperty('--dw',v+'vw');handle.setAttribute('aria-valuenow',Math.round(v));try{localStorage.setItem('aixgs-drawer-w',v)}catch(e){}}
try{var sw=parseFloat(localStorage.getItem('aixgs-drawer-w'));if(sw)setWidth(sw)}catch(e){}

function open(o){
  lastFocus=o.trigger||document.activeElement;
  tEl.textContent=o.title;dEl.textContent=o.domain;nEl.href=o.href;
  hint.hidden=!o.hint;hint.textContent=o.hint||'';
  body.innerHTML='';body.appendChild(o.node);
  D.hidden=false;D.setAttribute('aria-modal',MQ.matches?'true':'false');
  requestAnimationFrame(function(){D.classList.add('open');document.body.classList.add('drawer-open')});
  (MQ.matches?document.getElementById('drBack'):document.getElementById('drClose')).focus();
}
function close(){
  if(D.hidden)return;
  D.classList.remove('open');document.body.classList.remove('drawer-open');
  setTimeout(function(){if(!D.classList.contains('open')){D.hidden=true;body.innerHTML=''}},220);
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
function el(tag,attrs,text){var e=document.createElement(tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(text)e.textContent=text;return e}

function openLink(a){
  var href=resolve(a.href),title=(a.textContent||href).replace(/\s*↗\s*$/,'').trim(),src=embed(href),h=hostOf(src),node,hintText='';
  if(blocked(h)){
    node=el('div',{'class':'dr-card'});
    node.appendChild(el('p',{'class':'dr-k'},'這個網站不允許在其他頁面內嵌顯示'));
    node.appendChild(el('h3',{},title));
    node.appendChild(el('p',{'class':'dr-domain'},h));
    var c=contextOf(a);if(c)node.appendChild(el('p',{'class':'dr-ctx'},c));
    var b=el('a',{'class':'btn dr-big','href':href,'target':'_blank','rel':'noopener noreferrer'},'在新分頁開啟 ↗');node.appendChild(b);
    node.appendChild(el('p',{'class':'dr-note'},'網站回應標頭含 X-Frame-Options 或 CSP frame-ancestors，瀏覽器會擋下內嵌，所以改用新分頁。'));
  }else{
    node=el('iframe',{'class':'dr-frame','src':src,'title':title+'（嵌入內容）','referrerpolicy':'no-referrer-when-downgrade','allow':'fullscreen; clipboard-write; encrypted-media; picture-in-picture','allowfullscreen':''});
    hintText=isGoogle(src)?'Google 文件以預覽模式顯示；需要在這個瀏覽器登入有權限的 Google 帳號。要編輯或留言請用新分頁開啟。':'若內容沒有顯示，此網站可能禁止嵌入，請改用新分頁開啟';
  }
  open({title:title,domain:hostOf(a.href)+(h!==hostOf(a.href)?' → '+h:''),href:href,hint:hintText,node:node,trigger:a});
}
function openImg(z){
  var img=z.querySelector('img'),fig=el('figure',{'class':'dr-img'});
  fig.appendChild(el('img',{'src':z.dataset.full,'alt':img?img.alt:'課程圖片'}));
  fig.appendChild(el('figcaption',{'class':'srcnote'},'圖表來源：林益全老師課程航線'));
  open({title:(img&&img.alt||'課程圖片').split('：')[0],domain:'課程圖片（本機檔案）',href:z.dataset.full,hint:'',node:fig,trigger:z});
}

document.addEventListener('click',function(e){
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return; /* 修飾鍵：照瀏覽器原本行為 */
  var z=e.target.closest&&e.target.closest('.zoom');
  if(z&&!D.contains(z)){e.preventDefault();openImg(z);return}
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a||D.contains(a))return;
  if(!/^https?:/i.test(a.href))return;            /* mailto:、頁內錨點等不攔截 */
  if(a.origin===location.origin&&a.hash&&a.pathname===location.pathname)return;
  e.preventDefault();openLink(a);
});
document.getElementById('drClose').addEventListener('click',close);
document.getElementById('drBack').addEventListener('click',close);
document.addEventListener('keydown',function(e){
  if(D.hidden)return;
  if(e.key==='Escape'){e.preventDefault();close();return}
  if(e.key==='Tab'&&D.contains(document.activeElement)){ /* 焦點在面板內時循環；桌機仍可用滑鼠操作主頁 */
    var f=[].filter.call(D.querySelectorAll('button,a[href],iframe,[tabindex="0"]'),function(x){return x.offsetParent!==null});
    if(!f.length)return;var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
/* 拖曳調整寬度 */
handle.addEventListener('pointerdown',function(e){
  e.preventDefault();handle.setPointerCapture(e.pointerId);D.classList.add('dragging');
  function mv(ev){setWidth((window.innerWidth-ev.clientX)/window.innerWidth*100)}
  function up(){D.classList.remove('dragging');handle.removeEventListener('pointermove',mv);handle.removeEventListener('pointerup',up)}
  handle.addEventListener('pointermove',mv);handle.addEventListener('pointerup',up);
});
handle.addEventListener('keydown',function(e){
  var v=parseFloat(handle.getAttribute('aria-valuenow'));
  if(e.key==='ArrowLeft'){e.preventDefault();setWidth(v+3)}else if(e.key==='ArrowRight'){e.preventDefault();setWidth(v-3)}
});
MQ.addEventListener&&MQ.addEventListener('change',function(){if(!D.hidden)D.setAttribute('aria-modal',MQ.matches?'true':'false')});
/* v1.4：出處卡片的「看原文」按鈕也用同一個面板 */
function openHref(o){var a=document.createElement('a');a.href=o.href;a.textContent=o.title||o.href;if(o.ctx)a.dataset.ctx=o.ctx;openLink(a);if(o.trigger)lastFocus=o.trigger}
window.AIXGSDrawer={embed:embed,blocked:blocked,openHref:openHref};
})();
