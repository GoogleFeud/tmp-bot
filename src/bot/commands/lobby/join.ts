import { SlashContext } from "detritus-client/lib/slash";
import { Player } from "../../../tmp/Player";
import Bitfield from "../../../utils/Bitfield";
import { CustomSlashCommand } from "../../command";

export default class Join extends CustomSlashCommand {
    constructor() {
        super({
            name: "join",
            description: "Join a game of trivia murder party!",
            customPerms: new Bitfield(Bitfield.CANT_BE_IN_GAME, Bitfield.GAME_CANT_BE_STARTED)
        });
    }

    run(ctx: SlashContext) : void {
        const player = new Player(ctx.userId, ctx.user.username);
        if (ctx.game.players.size === 0) player.isHost = true;
        ctx.game.players.set(ctx.userId, player);
        ctx.slashCommandClient.commands.find(cmd => cmd.name === "game")!.run!(ctx, {title: "📥 Player joined"});
    }

}