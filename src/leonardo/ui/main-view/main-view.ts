/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';
import HeaderView from '../header/header';
import {HeaderTabItem} from '../header/header.model';
import {UIStateList} from '../ui-state/ui-state.data';
import UIStateViewService from '../ui-state/ui-state.srv';
import {UIViewState} from '../ui-state/ui-state.model';
import ViewsContainer from './views-container/views-container';
import DOMElement from '../DOMElement';

export default class MainView extends DOMElement{
  className = 'leonardo-main-view';
  hiddenClassName = `${this.className}-hidden`;
  headerView: HeaderView;
  viewsContainer: ViewsContainer;
  bodyView: HTMLElement;
  menuView: HTMLElement;
  menuState: boolean = false;

  constructor() {
    super(`<div class="leonardo-main-view leonardo-main-view-hidden"></div>`);
    this.eventSubs.push(Events.on('keydown', this.onKeyPress.bind(this)));
    this.eventSubs.push(Events.on(Events.TOGGLE_LAUNCHER, this.toggleView.bind(this)));
    this.eventSubs.push(Events.on(Events.ATTACH_MENU_ITEM, this.attachMenu.bind(this)));
    this.eventSubs.push(Events.on(Events.OPEN_MENU, this.openMenu.bind(this)));
    this.eventSubs.push(Events.on(Events.CLOSE_MENU, this.closeMenu.bind(this)));
    this.eventSubs.push(Events.on(Events.CHANGE_VIEW, this.closeMenu.bind(this)));
    this.bodyView = Utils.getElementFromHtml(`<div class="leonardo-main-view-body"></div>`);
    this.menuView = Utils.getElementFromHtml(`<div class="leonardo-main-view-menu"></div>`);
    UIStateViewService.getInstance().init(UIStateList(), UIStateList()[0].name);
    this.headerView = new HeaderView(this.getTabList());
    this.viewsContainer = new ViewsContainer();
  }

  toggleView() {
    const el = document.querySelector(`.${this.className}`);
    if (!el) return;
    if (el.classList.contains(this.hiddenClassName)) {
      el.classList.remove(this.hiddenClassName);
      if (!el.childNodes.length) {
        this.render();
      }
    } else {
      this.closeLeo();
    }
  }

  render() {
    super.render();
    this.menuState = false;
    this.viewNode.appendChild(this.bodyView);
    this.viewNode.appendChild(this.menuView);
    this.bodyView.appendChild(this.headerView.get());
    this.bodyView.appendChild(this.viewsContainer.get());
    this.headerView.render();
    this.viewsContainer.setView(UIStateViewService.getInstance().getCurViewState());
    this.viewsContainer.render();
  }

  private attachMenu(event: CustomEvent){
    this.menuView.innerHTML = '';
    this.closeMenu(null);
    this.menuView.appendChild(event.detail);
  }

  private openMenu(event: CustomEvent){
    if(this.menuState){
      return;
    }
    this.menuState = true;
    this.menuView.style.transform = 'translateX(0)';
    this.bodyView.style.width = (this.bodyView.getBoundingClientRect().width - this.menuView.getBoundingClientRect().width) + 'px'
  }

  private closeMenu(event: CustomEvent){
    if(!this.menuState){
      return;
    }
    this.menuState = false;
    this.menuView.style.transform = 'translateX(100%)';
    this.bodyView.style.width = (this.bodyView.getBoundingClientRect().width + this.menuView.getBoundingClientRect().width) + 'px'
  }

  private getTabList(): Array<HeaderTabItem> {
    return UIStateViewService.getInstance().getViewStates().map((view: UIViewState) => {
      return {label: view.name}
    });
  }

  private closeLeo() {
    const el = document.querySelector(`.${this.className}`);
    el.classList.add(this.hiddenClassName);
  }

  private onKeyPress(event: MouseEvent) {
    if (event.which == 27) {
      this.closeLeo();
    }
  }
}
