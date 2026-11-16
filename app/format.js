export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money=v=>'$'+Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
export const date=v=>v?new Date(v).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
export const link=(kind,value)=>'#/'+kind+'/'+encodeURIComponent(value||'');
export function left(v){const m=new Date(v)-Date.now();if(!Number.isFinite(m)||m<=0)return['Ended','ended'];const h=Math.floor(m/36e5),d=Math.floor(h/24);return[d?d+'d '+h%24+'h':h+'h '+Math.floor(m/6e4)%60+'m',''+(m<216e5?'soon':'open')]}
