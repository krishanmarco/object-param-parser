/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import { tryInvoke } from '../lib/HelperFunctions';
import { ObjectMapper, TObjectMapperMappers } from './ObjectMapper';

export type TSetValue = (value: any, path: string) => void;

export function buildReadWriteObjectMapper<R>(setValueToObj: TSetValue, extend: TObjectMapperMappers<R> | null = null): TObjectMapperMappers<R> {
  return {
    /**
     * Applied to all the values of the object
     * @param value
     * @param path
     * @param rootValue
     */
    globalMapper: {
      apply: (value: any, path: string, rootValue: any) => ({
        ...tryInvoke(extend, 'globalMapper.apply', [value, path, rootValue], {}),

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
    },
    arrayMapper: {
      apply: (value: any, path: string, rootValue: any) => ({
        ...tryInvoke(extend, 'arrayMapper.apply', [value, path, rootValue], {}),

        // Pushes if index is not specified
        addOrPushItem: (index, value: any = null) => {
          const newArrayValue = value || [];

          if (index == null) {
            newArrayValue.push(index);
          } else {
            newArrayValue.splice(index, 0, value);
          }

          setValueToObj(newArrayValue, path);
        },

        // Pops if index is not specified
        removeOrPopItem: (index) => {
          const newArrayValue = value || [];

          if (index == null) {
            newArrayValue.pop();
          } else {
            newArrayValue.splice(index, 1);
          }

          setValueToObj(newArrayValue, path);
        },
      })
    },
    objectMapper: {
      apply: (value: any, path: string, rootValue: any, objectMapper: ObjectMapper<R>) => ({
        ...tryInvoke(extend, 'objectMapper.apply', [value, path, rootValue], {}),
        fields: objectMapper
          .getChildObjectMapper(path)
          .apply(value)
      })
    },
    primitiveMapper: {
      apply: (value: any, path: string, rootValue: any) => ({
        ...tryInvoke(extend, 'primitiveMapper.apply', [value, path, rootValue], {}),
      })
    },
  };
}

// If also the serverParsingSchema is passed to the mapper then
// fields are validated and sanitized on the fly
// I.e. setValue validates and sanitizes
// Set value to object => Run parser => Return object if parser succeeds
