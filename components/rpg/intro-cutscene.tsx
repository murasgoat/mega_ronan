import { PARTY, STORY_TEXT, type GameCharacter } from "@/lib/characters"
import { CharacterCard } from "./character-card"

interface IntroCutsceneProps {
  /** Elenco a exibir. Padrão: PARTY da config. */
  party?: GameCharacter[]
  /** Texto da história. */
  story?: string
  /** Ação ao clicar em "Entrar no Mundo Medieval". */
  onEnter?: () => void
}

/**
 * Tela de intro / cutscene estilo Jumanji.
 * Layout escuro e místico, moldura medieval, história e cartões dos personagens.
 */
export function IntroCutscene({ party = PARTY, story = STORY_TEXT, onEnter }: IntroCutsceneProps) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#0a0713] px-4 py-10">
      {/* Brilho místico de fundo */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-1/2 top-1/3 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#3a2a6e_0%,transparent_70%)] blur-2xl" />
        <div className="absolute right-1/4 top-1/4 h-40 w-40 rounded-full bg-[radial-gradient(circle,#1f6b52_0%,transparent_70%)] blur-2xl" />
      </div>

      {/* Moldura medieval */}
      <div className="relative z-10 w-full max-w-4xl rounded-lg border-4 border-[#c9a24a] bg-[#120c24]/90 p-1 shadow-[0_0_0_3px_#000,inset_0_0_40px_rgba(201,162,74,0.15),0_20px_60px_rgba(0,0,0,0.7)]">
        <div className="rounded border-2 border-[#6b5220] px-5 py-8 sm:px-10">
          {/* Título */}
          <div className="mb-6 text-center">
            <p className="font-pixel-body text-lg tracking-[0.3em] text-[#c9a24a]">CAPÍTULO I</p>
            <h1 className="font-pixel text-lg leading-relaxed text-white sm:text-2xl">
              O Portal do Tabuleiro
            </h1>
          </div>

          {/* História */}
          <p className="mx-auto mb-8 max-w-2xl text-balance text-center font-pixel-body text-xl leading-relaxed text-[#d9d2e8] sm:text-2xl">
            {story}
          </p>

          {/* Cartões dos personagens */}
          <div className="mb-8">
            <p className="mb-3 text-center font-pixel text-[10px] text-[#8f83b8]">
              OS AVENTUREIROS SUGADOS
            </p>
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {party.map((c) => (
                <CharacterCard key={c.id} character={c} />
              ))}
            </div>
          </div>

          {/* Botão de entrada */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onEnter}
              className="group relative font-pixel text-xs text-[#2a1c05] transition-transform active:translate-y-0.5 sm:text-sm"
            >
              <span className="block rounded border-4 border-[#8a6a1f] bg-gradient-to-b from-[#f0d47e] to-[#c9a24a] px-6 py-4 shadow-[0_0_0_2px_#000,0_6px_0_#6b5220] group-hover:from-[#f7e29a] group-hover:to-[#d9b25c]">
                Entrar no Mundo Medieval
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
