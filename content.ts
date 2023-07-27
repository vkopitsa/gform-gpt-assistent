import type { PlasmoCSConfig } from "plasmo";
import $ from "jquery";
import { GFOption } from "domain/option";
import { GFQuestion } from "domain/question";


export const config: PlasmoCSConfig = {
  matches: ["https://docs.google.com/forms/*"],
  all_frames: true
}

$('head').append('<style>.fsdfsdfsfd:hover {opacity: 0.8;}</style>')

const questions: Array<GFQuestion> = [];
$("div[role='list']").first().children("div[role='listitem']").each((_, el) => {
  const options: Array<GFOption> = $(el).find("label").toArray().map((e) => new GFOption(e));
  questions.push(new GFQuestion(el, options))
});

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  const question = questions.find(q => q.id === message?.qId);
  if (question) {
    question.checkOption({ 'id': message?.qId,'option': { 'id':  message?.oId} })
  }

  return true
});