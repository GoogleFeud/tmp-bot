import { BaseCollection } from "detritus-client/lib/collections";
import { Player } from "./Player";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { ShardClient } from "detritus-client";
import { Interaction, InteractionDataComponent, User } from "detritus-client/lib/structures";
import { InteractionCallbackTypes, InteractionTypes, MessageComponentTypes } from "detritus-client/lib/constants";

export interface ButtonCollectorOptions {
    wait_for?: number, // How many clicks to wait for
    filter?: (user: ButtonCollectorEntry) => boolean, // Filter out clicks
    unique?: boolean, // Accept only one click per user
    onClick?: (user: ButtonCollectorEntry, interaction: Interaction) => boolean|null|void, // Do something when a user clicks
}

export interface ButtonCollectorEntry {
    choice: string,
    user: User
}

export interface ButtonCollectorRes {
    entries: Array<ButtonCollectorEntry>,
    interaction: Interaction
}

export class Game {
    client: ShardClient
    channelId: string
    players: BaseCollection<string, Player>
    constructor(channelId: string, client: ShardClient) {
        this.channelId = channelId;
        this.players = new BaseCollection();
        this.client = client;
    }

    async send(content: RequestTypes.CreateMessage) : Promise<void> {
        await this.client.rest.createMessage(this.channelId, content);
    }

    async send_button_collector(content: RequestTypes.CreateMessage, params: ButtonCollectorOptions = {}) : Promise<ButtonCollectorRes> {
        const msg = await this.client.rest.createMessage(this.channelId, content);
        return this.button_collector(msg.id, params);
    }

    async button_collector(msg_id: string, params: ButtonCollectorOptions = {}) : Promise<ButtonCollectorRes> {
        return new Promise((resolve) => {
            const entries: Array<ButtonCollectorEntry> = [];
            const cb = ({interaction}: {interaction: Interaction}) => {
                if (interaction.type === InteractionTypes.MESSAGE_COMPONENT &&
                    interaction.data instanceof InteractionDataComponent && 
                    interaction.data.componentType === MessageComponentTypes.BUTTON) {
                    const obj = {
                        user: interaction.user,
                        choice: interaction.data.customId
                    };
                    if ((params.filter && !params.filter(obj)) || (params.unique && entries.find(p => p.user.id === interaction.userId))) return interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);
                    if (params.onClick && params.onClick(obj, interaction)) {
                        this.client.removeListener("interactionCreate", cb);
                        resolve({interaction, entries});
                    }
                    entries.push(obj);
                    if (entries.length === params.wait_for) {
                        this.client.removeListener("interactionCreate", cb);
                        resolve({interaction, entries});
                    }
                    if (!interaction.responded) interaction.respond(InteractionCallbackTypes.DEFERRED_UPDATE_MESSAGE);
                }
            };
            this.client.on("interactionCreate", cb);
        });
    }
}