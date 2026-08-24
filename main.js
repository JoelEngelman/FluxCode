const { app, BrowserWindow, ipcMain, shell, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
let win;
const dataFile=()=>path.join(app.getPath('userData'),'fluxcode.json');
function readStore(){try{return JSON.parse(fs.readFileSync(dataFile(),'utf8'));}catch{return {};}}
function writeStore(data){fs.mkdirSync(path.dirname(dataFile()),{recursive:true});fs.writeFileSync(dataFile(),JSON.stringify(data,null,2));}
function createWindow(){win=new BrowserWindow({width:1500,height:950,minWidth:1050,minHeight:700,backgroundColor:'#07080c',titleBarStyle:process.platform==='darwin'?'hiddenInset':'hidden',titleBarOverlay:process.platform==='win32'?{color:'#090a0f',symbolColor:'#fff',height:38}:false,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});win.loadFile('index.html');}
app.whenReady().then(createWindow);app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow()});
ipcMain.handle('store:get',()=>readStore());
ipcMain.handle('store:set',(_,key,value)=>{const s=readStore();s[key]=value;writeStore(s);return true});
ipcMain.handle('secret:set',(_,key,value)=>{const s=readStore();s.secrets||={};s.secrets[key]=safeStorage.isEncryptionAvailable()?safeStorage.encryptString(value).toString('base64'):value;writeStore(s);return true});
ipcMain.handle('secret:get',(_,key)=>{const raw=readStore().secrets?.[key];if(!raw)return null;try{return safeStorage.isEncryptionAvailable()?safeStorage.decryptString(Buffer.from(raw,'base64')):raw}catch{return null}});
ipcMain.handle('open-external',(_,url)=>shell.openExternal(url));
ipcMain.handle('app-info',()=>({version:app.getVersion(),platform:process.platform}));
async function api(url,options={}){const r=await fetch(url,options);const text=await r.text();let data;try{data=JSON.parse(text)}catch{data=text}if(!r.ok)throw new Error(data?.message||`Request failed (${r.status})`);return data}
ipcMain.handle('github:me',async()=>{const token=await ipcMain.emit;const t=readStore().secrets?.githubToken;return api('https://api.github.com/user',{headers:{Authorization:`Bearer ${decrypt(t)}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'FluxCode'}})});
function decrypt(raw){if(!raw)return '';try{return safeStorage.isEncryptionAvailable()?safeStorage.decryptString(Buffer.from(raw,'base64')):raw}catch{return ''}}
async function gh(path,options={}){const token=decrypt(readStore().secrets?.githubToken);if(!token)throw new Error('Connect GitHub first.');return api('https://api.github.com'+path,{...options,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'FluxCode',Authorization:`Bearer ${token}`,...(options.headers||{})}})}
ipcMain.handle('github:listRepos',()=>gh('/user/repos?sort=updated&per_page=50'));
ipcMain.handle('github:repoTree',(_,owner,repo,ref='main')=>gh(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(ref)}?recursive=1`));
ipcMain.handle('github:file',(_,owner,repo,path,ref='main')=>gh(`/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(ref)}`));
ipcMain.handle('github:commit',async(_,owner,repo,path,content,message,sha,branch='main')=>gh(`/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,content:Buffer.from(content).toString('base64'),sha,branch})}));
ipcMain.handle('cloudflare:accounts',()=>{const token=decrypt(readStore().secrets?.cloudflareToken);if(!token)throw new Error('Connect Cloudflare first.');return api('https://api.cloudflare.com/client/v4/accounts',{headers:{Authorization:`Bearer ${token}`}})});
ipcMain.handle('cloudflare:workers',async()=>{const token=decrypt(readStore().secrets?.cloudflareToken);const id=readStore().cloudflareAccount;if(!token||!id)throw new Error('Connect Cloudflare and set an Account ID first.');return api(`https://api.cloudflare.com/client/v4/accounts/${id}/workers/scripts`,{headers:{Authorization:`Bearer ${token}`}})});
