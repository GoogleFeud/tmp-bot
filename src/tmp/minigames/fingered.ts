
import { MessageComponentButtonStyles } from "detritus-client/lib/constants";
import { errorMsg, rngArr } from "../../utils";
import { buttonCollector, CollectorErrorCauses } from "../../utils/ButtonCollector";
import { CounterCollector } from "../../utils/CounterCollector";
import { MinigameEmbed } from "../../utils/embeds";
import { Minigame } from "../Minigame";
import { Finger, optionToFinger } from "../Player";


export default {
    name: "Fingers",
    emoji: "🖐️",
    description: "Cut off one of your fingers. Choose wisely though, this decision may alter your fate.",
    unique: false,
    canRoll: (game) => game.safePlayers!.length !== 0,
    start: async (game, minigame) => {
        const totalPlayers = game.unsafePlayers!.length;
        const counter = new CounterCollector(game, totalPlayers);
        const responses = await buttonCollector(game.client, {
            sendTo: game.channelId,
            embed: MinigameEmbed.change(minigame, game, 60),
            buttons: [
                {
                    label: "Index",
                    style: MessageComponentButtonStyles.PRIMARY,
                    customId: "A"
                },
                {
                    label: "Middle",
                    style: MessageComponentButtonStyles.PRIMARY,
                    customId: "B"
                },
                {
                    label: "Ring",
                    style: MessageComponentButtonStyles.PRIMARY,
                    customId: "C"
                },
                {
                    label: "Little",
                    style: MessageComponentButtonStyles.PRIMARY,
                    customId: "D"
                }
            ],
            unique: true,
            limit: totalPlayers,
            timeout: 60_000,
            filter: ({user}) => game.unsafePlayers!.some(p => p.id === user.id),
            onError: (cause, user, interaction) => {
                 switch (cause) {
                    case CollectorErrorCauses.FILTER:
                        errorMsg("You must be in the killing floor in order to do this!", interaction);
                        break;
                    case CollectorErrorCauses.UNIQUE:
                        const player = game.players.get(user.user.id)!;
                        errorMsg(`You already cut off your ${optionToFinger[player!.lostFinger!]}`, interaction);
                        break;
                 }
            },
            onClick: () => counter.inc()
        });
        counter.stop();
        if (responses.cancelled) return;
        responses.message!.edit({embed: MinigameEmbed.change(minigame, game), components: []});
        for (const player of game.unsafePlayers!) {
            if (responses.map!.has(player.id)) player.lostFinger = responses.map!.get(player.id)!.customId as Finger;
            else player.lostFinger = rngArr(["A", "B", "C", "D"]);
            player.money += 60;
        }
    },
} as Minigame;