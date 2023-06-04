# fimd

small CLI utility tool tool to convert markdown files to Fimfiction BBCode. Still WIP.

## dependencies

A javascript runtime and a js package manager. When in doubt, install [node.js](https://nodejs.org), and npm comes bundled with node.js. This package will officially support latest node 18 and later major versions.

## install

Install with package manager of choice. The package is `fimd` on npm. For example:

```sh
npm install -g fimd
```

## usage

Simplest usage is to specify an input file and an output file:

```sh
fimd in.md out.txt
```

You may only supply an input file, then the output file will be printed to stdout, which will show up in the terminal and can also be piped.

```sh
fimd in.md
```

You can supply pairs of input and output files for bulk conversion. The amount of arguments must be even (ie. all input files must have one output file, so no printing to stdout).

```sh
fimd in1.md out1.txt input-2.md output-2.txt my-story.md my-story-converted.txt
```

### CLI options

#### `--file-encoding`

Sets input file encoding. Output is always in `utf-8`. Supported options are what node's `BufferEncoding` supports, which includes `ascii`, `utf8`, `utf16le`, `ucs2`, `base64`, `base64url`, `latin1`, `binary`, or `hex`. When in doubt, don't touch this.

## programmatic usage

Made it possible even though I dunno why you would. Installable as a standard npm package (`fimd`), ESM only, exposing the function `process_md` and the [remark](https://remark.js.org) plugin ([unified](https://unifiedjs.com) plugin???) `remark_fimd`.

### `process_md`

Takes one parameter, the markdown string to process, and returns a promise (`unified` API returns a promise for some reason) that resolves to the type `Result`:

```ts
type Success = {
   success: true;
   messages: Array<VFileMessage>; // import("vfile-message").VFileMessage
   result: string;
};

type Failure = {
   success: false;
   error: VFileMessage; // import("vfile-message").VFileMessage
};

type Result = Success | Failure;
```

### `remark_fimd`

See [this file](https://github.com/Meadowsys/fimd/blob/wiwi/src/lib/index.mjs#L13) for how its used within this package.
