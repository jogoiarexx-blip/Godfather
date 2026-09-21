// ===== CONFIG GLOBAL =====
const CONFIG = {
  WORLD_W: 2400,
  WORLD_H: 1800,
  PLAYER_SPEED: 3.5,
  PLAYER_HP: 100,
  CAR_ACCEL: 0.45,
  CAR_FRICTION: 0.88,
  CAR_TURN_SPEED: 0.055,
  CAR_MAX_SPEED: 10,
  BULLET_SPEED: 14,
  BULLET_DAMAGE: 25,
  ENEMY_SPEED: 1.4,
  ENEMY_HP: 60,
  ENEMY_DAMAGE: 8,
  POLICE_SPEED: 2.0,
  POLICE_HP: 80,
  POLICE_DAMAGE: 12,
  RIVAL_SPEED: 1.2,
  RIVAL_HP: 80,
  HEAT_DECAY: 0.015,
  HEAT_PER_SHOT: 1.5,
  HEAT_PER_KILL: 8,
  POLICE_SPAWN_INTERVAL: 4000,
  RIVAL_THINK_INTERVAL: 8000,
  BODYGUARD_FOLLOW_DIST: 70,
  BODYGUARD_ATTACK_RANGE: 180,
};

// Rank thresholds
const RANKS = [
  { name: 'Soldado',    min: 0,    guards: 0, color: '#aaa' },
  { name: 'Associado',  min: 300,  guards: 0, color: '#ccc' },
  { name: 'Caporegime', min: 800,  guards: 1, color: '#d4af37' },
  { name: 'Consigliere',min: 2000, guards: 2, color: '#e8c840' },
  { name: 'Underboss',  min: 4000, guards: 2, color: '#f0d050' },
  { name: 'Don',        min: 8000, guards: 3, color: '#ffd700' },
];

// ── Sweep collision: segmento de linha vs círculo ──────────────────────────
// Retorna true se o segmento (ax,ay)→(bx,by) passa dentro do raio r do ponto (cx,cy)
function _segCircle(ax, ay, bx, by, cx, cy, r) {
  const dx = bx - ax, dy = by - ay;
  const fx = ax - cx, fy = ay - cy;
  const a = dx*dx + dy*dy;
  if (a < 0.0001) return Math.hypot(fx, fy) < r; // ponto estático
  const b = 2 * (fx*dx + fy*dy);
  const c = fx*fx + fy*fy - r*r;
  let disc = b*b - 4*a*c;
  if (disc < 0) return false;
  disc = Math.sqrt(disc);
  const t1 = (-b - disc) / (2*a);
  const t2 = (-b + disc) / (2*a);
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
}

function getRank(respect) {
  let r = RANKS[0];
  for (const rank of RANKS) {
    if (respect >= rank.min) r = rank;
  }
  return r;
}
