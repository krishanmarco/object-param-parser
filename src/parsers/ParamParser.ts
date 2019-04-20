/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import {TErrorHandler} from '../lib/ErrorHandlers';
import {ParserErrorCodes, ParserErrorIds} from '../errors/ParserError';
import {ParserErrorBuilders} from '../errors/ParserErrors';
import {Sanitizers, Validators} from "../";
import {Handler, TParserMiddleware} from "../lib/Handler";

export type TParamParserOptions = {
  path?: string,
  req?: boolean,
  def?: any | Function,
  as?: string,
  validate?: TParserMiddleware | Array<TParserMiddleware>,
  sanitize?: TParserMiddleware | Array<TParserMiddleware>,
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
    return this.get(path, {...options, as});
  }

  get(path: string, options?: TParamParserOptions): ParamParser {
    return this.add({...options, path});
  }

  addAll(_options: { [path: string]: TParamParserOptions } | string): ParamParser {
    const options = _.isString(_options)
      ? JSON.parse(<string>_options)
      : _options;

    Object.keys(options).forEach(key => this.add({
      ...options[key],
      path: key,
    }));
    return this;
  }

  add(options?: TParamParserOptions): ParamParser {
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

      const _value = _.get(data, path);
      const value = _value != null
        ? _value
        : defaultValue;

      // If value is null and required, error
      const required = req == null || req;
      if (value == null && required) {
        errorHandler(value, ParserErrorCodes.RequiredPropNotSet);
        return acc;
      }

      // Sanitize the value before validating because
      // the sanitizers may mutate the value
      // We also need to coerce the value before passing it to the sanitizer
      const sanitizedValue = Handler
        .reduceHandler(sanitize, (v, f) => Sanitizers.invoke(f, v + ''), value);

      // Validate
      const allValid = Handler
        .reduceHandler(validate, (v, f) => v && Validators.invoke(f, sanitizedValue), true);

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
