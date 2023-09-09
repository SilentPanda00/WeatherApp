const fs = require("fs");
const text = fs.readFileSync("./locations.json", "utf-8");
console.log(text);
