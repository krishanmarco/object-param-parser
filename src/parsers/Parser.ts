/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import { ErrorHandlers } from '../lib/ErrorHandlers';
import { ParamParser, TParamParserOptions } from './ParamParser';

export class Parser {

  static parse(object: any, params: TParamParserOptions[]): any {
    return params
      .reduce((paramParser, option) => paramParser.add(option), new ParamParser())
      .parse(object);
  }

  static create(): ParamParser {
    return new ParamParser();
  }

  static httpParser(): ParamParser {
    return new ParamParser()
      .withCustomErrorHandler(ErrorHandlers.http);
  }
}
