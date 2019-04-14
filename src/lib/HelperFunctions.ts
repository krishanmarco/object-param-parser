/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 21/02/19 - 18.42 * */

export function tryOrDefault(call: Function, def?: any): any {
  try {
    return call();

  } catch (e) {
    return def;
  }
}
