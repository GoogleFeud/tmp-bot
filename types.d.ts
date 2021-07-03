import { Game } from "./src/tmp/Game";
import { Player } from "./src/tmp/Player";
import { Trivia } from "./src/utils/Trivia";

declare module "detritus-client" {

    interface SlashCommandClient {
        games: Map<string, Game>,
        trivia: Trivia
    }

}

declare module "detritus-client/lib/slash" {

    interface SlashContext {
        game: Game,
        player?: Player
    }

}