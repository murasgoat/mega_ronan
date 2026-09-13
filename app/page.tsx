"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CharacterSelect } from "@/components/rpg/character-select"
import { GameHud } from "@/components/rpg/game-hud"
import { IntroCutscene } from "@/components/rpg/intro-cutscene"
import { PlayerSprite } from "@/components/rpg/player-sprite"
import { StageTransition } from "@/components/rpg/stage-transition"
import { TransitionDoor } from "@/components/rpg/transition-door"
import { usePlayerControls } from "@/hooks/use-player-controls"
import { INTRO_NPC, MAIN_OBJECTIVE, PARTY } from "@/lib/characters"
import { createStageManager, type StageId } from "@/lib/stage-manager"
import { checkPlayerAttackRange, DRAGON_ATTACK_DAMAGE, DRAGON_PROJECTILE_DAMAGE, DRAGON_PROJECTILE_RADIUS } from "@/lib/enemy-ai"
import type { Enemy, Dragon, Projectile } from "@/lib/enemy-ai"
import { updateSoldier, updateDragon, updateBoss } from "@/lib/enemy-ai"
import { isInViewport, STAGE_THEMES } from "@/lib/stage-themes"

type Phase = "select" | "intro" | "dialogue" | "playing" | "clear"

const DIALOGUE_LINES = [
  "Vocês não são daqui, forasteiros... o Tabuleiro os trouxe através do véu do tempo.",
  "Um feiticeiro sombrio raptou a Princesa Elara e a aprisionou na Torre Carmesim.",
  "Atravessem o vilarejo e encontrem o Ancião. Ele conhece o caminho para o portal.",
]

const STAGE_BACKGROUNDS: Record<StageId, string> = {
  1: "/sprites/village-bg.png",
  2: "/sprites/village-bg.png",
  3: "/sprites/village-bg.png",
  4: "/sprites/village-bg.png",
  5: "",
}

const ENEMY_SETS: Record<3 | 4 | 5, Enemy[]> = {
  3: [
    { id: 1, name: "Sentinela", hp: 2, maxHp: 2, x: -300, y: -80, vx: 0, vy: 0, actionTimer: 0 },
    { id: 2, name: "Sentinela", hp: 2, maxHp: 2, x: 200, y: -100, vx: 0, vy: 0, actionTimer: 0 },
    { id: 3, name: "Sentinela", hp: 2, maxHp: 2, x: -250, y: 60, vx: 0, vy: 0, actionTimer: 0 },
    { id: 4, name: "Sentinela", hp: 2, maxHp: 2, x: 280, y: 80, vx: 0, vy: 0, actionTimer: 0 },
  ],
  4: [
    { id: 1, name: "Guardião Elite", hp: 4, maxHp: 4, x: -180, y: -120, vx: 0, vy: 0, actionTimer: 0 },
    { id: 2, name: "Guardião Elite", hp: 4, maxHp: 4, x: 200, y: 100, vx: 0, vy: 0, actionTimer: 0 },
  ],
  // Chefe Final: resiste a exatamente 20 golpes (o ataque do jogador causa 1 por golpe).
  // Começa sentado no trono, na extremidade norte da arena.
  5: [
    { id: 1, name: "Feiticeiro Sombrio", hp: 20, maxHp: 20, x: 0, y: -260, vx: 0, vy: 0, actionTimer: 0 },
  ],
}

/**
 * Configuração visual e de combate por fase.
 * - scale: classe de tamanho do sprite renderizado.
 * - barClass: largura da barra de vida (proporcional ao sprite).
 * - hitReach: alcance de ataque do jogador contra o inimigo (proporcional ao tamanho).
 * - contactRange: distância em que o inimigo causa dano por contato.
 * - contactDamage: dano infligido ao jogador por golpe.
 */
const ENEMY_STAGE_CONFIG: Record<3 | 4 | 5, {
  scale: string
  barClass: string
  hitReach: number
  contactRange: number
  contactDamage: number
}> = {
  3: { scale: "h-16 w-16", barClass: "w-16", hitReach: 58, contactRange: 50, contactDamage: 10 },
  4: { scale: "h-28 w-28", barClass: "w-28", hitReach: 90, contactRange: 82, contactDamage: 5 },
  5: { scale: "h-56 w-56", barClass: "w-40", hitReach: 170, contactRange: 150, contactDamage: 20 },
}

