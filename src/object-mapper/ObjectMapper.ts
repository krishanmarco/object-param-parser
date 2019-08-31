/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import { mergeObjectWithConcat, safeInsertValueToPath, safePathGet } from '../lib/HelperFunctions';
import { PathHelper } from '../lib/PathHelper';
import { TParamParserOptions } from "../parsers/ParamParser";
import { Parser } from "../parsers/Parser";

export type TObjectMapperMapper<R> = (
  value: any,
  path: string,
  rootValue: R,
  paramMapper: ObjectMapper<R>,
) => any

export type TObjectMapperMappers<R> = TParamParserOptions & {
  globalMapper?: TObjectMapperMapper<R>;     // Object mapping that gets applied to all values
  arrayMapper?: TObjectMapperMapper<R>;      // Object mapping that gets applied to arrays
  objectMapper?: TObjectMapperMapper<R>;     // Object mapping that gets applied to objects
  primitiveMapper?: TObjectMapperMapper<R>;  // Object mapping that gets applied to primitives
}

export class ObjectMapper<R> {
  private params?: {[path: string]: TObjectMapperMappers<R>};

  constructor() {
    this.params = {};
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
    this.params[mappers.path || ''] = mappers;
    return this;
  }

  getChildObjectMapper(parentPath: string): ObjectMapper<any> {
    const childObjectMapper = new ObjectMapper<any>();

    Object.values(this.params)
      .filter(({ path: childPath }) => ObjectMapper.isParentPath(parentPath, childPath))
      .forEach(childObjectMapper.add);

    return childObjectMapper;
  }

  apply(data?: any): any {
    // Expand all the wildcards in the paths
    const paramsArr = <{ path: string }[]>Object.values(this.params);
    const expandedParams = PathHelper.expandWildcardsInItems(paramsArr, data);

    // Duplicate all the mappers to the children
    const keyedExpandedParams = _.keyBy(expandedParams, 'path');
    const extendedParamsObj = PathHelper.reduceParentToChildren(
      _.map(expandedParams, 'path'),
      keyedExpandedParams,
      (acc, parentPath, childPath) => {
        const parentObj = _.get(acc, parentPath);
        const childObj = keyedExpandedParams[childPath];

        if (parentObj != null) {
          acc[childPath] = {
            ..._.cloneDeep(parentObj),
            ...(childObj != null ? childObj : {}),
            path: childPath,
          };
        }

        return acc;
      },
    );

    // Override'as' and 'select', these are disabled in ObjectMapper
    // Setting 'as' to path will mean that the result structure can't be changed
    const parserParams = _(expandedParams)
      .map(item => ({
        ...item,
        as: item.path,
        select: true,
      }))
      .reverse()
      .value();

    // Apply the ParamParser to the params, don't use the extended params
    const parsedData = Parser.parse(data, parserParams);
    console.log(parserParams, data, parsedData);

    // For all params that are nested, apply
    const nestedMappedObject = Object.values(extendedParamsObj)
      .reduce((acc, params: TObjectMapperMappers<R>) => {
        const {
          def,
          path,
        } = params;
        const itemValue = safePathGet(parsedData, path, def);

        // Apply the mappers
        const mapped = this.applyMappers(parsedData, params, itemValue);

        // Expand the item into a new object
        const expanded = safeInsertValueToPath(mapped, path);

        // Return the merged result
        return _.merge(acc, expanded);
      }, {});

    return nestedMappedObject;
  }

  private applyMappers(data: any, params: TObjectMapperMappers<R>, itemValue: any) {
    const {
      path,
      def,
      globalMapper,
      arrayMapper,
      objectMapper,
      primitiveMapper,
    } = params;

    const value = itemValue != null
      ? itemValue
      : def;

    const mappersToApply = [];

    // Always apply the global mapper
    globalMapper && mappersToApply.push(globalMapper);

    // Check for arrays before objects
    // Arrays are also objects and should mutually exclude
    if (this.isItemArray(itemValue, path)) {
      arrayMapper && mappersToApply.push(arrayMapper);

    } else if (_.isObject(itemValue)) {
      objectMapper && mappersToApply.push(objectMapper);

    } else {
      primitiveMapper && mappersToApply.push(primitiveMapper);
    }

    return mappersToApply.reduce((acc, apply: TObjectMapperMapper<R>) => {
      const mapped = apply(value, path, data, this);
      return mergeObjectWithConcat(acc, mapped);
    }, {});
  }

  private isItemArray(value: any, path: string): boolean {
    // If this value is an array then we already know
    if (_.isArray(value)) {
      return true;
    }

    // The item is not an array so it's most likely null
    // Try figure out if it's an array based on the path
    const allPaths = Object.keys(this.params);
    return _.some(allPaths, (paramPath) => {
      // If this is true in any case we can say this item is an array
      return paramPath.startsWith(`${path}[`);
    })
  }

}
