
import { SlashContext } from "detritus-client/lib/slash";
import { Player } from "../../../tmp/Player";
import { successMsg } from "../../../utils";
import Bitfield from "../../../utils/Bitfield";
import { CustomSlashCommand } from "../../command";


export default class Leave extends CustomSlashCommand {
    constructor() {
        super({
            name: "leave",
            description: "Leave the game - you automatically get killed if you use this command while in game!",
            customPerms: new Bitfield(Bitfield.MUST_BE_IN_GAME, Bitfield.CANT_BE_DEAD)
        });
    }

    run(ctx: SlashContext) : void {
        const game = ctx.slashCommandClient.games.get(ctx.channelId!)!;
        if (game.started) game.players.get(ctx.userId)!.isDead = true;
        else game.players.delete(ctx.userId);
        successMsg("Successfully left the game.", ctx);
    }
}
