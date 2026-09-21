// ===== COMBAT: BALAS & PARTÍCULAS =====
const combat = {
  bullets: [],
  particles: [],
  shootCooldown: 0,
  debug: false, // toggle com tecla F1

  shoot(targetX, targetY) {
    if (gameState.inCar) return;
    if (this.shootCooldown > 0) return;

    const angle = Math.atan2(targetY - player.y, targetX - player.x);

    // Bala nasce na ponta da arma do jogador (offset curto para não spawnar dentro do jogador)
    const spawnX = player.x + Math.cos(angle) * 18;
    const spawnY = player.y + Math.sin(angle) * 18;

    this.bullets.push({
      x: spawnX,
      y: spawnY,
      vx: Math.cos(angle) * CONFIG.BULLET_SPEED,
      vy: Math.sin(angle) * CONFIG.BULLET_SPEED,
      dist: 0,         // distância percorrida
      maxDist: 900,    // alcance máximo em px — substitui "life" para evitar bugs de dt
      owner: 'player',
      prevX: spawnX,
      prevY: spawnY,
    });

    // Muzzle flash
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: spawnX, y: spawnY,
        vx: Math.cos(angle + (Math.random() - 0.5) * 1.4) * (3 + Math.random() * 3),
        vy: Math.sin(angle + (Math.random() - 0.5) * 1.4) * (3 + Math.random() * 3),
        life: 120, maxLife: 120,
        color: '#ffdd00', size: 3,
      });
    }

    gameState.addHeat(CONFIG.HEAT_PER_SHOT);
    this.shootCooldown = 160;
    if (window.missionSystem) missionSystem.onEvent('shot');
  },

  spawnBlood(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 4;
      this.particles.push({
        x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        life: 400 + Math.random() * 300, maxLife: 700,
        color: `hsl(0,80%,${18 + Math.random() * 18}%)`, size: 2 + Math.random() * 3,
      });
    }
  },

  spawnSpark(x, y) {
    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      this.particles.push({
        x, y, vx: Math.cos(a) * (1 + Math.random() * 3), vy: Math.sin(a) * (1 + Math.random() * 3),
        life: 180, maxLife: 180, color: '#ffaa00', size: 2,
      });
    }
  },

  update(dt) {
    if (this.shootCooldown > 0) this.shootCooldown -= dt;

    // ── BALAS DO JOGADOR ──────────────────────────────────────────────────────
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      // Guardar posição anterior para sweep collision
      b.prevX = b.x;
      b.prevY = b.y;

      // Mover bala — velocidade em px/frame, independente de dt
      // (60fps = move ~14px/frame; se fps cair para 30, move 14px a cada 2 frames — aceitável)
      b.x += b.vx;
      b.y += b.vy;

      // Distância percorrida
      const step = Math.hypot(b.vx, b.vy);
      b.dist += step;

      // Remover se excedeu alcance ou saiu do mundo
      if (b.dist > b.maxDist ||
          b.x < -50 || b.x > CONFIG.WORLD_W + 50 ||
          b.y < -50 || b.y > CONFIG.WORLD_H + 50) {
        this.bullets.splice(i, 1);
        continue;
      }

      // ── Colisão com inimigos ──────────────────────────────────────────────
      if (b.owner === 'player') {
        let hit = false;

        // Checar com SWEEP (linha de movimento) para não "furar" inimigos em fps baixo
        if (window.enemySystem && enemySystem.checkBulletHit(b.prevX, b.prevY, b.x, b.y)) {
          this.spawnBlood(b.x, b.y);
          hit = true;
        } else if (window.rivalSystem && rivalSystem.checkBulletHit(b.prevX, b.prevY, b.x, b.y)) {
          this.spawnBlood(b.x, b.y);
          hit = true;
        } else if (window.policeSystem && policeSystem.checkBulletHit(b.prevX, b.prevY, b.x, b.y)) {
          this.spawnSpark(b.x, b.y);
          gameState.addHeat(CONFIG.HEAT_PER_KILL * 2);
          gameState.policeKillCount++;
          if (window.missionSystem) missionSystem.onEvent('police_kill');
          hit = true;
        }

        if (hit) { this.bullets.splice(i, 1); continue; }
      }

      // ── Balas inimigas → jogador ─────────────────────────────────────────
      if (b.owner === 'enemy' || b.owner === 'police') {
        // Checar guarda-costas primeiro (absorvem o dano)
        let absorbed = false;
        if (window.bodyguardSystem && bodyguardSystem.checkBulletAbsorb(b.x, b.y)) {
          this.spawnBlood(b.x, b.y, 3);
          this.bullets.splice(i, 1);
          absorbed = true;
        }
        if (absorbed) continue;

        const dmg = b.owner === 'police' ? CONFIG.POLICE_DAMAGE : CONFIG.ENEMY_DAMAGE;
        if (Math.hypot(b.x - player.x, b.y - player.y) < 16) {
          player.takeDamage(dmg);
          this.spawnBlood(b.x, b.y, 4);
          this.bullets.splice(i, 1);
        }
      }
    }

    // ── PARTÍCULAS ────────────────────────────────────────────────────────────
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  },

  draw(ctx) {
    // Balas
    for (const b of this.bullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx));

      if (b.owner === 'player') {
        ctx.shadowColor = '#ffdd00';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffe066';
        ctx.fillRect(-7, -2, 14, 4);
      } else if (b.owner === 'enemy') {
        ctx.fillStyle = '#ff5555';
        ctx.fillRect(-6, -2, 12, 4);
      } else if (b.owner === 'police') {
        ctx.fillStyle = '#88aaff';
        ctx.fillRect(-6, -2, 12, 4);
      }
      ctx.restore();

      // Debug: mostrar hitbox da bala
      if (this.debug) {
        ctx.strokeStyle = 'rgba(255,255,0,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Partículas
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
};

// ── Atirar em direção ao jogador (usado por inimigos/polícia) ─────────────────
function fireAtPlayer(fromX, fromY, owner = 'enemy') {
  const angle = Math.atan2(player.y - fromY, player.x - fromX);
  const spread = owner === 'police' ? 0.07 : 0.22;
  const a = angle + (Math.random() - 0.5) * spread;
  const spd = CONFIG.BULLET_SPEED * 0.78;
  combat.bullets.push({
    x: fromX, y: fromY,
    vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
    dist: 0, maxDist: 700,
    prevX: fromX, prevY: fromY,
    owner,
  });
}
