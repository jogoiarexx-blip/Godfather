// GODFATHER v8.8 — Player progression. Keep this classic script loaded before the main game script.
// All costs/rules mirror GDD_GODFATHER_COMPLETO.md §5. No framework or extra network dependencies.
const PLAYER_LEVELS={
  healthLevel:{label:'❤️ Vida máxima',values:[100,130,165,205,250],costs:[2000,5000,12000,25000],requiredRespect:[0,300,800,2000],unit:' HP'},
  regenLevel:{label:'💚 Recuperação',values:[.5,.75,1,1.25],costs:[1500,4000,9000],unit:' HP/s'},
  staminaLevel:{label:'⚡ Estamina',values:[100,115,130,150],costs:[1200,3500,8000],unit:''},
  resistanceLevel:{label:'🛡 Resistência',values:[0,5,10,15],costs:[2500,7000,16000],unit:'%'},
  armorCapacityLevel:{label:'🦺 Capacidade do colete',values:[0,25,50,80],costs:[3000,8000,18000],unit:''}
};
const PLAYER_KITS={
  bandage:{label:'Curativo',heal:35,price:300,limit:3},
  standard:{label:'Kit médico',heal:90,price:750,limit:2},
  emergency:{label:'Bolsa de emergência',heal:160,price:1400,limit:1}
};
const PLAYER_PROGRESS={
  healthLevel:0,regenLevel:0,staminaLevel:0,resistanceLevel:0,armorCapacityLevel:0,armorCurrent:0,
  medkits:{bandage:0,standard:0,emergency:0}
};
function progressRange(v,min,max){return Math.max(min,Math.min(max,Number.isFinite(v)?v:min));}
function progressLevel(v,max){return Number.isInteger(v)?progressRange(v,0,max):0;}
function progressMaxStamina(){return PLAYER_LEVELS.staminaLevel.values[PLAYER_PROGRESS.staminaLevel];}
function progressMaxArmor(){return PLAYER_LEVELS.armorCapacityLevel.values[PLAYER_PROGRESS.armorCapacityLevel];}
function progressHealthMax(){return PLAYER_LEVELS.healthLevel.values[PLAYER_PROGRESS.healthLevel];}
function resetPlayerProgress(){
  for(const key of Object.keys(PLAYER_LEVELS))PLAYER_PROGRESS[key]=0;
  PLAYER_PROGRESS.armorCurrent=0;
  for(const name of Object.keys(PLAYER_KITS))PLAYER_PROGRESS.medkits[name]=0;
  P.maxHp=100;P.hp=100;sprintStamina=100;
}
function snapshotPlayerProgress(){
  return {
    healthLevel:PLAYER_PROGRESS.healthLevel,
    regenLevel:PLAYER_PROGRESS.regenLevel,
    staminaLevel:PLAYER_PROGRESS.staminaLevel,
    resistanceLevel:PLAYER_PROGRESS.resistanceLevel,
    armorCapacityLevel:PLAYER_PROGRESS.armorCapacityLevel,
    armorCurrent:PLAYER_PROGRESS.armorCurrent,
    medkits:{...PLAYER_PROGRESS.medkits}
  };
}
function restorePlayerProgress(data){
  const safe=data&&typeof data==='object'&&!Array.isArray(data)?data:{};
  for(const [key,def] of Object.entries(PLAYER_LEVELS)){
    PLAYER_PROGRESS[key]=progressLevel(safe[key],def.values.length-1);
  }
  PLAYER_PROGRESS.armorCurrent=progressRange(safe.armorCurrent,0,progressMaxArmor());
  for(const [key,def] of Object.entries(PLAYER_KITS)){
    PLAYER_PROGRESS.medkits[key]=progressLevel(safe.medkits?.[key],def.limit);
  }
  P.maxHp=progressHealthMax();
  P.hp=progressRange(P.hp,0,P.maxHp);
}
function progressPurchaseAvailable(){
  return gameSessionStarted&&!mainMenuActive&&!GS.gameOver&&!GS.won
    &&!INTERIOR.active&&!GS.inCar&&!BUILDING_LOAD.active&&inSafeZone(P.x,P.y);
}
function progressPurchaseMessage(){
  if(!progressPurchaseAvailable()){showMsg('🏠 Faça melhorias na zona segura, fora do carro.','i');return false;}
  return true;
}
function buyPlayerUpgrade(key){
  const def=PLAYER_LEVELS[key];if(!def||!progressPurchaseMessage())return false;
  const level=PLAYER_PROGRESS[key];
  if(level>=def.values.length-1){showMsg('✓ Melhoria já está no máximo.','i');return false;}
  const minRespect=def.requiredRespect?.[level]||0;
  if(GS.respect<minRespect){showMsg('⭐ Requer '+minRespect.toLocaleString('pt-BR')+' de respeito.','d');return false;}
  const cost=def.costs[level];
  if(!Number.isFinite(cost)||GS.money<cost){showMsg('💰 Saldo insuficiente: $'+cost.toLocaleString('pt-BR'),'d');return false;}
  GS.money-=cost;PLAYER_PROGRESS[key]=level+1;
  if(key==='healthLevel'){
    const oldMax=P.maxHp;
    P.maxHp=progressHealthMax();
    P.hp=Math.min(P.maxHp,P.hp+(P.maxHp-oldMax));
  } else if(key==='staminaLevel'){
    const oldMax=def.values[level];
    sprintStamina=Math.min(progressMaxStamina(),sprintStamina+(progressMaxStamina()-oldMax));
  }
  showMsg('✅ '+def.label+' nível '+(level+1)+' desbloqueado.','s');
  progressAfterPurchase();return true;
}
function buyPlayerKit(kind){
  const k=PLAYER_KITS[kind];if(!k||!progressPurchaseMessage())return false;
  if(PLAYER_PROGRESS.medkits[kind]>=k.limit){showMsg('🎒 Inventário cheio.','i');return false;}
  if(GS.money<k.price){showMsg('💰 Saldo insuficiente.','d');return false;}
  GS.money-=k.price;PLAYER_PROGRESS.medkits[kind]++;
  showMsg('🎒 '+k.label+' adicionado ao inventário.','s');
  progressAfterPurchase();return true;
}
function buyArmorRefill(points,cost){
  if(!progressPurchaseMessage())return false;
  if(progressMaxArmor()===0){showMsg('🦺 Desbloqueie a capacidade de colete primeiro.','i');return false;}
  if(PLAYER_PROGRESS.armorCurrent>=progressMaxArmor()){showMsg('🦺 Colete já está cheio.','i');return false;}
  if(GS.money<cost){showMsg('💰 Saldo insuficiente.','d');return false;}
  PLAYER_PROGRESS.armorCurrent=Math.min(progressMaxArmor(),PLAYER_PROGRESS.armorCurrent+points);
  GS.money-=cost;showMsg('🦺 Colete reforçado.','s');
  progressAfterPurchase();return true;
}
function playerTakeProtectedDamage(value){
  if(!Number.isFinite(value)||value<=0)return 0;
  const resisted=value*(1-.05*PLAYER_PROGRESS.resistanceLevel);
  const blocked=Math.min(PLAYER_PROGRESS.armorCurrent,resisted*.5);
  PLAYER_PROGRESS.armorCurrent=Math.max(0,PLAYER_PROGRESS.armorCurrent-blocked);
  return Math.max(0,resisted-blocked);
}
function usePlayerMedkit(kind){
  if(mainMenuActive||!gameSessionStarted||GS.gameOver||GS.won||BUILDING_LOAD.active||intimActive)return false;
  if(GS.paused||GS.inCar){showMsg('🩺 Saia do carro e retome o jogo para usar kits.','i');return false;}
  if(P.hp>=P.maxHp-0.01){showMsg('❤️ Vida cheia.','i');return false;}
  const available=kind?[kind]:Object.keys(PLAYER_KITS);
  const selected=available.find(k=>PLAYER_KITS[k]&&PLAYER_PROGRESS.medkits[k]>0);
  if(!selected){showMsg('🩺 Sem kits médicos. Compre na aba Personagem.','d');return false;}
  const k=PLAYER_KITS[selected];
  PLAYER_PROGRESS.medkits[selected]--;
  const before=P.hp;P.heal(k.heal);
  showMsg('🩺 '+k.label+': +'+Math.round(P.hp-before)+' HP.','s');
  updateHUD();saveGame();return true;
}
function tickPlayerRegen(dt){
  if(GS.inSafe||GS.stars>0||P.hp>=P.maxHp)return;
  if(INTERIOR.active){if(INTERIOR.enemies.length>0)return;}
  else if(ENEMIES.some(e=>Math.hypot(e.x-P.x,e.y-P.y)<350)
    ||RIVALS.some(r=>Math.hypot(r.x-P.x,r.y-P.y)<350)
    ||POLICE.some(p=>Math.hypot(p.x-P.x,p.y-P.y)<350))return;
  P.hp=Math.min(P.maxHp,P.hp+(PLAYER_LEVELS.regenLevel.values[PLAYER_PROGRESS.regenLevel]/1000)*dt);
}
function progressAfterPurchase(){
  updateHUD();
  if(typeof _sbActive!=='undefined'&&_sbActive==='char')playerProgressPanelRender();
  if(saveGame())showSaveIndicator();
}
function playerProgressHud(){
  const hp=document.getElementById('hp-numeric');
  if(hp)hp.textContent=Math.ceil(P.hp)+'/'+P.maxHp;
  const armor=document.getElementById('armor-hud'),bar=document.getElementById('armor-bar'),num=document.getElementById('armor-value');
  if(armor)armor.style.display=progressMaxArmor()>0?'':'none';
  if(bar)bar.style.width=(progressMaxArmor()?100*PLAYER_PROGRESS.armorCurrent/progressMaxArmor():0)+'%';
  if(num)num.textContent=Math.ceil(PLAYER_PROGRESS.armorCurrent)+'/'+progressMaxArmor();
  const sprint=document.getElementById('sprint-lbl');
  if(sprint)sprint.textContent='SPRINT '+Math.ceil(sprintStamina)+' / '+progressMaxStamina();
}
function playerProgressPanelRender(){
  const root=document.getElementById('player-progress-content');if(!root)return;
  root.replaceChildren();
  const allowed=progressPurchaseAvailable();
  const summary=document.createElement('div');summary.className='player-progress-summary';
  summary.textContent='❤️ '+Math.ceil(P.hp)+'/'+P.maxHp+' HP  ·  🦺 '+Math.ceil(PLAYER_PROGRESS.armorCurrent)+'/'+progressMaxArmor()+'  ·  ⚡ '+Math.ceil(sprintStamina)+'/'+progressMaxStamina();
  root.appendChild(summary);
  const hint=document.createElement('p');hint.className='player-progress-hint';
  hint.textContent=allowed?'🏠 Zona segura: melhorias e suprimentos disponíveis.':'🔒 Compre somente dentro de uma zona segura, fora do carro.';
  root.appendChild(hint);
  const section=(title)=>{const h=document.createElement('h3');h.className='player-progress-section';h.textContent=title;root.appendChild(h);};
  const card=(title,detail,buttonLabel,disabled,action)=>{
    const wrap=document.createElement('div');wrap.className='player-progress-card';
    const head=document.createElement('strong');head.textContent=title;wrap.appendChild(head);
    const description=document.createElement('small');description.textContent=detail;wrap.appendChild(description);
    const btn=document.createElement('button');btn.type='button';btn.className='player-progress-buy';btn.textContent=buttonLabel;btn.disabled=disabled;
    btn.addEventListener('click',action);wrap.appendChild(btn);root.appendChild(wrap);
  };
  section('TREINAMENTO');
  for(const [key,def] of Object.entries(PLAYER_LEVELS)){
    const lvl=PLAYER_PROGRESS[key],max=def.values.length-1,next=lvl<max,req=def.requiredRespect?.[lvl]||0;
    const cost=next?def.costs[lvl]:0;
    const detail='Nível '+lvl+'/'+max+' · '+def.values[lvl]+def.unit+(next?' → '+def.values[lvl+1]+def.unit:' · MÁXIMO')+(req?' · ⭐ '+req:'');
    const label=next?'Comprar $'+cost.toLocaleString('pt-BR'):'✓ CONCLUÍDO';
    card(def.label,detail,label,!next||!allowed||GS.money<cost||GS.respect<req,()=>buyPlayerUpgrade(key));
  }
  section('SUPRIMENTOS');
  for(const [key,k] of Object.entries(PLAYER_KITS)){
    const count=PLAYER_PROGRESS.medkits[key];
    card('🩺 '+k.label,'Cura '+k.heal+' HP · Inventário '+count+'/'+k.limit,
      'Comprar $'+k.price.toLocaleString('pt-BR'),!allowed||GS.money<k.price||count>=k.limit,()=>buyPlayerKit(key));
  }
  card('🦺 Placas de colete +25','Armadura: '+Math.ceil(PLAYER_PROGRESS.armorCurrent)+'/'+progressMaxArmor(),
    'Comprar $150',!allowed||!progressMaxArmor()||PLAYER_PROGRESS.armorCurrent>=progressMaxArmor()||GS.money<150,()=>buyArmorRefill(25,150));
  card('🦺 Placas de colete +60','Armadura: '+Math.ceil(PLAYER_PROGRESS.armorCurrent)+'/'+progressMaxArmor(),
    'Comprar $350',!allowed||!progressMaxArmor()||PLAYER_PROGRESS.armorCurrent>=progressMaxArmor()||GS.money<350,()=>buyArmorRefill(60,350));
  const tip=document.createElement('p');tip.className='player-progress-tip';tip.textContent='Use H durante a partida para consumir o primeiro kit médico disponível. Melhorias permanecem salvas ao trocar de cidade.';root.appendChild(tip);
}
