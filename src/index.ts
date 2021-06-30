
import dotenv from "dotenv";
import startBot from "./bot";

dotenv.config();
if (!process.env.TOKEN) throw new Error("Bot token is missing in .env configuration.");

(async () => {
    try {
        await startBot();
        console.log("Bot started!");
    } catch (err) {
        console.error(err);
    }
})();
