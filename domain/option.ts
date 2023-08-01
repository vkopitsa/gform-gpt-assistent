import { nanoid } from 'domain/uuid';
import $ from "jquery";

export class GFOption {
    id: string;
    el: HTMLElement;
    AIChecked: boolean = false;
    checked: boolean = false;

    constructor(el: HTMLElement) {
        this.id = nanoid();
        this.el = el;
    }
}