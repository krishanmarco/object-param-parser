import * as _ from 'lodash';

/**
 * Tries to invoke a function at a given path
 * and returns defaultValue in case of failure
 * @param object
 * @param path
 * @param args
 * @param defaultValue
 */
export function tryInvoke(object, path, args, defaultValue) {
  const f = _.get(object, path, null);
  return _.isFunction(f)
    ? f(...args)
    : defaultValue;
}

export function mergeObjectWithConcat(source1, source2) {
  return _.mergeWith(source1, source2, (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
    return undefined;
  });
}

export function random() {
  // tslint:disable-next-line:insecure-random
  return Math.random();
}

export function safePathGet<T>(object: any, path: string, defaultValue: T = null): T {
  const value = !_.isEmpty(path)
    ? _.get(object, path)
    : object;

  return value != null
    ? value
    : defaultValue;
}

export function safeInsertValueToPath(value: any, path: string, object: any = {}) {
  return !_.isEmpty(path)
    ? _.set(object, path, value)
    : value;
}
