import { ApplicationCommandOptionTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { Member } from "detritus-client/lib/structures";
import { customStyledMsg, errorMsg } from "../../../utils";
import Bitfield from "../../../utils/Bitfield";
import { CustomSlashCommand } from "../../command";

export default class Kick extends CustomSlashCommand {
    constructor() {
        super({
            name: "kick",
            description: "Kick a player from the game. Kicking them while the game is ongoing will kill them.",
            options: [
                {
                    name: "user",
                    description: "The user to be kicked",
                    required: true,
                    type: ApplicationCommandOptionTypes.USER
                }
            ],
            customPerms: new Bitfield(Bitfield.MUST_BE_HOST)
        });
    }

    run(ctx: SlashContext, params: { user: Member }) {
        const player = ctx.game.players.get(params.user.id);
        if (!player) return errorMsg("This player isn't in the game!", ctx);
        if (ctx.game.started) player.isDead = true;
        else ctx.game.players.delete(params.user.id);
        customStyledMsg("👢", `Kicked ${player}`, ctx, false);
    }

}