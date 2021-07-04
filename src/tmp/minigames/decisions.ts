
import { Minigame } from "../Minigame";


export default {
    name: "Decisions, Decisions",
    emoji: "💰",
    description: "There is a pile of money in front of you. It's your choice if you want to take some money.\n\n- If nobody takes the money, you all survive.\n-If only some of you took money, everyone who doesn't take money is killed.\n-If everyone takes the money, everyone dies!\n\nYou have 1 minute to decide.",
    unique: true,
    canRoll: (game) => game.unsafePlayers!.length > 1,
    start: (game) => console.log("Decisions started!"),
} as Minigame;