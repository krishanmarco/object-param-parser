/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import { IParserErrorBuilders, ParserError, ParserErrorCodes } from './ParserError';

export class ParserErrorRequiredPropNotSet extends ParserError {
  constructor(path: string) {
    super(
      `The required property at path(${path}) was not set or null`,
      ParserErrorCodes.RequiredPropNotSet,
    );
  }
}

export class ParserErrorPropIsInvalid extends ParserError {
  constructor(path: string, value: any) {
    super(
      `The property at path(${path}) with value(${value}) was not valid`,
      ParserErrorCodes.PropIsInvalid,
    );
  }
}

export const ParserErrorBuilders: IParserErrorBuilders = {
  PropIsInvalid: (path, _value) => new ParserErrorRequiredPropNotSet(path),
  RequiredPropNotSet: (path, value) => new ParserErrorPropIsInvalid(path, value),
};
