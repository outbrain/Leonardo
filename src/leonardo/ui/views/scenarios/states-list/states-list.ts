/// <reference path="../../../../leonardo.d.ts" />
import Utils from '../../../ui-utils';
import Events from '../../../ui-events';
import StateItem from './state-item/state-item';
import StatesBar from './states-bar/states-bar';
import StateDetail from './state-detail/states-detail';
import DOMElement from '../../../DOMElement';
import {EventSub} from '../../../ui-events';

export default class StatesList extends DOMElement {
  statesBar = new StatesBar();
  stateDetail = new StateDetail(this.onStateDetailSave.bind(this), this.clearSelected.bind(this));
  statesElements: StateItem[] = [];
  bodyEventSubs: Array<EventSub> = [];

  constructor() {
    super(`<div id="leonardo-states-list" class="leonardo-states-list"></div>`);
    this.bodyEventSubs.push(Events.on(Events.FILTER_STATES, this.onFilterStates.bind(this)));
    this.bodyEventSubs.push(Events.on(Events.ADD_SCENARIO, this.addScenario.bind(this)));
  }

  render() {
    super.render();
    this.clearEventSubs();
    this.viewNode.appendChild(this.statesBar.get());
    this.viewNode.appendChild(this.stateDetail.get());
    this.statesElements.length = 0;
    Leonardo.getStates()
      .map((state) => new StateItem(state, this.removeStateByName.bind(this)))
      .forEach((stateElm) => {
        this.statesElements.push(stateElm);
        this.viewNode.appendChild(stateElm.get());
        this.onItem(stateElm.get(), 'click', this.toggleDetail.bind(this, stateElm));
        stateElm.render();
      });
    this.statesBar.render();
  }

  onFilterStates(data: CustomEvent) {
    this.statesElements.forEach((stateElm: StateItem) => {
      if (stateElm.getName().toLowerCase().indexOf(data.detail.val.toLowerCase()) >= 0) {
        stateElm.toggleVisible(true);
      } else {
        stateElm.toggleVisible(false);
      }
    });
  }

  removeStateByName(stateName: string, stateView: HTMLElement) {
    this.statesElements = this.statesElements.filter((state) => {
      return state.getName() === stateName;
    });
    this.viewNode.removeChild(stateView);
  }

  private toggleDetail(stateElm: StateItem, event: Event) {
    event.stopPropagation();
    const open: boolean = stateElm.get().classList.contains('leonardo-state-item-detailed');
    this.clearSelected();
    if(!open){
      stateElm.get().classList.add('leonardo-state-item-detailed');
    }

    this.stateDetail.toggle(stateElm.getState());
  }

  private clearSelected(){
    this.statesElements.forEach((curState) => {
      curState.get().classList.remove('leonardo-state-item-detailed');
    });
  }

  private onStateDetailSave(){
    this.clearSelected();
  }

  private addScenario(event: CustomEvent) {
    const states: Array<any> = this.statesElements.map((stateElem: StateItem) => {
      return stateElem.getState();
    }).filter((state) => state.active)
      .map((state: any) => {
        return {
          name: state.name,
          option: state.activeOption.name
        }
      });
    Leonardo.addScenario({
      name: event.detail,
      states: states,
      from_local: true
    }, true);
  }
  
  destroy(){
    this.clearSetEventSubs(this.bodyEventSubs);
  }

}
