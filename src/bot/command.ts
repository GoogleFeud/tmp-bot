
import { SlashCommand, SlashCommandOptions, SlashContext } from "detritus-client/lib/slash";
import { Game } from "../tmp/Game";
import { errorMsg } from "../utils";
import Bitfield from "../utils/Bitfield";

interface CustomSlashCommandOptions extends SlashCommandOptions {
    customPerms?: Bitfield
}


export class CustomSlashCommand extends SlashCommand {
    customPerms?: Bitfield
    constructor(data: CustomSlashCommandOptions) {
        super(data);
        this.customPerms = data.customPerms;
    }

    onBeforeRun(ctx: SlashContext) : Promise<boolean>|boolean {
        //TDB
        if (!ctx.channelId) return false;
        if (this.customPerms) {
            if (!ctx.client.games) ctx.client.games = new Map();
            let game = ctx.client.games.get(ctx.channelId);
            if (!game && this.customPerms.has(Bitfield.REQUIRES_GAME)) {
                game = new Game(ctx.channelId, ctx.client);
                ctx.client.games.set(ctx.channelId, game);
            }
            if (!game) return false;
            const player = game.players.get(ctx.userId);
            if (player) {
                if (this.customPerms.has(Bitfield.CANT_BE_IN_GAME)) return errorMsg("In order to use this command you must leave the game.", ctx);
                if (this.customPerms.has(Bitfield.MUST_BE_DEAD) && !player.isDead) return errorMsg("Only dead players can use this command.", ctx);
                if (this.customPerms.has(Bitfield.CANT_BE_DEAD) && player.isDead) return errorMsg("Only alive players can use this command.", ctx);
                if (this.customPerms.has(Bitfield.MUST_BE_GHOST) && !player.isGhost) return errorMsg("Only ghosts can use this command.", ctx);
                if (this.customPerms.has(Bitfield.CANT_BE_GHOST) && player.isGhost) return errorMsg("Only alive players can use this command.", ctx);
                if (this.customPerms.has(Bitfield.MUST_BE_HOST) && !player.isHost) return errorMsg("Only hosts can use this command.", ctx);
                if (this.customPerms.has(Bitfield.CANT_BE_HOST) && player.isHost) return errorMsg("Hosts cannot use this command.", ctx);
            } else {
                console.log("HMMMM!!!!");
                if (this.customPerms.has(Bitfield.MUST_BE_IN_GAME)) return errorMsg("You must be in th egame in order to use this command.", ctx);
            } 
        }
        return true;
    }
}