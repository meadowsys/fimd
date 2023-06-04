// @ts-check

import { debug, debug_enabled } from "./debug.mjs";

/**
 * @type {import("unified").Plugin<[], Root, string>}
 */
export function remark_fimd() {
	/** @type {import("unified").CompilerFunction<Root, string>} */
	let Compiler = (tree, file) => {
		/** @type {Handler<Blockquote>} */
		const handle_blockquote = (node, file) => {
			let children = handle_children(node.children, file);
			return () =>`[quote]${children()}[/quote]\n\n`;
		};

		/** @type {Handler<Break>} */
		const handle_break = (node, file) => {
			file.message("Single line breaks not supported (yet?)", node.position);
			return () => "\n";
		};

		/** @type {Handler<Code>} */
		const handle_code = (node, file) => {
			if (node.meta) file.message(`meta tags on code blocks aren't supported (\`${node.meta}\`)`, node.position);
			return () => `[codeblock${node.lang ? `=${node.lang}` : ""}]${node.value}[/codeblock]`;
		};

		// TODO this is like one of those "meta" things, convert to inline
		/** @type {Handler<Definition>} */
		const handle_definition = (node, file) => () => ``;

		/** @type {Handler<Delete>} */
		const handle_delete = (node, file) => {
			let children = handle_children(node.children, file);
			return () => `[s]${children()}[/s]`;
		};

		/** @type {Handler<Emphasis>} */
		const handle_emphasis = (node, file) => {
			let children = handle_children(node.children, file);
			return () => `[em]${children()}[/em]`;
		};

		/** @type {Handler<Footnote>} */
		const handle_footnote = (node, file) => () => `// TODO`;

		/** @type {Handler<FootnoteDefinition>} */
		const handle_footnoteDefinition = (node, file) => () => `// TODO`;

		/** @type {Handler<FootnoteReference>} */
		const handle_footnoteReference = (node, file) => () => `// TODO`;

		/** @type {Handler<Heading>} */
		const handle_heading = (node, file) => {
			let children = handle_children(node.children, file);
			return () => `[h${node.depth}]${children()}[/h${node.depth}]`;
		};

		/** @type {Handler<HTML>} */
		const handle_html = (node, file) => {
			// TODO handle this in a more elegant way maybe,,?
			file.fail("no HTML allowed (for now?)", node.position);
			return () => "";
		};

		/** @type {Handler<Image>} */
		const handle_image = (node, file) => {
			if (node.title) file.message(`image title "${node.title}" is unused`, node.position);
			if (node.alt) file.message(`image alt "${node.alt}" is unused`, node.position);
			return () => `[img]${node.url}[/img]`;
		};

		/** @type {Handler<ImageReference>} */
		const handle_imageReference = (node, file) => {
			// TODO implement image references
			file.fail("Image references not supported (yet?)", node.position);
			return () => ``;
		};

		/** @type {Handler<InlineCode>} */
		const handle_inlineCode = (node, file) => () => `[code]${node.value}[/code]`;

		/** @type {Handler<Link>} */
		const handle_link = (node, file) => {
			if (node.title) file.message(`title in links not supported (title "${node.title}")`, node.position);
			return node.children.length !== 0
				? () => {
					let children = handle_children(node.children, file);
					return `[url=${node.url}]${children()}[/url]`;
				}
				: () => node.url;
		};

		/** @type {Handler<LinkReference>} */
		const handle_linkReference = (node, file) => {
			// TODO implement link references
			file.fail("Link references not supported (yet?)", node.position);
			return () => ``;
		};

		/** @type {Handler<List>} */
		const handle_list = (node, file) => {
			if (node.start && node.start !== 1) file.message("Ordered lists can only start at 1, ignoring start", node.position);
			if (node.spread) file.message("tf does spread mean?? (please report and send me what triggered this thankies)", node.position);
			let children = handle_children(node.children, file);
			return () => `[list${node.ordered ? "=1" : ""}]${children}[/list]`;
		};

		/** @type {Handler<ListItem>} */
		const handle_listItem = (node, file) => {
			let children = handle_children(node.children, file);
			return () => `[*]${children()}`
		};

		/** @type {Handler<Paragraph>} */
		const handle_paragraph = (node, file) => {
			let children = handle_children(node.children, file);
			return () => `${children()}\n\n`
		};

		/** @type {Handler<Strong>} */
		const handle_strong = (node, file) => {
			let children = handle_children(node.children, file);

			return () => `[b]${children()}[/b]`
		};

		/** @type {Handler<Table>} */
		const handle_table = (node, file) => {
			// ?
			file.fail("Fimfic has no table support", node.position);
			return () => "";
		};

		/** @type {Handler<TableCell>} */
		const handle_tableCell = (node, file) => {
			file.fail("tableCell was called somehow, that's weird (please report)", node.position);
			return () => "";
		};

		/** @type {Handler<TableRow>} */
		const handle_tableRow = (node, file) => {
			file.fail("tableRow was called somehow, that's weird (please report)", node.position);
			return () => "";
		};

		/** @type {Handler<Text>} */
		const handle_text = (node, file) => () => node.value;

		/** @type {Handler<ThematicBreak>} */
		const handle_thematicBreak = (node, file) => () => `[hr]\n\n`;

		/** @type {Handler<YAML>} */
		const handle_yaml = (node, file) => {
			file.message("yaml?", node.position);
			return () => node.value;
		};

		/**
		 * @param {import("mdast").Content} child
		 * @param {import("vfile").VFile} file
		 * @returns {() => string}
		 */
		function handle_child(child, file) {
			if (child.type === "blockquote") return handle_blockquote(child, file);
			if (child.type === "break") return handle_break(child, file);
			if (child.type === "code") return handle_code(child, file);
			if (child.type === "definition") return handle_definition(child, file);
			if (child.type === "delete") return handle_delete(child, file);
			if (child.type === "emphasis") return handle_emphasis(child, file);
			if (child.type === "footnote") return handle_footnote(child, file);
			if (child.type === "footnoteDefinition") return handle_footnoteDefinition(child, file);
			if (child.type === "footnoteReference") return handle_footnoteReference(child, file);
			if (child.type === "heading") return handle_heading(child, file);
			if (child.type === "html") return handle_html(child, file);
			if (child.type === "image") return handle_image(child, file);
			if (child.type === "imageReference") return handle_imageReference(child, file);
			if (child.type === "inlineCode") return handle_inlineCode(child, file);
			if (child.type === "link") return handle_link(child, file);
			if (child.type === "linkReference") return handle_linkReference(child, file);
			if (child.type === "list") return handle_list(child, file);
			if (child.type === "listItem") return handle_listItem(child, file);
			if (child.type === "paragraph") return handle_paragraph(child, file);
			if (child.type === "strong") return handle_strong(child, file);
			if (child.type === "table") return handle_table(child, file);
			if (child.type === "tableCell") return handle_tableCell(child, file);
			if (child.type === "tableRow") return handle_tableRow(child, file);
			if (child.type === "text") return handle_text(child, file);
			if (child.type === "thematicBreak") return handle_thematicBreak(child, file);
			if (child.type === "yaml") return handle_yaml(child, file);
			throw "huh???";
		}

		/**
		 * @param {Array<import("mdast").Content>} children
		 * @param {import("vfile").VFile} file
		 * @returns {() => string}
		 */
		function handle_children(children, file) {
			let children_fns = children.map(c => handle_child(c, file));
			// return children.map(c => handle_child(c, file)).join("");
			return () => children_fns.map(c => c()).join("");
		}

		// the JSON.stringify could be intensive?
		debug_enabled && debug(`ast: ${JSON.stringify(tree)}`);
		return handle_children(tree.children, file)();
	};

	Object.assign(this, { Compiler });
}

