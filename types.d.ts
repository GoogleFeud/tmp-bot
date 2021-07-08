import { Game } from "./src/tmp/Game";
import { Player } from "./src/tmp/Player";
import { ButtonCollectorListener } from "./src/utils/ButtonCollector";
import { DropdownCollectorListener } from "./src/utils/DropdownCollector";
import { Trivia } from "./src/utils/Trivia";

declare module "detritus-client" {

    interface SlashCommandClient {
        games: Map<string, Game>,
        buttonCollectors: Map<string, ButtonCollectorListener>,
        dropdownCollectors: Map<string, DropdownCollectorListener>,
        trivia: Trivia
    }
    
}

declare module "detritus-client/lib/slash" {

    interface SlashContext {
        game: Game,
        player?: Player
    }

}