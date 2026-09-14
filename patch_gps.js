const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Add "Link Google Maps" field and "Pegar GPS" button to Client Form
const formGroupRegex = /(<div class="form-group">\s*<label class="form-label">Cidade \/ UF<\/label>\s*<input type="text" class="form-input" id="client-form-city-uf" placeholder="São Paulo \/ SP">\s*<\/div>\s*<\/div>)/;
if (content.match(formGroupRegex)) {
  content = content.replace(formGroupRegex, `$1
            
            <div class="form-row" style="margin-bottom: 0.85rem;">
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
                  Link do Google Maps (Localização Exata)
                  <button type="button" class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 4px;" onclick="ClientApp.getGPS()">
                    <i class="fa-solid fa-crosshairs" style="color: #3b82f6;"></i> Usar Meu GPS Atual
                  </button>
                </label>
                <input type="text" class="form-input" id="client-form-location-url" placeholder="Ex: https://goo.gl/maps/... ou clique em 'Usar Meu GPS'">
              </div>
            </div>`);
}

// 2. ClientApp.openForm modifications
if (!content.includes("document.getElementById('client-form-location-url').value = c.locationUrl || '';")) {
  content = content.replace("document.getElementById('client-form-city-uf').value = c.cityUf || '';", 
    `document.getElementById('client-form-city-uf').value = c.cityUf || '';\n            document.getElementById('client-form-location-url').value = c.locationUrl || '';`);
}

// 3. ClientApp.save modifications
if (!content.includes("const locationUrl = document.getElementById('client-form-location-url').value.trim();")) {
  content = content.replace("const cityUf = document.getElementById('client-form-city-uf').value.trim();", 
    `const cityUf = document.getElementById('client-form-city-uf').value.trim();\n        const locationUrl = document.getElementById('client-form-location-url').value.trim();`);
  
  content = content.replace("target.cityUf = cityUf;", 
    `target.cityUf = cityUf;\n          target.locationUrl = locationUrl;`);
  
  content = content.replace("cityUf,", 
    `cityUf,\n            locationUrl,`);
}

// 4. Add getGPS to ClientApp
if (!content.includes('getGPS() {')) {
  content = content.replace('openForm(client) {', `getGPS() {
        if (!navigator.geolocation) {
          showToast('GPS não suportado neste navegador.', 'error');
          return;
        }
        
        const btn = event.currentTarget;
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Lendo GPS...';
        
        navigator.geolocation.getCurrentPosition(pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const url = \`https://www.google.com/maps?q=\${lat},\${lng}\`;
          document.getElementById('client-form-location-url').value = url;
          showToast('GPS capturado com sucesso!', 'success');
          btn.innerHTML = oldHtml;
        }, err => {
          console.error(err);
          showToast('Erro ao ler GPS. Permita a localização.', 'error');
          btn.innerHTML = oldHtml;
        }, { enableHighAccuracy: true });
      },
      
      openForm(client) {`);
}

// 5. Render map pin in Clients list
if (!content.includes("c.locationUrl ?")) {
  const renderClientRowTarget = `<div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; color: #0f172a;">\${c.nomeFantasia}</span>`;
  
  const renderClientRowReplace = `<div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; color: #0f172a;">
                      \${c.nomeFantasia}
                      \${c.locationUrl ? \`<a href="\${c.locationUrl}" target="_blank" style="margin-left: 5px; color: #ef4444;" title="Abrir no Google Maps"><i class="fa-solid fa-location-dot"></i></a>\` : ''}
                    </span>`;
  content = content.replace(renderClientRowTarget, renderClientRowReplace);
}

// 6. Render map pin in Orders view
if (!content.includes('const locationHtml = targetClient && targetClient.locationUrl')) {
  const renderOrderTarget = `const targetClient = ClientApp.getById(o.clientId);
          const clientName = targetClient ? targetClient.nomeFantasia : 'Cliente Desconhecido';`;
  
  const renderOrderReplace = `const targetClient = ClientApp.getById(o.clientId);
          const clientName = targetClient ? targetClient.nomeFantasia : 'Cliente Desconhecido';
          const locationHtml = targetClient && targetClient.locationUrl ? \`<a href="\${targetClient.locationUrl}" target="_blank" style="color: #ef4444; margin-left: 5px;" title="Abrir no Google Maps"><i class="fa-solid fa-location-dot"></i></a>\` : '';`;
          
  content = content.replace(renderOrderTarget, renderOrderReplace);
  
  const renderOrderTdTarget = `<td>
                <div style="font-weight: 600; color: #0f172a;">\${clientName}</div>
                <div style="font-size: 0.75rem; color: #64748b;">\${o.id} \${badge}</div>
              </td>`;
  const renderOrderTdReplace = `<td>
                <div style="font-weight: 600; color: #0f172a;">\${clientName} \${locationHtml}</div>
                <div style="font-size: 0.75rem; color: #64748b;">\${o.id} \${badge}</div>
              </td>`;
              
  content = content.replace(renderOrderTdTarget, renderOrderTdReplace);
}


fs.writeFileSync(file, content, 'utf8');
console.log('Script simples de GPS aplicado com sucesso!');
