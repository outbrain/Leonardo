/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';
import {UIViewState} from '../../ui-state/ui-state.model';
import DOMElement from '../../DOMElement';

export default class ViewsContainer extends DOMElement{

  currentViewState: UIViewState;

  constructor() {
    super(`<div id="leonardo-views-container" class="leonardo-views-container">view container</div>`);
    this.eventSubs.push(Events.on(Events.CHANGE_VIEW, this.onViewChanged.bind(this)));
  }

  render() {
    super.render();
    this.viewNode.appendChild(this.currentViewState.component.get());
    this.currentViewState.component.render();
  }

  setView(curView: UIViewState){
    this.currentViewState = curView;
  }

  onViewChanged(event: CustomEvent) {
    this.currentViewState.component.destroy();
    this.setView(this.currentViewState = event.detail);
    this.render();
  }
}
