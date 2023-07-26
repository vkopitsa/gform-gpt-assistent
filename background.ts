import { Storage } from "@plasmohq/storage"
import { Assistent } from "openapi/assistent";


const main = async () => {
    const storage = new Storage();
    let openaiKey = await storage.get("openaiKey");

    const ai = new Assistent(openaiKey);

    storage.watch({"openaiKey": (c) => ai.setApiKey(c.newValue)})

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        return ai.getAnswer(message, sendResponse)
    });
};
  
main();