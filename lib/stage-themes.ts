import type { StageId } from "./stage-manager"

export type StageTheme = {
  className: string
  overlay: string
  accent: string
  assets: string[]
}

export const STAGE_THEMES: Record<StageId, StageTheme> = {
  1: { className: "stage-theme-village", overlay: "bg-emerald-950/20", accent: "text-amber-100", assets: ["/sprites/village-bg.png", "/sprites/elder-npc.png"] },
  2: { className: "stage-theme-dragon", overlay: "bg-red-950/30", accent: "text-orange-100", assets: ["/sprites/dragon-boss.png", "/sprites/veil-crystal.png"] },
  3: { className: "stage-theme-dungeon", overlay: "bg-slate-950/35", accent: "text-slate-100", assets: ["/sprites/soldier-enemy.png"] },
  4: { className: "stage-theme-forest", overlay: "bg-indigo-950/30", accent: "text-violet-100", assets: ["/sprites/soldier-enemy.png"] },
  5: { className: "stage-theme-throne", overlay: "bg-rose-950/20", accent: "text-amber-50", assets: ["/sprites/final-warden.png"] },
}

export function preloadStageAssets(stage: StageId, timeoutMs = 2000): Promise<void> {
  const assets = STAGE_THEMES[stage].assets
  return new Promise((resolve) => {
    let remaining = assets.length
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    const timeout = window.setTimeout(finish, timeoutMs)
    const loaded = () => {
      remaining -= 1
      if (remaining <= 0) {
        window.clearTimeout(timeout)
        finish()
      }
    }
    for (const src of assets) {
      const image = new Image()
      image.onload = loaded
      image.onerror = loaded
      image.src = src
    }
    if (remaining === 0) finish()
  })
}

export function isInViewport(x: number, y: number, padding = 100): boolean {
  return Math.abs(x) <= window.innerWidth / 2 + padding && Math.abs(y) <= window.innerHeight / 2 + padding
}
