import { ApplicationCommandOptionTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { Member } from "detritus-client/lib/structures";
import { customStyledMsg, errorMsg } from "../../../utils";
import Bitfield from "../../../utils/Bitfield";
import { CustomSlashCommand } from "../../command";

export default class GiveHost extends CustomSlashCommand {
    constructor() {
        super({
            name: "give_host",
            description: "Give the host power to another player in the lobby",
            options: [
                {
                    name: "new_host",
                    type: ApplicationCommandOptionTypes.USER,
                    required: true,
                    description: "The new host"
                }
            ],
            customPerms: new Bitfield(Bitfield.MUST_BE_IN_GAME, Bitfield.MUST_BE_HOST)
        });
    }

    run(ctx: SlashContext, params: { new_host: Member }) : void|boolean {
        const player = ctx.game.players.get(params.new_host.id);
        if (!player) return errorMsg("This user isn't in the game", ctx);
        ctx.player!.isHost = false;
        player.isHost = true;
        customStyledMsg("👑", `${player} is the new host`, ctx, false);
    } 

}