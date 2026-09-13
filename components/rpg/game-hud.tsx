"use client"

import { memo } from "react"
import { PlayerHud, type PlayerHudProps } from "./player-hud"
import { QuestTracker, type QuestTrackerProps } from "./quest-tracker"
import { DialogueBox, type DialogueBoxProps } from "./dialogue-box"

interface GameHudProps {
  player?: PlayerHudProps
  quest?: QuestTrackerProps
  dialogue?: DialogueBoxProps
  /** Oculta a caixa de diálogo (ex.: quando não há NPC falando). */
  showDialogue?: boolean
}

/**
 * Camada de sobreposição (overlay) que posiciona toda a HUD do jogo.
 * Use `pointer-events-none` no container e reative nos elementos interativos.
 */
export const GameHud = memo(function GameHud({ player, quest, dialogue, showDialogue = true }: GameHudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-3 sm:p-5">
      {/* Canto superior esquerdo: HUD do jogador */}
      <div className="pointer-events-auto absolute left-3 top-3 sm:left-5 sm:top-5">
        <PlayerHud {...player} />
      </div>

      {/* Canto superior direito: rastreador de missões */}
      <div className="pointer-events-auto absolute right-3 top-3 sm:right-5 sm:top-5">
        <QuestTracker {...quest} />
      </div>

      {/* Parte inferior central: caixa de diálogo */}
      {showDialogue && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6">
          <DialogueBox {...dialogue} />
        </div>
      )}
    </div>
  )
})
