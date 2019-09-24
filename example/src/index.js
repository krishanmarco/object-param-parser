import React from 'react';
import ReactDOM from 'react-dom';
import { LoginFormWithReduxConnect } from "./LoginFormWithReduxConnect";
import { LoginFormWithReactHooks } from "./LoginFormWithReactHooks";
import _ from 'lodash';
import './css/index.css';

const App = () => (
  <div className="App">
    <h3>Object mapper with react hooks</h3>
    <LoginFormWithReactHooks/>
    <hr/>
    <hr/>
    <hr/>
    <h3>Object mapper with redux connect</h3>
    <LoginFormWithReduxConnect/>
  </div>
);

ReactDOM.render(<App/>, document.getElementById('root'));
