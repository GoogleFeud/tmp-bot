
import { Game, indexToLetter } from "../tmp/Game";
import { EditableEmbed } from "./EditableEmbed";
 
export const QuestionEmbed = new EditableEmbed<(game: Game, timer: boolean, answered: number, allAnswered: number) => void>({
    footer: { text: "You have 30 seconds to answer!" },
    color: 0xba008f
}, (game, timer, answered, allAnswered) => ({
    title: `❓ Question #${game.questionCount}`,
    description: `${timer ? `🕜   ${process.env.COUNTDOWN_EMOJI}`:""}\n**${game.currentQuestion!.question}**\n\n${game.currentQuestion!.all_answers.map((answer, index) => `${indexToLetter[index]}) ${answer}`).join("\n")}\n\n**${answered}/${allAnswered} answered**`,
}));

export const GameEmbed = new EditableEmbed<(game: Game) => void>({}, (game) => {
    
});