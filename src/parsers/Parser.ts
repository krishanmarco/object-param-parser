/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import { ParamParser, TParamParserOptions } from './ParamParser';
import { ErrorHandlers } from '../lib/ErrorHandlers';

export class Parser {

  static parse(object: any, params: Array<TParamParserOptions>): any {
    return params
      .reduce((paramParser, option) => paramParser.addDef(option), new ParamParser())
      .parse(object);
  }

  static parser(): ParamParser {
    return new ParamParser();
  }

  static httpParser(): ParamParser {
    return new ParamParser()
      .withCustomErrorHandler(ErrorHandlers.http);
  }
}
