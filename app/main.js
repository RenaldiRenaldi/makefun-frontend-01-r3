import { get } from './api.js';
import { esc, money } from './format.js';
import { cards, bounty, rankHeading, rankTable, profile, pagination } from './views.js';
const content=document.querySelector('main'), totals=document.querySelector('#stats');
let generation=0, current=null, page=0, query='', sort='pot', filter='all';
function reconcile(target,source) {
  if(target.isEqualNode(source))return;
  if(target.nodeType!==source.nodeType||target.nodeName!==source.nodeName){target.replaceWith(source.cloneNode(true));return}
  if(target.nodeType===3){target.nodeValue=source.nodeValue;return}
  for(const a of [...target.attributes])if(!source.hasAttribute(a.name))target.removeAttribute(a.name);
  for(const a of source.attributes)if(target.getAttribute(a.name)!==a.value)target.setAttribute(a.name,a.value);
  const next=[...source.childNodes], old=[...target.childNodes];
  next.forEach((node,i)=>old[i]?reconcile(old[i],node):target.append(node.cloneNode(true)));
  old.slice(next.length).forEach(node=>node.remove());
}
function put(selector,html){const element=content.querySelector(selector);if(!element)return;const next=element.cloneNode(false);next.innerHTML=html;reconcile(element,next)}
function paged(total,size,paint){put('#pages',pagination(page,total,size));content.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{page+=Number(b.dataset.step);paint();content.focus()})}
function boardPaint(){
  const items=current.items||[], now=Date.now();
  const list=items.filter(b=>String(b.title).toLowerCase().includes(query.toLowerCase())).filter(b=>filter==='all'||filter==='fee'&&+b.entryFeeUsd>0||filter==='free'&&!+b.entryFeeUsd||filter==='soon'&&new Date(b.deadline)>now&&new Date(b.deadline)-now<864e5);
  list.sort((a,b)=>sort==='pot'?+b.potUsd-+a.potUsd:sort==='entries'?b.submissionCount-a.submissionCount:new Date(a.deadline)-new Date(b.deadline));
  page=Math.min(page,Math.max(0,Math.ceil(list.length/12)-1));
  put('#cards',list.length?cards(list.slice(page*12,page*12+12)):'<div class="panel empty">No bounties match — <button id="clear">clear search</button></div>');
  content.querySelector('#clear')?.addEventListener('click',()=>{query='';filter='all';content.querySelector('#query').value='';boardPaint()});
  content.querySelector('#count').textContent=list.length+' bounties';
  content.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
  totals.textContent='';totals.innerHTML=`${items.filter(b=>new Date(b.deadline)>now).length} open bounties · <b class="money">${money(items.reduce((n,b)=>n+Number(b.potUsd||0),0))}</b> total pots · ${items.reduce((n,b)=>n+Number(b.submissionCount||0),0).toLocaleString()} entries`;
  paged(list.length,12,boardPaint);
}
function boardShell(){
  content.innerHTML='<section class="hero"><p class="eyebrow">MAKE SOMETHING. MAKE IT COUNT.</p><h1>Find your next bounty.</h1><p class="muted">Live pots, clear deadlines, and a place for your best work.</p></section><div class="controls"><input id="query" type="search" placeholder="Search bounties…" aria-label="Search bounty titles"><select id="sort" aria-label="Sort bounties"><option value="pot">Biggest pot</option><option value="deadline">Closing soon</option><option value="entries">Most entries</option></select></div><div class="filters"><button data-filter="all">All</button><button data-filter="soon">Closing soon &lt;24h</button><button data-filter="fee">Entry fee</button><button data-filter="free">No fee</button><span id="count" aria-live="polite"></span></div><div id="cards" class="grid"></div><div id="pages"></div>';
  const input=content.querySelector('#query');input.value=query;let timer;
  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{query=input.value;page=0;boardPaint()},150)});
  const select=content.querySelector('#sort');select.value=sort;select.addEventListener('change',()=>{sort=select.value;page=0;boardPaint()});
  content.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;page=0;boardPaint()}));
}
function rankPaint(){const entries=current.entries||[];page=Math.min(page,Math.max(0,Math.ceil(entries.length/25)-1));put('#rank-head',rankHeading(current));put('#ranking',rankTable(entries.slice(page*25,page*25+25),current.rank_key));paged(entries.length,25,rankPaint)}
async function route(refresh=false){
  window.__shotReady=false;const ticket=++generation;
  try {
    const pieces=location.hash.slice(1).split('/').filter(Boolean), id=encodeURIComponent(decodeURIComponent(pieces[1]||''));
    const kind=pieces[0]==='u'?'profile':pieces[0]==='bounty'?(pieces[2]==='leaderboard'?'ranks':'bounty'):'board';
    const path=kind==='board'?'/competitions?status=open&activity=times':kind==='profile'?'/profiles/'+id:'/competitions/'+id+(kind==='ranks'?'/leaderboard':'');
    totals.hidden=kind!=='board';if(!refresh){page=0;content.innerHTML='<div role="status" aria-live="polite">Warming the lantern…<div class="skeleton"></div><div class="skeleton"></div></div>'}
    const data=await get(path);if(ticket!==generation)return;current=data;
    if(kind==='board'){if(!refresh||!content.querySelector('#cards'))boardShell();boardPaint()}
    else if(kind==='ranks'){if(!refresh||!content.querySelector('#ranking'))content.innerHTML='<div id="rank-head"></div><section id="ranking" class="panel"></section><div id="pages"></div>';rankPaint()}
    else {const html=kind==='profile'?profile(data):bounty(data);if(refresh){const next=content.cloneNode(false);next.innerHTML=html;reconcile(content,next)}else content.innerHTML=html}
    content.querySelectorAll('.avatar img').forEach(img=>img.addEventListener('error',()=>img.remove(),{once:true}));
    window.__shotReady=true;
  } catch(error) {
    if(ticket!==generation)return;
    content.innerHTML=`<section class="panel error" role="alert"><h1>Could not load this view</h1><p>${esc(error.message)}</p><button id="retry">Retry</button></section>`;
    content.querySelector('#retry').addEventListener('click',()=>route());
    window.__shotReady = true;
  }
}
addEventListener('hashchange',()=>route());
document.querySelector('#refresh').addEventListener('click',()=>route(true));
document.querySelector('#searchJump').addEventListener('click',()=>{location.hash='#/';setTimeout(()=>content.querySelector('#query')?.focus(),200)});
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();content.focus()});
route();
