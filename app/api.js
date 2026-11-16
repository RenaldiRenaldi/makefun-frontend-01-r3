const store = new Map();
const base = 'https://make.fun/api';

export async function get(path) {
  const url = base + path;
  let hit = store.get(url);
  if (!hit) {
    try { hit = JSON.parse(sessionStorage.getItem(url)); } catch { hit = null; }
  }
  const res = await fetch(url, { headers: hit?.etag ? { 'If-None-Match': hit.etag } : {} });
  if (res.status === 304 && hit) return hit.data;
  if (!res.ok) throw new Error('make.fun answered ' + res.status);
  const data = await res.json();
  const entry = { data, etag: res.headers.get('ETag') };
  store.set(url, entry);
  try { sessionStorage.setItem(url, JSON.stringify(entry)); } catch {}
  return data;
}
