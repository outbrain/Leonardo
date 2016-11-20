/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';
import HeaderView from '../header/header';
import {HeaderTabItem} from '../header/header.model';
import {UIStateList} from '../ui-state/ui-state.data';
import UIStateViewService from '../ui-state/ui-state.srv';
import {UIViewState} from '../ui-state/ui-state.model';

export default class MainView {
  className = 'leonardo-main-view';
  hiddenClassName = `${this.className}-hidden`;
  uiStateService: UIStateViewService;
  headerView: HeaderView;
    
  constructor() {
    Events.on(Events.TOGGLE_VIEW, this.toggleView.bind(this));
    this.uiStateService = new UIStateViewService(UIStateList, UIStateList[0].name);
    this.headerView = new HeaderView(this.getTabList());
  }

  get() {
    return Utils.getElementFromHtml(`<div class="${this.className} ${this.hiddenClassName}"></div>`);
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

  getViewNode(): Node{
    return document.querySelector(`.${this.className}`);
  }
  
  kickStart(){
    this.getViewNode().appendChild(this.headerView.get());
  }

  private getTabList(): Array<HeaderTabItem>{
    return this.uiStateService.getViewStates().map((view: UIViewState) => {return {label: view.name}});
  }
}
