import assert from 'node:assert/strict';
import test from 'node:test';
import { CoreAbi } from '../dist/core-abi.js';
import { assertThrows } from './utils/test-helpers.js';

test.describe('Serialization (jsonToHex)', () => {
    const coreAbi = CoreAbi.getInstance();

    const contractAccount = "test.token";
    const transferABI = {
        version: "eosio::abi/1.1",
        types: [],
        structs: [{
            name: "transfer",
            base: "",
            fields: [
                { name: "from", type: "name" },
                { name: "to", type: "name" },
                { name: "quantity", type: "asset" },
                { name: "memo", type: "string" }
            ]
        }],
        actions: [{ name: "transfer", type: "transfer", ricardian_contract: "" }],
    };

    CoreAbi.debug = true;
    coreAbi.cleanup();
    coreAbi.loadAbi(contractAccount, transferABI);


    test('should serialize valid transfer action data', () => {
        const actionData = {
            from: "alice",
            to: "bob",
            quantity: "1.0000 EOS",
            memo: "test transfer"
        };
        const hex = coreAbi.jsonToHex(contractAccount, "transfer", actionData);
        assert.ok(typeof hex === 'string' && hex.length > 0, 'Should return a non-empty hex string');
    });

    test('should throw if ABI for contract is not loaded', () => {
        const actionData = { from: "a", to: "b", quantity: "1.0 EOS", memo: "m" };
        assertThrows(
            /is not loaded/i,
            () => coreAbi.jsonToHex("unknown", "transfer", actionData),
            'Should throw if ABI is not loaded'
        );
    });

    test('should throw if type is not found in ABI', () => {
        const actionData = { from: "a", to: "b", quantity: "1.0 EOS", memo: "m" };
        assertThrows(
            /Unknown type/i,
            () => coreAbi.jsonToHex(contractAccount, "unknown_type", actionData),
            'Should throw if type is not found'
        );
    });

    test('should throw for data with missing required fields', () => {
        const actionData = {
            from: "alice",
            quantity: "1.0000 EOS",
            memo: "test transfer"
        };
        assertThrows(
            /Expected field/i,
            () => coreAbi.jsonToHex(contractAccount, "transfer", actionData),
            'Should throw for missing required fields'
        );
    });

    test('should throw for data with incorrect types', () => {
        const actionData = {
            from: "alice",
            to: "bob",
            quantity: 12345,
            memo: "test transfer"
        };
        assertThrows(
            /Expected symbol code/i,
            () => coreAbi.jsonToHex(contractAccount, "transfer", actionData),
            'Should throw for incorrect data types'
        );
    });
});
