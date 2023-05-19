// @ts-check

import blockquote from "./plugin/blockquote.mjs";
import break_ from "./plugin/break.mjs";
import code from "./plugin/code.mjs";
import definition from "./plugin/definition.mjs";
import delete_ from "./plugin/delete.mjs";
import emphasis from "./plugin/emphasis.mjs";
import footnote from "./plugin/footnote.mjs";
import footnoteDefinition from "./plugin/footnoteDefinition.mjs";
import footnoteReference from "./plugin/footnoteReference.mjs";
import heading from "./plugin/heading.mjs";
import html from "./plugin/html.mjs";
import image from "./plugin/image.mjs";
import imageReference from "./plugin/imageReference.mjs";
import inlineCode from "./plugin/inlineCode.mjs";
import link from "./plugin/link.mjs";
import linkReference from "./plugin/linkReference.mjs";
import list from "./plugin/list.mjs";
import listItem from "./plugin/listItem.mjs";
import paragraph from "./plugin/paragraph.mjs";
import strong from "./plugin/strong.mjs";
import table from "./plugin/table.mjs";
import tableCell from "./plugin/tableCell.mjs";
import tableRow from "./plugin/tableRow.mjs";
import text from "./plugin/text.mjs";
import thematicBreak from "./plugin/thematicBreak.mjs";
import yaml from "./plugin/yaml.mjs";
import { debug } from "./debug.mjs";

/**
 * @typedef {import("mdast").Root} Root
 */

/**
 * @type {import("unified").Plugin<[], Root, string>}
 */
export function remark_fimd() {
	/** @type {import("unified").CompilerFunction<Root, string>} */
	let Compiler = (tree, file) => {
		debug(`ast: ${JSON.stringify(tree)}`);

		let content = "";

		for (let c of tree.children) {
			if (c.type === "blockquote") content += blockquote(c, file);
			else if (c.type === "break") content += break_(c, file);
			else if (c.type === "code") content += code(c);
			else if (c.type === "definition") content += definition(c);
			else if (c.type === "delete") content += delete_(c);
			else if (c.type === "emphasis") content += emphasis(c);
			else if (c.type === "footnote") content += footnote(c);
			else if (c.type === "footnoteDefinition") content += footnoteDefinition(c);
			else if (c.type === "footnoteReference") content += footnoteReference(c);
			else if (c.type === "heading") content += heading(c, file);
			else if (c.type === "html") content += html(c);
			else if (c.type === "image") content += image(c);
			else if (c.type === "imageReference") content += imageReference(c);
			else if (c.type === "inlineCode") content += inlineCode(c);
			else if (c.type === "link") content += link(c);
			else if (c.type === "linkReference") content += linkReference(c);
			else if (c.type === "list") content += list(c);
			else if (c.type === "listItem") content += listItem(c);
			else if (c.type === "paragraph") content += paragraph(c, file);
			else if (c.type === "strong") content += strong(c);
			else if (c.type === "table") content += table(c);
			else if (c.type === "tableCell") content += tableCell(c);
			else if (c.type === "tableRow") content += tableRow(c);
			else if (c.type === "text") content += text(c);
			else if (c.type === "thematicBreak") content += thematicBreak(c);
			else if (c.type === "yaml") content += yaml(c, file);
			else file.fail("huh????? (report this please)", c, "fimd_remark_plugin:root_children");
		}

		return content;
	};

	Object.assign(this, { Compiler });
}
