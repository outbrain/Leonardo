/// <reference path="../../../../../leonardo.d.ts" />
import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';

export default class StateItem {

  viewNode: HTMLElement;

  constructor(private state) {
    this.viewNode = Utils.getElementFromHtml(`<div class="leonardo-state-item"></div>`);
  }

  get() {
    return this.viewNode;
  }

  render() {
    this.viewNode.innerHTML = this.state.name;
  }
}
