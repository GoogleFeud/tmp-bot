
import { Minigame } from "../Minigame";


export default {
    name: "Dumb Waiters",
    emoji: "🚪",
    description: "There are two elevators. Choose whether you want to go in elevator A or elevator B. All players in the heavier elevator will die. If the elevators are the same weight, then you all survive.",
    unique: true,
    canRoll: (game) => game.unsafePlayers!.length > 1,
    start: (game) => console.log("Dumb waiters started!"),
} as Minigame;