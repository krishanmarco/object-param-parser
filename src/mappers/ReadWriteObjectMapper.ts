import * as _ from 'lodash';
import { tryInvoke } from '../lib/HelperFunctions';
import { ObjectMapper, TObjectMapperMappers } from './ObjectMapper';

export function buildReadWriteObjectMapper<R>(setValueFromRoot: Function, extend: TObjectMapperMappers<R> | null = null): TObjectMapperMappers<R> {
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
        const newRootValue = _.set(rootValue, path, newValue);
        setValueFromRoot(newRootValue);
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
      addOrPushItem: (index, value: any = null) => {
        const newArrayValue = value || [];

        if (index == null) {
          newArrayValue.push(index);
        } else {
          newArrayValue.splice(index, 0, value);
        }

        const newRootValue = _.set(rootValue, path, newArrayValue);
        setValueFromRoot(newRootValue);
      },

      // Pops if index is not specified
      removeOrPopItem: (index) => {
        const newArrayValue = value || [];

        if (index == null) {
          newArrayValue.pop();
        } else {
          newArrayValue.splice(index, 1);
        }

        const newRootValue = _.set(rootValue, path, newArrayValue);
        setValueFromRoot(newRootValue);
      },
    }),
    objectMapper: (value: any, path: string, rootValue: any, objectMapper: ObjectMapper<R>) => ({
      ...tryInvoke(extend, 'objectMapper', [value, path, rootValue], {}),
      fields: objectMapper
        .getChildObjectMapper(path)
        .apply(value)
    }),
    primitiveMapper: (value: any, path: string, rootValue: any) => ({
      ...tryInvoke(extend, 'primitiveMapper', [value, path, rootValue], {}),
    }),
  };
}

// If also the serverParsingSchema is passed to the mapper then
// fields are validated and sanitized on the fly
// I.e. setValue validates and sanitizes
// Set value to object => Run parser => Return object if parser succeeds
