/** Created by Krishan Marco Madan [krishanmarco@outlook.com] [http://www.krishanmadan.com] [29-Jun-18|4:43 PM] © */
import { ParamParser } from '../src';

describe('ParamParser', () => {

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
        validate: (_) => false,
        onError: () => {
          throw new Error();
        },
      });
    expect(() => parser.parse()).toThrow();
  });

  it('Should sanitize value', () => {
    const { a } = new ParamParser()
      .get('a', {
        sanitize: (val) => val + 'x',
      })
      .parse({ a: 'x' });
    expect(a).toBe('xx');
  });

  it('Should statically parse values', () => {
    const { a, b, c } = ParamParser.parseObject({
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

});
