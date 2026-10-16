import test from 'node:test';import assert from 'node:assert/strict';import {createHmac} from 'node:crypto';
import {validateTelegram} from '../auth.mjs';import {createState,cycle,offerPrice} from '../engine.mjs';
function signed(date=1000){const p=new URLSearchParams({auth_date:String(date),user:JSON.stringify({id:123,first_name:'Test'})});const check=[...p].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+'='+v).join('\n');const key=createHmac('sha256','WebAppData').update('test-token').digest();p.set('hash',createHmac('sha256',key).update(check).digest('hex'));return p.toString();}
test('valid Telegram HMAC',()=>assert.equal(validateTelegram(signed(),'test-token',1001).id,123));
test('tampering and stale auth rejected',()=>{assert.throws(()=>validateTelegram(signed().replace('123','456'),'test-token',1001));assert.throws(()=>validateTelegram(signed(),'test-token',1400));});
test('duplicate fields rejected',()=>assert.throws(()=>validateTelegram(signed()+'&auth_date=1000','test-token',1001)));
test('integer offer calculation',()=>{assert.equal(offerPrice(5e9,10),4.5e9);assert.throws(()=>offerPrice(1e9,100));});
test('simulation reserves balance, completes sales and never overspends',()=>{const s=createState();s.connected=true;s.running=true;for(let i=0;i<100;i++){cycle(s);assert.ok(s.available>=0);assert.equal(s.reserved,s.offers.reduce((a,o)=>a+o.price,0));}assert.ok(s.accepted.length);assert.ok(s.sales.length);});
test('paused engine does not trade',()=>{const s=createState();cycle(s);assert.equal(s.offers.length,0);});
