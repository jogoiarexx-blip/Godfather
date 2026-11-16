'use strict';
// Run from repository root: node --test tests/city-contracts.test.cjs
// No network, dependencies or browser required (Node >=18).
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/city-contracts.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

function setup(city=0){
  const w={
    currentMapId:city,gameSessionStarted:true,mainMenuActive:false,_sbActive:'mis',
    BOSS_STATE:{active:false,defeated:false},BUILDING_LOAD:{active:false},INTERIOR:{active:false},
    P:{x:100,y:40},ENEMIES:[],spawns:[],notices:[],saved:0,closed:0,
    PROPS:Array.from({length:12},(_,i)=>({id:i,name:'Propriedade '+i,x:100+i*210,y:40+i*80,owned:false})),
    GS:{respect:10000,money:1000,heat:0,stars:0,inCar:false,gameOver:false,won:false,
      addMoney(v){this.money+=v;},addRespect(v){this.respect+=v;},
      addHeat(v){this.heat=Math.min(100,this.heat+v);this.stars=Math.floor(this.heat/20);}},
    findFreePoint(x,y){return {x,y};},
    spawnEnemy(x,y,n,type){w.ENEMIES.push({x,y,hp:60,type,alertDist:220});w.spawns.push(type);},
    showMsg(t){w.notices.push(t);},showSaveIndicator(){},misBanner(){},
    saveGame(){w.saved++;return true;},sbClose(){w.closed++;w._sbActive=null;},
    inSafeZone(){return false;},nearestSafeTarget(){return {x:330,y:440,name:'Casa Segura'};},
    document:{getElementById(){return null;}}
  };
  vm.createContext(w);
  vm.runInContext(source,w,{filename:'city-contracts.js'});
  return w;
}

test('nine unique authored contracts across all cities',()=>{
  const w=setup();
  const defs=w.CITY_CONTRACT_DEFS; // lexical const exposed below instead of context prop
  const facts=vm.runInContext('CITY_CONTRACT_DEFS.map(x=>x.map(d=>d.id))',w);
  assert.equal(facts.length,3);
  assert.deepEqual(facts.map(a=>a.length),[3,3,3]);
  const ids=facts.flat();
  assert.equal(new Set(ids).size,9);
});

test('courier requires pickup and a different delivery interaction',()=>{
  const w=setup();
  assert.equal(w.cityContractsAccept('nc-documents'),true);
  assert.equal(w.cityContractsCurrent().stage,0);
  assert.equal(w.cityContractsWaypoint().x,w.PROPS[0].x);
  assert.equal(w.cityContractsTryInteract(),true);
  assert.equal(w.cityContractsCurrent().stage,1);
  assert.equal(w.cityContractsWaypoint().x,w.PROPS[5].x);
  assert.equal(w.cityContractsTryInteract(),false);
  w.P.x=w.PROPS[5].x;w.P.y=w.PROPS[5].y;
  const before=w.GS.money;
  assert.equal(w.cityContractsTryInteract(),true);
  assert.equal(w.GS.money,before+1800);
  assert.equal(w.cityContractsCurrent(),null);
  assert.equal(w.cityContractsAccept('nc-documents'),false);
});

test('takedown counts only tagged targets and restores missing saved targets',()=>{
  const w=setup();
  assert.equal(w.cityContractsAccept('nc-dock-hit'),true);
  assert.equal(w.ENEMIES.filter(e=>e.cityContractId==='nc-dock-hit').length,3);
  assert.equal(w.cityContractsEnemyDown({cityContractId:'unrelated'}),false);
  const save=w.cityContractsSnapshot();
  w.ENEMIES.length=0;
  assert.equal(w.cityContractsRestore(save),true);
  assert.equal(w.ENEMIES.length,3);
  for(let k=0;k<3;k++){
    const enemy=w.ENEMIES.pop();
    w.cityContractsEnemyDown(enemy);
  }
  assert.equal(w.cityContractsCurrent(),null);
  assert.equal(w.cityContractsCompleted({id:'nc-dock-hit'}),true);
});

test('heist requires action followed by genuinely clearing police heat',()=>{
  const w=setup();
  w.P.x=w.PROPS[8].x;w.P.y=w.PROPS[8].y;
  assert.equal(w.cityContractsAccept('nc-vault'),true);
  assert.equal(w.cityContractsTryInteract(),true);
  assert.ok(w.GS.stars>=2);
  assert.equal(w.cityContractsCurrent().stage,1);
  w.cityContractsTick();
  assert.notEqual(w.cityContractsCurrent(),null);
  w.GS.stars=0;w.GS.heat=0;
  w.cityContractsTick();
  assert.equal(w.cityContractsCurrent(),null);
  assert.equal(w.cityContractsAccept('nc-vault'),false);
});

test('abandons clear tagged targets; progress survives city changes',()=>{
  const w=setup();
  assert.equal(w.cityContractsAccept('nc-documents'),true);
  w.P.x=w.PROPS[0].x;w.P.y=w.PROPS[0].y;
  w.cityContractsTryInteract();
  w.P.x=w.PROPS[5].x;w.P.y=w.PROPS[5].y;
  w.cityContractsTryInteract();
  assert.equal(w.cityContractsAccept('nc-dock-hit'),true);
  const targetCount=w.ENEMIES.length;
  assert.ok(targetCount>=3);
  assert.equal(w.cityContractsAbandon(),true);
  assert.equal(w.ENEMIES.some(e=>e.cityContractId==='nc-dock-hit'),false);
  const snapshot=w.cityContractsSnapshot();
  w.cityContractsReset();
  assert.equal(w.cityContractsRestore(snapshot),true);
  assert.equal(w.cityContractsCompleted({id:'nc-documents'}),true);
  w.currentMapId=1;w.cityContractsMapChange();
  assert.equal(w.cityContractsCurrent(),null);
  assert.equal(w.cityContractsCompleted({id:'nc-documents'},0),true);
});

test('reject malformed completion, active mission state and duplicate rewards',()=>{
  const w=setup();
  const saved=w.cityContractsSnapshot();
  assert.equal(w.cityContractsValid(saved),true);
  assert.equal(w.cityContractsValid({...saved,completed:[['nc-documents','nc-documents'],[],[]]}),false);
  assert.equal(w.cityContractsValid({...saved,active:{id:'bogus',city:0,stage:0,kills:0,wantedStarted:false}}),false);
  assert.equal(w.cityContractsValid({...saved,active:{id:'nc-documents',city:0,stage:2,kills:0,wantedStarted:false}}),false);
  assert.equal(w.cityContractsValid({...saved,active:{id:'nc-documents',city:0,stage:0,kills:0,wantedStarted:false}}),true);
});

test('game integration loads before inline, uses GPS and save v22',()=>{
  new vm.Script(source,{filename:'city-contracts.js'});
  const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(inline);
  new vm.Script(inline[1],{filename:'main.js'});
  assert.match(html,/js\/city-contracts\.js/);
  assert.match(html,/cityContractsTryInteract\(\)/);
  assert.match(html,/cityContractsEnemyDown\(dead\)/);
  assert.match(html,/cityContractsEnemyDown\(a\)/);
  assert.match(html,/cityContractsWaypoint\(\)/);
  assert.match(html,/ver:\s*22,/);
  assert.match(html,/cityContractsRestore\(data\.ver>=22/);
});
