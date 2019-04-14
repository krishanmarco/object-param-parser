/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import { IParserErrorBuilders } from './ParserError';
import { ParserErrorRequiredPropNotSet, ParserErrorPropIsInvalid } from './ParserErrors';

interface IParserHttpError {
  httpCode: number
}

export class ParserHttpErrorRequiredPropNotSet extends ParserErrorRequiredPropNotSet implements IParserHttpError {
  httpCode: number;

  constructor(path: string) {
    super(path);
    this.httpCode = 401;
  }
}

export class ParserHttpErrorPropIsInvalid extends ParserErrorPropIsInvalid implements IParserHttpError {
  httpCode: number;

  constructor(path: string, value: any) {
    super(path, value);
    this.httpCode = 401;
  }
}

export const ParserHttpErrorBuilders: IParserErrorBuilders = {
  PropIsInvalid: (path, _value) => new ParserHttpErrorRequiredPropNotSet(path),
  RequiredPropNotSet: (path, value) => new ParserHttpErrorPropIsInvalid(path, value),
};
