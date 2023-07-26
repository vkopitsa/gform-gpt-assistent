import type { PlasmoCSConfig } from "plasmo"
import $ from "jquery"
import { GFOption } from "domain/option";
import { GFQuestion } from "domain/question";

 
export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/forms/*"],
  all_frames: true
}

const questions: Array<GFQuestion> = [];
$("div[role='list']").first().children("div[role='listitem']").each((idx, el) => {
    const options: Array<GFOption> = $(el).find("label").toArray().map((e) => new GFOption(e));
    questions.push(new GFQuestion(el, options))
});


// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log(message, sender, sendResponse)
// });
