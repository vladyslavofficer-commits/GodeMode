const $=s=>document.querySelector(s),tg=window.Telegram?.WebApp;tg?.ready();tg?.expand();
let token='',state,tab='inventory',timer;
const tabs={inventory:'Хранилище',listings:'На продаже',offers:'Активные офферы',accepted:'Принятые офферы',sales:'Проданные'};
const money=n=>(n/1e9).toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:3});
async function api(path,body){const r=await fetch('/api/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},...(body?{body:JSON.stringify(body)}:{})});const v=await r.json();if(!r.ok)throw Error(v.error);return v;}
async function login(demo){$('#login-error').textContent='';$('#login').hidden=true;$('#loading').hidden=false;
try{const r=await api('login',demo?{demo:true}:{initData:tg?.initData||''});token=r.token;$('#user').textContent=r.user.first_name;state=await api('state');$('#dashboard').hidden=false;render();timer=setInterval(refresh,3000);}
catch(e){$('#login').hidden=false;$('#login-error').textContent=e.message;}finally{$('#loading').hidden=true;}}
async function refresh(){try{state=await api('state');render();$('#error').textContent='';}catch(e){$('#error').textContent=e.message;clearInterval(timer);}}
async function action(b){try{state=await api('action',b);render();$('#error').textContent='';}catch(e){$('#error').textContent=e.message;}}
function render(){
 $('#balance').textContent=money(state.available);$('#reserved').textContent=money(state.reserved);
 $('#connect').textContent=state.connected?'Демо-MRKT подключён ✓':'Подключить демо-MRKT ↗';$('#connect').disabled=state.connected;
 $('#toggle').textContent=state.running?'Остановить симуляцию':'Запустить симуляцию ↗';
 $('#status').textContent=state.running?(state.available===0?'Ожидание возврата демосредств':'Симуляция работает · цикл 5 секунд'):'Симуляция остановлена';
 $('#discount').value=state.discount;$('#discount-value').textContent=state.discount+'%';
 $('#tabs').replaceChildren(...Object.entries(tabs).map(([key,title])=>{const b=document.createElement('button');b.textContent=title+' · '+state[key].length;b.className=key===tab?'active':'';b.onclick=()=>{tab=key;render();};return b;}));
 const list=state[tab];$('#items').replaceChildren();
 if(!list.length){const p=document.createElement('div');p.className='empty';p.textContent=state.connected?'Пока пусто. Запустите симуляцию, чтобы увидеть торговый цикл.':'Подключите демо-MRKT, чтобы исследовать терминал.';$('#items').append(p);return;}
 for(const g of list){const c=document.createElement('article');c.className='gift';const icon=document.createElement('div');icon.className='gift-icon';icon.textContent=['🎁','💎','🧢','🐸'][g.id%4];const title=document.createElement('h3');title.textContent=g.name+' #'+g.number;const p=document.createElement('p');p.textContent='Флор: '+money(g.floor)+' TON';const b=document.createElement('b');b.textContent=money(tab==='sales'?g.proceeds:tab==='listings'?g.sellPrice:g.price)+' TON';c.append(icon,title,p,b);$('#items').append(c);}
}
$('#telegram').onclick=()=>login(false);$('#demo').onclick=()=>login(true);
$('#connect').onclick=()=>action({action:'connect'});$('#toggle').onclick=()=>action({action:state.running?'stop':'start'});
$('#discount').oninput=e=>$('#discount-value').textContent=e.target.value+'%';
$('#discount').onchange=e=>action({action:'discount',value:Number(e.target.value)});
api('config').then(c=>$('#demo').hidden=!c.demo).catch(e=>$('#login-error').textContent=e.message);
