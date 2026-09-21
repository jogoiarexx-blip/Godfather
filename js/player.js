// ===== PLAYER =====
const player = {
  x: 380, y: 400,
  angle: 0,         // facing angle (set by mouse)
  hp: CONFIG.PLAYER_HP,
  maxHp: CONFIG.PLAYER_HP,
  shootCooldown: 0,
  invincible: 0,
  walkFrame: 0,
  walkTimer: 0,

  // move() is now a no-op — WASD handled in processWASD() in main.js
  // kept for compatibility with car sync
  move(dt) {
    if (gameState.inCar) {
      this.x = car.x;
      this.y = car.y;
    }
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.invincible > 0)    this.invincible    -= dt;
  },

  takeDamage(dmg) {
    if (this.invincible > 0) return;
    this.hp -= dmg;
    this.invincible = 400;
    if (this.hp <= 0) {
      this.hp = 0;
      gameState.gameOver = true;
    }
  },

  heal(v) { this.hp = Math.min(this.maxHp, this.hp + v); },

  draw(ctx) {
    if (gameState.inCar) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);

    // Invincibility flash
    const flash = this.invincible > 0 && Math.floor(this.invincible / 80) % 2 === 0;
    if (flash) { ctx.globalAlpha = 0.35; }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(0, 8, 12, 6, 0, 0, Math.PI * 2); ctx.fill();

    // Legs animation
    const legOffset = [0, 6, 0, -6][this.walkFrame];
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(-6,  0 + legOffset, 5, 20);
    ctx.fillRect( 1,  0 - legOffset, 5, 20);

    // Suit
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(-9, -25, 18, 30);
    ctx.fillStyle = '#2a2a3e';
    ctx.beginPath();
    ctx.moveTo(0, -22); ctx.lineTo(-6, -8); ctx.lineTo(0, -6); ctx.lineTo(6, -8);
    ctx.closePath(); ctx.fill();

    // Head
    ctx.fillStyle = '#e8c8a0';
    ctx.beginPath(); ctx.arc(0, -36, 9, 0, Math.PI * 2); ctx.fill();

    // Hat
    ctx.fillStyle = '#111';
    ctx.fillRect(-10, -46, 20, 5);
    ctx.fillRect(-7,  -52, 14, 8);

    // Gun
    ctx.fillStyle = '#333';
    ctx.fillRect(8, -20, 4, 14);

    ctx.globalAlpha = 1;
    ctx.restore();

    // HP bar
    if (this.hp < this.maxHp) {
      const bw = 40, bh = 4;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(this.x - bw / 2, this.y - 65, bw, bh);
      ctx.fillStyle = this.hp > 50 ? '#22aa44' : this.hp > 25 ? '#ffaa00' : '#ff2222';
      ctx.fillRect(this.x - bw / 2, this.y - 65, bw * (this.hp / this.maxHp), bh);
    }
  }
};
