import { describe, expect, test } from "bun:test";
import {
	isCaseName,
	KNOWN_CASES,
	tokenize,
	toCamel,
	toKebab,
	toLower,
	toPascal,
	toSnake,
	toUpper,
	transform,
} from "../src/transforms.ts";

describe("tokenize", () => {
	test("splits on whitespace, dashes, underscores, dots", () => {
		expect(tokenize("hello world")).toEqual(["hello", "world"]);
		expect(tokenize("hello-world")).toEqual(["hello", "world"]);
		expect(tokenize("hello_world")).toEqual(["hello", "world"]);
		expect(tokenize("hello.world")).toEqual(["hello", "world"]);
	});

	test("splits camelCase and PascalCase", () => {
		expect(tokenize("camelCase")).toEqual(["camel", "case"]);
		expect(tokenize("PascalCase")).toEqual(["pascal", "case"]);
		expect(tokenize("getUserID")).toEqual(["get", "user", "id"]);
		expect(tokenize("XMLHttpRequest")).toEqual(["xml", "http", "request"]);
	});

	test("preserves digits as part of tokens", () => {
		expect(tokenize("user42name")).toEqual(["user42name"]);
		expect(tokenize("v2-Endpoint")).toEqual(["v2", "endpoint"]);
	});

	test("handles empty and separator-only inputs", () => {
		expect(tokenize("")).toEqual([]);
		expect(tokenize("---")).toEqual([]);
		expect(tokenize("___")).toEqual([]);
	});
});

describe("toSnake", () => {
	test("produces lowercase snake_case", () => {
		expect(toSnake("Hello World")).toBe("hello_world");
		expect(toSnake("camelCaseInput")).toBe("camel_case_input");
		expect(toSnake("kebab-case-input")).toBe("kebab_case_input");
		expect(toSnake("API_KEY")).toBe("api_key");
	});

	test("empty input yields empty output", () => {
		expect(toSnake("")).toBe("");
	});
});

describe("toCamel", () => {
	test("first word lowercase, rest capitalized", () => {
		expect(toCamel("hello world")).toBe("helloWorld");
		expect(toCamel("user-id-name")).toBe("userIdName");
		expect(toCamel("PascalIn")).toBe("pascalIn");
	});

	test("empty input yields empty output", () => {
		expect(toCamel("")).toBe("");
	});
});

describe("toKebab", () => {
	test("produces kebab-case", () => {
		expect(toKebab("Hello World")).toBe("hello-world");
		expect(toKebab("snake_case_input")).toBe("snake-case-input");
		expect(toKebab("PascalCase")).toBe("pascal-case");
	});
});

describe("toPascal", () => {
	test("every word capitalized, no separator", () => {
		expect(toPascal("hello world")).toBe("HelloWorld");
		expect(toPascal("user-id-name")).toBe("UserIdName");
		expect(toPascal("snake_case_input")).toBe("SnakeCaseInput");
	});
});

describe("toUpper / toLower", () => {
	test("trivial wrappers", () => {
		expect(toUpper("Hello")).toBe("HELLO");
		expect(toLower("Hello")).toBe("hello");
	});
});

describe("transform dispatch", () => {
	test("routes to the named transform", () => {
		expect(transform("snake", "Hello World")).toBe("hello_world");
		expect(transform("camel", "Hello World")).toBe("helloWorld");
		expect(transform("kebab", "Hello World")).toBe("hello-world");
		expect(transform("pascal", "Hello World")).toBe("HelloWorld");
		expect(transform("upper", "Hello")).toBe("HELLO");
		expect(transform("lower", "HELLO")).toBe("hello");
	});
});

describe("isCaseName", () => {
	test("recognizes every entry in KNOWN_CASES and rejects others", () => {
		for (const name of KNOWN_CASES) {
			expect(isCaseName(name)).toBe(true);
		}
		expect(isCaseName("UPPER")).toBe(false);
		expect(isCaseName("foo")).toBe(false);
		expect(isCaseName("")).toBe(false);
	});
});
