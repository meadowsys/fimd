#!/usr/bin/env node
// @ts-check

import { process_md } from "./lib/index.mjs";
import fs from "fs";
import k from "kleur";
import minimist from "minimist";
import path from "path";

const help_message = `
Behold, my by-example help message. Totally not copy pasted from the project readme. >.>
Project repo: https://github.com/Meadowsys/fimd

Simplest usage is to specify an input file and an output file:

   ${k.blue("fimd")} ${k.cyan("in.md out.txt")}

You can supply pairs of input and output files for bulk conversion. The amount of
arguments must be even (ie. all input files must have one output file, so no
printing to stdout).

   ${k.blue("fimd")} ${k.cyan("in1.md out1.txt input-2.md output-2.txt my-story.md my-story-converted.txt")}

You may only supply an input file, then the output file will be printed to stdout,
which will show up in the terminal and can also be piped.

   ${k.blue("fimd")} ${k.cyan("in.md")}
   ${k.blue("fimd")} ${k.cyan("in.md")} ${k.green("|")} ${k.blue("do-something-else")}

If input is being piped to stdin, you can provide one argument to send output to that file,
or otherwise print it to stdout.

   ${k.blue("cat")} ${k.cyan("my-story.md")} ${k.green("|")} ${k.blue("fimd")} ${k.cyan("my-story.txt")}
   ${k.blue("cat")} ${k.cyan("my-story.md")} ${k.green("|")} ${k.blue("fimd")}

This can also be used in a pipe chain.

   ${k.blue("cat")} ${k.cyan("my-story.md")} ${k.green("|")} ${k.blue("fimd")} ${k.green("|")} ${k.blue("do-something-else")}

${k.yellow("=====")} CLI options ${k.yellow("=====")}

${k.cyan("--file-encoding")}: Sets input file encoding. Output is always in "utf-8".
   Supported options are what node's "BufferEncoding" supports, which includes "ascii",
   "utf8", "utf16le", "ucs2", "base64", "base64url", "latin1", "binary", or "hex".
   When in doubt, don't touch this.
${k.cyan("--silent")}, ${k.cyan("-s")}: Emit no CLI output (other than the result
   if printing to stdout). By default, output is emitted if either stdin or stdout
   is not tty (a console).
${k.cyan("--no-silent")}: force CLI output regardless of piping

${k.cyan("--help")}, ${k.cyan("-h")}: Displays this help message
${k.cyan("--version")}, ${k.cyan("-v")}: Displays the version
`.trim();

let args = minimist(process.argv.slice(2), {
	boolean: ["h", "help", "s", "silent", "v", "version"],
	string: ["file-encoding"],
	default: {
		"file-encoding": "utf-8",
		// this will be turned into a bool if flags specified
		// can be used to detect if flags have been set
		"silent": "",
		"s": ""
	},
	unknown(arg) {
		if (arg.startsWith("-")) {
			console.error(`Arg "${arg}" is not recognised\n\n${help_message}`);
			process.exit(1);
		}
		return true;
	}
});

if (args.h || args.help) {
	console.error(`${help_message}`);
	process.exit(0);
}

if (args.v || args.version) {
	let package_json = await import("../package.json", { assert: { type: "json" }});
	console.error(`fimd v${package_json.default.version}`);
	process.exit(0);
}

/** @type {Array<[src: fs.PathOrFileDescriptor, dest: fs.PathOrFileDescriptor]>} */
let files = [];

if (args._.length > 0 && args._.length % 2 === 0) {
	// pairs of input/output files
	for (let i = 0; i < args._.length; i += 2) {
		files.push(([
			path.resolve(args._[i]),
			path.resolve(args._[i + 1])
		]));
	}
} else if (args._.length === 1) {
	if (process.stdin.isTTY && !process.stdout.isTTY) {
		// provided file is in file
		files.push([
			path.resolve(args._[0]),
			process.stdout.fd
		]);
	} else if (!process.stdin.isTTY && process.stdout.isTTY) {
		// provided file is out file
		files.push([
			process.stdin.fd,
			path.resolve(args._[0])
		]);
	} else {
		// we print to console anyway
		files.push([
			path.resolve(args._[0]),
			process.stdout.fd
		]);
	}
} else if (args._.length === 0 && !process.stdin.isTTY) {
	// piper, like `cmd | fimd | other-cmd`
	// or `cmd | fimd` and printing output
	files.push([
		process.stdin.fd,
		process.stdout.fd
	]);
} else {
	console.error(`Expected an even number of arguments, pairs of source and destination\n\n${help_message}`);
	process.exit(1);
}

let silent = should_be_silent();
/** @type {typeof console["error"]} */
let print_stderr = silent ? () => {} : (...args) => {
	console.error(...args);
}

let successes = 0;
let failures = 0;

for (let [src, dest] of files) {
	let in_file = await fs.readFileSync(src, /** @type {BufferEncoding} */ (args["file-encoding"]));

	let result = await process_md(in_file);

	if (result.success) {
		successes++;
		if (result.messages.length > 0) {
			print_stderr(`${k.yellow("Messages")} for ${typeof src === "string" ? k.yellow(src) : "stdin"}`);
			print_stderr(`-------------${"-".repeat(typeof src === "string" ? src.length : "stdin".length)}`);
			result.messages.forEach(print_message);
			print_stderr("");
			print_stderr("");
		}

		if (dest !== "-") {
			await fs.writeFileSync(dest, result.result);
		} else {
			console.log(result.result);
		}
	} else {
		failures++;
		print_stderr(`${k.red("Fatal error")} converting ${typeof src === "string" ? k.red(src) : "stdin"}`);
		print_stderr(`-----------------------${"-".repeat(typeof src === "string" ? src.length : "stdin".length)}`);
		print_message(result.error);
	}
}

successes > 0 && print_stderr(k.green(`Total successes: ${successes}`));
failures > 0 && print_stderr(k.red(`Total failures: ${failures}`));
if (successes === 0 && failures === 0) print_stderr(k.yellow("Nothing processed"));
process.exitCode = failures;

/**
 * @param {import("vfile-message").VFileMessage} msg
 */
function print_message(msg) {
	let start = `${msg.position?.start.line}:${msg.position?.start.column}`;
	let end = `${msg.position?.end.line}:${msg.position?.end.column}`;
	print_stderr(`   ${k.yellow(start)}-${k.yellow(end)}: ${msg.message}`);
	print_stderr(`      ${k.yellow("reason")}: ${msg.reason}`);
}

/**
 * called if piping-activated silent should be handled
 */
function should_be_silent() {
	if (typeof args.silent === "string" && typeof args.s === "string") {
		return !process.stdout.isTTY || !process.stderr.isTTY;
	}
	if (typeof args.silent === "boolean" && typeof args.s === "string") return args.silent;
	if (typeof args.silent === "string" && typeof args.s === "boolean") return args.s;
	if (args.silent !== args.s) {
		console.error(`contradictory silent flags passed\n\n${help_message}`);
		return false;
	} else return args.silent;
}
