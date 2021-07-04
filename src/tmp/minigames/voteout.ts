
import { Minigame } from "../Minigame";


export default {
    name: "Voteout",
    emoji: "🗳️",
    description: "Everyone will have 3 minutes to vote for a player to die.",
    unique: false,
    canRoll: (game) => game.safePlayers!.length > 1,
    start: (game) => console.log("Voteout started!"),
} as Minigame;