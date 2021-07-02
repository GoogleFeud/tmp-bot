import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { CustomSlashCommand } from "../../command";

export default class Join extends CustomSlashCommand {
    constructor() {
        super({
            name: "game",
            description: "Get more information on the game in this channel"
        });
    }

    run(ctx: SlashContext) : void {
        const game = ctx.slashCommandClient.games.get(ctx.channelId!)!;
        ctx.respond({
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [{
                    title: "Trivia murder party game",
                    color: 0x9117e3,
                    fields: [
                        {
                            name: "Players",
                            value: game.players.map(p => `${p}${p.isHost ? "👑":""}${p.isGhost ? "👻":""}${p.isDead ? "☠️":""}${game.started ? `- ${p.money}$`:""}`).join("\n") || "None",
                            inline: true
                        }
                    ]
                }]
            }
        })
    }
}