import Events from '../ui-events';
import DOMElement from '../DOMElement';

export default class DropDown extends DOMElement{

  optionsState: boolean = false;

  constructor(private items,
              private activeItem,
              private isDisabled: boolean,
              private onSelectItem: Function,
              private onRemoveItem: Function) {
    super(`<div class="leonardo-dropdown"></div>`);
    this.bodyEventsSubs.push(Events.on('click', this.closeDropDown.bind(this)));
    this.bodyEventsSubs.push(Events.on(Events.CLOSE_DROPDOWNS, this.closeDropDown.bind(this)));
  }

  render() {
    super.render();
    this.clearEventSubs();
    this.viewNode.innerHTML = `
          <div class="leonardo-dropdown-selected" ${this.isDisabledToken()}>
            <span class="leonardo-dropdown-selected-text">${this.activeItem.name}</span>
            <span class="leonardo-dropdown-selected-arrow"></span>
          </div>
          <div class="leonardo-dropdown-options">
            <ul class="leonardo-dropdown-list">${this.getItems().join('')}</ul>
          </div>`;
    this.onItem(this.viewNode, 'click', this.toggleDropDown.bind(this));

  }

  disableDropDown() {
    this.isDisabled = true;
    this.viewNode.querySelector(`.leonardo-dropdown-selected`).setAttribute('disabled', 'disabled');
  }

  enableDropDown() {
    this.isDisabled = false;
    this.viewNode.querySelector(`.leonardo-dropdown-selected`).removeAttribute('disabled');
  }

  toggleDropDown(event: MouseEvent) {
    if (this.isDisabled) {
      return;
    }
    if (event && event.target) {
      event.stopPropagation();
    }
    if (event.target['classList'].contains('leonardo-dropdown-item')) {
      this.setActiveItem(event.target['querySelector']('.leonardo-dropdown-item-text').innerHTML);
    }
    else if (event.target['classList'].contains('leonardo-dropdown-item-text')) {
      this.setActiveItem(event.target['innerHTML']);
    }
    else if (event.target['classList'].contains('leonardo-dropdown-item-x')) {
      this.removeItem(<HTMLElement>event.target['parentNode']);
    }
    if (this.optionsState) {
      this.closeDropDown();
      this.optionsState = false;
    }
    else {
      this.openDropDown();
      this.optionsState = true;
    }
  }

  openDropDown() {
    const elem: HTMLElement = <HTMLElement>this.viewNode.querySelector(`.leonardo-dropdown-options`);
    elem.style.display = 'block';
    const elemRec: ClientRect = elem.getBoundingClientRect();
    const isOverflowed: boolean = elemRec.top + elemRec.height > window.innerHeight;
    if (isOverflowed) {
      elem.style.top = -elemRec.height + 'px';
      elem.style.borderTop = '1px solid #212121';
      elem.style.borderBottom = 'none';
    }
    Events.dispatch(Events.CLOSE_DROPDOWNS, this.viewNode);
  }

  closeDropDown(event?: CustomEvent) {
    const dropDown: HTMLElement = <HTMLElement>this.viewNode.querySelector(`.leonardo-dropdown-options`);
    if (!dropDown || (event && event.detail === this.viewNode)) {
      return;
    }
    dropDown.style.display = 'none';
  }

  setActiveItem(itemName: string) {
    if (this.activeItem.name === itemName) {
      return;
    }
    this.activeItem = this.getItemByName(itemName);
    this.viewNode.querySelector(`.leonardo-dropdown-selected-text`)['innerHTML'] = this.activeItem.name;
    this.onSelectItem(this.activeItem);
  }

  private getItemByName(itemName: string) {
    let retItem = this.activeItem;
    this.items.some((curItem) => {
      if (curItem.name === itemName) {
        retItem = curItem;
        return true;
      }
    });
    return retItem;
  }

  private getItems() {
    return this.items.map((item: {name: string}) => {
      return `<li class="leonardo-dropdown-item"><span class="leonardo-dropdown-item-text">${item.name}</span><span class="leonardo-x-btn leonardo-dropdown-item-x"></span></li>`
    })
  }

  private isDisabledToken() {
    return this.isDisabled ? 'disabled' : '';
  }

  private removeItem(item: HTMLElement) {
    if (this.items.length <= 1) {
      return;
    }
    let removedItem;
    this.items = this.items.filter((curItem) => {
      if (curItem.name === item.querySelector('.leonardo-dropdown-item-text')['innerHTML']) {
        removedItem = curItem;
      }
    });
    this.viewNode.querySelector('.leonardo-dropdown-list').removeChild(item);
    this.onRemoveItem(removedItem);

  }
}
