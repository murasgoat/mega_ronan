"use client"

type TransitionDoorProps = {
  open: boolean
  stage: 3 | 4
  x?: number
  y?: number
}

export function TransitionDoor({ open, stage, x = 0, y = 0 }: TransitionDoorProps) {
  return (
    <div
      className="pointer-events-none absolute z-[8] -translate-x-1/2 -translate-y-1/2 text-center"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
      aria-label={open ? `Portal para a Fase ${stage + 1}` : "Porta trancada"}
      role="img"
    >
      <div className={`relative h-28 w-24 rounded-t-[3rem] border-4 p-2 shadow-[0_8px_0_rgba(0,0,0,.35)] ${open ? "border-amber-300 bg-violet-950 shadow-[0_0_28px_rgba(251,191,36,.7)]" : "border-slate-500 bg-slate-800"}`}>
        <div className={`flex h-full items-center justify-center rounded-t-[2.5rem] border-2 ${open ? "border-cyan-300/80 bg-cyan-400/20" : "border-slate-600 bg-slate-950/70"}`}>
          <span className={`font-pixel text-3xl ${open ? "animate-pulse text-amber-200" : "text-slate-500"}`}>{open ? "✦" : "×"}</span>
        </div>
        <div className="absolute -bottom-2 left-1/2 h-2 w-20 -translate-x-1/2 rounded-full bg-black/50" />
      </div>
      <p className={`mt-3 font-pixel-body text-lg ${open ? "text-amber-100" : "text-slate-300"}`}>
        {open ? `Porta · Fase ${stage + 1}` : "Porta trancada"}
      </p>
      {open && <p className="font-pixel-body text-base text-cyan-100">E ou Espaço</p>}
    </div>
  )
}
