# flow2typescript

> Convert Flow source code to TypeScript

## Status

Experimental; but pretty advanced. Should save you significant time, but
you'll still need to do some things manually.

Doesn't support React code yet.

## Issue Policy

Hi, I'm @Benjie, an independent open source developer. My open source work is
funded by community sponsorship and client work. **This is not one of my core
projects**, so unless you [sponsor
me](https://github.com/users/benjie/sponsorship) or work on one of the open
source projects I am involved with or rely on then your feature requests may
be closed unless they come with an accompanying offer to send a PR.

If your company needs a particular feature, or a particular codebase
converted, please get in touch and we can discuss a fee for the work.

If you need to discuss your migration strategy, you can
[book an hour of screen-sharing with @Benjie](https://www.supersaas.co.uk/schedule/Benjie/One_on_One).

## Usage

Install this module globally:

```bash
npm install -g flow2typescript
# or
yarn global add flow2typescript
```

And then run it:

```bash
flow2typescript path/to/file.flow.js
```

The above will output the converted code to stdout.

We can also write the file for you, using one of the following equivalent
syntaxes:

```bash
flow2typescript path/to/file.flow.js path/to/file.ts
flow2typescript -i path/to/file.flow.js -o path/to/file.ts
flow2typescript --input path/to/file.flow.js --output path/to/file.ts
```

After running the conversion, I highly recommend that you run
[`prettier`](https://prettier.io/) against the resulting code, as the
indentation can be quite problematic otherwise.

### Programmatic

```js
import { compile } from 'flow2typescript'
import { readFileSync, writeFileSync } from 'fs'

let path = 'path/to/file.js.flow'
let file = readFileSync(path, 'utf-8')

compile(file, path).then(ts => writeFileSync('path/to/file.ts', ts))
```

## TypeScript vs. Flow

**THIS SECTION IS OUT OF DATE.**

### Features

| Done? |                     | Flow                             | TypeScript                            |
| ----- | ------------------- | -------------------------------- | ------------------------------------- |
| ✅    | Maybe               | `?type` (NullableTypeAnnotation) | `type \| null \| undefined`           |
| ✅    | Null                | `null`                           | `null`                                |
| ✅    | Undefined           | `typeof undefined`               | `undefined`                           |
| ✅    | Mixed               | `mixed`                          | `unknown`                             |
| ✅    | Void                | `void`                           | `void`                                |
| ✅    | Functions           | `(A, B) => C`                    | `(a: A, b: B) => C`                   |
| ⚔     | Predicates (0)      | `(a: A, b: B) => %checks`        | `(a: A, b: B) => C`                   |
| ⚔     | Predicates (1)      | `(a: A, b: B) => C %checks`      | `(a: A, b: B) => C`                   |
| ✅    | Exact types         | `{\| a: A \|}`                   | `{ a: A }`                            |
| ✅    | Indexers            | `{ [A]: B }`                     | `{ [a: A]: B }`                       |
| ✅    | Opaque types        | `opaque type A = B`              | `type A = B` (not expressible)        |
| ✅    | Variance            | `interface A { +b: B, -c: C }`   | `interface A { readonly b: B, c: C }` |
| ✅    | Bounds              | `<A: string>`                    | `<A extends string>`                  |
| ✅    | Casting             | `(a: A)`                         | `(a as A)`                            |
| ✅    | Import default type | `import type A from './b'`       | `import A from './b'`                 |
| ✅    | Import named type   | `import type { A } from './b'`   | `import { A } from './b'`             |

### Utilities

| Done? |                  | Flow                  | TypeScript                                                                   |
| ----- | ---------------- | --------------------- | ---------------------------------------------------------------------------- |
|       | Keys             | `$Keys<A>`            | `keyof A`                                                                    |
|       | Values           | `$Values<A>`          | `A[keyof A]`                                                                 |
| ✅    | ReadOnly         | `$ReadOnly<A>`        | `Readonly<A>`                                                                |
| ✅    | Exact            | `$Exact<A>`           | `A`                                                                          |
|       | Difference       | `$Diff<A, B>`         | TODO`                                                                        |
|       | Rest             | `$Rest<A, B>`         | `Exclude`                                                                    |
|       | Property type    | `$PropertyType<T, k>` | `T[k]`                                                                       |
|       | Element type     | `$ElementType<T, K>`  | `T[k]`                                                                       |
|       | Dependent type   | `$ObjMap<T, F>`       | TODO                                                                         |
|       | Mapped tuple     | `$TupleMap<T, F>`     | TODO                                                                         |
|       | Return type      | `$Call<F>`            | `ReturnType`                                                                 |
|       | Class            | `Class<A>`            | `typeof A`                                                                   |
|       | Supertype        | `$Supertype<A>`       | `any` (warn - vote for https://github.com/Microsoft/TypeScript/issues/14520) |
|       | Subtype          | `$Subtype<A>`         | `B extends A`                                                                |
|       | Existential type | `*`                   | `any` (warn - vote for https://github.com/Microsoft/TypeScript/issues/14466) |

✅ Done

⚔ Babylon doesn't support it (yet)

## Credits

This project is a fork of
[bcherny/flow-to-typescript](https://github.com/bcherny/flow-to-typescript)
which [diverged too far for the pull request to be merged](https://github.com/bcherny/flow-to-typescript/pull/12).

Huge props to @bcherny for the original heroic effort on this project!