export default function Page() {
  const [phase, setPhase] = useState<Phase>("select")
  const [line, setLine] = useState(0)
  const [hero, setHero] = useState(PARTY[0])
  const [stage, setStage] = useState<StageId>(1)
  const [transitionStage, setTransitionStage] = useState<StageId | null>(null)
  const [dragonHp, setDragonHp] = useState(8)
  const [dragonProjectiles, setDragonProjectiles] = useState<Projectile[]>([])
  const [crystalDropped, setCrystalDropped] = useState(false)
  const [crystalCollected, setCrystalCollected] = useState(false)
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [objectiveProgress, setObjectiveProgress] = useState(0)
  const [playerDamageFreeze, setPlayerDamageFreeze] = useState(0)
  const [playerHit, setPlayerHit] = useState(false)
  const [hasPlayerMoved, setHasPlayerMoved] = useState(false)
  const [bossCutscene, setBossCutscene] = useState(false)
  const [bossAwakened, setBossAwakened] = useState(false)
  const manager = useRef(createStageManager())
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const gameContainerRef = useRef<HTMLElement | null>(null)
  const lastUpdateRef = useRef(0)
  const dragonActionTimerRef = useRef(0)

  const beginStage = useCallback((next: StageId) => {
    setStage(next)
    setObjectiveProgress(0)
    setDragonHp(8)
    setDragonProjectiles([])
    setCrystalDropped(false)
    setCrystalCollected(false)
    setPlayerDamageFreeze(0)
    setHasPlayerMoved(false)
    setBossCutscene(false)
    setBossAwakened(false)
    dragonActionTimerRef.current = 0
    setEnemies(
      next === 3 || next === 4 || next === 5
        ? ENEMY_SETS[next as 3 | 4 | 5].map((enemy) => ({ ...enemy, actionTimer: 0 }))
        : []
    )
    setTransitionStage(next)
    setPhase("playing")
  }, [])

  const completeObjective = useCallback(
    (id: string, amount = 1) => {
      if (!manager.current.complete(id, amount)) return
      setObjectiveProgress(manager.current.getObjectives()[0].current)
      const next = manager.current.advance()
      if (next) beginStage(next)
    },
    [beginStage]
  )

  const attack = useCallback(
    (playerX: number, playerY: number) => {
      if (stage === 2 && !crystalDropped && dragonHp > 0) {
        if (checkPlayerAttackRange(playerX, playerY, 0, 0, true)) {
          setDragonHp((current) => {
            const next = Math.max(0, current - 1)
            if (next === 0) setCrystalDropped(true)
            return next
          })
        }
        return
      }

      if ((stage === 3 || stage === 4 || stage === 5) && enemies.length > 0) {
        setEnemies((current) => {
          let updated = [...current]
          let damageDealt = false

          const reach = ENEMY_STAGE_CONFIG[stage as 3 | 4 | 5].hitReach
          for (const enemy of updated) {
            if (enemy.hp > 0 && checkPlayerAttackRange(playerX, playerY, enemy.x, enemy.y, false, reach)) {
              enemy.hp = Math.max(0, enemy.hp - 1)
              damageDealt = true
              break
            }
          }

          if (!damageDealt) return current

          const defeated = updated.filter((enemy) => enemy.hp <= 0).length
          if (stage === 3) {
            setObjectiveProgress(defeated)
            if (updated.every((enemy) => enemy.hp <= 0)) {
              manager.current.complete("enemies", 4)
            }
          } else if (stage === 4) {
            setObjectiveProgress(defeated)
            if (updated.every((enemy) => enemy.hp <= 0)) {
              completeObjective("final-enemies", 1)
            }
          } else if (stage === 5) {
            if (updated[0]?.hp <= 0) {
              completeObjective("shadow-mage", 1)
            }
          }

          return updated
        })
      }
    },
    [completeObjective, crystalDropped, dragonHp, enemies.length, stage]
  )

  const handleFirstMovement = useCallback(() => {
    setHasPlayerMoved(true)
  }, [])

  const player = usePlayerControls(
    phase === "playing" && !bossCutscene,
    () => attack(player.x, player.y),
    stage,
    hero.speed,
    handleFirstMovement,
  )

  // Cutscene de entrada do Chefe Final: ao primeiro movimento na Fase 5,
  // congela o jogador (~1.8s), toca a animação de despertar e então
  // libera o controle e ativa a IA de perseguição do Boss.
  useEffect(() => {
    if (phase !== "playing" || stage !== 5) return
    if (!hasPlayerMoved || bossAwakened || bossCutscene) return
    setBossCutscene(true)
    const timer = window.setTimeout(() => {
      setBossCutscene(false)
      setBossAwakened(true)
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [phase, stage, hasPlayerMoved, bossAwakened, bossCutscene])

  const interact = useCallback(() => {
    const near = (targetX: number, targetY: number, radius: number) =>
      Math.hypot(player.x - targetX, player.y - targetY) <= radius

    if (stage === 1 && near(170, 0, 150)) completeObjective("elder")
    if (stage === 2 && crystalDropped && !crystalCollected && near(0, 0, 115)) {
      setCrystalCollected(true)
      completeObjective("crystal")
    }
    const remainingEnemies = enemies.filter((enemy) => enemy.hp > 0).length
    if ((stage === 3 || stage === 4) && remainingEnemies === 0 && near(0, 0, 120)) {
      completeObjective(stage === 3 ? "enemies" : "final-enemies")
    }
  }, [completeObjective, crystalCollected, crystalDropped, enemies, player.x, player.y, stage])

  useEffect(() => {
    if (phase !== "playing") return
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "KeyE" || event.code === "Space") {
        event.preventDefault()
        interact()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [interact, phase])

  // Game loop para IA e dinâmica dos inimigos
  useEffect(() => {
    if (phase !== "playing" || (stage !== 2 && stage !== 3 && stage !== 4 && stage !== 5)) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      return
    }

    const tick = () => {
      const now = performance.now()
      if (now - lastUpdateRef.current < 50) return
      lastUpdateRef.current = now

      if (hasPlayerMoved && stage === 2 && dragonHp > 0) {
        const dragon: Dragon = {
          id: 99,
          name: "Dragão",
          hp: dragonHp,
          maxHp: 8,
          x: 0,
          y: 0,
          projectiles: dragonProjectiles,
          actionTimer: dragonActionTimerRef.current,
        }
        if (dragon) {
          const result = updateDragon(
            {
              ...dragon,
              hp: dragonHp,
              maxHp: 8,
              projectiles: dragonProjectiles,
              actionTimer: dragonActionTimerRef.current,
            },
            player.x,
            player.y,
            now
          )
          dragonActionTimerRef.current = result.attacking ? now : dragonActionTimerRef.current
          setDragonProjectiles(result.projectiles.slice(0, 5))

          if (result.attacking && now - playerDamageFreeze >= 500) {
            setPlayerDamageFreeze(now)
            setPlayerHit(true)
            window.setTimeout(() => setPlayerHit(false), 180)
            setHero((current) => {
              const hp = Math.max(0, current.hp - DRAGON_ATTACK_DAMAGE)
              if (hp <= 0) setPhase("clear")
              return { ...current, hp }
            })
          }
        }
      }

      // Fase 5: a IA do boss só ativa após a cutscene de despertar (bossAwakened).
      const enemiesActive = stage === 5 ? bossAwakened : hasPlayerMoved
      if (enemiesActive && (stage === 3 || stage === 4 || stage === 5) && enemies.length > 0) {
        const bounds = stage === 5 ? { x: 620, y: 360 } : { x: 420, y: 200 }
        setEnemies((current) =>
          current.map((enemy) => {
            if (enemy.hp <= 0) return enemy

            // Fase 5: o Boss usa perseguição global (chase contínuo em tempo real).
            const ai = stage === 5 ? updateBoss(enemy, player.x, player.y) : updateSoldier(enemy, player.x, player.y)
            return {
              ...enemy,
              x: Math.max(-bounds.x, Math.min(bounds.x, enemy.x + ai.vx)),
              y: Math.max(-bounds.y, Math.min(bounds.y, enemy.y + ai.vy)),
              vx: ai.vx,
              vy: ai.vy,
              attacking: ai.attacking,
            }
          })
        )
      }

      // O Dragão aplica 10 de dano e respeita 0,5s de invulnerabilidade.
      if (hasPlayerMoved && stage === 2 && dragonProjectiles.length > 0 && now - playerDamageFreeze >= 500) {
        for (const proj of dragonProjectiles) {
          const dist = Math.hypot(proj.x - player.x, proj.y - player.y)
          if (dist < DRAGON_PROJECTILE_RADIUS + 14) {
            setPlayerDamageFreeze(now)
            setPlayerHit(true)
            window.setTimeout(() => setPlayerHit(false), 180)
            setHero((current) => {
              const hp = Math.max(0, current.hp - DRAGON_PROJECTILE_DAMAGE)
              if (hp <= 0) setPhase("clear")
              return { ...current, hp }
            })
            break
          }
        }
      }

      // Dano ao jogador por contato com inimigos (dano/alcance por fase)
      if (enemiesActive && (stage === 3 || stage === 4 || stage === 5) && enemies.length > 0 && now - playerDamageFreeze > 500) {
        const cfg = ENEMY_STAGE_CONFIG[stage as 3 | 4 | 5]
        for (const enemy of enemies) {
          if (enemy.hp > 0 && enemy.attacking) {
            const dist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2)
            if (dist < cfg.contactRange) {
              setPlayerDamageFreeze(now)
              setPlayerHit(true)
              window.setTimeout(() => setPlayerHit(false), 180)
              setHero((current) => {
                const hp = Math.max(0, current.hp - cfg.contactDamage)
                if (hp <= 0) setPhase("clear")
                return { ...current, hp }
              })
              break
            }
          }
        }
      }
    }

    gameLoopRef.current = setInterval(tick, 50) as NodeJS.Timeout
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [phase, stage, player.x, player.y, dragonHp, dragonProjectiles, enemies, playerDamageFreeze, hasPlayerMoved, bossAwakened])

  const objective = useMemo(() => manager.current.getObjectives()[0], [stage, objectiveProgress])
  const livingEnemies = enemies.filter((enemy) => enemy.hp > 0).length
  const isFinalVictory = stage === 5 && livingEnemies === 0 && manager.current.canAdvance()

  useEffect(() => {
    if (phase === "playing") {
      gameContainerRef.current?.focus({ preventScroll: true })
    }
  }, [phase, stage])

  if (phase === "select") {
    return <CharacterSelect characters={PARTY} onSelect={(selected) => { setHero({ ...selected }); setPhase("intro") }} />
  }

  if (phase === "intro") return <IntroCutscene onEnter={() => setPhase("dialogue")} />
  if (phase === "clear" || isFinalVictory)
    return (
      <main className="flex min-h-dvh items-center justify-center bg-stone-950 p-6 text-center text-amber-50">
        <section className="max-w-xl border-4 border-amber-500 bg-stone-900 p-10 shadow-[8px_8px_0_#160d08]">
          <p className="font-pixel text-xs uppercase tracking-[0.25em] text-amber-400">A aventura terminou</p>
          <h1 className="mt-5 font-pixel text-3xl leading-relaxed text-amber-100">GAME CLEAR</h1>
          <p className="mt-5 font-pixel-body text-2xl leading-relaxed text-stone-200">
            {hero.hp <= 0 ? "Você foi derrotado... A aventura terminou." : "A Princesa Elara foi libertada e o portal para casa está aberto."}
          </p>
          <button
            className="mt-8 border-2 border-amber-400 px-5 py-3 font-pixel-body text-xl text-amber-100 hover:bg-amber-400 hover:text-stone-950"
            onClick={() => window.location.reload()}
          >
            Jogar novamente
          </button>
        </section>
      </main>
    )

  const inDialogue = phase === "dialogue"
  const background = STAGE_BACKGROUNDS[stage]
  const dragonDefeated = stage === 2 && dragonHp === 0

  return (
    <main
      ref={gameContainerRef}
      tabIndex={-1}
      autoFocus={phase === "playing"}
      aria-label="Área de jogo"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-stone-950 outline-none"
    >
      <div
        className={`absolute inset-0 bg-cover bg-center ${STAGE_THEMES[stage].className}`}
        style={background ? { backgroundImage: `url('${background}')`, imageRendering: "pixelated" } : { imageRendering: "pixelated" }}
        aria-hidden="true"
      />
      <div className={`pointer-events-none absolute inset-0 ${STAGE_THEMES[stage].overlay}`} aria-hidden="true" />
      <div className="absolute inset-0 bg-stone-950/35" aria-hidden="true" />
      <div className="absolute inset-x-0 top-1/2 mx-auto h-px max-w-5xl bg-amber-200/10" aria-hidden="true" />

      {stage === 1 && (
        <div className="absolute left-[calc(50%+170px)] top-1/2 z-10 -translate-y-1/2 text-center">
          <img src="/sprites/elder-npc.png" alt="Ancião" className="pixelated h-24 w-20" />
          <p className="font-pixel-body text-xl text-amber-100">Ancião</p>
        </div>
      )}

      {stage === 2 && !dragonDefeated && (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
          <img src="/sprites/dragon-boss.png" alt="Dragão" className="pixelated h-32 w-32" />
          <div className="mt-4 h-3 w-48 border border-stone-950 bg-stone-900">
            <div className="h-full bg-red-500 transition-all" style={{ width: `${(dragonHp / 8) * 100}%` }} />
          </div>
          <p className="mt-1 font-pixel-body text-xl text-red-100">
            Dragão · {dragonHp}/8
          </p>
        </div>
      )}

      {dragonProjectiles.filter((proj) => isInViewport(proj.x, proj.y)).map((proj) => (
        <div
          key={proj.id}
          className={`absolute z-[6] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_20px_8px_rgba(248,113,113,0.75)] ${playerHit ? "animate-pulse" : ""}`}
          style={{ left: `calc(50% + ${proj.x}px)`, top: `calc(50% + ${proj.y}px)`, pointerEvents: "none" }}
          aria-hidden="true"
        />
      ))}

      {stage === 2 && dragonDefeated && !crystalCollected && (
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
          <img src="/sprites/veil-crystal.png" alt="Cristal" className="pixelated h-16 w-16 animate-blink" />
          <p className="font-pixel-body text-xl text-cyan-100">Cristal do Véu</p>
        </div>
      )}

      {/* Arena infernal da Fase 5: rachaduras de lava, pilares em chamas e trono ao norte */}
      {stage === 5 && (
        <>
          <div className="lava-cracks pointer-events-none absolute inset-0 z-[2]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 z-[4] bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(10,2,2,0.38)_78%)]" aria-hidden="true" />
          {[12, 88].map((left) => (
            <div
              key={left}
              className="pointer-events-none absolute bottom-0 z-[3] flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${left}%` }}
              aria-hidden="true"
            >
              <div className="flame-crown h-16 w-14" />
              <div className="flame-pillar h-48 w-10" />
            </div>
          ))}
          <div
            className="pointer-events-none absolute left-1/2 top-[4%] z-[3] -translate-x-1/2 text-center"
            aria-hidden="true"
          >
            <img src="/sprites/dark-throne.png" alt="" className="pixelated h-48 w-48 drop-shadow-[0_0_30px_rgba(249,115,22,0.7)]" />
          </div>
        </>
      )}

      {(stage === 3 || stage === 4 || stage === 5) &&
        enemies.filter((enemy) => enemy.hp > 0 && isInViewport(enemy.x, enemy.y)).map((enemy) => {
          const cfg = ENEMY_STAGE_CONFIG[stage as 3 | 4 | 5]
          return (
            <div
              key={enemy.id}
              className="absolute z-[6] -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: `calc(50% + ${enemy.x}px)`, top: `calc(50% + ${enemy.y}px)` }}
            >
              <img
                src={stage === 5 ? "/sprites/final-warden.png" : "/sprites/soldier-enemy.png"}
                alt={enemy.name}
                className={`pixelated ${cfg.scale} ${stage === 5 ? `drop-shadow-[0_0_24px_rgba(168,85,247,0.85)] ${bossCutscene ? "anim-boss-rise" : "animate-pulse"}` : ""}`}
              />
              <div className={`mt-1 h-2 ${cfg.barClass} bg-stone-900`}>
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>
              {stage === 5 && (
                <p className="mt-1 font-pixel-body text-xl text-fuchsia-200">
                  {enemy.name} · {enemy.hp}/{enemy.maxHp}
                </p>
              )}
            </div>
          )
        })}

      {(stage === 3 || stage === 4) && livingEnemies === 0 && (
        <TransitionDoor stage={stage} open />
      )}

      {stage === 5 && bossCutscene && (
        <div className="anim-boss-banner pointer-events-none absolute left-1/2 top-24 z-30 -translate-x-1/2 border-2 border-orange-400 bg-stone-950/90 px-6 py-4 text-center shadow-[0_0_30px_rgba(249,115,22,0.45)]">
          <p className="font-pixel text-sm uppercase tracking-[0.18em] text-orange-300">O Chefe Final Despertou!</p>
          <p className="mt-2 font-pixel-body text-xl text-red-100">A arena pertence ao Feiticeiro Sombrio.</p>
        </div>
      )}

      {phase === "playing" && <PlayerSprite src={hero.image} name={hero.realName} state={player} hit={playerHit} />}
      <div
        className={inDialogue ? "absolute inset-0 cursor-pointer" : "absolute inset-0"}
        onClick={
          inDialogue
            ? () => setLine((current) => (current >= DIALOGUE_LINES.length - 1 ? current : current + 1))
            : undefined
        }
      >
        <GameHud
          showDialogue={inDialogue}
          player={{
            name: hero.realName,
            avatarSrc: hero.image,
            level: stage,
            hp: { current: hero.hp, max: hero.hp },
            mp: { current: hero.mp, max: hero.mp },
            objective: MAIN_OBJECTIVE,
          }}
          quest={{
            title: `Nível ${stage}: ${manager.current.definition.title}`,
            objectives: [{ label: objective.label, current: objective.current, total: objective.total }],
          }}
          dialogue={{
            npcName: INTRO_NPC.name,
            npcSpriteSrc: INTRO_NPC.image,
            text: DIALOGUE_LINES[line],
            continueHint:
              line >= DIALOGUE_LINES.length - 1 ? "Atravesse o mapa e pressione E junto ao Ancião" : "Pressione ESPAÇO para continuar",
          }}
        />
      </div>

      {phase === "dialogue" && line >= DIALOGUE_LINES.length - 1 && (
        <button
          className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 border-2 border-amber-400 bg-stone-950/90 px-4 py-2 font-pixel-body text-xl text-amber-100"
          onClick={() => setPhase("playing")}
        >
          Começar travessia
        </button>
      )}

      {phase === "playing" && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 border-2 border-amber-600/70 bg-stone-950/85 px-3 py-2">
          <p className="font-pixel-body text-center text-[15px] leading-tight text-amber-100">
            {stage === 1 ? (
              <>
                <span className="text-emerald-400">Movimento: Ativo</span> · <span className="text-amber-400">WASD / Setas</span> atravesse o mapa · <span className="text-amber-400">E</span> falar com o Ancião
              </>
            ) : stage === 2 ? (
              <>
                <span className="text-amber-400">J / Espaço</span> atacar · derrote o Dragão
                {dragonDefeated ? " · E coletar o cristal" : ""}
              </>
            ) : stage === 5 ? (
              <>
                <span className="text-amber-400">J / Espaço</span> atacar · derrote o Feiticeiro Sombrio
              </>
            ) : (
              <>
                <span className="text-amber-400">J / Espaço</span> atacar · {stage === 3 ? "abra a porta ao derrotar todos" : "derrote os guardiões"}
              </>
            )}
          </p>
        </div>
      )}

      {phase === "playing" && (
        <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2 border-2 border-stone-700 bg-stone-950/85 px-4 py-2 font-pixel-body text-xl text-amber-100">
          Inimigos restantes: {livingEnemies}/{enemies.length || (stage === 2 ? 1 : 0)} · HP: {hero.hp}/{hero.hp}
        </div>
      )}

      <StageTransition stage={transitionStage} onComplete={() => setTransitionStage(null)} />
    </main>
  )
}
