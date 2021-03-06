/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import {Sanitizers, Validators} from '../';
import {ParserErrorCodes, ParserErrorIds} from '../errors/ParserError';
import {ParserErrorBuilders} from '../errors/ParserErrors';
import {TErrorHandler} from '../lib/ErrorHandlers';
import {Handler, TParserMiddleware} from '../lib/Handler';
import {PathHelper} from '../lib/PathHelper';
import {safeInsertValueToPath} from "../lib/HelperFunctions";

export type TParamParserOptions = {
  path?: string;
  req?: boolean;
  def?: any | Function;
  as?: string;
  select?: boolean;
  validate?: TParserMiddleware | TParserMiddleware[];
  sanitize?: TParserMiddleware | TParserMiddleware[];
  onError?: TErrorHandler;
}

export class ParamParser {
  private params?: TParamParserOptions[];
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

  addAll(tmpOptions: { [path: string]: TParamParserOptions } | string): ParamParser {
    const options = _.isString(tmpOptions)
      ? JSON.parse(<string>tmpOptions)
      : tmpOptions;

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
    // Normalize this.params and pass to parseParams
    const params = PathHelper.reduceWildcardsInPaths(
      _.map(this.params, 'path'),
      (acc, _parentPath, expandedPath, index) => {
        acc.push({
          ..._.cloneDeep(this.params[index]),
          path: expandedPath
        });
        return acc;
      },
      data,
      []
    );

    return this.parseParams(<{ path: string }[]>params, data);
  }

  private parseParams(params: TParamParserOptions[], data?: any): any {
    return (params || []).reduce((acc, options) => {
      const {
        path,
        req,
        def,
        as,
        select,
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

      const tmpValue = _.get(data, path);
      const value = tmpValue != null
        ? tmpValue
        : defaultValue;

      // If value is null and required, error
      const required = req == null || req;
      if (value == null) {
        if (required) {
          errorHandler(value, ParserErrorCodes.RequiredPropNotSet);
        }
        return acc;
      }

      // Sanitize the value before validating because
      // the sanitizers may mutate the value
      // We also need to coerce the value before passing it to the sanitizer
      const sanitizedValue = Handler
        .reduceHandler(sanitize, (v, f) => Sanitizers.invoke(f, `${v}`), value);

      // Validate
      const allValid = Handler
        .reduceHandler(validate, (v, f) => v && Validators.invoke(f, sanitizedValue), true);

      if (!allValid) {
        errorHandler(sanitizedValue, ParserErrorCodes.PropIsInvalid);
        return acc;
      }

      if (select != null && !select) {
        return acc;
      }

      // Get the key of the parameter (as or last piece of path)
      const key = _.isString(as)
        ? as
        : _.last(path.split('.'));

      // Set into result
      const mergeObj = safeInsertValueToPath(sanitizedValue, key);
      const merged = _.mergeWith(acc, mergeObj, (objValue, srcValue) => {
        if (_.isArray(objValue)) {
          return objValue
            .concat(srcValue)
            .filter(x => x != null);
        }
        return undefined;
      });
      return merged;
    }, {});
  }
}
