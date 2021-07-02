
import { InteractionCallbackTypes, MessageComponentButtonStyles, MessageComponentTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash/context";
import { CustomSlashCommand } from "../command";


export default class Ping extends CustomSlashCommand {
    constructor() {
        super({
            name: "ping",
            description: "Ping... pong!"
        });
    }
     
    async run(ctx: SlashContext) : Promise<void> {
        if (!ctx.channelId) return;
        const game = ctx.slashCommandClient.games.get(ctx.channelId);
        await ctx.respond({
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: "This is a test!",
                components: [
                    {
                        type: MessageComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: MessageComponentTypes.BUTTON,
                                customId: "A",
                                style: MessageComponentButtonStyles.PRIMARY,
                                label: "A"
                            },
                            {
                                type: MessageComponentTypes.BUTTON,
                                customId: "B",
                                style: MessageComponentButtonStyles.SECONDARY,
                                label: "B"
                            }
                        ]
                    },
                    {
                        type: MessageComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: MessageComponentTypes.SELECT_MENU,
                                customId: "C",
                                options: [
                                    { label: "A", value: "A" },
                                    { label: "B", value: "B" },
                                    {label: "C", value: "C" }
                                ]
                            }
                        ]
                    }
                ]
            }
        }); 
        const res = await game?.button_collector(ctx.id, {filter: (user) => user.user.id === "ass"});
        console.log(res?.entries);
        res?.interaction.editResponse({
            components: []
        });
    }

}