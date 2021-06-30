
import { SlashCommandClient } from "detritus-client";
import { GatewayIntents } from "detritus-client-socket/lib/constants";

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
    

    await client.addMultipleIn(`${__dirname}/commands`, {isAbsolute: true, subdirectories: true});
    console.log(client.commands);
    await client.run();
    await client.uploadApplicationCommands();
};
