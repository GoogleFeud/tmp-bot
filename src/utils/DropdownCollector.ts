import { SlashContext } from "detritus-client/lib/slash";
import { Interaction, Message, User } from "detritus-client/lib/structures";
import { CollectorErrorCauses } from "./ButtonCollector";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { ShardClient } from "detritus-client";
import { InteractionCallbackTypes, MessageComponentTypes } from "detritus-client/lib/constants";

export interface DropdownCollectorEntry {
    user: User,
    options: Array<string>
}

export interface DropdownCollectorResponse {
    entries: Array<DropdownCollectorEntry>,
    message?: Message,
    interaction?: Interaction,
    cancelled?: boolean
}

export interface DropdownCollectorOptions {
    customId: string,
    maxValues?: number,
    limit?: number, 
    filter?: (entry: DropdownCollectorEntry) => boolean|null|void, 
    unique?: boolean, 
    onSelect?: (entry: DropdownCollectorEntry, all: Array<DropdownCollectorEntry>, interaction?: Interaction, message?: Message) => boolean|null|void, 
    onError?: (cause: CollectorErrorCauses, entry: DropdownCollectorEntry, interaction: Interaction) => void,
    onSend?: (thing: Interaction|Message) => void,
    timeout?: number,
    options: Array<RequestTypes.CreateChannelMessageComponentSelectMenuOption>,
    content?: string,
    embed?: RequestTypes.CreateChannelMessageEmbed,
    sendTo: SlashContext|string
}

export interface DropdownCollectorListener {
    options: DropdownCollectorOptions,
    entries: Array<DropdownCollectorEntry>,
    message?: Message,
    lastInteraction?: Interaction,
    resolve: (data: DropdownCollectorResponse) => void,
    timeout?: NodeJS.Timeout
}

export function dropdownCollector(client: ShardClient, settings: DropdownCollectorOptions) : Promise<DropdownCollectorResponse> {
    return new Promise(async (resolve) => {
        const components = [
            {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: MessageComponentTypes.SELECT_MENU,
                        customId: settings.customId,
                        options: settings.options,
                        maxValues: settings.maxValues
                    }
                ]
            }
        ]; 

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

        const listener: DropdownCollectorListener = {
            options: settings,
            entries: [],
            message,
            lastInteraction,
            resolve
        }

        if (settings.timeout) {
            listener.timeout = setTimeout(() => {
                client.slashCommandClient!.dropdownCollectors.delete(channelId);
                resolve({interaction: lastInteraction, entries: listener.entries, message});
            }, settings.timeout);
        }

        client.slashCommandClient!.dropdownCollectors.set(channelId, listener);
    });
}

export function cancelDropdownCollector(client: ShardClient, channelId: string) {
    const listener = client.slashCommandClient!.dropdownCollectors.get(channelId);
    if (!listener) return;
    if (listener.timeout) clearTimeout(listener.timeout);
    if (listener.message) listener.message.delete();
    if (listener.lastInteraction) listener.lastInteraction.deleteResponse();
    client.slashCommandClient?.buttonCollectors.delete(channelId);
    listener.resolve({entries: [], cancelled: true});
}