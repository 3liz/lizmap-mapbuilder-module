/**
 * Class used to create a custom progress bar for inkmap
 * @typedef {object} HTMLElement
 * @typedef {object} HTMLDivElement
 * @augments HTMLElement
 * @property {HTMLDivElement} progressBar The progress bar
 */
export class CustomProgress extends HTMLElement {
    constructor() {
        super();

        const div = document.createElement('div');
        div.setAttribute('class', 'progress mt-1');
        div.setAttribute('style', 'height: 5px; visibility: visible;');

        this.progressBar = document.createElement('div');
        this.progressBar.setAttribute('class', 'progress-bar bg-primary');
        this.progressBar.setAttribute('style', 'width: 0%;');
        this.progressBar.setAttribute('role', 'progressbar');
        this.progressBar.setAttribute('aria-valuemin', '0');
        this.progressBar.setAttribute('aria-valuemax', '100');

        div.appendChild(this.progressBar);
        this.appendChild(div);
    }

    /**
     * Set the length of the progress bar
     * @param {number} length The length of the progress bar
     */
    setLengthBar(length) {
        this.progressBar.setAttribute('style', `width: ${length * 100}%;`);
    }

    /**
     * Set the progress bar to the success state
     */
    setSuccesState() {
        this.progressBar.setAttribute('class', 'progress-bar bg-success');
    }

}

customElements.define('custom-progress', CustomProgress);
