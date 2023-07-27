import { Storage } from "@plasmohq/storage";
import { OpenAI } from "provides/openai";
import { Telegram } from "provides/telegram";


const main = async () => {
    const storage = new Storage();
    
    const openaiKey = await storage.get("openaiKey");
    const openaiModel = await storage.get("openaiModel");
    const ai = new OpenAI(openaiKey, openaiModel);

    const tgBotToken = await storage.get("tgBotToken");
    const tgChatId = await storage.get("tgChatId");
    const tg = new Telegram(tgBotToken, tgChatId)

    storage.watch({
        "openaiKey": (c) => ai.setApiKey(c.newValue),
        "openaiModel": (c) => ai.setModel(c.newValue),
        "tgBotToken": (c) => tg.setBotToken(c.newValue),
        "tgChatId": (c) => tg.setChatId(c.newValue),
    })

    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        tg.setTabId(sender.tab.id);

        const answer = await ai.getAnswer(message, sendResponse);
        await tg.sendQuestion(message, answer);
    });

    // long polling updates
    await tg.pollUpdates();
};
  
main();