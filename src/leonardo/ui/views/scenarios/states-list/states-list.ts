/// <reference path="../../../../leonardo.d.ts" />
import Utils from '../../../ui-utils';
import Events from '../../../ui-events';
import StateItem from './state-item/state-item';

export default class StatesList {

  constructor() {
  }

  get() {
    return Utils.getElementFromHtml(`<div id="leonardo-states-list" class="leonardo-states-list"></div>`);
  }

  getViewNode() {
    return document.getElementById('leonardo-states-list');
  }

  render() {
    const viewNode = this.getViewNode();
    Leonardo.getStates().map((state) => {
      return new StateItem(state);
    }).forEach((stateElm) => {
      viewNode.appendChild(stateElm.get());
      stateElm.render();
    });
  }


}
