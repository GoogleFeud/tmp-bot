
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

    toString() : string {
        return `<@${this.id}>`;
    }
}