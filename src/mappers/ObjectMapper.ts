/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import { mergeObject } from '../lib/HelperFunctions';
import { PathHelper } from '../lib/PathHelper';

export type TObjectMapperMapper<R> = (
  value: any,
  path: string,
  rootValue: R,
  paramMapper: ObjectMapper<R>,
) => any;

export type TObjectMapperMappers<R> = {
  path?: string;
  globalMapper?: TObjectMapperMapper<R>;     // Object mapping that gets applied to all values
  arrayMapper?: TObjectMapperMapper<R>;      // Object mapping that gets applied to arrays
  objectMapper?: TObjectMapperMapper<R>;     // Object mapping that gets applied to objects
  primitiveMapper?: TObjectMapperMapper<R>;  // Object mapping that gets applied to primitives
}

export class ObjectMapper<R> {
  private params?: TObjectMapperMappers<R>[];

  constructor() {
    this.params = [];
    this.map = this.map.bind(this);
    this.addAll = this.addAll.bind(this);
    this.add = this.add.bind(this);
    this.apply = this.apply.bind(this);
    this.getChildObjectMapper = this.getChildObjectMapper.bind(this);
  }

  static isParentPath(parentPath: string, childPath: string): boolean {
    if (_.isEmpty(childPath)) {
      return false;
    }
    if (childPath.includes(parentPath)) {
      return true;
    }
    if (_.isEmpty(parentPath) && !childPath.includes('.')) {
      return true;
    }
    return false;
  }

  map(path: string, mappers?: TObjectMapperMappers<R>): ObjectMapper<R> {
    return this.add({ ...mappers, path });
  }

  addAll(tmpOptions: { [path: string]: TObjectMapperMappers<R> } | string): ObjectMapper<R> {
    const mappers = _.isString(tmpOptions)
      ? JSON.parse(<string>tmpOptions)
      : tmpOptions;

    Object.keys(mappers).forEach(key => this.add({
      ...mappers[key],
      path: key,
    }));
    return this;
  }

  add(mappers?: TObjectMapperMappers<R>): ObjectMapper<R> {
    this.params.push(mappers);
    return this;
  }

  getChildObjectMapper(parentPath: string): ObjectMapper<any> {
    const childObjectMapper = new ObjectMapper<any>();

    this.params
      .filter(({ path: childPath }) => ObjectMapper.isParentPath(parentPath, childPath))
      .forEach(childObjectMapper.add);

    return childObjectMapper;
  }

  apply(data?: any): any {
    // Expand all the wildcards in the paths
    const expandedParams = PathHelper.expandWildcardsInItems(<{ path: string }[]>this.params, data);

    // Duplicate all the mappers to the children
    const duplicatedParamsObj = PathHelper.reduceParentToChildren(
      expandedParams.map(({ path }) => path),
      _.keyBy(expandedParams, 'path'),
      (acc, parentPath, childPath) => {
        const parentObj = _.get(acc, parentPath);
        if (parentObj != null) {
          acc[childPath] = {
            ..._.cloneDeep(parentObj),
            path: childPath,
          };
        }
        return acc;
      },
    );

    // For all params that are nested, apply
    const nestedMappedObject = Object.values(duplicatedParamsObj)
      .filter(({ path }) => !_.isEmpty(path))
      .reduce((acc, currentItem) => {
        const {
          path,
        } = currentItem;

        const mapped = this.applyMappers(data, currentItem, _.get(data, path));
        return mergeObject(acc, _.set({}, path, mapped));
      }, {});

    // For all params that have path equal to '' apply this to the root
    const rootMappedObject = this.params
      .filter(({ path }) => _.isEmpty(path))
      .reduce((acc, currentItem) => {
        return {
          ...acc,
          ...this.applyMappers(data, currentItem, data),
        };
      }, {});

    return {
      ...rootMappedObject,
      ...nestedMappedObject,
    };
  }

  private applyMappers(data: any, params: TObjectMapperMappers<R>, itemValue: any) {
    const {
      path,
      globalMapper,
      arrayMapper,
      objectMapper,
      primitiveMapper,
    } = params;

    const mappersToApply = [];

    // Always apply the global mapper
    globalMapper && mappersToApply.push(globalMapper);

    // Check for arrays before objects
    // Arrays are also objects and should mutually exclude
    if (_.isArray(itemValue)) {
      arrayMapper && mappersToApply.push(arrayMapper);

    } else if (_.isObject(itemValue)) {
      objectMapper && mappersToApply.push(objectMapper);

    } else {
      primitiveMapper && mappersToApply.push(primitiveMapper);
    }

    return mappersToApply
      .reduce((acc, mapper) => {
        const mapped = mapper(itemValue, path, data, this);
        return Object.assign(acc, mapped);
      }, {});
  }

}
