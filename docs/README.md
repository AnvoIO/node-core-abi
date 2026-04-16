# node-core-abi Documentation

## Overview

`node-core-abi` is a Node.js native binding for [coreAbi](https://github.com/AnvoIO/core-abi), providing binary to JSON conversion using ABIs. This documentation provides detailed information on installation, usage, API reference, error handling, debugging, and examples.

## Installation

To install `node-core-abi`, use the following command:

```shell
npm i @anvoio/node-core-abi --save
```

## Usage

### CommonJS

```js
const nodeCoreAbi = require('@anvoio/node-core-abi');
```

### ES Modules

```typescript
import { CoreAbi } from "@anvoio/node-core-abi";
const coreAbi = CoreAbi.getInstance();
```

## API Reference

### CoreAbi Class

The `CoreAbi` class provides a singleton instance for interacting with the native coreAbi module. This pattern ensures a single global context for the underlying C++ coreAbi library, which manages internal state and resources.

#### Methods

- **getInstance()**: Returns the singleton instance of the `CoreAbi` class.
- **getLoadedAbis()**: Returns an array of loaded ABI contract names.
- **cleanup()**: Cleans up all loaded contracts by deleting them from the native context.
- **stringToName(nameString: string)**: Converts a string name to its corresponding 64-bit unsigned integer representation (BigInt).
- **jsonToHex(contractName: string, type: string, json: string | object)**: Converts a JSON string or object to its hexadecimal binary representation.
- **hexToJson(contractName: string, type: string, hex: string)**: Converts a hexadecimal binary string to its JSON representation.
- **binToJson(contractName: string, type: string, buffer: Buffer)**: Converts a binary buffer to its JSON representation.
- **loadAbi(contractName: string, abi: string | object)**: Loads an ABI for a given contract.
- **loadAbiHex(contractName: string, abihex: string)**: Loads an ABI for a given contract from its hexadecimal representation.
- **getTypeForAction(contractName: string, actionName: string)**: Retrieves the type name for a specific action within a contract's ABI.
- **getTypeForTable(contractName: string, table_name: string)**: Retrieves the type name for a specific table within a contract's ABI.
- **deleteContract(contractName: string)**: Deletes a contract's ABI from the coreAbi context.

## Error Handling

Errors in `node-core-abi` are thrown as JavaScript exceptions. Each method that interacts with the native coreAbi module includes error handling to provide meaningful error messages.

## Debugging

To enable debugging, set the `CoreAbi.debug` property to `true`. This will log additional information to the console.

```typescript
CoreAbi.debug = true;
```

## Examples

### Basic Example

```typescript
import { CoreAbi } from "@anvoio/node-core-abi";
const coreAbi = CoreAbi.getInstance();

const abi = {
    "version": "eosio::abi/1.1",
    "structs": [
        {
            "name": "transfer",
            "base": "",
            "fields": [
                {"name": "from", "type": "name"},
                {"name": "to", "type": "name"},
                {"name": "quantity", "type": "asset"},
                {"name": "memo", "type": "string"}
            ]
        }
    ],
    "actions": [
        {
            "name": "transfer",
            "type": "transfer",
            "ricardian_contract": ""
        }
    ]
};

coreAbi.loadAbi("eosio.token", abi);

const json = {
    from: "alice",
    to: "bob",
    quantity: "10.0000 EOS",
    memo: "Test transfer"
};

const hex = coreAbi.jsonToHex("eosio.token", "transfer", json);
console.log("Hex:", hex);

const parsedJson = coreAbi.hexToJson("eosio.token", "transfer", hex);
console.log("Parsed JSON:", parsedJson);
```

Check the [/examples](https://github.com/AnvoIO/node-core-abi/tree/master/examples) folder for more implementation examples.

## Build Process and Dependencies

Make sure you have Clang installed on your system. We recommend using Clang 18 to build the `coreAbi` C++ library.

```bash
wget https://apt.llvm.org/llvm.sh
chmod +x llvm.sh
sudo ./llvm.sh 18
```

Clone and Build

```shell
git clone https://github.com/AnvoIO/node-core-abi.git --recursive
cd node-core-abi
npm install
npm run build:linux
npm run build
```

## Contribution Guidelines

For contribution guidelines and developer documentation, refer to the `docs/CONTRIBUTING.md` file.
