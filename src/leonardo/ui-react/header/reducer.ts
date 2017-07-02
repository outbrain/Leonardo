import { assign } from 'lodash';
import { handleActions} from 'redux-actions';

const initialState: any = [{
  text: 'Use Redux with TypeScripts',
  completed: false,
  id: 0
}];

export default handleActions({
}, initialState);