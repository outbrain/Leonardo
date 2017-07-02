import { combineReducers } from 'redux';

import items from '../header';

const rootReducer = combineReducers({
  items: items,
});

export default rootReducer;