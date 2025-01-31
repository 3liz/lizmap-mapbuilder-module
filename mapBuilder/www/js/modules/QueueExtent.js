/**
 * Class representing a queue structure for extents.
 * @property {Array} _element extent.
 * @property {number} _length length of the queue.
 * @property {number} _index Current index of the queue.
 */
export class QueueExtent {
    /**
     * Create a queue structure for extents
     * @param {object} options QueueExtent options.
     */
    constructor(options) {
        options = options ? options : {};

        this._index = 0;

        this.elements = options.element !== undefined ? [options.element] : [];
        this.maxLength = options.length !== undefined ? options.length : 10;
    }

    /**
     * Add an element to the queue.
     * @param {number[]} el The extent to add.
     * @returns {number} New length of the queue.
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
     * @returns {number[]} The first extent of the queue.
     */
    removeElement() {
        return this.elements.shift();
    }

    /**
     * Get the element at the given index.
     * @param {number} index The index of the element to get.
     * @returns {number[]} The extent at the given index.
     */
    getElementAt(index) {
        if (index === -1) {
            return this.elements[this.getLength() - 1];
        }
        return this.elements[index];
    }

    /**
     * Get the length of the queue.
     * @returns {number} Length of the queue.
     */
    getLength() {
        return this.elements.length;
    }

    /**
     * Check if two extent are equals.
     * @param {number[]} a First extent.
     * @param {number[]} b Second extent.
     * @returns {boolean} True if the two extent are equals.
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

    /**
     * Get the index of the current extent in the history.
     * @returns {number} Current index.
     */
    getIndex() {
        return this._index;
    }

    /**
     * Increase by 1 the index of the current extent in the history.
     */
    increaseIndex() {
        if (this.getIndex() < this.maxLength - 1){
            this._index++;
        }
    }

    /**
     * Decrease by 1 the index of the current extent in the history.
     */
    decreaseIndex() {
        this._index--;
    }
}
