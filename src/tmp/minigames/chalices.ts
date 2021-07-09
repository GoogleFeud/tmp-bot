
import { MessageComponentButtonStyles } from "detritus-client/lib/constants";
import { errorMsg, rngBtw } from "../../utils";
import { buttonCollector, CollectorErrorCauses } from "../../utils/ButtonCollector";
import { CounterCollector } from "../../utils/CounterCollector";
import { EditableEmbed } from "../../utils/EditableEmbed";
import { MinigameEmbed } from "../../utils/embeds";
import { Minigame } from "../Minigame";


export default {
    name: "Chalices",
    emoji: "🏆",
    description: "One of my favorites. There will be a few chalices in front of you. All alive players are given a poison pellet, and each one of them will drop their pellet in a chalice of their choosing. After that you'll have to drink from one of the chalices. Make sure to pick a chalice which isn't poisoned, otherwise you DIE! All alive players have 1 minute to choose where to put the poison.",
    unique: true,
    canRoll: (game) => game.safePlayers!.length > 2,
    start: async (game, minigame) => {
        const chalices = Array.from({length: Math.max(4, game.unsafePlayers!.length)}, (_, ind: number) => ({customId: ind.toString(), label: "🏆", style: MessageComponentButtonStyles.PRIMARY}));
        const poisonedChalices = new Set();
        
        const counter = new CounterCollector(game, game.safePlayers!.length);

        const poisonPellets = await buttonCollector(game.client, {
            sendTo: game.channelId,
            embed: MinigameEmbed.change(minigame, 60),
            buttons: chalices,
            unique: true,
            limit: game.safePlayers!.length,
            timeout: 60_000,
            filter: ({user}) => game.safePlayers!.some(p => p.id === user.id),
            onError: (cause, user, interaction) => {
                 switch (cause) {
                    case CollectorErrorCauses.FILTER:
                        errorMsg("You must be safe in order to do this!", interaction);
                        break;
                    case CollectorErrorCauses.UNIQUE:
                        errorMsg("You don't have anymore poison pellets.", interaction);
                        break;
                 }
            },
            onClick: () => counter.inc()
        });
        counter.stop();
        if (poisonPellets.cancelled) return;
        poisonPellets.message!.edit({embed: MinigameEmbed.change(minigame), components: []});
        for (const player of game.safePlayers!) {
            const choice = poisonPellets.map!.get(player.id);
            if (choice) poisonedChalices.add(+choice.customId);
            else poisonedChalices.add(rngBtw(chalices.length));
        }

        counter.reset(game.unsafePlayers!.length);

        const EditableWithCount = new EditableEmbed<(showTimer?: number) => void>({
            title: "🍹 Time to drink",
            description: "All unsafe players have 1 minute to choose a chalice to drink from. Choose wisely."
        }, (showTimer) => ({
                thumbnail: showTimer ? { url: process.env[`TIMER_${showTimer}`] } : undefined
            })
        );

        const userChoices = await buttonCollector(game.client, {
            sendTo: game.channelId,
            embed: EditableWithCount.change(60),
            buttons: chalices,
            unique: true,
            limit: game.unsafePlayers!.length,
            timeout: 60_000,
            filter: ({user}) => game.unsafePlayers!.some(p => p.id === user.id),
            onError: (cause, user, interaction) => {
                 switch (cause) {
                    case CollectorErrorCauses.FILTER:
                        errorMsg("Trust me, you don't want to drink this.", interaction);
                        break;
                    case CollectorErrorCauses.UNIQUE:
                        errorMsg("You already drank from a chalice. Trust me, you don't want to drink another one.", interaction);
                        break;
                 }
            },
            onClick: () => counter.inc()
        })
        counter.stop();
        if (poisonPellets.cancelled) return;
        userChoices.message!.edit({embed: EditableWithCount.change(), components: []});

        const poisonedPlayers = [];
        for (const player of game.unsafePlayers!) {
            const choice = userChoices.map!.get(player.id);
            if (poisonedChalices.has(choice ? +choice.customId : rngBtw(chalices.length))) {
                poisonedPlayers.push(player);
                player.isGhost = true;
            }
        }

        game.send({
            embed: {
                title: "☠️ Results",
                description: poisonedPlayers.length ? "Uh...oh... looks like somebody drank poison!" : "Ugh... everyone survived. How lame.",
                fields: [
                    {
                        name: "Poisoned Players",
                        value: poisonedPlayers.map(p => p.format(game)).join("\n") || "Nobody :("
                    }
                ]
            }
        });


    }, 
} as Minigame;