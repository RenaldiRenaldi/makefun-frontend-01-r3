const cache=new Map();
export async function get(path){
  const url='https://make.fun/api'+path;
  let saved=cache.get(url);
  if(!saved)try{saved=JSON.parse(sessionStorage.getItem(url))}catch{}
  if(saved&&Date.now()-saved.time<60000)return saved.data;
  const response=await fetch(url,{cache:'no-store',headers:saved?.etag?{'If-None-Match':saved.etag}:{}});
  if(response.status===304&&saved){saved.time=Date.now();cache.set(url,saved);return saved.data}
  if(!response.ok)throw Error('API '+response.status);
  const data=await response.json(),entry={data,etag:response.headers.get('ETag'),time:Date.now()};
  cache.set(url,entry);
  try{sessionStorage.setItem(url,JSON.stringify(entry))}catch{}
  return data;
}
