/// <reference path="../../../../../../leonardo.d.ts" />
import Utils from '../../../../../ui-utils';
import Events from '../../../../../ui-events';

export default class  {
  viewNode: any;
  openState: boolean = false;
  onCancelBinded: EventListener = this.onCancel.bind(this);
  onSaveBinded: EventListener = this.onSave.bind(this);

  constructor() {
    this.viewNode = Utils.getElementFromHtml(`<div id="leonardo-add-scenario" class="leonardo-add-scenario"></div>`);
  }

  get() {
    return this.viewNode;
  }

  render() {
    if(this.viewNode.innerHTML){
      this.viewNode.querySelector('.leonardo-add-scenario-cancel').removeEventListener('click', this.onCancelBinded, false);
      this.viewNode.querySelector('.leonardo-add-scenario-save').removeEventListener('click', this.onSaveBinded, false);
    }
    this.viewNode.innerHTML = `
        <div class="leonardo-add-scenario-box">
          <span>Scenario Name: </span>
          <input class="leonardo-add-scenario-name"/>
          <button class="leonardo-button leonardo-add-scenario-save">Save</button>
          <button class="leonardo-button leonardo-add-scenario-cancel">Cancel</button>
        </div>`;
    this.viewNode.querySelector('.leonardo-add-scenario-cancel').addEventListener('click', this.onCancelBinded, false);
    this.viewNode.querySelector('.leonardo-add-scenario-save').addEventListener('click', this.onSaveBinded, false);
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
