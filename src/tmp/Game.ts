import { BaseCollection } from "detritus-client/lib/collections";
import { Player } from "./Player";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { ShardClient } from "detritus-client";
import { Interaction } from "detritus-client/lib/structures";
import { ButtonCollectorOptions, buttonCollector, ButtonCollectorEntry } from "../utils/ButtonCollector";

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


    async button_collector(params: ButtonCollectorOptions) : Promise<{
        entries: Array<ButtonCollectorEntry>,
        interaction?: Interaction
    }> {
        return buttonCollector(this.client, params);
    }
}