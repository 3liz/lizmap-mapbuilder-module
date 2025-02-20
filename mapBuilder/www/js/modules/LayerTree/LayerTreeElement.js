/**
 *  Class representing a node in a Layer Tree.
 * @property {string} _title Branch title.
 * @property {Array} _bbox Bbox.
 * @property {boolean} _popup Popup.
 * @property {string} _project Project id.
 * @property {string} _projectName Project name.
 * @property {string} _repository Repository id.
 * @property {string} _color Color of the layer in the CSS sheet.
 * @property {boolean} _visible Visibility of the layer for filtering.
 */
export class LayerTreeElement {
    /**
     * Create a node.
     * @param {object} options LayerTreeElement options.
     */
    constructor(options) {
        this._title = options.title;

        this._bbox = options.bbox !== undefined ? options.bbox : undefined;

        this._popup = options.popup !== undefined ? options.popup : undefined;

        this._project = options.project !== undefined ? options.project : undefined;

        this._projectName = options.projectName !== undefined ? options.projectName : undefined;

        this._repository = options.repository !== undefined ? options.repository : undefined;

        this._color = options.color !== undefined ? options.color : undefined;

        if (this._color === undefined) {
            this._color = this.generateColor();
        }

        this._visible = true;
    }

    /**
     * Used to generate a light color using the RGB pattern.
     * We use only values between 210 -> 245 to get light colors.
     * @returns {string} Color with RGB pattern : "rgb(x x x)".
     */
    generateColor() {
        /**
         * Get a random integer between min and max.
         * @param {number} [min] Minimum value.
         * @param {number} [max] Maximum value.
         * @returns {number} Random integer between min and max.
         */
        function getRandInteger(min, max) {
            return Math.floor(Math.random() * (max + 1 - min)) + min;
        }

        let listValue = [
            getRandInteger(210, 255),
            getRandInteger(210, 255),
            getRandInteger(210, 255)
        ]

        let min = Math.min(...listValue);
        listValue[listValue.indexOf(min)] = 210;

        let max = Math.max(...listValue);
        listValue[listValue.indexOf(max)] = 255;

        return `rgb(${listValue[0]} ${listValue[1]} ${listValue[2]})`;
    }

    /**
     * Get the color of the layer with a darker shade.
     * @returns {string} Color "rgb(200, 223, 235)".
     */
    getHoverColor() {
        let colorString = this.getColor().split(" ");
        let colorValues = [
            colorString[0].split("(")[1],
            colorString[1],
            colorString[2].split(")")[0]
        ];

        for (let i = 0; i < 3; i++) {
            colorValues[i] = parseInt(colorValues[i]) - 10;
        }
        return `rgb(${colorValues[0]} ${colorValues[1]} ${colorValues[2]})`;
    }

    /**
     * Get the title of the branch.
     * @returns {string} Branch title.
     */
    getTitle() {
        return this._title;
    }

    /**
     * Get the bbox.
     * @returns {Array} Bbox.
     */
    getBbox() {
        return this._bbox;
    }

    /**
     * Get the popup.
     * @returns {boolean} Popup.
     */
    getPopup() {
        return this._popup;
    }

    /**
     * Get the project id.
     * @returns {string} Project id.
     */
    getProject() {
        return this._project;
    }

    /**
     * Get the project name.
     * @returns {string} Project name.
     */
    getProjectName() {
        return this._projectName;
    }

    /**
     * Get the repository id.
     * @returns {string} Repository id.
     */
    getRepository() {
        return this._repository;
    }

    /**
     * Get the color of the layer.
     * @returns {string} Color "rgb(210, 233, 245)".
     */
    getColor() {
        return this._color;
    }

    /**
     * Get the visibility of the layer.
     * @returns {boolean} Visibility of the layer.
     */
    isVisible() {
        return this._visible;
    }

    /**
     * Set the visibility of the layer.
     * @param {boolean} visible Visibility of the layer.
     */
    setVisible(visible) {
        this._visible = visible;
    }
}
