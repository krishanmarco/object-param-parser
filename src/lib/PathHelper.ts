/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';

export class PathHelper {
  static ARRAY_WILDCARD = '[*]';

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
    const keys = PathHelper.pathToKeys(path);
    return keys.map((_, idx) => {
      const childKeys = [...keys].splice(0, idx + 1);
      const childPath = PathHelper.keysToPath(childKeys);
      return apply(childPath)
    });
  }

  /**
   * [*] indicates generic array access
   * If path contains [*] then we need to expand that to the indexes in data
   * ---
   * @param path
   * @param data
   */
  static expandWildcardsInPath(path: string, data: any): string[] {
    // Base case
    if (!path.includes(PathHelper.ARRAY_WILDCARD)) {
      return [path];
    }

    // Expand the paths
    const [p, ...rest] = path.split(PathHelper.ARRAY_WILDCARD);

    // Add an extractor for each sub-item
    const items = _.get(data, p, []);
    if (items.length === 0) {
      return [p];
    }

    // Recursively expand
    return _.flatMap(items, (_, idx) => {
      const expandedPath = `${p}[${idx}]${rest.join(PathHelper.ARRAY_WILDCARD)}`;
      return PathHelper.expandWildcardsInPath(expandedPath, data);
    });
  }

  static reduceWildcardsInPaths<T>(paths: string[],
                                apply: Function,
                                data: any = {},
                                initialValue: T): T {
    return (<any[]>paths).reduce((acc, parentPath, index) => {
      const expandedWildcards = PathHelper.expandWildcardsInPath(parentPath, data);

      expandedWildcards.forEach((expandedPath) => {
        apply(acc, parentPath, expandedPath, index);
      });

      return acc;
    }, initialValue)
  }

  static reduceParentsToChildren<T>(paths: string[],
                                    apply: (acc: T, parentPath: string, childPath: string) => T,
                                    initialValue: T): T {
    // Expand each path to it's sub paths
    // Order by depth ASC (Parents first)
    // Make keys unique
    const subPaths = _(paths)
      .flatMap(path => PathHelper.applyToExpandedSubPaths(path))
      .map(PathHelper.pathToKeys)
      .sort((a, b) => (<any>a).length - (<any>b).length)
      .map(PathHelper.keysToPath)
      .uniq()
      .value();

    // Reduce ASC, this means that given a path (child) it's parent already
    // has it's final value
    return (<any[]>subPaths).reduce((acc, childPath) => {
      apply(acc, PathHelper.getParentPath(childPath), childPath);
      return acc;
    }, initialValue);
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
