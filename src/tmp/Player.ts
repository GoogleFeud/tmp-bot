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
    username: string
    lostFinger?: Finger
    isGhost = false
    isDead = false
    isHost = false
    isSafe = false
    money = 0
    minigameData: Record<string, unknown> = {}
    constructor(id: string, username: string) {
        this.id = id;
        this.username = username;
    }

    format(game: Game) : string {
        return `<@${this.id}> ${this.isHost ? "👑":""}${this.isGhost ? "👻":""}${this.isDead ? "☠️":""}${game.started ? ` - ${this.money}$`:""}`;
    }

    toString() : string {
        return `<@${this.id}>`;
    }
}