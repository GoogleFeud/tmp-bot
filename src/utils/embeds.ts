
import { Game, indexToLetter } from "../tmp/Game";
import { Minigame } from "../tmp/Minigame";
import { EditableEmbed } from "./EditableEmbed";
 
export const QuestionEmbed = new EditableEmbed<(game: Game, timer: boolean) => void>({
    color: 0xba008f
}, (game, timer) => ({
    title: `❓ Question #${game.questionCount}`,
    thumbnail: timer ? { url: process.env.TIMER_30 } : undefined,
    description: `**${game.currentQuestion!.question}**\n\n${game.currentQuestion!.all_answers.map((answer, index) => `${indexToLetter[index]}) ${answer}`).join("\n")}`,
}));

export const MinigameEmbed = new EditableEmbed<(minigame: Minigame, game: Game, waitingFor?: number, showTimer?: number, allPlayersCount?: number) => void>({
    color: 0xba1900
}, (minigame, game, waitingFor, showTimer, allPlayersCount = game.unsafePlayers!.length) => ({
    title: `${minigame.emoji} ${minigame.name}`,
    description: waitingFor ? `${minigame.description}\n\n**${waitingFor}/${allPlayersCount} submitted**` : minigame.description,
    thumbnail: showTimer ? { url: process.env[`TIMER_${showTimer}`] } : undefined
}));