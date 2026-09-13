"use client"

export function StageTransition({ stage, isLoading }: { stage: number | null; isLoading: boolean }) {
  if (!stage || !isLoading) return null

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando próxima fase"
    >
      <div className="w-[min(90vw,28rem)] border-2 border-amber-500/70 bg-stone-900 px-8 py-7 text-center shadow-[0_0_40px_rgba(245,158,11,0.18)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-amber-400 text-2xl text-amber-300 animate-spin" aria-hidden="true">
          +
        </div>
        <p className="mt-5 font-pixel text-[10px] uppercase tracking-[0.3em] text-amber-300">Fase desbloqueada</p>
        <p className="mt-3 font-pixel text-xl text-amber-50">Nível {stage}</p>
        <p className="mt-3 font-pixel-body text-lg text-stone-300">Carregando próxima fase...</p>
        <div className="mt-5 h-2 overflow-hidden border border-stone-700 bg-stone-950" aria-hidden="true">
          <div className="h-full w-1/2 bg-amber-400 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
