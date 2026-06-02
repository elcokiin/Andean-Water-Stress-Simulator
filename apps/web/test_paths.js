const fs = require('fs');
const path = require('path');
const dirs = ["array", "function", "math", "object", "predicate", "string", "util"];
const esToolkitPath = path.resolve(__dirname, "../../node_modules/es-toolkit/dist/compat");
console.log("Checking path:", esToolkitPath);
for (const dir of dirs) {
    const mjsPath = path.join(esToolkitPath, dir, "get.mjs");
    console.log(mjsPath, fs.existsSync(mjsPath));
}
