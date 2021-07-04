
import { Minigame } from "../Minigame";


export default {
    name: "Loser Wheel",
    emoji: "🎡",
    description: "Spin the loser wheel! If the wheel stops on a ☠️, you die! If it stops on a ❤️, you live to see another question!",
    unique: false,
    canRoll: (game) => game.unsafePlayers!.length === 1,
    start: (game) => console.log("Loser wheel started!"),
} as Minigame;