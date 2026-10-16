import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {validateTelegram} from './auth.mjs';
import {createState,cycle} from './engine.mjs';
const demo=process.env.DEMO_MODE==='true',sessions=new Map(),states=new Map();
const publicFiles={'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css']};
function reply(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function body(req){let b='';for await(const c of req){b+=c;if(b.length>16384)throw Error('Body too large');}return JSON.parse(b||'{}');}
setInterval(()=>{const now=Date.now();for(const [k,v] of sessions)if(v.expires<now)sessions.delete(k);for(const s of states.values())cycle(s);},5000).unref();
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','no-referrer');
 try{
 const path=new URL(req.url,'http://localhost').pathname;
 if(req.method==='GET'&&publicFiles[path]){const [f,type]=publicFiles[path];res.setHeader('Content-Type',type+'; charset=utf-8');res.end(await readFile(new URL('./public/'+f,import.meta.url)));return;}
 if(path==='/api/config'&&req.method==='GET')return reply(res,200,{demo});
 if(path==='/api/login'&&req.method==='POST'){
 const b=await body(req);let user;
 try{user=b.demo&&demo?{id:0,first_name:'Демо-профиль'}:validateTelegram(b.initData,process.env.BOT_TOKEN);}catch{return reply(res,401,{error:'Откройте приложение через Telegram. Данные входа недействительны или устарели.'});}
 const token=randomBytes(32).toString('hex');
 sessions.set(token,{user,expires:Date.now()+3600000});
 if(!states.has(user.id))states.set(user.id,createState());
 return reply(res,200,{token,user});
 }
 const session=sessions.get((req.headers.authorization||'').replace(/^Bearer /,''));
 if(!session||session.expires<Date.now())return reply(res,401,{error:'Требуется вход'});
 const s=states.get(session.user.id);
 if(path==='/api/state'&&req.method==='GET')return reply(res,200,s);
 if(path==='/api/action'&&req.method==='POST'){
 const b=await body(req);
 if(!demo)return reply(res,409,{error:'Реальный MRKT API ещё не подключён'});
 if(b.action==='connect')s.connected=true;
 else if(b.action==='start'){if(!s.connected)return reply(res,409,{error:'Сначала подключите демо-MRKT'});s.running=true;}
 else if(b.action==='stop')s.running=false;
 else if(b.action==='discount'){if(!Number.isInteger(b.value)||b.value<1||b.value>90)return reply(res,400,{error:'Скидка от 1 до 90%'});s.discount=b.value;}
 else return reply(res,400,{error:'Неизвестная команда'});
 return reply(res,200,s);
 }
 reply(res,404,{error:'Не найдено'});
 }catch{reply(res,400,{error:'Не удалось обработать запрос'});}
});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('GodMode server ready'));
