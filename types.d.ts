import { Game } from "./src/tmp/Game";

declare module "detritus-client" {

    interface SlashCommandClient {
        games: Map<string, Game>
    }

}