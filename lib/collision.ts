export type Rect = { x: number; y: number; w: number; h: number }

export function checkCollision(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

export const MAP_BOUNDS = {
  stage1: { left: -460, right: 460, top: -220, bottom: 220 },
  stage2: { left: -420, right: 420, top: -200, bottom: 200 },
  stage3: { left: -420, right: 420, top: -200, bottom: 200 },
  stage4: { left: -420, right: 420, top: -200, bottom: 200 },
  stage5: { left: -420, right: 420, top: -200, bottom: 200 },
}

export const OBSTACLES: Record<number, Rect[]> = {
  // As bordas são estreitas e não invadem o corredor central entre o jogador e o Ancião.
  1: [
    { x: -460, y: -220, w: 42, h: 440 },
    { x: 418, y: -220, w: 42, h: 440 },
  ],
  2: [
    { x: -400, y: -180, w: 80, h: 360 },
    { x: 320, y: -180, w: 80, h: 360 },
  ],
  3: [
    { x: -420, y: -200, w: 120, h: 400 },
    { x: 300, y: -200, w: 120, h: 400 },
    { x: -300, y: 80, w: 100, h: 120 },
    { x: 200, y: 80, w: 100, h: 120 },
  ],
  4: [
    { x: -420, y: -200, w: 120, h: 400 },
    { x: 300, y: -200, w: 120, h: 400 },
    { x: -250, y: 60, w: 150, h: 140 },
    { x: 100, y: 60, w: 150, h: 140 },
  ],
  5: [
    { x: -420, y: -200, w: 420, h: 60 },
    { x: -420, y: 140, w: 420, h: 60 },
    { x: -420, y: -200, w: 60, h: 400 },
    { x: 360, y: -200, w: 60, h: 400 },
  ],
}

export function canMove(
  newX: number,
  newY: number,
  playerW: number = 24,
  playerH: number = 28,
  stage: number = 1
): boolean {
  const playerRect = { x: newX - playerW / 2, y: newY - playerH / 2, w: playerW, h: playerH }

  const obstacles = OBSTACLES[stage] || []
  for (const obstacle of obstacles) {
    if (checkCollision(playerRect, obstacle)) {
      return false
    }
  }

  const stageKey = `stage${stage}` as keyof typeof MAP_BOUNDS
  const bounds = MAP_BOUNDS[stageKey] || MAP_BOUNDS.stage1
  return newX - playerW / 2 >= bounds.left && newX + playerW / 2 <= bounds.right && newY - playerH / 2 >= bounds.top && newY + playerH / 2 <= bounds.bottom
}
