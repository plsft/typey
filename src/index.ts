#!/usr/bin/env bun
/**
 * typey — convert text between common identifier cases.
 *
 * Usage:
 *   typey <case> <text...>
 *   echo "hello world" | typey <case>
 *
 * Cases: camel, snake, kebab, pascal, upper, lower
 *
 * Examples:
 *   typey snake "Hello World"        # hello_world
 *   typey camel "user-id-name"       # userIdName
 *   echo "API_KEY" | typey kebab     # api-key
 */

import { isCaseName, KNOWN_CASES, transform } from "./transforms.ts";

const HELP = `typey — text case converter

Usage:
  typey <case> <text...>
  echo "<text>" | typey <case>

Cases:
  ${KNOWN_CASES.join(", ")}

Examples:
  typey snake "Hello World"     -> hello_world
  typey camel "user-id-name"    -> userIdName
  echo "API_KEY" | typey kebab  -> api-key
`;

async function readStdin(): Promise<string> {
	if (process.stdin.isTTY) return "";
	const chunks: Uint8Array[] = [];
	for await (const chunk of process.stdin as AsyncIterable<Uint8Array>) {
		chunks.push(chunk);
	}
	return Buffer.concat(chunks).toString("utf8");
}

async function main(): Promise<number> {
	const args = process.argv.slice(2);

	if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
		console.log(HELP);
		return args.length === 0 ? 1 : 0;
	}

	if (args[0] === "--version" || args[0] === "-v") {
		// Read from package.json so we don't drift.
		const pkgUrl = new URL("../package.json", import.meta.url);
		const pkg = await Bun.file(pkgUrl).json();
		console.log(pkg.version);
		return 0;
	}

	const caseName = args[0];
	if (!caseName || !isCaseName(caseName)) {
		console.error(
			`Unknown case: ${caseName}. Try one of: ${KNOWN_CASES.join(", ")}`,
		);
		return 2;
	}

	let input: string;
	if (args.length > 1) {
		input = args.slice(1).join(" ");
	} else {
		input = (await readStdin()).trim();
		if (!input) {
			console.error("No input. Pass text as arguments or pipe it on stdin.");
			return 2;
		}
	}

	console.log(transform(caseName, input));
	return 0;
}

main().then(
	(code) => process.exit(code),
	(error) => {
		console.error("typey:", error instanceof Error ? error.message : error);
		process.exit(1);
	},
);
