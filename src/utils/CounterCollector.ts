import { ShardClient } from "detritus-client";
import { SlashContext } from "detritus-client/lib/slash";
import { Game } from "../tmp/Game";

export class CounterCollector {
    client: ShardClient
    channelId: string
    total: number
    answered: number
    timeout?: NodeJS.Timeout
    constructor(ctx: SlashContext|Game, total: number, answered = 0) {
        this.client = ctx.client;
        this.channelId = ctx.channelId!;
        this.total = total;
        this.answered = answered;
    }

    inc() : void {
        this.answered++;
        const answered = this.answered;
        this.timeout = setTimeout(() => {
            if (answered !== this.answered) return;
            this.client.rest.createMessage(this.channelId!, { content: `**${answered}/${this.total} submitted**` });
        }, 1200);
    }

    stop() : void {
       clearTimeout(this.timeout!);
    }

    reset(newTotal = this.total) : void {
        clearTimeout(this.timeout!);
        this.total = newTotal;
        this.answered = 0;
    }

}