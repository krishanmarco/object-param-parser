/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import Validator from 'validator';
import * as _ from 'lodash';
import {Handler, IParserMiddlewares, TParserMiddleware} from "./Handler";

export type TSanitizer = ((any) => any) | string;

export const Sanitizers: IParserMiddlewares = Object.assign(Validator, {

  Builders: {

  },

  invoke(parserMiddleware: TParserMiddleware, ...params: any[]): any {
    return Handler.invokeOrHandle(parserMiddleware, params, Sanitizers, null);
  },

  email(email: string | null): string {
    const sanitized = Validator.normalizeEmail(Validator.trim(email), {
      all_lowercase: false,
      gmail_lowercase: true,
      gmail_remove_subaddress: true,
      outlookdotcom_lowercase: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_lowercase: true,
      yahoo_remove_subaddress: true,
      icloud_lowercase: true,
      icloud_remove_subaddress: true,
    });

    return _.isString(sanitized)
      ? <string>sanitized
      : '';
  },

  // Add custom validators here
});
