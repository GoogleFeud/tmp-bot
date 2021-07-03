import { BaseCollection } from "detritus-client/lib/collections";
import { optionToFinger, Player } from "./Player";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { ShardClient } from "detritus-client";
import { Message } from "detritus-client/lib/structures";
import { buttonCollector, ButtonCollectorErrorCauses } from "../utils/ButtonCollector";
import { TriviaQuestion } from "../utils/Trivia";
import { errorMsg } from "../utils";
import { MessageComponentButtonStyles } from "detritus-client/lib/constants";

const indexToLetter: Record<number, string> = {
    0: "A",
    1: "B",
    2: "C",
    3: "D"
}

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
    paused = false
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
                this.clearBetweenPhases();
                this.phase = GamePhases.MINIGAME;
                this.minigame();
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
                description: `${timer ? `🕜   ${process.env.COUNTDOWN_EMOJI}`:""}\n**${question.question}**\n\n${question.all_answers.map((answer, index) => `${indexToLetter[index]}) ${answer}`).join("\n")}\n\n**${answered}/${playersWhoCanAnswerCount} answered**`,
                footer: { text: "You have 30 seconds to answer!" },
                color: 0xba008f
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
            limit: playersWhoCanAnswerCount,
            timeout: 30_000,
            filter: ({user, choice}) => {
                const player = this.players.get(user.id);
                return player && !player.isDead && player.lostFinger !== choice.label;
            },
            onError: (cause, user, interaction) => {
                 switch (cause) {
                    case ButtonCollectorErrorCauses.FILTER:
                        if (this.players.get(user.user.id)?.lostFinger === user.choice.label) errorMsg(`You cannot select this answer because you cut off your ${optionToFinger[user.choice.label]} finger`, interaction)
                        else errorMsg("You must be in the game and be alive in order to answer", interaction);
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
            }
        });
        clearTimeout(timeout);
        await answers.message!.edit({embed: makeEmbed(false, answeredAmount), components: []});

        for (const entry of answers.entries) {
            if (entry.choice.isCorrect) {
                const player = this.players.get(entry.user.id)!;
                player.isSafe = true;
                player.money += 100;
            }
        }

        const killingFloorPlayers = [];
        const safePlayers = [];
        for (const [, player] of this.players) {
            if (player.isSafe) safePlayers.push(player);
            else killingFloorPlayers.push(player);
        }

        await this.send({
            embed: {
                title: "💡 And the correct answer is...",
                color: 0xffcc24,
                description: `||${indexToLetter[question.correct_answer_pos]}) ${question.correct_answer}||`,
                fields: [
                    {
                        name: "Safe players",
                        value: this.players.filter(p => p.isSafe).map(p => p.format(this)).join("\n") || "Nobody",
                        inline: true
                    },
                    {
                        name: "Killing floor",
                        value: killingFloorPlayers.map(p => p.format(this)).join("\n") || "Nobody",
                        inline: true
                    },
                    {
                        name: "Outcome",
                        value: killingFloorPlayers.length === 0 ? "Evebody got it right... how boring. Onto the next one!" : 
                               safePlayers.length === 0 ? "Awh... nobody got it right. It's time to have some fun." : "It's time for a punishment..."
                    }
                ]
            }
        });

        setTimeout(() => {
            if (killingFloorPlayers.length === 0) {
                this.clearBetweenPhases();
                this.trivia();
            }
            else this.movePhase();
        }, 5000);
    }

    async minigame() : Promise<void> {
        this.send({content: "It's time for a minigame!"});
    }

    clearBetweenPhases() : void {
        delete this.currentQuestion;
        for (const [, player] of this.players) {
            player.isSafe = false;
            player.minigameData = {};
        }
    }

    async send(content: RequestTypes.CreateMessage) : Promise<Message> {
        return this.client.rest.createMessage(this.channelId, content);
    }
}