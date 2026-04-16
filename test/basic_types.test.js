import assert from 'node:assert/strict';
import test from 'node:test';
import { CoreAbi } from '../dist/core-abi.js';
import { assertThrows, testRoundTrip as globalTestRoundTrip } from './utils/test-helpers.js';

test.describe('Type Testing - Basic Types', () => {
    const coreAbi = CoreAbi.getInstance();
    const contract = 'types.test';
    const basicTypesAbi = {
        version: 'eosio::abi/1.1',
        types: [],
        structs: [
            { name: 'bool_type', base: '', fields: [{ name: 'value', type: 'bool' }] },
            { name: 'int8_type', base: '', fields: [{ name: 'value', type: 'int8' }] },
            { name: 'int16_type', base: '', fields: [{ name: 'value', type: 'int16' }] },
            { name: 'int32_type', base: '', fields: [{ name: 'value', type: 'int32' }] },
            { name: 'int64_type', base: '', fields: [{ name: 'value', type: 'int64' }] },
            { name: 'uint8_type', base: '', fields: [{ name: 'value', type: 'uint8' }] },
            { name: 'uint16_type', base: '', fields: [{ name: 'value', type: 'uint16' }] },
            { name: 'uint32_type', base: '', fields: [{ name: 'value', type: 'uint32' }] },
            { name: 'uint64_type', base: '', fields: [{ name: 'value', type: 'uint64' }] },
            { name: 'float32_type', base: '', fields: [{ name: 'value', type: 'float32' }] },
            { name: 'float64_type', base: '', fields: [{ name: 'value', type: 'float64' }] },
            { name: 'array_type', base: '', fields: [{ name: 'values', type: 'uint8[]' }] },
            { name: 'optional_type', base: '', fields: [{ name: 'value', type: 'string?' }] }
        ],
        actions: [],
        tables: [],
        variants: []
    };

    CoreAbi.debug = true;
    coreAbi.cleanup();
    coreAbi.loadAbi(contract, basicTypesAbi);


    test('boolean type serialization/deserialization', () => {
        globalTestRoundTrip(coreAbi, contract, 'bool_type', { value: true });
        globalTestRoundTrip(coreAbi, contract, 'bool_type', { value: false });

        assertThrows(
            /Expected true or false/i,
            () => coreAbi.jsonToHex(contract, 'bool_type', { value: 'true' }),
            'Should reject string "true" as a boolean'
        );

        assertThrows(
            /Expected true or false/i,
            () => coreAbi.jsonToHex(contract, 'bool_type', { value: 1 }),
            'Should reject number as a boolean'
        );
    });

    test('int8 type serialization/deserialization', () => {
        globalTestRoundTrip(coreAbi, contract, 'int8_type', { value: -128 });
        globalTestRoundTrip(coreAbi, contract, 'int8_type', { value: 0 });
        globalTestRoundTrip(coreAbi, contract, 'int8_type', { value: 127 });

        assertThrows(
            /number is out of range/i,
            () => coreAbi.jsonToHex(contract, 'int8_type', { value: -129 }),
            'Should reject value below int8 min'
        );

        assertThrows(
            /number is out of range/i,
            () => coreAbi.jsonToHex(contract, 'int8_type', { value: 128 }),
            'Should reject value above int8 max'
        );
    });

    test('uint8 type serialization/deserialization', () => {
        globalTestRoundTrip(coreAbi, contract, 'uint8_type', { value: 0 });
        globalTestRoundTrip(coreAbi, contract, 'uint8_type', { value: 255 });

        assertThrows(
            /Expected integer/i,
            () => coreAbi.jsonToHex(contract, 'uint8_type', { value: -1 }),
            'Should reject negative value for uint8'
        );

        assertThrows(
            /number is out of range/i,
            () => coreAbi.jsonToHex(contract, 'uint8_type', { value: 256 }),
            'Should reject value above uint8 max'
        );
    });

    test('int64 type serialization/deserialization', () => {
        globalTestRoundTrip(coreAbi, contract, 'int64_type', { value: "-9223372036854775808" });
        globalTestRoundTrip(coreAbi, contract, 'int64_type', { value: "0" });
        globalTestRoundTrip(coreAbi, contract, 'int64_type', { value: "9223372036854775807" });

        assertThrows(
            /number is out of range/i,
            () => coreAbi.jsonToHex(contract, 'int64_type', { value: "-9223372036854775809" }),
            'Should reject value below int64 min'
        );

        assertThrows(
            /number is out of range/i,
            () => coreAbi.jsonToHex(contract, 'int64_type', { value: "9223372036854775808" }),
            'Should reject value above int64 max'
        );
    });

    test('uint64 type serialization/deserialization', () => {
        globalTestRoundTrip(coreAbi, contract, 'uint64_type', { value: "0" });
        globalTestRoundTrip(coreAbi, contract, 'uint64_type', { value: "18446744073709551615" });

        assertThrows(
            /Expected integer/i,
            () => coreAbi.jsonToHex(contract, 'uint64_type', { value: "-1" }),
            'Should reject negative value for uint64'
        );

        assertThrows(
            /number is out of range/i,
            () => coreAbi.jsonToHex(contract, 'uint64_type', { value: "18446744073709551616" }),
            'Should reject value above uint64 max'
        );
    });

    test('float types serialization/deserialization', () => {
        const float32Data = { value: 1.1 };
        const float32Hex = coreAbi.jsonToHex(contract, 'float32_type', float32Data);
        const float32Result = coreAbi.hexToJson(contract, 'float32_type', float32Hex);
        assert.ok(Math.abs(float32Result.value - 1.1) < 0.00001, 'Float32 value should be approximately equal after roundtrip');

        globalTestRoundTrip(coreAbi, contract, 'float32_type', { value: 0.0 });
        globalTestRoundTrip(coreAbi, contract, 'float64_type', { value: 0.0 });
        globalTestRoundTrip(coreAbi, contract, 'float64_type', { value: 1.1 });
        globalTestRoundTrip(coreAbi, contract, 'float64_type', { value: -1.1 });

        assertThrows(
            /Expected number or boolean/i,
            () => coreAbi.jsonToHex(contract, 'float32_type', { value: "not a number" }),
            'Should reject non-numeric string for float32'
        );
    });

    test('array type serialization/deserialization', () => {
        globalTestRoundTrip(coreAbi, contract, 'array_type', { values: [] });
        globalTestRoundTrip(coreAbi, contract, 'array_type', { values: [1, 2, 3] });
        globalTestRoundTrip(coreAbi, contract, 'array_type', { values: [0, 255] });

        assertThrows(
            /Expected integer/i,
            () => coreAbi.jsonToHex(contract, 'array_type', { values: ["not a number"] }),
            'Should reject non-numeric values in uint8 array'
        );

        assertThrows(
            /number is out of range/i,
            () => coreAbi.jsonToHex(contract, 'array_type', { values: [256] }),
            'Should reject values above uint8 max in array'
        );
    });

    test('optional type serialization/deserialization', () => {
        globalTestRoundTrip(coreAbi, contract, 'optional_type', { value: "test string" });
        globalTestRoundTrip(coreAbi, contract, 'optional_type', { value: null });

        const hexWithValue = coreAbi.jsonToHex(contract, 'optional_type', { value: "test string" });
        const hexWithNull = coreAbi.jsonToHex(contract, 'optional_type', { value: null });

        assert.notEqual(hexWithValue, hexWithNull, 'Hex with optional value should differ from hex with null');

        const jsonWithValue = coreAbi.hexToJson(contract, 'optional_type', hexWithValue);
        const jsonWithNull = coreAbi.hexToJson(contract, 'optional_type', hexWithNull);

        assert.strictEqual(jsonWithValue.value, "test string", 'Deserialized optional should preserve string value');
        assert.strictEqual(jsonWithNull.value, null, 'Deserialized optional should preserve null value');
    });
});
