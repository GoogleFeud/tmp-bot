
import { SlashContext } from "detritus-client/lib/slash";
import { errorMsg } from "../../../utils";
import { CustomSlashCommand } from "../../command";

export default class UpdateCommands extends CustomSlashCommand {
    constructor() {
        super({
            name: "update",
            description: "Updates all slash commands.",
            metadata: {
                admin: true
            }
        });
    }

    async run(ctx: SlashContext) : Promise<void|boolean> {
        if (ctx.userId !== process.env.OWNER_ID) return errorMsg("You cannot use this command!", ctx);
        //await ctx.client.rest.bulkOverwriteApplicationCommands(ctx.client.applicationId, ctx.slashCommandClient.commands.filter(cmd => !cmd.metadata.admin));
        if (process.env.ADMIN_GUILD) await ctx.client.rest.bulkOverwriteApplicationGuildCommands(ctx.client.applicationId, process.env.ADMIN_GUILD, ctx.slashCommandClient.commands.filter(cmd => cmd.metadata.admin));    
    }

}