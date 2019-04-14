/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import Validator from 'validator';

export type TValidator = (any) => boolean;

export const Validators = Object.assign(Validator, {

  isEthTransactionId(value?: string): boolean {
    return this.isHexadecimal(value) && value.length == 64;
  },

  isEthPrivateKey(value?: string): boolean {
    return this.isHexadecimal(value) && value.length == 128;
  },

  isEthPublicKey(value?: string): boolean {
    return this.isHexadecimal(value) && value.length == 64;
  },

  // Add custom validators here
});
