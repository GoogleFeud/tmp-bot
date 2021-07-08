
import { MessageComponentButtonStyles } from "detritus-client/lib/constants";
import { errorMsg } from "../../utils";
import { buttonCollector, ButtonCollectorErrorCauses } from "../../utils/ButtonCollector";
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
        let answeredAmount = 0;
        let timeout;
        const responses = await buttonCollector(game.client, {
            sendTo: game.channelId,
            embed: MinigameEmbed.change(minigame, game, answeredAmount, 60),
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
            limit: game.unsafePlayers!.length,
            timeout: 60_000,
            filter: ({user}) => game.unsafePlayers!.some(p => p.id === user.id),
            onError: (cause, user, interaction) => {
                 switch (cause) {
                    case ButtonCollectorErrorCauses.FILTER:
                        errorMsg("You must be in the killing floor in order to do this!", interaction);
                        break;
                    case ButtonCollectorErrorCauses.UNIQUE:
                        const player = game.players.get(user.user.id)!;
                        errorMsg(`You already cut off your ${optionToFinger[player!.lostFinger!]}`, interaction);
                        break;
                 }
            },
            onClick: (entry, interaction, all, msg) => {
                answeredAmount++;
                timeout = setTimeout(async () => {
                    if (answeredAmount !== answeredAmount) return;
                    msg!.edit({embed: MinigameEmbed.change(minigame, game, answeredAmount, 60)});
                }, 800);
            }
        });
        clearTimeout(timeout);
        responses.message!.edit({embed: MinigameEmbed.change(minigame, game, answeredAmount), components: []})
        for (const response of responses.entries) {
             const player = game.players.get(response.user.id)!;
             player.lostFinger = response.choice.customId as Finger;
        }
    },
} as Minigame;