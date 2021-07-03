
import fetch from "node-fetch";
import { shuffleArray } from ".";

export interface TriviaQuestion {
    category: string,
    difficulty: string,
    question: string,
    correct_answer: string,
    incorrect_answers: Array<string>,
    all_answers: Array<string>
}


export const enum TriviaResponseCodes {
    SUCCESS,
    NO_RESULTS,
    INVALID_PARAM,
    TOKEN_NOT_FOUND,
    TOKEN_EMPTY
}

export class Trivia {
    session?: string
    cache: Array<TriviaQuestion> = []

    async getSession() : Promise<void> {
        const res = await fetch("https://opentdb.com/api_token.php?command=request").then(obj => obj.json());
        if (res.response_code !== TriviaResponseCodes.SUCCESS) setTimeout(() => this.getSession(), 5000);
        else {
            this.session = res.token;
        }
    }

    async resetSession() : Promise<void> {
        await fetch(`https://opentdb.com/api_token.php?command=reset&token=${this.session}`);
    }

    async fetch(amount = 50) : Promise<void> {
        if (!this.session) await this.getSession();
        const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple&token=${this.session}&encode=url3986`).then(obj => obj.json());
        if (res.response_code === TriviaResponseCodes.TOKEN_NOT_FOUND) {
            await this.getSession();
            await this.fetch(amount);
            return;
        }
        else if (res.response_code === TriviaResponseCodes.TOKEN_EMPTY || res.response_code === TriviaResponseCodes.NO_RESULTS) {
            await this.resetSession();
            await this.fetch(amount);
        }
        for (const result of res.results) {
            result.correct_answer = decodeURIComponent(result.correct_answer);
            result.incorrect_answers[0] = decodeURIComponent(result.incorrect_answers[0]);
            result.incorrect_answers[1] = decodeURIComponent(result.incorrect_answers[1]);
            result.incorrect_answers[2] = decodeURIComponent(result.incorrect_answers[2]);
            result.all_answers = shuffleArray([result.correct_answer, ...result.incorrect_answers]);
            result.question = decodeURIComponent(result.question);
            this.cache.push(result);
        }
    }

    async get() : Promise<TriviaQuestion> {
        if (!this.cache.length) await this.fetch();
        return this.cache.pop()!;
    }

}