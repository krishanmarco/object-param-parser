/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _fp from 'lodash/fp';
import * as _ from 'lodash';
import {ObjectMapper} from "./ObjectMapper";
import {buildReadWriteObjectMapper} from "./ReadWriteObjectMapper";
import {setToObjectFp} from "../lib/HelperFunctions";

const REDUX_READ_WRITE_OBJECT_MAPPER_SET_ACTION = 'REDUX_READ_WRITE_OBJECT_MAPPER_SET_ACTION';

export function buildReduxReadWriteObjectMapper<R>(key: string, objectMapper: ObjectMapper<R>, initialState = {}) {
  const actionKey = key.toUpperCase();

  function reducer(state = initialState, {type, value, path}) {
    switch (type) {
      case `${REDUX_READ_WRITE_OBJECT_MAPPER_SET_ACTION}_${actionKey}`:
        return setToObjectFp(state, value, path);
    }

    return state;
  }

  function createSetAction(value, path) {
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
          : state;

        return val != null
          ? val
          : {};
      },

      // mapDispatchToProps
      (dispatch) => ({
        dispatchSetAction: (value, path) => dispatch(createSetAction(value, path))
      }),

      // mergeProps
      (stateProps, {dispatchSetAction}, ownProps) => {
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

