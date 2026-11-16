import {get} from './api.js';
import {money} from './format.js';
import {escape as E,cards,pager,rankTable,ranks,bountyView,profileView} from './views.js';
const main=document.querySelector('main'),stats=document.querySelector('#stats');
let token=0,repaint=null;
const board={q:'',sort:'pot',filter:'all',page:0};
const put=(id,html)=>{const n=document.getElementById(id);if(n&&n.innerHTML!==html)n.innerHTML=html};
const wirePager=(node,go)=>node.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>go(+b.dataset.page)));
function merge(dst,src){if(dst.isEqualNode(src))return;if(dst.nodeType===3)return void(dst.textContent=src.textContent);if(dst.nodeName!==src.nodeName)return void dst.replaceWith(src);for(const a of src.attributes)dst.setAttribute(a.name,a.value);const n=Math.max(dst.childNodes.length,src.childNodes.length);for(let i=0;i<n;i++){const x=dst.childNodes[i],y=src.childNodes[i];if(!y){x.remove();i--}else if(!x)dst.append(y.cloneNode(true));else merge(x,y)}}
const SHELL='<section class="hero"><h1>Find your next bounty<span class="green">.</span></h1></section><section><div class="controls"><label class="search"><input id="query" aria-label="Search bounties" placeholder="Search bounties…"></label><label class="sort"><select id="sort"><option value="pot">Biggest pot</option><option value="closing">Closing soon</option><option value="entries">Most entries</option></select></label></div><div class="filter-row"><div class="filters"><button data-filter="all">All</button><button data-filter="soon">Closing soon &lt;24h</button><button data-filter="fee">Entry fee</button><button data-filter="free">No fee</button></div><span id="count" class="muted" aria-live="polite"></span></div><div id="cards" class="grid"></div><div id="pages"></div></section>';
function renderBoard(data,first){
 const items=data.items||[];
 if(first){
  main.innerHTML=SHELL;
  const q=document.querySelector('#query');q.value=board.q;document.querySelector('#sort').value=board.sort;
  let wait;
  q.addEventListener('input',()=>{clearTimeout(wait);wait=setTimeout(()=>{board.q=q.value;board.page=0;paint()},150)});
  document.querySelector('#sort').addEventListener('change',e=>{board.sort=e.target.value;board.page=0;paint()});
  main.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{board.filter=b.dataset.filter;board.page=0;paint()}));
 }
 function paint(){
  const now=Date.now(),needle=board.q.toLowerCase();
  const list=items.filter(b=>String(b.title).toLowerCase().includes(needle)).filter(b=>{
   if(board.filter==='all')return true;
   if(board.filter==='fee')return Number(b.entryFeeUsd)>0;
   if(board.filter==='free')return !Number(b.entryFeeUsd);
   const ms=new Date(b.deadline)-now;return ms>0&&ms<86400000;
  });
  list.sort((a,b)=>board.sort==='pot'?Number(b.potUsd)-Number(a.potUsd):board.sort==='entries'?b.submissionCount-a.submissionCount:new Date(a.deadline)-new Date(b.deadline));
  board.page=Math.min(board.page,Math.max(0,Math.ceil(list.length/12)-1));
  put('cards',list.length?cards(list.slice(board.page*12,board.page*12+12)):'<div class="empty"><h2>No bounties match</h2><button id="clear">Clear search</button></div>');
  document.querySelector('#clear')?.addEventListener('click',()=>{board.q='';board.filter='all';document.querySelector('#query').value='';paint()});
  document.querySelector('#count').textContent=list.length+(list.length===1?' bounty':' bounties');
  main.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===board.filter)));
  put('pages',pager(board.page,list.length,12));
  wirePager(document.querySelector('#pages'),n=>{board.page=n;paint()});
  stats.innerHTML=`<span><b>${items.filter(b=>new Date(b.deadline)>now).length}</b> open</span><span><b class="money">${money(items.reduce((n,b)=>n+Number(b.potUsd||0),0))}</b> pot</span><span><b>${items.reduce((n,b)=>n+Number(b.submissionCount||0),0).toLocaleString()}</b> entries</span>`;
 }
 paint();
 repaint=next=>renderBoard(next,false);
}
function renderRanks(data,first){
 let page=0;
 const entries=data.entries||[],phase=data.phase||{};
 const label=phase.title||phase.label||'Rankings',status=phase.key||phase.status||'';
 if(first)main.innerHTML=`<a class="back" href="#/bounty/${E(data.competition?.slug)}">← Bounty overview</a><section class="hero"><h1>${E(data.competition?.title||'Leaderboard')}</h1><p class="summary">${E(label)}${status?' · '+E(status):''} · ${entries.length.toLocaleString()} entries</p></section><section class="panel" id="ranking"></section><div id="pages"></div>`;
 function paint(){put('ranking',rankTable(entries.slice(page*25,page*25+25),data.rank_key));put('pages',pager(page,entries.length,25));wirePager(document.querySelector('#pages'),n=>{page=n;paint()})}
 paint();
 repaint=next=>{data=next;const body=main.querySelector('tbody');if(body)body.innerHTML=ranks((next.entries||[]).slice(page*25,page*25+25),next.rank_key)};
}
async function route(refresh=false){
 window.__shotReady=false;
 const ticket=++token;
 const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean),slug=encodeURIComponent(decodeURIComponent(parts[1]||''));
 let path='/competitions?status=open&activity=times',view='board';
 if(parts[0]==='bounty'){path='/competitions/'+slug;view=parts[2]==='leaderboard'?'ranks':'bounty';if(view==='ranks')path+='/leaderboard'}
 else if(parts[0]==='u'){path='/profiles/'+slug;view='profile'}
 if(!refresh){repaint=null;main.innerHTML='<div class="loading" role="status" aria-live="polite">Warming the lantern…<div class="skeleton"></div></div>';stats.hidden=view!=='board'}
 try{
  const data=await get(path);
  if(ticket!==token)return;
  if(refresh&&repaint)repaint(data);
  else if(view==='board')renderBoard(data,true);
  else if(view==='ranks')renderRanks(data,true);
  else{const html=view==='bounty'?bountyView(data):profileView(data);if(refresh){const box=document.createElement('main');box.innerHTML=html;merge(main,box)}else main.innerHTML=html}
  main.querySelectorAll('.avatar img').forEach(i=>i.onerror=()=>i.remove());
  window.__shotReady=true;
 }catch(err){
  if(ticket!==token)return;
  main.innerHTML='<section class="error" role="alert"><h1>Could not load this view</h1><button id="retry">Retry</button></section>';
  document.querySelector('#retry').addEventListener('click',()=>route());
  window.__shotReady=true;
 }
}
addEventListener('hashchange',()=>route());
document.querySelector('#refresh').addEventListener('click',()=>route(true));
document.querySelector('#searchJump').addEventListener('click',()=>setTimeout(()=>document.querySelector('#query')?.focus(),300));
document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();main.focus()});
route();
