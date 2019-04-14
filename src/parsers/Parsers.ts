/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import { ParamParser, TParamParserOptions } from './ParamParser';

export class Parsers {

  static parse(object: any, params: Array<TParamParserOptions>): any {
    return params
      .reduce((paramParser, option) => paramParser.addDef(option), new ParamParser())
      .parse(object);
  }


}
