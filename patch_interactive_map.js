const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Leaflet CDN
if (!content.includes('leaflet.css')) {
  content = content.replace('</head>', `  <!-- Leaflet CSS & JS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
</head>`);
}

// 2. Map Modal HTML
const mapModalHtml = `<!-- ==========================================================================
       MODAL MAPA INTERATIVO (LEAFLET)
       ========================================================================== -->
  <div class="modal-overlay" id="map-modal" style="z-index: 100000;">
    <div class="modal-card" style="width: 100%; height: 100%; max-width: none; border-radius: 0; display: flex; flex-direction: column; background: #f8fafc;">
      <div class="modal-header" style="background: #1e1e2d; color: white; border-bottom: none; border-radius: 0; padding: 1rem;">
        <button class="btn btn-icon-only" style="color: white; font-size: 1.2rem; background: transparent; padding: 0;" onclick="ModalEngine.close('map-modal')"><i class="fa-solid fa-arrow-left"></i></button>
        <h2 style="font-size: 1.1rem; color: white; margin: 0; margin-left: 1rem; flex: 1;">Endereço no Mapa</h2>
      </div>
      <div class="modal-body" style="flex: 1; padding: 0; position: relative;">
        <!-- Container do Mapa -->
        <div id="leaflet-map-container" style="width: 100%; height: 100%;"></div>
        
        <!-- Marcador Fixo Centralizado -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -100%); z-index: 1000; pointer-events: none;">
          <i class="fa-solid fa-location-dot" style="color: #4338ca; font-size: 2.5rem; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.3));"></i>
        </div>
        
        <!-- Botão de GPS -->
        <button class="btn btn-secondary btn-icon-only" style="position: absolute; top: 20px; right: 20px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); border-radius: 8px; width: 45px; height: 45px; background: white; color: #4338ca;" onclick="MapEngine.centerOnGPS()" title="Meu Local (GPS)">
          <i class="fa-solid fa-crosshairs" style="font-size: 1.2rem;"></i>
        </button>
        
        <!-- Texto de Endereço em tempo real (opcional) -->
        <div id="map-address-preview" style="position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 1000; background: white; padding: 10px 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-size: 0.85rem; font-weight: 600; color: #1e293b; width: 90%; max-width: 400px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: none;">
          Movendo...
        </div>

        <!-- Botão PRONTO -->
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 15px; background: transparent; z-index: 1000;">
          <button class="btn btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem; font-weight: bold; background: #3b28cc; border: none; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); text-transform: uppercase;" onclick="MapEngine.confirmLocation(event)">
            PRONTO
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       MODAL 4:`;

if (!content.includes('id="map-modal"')) {
  // Try replacing with \r\n
  if (content.includes('<!-- ==========================================================================\r\n       MODAL 4:')) {
    content = content.replace('<!-- ==========================================================================\r\n       MODAL 4:', mapModalHtml);
  } else {
    content = content.replace('<!-- ==========================================================================\n       MODAL 4:', mapModalHtml);
  }
}

// 3. Client Form Button and Hidden Input
// Remove the old button and input from patch_mixed
const oldFieldTargetRegex = /<div class="form-row" style="margin-bottom: 0\.85rem;">\s*<div class="form-group" style="grid-column: span 2;">\s*<label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">\s*Link do Google Maps \(Localização Exata\)\s*<button type="button" class="btn btn-secondary"[^>]*onclick="ClientApp\.captureAndOpenMaps\(event\)">[\s\S]*?<\/button>\s*<\/label>\s*<input type="text" class="form-input" id="client-form-location-url" placeholder="Ex: https:\/\/goo.gl\/maps\/... ou clique em 'Usar Meu GPS'">\s*<\/div>\s*<\/div>/;

if (content.match(oldFieldTargetRegex)) {
  content = content.replace(oldFieldTargetRegex, ''); // Remove it completely, we will re-add it gracefully
}

// Add the new "Buscar no Mapa" button inside the Address field label, exactly like the screenshot
const addressLabelTarget = '<label class="form-label">Endereço (Logradouro, Nº, Bairro)</label>';
if (content.includes(addressLabelTarget)) {
  content = content.replace(addressLabelTarget, `<label class="form-label">Endereço (Logradouro, Nº, Bairro)</label>\n                <button type="button" class="btn btn-secondary" style="width: 100%; margin-bottom: 10px; padding: 12px; font-size: 0.95rem; background: white; color: #4338ca; border: 1px solid #c7d2fe; border-radius: 50px; font-weight: 600;" onclick="MapEngine.openMap()">\n                  <i class="fa-solid fa-location-dot" style="margin-right: 8px;"></i> Buscar no mapa\n                </button>`);
}

