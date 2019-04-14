/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import Validator from 'validator';
import _ from 'lodash';

export type TSanitizer = (any) => any;

export const Sanitizers = Object.assign(Validator, {

  email(email: string | null): string {
    const sanitized = Validator.normalizeEmail(Validator.trim(email), {
      all_lowercase: false,
      gmail_lowercase: true,
      gmail_remove_subaddress: true,
      outlookdotcom_lowercase: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_lowercase: true,
      yahoo_remove_subaddress: true,
      icloud_lowercase: true,
      icloud_remove_subaddress: true,
    });

    return _.isString(sanitized)
      ? <string>sanitized
      : '';
  },

  // Add custom validators here
});
