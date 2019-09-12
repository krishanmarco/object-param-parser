/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import {ObjectMapper} from "./ObjectMapper";
import {buildReadWriteObjectMapper} from "./ReadWriteObjectMapper";
import {parseAndSetDataInObjectPurely} from "./ReadWriteObjectMapper";

export function applyReadWriteObjectMapper<R>(useState: Function, objectMapper: ObjectMapper<R>, initialState = {}) {
  const [data, setData] = useState(initialState);
  return objectMapper
    .map('', buildReadWriteObjectMapper((value, path) => {
      // Change and set the value into the hook
      setData(parseAndSetDataInObjectPurely(data, value, path, objectMapper));
    }))
    .apply(data);
}
