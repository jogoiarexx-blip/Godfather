// ===== GAME LOOP =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function updateCamera() {
  const vw = window.innerWidth;
  const vh = window.innerHeight - 52;
  gameState.camX = Math.max(0, Math.min(CONFIG.WORLD_W - vw,  player.x - vw / 2));
  gameState.camY = Math.max(0, Math.min(CONFIG.WORLD_H - vh,  player.y - vh / 2));
}

function gameLoop(timestamp) {
  const dt = Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;

  requestAnimationFrame(gameLoop);

  if (gameState.gameOver) { showGameOver(); return; }
  if (gameState.won)       { showVictory();  return; }
  if (gameState.paused)    return;

  // === UPDATE ===
  gameState.tick(dt);

  // WASD movement (replaces mouse-click movement)
  processWASD(dt);

  car.update(dt);
  combat.update(dt);
  enemySystem.update(dt);
  policeSystem.update(dt);
  rivalSystem.update(dt);
  bodyguardSystem.update(dt);
  missionSystem.tick();
  mapSystem.checkDistrictOwnership();

  updateCamera();
  updateHUD();

  // === DRAW ===
  // Canvas origin shifted so world(0,0) = screen(0, 52)
  ctx.save();
  ctx.translate(-gameState.camX, -gameState.camY + 52);

  mapSystem.drawWorld(ctx, gameState.camX, gameState.camY);

  if (!gameState.inCar) car.draw(ctx);
  enemySystem.draw(ctx);
  rivalSystem.draw(ctx);
  bodyguardSystem.draw(ctx);
  if (gameState.inCar) car.draw(ctx);
  player.draw(ctx);
  policeSystem.draw(ctx);
  combat.draw(ctx);

  // Crosshair at mouse position in world
  if (!gameState.inCar) drawCrosshair(ctx);

  ctx.restore();

  // UI drawn in screen space (no transform)
  drawStars();

  const mmCtx = document.getElementById('minimap-canvas').getContext('2d');
  mapSystem.drawMinimap(mmCtx, player);
}

function drawCrosshair(ctx) {
  const mx = mouseWorldX;
  const my = mouseWorldY;
  const r = 10;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,220,0,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(mx - r, my); ctx.lineTo(mx + r, my); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx, my - r); ctx.lineTo(mx, my + r); ctx.stroke();
  ctx.beginPath(); ctx.arc(mx, my, r * 0.6, 0, Math.PI * 2); ctx.stroke();
  // Line from player to cursor
  ctx.strokeStyle = 'rgba(255,220,0,0.15)';
  ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(mx, my); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawStars() {
  const stars = gameState.stars;
  if (stars === 0) return;
  const x = window.innerWidth - 14;
  const y = 36;
  ctx.font = '18px serif';
  ctx.textAlign = 'right';
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < stars ? '#4488ff' : 'rgba(255,255,255,0.12)';
    ctx.fillText('★', x - i * 22, y);
  }
}

function tryExtort() {
  const prop = mapSystem.getNearbyProperty(player.x, player.y, 90);
  if (!prop)       { showLog('Nenhuma propriedade por perto.', 'info');   return; }
  if (prop.owned)  { showLog(`${prop.name} já é sua.`, 'info');           return; }

  const chance = 0.55 + (gameState.respect / 10000) * 0.25;
  if (Math.random() < chance) {
    prop.owned = true;
    mapSystem.recalcPassiveIncome();
    mapSystem.checkDistrictOwnership();
    gameState.addMoney(200);
    gameState.addRespect(100);
    showLog(`✅ Extorsão bem-sucedida: ${prop.name}!`, 'success');
    if (window.missionSystem) missionSystem.onEvent('extort');
  } else {
    enemySystem.spawn(prop.x, prop.y, 3 + Math.floor(gameState.respect / 1000));
    showLog(`⚔️ ${prop.name} resistiu! Capangas enviados!`, 'danger');
    gameState.addHeat(15);
  }
}
