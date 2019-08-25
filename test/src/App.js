import React from 'react';
import './App.css';
import { connect, Provider } from 'react-redux';
import { Store } from './Store';
import { getLoginFormObjectMapper } from './LoginForm';

function App({loginForm}) {
  return (
    <div className="App">
      {JSON.stringify(loginForm, null, 2)}
    </div>
  );
}

const ConnectedApp = connect(
  (state) => ({
    loginFormValue: state.reducer.loginForm,
  }),
  (dispatch) => ({
    dispatch
  }),
  (stateProps, dispatchProps, ownProps) => ({
    loginForm: getLoginFormObjectMapper(stateProps.loginFormValue, dispatchProps.dispatch)
  })
)(App);

function ss() {
  return (
    <Provider store={Store}>
      <ConnectedApp/>
    </Provider>
  );
}

export default ss;
