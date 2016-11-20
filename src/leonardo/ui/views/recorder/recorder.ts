/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';

export default class Recorder {

  constructor() {
  }

  get() {
    return Utils.getElementFromHtml(`<div id="leonardo-recorder" class="leonardo-recorder">Recorder</div>`);
  }

  getViewNode() {
    return document.getElementById('leonardo-recorder');
  }

  render() {

  }

}