// Make sure the hidden input exists somewhere in the form
if (!content.includes('id="client-form-location-url"')) {
  content = content.replace('<input type="text" class="form-input" id="client-form-address" placeholder="Av. Principal, 1000 - Centro">', `<input type="text" class="form-input" id="client-form-address" placeholder="Av. Principal, 1000 - Centro">\n                <input type="hidden" id="client-form-location-url">`);
}

// 4. MapEngine JS logic
if (!content.includes('const MapEngine = {')) {
  content = content.replace('const ClientApp = {', `const MapEngine = {
      map: null,
      isDragging: false,
      initMap() {
        if (!this.map) {
          this.map = L.map('leaflet-map-container', { zoomControl: false }).setView([-23.5505, -46.6333], 15);
          L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3'],
            attribution: '© Google Maps'
          }).addTo(this.map);
          
          // Add zoom control manually
          L.control.zoom({ position: 'bottomright' }).addTo(this.map);
          
          // Debounced reverse geocoding on drag
          let dragTimeout;
          this.map.on('move', () => {
             document.getElementById('map-address-preview').style.display = 'block';
             document.getElementById('map-address-preview').textContent = 'Buscando endereço...';
             clearTimeout(dragTimeout);
          });
          
          this.map.on('moveend', () => {
             dragTimeout = setTimeout(() => {
                this.previewAddress();
             }, 500);
          });
        }
      },
      openMap() {
        ModalEngine.open('map-modal');
        setTimeout(() => {
          this.initMap();
          this.map.invalidateSize();
          this.centerOnGPS();
        }, 200);
      },
      centerOnGPS() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            this.map.setView([lat, lng], 17);
            this.previewAddress();
          }, err => {
            console.warn("GPS failed", err);
            showToast("GPS não autorizado ou indisponível.", "warning");
          });
        }
      },
      async previewAddress() {
        const center = this.map.getCenter();
        try {
          const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?lat=\${center.lat}&lon=\${center.lng}&format=json\`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
               const addr = data.address;
               let ruaFinal = addr.road || '';
               if (addr.house_number) ruaFinal += \`, \${addr.house_number}\`;
               if (addr.suburb || addr.neighbourhood) ruaFinal += \` - \${addr.suburb || addr.neighbourhood}\`;
               
               if (ruaFinal) {
                 document.getElementById('map-address-preview').style.display = 'block';
                 document.getElementById('map-address-preview').textContent = ruaFinal;
               } else {
                 document.getElementById('map-address-preview').style.display = 'none';
               }
            }
          }
        } catch(e) {
          document.getElementById('map-address-preview').style.display = 'none';
        }
      },
      async confirmLocation(event) {
        const center = this.map.getCenter();
        const lat = center.lat;
        const lng = center.lng;
        const url = \`https://www.google.com/maps?q=\${lat},\${lng}\`;
        
        document.getElementById('client-form-location-url').value = url;
        
        const btn = event.currentTarget;
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        
        try {
          const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?lat=\${lat}&lon=\${lng}&format=json\`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
               const addr = data.address;
               const road = addr.road || '';
               const number = addr.house_number || '';
               const suburb = addr.suburb || addr.neighbourhood || '';
               const city = addr.city || addr.town || addr.village || '';
               const state = addr.state || '';
               
               let ruaFinal = road;
               if (number) ruaFinal += \`, \${number}\`;
               if (suburb) ruaFinal += \` - \${suburb}\`;
               
               if (ruaFinal) document.getElementById('client-form-address').value = ruaFinal;
               if (city || state) document.getElementById('client-form-city-uf').value = \`\${city} / \${state}\`;
            }
          }
        } catch(e) {
          console.error("Geocoding erro", e);
        } finally {
          btn.innerHTML = oldHtml;
        }
        
        showToast("Endereço capturado do mapa!", "success");
        ModalEngine.close('map-modal');
      }
    };

    const ClientApp = {`);
}

// 5. Remove captureAndOpenMaps from ClientApp
const removeJsRegex = /captureAndOpenMaps\(event\) \{[\s\S]*?\},[\s\n]*openForm\(client\) \{/;
if (content.match(removeJsRegex)) {
  content = content.replace(removeJsRegex, `openForm(client) {`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Script de mapa estilo iFood aplicado!');
