import { Storage } from "@plasmohq/storage"
import { Assistent } from "openapi/assistent";


const main = async () => {
    const storage = new Storage();
    const openaiKey = await storage.get("openaiKey");
    const openaiModel = await storage.get("openaiModel");
    const ai = new Assistent(openaiKey, openaiModel);

    storage.watch({
        "openaiKey": (c) => ai.setApiKey(c.newValue),
        "openaiModel": (c) => ai.setModel(c.newValue),
    })

    chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => 
        await ai.getAnswer(message, sendResponse));
};
  
main();