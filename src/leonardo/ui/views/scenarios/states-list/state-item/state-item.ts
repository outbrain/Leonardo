/// <reference path="../../../../../leonardo.d.ts" />
import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';

export default class StateItem {

  viewNode: HTMLElement;
  randomID: string;
  constructor(private state) {
    this.viewNode = Utils.getElementFromHtml(`<div class="leonardo-state-item"></div>`);
    this.randomID = Utils.guidGenerator();
    console.log(state);
  }

  get() {
    return this.viewNode;
  }

  render() {
    this.viewNode.innerHTML = `
        <input ${this.isChecked()} id="leonardo-state-toggle-${this.randomID}" class="leonardo-toggle leonardo-toggle-ios" type="checkbox"/>
        <label id="leonardo-toggle-btn-${this.randomID}" class="leonardo-toggle-btn" for="leonardo-state-toggle-${this.randomID }"></label>
        <span class="leonardo-state-verb leonardo-state-verb-${this.state.verb.toLowerCase()}">${this.state.verb}</span>
        <span class="leonardo-state-name">${this.state.name}</span>
        <span class="leonardo-state-options">options</span>
        <button title="Remove State" class="leonardo-state-remove">Remove</button>`;
    document.querySelector(`#leonardo-toggle-btn-${this.randomID}`).addEventListener('click', this.toggleState.bind(this))
  }

  private isChecked(): string {
    return this.state.active ? 'checked' : '';
  }

  private toggleState(event){
    this.state.active = !this.state.active;
    if(this.state.active){
      Leonardo.activateStateOption(this.state.name, this.state.options.name);
    }
    else{
      Leonardo.deactivateState(this.state.name);
    }
  }

}
