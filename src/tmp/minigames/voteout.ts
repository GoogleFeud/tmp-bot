
import { errorMsg, fiftyfifty, wait } from "../../utils";
import { CollectorErrorCauses } from "../../utils/ButtonCollector";
import { dropdownCollector } from "../../utils/DropdownCollector";
import { MinigameEmbed } from "../../utils/embeds";
import { Minigame } from "../Minigame";


export default {
    name: "Voteout",
    emoji: "🗳️",
    description: "Everyone, even alive players will have 1 minute to vote for another player. The player with the most votes will be killed! If there's a tie, a random player will be chosen.",
    unique: false,
    canRoll: (game) => (game.safePlayers!.length + game.unsafePlayers!.length) > 2 && game.unsafePlayers!.length > 1,
    start: async (game, minigame) => {
        let answeredAmount = 0;
        const totalPlayersInGame = game.safePlayers!.length + game.unsafePlayers!.length;
        let timeout;
        const res = await dropdownCollector(game.client, {
            sendTo: game.channelId,
            options: game.unsafePlayers!.map(p => ({label: p.username, value: p.id})),
            customId: "voteout",
            limit: totalPlayersInGame,
            timeout: 60_000,
            unique: true,
            embed: MinigameEmbed.change(minigame, game, answeredAmount, 60, totalPlayersInGame),
            filter: ({user}) => game.isAlive(user.id),
            onError: (cause, user, interaction) => {
                 switch (cause) {
                    case CollectorErrorCauses.FILTER:
                        errorMsg("You must be alive in order to vote", interaction);
                        break;
                    case CollectorErrorCauses.UNIQUE:
                        errorMsg("You can vote only once", interaction);
                        break;
                 }
            },
            onSelect: (entry, interaction, all, msg) => {
                answeredAmount++;
                timeout = setTimeout(async () => {
                    if (answeredAmount !== answeredAmount) return;
                    msg!.edit({embed: MinigameEmbed.change(minigame, game, answeredAmount, 60, totalPlayersInGame)});
                }, 800);
            }
        });
        clearTimeout(timeout);
        if (res.cancelled) return;
        res.message!.edit({embed: MinigameEmbed.change(minigame, game, answeredAmount, undefined, totalPlayersInGame), components: []});
        const votes: Record<string, number> = {};
        for (const vote of res.entries) {
            if (!votes[vote.options[0]]) votes[vote.options[0]] = 1;
            else votes[vote.options[0]]++;
        }
        let mostVoted: undefined|{userId: string, votecount: number} = undefined;
        for (const [userId, votecount] of Object.entries(votes)) {
            if (!mostVoted) mostVoted = {userId, votecount};
            else if ((votecount === mostVoted.votecount && fiftyfifty()) || votecount > mostVoted.votecount) mostVoted = {userId, votecount};
        }

        game.send({
            embed: {
                title: "🗳️ The votes are in",
                description: `And the player voted out is... <@${mostVoted!.userId}> with ${mostVoted!.votecount} votes! Wow, people hate you.`,
                fields: [
                    {
                        name: "Votes",
                        value: res.entries.map(entry => `${entry.user.mention} voted for <@${entry.options[0]}>`).join("\n"),
                        inline: true
                    }
                ]
            }
        });

        game.players.get(mostVoted!.userId)!.isGhost = true;
    }, 
} as Minigame;