
import { Minigame } from "../Minigame";


export default {
    name: "Dice",
    emoji: "🎲",
    description: "Three dice will roll, and the rolled numbers will be added. A randomly chosen safe player (or me) is going to decide whether you have to roll **higher** or **lower** in order to **survive**. Good luuuck.",
    unique: false,
    canRoll: (game) => game.unsafePlayers!.length <= 4 && game.safePlayers!.length >= 1,
    start: (game) => console.log("Dice started!"),
} as Minigame;