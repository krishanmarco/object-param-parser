/** Created by Krishan Marco Madan [krishanmarco@outlook.com] [http://www.krishanmadan.com] [29-Jun-18|4:43 PM] © */
import * as _ from 'lodash';
import { PathHelper } from '../../src/lib/PathHelper';

describe('lib/PathHelper', () => {

  it('Should correctly getParentPath', () => {
    expect(PathHelper.getParentPath('a.b.c')).toBe('a.b');
    expect(PathHelper.getParentPath('a')).toBe('');
    expect(PathHelper.getParentPath('a.b.')).toBe('a');
    expect(PathHelper.getParentPath(null)).toBe(null);
  });

  it('Should check if isParentPath correctly', () => {
    expect(PathHelper.isParentPath('', '')).toBe(false);
    expect(PathHelper.isParentPath('', 'user')).toBe(true);
    expect(PathHelper.isParentPath(null, 'user')).toBe(true);
    expect(PathHelper.isParentPath('user', 'user')).toBe(false);
    expect(PathHelper.isParentPath('.user', 'user')).toBe(false);
    expect(PathHelper.isParentPath('user.name', 'name')).toBe(false);
    expect(PathHelper.isParentPath('user', 'user2.name')).toBe(false);
    expect(PathHelper.isParentPath('user', 'tags.name')).toBe(false);
    expect(PathHelper.isParentPath('user', 'user.name')).toBe(true);
    expect(PathHelper.isParentPath('.user', 'user.name')).toBe(true);
    expect(PathHelper.isParentPath('user', 'user.name.a.b')).toBe(true);
    expect(PathHelper.isParentPath('user.name', 'user.name.a.b')).toBe(true);
  });

  it('Should reduceParentToChildren correctly', () => {
    expect(PathHelper.reduceParentToChildren(
      [
        'a',
        'a.b',
        'a.b.c.d',
        'b',
        'b.c.d',
      ],
      {
        a: 1,
        'b.c': 0,
      },
      (acc, parentPath, childPath) => {
        const parentObj = _.get(acc, parentPath);
        if (parentObj == null) {
          return acc;
        }

        // Dont use lodash, we want dot-notation as keys
        acc[childPath] = _.cloneDeep(parentObj);
        return acc;
      },
    )).toEqual({
      'a': 1,
      'a.b': 1,
      'a.b.c': 1,
      'a.b.c.d': 1,
      'b.c': 0,
      'b.c.d': 0,
    });
  });

  it('Should expandWildcardsInPath correctly', () => {
    expect(PathHelper.expandWildcardsInPath(
      'a[*]',
      { a: [0, 1, 2] },
    )).toEqual([
      'a[0]',
      'a[1]',
      'a[2]',
    ]);
    expect(PathHelper.expandWildcardsInPath(
      'v[*].b.x',
      { v: [0, 3, 1] },
    )).toEqual([
      'v[0].b.x',
      'v[1].b.x',
      'v[2].b.x',
    ]);
    expect(PathHelper.expandWildcardsInPath(
      'v[*].b[*].x',
      { v: [{b: [1]}, {b: [1, 2]}, {b: []}] },
    )).toEqual([
      'v[0].b[0].x',
      'v[1].b[0].x',
      'v[1].b[1].x',
      'v[2].b',
    ]);
    expect(PathHelper.expandWildcardsInPath(
      'v[*].b[*][*]',
      { v: [{b: [[0, 1], [0]]}, {b: [[], [], []]}, {b: []}] },
    )).toEqual([
      'v[0].b[0][0]',
      'v[0].b[0][1]',
      'v[0].b[1][0]',
      'v[1].b[0]',
      'v[1].b[1]',
      'v[1].b[2]',
      'v[2].b',
    ]);
  });

});
