/// <reference path="../leonardo.d.ts" />
import Launcher from './launcher/launcher';
import MainView from './main-view/main-view';
import Utils from './ui-utils';
import UIStateVeiwService from './ui-state/ui-state.srv';

export default class UIRoot {
  leonardoApp: Node;
  launcher: Launcher;
  mainView: MainView;

  constructor() {
    this.init();
  }

  init() {
    this.leonardoApp = Utils.getElementFromHtml(`<div leonardo-app></div>`);
    this.launcher = new Launcher();
    this.mainView = new MainView();
    this.leonardoApp.appendChild(this.launcher.get());
    this.leonardoApp.appendChild(this.mainView.get());
    document.body.appendChild(this.leonardoApp);
  }

}