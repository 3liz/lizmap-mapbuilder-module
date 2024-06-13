/**
 * Class representing a slider for the layer opacity
 * @property {string} [style] thumb style
 * @property {ImageLayer} [layer] layer
 */
export class Slider extends HTMLElement {
  constructor(style, layer) {
    super();

    const div = document.createElement('div');
    div.setAttribute('id', 'slider');
    div.setAttribute('class', 'slider');

    const inDiv= document.createElement('div');
    inDiv.setAttribute('class', 'thumb');
    inDiv.setAttribute('style', style);

    div.addEventListener("click", (event) => {
      if (event.target.className === "slider") {
        let newLeft = event.clientX - div.getBoundingClientRect().left - 5;

        newLeft = adjustThumb(newLeft);

        inDiv.style.left = newLeft + 'px';
        layer.setOpacity(newLeft / (div.offsetWidth - 10));
      }
    });

    inDiv.addEventListener("mousedown", (event) => {

      event.preventDefault();

      let shiftX = event.clientX - inDiv.getBoundingClientRect().left;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      /**
       * Control movement of the thumb
       * @param {PointerEvent} [event] event
       */
      function onMouseMove(event) {
        let newLeft = event.clientX - shiftX - div.getBoundingClientRect().left;

        newLeft = adjustThumb(newLeft);

        inDiv.style.left = newLeft + 'px';
        layer.setOpacity(newLeft / (div.offsetWidth - 10));
      }

      /**
       * Remove event listeners when user release the thumb
       */
      function onMouseUp() {
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
      }

    });

    inDiv.addEventListener("dragstart", () => {
      return false;
    })

    div.appendChild(inDiv);
    this.appendChild(div);

    /**
     * Adjust the thumb movement by checking if it is not out of the slider
     * @param {number} [newLeft] position of the thumb on the slider
     * @return {number}
     */
    function adjustThumb(newLeft) {
      if (newLeft < 0) {
        newLeft = 0;
      }
      let rightEdge = div.offsetWidth - inDiv.offsetWidth;
      if (newLeft > rightEdge) {
        newLeft = rightEdge;
      }

      return newLeft;
    }

  }
}

customElements.define('custom-slider', Slider);