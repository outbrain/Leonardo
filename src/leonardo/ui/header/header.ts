/// <reference path="../../leonardo.d.ts" />
import Utils from '../ui-utils';
import Events from '../ui-events';
import {HeaderTabItem} from './header.model';
import UIStateViewService from '../ui-state/ui-state.srv';

export default class HeaderView {
  
  static SELECTED_CLASS_NAME: string = 'leonardo-header-tabItem-selected';

  private onClickBinded: EventListenerObject = this.onClick.bind(this);

  
  constructor(private tabList: Array<HeaderTabItem>) {
  }

  get() {
    const template = `<div class="leonardo-header-container">
        <span class="leonardo-header-label ">LEONARDO</span>
        <span class="leonardo-header-tabs">
          <ul>
            ${this.getTabsHtml(0)}
          </ul>
      </span>
    </div>`;
    const launcher = Utils.getElementFromHtml(template);
    launcher.querySelector('ul').addEventListener('click', this.onClickBinded);
    return launcher;
  }

  private getTabsHtml(selectedIndex: number) {
    return this.tabList.map((tab: HeaderTabItem, index: number) => {
      const selected: string = index === selectedIndex ? HeaderView.SELECTED_CLASS_NAME : '';
      return `<li class="leonardo-header-tabItem ${selected}" data-headertab="leonardo-header-${tab.label}" >${tab.label}</li>`;
    }).join('');
  }

  onClick(event: MouseEvent) {
    this.selectTab(event.target['innerHTML']);
  }

  selectTab(tabLabel: string){
    document.querySelector(`.${HeaderView.SELECTED_CLASS_NAME}`).classList.remove(`leonardo-header-tabItem-selected`);
    document.querySelector(`[data-headertab="leonardo-header-${tabLabel}"]`).classList.add(HeaderView.SELECTED_CLASS_NAME);
    UIStateViewService.getInstance().setCurViewState(tabLabel);
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
