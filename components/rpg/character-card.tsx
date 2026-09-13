import type { GameCharacter } from "@/lib/characters"

interface CharacterCardProps {
  character: GameCharacter
}

/**
 * Cartão de personagem exibido na cutscene de intro.
 * Mostra o sprite do amigo, o nome real e a classe/persona no mundo medieval.
 */
export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <div
      className="group relative flex w-full flex-col overflow-hidden rounded-md border-4 bg-[#0f0a1e] shadow-[0_0_0_2px_#000,0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:-translate-y-1"
      style={{ borderColor: character.accent }}
    >
      {/* Sprite */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1a1330]">
        <img
          src={character.image || "/placeholder.svg"}
          alt={`Sprite de ${character.realName}, o ${character.className}`}
          className="pixelated h-full w-full object-cover object-top"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f0a1e] via-transparent to-transparent" />
      </div>

      {/* Placa de identificação */}
      <div className="flex flex-col gap-1 border-t-2 border-black/40 px-2 py-2 text-center">
        <span className="font-pixel text-[9px] leading-tight text-white">{character.realName}</span>
        <span
          className="font-pixel-body text-base leading-none tracking-wide"
          style={{ color: character.accent }}
        >
          {character.className}
        </span>
        <div className="mt-1 flex items-center justify-center gap-2 font-pixel-body text-sm">
          <span className="text-red-400">HP {character.hp}</span>
          <span className="text-sky-400">MP {character.mp}</span>
        </div>
      </div>
    </div>
  )
}
