/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';

export default class Launcher {
  launcher: HTMLElement;

  constructor() {
    Events.on('keydown', this.bodyKeypress.bind(this));
    Events.on(Events.TOGGLE_ICON, this.toggleLauncher.bind(this))
  }

  get(): HTMLElement {
    this.launcher = Utils.getElementFromHtml(`<div class="leonardo-launcher"></div>`);
    this.launcher.addEventListener('click', this.onClick);
    return this.launcher;
  }

  onClick() {
    Events.dispatch(Events.TOGGLE_LAUNCHER);
  }

  bodyKeypress(e: KeyboardEvent) {
    if (e.shiftKey && e.ctrlKey && e.keyCode === 76) {
      Events.dispatch(Events.TOGGLE_ICON);
    }
  }

  toggleLauncher() {
    this.launcher.style.display = this.launcher.style.display === 'none' ? 'block' : 'none';
  }
}
