/** Class representing a queue structure for extents. */
export class QueueExtent {
    /**
     * @param {Options|{}} options QueueExtent options.
     * @property {array} [element] extent.
     * @property {number} [length] length of the queue.
     */
    constructor(options) {
        options = options ? options : {};

        this.elements = options.element !== undefined ? [options.element] : [];
        this.maxLength = options.length !== undefined ? options.length : 10;
    }

    /**
     * Add an element to the queue.
     * @param {number[]} el The extent to add.
     * @return {number} New length of the queue.
     */
    addElement(el) {
        if (this.isEqual(el, this.getElementAt(-1))) {
            return false;
        }
        if (this.elements.length >= this.maxLength) {
            this.removeElement();
        }
        return this.elements.push(el);
    }

    /**
     * Remove the first element of the queue.
     * @return {number[]} The first extent of the queue.
     */
    removeElement() {
        return this.elements.shift();
    }

    /**
     * Get the element at the given index.
     * @param {number} index The index of the element to get.
     * @return {number[]} The extent at the given index.
     */
    getElementAt(index) {
        if (index === -1) {
            return this.elements[this.getLength() - 1];
        }
        return this.elements[index];
    }

    /**
     * Get the length of the queue.
     * @return {number} Length of the queue.
     */
    getLength() {
        return this.elements.length;
    }

    /**
     * Check if two extent are equals.
     * @param {number[]} a First extent.
     * @param {number[]} b Second extent.
     * @return {boolean} True if the two extent are equals.
     */
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

    /**
     * Delete all elements after the given index.
     * @param {number} index The index after which to delete all elements.
     */
    deleteAllAfter(index) {
        let delta = this.getLength() - index;

        for (let i = 1; i < delta; i++) {
            this.elements.pop();
        }
    }
}