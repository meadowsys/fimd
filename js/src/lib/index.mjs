// @ts-check

import remark_gfm from "remark-gfm";
import remark_parse from "remark-parse";
import { unified } from "unified";
import { remark_fimd } from "./plugin.mjs";
import { debug, debug_enabled } from "./debug.mjs";

/**
 * @param {string} str
 */
export function process_md(str) {
	let res = unified()
		.use(remark_parse)
		.use(remark_gfm)
		.use(remark_fimd)
		.process(str)
		.then(vfile => ({
			success: /** @type {true} */ (true),
			messages: vfile.messages,
			result: typeof vfile.value === "string"
				? vfile.value + "\n"
				: vfile.value.toString("utf-8") + "\n"
		}))
		.catch(e => ({
			success: /** @type {false} */ (false),
			error: /** @type {import("vfile-message").VFileMessage} */ (e)
		}));

	debug_enabled && debug(`result: ${JSON.stringify(res)}`);
	return res;
}

export { remark_fimd } from "./plugin.mjs";
