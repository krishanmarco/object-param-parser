/** Created by Krishan Marco Madan [krishanmarco@outlook.com] [http://www.krishanmadan.com] [29-Jun-18|4:43 PM] © */
import {
  Parser,
  ParamParser,
  Sanitizers,
  Validators,
  ParserHttpErrorRequiredPropNotSet
} from '../src';

describe('ParamParser', () => {

  it('Should parse values correctly', () => {
    const {a} = new ParamParser()
      .get('a.a.a')
      .parse({a: {a: {a: 'aaa'}}});
    expect(a).toBe('aaa');
  });

  it('Should rename values correctly', () => {
    const {ab} = new ParamParser()
      .getAs('a.b', 'ab')
      .parse({a: {b: 'ab'}});
    expect(ab).toBe('ab');
  });

  it('Should rename values correctly (nested)', () => {
    const val = new ParamParser()
      .getAs('a.b', 'b.a')
      .parse({a: {b: 'ab'}});
    expect(val).toEqual({b: {a: 'ab'}});
  });

  it('Should invoke error handler on required value not set', () => {
    const parser = new ParamParser()
      .withCustomErrorHandler(() => {
        throw new Error();
      })
      .get('a.b');
    expect(() => parser.parse({a: {b: null}})).toThrow();
  });

  it('Should not invoke error handler on required value not set', () => {
    const parser = new ParamParser()
      .withCustomErrorHandler(() => {
        throw new Error();
      })
      .get('a.b');
    expect(() => parser.parse({a: {b: 'a'}})).not.toThrow();
  });

  it('Should invoke custom error handler on required value not set and default error handler not set', () => {
    const parser = new ParamParser()
      .get('a.b', {
        onError: () => {
          throw new Error();
        },
      });
    expect(() => parser.parse({a: {b: null}})).toThrow();
  });

  it('Should use default value (constant)', () => {
    const {a} = new ParamParser()
      .get('a', {def: 'x'})
      .parse();
    expect(a).toBe('x');
  });

  it('Should use default value (function)', () => {
    const {a} = new ParamParser()
      .get('a', {def: () => 'x'})
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

  it('Should sanitize value', () => {
    const {a} = new ParamParser()
      .get('a', {
        sanitize: [(val) => val + 'y', (val) => val + 'z'],
      })
      .parse({a: 'x'});
    expect(a).toBe('xyz');
  });

  it('Should statically parse values', () => {
    const {a, b, c} = Parser.parse({
      a: {a: 'a'},
      b: {b: 'b'},
      d: {d: 'c'},
    }, [
      {path: 'a.a'},
      {path: 'b.b'},
      {path: 'd.d', as: 'c'},
    ]);
    expect(a).toBe('a');
    expect(b).toBe('b');
    expect(c).toBe('c');
  });

});

describe('ParamParser', () => {

  const parser = Parser.httpParser()
    .get('body.email', {
      sanitize: Sanitizers.email,
      validate: Validators.isEmail,
    })
    .get('body.secret', {
      validate: val => val.length > 5,
    })
    .get('body.name', {
      req: false,
      def: 'defaultName',
    })
    .getAs('user.auth', 'userAuth', {
      sanitize: value => value.replace('Bearer ', ''),
    })
    .getAs('realUser.auth', 'realUserAuth', {
      sanitize: value => value.replace('Bearer ', ''),
    });

  it('Should parse values correctly', () => {
    const {email, secret, name, userAuth, realUserAuth} = parser.parse({
      body: {
        email: 'krishanmarco+abc@gmail.com',
        secret: 'password',
        name: null,
      },
      user: {
        auth: 'Bearer userAuth',
      },
      realUser: {
        auth: 'Bearer realUserAuth',
      },
    });

    expect(email).toBe('krishanmarco@gmail.com');
    expect(secret).toBe('password');
    expect(name).toBe('defaultName');
    expect(userAuth).toBe('userAuth');
    expect(realUserAuth).toBe('realUserAuth');
  });

  it('Should throw HTTP errors correctly', () => {
    expect(() => parser.parse()).toThrow(ParserHttpErrorRequiredPropNotSet);
  });

  it('Should parse values correctly', () => {
    const {email, password} = Parser.parser()
      .addAll({
        'body.email': {},
        'body.secret': {
          as: 'password',
        },
      })
      .parse({
        body: {
          email: 'krishanmarco@gmail.com',
          secret: 'password',
        },
      });

    expect(email).toBe('krishanmarco@gmail.com');
    expect(password).toBe('password');
  });

  it('Should parse values from a JSON correctly (string version)', () => {
    const {email, password} = Parser.parser()
      .addAll(JSON.stringify({
        'body.email': {
          sanitize: 'email',
          validate: 'isEmail',
        },
        'body.secret': {
          as: 'password',
        },
      }))
      .parse({
        body: {
          email: 'krishanmarco+abc@gmail.com',
          secret: 'password',
        },
      });

    expect(email).toBe('krishanmarco@gmail.com');
    expect(password).toBe('password');
  });

  it('Should parse values from a JSON correctly (array builder version)', () => {
    const parser = Parser.parser()
      .withCustomErrorHandler(() => {
        throw new Error();
      })
      .addAll(JSON.stringify({
        'n': {
          validate: {f: 'range', p: {min: 0, max: 10}},
        }
      }));

    expect(() => parser.parse({n: 11})).toThrow();
    expect(() => parser.parse({n: -1})).toThrow();
    expect(() => parser.parse({n: 0})).not.toThrow();
    expect(() => parser.parse({n: 10})).not.toThrow();
  });

  it('Should parse values from a JSON correctly (array builder function version)', () => {
    const parser = Parser.parser()
      .withCustomErrorHandler(() => {
        throw new Error();
      })
      .addAll({
        'n': {
          validate: {
            f: ({min, max}) => (val) => val >= min && val <= max,
            p: {min: 0, max: 10, length: 10}
          },
        }
      });

    expect(() => parser.parse({n: 11})).toThrow();
    expect(() => parser.parse({n: -1})).toThrow();
    expect(() => parser.parse({n: 0})).not.toThrow();
    expect(() => parser.parse({n: 10})).not.toThrow();
  });

  it('Should validate with "oneOf"', () => {
    const parser = Parser.parser()
      .withCustomErrorHandler(() => {
        throw new Error();
      })
      .addAll({
        'n': {
          validate: {
            f: 'oneOf',
            p: {vals: ["a", "b", 1, 2]}
          },
        }
      });

    expect(() => parser.parse({n: null})).toThrow();
    expect(() => parser.parse({n: "1"})).toThrow();
    expect(() => parser.parse({n: "b"})).not.toThrow();
    expect(() => parser.parse({n: 2})).not.toThrow();
  });

  it('Should validate with "equals"', () => {
    const parser = Parser.parser()
      .withCustomErrorHandler(() => {
        throw new Error();
      })
      .addAll({
        'n': {
          validate: {
            f: 'equals',
            p: {val: "1234"}
          },
        }
      });

    expect(() => parser.parse({n: null})).toThrow();
    expect(() => parser.parse({n: ""})).toThrow();
    expect(() => parser.parse({n: "123"})).toThrow();
    expect(() => parser.parse({n: "1234"})).not.toThrow();
  });
});
