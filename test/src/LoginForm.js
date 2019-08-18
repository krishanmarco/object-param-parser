import { ObjectMapper } from '../../src/mappers/ObjectMapper';
import { buildReadWriteObjectMapper } from '../../src/mappers/ReadWriteObjectMapper';

export const LoginFormSchema = {
  'user.email': {
    sanitize: 'email',
    validate: 'isEmail',
  },
  'user.password': {
    //
  },
  'tags[*]': {
    validate: {
      f: 'oneOf',
      p: {
        vals: [
          'tag1',
          'tag2',
        ],
      },
    },
  },
  'friends[*].email': {
    sanitize: 'email',
    validate: 'isEmail',
  },
  'timezone': {
    validate: {
      f: 'range',
      p: {
        min: 0,
        max: 1,
      },
    },
  },
};

let value = {
  user: {
    email: 'krishanmarco@live.com'
  }
};
//
// const objectMapper = new ObjectMapper()
//   .map('', buildReadWriteObjectMapper(v => value = v))
//   .map('user.email')
//   .map('user.password')
//   .map('tags[*]')
//   .map('friends[*].email')
//   .map('timezone');
//
// // console.log(objectMapper.apply(value));
