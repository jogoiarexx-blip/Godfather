'use strict';
// Reproduce: node --test tests/territory-patrol.test.cjs (Node >=18, no deps).
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'js/territory-patrol.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function world(owner='player'){
  const w={
    DIST:[{id:0,x:0,y:0,w:700,h:540,owner}],
    PROPS:[{id:0,dist:0,x:340,y:260,name:'Negócio',owned:true,ul:3}],
    PROP_GUARDS:[],RIVALS:[],ENEMIES:[],POLICE:[],BULLETS:[],
    GS:{stars:0,inSafe:false},CFG:{WW:1000,WH:750,BSPEED:14},
    PG_RANGE:210,PG_SHOOT:1100,PG_SPEED:.9,
    blocked:false,noMovement:false,
    guPgRangeMult(){return 1.3;},guPgDmgMult(){return 1.5;},
    findFreePoint(x,y){return {x,y};},
    worldLineBlocked(){return w.blocked;},
    moveTowardWorld(g,x,y,speed,dt){
      if(w.noMovement)return false;
      const dx=x-g.x,dy=y-g.y,d=Math.hypot(dx,dy);
      if(d<.00001)return false;
      const step=Math.min(speed*dt/16,d);
      g.x+=dx/d*step;g.y+=dy/d*step;return true;
    }
  };
  vm.createContext(w);
  vm.runInContext(source,w,{filename:'territory-patrol.js'});
  return w;
}
function guard(slot=0){
  return {x:365,y:270,homeX:365,homeY:270,hp:100,maxHp:100,
    propId:0,safeId:null,slot,dead:false,respawnTimer:0,
    sTimer:0,wf:0,wt:0};
}
test('each of three guards follows an independent collision-safe district route',()=>{
  const w=world(),p=w.PROPS[0],guards=[guard(0),guard(1),guard(2)];
  guards.forEach(g=>w.territoryPatrolInit(g,p));
  guards.forEach(g=>{
    assert.equal(g.patrolRoute.length,8);
    assert.ok(g.patrolRoute.every(q=>w.territoryInside(w.DIST[0],q.x,q.y,18)));
  });
  assert.notEqual(guards[0].patrolRoute[0].x,guards[1].patrolRoute[0].x);
  assert.notEqual(guards[1].patrolRoute[0].x,guards[2].patrolRoute[0].x);
  const g=guards[0],sx=g.x,sy=g.y;
  for(let i=0;i<160;i++)w.territoryPatrolTick(g,34,p);
  assert.equal(g.mode,'patrol');
  assert.ok(Math.hypot(g.x-sx,g.y-sy)>65);
  assert.ok(w.territoryInside(w.DIST[0],g.x,g.y,-8));
});
test('patrol expands when whole district is captured and shrinks on loss',()=>{
  const w=world('rival'),p=w.PROPS[0],g=guard();
  w.territoryPatrolInit(g,p);
  const span=route=>Math.max(...route.map(q=>q.x))-Math.min(...route.map(q=>q.x));
  const near=span(g.patrolRoute);
  w.DIST[0].owner='player';w.territoryPatrolTick(g,16,p);
  assert.equal(g.routeControl,true);
  assert.ok(span(g.patrolRoute)>near+130);
  w.DIST[0].owner='rival';w.territoryPatrolTick(g,16,p);
  assert.equal(g.routeControl,false);
  assert.ok(span(g.patrolRoute)<near+10);
});
test('guards prioritize raid, do not shoot through walls or attack peaceful police',()=>{
  const w=world(),p=w.PROPS[0],g=guard();
  w.territoryPatrolInit(g,p);
  w.POLICE.push({x:g.x+25,y:g.y+20,hp:100});
  assert.equal(w.territoryGuardThreat(g,p),null);
  w.GS.stars=2;
  assert.equal(w.territoryGuardThreat(g,p),w.POLICE[0]);
  w.GS.inSafe=true;
  assert.equal(w.territoryGuardThreat(g,p),null);
  w.GS.inSafe=false;w.GS.stars=0;w.POLICE.length=0;
  const raider={x:g.x+70,y:g.y+40,hp:120,raidTarget:p};
  w.RIVALS.push(raider);
  w.territoryPatrolTick(g,16,p);
  assert.equal(g.mode,'defend');
  assert.equal(w.BULLETS.length,1);
  assert.equal(w.BULLETS[0].dmg,33);
  w.blocked=true;g.sTimer=0;
  w.territoryPatrolTick(g,16,p);
  assert.equal(w.BULLETS.length,1);
  w.blocked=false;w.RIVALS.length=0;
  w.territoryPatrolTick(g,16,p);
  assert.equal(g.mode,'investigate');
  for(let i=0;i<115;i++)w.territoryPatrolTick(g,24,p);
  assert.equal(g.mode,'patrol');
});
test('patrol skips blocked checkpoints instead of standing still indefinitely',()=>{
  const w=world(),g=guard(),p=w.PROPS[0];
  w.territoryPatrolInit(g,p);w.noMovement=true;g.patrolWait=0;
  for(let i=0;i<60;i++)w.territoryPatrolTick(g,34,p);
  assert.notEqual(g.patrolIndex,0);
});
test('save validation preserves dead and living guards and rejects corrupt data',()=>{
  const w=world(),g=guard(),p=w.PROPS[0];
  w.territoryPatrolInit(g,p);w.PROP_GUARDS.push(g);
  g.dead=true;g.hp=0;g.respawnTimer=17000;g.patrolIndex=4;
  const saved=w.territoryGuardSnapshot();
  assert.equal(w.territoryGuardSchemaValid(saved),true);
  assert.equal(w.territoryGuardSchemaValid(saved.concat(saved)),false);
  assert.equal(w.territoryGuardSchemaValid([{...saved[0],x:4000}]),false);
  assert.equal(w.territoryGuardSchemaValid([{...saved[0],patrolIndex:9}]),false);
  g.dead=false;g.hp=100;g.respawnTimer=0;g.patrolIndex=0;
  assert.equal(w.territoryGuardRestore(saved),true);
  assert.equal(g.dead,true);
  assert.equal(g.hp,0);
  assert.equal(g.respawnTimer,17000);
  assert.equal(g.patrolIndex,4);
  assert.equal(w.territoryGuardRestore(null),false);
});
test('safehouse sentinels remain fixed posts and main engine compiles',()=>{
  new vm.Script(source);
  const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/);
  assert.ok(inline);new vm.Script(inline[1]);
  assert.match(html,/if\(prop\)\{territoryPatrolTick\(g,dt,prop\);continue;\}/);
  assert.match(html,/territoryPatrolInit\(guard,prop\)/);
  assert.match(html,/ver:\s*24,/);
  assert.match(html,/territoryGuards:territoryGuardSnapshot\(\)/);
  assert.match(html,/territoryGuardRestore\(data\.ver>=24\?/);
});
