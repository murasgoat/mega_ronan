"use client"

import { memo } from "react"
import type { GameCharacter } from "@/lib/characters"

interface CharacterSelectProps {
  characters: GameCharacter[]
  onSelect: (character: GameCharacter) => void
}

export const CharacterSelect = memo(function CharacterSelect({ characters, onSelect }: CharacterSelectProps) {
  return (
    <main className="min-h-dvh bg-stone-950 px-5 py-10 text-amber-50">
      <section className="mx-auto max-w-6xl">
        <p className="font-pixel text-center text-xs uppercase tracking-[0.3em] text-amber-400">O Tabuleiro do Véu</p>
        <h1 className="mt-5 text-center font-pixel text-2xl leading-relaxed text-amber-100">Escolha seu herói</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center font-pixel-body text-2xl text-stone-300">Sua classe permanece com você em todas as fases da aventura.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {characters.map((character) => (
            <button key={character.id} type="button" onClick={() => onSelect(character)} className="group border-2 border-stone-700 bg-stone-900 p-5 text-left transition hover:-translate-y-1 hover:border-amber-400 hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">
              <div className="flex h-48 items-center justify-center border border-stone-700 bg-stone-950">
                <img src={character.image} alt={`Sprite do ${character.className}`} className="pixelated h-40 w-32 object-contain transition group-hover:scale-105" />
              </div>
              <h2 className="mt-5 font-pixel text-sm" style={{ color: character.accent }}>{character.className}</h2>
              <p className="mt-2 min-h-12 font-pixel-body text-xl text-stone-300">{character.ability}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 font-pixel-body text-lg text-stone-400">
                <div><dt>Vida</dt><dd className="text-amber-100">{character.hp}</dd></div>
                <div><dt>Mana</dt><dd className="text-cyan-200">{character.mp}</dd></div>
                <div><dt>Velocidade</dt><dd className="text-amber-100">{character.speed}</dd></div>
                <div><dt>Alcance</dt><dd className="text-amber-100">{character.attackRange}</dd></div>
              </dl>
              <span className="mt-5 block border border-stone-600 px-3 py-2 text-center font-pixel-body text-lg text-amber-100 group-hover:border-amber-400">Escolher</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
})
