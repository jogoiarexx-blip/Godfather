// ===== UI =====
const msgQueue = [];
let msgTimer = 0;

function showLog(msg, type = 'normal') {
  const log = document.getElementById('msg-log');
  const el = document.createElement('div');
  el.className = `msg-item ${type}`;
  el.textContent = msg;
  log.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 3000);
}

function updateHUD() {
  document.getElementById('money').textContent = '$' + Math.floor(gameState.money).toLocaleString('pt-BR');
  document.getElementById('respect').textContent = gameState.respect.toLocaleString('pt-BR');

  const rank = getRank(gameState.respect);
  const rankEl = document.getElementById('rank');
  rankEl.textContent = rank.name;
  rankEl.style.color = rank.color;

  const heatPct = gameState.heat;
  document.getElementById('heat-bar').style.width = heatPct + '%';

  const hpPct = (player.hp / player.maxHp) * 100;
  const hpBar = document.getElementById('hp-bar');
  hpBar.style.width = hpPct + '%';
  hpBar.style.background = hpPct > 50 ? 'linear-gradient(90deg,#22aa44,#44dd66)' :
                            hpPct > 25 ? 'linear-gradient(90deg,#aa8800,#ddaa00)' :
                            'linear-gradient(90deg,#aa2200,#dd4400)';

  const playerDistricts = mapSystem.getPlayerDistricts();
  document.getElementById('districts').textContent = `${playerDistricts}/6`;
}

function openPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  gameState.paused = true;
}

function closePanel(id) {
  document.getElementById(id).classList.add('hidden');
  const anyOpen = [...document.querySelectorAll('.panel')].some(p => !p.classList.contains('hidden'));
  if (!anyOpen) gameState.paused = false;
}

function showGameOver() {
  let overlay = document.getElementById('overlay-screen');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay-screen';
    overlay.innerHTML = `<h1>GAME OVER</h1><p>Você foi eliminado. A família Barzini venceu.</p><button id="btn-restart" onclick="location.reload()">⟳ RECOMEÇAR</button>`;
    document.body.appendChild(overlay);
  }
  overlay.className = 'gameover';
  overlay.style.display = 'flex';
}

function showVictory() {
  let overlay = document.getElementById('overlay-screen');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay-screen';
    document.body.appendChild(overlay);
  }
  overlay.className = 'victory';
  overlay.innerHTML = `
    <div id="splash-rose" style="font-size:80px;display:block;margin-bottom:20px">🌹</div>
    <h1>IL PADRINO</h1>
    <p style="font-family:Cinzel,serif;font-size:22px;color:#d4af37">Nova Corleone é toda sua.</p>
    <p>Dinheiro: $${Math.floor(gameState.money).toLocaleString()} · Respeito: ${gameState.respect.toLocaleString()}</p>
    <button id="btn-restart" onclick="location.reload()">⟳ JOGAR NOVAMENTE</button>
  `;
  overlay.style.display = 'flex';
}
