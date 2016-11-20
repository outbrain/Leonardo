/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';
import {UIViewState} from '../ui-state/ui-state.model';

export default class ViewsContainer {

  constructor() {
    Events.on(Events.CHANGE_VIEW, this.onViewChanged.bind(this));
  }

  get() {
    return Utils.getElementFromHtml(`<div id="leonardo-views-container" class="leonardo-views-container">view container</div>`);
  }

  getViewNode() {
    return document.getElementById('leonardo-views-container');
  }

  render(viewState: UIViewState) {
    this.getViewNode().innerHTML = '';
    this.getViewNode().appendChild(viewState.component.get());
    viewState.component.render();
  }

  onViewChanged(event: CustomEvent) {
    this.render(event.detail);
  }

}
