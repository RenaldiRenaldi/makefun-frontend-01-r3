import { request } from './api.js';
import { escape as e, pot, hours, cash, count } from './format.js';
import { boardShell, cards, pager, bounty, leaderboard, rankTable, profile, solutionTable } from './views.js';
const root = document.querySelector('main');
const state = { query:'', sort:'pot', filter:0, page:0, rows:[] };
let routeVersion = 0;
let redraw;
let debounce;
function updateBoard() {
  const selected = state.rows.filter(item => item.title.toLowerCase().includes(state.query.toLowerCase()) && (state.filter === 0 || state.filter === 1 && hours(item) > 0 && hours(item) < 24 || state.filter === 2 && Number(item.entryFeeUsd) > 0 || state.filter === 3 && !Number(item.entryFeeUsd)));
  selected.sort((a,b) => state.sort === 'pot' ? pot(b) - pot(a) : state.sort === 'entries' ? b.submissionCount - a.submissionCount : (hours(a) > 0 ? hours(a) : Infinity) - (hours(b) > 0 ? hours(b) : Infinity));
  document.querySelector('#cards').innerHTML = cards(selected.slice(state.page * 12, state.page * 12 + 12));
  document.querySelector('#results').textContent = `${count(selected.length)} bounties · live reward pools`;
  document.querySelector('#pages').innerHTML = pager(state.page, selected.length, 12);
  root.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(+button.dataset.filter === state.filter)));
}
async function route(force = false) {
  const current = ++routeVersion;
  window.__shotReady = false;
  state.page = 0;
  clearTimeout(debounce);
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === (location.hash || '#/')));
  root.innerHTML = '<div class="panel skeleton" role="status">Loading live make.fun data…</div>';
  try {
    const parts = (location.hash.slice(1) || '/').split('/').filter(Boolean).map(decodeURIComponent);
    const path = parts[0] === 'u' ? 'profiles/' + encodeURIComponent(parts[1]) : parts[0] === 'bounty' ? 'competitions/' + encodeURIComponent(parts[1]) + (parts[2] === 'leaderboard' ? '/leaderboard' : '') : 'competitions?status=open&activity=times';
    const data = await request(path, force);
    if (current !== routeVersion) return;
    if (parts[0] === 'u') {
      root.innerHTML = profile(data);
      redraw = () => { document.querySelector('#solutions').innerHTML = solutionTable((data.solutions || []).slice(state.page * 25, state.page * 25 + 25)); document.querySelector('#pages').innerHTML = pager(state.page, (data.solutions || []).length,25); };
    } else if (parts[2] === 'leaderboard') {
      root.innerHTML = leaderboard(data);
      redraw = () => { document.querySelector('#ranking').innerHTML = rankTable(data.entries.slice(state.page * 25,state.page * 25 + 25)); document.querySelector('#pages').innerHTML = pager(state.page,data.entries.length,25); };
    } else if (parts[0] === 'bounty') {
      const ranks = await request(path + '/leaderboard', force);
      if (current !== routeVersion) return;
      data.preview = ranks.entries.slice(0,5);
      root.innerHTML = bounty(data);
      redraw = () => {};
    } else {
      state.rows = data.items || data;
      root.innerHTML = boardShell();
      document.querySelector('#search').value = state.query;
      document.querySelector('#sort').value = state.sort;
      document.querySelector('#stats').textContent = `${state.rows.filter(x => hours(x) > 0).length} open bounties · ${cash(state.rows.reduce((sum,x) => sum + pot(x),0))} total pots · ${count(state.rows.reduce((sum,x) => sum + Number(x.submissionCount || 0),0))} entries`;
      redraw = updateBoard;
    }
    redraw();
    window.__shotReady = true;
  } catch (error) {
    if (current !== routeVersion) return;
    root.innerHTML = `<section class="panel" role="alert"><h1>Unable to load this view</h1><p>${e(error.message)}</p><button id="retry">Retry</button></section>`;
    window.__shotReady = true;
  }
}
root.addEventListener('input', event => {
  if (event.target.id !== 'search') return;
  clearTimeout(debounce);
  debounce = setTimeout(() => { state.query = event.target.value; state.page = 0; updateBoard(); },150);
});
root.addEventListener('change', event => { if (event.target.id === 'sort') { state.sort = event.target.value; state.page = 0; updateBoard(); } });
root.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.id === 'retry') return route(true);
  if (button.dataset.step) { state.page += Number(button.dataset.step); redraw(); }
  if (button.dataset.filter !== undefined) { state.filter = +button.dataset.filter; state.page = 0; updateBoard(); }
  if (button.id === 'clear') { state.query = ''; state.filter = 0; state.page = 0; document.querySelector('#search').value = ''; updateBoard(); }
});
document.querySelector('#search-link').addEventListener('click', () => setTimeout(() => document.querySelector('#search')?.focus(),0));
window.addEventListener('hashchange', () => route());
route();
