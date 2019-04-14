/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';

export interface IParserErrors {
  RequiredPropNotSet: any;
  PropIsInvalid: any;
}

export interface IParserErrorBuilders extends IParserErrors {
  RequiredPropNotSet: (path: string, value: any) => ParserError;
  PropIsInvalid: (path: string, value: any) => ParserError;
}

export const ParserErrorCodes: IParserErrors = {
  RequiredPropNotSet: -1,
  PropIsInvalid: -2,
};

export const ParserErrorIds = _.invert(ParserErrorCodes);

export class ParserError extends Error {
  errorId: string;
  errorCode: number;

  constructor(message, errorCode = -1) {
    super(message);
    this.errorCode = errorCode;
    this.errorId = ParserErrorIds[this.errorCode];
  }
  

}
