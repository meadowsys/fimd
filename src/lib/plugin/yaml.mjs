/**
 * @param {import("mdast").YAML} node
 * @param {import("vfile").VFile} file
 */
export default function(node, file) {
	file.message("yaml?", node.position);
	return node.value;
}
// TODO DO THIS LOL
