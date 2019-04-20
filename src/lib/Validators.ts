/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import Validator from 'validator';
import {Handler, IParserMiddlewares, TParserMiddleware} from "./Handler";

export type TValidator = ((any) => boolean) | string;

export const Validators: IParserMiddlewares = Object.assign(Validator, {

  Builders: {
    range({min, max}): (val) => any {
      return (val) => val >= min && val <= max;
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
