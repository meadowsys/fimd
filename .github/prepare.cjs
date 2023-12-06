const fs = require("fs");
const path = require("path");

if (!process.env.VERSION) {
	console.error("process.env.VERSION not set, please set it");
	process.exit(1);
}

const pkg = require("../js/package.json");
pkg.version = process.env.VERSION;

fs.writeFileSync(path.resolve(__dirname, "../js/package.json"), Buffer.from(JSON.stringify(pkg, null, "\t") + "\n"));

fs.writeFileSync(path.resolve(__dirname, "../js/.npmrc"), "//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n");

fs.copyFileSync(
	path.resolve(__dirname, "../README.md"),
	path.resolve(__dirname, "../js/README.md")
);
fs.copyFileSync(
	path.resolve(__dirname, "../LICENSE"),
	path.resolve(__dirname, "../js/LICENSE")
);
