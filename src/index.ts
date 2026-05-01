#!/usr/bin/env bun
/**
 * typey — convert text between common identifier cases.
 *
 * Usage:
 *   typey <case> <text...>
 *   echo "hello world" | typey <case>
 *   typey figlet <text...>
 *
 * Cases: camel, snake, kebab, pascal, upper, lower
 *
 * Examples:
 *   typey snake "Hello World"        # hello_world
 *   typey camel "user-id-name"       # userIdName
 *   echo "API_KEY" | typey kebab     # api-key
 *   typey figlet "Hello World"       # renders ASCII art text
 */

import figlet from "figlet";
import { isCaseName, KNOWN_CASES, transform } from "./transforms.ts";

const HELP = `typey — text case converter

Usage:
  typey <case> <text...>
  echo "<text>" | typey <case>
  typey figlet [--rainbow|--no-color] <text...>

Cases:
  ${KNOWN_CASES.join(", ")}

Commands:
  figlet    Render text as ASCII art using a figlet font.
            Colorized with a rainbow gradient when stdout is a TTY.
            Use --no-color to disable, or --rainbow to force colors.

Examples:
  typey snake "Hello World"     -> hello_world
  typey camel "user-id-name"    -> userIdName
  echo "API_KEY" | typey kebab  -> api-key
  typey figlet "Hello World"    -> rainbow ASCII art text
`;

// 256-color ANSI rainbow palette (red→orange→yellow→green→cyan→blue→magenta).
const RAINBOW_COLORS = [196, 202, 208, 214, 220, 226, 154, 118, 82, 46, 48, 51, 45, 39, 33, 27, 56, 92, 128, 164, 200];

function rainbowize(text: string): string {
	const lines = text.split("\n");
	return lines
		.map((line, lineIdx) =>
			Array.from(line)
				.map((ch, colIdx) => {
					if (ch === " ") return ch;
					const color = RAINBOW_COLORS[(colIdx + lineIdx) % RAINBOW_COLORS.length];
					return `\x1b[38;5;${color}m${ch}\x1b[0m`;
				})
				.join(""),
		)
		.join("\n");
}

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

	const command = args[0];

	// figlet command
	if (command === "figlet") {
		const rest = args.slice(1);
		const noColor = rest.includes("--no-color");
		const forceColor = rest.includes("--rainbow");
		const textArgs = rest.filter((a) => a !== "--no-color" && a !== "--rainbow");

		let input: string;
		if (textArgs.length > 0) {
			input = textArgs.join(" ");
		} else {
			input = (await readStdin()).trim();
			if (!input) {
				console.error("No input. Pass text as arguments or pipe it on stdin.");
				return 2;
			}
		}
		const result = figlet.textSync(input);
		const useColor = forceColor || (!noColor && Boolean(process.stdout.isTTY));
		console.log(useColor ? rainbowize(result) : result);
		return 0;
	}

	if (!command || !isCaseName(command)) {
		console.error(
			`Unknown command: ${command}. Try one of: ${KNOWN_CASES.join(", ")}, figlet`,
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

	console.log(transform(command, input));
	return 0;
}

main().then(
	(code) => process.exit(code),
	(error) => {
		console.error("typey:", error instanceof Error ? error.message : error);
		process.exit(1);
	},
);
