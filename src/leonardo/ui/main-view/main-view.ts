/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';
import HeaderView from '../header/header';
import {HeaderTabItem} from '../header/header.model';
import {UIStateList} from '../ui-state/ui-state.data';
import UIStateViewService from '../ui-state/ui-state.srv';
import {UIViewState} from '../ui-state/ui-state.model';
import ViewsContainer from '../views-container/views-container';

export default class MainView {
  className = 'leonardo-main-view';
  hiddenClassName = `${this.className}-hidden`;
  headerView: HeaderView;
  viewsContainer: ViewsContainer;
  viewNode: Node;

  constructor() {
    Events.on('keydown', this.onKeyPress.bind(this));
    Events.on(Events.TOGGLE_LAUNCHER, this.toggleView.bind(this));
    UIStateViewService.getInstance().init(UIStateList(), UIStateList()[0].name);
    this.headerView = new HeaderView(this.getTabList());
    this.viewsContainer = new ViewsContainer();
  }

  get() {
    return Utils.getElementFromHtml(`<div class="${this.className} ${this.hiddenClassName}"></div>`);
  }

  toggleView() {
    const el = document.querySelector(`.${this.className}`);
    if (!el) return;
    if (el.classList.contains(this.hiddenClassName)) {
      el.classList.remove(this.hiddenClassName);
      if (!el.childNodes.length) {
        this.kickStart();
      }
    } else {
      this.closeLeo();
    }
  }

  kickStart() {
    this.viewNode = document.querySelector(`.${this.className}`);
    this.viewNode.appendChild(this.headerView.get());
    this.viewNode.appendChild(this.viewsContainer.get());
    this.viewsContainer.render(UIStateViewService.getInstance().getCurViewState());

  }

  private getTabList(): Array<HeaderTabItem>{
    return UIStateViewService.getInstance().getViewStates().map((view: UIViewState) => {return {label: view.name}});
  }

  private closeLeo(){
    const el = document.querySelector(`.${this.className}`);
    el.classList.add(this.hiddenClassName);
  }

  private onKeyPress(event: MouseEvent){
    if(event.which == 27){
      this.closeLeo();
    }
  }
}
