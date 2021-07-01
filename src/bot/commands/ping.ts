
import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash/context";
import { CustomSlashCommand } from "../command";


export default class Ping extends CustomSlashCommand {
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