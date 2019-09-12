/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import {setToObjectFp, tryInvoke} from '../lib/HelperFunctions';
import {ObjectMapper, TObjectMapperMappers} from './ObjectMapper';

export type TSetValue = (value: any, path: string) => void;

export function buildReadWriteObjectMapper<R>(setValueToObj: TSetValue, extend: TObjectMapperMappers<R> | null = null): TObjectMapperMappers<R> {
  return {
    /**
     * Applied to all the values of the object
     * @param value
     * @param path
     * @param rootValue
     */
    globalMapper: (value: any, path: string, rootValue: any) => ({
      ...tryInvoke(extend, 'globalMapper', [value, path, rootValue], {}),

      // Path in which we are: '' for root
      path,

      // Value at the current node
      value,

      // Sets values without middlewares
      setValue: (newValue) => {
        setValueToObj(newValue, path);
      },

      // Gets value from this node through to path
      getValue: (path: string | null, defaultValue: null) => {
        const valueAtPath = _.isEmpty(path)
          ? value
          : _.get(value, path);
        return valueAtPath != null
          ? valueAtPath
          : defaultValue;
      },

      // gets value from the root of the object, following path
      getValueFromRoot: (path: string | null, defaultRootValue: null) => {
        const valueAtPath = _.isEmpty(path)
          ? rootValue
          : defaultRootValue;
        return valueAtPath != null
          ? valueAtPath
          : defaultRootValue;
      },
    }),
    arrayMapper: (value: any, path: string, rootValue: any) => ({
      ...tryInvoke(extend, 'arrayMapper', [value, path, rootValue], {}),

      // Pushes if index is not specified
      addOrPushItem: (itemToPush: any = null, index?: number) => {
        // Important create a new array
        const newArrayValue = _.isArray(value) ? [...value] : [];

        if (index == null) {
          newArrayValue.push(itemToPush);
        } else {
          _.set(newArrayValue, index, itemToPush);
        }

        setValueToObj(newArrayValue, path);
      },

      // Pops if index is not specified
      removeOrPopItem: (index?: number) => {
        // Important create a new array
        const newArrayValue = _.isArray(value) ? [...value] : [];

        if (index == null) {
          newArrayValue.pop();
        } else {
          newArrayValue.splice(index, 1);
        }

        setValueToObj(newArrayValue, path);
      },
    }),
    objectMapper: (value: any, path: string, rootValue: any) => ({
      ...tryInvoke(extend, 'objectMapper', [value, path, rootValue], {}),
    }),
    primitiveMapper: (value: any, path: string, rootValue: any) => ({
      ...tryInvoke(extend, 'primitiveMapper', [value, path, rootValue], {}),
    }),
  };
}

export function parseAndSetDataInObjectPurely<R>(initialState, initialValue, path, objectMapper?: ObjectMapper<R>) {
  // Expand this value into a new object using path
  const expandedValue = _.set({}, path, initialValue);

  // Only parse the value that has changed
  // We don't need to parse the full state here
  const parsedValue = objectMapper != null
    ? objectMapper.parse(expandedValue)
    : expandedValue;

  // Get the final value from the parsed result
  const value = _.get(parsedValue, path);

  // Set the value into a new object
  const newState = setToObjectFp(initialState, value, path);

  return newState;
}
