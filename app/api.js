const memory = new Map();
const pending = new Map();
export async function request(path, force = false) {
  const key = 'lantern-round5:' + path;
  let saved = memory.get(key);
  if (!saved) { try { saved = JSON.parse(sessionStorage.getItem(key)); } catch {} }
  if (!force && saved && Date.now() - saved.time < 60000) return saved.data;
  if (pending.has(key)) return pending.get(key);
  const work = (async () => {
    const response = await fetch('https://make.fun/api/' + path, { headers: saved?.etag ? { 'If-None-Match': saved.etag } : {} });
    if (!response.ok && response.status !== 304) throw new Error(`Live API returned ${response.status}. Please try again.`);
    const record = { data: response.status === 304 ? saved.data : await response.json(), etag: response.headers.get('etag') || saved?.etag, time: Date.now() };
    memory.set(key, record);
    try { sessionStorage.setItem(key, JSON.stringify(record)); } catch {}
    return record.data;
  })();
  pending.set(key, work);
  try { return await work; } finally { pending.delete(key); }
}
