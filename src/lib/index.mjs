// @ts-check

import remark_parse from "remark-parse";
import { unified } from "unified";
import { fimd_remark_plugin } from "./plugin.mjs";

export function uwu() {
	console.log("uwu");
}

/**
 * @param {string} str
 * @returns {Promise<string>}
 */
export async function process(str) {
	let vfile = await unified()
		.use(remark_parse)
		.use(fimd_remark_plugin)
		.process(str);

	return vfile.value;
}
