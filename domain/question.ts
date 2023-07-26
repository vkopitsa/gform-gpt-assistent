import { GFOption } from "~domain/option";
import $ from "jquery"
import { v4 as uuidv4 } from 'uuid';

export class GFQuestion {
    id: string;
    el: HTMLElement;
    options: Array<GFOption>;

    constructor(el: HTMLElement, options: Array<GFOption>) {
        this.id = uuidv4();
        this.el = el;
        this.options = options;

        const that = this;

        $("div[role='heading']", this.el).on("click", function(){ 
            chrome.runtime.sendMessage(chrome.runtime.id, that.json(), res => {
                const correctOption = options.find(o => {
                    return o.id === res['option']['id'];
                });

                if (correctOption) {
                    $(correctOption.el).css('background-color', 'red');
                }
            }); 
        });
    }

    json(): string {
        return JSON.stringify({
            'id': this.id,
            'text': $("div[role='heading']", this.el).text(),
            'items': this.options.map((o) => {
                return {
                    'id': o.id,
                    'text': $("span", o.el).text(),
                }
            })
        });
    }
}