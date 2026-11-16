// Godfather Web Edition v8.12 — nine authored city-exclusive playable contracts.
// Runs as a classic script before the main inline engine. Does not replace any
// of the 24 campaign missions, and keeps costs/rewards in trusted code.
const CITY_CONTRACT_DEFS=[
  [
    {id:'nc-documents',title:'Documentos do Porto',kind:'courier',
      story:'Recupere os registros do cais e entregue-os ao intermediário antes que os Barzini interceptem a operação.',
      pickup:0,target:5,minRespect:0,money:1800,respect:170,icon:'📁'},
    {id:'nc-dock-hit',title:'O Cobrador da Doca',kind:'hunt',
      story:'Encontre o grupo de cobradores dos Barzini nas ruas próximas ao Mercado Negro e elimine os homens marcados.',
      target:3,minRespect:300,total:3,money:3800,respect:320,icon:'🎯'},
    {id:'nc-vault',title:'Assalto ao Cassino',kind:'escape',
      story:'Recolha o dinheiro clandestino do cassino; depois escape da perseguição policial até zerar a procura.',
      target:8,minRespect:900,money:5200,respect:450,icon:'💰'}
  ],
  [
    {id:'pa-omerta',title:'O Código da Omertà',kind:'courier',
      story:'Uma testemunha levou provas ao cais. Recupere o envelope e transporte-o até o contato da família.',
      pickup:1,target:7,minRespect:0,money:3600,respect:290,icon:'🦅'},
    {id:'pa-silence',title:'Silêncio em Palermo',kind:'hunt',
      story:'Intercepte os agentes armados dos Tattaglia que vigiam o mercado clandestino da cidade.',
      target:4,minRespect:600,total:4,money:6900,respect:550,icon:'🎯'},
    {id:'pa-jewels',title:'As Joias do Palazzo',kind:'escape',
      story:'Retire as joias da cobertura e desapareça das ruas antes que a polícia descubra quem financiou o golpe.',
      target:9,minRespect:1600,money:11000,respect:850,icon:'💎'}
  ],
  [
    {id:'ch-ledger',title:'O Livro de Chicago',kind:'courier',
      story:'O livro de pagamentos precisa sair da zona industrial e chegar ao clube de jazz sem cair nas mãos dos Stracci.',
      pickup:2,target:9,minRespect:0,money:6500,respect:520,icon:'📖'},
    {id:'ch-nightfall',title:'A Última Vigília',kind:'hunt',
      story:'Elimine a equipe dos Stracci posicionada perto do estádio, antes que iniciem outra ofensiva.',
      target:10,minRespect:1200,total:5,money:13000,respect:950,icon:'🎯'},
    {id:'ch-bank',title:'O Cofre de Chicago',kind:'escape',
      story:'Abra caminho no distrito financeiro, recolha o dinheiro do banco e desapareça do radar policial.',
      target:6,minRespect:3000,money:19000,respect:1250,icon:'🏦'}
  ]
];
const CITY_CONTRACT_PROGRESS={
  completed:[[],[],[]],active:null
};
function cityContractDefinition(id,mapId=currentMapId){
  if(!Number.isInteger(mapId)||mapId<0||mapId>=CITY_CONTRACT_DEFS.length)return null;
  return CITY_CONTRACT_DEFS[mapId].find(d=>d.id===id)||null;
}
function cityContractsCurrent(){
  const a=CITY_CONTRACT_PROGRESS.active;
  if(!a||a.city!==currentMapId)return null;
  return cityContractDefinition(a.id,a.city)?a:null;
}
function cityContractsCompleted(def,city=currentMapId){
  return !!def&&CITY_CONTRACT_PROGRESS.completed[city]?.includes(def.id);
}
function cityContractsValid(data){
  if(!data||typeof data!=='object'||!Array.isArray(data.completed)||data.completed.length!==3)return false;
  for(let city=0;city<3;city++){
    const arr=data.completed[city];
    if(!Array.isArray(arr)||arr.length>3||new Set(arr).size!==arr.length)return false;
    if(!arr.every(id=>!!cityContractDefinition(id,city)))return false;
  }
  const a=data.active;
  if(a===null)return true;
  if(!a||typeof a!=='object'||!Number.isInteger(a.city)||a.city<0||a.city>2)return false;
  const d=cityContractDefinition(a.id,a.city);
  if(!d||data.completed[a.city].includes(a.id)||!Number.isInteger(a.stage)||a.stage<0||a.stage>1)return false;
  if(!Number.isInteger(a.kills)||a.kills<0||a.kills>(d.total||0))return false;
  if(typeof a.wantedStarted!=='boolean')return false;
  if(d.kind==='hunt'&&(a.stage!==0||a.wantedStarted))return false;
  if(d.kind==='escape'&&(a.kills!==0||((a.stage===1)!==a.wantedStarted)))return false;
  if(d.kind==='courier'&&(a.kills!==0||a.wantedStarted))return false;
  return true;
}
function cityContractsSnapshot(){
  return {
    completed:CITY_CONTRACT_PROGRESS.completed.map(a=>[...a]),
    active:CITY_CONTRACT_PROGRESS.active?{...CITY_CONTRACT_PROGRESS.active}:null
  };
}
function cityContractsReset(){
  for(const arr of CITY_CONTRACT_PROGRESS.completed)arr.length=0;
  CITY_CONTRACT_PROGRESS.active=null;
}
function cityContractsMapChange(){
  CITY_CONTRACT_PROGRESS.active=null;
}
function cityContractsRestore(saved){
  if(!cityContractsValid(saved)||(saved.active&&saved.active.city!==currentMapId)){cityContractsReset();return false;}
  CITY_CONTRACT_PROGRESS.completed=saved.completed.map(a=>[...a]);
  CITY_CONTRACT_PROGRESS.active=saved.active?{...saved.active}:null;
  const a=cityContractsCurrent();
  if(a){
    const d=cityContractDefinition(a.id,a.city);
    if(d.kind==='hunt'){
      const remaining=d.total-a.kills;
      const present=ENEMIES.filter(e=>e.cityContractId===d.id&&e.hp>0).length;
      if(present<remaining)cityContractsSpawnHunters(d,remaining-present);
    }
  }
  return true;
}
function cityContractsAvailable(def){
  return !!def&&!BOSS_STATE.active&&!BOSS_STATE.defeated&&
    GS.respect>=def.minRespect;
}
function cityContractsCanStart(def){
  return !!def&&gameSessionStarted&&!mainMenuActive&&!GS.gameOver&&!GS.won&&
    !BUILDING_LOAD.active&&!INTERIOR.active&&!BOSS_STATE.active&&!BOSS_STATE.defeated&&
    !CITY_CONTRACT_PROGRESS.active&&!cityContractsCompleted(def)&&GS.respect>=def.minRespect;
}
function cityContractsSpawnHunters(def,need){
  const place=PROPS[def.target];if(!place||need<=0)return 0;
  const pool=currentMapId===0?['grunt','rush','heavy']:
    currentMapId===1?['rush','heavy','marksman']:['heavy','rush','marksman'];
  let count=0;
  for(let i=0;i<need;i++){
    const theta=(i/need)*Math.PI*2+(currentMapId*.4),dist=125+25*(i%2);
    const p=findFreePoint(place.x+Math.cos(theta)*dist,place.y+Math.sin(theta)*dist,16,190);
    const before=ENEMIES.length;
    spawnEnemy(p.x,p.y,1,pool[(i+(def.total-need))%pool.length]);
    if(ENEMIES.length>before){
      const e=ENEMIES[ENEMIES.length-1];
      e.cityContractId=def.id;
      e.alertDist=Math.max(e.alertDist||0,350);
      e.cityContractTarget=true;
      count++;
    }
  }
  return count;
}
function cityContractsAccept(id){
  const d=cityContractDefinition(id);
  if(!cityContractsCanStart(d))return false;
  const active={id:d.id,city:currentMapId,stage:0,kills:0,wantedStarted:false};
  CITY_CONTRACT_PROGRESS.active=active;
  if(d.kind==='hunt'){
    if(cityContractsSpawnHunters(d,d.total)!==d.total){
      // Avoid saving an impossible elimination contract.
      ENEMIES.splice(0,ENEMIES.length,...ENEMIES.filter(e=>e.cityContractId!==d.id));
      CITY_CONTRACT_PROGRESS.active=null;return false;
    }
  }
  if(typeof sbClose==='function'&&_sbActive)sbClose();
  showMsg('📜 Novo contrato: '+d.title,'i');
  if(typeof misBanner==='function')misBanner();
  if(saveGame())showSaveIndicator();
  return true;
}
function cityContractsAbandon(silent=false){
  const active=CITY_CONTRACT_PROGRESS.active;
  if(!active)return false;
  // Contract targets have no business continuing after the contract ends.
  for(let i=ENEMIES.length-1;i>=0;i--){
    if(ENEMIES[i].cityContractId===active.id)ENEMIES.splice(i,1);
  }
  CITY_CONTRACT_PROGRESS.active=null;
  if(!silent)showMsg('📜 Contrato abandonado. Você poderá reiniciá-lo.','i');
  if(typeof misBanner==='function')misBanner();
  if(!silent&&saveGame())showSaveIndicator();
  return true;
}
function cityContractsFinish(){
  const active=cityContractsCurrent();
  if(!active)return false;
  const d=cityContractDefinition(active.id);
  if(!d||cityContractsCompleted(d))return false;
  CITY_CONTRACT_PROGRESS.completed[currentMapId].push(d.id);
  CITY_CONTRACT_PROGRESS.active=null;
  GS.addMoney(d.money);
  GS.addRespect(d.respect);
  showMsg('✅ Contrato '+d.title+' concluído! +$'+d.money.toLocaleString('pt-BR'),'s');
  if(typeof misBanner==='function')misBanner();
  if(saveGame())showSaveIndicator();
  return true;
}
function cityContractsEnemyDown(enemy){
  const active=cityContractsCurrent();
  if(!active||!enemy||enemy.cityContractId!==active.id)return false;
  const def=cityContractDefinition(active.id);
  if(!def||def.kind!=='hunt')return false;
  active.kills=Math.min(def.total,active.kills+1);
  if(active.kills===def.total)return cityContractsFinish();
  showMsg('🎯 Alvo eliminado: '+active.kills+'/'+def.total,'i');
  if(typeof misBanner==='function')misBanner();
  if(saveGame())showSaveIndicator();
  return true;
}
function cityContractsCurrentTarget(){
  const a=cityContractsCurrent();if(!a)return null;
  const d=cityContractDefinition(a.id),idx=d.kind==='courier'?(a.stage===0?d.pickup:d.target):d.target;
  return PROPS[idx]||null;
}
function cityContractsWaypoint(){
  const a=cityContractsCurrent();if(!a)return null;
  const d=cityContractDefinition(a.id);
  if(d.kind==='escape'&&a.stage===1){
    const sh=typeof nearestSafeTarget==='function'?nearestSafeTarget():null;
    return sh?{x:sh.x,y:sh.y,name:'Desapareça da polícia'}:null;
  }
  if(d.kind==='hunt'){
    // GPS follows the nearest living contract target, even when it leaves
    // the original hideout; tracking only the property could strand the player.
    let nearest=null,nearestDistance=Infinity;
    for(const enemy of ENEMIES){
      if(enemy.cityContractId!==d.id||enemy.hp<=0)continue;
      const distance=Math.hypot(enemy.x-P.x,enemy.y-P.y);
      if(distance<nearestDistance){nearestDistance=distance;nearest=enemy;}
    }
    if(nearest)return {x:nearest.x,y:nearest.y,
      name:'ALVO · '+(d.total-a.kills)+' restante(s)'};
  }
  const target=cityContractsCurrentTarget();
  if(!target)return null;
  const name=d.kind==='courier'?(a.stage===0?'COLETAR · ':'ENTREGAR · '):
    d.kind==='hunt'?'ALVOS · ':'RECUPERAR · ';
  return {x:target.x,y:target.y,name:name+target.name};
}
function cityContractsObjective(){
  const a=cityContractsCurrent();if(!a)return '';
  const d=cityContractDefinition(a.id),target=cityContractsCurrentTarget();
  if(d.kind==='courier')return a.stage===0?
    'Vá até '+(target?.name||'o contato')+' e pressione E para pegar a encomenda.':
    'Leve a encomenda até '+(target?.name||'o destino')+' e pressione E.';
  if(d.kind==='hunt')return 'Elimine os alvos marcados: '+a.kills+'/'+d.total+'.';
  if(a.stage===0)return 'Vá até '+(target?.name||'o local')+' e pressione E para executar o golpe.';
  return 'Despiste a polícia e reduza o nível de procura a zero.';
}
function cityContractsTryInteract(){
  const a=cityContractsCurrent();
  if(!a||GS.inCar||INTERIOR.active||GS.gameOver||GS.won)return false;
  const d=cityContractDefinition(a.id);
  if(d.kind==='hunt'||(d.kind==='escape'&&a.stage===1))return false;
  const target=cityContractsCurrentTarget();
  if(!target||Math.hypot(P.x-target.x,P.y-target.y)>100)return false;
  if(d.kind==='courier'){
    if(a.stage===0){
      a.stage=1;showMsg('📁 Encomenda recolhida. Entregue-a no destino marcado.','s');
      misBanner();if(saveGame())showSaveIndicator();
    }else cityContractsFinish();
  }else{
    // Prevent completing a heist without ever provoking an actual police search.
    if(inSafeZone(P.x,P.y)){showMsg('⚠️ Saia da zona segura antes de executar o golpe.','d');return true;}
    GS.addHeat(68);
    if(GS.stars<2){showMsg('⚠️ A operação não atraiu uma perseguição.','d');return true;}
    a.stage=1;a.wantedStarted=true;
    showMsg('🚨 Golpe executado! Despiste a polícia para receber sua parte.','d');
    misBanner();if(saveGame())showSaveIndicator();
  }
  return true;
}
function cityContractsTick(){
  const a=cityContractsCurrent();if(!a)return;
  const d=cityContractDefinition(a.id);
  if(d.kind==='escape'&&a.stage===1&&a.wantedStarted&&GS.stars===0&&GS.heat<=0){
    cityContractsFinish();
  }
}
function cityContractsRender(){
  const parent=document.getElementById('city-contracts-content');
  if(!parent)return;
  parent.replaceChildren();
  for(const d of CITY_CONTRACT_DEFS[currentMapId]||[]){
    const done=cityContractsCompleted(d),active=cityContractsCurrent()?.id===d.id,
      locked=!done&&!active&&GS.respect<d.minRespect;
    const card=document.createElement('article');
    card.className='city-contract'+(done?' is-done':active?' is-active':locked?' is-locked':'');
    const heading=document.createElement('h4');heading.textContent=d.icon+' '+d.title;
    const description=document.createElement('p');description.textContent=d.story;
    const reward=document.createElement('small');reward.textContent=
      '+$'+d.money.toLocaleString('pt-BR')+' · +'+d.respect+' respeito';
    card.append(heading,description,reward);
    if(active){
      const status=document.createElement('p');status.className='city-contract-status';
      status.textContent=cityContractsObjective();card.appendChild(status);
      const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Abandonar contrato';
      cancel.className='city-contract-btn secondary';cancel.addEventListener('click',()=>{
        cityContractsAbandon();cityContractsRender();
      });card.appendChild(cancel);
    }else if(done){
      const label=document.createElement('span');label.className='city-contract-status';
      label.textContent='✓ CONCLUÍDO';card.appendChild(label);
    }else{
      const button=document.createElement('button');button.type='button';
      button.className='city-contract-btn';
      const reserved=!!cityContractsCurrent();
      button.disabled=locked||reserved||BOSS_STATE.active||BOSS_STATE.defeated;
      button.textContent=locked?'🔒 '+d.minRespect+' respeito necessários':
        reserved?'Conclua o contrato atual':BOSS_STATE.active||BOSS_STATE.defeated?'Indisponível durante o chefe':'Aceitar contrato';
      button.addEventListener('click',()=>cityContractsAccept(d.id));
      card.appendChild(button);
    }
    parent.appendChild(card);
  }
}
