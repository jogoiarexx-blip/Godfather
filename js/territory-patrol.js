// Godfather Web Edition v8.14 — property guards patrol the owned district.
// Safehouse sentries are intentionally unchanged. Time uses simulation dt.
const TERRITORY_PATROL={
  edgePadding:35, waypointRadius:20, waitMs:680, stuckMs:1800,
  guardSpeed:1.25, interceptDistance:118, investigationMs:2100,
  territoryDefenceRadius:245, patrolPoints:8
};
const TERRITORY_ROUTE_FRACTIONS=[
  [.17,.18],[.5,.16],[.83,.18],[.85,.5],
  [.83,.82],[.5,.84],[.17,.82],[.15,.5]
];
function territoryDistrict(prop){return DIST.find(d=>d.id===prop.dist)||null;}
function territoryInside(d,x,y,pad=0){
  return !!d&&x>=d.x+pad&&x<=d.x+d.w-pad&&
    y>=d.y+pad&&y<=d.y+d.h-pad;
}
function territoryClamp(d,x,y,pad=TERRITORY_PATROL.edgePadding){
  if(!d)return {x,y};
  const margin=Math.min(pad,Math.max(8,d.w*.12),Math.max(8,d.h*.12));
  return {x:Math.max(d.x+margin,Math.min(d.x+d.w-margin,x)),
    y:Math.max(d.y+margin,Math.min(d.y+d.h-margin,y))};
}
function territoryRouteFor(g,prop){
  const d=territoryDistrict(prop);
  if(!d)return [{x:g.homeX,y:g.homeY}];
  const route=[];
  const slot=(g.slot||0)%3;
  // Eight perimeter checkpoints. Guard slots start in different sectors,
  // and odd slots walk in reverse order to avoid following the same trail.
  for(let i=0;i<TERRITORY_ROUTE_FRACTIONS.length;i++){
    const idx=(slot*3+(slot%2?-i:i)+8)%8,fr=TERRITORY_ROUTE_FRACTIONS[idx];
    // Only patrol the entire district after it belongs to the family.
    // Before full conquest guard the neighborhood immediately around this business.
    const fullControl=d.owner==='player';
    const wanted=fullControl?
      territoryClamp(d,d.x+fr[0]*d.w,d.y+fr[1]*d.h):
      territoryClamp(d,prop.x+(fr[0]-.5)*240,prop.y+(fr[1]-.5)*225);
    const free=findFreePoint(wanted.x,wanted.y,15,130);
    if(territoryInside(d,free.x,free.y,14)){
      route.push({x:free.x,y:free.y});
    }else{
      // A street checkpoint should never make a guard walk out of its turf.
      const backup=territoryClamp(d,(wanted.x+prop.x)/2,(wanted.y+prop.y)/2);
      const alt=findFreePoint(backup.x,backup.y,15,90);
      route.push(territoryInside(d,alt.x,alt.y,14)?alt:
        {x:g.homeX,y:g.homeY});
    }
  }
  return route.length?route:[{x:g.homeX,y:g.homeY}];
}
function territoryPatrolInit(g,prop){
  if(!g||!prop||g.safeId)return;
  g.patrolRoute=territoryRouteFor(g,prop);
  g.routeControl=territoryDistrict(prop)?.owner==='player';
  g.patrolIndex=0;
  g.patrolWait=300+(g.slot||0)*250;
  g.patrolStuck=0;
  g.alertTime=0;
  g.alertX=g.homeX;g.alertY=g.homeY;
  g.mode='patrol';
  g.navSeed=(g.slot||0)%2;
}
function territoryGuardThreat(g,prop){
  const district=territoryDistrict(prop),detectRange=PG_RANGE*guPgRangeMult();
  let selected=null,best=Infinity;
  const pool=[RIVALS,ENEMIES];
  // Do not attack neutral police patrols at 0 stars or from a safe zone.
  if(GS.stars>0&&!GS.inSafe)pool.push(POLICE);
  for(const entries of pool){
    for(const enemy of entries){
      if(!enemy||enemy.dead||enemy.hp<=0)continue;
      const dg=Math.hypot(enemy.x-g.x,enemy.y-g.y);
      const dp=Math.hypot(enemy.x-prop.x,enemy.y-prop.y);
      const raider=enemy.raidTarget===prop||
        (enemy.raidTarget&&enemy.raidTarget.id===prop.id);
      const inside=territoryInside(district,enemy.x,enemy.y);
      // Guarded premises must take priority even if the sentinel is on the
      // opposite side of the district doing a patrol.
      if(!raider&&!(inside&&dg<detectRange*1.4)&&
          !(dp<TERRITORY_PATROL.territoryDefenceRadius&&dg<detectRange*2.2))continue;
      const score=dg*.66+dp*.30+(inside?0:90)-(raider?550:0);
      if(score<best){best=score;selected=enemy;}
    }
  }
  return selected;
}
function territoryGuardMove(g,target,dt,speed,prop){
  const district=territoryDistrict(prop);
  const clamped=territoryClamp(district,target.x,target.y,23);
  const ox=g.x,oy=g.y;
  const wantedAngle=Math.atan2(clamped.y-g.y,clamped.x-g.x);
  if(Math.hypot(clamped.x-g.x,clamped.y-g.y)>7){
    moveTowardWorld(g,clamped.x,clamped.y,speed,dt,15,g.navSeed);
  }
  // The navigation helper has its own wall avoidance, but the goal itself
  // must always remain inside the district. Guard never gets a chase order
  // outside the owned turf.
  // Collision steering must not push patrols beyond their protected district.
  if(district&&!territoryInside(district,g.x,g.y,-8)){
    g.x=ox;g.y=oy;
  }
  const distance=Math.hypot(g.x-ox,g.y-oy);
  g.moving=distance>.055;
  if(g.moving)g.angle=wantedAngle;
  return distance;
}
function territoryPatrolTick(g,dt,prop){
  if(!g||g.dead||!prop?.owned)return;
  const controlled=territoryDistrict(prop)?.owner==='player';
  if(!Array.isArray(g.patrolRoute)||!g.patrolRoute.length||
      g.routeControl!==controlled)territoryPatrolInit(g,prop);
  const step=Math.max(0,Math.min(34,dt));
  const enemy=territoryGuardThreat(g,prop);
  const speed=PG_SPEED*TERRITORY_PATROL.guardSpeed*(1+(g.slot||0)*.06);
  g.sTimer=Math.max(0,g.sTimer-step);
  g.moving=false;
  if(enemy){
    g.mode='defend';g.alertX=enemy.x;g.alertY=enemy.y;
    g.alertTime=TERRITORY_PATROL.investigationMs;
    const dx=enemy.x-g.x,dy=enemy.y-g.y,dist=Math.hypot(dx,dy);
    const visible=!worldLineBlocked(g.x,g.y,enemy.x,enemy.y,4);
    if(dist>TERRITORY_PATROL.interceptDistance||!visible){
      territoryGuardMove(g,{x:enemy.x,y:enemy.y},step,speed*1.14,prop);
    }
    // Face enemy even when strafe/movement has finished.
    g.angle=Math.atan2(enemy.y-g.y,enemy.x-g.x);
    const currentDist=Math.hypot(enemy.x-g.x,enemy.y-g.y);
    if(currentDist<=PG_RANGE*guPgRangeMult()&&g.sTimer<=0&&
        !worldLineBlocked(g.x,g.y,enemy.x,enemy.y,4)){
      const a=g.angle+((Math.random()-.5)*.14);
      BULLETS.push({
        x:g.x,y:g.y,px:g.x,py:g.y,
        vx:Math.cos(a)*CFG.BSPEED*.85,
        vy:Math.sin(a)*CFG.BSPEED*.85,
        dist:0,owner:'player',dmg:Math.round(22*guPgDmgMult()),
        range:PG_RANGE*guPgRangeMult()+80
      });
      g.sprShoot=180;
      g.sTimer=Math.round(PG_SHOOT/Math.sqrt(guPgDmgMult()))+Math.random()*300;
    }
  }else if(g.alertTime>0){
    g.mode='investigate';
    g.alertTime=Math.max(0,g.alertTime-step);
    const last=territoryClamp(territoryDistrict(prop),g.alertX,g.alertY);
    if(Math.hypot(last.x-g.x,last.y-g.y)>24){
      territoryGuardMove(g,last,step,speed,prop);
    }else g.alertTime=0;
  }else{
    g.mode='patrol';
    const wp=g.patrolRoute[g.patrolIndex%g.patrolRoute.length];
    if(!wp){territoryPatrolInit(g,prop);return;}
    const goalDist=Math.hypot(wp.x-g.x,wp.y-g.y);
    if(goalDist<TERRITORY_PATROL.waypointRadius){
      g.patrolWait-=step;
      g.patrolStuck=0;
      if(g.patrolWait<=0){
        g.patrolIndex=(g.patrolIndex+1)%g.patrolRoute.length;
        g.patrolWait=TERRITORY_PATROL.waitMs+((g.slot||0)*170);
      }
    }else{
      const moved=territoryGuardMove(g,wp,step,speed,prop);
      if(moved<.055){
        g.patrolStuck+=step;
        if(g.patrolStuck>=TERRITORY_PATROL.stuckMs){
          // Never keep a sentry frozen against a blocked building forever.
          g.patrolIndex=(g.patrolIndex+1)%g.patrolRoute.length;
          g.patrolStuck=0;g.patrolWait=220;
        }
      }else g.patrolStuck=0;
    }
    g.sTimer=Math.min(PG_SHOOT,g.sTimer+step*.5);
  }
  g.wt=(g.wt||0)+step;
  if(g.wt>=200){g.wf=((g.wf||0)+1)%6;g.wt-=200;}
}
function territoryGuardSnapshot(){
  return PROP_GUARDS.filter(g=>g.propId!==null&&!g.safeId).map(g=>({
    propId:g.propId,slot:g.slot,
    x:g.x,y:g.y,hp:Math.max(0,g.hp),dead:!!g.dead,
    respawnTimer:g.dead?Math.max(0,Math.min(20000,g.respawnTimer)):0,
    patrolIndex:Math.max(0,Math.min(7,g.patrolIndex|0)),
    patrolWait:Math.max(0,Math.min(3000,g.patrolWait||0)),
    alertTime:Math.max(0,Math.min(2100,g.alertTime||0))
  }));
}
function territoryGuardSchemaValid(saved){
  if(!Array.isArray(saved)||saved.length>36)return false;
  const keys=new Set();
  for(const v of saved){
    if(!v||!Number.isInteger(v.propId)||v.propId<0||v.propId>11||
       !Number.isInteger(v.slot)||v.slot<0||v.slot>2||
       typeof v.dead!=='boolean'||!Number.isFinite(v.x)||!Number.isFinite(v.y)||
       v.x<0||v.y<0||v.x>CFG.WW||v.y>CFG.WH||
       !Number.isFinite(v.hp)||v.hp<0||v.hp>2000||
       !Number.isFinite(v.respawnTimer)||v.respawnTimer<0||v.respawnTimer>20000||
       !Number.isInteger(v.patrolIndex)||v.patrolIndex<0||v.patrolIndex>7||
       !Number.isFinite(v.patrolWait)||v.patrolWait<0||v.patrolWait>3000||
       !Number.isFinite(v.alertTime)||v.alertTime<0||v.alertTime>2100||
       (v.dead&&v.hp!==0)||(!v.dead&&v.hp<=0))return false;
    const key=v.propId+':'+v.slot;
    if(keys.has(key))return false;
    keys.add(key);
  }
  return true;
}
function territoryGuardRestore(saved){
  if(!territoryGuardSchemaValid(saved))return false;
  const cache=new Map(saved.map(v=>[v.propId+':'+v.slot,v]));
  for(const g of PROP_GUARDS){
    if(g.propId===null||g.safeId)continue;
    const state=cache.get(g.propId+':'+g.slot);
    if(!state)continue;
    const prop=PROPS.find(p=>p.id===g.propId),d=prop&&territoryDistrict(prop);
    if(!prop||!territoryInside(d,state.x,state.y,-20))continue;
    const point=findFreePoint(state.x,state.y,15,70);
    if(!territoryInside(d,point.x,point.y,-20))continue;
    g.x=point.x;g.y=point.y;
    g.dead=state.dead;
    g.hp=state.dead?0:Math.min(g.maxHp,state.hp);
    g.respawnTimer=state.dead?state.respawnTimer:0;
    g.patrolIndex=state.patrolIndex;
    g.patrolWait=state.patrolWait;
    g.patrolStuck=0;
    g.alertTime=0; // stale enemy targets are invalid after map reload
    g.mode=state.dead?'down':'patrol';
  }
  return true;
}
