/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';

export default class MainView {
  className = 'leonardo-main-view';
  hiddenClassName = `${this.className}-hidden`;
  constructor() {
    Events.on(Events.TOGGLE_VIEW, this.toggleView.bind(this));
  }

  get() {
    return Utils.getElementFromHtml(`<div class="${this.className} ${this.hiddenClassName}">LEONARDO</div>`);
  }

  toggleView() {
    const el = document.querySelector(`.${this.className}`);
    if (!el) return;
    if (el.classList.contains(this.hiddenClassName)) {
      el.classList.remove(this.hiddenClassName);
    } else {
      el.classList.add(this.hiddenClassName);
    }
  }
}
