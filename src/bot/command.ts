
import { SlashCommand, SlashCommandOptions, SlashContext } from "detritus-client/lib/slash";
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
        return false;
    }
}