"use client"

type StatBarColor = "hp" | "mp" | "xp"

interface StatBarProps {
  /** Rótulo curto exibido à esquerda da barra (ex.: "HP", "MP"). */
  label: string
  /** Valor atual. */
  current: number
  /** Valor máximo. */
  max: number
  /** Esquema de cor da barra. */
  color?: StatBarColor
  /** Mostra o texto "atual / máximo" sobre a barra. Padrão: true. */
  showValue?: boolean
}

const COLOR_MAP: Record<StatBarColor, { from: string; to: string; text: string }> = {
  hp: { from: "#ef4444", to: "#b91c1c", text: "#fecaca" },
  mp: { from: "#3b82f6", to: "#1d4ed8", text: "#bfdbfe" },
  xp: { from: "#eab308", to: "#a16207", text: "#fef08a" },
}

export function StatBar({ label, current, max, color = "hp", showValue = true }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const c = COLOR_MAP[color]

  return (
    <div className="flex items-center gap-2">
      <span
        className="font-pixel text-[8px] w-7 shrink-0 text-amber-100"
        style={{ textShadow: "1px 1px 0 #000" }}
      >
        {label}
      </span>

      <div className="relative h-4 flex-1 border-2 border-black bg-stone-900/90 shadow-[inset_0_0_0_2px_#57534e]">
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to bottom, ${c.from} 0%, ${c.from} 45%, ${c.to} 55%, ${c.to} 100%)`,
          }}
        />
        {/* brilho superior estilo pixel */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-white/25" style={{ width: `${pct}%` }} />

        {showValue && (
          <span
            className="font-pixel-body absolute inset-0 flex items-center justify-center text-[13px] leading-none"
            style={{ color: c.text, textShadow: "1px 1px 0 #000" }}
          >
            {current} / {max}
          </span>
        )}
      </div>
    </div>
  )
}
