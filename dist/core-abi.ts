import { createRequire } from "node:module";
const coreAbi = createRequire(import.meta.url)('./core-abi.node');

/**
 * CoreAbi class provides a singleton instance for interacting with the native coreAbi module.
 * This pattern is used to ensure a single global context for the underlying C++ coreAbi library,
 * which manages internal state and resources.
 */
export class CoreAbi {

    public static logTag: string = '[node-core-abi]';
    private static instance: CoreAbi;
    public static native: typeof coreAbi;
    private static loadedContracts: Map<string, number> = new Map();
    public static debug: boolean = false;

    /**
     * Private constructor to enforce the Singleton pattern.
     * Throws an error if an attempt is made to create a second instance.
     */
    private constructor() {
        if (CoreAbi.instance) {
            throw new Error(`${CoreAbi.logTag} CoreAbi is a Singleton class. Use CoreAbi.getInstance() to get the instance.`);
        }
        CoreAbi.native = coreAbi;
    }

    /**
     * Returns the singleton instance of the CoreAbi class.
     * If an instance does not already exist, it creates one.
     * @returns {CoreAbi} The singleton instance of CoreAbi.
     */
    public static getInstance(): CoreAbi {
        if (!CoreAbi.instance) {
            CoreAbi.instance = new CoreAbi();
        }
        return CoreAbi.instance;
    }

    public getLoadedAbis(): string[] {
        return Array.from(CoreAbi.loadedContracts.keys());
    }

    /**
     * Cleans up all loaded contracts by deleting them from the native context.
     * This is useful for freeing up resources and ensuring a clean state.
     */
    public cleanup(): void {
        /* node:coverage disable */
        const errors: any[] = [];
        CoreAbi.loadedContracts.forEach((_, contractName) => {
            try {
                if (CoreAbi.debug) {
                    console.log(`${CoreAbi.logTag} Cleaning up contract '${contractName}'...`);
                }
                CoreAbi.native.delete_contract(contractName);
                CoreAbi.loadedContracts.delete(contractName);
            } catch (e: any) {
                errors.push({ contractName, error: e.message });
                console.error(`${CoreAbi.logTag} Failed to delete contract '${contractName}' during cleanup: ${e.message}`);
            }
        });
        if (errors.length > 0) {
            throw new Error(`${CoreAbi.logTag} Errors during cleanup: ${JSON.stringify(errors)}`);
        }
        /* node:coverage enable */
    }

    /**
     * Converts a string name to its corresponding 64-bit unsigned integer representation (BigInt).
     * @param {string} nameString The string name to convert.
     * @returns {BigInt} The BigInt representation of the name.
     */
    public stringToName(nameString: string): BigInt {
        // The native C++ function returns a JavaScript BigInt.
        try {
            return CoreAbi.native.string_to_name(nameString) as BigInt;
        } catch (e: any) {
            throw new Error(`${CoreAbi.logTag} Failed to convert string to name '${nameString}': ${e.message}`);
        }
    }

    /**
     * Converts a JSON string or object to its hexadecimal binary representation.
     * @param {string} contractName The name of the contract.
     * @param {string} type The type within the ABI to use for conversion.
     * @param {string | object} json The JSON data as a string or object.
     * @returns {string} The hexadecimal string representation of the binary data.
     * @throws {Error} If parsing fails or an error occurs in the native module.
     */
    public jsonToHex(contractName: string, type: string, json: string | object): string {
        const jsonData = typeof json === 'object' ? JSON.stringify(json) : json;
        try {
            return CoreAbi.native.json_to_hex(contractName, type, jsonData) as string;
        } catch (e: any) {
            throw new Error(`${CoreAbi.logTag} Failed to convert JSON to hex for contract '${contractName}', type '${type}': ${e.message}`);
        }
    }

    /**
     * Converts a hexadecimal binary string to its JSON representation.
     * @param {string} contractName The name of the contract.
     * @param {string} type The type within the ABI to use for conversion.
     * @param {string} hex The hexadecimal string to convert.
     * @returns {any} The parsed JSON object.
     * @throws {Error} If parsing fails or an error occurs in the native module.
     */
    public hexToJson(contractName: string, type: string, hex: string): any {
        try {
            const data = CoreAbi.native.hex_to_json(contractName, type, hex) as string;
            // Attempt to parse the string data as JSON.
            // This is still necessary as the native module returns a string.
            /* node:coverage disable */
            try {
                return JSON.parse(data);
            } catch (parseError: any) {
                // If JSON.parse fails, it means the string returned by native module was not valid JSON.
                // This could be an error message string from C++ if it didn't throw an N-API error,
                // or just malformed JSON.
                throw new Error(`${CoreAbi.logTag} Failed to parse JSON string from hex for contract '${contractName}', type '${type}'. Received: ${data}. Parse error: ${parseError.message}`);
            }
            /* node:coverage enable */
        } catch (e: any) {
            // This catches errors thrown by the N-API layer itself.
            throw new Error(`${CoreAbi.logTag} Native error when converting hex to JSON for contract '${contractName}', type '${type}': ${e.message}`);
        }
    }

