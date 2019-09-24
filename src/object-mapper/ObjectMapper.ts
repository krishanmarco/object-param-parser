/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import { PathHelper } from '../lib/PathHelper';
import { TParamParserOptions } from "../parsers/ParamParser";
import {ObjectMapperRunner} from "./ObjectMapperRunner";

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

  map(path: string, mappers?: TObjectMapperMappers<R>): ObjectMapper<R> {
    return this.add({ ...mappers, path });
  }

  addAll(mappers: { [path: string]: TObjectMapperMappers<R> } | string): ObjectMapper<R> {
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
      .filter(({ path: childPath }) => PathHelper.isParentPath(parentPath, childPath))
      .forEach(childObjectMapper.add);

    return childObjectMapper;
  }

  apply(data?: any): any {
    return new ObjectMapperRunner<R>(this, <any>this.params, data)
      .apply();
  }

  parse(data?: any): any {
    return new ObjectMapperRunner<R>(this, <any>this.params, data)
      .parse();
  }
}
