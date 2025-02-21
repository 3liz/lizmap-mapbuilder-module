import {LayerTreeFolder} from "./LayerTreeFolder";

export class LayerTreeProject extends LayerTreeFolder {

  constructor(options) {
    super({
      title: options.title,
      popup: options.popup,
      bbox: options.bbox,
      project: options.project,
      repository: options.repository,
      color: options.color
    });

    this._lazy = options.lazy !== undefined ? options.lazy : undefined;

    this._loading = false;

    this._failed = false;
  }

  /**
   * Get the status of the folder.
   * @returns {boolean} Status of the folder.
   */
  isLazy() {
    return !!this._lazy;
  }

  /**
   * Set the lazy status of the folder.
   * @param {boolean} value New lazy status.
   */
  setLazy(value) {
    this._lazy = value;
  }

  /**
   * Get the loading state of the folder.
   * @returns {boolean} Loading state.
   */
  isLoading() {
    return this._loading;
  }

  /**
   * Set the loading state of the folder.
   * @param {boolean} value New loading state.
   */
  setLoading(value) {
    this._loading = value;
  }

  /**
   * Get the failed state of the folder.
   * @returns {boolean} Failed state.
   */
  isFailed() {
    return this._failed;
  }

  /**
   * Set the failed state of the folder to "true".
   */
  setFailed() {
    this._failed = true;
  }
}
