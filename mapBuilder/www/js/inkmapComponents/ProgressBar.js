// Définir la classe de l'élément custom-progress
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

    setLengthBar(length) {
        this.progressBar.setAttribute('style', `width: ${length * 100}%;`);
    }

    setSuccesState() {
        this.progressBar.setAttribute('class', 'progress-bar bg-success');
    }

}

// Déclarer l'élément custom-progress
customElements.define('custom-progress', CustomProgress);
