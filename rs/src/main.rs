fn main() {
	let e = markdown::to_mdast(MARKDOWN.trim(), &markdown::ParseOptions::gfm());
	println!("{e:#?}");
}

const MARKDOWN: &str = "
# HALLOWORLD

hai

[check out my website](https://kiwin.gay)
";
