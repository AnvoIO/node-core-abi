import { copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";

if (!existsSync("build/Release/core-abi.node")) {
    console.log("core-abi.node does not exist in the build directory. Skipping copy.");
    process.exit(0);
}

await copyFile("build/Release/core-abi.node", "lib/core-abi.node");
console.log("native module (core-abi.node) copied to lib directory.");
