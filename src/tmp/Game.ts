import { BaseCollection } from "detritus-client/lib/collections";
import { Player } from "./Player";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { ShardClient } from "detritus-client";
import { Interaction, InteractionDataComponent, User } from "detritus-client/lib/structures";
import { InteractionTypes, MessageComponentTypes } from "detritus-client/lib/constants";

export interface ButtonCollectorParams {
    message: RequestTypes.CreateMessage,
    wait_for?: number, // How many clicks to wait for
    filter?: (user: ButtonCollectorRes) => boolean, // Filter out clicks
    unique?: boolean, // Accept only one click per user
    onClick?: (user: ButtonCollectorRes, interaction: Interaction) => boolean|null|void // Do something when a user clicks
}

export interface ButtonCollectorRes {
    choice: string,
    user: User
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

    async button_collector(params: ButtonCollectorParams) : Promise<Map<string, ButtonCollectorRes>> {
        await this.client.rest.createMessage(this.channelId, params.message);
        return new Promise((resolve) => {
            const res = new Map<string, ButtonCollectorRes>();
            const cb = ({interaction}: {interaction: Interaction}) => {
                if (interaction.type === InteractionTypes.MESSAGE_COMPONENT && 
                    interaction.channel?.id === this.channelId &&
                    interaction.data instanceof InteractionDataComponent && 
                    interaction.data.componentType === MessageComponentTypes.BUTTON) {
                    const obj = {
                        user: interaction.user,
                        choice: interaction.data.customId
                    };
                    if (params.filter && !params.filter(obj)) return;
                    if (params.unique && res.has(interaction.userId)) return;
                    if (params.onClick && params.onClick(obj, interaction)) {
                        this.client.removeListener("interactionCreate", cb);
                        resolve(res);
                    }
                    res.set(interaction.userId, obj);
                    if (res.size === params.wait_for) {
                        this.client.removeListener("interactionCreate", cb);
                        resolve(res);
                    }
                }
            };
            this.client.on("interactionCreate", cb);
        });
    }
}