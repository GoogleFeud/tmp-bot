
import { SlashContext } from "detritus-client/lib/slash";
import { successMsg } from "../../../utils";
import Bitfield from "../../../utils/Bitfield";
import { cancelButtonCollector } from "../../../utils/ButtonCollector";
import { CustomSlashCommand } from "../../command";

export default class Stop extends CustomSlashCommand {
    constructor() {
        super({
            name: "stop",
            description: "Stop the game, or removes all players from the lobby if the game hasn't started",
            customPerms: new Bitfield(Bitfield.MUST_BE_HOST)
        });
    }

    async run(ctx: SlashContext) : Promise<void|boolean> {
        ctx.game.clear();
        cancelButtonCollector(ctx.client, ctx.channelId!);
        successMsg("Game stopped!", ctx, false);
    }

}