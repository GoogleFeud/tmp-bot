
import { MessageComponentButtonStyles } from "detritus-client/lib/constants";
import { customMsg, errorMsg, fiftyfifty, rngArr, rngBtw } from "../../utils";
import { buttonCollector, CollectorErrorCauses } from "../../utils/ButtonCollector";
import { MinigameEmbed } from "../../utils/embeds";
import { Minigame } from "../Minigame";


export default {
    name: "Dice",
    emoji: "🎲",
    description: "Three dice will roll, and the rolled numbers will be added. A randomly chosen safe player (or me) is going to decide whether you have to roll **higher** or **lower** in order to **survive**. Good luuuck.",
    unique: false,
    canRoll: (game) => game.unsafePlayers!.length <= 4,
    start: async (game, minigame) => {
        const rolled = [rngBtw(6) + 1, rngBtw(6) + 1, rngBtw(6) + 1];
        const total = rolled[0] + rolled[1] + rolled[2];

        const rngPlayer = rngArr(game.safePlayers!);
        let higherOrLower;
        if (rngPlayer) {
            const answer = await buttonCollector(game.client, {
                sendTo: game.channelId,
                embed: MinigameEmbed.change(minigame, 60, `${minigame.description}\n\n🎲 ${rolled[0]}\n🎲 ${rolled[1]}\n🎲 ${rolled[2]}\nTotal: ${total}\n\n${rngPlayer}, it's your time to shine.`),
                buttons: [
                    {
                        label: "⬆️",
                        customId: "up",
                        style: MessageComponentButtonStyles.PRIMARY
                    },
                    {
                        label: "⬇️",
                        customId: "down",
                        style: MessageComponentButtonStyles.PRIMARY
                    }
                ],
                limit: 1,
                unique: true,
                filter: ({user}) => user.id === rngPlayer.id,
                onError: (cause, user, interaction) => errorMsg("You cannot do this!", interaction)
            });
            if (answer.cancelled) return;
            if (!answer.entries.length) higherOrLower = fiftyfifty() ? "up" : "down";
            else higherOrLower = answer.entries[0].choice.customId;
            answer.message!.edit({embed: MinigameEmbed.change(minigame, 60, `${minigame.description}\n\n🎲 ${rolled[0]}\n🎲 ${rolled[1]}\n🎲 ${rolled[2]}\nTotal: ${total}\n\n${rngPlayer}, it's your time to shine.`), components: []});
        } else {
            await game.send({
                embed: MinigameEmbed.change(minigame, 60, `${minigame.description}\n\n🎲 ${rolled[0]}\n🎲 ${rolled[1]}\n🎲 ${rolled[2]}\nTotal: ${total}`)
            });
            higherOrLower = fiftyfifty() ? "up" : "down";
        }

        const results = new Map<string, number>();
        const res = await buttonCollector(game.client, {
            sendTo: game.channelId,
            embed: MinigameEmbed.change(minigame, 60, `Alright. You have to roll **${higherOrLower === "up" ? "higher than":"lower than"}** ${total} in order to survive.`),
            buttons: [
                {
                    label: "🎲🎲🎲",
                    customId: "dice",
                    style: MessageComponentButtonStyles.PRIMARY
                }
            ],
            limit: game.unsafePlayers!.length,
            unique: true,
            filter: ({user}) => !game.players.get(user.id)?.isSafe,
            onError: (cause, user, interaction) => {
                switch (cause) {
                   case CollectorErrorCauses.FILTER:
                       errorMsg("Only unsafe players can roll the dice", interaction);
                       break;
                   case CollectorErrorCauses.UNIQUE:
                       errorMsg("You already rolled the dice", interaction);
                       break;
                }
           },
           onClick: async ({user}, interaction) => {
               const rng = [rngBtw(6) + 1, rngBtw(6) + 1, rngBtw(6) + 1];
               const totalForUser = rng[0] + rng[1] + rng[2];
               await customMsg({
                   embed: {
                       title: "🎲 Roll",
                       description: `${user.mention} has rolled the dice\n\n🎲 ${rng[0]}\n🎲 ${rng[1]}\n🎲 ${rng[2]}\nTotal: ${totalForUser}`
                   }
               }, interaction, false);
               results.set(user.id, totalForUser);
           }
        });

        if (res.cancelled) return;
        res.message!.edit({embed: MinigameEmbed.change(minigame, 60, `Alright. You have to roll **${higherOrLower === "up" ? "higher than":"lower than"}** ${total} in order to survive.`), components: []})

        const deadPlayers = [];
        for (const player of game.unsafePlayers!) {
            let result: number;
            if (!results.has(player.id)) {
                result = rngBtw(18) + 1;
                results.set(player.id, result);
            } else result = results.get(player.id)!;
            if ((result > total && higherOrLower === "down") || (result < total && higherOrLower === "up")) {
                deadPlayers.push(player);
                player.isGhost = true;
            }
        }

        game.send({
            embed: {
                title: "🎲 Result",
                description: deadPlayers.length ? "Oop, looks like we have some unlucky fellas" : "Everyone... survived?",
                fields: [
                    {
                        name: "Dead players",
                        value: deadPlayers.map(p => `${p.format(game)} rolled ${results.get(p.id)}`).join("\n") || "Everyone survived!"
                    }
                ]
            }
        })

    },
} as Minigame;