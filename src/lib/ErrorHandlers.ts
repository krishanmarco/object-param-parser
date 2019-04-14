/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import { ParserError } from '../errors/ParserError';
import { ParserHttpErrorBuilders } from '../errors/ParserHttpErrors';

export type TErrorHandler = (string, any, parserError: ParserError) => void;

export const ErrorHandlers: { [name: string]: TErrorHandler } = {

  http: function(path: string, value: any, parserError: ParserError) {
    // Map the generic ParserError to a ParserHttpErrorBuilder and throw
    throw ParserHttpErrorBuilders[parserError.errorId](path, value);
  },
};
