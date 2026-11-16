export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const cash = value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits: Number(value) % 1 ? 2 : 0 }).format(Number(value) || 0);
const integerFormat = new Intl.NumberFormat('en-US');
export const count = value => integerFormat.format(Number(value || 0));
export const date = value => value ? new Date(value).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'UTC' }) + ' UTC' : 'Not announced';
export const pot = item => Number(item.potUsd ?? item.rewardAmount ?? 0);
export const hours = item => (Date.parse(item.deadline) - Date.now()) / 3600000;
export function clock(item) {
  const h = hours(item);
  return !Number.isFinite(h) ? 'Date pending' : h <= 0 ? 'Ended' : h < 1 ? 'Ends in <1h' : h < 24 ? `Ends in ${Math.ceil(h)}h` : `${Math.floor(h / 24)}d ${Math.floor(h % 24)}h left`;
}
export const bountyLink = slug => '#/bounty/' + encodeURIComponent(slug);
export const userLink = handle => '#/u/' + encodeURIComponent(handle);
export const fee = item => Number(item.entryFeeUsd) > 0 ? `<span class="chip paid">${cash(item.entryFeeUsd)} fee</span>` : '<span class="chip free">Free</span>';
export const timer = item => `<span class="chip ${hours(item) > 0 && hours(item) < 6 ? 'urgent' : ''}">${clock(item)}</span>`;
