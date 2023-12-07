// TODO remove this
#![allow(unused)]
#![deny(unused_must_use)]

use markdown::mdast::*;
use markdown::unist::Position;

pub struct Options {
	fail_on_warn: bool
}

enum Ast2 {
	BlockQuote {
		children: Vec<Ast2>
	},
	Break {
		position: Position
	},
	Code {
		position: Position,
		value: String,
		lang: Option<String>,
		meta: Option<String>
	},
	Delete {
		children: Vec<Ast2>
	},
	Emphasis {
		children: Vec<Ast2>
	},
	FootnoteDefinition {
		position: Position
	},
	FootnoteReference {
		position: Position
	},
	Heading {
		children: Vec<Ast2>,
		depth: u8
	},
	Html {
		position: Position,
		value: String
	},
	Image {
		position: Position,
		url: String,
		alt: Option<String>,
		title: Option<String>
	},
	ImageReference {
		position: Position,
		id: String,
		reference_type: ReferenceKind,
		alt: Option<String>,
		label: Option<String>
	},
	InlineCode {
		value: String
	},
	InlineMath,
	Link,
	LinkReference,
	List,
	ListItem,
	Math,
	MdxFlowExpression,
	MdxJsxFlowElement,
	MdxJsxTextElement,
	MdxTextExpression,
	MdxjsEsm,
	Paragraph,
	Root,
	Strong,
	Table,
	TableCell,
	TableRow,
	Text {
		value: String
	},
	ThematicBreak,
	Toml,
	Yaml
}

impl Ast2 {
	fn from_mdast(node: Node) -> Ast2 {
		todo!()
	}

	fn into_string(self, options: &Options, definitions: &Map<String, DefinitionEntry>, warnings: &mut Vec<Warning>) -> Result<String, Warning> {
		let res = match self {
			Self::BlockQuote { children } => {
				let children = Ast2::vec_into_string(options, children, definitions, warnings)?;
				format!("[quote]{children}[/quote]")
			}
			Self::Break { position } => {
				Ast2::process_warning(options, warnings, Warning {
					message: "single line breaks not supported (yet?)".into(),
					position
				})?;
				"\n".into()
			}
			Self::Code { position, value, lang, meta } => {
				if let Some(meta) = meta {
					Ast2::process_warning(options, warnings, Warning {
						message: format!("meta tags on code blocks aren't supported (`{meta}`)"),
						position
					})?;
				}
				format!(
					"[codeblock{lang}]{value}[/codeblock]",
					lang = if let Some(l) = lang { l } else { "".into() }
				)
			}
			Self::Delete { children } => {
				let children = Ast2::vec_into_string(options, children, definitions, warnings)?;
				format!("[s]{children}[/s]")
			}
			Self::Emphasis { children } => {
				let children = Ast2::vec_into_string(options, children, definitions, warnings)?;
				format!("[em]{children}[/em]")
			}
			Self::FootnoteDefinition { position } => {
				Ast2::process_warning(options, warnings, Warning {
					message: "footnotes not supported".into(),
					position
				})?;
				"".into()
			}
			Self::FootnoteReference { position } => {
				Ast2::process_warning(options, warnings, Warning {
					message: "footnotes not supported".into(),
					position
				})?;
				"".into()
			}
			Self::Heading { children, depth } => {
				let children = Ast2::vec_into_string(options, children, definitions, warnings)?;
				format!("[h{depth}]{children}[/h{depth}]")
			}
			Self::Html { position, value } => {
				Ast2::process_warning(options, warnings, Warning {
					message: "no HTML allowed (for now?)".into(),
					position
				})?;
				Ast2::Text { value }.into_string(options, definitions, warnings)?
			}
			Self::Image { position, url, alt, title } => {
				if let Some(title) = title {
					Ast2::process_warning(options, warnings, Warning {
						message: format!("image title \"{title}\" is unused"),
						position: position.clone()
					})?;
				}
				if let Some(alt) = alt {
					Ast2::process_warning(options, warnings, Warning {
						message: format!("image alt \"{alt}\" is unused"),
						position
					})?;
				}

				format!("[img]{url}[/img]")
			}
			Self::ImageReference { position, id, reference_type, alt, label } => {
				if let Some(alt) = alt {
					if !matches!(reference_type, ReferenceKind::Collapsed | ReferenceKind::Full) {
						Ast2::process_warning(options, warnings, Warning {
							message: format!("image alt text \"{alt}\" not supported by Fimfic"),
							position
						})?;
					}
				}

				todo!()

				// if let Some(def) = definitions.get(&id) {

				// } else {
				// 	Ast2::process_warning(options, warnings, Warning {
				// 		message: format!("definition for id \"{id}\" not found"),
				// 		position
				// 	})?;
				// 	match reference_type {
				// 		ReferenceKind::Collapsed => {}
				// 		ReferenceKind::Full => {}
				// 		ReferenceKind::Shortcut => {}
				// 	}
				// }
			}
			Self::InlineCode { value } => { todo!() }
			Self::InlineMath => { todo!() }
			Self::Link => { todo!() }
			Self::LinkReference => { todo!() }
			Self::List => { todo!() }
			Self::ListItem => { todo!() }
			Self::Math => { todo!() }
			Self::MdxFlowExpression => { todo!() }
			Self::MdxJsxFlowElement => { todo!() }
			Self::MdxJsxTextElement => { todo!() }
			Self::MdxTextExpression => { todo!() }
			Self::MdxjsEsm => { todo!() }
			Self::Paragraph => { todo!() }
			Self::Root => { todo!() }
			Self::Strong => { todo!() }
			Self::Table => { todo!() }
			Self::TableCell => { todo!() }
			Self::TableRow => { todo!() }
			Self::Text { value } => { todo!() }
			Self::ThematicBreak => { todo!() }
			Self::Toml => { todo!() }
			Self::Yaml => { todo!() }
		};
		Ok(res)
	}

	fn vec_into_string(options: &Options, vec: Vec<Self>, definitions: &Map<String, DefinitionEntry>, warnings: &mut Vec<Warning>) -> Result<String, Warning> {
		let mut total_len = 0usize;
		let strings = vec.into_iter()
			.map(|c| {
				let str = c.into_string(options, definitions, warnings)?;
				total_len += str.len();
				Ok::<_, Warning>(str)
			})
			.collect::<Result<Vec<_>, _>>()?;

		Ok(strings.into_iter().fold(
			String::with_capacity(total_len),
			|mut acc, next| {
				acc.push_str(&next);
				acc
			}
		))
	}

	fn process_warning(options: &Options, warnings: &mut Vec<Warning>, warning: Warning) -> Result<(), Warning> {
		if options.fail_on_warn {
			Err(warning)
		} else {
			warnings.push(warning);
			Ok(())
		}
	}
}

struct DefinitionEntry {
	url: String,
	used: bool,
	position: Position
}

struct Warning {
	message: String,
	position: Position
}

/// copied from [here](https://github.com/Meadowsys/aoc/blob/de608724ec4fcd27b198a9fce07c752f6901bfeb/rust/lib/src/lib.rs#L77)
#[macro_export]
macro_rules! map {
	() => {
		Map::with_hasher(ahash::RandomState::new())
	};
	($k:ty, $v:ty) => {
		Map::<$k, $v, ahash::RandomState>::with_hasher(ahash::RandomState::new())
	}
}
use crate::map;

/// copied from [here](https://github.com/Meadowsys/aoc/blob/de608724ec4fcd27b198a9fce07c752f6901bfeb/rust/lib/src/lib.rs#L96)
type Map<K, V> = hashbrown::HashMap<K, V, ahash::RandomState>;
