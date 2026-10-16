import {createHmac,timingSafeEqual} from 'node:crypto';
export function validateTelegram(raw,token,now=Math.floor(Date.now()/1000)){
 if(!token||typeof raw!=='string') throw Error('Telegram auth unavailable');
 const p=new URLSearchParams(raw);
 if(new Set(p.keys()).size!==[...p.keys()].length) throw Error('Duplicate fields');
 const hash=p.get('hash');p.delete('hash');
 if(!hash||!/^[a-f0-9]{64}$/i.test(hash)) throw Error('Invalid hash');
 const date=Number(p.get('auth_date'));
 if(!Number.isInteger(date)||now-date>300||date>now+30) throw Error('Expired auth');
 const check=[...p].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('\n');
 const key=createHmac('sha256','WebAppData').update(token).digest();
 const expected=createHmac('sha256',key).update(check).digest();
 if(!timingSafeEqual(expected,Buffer.from(hash,'hex'))) throw Error('Invalid signature');
 const user=JSON.parse(p.get('user')||'null');
 if(!user||!Number.isSafeInteger(user.id)||user.id<=0) throw Error('Invalid user');
 return {id:user.id,first_name:String(user.first_name||''),username:String(user.username||'')};
}
