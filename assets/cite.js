/* AIXGS 互動學習指南 v1.4 — 出處小標「原文重點」：桌機滑過／鍵盤聚焦顯示浮動卡片；手機點一下開啟底部抽屜（無外部腳本） */
(function(){
'use strict';
var CI=window.CITES||{docs:{},byCite:{},byPoint:{}};
/* 觸控裝置（手機、平板）：不能 hover、指標粗。混合裝置則看這次是用手指還是滑鼠點的 */
var TOUCH=window.matchMedia('(hover: none) and (pointer: coarse)'),lastPT='';
document.addEventListener('pointerdown',function(e){lastPT=e.pointerType},true);
function useSheet(){return lastPT==='touch'||(lastPT!=='mouse'&&lastPT!=='pen'&&TOUCH.matches)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function norm(s){return String(s||'').replace(/\s+/g,'')}
function fnv(s){var h=0x811c9dc5;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return ('0000000'+h.toString(16)).slice(-8)}
function textMinus(el){var c=el.cloneNode(true);[].forEach.call(c.querySelectorAll('.cite,.sr,script,style'),function(x){x.remove()});return norm(c.textContent)}
/* 每個出處小標的鍵：出處文字＋所在要點文字的雜湊（要點文字取最近、去掉出處後至少 6 個字的祖先） */
function ctxOf(chip){
  if(chip.dataset.cx)return norm(chip.dataset.cx).slice(0,300);
  var el=chip.parentElement;
  while(el&&el!==document.body){var t=textMinus(el);if(t.length>=6)return t.slice(0,300);el=el.parentElement}
  return '';
}
function citeText(chip){return chip.textContent.trim()}
function keyOf(chip){return citeText(chip)+'‖'+fnv(ctxOf(chip))}
function entryOf(chip){return CI.byPoint[keyOf(chip)]||CI.byCite[citeText(chip)]||null}

/* 把原文片段（保留原始 Markdown 字元）轉成顯示用 HTML：去掉 ** 與跳脫字元，<mark> 標出支持要點的關鍵句 */
function clean(s){return s.replace(/\*\*/g,'').replace(/(^|\n)[ \t]*(?:[*+\-–•][ \t]+|\d+\\?\.[ \t]+)/g,'$1').replace(/\n{2,}/g,'\n').replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g,'$1').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1')}
function renderQ(t,marks){
  var on=new Array(t.length).fill(false);
  (marks||[]).forEach(function(m){if(!m)return;var i=t.indexOf(m);while(i>=0){for(var k=i;k<i+m.length;k++)on[k]=true;i=t.indexOf(m,i+m.length)}});
  var out='',seg='',cur=on[0];
  function flush(){if(!seg)return;var h=esc(clean(seg)).replace(/\n/g,'<br>');out+=cur?'<mark>'+h+'</mark>':h;seg=''}
  for(var i=0;i<t.length;i++){if(on[i]!==cur){flush();cur=on[i]}seg+=t[i]}
  flush();return out;
}
var uid=0;
function build(chip,mode){
  var e=entryOf(chip),id='cpT'+(++uid);
  var h='<div class="cp-head"><p class="cp-k" id="'+id+'">原文重點</p><p class="cp-cite">'+esc(citeText(chip))+'</p>'+(mode==='sheet'?'<button type="button" class="cp-x" aria-label="關閉原文重點">×</button>':'')+'</div><div class="cp-body" tabindex="-1">';
  if(!e){h+='<p class="cp-none">這個出處還沒有整理原文重點。</p>'}
  else{
    if(e.note)h+='<p class="cp-note">'+esc(e.note)+'</p>';
    e.s.forEach(function(src,si){
      var d=CI.docs[src.d]||{t:src.d,u:''};
      h+='<section class="cp-src"><p class="cp-doc"><b>'+esc(d.t)+'</b>'+(src.loc?'<span class="cp-loc">｜'+esc(src.loc)+'</span>':'')+(d.date?'<span class="cp-loc">｜'+esc(d.date)+'</span>':'')+'</p>';
      if(src.weak)h+='<p class="cp-note">這個出處只標到章節，以下是該段原文開頭，供對照。</p>';
      src.q.forEach(function(q){h+='<blockquote>'+renderQ(q.t,q.m)+'</blockquote>'});
      if(src.ocr)h+='<p class="cp-ocr">OCR，可能有誤字</p>';
      if(d.u)h+='<button type="button" class="btn sec cp-go" data-si="'+si+'">看原文 →</button>';
      h+='</section>';
    });
  }
  h+='</div>';
  return {html:h,labelId:id,entry:e};
}
function goSource(chip,si,after){
  var e=entryOf(chip);if(!e)return;var src=e.s[si],d=CI.docs[src.d];if(!d||!d.u)return;
  after&&after();
  if(window.AIXGSDrawer&&window.AIXGSDrawer.openHref)window.AIXGSDrawer.openHref({href:d.u,title:d.t,ctx:'出處：'+citeText(chip)+(src.loc?'（'+src.loc+'）':''),trigger:chip});
  else window.open(d.u,'_blank','noopener');
}

/* ---------- 出處小標本身：可聚焦、可點 ---------- */
function prep(chip){
  if(chip.dataset.cp)return;chip.dataset.cp='1';
  if(chip.closest('button,a,#citePop,#citeSheet'))return;
  chip.setAttribute('tabindex','0');chip.setAttribute('role','button');
  chip.setAttribute('aria-haspopup','dialog');chip.setAttribute('aria-expanded','false');
  chip.setAttribute('aria-label','出處：'+citeText(chip)+'（看原文重點）');
}
function prepAll(root){[].forEach.call((root||document).querySelectorAll('.cite'),prep)}

/* ---------- 桌機：浮動卡片 ---------- */
var pop=document.createElement('div');pop.id='citePop';pop.className='cite-pop';pop.setAttribute('role','dialog');pop.setAttribute('aria-modal','false');pop.hidden=true;
var cur=null,showT=0,hideT=0,pinned=false;
function place(chip){
  var r=chip.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=window.innerHeight,m=8;
  var w=Math.min(420,vw-2*m);pop.style.width=w+'px';pop.style.maxHeight='';
  var below=vh-r.bottom-m-6,above=r.top-m-6;
  pop.style.left='0px';pop.style.top='0px';
  var ph=pop.offsetHeight,up=ph>below&&above>below;
  var avail=up?above:below;var mh=Math.max(160,Math.min(avail,vh*0.7));pop.style.maxHeight=mh+'px';
  ph=Math.min(ph,mh);
  var left=Math.max(m,Math.min(r.left,vw-w-m));
  var top=up?r.top-6-ph:r.bottom+6;top=Math.max(m,Math.min(top,vh-ph-m));
  pop.style.left=left+'px';pop.style.top=top+'px';pop.classList.toggle('up',up);
  pop.style.setProperty('--ax',Math.max(14,Math.min(w-14,r.left+Math.min(r.width/2,24)-left))+'px');
}
function show(chip,focusInside){
  clearTimeout(hideT);clearTimeout(showT);
  if(cur&&cur!==chip)cur.setAttribute('aria-expanded','false');
  cur=chip;var b=build(chip,'pop');pop.innerHTML=b.html;pop.setAttribute('aria-labelledby',b.labelId);
  pop.hidden=false;place(chip);chip.setAttribute('aria-expanded','true');chip.setAttribute('aria-controls','citePop');
  if(focusInside){var g=pop.querySelector('.cp-go')||pop.querySelector('.cp-body');g&&g.focus()}
}
function hide(returnFocus){
  clearTimeout(showT);clearTimeout(hideT);if(pop.hidden)return;
  pop.hidden=true;pinned=false;
  if(cur){cur.setAttribute('aria-expanded','false');if(returnFocus)cur.focus()}
  cur=null;
}
function hideSoon(){clearTimeout(hideT);if(pinned)return;hideT=setTimeout(function(){hide(false)},280)}
pop.addEventListener('pointerenter',function(){clearTimeout(hideT)});
pop.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')hideSoon()});
pop.addEventListener('click',function(e){var g=e.target.closest('.cp-go');if(g&&cur){var c=cur;goSource(c,+g.dataset.si,function(){hide(false)})}});
pop.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();hide(true)}});
pop.addEventListener('focusout',function(e){if(!pop.contains(e.relatedTarget)&&e.relatedTarget!==cur)hideSoon()});

