/// <reference path="../../../../leonardo.d.ts" />
import Utils from '../../../ui-utils';
import Events from '../../../ui-events';
import StateItem from './state-item/state-item';
import StatesBar from './states-bar/states-bar';

export default class StatesList {
  viewNode: any;
  statesBar = new StatesBar();
  statesElements: StateItem[] = [];

  constructor() {
    this.viewNode = Utils.getElementFromHtml(`<div id="leonardo-states-list" class="leonardo-states-list"></div>`);
    Events.on(Events.FILTER_STATES, this.onFilterStates.bind(this))
  }

  get() {
    return this.viewNode;
  }

  render() {
    this.viewNode.innerHTML = '';
    this.viewNode.appendChild(this.statesBar.get());
    this.statesElements.length = 0;
    Leonardo.getStates()
      .map((state) => new StateItem(state))
      .forEach((stateElm) => {
        this.statesElements.push(stateElm);
        this.viewNode.appendChild(stateElm.get());
        stateElm.render();
      });
    this.statesBar.render();
  }

  onFilterStates(data) {
    this.statesElements.forEach((stateElm: StateItem) => {
      if (stateElm.getName().toLowerCase().indexOf(data.detail.val.toLowerCase()) >= 0) {
        stateElm.toggleVisible(true);
      } else {
        stateElm.toggleVisible(false);
      }
    });
  }
}
