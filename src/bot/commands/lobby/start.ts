import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashContext } from "detritus-client/lib/slash";
import { successMsg } from "../../../utils";
import Bitfield from "../../../utils/Bitfield";
import { CustomSlashCommand } from "../../command";

export default class Join extends CustomSlashCommand {
    constructor() {
        super({
            name: "start",
            description: "Start the game",
            customPerms: new Bitfield(Bitfield.MUST_BE_HOST, Bitfield.GAME_CANT_BE_STARTED)
        });
    }

    async run(ctx: SlashContext) : Promise<void> {
        const game = ctx.slashCommandClient.games.get(ctx.channelId!)!;
        game.started = true;
        await successMsg("Game is starting...", ctx);
        game.movePhase();
    }

}