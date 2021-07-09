import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { Interaction } from "detritus-client/lib/structures";
import fs from "fs";
import { ClusterClient, ShardClient } from "detritus-client";

export function addEvents(client: ClusterClient | ShardClient, dir: string) : void {
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
        const fn = require(`${dir}/${file}`).default;
        client.on(file.slice(0, -3), fn);
    }
}

export function errorMsg(content: string, ctx: SlashContext|Interaction, quiet = true) : false {
    ctx.respond({
        type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `> **❌ ${content}**`,
            flags: quiet ? 1 << 6:undefined,
            allowedMentions: { parse: [] }
        }
    });
    return false;
}

export function successMsg(content: string, ctx: SlashContext|Interaction, quiet = true) : true {
    ctx.respond({
        type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `> ✔️ **${content}**`,
            flags: quiet ? 1 << 6:undefined,
            allowedMentions: { parse: [] }
        }
    });
    return true;
}

export function customMsg(data: RequestTypes.CreateInteractionResponseInnerPayload, ctx: SlashContext|Interaction, quiet = true) : Promise<unknown> {
    if (quiet) Object.assign(data, {flags: 1 << 6});
    return ctx.respond({
        type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data
    });
}

export function customStyledMsg(emoji: string, content: string, ctx: SlashContext|Interaction, quiet = true) : true {
    ctx.respond({
        type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `> ${emoji} **${content}**`,
            flags: quiet ? 1 << 6:undefined,
            allowedMentions: { parse: [] }
        }
    });
    return true;
}

export function shuffleArray<T>(array: Array<T>) : Array<T> {
    let currentIndex = array.length,  randomIndex;
    while (0 !== currentIndex) {
      randomIndex = currentIndex * Math.random() << 0;
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
}

export function rngArr<T>(array: Array<T>) : T {
    return array[array.length * Math.random() << 0];
}

export function createSlotMachine(a: string, b: string, c: string) : string {
    return `
♦️ MINIGAME ♦️
┍━━━━━━┑
 │ ${a}    ${b}    ${c} │
┕━━━━━━┛
`
}

export function wait(millisecs: number) : Promise<void> {
    return new Promise((res) => setTimeout(res, millisecs));
}

export function fiftyfifty() : boolean {
    return Math.random() > 0.5;
}

export function rngBtw(max = 1) : number {
    return max * Math.random() << 0;
}