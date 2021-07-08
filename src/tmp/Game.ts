import { BaseCollection } from "detritus-client/lib/collections";
import { optionToFinger, Player } from "./Player";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { ShardClient } from "detritus-client";
import { Message } from "detritus-client/lib/structures";
import { buttonCollector, CollectorErrorCauses } from "../utils/ButtonCollector";
import { TriviaQuestion } from "../utils/Trivia";
import { createSlotMachine, errorMsg, rngArr, wait } from "../utils";
import { MessageComponentButtonStyles } from "detritus-client/lib/constants";
import { Minigame } from "./Minigame";
import { getMinigames } from "./minigames";
import { QuestionEmbed } from "../utils/embeds";

export const indexToLetter: Record<number, string> = {
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
    phase = GamePhases.LOBBY
    currentQuestion?: TriviaQuestion
    questionCount = 0
    minigames: Array<Minigame>
    safePlayers?: Array<Player>
    unsafePlayers?: Array<Player>
    constructor(channelId: string, client: ShardClient) {
        this.channelId = channelId;
        this.players = new BaseCollection();
        this.client = client;
        this.minigames = getMinigames();
    }

    movePhase() : void {
        switch (this.phase) {
            case GamePhases.LOBBY:
                this.phase = GamePhases.TRIVIA;
                this.trivia();
                break;
            case GamePhases.MINIGAME:
                this.clearBetweenPhases();
                this.phase = GamePhases.TRIVIA;
                this.trivia();
                break;
            case GamePhases.TRIVIA:
                this.phase = GamePhases.MINIGAME;
                this.minigame();
        }
    }

    async trivia() : Promise<void> {
        this.questionCount++;
        const question = await this.client.slashCommandClient!.trivia.get()!;
        this.currentQuestion = question;
        const playersWhoCanAnswerCount = this.players.filter(p => !p.isDead).length;
        let answeredAmount = 0;
        let timeout;
        const answers = await buttonCollector(this.client, {
            sendTo: this.channelId,
            embed: QuestionEmbed.change(this, true, answeredAmount, playersWhoCanAnswerCount),
            buttons: [
                {
                    label: "A",
                    customId: "A",
                    style: MessageComponentButtonStyles.PRIMARY,
                    isCorrect: question.correct_answer === question.all_answers[0]
                },
                {
                    label: "B",
                    customId: "B",
                    style: MessageComponentButtonStyles.PRIMARY,
                    isCorrect: question.correct_answer === question.all_answers[1]
                },
                {
                    label: "C",
                    customId: "C",
                    style: MessageComponentButtonStyles.PRIMARY,
                    isCorrect: question.correct_answer === question.all_answers[2]
                },
                {
                    label: "D",
                    customId: "D",
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
                    case CollectorErrorCauses.FILTER:
                        if (this.players.get(user.user.id)?.lostFinger === user.choice.label) errorMsg(`You cannot select this answer because you cut off your ${optionToFinger[user.choice.label]} finger`, interaction)
                        else errorMsg("You must be in the game and be alive in order to answer", interaction);
                        break;
                    case CollectorErrorCauses.UNIQUE:
                        errorMsg("You have already answered", interaction);
                        break;
                 }
            },
            onClick: (entry, interaction, all, msg) => {
                answeredAmount++;
                timeout = setTimeout(async () => {
                    if (answeredAmount !== answeredAmount) return;
                    msg!.edit({embed: QuestionEmbed.change(this, true, answeredAmount, playersWhoCanAnswerCount)});
                }, 800);
            }
        });
        clearTimeout(timeout);
        if (answers.cancelled) return;
        await answers.message!.edit({embed: QuestionEmbed.change(this, false, answeredAmount, playersWhoCanAnswerCount), components: []});

        for (const entry of answers.entries) {
            if (entry.choice.isCorrect) {
                const player = this.players.get(entry.user.id)!;
                player.isSafe = true;
                player.money += 100;
            }
        }

        const killingFloorPlayers: Array<Player> = [];
        const safePlayers: Array<Player> = [];
        for (const [, player] of this.players) {
            if (player.isDead || player.isGhost) continue;
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

        await wait(5);
        if (killingFloorPlayers.length === 0) {
            this.clearBetweenPhases();
            this.trivia();
        }
        else {
            this.unsafePlayers = killingFloorPlayers;
            this.safePlayers = safePlayers;
            this.movePhase();
        }
    }

    async minigame() : Promise<void> {
        if (!this.started) return;
        const minigame = rngArr(this.minigames.filter(minigame => minigame.canRoll(this)));
        if (minigame.unique) this.minigames.splice(this.minigames.indexOf(minigame), 1);
        let timer: number = 0;
        let message: Message;
        const interval = setInterval(async () => {
            if (timer === 5) {
                message.edit(createSlotMachine(minigame.emoji, minigame.emoji, minigame.emoji));
                clearInterval(interval);
                await minigame.start(this, minigame);
                await wait(2);
                this.movePhase();
            } else {
            const leftSide = rngArr(this.minigames).emoji;
            const middleSide = rngArr(this.minigames.filter(m => m.emoji !== leftSide)).emoji;
            const rightSide = rngArr(this.minigames).emoji;
            if (!message) message = await this.send({content: createSlotMachine(leftSide, middleSide, rightSide)});
            else message.edit({content: createSlotMachine(leftSide, middleSide, rightSide)});
            timer++;
            }
        }, 1000);
    }

    clearBetweenPhases() : void {
        delete this.currentQuestion;
        delete this.safePlayers;
        delete this.unsafePlayers;
        for (const [, player] of this.players) {
            player.isSafe = false;
            player.minigameData = {};
        }
    }

    clear() {
        delete this.currentQuestion;
        delete this.safePlayers;
        delete this.unsafePlayers;
        this.started = false;
        this.questionCount = 0;
        this.minigames = getMinigames();
        this.phase = GamePhases.LOBBY;
        this.players.clear();
    }

    isAlive(playerId: string) : boolean {
        const player = this.players.get(playerId);
        return (player || false) && !player.isDead && !player.isGhost;
    }

    async send(content: RequestTypes.CreateMessage) : Promise<Message> {
        return this.client.rest.createMessage(this.channelId, content);
    }


}