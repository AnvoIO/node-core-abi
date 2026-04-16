// lib/core-abi.ts
import { createRequire } from "module";
var coreAbi = createRequire(import.meta.url)("./core-abi.node");
var CoreAbi = class _CoreAbi {
  static logTag = "[node-core-abi]";
  static instance;
  static native;
  static loadedContracts = /* @__PURE__ */ new Map();
  static debug = false;
  /**
   * Private constructor to enforce the Singleton pattern.
   * Throws an error if an attempt is made to create a second instance.
   */
  constructor() {
    if (_CoreAbi.instance) {
      throw new Error(`${_CoreAbi.logTag} CoreAbi is a Singleton class. Use CoreAbi.getInstance() to get the instance.`);
    }
    _CoreAbi.native = coreAbi;
  }
  /**
   * Returns the singleton instance of the CoreAbi class.
   * If an instance does not already exist, it creates one.
   * @returns {CoreAbi} The singleton instance of CoreAbi.
   */
  static getInstance() {
    if (!_CoreAbi.instance) {
      _CoreAbi.instance = new _CoreAbi();
    }
    return _CoreAbi.instance;
  }
  getLoadedAbis() {
    return Array.from(_CoreAbi.loadedContracts.keys());
  }
  /**
   * Cleans up all loaded contracts by deleting them from the native context.
   * This is useful for freeing up resources and ensuring a clean state.
   */
  cleanup() {
    const errors = [];
    _CoreAbi.loadedContracts.forEach((_, contractName) => {
      try {
        if (_CoreAbi.debug) {
          console.log(`${_CoreAbi.logTag} Cleaning up contract '${contractName}'...`);
        }
        _CoreAbi.native.delete_contract(contractName);
        _CoreAbi.loadedContracts.delete(contractName);
      } catch (e) {
        errors.push({ contractName, error: e.message });
        console.error(`${_CoreAbi.logTag} Failed to delete contract '${contractName}' during cleanup: ${e.message}`);
      }
    });
    if (errors.length > 0) {
      throw new Error(`${_CoreAbi.logTag} Errors during cleanup: ${JSON.stringify(errors)}`);
    }
  }
  /**
   * Converts a string name to its corresponding 64-bit unsigned integer representation (BigInt).
   * @param {string} nameString The string name to convert.
   * @returns {BigInt} The BigInt representation of the name.
   */
  stringToName(nameString) {
    try {
      return _CoreAbi.native.string_to_name(nameString);
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Failed to convert string to name '${nameString}': ${e.message}`);
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
  jsonToHex(contractName, type, json) {
    const jsonData = typeof json === "object" ? JSON.stringify(json) : json;
    try {
      return _CoreAbi.native.json_to_hex(contractName, type, jsonData);
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Failed to convert JSON to hex for contract '${contractName}', type '${type}': ${e.message}`);
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
  hexToJson(contractName, type, hex) {
    try {
      const data = _CoreAbi.native.hex_to_json(contractName, type, hex);
      try {
        return JSON.parse(data);
      } catch (parseError) {
        throw new Error(`${_CoreAbi.logTag} Failed to parse JSON string from hex for contract '${contractName}', type '${type}'. Received: ${data}. Parse error: ${parseError.message}`);
      }
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Native error when converting hex to JSON for contract '${contractName}', type '${type}': ${e.message}`);
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
  binToJson(contractName, type, buffer) {
    try {
      const data = _CoreAbi.native.bin_to_json(contractName, type, buffer);
      try {
        return JSON.parse(data);
      } catch (parseError) {
        throw new Error(`${_CoreAbi.logTag} Failed to parse JSON string from binary for contract '${contractName}', type '${type}'. Received: ${data}. Parse error: ${parseError.message}`);
      }
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Native error when converting binary to JSON for contract '${contractName}', type '${type}': ${e.message}`);
    }
  }
  /**
   * Loads an ABI for a given contract.
   * @param {string} contractName The name of the contract for which to load the ABI.
   * @param {string | object} abi The ABI as a JSON string or object.
   * @returns {boolean} True if the ABI was loaded successfully, false otherwise.
   * @throws {Error} If the ABI format is invalid or loading fails.
   */
  loadAbi(contractName, abi) {
    if (_CoreAbi.debug && _CoreAbi.loadedContracts.has(contractName)) {
      console.info(`${_CoreAbi.logTag} Contract '${contractName}' is already loaded. Updating ABI...`);
    }
    const abiString = typeof abi === "object" ? JSON.stringify(abi) : abi;
    if (typeof abiString !== "string") {
      throw new Error(`${_CoreAbi.logTag} ABI must be a String or Object.`);
    }
    try {
      const loaded = _CoreAbi.native.load_abi(contractName, abiString);
      if (loaded) {
        _CoreAbi.loadedContracts.set(contractName, Date.now());
        if (_CoreAbi.debug) {
          console.log(`${_CoreAbi.logTag} Loaded ABI for contract '${contractName}'.`);
        }
      }
      return loaded;
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Failed to load ABI for contract '${contractName}': ${e.message}`);
    }
  }
  /**
   * Loads an ABI for a given contract from its hexadecimal representation.
   * @param {string} contractName The name of the contract for which to load the ABI.
   * @param {string} abihex The ABI as a hexadecimal string.
   * @returns {boolean} True if the ABI was loaded successfully, false otherwise.
   * @throws {Error} If loading fails.
   */
  loadAbiHex(contractName, abihex) {
    if (typeof abihex !== "string") {
      throw new Error(`${_CoreAbi.logTag} ABI hex must be a String.`);
    }
    if (_CoreAbi.debug && _CoreAbi.loadedContracts.has(contractName)) {
      console.info(`${_CoreAbi.logTag} Contract '${contractName}' is already loaded. Updating ABI...`);
    }
    try {
      const loaded = _CoreAbi.native.load_abi_hex(contractName, abihex);
      if (loaded) {
        _CoreAbi.loadedContracts.set(contractName, Date.now());
        if (_CoreAbi.debug) {
          console.log(`${_CoreAbi.logTag} Loaded ABI hex for contract '${contractName}'.`);
        }
      }
      return loaded;
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Failed to load ABI hex for contract '${contractName}': ${e.message}`);
    }
  }
  /**
   * Retrieves the type name for a specific action within a contract's ABI.
   * @param {string} contractName The name of the contract.
   * @param {string} actionName The name of the action.
   * @returns {string} The type name associated with the action.
   * @throws {Error} If the contract or action is not found or another error occurs.
   */
  getTypeForAction(contractName, actionName) {
    try {
      return _CoreAbi.native.get_type_for_action(contractName, actionName);
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Failed to get type for action '${actionName}' in contract '${contractName}': ${e.message}`);
    }
  }
  /**
   * Retrieves the type name for a specific table within a contract's ABI.
   * @param {string} contractName The name of the contract.
   * @param {string} table_name The name of the table.
   * @returns {string} The type name associated with the table.
   * @throws {Error} If the contract or table is not found or another error occurs.
   */
  getTypeForTable(contractName, table_name) {
    try {
      return _CoreAbi.native.get_type_for_table(contractName, table_name);
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Failed to get type for table '${table_name}' in contract '${contractName}': ${e.message}`);
    }
  }
  /**
   * Deletes a contract's ABI from the coreAbi context.
   * @param {string} contractName The name of the contract to delete.
   * @returns {boolean} True if the contract was successfully deleted, false otherwise.
   * @throws {Error} If deletion fails.
   */
  deleteContract(contractName) {
    try {
      const deleted = _CoreAbi.native.delete_contract(contractName);
      if (deleted) {
        _CoreAbi.loadedContracts.delete(contractName);
        if (_CoreAbi.debug) {
          console.log(`${_CoreAbi.logTag} Deleted contract '${contractName}' from coreAbi context.`);
        }
      }
      return deleted;
    } catch (e) {
      throw new Error(`${_CoreAbi.logTag} Failed to delete contract '${contractName}': ${e.message}`);
    }
  }
};
export {
  CoreAbi
};
