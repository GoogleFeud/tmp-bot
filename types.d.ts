import { Game } from "./src/tmp/Game";
import { Trivia } from "./src/utils/Trivia";

declare module "detritus-client" {

    interface SlashCommandClient {
        games: Map<string, Game>,
        trivia: Trivia
    }

}