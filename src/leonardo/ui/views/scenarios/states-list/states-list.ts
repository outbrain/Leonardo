/// <reference path="../../../../leonardo.d.ts" />
import Utils from '../../../ui-utils';
import Events from '../../../ui-events';
import StateItem from './state-item/state-item';
import StatesBar from './states-bar/states-bar';

export default class StatesList {
  viewNode: any;
  statesBar = new StatesBar();

  constructor() {
    this.viewNode = Utils.getElementFromHtml(`<div id="leonardo-states-list" class="leonardo-states-list"></div>`);
  }

  get() {
    return this.viewNode;
  }

  render() {
    this.viewNode.innerHTML = '';
    this.viewNode.appendChild(this.statesBar.get());
    Leonardo.getStates().map((state) => {
      return new StateItem(state);
    }).forEach((stateElm) => {
      this.viewNode.appendChild(stateElm.get());
      stateElm.render();
    });
    this.statesBar.render();
  }
}
