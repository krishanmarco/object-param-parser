import * as _ from 'lodash';
import * as _fp from 'lodash/fp';

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

export function mergeObject(source1, source2) {
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
