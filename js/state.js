// ===== GAME STATE =====
const gameState = {
  money: 1000,
  respect: 0,
  rank: RANKS[0],
  heat: 0,        // 0–100
  stars: 0,       // 0–5 police wanted stars
  inCar: false,
  passiveIncome: 0,
  paused: false,
  gameOver: false,
  won: false,

  // Camera / viewport
  camX: 0,
  camY: 0,

  // Runtime counters
  killCount: 0,
  policeKillCount: 0,
  moneyEarned: 0,

  addMoney(v) {
    this.money += v;
    this.moneyEarned += v;
  },

  addRespect(v) {
    this.respect += v;
    const newRank = getRank(this.respect);
    if (newRank.name !== this.rank.name) {
      this.rank = newRank;
      showLog(`🎖️ PROMOÇÃO: Você agora é ${newRank.name}!`, 'success');
      if (typeof bodyguardSystem !== 'undefined') bodyguardSystem.syncGuards();
    }
  },

  addHeat(v) {
    this.heat = Math.min(100, this.heat + v);
    this.stars = Math.floor(this.heat / 20);
  },

  tick(dt) {
    if (this.heat > 0) this.heat = Math.max(0, this.heat - CONFIG.HEAT_DECAY * dt);
    this.stars = Math.floor(this.heat / 20);
    this.money += (this.passiveIncome / 3600) * dt * 0.016;
  }
};
