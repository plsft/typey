# typey

Tiny CLI that converts text between common identifier cases — camel, snake,
kebab, pascal, upper, lower. Built with Bun + TypeScript.

## Install

Requires [Bun](https://bun.sh) ≥ 1.1.

```bash
git clone https://github.com/<you>/typey.git
cd typey
bun install
bun link
```

After `bun link`, the `typey` command is on your PATH.

## Usage

```bash
typey snake "Hello World"        # hello_world
typey camel "user-id-name"       # userIdName
typey kebab "PascalCaseInput"    # pascal-case-input
typey pascal "snake_case_input"  # SnakeCaseInput
typey upper "hello"              # HELLO
typey lower "HELLO"              # hello
```

Pipes work too:

```bash
echo "API_KEY" | typey kebab     # api-key
cat names.txt | typey snake
```

## Cases

| Case | Example |
|---|---|
| camel | `helloWorld` |
| snake | `hello_world` |
| kebab | `hello-world` |
| pascal | `HelloWorld` |
| upper | `HELLO WORLD` |
| lower | `hello world` |

## Development

```bash
bun install
bun test            # run the test suite
bun run typecheck   # tsc --noEmit
bun run start snake "demo input"
```

## License

MIT — see [LICENSE](./LICENSE).
