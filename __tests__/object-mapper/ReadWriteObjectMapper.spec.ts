/** Created by Krishan Marco Madan [krishanmarco@outlook.com] [http://www.krishanmadan.com] [29-Jun-18|4:43 PM] © */
import {parseAndSetDataInObjectPurely} from "../../src/object-mapper/ReadWriteObjectMapper";

describe('object-mapper/ReadWriteObjectMapper', () => {

  it('Should correctly parseAndSetDataInObjectPurely', () => {
    const initialState = {a: 'a'};
    const initialValue = 'b';
    const path = 'a';
    const expectedResult = {a: 'b'};
    expect(parseAndSetDataInObjectPurely(initialState, initialValue, path)).toEqual(expectedResult);
  });

});
