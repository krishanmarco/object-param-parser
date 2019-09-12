import _ from 'lodash';
import { ObjectMapper } from "object-param-parser";
import { randomString } from "./Functions";

/**
 * Setup the ObjectMapper definition, the final form should have the following structure:
 * {
 *   user: {
 *     email: 'user@example.com,
 *     password: '0123456789',
 *     age: 30
 *   },
 *   tags: ['tag1', 'tag2', 'tag3'],
 *   friends: ['friend1@example.com', 'friend2@example.com', 'friend2@example.com'],
 * }
 */
export const loginFormObjectMapper = new ObjectMapper()
  .map('user.email', {
    def: 'defaultUser@email.com',
    sanitize: 'email',
    validate: 'isEmail'
  })
  .map('user.password', {
    def: 'user.password default value',
    validate: {
      f: 'len',
      p: {min: 8, max: 10},
    },
  })
  .map('tags[*]', {
    def: 'tag default value',
    validate: (val) => _.isString(val) && val.startsWith('tag')
  })
  .map('friends[*].email', {
    def: 'friends.email default value',
    sanitize: 'email',
    validate: [
      'isEmail',
      (val) => val.length > 10
    ]
  });

/**
 * Common loginForm functions to share between
 * <LoginFormWithReactHooks /> and <LoginFormWithReduxConnect />
 */
export function getLoginFormButtons(loginForm) {
  return [
    {
      name: 'Set valid email',
      desc: 'Should change the email value',
      func: () => loginForm.user.email.setValue(`newEmail@example${randomString(3)}.com`)
    },
    {
      name: 'Try set invalid email',
      desc: 'Should NOT change the email value because validation fails',
      func: () => loginForm.user.email.setValue('invalidEmail')
    },
    {
      name: 'Set email null (default)',
      desc: 'Should revert to the default value',
      func: () => loginForm.user.email.setValue(null)
    },
    {
      name: 'Set valid pwd',
      desc: 'Should change the password value',
      func: () => loginForm.user.password.setValue(randomString(10))
    },
    {
      name: 'Try set invalid pwd',
      desc: 'Should NOT change the password value because validation fails',
      func: () => loginForm.user.password.setValue(randomString(2))
    },
    {
      name: 'Add valid tag',
      desc: 'Should add a tag to the end of the list',
      func: () => loginForm.tags.addOrPushItem(`tag${randomString(2)}`)
    },
    {
      name: 'Change 2nd tag',
      desc: 'Should fail to add a tag because validation fails',
      func: () => loginForm.tags.addOrPushItem(`tag${randomString(2)}`, 1)
    },
    {
      name: 'Try add invalid tag',
      desc: 'Should fail to add a tag because validation fails',
      func: () => loginForm.tags.addOrPushItem(randomString(2))
    },
    {
      name: 'Delete last tag',
      desc: 'Should delete the last tag from the list',
      func: () => loginForm.tags.removeOrPopItem()
    },
    {
      name: 'Delete 3rd tag',
      desc: 'Should delete the 3rd tag if present',
      func: () => loginForm.tags.removeOrPopItem(2)
    },
    {
      name: 'Add null friend',
      desc: 'Should add an email with default value',
      func: () => loginForm.friends.addOrPushItem(null)
    },
    {
      name: 'Add valid friend',
      desc: 'Should add an email to the list',
      func: () => loginForm.friends.addOrPushItem({email: `friend${randomString(2)}@example.com`})
    },
    {
      name: 'Try add invalid friend',
      desc: 'Should NOT add an email to the friends list because validation fails',
      func: () => loginForm.friends.addOrPushItem({email: `invalidEmail`})
    },
    {
      name: 'Change 1st friend',
      desc: 'Should edit the 1st email of the friends list if it\'s present',
      func: () => loginForm.friends.addOrPushItem({email: `friend${randomString(2)}@example.com`}, 0)  // todo
    }
  ];
}
