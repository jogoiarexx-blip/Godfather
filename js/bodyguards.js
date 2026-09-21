// ===== GUARDA-COSTAS POR RANK =====
const bodyguardSystem = {
  guards: [],

  syncGuards() {
    const targetCount = gameState.rank.guards;
    while (this.guards.length < targetCount) {
      this.addGuard();
    }
    while (this.guards.length > targetCount) {
      this.guards.pop();
    }
  },

  addGuard() {
    const angle = (this.guards.length / 3) * Math.PI * 2;
    this.guards.push({
      x: player.x + Math.cos(angle) * 60,
      y: player.y + Math.sin(angle) * 60,
      hp: 120,
      maxHp: 120,
      angle: 0,
      shootTimer: 500 + Math.random() * 400,
      id: this.guards.length,
    });
  },

  update(dt) {
    const scale = dt / 16;

    for (const g of this.guards) {
      // Formation offset around player
      const formAngle = (g.id / Math.max(1, this.guards.length)) * Math.PI * 2 + Date.now() * 0.0002;
      const targetX = player.x + Math.cos(formAngle) * CONFIG.BODYGUARD_FOLLOW_DIST;
      const targetY = player.y + Math.sin(formAngle) * CONFIG.BODYGUARD_FOLLOW_DIST;

      const dx = targetX - g.x;
      const dy = targetY - g.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 10) {
        g.x += (dx / dist) * Math.min(dist * 0.15, 6) * scale;
        g.y += (dy / dist) * Math.min(dist * 0.15, 6) * scale;
      }

      // Look for nearest threat
      let nearestThreat = null;
      let nearestDist = CONFIG.BODYGUARD_ATTACK_RANGE;

      for (const e of enemySystem.units) {
        const d = Math.hypot(e.x - g.x, e.y - g.y);
        if (d < nearestDist) { nearestDist = d; nearestThreat = { x: e.x, y: e.y }; }
      }
      for (const a of rivalSystem.agents) {
        const d = Math.hypot(a.x - g.x, a.y - g.y);
        if (d < nearestDist) { nearestDist = d; nearestThreat = { x: a.x, y: a.y }; }
      }
      for (const p of policeSystem.units) {
        const d = Math.hypot(p.x - g.x, p.y - g.y);
        if (d < nearestDist) { nearestDist = d; nearestThreat = { x: p.x, y: p.y }; }
      }

      if (nearestThreat) {
        g.angle = Math.atan2(nearestThreat.y - g.y, nearestThreat.x - g.x);
        g.shootTimer -= dt;
        if (g.shootTimer <= 0) {
          // Fire at threat
          const ang = Math.atan2(nearestThreat.y - g.y, nearestThreat.x - g.x);
          combat.bullets.push({
            x: g.x, y: g.y,
            vx: Math.cos(ang) * CONFIG.BULLET_SPEED * 0.9,
            vy: Math.sin(ang) * CONFIG.BULLET_SPEED * 0.9,
            life: 800, owner: 'player'
          });
          g.shootTimer = 400 + Math.random() * 300;
        }
      }
    }
  },

  checkBulletAbsorb(bx, by) {
    for (const g of this.guards) {
      if (Math.hypot(bx - g.x, by - g.y) < 16) {
        g.hp -= CONFIG.ENEMY_DAMAGE * 0.8;
        if (g.hp <= 0) {
          const idx = this.guards.indexOf(g);
          if (idx !== -1) this.guards.splice(idx, 1);
          showLog('💔 Um guarda-costas caiu!', 'danger');
          // Respawn after 15 seconds
          setTimeout(() => {
            if (this.guards.length < gameState.rank.guards) {
              this.addGuard();
              showLog('👤 Novo guarda-costas recrutado.', 'info');
            }
          }, 15000);
        }
        return true;
      }
    }
    return false;
  },

  draw(ctx) {
    for (const g of this.guards) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.angle + Math.PI / 2);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.ellipse(0, 6, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bodyguard — dark suit, gold tie
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(-8, -22, 16, 26);
      ctx.fillStyle = '#aa8800';
      ctx.fillRect(-2, -18, 4, 10);
      // Earpiece
      ctx.fillStyle = '#ffccaa';
      ctx.beginPath(); ctx.arc(0, -30, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(6, -27, 2, 0, Math.PI * 2); ctx.fill();
      // Sunglasses
      ctx.fillStyle = '#111';
      ctx.fillRect(-7, -33, 14, 5);

      ctx.restore();

      // HP bar
      const bw = 28;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(g.x - bw / 2, g.y - 46, bw, 4);
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(g.x - bw / 2, g.y - 46, bw * (g.hp / g.maxHp), 4);
    }
  }
};
