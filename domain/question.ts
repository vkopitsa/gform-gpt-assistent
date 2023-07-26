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

        $("div[role='heading']", this.el).on("click", this.onClickToQuestion.bind(this));
    };

    onClickToQuestion (): void {
        chrome.runtime.sendMessage(chrome.runtime.id, this.toJson(), this.checkOption.bind(this));
    };

    checkOption (res: Object): void {
        const correctOption = this.options.find(o => o.id === res['option']?.['id']);
        if (correctOption) {
            const el = $(correctOption.el);
            // TODO: debug
            // el.css('background-color', 'red');
            el.trigger("click");
        }
    };

    toJson(): string {
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
    };
}