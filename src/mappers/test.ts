import { ObjectMapper } from './ObjectMapper';
import { buildReadWriteObjectMapper } from './ReadWriteObjectMapper';

let value = {
  user: {
    email: 'krishanmarco@live.com'
  },
  tags: [0, 1, 2]
};

const objectMapper = new ObjectMapper()
  .map('', buildReadWriteObjectMapper(v => value = v))
  .map('user.email')
  .map('user.password')
  .map('tags[*]')
  .map('friends[*].email')
  .map('timezone');

const res = objectMapper.apply(value);
console.log(res);
