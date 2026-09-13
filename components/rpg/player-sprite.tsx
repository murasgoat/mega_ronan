"use client"

import { memo } from "react"
import type { PlayerState } from "@/hooks/use-player-controls"

export interface PlayerSpriteProps {
  src: string
  name?: string
  state: PlayerState
  frame?: { scale?: number; position?: string; columns?: number; rows?: number }
  hit?: boolean
}

function PlayerSpriteComponent({ src, name = "Herói", state, frame = { scale: 1, position: "center", columns: 1, rows: 1 }, hit = false }: PlayerSpriteProps) {
  const { x, y, facing, action, jumping, attacking } = state
  const flip = facing === "left" ? -1 : 1
  const jumpOffset = jumping ? -46 : 0
  const columns = frame.columns ?? 1
  const rows = frame.rows ?? 1
  const directionPosition = {
    down: "50% 0%",
    left: "0% 50%",
    right: "100% 50%",
    up: "50% 100%",
  }[facing]
  const animation = action === "walk" && columns > 1 ? "sprite-walk" : "sprite-idle"

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5]" style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`, transition: "transform 60ms linear" }} aria-label={`${name} (${action})`} role="img">
      {hit && <div className="absolute -inset-5 z-20 rounded-full bg-red-400/70 shadow-[0_0_24px_10px_rgba(248,113,113,0.8)] animate-pulse" aria-label="Jogador atingido" />}
      <div className="absolute left-1/2 top-full h-3 w-16 -translate-x-1/2 rounded-[50%] bg-black/45" style={{ transform: `translateX(-50%) scaleX(${jumping ? 0.7 : 1})` }} aria-hidden="true" />
      <div className={animation} style={{ transform: `translateY(${jumpOffset}px) scaleX(${flip})` }}>
        <div
          className="relative h-28 w-24 overflow-hidden"
          style={{
            transform: `scale(${frame.scale ?? 1})`,
            aspectRatio: `${columns} / ${rows}`,
          }}
        >
          {attacking && <span className="absolute -right-3 top-1/2 z-10 h-16 w-16 -translate-y-1/2 rounded-full bg-amber-300/70 blur-md" aria-hidden="true" />}
          <div
            className={`sprite-sheet pixelated h-full w-full ${columns > 1 ? "sprite-animated" : ""}`}
            style={{
              backgroundImage: `url(${src || "/sprites/hero-avatar.png"})`,
              backgroundSize: `${columns * 100}% ${rows * 100}%`,
              backgroundPosition: frame.position ?? (columns > 1 || rows > 1 ? directionPosition : "center"),
              backgroundRepeat: "no-repeat",
              animationDuration: action === "walk" ? "480ms" : "1200ms",
              animationTimingFunction: `steps(${Math.max(columns, 1)})`,
            }}
            aria-hidden="true"
          />
        </div>
      </div>
      {(attacking || jumping) && <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap"><span className="font-pixel text-[8px] text-amber-200" style={{ textShadow: "1px 1px 0 #000" }}>{attacking ? "ATAQUE!" : "PULO!"}</span></div>}
    </div>
  )
}

export const PlayerSprite = memo(PlayerSpriteComponent)
PlayerSprite.displayName = "PlayerSprite"
