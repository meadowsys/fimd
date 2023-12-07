use markdown::ParseOptions;

mod parser;

pub fn process_md(md: &str) -> Result<String, String> {
	let ast = markdown::to_mdast(md, &ParseOptions::gfm())?;
	// Ok(parser::process_ast(&ast))
	todo!()
}
