import {CoreAbi} from "../lib/coreAbi.js";

const coreAbi = CoreAbi.getInstance();

const abi = `
{
    "version": "eosio::abi/1.1",
    "structs": [
        {
            "name": "foo",
            "fields": [
                {
                    "name": "things",
                    "type": "variant_things"
                }
            ]
        },
        {
            "name": "bar",
            "fields": [
                {
                    "name": "baz",
                    "type": "string"
                }
            ]
        }

    ],
    "variants": [
        {
            "name": "variant_things",
            "types": [
                "bar",
                "uint8"
            ]
        }
    ]
}
`;

const status = coreAbi.loadAbi("1", abi);
console.log(status);

const hex = coreAbi.jsonToHex("1", "foo", {
    things: ["uint8", 4]
});
console.log(hex);

const hex2 = coreAbi.jsonToHex("1", "foo", {
    things: ["bar", {baz: "moo"}]
});
console.log(hex2);

const data = coreAbi.hexToJson("1", "foo", hex);
console.log(data);

const data2 = coreAbi.hexToJson("1", "foo", hex2);
console.log(data2);
