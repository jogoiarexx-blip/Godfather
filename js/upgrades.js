// ===== SISTEMA DE UPGRADES =====
const upgradeSystem = {
  renderPanel() {
    const list = document.getElementById('upgrade-list');
    list.innerHTML = '';

    for (const p of PROPERTIES) {
      if (!p.owned) continue;
      const div = document.createElement('div');
      div.className = 'upgrade-item';

      const currentIncome = Math.floor(p.income * p.upgMult[p.upgLevel]);
      const levelNames = ['Base', 'Melhorado', 'Premium', 'Máximo'];

      let btnsHTML = '<div class="upgrade-levels">';
      for (let lvl = 1; lvl <= 3; lvl++) {
        const cost = p.upgCosts[lvl - 1];
        const owned = p.upgLevel >= lvl;
        const canAfford = gameState.money >= cost;
        const disabled = owned || !canAfford || p.upgLevel < lvl - 1;

        btnsHTML += `<button class="upgrade-btn ${owned ? 'owned' : ''}" 
          ${disabled && !owned ? 'disabled' : ''}
          onclick="upgradeSystem.buy(${p.id}, ${lvl})">
          ${owned ? '✓ ' : ''}Nível ${lvl}<br>
          <small>${owned ? levelNames[lvl] : '$' + cost.toLocaleString()}</small>
        </button>`;
      }
      btnsHTML += '</div>';

      div.innerHTML = `
        <h3>${p.name} <small style="color:#888">(Distrito: ${DISTRICTS[p.district].name})</small></h3>
        <p>Renda atual: <strong style="color:#d4af37">$${currentIncome}/h</strong> · Nível: ${levelNames[p.upgLevel]}</p>
        ${btnsHTML}
      `;
      list.appendChild(div);
    }

    if (list.innerHTML === '') {
      list.innerHTML = '<p style="color:#666;text-align:center;padding:20px;">Extorque propriedades primeiro para desbloqueá-las.</p>';
    }
  },

  buy(propId, level) {
    const p = PROPERTIES[propId];
    if (!p || !p.owned) return;
    if (p.upgLevel >= level) return;
    if (p.upgLevel < level - 1) { showLog('Faça upgrades em ordem!', 'danger'); return; }

    const cost = p.upgCosts[level - 1];
    if (gameState.money < cost) {
      showLog(`❌ Sem dinheiro! Precisa de $${cost.toLocaleString()}`, 'danger');
      return;
    }

    gameState.money -= cost;
    p.upgLevel = level;
    mapSystem.recalcPassiveIncome();
    const newIncome = Math.floor(p.income * p.upgMult[p.upgLevel]);
    showLog(`🏛 ${p.name} melhorado! Renda: $${newIncome}/h`, 'success');
    this.renderPanel();
  }
};
