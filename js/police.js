// ===== POLÍCIA =====
const policeSystem = {
  units: [],
  spawnTimer: 0,
  maxUnits: 12,

  update(dt) {
    if (gameState.stars > 0) {
      this.spawnTimer -= dt;
      const interval = CONFIG.POLICE_SPAWN_INTERVAL / Math.max(1, gameState.stars);
      if (this.spawnTimer <= 0 && this.units.length < Math.min(this.maxUnits, gameState.stars*3)) {
        this.spawnUnit(); this.spawnTimer = interval;
      }
    }
    if (gameState.stars === 0) {
      for (let i=this.units.length-1; i>=0; i--) {
        if (Math.hypot(this.units[i].x-player.x,this.units[i].y-player.y)>800) this.units.splice(i,1);
      }
    }

    const scale = dt/16;
    for (const p of this.units) {
      const dx=player.x-p.x, dy=player.y-p.y, dist=Math.hypot(dx,dy);
      p.angle = Math.atan2(dy,dx);
      if (dist > 200) {
        p.x+=(dx/dist)*CONFIG.POLICE_SPEED*scale*(gameState.stars>3?1.3:1);
        p.y+=(dy/dist)*CONFIG.POLICE_SPEED*scale*(gameState.stars>3?1.3:1);
      } else if (dist > 80) {
        const sa=p.angle+(p.id%2===0?Math.PI/2:-Math.PI/2);
        p.x+=(Math.cos(sa)*0.4+Math.cos(p.angle)*0.6)*CONFIG.POLICE_SPEED*scale;
        p.y+=(Math.sin(sa)*0.4+Math.sin(p.angle)*0.6)*CONFIG.POLICE_SPEED*scale;
      } else {
        p.x-=(dx/dist)*0.5*scale; p.y-=(dy/dist)*0.5*scale;
      }
      p.x=Math.max(0,Math.min(CONFIG.WORLD_W,p.x));
      p.y=Math.max(0,Math.min(CONFIG.WORLD_H,p.y));

      p.shootTimer -= dt;
      const shootInterval = gameState.stars>=4 ? 600 : 900;
      if (p.shootTimer<=0 && dist<350) { fireAtPlayer(p.x,p.y,'police'); p.shootTimer=shootInterval+Math.random()*400; }

      if (gameState.inCar && Math.hypot(p.x-car.x,p.y-car.y)<40) {
        car.takeDamage(5);
        const ang=Math.atan2(p.y-car.y,p.x-car.x);
        p.x+=Math.cos(ang)*20; p.y+=Math.sin(ang)*20;
      }
    }
  },

  spawnUnit() {
    const camX=gameState.camX, camY=gameState.camY, sw=window.innerWidth, sh=window.innerHeight;
    const edge=Math.random();
    let sx,sy;
    if (edge<0.25)      { sx=camX-80;     sy=camY+Math.random()*sh; }
    else if (edge<0.5)  { sx=camX+sw+80;  sy=camY+Math.random()*sh; }
    else if (edge<0.75) { sx=camX+Math.random()*sw; sy=camY-80; }
    else                { sx=camX+Math.random()*sw; sy=camY+sh+80; }
    sx=Math.max(0,Math.min(CONFIG.WORLD_W,sx));
    sy=Math.max(0,Math.min(CONFIG.WORLD_H,sy));
    this.units.push({ x:sx, y:sy, hp:CONFIG.POLICE_HP, maxHp:CONFIG.POLICE_HP, angle:0, shootTimer:1000+Math.random()*500, id:this.units.length });
  },

  checkBulletHit(px, py, cx, cy) {
    const RADIUS = 24;
    for (let i=this.units.length-1; i>=0; i--) {
      const p=this.units[i];
      if (_segCircle(px,py,cx,cy,p.x,p.y,RADIUS)) {
        p.hp -= CONFIG.BULLET_DAMAGE;
        if (p.hp<=0) { this.units.splice(i,1); gameState.addMoney(50); }
        return true;
      }
    }
    return false;
  },

  draw(ctx) {
    for (const p of this.units) {
      ctx.save();
      ctx.translate(p.x,p.y); ctx.rotate(p.angle+Math.PI/2);
      if (gameState.stars>=2) {
        ctx.fillStyle='#1a2a5a'; ctx.fillRect(-14,-20,28,38);
        const lt=Math.floor(Date.now()/300)%2;
        ctx.fillStyle=lt?'#ff4444':'#0044ff'; ctx.fillRect(-10,-22,8,4);
        ctx.fillStyle=lt?'#0044ff':'#ff4444'; ctx.fillRect(2,-22,8,4);
        ctx.fillStyle='#ffffff'; ctx.fillRect(-8,-14,5,8); ctx.fillRect(3,-14,5,8);
      } else {
        ctx.fillStyle='#1a1a6a'; ctx.fillRect(-7,-22,14,26);
        ctx.fillStyle='#d0c890'; ctx.beginPath(); ctx.arc(0,-30,8,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#1a1a4a'; ctx.fillRect(-9,-38,18,5);
      }
      ctx.restore();

      if (p.hp<p.maxHp) {
        const bw=32;
        ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(p.x-bw/2,p.y-48,bw,4);
        ctx.fillStyle='#4488ff'; ctx.fillRect(p.x-bw/2,p.y-48,bw*(p.hp/p.maxHp),4);
      }
      if (gameState.stars>=1) {
        const glow=Math.abs(Math.sin(Date.now()*0.005));
        ctx.fillStyle=`rgba(${Math.floor(Date.now()/300)%2?255:0},0,${Math.floor(Date.now()/300)%2?0:255},${glow*0.12})`;
        ctx.beginPath(); ctx.arc(p.x,p.y,35,0,Math.PI*2); ctx.fill();
      }

      if (window.combat && combat.debug) {
        ctx.strokeStyle='rgba(0,100,255,0.5)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(p.x,p.y,24,0,Math.PI*2); ctx.stroke();
      }
    }
  }
};
