/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import * as _ from 'lodash';
import * as _fp from 'lodash/fp';
import {ObjectMapper} from "./ObjectMapper";
import {buildReadWriteObjectMapper} from "./ReadWriteObjectMapper";

export function applyReadWriteObjectMapper<R>(useState: Function, objectMapper: ObjectMapper<R>, initialState = {}) {
  const [data, setData] = useState(initialState);
  return objectMapper
    .map('', buildReadWriteObjectMapper((value, path) => {
      // Change the value in the object
      const newData = !_.isEmpty(path)
        ? _fp.set(path, value, data)
        : {...value};

      // Set the value into the hook
      setData(newData);
    }))
    .apply(data);
}
