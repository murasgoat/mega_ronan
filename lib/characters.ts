export type CharacterClass = "Guerreiro" | "Tanque" | "Mago" | "Sacerdote"

export interface GameCharacter {
  id: string
  realName: string
  className: CharacterClass
  image: string
  hp: number
  mp: number
  speed: number
  attackRange: number
  ability: string
  accent: string
  heroFrame?: { scale: number; position: string }
}

/**
 * Elenco dos amigos que foram sugados para dentro do jogo.
 * Para adicionar, remover ou trocar um personagem, basta editar este array.
 * O primeiro item é tratado como o personagem principal (jogador).
 */
export const PARTY: GameCharacter[] = [
  { id: "guerreiro", realName: "Murilo", className: "Guerreiro", image: "/sprites/party/warrior.png", hp: 140, mp: 50, speed: 5, attackRange: 78, ability: "Ataque físico equilibrado", accent: "#e8c56a" },
  { id: "tanque", realName: "Ping", className: "Tanque", image: "/sprites/party/tank.png", hp: 220, mp: 30, speed: 3.5, attackRange: 64, ability: "Defesa reforçada e escudo", accent: "#9aa4ad" },
  { id: "mago", realName: "Arthur", className: "Mago", image: "/sprites/party/mage.png", hp: 100, mp: 120, speed: 5, attackRange: 190, ability: "Magia à distância", accent: "#a879d6" },
  { id: "sacerdote", realName: "Leandro", className: "Sacerdote", image: "/sprites/party/priest.png", hp: 125, mp: 100, speed: 4.5, attackRange: 130, ability: "Cura e ataques de luz", accent: "#5fd08a" },
]

/** NPC que aparece na caixa de diálogo. Troque a imagem à vontade. */
export const INTRO_NPC = {
  name: "Ancião do Vilarejo",
  image: "/sprites/elder-npc.png",
}

export const STORY_TEXT =
  "De uma noite de jogatina no mundo real para um reino medieval. Salve a Princesa para voltar para casa."

export const MAIN_OBJECTIVE = "Salvar a Princesa"
