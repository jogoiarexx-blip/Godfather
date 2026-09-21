// ===== SISTEMA DE MISSÕES =====
const MISSION_DEFS = [
  {
    id: 0,
    title: 'Primeiros Passos',
    desc: 'Extorque o Armazém no Porto Velho',
    reward: { money: 500, respect: 200 },
    unlock: () => true,
    check: () => PROPERTIES[1].owned,
    event: null,
  },
  {
    id: 1,
    title: 'Batismo de Fogo',
    desc: 'Elimine 5 capangas inimigos',
    reward: { money: 1000, respect: 300 },
    unlock: () => PROPERTIES[1].owned,
    check: () => gameState.killCount >= 5,
    event: 'kill',
  },
  {
    id: 2,
    title: 'Território Marcado',
    desc: 'Tome o Bar Clandestino no Mercado Negro',
    reward: { money: 2000, respect: 500 },
    unlock: () => gameState.killCount >= 5,
    check: () => PROPERTIES[2].owned,
    event: null,
  },
  {
    id: 3,
    title: 'Limpa a Casa',
    desc: 'Elimine 3 agentes da família Barzini',
    reward: { money: 3000, respect: 700 },
    unlock: () => PROPERTIES[2].owned,
    check: () => gameState.killCount >= 15,
    event: 'rival_kill',
  },
  {
    id: 4,
    title: 'Fuga do Calor',
    desc: 'Fuja da polícia (reduza heat a zero tendo 3+ estrelas)',
    reward: { money: 4000, respect: 1000 },
    unlock: () => gameState.killCount >= 15,
    check: () => _missionState.escapedPolice,
    event: null,
  },
  {
    id: 5,
    title: 'Coração da Cidade',
    desc: 'Tome o Banco no Centro Histórico',
    reward: { money: 8000, respect: 1500 },
    unlock: () => gameState.respect >= 800,
    check: () => PROPERTIES[6].owned,
    event: null,
  },
  {
    id: 6,
    title: 'Rei do Cassino',
    desc: 'Tome o Cassino e o Clube Noturno em La Cittadella',
    reward: { money: 15000, respect: 2500 },
    unlock: () => PROPERTIES[6].owned,
    check: () => PROPERTIES[8].owned && PROPERTIES[9].owned,
    event: null,
  },
  {
    id: 7,
    title: 'O Padrinho',
    desc: 'Domine todos os 6 distritos de Nova Corleone',
    reward: { money: 50000, respect: 5000 },
    unlock: () => gameState.respect >= 4000,
    check: () => mapSystem.getPlayerDistricts() >= 6,
    event: null,
  },
];

const _missionState = {
  escapedPolice: false,
  hadHighHeat: false,
};

const missionSystem = {
  missions: MISSION_DEFS.map(m => ({ ...m, status: 'locked' })),
  active: null,

  init() {
    this.refresh();
  },

  refresh() {
    for (const m of this.missions) {
      if (m.status === 'completed') continue;
      if (m.unlock()) {
        if (m.status === 'locked') m.status = 'available';
      }
    }
  },

  setActive(id) {
    const m = this.missions.find(m => m.id === id);
    if (!m || m.status === 'locked' || m.status === 'completed') return;
    this.active = m;
    m.status = 'active';
    showLog(`🎯 Missão iniciada: ${m.title}`, 'info');
    this._updateBanner();
    closePanel('mission-panel');
  },

  onEvent(eventName) {
    if (!this.active) return;
    this._checkActive();
  },

  tick() {
    // Check heat escape
    if (gameState.stars >= 3) _missionState.hadHighHeat = true;
    if (_missionState.hadHighHeat && gameState.stars === 0) {
      _missionState.escapedPolice = true;
    }

    this.refresh();
    if (this.active) this._checkActive();
  },

  _checkActive() {
    if (!this.active) return;
    if (this.active.check()) {
      this._complete(this.active);
    }
  },

  _complete(m) {
    m.status = 'completed';
    gameState.addMoney(m.reward.money);
    gameState.addRespect(m.reward.respect);
    showLog(`✅ MISSÃO COMPLETA: ${m.title} (+$${m.reward.money.toLocaleString()})`, 'success');
    this.active = null;
    this._updateBanner();

    if (m.id === 7) {
      gameState.won = true;
    }
  },

  _updateBanner() {
    const banner = document.getElementById('mission-banner');
    const title = document.getElementById('mission-title');
    const desc = document.getElementById('mission-desc');
    if (this.active) {
      title.textContent = `🎯 ${this.active.title}`;
      desc.textContent = this.active.desc;
      banner.classList.add('active');
    } else {
      banner.classList.remove('active');
    }
  },

  renderPanel() {
    this.refresh();
    const list = document.getElementById('mission-list');
    list.innerHTML = '';
    for (const m of this.missions) {
      const div = document.createElement('div');
      div.className = `mission-item ${m.status}`;
      div.innerHTML = `
        <h3>${m.status === 'completed' ? '✅' : m.status === 'active' ? '🎯' : m.status === 'locked' ? '🔒' : '○'} ${m.title}</h3>
        <p>${m.desc}</p>
        <p class="reward">💰 $${m.reward.money.toLocaleString()} + ⭐ ${m.reward.respect} respeito</p>
        ${m.status === 'available' ? '<p style="color:#d4af37;font-size:13px;margin-top:6px;">Clique para iniciar</p>' : ''}
      `;
      if (m.status === 'available') {
        div.addEventListener('click', () => this.setActive(m.id));
      }
      list.appendChild(div);
    }
  }
};
