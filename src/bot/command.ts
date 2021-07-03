
import { InteractionCallbackTypes } from "detritus-client/lib/constants";
import { SlashCommand, SlashCommandOptions, SlashContext } from "detritus-client/lib/slash";
import { Game } from "../tmp/Game";
import { errorMsg } from "../utils";
import Bitfield from "../utils/Bitfield";

interface CustomSlashCommandOptions extends SlashCommandOptions {
    customPerms?: Bitfield
}


export class CustomSlashCommand<T = unknown> extends SlashCommand<T> {
    customPerms?: Bitfield
    constructor(data: CustomSlashCommandOptions) {
        super(data);
        this.customPerms = data.customPerms
    }

    onBeforeRun(ctx: SlashContext) : Promise<boolean>|boolean {
        if (ctx.inDm || !ctx.channelId) return errorMsg("All of the bot's commands can only be used in the guild!", ctx);
        if (!ctx.channelId) return false;
        let game = ctx.slashCommandClient.games.get(ctx.channelId);
        if (!game) {
            game = new Game(ctx.channelId, ctx.client);
            ctx.slashCommandClient.games.set(ctx.channelId, game);
        }
        ctx.game = game;
        if (this.customPerms) {
        if (game.started && this.customPerms.has(Bitfield.GAME_CANT_BE_STARTED)) return errorMsg("You can only use this command while the game isn't going", ctx);
        if (!game.started && this.customPerms.has(Bitfield.GAME_MUST_BE_STARTED)) return errorMsg("You can only use this command in-game", ctx);
        const player = game.players.get(ctx.userId);
        ctx.player = player;
        if (player) {
            if (this.customPerms.has(Bitfield.CANT_BE_IN_GAME)) return errorMsg("In order to use this command you must leave the game.", ctx);
            if (this.customPerms.has(Bitfield.MUST_BE_DEAD) && !player.isDead) return errorMsg("Only dead players can use this command.", ctx);
            if (this.customPerms.has(Bitfield.CANT_BE_DEAD) && player.isDead) return errorMsg("Only alive players can use this command.", ctx);
            if (this.customPerms.has(Bitfield.MUST_BE_GHOST) && !player.isGhost) return errorMsg("Only ghosts can use this command.", ctx);
            if (this.customPerms.has(Bitfield.CANT_BE_GHOST) && player.isGhost) return errorMsg("Only alive players can use this command.", ctx);
            if (this.customPerms.has(Bitfield.MUST_BE_HOST) && (!player.isHost || !ctx.member!.canManageMessages || !ctx.member!.canKickMembers)) return errorMsg("Only hosts can use this command.", ctx);
        } else {
            if (this.customPerms.has(Bitfield.MUST_BE_IN_GAME)) return errorMsg("You must be in th egame in order to use this command.", ctx);
        } 
    }
        return true;
    }

    onRunError(ctx: SlashContext, args: unknown, err: unknown) : void {
        if (!ctx.responded) errorMsg(`An error occured!\n\`\`\`${err}\`\`\``, ctx);
        else ctx.channel?.createMessage({content: `> An error occured!\n\`\`\`${err}\`\`\``});
    }
}