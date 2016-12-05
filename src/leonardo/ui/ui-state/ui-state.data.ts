/// <reference path="../../leonardo.d.ts" />

import {UIViewState} from './ui-state.model';
import Scenarios from '../views/scenarios/scenarios';
import Recorder from '../views/recorder/recorder';
import Export from '../views/export/export';

let uiList: Array<UIViewState>;

export function UIStateList(): Array<UIViewState> {
  if(uiList){
    return uiList;
  }
  return uiList = [
    {
      name: 'scenarios',
      component: new Scenarios()
    },
    {
      name: 'recorder',
      component: new Recorder()

    },
    {
      name: 'exported code',
      component: new Export()
    }
  ];
}


