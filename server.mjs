import http from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
import {join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./public/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.mp3':'audio/mpeg','.webp':'image/webp'};
const assets=new Map();
async function load(dir=''){
 for(const e of await readdir(join(root,dir),{withFileTypes:true})){
  const name=dir+e.name;
  if(e.isDirectory())await load(name+'/');
  else if(e.isFile()&&types[extname(name)])assets.set('/'+name,{type:types[extname(name)],data:await readFile(join(root,name))});
 }
}
await load();assets.set('/',assets.get('/index.html'));
const server=http.createServer((req,res)=>{
 const path=(req.url||'/').split('?')[0];
 if(!['HEAD','GET'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end()}
 if(path==='/healthz'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end(req.method==='HEAD'?undefined:'ok')}
 const file=assets.get(path);
 if(!file){res.writeHead(404);return res.end()}
 res.writeHead(200,{'Content-Type':file.type,'Content-Length':file.data.length,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
 res.end(req.method==='HEAD'?undefined:file.data);
});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('Royal Road listening on',server.address()));
for(const sig of ['SIGTERM','SIGINT'])process.on(sig,()=>server.close());
