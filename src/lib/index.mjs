// @ts-check

import remark_parse from "remark-parse";
import { unified } from "unified";
import { fimd_remark_plugin } from "./plugin.mjs";
import _debug from "debug";

export const debug = _debug("fimd");

/**
 * @param {string} str
 * @returns {Promise<string>}
 */
export async function process_md(str) {
	let vfile = await unified()
		.use(remark_parse)
		.use(fimd_remark_plugin)
		.process(str);

	debug(`vfile: ${JSON.stringify(vfile)}`);

	return /** @type {string} */(vfile.value);
}
