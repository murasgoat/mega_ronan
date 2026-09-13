"use client"

import Image from "next/image"
import { memo } from "react"

export interface DialogueBoxProps {
  npcName?: string
  npcSpriteSrc?: string
  text?: string
  /** Texto do indicador de continuar. */
  continueHint?: string
  /** Exibe o indicador piscando. Padrão: true. */
  showContinue?: boolean
}

export const DialogueBox = memo(function DialogueBox({
  npcName = "Ancião do Vilarejo",
  npcSpriteSrc = "/sprites/elder-npc.png",
  text = "Bem-vindo, jovem aventureiro! Nosso vilarejo está sendo atormentado por criaturas gosmentas. Derrote 3 Slimes e traga a paz de volta aos nossos campos.",
  continueHint = "Pressione ESPAÇO para continuar...",
  showContinue = true,
}: DialogueBoxProps) {
  return (
    <div className="w-[640px] max-w-[92vw]">
      {/* Placa com o nome do NPC */}
      {npcName && (
        <div className="ml-4 inline-block -mb-1 border-4 border-amber-600 border-b-0 bg-gradient-to-b from-amber-800 to-amber-950 px-3 py-1.5 shadow-[2px_-2px_0_0_rgba(0,0,0,0.4)]">
          <span
            className="font-pixel text-[10px] text-amber-100"
            style={{ textShadow: "1px 1px 0 #000" }}
          >
            {npcName}
          </span>
        </div>
      )}

      {/* Caixa principal */}
      <div className="relative border-4 border-amber-600 bg-gradient-to-b from-[#3a2a1a] to-[#241708] p-3 shadow-[0_0_0_4px_#1a1005,6px_6px_0_0_rgba(0,0,0,0.5)]">
        {/* moldura interna dourada */}
        <div className="absolute inset-1 border-2 border-amber-700/50" aria-hidden="true" />

        <div className="relative flex gap-3">
          {/* Sprite do NPC */}
          <div className="relative h-24 w-24 shrink-0 self-end overflow-hidden border-2 border-amber-500 bg-stone-950 shadow-[inset_0_0_0_2px_#000]">
            <Image
              src={npcSpriteSrc || "/placeholder.svg"}
              alt={`Retrato de ${npcName}`}
              fill
              sizes="96px"
              className="pixelated object-cover"
            />
          </div>

          {/* Texto do diálogo */}
          <div className="flex min-h-24 flex-1 flex-col">
            <p className="font-pixel-body flex-1 text-[19px] leading-snug text-amber-50">{text}</p>

            {showContinue && (
              <div className="mt-1 flex items-center justify-end gap-1.5">
                <span className="font-pixel-body animate-blink text-[15px] text-amber-300">
                  {continueHint}
                </span>
                <span aria-hidden="true" className="animate-blink text-amber-300">
                  {"\u25BE"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
