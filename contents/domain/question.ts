import { GFOption } from "~contents/domain/option";
import $ from "jquery";
import { Storage } from "@plasmohq/storage";
import { nanoid, debounce } from '~tools';
import { CHOOSE_EVENT, OPACITY_EVENT, RED_BACKGROUND_EVENT } from "configs";


const storage = new Storage();

export class GFQuestion {
    id: string;
    el: HTMLElement;
    options: Array<GFOption>;
    event: string;
    port: chrome.runtime.Port;

    constructor(el: HTMLElement, options: Array<GFOption>, port: chrome.runtime.Port) {
        this.id = nanoid();
        this.el = el;
        this.options = options;
        this.port = port;

        // setup event on answer
        storage.get("event").then(event => {
            this.event = event ? event : CHOOSE_EVENT
        });
        storage.watch({
            "event": (c) => this.event = c.newValue,
        })

        const onClick = debounce(this.onClickToQuestion.bind(this));
        $("div[role='heading'], img", this.el).on("click", onClick);
    };

    onClickToQuestion (): void {
        const that = this;
        this.options.forEach((o) => {
            const onClick = debounce(() => { that.onClickToOption.bind(that)(o) });
            $(o.el).on("click", onClick);
        });

        this.port.postMessage({ data: that.toJson() });
    };

    onClickToOption (option: GFOption, type: string = "checked"): void {
        this.selectedOption(option, type);

        this.port.postMessage({ change: true, data: this.toJson() });
    };

    selectedOption (option: GFOption, type: string = "checked"): void {
        const checked = $("div[role='radio'], div[role='checkbox']", option.el).attr('aria-checked');
        const role = $("div[role='radio'], div[role='checkbox']", option.el).attr('role');
        
        if (role === "radio") {
            this.options.forEach((o) => o[type] = false);
        }
        option[type] = checked === 'true';
    };

    checkOption (res: Object|undefined): void {
        const correctOption = this.options.find(o => o.id === res?.['id']);
        if (correctOption) {
            const el = $(correctOption.el);

            // this.onClickToOption(correctOption, res['AIChecked'] ? "AIChecked" : "checked");
            this.selectedOption(correctOption, res['AIChecked'] ? "AIChecked" : "checked");         

            switch (this.event) {
                case CHOOSE_EVENT:
                    el.trigger("click");

                    break;
                case OPACITY_EVENT:
                    el.addClass('gfga-opacity');

                    break;
                case RED_BACKGROUND_EVENT:
                    el.css('background-color', 'red');

                    break;
                default:
                    break;
            }
        }
    };

    toJson(): object {
        const img = this.getImage();
        return {
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
        };
    };

    getImage(): JQuery<HTMLElement>|null {
        const img: JQuery<HTMLElement> = $("img", this.el)
        return img.length > 0 ? img : null;
    };
}