import { Game } from "./Game";


export interface Minigame {
    name: string
    emoji: string
    description: string
    unique: boolean
    canRoll(game: Game) : boolean
    start(game: Game) : void
    end(game: Game) : void
}