// ===== MAP: DISTRITOS & PROPRIEDADES =====

const DISTRICTS = [
  { id: 0, name: 'Porto Velho',    x: 200,  y: 200,  w: 500, h: 400, color: '#1a3a1a', owner: 'player',  income: 0 },
  { id: 1, name: 'Mercado Negro',  x: 750,  y: 150,  w: 500, h: 380, color: '#1a1a3a', owner: 'rival',   income: 0 },
  { id: 2, name: 'Bairro Italiano',x: 1300, y: 200,  w: 500, h: 420, color: '#3a1a1a', owner: 'rival',   income: 0 },
  { id: 3, name: 'Centro Histórico',x:200,  y: 650,  w: 500, h: 450, color: '#2a2a1a', owner: 'neutral', income: 0 },
  { id: 4, name: 'La Cittadella',  x: 750,  y: 600,  w: 500, h: 500, color: '#1a2a2a', owner: 'rival',   income: 0 },
  { id: 5, name: 'Villa Corleone', x: 1300, y: 650,  w: 500, h: 450, color: '#2a1a2a', owner: 'neutral', income: 0 },
];

const PROPERTIES = [
  // Porto Velho (district 0) — player starts here
  { id: 0, district: 0, name: 'Padaria',        x: 320,  y: 320,  owned: false, income: 60,  upgLevel: 0, upgCosts: [500, 1500, 4000],  upgMult: [1, 1.8, 3.2, 5] },
  { id: 1, district: 0, name: 'Armazém',        x: 500,  y: 450,  owned: false, income: 90,  upgLevel: 0, upgCosts: [700, 2000, 5000],  upgMult: [1, 1.8, 3.2, 5] },
  // Mercado Negro (district 1)
  { id: 2, district: 1, name: 'Bar Clandestino',x: 870,  y: 260,  owned: false, income: 150, upgLevel: 0, upgCosts: [1200, 3000, 7000], upgMult: [1, 2, 3.5, 6] },
  { id: 3, district: 1, name: 'Ferreiro',       x: 1100, y: 380,  owned: false, income: 120, upgLevel: 0, upgCosts: [1000, 2500, 6000], upgMult: [1, 2, 3.5, 6] },
  // Bairro Italiano (district 2)
  { id: 4, district: 2, name: 'Restaurante',    x: 1420, y: 300,  owned: false, income: 200, upgLevel: 0, upgCosts: [2000, 5000, 10000],upgMult: [1, 2.2, 4, 7] },
  { id: 5, district: 2, name: 'Hotel',          x: 1650, y: 420,  owned: false, income: 250, upgLevel: 0, upgCosts: [2500, 6000, 12000],upgMult: [1, 2.2, 4, 7] },
  // Centro Histórico (district 3)
  { id: 6, district: 3, name: 'Banco',          x: 310,  y: 760,  owned: false, income: 350, upgLevel: 0, upgCosts: [4000, 9000, 18000],upgMult: [1, 2.5, 4.5, 8] },
  { id: 7, district: 3, name: 'Teatro',         x: 520,  y: 920,  owned: false, income: 220, upgLevel: 0, upgCosts: [2800, 6500, 13000],upgMult: [1, 2.2, 4, 7] },
  // La Cittadella (district 4)
  { id: 8, district: 4, name: 'Cassino',        x: 870,  y: 700,  owned: false, income: 500, upgLevel: 0, upgCosts: [6000, 14000, 28000],upgMult: [1, 2.8, 5, 9] },
  { id: 9, district: 4, name: 'Clube Noturno',  x: 1100, y: 870,  owned: false, income: 400, upgLevel: 0, upgCosts: [5000, 12000, 24000],upgMult: [1, 2.5, 4.5, 8] },
  // Villa Corleone (district 5)
  { id: 10,district: 5, name: 'Mansão',         x: 1420, y: 780,  owned: false, income: 700, upgLevel: 0, upgCosts: [10000, 22000, 45000],upgMult: [1, 3, 5.5, 10] },
  { id: 11,district: 5, name: 'Porto Privado',  x: 1650, y: 950,  owned: false, income: 600, upgLevel: 0, upgCosts: [8000, 18000, 36000],upgMult: [1, 3, 5.5, 10] },
];

// Roads (for visual only)
const ROADS = [
  { x1: 0, y1: 550, x2: 2400, y2: 550, w: 60 },
  { x1: 0, y1: 1100, x2: 2400, y2: 1100, w: 60 },
  { x1: 700, y1: 0, x2: 700, y2: 1800, w: 60 },
  { x1: 1250, y1: 0, x2: 1250, y2: 1800, w: 60 },
  { x1: 1800, y1: 0, x2: 1800, y2: 1800, w: 60 },
  { x1: 0, y1: 300, x2: 2400, y2: 300, w: 40 },
  { x1: 0, y1: 800, x2: 2400, y2: 800, w: 40 },
];

