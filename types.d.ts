import { Game } from "./src/tmp/Game";

declare module "detritus-client" {
    interface ShardClient {
        games: Map<string, Game>
    }

    interface ClusterClient {
        games: Map<string, Game>
    }

}