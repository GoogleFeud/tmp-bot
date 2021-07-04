
import { Minigame } from "../Minigame";


export default {
    name: "Fingers",
    emoji: "🖐️",
    description: "Cut off a finger.",
    unique: false,
    canRoll: (game) => game.safePlayers!.length !== 0,
    start: (game) => console.log("Fingers started!"),
} as Minigame;