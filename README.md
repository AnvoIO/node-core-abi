# node-core-abi

[![MIT licensed][1]][2]

[1]: https://img.shields.io/badge/license-MIT-blue.svg
[2]: LICENSE

Node.js N-API native binding for [core-abi](https://github.com/AnvoIO/core-abi). Binary ↔ JSON conversion of ABI-encoded data for Anvo Core, Antelope, and EOSIO chains.

Based on [eosrio/node-abieos](https://github.com/eosrio/node-abieos) with first-class support for the `core_net::abi/*` version prefix emitted by chains bootstrapped under the Anvo Core `core_net` namespace.

## Features

- **Native Anvo Core support** — accepts `core_net::abi/{1,2}.x` ABI version prefixes alongside `eosio::abi/{1,2}.x`.
- **Singleton binding** — single global N-API context shared across the process.
- **Loaded-contract map** — internal tracking with `getLoadedAbis()` and `cleanup()`.
- **Cross-runtime** — Node.js, Deno, and Bun.
- **TypeScript typings included.**

## Install

```bash
npm i @anvoio/node-core-abi --save
```

## Usage

### Node.js (ES Modules)

```typescript
import { CoreAbi } from '@anvoio/node-core-abi';

const coreAbi = CoreAbi.getInstance();
coreAbi.loadAbi('eosio.token', tokenAbiJson);
const hex = coreAbi.jsonToHex('eosio.token', 'transfer', JSON.stringify({
    from: 'alice',
    to: 'bob',
    quantity: '1.0000 SYS',
    memo: ''
}));
```

### Node.js (CommonJS)

```js
const { CoreAbi } = require('@anvoio/node-core-abi');
```

### Deno

```bash
# examples/basic.cjs can be run with:
deno run --allow-ffi --allow-read examples/basic.cjs

# For an example using the published npm package with Deno:
cd examples/deno-core-abi-test
deno run --allow-ffi --allow-read main.ts
```

### Bun

```bash
bun run examples/basic.mjs
```

See the [examples/](./examples) folder for more.

## Build from Source

Requires Clang 18+:

```bash
wget https://apt.llvm.org/llvm.sh
chmod +x llvm.sh
sudo ./llvm.sh 18
```

Clone and build:

```bash
git clone https://github.com/AnvoIO/node-core-abi.git --recursive
cd node-core-abi
npm install
npm run build:linux   # cmake-js compile + copy native module
npm run build         # tsup (TypeScript bundling)
```

## ABI Version Compatibility

| Version prefix | Accepted on ingest |
|---|---|
| `eosio::abi/1.0` through `eosio::abi/2.x` | yes |
| `core_net::abi/1.0` through `core_net::abi/2.x` | yes |

Anvo Core emits the version prefix that matches the chain's heritage: eosio-bootstrapped chains emit `eosio::abi/*`; chains bootstrapped fresh under `core_net` emit `core_net::abi/*`. See [AnvoIO/core#105](https://github.com/AnvoIO/core/issues/105) for context.

## Supported Platforms

| Platform | Architecture | Status |
|---|---|---|
| Linux (Ubuntu 22.04+) | x86_64, ARM64 | Primary — CI tested |
| macOS | x86_64, ARM64 | Best-effort |
| Windows | x86_64 | Best-effort |

Prebuilt binaries may not be available for all platforms; build from source if needed.

## Migration from @eosrio/node-abieos

Downstream consumers migrating from `@eosrio/node-abieos` need the following changes:

- Package name: `@eosrio/node-abieos` → `@anvoio/node-core-abi`
- Class name: `Abieos` → `CoreAbi`
- Log tag: `[node-abieos]` → `[node-core-abi]`
- Native binding file: `abieos.node` → `core-abi.node` (internal; transparent to JS consumers)

The runtime API surface is otherwise unchanged. Existing code calling `Abieos.getInstance().loadAbi(...)` becomes `CoreAbi.getInstance().loadAbi(...)`.

## License

[MIT](./LICENSE). See [NOTICE](./NOTICE) for upstream attributions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
