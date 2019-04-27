/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';

export type TParserMiddleware = ((...params) => any)
  | string
  | { f: any, p: any[] }
  | any;

type TReducerHandler = TParserMiddleware
  | Array<TParserMiddleware>
  | null;

export interface IParserMiddlewares {
  Builders: {
    [builderName: string]: (...builderParams) => (...handlerParams) => any
  };
  invoke: (...invokeParams) => any;

  [handlers: string]: any;
}

export class Handler {
  static invokeOrHandle(handler: TParserMiddleware,
                        params: any[],
                        handlerObj?: IParserMiddlewares,
                        defaultVal?: any): any {
    if (_.isFunction(handler)) {
      const func = <(...params) => any>handler;
      return func(...params);
    }

    // handler is not a function so it's either:
    // - a string (name of handler)
    // - an array (name of the builder of a handler + params)
    if (_.isString(handler)) {
      const funcName = <string>handler;
      return handlerObj[funcName](...params)
    }

    // handler is an object({f, p}) else default value
    if (_.isObject(handler)) {
      const {f: funcBuilder, p: funcBuilderParamsAsObj} = <{ f, p }>handler;

      return _.isFunction(funcBuilder)
        ? funcBuilder(funcBuilderParamsAsObj)(...params)
        : handlerObj.Builders[funcBuilder](funcBuilderParamsAsObj)(...params);
    }

    return defaultVal;
  }

  static reduceHandler<I, O>(handler: TReducerHandler, reducer: (O, I) => O, initVal: O): O {
    return handler != null
      ? _.castArray(handler).reduce(reducer, initVal)
      : initVal;
  }
}

