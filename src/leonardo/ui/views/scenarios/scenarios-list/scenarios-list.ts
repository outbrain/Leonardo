/// <reference path="../../../../leonardo.d.ts" />
import Utils from '../../../ui-utils';
import Events from '../../../ui-events';
import DOMElement from '../../../DOMElement';

export default class ScenariosList extends DOMElement {

  static SELECTED_CLASS = 'leonardo-selected-scenario';

  constructor() {
    super(`<div id="leonardo-scenarios-list" class="leonardo-scenarios-list"></div>`);
    this.bodyEventsSubs.push(Events.on(Events.ADD_SCENARIO, this.addScenario.bind(this)));
  }

  render() {
    super.render();
    this.clearEventSubs();
    this.viewNode.appendChild(Utils.getElementFromHtml(`<div>Scenarios</div>`));
    const ul = Utils.getElementFromHtml(`<ul></ul>`);
    Leonardo.getScenarios()
      .map(this.getScenarioElement.bind(this))
      .forEach((scenarioElm) => {
        ul.appendChild(scenarioElm);
      });
    this.viewNode.appendChild(ul);

  }

  getScenarioElement(scenario) {
    const el = Utils.getElementFromHtml(`<li>${scenario}</li>`);
    this.onItem(el, 'click', this.setScenario.bind(this, scenario, el));
    return el;
  }

  private setScenario(scenario: string, el: HTMLElement) {
    const states: Array<any> = Leonardo.getScenario(scenario);
    Events.dispatch(Events.TOGGLE_STATES, false);
    states.forEach((state)=> {
      Events.dispatch(`${Events.TOGGLE_STATES}:${state.name}`, state.option);
    });
    Array.prototype.slice.call(this.viewNode.querySelectorAll('li'), 0)
      .forEach(li => li.classList.remove(ScenariosList.SELECTED_CLASS));
    el.classList.add(ScenariosList.SELECTED_CLASS);

  }

  private addScenario(event: CustomEvent) {
    this.render();
  }
}
