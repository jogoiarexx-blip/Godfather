'use strict';
// Run from repository root: node --test tests/security-tactics.test.cjs
// Node >=18, no npm packages or network access required.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.join(__dirname,'..');
const security=fs.readFileSync(path.join(ROOT,'js/security-tactics.js'),'utf8');
const combat=fs.readFileSync(path.join(ROOT,'js/combat-tactics.js'),'utf8');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');

function makeWorld(){
  const world={
    CFG:{BG_RANGE:280,BG_DIST:65,ESPEED:2,BSPEED:15,EDMG:10},
    GS:{stars:0,inSafe:false},P:{x:100,y:0},
    GUARDS:[],ENEMIES:[],RIVALS:[],POLICE:[],BULLETS:[],
    BOSS_STATE:{active:true,phase:0},
    blocked:false,events:[],spawns:[],
    worldLineBlocked(){return world.blocked;},
    moveTowardWorld(ent,x,y){ent.x+=(x-ent.x)*.45;ent.y+=(y-ent.y)*.45;return true;},
    findFreePoint(x,y){return {x,y};},
    bgDmg(){return 28;},bgShootCd(){return 350;},
    showMsg(t){world.events.push(t);},
    fireAt(x,y,owner,tx,ty,opts){world.BULLETS.push({owner,tx,ty,opts});},
    spawnEnemy(x,y,n,type){world.ENEMIES.push({x,y,hp:100,type});world.spawns.push(type);},
    bossRadialBurst(){world.events.push('ring');},
    addScreenShake(){},
    performance:{now(){return 1000;}},
  };
  vm.createContext(world);
  vm.runInContext(combat,world,{filename:'combat-tactics.js'});
  vm.runInContext(security,world,{filename:'security-tactics.js'});
  return world;
}

test('bodyguards ignore peaceful police, protect player, obey cover',()=>{
  const w=makeWorld(),g={id:0,x:90,y:20,hp:100,maxHp:120,sTimer:0,dead:false};
  w.GUARDS.push(g);
  w.POLICE.push({x:120,y:0,hp:80});
  assert.equal(w.securityGuardThreat(g),null);
  w.GS.stars=2;
  assert.equal(w.securityGuardThreat(g),w.POLICE[0]);
  w.GS.inSafe=true;
  assert.equal(w.securityGuardThreat(g),null);
  w.GS.inSafe=false;w.GS.stars=0;w.POLICE.length=0;
  const e={x:140,y:10,hp:70};
  w.ENEMIES.push(e);
  assert.equal(w.securityGuardThreat(g),e);
  w.securityUpdateGuards(16);
  assert.equal(g.mode,'protect');
  assert.equal(w.BULLETS.length,1);
  assert.equal(w.BULLETS[0].dmg,28);
  w.blocked=true;g.sTimer=0;
  w.securityUpdateGuards(16);
  assert.equal(w.BULLETS.length,1);
  assert.equal(g.mode,'follow');
});

test('dead guards keep damage and replacement timers when saved and loaded',()=>{
  const w=makeWorld(),g={id:0,x:0,y:0,hp:0,maxHp:120,sTimer:400,dead:true,respawnTimer:4500};
  w.GUARDS.push(g);
  const state=w.securityBodyguardState(g);
  assert.equal(w.securityGuardStatesValid([state]),true);
  assert.equal(w.securityGuardStatesValid([{...state,respawnTimer:99999}]),false);
  g.dead=false;g.hp=110;g.respawnTimer=0;
  w.securityRestoreGuards([state]);
  assert.equal(g.dead,true);
  assert.equal(g.hp,0);
  assert.equal(g.respawnTimer,4500);
  w.securityUpdateGuards(50);
  assert.equal(g.respawnTimer,4450);
  for(let i=0;i<89;i++)w.securityUpdateGuards(50);
  assert.equal(g.dead,false);
  assert.equal(g.hp,120);
  assert.equal(w.events.length,1);
});

test('police scans last sighting using simulation time, not wall clock',()=>{
  const w=makeWorld(),p={id:3,lastSeenX:30,lastSeenY:45,searchTimer:1000,searchPhase:0};
  const remembered=w.securityPoliceSearchTarget(p,false,50);
  assert.equal(remembered.x,30);
  assert.equal(remembered.y,45);
  assert.equal(p.searchPhase,0);
  p.searchTimer=0;
  const sweep=w.securityPoliceSearchTarget(p,false,50);
  assert.notEqual(sweep.x,30);
  const phase=p.searchPhase;
  w.securityPoliceSearchTarget(p,false,0);
  assert.equal(p.searchPhase,phase);
  const reacquired=w.securityPoliceSearchTarget(p,true,50);
  assert.equal(reacquired.x,w.P.x);
  assert.equal(p.searchPhase,0);
});

test('boss phases obey total volley damage budgets and minion caps',()=>{
  const w=makeWorld(),b={x:0,y:0,isBoss:true,hp:1500,navSeed:1};
  w.ENEMIES.push(b);
  const bossDef={dmg:25};
  w.securityBossVolley(b,2,bossDef);
  assert.equal(w.BULLETS.length,5);
  const sum=w.BULLETS.reduce((acc,shot)=>acc+shot.opts.dmg,0);
  assert.equal(sum,52.5);
  assert.equal(w.securityBossReinforcements(b,0,0),1);
  assert.equal(w.securityBossReinforcements(b,0,0),1);
  assert.equal(w.securityBossReinforcements(b,0,0),1);
  assert.equal(w.securityBossReinforcements(b,0,0),0);
  assert.equal(w.ENEMIES.length-1,3);
  assert.equal(w.securityBossReinforcements(b,2,2),3);
  assert.equal(w.ENEMIES.length-1,6);
  assert.equal(w.securityBossReinforcements(b,2,2),0);
});

test('boss gets a recovery window after telegraphed attack',()=>{
  const w=makeWorld(),b={x:0,y:0,hp:1000,bossId:'tattaglia',
    bossWarning:null,specialTimer:0,sTimer:0};
  w.P.x=150;
  w.combatBossSpecialTick(b,16,{id:'tattaglia',name:'Don Tattaglia',dmg:20},150);
  assert.equal(b.bossWarning.kind,'fan');
  w.combatBossSpecialTick(b,1020,{id:'tattaglia',name:'Don Tattaglia',dmg:20},150);
  assert.equal(b.bossWarning,null);
  assert.ok(b.sTimer>=620);
});

test('all game JS modules and the inline main script compile',()=>{
  const files=['player-progression.js','weapon-progression.js','combat-tactics.js','security-tactics.js'];
  for(const file of files){
    assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(ROOT,'js',file),'utf8'),{filename:file}));
  }
  const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(inline,'inline main game script must exist');
  assert.doesNotThrow(()=>new vm.Script(inline[1],{filename:'index.html:main.js'}));
  assert.match(html,/ver:\s*21,/);
  assert.match(html,/bodyguardStates:GUARDS\.map\(securityBodyguardState\)/);
  assert.match(html,/securityRestoreGuards\(data\.ver>=21\?data\.bodyguardStates:null\)/);
});
