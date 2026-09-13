"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { canMove } from "@/lib/collision"

export type Facing = "up" | "down" | "left" | "right"
export type PlayerAction = "idle" | "walk" | "attack" | "jump"

export interface PlayerState {
  x: number
  y: number
  facing: Facing
  action: PlayerAction
  jumping: boolean
  attacking: boolean
}

const DEFAULT_SPEED = 5
const ATTACK_MS = 320
const JUMP_MS = 520

type InputState = Set<string>

/**
 * Captura o teclado uma única vez e mantém o estado fora do React.
 * O loop de frames é o único lugar que aplica movimento, então segurar
 * uma tecla não depende da repetição nativa do sistema operacional.
 */
export function usePlayerControls(
  enabled: boolean,
  onAttack?: () => void,
  stage: number = 1,
  speed: number = DEFAULT_SPEED,
  onFirstMovement?: () => void,
) {
  const [state, setState] = useState<PlayerState>({
    x: 0,
    y: 0,
    facing: "down",
    action: "idle",
    jumping: false,
    attacking: false,
  })

  const keysPressed = useRef<InputState>(new Set())
  const enabledRef = useRef(enabled)
  const attackUntil = useRef(0)
  const jumpUntil = useRef(0)
  const movementStarted = useRef(false)
  const lastFrameTime = useRef<number | null>(null)
  const onAttackRef = useRef(onAttack)
  const onFirstMovementRef = useRef(onFirstMovement)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    onAttackRef.current = onAttack
    onFirstMovementRef.current = onFirstMovement
  }, [onAttack, onFirstMovement])

  const triggerAttack = useCallback(() => {
    if (!enabledRef.current) return
    attackUntil.current = performance.now() + ATTACK_MS
    onAttackRef.current?.()
  }, [])

  const triggerJump = useCallback(() => {
    if (!enabledRef.current || performance.now() < jumpUntil.current) return
    jumpUntil.current = performance.now() + JUMP_MS
  }, [])

  // Listeners permanecem ativos durante cutscenes; apenas o loop bloqueia a aplicação.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return

      const key = event.key.toLowerCase()
      if (key === "j" || key === " ") {
        triggerAttack()
        return
      }
      if (key === "k" || key === "shift") {
        triggerJump()
        return
      }

      keysPressed.current.add(key)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      keysPressed.current = new Set()
    }
  }, [triggerAttack, triggerJump])

  useEffect(() => {
    movementStarted.current = false
    const spawnX = stage === 1 ? -260 : -220
    setState((current) => ({ ...current, x: spawnX, y: 0, facing: "right" }))
  }, [stage])

  useEffect(() => {
    let animationFrame = 0

    const frame = (timestamp: number) => {
      const previous = lastFrameTime.current ?? timestamp
      const delta = Math.min(timestamp - previous, 50) / 1000
      lastFrameTime.current = timestamp

      setState((current) => {
        const input = keysPressed.current
        const canUpdate = enabledRef.current
        let dx = 0
        let dy = 0
        let facing = current.facing

        if (canUpdate) {
          if (input.has("a") || input.has("arrowleft")) {
            dx -= speed * delta * 60
            facing = "left"
          }
          if (input.has("d") || input.has("arrowright")) {
            dx += speed * delta * 60
            facing = "right"
          }
          if (input.has("w") || input.has("arrowup")) {
            dy -= speed * delta * 60
            facing = "up"
          }
          if (input.has("s") || input.has("arrowdown")) {
            dy += speed * delta * 60
            facing = "down"
          }
        }

        const moving = dx !== 0 || dy !== 0
        if (moving && !movementStarted.current) {
          movementStarted.current = true
          onFirstMovementRef.current?.()
        }

        const now = performance.now()
        const attacking = now < attackUntil.current
        const jumping = now < jumpUntil.current
        let x = current.x
        let y = current.y

        if (moving) {
          const nextX = current.x + dx
          const nextY = current.y + dy
          if (canMove(nextX, nextY, 24, 28, stage)) {
            x = nextX
            y = nextY
          }
        }

        let action: PlayerAction = "idle"
        if (attacking) action = "attack"
        else if (jumping) action = "jump"
        else if (moving) action = "walk"

        return { x, y, facing, action, jumping, attacking }
      })

      animationFrame = window.requestAnimationFrame(frame)
    }

    animationFrame = window.requestAnimationFrame(frame)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      lastFrameTime.current = null
      keysPressed.current = new Set()
    }
  }, [speed, stage])

  useEffect(() => {
    if (!enabled) {
      keysPressed.current = new Set()
      lastFrameTime.current = null
      movementStarted.current = false
      window.focus()
      document.querySelector<HTMLElement>('[aria-label="Área de jogo"]')?.focus({ preventScroll: true })
    }
  }, [enabled])

  return state
}

export type UseKeyboard = typeof usePlayerControls
export const useKeyboard = usePlayerControls
