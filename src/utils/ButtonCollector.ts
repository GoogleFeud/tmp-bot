import { ShardClient } from "detritus-client"
import { InteractionCallbackTypes, InteractionTypes, MessageComponentButtonStyles, MessageComponentTypes } from "detritus-client/lib/constants"
import { Interaction, InteractionDataComponent, Message, User } from "detritus-client/lib/structures"
import { RequestTypes } from "detritus-client-rest/lib/types";
import { SlashContext } from "detritus-client/lib/slash";


export interface Button {
    [key: string]: unknown,
    style: MessageComponentButtonStyles,
    label: string,
    emoji?: RequestTypes.RawEmojiPartial,
    url?: string,
    disabled?: boolean,
    customId?: string
}

export interface ButtonCollectorEntry {
    user: User,
    choice: Button
}

export const enum ButtonCollectorErrorCauses {
    FILTER,
    UNIQUE
}

export interface ButtonCollectorOptions {
    limit?: number, // How many clicks to wait for
    filter?: (user: ButtonCollectorEntry, interaction: Interaction) => boolean|null|void, // Filter out clicks
    unique?: boolean, // Accept only one click per user
    onClick?: (user: ButtonCollectorEntry, interaction: Interaction, all: Array<ButtonCollectorEntry>, message?: Message) => boolean|null|void, // Do something when a user clicks
    onError?: (cause: ButtonCollectorErrorCauses, user: ButtonCollectorEntry, interaction: Interaction) => void,
    timeout?: number,
    buttons: Array<Button>,
    content?: string,
    embed?: RequestTypes.CreateChannelMessageEmbed,
    sendTo: SlashContext|string
}

export function buttonCollector(client: ShardClient, settings: ButtonCollectorOptions) : Promise<{
    entries: Array<ButtonCollectorEntry>,
    interaction?: Interaction,
    message?: Message
}> {
    return new Promise(async (resolve) => {
        const {ids, components} = formatButtons((Math.floor(Math.random() * 100)).toString() + Date.now(), settings.buttons);

        let message: Message|undefined;
        let channelId: string|undefined;
        let lastInteraction: Interaction;
        if (typeof settings.sendTo === "string") {
            message = await client.rest.createMessage(settings.sendTo, {
                content: settings.content,
                embed: settings.embed,
                components
            });
            channelId = settings.sendTo;
        } else {
            await settings.sendTo.respond({
                type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { components, content: settings.content, embeds: settings.embed ? [settings.embed]:[] }
            });
            lastInteraction = settings.sendTo.interaction;
            channelId = settings.sendTo.channelId;
        }

        const entries: Array<ButtonCollectorEntry> = [];
        let timeout: NodeJS.Timer;

        const cb = ({interaction}: {interaction: Interaction}) => {
            if (
                interaction.type === InteractionTypes.MESSAGE_COMPONENT &&
                interaction.channelId === channelId &&
                interaction.data && interaction.data instanceof InteractionDataComponent &&
                ids.has(interaction.data.customId)
            ) {
                const onError = settings.onError || (() => interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE));
                const obj = {
                    user: interaction.user,
                    choice: ids.get(interaction.data.customId)!
                }
                if (settings.filter && !settings.filter(obj, interaction)) return onError(ButtonCollectorErrorCauses.FILTER, obj, interaction);
                if (settings.unique && entries.some(e => e.user.id === interaction.userId)) return onError(ButtonCollectorErrorCauses.UNIQUE, obj, interaction);

                if (settings.onClick && settings.onClick(obj, interaction, entries, message)) {
                    client.removeListener("interactionCreate", cb);
                    resolve({interaction, entries, message});
                    clearTimeout(timeout);
                }

                entries.push(obj);

                if (entries.length === settings.limit) {
                    client.removeListener("interactionCreate", cb);
                    resolve({interaction, entries, message});
                    clearTimeout(timeout);
                }

                if (!interaction.responded) interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);
                lastInteraction = interaction;
            }
        }

        client.on("interactionCreate", cb);

        if (settings.timeout) {
            timeout = setTimeout(() => {
                client.removeListener("interactionCreate", cb);
                resolve({interaction: lastInteraction, entries, message});
            }, settings.timeout);
        }
    });
}

export function formatButtons(id: string, buttons: Array<Button>) : {
    components: Array<RequestTypes.CreateChannelMessageComponent>,
    ids: Map<string, Button>
} {
    const res = [];
    const listOfIds = new Map<string, Button>();
    let currentRow: {type: number, components: Array<RequestTypes.CreateChannelMessageComponent>} = { type: MessageComponentTypes.ACTION_ROW, components: [] };
    for (let i=1; i <= buttons.length; i++) {
        const btn = buttons[i - 1];
        btn.customId = `${id}_${i}`;
        listOfIds.set(btn.customId, btn);
        currentRow.components.push({ type: MessageComponentTypes.BUTTON, ...btn});
        if (i % 5 === 0) {
            res.push(currentRow);
            currentRow = { type: MessageComponentTypes.ACTION_ROW, components: [] };
        }
    }
    if (currentRow.components.length) res.push(currentRow);
    return {components: res, ids: listOfIds};
}