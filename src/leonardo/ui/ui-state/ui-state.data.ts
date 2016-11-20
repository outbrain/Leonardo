/// <reference path="../../leonardo.d.ts" />

import {UIViewState} from './ui-state.model';
import Scenarios from '../views/scenarios/scenarios';
import Recorder from '../views/recorder/recorder';
import Export from '../views/export/export';
export const UIStateList: Array<UIViewState> =  [
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

