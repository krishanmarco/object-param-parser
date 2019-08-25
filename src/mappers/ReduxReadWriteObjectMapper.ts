/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _fp from 'lodash/fp';
import * as _ from 'lodash/fp';
import {ObjectMapper} from "./ObjectMapper";
import {buildReadWriteObjectMapper} from "./ReadWriteObjectMapper";

const REDUX_READ_WRITE_OBJECT_MAPPER_SET_ACTION = 'REDUX_READ_WRITE_OBJECT_MAPPER_SET_ACTION';

export function buildReduxReadWriteObjectMapper<R>(key: string, objectMapper: ObjectMapper<R>, initialState = {}) {
  const actionKey = key.toUpperCase();

  function reducer(state = initialState, {type, value, path}) {
    switch (type) {
      case `${REDUX_READ_WRITE_OBJECT_MAPPER_SET_ACTION}_${actionKey}`:
        return !_.isEmpty(path)
          ? _fp.set(value, path, state)
          : {...value};
    }
    return state;
  }

  function setAction(value, path) {
    return {
      type: `${REDUX_READ_WRITE_OBJECT_MAPPER_SET_ACTION}_${actionKey}`,
      value,
      path
    };
  }

  function connect(reduxConnect: Function, stateSubPath?: string) {
    return reduxConnect(
      // mapStateToProps
      (state) => {
        const val = !_.isEmpty(stateSubPath)
          ? _.get(state, stateSubPath)
          : stateSubPath;
        return val != null
          ? val
          : {};
      },

      // mapDispatchToProps
      (dispatch) => ({
        dispatch
      }),

      // mergeProps
      (stateProps, {dispatch}, ownProps) => {
        function dispatchSetAction(value, path) {
          return dispatch(setAction(value, path));
        }

        return {
          ...ownProps,
          [key]: objectMapper
            .map('', buildReadWriteObjectMapper<R>(dispatchSetAction))
            .apply(stateProps)
        };
      }
    );
  }

  return {
    reducer,
    connect
  }
}

