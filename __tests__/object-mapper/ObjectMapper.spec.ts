/** Created by Krishan Marco Madan [krishanmarco@outlook.com] [http://www.krishanmadan.com] [29-Jun-18|4:43 PM] © */
import {
  ObjectMapper,
} from '../../src';

function getObjectMapperMappers(initialRootValue) {
  return {
    arrayMapper: (_value: any, _path: string, rootValue: any) => {
      expect(rootValue).toEqual(initialRootValue);
      return {};
    },
    // globalMapper: (_value: any, _path: string, rootValue: any) => {
    //   expect(rootValue).toEqual(initialRootValue);
    //   return {
    //     g: 1,
    //   };
    // },
    // objectMapper: (_value: any, _path: string, rootValue: any) => {
    //   expect(rootValue).toEqual(initialRootValue);
    //   return {};
    // },
    // primitiveMapper: (_value: any, _path: string, rootValue: any) => {
    //   expect(rootValue).toEqual(initialRootValue);
    //   return 'primitive';
    // },
  };
}

describe('parsers/ObjectMapper', () => {

  it('Should map values correctly', () => {
    const initialRootValue = {
      a: { b: 1 },
      z: [1],
    };
    const mapped = new ObjectMapper()
      .map('', getObjectMapperMappers(initialRootValue))
      .apply(initialRootValue);
    console.log(mapped);
    // expect(mapped).toEqual({
    //   a: {}
    // });
  });

});