document.addEventListener('pointerover',function(e){
  if(e.pointerType!=='mouse')return;var c=e.target.closest&&e.target.closest('.cite[role=button]');if(!c)return;
  if(c===cur){clearTimeout(hideT);return}
  if(pinned)return;
  clearTimeout(showT);showT=setTimeout(function(){show(c)},150);
});
document.addEventListener('pointerout',function(e){
  if(e.pointerType!=='mouse')return;var c=e.target.closest&&e.target.closest('.cite[role=button]');if(!c)return;
  if(e.relatedTarget&&c.contains(e.relatedTarget))return;
  clearTimeout(showT);if(c===cur)hideSoon();
});
document.addEventListener('focusin',function(e){
  var c=e.target.closest&&e.target.closest('.cite[role=button]');if(!c||TOUCH.matches)return;
  if(c!==cur){clearTimeout(showT);showT=setTimeout(function(){if(document.activeElement===c)show(c)},150)}
});
document.addEventListener('focusout',function(e){
  var c=e.target.closest&&e.target.closest('.cite[role=button]');if(!c||c!==cur)return;
  if(e.relatedTarget&&pop.contains(e.relatedTarget))return;hideSoon();
});
document.addEventListener('keydown',function(e){
  lastPT='';var c=e.target.closest&&e.target.closest('.cite[role=button]');
  if(e.key==='Escape'&&!pop.hidden){e.preventDefault();hide(true);return}
  if(!c)return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();if(TOUCH.matches)openSheet(c);else{pinned=true;show(c,true)}}
});
document.addEventListener('click',function(e){
  var c=e.target.closest&&e.target.closest('.cite[role=button]');
  if(c){e.preventDefault();if(useSheet()){hide(false);openSheet(c)}else{if(cur===c&&pinned){hide(false)}else{pinned=true;show(c)}}return}
  if(!pop.hidden&&!pop.contains(e.target))hide(false);
});
window.addEventListener('scroll',function(){if(!pop.hidden&&cur){if(pinned)place(cur);else hide(false)}},{passive:true});
window.addEventListener('resize',function(){if(!pop.hidden&&cur)place(cur)});

