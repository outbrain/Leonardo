import Utils from '../../../ui-utils';
import Events from '../../../ui-events';
import RecorderStateDetail from "../state-detail/states-detail";

export default class RecorderList {

  viewNode: HTMLElement;
  stateDetail: RecorderStateDetail = new RecorderStateDetail();

  constructor() {
    Events.on(Events.TOGGLE_LAUNCHER, this.render.bind(this))
  }

  get() {
    return this.viewNode = Utils.getElementFromHtml(`<div id="leonardo-recorder-list" class="leonardo-recorder-list"></div>`);
  }

  render() {
    if(!this.viewNode){
      return;
    }
    const list = Utils.getElementFromHtml(`<ul class="leonardo-recorder-list-container"></ul>`);
    this.getStateItems().forEach((item) => {list.appendChild(item)});
    this.viewNode.appendChild(list);
    this.viewNode.appendChild(this.stateDetail.get());
  }

  private getStateItems(): Array<any> {
    return Leonardo.getRecordedStates().map((state) => {
      const item = Utils.getElementFromHtml(`<li class="leonardo-recorder-list-item">`);
      item.innerHTML =
          `<span class="leonardo-recorder-list-verb leonardo-recorder-list-verb-${state.verb.toLowerCase()}">${state.verb}</span>
           <span class="leonardo-recorder-list-url">${state.url}</span>`;
      item.innerHTML += state.recorded ? `<span class="leonardo-recorder-list-name">${state.name}</span>` :
        `<span class="leonardo-recorder-list-name leonardo-recorder-list-name-new">New</span>`
      item.addEventListener('click', this.toggleDetails.bind(this, state));
      return item;
    })
  }

  toggleDetails(state){
    state.activeOption = state.options[0];
    this.stateDetail.open(state);
  }

}
