/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';
import DOMElement from '../DOMElement';

export default class Launcher extends DOMElement {

  constructor() {
    super(`<div class="leonardo-launcher"></div>`);
    this.eventSubs.push(Events.on('keydown', this.bodyKeypress.bind(this)));
    this.eventSubs.push(Events.on(Events.TOGGLE_ICON, this.toggleLauncher.bind(this)));
    this.onItem(this.viewNode, 'click', this.onClick.bind(this));
  }

  onClick() {
    Events.dispatch(Events.TOGGLE_LAUNCHER);
  }

  bodyKeypress(e: KeyboardEvent) {
    if (e.shiftKey && e.ctrlKey && e.keyCode === 76) {
      Events.dispatch(Events.TOGGLE_ICON);
      return;
    }
    if (e.shiftKey && e.ctrlKey && e.keyCode === 75) {
      Events.dispatch(Events.TOGGLE_LAUNCHER);
      return;
    }
  }

  toggleLauncher() {
    this.viewNode.style.display = this.viewNode.style.display === 'none' ? 'block' : 'none';
  }
}
