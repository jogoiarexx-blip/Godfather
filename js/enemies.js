// ===== ENEMY SYSTEM =====
const enemySystem = {
  units: [],

  spawn(x, y, count = 3, type = 'grunt') {
    for (let i = 0; i < count; i++) {
      this.units.push({
        x: x + (Math.random() - 0.5) * 140,
        y: y + (Math.random() - 0.5) * 100,
        hp: CONFIG.ENEMY_HP * (type === 'heavy' ? 2 : 1),
        maxHp: CONFIG.ENEMY_HP * (type === 'heavy' ? 2 : 1),
        type,
        angle: 0,
        shootTimer: 800 + Math.random() * 600,
        alertDist: type === 'heavy' ? 300 : 220,
        state: 'idle',
        walkFrame: 0,
        walkTimer: 0,
      });
    }
  },

  update(dt) {
    const scale = dt / 16;
    for (const e of this.units) {
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.hypot(dx, dy);

      e.angle = Math.atan2(dy, dx);

      if (dist < e.alertDist)          e.state = 'chase';
      else if (dist > e.alertDist*1.5) e.state = 'idle';

      if (e.state === 'chase' && dist > 60) {
        e.x += (dx / dist) * CONFIG.ENEMY_SPEED * scale;
        e.y += (dy / dist) * CONFIG.ENEMY_SPEED * scale;
        e.walkTimer += dt;
        if (e.walkTimer > 150) { e.walkFrame = (e.walkFrame + 1) % 4; e.walkTimer = 0; }
      }

      if (e.state === 'chase') {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && dist < 300) {
          fireAtPlayer(e.x, e.y, 'enemy');
          e.shootTimer = 700 + Math.random() * 800;
        }
      }
    }
  },

  // Sweep collision: line from (px,py)→(cx,cy) vs circle at (e.x,e.y) radius r
  checkBulletHit(px, py, cx, cy) {
    const RADIUS = 28; // hitbox generoso
    for (let i = this.units.length - 1; i >= 0; i--) {
      const e = this.units[i];
      if (_segCircle(px, py, cx, cy, e.x, e.y, RADIUS)) {
        e.hp -= CONFIG.BULLET_DAMAGE;
        if (e.hp <= 0) {
          this.units.splice(i, 1);
          gameState.addMoney(80);
          gameState.addHeat(CONFIG.HEAT_PER_KILL);
          gameState.killCount++;
          if (window.missionSystem) missionSystem.onEvent('kill');
        }
        return true;
      }
    }
    return false;
  },

  draw(ctx) {
    for (const e of this.units) {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle + Math.PI / 2);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(0, 6, 10, 5, 0, 0, Math.PI*2); ctx.fill();

      const heavy = e.type === 'heavy';
      const legOff = [0, 5, 0, -5][e.walkFrame];
      ctx.fillStyle = '#330000';
      ctx.fillRect(-5, 0 + legOff, 4, 18);
      ctx.fillRect( 1, 0 - legOff, 4, 18);
      ctx.fillStyle = heavy ? '#660000' : '#440000';
      ctx.fillRect(-8, -22, heavy ? 18 : 16, 26);
      ctx.fillStyle = '#c8a080';
      ctx.beginPath(); ctx.arc(0, -30, heavy ? 10 : 8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#550000';
      ctx.fillRect(-(heavy?12:10), -38, (heavy?24:20), 5);
      ctx.fillRect(-(heavy? 8: 6), -44, (heavy?16:12), 8);

      ctx.restore();

      // HP bar
      const bw = e.type === 'heavy' ? 40 : 32;
      const hpPct = e.hp / e.maxHp;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(e.x - bw/2, e.y - 54, bw, 4);
      ctx.fillStyle = hpPct > 0.5 ? '#ff4444' : '#ff0000';
      ctx.fillRect(e.x - bw/2, e.y - 54, bw * hpPct, 4);

      if (e.state === 'chase') {
        ctx.fillStyle = '#ffdd00'; ctx.font = '14px serif'; ctx.textAlign = 'center';
        ctx.fillText('!', e.x, e.y - 58);
      }

      // Debug hitbox
      if (window.combat && combat.debug) {
        ctx.strokeStyle = 'rgba(255,0,0,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(e.x, e.y, 28, 0, Math.PI*2); ctx.stroke();
      }
    }
  }
};
