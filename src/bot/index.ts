
import { GatewayIntents } from "detritus-client-socket/lib/constants";
import { SlashCommandClient } from "detritus-client/lib/slashcommandclient";
import { addEvents } from "../utils";
import { Trivia } from "../utils/Trivia";

export default async (): Promise<void> => {
    const client = new SlashCommandClient(process.env.TOKEN as string, {
        useClusterClient: true,
        cache: {
            presences: { enabled: false },
            emojis: { enabled: false },
            messages: { enabled: false },
            members: { enabled: false },
            guilds: { enabled: false }
        },
        gateway: {
            loadAllMembers: false,
            intents: [
                GatewayIntents.GUILDS,
                GatewayIntents.GUILD_MESSAGES
            ]
        },
    });


    client.games = new Map();
    client.trivia = new Trivia();
    client.buttonCollectors = new Map();
    client.dropdownCollectors = new Map();
    await client.trivia.getSession();

    await client.addMultipleIn("bot/commands", {isAbsolute: false, subdirectories: true});
    const cluster = await client.run();
    addEvents(cluster, `${__dirname}/events`)
    //await cluster.rest.bulkOverwriteApplicationCommands(cluster.applicationId, client.commands.filter(cmd => !cmd.metadata.admin));
    //if (process.env.ADMIN_GUILD) await cluster.rest.bulkOverwriteApplicationGuildCommands(cluster.applicationId, process.env.ADMIN_GUILD, client.commands.filter(cmd => cmd.metadata.admin));    
};
