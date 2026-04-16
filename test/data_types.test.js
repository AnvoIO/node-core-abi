import assert from 'node:assert/strict';
import test from 'node:test';
import { CoreAbi } from '../dist/core-abi.js';

test.describe('Specific Data Type Serialization/Deserialization', () => {
    const coreAbi = CoreAbi.getInstance();

    // Constants specific to this test suite
    const contract = 'datatype.test';
    const abi = {
        version: 'eosio::abi/1.1',
        types: [],
        structs: [
            {
                name: 'basic_types',
                base: '',
                fields: [
                    { name: 'f_bool', type: 'bool' },
                    { name: 'f_int8', type: 'int8' },
                    { name: 'f_uint8', type: 'uint8' },
                    { name: 'f_string', type: 'string' },
                    { name: 'f_name', type: 'name' },
                ],
            }
        ],
        actions: [
            { name: 'testbasic', type: 'basic_types', ricardian_contract: '' },
        ],
        variants: [],
    };

    CoreAbi.debug = true;
    coreAbi.cleanup();
    coreAbi.loadAbi(contract, abi);


    test('should serialize and deserialize basic types correctly', () => {
        const basicTypesData = {
            f_bool: true,
            f_int8: -128,
            f_uint8: 255,
            f_string: "hello world",
            f_name: "eosio.token"
        };

        const hex = coreAbi.jsonToHex(contract, 'basic_types', basicTypesData);
        assert.ok(typeof hex === 'string' && hex.length > 0, 'Serialization should produce hex');

        const deserialized = coreAbi.hexToJson(contract, 'basic_types', hex);
        assert.deepStrictEqual(deserialized, basicTypesData, 'Deserialized data should match original');
    });
});
