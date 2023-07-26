import { v4 as uuidv4 } from 'uuid';

export class GFOption {
    id: string;
    el: HTMLElement;

    constructor(el: HTMLElement) {
        this.id = uuidv4();
        this.el = el;
    }
}