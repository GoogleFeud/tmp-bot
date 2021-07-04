
import fs from "fs";
import { Minigame } from "../Minigame";


let CACHE: Array<Minigame>;

export function getMinigames() : Array<Minigame> {
    if (!CACHE) {
        const minigames = fs.readdirSync(__dirname).filter((n) => !n.startsWith("index"));
        CACHE = [];
        for (const gameName of minigames) CACHE.push(require(`${__dirname}/${gameName}`).default);
    } 
    return CACHE.slice();
}