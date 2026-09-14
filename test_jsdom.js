const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('local.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("DOM ERROR:", err);
});
virtualConsole.on("jsdomError", (err) => {
  console.error("JSDOM ERROR:", err.message, err.detail);
});

const dom = new JSDOM(html, { 
  runScripts: "dangerously", 
  virtualConsole,
  resources: "usable",
  url: "http://localhost/local.html"
});

setTimeout(() => {
  console.log("Done waiting for DOMContentLoaded");
  process.exit(0);
}, 5000);