    /**
     * Converts a binary buffer to its JSON representation.
     * @param {string} contractName The name of the contract.
     * @param {string} type The type within the ABI to use for conversion.
     * @param {Buffer} buffer The binary data as a Buffer.
     * @returns {any} The parsed JSON object.
     * @throws {Error} If parsing fails or an error occurs in the native module.
     */
    public binToJson(contractName: string, type: string, buffer: Buffer): any {
        try {
            const data = CoreAbi.native.bin_to_json(contractName, type, buffer) as string;
            // Attempt to parse the string data as JSON.
            /* node:coverage disable */
            try {
                return JSON.parse(data);
            } catch (parseError: any) {
                throw new Error(`${CoreAbi.logTag} Failed to parse JSON string from binary for contract '${contractName}', type '${type}'. Received: ${data}. Parse error: ${parseError.message}`);
            }
            /* node:coverage enable */
        } catch (e: any) {
            // This catches errors thrown by the N-API layer itself.
            throw new Error(`${CoreAbi.logTag} Native error when converting binary to JSON for contract '${contractName}', type '${type}': ${e.message}`);
        }
    }

    /**
     * Loads an ABI for a given contract.
     * @param {string} contractName The name of the contract for which to load the ABI.
     * @param {string | object} abi The ABI as a JSON string or object.
     * @returns {boolean} True if the ABI was loaded successfully, false otherwise.
     * @throws {Error} If the ABI format is invalid or loading fails.
     */
    public loadAbi(contractName: string, abi: string | object): boolean {

        if (CoreAbi.debug && CoreAbi.loadedContracts.has(contractName)) {
            console.info(`${CoreAbi.logTag} Contract '${contractName}' is already loaded. Updating ABI...`);
        }

        const abiString = typeof abi === 'object' ? JSON.stringify(abi) : abi;
        if (typeof abiString !== 'string') { // Should be caught by TS but good runtime check
            throw new Error(`${CoreAbi.logTag} ABI must be a String or Object.`);
        }
        try {
            const loaded = CoreAbi.native.load_abi(contractName, abiString) as boolean;
            if (loaded) {
                CoreAbi.loadedContracts.set(contractName, Date.now());
                if (CoreAbi.debug) {
                    console.log(`${CoreAbi.logTag} Loaded ABI for contract '${contractName}'.`);
                }
            }
            return loaded;
        } catch (e: any) {
            throw new Error(`${CoreAbi.logTag} Failed to load ABI for contract '${contractName}': ${e.message}`);
        }
    }

    /**
     * Loads an ABI for a given contract from its hexadecimal representation.
     * @param {string} contractName The name of the contract for which to load the ABI.
     * @param {string} abihex The ABI as a hexadecimal string.
     * @returns {boolean} True if the ABI was loaded successfully, false otherwise.
     * @throws {Error} If loading fails.
     */
    public loadAbiHex(contractName: string, abihex: string): boolean {

        if (typeof abihex !== 'string') {
            throw new Error(`${CoreAbi.logTag} ABI hex must be a String.`);
        }

        /* node:coverage disable */
        if (CoreAbi.debug && CoreAbi.loadedContracts.has(contractName)) {
            console.info(`${CoreAbi.logTag} Contract '${contractName}' is already loaded. Updating ABI...`);
        }
        /* node:coverage enable */

        try {
            const loaded = CoreAbi.native.load_abi_hex(contractName, abihex);
            if (loaded) {
                CoreAbi.loadedContracts.set(contractName, Date.now());
                if (CoreAbi.debug) {
                    console.log(`${CoreAbi.logTag} Loaded ABI hex for contract '${contractName}'.`);
                }
            }
            return loaded;
        } catch (e: any) {
            throw new Error(`${CoreAbi.logTag} Failed to load ABI hex for contract '${contractName}': ${e.message}`);
        }
    }

    /**
     * Retrieves the type name for a specific action within a contract's ABI.
     * @param {string} contractName The name of the contract.
     * @param {string} actionName The name of the action.
     * @returns {string} The type name associated with the action.
     * @throws {Error} If the contract or action is not found or another error occurs.
     */
    public getTypeForAction(contractName: string, actionName: string): string {
        try {
            return CoreAbi.native.get_type_for_action(contractName, actionName) as string;
        } catch (e: any) {
            throw new Error(`${CoreAbi.logTag} Failed to get type for action '${actionName}' in contract '${contractName}': ${e.message}`);
        }
    }

    /**
     * Retrieves the type name for a specific table within a contract's ABI.
     * @param {string} contractName The name of the contract.
     * @param {string} table_name The name of the table.
     * @returns {string} The type name associated with the table.
     * @throws {Error} If the contract or table is not found or another error occurs.
     */
    public getTypeForTable(contractName: string, table_name: string): string {
        try {
            return CoreAbi.native.get_type_for_table(contractName, table_name) as string;
        } catch (e: any) {
            throw new Error(`${CoreAbi.logTag} Failed to get type for table '${table_name}' in contract '${contractName}': ${e.message}`);
        }
    }

    /**
     * Deletes a contract's ABI from the coreAbi context.
     * @param {string} contractName The name of the contract to delete.
     * @returns {boolean} True if the contract was successfully deleted, false otherwise.
     * @throws {Error} If deletion fails.
     */
    public deleteContract(contractName: string): boolean {
        try {
            const deleted = CoreAbi.native.delete_contract(contractName);
            if (deleted) {
                CoreAbi.loadedContracts.delete(contractName);
                if (CoreAbi.debug) {
                    console.log(`${CoreAbi.logTag} Deleted contract '${contractName}' from coreAbi context.`);
                }
            }
            return deleted;
        } catch (e: any) {
            throw new Error(`${CoreAbi.logTag} Failed to delete contract '${contractName}': ${e.message}`);
        }
    }
}
