# object-param-parser

Extracts, validates and sanitizes values in an object

#### ParamParser API

##### Field extraction options
```js
// Options for the get
const options = {
  req?: boolean,                    // Default=true, if true and field is not set the error handler is invoked
  def?: any,                        // Default value
  as?: string,                      // Renames the field in the resulting object
  validate?: Function|Function[],   // Array of validators to apply, if any one fails the error handler is invoked
  sanitize?: Function|Function[],   // Array of sanitizers to apply
  onError?: Function,               // Custom error handler for this field only
};
```

##### get field
```js
const parser = new ParamParser();

// Path in the object to parse (lodash dot notation)
const path = 'body.email';

const { email } = parser
  .get(path, options)
  .parse({body: {email: 'email@example.com'}});

// email@example.com
console.log(email);
```

##### getAs field
```js
const parser = new ParamParser();

// Path in the object to parse (lodash dot notation)
const path = 'body.email';
const renameTo = 'userEmail';

const { userEmail } = parser
  .getAs(path, renameTo, options)
  .parse({body: {email: 'email@example.com'}});

// email@example.com
console.log(userEmail);
```

##### addDef field
```js
const parser = new ParamParser();

const { email } = parser
  .addDef({
    path: 'body.email',
    ...otherOptions
  })
  .parse({body: {email: 'email@example.com'}});

// email@example.com
console.log(email);
```

#### Express example
```js
router.get('/', (request, response) => {
  const { name, email, password } = Parser.httpParser()
    .get('body.name', {
      sanitize: val => val.length < 10
    })
    .get('body.email', {
      validate: Validators.isEmail,
      sanitize: Sanitizers.email,
    })
    .get('body.password')
    .parse(request);
});
```
