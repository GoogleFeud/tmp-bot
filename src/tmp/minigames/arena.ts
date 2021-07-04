
import { Minigame } from "../Minigame";


export default {
    name: "Arena",
    emoji: "⚔️",
    description: "Here's a pile of money. You have three options:\n-To attack another player\n- To defend yourself against attacks\n - Or to grab some money\n\n. If you attack a person, and they don't defend themselves, that person dies. If they do, however, you die. If you defend but don't get attacked, you die, too. If everyone grabs the money, you all die. You have 1 minute to make your choice.",
    unique: true,
    canRoll: (game) => game.unsafePlayers!.length > 2,
    start: (game) => console.log("Arena started!"),
} as Minigame;