// @ts-check

import { process_md } from "./lib/index.mjs";
import debug from "debug";
// import fs from "fs";
import fsp from "fs/promises";
import minimist from "minimist";
import path from "path";

const help_message = `
<insert help message here>
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

for (let [src, dest] of files) {
	let in_file = await fsp.readFile(path.resolve(src), /** @type {BufferEncoding} */ (args["file-encoding"]));

	let result = await process_md(in_file);

	if (debug.enabled("fimd")) console.error("\nresult\n\n");
	if (dest !== "-") {
		await fsp.writeFile(dest, result + "\n");
	} else {
		console.log(result);
	}
	// if (debug.enabled("fimd")) {
	// 	console.error("result:\n\n");
	// 	console.error(result);
	// } else
	// if (dest === "-") {
	// 	console.log(result);
	// }
}
