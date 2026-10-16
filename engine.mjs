// Изолированная симуляция: никаких сетевых торговых операций.
export const NANO=1_000_000_000;
export function offerPrice(floor,discount){
 if(!Number.isSafeInteger(floor)||floor<=0||!Number.isInteger(discount)||discount<1||discount>90) throw Error('Invalid price');
 return Number(BigInt(floor)*BigInt(100-discount)/100n);
}
export function createState(){
 return {demo:true,connected:false,running:false,discount:10,available:30*NANO,reserved:0,inventory:[],listings:[],offers:[],accepted:[],sales:[],sequence:0,tick:0};
}
export function cycle(s){
 if(!s.running||!s.connected)return;
 s.tick++;
 for(const o of [...s.offers]){
  if(s.tick-o.tick<3)continue;
  s.offers.splice(s.offers.indexOf(o),1);s.reserved-=o.price;
  if(o.id%3===0){s.available+=o.price;continue;}
  s.accepted.unshift({...o,status:'accepted',at:Date.now()});
  s.inventory.push({...o,ready:s.tick+1});
 }
 for(const g of [...s.inventory]){
  if(s.tick<g.ready)continue;
  s.inventory.splice(s.inventory.indexOf(g),1);
  s.listings.push({...g,sellPrice:g.floor,ready:s.tick+4});
 }
 for(const g of [...s.listings]){
  if(s.tick<g.ready)continue;
  s.listings.splice(s.listings.indexOf(g),1);
  const proceeds=Math.floor(g.sellPrice*95/100);
  s.available+=proceeds;s.sales.unshift({...g,proceeds,at:Date.now()});
 }
 const floor=(5+s.sequence%5)*NANO,price=offerPrice(floor,s.discount);
 if(s.available>=price){
  const id=++s.sequence;
  s.available-=price;s.reserved+=price;
  s.offers.unshift({id,name:['Plush Pepe','Heart Locket','Durov’s Cap','Vintage Cigar'][id%4],number:1000+id,floor,price,tick:s.tick,at:Date.now()});
 }
 s.accepted=s.accepted.slice(0,100);s.sales=s.sales.slice(0,100);
}
