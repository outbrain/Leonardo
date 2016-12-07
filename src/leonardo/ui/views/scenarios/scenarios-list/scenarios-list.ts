/// <reference path="../../../../leonardo.d.ts" />
import Utils from '../../../ui-utils';
import Events from '../../../ui-events';

export default class ScenariosList {

  viewNode: any;
  setScenarioBinded: EventListener = this.setScenario.bind(this);
  static SELECTED_CLASS = 'leonardo-selected-scenario';

  constructor() {
    this.viewNode = Utils.getElementFromHtml(`<div id="leonardo-scenarios-list" class="leonardo-scenarios-list"></div>`);
    this.viewNode.addEventListener('click', this.setScenarioBinded, false);
    Events.on(Events.ADD_SCENARIO, this.addScenario.bind(this));
  }

  get() {
    return this.viewNode;
  }

  render() {
    this.viewNode.innerHTML = '';
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
    el.addEventListener('click', () => {
      Events.dispatch(Events.SCENARIO_CLICKED, {name: scenario});
      this.viewNode.querySelectorAll('li').forEach(li => li.classList.remove(ScenariosList.SELECTED_CLASS));
      el.classList.add(ScenariosList.SELECTED_CLASS);
    });
    return el;
  }

  private setScenario(event: MouseEvent) {
    if (event.target['tagName'] !== 'LI') {
      return;
    }

    const scenarioName: string = event.target['innerHTML'];
    const states: Array<any> = Leonardo.getScenario(scenarioName);
    Events.dispatch(Events.TOGGLE_STATES, false);
    states.forEach((state)=> {
      Events.dispatch(`${Events.TOGGLE_STATES}:${state.name}`, state.option);
    });
  }

  onDestroy() {
    this.viewNode.removeEventListener('click', this.setScenarioBinded, false);
  }

  private addScenario(event: CustomEvent) {
    this.render();
  }
}
