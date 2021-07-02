
import { InteractionCallbackTypes, MessageComponentButtonStyles, MessageComponentTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash/context";
import Bitfield from "../../utils/Bitfield";
import { CustomSlashCommand } from "../command";


export default class Ping extends CustomSlashCommand {
    constructor() {
        super({
            name: "ping",
            description: "Ping... pong!",
            customPerms: new Bitfield(Bitfield.MUST_BE_IN_GAME)
        });
    }
     
    async run(ctx: SlashContext) : Promise<void> {
        if (!ctx.channelId) return;
        ctx.respond({
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: "REEEEE"
            }
        })
        const game = ctx.slashCommandClient.games.get(ctx.channelId);
        const res = await game?.button_collector({
            buttons: [
                {
                    style: MessageComponentButtonStyles.PRIMARY,
                    label: "A"
                },
                {
                    style: MessageComponentButtonStyles.SECONDARY,
                    label: "B"
                },
                {
                    style: MessageComponentButtonStyles.SECONDARY,
                    label: "C"
                },
                {
                    style: MessageComponentButtonStyles.SECONDARY,
                    label: "D"
                },
                {
                    style: MessageComponentButtonStyles.SECONDARY,
                    label: "E"
                },
                {
                    style: MessageComponentButtonStyles.SECONDARY,
                    label: "F"
                }
            ],
            limit: 5,
            timeout: 30000,
            unique: true,
            content: "This is a test!",
            sendTo: ctx.channelId
        });
        console.log(res?.entries);
        res?.interaction?.editResponse({
            components: []
        });
    }

}