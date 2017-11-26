import {createAction} from 'redux-actions';
/**
 * Created by mfrankel on 04/07/2017.
 */

export const filterStates = createAction<any, string>(
  'SET_FILTER',
  (filterValue: string) => ({filterValue})
);

export const selectScenario = createAction<any, string>(
  'SET_SCENARIO',
  (scenario: string) => {

    window.parent['Leonardo'].toggleActivateAll(this.activeAllState);
    return {scenario};
  }
);

export const addScenario = createAction<any, string>(
  'ADD_SCENARIO',
  (scenario: string) => {    return {scenario};
  }
);

export const togggleActiveAll = createAction<any, string>(
  'TOGGLE_ACTIVE_ALL',
  (allState: string) => {
    window.parent['Leonardo'].toggleActivateAll(this.activeAllState);
    return {allState}
  }
);

export const resetStates = createAction<any, string>(
  'RESET_STATES',
  () => {
    window.parent['Leonardo'].storage.removeStates();
    return {}
  }
);

export const removeState = createAction<any>('REMOVE_STATE');
