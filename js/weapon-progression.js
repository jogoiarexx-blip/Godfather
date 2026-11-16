// Godfather Web Edition v8.9 — weapons, ammunition and in-game armory.
// Loaded as a classic script before the main game code. All operations validate
// prices and levels from these definitions (never from DOM text).
const WEAPON_SHOP_DEFS=[
  {cost:0, damage:[25,27,29,32], magazine:[12,14,16,18],
   bag:[-1,-1,-1,-1],
   costs:{damage:[1200,3500,8000],magazine:[1000,2800,6000],
     reload:[900,2600,5500],accuracy:[1000,3000,7000],bag:[]},
   ammo:[]},
  {cost:2500,damage:[30,32,34,36],magazine:[5,6,7,8],
   bag:[20,30,40,60],
   costs:{damage:[2500,6500,15000],magazine:[2000,5000,12000],
     reload:[2000,5500,13000],accuracy:[1800,5000,11000],bag:[2000,5000,10000]},
   ammo:[{id:'small',qty:8,cost:200,name:'8 cartuchos'},
         {id:'medium',qty:20,cost:450,name:'20 cartuchos'},
         {id:'full',cost:500,name:'Reabastecer tudo'}]},
  {cost:6000,damage:[18,19,20,22],magazine:[30,35,40,45],
   bag:[90,120,150,180],
   costs:{damage:[4000,10000,22000],magazine:[3500,9000,20000],
     reload:[3000,8500,19000],accuracy:[3500,9500,21000],bag:[3000,7000,15000]},
   ammo:[{id:'small',qty:30,cost:280,name:'30 balas'},
         {id:'medium',qty:60,cost:520,name:'60 balas'},
         {id:'full',cost:800,name:'Reabastecer tudo'}]}
];
const WEAPON_UPGRADE_NAMES={
  damage:'💥 Dano',magazine:'🧰 Carregador',
  reload:'⏱ Recarga',accuracy:'🎯 Precisão',bag:'🎒 Reserva máxima'
};
const WEAPON_UPGRADE_KEYS=Object.keys(WEAPON_UPGRADE_NAMES);
const WEAPON_PROGRESS=WEAPON_SHOP_DEFS.map(()=>({
  damageLevel:0,magazineLevel:0,reloadLevel:0,accuracyLevel:0,bagLevel:0
}));
const WEAPON_SHOP={open:false,tab:'weapons'};
const WEAPON_BASE_STATS=[
  {reloadMs:950,spread:.055,recoil:.018,moveSpread:.075},
  {reloadMs:1450,spread:.30,recoil:.050,moveSpread:.10},
  {reloadMs:1750,spread:.085,recoil:.024,moveSpread:.11}
];
function weaponProgressSnapshot(){
  return WEAPON_PROGRESS.map(p=>({...p}));
}
function weaponProgressSchemaValid(arr){
  if(!Array.isArray(arr)||arr.length!==WEAPON_SHOP_DEFS.length)return false;
  return arr.every((p,i)=>p&&typeof p==='object'&&
    WEAPON_UPGRADE_KEYS.every(k=>Number.isInteger(p[k+'Level']) &&
      p[k+'Level']>=0 && p[k+'Level']<=(WEAPON_SHOP_DEFS[i].costs[k]||[]).length));
}
function weaponApplyLevel(id){
  const w=WEAPONS[id],def=WEAPON_SHOP_DEFS[id],progress=WEAPON_PROGRESS[id],base=WEAPON_BASE_STATS[id];
  if(!w||!def||!progress)return;
  w.dmg=def.damage[progress.damageLevel];
  w.magSize=def.magazine[progress.magazineLevel];
  w.maxAmmo=def.bag[progress.bagLevel];
  const reloadFactor=1-.08*progress.reloadLevel;
  const accuracyFactor=[1,.90,.82,.75][progress.accuracyLevel];
  w.reloadMs=Math.round(base.reloadMs*reloadFactor);
  w.spread=base.spread*accuracyFactor;
  w.recoil=base.recoil*accuracyFactor;
  w.moveSpread=base.moveSpread*accuracyFactor;
  w.clip=Math.min(w.magSize,Math.max(0,Number.isFinite(w.clip)?w.clip:w.magSize));
  w.ammo=w.maxAmmo===-1?-1:Math.min(w.maxAmmo,Math.max(0,Number.isFinite(w.ammo)?w.ammo:0));
}
function weaponProgressRestore(data){
  const valid=weaponProgressSchemaValid(data);
  for(let i=0;i<WEAPON_PROGRESS.length;i++){
    for(const key of WEAPON_UPGRADE_KEYS){
      WEAPON_PROGRESS[i][key+'Level']=valid?data[i][key+'Level']:0;
    }
    weaponApplyLevel(i);
  }
}
function weaponProgressReset(){
  weaponProgressRestore(null);
  for(let i=0;i<WEAPONS.length;i++){
    WEAPONS[i].clip=WEAPONS[i].magSize;
    WEAPONS[i].ammo=WEAPONS[i].maxAmmo;
  }
  weaponShopForceClose();
}
function weaponShopInRange(){
  return Math.hypot(P.x-DEALER.x,P.y-DEALER.y)<=115;
}
function weaponShopCanOpen(){
  return gameSessionStarted&&!mainMenuActive&&!GS.gameOver&&!GS.won
    &&!GS.inCar&&!INTERIOR.active&&!BUILDING_LOAD.active
    &&!pauseMenuActive&&!GS.paused&&!intimActive&&weaponShopInRange();
}
function openWeaponShop(){
  if(WEAPON_SHOP.open)return;
  if(!weaponShopCanOpen()){
    showMsg('🗡️ Fale com o negociante a pé para abrir a oficina.','i');
    return;
  }
  if(typeof _sbActive!=='undefined'&&_sbActive)sbClose();
  if(isReloading())cancelReload();
  mDown=false;keysDown.clear();GS.paused=true;WEAPON_SHOP.open=true;
  WEAPON_SHOP.tab='weapons';
  const panel=document.getElementById('weapon-shop');
  if(panel){panel.classList.add('on');panel.setAttribute('aria-hidden','false');}
  weaponShopRender();
}
function weaponShopForceClose(){
  WEAPON_SHOP.open=false;
  const panel=document.getElementById('weapon-shop');
  if(panel){panel.classList.remove('on');panel.setAttribute('aria-hidden','true');}
}
function closeWeaponShop(){
  if(!WEAPON_SHOP.open)return;
  weaponShopForceClose();mDown=false;keysDown.clear();
  if(gameSessionStarted&&!mainMenuActive&&!GS.gameOver&&!GS.won&&
     !BUILDING_LOAD.active&&!pauseMenuActive)GS.paused=false;
  if(typeof lastT!=='undefined')lastT=performance.now();
}
function weaponShopAllowTrade(){
  if(!WEAPON_SHOP.open||!gameSessionStarted||mainMenuActive||GS.gameOver||
    GS.won||GS.inCar||INTERIOR.active||BUILDING_LOAD.active||!weaponShopInRange()){
    showMsg('🗡️ Compre somente na oficina do negociante.','d');
    return false;
  }
  return true;
}
function weaponShopTransactionComplete(label){
  if(WEAPON_SHOP.open)weaponShopRender();
  renderWeaponHUD();updateHUD();
  if(saveGame())showSaveIndicator();
  showMsg(label,'s');
}
function weaponShopPurchaseWeapon(id){
  if(!weaponShopAllowTrade())return false;
  const def=WEAPON_SHOP_DEFS[id],w=WEAPONS[id];
  if(!def||!w||!Number.isInteger(id)||id<=0||weaponOwned[id])return false;
  if(GS.money<def.cost){showMsg('💰 Saldo insuficiente.','d');return false;}
  GS.money-=def.cost;weaponOwned[id]=true;
  w.clip=w.magSize;w.ammo=w.maxAmmo;
  weaponShopTransactionComplete('🔫 '+w.name+' adquirida!');
  return true;
}
function weaponShopBuyAmmo(id,packId){
  if(!weaponShopAllowTrade())return false;
  const def=WEAPON_SHOP_DEFS[id],w=WEAPONS[id];
  if(!def||!w||!weaponOwned[id]||w.maxAmmo<0)return false;
  const pack=def.ammo.find(x=>x.id===packId);
  if(!pack)return false;
  if(GS.money<pack.cost){showMsg('💰 Saldo insuficiente.','d');return false;}
  const missing=w.maxAmmo-w.ammo;
  if(pack.id==='full'){
    if(missing===0&&w.clip>=w.magSize){showMsg('🔫 Munição já está completa.','i');return false;}
    GS.money-=pack.cost;w.ammo=w.maxAmmo;w.clip=w.magSize;
  }else{
    // A package always delivers the full stated quantity; never charge for overflow.
    if(missing<pack.qty){showMsg('📦 Espaço insuficiente: você precisa de '+pack.qty+' lugares na reserva.','i');return false;}
    GS.money-=pack.cost;w.ammo+=pack.qty;
  }
  weaponShopTransactionComplete('📦 '+w.name+' — '+pack.name+' comprados.');
  return true;
}
function weaponShopUpgrade(id,key){
  if(!weaponShopAllowTrade())return false;
  const def=WEAPON_SHOP_DEFS[id],p=WEAPON_PROGRESS[id],w=WEAPONS[id];
  if(!def||!p||!w||!weaponOwned[id]||!WEAPON_UPGRADE_KEYS.includes(key))return false;
  const costs=def.costs[key],level=p[key+'Level'];
  if(!Array.isArray(costs)||level>=costs.length)return false;
  const cost=costs[level];
  if(GS.money<cost){showMsg('💰 Saldo insuficiente.','d');return false;}
  GS.money-=cost;p[key+'Level']=level+1;
  weaponApplyLevel(id);
  weaponShopTransactionComplete('⚒ '+w.name+': '+WEAPON_UPGRADE_NAMES[key]+' nível '+(level+1)+'.');
  return true;
}
function weaponShopNode(tag,className,txt){
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(txt!==undefined)node.textContent=txt;
  return node;
}
function weaponShopButton(text,disabled,handler){
  const b=weaponShopNode('button','ws-buy',text);
  b.type='button';b.disabled=Boolean(disabled);
  b.addEventListener('click',handler);
  return b;
}
function weaponShopCard(root,title,description){
  const card=weaponShopNode('div','ws-card');
  card.appendChild(weaponShopNode('h3','ws-name',title));
  card.appendChild(weaponShopNode('p','ws-description',description));
  root.appendChild(card);return card;
}
function weaponShopSetTab(tab){
  if(!WEAPON_SHOP.open||!['weapons','ammo','upgrades'].includes(tab))return;
  WEAPON_SHOP.tab=tab;weaponShopRender();
}
function weaponShopRender(){
  if(!WEAPON_SHOP.open)return;
  const money=document.getElementById('weapon-shop-money'),
    tabs=document.getElementById('weapon-shop-tabs'),
    content=document.getElementById('weapon-shop-content');
  if(!content||!tabs)return;
  if(money)money.textContent='$'+Math.floor(GS.money).toLocaleString('pt-BR');
  tabs.replaceChildren();content.replaceChildren();
  for(const [key,label] of [['weapons','🔫 Armas'],['ammo','📦 Munição'],['upgrades','⚒ Melhorias']]){
    const button=weaponShopNode('button','ws-tab'+(WEAPON_SHOP.tab===key?' active':''),label);
    button.type='button';button.setAttribute('aria-pressed',String(WEAPON_SHOP.tab===key));
    button.addEventListener('click',()=>weaponShopSetTab(key));tabs.appendChild(button);
  }
  if(WEAPON_SHOP.tab==='weapons'){
    WEAPONS.forEach((w,id)=>{
      const d=WEAPON_SHOP_DEFS[id],owned=weaponOwned[id];
      const c=weaponShopCard(content,w.icon+' '+w.name,
        'Dano '+w.dmg+' · Pente '+w.magSize+' · '+Math.round(1000/w.cd)+' tiros/s · '+ammoLabel(w));
      c.appendChild(weaponShopButton(owned?'✓ NO ARSENAL':'Comprar por $'+d.cost.toLocaleString('pt-BR'),
        owned||GS.money<d.cost,()=>weaponShopPurchaseWeapon(id)));
    });
    return;
  }
  if(WEAPON_SHOP.tab==='ammo'){
    WEAPONS.forEach((w,id)=>{
      if(id===0)return;
      const d=WEAPON_SHOP_DEFS[id],owned=weaponOwned[id];
      const c=weaponShopCard(content,w.icon+' '+w.name,
        owned?'Carregador '+w.clip+'/'+w.magSize+' · Reserva '+w.ammo+'/'+w.maxAmmo:'Arma ainda não comprada');
      for(const pack of d.ammo){
        const free=owned?w.maxAmmo-w.ammo:0;
        const full=pack.id==='full';
        const blocked=!owned||(full?(free===0&&w.clip===w.magSize):free<pack.qty);
        c.appendChild(weaponShopButton(pack.name+' · $'+pack.cost.toLocaleString('pt-BR'),
          blocked||GS.money<pack.cost,()=>weaponShopBuyAmmo(id,pack.id)));
      }
    });
    return;
  }
  WEAPONS.forEach((w,id)=>{
    const def=WEAPON_SHOP_DEFS[id],progress=WEAPON_PROGRESS[id];
    const section=weaponShopNode('h3','ws-section',w.icon+' '+w.name+(weaponOwned[id]?'':' 🔒'));
    content.appendChild(section);
    for(const key of WEAPON_UPGRADE_KEYS){
      if(!def.costs[key].length)continue;
      const level=progress[key+'Level'],max=def.costs[key].length,cost=level<max?def.costs[key][level]:null;
      let detail='Nível '+level+'/'+max;
      if(key==='damage')detail+=' · Dano '+w.dmg;
      if(key==='magazine')detail+=' · Pente '+w.magSize;
      if(key==='reload')detail+=' · '+w.reloadMs+' ms';
      if(key==='accuracy')detail+=' · Dispersão '+Math.round(w.spread*1000)/1000;
      if(key==='bag')detail+=' · Reserva '+w.maxAmmo;
      const c=weaponShopCard(content,WEAPON_UPGRADE_NAMES[key],detail);
      c.appendChild(weaponShopButton(cost===null?'✓ NÍVEL MÁXIMO':'Melhorar por $'+cost.toLocaleString('pt-BR'),
        !weaponOwned[id]||cost===null||GS.money<cost,()=>weaponShopUpgrade(id,key)));
    }
  });
}
