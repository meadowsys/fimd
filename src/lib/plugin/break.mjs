/**
 * @param {import("mdast").Break} node
 * @param {import("vfile").VFile} file
 */
export default function(node, file) {
	console.log("AAA");

	file.message("Single line breaks not supported (yet?)", node.position);

	return "\n";
}
// TODO DO THIS LOL
