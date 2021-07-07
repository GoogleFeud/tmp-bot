import { ShardClient } from "detritus-client"
import { InteractionCallbackTypes, MessageComponentButtonStyles, MessageComponentTypes } from "detritus-client/lib/constants"
import { Interaction, Message, User } from "detritus-client/lib/structures"
import { RequestTypes } from "detritus-client-rest/lib/types";
import { SlashContext } from "detritus-client/lib/slash";


export interface Button {
    [key: string]: unknown,
    style: MessageComponentButtonStyles,
    label: string,
    emoji?: RequestTypes.RawEmojiPartial,
    url?: string,
    disabled?: boolean,
    customId: string
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
    onSend?: (thing: Interaction|Message) => void,
    timeout?: number,
    buttons: Array<Button>,
    content?: string,
    embed?: RequestTypes.CreateChannelMessageEmbed,
    sendTo: SlashContext|string
}

interface ButtonCollectorResponse {
    entries: Array<ButtonCollectorEntry>,
    interaction?: Interaction,
    message?: Message
}

export interface ButtonCollectorListener {
    options: ButtonCollectorOptions,
    message?: Message,
    lastInteraction?: Interaction,
    resolve: (data: ButtonCollectorResponse) => unknown,
    entries: Array<ButtonCollectorEntry>,
    timeout?: NodeJS.Timeout
}

export function buttonCollector(client: ShardClient, settings: ButtonCollectorOptions) : Promise<ButtonCollectorResponse> {
    return new Promise(async (resolve) => {
        const components = formatButtons(settings.buttons);

        let message: Message|undefined;
        let channelId: string;
        let lastInteraction: Interaction|undefined = undefined;
        if (typeof settings.sendTo === "string") {
            message = await client.rest.createMessage(settings.sendTo, {
                content: settings.content,
                embed: settings.embed,
                components
            })!
            channelId = settings.sendTo;
            settings.onSend?.(message!);
        } else {
            await settings.sendTo.respond({
                type: InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { components, content: settings.content, embeds: settings.embed ? [settings.embed]:[] }
            });
            lastInteraction = settings.sendTo.interaction;
            channelId = settings.sendTo.channelId as string;
            settings.onSend?.(lastInteraction);
        }

        delete settings.embed;
        delete settings.content;
        delete settings.onSend;

        const listener: ButtonCollectorListener = {
            options: settings,
            lastInteraction,
            message,
            resolve,
            entries: []
        }

        if (settings.timeout) {
            listener.timeout = setTimeout(() => {
                client.slashCommandClient!.buttonCollectors.delete(channelId);
                resolve({interaction: lastInteraction, entries: listener.entries, message});
            }, settings.timeout);
        }

        client.slashCommandClient!.buttonCollectors.set(channelId, listener);
    });
}

export function cancelButtonCollector(client: ShardClient, channelId: string) : void {
    const listener = client.slashCommandClient!.buttonCollectors.get(channelId);
    if (!listener) return;
    if (listener.timeout) clearTimeout(listener.timeout);
    if (listener.message) listener.message.delete();
    if (listener.lastInteraction) listener.lastInteraction.deleteResponse();
    client.slashCommandClient?.buttonCollectors.delete(channelId);
    listener.resolve({entries: []});
}

export function formatButtons(buttons: Array<Button>) : Array<RequestTypes.CreateChannelMessageComponent> {
    const res = [];
    let currentRow: {type: number, components: Array<RequestTypes.CreateChannelMessageComponent>} = { type: MessageComponentTypes.ACTION_ROW, components: [] };
    for (let i=1; i <= buttons.length; i++) {
        const btn = buttons[i - 1];
        currentRow.components.push({ type: MessageComponentTypes.BUTTON, ...btn});
        if (i % 5 === 0) {
            res.push(currentRow);
            currentRow = { type: MessageComponentTypes.ACTION_ROW, components: [] };
        }
    }
    if (currentRow.components.length) res.push(currentRow);
    return res;
}