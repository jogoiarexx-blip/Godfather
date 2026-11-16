// Godfather Web Edition v8.11 — escort tactics, police searches and boss combat budgets.
// This module is loaded ahead of the embedded game script. Timers use simulation dt
// so pausing the game does not advance searches or guard recovery.
const SECURITY_RULES={
  escortLeash:230, protectRadius:145, guardEngageFactor:.92, searchRadius:115,
  bodyguardRespawnMs:15000,
  bossVolleyCounts:[1,3,5],bossVolleyTotalDamage:[1,1.65,2.10],
  bossReinforceCaps:[3,4,5]
};
function securityGuardThreat(g){
  if(!g||g.dead)return null;
  const maxRange=CFG.BG_RANGE||230;
  let best=null,score=Infinity;
  // Police are NOT a target when the player is not actively wanted. In particular,
  // a remaining patrol officer at 0 stars must not provoke new hostilities.
  const collections=[ENEMIES,RIVALS];
  if(GS.stars>0&&!GS.inSafe)collections.push(POLICE);
  for(const list of collections){
    for(const target of list){
      if(!target||target.dead||target.hp<=0)continue;
      const dg=Math.hypot(target.x-g.x,target.y-g.y);
      const dp=Math.hypot(target.x-P.x,target.y-P.y);
      if(dg>maxRange*1.30||dp>SECURITY_RULES.escortLeash+maxRange*.65)continue;
      if(worldLineBlocked(g.x,g.y,target.x,target.y,4))continue;
      // Threats threatening the player take precedence over targets that happen to
      // be slightly closer to the guard.
      const priority=target.isBoss?18:0;
      const value=dg*.50+dp*.65+priority;
      if(value<score){score=value;best=target;}
    }
  }
  return best;
}
function securityBodyguardState(g){
  return {dead:!!g.dead,
    hp:g.dead?0:Math.max(0,Number.isFinite(g.hp)?g.hp:0),
    respawnTimer:g.dead?Math.max(0,Number.isFinite(g.respawnTimer)?g.respawnTimer:0):0,
    sTimer:Math.max(0,Number.isFinite(g.sTimer)?g.sTimer:0)
  };
}
function securityGuardStatesValid(data){
  return Array.isArray(data)&&data.length<=8&&data.every(g=>
    g&&typeof g==='object'&&typeof g.dead==='boolean'&&
    Number.isFinite(g.hp)&&g.hp>=0&&g.hp<=1500&&
    Number.isFinite(g.respawnTimer)&&g.respawnTimer>=0&&g.respawnTimer<=SECURITY_RULES.bodyguardRespawnMs&&
    Number.isFinite(g.sTimer)&&g.sTimer>=0&&g.sTimer<=30000);
}
function securityRestoreGuards(data){
  if(!securityGuardStatesValid(data))return;
  for(let i=0;i<Math.min(GUARDS.length,data.length);i++){
    const g=GUARDS[i],saved=data[i];
    g.dead=saved.dead;
    g.hp=saved.dead?0:Math.min(g.maxHp,Math.max(1,saved.hp));
    g.respawnTimer=saved.dead?saved.respawnTimer:0;
    g.sTimer=saved.sTimer;
    g.mode=saved.dead?'recover':'follow';
  }
}
function securityUpdateGuards(dt){
  const count=GUARDS.length,step=Math.min(Math.max(0,dt),50);
  if(!count)return;
  for(const g of GUARDS){
    if(g.dead){
      g.mode='recover';
      g.respawnTimer=Math.max(0,g.respawnTimer-step);
      if(g.respawnTimer===0){
        g.dead=false;g.hp=g.maxHp;
        const angle=(g.id/count)*Math.PI*2;
        const fp=findFreePoint(P.x+Math.cos(angle)*65,P.y+Math.sin(angle)*65,15,120);
        g.x=fp.x;g.y=fp.y;
        g.sTimer=500;g.mode='follow';
        showMsg('👤 Guarda substituído.','i');
      }
      continue;
    }
    const side=(g.id/count)*Math.PI*2;
    const baseX=P.x+Math.cos(side)*CFG.BG_DIST,baseY=P.y+Math.sin(side)*CFG.BG_DIST;
    let tx=baseX,ty=baseY;
    const target=securityGuardThreat(g);
    g.mode=target?'engage':'follow';
    if(target){
      const distPlayer=Math.hypot(target.x-P.x,target.y-P.y);
      // If someone is close to the Don, the guard tries to interpose on the
      // threat's line to the player while staying within an escort leash.
      if(distPlayer<SECURITY_RULES.protectRadius){
        const angle=Math.atan2(target.y-P.y,target.x-P.x);
        tx=P.x+Math.cos(angle)*Math.min(80,distPlayer*.55);
        ty=P.y+Math.sin(angle)*Math.min(80,distPlayer*.55);
        g.mode='protect';
      }else{
        // Hold near the player rather than blindly rushing across the map.
        const angle=Math.atan2(target.y-P.y,target.x-P.x);
        const offset=((g.id&1)?1:-1)*.38;
        tx=P.x+Math.cos(angle+offset)*Math.min(CFG.BG_DIST*1.6,100);
        ty=P.y+Math.sin(angle+offset)*Math.min(CFG.BG_DIST*1.6,100);
      }
    }
    const distGoal=Math.hypot(tx-g.x,ty-g.y);
    const ox=g.x,oy=g.y;
    if(distGoal>12){
      const spd=Math.min(6,Math.max(CFG.ESPEED*.78,distGoal*.095));
      moveTowardWorld(g,tx,ty,spd,step,15,g.id);
    }
    g.moving=Math.hypot(g.x-ox,g.y-oy)>.055;
    if(target&&!worldLineBlocked(g.x,g.y,target.x,target.y,4)){
      const dist=Math.hypot(target.x-g.x,target.y-g.y);
      if(dist<CFG.BG_RANGE){
        g.angle=Math.atan2(target.y-g.y,target.x-g.x);
        g.sTimer-=step;
        if(g.sTimer<=0){
          // Friendly shots keep their existing collision rules and use the
          // current guard damage/cadence upgrades.
          const a=g.angle+((g.id&1)?.018:-.018);
          BULLETS.push({x:g.x,y:g.y,px:g.x,py:g.y,
            vx:Math.cos(a)*CFG.BSPEED*.9,vy:Math.sin(a)*CFG.BSPEED*.9,
            dist:0,owner:'player',dmg:bgDmg(),range:CFG.BG_RANGE+70});
          g.sprShoot=180;
          g.sTimer=bgShootCd()+Math.random()*180;
        }
      }
    }else g.sTimer=Math.max(0,g.sTimer-step*.30);
  }
}
function securityPoliceSearchTarget(p,visible,dt){
  const lx=Number.isFinite(p.lastSeenX)?p.lastSeenX:P.x;
  const ly=Number.isFinite(p.lastSeenY)?p.lastSeenY:P.y;
  if(visible){
    p.searchPhase=0;
    return {x:P.x,y:P.y};
  }
  if(p.searchTimer>0)return {x:lx,y:ly};
  // Deterministic search around last sighting; simulation time replaces Date.now,
  // so pause, low FPS and loading a saved chase do not teleport search targets.
  p.searchPhase=(Number.isFinite(p.searchPhase)?p.searchPhase:0)+Math.min(Math.max(dt,0),50)*.0006;
  if(p.searchPhase>Math.PI*2)p.searchPhase-=Math.PI*2;
  const a=p.searchPhase+(p.id||0)*2.3999632297;
  const radius=SECURITY_RULES.searchRadius;
  return {x:lx+Math.cos(a)*radius,y:ly+Math.sin(a)*radius};
}
function securityPoliceRecord(p){
  return Number.isFinite(p.searchPhase)?Math.max(0,Math.min(Math.PI*2,p.searchPhase)):0;
}
function securityBossVolley(b,phase,def){
  const lvl=Math.max(0,Math.min(2,Math.floor(phase)||0));
  const count=SECURITY_RULES.bossVolleyCounts[lvl];
  const budget=def.dmg*SECURITY_RULES.bossVolleyTotalDamage[lvl];
  const dmg=budget/count;
  const spread=[.07,.19,.29][lvl];
  for(let i=0;i<count;i++){
    fireAt(b.x,b.y,'enemy',P.x,P.y,{spread,dmg,range:620});
  }
  b.sprShoot=220;
  return {count,budget,dmg};
}
function securityBossReinforcements(b,phase,city){
  const lvl=Math.max(0,Math.min(2,Math.floor(phase)||0));
  const cap=SECURITY_RULES.bossReinforceCaps[lvl]+Math.min(1,Math.max(0,city|0));
  const active=ENEMIES.filter(e=>!e.isBoss&&e.hp>0).length;
  const count=Math.min(Math.max(0,cap-active),1+lvl);
  const roster=city===0?['grunt','rush','heavy']:
    city===1?['rush','heavy','marksman']:['heavy','rush','marksman'];
  for(let i=0;i<count;i++){
    const theta=(i/Math.max(1,count))*Math.PI*2+(b.navSeed||0);
    const radius=140+lvl*25;
    const pt=findFreePoint(b.x+Math.cos(theta)*radius,b.y+Math.sin(theta)*radius,15,160);
    spawnEnemy(pt.x,pt.y,1,roster[(i+lvl)%roster.length]);
  }
  return count;
}
