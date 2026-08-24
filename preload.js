const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('flux',{
 get:key=>ipcRenderer.invoke('store:get').then(s=>s[key]),set:(key,value)=>ipcRenderer.invoke('store:set',key,value),secretSet:(key,value)=>ipcRenderer.invoke('secret:set',key,value),secretGet:key=>ipcRenderer.invoke('secret:get',key),openExternal:url=>ipcRenderer.invoke('open-external',url),info:()=>ipcRenderer.invoke('app-info'),
 window:{close:()=>ipcRenderer.invoke('window:close'),minimize:()=>ipcRenderer.invoke('window:minimize'),maximize:()=>ipcRenderer.invoke('window:maximize')},
 updates:{check:()=>ipcRenderer.invoke('updates:check'),download:()=>ipcRenderer.invoke('updates:download'),install:()=>ipcRenderer.invoke('updates:install'),on:(event,callback)=>{const fn=(_,data)=>callback(data);ipcRenderer.on(`update:${event}`,fn);return()=>ipcRenderer.removeListener(`update:${event}`,fn)}},
 github:{me:()=>ipcRenderer.invoke('github:me'),repos:()=>ipcRenderer.invoke('github:listRepos'),tree:(owner,repo,ref)=>ipcRenderer.invoke('github:repoTree',owner,repo,ref),file:(owner,repo,path,ref)=>ipcRenderer.invoke('github:file',owner,repo,path,ref),commit:(owner,repo,path,content,message,sha,branch)=>ipcRenderer.invoke('github:commit',owner,repo,path,content,message,sha,branch)},
 cloudflare:{accounts:()=>ipcRenderer.invoke('cloudflare:accounts'),workers:()=>ipcRenderer.invoke('cloudflare:workers')}
});
