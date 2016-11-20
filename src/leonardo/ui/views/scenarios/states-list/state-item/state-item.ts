/// <reference path="../../../../../leonardo.d.ts" />
import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';
import DropDown from '../../../../drop-down/drop-down';

export default class StateItem {

  viewNode: HTMLElement;
  randomID: string;
  dropDown: DropDown;
  constructor(private state) {
    this.viewNode = Utils.getElementFromHtml(`<div class="leonardo-state-item"></div>`);
    this.randomID = Utils.guidGenerator();
    this.dropDown = new DropDown(this.state.options, this.state.activeOption, !this.state.active, this.changeActiveOption.bind(this));
    console.log(state);
  }

  get() {
    return this.viewNode;
  }

  render() {
    this.viewNode.innerHTML = `
        <input ${this.isChecked()} id="leonardo-state-toggle-${this.randomID}" class="leonardo-toggle leonardo-toggle-ios" type="checkbox"/>
        <label class="leonardo-toggle-btn" for="leonardo-state-toggle-${this.randomID }"></label>
        <span class="leonardo-state-verb leonardo-state-verb-${this.state.verb.toLowerCase()}">${this.state.verb}</span>
        <span class="leonardo-state-name">${this.state.name}</span>`;
    this.viewNode.appendChild(this.dropDown.get());
    this.dropDown.render();
    this.viewNode.appendChild(Utils.getElementFromHtml(`<button title="Remove State" class="leonardo-state-remove">Remove</button>`));
    this.viewNode.querySelector(`.leonardo-toggle-btn`).addEventListener('click', this.toggleState.bind(this))
  }

  getName() {
    return this.state.name;
  }

  toggleVisible(show: boolean) {
    if (show) {
      this.viewNode.classList.remove('leonardo-state-item-hidden');
    } else {
      this.viewNode.classList.add('leonardo-state-item-hidden');
    }
  }

  private isChecked(): string {
    return this.state.active ? 'checked' : '';
  }

  private toggleState(event){
    this.state.active = !this.state.active;
    if(this.state.active){
      Leonardo.activateStateOption(this.state.name, this.state.activeOption.name);
      this.dropDown.enableDropDown();
    }
    else{
      Leonardo.deactivateState(this.state.name);
      this.dropDown.disableDropDown();
    }
  }

  private changeActiveOption(option) {
    this.state.activeOption = option;
    Leonardo.activateStateOption(this.state.name, this.state.activeOption.name)
  }

}
