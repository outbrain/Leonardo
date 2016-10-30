/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';

export default class Launcher {
  constructor() {

  }

  get() {
    const launcher = Utils.getElementFromHtml(`<div style="bottom: 10px; right: 10px" class="leonardo-launcher"></div>`);
    launcher.addEventListener('click', this.onClick.bind(this));
    return launcher;
  }

  onClick() {
    Events.dispatch(Events.TOGGLE_VIEW);
  }

  //$(document).on('keypress', (e) => {
  //  if (e.shiftKey && e.ctrlKey) {
  //    switch (e.keyCode) {
  //      case 12:
  //        $('.leonardo-activator').toggle();
  //        break;
  //      case 11:
  //        toggleWindow();
  //        break;
  //      default:
  //        break;
  //    }
  //  }
  //});
}
