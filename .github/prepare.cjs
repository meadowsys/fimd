const { writeFileSync } = require("fs");
const { resolve } = require("path");

if (!process.env.VERSION) {
	console.error("process.env.VERSION not set, please set it");
	process.exit(1);
}

const pkg = require("../js/package.json");
pkg.version = process.env.VERSION;

writeFileSync(resolve(__dirname, "../js/package.json"), Buffer.from(JSON.stringify(pkg, null, "\t") + "\n"));
