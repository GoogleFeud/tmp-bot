import { BaseCollection } from "detritus-client/lib/collections";
import { Player } from "./Player";
import { RequestTypes } from "detritus-client-rest/lib/types";
import { ShardClient } from "detritus-client";
import { Interaction } from "detritus-client/lib/structures";
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
        const question = await this.client.slashCommandClient!.trivia.get();
        if (!question) return;
        this.currentQuestion = question;
        const playersWhoCanAnswerCount = this.players.filter(p => !p.isDead).length;
        const answers = await this.button_collector({
            sendTo: this.channelId,
            embed: {
                title: `Question #${this.questionCount}`,
                description: `${question.question}\n\nA) ${question.all_answers[0]}\nB) ${question.all_answers[1]}\nC) ${question.all_answers[2]}\nD) ${question.all_answers[3]}\n\n`,
                footer: { text: "You have 30 seconds to answer!" }
            },
            buttons: [
                {
                    label: "A",
                    style: MessageComponentButtonStyles.PRIMARY
                },
                {
                    label: "B",
                    style: MessageComponentButtonStyles.PRIMARY
                },
                {
                    label: "C",
                    style: MessageComponentButtonStyles.PRIMARY
                },
                {
                    label: "D",
                    style: MessageComponentButtonStyles.PRIMARY
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
            timeout: 30_000
        });
        console.log(answers.entries);
    }

    async send(content: RequestTypes.CreateMessage) : Promise<void> {
        await this.client.rest.createMessage(this.channelId, content);
    }

    async button_collector(params: ButtonCollectorOptions) : Promise<{
        entries: Array<ButtonCollectorEntry>,
        interaction?: Interaction
    }> {
        return buttonCollector(this.client, params);
    }
}