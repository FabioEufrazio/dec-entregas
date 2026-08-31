const fs = require('fs');
const path = require('path');

const prodPath = path.join(__dirname, 'index.html');
const homologPath = path.join(__dirname, 'homolog.html');

let content = fs.readFileSync(prodPath, 'utf8');

// 1. Altera Título
content = content.replace(
  '<title>DEC Entregas & Gestão de Clientes</title>',
  '<title>[HOMOLOG] DEC Entregas & Clientes (Ambiente de Testes)</title>'
);

// 2. Insere Banner de Homologação no topo do <body>
const bannerHtml = `
  <!-- BANNER EXCLUSIVO DO AMBIENTE DE HOMOLOGAÇÃO -->
  <div id="staging-top-banner" style="background: linear-gradient(90deg, #d97706, #b45309); color: #ffffff; padding: 0.5rem 1.25rem; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 2px solid #f59e0b; box-shadow: 0 4px 12px rgba(0,0,0,0.4); position: sticky; top: 0; z-index: 10000;">
    <div style="display: flex; align-items: center; gap: 0.6rem;">
      <span style="background: #ffffff; color: #b45309; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 0.75rem; letter-spacing: 0.5px;">HOMOLOGAÇÃO</span>
      <span>🧪 Ambiente de Testes & Experimentação (Dados 100% Isolados da Produção)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-size: 0.78rem; opacity: 0.9; background: rgba(0,0,0,0.25); padding: 3px 8px; border-radius: 4px;">
        <i class="fa-solid fa-database"></i> Firestore: <code>orders_staging</code> & <code>clients_staging</code>
      </span>
      <a href="index.html" style="color: #fff; text-decoration: underline; font-size: 0.78rem; font-weight: bold;">Ir para Produção →</a>
    </div>
  </div>\n`;

content = content.replace('<body>', '<body>' + bannerHtml);

// 3. Modifica Header Brand Title estático
content = content.replace(
  '<h1 id="app-title-text">DEC Entregas & Gestão',
  '<h1 id="app-title-text">DEC Entregas [HOMOLOG]'
);

// 4. Modifica APP_ENV para Staging
const prodEnvRegex = /const APP_ENV = \{[\s\S]*?configStorageKey: 'tracklog_firebase_config'\s*\};/;
const stagingEnv = `const APP_ENV = {
      env: 'staging',
      name: 'Homologação',
      isStaging: true,
      ordersCollection: 'orders_staging',
      clientsCollection: 'clients_staging',
      ordersStorageKey: 'tracklog_orders_staging_v1',
      clientsStorageKey: 'tracklog_clients_staging_v1',
      configStorageKey: 'tracklog_firebase_config_staging'
    };`;

content = content.replace(prodEnvRegex, stagingEnv);

fs.writeFileSync(homologPath, content, 'utf8');
console.log('entregas_homolog.html gerado com sucesso! Tamanho:', fs.statSync(homologPath).size, 'bytes.');
