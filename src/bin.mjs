// @ts-check

import { process_md } from "./lib/index.mjs";
// import fs from "fs";
import fsp from "fs/promises";
import k from "kleur";
import minimist from "minimist";
import path from "path";
k.green
k.red
const help_message = `
Behold, my by-example help message. Totally not copy pasted from the project readme. >.>
Project repo: https://github.com/Meadowsys/fimd

Simplest usage is to specify an input file and an output file:

   ${k.blue("fimd")} ${k.cyan("in.md out.txt")}

You may only supply an input file, then the output file will be printed to stdout, which will show up in the terminal and can also be piped.

   ${k.blue("fimd")} ${k.cyan("in.md")}

You can supply pairs of input and output files for bulk conversion. The amount of arguments must be even (ie. all input files must have one output file, so no printing to stdout).

   ${k.blue("fimd")} ${k.cyan("in1.md out1.txt input-2.md output-2.txt my-story.md my-story-converted.txt")}

===== CLI options =====

${k.cyan("--file-encoding")}: Sets input file encoding. Output is always in "utf-8". Supported options are what node's "BufferEncoding" supports, which includes "ascii", "utf8", "utf16le", "ucs2", "base64", "base64url", "latin1", "binary", or "hex". When in doubt, don't touch this.
`.trim();

let args = minimist(process.argv.slice(2), {
	boolean: ["h", "help"],
	string: ["file-encoding"],
	default: {
		"file-encoding": "utf-8"
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
	console.log(`${help_message}`);
	process.exit(0);
}

/** @type {Array<[src: string, dest: string]>} */
let files = [];

if (args._.length % 2 === 0) {
	for (let i = 0; i < args._.length; i += 2) {
		files.push([args._[i], args._[i + 1]]);
	}
} else if (args._.length === 1) {
	files.push([args._[0], "-"]);
}
// else if (args._.length === 0) {
// 	src = dest = "-";
// }
else {
	console.error(`Expected 2 arguments: a source and a destination\n\n${help_message}`);
	process.exit(1);
}

let successes = 0;
let failures = 0;

for (let [src, dest] of files) {
	let in_file = await fsp.readFile(path.resolve(src), /** @type {BufferEncoding} */ (args["file-encoding"]));

	let result = await process_md(in_file);

	if (result.success) {
		successes++;
		if (result.messages.length > 0) {
			console.error(`${k.yellow("Messages")} for ${k.yellow(src)}`);
			console.error(`-------------${"-".repeat(src.length)}`);
			result.messages.forEach(print_message);
			console.error("");
			console.error("");
		}

		if (dest !== "-") {
			await fsp.writeFile(dest, result.result);
		} else {
			console.log(result.result);
		}
	} else {
		failures++;
		console.error(`${k.red("Fatal error")} converting ${k.red(src)}`);
		console.error(`-----------------------${"-".repeat(src.length)}`);
		print_message(result.error);
	}
}

successes > 0 && console.error(k.green(`Total successes: ${successes}`));
failures > 0 && console.error(k.red(`Total failures: ${failures}`));
if (successes === 0 && failures === 0) console.error(k.yellow("Nothing processed"));
process.exitCode = failures;

/**
 * @param {import("vfile-message").VFileMessage} msg
 */
function print_message(msg) {
	let start = `${msg.position?.start.line}:${msg.position?.start.column}`;
	let end = `${msg.position?.end.line}:${msg.position?.end.column}`;
	console.error(`   ${k.yellow(start)}-${k.yellow(end)}: ${msg.message}`);
	console.error(`      ${k.yellow("reason")}: ${msg.reason}`);
}
