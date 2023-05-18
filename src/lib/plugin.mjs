// @ts-check

/**
 * @typedef {import("mdast").Root} Root
 */

/**
 * @this {import('unified').Processor}
 * @type {import("unified").Plugin<[], Root, string>}
 */
export function fimd_remark_plugin() {
	/** @type {import("unified").CompilerFunction<Root, string>} */
	let compiler = (tree, file) => {
		console.log(JSON.stringify(tree, null, "   "));
		return "eeeee";
	};
	this.Compiler = compiler;
	// return (tree, node, a) => {}
}
