const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Categories injection
if (!content.includes('id="client-form-category"')) {
  // Use a safer regex to find the email group
  const emailGroupRegex = /<div class="form-group">\s*<label class="form-label">E-mail<\/label>\s*<input type="email" class="form-input" id="client-form-email"[^>]*>\s*<\/div>/;
  
  if (content.match(emailGroupRegex)) {
    const categoryHtml = `<div class="form-group">
                <label class="form-label">E-mail</label>
                <input type="email" class="form-input" id="client-form-email" placeholder="contato@empresa.com.br">
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Categoria / Etiqueta</label>
                <input type="text" class="form-input" id="client-form-category" list="category-options" placeholder="Ex: Revenda, Vip, Atacadista...">
                <datalist id="category-options"></datalist>
              </div>`;
    content = content.replace(emailGroupRegex, categoryHtml);
  }
}

// 2. Add "Concluídas" tab
if (!content.includes("TaskApp.setFilter('concluidas', this)")) {
  const tabsTarget = '<div class="tab" onclick="TaskApp.setFilter(\'todas\', this)">Todas</div>';
  const tabsReplace = '<div class="tab" onclick="TaskApp.setFilter(\'todas\', this)">Todas</div>\n        <div class="tab" onclick="TaskApp.setFilter(\'concluidas\', this)">Concluídas</div>';
  if (content.includes(tabsTarget)) {
    content = content.replace(tabsTarget, tabsReplace);
  }
}

// 3. Fix Checkbox visibility (appearance: auto)
const checkboxTarget = '<input type="checkbox" style="width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6;" onchange="TaskApp.toggleComplete(\'${t.id}\')">';
const checkboxReplace = '<input type="checkbox" style="width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6; -webkit-appearance: auto; appearance: auto;" onchange="TaskApp.toggleComplete(\'${t.id}\')" ${t.completed ? \'checked\' : \'\'}>';
if (content.includes(checkboxTarget)) {
  content = content.replace(checkboxTarget, checkboxReplace);
}

// 4. Fix TaskApp Filter Logic to show 'concluidas'
const filterLogicTarget = 'let filtered = this.tasks.filter(t => !t.completed); // Default hide completed';
const filterLogicReplace = `// Se o filtro for 'concluidas', mostra SÓ as concluídas, senão esconde
        let filtered = this.filter === 'concluidas' ? this.tasks.filter(t => t.completed) : this.tasks.filter(t => !t.completed);`;
if (content.includes(filterLogicTarget)) {
  content = content.replace(filterLogicTarget, filterLogicReplace);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Correções de UI aplicadas com sucesso!');
