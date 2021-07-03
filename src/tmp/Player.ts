import { Game } from "./Game";

export type Finger = "A"|"B"|"C"|"D";

export const optionToFinger = {
    "A": "index",
    "B": "middle",
    "C": "ring",
    "D": "little"
}

export class Player {
    id: string
    lostFinger?: Finger
    isGhost = false
    isDead = false
    isHost = false
    isSafe = false
    money = 0
    minigameData: Record<string, unknown> = {}
    constructor(id: string) {
        this.id = id;
    }

    format(game: Game) : string {
        return `<@${this.id}> ${this.isHost ? "👑":""}${this.isGhost ? "👻":""}${this.isDead ? "☠️":""}${game.started ? ` - ${this.money}$`:""}`;
    }

    toString() : string {
        return `<@${this.id}>`;
    }
}