/* ---------- 手機：底部抽屜 ---------- */
var back=document.createElement('div');back.className='cite-backdrop';back.hidden=true;
var sheet=document.createElement('div');sheet.id='citeSheet';sheet.className='cite-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.hidden=true;
var sChip=null;
function openSheet(chip){
  hide(false);sChip=chip;var b=build(chip,'sheet');
  sheet.innerHTML='<div class="cs-grab" aria-hidden="true"><span></span></div>'+b.html;sheet.setAttribute('aria-labelledby',b.labelId);
  back.hidden=false;sheet.hidden=false;sheet.style.transform='';chip.setAttribute('aria-expanded','true');
  document.documentElement.classList.add('sheet-open');
  requestAnimationFrame(function(){back.classList.add('on');sheet.classList.add('on')});
  var x=sheet.querySelector('.cp-x');x&&x.focus();
}
function closeSheet(returnFocus){
  if(sheet.hidden)return;
  back.classList.remove('on');sheet.classList.remove('on');sheet.style.transform='';
  document.documentElement.classList.remove('sheet-open');
  setTimeout(function(){if(!sheet.classList.contains('on')){sheet.hidden=true;back.hidden=true}},220);
  if(sChip){sChip.setAttribute('aria-expanded','false');if(returnFocus!==false)sChip.focus({preventScroll:true})}
}
back.addEventListener('click',function(){closeSheet()});
sheet.addEventListener('click',function(e){
  if(e.target.closest('.cp-x')){closeSheet();return}
  var g=e.target.closest('.cp-go');if(g&&sChip){var c=sChip;goSource(c,+g.dataset.si,function(){closeSheet(false)})}
});
sheet.addEventListener('keydown',function(e){
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeSheet();return}
  if(e.key==='Tab'){var f=[].filter.call(sheet.querySelectorAll('button'),function(x){return x.offsetParent!==null});if(!f.length)return;
    var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
});
/* 往下滑關閉：從把手／標題列拖曳，或內容已捲到最上方時往下拉 */
var y0=null,dy=0;
sheet.addEventListener('touchstart',function(e){var body=sheet.querySelector('.cp-body');var inHead=!!e.target.closest('.cs-grab,.cp-head');if(inHead||(body&&body.scrollTop<=0)){y0=e.touches[0].clientY;dy=0;sheet.classList.add('drag')}},{passive:true});
sheet.addEventListener('touchmove',function(e){if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);if(dy>0)sheet.style.transform='translateY('+dy+'px)'},{passive:true});
sheet.addEventListener('touchend',function(){if(y0==null)return;sheet.classList.remove('drag');if(dy>80)closeSheet();else sheet.style.transform='';y0=null;dy=0});

/* ---------- 一次性提示（觸控裝置） ---------- */
function hint(){
  var k='aixgs.citeHint';try{if(localStorage.getItem(k))return}catch(e){}
  if(!TOUCH.matches)return;
  var t=document.createElement('div');t.className='cite-hint';t.setAttribute('role','status');
  t.innerHTML='<span class="cite-hint-i" aria-hidden="true">ⓘ</span><span class="cite-hint-t">點<b>出處</b>可看原文重點</span><button type="button" class="cite-hint-x" aria-label="知道了，關閉提示">知道了</button>';
  document.body.appendChild(t);requestAnimationFrame(function(){t.classList.add('on')});
  function done(){t.classList.remove('on');setTimeout(function(){t.remove()},300);try{localStorage.setItem(k,'1')}catch(e){}}
  t.querySelector('button').addEventListener('click',done);setTimeout(done,6000);
}

document.body.appendChild(pop);document.body.appendChild(back);document.body.appendChild(sheet);
prepAll();
new MutationObserver(function(ms){ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.nodeType!==1)return;if(n.classList.contains('cite'))prep(n);else prepAll(n)})})}).observe(document.body,{childList:true,subtree:true});
setTimeout(hint,1200);
window.AIXGSCite={keyOf:keyOf,citeText:citeText,ctxOf:ctxOf,entryOf:entryOf,show:show,hide:hide,openSheet:openSheet,closeSheet:closeSheet};
})();
