import { buildReduxReadWriteObjectMapper } from './Store';
import { ObjectMapper } from './lib/om/dist/mappers/ObjectMapper';

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

export function getLoginFormObjectMapper(loginFormValue, dispatch) {
  return new ObjectMapper()
    .map('', buildReduxReadWriteObjectMapper('something', dispatch))
    .map('user.email')
    .map('user.password')
    .map('tags[*]')
    .map('friends[*].email')
    .map('timezone')
    .apply(loginFormValue);
}

// console.log(loginFormObjectMapper.apply(value));
