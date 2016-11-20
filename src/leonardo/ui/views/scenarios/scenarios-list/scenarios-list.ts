/// <reference path="../../../../leonardo.d.ts" />
import Utils from '../../../ui-utils';
import Events from '../../../ui-events';

export default class ScenariosList {

  constructor() {
  }

  get() {
    return Utils.getElementFromHtml(`<div id="leonardo-scenarios-list" class="leonardo-scenarios-list"><div>Scenarios</div></div>`);
  }

  getViewNode() {
    return document.getElementById('leonardo-scenarios-list');
  }

  render() {
    const viewNode = this.getViewNode();
    const ul = Utils.getElementFromHtml(`<ul></ul>`);
    Leonardo.getScenarios().map((scenario) => {
      return Utils.getElementFromHtml(`<li>${scenario}</li>`);
    }).forEach((scenarioElm) => {
      ul.appendChild(scenarioElm);

    });
    viewNode.appendChild(ul);
  }


}
