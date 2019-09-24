/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 2019-09-03 - 11:59 * */

export function randomString(length: number = 0): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
