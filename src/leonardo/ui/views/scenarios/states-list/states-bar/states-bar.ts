/// <reference path="../../../../../leonardo.d.ts" />
import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';
import AddScenario from './state-add-scenario/state-add-scenario';
import DOMElement from '../../../../DOMElement';

export default class StatesBar extends DOMElement{
  activeAllState: boolean = false;
  addScenario: AddScenario = new AddScenario();
  curSearchData: string = '';


  constructor() {
    super(`<div class="leonardo-states-bar"></div>`);
  }

  render() {
    super.render();
    this.clearEventSubs();
    this.viewNode.innerHTML = `
        <input value="${this.curSearchData}" class="leonardo-search-state" name="leonardo-search-state" type="text" placeholder="Search..." />
        <div>
          <span class="leonardo-button leonardo-activate-all">Activate All</span>
          <span class="leonardo-button leonardo-add-scenario-btn">Add Scenario</span>
          <span class="leonardo-button leonardo-reset-states-btn">Reset States</span>
        </div>`;
    this.viewNode.appendChild(this.addScenario.get());
    this.addScenario.render();
    this.onItem(<HTMLElement>this.viewNode.querySelector('.leonardo-search-state'), 'keyup', this.searchStates.bind(this));
    this.onItem(<HTMLElement>this.viewNode.querySelector('.leonardo-activate-all'), 'click', this.toggleActivateAll.bind(this));
    this.onItem(<HTMLElement>this.viewNode.querySelector('.leonardo-add-scenario-btn'), 'click', this.onAddScenario.bind(this));
    this.onItem(<HTMLElement>this.viewNode.querySelector('.leonardo-reset-states-btn'), 'click', this.resetStates.bind(this));
    this.searchStates({target: {value: this.curSearchData}});
  }

  searchStates(evt) {
    this.curSearchData = evt.target.value;
    Events.dispatch(Events.FILTER_STATES, {val: this.curSearchData});
  }

  toggleActivateAll() {
    this.activeAllState = !this.activeAllState;
    Leonardo.toggleActivateAll(this.activeAllState);
    Events.dispatch(Events.TOGGLE_STATES, this.activeAllState);
    this.viewNode.querySelector('.leonardo-activate-all')['innerHTML'] = this.activeAllState ? 'Deactivate all' : 'Activate all';
  }

  onAddScenario() {
    this.addScenario.open();
  }

  resetStates() {
    if (window.confirm('Are you sure you want to reset states?')) {
      console.log('arrived here');
      Leonardo.storage.removeStates();
      Events.dispatch(Events.RESET_STATE);
      Leonardo.storage.setSavedStates([]);
    }
  }

}
