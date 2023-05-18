import break_ from "./break.mjs";
import delete_ from "./delete.mjs";
import emphasis from "./emphasis.mjs";
import footnote from "./footnote.mjs";
import footnoteReference from "./footnoteReference.mjs";
import html from "./html.mjs";
import image from "./image.mjs";
import imageReference from "./imageReference.mjs";
import inlineCode from "./inlineCode.mjs";
import link from "./link.mjs";
import linkReference from "./linkReference.mjs";
import strong from "./strong.mjs";
import text from "./text.mjs";

/**
 * @param {import("mdast").Paragraph} node
 * @param {import("vfile").VFile} file
 */
export default function(node, file) {
	let content = "";

	for (let c of node.children) {
		if (c.type === "break") content += break_(c, file);
		else if (c.type === "delete") content += delete_(c);
		else if (c.type === "emphasis") content += emphasis(c);
		else if (c.type === "footnote") content += footnote(c);
		else if (c.type === "footnoteReference") content += footnoteReference(c);
		else if (c.type === "html") content += html(c);
		else if (c.type === "image") content += image(c);
		else if (c.type === "imageReference") content += imageReference(c);
		else if (c.type === "inlineCode") content += inlineCode(c);
		else if (c.type === "link") content += link(c);
		else if (c.type === "linkReference") content += linkReference(c);
		else if (c.type === "strong") content += strong(c);
		else if (c.type === "text") content += text(c);
	}

	content += "\n\n";
	return content;
}
