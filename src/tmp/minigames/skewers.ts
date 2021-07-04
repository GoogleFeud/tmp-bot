
import { Minigame } from "../Minigame";


export default {
    name: "Skewers",
    emoji: "🗡️",
    description: "Pst, everyone, hide somwehre in this grid. Every safe player is going to choose a row or a column to insert a sword in. All players impaled by a sword die.",
    unique: false,
    canRoll: (game) => game.safePlayers!.length !== 0,
    start: (game) => console.log("Fingers started!"),
} as Minigame;