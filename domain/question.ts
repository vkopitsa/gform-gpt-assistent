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

        const that = this;
        this.options.forEach((o) => {
            const cb = () => setTimeout(() => { that.onClickToOption.bind(this)(o) }, 50);
            $(o.el).off("click").on("click", cb); // fix 2 times
        });
    };

    onClickToOption (option: GFOption, type: string = "checked"): void {
        // chrome.runtime.sendMessage(chrome.runtime.id, this.toJson(), this.checkOption.bind(this));

        const checked = $("div[role='radio'], div[role='checkbox']", option.el).attr('aria-checked');
        const role = $("div[role='radio'], div[role='checkbox']", option.el).attr('role');
        
        if (role === "radio") {
            this.options.forEach((o) => o[type] = false);
        }
        option[type] = checked === 'true';

        // console.log(this.options, type);

        // this.onClickToQuestion();

        chrome.runtime.sendMessage(chrome.runtime.id, this.toJson(), ()=>{});
    };

    checkOption (res: Object|undefined): void {
        const correctOption = this.options.find(o => o.id === res?.['id']);
        if (correctOption) {
            const el = $(correctOption.el);

            this.onClickToOption(correctOption, res['AIChecked'] ? "AIChecked" : "checked")            

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
                    'AIChecked': o.AIChecked,
                    'checked': o.checked,
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