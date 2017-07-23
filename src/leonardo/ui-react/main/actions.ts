import {createAction} from 'redux-actions';
/**
 * Created by mfrankel on 04/07/2017.
 */
export const filterStates = createAction<any, string>(
  'SET_FILTER',
  (filterValue: string) => ({ filterValue })
);

export const selectScenario = createAction<any, string>(
  'SET_FILTER',
  (filterValue: string) => ({ filterValue })
);