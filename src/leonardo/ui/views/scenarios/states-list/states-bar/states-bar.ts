/// <reference path="../../../../../leonardo.d.ts" />
import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';
import AddScenario from './state-add-scenario/state-add-scenario';

export default class StatesBar {
  viewNode: any;
  searchBinded: EventListener = this.searchStates.bind(this);
  activateAllBinded: EventListener = this.toggleActivateAll.bind(this);
  addScenarioBinded: EventListener = this.onAddScenario.bind(this);
  activeAllState: boolean = false;
  addScenario: AddScenario = new AddScenario();
  constructor() {
    this.viewNode = Utils.getElementFromHtml(`<div class="leonardo-states-bar"></div>`);
  }

  get() {
    return this.viewNode;
  }

  render() {
    if(this.viewNode.innerHTML){
      this.viewNode.querySelector('.leonardo-search-state').removeEventListener('keyup', this.searchBinded, false);
      this.viewNode.querySelector('.leonardo-activate-all').removeEventListener('click', this.activateAllBinded, false);
      this.viewNode.querySelector('.leonardo-add-scenario-btn').removeEventListener('click', this.addScenarioBinded, false);
    }
    this.viewNode.innerHTML = `
        <input class="leonardo-search-state" name="leonardo-search-state" type="text" placeholder="Search..." />
        <div>
          <span class="leonardo-button leonardo-activate-all">Activate All</span>
          <span class="leonardo-button leonardo-add-scenario-btn">Add Scenario</span>
        </div>`;
    this.viewNode.appendChild(this.addScenario.get());
    this.addScenario.render();
    this.viewNode.querySelector('.leonardo-search-state').addEventListener('keyup', this.searchBinded, false);
    this.viewNode.querySelector('.leonardo-activate-all').addEventListener('click', this.activateAllBinded, false);
    this.viewNode.querySelector('.leonardo-add-scenario-btn').addEventListener('click', this.addScenarioBinded, false);
  }

  searchStates(evt) {
    Events.dispatch(Events.FILTER_STATES, { val: evt.target.value });
  }

  toggleActivateAll() {
    this.activeAllState = !this.activeAllState;
    Leonardo.toggleActivateAll(this.activeAllState);
    Events.dispatch(Events.TOGGLE_STATES, this.activeAllState);
    this.viewNode.querySelector('.leonardo-activate-all').innerHTML = this.activeAllState ? 'Deactivate all' : 'Activate all';
  }

  onAddScenario(){
    this.addScenario.open();
  }

  onDestroy(){
    this.viewNode.querySelector('.leonardo-search-state').removeEventListener('keyup', this.searchBinded, false);
  }

}
