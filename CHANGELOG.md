# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) where possible.

## [1.0.0] - 2026-04-16

> Rebrand release. Package renamed from `@eosrio/node-abieos` to `@anvoio/node-core-abi`. New lineage starts at `1.0.0`; upstream history preserved in entries below.

### Changed
- **Package name:** `@eosrio/node-abieos` → `@anvoio/node-core-abi`.
- **TypeScript class:** `Abieos` → `CoreAbi`.
- **Native binary:** `abieos.node` → `core-abi.node`.
- **Log tag:** `[node-abieos]` → `[node-core-abi]`.
- **Submodule:** `abieos/` → `core-abi/`, repinned to [`AnvoIO/core-abi`](https://github.com/AnvoIO/core-abi) post-rebrand.
- **C API surface:** `abieos_*` symbols renamed to `core_abi_*` (no legacy aliases). Source consumers must rebuild; binary consumers must recompile.
- **CMake project:** `node_abieos` → `node_core_abi`.
- **License attribution:** extended MIT attribution chain to include Stratovera LLC 2026, preserving EOS Rio, ENF, and block.one copyright notices.

### Runtime API
- No change — `CoreAbi.getInstance().loadAbi(contract, abi)`, `jsonToHex`, `hexToJson`, `getLoadedAbis`, `cleanup`, etc. behave identically to the predecessor's `Abieos.*` methods.

### Migration
- See [README § Migration from @eosrio/node-abieos](./README.md#migration-from-eosrionode-abieos).

---

## [4.1.0-f7d5b45] - 2026-02-21

> The `-f7d5b45` suffix denotes the upstream `AntelopeIO/abieos` commit hash bundled with this release.

### Changed
- Switched abieos submodule origin from `igorls/abieos` fork to official [`AntelopeIO/abieos`](https://github.com/AntelopeIO/abieos). The fork's `abieos_delete_contract` was merged upstream in [PR #27](https://github.com/AntelopeIO/abieos/pull/27), so the fork is no longer needed.
- **`cmake-js`** 7.3.1 → 8.0.0 (major — build validated, no CMake changes required).
- **`c8`** 9.1.0 → 10.1.3 (major — coverage tool upgrade).
- **`@microsoft/api-extractor`** 7.52.13 → 7.57.2.
- **`@types/node`** 24.6.0 → 25.3.0.
- **`tsup`** 8.5.0 → 8.5.1.
- **`typescript`** 5.9.2 → 5.9.3.

---

## [4.0.3-f7d5b45] - 2025-09-29

> The `-f7d5b45` suffix denotes the upstream `AntelopeIO/abieos` commit hash bundled with this release.

### Upstream Highlights (`2039717` → `f7d5b45`)
- Added full support for the new `bitset` ABI type, including serialization/deserialization, key conversions, and regression tests.
- Introduced `fixed_array` handling in the ABI serializer, so fixed-length array definitions now round-trip correctly.
- Switched floating-point JSON conversion to `std::to_chars`, improving numeric fidelity and removing legacy `fpconv` sources.
- Tightened validation around ABI parsing (better sanity checks, error messages, and compatibility guards) while keeping compatibility with `eosio::abi/1.x` definitions.
- Streamlined upstream CI and build configurations (consistent CMake/toolchain defaults, GCC 14 coverage) matching the latest Antelope “Spring” tooling.

### Added
- `c8` coverage tooling to produce lcov reports consumed by Coveralls.
- Comprehensive unit tests covering parse error branches to reach 100% coverage.
- Repository `LICENSE` now includes upstream `AntelopeIO/abieos` MIT license details.
- Formal `CHANGELOG.md` to track release history.

### Changed
- Workflow now runs coverage on Node 22.x only while keeping multi-version tests.

### Fixed
- Ensured `loadAbiHex` debug branch is executed within tests, eliminating remaining coverage gaps.
