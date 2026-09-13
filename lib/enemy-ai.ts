import { distance } from "./collision"

export interface Enemy {
  id: number
  name: string
  hp: number
  maxHp: number
  x: number
  y: number
  vx?: number
  vy?: number
  actionTimer?: number
  attacking?: boolean
}

export interface Dragon extends Enemy {
  projectiles: Projectile[]
  actionTimer: number
}

export interface Projectile {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  active: boolean
}

const SOLDIER_SPEED = 1.5
const SOLDIER_CHASE_RANGE = 120
const SOLDIER_ATTACK_RANGE = 58
const DRAGON_SPEED = 0.8
const DRAGON_CHASE_RANGE = 150
const DRAGON_ATTACK_RANGE = 170
const DRAGON_HITBOX_RADIUS = 96
const ATTACK_COOLDOWN = 2000
export const DRAGON_PROJECTILE_RADIUS = 24
export const DRAGON_ATTACK_DAMAGE = 10
export const DRAGON_PROJECTILE_DAMAGE = DRAGON_ATTACK_DAMAGE

// Chefe final (Fase 5): perseguição global contínua e hitbox colossal.
const BOSS_SPEED = 1.7
const BOSS_ATTACK_RANGE = 150
export const BOSS_HITBOX_RADIUS = 150

export function updateSoldier(
  soldier: Enemy,
  playerX: number,
  playerY: number
): { vx: number; vy: number; attacking: boolean } {
  const dx = playerX - soldier.x
  const dy = playerY - soldier.y
  const dist = distance(soldier.x, soldier.y, playerX, playerY)

  if (dist < SOLDIER_CHASE_RANGE) {
    const angle = Math.atan2(dy, dx)
    return {
      vx: Math.cos(angle) * SOLDIER_SPEED,
      vy: Math.sin(angle) * SOLDIER_SPEED,
      attacking: dist < SOLDIER_ATTACK_RANGE,
    }
  }

  return { vx: 0, vy: 0, attacking: false }
}

export function updateDragon(
  dragon: Dragon,
  playerX: number,
  playerY: number,
  now: number
): {
  vx: number
  vy: number
  attacking: boolean
  projectiles: Projectile[]
} {
  const dx = playerX - dragon.x
  const dy = playerY - dragon.y
  const dist = distance(dragon.x, dragon.y, playerX, playerY)

  let vx = 0
  let vy = 0
  let attacking = false
  let projectiles = [...(dragon.projectiles || [])]

  if (dist < DRAGON_CHASE_RANGE) {
    const angle = Math.atan2(dy, dx)
    vx = Math.cos(angle) * DRAGON_SPEED * (dist < DRAGON_ATTACK_RANGE ? 0 : 1)
    vy = Math.sin(angle) * DRAGON_SPEED * (dist < DRAGON_ATTACK_RANGE ? 0 : 1)

    if (dist < DRAGON_ATTACK_RANGE && (!dragon.actionTimer || now - dragon.actionTimer > ATTACK_COOLDOWN)) {
      attacking = true
      dragon.actionTimer = now

      const projSpeed = 2
      projectiles.push({
        id: Math.random(),
        x: dragon.x,
        y: dragon.y,
        vx: Math.cos(angle) * projSpeed,
        vy: Math.sin(angle) * projSpeed,
        active: true,
      })
    }
  }

  projectiles = projectiles
    .map((proj) => ({ ...proj, x: proj.x + proj.vx, y: proj.y + proj.vy }))
    .filter((proj) => Math.abs(proj.x) < 500 && Math.abs(proj.y) < 300)

  return { vx, vy, attacking, projectiles }
}

/**
 * IA do Chefe Final: perseguição global. Independente da distância, o boss
 * sempre se move em direção ao jogador (pathfinding direto em tempo real).
 */
export function updateBoss(
  boss: Enemy,
  playerX: number,
  playerY: number
): { vx: number; vy: number; attacking: boolean } {
  const dx = playerX - boss.x
  const dy = playerY - boss.y
  const dist = distance(boss.x, boss.y, playerX, playerY)
  const angle = Math.atan2(dy, dx)
  const moving = dist > BOSS_ATTACK_RANGE * 0.4

  return {
    vx: moving ? Math.cos(angle) * BOSS_SPEED : 0,
    vy: moving ? Math.sin(angle) * BOSS_SPEED : 0,
    attacking: dist < BOSS_ATTACK_RANGE,
  }
}

export function checkEnemyAttackRange(
  enemyX: number,
  enemyY: number,
  playerX: number,
  playerY: number,
  isBoss: boolean = false
): boolean {
  const dist = distance(enemyX, enemyY, playerX, playerY)
  return isBoss ? dist < DRAGON_HITBOX_RADIUS : dist < SOLDIER_ATTACK_RANGE
}

export function checkPlayerAttackRange(
  playerX: number,
  playerY: number,
  targetX: number,
  targetY: number,
  isBoss = false,
  customRange?: number
): boolean {
  const PLAYER_ATTACK_RANGE = customRange ?? (isBoss ? 120 : 58)
  const dist = distance(playerX, playerY, targetX, targetY)
  return dist < PLAYER_ATTACK_RANGE + (isBoss ? DRAGON_HITBOX_RADIUS : 0)
}
