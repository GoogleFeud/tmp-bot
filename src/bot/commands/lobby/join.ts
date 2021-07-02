import { SlashContext } from "detritus-client/lib/slash";
import { Player } from "../../../tmp/Player";
import { successMsg } from "../../../utils";
import Bitfield from "../../../utils/Bitfield";
import { CustomSlashCommand } from "../../command";

export default class Join extends CustomSlashCommand {
    constructor() {
        super({
            name: "join",
            description: "Join a game of trivia murder party!",
            customPerms: new Bitfield(Bitfield.CANT_BE_IN_GAME)
        });
    }

    run(ctx: SlashContext) : void {
        const game = ctx.slashCommandClient.games.get(ctx.channelId!);
        const player = new Player(ctx.userId);
        if (game?.players.size === 0) player.isHost = true;
        game!.players.set(ctx.userId, player);
        successMsg("Successfully joined the game.", ctx);
    }
}