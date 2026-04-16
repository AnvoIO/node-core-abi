import {CoreAbi} from "@anvoio/node-core-abi";
import {ABI, Serializer} from "@wharfkit/antelope";

const coreAbi = CoreAbi.getInstance();

const eosioNftFt = await fetch("https://ultra.eosrio.io/v1/chain/get_abi",{
    method: "POST",
    body: JSON.stringify({
        account_name: "eosio.nft.ft",
        json: true
    })
});

const abiData = JSON.stringify((await eosioNftFt.json()).abi);

// loading ABI
const status = coreAbi.loadAbi('eosio.nft.ft', abiData);

process.exit();

// const abi = ABI.from({
//     types: [
//         {
//             new_type_name: "vec_string",
//             type: "string[]"
//         },
//         {
//             new_type_name: "vec_uint8",
//             type: "uint8[]"
//         }
//     ],
//     structs: [
//         {
//             name: "nested",
//             base: "",
//             fields: [
//                 {name: "string_vec", type: "string[]"},
//                 {name: "string_vec_nested", type: "vec_string[]"},
//                 {name: "uint8_vec_nested", type: "vec_uint8[]"}
//             ]
//         }
//     ],
// });
//
// const testObject = {
//     string_vec: ["A", "B"],
//     string_vec_nested: [["A1", "B1"], ["A2", "B2"]],
//     uint8_vec_nested: [[1, 2], [3, 4]]
// };
//
// const inputString = JSON.stringify(testObject);
//
// console.log("Test Data", testObject);
//
// const serializedData = Serializer.encode({
//     abi,
//     type: "nested",
//     object: testObject
// });
//
// const hexData = serializedData.toString('hex');
//
// console.log("HEX Data (from Wharfkit)\n", hexData);
//
// const deserializedData = Serializer.decode({
//     abi,
//     type: 'nested',
//     data: hexData
// });
//
// console.log("Deserialized Data (Wharfkit)", Serializer.objectify(deserializedData));
//
// // loading ABI
// const status = coreAbi.loadAbi('test', abi.toJSON());
// if (status) {
//
//     // deserialize
//     const coreAbiDecoded = coreAbi.hexToJson('test', 'nested', hexData);
//     console.log("Deserialized Data (core-abi)", coreAbiDecoded);
//     if (JSON.stringify(coreAbiDecoded) !== inputString) {
//         console.error(`Input / Output Mismatch`);
//     } else {
//         console.log('JSON Data Matched!');
//     }
//
//     // serialize again
//     const coreAbiEncoded = coreAbi.jsonToHex('test', 'nested', coreAbiDecoded);
//     console.log("HEX Data (core-abi)\n", coreAbiEncoded);
//     if (hexData !== coreAbiEncoded) {
//         console.error(`Hex Data Mismatch`);
//     } else {
//         console.log('HEX Data Matched!');
//     }
// }
