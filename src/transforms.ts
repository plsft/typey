/**
 * Text-case transforms. Pure functions, no I/O — easy to test exhaustively.
 *
 * Tokenization rules (shared across all `to*` helpers):
 *   - Splits on whitespace, hyphens, underscores, and dots.
 *   - Splits on case boundaries (camelHumps → ["camel", "Humps"]).
 *   - Drops anything that's neither alphanumeric nor a recognized separator.
 *   - Empty input → empty output for every transform.
 */

export type CaseName = "camel" | "snake" | "kebab" | "pascal" | "upper" | "lower";

export const KNOWN_CASES: readonly CaseName[] = [
	"camel",
	"snake",
	"kebab",
	"pascal",
	"upper",
	"lower",
] as const;

export function isCaseName(value: string): value is CaseName {
	return (KNOWN_CASES as readonly string[]).includes(value);
}

/** Break a string into normalized lowercase word tokens. */
export function tokenize(input: string): string[] {
	if (!input) return [];
	// Insert a space between a lowercase/digit and an uppercase letter so
	// camelCase and PascalCase split cleanly. Then collapse non-alphanumeric
	// runs into a single space and split.
	return input
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
		.split(/[^A-Za-z0-9]+/)
		.filter((token) => token.length > 0)
		.map((token) => token.toLowerCase());
}

export function toCamel(input: string): string {
	const tokens = tokenize(input);
	if (tokens.length === 0) return "";
	const [first, ...rest] = tokens;
	return first + rest.map(capitalize).join("");
}

export function toPascal(input: string): string {
	return tokenize(input).map(capitalize).join("");
}

export function toSnake(input: string): string {
	return tokenize(input).join("_");
}

export function toKebab(input: string): string {
	return tokenize(input).join("-");
}

export function toUpper(input: string): string {
	return input.toUpperCase();
}

export function toLower(input: string): string {
	return input.toLowerCase();
}

export function transform(caseName: CaseName, input: string): string {
	switch (caseName) {
		case "camel":
			return toCamel(input);
		case "pascal":
			return toPascal(input);
		case "snake":
			return toSnake(input);
		case "kebab":
			return toKebab(input);
		case "upper":
			return toUpper(input);
		case "lower":
			return toLower(input);
	}
}

function capitalize(word: string): string {
	if (!word) return "";
	return word.charAt(0).toUpperCase() + word.slice(1);
}
