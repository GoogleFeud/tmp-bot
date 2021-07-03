import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { errorMsg, successMsg } from "../../../utils";
import Bitfield from "../../../utils/Bitfield";
import { CustomSlashCommand } from "../../command";

export default class Start extends CustomSlashCommand {
    constructor() {
        super({
            name: "start",
            description: "Start the game",
            customPerms: new Bitfield(Bitfield.MUST_BE_HOST, Bitfield.GAME_CANT_BE_STARTED)
        });
    }

    async run(ctx: SlashContext) : Promise<void|boolean> {
        //if (ctx.game.players.size < 5) return errorMsg("There need to be at least 5 players in order for the game to start", ctx);
        if (ctx.game.players.size > 20) return errorMsg("There cannot be more than 20 players in the game!", ctx);
        ctx.game.started = true;
        await ctx.slashCommandClient.commands.find(cmd => cmd.name === "game")!.run!(ctx, ctx.game);
        ctx.game.movePhase();
    }

}