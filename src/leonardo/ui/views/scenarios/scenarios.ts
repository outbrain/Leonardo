/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';
import StatesList from './states-list/states-list';
import ScenariosList from './scenarios-list/scenarios-list';

export default class Scenarios {

  stateList: StatesList = new StatesList();
  scenariosList: ScenariosList = new ScenariosList();
  constructor() {

  }

  get() {
    const el = Utils.getElementFromHtml(`<div id="leonardo-scenarios" class="leonardo-scenarios"></div>`);
    el.appendChild(this.scenariosList.get());
    el.appendChild(this.stateList.get());
    return el;
  }

  getViewNode() {
    return document.getElementById('leonardo-scenarios');
  }

  render() {
    this.stateList.render();
    this.scenariosList.render();
  }
}
