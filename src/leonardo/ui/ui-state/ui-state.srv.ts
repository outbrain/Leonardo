/// <reference path="../../leonardo.d.ts" />

import {UIViewState} from './ui-state.model';
import Events from '../ui-events';
export default class UIStateViewService {

  private static _instance: UIStateViewService = new UIStateViewService();
  private curViewState: UIViewState;
  private viewStateList: Array<UIViewState>;

  static getInstance(): UIStateViewService {
    return UIStateViewService._instance;
  }

  constructor() {
    if (UIStateViewService._instance) {
      throw new Error('UIStateViewService should be singleton');
    }
    UIStateViewService._instance = this;
  }



  init(viewStateList: Array<UIViewState>, initViewName: string) {
    this.viewStateList = viewStateList;
    this.curViewState = this.getViewStateByName(initViewName);
  }

  getCurViewState(){
    return this.curViewState;
  }

  setCurViewState(stateName: string){
    this.curViewState = this.getViewStateByName(stateName);
    Events.dispatch(Events.CHANGE_VIEW, this.curViewState);
  }

  getViewStates(){
    return this.viewStateList;
  }

  addViewState(viewState: UIViewState){
    this.viewStateList.push(viewState);
  }

  removeViewState(viewStateName: string){
    this.viewStateList = this.viewStateList.filter((view: UIViewState) => {
      return view.name === viewStateName;
    })
  }

  private getViewStateByName(viewStateName: string): UIViewState{
    let retView: UIViewState;
    this.viewStateList.some((view: UIViewState) => {
      if(viewStateName === view.name){
        return !!(retView = view);
      }
    });
    return retView || this.curViewState;
  }

}