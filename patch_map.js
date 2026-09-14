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

// 2. Map Modal
if (!content.includes('id="map-modal"')) {
  content = content.replace('<!-- ==========================================================================\r\n       MODAL 4:', `<!-- ==========================================================================
       MODAL MAPA INTERATIVO (LEAFLET)
       ========================================================================== -->
  <div class="modal-overlay" id="map-modal" style="z-index: 100000;">
    <div class="modal-card modal-lg" style="height: 80vh; display: flex; flex-direction: column; max-width: 800px; margin: auto; top: 10vh;">
      <div class="modal-header">
        <h2 style="font-size: 1.1rem; color: #1e293b; margin: 0;"><i class="fa-solid fa-map-location-dot" style="color: #3b82f6;"></i> Localizar no Mapa</h2>
        <button class="btn btn-secondary btn-icon-only" onclick="ModalEngine.close('map-modal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body" style="flex: 1; padding: 0; position: relative;">
        <div id="leaflet-map-container" style="width: 100%; height: 100%;"></div>
        <button class="btn btn-primary" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); padding: 12px 24px; font-size: 1.1rem; border-radius: 50px;" onclick="MapEngine.confirmLocation(event)">
          <i class="fa-solid fa-check"></i> Confirmar Este Local
        </button>
        <button class="btn btn-secondary btn-icon-only" style="position: absolute; bottom: 20px; right: 20px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-radius: 50%; width: 50px; height: 50px;" onclick="MapEngine.centerOnGPS()" title="Meu Local (GPS)">
          <i class="fa-solid fa-crosshairs" style="color: #3b82f6; font-size: 1.5rem;"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       MODAL 4:`);
  // Fallback if \r\n fails
  content = content.replace('<!-- ==========================================================================\n       MODAL 4:', `<!-- ==========================================================================
       MODAL MAPA INTERATIVO (LEAFLET)
       ========================================================================== -->
  <div class="modal-overlay" id="map-modal" style="z-index: 100000;">
    <div class="modal-card modal-lg" style="height: 80vh; display: flex; flex-direction: column; max-width: 800px; margin: auto; top: 10vh;">
      <div class="modal-header">
        <h2 style="font-size: 1.1rem; color: #1e293b; margin: 0;"><i class="fa-solid fa-map-location-dot" style="color: #3b82f6;"></i> Localizar no Mapa</h2>
        <button class="btn btn-secondary btn-icon-only" onclick="ModalEngine.close('map-modal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="modal-body" style="flex: 1; padding: 0; position: relative;">
        <div id="leaflet-map-container" style="width: 100%; height: 100%;"></div>
        <button class="btn btn-primary" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); padding: 12px 24px; font-size: 1.1rem; border-radius: 50px;" onclick="MapEngine.confirmLocation(event)">
          <i class="fa-solid fa-check"></i> Confirmar Este Local
        </button>
        <button class="btn btn-secondary btn-icon-only" style="position: absolute; bottom: 20px; right: 20px; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-radius: 50%; width: 50px; height: 50px;" onclick="MapEngine.centerOnGPS()" title="Meu Local (GPS)">
          <i class="fa-solid fa-crosshairs" style="color: #3b82f6; font-size: 1.5rem;"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- ==========================================================================
       MODAL 4:`);
}

// 3. Client Form Button and Hidden Input
const addressLabelTarget = '<label class="form-label">Endereço (Logradouro, Nº, Bairro)</label>';
if (content.includes(addressLabelTarget)) {
  content = content.replace(addressLabelTarget, `<label class="form-label" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  Endereço (Logradouro, Nº, Bairro)
                  <button type="button" class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 4px;" onclick="MapEngine.openMap()">
                    <i class="fa-solid fa-location-dot" style="color: #ef4444;"></i> Ver no Mapa
                  </button>
                </label>`);
}

if (!content.includes('id="client-form-location-url"')) {
  content = content.replace('<input type="text" class="form-input" id="client-form-address" placeholder="Av. Principal, 1000 - Centro">', `<input type="text" class="form-input" id="client-form-address" placeholder="Av. Principal, 1000 - Centro">\n                <input type="hidden" id="client-form-location-url">`);
}

// 4. ClientApp.openForm modifications
if (!content.includes("document.getElementById('client-form-location-url').value = c.locationUrl || '';")) {
  content = content.replace("document.getElementById('client-form-address').value = c.address || '';", 
    `document.getElementById('client-form-address').value = c.address || '';\n            document.getElementById('client-form-location-url').value = c.locationUrl || '';`);
}

// 5. ClientApp.save modifications
if (!content.includes("const locationUrl = document.getElementById('client-form-location-url').value.trim();")) {
  content = content.replace("const address = document.getElementById('client-form-address').value.trim();", 
    `const address = document.getElementById('client-form-address').value.trim();\n        const locationUrl = document.getElementById('client-form-location-url').value.trim();`);
  
  content = content.replace("target.address = address;", 
    `target.address = address;\n          target.locationUrl = locationUrl;`);
  
  content = content.replace("address,\n            cityUf,", 
    `address,\n            cityUf,\n            locationUrl,`);
}

// 6. Add MapEngine JS
if (!content.includes('const MapEngine = {')) {
  content = content.replace('const ClientApp = {', `const MapEngine = {
      map: null,
      marker: null,
      initMap() {
        if (!this.map) {
          this.map = L.map('leaflet-map-container').setView([-23.5505, -46.6333], 13); // Default SP
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(this.map);

          this.marker = L.marker([-23.5505, -46.6333], { draggable: true }).addTo(this.map);
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
            this.marker.setLatLng([lat, lng]);
          }, err => {
            console.warn("GPS failed", err);
            showToast("GPS não autorizado ou indisponível.", "warning");
          });
        }
      },
      async confirmLocation(event) {
        const pos = this.marker.getLatLng();
        const lat = pos.lat;
        const lng = pos.lng;
        const url = \`https://www.google.com/maps?q=\${lat},\${lng}\`;
        
        document.getElementById('client-form-location-url').value = url;
        
        // Reverse Geocoding via Nominatim
        const btn = event.currentTarget;
        const oldHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Buscando...';
        
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
        
        showToast("Localização salva!", "success");
        ModalEngine.close('map-modal');
      }
    };

    const ClientApp = {`);
}

// 7. Render map pin in Clients list
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

fs.writeFileSync(file, content, 'utf8');
console.log('Script aplicado com sucesso!');
