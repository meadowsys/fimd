// @ts-check

import remark_parse from "remark-parse";
import { unified } from "unified";
import { remark_fimd } from "./plugin.mjs";
import { debug } from "./debug.mjs";

/**
 * @param {string} str
 * @returns {Promise<string>}
 */
export async function process_md(str) {
	let vfile = await unified()
		.use(remark_parse)
		.use(remark_fimd)
		.process(str);

	debug(`vfile: ${JSON.stringify(vfile)}`);

	return /** @type {string} */(vfile.value);
}

export { remark_fimd } from "./plugin.mjs";
