import Launcher from './launcher/launcher';
import MainView from './main-view/main-view';
import Utils from './ui-utils';
import Events from './ui-events';

export default class UIRoot {
  leonardoApp: Node;
  launcher: Launcher;
  mainView: MainView;  

  constructor() {
    switch (document.readyState) {
      default:
      case 'loading':
        Events.onItemOnce(document, 'DOMContentLoaded', this.init.bind(this));
        break;
      case 'interactive':
      case 'complete':
        this.init();
        break;
    }
  }

  init() {

    this.leonardoApp = Utils.getElementFromHtml(`<div leonardo-app></div>`);
    this.launcher = new Launcher();
    this.mainView = new MainView();
    this.leonardoApp.appendChild(this.mainView.get());
    this.leonardoApp.appendChild(this.launcher.get());
    Events.on(Events.TOGGLE_STATES, this.toggleAllStates.bind(this));
    document.body.appendChild(this.leonardoApp);
  }

  private toggleAllStates(event: CustomEvent) {
    Leonardo.toggleActivateAll(event.detail);
  }
}