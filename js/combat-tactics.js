// Godfather v8.10 — tactical enemy AI and readable family-boss specials.
// Classic script: loaded before index.html's inline engine. Gameplay timers run
// only on the simulation delta, so pause/menu does not advance attacks.
const COMBAT_TACTICS={
  grunt:{strafe:1,search:2500,retreat:0,aim:0,burst:1},
  rush:{strafe:1.6,search:3200,retreat:0,aim:0,burst:1},
  heavy:{strafe:.35,search:3800,retreat:0,aim:0,burst:2},
  marksman:{strafe:.65,search:4300,retreat:1,aim:750,burst:1}
};
const COMBAT_BOSS_STYLES={
  barzini:{name:'ANEL DE FOGO',kind:'ring',windup:850},
  tattaglia:{name:'FOGO CRUZADO',kind:'fan',windup:1020},
  stracci:{name:'CERCO DE FERRO',kind:'cross',windup:1180}
};
function combatInitEnemy(e){
  if(!Number.isFinite(e.aiMemory))e.aiMemory=0;
  if(!Number.isFinite(e.aiLastX))e.aiLastX=e.x;
  if(!Number.isFinite(e.aiLastY))e.aiLastY=e.y;
  if(!Number.isFinite(e.strafeTimer))e.strafeTimer=600+(e.navSeed||0)*350;
  if(e.strafeSide!==1&&e.strafeSide!==-1)e.strafeSide=(e.navSeed&1)?1:-1;
  if(!Number.isFinite(e.aimTimer))e.aimTimer=0;
  if(!Number.isFinite(e.aimX))e.aimX=e.x;
  if(!Number.isFinite(e.aimY))e.aimY=e.y;
  if(!Number.isFinite(e.sTimer))e.sTimer=700;
  if(!Number.isFinite(e.wt))e.wt=0;
  if(!Number.isFinite(e.wf))e.wf=0;
}
function combatEnemySerialize(e){
  return {
    aiMemory:Math.max(0,e.aiMemory||0),
    aiLastX:Number.isFinite(e.aiLastX)?e.aiLastX:e.x,
    aiLastY:Number.isFinite(e.aiLastY)?e.aiLastY:e.y,
    strafeSide:e.strafeSide===-1?-1:1,
    strafeTimer:Math.max(0,e.strafeTimer||0),
    aimTimer:Math.max(0,e.aimTimer||0),
    aimX:Number.isFinite(e.aimX)?e.aimX:e.x,
    aimY:Number.isFinite(e.aimY)?e.aimY:e.y
  };
}
function combatReactToHit(e,dmg,zone){
  if(!e||e.isBoss||e.hp<=0)return;
  combatInitEnemy(e);
  e.aiMemory=Math.max(e.aiMemory,3200);
  e.aiLastX=P.x;e.aiLastY=P.y;
  e.state='chase';
  // Heavy enemies resist flinch; a headshot staggers other archetypes briefly.
  if(zone==='head'){
    e.stun=Math.max(e.stun||0,e.type==='heavy'?90:220);
    e.aimTimer=0;
  }else if(dmg>=e.maxHp*.35&&e.type!=='heavy'){
    e.stun=Math.max(e.stun||0,85);
  }
}
function combatMoveIndoor(e,angle,speed,dt){
  const step=speed*(Math.min(dt,34)/16),directions=[0,.44,-.44,.9,-.9];
  for(const offset of directions){
    const ox=e.x,oy=e.y,a=angle+offset;
    moveInteriorEntity(e,Math.cos(a)*step,Math.sin(a)*step,15);
    if(Math.hypot(e.x-ox,e.y-oy)>.015)return true;
  }
  return false;
}
function combatMoveEnemy(e,angle,speed,dt,interior){
  if(interior)return combatMoveIndoor(e,angle,speed,dt);
  return moveTowardWorld(e,e.x+Math.cos(angle)*80,e.y+Math.sin(angle)*80,speed,dt,15,e.navSeed||0);
}
function combatFireEnemy(e,st,interior,tx,ty){
  const shots=(e.type==='heavy'?2:1);
  const dmgScale=e.type==='heavy'?.67:1;
  for(let i=0;i<shots;i++){
    if(interior)fireInteriorEnemy(e,st,tx,ty,dmgScale);
    else fireAt(e.x,e.y,'enemy',tx,ty,{
      spread:st.spread*(shots>1?1.28:1),
      dmg:CFG.EDMG*st.dmgMult*dmgScale,
      range:st.range+120,
      speed:e.type==='marksman'?.95:.75
    });
  }
  e.sprShoot=180;e.fireFx=170;
}
function combatUpdateEnemy(e,dt,interior=false){
  const st=ENEMY_TYPES[e.type]||ENEMY_TYPES.grunt,
    tactic=COMBAT_TACTICS[e.type]||COMBAT_TACTICS.grunt;
  combatInitEnemy(e);
  const step=Math.min(Math.max(dt,0),50);
  // Interior sprite shooting frames must decay even when staggered.
  e.fireFx=Math.max(0,(e.fireFx||0)-step);
  if(e.stun>0){e.stun=Math.max(0,e.stun-step);e.aimTimer=0;return;}
  const dx=P.x-e.x,dy=P.y-e.y,dist=Math.hypot(dx,dy);
  const blocked=interior?
    interiorLineBlocked(e.x,e.y,P.x,P.y,4):
    worldLineBlocked(e.x,e.y,P.x,P.y,5);
  const visible=!blocked&&dist<(e.aiMemory>0?st.alert*1.55:st.alert);
  if(visible){
    e.aiLastX=P.x;e.aiLastY=P.y;
    e.aiMemory=tactic.search;
    e.state='chase';
  }else{
    e.aiMemory=Math.max(0,e.aiMemory-step);
    e.state=e.aiMemory>0?'search':'idle';
    e.aimTimer=0;
  }
  const oldX=e.x,oldY=e.y;
  e.moving=false;
  if(e.state==='idle')return;
  const targetX=visible?P.x:e.aiLastX,
    targetY=visible?P.y:e.aiLastY,
    aimDx=targetX-e.x,aimDy=targetY-e.y,
    targetDist=Math.hypot(aimDx,aimDy),
    angle=Math.atan2(aimDy,aimDx),
    preferred=st.preferred;
  e.angle=angle;
  e.strafeTimer-=step;
  if(e.strafeTimer<=0){
    e.strafeSide*=-1;
    e.strafeTimer=750+Math.random()*800;
  }
  const speed=CFG.ESPEED*st.speed;
  if(targetDist>preferred+28||!visible){
    // Rushers weave into flanking lanes, while cover-aware enemies seek the last
    // position where the player was seen rather than firing through walls.
    let targetAngle=angle;
    if(visible&&e.type==='rush'&&targetDist<260)targetAngle+=e.strafeSide*.28;
    combatMoveEnemy(e,targetAngle,speed,step,interior);
  }else if(visible&&targetDist<preferred-45&&(e.type==='marksman'||e.type==='grunt')){
    combatMoveEnemy(e,angle+Math.PI,speed*.85,step,interior);
  }else if(visible&&e.aimTimer<=0&&dist<st.range&&tactic.strafe){
    // Circling uses short sweeps and does not teleport through buildings/furniture.
    combatMoveEnemy(e,angle+e.strafeSide*Math.PI/2,speed*tactic.strafe*.55,step,interior);
  }
  e.moving=Math.hypot(e.x-oldX,e.y-oldY)>.025;
  e.wt+=step;
  if(e.wt>145){e.wf=(e.wf+1)%6;e.wt=0;}
  if(!visible||dist>st.range){
    e.aimTimer=0;return;
  }
  e.sTimer-=step;
  if(e.type==='marksman'){
    // Aim is locked at the beginning of the tell, so players can dodge it.
    if(e.aimTimer>0){
      e.aimTimer=Math.max(0,e.aimTimer-step);
      if(e.aimTimer===0){
        combatFireEnemy(e,st,interior,e.aimX,e.aimY);
        e.sTimer=st.cdMin+Math.random()*st.cdVar;
      }
    }else if(e.sTimer<=0){
      e.aimX=P.x;e.aimY=P.y;
      e.aimTimer=tactic.aim;
    }
  }else if(e.sTimer<=0){
    combatFireEnemy(e,st,interior,P.x,P.y);
    e.sTimer=st.cdMin+Math.random()*st.cdVar;
  }
}
function combatDrawEnemyTell(ctx,e){
  if(!e||e.type!=='marksman'||(e.aimTimer||0)<=0)return;
  ctx.save();
  ctx.strokeStyle='rgba(255,70,55,.82)';ctx.lineWidth=1.8;
  ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(e.x,e.y-10);
  ctx.lineTo(e.aimX,e.aimY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,95,75,.94)';
  ctx.font='bold 9px Cinzel,serif';ctx.textAlign='center';
  ctx.fillText('ALVO',e.x,e.y-67);
  ctx.restore();
}
function combatBossSignature(b,warning,def){
  const phase=warning.phase;
  const angle=warning.angle;
  if(warning.kind==='ring'){
    // Barzini: broad expanding circle, with predictable radial gaps.
    bossRadialBurst(b,phase,def);
  }else if(warning.kind==='fan'){
    // Tattaglia: locks one direction, leaving safe lanes on either flank.
    const n=5+phase*2,spread=.85+phase*.18;
    for(let i=0;i<n;i++){
      const a=angle+((i/(n-1))-.5)*spread;
      fireAt(b.x,b.y,'enemy',b.x+Math.cos(a)*320,b.y+Math.sin(a)*320,{
        spread:0,dmg:def.dmg*.80,speed:.80,range:630
      });
    }
    addScreenShake(2.5+phase);
  }else if(warning.kind==='cross'){
    // Stracci: crossed fire at 45-degree intervals with a narrow aimed lane.
    for(let i=0;i<8+phase*2;i++){
      const a=angle+i*Math.PI*2/(8+phase*2);
      fireAt(b.x,b.y,'enemy',b.x+Math.cos(a)*360,b.y+Math.sin(a)*360,{
        spread:0,dmg:def.dmg*.78,speed:.76,range:570
      });
    }
    addScreenShake(3.5+phase);
  }
  b.sprShoot=220;
}
function combatBossWarningValid(w){
  return w===null||w===undefined||(
    w&&typeof w==='object'&&
    ['ring','fan','cross'].includes(w.kind)&&
    Number.isFinite(w.remaining)&&w.remaining>=0&&w.remaining<=3000&&
    Number.isFinite(w.duration)&&w.duration>=300&&w.duration<=3000&&
    Number.isFinite(w.angle)&&Math.abs(w.angle)<=Math.PI*2&&
    Number.isInteger(w.phase)&&w.phase>=0&&w.phase<=2
  );
}
function combatBossWarningRestore(b){
  if(!combatBossWarningValid(b.bossWarning))b.bossWarning=null;
}
function combatBossSpecialTick(b,dt,def,dist){
  if(!BOSS_STATE.active||b.hp<=0)return;
  const phase=BOSS_STATE.phase,
    style=COMBAT_BOSS_STYLES[def.id]||COMBAT_BOSS_STYLES.barzini;
  if(b.bossWarning){
    b.bossWarning.remaining=Math.max(0,b.bossWarning.remaining-dt);
    if(b.bossWarning.remaining<=0){
      combatBossSignature(b,b.bossWarning,def);
      b.bossWarning=null;
      b.specialTimer=[4400,3550,2900][phase];
      // Recovery window after a major attack: don't immediately stack a normal
      // volley on the exact frame after the telegraphed pattern is fired.
      b.sTimer=Math.max(Number.isFinite(b.sTimer)?b.sTimer:0,620);
    }
    return;
  }
  b.specialTimer-=dt;
  if(b.specialTimer>0||dist>620)return;
  b.bossWarning={
    kind:style.kind,remaining:style.windup,duration:style.windup,
    angle:Math.atan2(P.y-b.y,P.x-b.x),phase
  };
  b.specialTimer=0;
  showMsg('⚠️ '+def.name+': '+style.name+'! Fuja da área marcada.','d');
}
function combatDrawBossWarning(ctx,b){
  const w=b?.bossWarning;
  if(!combatBossWarningValid(w)||!w)return;
  const t=1-Math.max(0,w.remaining)/Math.max(1,w.duration);
  const progress=Math.max(0,Math.min(1,t));
  ctx.save();ctx.translate(b.x,b.y);
  const alpha=.55+.38*Math.sin(progress*Math.PI);
  ctx.strokeStyle='rgba(255,92,63,'+alpha+')';
  ctx.fillStyle='rgba(205,45,25,'+(.04+.14*progress)+')';
  ctx.lineWidth=2.8+progress*1.8;
  if(w.kind==='fan'){
    const spread=.85+w.phase*.18,rad=190;
    ctx.beginPath();ctx.moveTo(0,0);
    ctx.arc(0,0,rad,w.angle-spread/2,w.angle+spread/2);
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.setLineDash([9,6]);ctx.beginPath();ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(w.angle)*rad,Math.sin(w.angle)*rad);ctx.stroke();
  }else{
    const rad=w.kind==='ring'?170:190;
    ctx.beginPath();ctx.arc(0,0,rad*(.72+.28*progress),0,Math.PI*2);ctx.fill();ctx.stroke();
    if(w.kind==='cross'){
      ctx.setLineDash([7,6]);
      for(let i=0;i<8;i++){
        const a=w.angle+i*Math.PI/4;
        ctx.beginPath();ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);ctx.stroke();
      }
    }
  }
  ctx.setLineDash([]);
  ctx.font='bold 11px Cinzel,serif';ctx.textAlign='center';ctx.fillStyle='#ffe3ac';
  ctx.fillText((COMBAT_BOSS_STYLES[b.bossId]||COMBAT_BOSS_STYLES.barzini).name+' '+Math.ceil(w.remaining/100)/10+'s',0,-87);
  ctx.restore();
}
