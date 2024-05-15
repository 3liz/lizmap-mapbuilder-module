/**
 * @typedef {Object} Options
 * @property {array} [element] extent.
 * @property {number} [length] length of the queue.
 */
export class QueueExtent {
    constructor(options) {
        options = options ? options : {};

        this.elements = options.element !== undefined ? [options.element] : [];
        this.maxLength = options.length !== undefined ? options.length : 10;
    }

    addElement(el) {
        if (this.isEqual(el, this.getElementAt(-1))) {
            return false;
        }
        if (this.elements.length >= this.maxLength) {
            this.removeElement();
        }
        return this.elements.push(el);
    }

    removeElement() {
        return this.elements.shift();
    }

    getElementAt(index) {
        if (index === -1) {
            return this.elements[this.getLength() - 1];
        }
        return this.elements[index];
    }

    getLength() {
        return this.elements.length;
    }

    isEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    deleteAllAfter(index) {
        let delta = this.getLength() - index;

        for (let i = 1; i < delta; i++) {
            this.elements.pop();
        }
    }
}