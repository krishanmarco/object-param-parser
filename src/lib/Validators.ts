/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import Validator from 'validator';
import {Handler, IParserMiddlewares, TParserMiddleware} from "./Handler";

export type TValidator = ((any) => boolean) | string;

export const Validators: IParserMiddlewares = Object.assign(Validator, {

  Builders: {
    range({min, max}): (val) => any {
      return (val) => val >= min && val <= max;
    },

    oneOf({vals}): (val) => any {
      return (val) => (vals || []).includes(val);
    },

    equals({val: expectedValue}): (val) => any {
      return (val) => {
        if (_.isFunction(expectedValue)) {
          return this.equals({val: expectedValue(val)})
        }
        return _.isEqual(expectedValue, val);
      }
    },

    len({min, max}): (val) => any {
      return (val) => {
        const minSat = min == null || (val != null && val.length >= min);
        const maxSat = max == null || (val != null && val.length <= max);
        return minSat && maxSat;
      };
    }
  },

  invoke(parserMiddleware: TParserMiddleware, ...params: any[]): boolean {
    return Handler.invokeOrHandle(parserMiddleware, params, Validators, true);
  },

  isEthTransactionId(value?: string): boolean {
    return this.isHexadecimal(value) && value.length == 64;
  },

  isEthPrivateKey(value?: string): boolean {
    return this.isHexadecimal(value) && value.length == 128;
  },

  isEthPublicKey(value?: string): boolean {
    return this.isHexadecimal(value) && value.length == 64;
  },

  // Add custom validators here
});
