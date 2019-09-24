/** Created by Krishan Marco Madan [krishanmarco@outlook.com] [http://www.krishanmadan.com] [29-Jun-18|4:43 PM] © */
import {
  ParamParser,
  Parser,
  Validators,
} from '../../src';

describe('parsers/ParamParser', () => {

  it('Should parse values correctly', () => {
    const { a } = new ParamParser()
      .get('a.a.a')
      .parse({ a: { a: { a: 'aaa' } } });
    expect(a).toBe('aaa');
  });

  it('Should rename values correctly', () => {
    const { ab } = new ParamParser()
      .getAs('a.b', 'ab')
      .parse({ a: { b: 'ab' } });
    expect(ab).toBe('ab');
  });

  it('Should rename values correctly (nested)', () => {
    const val = new ParamParser()
      .getAs('a.b', 'b.a')
      .parse({ a: { b: 'ab' } });
    expect(val).toEqual({ b: { a: 'ab' } });
  });

  it('Should invoke error handler on required value not set', () => {
    const parser = new ParamParser()
      .withCustomErrorHandler(() => {
        throw new Error();
      })
      .get('a.b');
    expect(() => parser.parse({ a: { b: null } })).toThrow();
  });

  it('Should not invoke error handler on required value not set', () => {
    const parser = new ParamParser()
      .withCustomErrorHandler(() => {
        throw new Error();
      })
      .get('a.b');
    expect(() => parser.parse({ a: { b: 'a' } })).not.toThrow();
  });

  it('Should invoke custom error handler on required value not set and default error handler not set', () => {
    const parser = new ParamParser()
      .get('a.b', {
        onError: () => {
          throw new Error();
        },
      });
    expect(() => parser.parse({ a: { b: null } })).toThrow();
  });

  it('Should use default value (constant)', () => {
    const { a } = new ParamParser()
      .get('a', { def: 'x' })
      .parse();
    expect(a).toBe('x');
  });

  it('Should use default value (function)', () => {
    const { a } = new ParamParser()
      .get('a', { def: () => 'x' })
      .parse();
    expect(a).toBe('x');
  });

  it('Should validate value', () => {
    const parser = new ParamParser()
      .get('a', {
        validate: [(_) => false, (_) => true],
        onError: () => {
          throw new Error();
        },
      });
    expect(() => parser.parse()).toThrow();
  });

  it('Should not validate undefined if req=false', () => {
    const parser = new ParamParser()
      .get('a.b', {
        validate: Validators.isEmail,
        req: false,
      });
    expect(() => parser.parse({ a: {} })).not.toThrow();
  });

  it('Should sanitize value', () => {
    const { a } = new ParamParser()
      .get('a', {
        sanitize: [(val) => val + 'y', (val) => val + 'z'],
      })
      .parse({ a: 'x' });
    expect(a).toBe('xyz');
  });

  it('Should statically parse values', () => {
    const { a, b, c } = Parser.parse({
      a: { a: 'a' },
      b: { b: 'b' },
      d: { d: 'c' },
    }, [
      { path: 'a.a' },
      { path: 'b.b' },
      { path: 'd.d', as: 'c' },
    ]);
    expect(a).toBe('a');
    expect(b).toBe('b');
    expect(c).toBe('c');
  });

  it('Should statically parse values', () => {
    const { a, b, c } = Parser.parse({
      a: { a: 'a' },
      b: { b: 'b' },
      c: { c: 'c' },
    }, [
      {
        path: 'a.a',
        select: false,
      },
      {
        path: 'b.b',
        select: true,
      },
      {
        path: 'c.c',
      },
    ]);
    expect(a).toBeUndefined();
    expect(b).toBe('b');
    expect(c).toBe('c');
  });

});

describe('ParamParser (Form version)', () => {

  it('Should parse a JSON form def correctly (arrays)', () => {
    const result = Parser.create()
      .addAll(JSON.stringify({
        'users[*]': {},
        'users': {
          as: 'allowedUsers',
        },
      }))
      .parse({
        users: [
          { name: 'User1', email: 'user1@test.com' },
          { name: 'User2', email: 'user2@test.com' },
        ],
      });

    const { users, allowedUsers } = result;
    expect(users.length).toBe(2);
    expect(users[0]).toHaveProperty('email', 'user1@test.com');
    expect(users[0]).toHaveProperty('name', 'User1');
    expect(users[1]).toHaveProperty('email', 'user2@test.com');
    expect(users[1]).toHaveProperty('name', 'User2');

    expect(allowedUsers.length).toBe(2);
    expect(allowedUsers[0]).toHaveProperty('email', 'user1@test.com');
    expect(allowedUsers[0]).toHaveProperty('name', 'User1');
    expect(allowedUsers[1]).toHaveProperty('email', 'user2@test.com');
    expect(allowedUsers[1]).toHaveProperty('name', 'User2');
  });

  it('Should throw on invalid JSON form def (arrays)', () => {
    const parser = Parser.httpParser()
      .addAll(JSON.stringify({
        'users[*].email': {
          sanitize: 'email',
          validate: 'isEmail',
        },
      }));
    expect(() => {
      parser.parse({
        users: [
          { name: 'User1', email: 'user1@test.com' },
          { name: 'User2', email: 'invalidEmailAddress' },
        ],
      });
    }).toThrow();
  });

  it('Should parse a JSON form def correctly (nested arrays)', () => {
    const result = Parser.create()
      .addAll(JSON.stringify({
        'oldUsers[*].emails[*]': {
          sanitize: 'email',
          validate: 'isEmail',
        },
      }))
      .parse({
        oldUsers: [
          { emails: ['user-1@test.com', 'user--1@test.com', 'user---1@test.com'] },
          { emails: ['user-2@test.com', 'user--2@test.com', 'user---2@test.com'] },
        ],
      });
    const { emails } = result;
    expect(emails.length).toBe(6);
    expect(emails[0]).toBe('user-1@test.com');
    expect(emails[1]).toBe('user--1@test.com');
    expect(emails[2]).toBe('user---1@test.com');
    expect(emails[3]).toBe('user-2@test.com');
    expect(emails[4]).toBe('user--2@test.com');
    expect(emails[5]).toBe('user---2@test.com');
  });

  it('Should parse a JSON form def correctly (nested objects in arrays)', () => {
    const result = Parser.create()
      .addAll(JSON.stringify({
        'info[*]': {},
        'info[0]': {
          as: 'info0',
        },
        'info[0].test': {},
        'info[0].nonExistantValue': {
          req: false,
        },
        'info[1]': {
          as: 'info1',
          validate: {
            f: 'equals',
            p: { val: 'RandomString' },
          },
        },
        'info[3][2].email': {
          sanitize: 'email',
          validate: 'isEmail',
        },
      }))
      .parse({
        info: [
          { test: 'dynamic-object' },
          'RandomString',
          1,
          [
            'user3@test.com',
            'user3',
            { name: 'User4', email: 'user4@test.com' },
          ],
        ],
      });
    const {
      info,
      info0,
      test,
      nonExistantValue,
      info1,
      email,
    } = result;
    expect(info.length).toBe(4);
    expect(info0).toHaveProperty('test', 'dynamic-object');
    expect(test).toBe('dynamic-object');
    expect(nonExistantValue).toBeUndefined();
    expect(info1).toBe('RandomString');
    expect(email).toBe('user4@test.com');
  });
});
