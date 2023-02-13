const test = require("node:test");
const path = require("path");
const fs = require("fs");

// don't want to recursively run this file
const excluded_test_files = ["run.js"];
// should be run from the repo root dir
const testDir = path.join(process.cwd(), 'test');

// recursively get all files from a folder
// may be overkill since we only expect 2 child folders in
// 'unit' and 'integration' but it couldn't hurt
function get_files(dirName) {
    var files = fs.readdirSync(dirName);
    result = [];
    files.forEach((file) => {
        var filepath = path.join(dirName, file);
        if (fs.statSync(filepath).isDirectory()) {
            result.concat(get_files(filepath));
        } else if (!excluded_test_files.includes(file)) {
            result.push(filepath);
        }
    });
    return result;
}

test.run({files: get_files(testDir)}).pipe(process.stdout);