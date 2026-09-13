"use client"

export interface QuestObjective {
  label: string
  current: number
  total: number
}

export interface QuestTrackerProps {
  title?: string
  questName?: string
  objectives?: QuestObjective[]
}

export function QuestTracker({
  title = "Missão Atual",
  questName,
  objectives = [{ label: "Derrotar Slimes", current: 0, total: 3 }],
}: QuestTrackerProps) {
  return (
    <div className="w-64 max-w-[80vw] border-4 border-amber-700 bg-gradient-to-b from-stone-800 to-stone-900 p-2.5 shadow-[0_0_0_2px_#000,4px_4px_0_0_rgba(0,0,0,0.5)]">
      {/* Título com "faixa" */}
      <div className="mb-2 flex items-center gap-2 border-b-2 border-amber-700/60 pb-1.5">
        <span aria-hidden="true" className="text-amber-400">
          {"\u2726"}
        </span>
        <h2
          className="font-pixel text-[9px] uppercase tracking-wide text-amber-300"
          style={{ textShadow: "1px 1px 0 #000" }}
        >
          {title}
        </h2>
      </div>

      {questName && (
        <p className="font-pixel-body mb-1 text-[15px] leading-tight text-amber-100">{questName}</p>
      )}

      <ul className="space-y-1.5">
        {objectives.map((obj, i) => {
          const done = obj.current >= obj.total
          return (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={done ? "text-green-400" : "text-amber-500"}
                >
                  {done ? "\u2714" : "\u25B8"}
                </span>
                <span
                  className={`font-pixel-body text-[15px] leading-tight ${
                    done ? "text-green-300 line-through" : "text-stone-200"
                  }`}
                >
                  {obj.label}
                </span>
              </span>
              <span
                className={`font-pixel text-[8px] ${done ? "text-green-400" : "text-amber-300"}`}
                style={{ textShadow: "1px 1px 0 #000" }}
              >
                {obj.current}/{obj.total}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
