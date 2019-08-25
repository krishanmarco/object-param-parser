import { applyMiddleware, createStore, combineReducers } from 'redux'
import thunk from 'redux-thunk';
import { buildReadWriteObjectMapper } from './lib/om/dist/mappers/ReadWriteObjectMapper';

const initialState = {
  loginForm: null
};

const actionKey = 'action';
function reducer(state = initialState, action) {
  switch(action.type) {
    case actionKey:
      return Object.assign({}, state.loginForm, action.value);
  }
  return state;
}

export const Store = createStore(
  combineReducers({
    reducer,
  }),
  {},
  applyMiddleware(thunk)
);

export function buildReduxReadWriteObjectMapper(key: string, dispatch) {
  return buildReadWriteObjectMapper(value => dispatch({
    type: actionKey,
    value
  }))
}
