/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';
import StatesList from './states-list/states-list';
import ScenariosList from './scenarios-list/scenarios-list';

export default class Scenarios {

  stateList: StatesList;
  scenariosList: ScenariosList;
  constructor() {
    this.stateList = new StatesList();
    this.scenariosList = new ScenariosList();
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
