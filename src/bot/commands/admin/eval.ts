import { ApplicationCommandOptionTypes, InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { errorMsg } from "../../../utils";
import { CustomSlashCommand } from "../../command";

export default class Eval extends CustomSlashCommand<{code: string}> {
    constructor() {
        super({
            name: "eval",
            description: "Evaluate JS code.",
            options: [
                {
                    name: "code",
                    description: "The code to evaluate",
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ],
            metadata: {
                admin: true
            }
        });
    }

    async run(ctx: SlashContext, args: {code: string}) : Promise<void|boolean> {
        if (ctx.userId !== process.env.OWNER_ID) return errorMsg("You cannot use this command!", ctx);
        let res: string;
        try {
            res = JSON.stringify(await eval(args.code));
        } catch (err) {
            res = err.toString();
        }
        ctx.respond({
            type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `\`\`\`${res}\`\`\``
            }
        })
    }
}