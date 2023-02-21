import test from "node:test";
import path from "path";
import fs from "fs";

// don't want to recursively run this file
const excluded_test_files = ["run.js", "package.json", "utils.js"];
// should be run from the repo root dir
const testDir = path.join(process.cwd(), 'test');

// recursively get all files from a folder
// may be overkill since we only expect 2 child folders in
// 'unit' and 'integration' but it couldn't hurt
function get_files(dirName) {
    var files = fs.readdirSync(dirName);
    var result = [];
    files.forEach((file) => {
        var filepath = path.join(dirName, file);
        console.log(filepath);
        if (fs.statSync(filepath).isDirectory()) {
            result = result.concat(get_files(filepath));
        } else if (!excluded_test_files.includes(file)) {
            result.push(filepath);
        }
    });
    return result;
}

var testStream = test.run({files: get_files(testDir)});
console.log(testStream);
testStream.pipe(process.stdout);
console.log(testStream);
var error = false;
for await (const event of testStream) {
    if (typeOf(event) === test.fail)  {
        error = true;
    }
}
if (error) {
    process.exit(1);
}