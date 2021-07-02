import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";

export function errorMsg(content: string, ctx: SlashContext, quiet = true) : false {
    ctx.respond({
        type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `> ❌ | ${content}`,
            flags: quiet ? 1 << 6:undefined,
            allowedMentions: { parse: [] }
        }
    });
    return false;
}

export function successMsg(content: string, ctx: SlashContext, quiet = true) : true {
    ctx.respond({
        type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `> ✔️ | ${content}`,
            flags: quiet ? 1 << 6:undefined,
            allowedMentions: { parse: [] }
        }
    });
    return true;
}