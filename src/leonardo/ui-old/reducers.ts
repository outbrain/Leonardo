
const accountReducer = (state = {}, action) => {
  switch (action.type) {
    case 'RECEIVE_ACCOUNT_SUCCESS':
      return {
        ...state,
        ...action.data
      };
    default:
      return state;
  }
};

export default accountReducer;