const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'promote.js');
let content = fs.readFileSync(file, 'utf8');

const regexTarget = /const stagingEnvRegex = \/const APP_ENV = \\{\[\\s\\S\]\*\?configStorageKey: 'decentregas_firebase_config_staging'\\s\*\\}\\;\/;/;
const newRegex = "const stagingEnvRegex = /const APP_ENV = \\{[\\s\\S]*?configStorageKey: 'decentregas_firebase_config_staging'\\s*\\};/;"

const prodEnvTarget = /const prodEnv = `const APP_ENV = \{\s*env: 'production',\s*name: 'Produção',\s*isStaging: false,\s*ordersCollection: 'orders',\s*clientsCollection: 'clients',\s*ordersStorageKey: 'decentregas_orders_v1',\s*clientsStorageKey: 'decentregas_clients_v1',\s*configStorageKey: 'decentregas_firebase_config'\s*\};`;/;

const prodEnvReplace = `const prodEnv = \`const APP_ENV = {
      env: 'production',
      name: 'Produção',
      isStaging: false,
      ordersCollection: 'orders',
      clientsCollection: 'clients',
      tasksCollection: 'tasks',
      ordersStorageKey: 'decentregas_orders_v1',
      clientsStorageKey: 'decentregas_clients_v1',
      tasksStorageKey: 'decentregas_tasks_v1',
      configStorageKey: 'decentregas_firebase_config'
    };\`;`;

if (content.match(prodEnvTarget)) {
  content = content.replace(prodEnvTarget, prodEnvReplace);
}

fs.writeFileSync(file, content, 'utf8');
console.log('promote.js atualizado!');
