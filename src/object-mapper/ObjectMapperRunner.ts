/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import {mergeObjectWithConcat, safeInsertValueToPath, safePathGet} from '../lib/HelperFunctions';
import {PathHelper} from '../lib/PathHelper';
import {Parser} from "../parsers/Parser";
import {
  ObjectMapper,
  TObjectMapperMapper,
  TObjectMapperMappers as _TObjectMapperMappers
} from "./ObjectMapper";

type TObjectMapperMappers<R> = _TObjectMapperMappers<R> & {
  path: string
};

type TParams<R> = {
  [path: string]: TObjectMapperMappers<R>
}

export class ObjectMapperRunner<R> {
  private parentObjectMapper: ObjectMapper<R>;

  // Original parameters
  private paramsObj?: TParams<R>;

  // Original parameters with wildcards like [*]
  // expanded based on data
  private expandedParamsObj: TParams<R>;

  // Original parameters with mappers copied
  // to all empty child items, based on data
  private fullParamsObj: TParams<R>;

  // Original data to map
  private data: any;

  constructor(parentObjectMapper: ObjectMapper<R>, params: TParams<R>, data: any) {
    this.parentToChildrenReducer = this.parentToChildrenReducer.bind(this);
    this.expandWildcardsReducer = this.expandWildcardsReducer.bind(this);

    this.parentObjectMapper = parentObjectMapper;
    this.paramsObj = params;
    this.data = data;

    // Expand wildcards
    this.expandedParamsObj = PathHelper.reduceWildcardsInPaths(
      Object.keys(this.paramsObj),            // Paths
      this.expandWildcardsReducer,            // What to do for each found wildcard
      this.data,                              // Data to use as mapping base
      {}                                      // Initial value
    );

    // Copy values to empty children paths
    this.fullParamsObj = PathHelper.reduceParentsToChildren(
      Object.keys(this.expandedParamsObj),    // Paths
      this.parentToChildrenReducer,           // What to do for each parent-child tuple
      _.cloneDeep(this.expandedParamsObj),    // Initial value
    );
  }

  apply(): any {
    // For all params that are nested, apply
    return Object.values(this.fullParamsObj)
      .reduce((acc, params: TObjectMapperMappers<R>) => {
        const {
          path,
        } = params;

        // Apply the mappers
        const mapped = this.applyMappers(params);

        // Expand the item into a new object
        const expanded = safeInsertValueToPath(mapped, path);

        // Return the merged result
        return _.merge(acc, expanded);
      }, {});
  }

  parse(): any {
      return Parser.parse(this.data, _(this.expandedParamsObj)
      .values()
      .map(item => ({
        ...item,
        as: item.path,
        select: true,
      }))
      .value());
  }

  private parentToChildrenReducer(acc, parentPath, childPath) {
    const parentObj = _.get(acc, parentPath);
    const childObj = this.expandedParamsObj[childPath];

    if (parentObj != null) {
      acc[childPath] = {
        ..._.cloneDeep(parentObj),
        ...(childObj != null ? childObj : {}),
        path: childPath,
      };
    }

    return acc;
  }

  private expandWildcardsReducer(acc, parentPath, expandedPath) {
    acc[expandedPath] = {
      ..._.cloneDeep(this.paramsObj[parentPath]),
      path: expandedPath
    };
    return acc;
  }

  private applyMappers(params: TObjectMapperMappers<R>) {
    const {
      path,
      def,
      globalMapper,
      arrayMapper,
      objectMapper,
      primitiveMapper,
    } = params;

    const value = safePathGet(this.data, path, def);

    const mappersToApply = [];

    // Always apply the global mapper
    globalMapper && mappersToApply.push(globalMapper);

    // Check for arrays before objects
    // Arrays are also objects and should mutually exclude
    if (this.isItemArray(value, path)) {
      arrayMapper && mappersToApply.push(arrayMapper);

    } else if (_.isObject(value)) {
      objectMapper && mappersToApply.push(objectMapper);

    } else {
      primitiveMapper && mappersToApply.push(primitiveMapper);
    }

    return mappersToApply.reduce((acc, apply: TObjectMapperMapper<R>) => {
      const mapped = apply(value, path, this.data, this.parentObjectMapper);
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
    const allPaths = Object.keys(this.paramsObj);
    return _.some(allPaths, (paramPath) => {
      // If this is true in any case we can say this item is an array
      return paramPath.startsWith(`${path}[`);
    })
  }
}
