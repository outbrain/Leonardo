/// <reference path="../../../../../leonardo.d.ts" />
import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';

export default class StatesBar {
  viewNode: any;

  constructor() {
    this.viewNode = Utils.getElementFromHtml(`<div class="leonardo-states-bar"></div>`);
  }

  get() {
    return this.viewNode;
  }

  render() {
    this.viewNode.innerHTML = `
        <input class="leonardo-search-state" name="leonardo-search-state" type="text" placeholder="Search..." />
        <div>
          <span class="leonardo-button leonardo-activate-all">Activate All</span>
          <span class="leonardo-button leonardo-add-scenario">Add Scenario</span>
        </div>`;

    this.viewNode.querySelector('input').addEventListener('keyup', this.searchStates.bind(this));
  }

  searchStates(evt) {
    Events.dispatch(Events.FILTER_STATES, { val: evt.target.value });
  }

}
