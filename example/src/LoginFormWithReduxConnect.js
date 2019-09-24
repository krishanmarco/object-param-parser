import React from 'react';
import thunk from 'redux-thunk';
import { compose } from "redux";
import { connect, Provider } from 'react-redux';
import { applyMiddleware, createStore, combineReducers } from 'redux'
import { buildReduxReadWriteObjectMapper } from "object-param-parser";
import { ExplanationSection, PrintProps } from "./HelperComponents";
import { getLoginFormButtons, loginFormObjectMapper } from "./LoginForm";

const LoginFormWithReduxPresentational = ({loginForm}) => (
  <div>
    <ExplanationSection
      buttons={getLoginFormButtons(loginForm)}/>
    <PrintProps
      id='loginFormWithRedux'
      data={loginForm}
    />
  </div>
);

// Use the ObjectMapper to get a redux {connect, reducer} object
const {
  reducer: loginFormReducer,
  connect: loginFormConnector
} = buildReduxReadWriteObjectMapper('loginForm', loginFormObjectMapper);

// Create the connected redux component and use the
// loginFormConnector to mapStateToProps and mapDispatchToProps
const LoginFormWithRedux = compose(
  loginFormConnector(connect, 'reducerSubPath'),
  // connect(
  //   (state) => ({}),
  //   (dispatch) => ({}),
  // ),
  // connect(
  //   (state) => ({}),
  //   (dispatch) => ({}),
  // ),
  // ...Add as many connectors as needed
)(LoginFormWithReduxPresentational);

// Create the redux store and add the loginReducer
const Store = createStore(
  combineReducers({
    reducerSubPath: loginFormReducer,
    // ...Add as many reducers as needed
  }),
  {},
  applyMiddleware(thunk)
);

export const LoginFormWithReduxConnect = () => (
  <Provider store={Store}>
    <LoginFormWithRedux/>
  </Provider>
);
