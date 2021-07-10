
import { MessageComponentButtonStyles } from "detritus-client/lib/constants";
import { errorMsg } from "../../utils";
import { buttonCollector, CollectorErrorCauses } from "../../utils/ButtonCollector";
import { CounterCollector } from "../../utils/CounterCollector";
import { MinigameEmbed } from "../../utils/embeds";
import { Minigame } from "../Minigame";


export default {
    name: "Decisions, Decisions",
    emoji: "🤑",
    description: "There is a pile of money in front of you. It's your choice if you want to take some money.\n\n- If nobody takes the money, you all survive.\n- If only some of you took money, everyone who didn't is killed.\n- If everyone takes the money, everyone dies!\n\nYou have 1 minute to decide.",
    unique: true,
    canRoll: (game) => game.unsafePlayers!.length > 2,
    start: async (game, minigame) => {
        const total = game.unsafePlayers!.length;
        const counter = new CounterCollector(game, total);

        const choices = await buttonCollector(game.client, {
            sendTo: game.channelId,
            embed: MinigameEmbed.change(minigame, 60),
            limit: total,
            unique: true,
            buttons: [
                {
                    label: "🤑 Take it",
                    customId: "take",
                    style: MessageComponentButtonStyles.PRIMARY
                },
                {
                    label: "Do not take it",
                    customId: "leave",
                    style: MessageComponentButtonStyles.PRIMARY
                }
            ],
            timeout: 60_000,
            filter: ({user}) => game.unsafePlayers!.some(p => p.id === user.id),
            onError: (cause, user, interaction) => {
                 switch (cause) {
                    case CollectorErrorCauses.FILTER:
                        errorMsg("You must be in the killing floor in order to use this!", interaction);
                        break;
                    case CollectorErrorCauses.UNIQUE:
                        errorMsg("You already made a choice.", interaction);
                        break;
                 }
            },
            onClick: () => counter.inc()
        });
        counter.stop();
        if (choices.cancelled) return;
        choices.message!.edit({embed: MinigameEmbed.change(minigame, undefined), components: []});

        let outcome = "";
        const playersWhoTookTheMoneyLen = choices.entries.filter(entry => entry.choice.customId === "take").length;
        if (playersWhoTookTheMoneyLen === 0) {
            outcome = "Wow it looks like nobody took the money...";
        } else if (playersWhoTookTheMoneyLen === total) {
            outcome = "Everyone decided to grab some cash! And now everybody DIES.";
            for (const player of game.unsafePlayers!) {
                player.isGhost = true;
                player.money += 80;
            }
        } else {
            outcome = "Looks like some people got greedy...";
            for (const player of game.unsafePlayers!) {
                const choice = choices.map!.get(player.id);
                if (!choice || choice.customId === "leave") player.isGhost = true;
                else player.money += 80; 
            }
        }

        game.send({embed: {
            title: "💰 Decisions, Decisions",
            description: outcome,
            fields: [
                {
                    name: "Outcome",
                    value: game.unsafePlayers!.map(p => `${p.format(game)} - ${choices.map!.get(p.id)?.customId === "take" ? "💸":"❌"}`).join("\n") || "Nobody died!"
                }
            ]
        }});
    }, 
} as Minigame;