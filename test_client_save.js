const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

let html = fs.readFileSync('local.html', 'utf8');

// Inject our test at the end of the script
html = html.replace('</script>', `
  setTimeout(() => {
    try {
      console.log("STARTING TEST");
      document.getElementById('client-form-nome-fantasia').value = "Test Client";
      document.getElementById('client-form-cnpj').value = "12.345.678/0001-99";
      
      const event = new Event('submit', { bubbles: true, cancelable: true });
      document.getElementById('client-form').dispatchEvent(event);
      
      console.log("Test finished without throw. Total clients:", ClientApp.clients.length);
    } catch(e) {
      console.error("RUNTIME ERROR:", e);
    }
  }, 1000);
</script>`);

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
  url: "http://localhost/"
});

setTimeout(() => {
  process.exit(0);
}, 2000);
