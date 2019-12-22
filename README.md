![npm badge](https://img.shields.io/npm/v/object-param-parser)

# object-param-parser    
This library assists complex form handling in an easy and flexible way.    
It has two main components:    
    
* **ParamParser:** Extracts, validates and sanitizes values in an object. ParamParser can be used both client-side and server-side for data validation and sanitization purposes.  
* **ObjectMapper:** Maps one object structure to another. For example, with redux, we would want to map a value object `{email: ''}` to props that allow us to dispatch an 'edit email' action. To do this we could map our value `{email: ''}` to an object in the form of `{email: {value: '', set: event => dispatchSetEmailAction(event.target.value)}`.  
  
**ParamParser** and **ObjectMapper** can be used together to sanitize and validate values (`ParamParser`) before or after mapping them to other values (`ObjectMapper`).  
    
### ParamParser
|Option   |Type   |Optional   |Default   |   |  
|---|---|---|---|---|  
|`path`   |`string`   |No   |NA   |Path to this value in the parsed object (Dot notation)   |  
|`req`   |`boolean`   |Yes   |`true`   |True if this value is required   |  
|`def`   |`any`   |Yes   |`null`   |If the parsed object doesn't contain value at `path`, this value is used   |  
|`as`   |`string`   |Yes   |Same key as in the parsed object    |We can rename values in the resulting object using this new key|  
|`select`   |`boolean`   |Yes   |`true`   |If `false` this value is not returned in the resulting object|  
|`onError`   |`(Error) => Void`   |Yes   |`null`   |If specified and there is an error on this field, this callback will be called|
|`validate`   |`TParserMiddleware|TParserMiddleware[]`   |Yes   |`[]`   | Validators to apply to this field, if any fails the `onError` of this field will be called |  
|`sanitize`   |`TParserMiddleware|TParserMiddleware[]`   |Yes   |`[]`   | Sanitizers to apply to this field, cannot fail and should map input to a sanitized output|  


```js  
type TParserMiddleware = (value => boolean) // Custom validator function  
 | ((...params) => any) // Custom sanitizer function  
 | string // Validator or sanitizer function name
 | { f: any, p: any[] } // 'f': function name, 'p': parameters  
;  
```
 
##### [Required] path
```
// c === 1
const { c } = new ParamParser()
	.add({ path: 'a.b.c' })
	.parse({ a: { b: { c: 1 } } });
```

##### [Optional] req
```
// Will throw `err` because 'a.b.c' is not defined and 
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		req: true,
	})
	.withCustomErrorHandler(err => throw new Error(err))
	.parse({ a: { b: null } });
```

##### [Optional] def
```
// c === 1, will not throw `err` because `def` is supplied
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		def: 1,
	})
	.withCustomErrorHandler(err => throw new Error(err))
	.parse({ a: { b: null } });
```

##### [Optional] as
```
// x === 1, renamed `c` to `x`
const { x } = new ParamParser()
	.add({
		path: 'a.b.c',
		as: 'x',
	})
	.parse({ a: { b: { c: 1 } } });
```

##### [Optional] select
```
// c === undefined, will not select because `select` is false
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		select: false,
	})
	.parse({ a: { b: { c: 1 } } });
```

##### [Optional] onError
```
// c === undefined, will log 'Callback1' and then 'GlobalErrHandler' because 'a.b.c' is not defined
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		onError: err => console.log('Callback1'),
	})
	.withCustomErrorHandler(err => console.log('GlobalErrHandler'))
	.parse({ a: { b: null } });
```

##### [Optional] validate
```
// c === undefined, will log 'FieldErrHandler' then 'GlobalErrHandler' because `1 != false`
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		validate: c => c == false,
		onError: err => console.log('FieldErrHandler'),
	})
	.withCustomErrorHandler(err => console.log('GlobalErrHandler'))
	.parse({ a: { b: { c: 1 } } });
```
```
// c === undefined, will log 'FieldErrHandler' then 'GlobalErrHandler' because `1` is not an email
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		validate: 'isEmail',
		onError: err => console.log('FieldErrHandler'),
	})
	.withCustomErrorHandler(err => console.log('GlobalErrHandler'))
	.parse({ a: { b: { c: 1 } } });
```
```
// c === undefined, will log 'FieldErrHandler' then 'GlobalErrHandler' because `1` is not in the range [0, 0]
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		validate: { f: 'range', p: { min: 0, max: 0 }},
		onError: err => console.log('FieldErrHandler'),
	})
	.withCustomErrorHandler(err => console.log('GlobalErrHandler'))
	.parse({ a: { b: { c: 1 } } });
```
```
// c === undefined, will log 'FieldErrHandler' then 'GlobalErrHandler' because `1` is not included in [2, 3, 4]
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		validate: [
			{ f: 'range', p: { min: -1, max: 1 }},
			c => [2, 3, 4].includes(c)'
		],
		onError: err => console.log('FieldErrHandler'),
	})
	.withCustomErrorHandler(err => console.log('GlobalErrHandler'))
	.parse({ a: { b: { c: 1 } } });
```

##### [Optional] sanitize
```
// c === 'he110'
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		sanitize: c => c.replace(/l/g, '1').replace(/o/g, '0')
	})
	.parse({ a: { b: { c: 'hello' } } });
```
```
// c === 'example@example.com'
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		sanitize: 'email'
	})
	.parse({ a: { b: { c: 'example+123@example.com' } } });
```
```
// c === 'examp1e@examp1e.c0m'
const { c } = new ParamParser()
	.add({
		path: 'a.b.c',
		sanitize: [
			'email',
			c => c.replace(/l/g, '1').replace(/o/g, '0')
		]
	})
	.parse({ a: { b: { c: 'example+123@example.com' } } });
```

### ObjectMapper

The `ObjectMapper` supports all properties from `ParamParser` except from `select` and `as`.
This means we can map and validate/sanitize fields but we can't rename or not select them.


export type TObjectMapperMapper<R> = (
  value: any,
  path: string,
  rootValue: R,
  paramMapper: ObjectMapper<R>,
) => any

export type TObjectMapperMappers<R> = TParamParserOptions & {
  globalMapper?: TObjectMapperMapper<R>;     // Object mapping that gets applied to all values
  arrayMapper?: TObjectMapperMapper<R>;      // Object mapping that gets applied to arrays
  objectMapper?: TObjectMapperMapper<R>;     // Object mapping that gets applied to objects
  primitiveMapper?: TObjectMapperMapper<R>;  // Object mapping that gets applied to primitives
}

|Option   |Type   |Optional   |   |  
|---|---|---|---|  
|`globalMapper`   |`TObjectMapperMappers`   |Yes   |Mapper applied to all child fields |
|`arrayMapper`   |`TObjectMapperMappers`   |Yes   |Mapper applied to all child fields if arrays |
|`objectMapper`   |`TObjectMapperMappers`   |Yes   |Mapper applied to all child fields if objects (Arrays excluded) |
|`primitiveMapper`   |`TObjectMapperMappers`   |Yes   |Mapper applied to all child fields if primitive (number, string, boolean, ...) |

```js  
type TObjectMapperMappers<R> = ( // Custom mapper function
    value: any,
    path: string,
    rootValue: R,
    paramMapper: ObjectMapper<R>,
) => any;  
```
