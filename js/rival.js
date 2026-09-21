// ===== IA RIVAL — FAMÍLIA BARZINI =====
const rivalSystem = {
  agents: [],
  thinkTimer: 0,
  expansionPower: 100,
  alertLevel: 0,

  init() {
    for (const p of PROPERTIES.filter(p => {
      const d = DISTRICTS.find(d => d.id === p.district);
      return d && d.owner === 'rival';
    })) {
      this.spawnAgentAt(p.x, p.y);
    }
  },

  spawnAgentAt(x, y) {
    this.agents.push({
      x: x + (Math.random()-0.5)*80, y: y + (Math.random()-0.5)*80,
      hp: CONFIG.RIVAL_HP, maxHp: CONFIG.RIVAL_HP,
      angle: 0, shootTimer: 900 + Math.random()*500,
      state: 'patrol',
      patrolTargetX: x+(Math.random()-0.5)*200, patrolTargetY: y+(Math.random()-0.5)*200,
      home: {x,y}, alertDist: 260,
    });
  },

  think(dt) {
    this.thinkTimer -= dt;
    if (this.thinkTimer <= 0) { this.thinkTimer = CONFIG.RIVAL_THINK_INTERVAL; this._strategize(); }
    this.expansionPower = Math.min(500, this.expansionPower + 0.005*dt);
  },

  _strategize() {
    if (this.expansionPower >= 80 && this.agents.length < 15) {
      const rd = DISTRICTS.filter(d => d.owner === 'rival');
      if (rd.length > 0) {
        const d = rd[Math.floor(Math.random()*rd.length)];
        this.spawnAgentAt(d.x + Math.random()*d.w, d.y + Math.random()*d.h);
        this.expansionPower -= 80;
        showLog('⚠️ Barzini reforça posições!', 'danger');
      }
    }
    if (this.expansionPower >= 200) {
      const pp = PROPERTIES.filter(p => p.owned);
      if (pp.length > 0) {
        const target = pp[Math.floor(Math.random()*pp.length)];
        for (let i = 0; i < 4; i++) {
          this.agents.push({
            x: target.x+(Math.random()-0.5)*200, y: target.y+120+Math.random()*100,
            hp: CONFIG.RIVAL_HP*1.5, maxHp: CONFIG.RIVAL_HP*1.5,
            angle:0, shootTimer:600, state:'raid', raidTarget:target,
            patrolTargetX: target.x, patrolTargetY: target.y,
            home:{x:target.x,y:target.y}, alertDist:320,
          });
        }
        this.expansionPower -= 200;
        showLog(`🔴 BARZINI ATACA: ${target.name}! Defenda!`, 'danger');
        if (window.missionSystem) missionSystem.onEvent('rival_attack');
      }
    }
  },

  update(dt) {
    this.think(dt);
    const scale = dt/16;
    for (let i = this.agents.length-1; i >= 0; i--) {
      const a = this.agents[i];
      const dx = player.x - a.x, dy = player.y - a.y;
      const dist = Math.hypot(dx, dy);
      a.angle = Math.atan2(dy, dx);

      if (a.state === 'raid' && a.raidTarget) {
        const rdx = a.raidTarget.x - a.x, rdy = a.raidTarget.y - a.y;
        const rdist = Math.hypot(rdx, rdy);
        if (dist < a.alertDist) {
          if (dist > 70) { a.x += (dx/dist)*CONFIG.RIVAL_SPEED*scale; a.y += (dy/dist)*CONFIG.RIVAL_SPEED*scale; }
          a.shootTimer -= dt;
          if (a.shootTimer <= 0 && dist < 300) { fireAtPlayer(a.x,a.y,'enemy'); a.shootTimer=700+Math.random()*600; }
        } else if (rdist > 30) {
          a.x += (rdx/rdist)*CONFIG.RIVAL_SPEED*scale; a.y += (rdy/rdist)*CONFIG.RIVAL_SPEED*scale;
        } else {
          if (a.raidTarget.owned) {
            a.raidTarget.owned = false;
            mapSystem.recalcPassiveIncome(); mapSystem.checkDistrictOwnership();
            showLog(`💀 Barzini retomou: ${a.raidTarget.name}!`, 'danger');
            gameState.respect = Math.max(0, gameState.respect - 150);
            if (window.missionSystem) missionSystem.onEvent('property_lost');
          }
          this.agents.splice(i,1); continue;
        }
      } else if (a.state === 'patrol') {
        if (dist < a.alertDist) { a.state = 'chase'; }
        else {
          const pdx=a.patrolTargetX-a.x, pdy=a.patrolTargetY-a.y, pdist=Math.hypot(pdx,pdy);
          if (pdist>20) { a.x+=(pdx/pdist)*CONFIG.RIVAL_SPEED*0.7*scale; a.y+=(pdy/pdist)*CONFIG.RIVAL_SPEED*0.7*scale; }
          else { a.patrolTargetX=a.home.x+(Math.random()-0.5)*220; a.patrolTargetY=a.home.y+(Math.random()-0.5)*180; }
        }
      } else if (a.state === 'chase') {
        if (dist > a.alertDist*1.6) { a.state='patrol'; }
        else if (dist > 70) { a.x+=(dx/dist)*CONFIG.RIVAL_SPEED*scale; a.y+=(dy/dist)*CONFIG.RIVAL_SPEED*scale; }
        a.shootTimer -= dt;
        if (a.shootTimer <= 0 && dist < 280) { fireAtPlayer(a.x,a.y,'enemy'); a.shootTimer=700+Math.random()*700; }
      }

      a.x = Math.max(0, Math.min(CONFIG.WORLD_W, a.x));
      a.y = Math.max(0, Math.min(CONFIG.WORLD_H, a.y));
    }
  },

  checkBulletHit(px, py, cx, cy) {
    const RADIUS = 26;
    for (let i = this.agents.length-1; i >= 0; i--) {
      const a = this.agents[i];
      if (_segCircle(px,py,cx,cy,a.x,a.y,RADIUS)) {
        a.hp -= CONFIG.BULLET_DAMAGE;
        if (a.hp <= 0) {
          this.agents.splice(i,1);
          gameState.addMoney(120); gameState.addRespect(80);
          gameState.killCount++;
          gameState.addHeat(CONFIG.HEAT_PER_KILL*0.5);
          if (window.missionSystem) missionSystem.onEvent('rival_kill');
        }
        return true;
      }
    }
    return false;
  },

  draw(ctx) {
    for (const a of this.agents) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.angle + Math.PI/2);

      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0,6,10,5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1a0a0a'; ctx.fillRect(-8,-22,16,26);
      ctx.fillStyle='#880000'; ctx.fillRect(-2,-18,4,12);
      ctx.fillStyle='#d4b090'; ctx.beginPath(); ctx.arc(0,-30,8,0,Math.PI*2); ctx.fill();
      const isRaid = a.state==='raid';
      ctx.fillStyle = isRaid ? '#660000' : '#2a0000';
      ctx.fillRect(-10,-38,20,5); ctx.fillRect(-7,-44,14,8);

      ctx.restore();
      if (a.state==='raid') { ctx.fillStyle='#ff2200'; ctx.font='13px serif'; ctx.textAlign='center'; ctx.fillText('🔴',a.x,a.y-52); }

      const bw=30, hpPct=a.hp/a.maxHp;
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(a.x-bw/2,a.y-48,bw,4);
      ctx.fillStyle='#aa2222'; ctx.fillRect(a.x-bw/2,a.y-48,bw*hpPct,4);

      if (window.combat && combat.debug) {
        ctx.strokeStyle='rgba(255,0,0,0.5)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(a.x,a.y,26,0,Math.PI*2); ctx.stroke();
      }
    }
  }
};
