import type { PlasmoCSConfig } from "plasmo";
import $ from "jquery";
import { GFOption } from "~contents/domain/option";
import { GFQuestion } from "~contents/domain/question";


export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/forms/*"],
  all_frames: true
}

const port = chrome.runtime.connect({ name: chrome.runtime.id });

window.addEventListener("load", () => {
  $('head').append('<style>.gfga-opacity:hover {opacity: 0.8;}</style>')

  const questions: Array<GFQuestion> = [];
  $("div[role='list']").first().children("div[role='listitem']").each((_, el) => {
    const options: Array<GFOption> = $(el).find("label").toArray().map((e) => new GFOption(e));
    questions.push(new GFQuestion(el, options, port))
  });

  port.onMessage.addListener(async (message) => {
    const question = questions.find(q => q.id === message?.qId);
    if (question) {
      question.checkOption({
        'id':  message?.oId
      });
    }

    return true
  });
})