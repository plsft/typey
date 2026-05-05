import { job, pipeline, Runner, step, triggers } from "@rehearse/ci";

export const ci = pipeline("CI", {
	triggers: [triggers.pullRequest(), triggers.push({ branches: ["main"] })],
	jobs: [
		job("test", {
			runner: Runner.github("${{ matrix.os }}"),
			matrix: {
				variables: {
					os: ["ubuntu-latest", "macos-latest", "windows-latest"],
					"bun-version": ["1.2.x", "1.3.x", "latest"],
				},
				failFast: false,
			},
			steps: [
				step.checkout(),
				step.action("oven-sh/setup-bun@v2", {
					name: "Setup Bun ${{ matrix.bun-version }}",
					with: { "bun-version": "${{ matrix.bun-version }}" },
				}),
				step.run("bun install --frozen-lockfile", { name: "Install dependencies" }),
				step.run("bunx prettier --check .", { name: "Format check" }),
				step.run("bunx eslint .", { name: "Lint" }),
				step.run("bunx tsc --noEmit", { name: "Typecheck" }),
				step.run("bun test", { name: "Test" }),
				step.run("bun build src/index.ts --outdir dist --target bun", { name: "Build" }),
			],
		}),
	],
});
