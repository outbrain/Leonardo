/// <reference path="../../../../../../leonardo.d.ts" />
import Utils from '../../../../../ui-utils';
import Events from '../../../../../ui-events';
import DOMElement from '../../../../../DOMElement';

export default class AddScenario extends DOMElement{

  openState: boolean = false;

  constructor() {
    super(`<div id="leonardo-add-scenario" class="leonardo-add-scenario"></div>`);
  }

  render() {
    super.render();
    this.clearEventSubs();
    this.viewNode.innerHTML = `
        <div class="leonardo-add-scenario-box">
          <span>Scenario Name: </span>
          <input class="leonardo-add-scenario-name"/>
          <button class="leonardo-button leonardo-add-scenario-save">Save</button>
          <button class="leonardo-button leonardo-add-scenario-cancel">Cancel</button>
        </div>`;
    this.onItem(<HTMLElement>this.viewNode.querySelector('.leonardo-add-scenario-cancel'), 'click', this.onCancel.bind(this));
    this.onItem(<HTMLElement>this.viewNode.querySelector('.leonardo-add-scenario-save'), 'click', this.onSave.bind(this));
  }

  open() {
    this.render();
    this.openState = true;
    this.viewNode.style.display = 'block';
  }

  close() {
    this.openState = false;
    this.viewNode.style.display = 'none';
  }

  toggle() {
    if(this.openState){
      this.close();
      return;
    }
    this.open();
  }

  private onCancel() {
    this.close();
  }

  private onSave() {
    this.close();
    Events.dispatch(Events.ADD_SCENARIO, this.viewNode.querySelector('.leonardo-add-scenario-name').value);
  }
}
