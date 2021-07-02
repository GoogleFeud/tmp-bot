

export class Player {
    id: string
    isGhost = false
    isDead = false
    minigameData: Record<string, unknown> = {}
    constructor(id: string) {
        this.id = id;
    }
}