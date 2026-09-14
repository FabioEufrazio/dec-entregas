const fs = require('fs');
const path = require('path');

const localPath = path.join(__dirname, 'local.html');
const prodPath = path.join(__dirname, 'index.html');

if (!fs.existsSync(localPath)) {
  console.error('ERRO: local.html não encontrado!');
  process.exit(1);
}

let content = fs.readFileSync(localPath, 'utf8');

content = content.replace(
  '<title>[LOCAL] DEC Entregas & Clientes (Ambiente de Testes)</title>',
  '<title>DEC Entregas & Gestão de Clientes</title>'
);

const bannerRegex = /\s*<!-- BANNER EXCLUSIVO DO AMBIENTE LOCAL -->[\s\S]*?(?=<!-- HEADER PRINCIPAL -->)/i;
content = content.replace(bannerRegex, '\n\n  ');

content = content.replace(
  /<h1 id="app-title-text">DEC Entregas \[LOCAL\][\s\S]*?<\/h1>/i,
  '<h1 id="app-title-text">DEC Entregas & Gestão Logística</h1>'
);

const stagingEnvRegex = /const APP_ENV = \{[\s\S]*?configStorageKey: 'tracklog_firebase_config_staging'\s*\};/;
const prodEnv = `const APP_ENV = {
      env: 'production',
      name: 'Produção',
      isStaging: false,
      ordersCollection: 'orders',
      clientsCollection: 'clients',
      ordersStorageKey: 'tracklog_orders_v1',
      clientsStorageKey: 'tracklog_clients_v1',
      configStorageKey: 'tracklog_firebase_config'
    };`;

content = content.replace(stagingEnvRegex, prodEnv);

fs.writeFileSync(prodPath, content, 'utf8');
console.log('✅ Sucesso! local.html promovido para index.html (Produção)!');