const mapSystem = {
  getDistrict(x, y) {
    return DISTRICTS.find(d => x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h);
  },

  getNearbyProperty(x, y, radius = 90) {
    return PROPERTIES.find(p => Math.hypot(x - p.x, y - p.y) < radius);
  },

  checkDistrictOwnership() {
    for (const d of DISTRICTS) {
      const props = PROPERTIES.filter(p => p.district === d.id);
      const owned = props.filter(p => p.owned).length;
      if (owned === props.length && props.length > 0) {
        d.owner = 'player';
      }
    }
  },

  getPlayerDistricts() {
    return DISTRICTS.filter(d => d.owner === 'player').length;
  },

  recalcPassiveIncome() {
    let total = 0;
    for (const p of PROPERTIES) {
      if (p.owned) {
        total += p.income * p.upgMult[p.upgLevel];
      }
    }
    gameState.passiveIncome = total;
  },

  drawWorld(ctx, camX, camY) {
    const W = CONFIG.WORLD_W;
    const H = CONFIG.WORLD_H;

    // Background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);

    // Grid texture
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Districts
    for (const d of DISTRICTS) {
      ctx.save();
      let baseColor = d.color;
      if (d.owner === 'player') baseColor = '#0a2a0a';
      else if (d.owner === 'rival') baseColor = '#2a0a0a';
      else baseColor = '#1a1a1a';

      ctx.fillStyle = baseColor;
      ctx.fillRect(d.x, d.y, d.w, d.h);

      // Border
      ctx.strokeStyle = d.owner === 'player' ? '#22aa44' : d.owner === 'rival' ? '#aa2222' : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(d.x, d.y, d.w, d.h);

      // District name
      ctx.fillStyle = d.owner === 'player' ? '#44cc66' : d.owner === 'rival' ? '#cc4444' : '#666';
      ctx.font = 'bold 14px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.name, d.x + d.w / 2, d.y + 22);
      ctx.restore();
    }

    // Roads
    ctx.strokeStyle = '#2a2a2a';
    for (const r of ROADS) {
      ctx.lineWidth = r.w;
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      ctx.lineTo(r.x2, r.y2);
      ctx.stroke();
      // Road lines
      ctx.strokeStyle = 'rgba(255,255,200,0.08)';
      ctx.lineWidth = 2;
      ctx.setLineDash([40, 30]);
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      ctx.lineTo(r.x2, r.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#2a2a2a';
    }

    // Properties
    for (const p of PROPERTIES) {
      this._drawProperty(ctx, p);
    }
  },

  _drawProperty(ctx, p) {
    const size = 36 + p.upgLevel * 6;
    const hx = p.x - size / 2;
    const hy = p.y - size;

    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(hx + 3, hy + 3, size, size);

    // Building body
    ctx.fillStyle = p.owned ? '#1a4a1a' : '#2a1a1a';
    ctx.fillRect(hx, hy, size, size);

    // Border
    ctx.strokeStyle = p.owned ? '#44cc66' : '#993333';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx, hy, size, size);

    // Upgrade stars
    for (let i = 0; i < p.upgLevel; i++) {
      ctx.fillStyle = '#d4af37';
      ctx.font = '10px serif';
      ctx.textAlign = 'left';
      ctx.fillText('★', hx + 2 + i * 12, hy + 12);
    }

    // Name
    ctx.fillStyle = p.owned ? '#aaffaa' : '#ffaaaa';
    ctx.font = '11px Crimson Text, serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, p.x, hy - 4);

    // Interaction hint
    const dist = Math.hypot(window.player ? player.x - p.x : 9999, window.player ? player.y - p.y : 9999);
    if (dist < 100 && !p.owned) {
      ctx.fillStyle = '#d4af37';
      ctx.font = 'bold 12px Cinzel, serif';
      ctx.fillText('[E] Extorquir', p.x, hy - 18);
    }
    ctx.restore();
  },

  drawMinimap(ctx, player) {
    const W = 160, H = 120;
    const scaleX = W / CONFIG.WORLD_W;
    const scaleY = H / CONFIG.WORLD_H;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Districts on minimap
    for (const d of DISTRICTS) {
      ctx.fillStyle = d.owner === 'player' ? 'rgba(34,170,68,0.5)' : d.owner === 'rival' ? 'rgba(170,34,34,0.5)' : 'rgba(80,80,80,0.4)';
      ctx.fillRect(d.x * scaleX, d.y * scaleY, d.w * scaleX, d.h * scaleY);
    }

    // Properties
    for (const p of PROPERTIES) {
      ctx.fillStyle = p.owned ? '#44cc66' : '#cc4444';
      ctx.fillRect(p.x * scaleX - 2, p.y * scaleY - 2, 4, 4);
    }

    // Police
    if (window.policeSystem) {
      ctx.fillStyle = '#4488ff';
      for (const p of policeSystem.units) {
        ctx.fillRect(p.x * scaleX - 2, p.y * scaleY - 2, 4, 4);
      }
    }

    // Player
    if (player) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(player.x * scaleX, player.y * scaleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Viewport indicator
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      gameState.camX * scaleX,
      gameState.camY * scaleY,
      window.innerWidth * scaleX,
      (window.innerHeight - 52) * scaleY
    );
  }
};
