import { GFOption } from "domain/option";
import $ from "jquery";
import { Storage } from "@plasmohq/storage";
import { nanoid } from 'domain/uuid';
import { CHOOSE_EVENT, OPACITY_EVENT, RED_BACKGROUND_EVENT } from 'options';


const storage = new Storage();


export class GFQuestion {
    id: string;
    el: HTMLElement;
    options: Array<GFOption>;
    event: string;

    constructor(el: HTMLElement, options: Array<GFOption>) {
        this.id = nanoid();
        this.el = el;
        this.options = options;

        // setup event on answer
        storage.get("event").then(event => {
            this.event = event ? event : CHOOSE_EVENT
        });
        storage.watch({
            "event": (c) => this.event = c.newValue,
        })

        $("div[role='heading'], img", this.el).on("click", this.onClickToQuestion.bind(this));
    };

    onClickToQuestion (): void {
        chrome.runtime.sendMessage(chrome.runtime.id, this.toJson(), this.checkOption.bind(this));
    };

    checkOption (res: Object): void {
        const correctOption = this.options.find(o => o.id === res['option']?.['id']);
        if (correctOption) {
            const el = $(correctOption.el);

            switch (this.event) {
                case CHOOSE_EVENT:
                    el.trigger("click");

                    break;
                case OPACITY_EVENT:
                    el.addClass('fsdfsdfsfd');

                    break;
                case RED_BACKGROUND_EVENT:
                    el.css('background-color', 'red');

                    break;
                default:
                    break;
            }
        }
    };

    toJson(): string {
        const img = this.getImage();
        return JSON.stringify({
            'id': this.id,
            'text': $("div[role='heading']", this.el).text(),
            'img': img ? {
                'alt': img.attr('alt'),
                'title': img.attr('title'),
                'src': img.attr('src'),
            } : null,
            'items': this.options.map((o) => {
                return {
                    'id': o.id,
                    'text': $("span", o.el).text(),
                }
            })
        });
    };

    getImage(): JQuery<HTMLElement>|null {
        const img: JQuery<HTMLElement> = $("img", this.el)
        return img.length > 0 ? img : null;
    };
}