/**
 * @template T
 * @typedef {(node: T, file: import("vfile").VFile) => () => string} Handler
 */

/**
 * @typedef {import("mdast").Root} Root
 *
 * @typedef {import("mdast").Blockquote} Blockquote
 * @typedef {import("mdast").Break} Break
 * @typedef {import("mdast").Code} Code
 * @typedef {import("mdast").Definition} Definition
 * @typedef {import("mdast").Delete} Delete
 * @typedef {import("mdast").Emphasis} Emphasis
 * @typedef {import("mdast").Footnote} Footnote
 * @typedef {import("mdast").FootnoteDefinition} FootnoteDefinition
 * @typedef {import("mdast").FootnoteReference} FootnoteReference
 * @typedef {import("mdast").Heading} Heading
 * @typedef {import("mdast").HTML} HTML
 * @typedef {import("mdast").Image} Image
 * @typedef {import("mdast").ImageReference} ImageReference
 * @typedef {import("mdast").InlineCode} InlineCode
 * @typedef {import("mdast").Link} Link
 * @typedef {import("mdast").LinkReference} LinkReference
 * @typedef {import("mdast").List} List
 * @typedef {import("mdast").ListItem} ListItem
 * @typedef {import("mdast").Paragraph} Paragraph
 * @typedef {import("mdast").Strong} Strong
 * @typedef {import("mdast").Table} Table
 * @typedef {import("mdast").TableCell} TableCell
 * @typedef {import("mdast").TableRow} TableRow
 * @typedef {import("mdast").Text} Text
 * @typedef {import("mdast").ThematicBreak} ThematicBreak
 * @typedef {import("mdast").YAML} YAML
 */
