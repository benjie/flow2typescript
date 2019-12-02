# flow2typescript

> Convert Flow source code to TypeScript

## Status

Experimental; but pretty advanced. Should save you significant time, but
you'll still need to do some things manually.

Targetted at backend code; has not been tested against frontend code (React/Vue/etc).

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

## Credits

This project is a fork of
[bcherny/flow-to-typescript](https://github.com/bcherny/flow-to-typescript)
which [diverged too far for the pull request to be merged](https://github.com/bcherny/flow-to-typescript/pull/12).

Huge props to @bcherny for the original heroic effort on this project!
