import Launcher from './launcher/launcher';
import MainView from './main-view/main-view';
import Utils from './ui-utils';
import UIStateVeiwService from './ui-state/ui-state.srv';

export default class UIRoot {
  leonardoApp: Node;
  launcher: Launcher;
  mainView: MainView;
  initBinded: EventListener = this.init.bind(this);

  constructor() {
    switch (document.readyState) {
      default:
      case 'loading':
        document.addEventListener('DOMContentLoaded', this.initBinded, false);
        break;
      case 'interactive':
      case 'complete':
        this.init();
        break;
    }
  }

  init() {
    document.removeEventListener('DOMContentLoaded', this.initBinded, false);
    this.leonardoApp = Utils.getElementFromHtml(`<div leonardo-app></div>`);
    this.launcher = new Launcher();
    this.mainView = new MainView();
    this.leonardoApp.appendChild(this.launcher.get());
    this.leonardoApp.appendChild(this.mainView.get());
    document.body.addEventListener('leonardo:toggle:states', this.toggleAllStates.bind(this));
    document.body.appendChild(this.leonardoApp);
  }

  private toggleAllStates(event: CustomEvent){
    Leonardo.toggleActivateAll(event.detail);
  }
}