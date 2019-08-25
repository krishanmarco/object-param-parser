/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';

export class PathHelper {

  static getParentPath(childPath: string): string | null {
    if (_.isEmpty(childPath)) {
      return null;
    }

    // Map the string path to access keys
    // Get parent by removing the last one
    // Map back to string path
    const parentPaths = PathHelper.pathToKeys(childPath);
    parentPaths.splice(-1);
    return !_.isEmpty(parentPaths)
      ? PathHelper.keysToPath(parentPaths)
      : "";
  }

  static isParentPath(inParentPath: string, inChildPath: string): boolean {
    if (_.isEmpty(inParentPath)) {
      return !_.isEmpty(inChildPath);
    }

    const [parentPaths, childPaths] = [inParentPath, inChildPath]
      .map(path => !_.isEmpty(path) ? path : '')
      .map(path => _.trim(path, '.'))
      .map(path => path.split('.'));

    if (childPaths.length === parentPaths.length) {
      return false;
    }

    for (let i = 0; i < parentPaths.length; i++) {
      if (parentPaths[i] !== childPaths[i]) {
        return false;
      }
    }

    return true;
  }

  static applyToExpandedSubPaths<T>(path: string, apply: (subPath: string) => T = _.identity): T[] {
    const keys = (_.trim(path, '.') || '').split('.');
    return keys.map((_, idx) => apply([...keys].splice(0, idx + 1).join('.')));
  }


  static reduceParentToChildren<T>(paths: string[],
                                   initialValue: T,
                                   apply: (acc: T, parentPath: string, childPath: string) => T): T {
    const subPaths = _(paths)
      .flatMap(path => PathHelper.applyToExpandedSubPaths(path))
      .map(PathHelper.pathToKeys)
      .sort((a, b) => (<any>a).length - (<any>b).length)
      .map(PathHelper.keysToPath)
      .uniq()
      .value();

    return (<any[]>subPaths).reduce((acc, childPath) => {
      return apply(acc, PathHelper.getParentPath(childPath), childPath);
    }, initialValue);
  }

  /**
   * [*] indicates generic array access
   * If path contains [*] then we need to expand that to the indexes in data
   * ---
   * @param path
   * @param data
   */
  static expandWildcardsInPath(path: string, data: any): string[] {
    const wildcard = '[*]';

    // Base case
    if (!path.includes(wildcard)) {
      return [path];
    }

    // Expand the paths
    const [p, ...rest] = path.split(wildcard);

    // Add an extractor for each sub-item
    const items = _.get(data, p, []);
    if (items.length === 0) {
      return [p];
    }

    // Recursively expand
    return _.flatMap(items, (_, idx) => {
      const expandedPath = `${p}[${idx}]${rest.join(wildcard)}`;
      return PathHelper.expandWildcardsInPath(expandedPath, data);
    });
  }

  static expandWildcardsInItems(params: { path: string }[], data?: any): any {
    return params.reduce((acc, currentItem) => {
      const expandedWildcards = PathHelper.expandWildcardsInPath(currentItem.path, data);

      expandedWildcards.forEach((expandedPath) => {
        acc.push({
          ..._.cloneDeep(currentItem),
          path: expandedPath,
        });
      });

      return acc;
    }, []);
  }

  static pathToKeys(path: string) {
    return _.trim(path, '.')
      .split(/\.|\[/)
      .map(x => _.trim(x, ']'));
  }

   static keysToPath(keys: string[]) {
    return (keys || []).reduce((str, value) => {
      if (str == null) {
        return value;
      }

      return !isNaN(<any>value)
        ? `${str}[${value}]`
        : `${str}.${value}`;

    }, null);
  }
}
