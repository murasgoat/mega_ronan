"use client"

import Image from "next/image"
import { StatBar } from "./stat-bar"

export interface PlayerHudProps {
  name?: string
  avatarSrc?: string
  level?: number
  hp?: { current: number; max: number }
  mp?: { current: number; max: number }
  gold?: number
  /** Objetivo principal exibido no rodapé do HUD. Se omitido, mostra o ouro. */
  objective?: string
}

export function PlayerHud({
  name = "Herói",
  avatarSrc = "/sprites/hero-avatar.png",
  level = 1,
  hp = { current: 100, max: 100 },
  mp = { current: 50, max: 50 },
  gold = 250,
  objective,
}: PlayerHudProps) {
  return (
    <div className="w-72 max-w-[80vw] border-4 border-amber-700 bg-gradient-to-b from-stone-800 to-stone-900 p-2.5 shadow-[0_0_0_2px_#000,4px_4px_0_0_rgba(0,0,0,0.5)]">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="relative h-16 w-16 overflow-hidden border-2 border-amber-500 bg-stone-950 shadow-[inset_0_0_0_2px_#000]">
            <Image
              src={avatarSrc || "/placeholder.svg"}
              alt={`Retrato de ${name}`}
              fill
              sizes="64px"
              className="pixelated object-cover"
              priority
            />
          </div>
          {/* Emblema de nível */}
          <div
            className="font-pixel absolute -bottom-1.5 -right-1.5 flex h-6 items-center justify-center border-2 border-black bg-amber-500 px-1 text-[8px] text-black"
            aria-label={`Nível ${level}`}
          >
            Nv.{level}
          </div>
        </div>

        {/* Nome + barras */}
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          <span
            className="font-pixel truncate text-[9px] text-amber-100"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            {name}
          </span>
          <StatBar label="HP" current={hp.current} max={hp.max} color="hp" />
          <StatBar label="MP" current={mp.current} max={mp.max} color="mp" />
        </div>
      </div>

      {objective ? (
        /* Objetivo principal */
        <div className="mt-2.5 flex items-center gap-2 border-t-2 border-amber-700/60 pt-2">
          <span
            aria-hidden="true"
            className="flex h-4 w-4 shrink-0 items-center justify-center border-2 border-yellow-700 bg-gradient-to-b from-yellow-300 to-yellow-500 text-[8px] font-bold text-yellow-800 shadow-[1px_1px_0_#000]"
          >
            {"\u2605"}
          </span>
          <span
            className="font-pixel-body text-[15px] leading-tight text-amber-100"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            <span className="text-amber-400/80">Objetivo: </span>
            {objective}
          </span>
        </div>
      ) : (
        /* Ouro */
        <div className="mt-2.5 flex items-center gap-2 border-t-2 border-amber-700/60 pt-2">
          <span
            aria-hidden="true"
            className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-yellow-700 bg-gradient-to-b from-yellow-300 to-yellow-500 text-[9px] font-bold text-yellow-800 shadow-[1px_1px_0_#000]"
          >
            $
          </span>
          <span
            className="font-pixel text-[9px] text-yellow-200"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            {gold.toLocaleString("pt-BR")}
          </span>
          <span className="font-pixel-body ml-auto text-[13px] text-yellow-400/80">Ouro</span>
        </div>
      )}
    </div>
  )
}
