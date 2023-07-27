import { nanoid } from 'domain/uuid';

export class GFOption {
    id: string;
    el: HTMLElement;

    constructor(el: HTMLElement) {
        this.id = nanoid();
        this.el = el;
    }
}