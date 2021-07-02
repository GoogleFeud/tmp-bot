
import { GatewayIntents } from "detritus-client-socket/lib/constants";
import { SlashCommandClient } from "detritus-client/lib/slashcommandclient";

export default async (): Promise<void> => {
    const client = new SlashCommandClient(process.env.TOKEN as string, {
        useClusterClient: true,
        cache: {
            presences: { enabled: false },
            emojis: { enabled: false },
            messages: { enabled: false },
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

    await client.addMultipleIn("bot/commands", {isAbsolute: false, subdirectories: true});
    const cluster = await client.run();
    //await cluster.rest.bulkOverwriteApplicationCommands(cluster.applicationId, client.commands.toArray());
};
