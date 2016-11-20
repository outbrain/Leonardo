/// <reference path="../../leonardo.d.ts" />

import {UIViewState} from './ui-state.model';
export default class UIStateViewService {
  private curViewState: UIViewState;

  constructor(private viewStateList: Array<UIViewState>, private initViewName: string) {
    this.curViewState = this.getViewStateByName(initViewName);
  }

  getCurViewState(){
    return this.curViewState;
  }

  setCurViewState(stateName: string){
    this.curViewState = this.getViewStateByName(stateName);
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