const fs = require('fs');
var contents = fs.readFileSync('./dist/ui-leonardo.js', 'utf8');
console.log(contents);