
import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash/context";
import Bitfield from "../../utils/Bitfield";
import { CustomSlashCommand } from "../command";


export default class Ping extends CustomSlashCommand {
    constructor() {
        super({
            name: "ping",
            description: "Ping... pong!",
            customPerms: new Bitfield(Bitfield.MUST_BE_IN_GAME, Bitfield.REQUIRES_GAME)
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