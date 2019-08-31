/** Created by Krishan Marco Madan <krishanmarcomadan@gmail.com> 13/04/19 - 12.29 * */
import {ObjectMapper} from "./ObjectMapper";
import {buildReadWriteObjectMapper} from "./ReadWriteObjectMapper";
import {setToObjectFp} from "../lib/HelperFunctions";

export function applyReadWriteObjectMapper<R>(useState: Function, objectMapper: ObjectMapper<R>, initialState = {}) {
  const [data, setData] = useState(initialState);
  return objectMapper
    .map('', buildReadWriteObjectMapper((value, path) => {
      // Change and set the value into the hook
      setData(setToObjectFp(data, value, path));
    }))
    .apply(data);
}
