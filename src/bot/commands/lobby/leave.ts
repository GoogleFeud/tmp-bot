
import { SlashContext } from "detritus-client/lib/slash";
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
        if (ctx.game.started) ctx.player!.isDead = true;
        else {
            ctx.game.players.delete(ctx.userId);
            if (ctx.player!.isHost && ctx.game.players.length) {
                const players = ctx.game.players.toArray();
                const player = players[players.length * Math.random() << 0];
                player.isHost = true;
            }
        }
        ctx.slashCommandClient.commands.find(cmd => cmd.name === "game")!.run!(ctx, {title: "📤 Player left"});
    }
}
