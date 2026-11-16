// Godfather Web Edition v8.13 — vehicle garage and driving progression.
// Classic JS script loaded before the inline engine. One active CAR remains
// compatible with world collisions, missions and existing police pursuits.
const GARAGE_VEHICLES=[
  {id:'sedan',name:'Sedã Corleone',tag:'Equilibrado · carro inicial',price:0,hp:100,maxSpeed:10,accel:.45,turn:.055,reverse:4,cost:1,color:['#c03028','#cc3830','#a02818','#7a1810'],roof:['#37100c','#220806'],width:1,length:1},
  {id:'coupe',name:'Falcão GT',tag:'Alta velocidade · menor blindagem',price:5500,hp:82,maxSpeed:13,accel:.65,turn:.067,reverse:4.3,cost:1.35,color:['#214b75','#3278a5','#173d64','#10243f'],roof:['#152b42','#0b1b2e'],width:.89,length:1.06},
  {id:'muscle',name:'Fúria V8',tag:'Torque forte · arrancada e resistência',price:10500,hp:135,maxSpeed:11.4,accel:.77,turn:.048,reverse:4.4,cost:1.75,color:['#a77b2c','#e6ac43','#94601a','#633b13'],roof:['#5b3b19','#281e13'],width:1.1,length:1.08},
  {id:'armored',name:'Fortaleza Blindada',tag:'Proteção máxima · mais pesada',price:18500,hp:190,maxSpeed:8.8,accel:.35,turn:.043,reverse:3.4,cost:2.4,color:['#4d6568','#668385','#354849','#203638'],roof:['#2b4040','#1d2d2e'],width:1.19,length:1.15}
];
const GARAGE_UPGRADES={
  engine:{label:'Motor',about:'Aceleração e velocidade máxima',cost:[1500,3300,6800]},
  handling:{label:'Direção',about:'Resposta de curva e controle',cost:[1100,2600,5000]},
  armor:{label:'Blindagem',about:'Capacidade e proteção contra danos',cost:[1600,3600,7500]}
};
const GARAGE_PROGRESS={
  selected:'sedan',vehicles:{},point:{x:320,y:480},range:112
};
function garageNewEntry(owned=false){
  return {owned,engine:0,handling:0,armor:0,condition:1};
}
function garageReset(){
  GARAGE_PROGRESS.selected='sedan';
  GARAGE_PROGRESS.vehicles={};
  for(const v of GARAGE_VEHICLES)GARAGE_PROGRESS.vehicles[v.id]=garageNewEntry(v.id==='sedan');
}
garageReset();
function garageModel(id=GARAGE_PROGRESS.selected){
  return GARAGE_VEHICLES.find(v=>v.id===id)||GARAGE_VEHICLES[0];
}
function garageEntry(id=GARAGE_PROGRESS.selected){
  return GARAGE_PROGRESS.vehicles[id]||GARAGE_PROGRESS.vehicles.sedan;
}
function garageSelectedModel(){return garageModel();}
function garageBaseMapHp(){
  const multiplier=typeof MAP_DEFS!=='undefined'&&MAP_DEFS[currentMapId]?MAP_DEFS[currentMapId].enemyMult:1;
  return 1+(multiplier-1)*.5;
}
function garageStats(id=GARAGE_PROGRESS.selected){
  const model=garageModel(id),up=garageEntry(id);
  const maxHp=Math.round(model.hp*garageBaseMapHp()*(1+up.armor*.25));
  return {maxHp,maxSpeed:model.maxSpeed*(1+up.engine*.10),
    accel:model.accel*(1+up.engine*.13),turn:model.turn*(1+up.handling*.14),
    reverse:model.reverse,damageFactor:Math.max(.55,1-up.armor*.10)};
}
function garageCapture(){
  if(typeof CAR==='undefined'||!CAR||!Number.isFinite(CAR.maxHp)||CAR.maxHp<=0)return;
  garageEntry().condition=Math.max(0,Math.min(1,CAR.hp/CAR.maxHp));
}
function garageApply(restoreStored=true){
  const stats=garageStats();
  CAR.maxHp=stats.maxHp;
  CAR.hp=restoreStored?Math.round(stats.maxHp*garageEntry().condition):Math.max(0,Math.min(stats.maxHp,CAR.hp));
  CAR.speed=Math.max(-stats.reverse,Math.min(stats.maxSpeed,CAR.speed||0));
  return stats;
}
function garageAt(x=P.x,y=P.y){
  return Math.hypot(x-GARAGE_PROGRESS.point.x,y-GARAGE_PROGRESS.point.y)<=GARAGE_PROGRESS.range;
}
function garageTradeAllowed(){
  return gameSessionStarted&&!mainMenuActive&&!BUILDING_LOAD.active&&!INTERIOR.active&&
    !GS.gameOver&&!GS.won&&!GS.inCar&&!BOSS_STATE.active&&
    GS.stars===0&&garageAt();
}
function garageMapInit(){
  const start=MAP_DEFS[currentMapId].carStart;
  // Use the original garage/car parking area; preserve its collision-safe point.
  const pt=findFreePoint(S(start.x),S(start.y),24,160);
  GARAGE_PROGRESS.point.x=pt.x;GARAGE_PROGRESS.point.y=pt.y;
  garageApply(true);
  if(CAR.hp<=0){CAR.hp=Math.max(1,Math.round(CAR.maxHp*.25));garageCapture();}
}
function garageSave(){
  garageCapture();
  return {selected:GARAGE_PROGRESS.selected,
    vehicles:Object.fromEntries(GARAGE_VEHICLES.map(v=>{
      const e=garageEntry(v.id);
      return [v.id,{owned:!!e.owned,engine:e.engine,handling:e.handling,armor:e.armor,
        condition:Number.isFinite(e.condition)?Math.max(0,Math.min(1,e.condition)):1}];
    }))};
}
function garageSchemaValid(data){
  if(!data||typeof data!=='object'||!GARAGE_VEHICLES.some(v=>v.id===data.selected))return false;
  if(!data.vehicles||typeof data.vehicles!=='object'||Array.isArray(data.vehicles))return false;
  if(Object.keys(data.vehicles).length!==GARAGE_VEHICLES.length)return false;
  for(const model of GARAGE_VEHICLES){
    const e=data.vehicles[model.id];
    if(!e||typeof e!=='object'||typeof e.owned!=='boolean')return false;
    for(const key of Object.keys(GARAGE_UPGRADES))if(!Number.isInteger(e[key])||e[key]<0||e[key]>3)return false;
    if(!Number.isFinite(e.condition)||e.condition<0||e.condition>1)return false;
    if(!e.owned&&(e.engine||e.handling||e.armor))return false;
  }
  return data.vehicles.sedan.owned===true&&data.vehicles[data.selected].owned===true;
}
function garageRestore(saved){
  if(!garageSchemaValid(saved)){garageReset();garageApply(true);return false;}
  GARAGE_PROGRESS.selected=saved.selected;
  GARAGE_PROGRESS.vehicles=Object.fromEntries(GARAGE_VEHICLES.map(v=>
    [v.id,{...saved.vehicles[v.id]}]));
  garageApply(true);
  return true;
}
function garagePurchase(id){
  const m=GARAGE_VEHICLES.find(v=>v.id===id);
  if(!garageTradeAllowed()||!m||garageEntry(id).owned||!Number.isFinite(GS.money)||GS.money<m.price)return false;
  GS.money-=m.price;
  GARAGE_PROGRESS.vehicles[id].owned=true;
  showMsg('🚘 Adquirido: '+m.name+'. Selecione para dirigir.','s');
  garageRender();garagePersist();
  return true;
}
function garageSelect(id){
  const m=GARAGE_VEHICLES.find(v=>v.id===id);
  if(!garageTradeAllowed()||!m||!garageEntry(id).owned)return false;
  if(id===GARAGE_PROGRESS.selected)return false;
  garageCapture();
  GARAGE_PROGRESS.selected=id;
  const pt=findFreePoint(GARAGE_PROGRESS.point.x,GARAGE_PROGRESS.point.y,24,120);
  CAR.x=pt.x;CAR.y=pt.y;CAR.angle=0;CAR.speed=0;CAR.useTarget=false;
  garageApply(true);
  CAR.recoveryTimer=CAR.hp<=0?8000:0;
  // A destroyed stored vehicle stays unusable until the paid repair or rescue.
  // Switching models cannot grant an immediate free repair.
  showMsg('🚗 Veículo pronto: '+m.name+'.','s');
  garageRender();garagePersist();
  return true;
}
function garageUpgradePrice(id,key){
  const m=GARAGE_VEHICLES.find(v=>v.id===id),u=GARAGE_UPGRADES[key],e=GARAGE_PROGRESS.vehicles[id];
  if(!m||!u||!e||e[key]>=3)return null;
  return Math.round((u.cost[e[key]]*m.cost)/50)*50;
}
function garageUpgrade(id,key){
  if(!garageTradeAllowed()||id!==GARAGE_PROGRESS.selected||!GARAGE_UPGRADES[key])return false;
  const e=garageEntry(id),price=garageUpgradePrice(id,key);
  if(!e.owned||price===null||!Number.isFinite(GS.money)||GS.money<price)return false;
  garageCapture();
  GS.money-=price;e[key]++;
  garageApply(true); // retains damage ratio; upgrades never give a free repair
  showMsg('🔧 '+garageModel(id).name+': '+GARAGE_UPGRADES[key].label+' nível '+e[key]+'.','s');
  garageRender();garagePersist();
  return true;
}
function garageRepairPrice(){
  const stats=garageStats(),missing=Math.max(0,stats.maxHp-CAR.hp);
  if(missing<=0)return 0;
  const m=garageSelectedModel();
  return Math.max(150,Math.ceil((missing/stats.maxHp)*Math.max(550,m.price*.12+900)/50)*50);
}
function garageRepair(){
  if(!garageTradeAllowed()||CAR.hp>=CAR.maxHp)return false;
  const price=garageRepairPrice();
  if(!Number.isFinite(GS.money)||GS.money<price)return false;
  GS.money-=price;CAR.hp=CAR.maxHp;CAR.recoveryTimer=0;garageCapture();
  showMsg('🔧 Veículo reparado por $'+price.toLocaleString('pt-BR')+'.','s');
  garageRender();garagePersist();
  return true;
}
function garagePersist(){
  if(typeof saveGame==='function'&&saveGame()&&typeof showSaveIndicator==='function')showSaveIndicator();
}
function garageTryInteract(){
  if(!gameSessionStarted||mainMenuActive||BUILDING_LOAD.active||INTERIOR.active||GS.inCar)return false;
  if(!garageAt())return false;
  if(GS.stars>0){showMsg('🚔 Despiste a polícia antes de entrar na garagem.','d');return true;}
  if(BOSS_STATE.active){showMsg('⚠️ A garagem está fechada durante a batalha final.','d');return true;}
  sbOpen('garage');
  return true;
}
function garageRender(){
  const root=document.getElementById('garage-content');
  if(!root)return;
  root.replaceChildren();
  const ready=garageTradeAllowed();
  const hint=document.createElement('p');
  hint.className='garage-note';
  hint.textContent=ready?'Escolha seu veículo e suas melhorias. O carro selecionado fica estacionado aqui.':
    'Vá a pé até a garagem indicada no minimapa e esteja sem estrelas para negociar.';
  root.appendChild(hint);
  const status=document.createElement('div');status.className='garage-summary';
  const m=garageSelectedModel();
  status.textContent='ATIVO · '+m.name+' · '+Math.ceil(CAR.hp)+'/'+CAR.maxHp+' HP';
  root.appendChild(status);
  const repair=document.createElement('button');repair.type='button';repair.className='garage-action';
  repair.textContent=CAR.hp>=CAR.maxHp?'✓ Veículo em condições máximas':'Reparar veículo · $'+garageRepairPrice().toLocaleString('pt-BR');
  repair.disabled=!ready||CAR.hp>=CAR.maxHp||GS.money<garageRepairPrice();
  repair.addEventListener('click',garageRepair);root.appendChild(repair);
  for(const car of GARAGE_VEHICLES){
    const e=garageEntry(car.id),active=GARAGE_PROGRESS.selected===car.id;
    const box=document.createElement('section');box.className='garage-car'+(active?' is-selected':'');
    const name=document.createElement('h3');name.textContent=car.name;
    const intro=document.createElement('p');intro.textContent=car.tag;
    const specs=document.createElement('small'),stats=garageStats(car.id);
    specs.textContent='Velocidade '+stats.maxSpeed.toFixed(1)+' · HP '+stats.maxHp+
      ' · Motor '+e.engine+'/3 · Direção '+e.handling+'/3 · Blindagem '+e.armor+'/3';
    box.append(name,intro,specs);
    function action(label,fn,disabled=false){
      const button=document.createElement('button');button.className='garage-action';button.type='button';
      button.textContent=label;button.disabled=!ready||disabled;
      button.addEventListener('click',fn);box.appendChild(button);
    }
    if(!e.owned)action('Comprar · $'+car.price.toLocaleString('pt-BR'),
      ()=>garagePurchase(car.id),GS.money<car.price);
    else if(!active)action('Selecionar veículo',()=>garageSelect(car.id));
    else{
      const current=document.createElement('div');current.className='garage-current';
      current.textContent='✓ VEÍCULO ATIVO';box.appendChild(current);
      for(const [key,upgrade] of Object.entries(GARAGE_UPGRADES)){
        const price=garageUpgradePrice(car.id,key);
        action(upgrade.label+' '+e[key]+'/3 '+(price===null?'· MÁX.':'· $'+price.toLocaleString('pt-BR')),
          ()=>garageUpgrade(car.id,key),price===null||GS.money<price);
      }
    }
    root.appendChild(box);
  }
}
function garageDrawMarker(ctx){
  const p=GARAGE_PROGRESS.point;
  if(typeof inViewPoint==='function'&&!inViewPoint(p.x,p.y,140))return;
  const pulse=Math.sin(performance.now()*.003)*3;
  ctx.save();ctx.translate(p.x,p.y);
  ctx.strokeStyle='rgba(212,175,55,.65)';ctx.lineWidth=2;ctx.beginPath();
  ctx.arc(0,0,34+pulse,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='rgba(212,175,55,.13)';ctx.fillRect(-20,-20,40,40);
  ctx.fillStyle='#e4c16d';ctx.font='bold 20px serif';ctx.textAlign='center';
  ctx.fillText('🔧',0,8);
  if(garageAt()){
    ctx.font='bold 10px Cinzel,serif';ctx.fillStyle='#f0d68c';
    ctx.fillText('[E] GARAGEM',0,-49);
  }else{
    ctx.font='bold 9px Cinzel,serif';ctx.fillStyle='#e2c17d';
    ctx.fillText('GARAGEM',0,-48);
  }
  ctx.restore();
}
function garageMinimap(c,sx,sy){
  c.save();c.fillStyle='#f1bd54';c.font='bold 11px serif';
  c.textAlign='center';c.fillText('🔧',GARAGE_PROGRESS.point.x*sx,GARAGE_PROGRESS.point.y*sy);c.restore();
}
function garageHud(){
  const el=document.getElementById('garage-drive-hud');
  if(!el)return;
  el.style.display=GS.inCar&&!mainMenuActive&&!GS.gameOver?'block':'none';
  if(GS.inCar)el.textContent='🚗 '+garageSelectedModel().name+' · '+Math.round(Math.abs(CAR.speed)/garageStats().maxSpeed*100)+'% velocidade · '+Math.ceil(CAR.hp)+' HP';
}
