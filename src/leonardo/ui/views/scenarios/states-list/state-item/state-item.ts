/// <reference path="../../../../../leonardo.d.ts" />
import Utils from '../../../../ui-utils';
import Events from '../../../../ui-events';
import DropDown from '../../../../drop-down/drop-down';

export default class StateItem {

  viewNode: HTMLElement;
  randomID: string;
  dropDown: DropDown;
  toggleBinded: EventListener = this.toggleState.bind(this);
  removeBinded: EventListener = this.removeState.bind(this);

  constructor(private state, private onRemove: Function) {
    this.viewNode = Utils.getElementFromHtml(`<div class="leonardo-state-item"></div>`);
    this.randomID = Utils.guidGenerator();
    this.dropDown = new DropDown(this.state.options, this.state.activeOption || this.state.options[0], !this.state.active, this.changeActiveOption.bind(this), this.removeOption.bind(this));
    Events.on(Events.TOGGLE_STATES, this.toggleAllstate.bind(this));
    Events.on(`${Events.TOGGLE_STATES}:${this.state.name}`, this.setStateState.bind(this));
  }

  get() {
    return this.viewNode;
  }

  render() {
    if (this.viewNode.innerHTML) {
      this.viewNode.querySelector(`.leonardo-toggle-btn`).removeEventListener('click', this.toggleBinded, false);
      this.viewNode.querySelector(`.leonardo-state-remove`).removeEventListener('click', this.removeBinded, false);
    }
    this.viewNode.innerHTML = `
        <input ${this.isChecked()} id="leonardo-state-toggle-${this.randomID}" class="leonardo-toggle leonardo-toggle-ios" type="checkbox"/>
        <label class="leonardo-toggle-btn" for="leonardo-state-toggle-${this.randomID }"></label>
        <span class="leonardo-state-verb leonardo-state-verb-${this.state.verb.toLowerCase()}">${this.state.verb}</span>
        <span class="leonardo-state-name">${this.state.name}</span>
        <span class="leonardo-state-url">${this.state.url || ''}</span>`;
    this.viewNode.appendChild(this.dropDown.get());
    this.dropDown.render();
    this.viewNode.appendChild(Utils.getElementFromHtml(`<button title="Remove State" class="leonardo-state-remove">Remove</button>`));
    this.viewNode.querySelector(`.leonardo-toggle-btn`).addEventListener('click', this.toggleBinded, false);
    this.viewNode.querySelector(`.leonardo-state-remove`).addEventListener('click', this.removeBinded, false);
  }

  getName() {
    return this.state.name;
  }

  getState() {
    return this.state;
  }

  toggleVisible(show: boolean) {
    if (show) {
      this.viewNode.classList.remove('leonardo-state-item-hidden');
    } else {
      this.viewNode.classList.add('leonardo-state-item-hidden');
    }
  }

  setState(state: Boolean, setView: boolean = true) {
    this.state.active = state;
    if (state) {
      Leonardo.activateStateOption(this.state.name, this.state.activeOption.name);
      this.dropDown.enableDropDown();
      if (setView) {
        this.viewNode.querySelector('.leonardo-toggle')['checked'] = true;
      }
    }
    else {
      Leonardo.deactivateState(this.state.name);
      this.dropDown.disableDropDown();
      if (setView) {
        this.viewNode.querySelector('.leonardo-toggle')['checked'] = false;
      }
    }
  }

  private isChecked(): string {
    return this.state.active ? 'checked' : '';
  }

  private toggleState(event: Event) {
    this.setState(!this.state.active, false);
  }

  private toggleAllstate(event: CustomEvent) {
    this.setState(event.detail);
  }

  private setStateState(event: CustomEvent) {
    this.setState(true);
    this.state.options.some((option) => {
      if (option.name === event.detail) {
        this.dropDown.setActiveItem(event.detail);
        this.changeActiveOption(option);
        return true;
      }
    })
  }

  private changeActiveOption(option) {
    this.state.activeOption = option;
    Leonardo.activateStateOption(this.state.name, this.state.activeOption.name)
  }

  private removeState(event: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.onDestroy();
    this.onRemove(this.state.name, this.viewNode);
    Leonardo.removeState(this.state);
  }

  private removeOption(item) {
    Leonardo.removeOption(this.state, item);
  }

  onDestroy() {
    this.viewNode.querySelector(`.leonardo-toggle-btn`).removeEventListener('click', this.toggleBinded, false);
    this.viewNode.querySelector(`.leonardo-state-remove`).removeEventListener('click', this.removeBinded, false);
  }

}
