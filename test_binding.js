const fs = require('fs');
const html = fs.readFileSync('local.html', 'utf8');

const regex = /ClientApp\.save\(event\)/g;
console.log("Occurrences of ClientApp.save(event):", html.match(regex).length);
