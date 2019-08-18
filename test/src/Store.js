import { applyMiddleware, createStore, compose, combineReducers } from 'redux'
import thunk from 'redux-thunk';

function reducer(action, state = {}) {

  return state;
}

export const Store = createStore(
  combineReducers({
    reducer,
  }),
  {},
  applyMiddleware(thunk)
);
