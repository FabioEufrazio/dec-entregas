const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// Replace the current button with the combined function
const buttonTarget = `<button type="button" class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 4px;" onclick="window.open('https://www.google.com/maps', '_blank')">
                    <i class="fa-solid fa-map" style="color: #3b82f6;"></i> Abrir Google Maps
                  </button>`;
                  
const buttonReplace = `<button type="button" class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 4px;" onclick="ClientApp.captureAndOpenMaps(event)">
                    <i class="fa-solid fa-location-crosshairs" style="color: #ef4444;"></i> Capturar e Abrir Maps
                  </button>`;

if (content.includes(buttonTarget)) {
  content = content.replace(buttonTarget, buttonReplace);
}

// Add the captureAndOpenMaps() JS function to ClientApp
if (!content.includes('captureAndOpenMaps(event) {')) {
  content = content.replace('openForm(client) {', `captureAndOpenMaps(event) {
        if (!navigator.geolocation) {
          showToast('GPS não suportado neste navegador.', 'error');
          return;
        }
        
        const btn = event.currentTarget;
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Capturando...';
        
        navigator.geolocation.getCurrentPosition(pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const url = \`https://www.google.com/maps?q=\${lat},\${lng}\`;
          
          // Preenche nosso formulário
          document.getElementById('client-form-location-url').value = url;
          showToast('Coordenadas capturadas e salvas!', 'success');
          btn.innerHTML = oldHtml;
          
          // E abre o maps pra ele ver
          window.open(url, '_blank');
          
        }, err => {
          console.error(err);
          showToast('Erro ao ler GPS. Permita a localização.', 'error');
          btn.innerHTML = oldHtml;
        }, { enableHighAccuracy: true });
      },
      
      openForm(client) {`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Botão misto aplicado!');
