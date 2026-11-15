const memory=new Map();
export async function get(path){
 const url='https://make.fun/api'+path;
 let cached=memory.get(url);
 if(!cached)try{cached=JSON.parse(sessionStorage.getItem(url))}catch{}
 const headers=cached?.etag?{'If-None-Match':cached.etag}:{};
 const response=await fetch(url,{headers});
 if(response.status===304&&cached)return cached.data;
 if(!response.ok)throw new Error('Request failed: '+response.status);
 const data=await response.json(),entry={data,etag:response.headers.get('ETag')};
 memory.set(url,entry);
 try{sessionStorage.setItem(url,JSON.stringify(entry))}catch{}
 return data;
}
