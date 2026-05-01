import { describe, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import figlet from "figlet";

const ENTRY = fileURLToPath(new URL("../src/index.ts", import.meta.url));

type RunResult = {
	stdout: string;
	stderr: string;
	exitCode: number;
};

async function runTypey(args: string[], stdin?: string): Promise<RunResult> {
	const proc = Bun.spawn(["bun", "run", ENTRY, ...args], {
		stdin: stdin === undefined ? "ignore" : "pipe",
		stdout: "pipe",
		stderr: "pipe",
	});

	if (stdin !== undefined && proc.stdin) {
		proc.stdin.write(stdin);
		await proc.stdin.end();
	}

	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);

	return { stdout, stderr, exitCode };
}

describe("figlet command", () => {
	test("renders ASCII art for a single arg", async () => {
		const { stdout, exitCode } = await runTypey(["figlet", "Hello"]);
		const expected = figlet.textSync("Hello");
		expect(exitCode).toBe(0);
		// CLI appends a trailing newline via console.log
		expect(stdout).toBe(`${expected}\n`);
	});

	test("joins multiple args with spaces", async () => {
		const { stdout, exitCode } = await runTypey([
			"figlet",
			"Hello",
			"World",
		]);
		const expected = figlet.textSync("Hello World");
		expect(exitCode).toBe(0);
		expect(stdout).toBe(`${expected}\n`);
	});

	test("output is multi-line ASCII art, not the literal input", async () => {
		const { stdout, exitCode } = await runTypey(["figlet", "Hi"]);
		expect(exitCode).toBe(0);
		expect(stdout.trim()).not.toBe("Hi");
		// A figlet rendering of any non-empty text spans multiple rows.
		expect(stdout.trimEnd().split("\n").length).toBeGreaterThan(1);
	});

	test("reads from stdin when no text args are given", async () => {
		const { stdout, exitCode } = await runTypey(["figlet"], "Piped\n");
		const expected = figlet.textSync("Piped");
		expect(exitCode).toBe(0);
		expect(stdout).toBe(`${expected}\n`);
	});

	test("args take precedence over stdin", async () => {
		const { stdout, exitCode } = await runTypey(
			["figlet", "FromArgs"],
			"FromStdin\n",
		);
		const expected = figlet.textSync("FromArgs");
		expect(exitCode).toBe(0);
		expect(stdout).toBe(`${expected}\n`);
	});

	test("empty stdin exits 2 with a clear error", async () => {
		const { stdout, stderr, exitCode } = await runTypey(["figlet"], "");
		expect(exitCode).toBe(2);
		expect(stdout).toBe("");
		expect(stderr).toContain("No input");
	});

	test("figlet appears in --help output", async () => {
		const { stdout, exitCode } = await runTypey(["--help"]);
		expect(exitCode).toBe(0);
		expect(stdout).toContain("figlet");
	});

	test("unknown-command error mentions figlet alongside cases", async () => {
		const { stderr, exitCode } = await runTypey(["bogus", "x"]);
		expect(exitCode).toBe(2);
		expect(stderr).toContain("figlet");
	});
});
