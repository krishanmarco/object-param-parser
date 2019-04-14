/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import { TValidator } from '../lib/Validators';
import { TSanitizer } from '../lib/Sanitizers';
import { TErrorHandler } from '../lib/ErrorHandlers';
import { ParserErrorCodes, ParserErrorIds } from '../errors/ParserError';
import { ParserErrorBuilders } from '../errors/ParserErrors';

export type TParamParserOptions = {
  path?: string,
  req?: boolean,
  def?: any | Function,
  as?: string,
  validate?: TValidator | Array<TValidator>,
  sanitize?: TSanitizer | Array<TSanitizer>,
  onError?: TErrorHandler,
}

export class ParamParser {
  private params?: Array<TParamParserOptions>;
  private onError?: TErrorHandler;

  constructor() {
    this.params = [];
    this.onError = null;
  }

  withCustomErrorHandler(onError: TErrorHandler): ParamParser {
    this.onError = onError;
    return this;
  }

  getAs(path: string, as: string, options?: TParamParserOptions): ParamParser {
    return this.get(path, { ...options, as });
  }

  get(path: string, options?: TParamParserOptions): ParamParser {
    return this.addDef({ ...options, path });
  }

  addDef(options?: TParamParserOptions): ParamParser {
    this.params.push(options);
    return this;
  }

  parse(data?: any): any {
    return (this.params || []).reduce((acc, options) => {
      const {
        path,
        req,
        def,
        as,
        validate,
        sanitize,
        onError,
      } = options;

      const errorHandler = (value: any, errorCode: number) => {
        const errorId = ParserErrorIds[errorCode];
        const parserError = ParserErrorBuilders[errorId](path, value);

        // Call the custom handler if defined
        _.isFunction(onError) && onError(path, value, parserError);

        // Call the default handler if defined
        _.isFunction(this.onError) && this.onError(path, value, parserError);
      };

      // Get value
      const defaultValue = _.isFunction(def)
        ? def()
        : def;

      const value = _.get(data, path) || defaultValue;

      // If value is null and required, error
      const required = req == null || req;
      if (value == null && required) {
        errorHandler(value, ParserErrorCodes.RequiredPropNotSet);
        return acc;
      }

      // Sanitize the value before validating because
      // the sanitizers may mutate the value
      // We also need to coerce the value before passing it to the sanitizer
      const sanitizedValue = sanitize != null
        ? _.castArray(sanitize).reduce((v, f) => f(v + ''), value)
        : value;

      // Validate
      const allValid = validate != null
        ? _.castArray(validate).reduce((v, f) => v && f(sanitizedValue), true)
        : true;

      if (!allValid) {
        errorHandler(sanitizedValue, ParserErrorCodes.PropIsInvalid);
        return acc;
      }

      // Get the key of the parameter (as or last piece of path)
      const key = _.isString(as)
        ? as
        : _.last(path.split('.'));

      // Set into result
      return _.set(acc, key, sanitizedValue);

    }, {});
  }
}
