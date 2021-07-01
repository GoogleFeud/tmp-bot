
import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashCommand } from "detritus-client/lib/slash/command";
import { SlashContext } from "detritus-client/lib/slash/context";


export default class Ping extends SlashCommand {
    constructor() {
        super({
            name: "ping",
            description: "Ping... pong!"
        });
    }
     
    run(ctx: SlashContext) : void {
        ctx.respond({
            data: {
                content: "pong!"
            },
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE
        });
    }

}