

export class Player {
    id: string
    isGhost = false
    isDead = false
    isHost = false
    money = 0
    minigameData: Record<string, unknown> = {}
    constructor(id: string) {
        this.id = id;
    }
}