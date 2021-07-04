
import { Minigame } from "../Minigame";


export default {
    name: "Chalices",
    emoji: "🏆",
    description: "One of my favorites. There will be a few chalices in front of you. All alive players are given a poison pellet, and each one of them will drop their pellet in a chalice of their choosing. After that you'll have to drink from one of the chalices. Make sure to pick a chalice which isn't poisoned, otherwise you DIE!",
    unique: true,
    canRoll: (game) => game.unsafePlayers!.length >= 2,
    start: (game) => console.log("Chalices started!"),
} as Minigame;