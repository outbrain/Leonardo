/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';

export default class Export {

  constructor() {
  }

  get() {
    return Utils.getElementFromHtml(`<div id="leonardo-export" class="leonardo-export">Export</div>`);
  }

  getViewNode() {
    return document.getElementById('leonardo-export');
  }

  render() {

  }

}
