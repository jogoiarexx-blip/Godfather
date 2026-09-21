// ===== CAR — Física Arcade Melhorada =====
const car = {
  x: 320, y: 480,
  vx: 0, vy: 0,
  angle: 0,      // facing direction
  speed: 0,      // current scalar speed
  driftAngle: 0, // visual drift offset
  hp: 100,
  maxHp: 100,
  turningLeft: false,
  turningRight: false,
  accelerating: false,

  // Input targets (mouse click)
  targetX: 320, targetY: 480,
  useTarget: false,

  update(dt) {
    const scale = dt / 16;
    const acc = CONFIG.CAR_ACCEL;
    const friction = CONFIG.CAR_FRICTION;
    const maxSpd = CONFIG.CAR_MAX_SPEED;

    if (this.useTarget) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 30) {
        const desiredAngle = Math.atan2(dy, dx);
        let diff = desiredAngle - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turnAmt = CONFIG.CAR_TURN_SPEED * scale;
        this.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnAmt) * (Math.abs(this.speed) / maxSpd * 0.6 + 0.4);
        this.speed += acc * scale;
        this.accelerating = true;
      } else {
        this.useTarget = false;
        this.speed *= 0.85;
        this.accelerating = false;
      }
    } else {
      this.speed *= Math.pow(friction, scale);
      this.accelerating = false;
    }

    this.speed = Math.max(-maxSpd * 0.4, Math.min(maxSpd, this.speed));

    // Drift effect: visual angle lags behind movement angle
    const moveAngle = Math.atan2(this.vy, this.vx);
    this.driftAngle += (0 - this.driftAngle) * 0.15 * scale;

    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;

    this.x += this.vx * scale;
    this.y += this.vy * scale;

    this.x = Math.max(30, Math.min(CONFIG.WORLD_W - 30, this.x));
    this.y = Math.max(30, Math.min(CONFIG.WORLD_H - 30, this.y));

    if (gameState.inCar) {
      player.x = this.x;
      player.y = this.y;
    }
  },

  takeDamage(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      gameState.inCar = false;
      showLog('💥 Carro destruído!', 'danger');
      // Damage player on crash
      player.takeDamage(30);
      this.hp = this.maxHp;
      // Respawn car somewhere safe
      setTimeout(() => {
        this.x = player.x + 150;
        this.y = player.y;
        this.speed = 0;
        this.vx = 0;
        this.vy = 0;
        this.hp = this.maxHp;
        showLog('🚗 Carro reparado.', 'info');
      }, 8000);
    }
  },

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2 + this.driftAngle);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.ellipse(0, 8, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tires
    ctx.fillStyle = '#1a1a1a';
    const tires = [[-18, -22], [18, -22], [-18, 18], [18, 18]];
    for (const [tx, ty] of tires) {
      ctx.fillRect(tx - 6, ty - 9, 12, 18);
    }

    // Car body
    const grad = ctx.createLinearGradient(0, -30, 0, 30);
    grad.addColorStop(0, '#2a2a2a');
    grad.addColorStop(0.5, '#1a1a1a');
    grad.addColorStop(1, '#111');
    ctx.fillStyle = grad;

    // Main body shape
    ctx.beginPath();
    ctx.moveTo(-18, -28);
    ctx.lineTo(18, -28);
    ctx.lineTo(22, -10);
    ctx.lineTo(22, 20);
    ctx.lineTo(18, 28);
    ctx.lineTo(-18, 28);
    ctx.lineTo(-22, 20);
    ctx.lineTo(-22, -10);
    ctx.closePath();
    ctx.fill();

    // Roof / cabin
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(-13, -16);
    ctx.lineTo(13, -16);
    ctx.lineTo(15, 8);
    ctx.lineTo(-15, 8);
    ctx.closePath();
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#ffffaa';
    ctx.fillRect(-14, -30, 10, 5);
    ctx.fillRect(4, -30, 10, 5);

    // Taillights
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(-14, 25, 10, 5);
    ctx.fillRect(4, 25, 10, 5);

    // Speed lines effect
    if (Math.abs(this.speed) > 6) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 6, 28);
        ctx.lineTo(i * 6 + Math.sign(i), 28 + this.speed * 3);
        ctx.stroke();
      }
    }

    ctx.restore();

    // HP bar
    if (this.hp < this.maxHp) {
      const bw = 50;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(this.x - bw / 2, this.y - 50, bw, 5);
      ctx.fillStyle = '#4488ff';
      ctx.fillRect(this.x - bw / 2, this.y - 50, bw * (this.hp / this.maxHp), 5);
    }
  }
};
