import { Storage } from "@plasmohq/storage";
import { OpenAI } from "~background/provides/openai";
import { Telegram } from "~background/provides/telegram";


export class BackgroundWorker { 
    ai: OpenAI;
    tg: Telegram;
    port: chrome.runtime.Port;

    constructor() {
        this.init().then(e => console.log(e)).catch(e => console.error(e))
    }

    async init (): Promise<void> {
        const storage = new Storage();
        
        const openaiKey = await storage.get("openaiKey");
        const openaiModel = await storage.get("openaiModel");
        this.ai = new OpenAI(openaiKey, openaiModel);

        const tgBotToken = await storage.get("tgBotToken");
        const tgChatId = await storage.get("tgChatId");
        this.tg = new Telegram(tgBotToken, tgChatId)

        storage.watch({
            "openaiKey": (c) => this.ai.setApiKey(c.newValue),
            "openaiModel": (c) => this.ai.setModel(c.newValue),
            "tgBotToken": (c) => this.tg.setBotToken(c.newValue),
            "tgChatId": (c) => this.tg.setChatId(c.newValue),
        });

        // long polling updates
        await this.tg.pollUpdates();
    }

    async onMessage (message: any, port: chrome.runtime.Port): Promise<void> {        
        const answer = await this.ai.getAnswer(message);
        port.postMessage(answer);

        await this.tg.sendQuestion(message, answer);
    }

    async clear (): Promise<void> {
        this.tg.messages = new Map<string, Object>();
    }
}

export const worker = new BackgroundWorker();

chrome.runtime.onConnect.addListener(async (port) => {
    if (port.name == chrome.runtime.id) {
        worker.tg.port = port;
        worker.port = port;
        worker.port.onMessage.addListener(await worker.onMessage.bind(worker));
        worker.port.onDisconnect.addListener(async (port) => {
            if (port.name == chrome.runtime.id) {
                worker.port.onMessage.removeListener(await worker.onMessage.bind(worker));
                await worker.clear();
            }
        });
    }
  });