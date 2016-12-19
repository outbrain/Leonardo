/// <reference path="../../../leonardo.d.ts" />
import Utils from '../../ui-utils';
import Events from '../../ui-events';
import StatesList from './states-list/states-list';
import ScenariosList from './scenarios-list/scenarios-list';
import DOMElement from '../../DOMElement';

export default class Scenarios extends DOMElement{

  stateList: StatesList;
  scenariosList: ScenariosList;

  constructor() {
    super(`<div id="leonardo-scenarios" class="leonardo-scenarios"></div>`);
    this.stateList = new StatesList();
    this.scenariosList = new ScenariosList();
    this.viewNode.appendChild(this.scenariosList.get());
    this.viewNode.appendChild(this.stateList.get());
  }

  render() {
    this.stateList.render();
    this.scenariosList.render();
  }

  // Override base so we dont clear viewNode
  destroy() {

  }
}
