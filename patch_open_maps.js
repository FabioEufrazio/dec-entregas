const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// Replace the getGPS button with just a normal link button
const buttonTarget = `<button type="button" class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 4px;" onclick="ClientApp.getGPS()">
                    <i class="fa-solid fa-crosshairs" style="color: #3b82f6;"></i> Usar Meu GPS Atual
                  </button>`;
                  
const buttonReplace = `<button type="button" class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 4px;" onclick="window.open('https://www.google.com/maps', '_blank')">
                    <i class="fa-solid fa-map" style="color: #3b82f6;"></i> Abrir Google Maps
                  </button>`;

content = content.replace(buttonTarget, buttonReplace);

// Remove the getGPS() JS function from ClientApp
const jsTargetRegex = /getGPS\(\) \{[\s\S]*?\},[\s\n]*openForm\(client\) \{/;
if (content.match(jsTargetRegex)) {
  content = content.replace(jsTargetRegex, `openForm(client) {`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Botão simplificado para apenas Abrir o Maps!');
