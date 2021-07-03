import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { Interaction } from "detritus-client/lib/structures";

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
