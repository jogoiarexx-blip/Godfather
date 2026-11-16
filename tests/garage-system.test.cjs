'use strict';
// Run: node --test tests/garage-system.test.cjs (Node 18+, no dependencies).
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const moduleCode=fs.readFileSync(path.join(root,'js/garage-system.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const carStart=html.indexOf('const CAR = {');
const carEnd=html.indexOf('// VEHICLE PURSUITS / ROADBLOCKS',carStart);
assert.ok(carStart>0&&carEnd>carStart,'CAR object must exist');
const carCode=html.slice(carStart,carEnd);
const run=(w,src)=>vm.runInContext(src,w);

function world(){
  const w={
    MAP_DEFS:[{enemyMult:1,carStart:{x:320,y:480}},{enemyMult:1.5,carStart:{x:300,y:460}}],
    currentMapId:0,gameSessionStarted:true,mainMenuActive:false,
    BUILDING_LOAD:{active:false},INTERIOR:{active:false},BOSS_STATE:{active:false},
    GS:{money:85000,stars:0,inSafe:false,inCar:false,gameOver:false,won:false,paused:false},
    P:{x:320,y:480,damage:0,takeDmg(v){this.damage+=v;}},
    keysDown:new Set(),KB:{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD'},
    PURSUIT:{vehicles:[]},alerts:[],saves:0,
    S(v){return Math.round(v*1.38);},
    findFreePoint(x,y){return {x,y};},
    moveEntityWorld(obj,dx,dy){obj.x+=dx;obj.y+=dy;return true;},
    collidesWorld(){return false;},
    addScreenShake(){},spawnSpark(){},spawnExplosion(){},
    showMsg(m){w.alerts.push(m);},
    saveGame(){w.saves++;return true;},showSaveIndicator(){},
    inViewPoint(){return true;},sbOpen(){},
    performance:{now:()=>1234},
    document:{getElementById(){return null;}}
  };
  vm.createContext(w);
  vm.runInContext(moduleCode,w,{filename:'garage-system.js'});
  vm.runInContext(carCode,w,{filename:'index.html:CAR'});
  run(w,'garageMapInit();P.x=GARAGE_PROGRESS.point.x;P.y=GARAGE_PROGRESS.point.y;');
  return w;
}

test('four vehicles with genuinely distinct physics; no remote or illegal purchase',()=>{
  const w=world();
  assert.equal(run(w,'GARAGE_VEHICLES.length'),4);
  assert.equal(run(w,'garageSelectedModel().id'),'sedan');
  assert.equal(run(w,'garageStats().maxHp'),100);
  assert.equal(run(w,"garageSelect('coupe')"),false);
  w.GS.stars=3;assert.equal(run(w,"garagePurchase('coupe')"),false);
  w.GS.stars=0;w.P.x=9999;assert.equal(run(w,"garagePurchase('coupe')"),false);
  w.P.x=run(w,'GARAGE_PROGRESS.point.x');
  assert.equal(run(w,"garagePurchase('coupe')"),true);
  assert.equal(w.GS.money,79500);
  assert.equal(run(w,"garagePurchase('coupe')"),false);
  assert.equal(run(w,"garageSelect('coupe')"),true);
  assert.equal(run(w,'garageStats().maxHp'),82);
  assert.equal(run(w,'garageStats().maxSpeed'),13);
});

test('three paid upgrade paths preserve HP ratio and do not give free repair',()=>{
  const w=world();
  run(w,"garagePurchase('coupe');garageSelect('coupe');");
  const oldRatio=run(w,'CAR.takeDmg(22);CAR.hp/CAR.maxHp');
  const beforeHp=run(w,'CAR.maxHp');
  assert.equal(run(w,"garageUpgrade('coupe','armor')"),true);
  assert.ok(run(w,'CAR.maxHp')>beforeHp);
  assert.ok(Math.abs(run(w,'CAR.hp/CAR.maxHp')-oldRatio)<.02);
  assert.equal(run(w,"garageUpgrade('coupe','engine')"),true);
  assert.ok(run(w,'garageStats().maxSpeed')>13);
  assert.equal(run(w,"garageUpgrade('coupe','handling')"),true);
  assert.ok(run(w,'garageStats().turn')>.067);
  const cost=run(w,'garageRepairPrice()');
  assert.ok(cost>0);
  const balance=w.GS.money;
  assert.equal(run(w,'garageRepair()'),true);
  assert.equal(w.GS.money,balance-cost);
  assert.equal(run(w,'CAR.hp===CAR.maxHp'),true);
  assert.equal(run(w,'garageRepair()'),false);
});

test('save schema, individual vehicle upgrades and legacy migration',()=>{
  const w=world();
  run(w,"garagePurchase('coupe');garageSelect('coupe');garageUpgrade('coupe','engine');");
  const snapshot=run(w,'garageSave()');
  assert.equal(run(w,'garageSchemaValid(garageSave())'),true);
  assert.equal(snapshot.vehicles.coupe.engine,1);
  const saved=JSON.stringify(snapshot);
  run(w,'garageReset()');
  assert.equal(run(w,'garageSelectedModel().id'),'sedan');
  w.savedGarage=JSON.parse(saved);
  assert.equal(run(w,'garageRestore(savedGarage)'),true);
  assert.equal(run(w,'garageSelectedModel().id'),'coupe');
  w.bad={...snapshot,selected:'armored'};
  assert.equal(run(w,'garageSchemaValid(bad)'),false);
  assert.equal(run(w,'garageRestore(null)'),false);
  assert.equal(run(w,'garageStats().maxHp'),100);
});

test('WASD drives; click route still works; destruction recovers only 25% HP',()=>{
  const w=world();
  w.GS.inCar=true;w.keysDown.add('KeyW');w.keysDown.add('KeyD');
  run(w,'for(let i=0;i<14;i++)CAR.update(16)');
  assert.ok(run(w,'CAR.speed')>0);
  assert.notEqual(run(w,'CAR.angle'),0);
  w.keysDown.clear();
  run(w,'CAR.useTarget=true;CAR.targetX=CAR.x+500;CAR.targetY=CAR.y+120;');
  run(w,'for(let i=0;i<7;i++)CAR.update(16)');
  assert.equal(run(w,'CAR.useTarget'),true);
  w.keysDown.add('KeyS');
  run(w,'CAR.update(16)');
  assert.equal(run(w,'CAR.useTarget'),false);
  w.keysDown.clear();
  run(w,'CAR.takeDmg(99999)');
  assert.equal(w.GS.inCar,false);
  assert.equal(run(w,'CAR.hp'),0);
  assert.equal(run(w,'CAR.recoveryTimer'),8000);
  run(w,'CAR.update(50)');
  assert.equal(run(w,'CAR.recoveryTimer'),7950);
  run(w,'for(let i=0;i<159;i++)CAR.update(50)');
  assert.ok(run(w,'CAR.hp/CAR.maxHp')<=.27);
  assert.equal(w.P.damage,25);
});

test('switching vehicles does not repair destroyed models for free',()=>{
  const w=world();
  run(w,"garagePurchase('coupe');garagePurchase('muscle');garageSelect('coupe');");
  run(w,'CAR.hp=0;CAR.recoveryTimer=8000;');
  assert.equal(run(w,"garageSelect('muscle')"),true);
  assert.equal(run(w,"garageSelect('coupe')"),true);
  assert.equal(run(w,'CAR.hp'),0);
  assert.ok(run(w,'garageRepairPrice()')>0);
  assert.equal(run(w,'garageRepair()'),true);
});

test('main JS and new module compile; save v23 is integrated',()=>{
  new vm.Script(moduleCode);
  const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(inline);
  new vm.Script(inline[1],{filename:'main.js'});
  assert.match(html,/ver:\s*23,/);
  assert.match(html,/garage:garageSave\(\)/);
  assert.match(html,/garageRestore\(data\.ver>=23\?data\.garage:null\)/);
  assert.match(html,/garageMapInit\(\)/);
  assert.match(html,/garageDrawMarker\(ctx\)/);
  assert.match(html,/garageHud\(\)/);
});
