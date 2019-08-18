import React from 'react';
import './App.css';
import { connect, Provider } from 'react-redux';
import { Store } from './Store';

function App({loginForm}) {
  return (
    <div className="App">
      {JSON.stringify(loginForm, null, 2)}
    </div>
  );
}

const ConnectedApp = connect(
  (state) => ({
    loginForm: {'a': 'bv'}
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
