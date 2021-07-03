import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { CustomSlashCommand } from "../../command";

export default class Game extends CustomSlashCommand {
    constructor() {
        super({
            name: "game",
            description: "Get more information on the game in this channel"
        });
    }

    run(ctx: SlashContext) : void {
        const game = ctx.game;
        const fields = [
            {
                name: "Players",
                value: game.players.map(p => p.format(game)).join("\n") || "None",
                inline: true
            }
        ]
        if (game.currentQuestion) {
            const question = game.currentQuestion;
            fields.push({
                name: "Current question",
                value: `${question.question}\n\nA) ${question.all_answers[0]}\nB) ${question.all_answers[1]}\nC) ${question.all_answers[2]}\nD) ${question.all_answers[3]}`,
                inline: true
            })
        }
        ctx.respond({
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [{
                    title: "🔪 Trivia murder party game",
                    color: 0x9117e3,
                    fields
                }]
            }
        })
    }
}