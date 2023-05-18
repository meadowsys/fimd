import blockquote from "./blockquote.mjs";
import code from "./code.mjs";
import definition from "./definition.mjs";
import footnoteDefinition from "./footnoteDefinition.mjs";
import heading from "./heading.mjs";
import html from "./html.mjs";
import list from "./list.mjs";
import paragraph from "./paragraph.mjs";
import table from "./table.mjs";
import thematicBreak from "./thematicBreak.mjs";

/**
 * @param {import("mdast").Blockquote} node
 * @param {import("vfile").VFile} file
 */
export default function(node, file) {
	let content = "[quote]";

	for (let c of node.children) {
		if (c.type === "blockquote") content += blockquote(c, file);
		else if (c.type === "code") content += code(c);
		else if (c.type === "definition") content += definition(c);
		else if (c.type === "footnoteDefinition") content += footnoteDefinition(c);
		else if (c.type === "heading") content += heading(c, file);
		else if (c.type === "html") content += html(c);
		else if (c.type === "list") content += list(c);
		else if (c.type === "paragraph") content += paragraph(c, file);
		else if (c.type === "table") content += table(c);
		else if (c.type === "thematicBreak") content += thematicBreak(c);
	}

	content += "[/quote]";
	return content;
}
// TODO DO THIS LOL
