import { BaseCollection } from "detritus-client/lib/collections";
import { Player } from "./Player";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { ShardClient } from "detritus-client";
import { Interaction, Message } from "detritus-client/lib/structures";
import { ButtonCollectorOptions, buttonCollector, ButtonCollectorEntry, ButtonCollectorErrorCauses } from "../utils/ButtonCollector";
import { TriviaQuestion } from "../utils/Trivia";
import { errorMsg, successMsg } from "../utils";
import { MessageComponentButtonStyles } from "detritus-client/lib/constants";

export const enum GamePhases {
    LOBBY,
    MINIGAME,
    TRIVIA,
    FINAL
}

export class Game {
    client: ShardClient
    channelId: string
    players: BaseCollection<string, Player>
    started = false
    phase = GamePhases.LOBBY
    currentQuestion?: TriviaQuestion
    questionCount = 0
    constructor(channelId: string, client: ShardClient) {
        this.channelId = channelId;
        this.players = new BaseCollection();
        this.client = client;
    }

    movePhase() : void {
        switch (this.phase) {
            case GamePhases.LOBBY:
                this.phase = GamePhases.TRIVIA;
                this.trivia();
                break;
            case GamePhases.MINIGAME:
                this.phase = GamePhases.TRIVIA;
                this.trivia();
                break;
            case GamePhases.TRIVIA:
                this.phase = GamePhases.MINIGAME;
        }
    }

    async trivia() : Promise<void> {
        this.questionCount++;
        const question = await this.client.slashCommandClient!.trivia.get()!;
        this.currentQuestion = question;
        const playersWhoCanAnswerCount = this.players.filter(p => !p.isDead).length;
        const makeEmbed = (timer = true, answered = 0) => {
            return {
                title: `❓ Question #${this.questionCount}`,
                description: `${timer ? "<a:30secs:860781903846309929>":""}\n${question.question}\n\nA) ${question.all_answers[0]}\nB) ${question.all_answers[1]}\nC) ${question.all_answers[2]}\nD) ${question.all_answers[3]}\n\n**${answered}/${playersWhoCanAnswerCount} answered**`,
                footer: { text: "You have 30 seconds to answer!" }
            }
        }
        let answeredAmount = 0;
        let timeout;
        const answers = await buttonCollector(this.client, {
            sendTo: this.channelId,
            embed: makeEmbed(),
            buttons: [
                {
                    label: "A",
                    style: MessageComponentButtonStyles.PRIMARY,
                    isCorrect: question.correct_answer === question.all_answers[0]
                },
                {
                    label: "B",
                    style: MessageComponentButtonStyles.PRIMARY,
                    isCorrect: question.correct_answer === question.all_answers[1]
                },
                {
                    label: "C",
                    style: MessageComponentButtonStyles.PRIMARY,
                    isCorrect: question.correct_answer === question.all_answers[2]
                },
                {
                    label: "D",
                    style: MessageComponentButtonStyles.PRIMARY,
                    isCorrect: question.correct_answer === question.all_answers[3]
                }
            ],
            unique: true,
            filter: ({user}) => this.players.has(user.id) && !this.players.get(user.id)!.isDead,
            limit: playersWhoCanAnswerCount,
            onError: (cause, user, interaction) => {
                 switch (cause) {
                    case ButtonCollectorErrorCauses.FILTER:
                        errorMsg("You must be in the game and be alive in order to answer", interaction);
                        break;
                    case ButtonCollectorErrorCauses.UNIQUE:
                        errorMsg("You have already answered", interaction);
                        break;
                 }
            },
            onClick: (entry, interaction, all, msg) => {
                answeredAmount++;
                timeout = setTimeout(async () => {
                    if (answeredAmount !== answeredAmount) return;
                    msg!.edit({embed: makeEmbed(true, answeredAmount)});
                }, 800);
            },
            timeout: 30_000
        });
        clearTimeout(timeout);
        await answers.message!.edit({embed: makeEmbed(false, answeredAmount), components: []});
        for (const answer of answers.entries) {
            if (answer.choice.isCorrect) this.send({content: `${answer.user.username} got it right!`});
            else this.send({content: `${answer.user.username} got it wrong, the answer was ${question.correct_answer}!`});
        } 
    }

    async send(content: RequestTypes.CreateMessage) : Promise<Message> {
        return this.client.rest.createMessage(this.channelId, content);
    }
}