const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Update APP_ENV
if (!content.includes('tasksCollection')) {
  content = content.replace("clientsCollection: 'clients_staging',", "clientsCollection: 'clients_staging',\n      tasksCollection: 'tasks_staging',");
  content = content.replace("clientsStorageKey: 'decentregas_clients_staging_v1',", "clientsStorageKey: 'decentregas_clients_staging_v1',\n      tasksStorageKey: 'decentregas_tasks_staging_v1',");
}

// 2. Add Agenda button to Header
if (!content.includes("ModalEngine.open('agenda-modal')")) {
  const headerBtnRegex = /<button class="btn btn-purple" onclick="ModalEngine\.open\('clients-modal'\)">/;
  if (content.match(headerBtnRegex)) {
    content = content.replace(headerBtnRegex, `<button class="btn btn-primary" style="background-color: #3b82f6; border-color: #3b82f6;" onclick="ModalEngine.open('agenda-modal')">\n          <i class="fa-solid fa-calendar-check"></i> Agenda <span class="badge-count" id="header-tasks-count" style="background: white; color: #3b82f6;">0</span>\n        </button>\n        <button class="btn btn-purple" onclick="ModalEngine.open('clients-modal')">`);
  }
}

// 3. Add Agenda Modal HTML
if (!content.includes('id="agenda-modal"')) {
  const mapModalRegex = /<!-- ==========================================================================\r?\n\s*MODAL MAPA INTERATIVO/;
  const agendaModalHtml = `<!-- ==========================================================================
       MODAL AGENDA DE TAREFAS / VISITAS
       ========================================================================== -->
  <div class="modal-overlay" id="agenda-modal">
    <div class="modal-card modal-lg">
      <div class="modal-header">
        <h2><i class="fa-solid fa-calendar-check" style="color: #3b82f6;"></i> Agenda de Visitas e Tarefas</h2>
        <button class="btn btn-secondary btn-icon-only" onclick="ModalEngine.close('agenda-modal')"><i class="fa-solid fa-xmark"></i></button>
      </div>
      
      <!-- Abas de Filtro -->
      <div class="tabs-container">
        <div class="tab active" onclick="TaskApp.setFilter('hoje', this)">Hoje</div>
        <div class="tab" onclick="TaskApp.setFilter('semana', this)">Esta Semana</div>
        <div class="tab" onclick="TaskApp.setFilter('proxima', this)">Próxima Semana</div>
        <div class="tab" onclick="TaskApp.setFilter('todas', this)">Todas</div>
      </div>

      <div class="modal-body">
        <!-- Formulário Rápido de Tarefa -->
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <form id="task-form" onsubmit="TaskApp.save(event)" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.8rem;">Cliente (Opcional)</label>
              <select id="task-client-id" class="form-input">
                <option value="">Selecione um cliente...</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.8rem;">Descrição da Tarefa / Visita</label>
              <input type="text" id="task-desc" class="form-input" placeholder="Ex: Visita de cobrança" required>
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.8rem;">Data Agendada</label>
              <input type="date" id="task-date" class="form-input" required>
            </div>
            <div class="form-group" style="margin: 0; grid-column: span 3; display: flex; justify-content: flex-end;">
              <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Agendar</button>
            </div>
          </form>
        </div>

        <!-- Lista de Tarefas -->
        <div id="tasks-list-container" style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Renderizado via JS -->
        </div>
      </div>
    </div>
  </div>

  `;
  content = content.replace(mapModalRegex, agendaModalHtml + '$&');
}

// 4. Add Category Field to Client Form
if (!content.includes('id="client-form-category"')) {
  const emailGroupRegex = /<div class="form-group">\s*<label class="form-label">E-mail<\/label>\s*<input type="email" class="form-input" id="client-form-email" placeholder="email@empresa\.com\.br">\s*<\/div>/;
  const categoryHtml = `<div class="form-group">
                <label class="form-label">E-mail</label>
                <input type="email" class="form-input" id="client-form-email" placeholder="email@empresa.com.br">
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Categoria / Etiqueta</label>
                <input type="text" class="form-input" id="client-form-category" list="category-options" placeholder="Ex: Revenda, Vip, Atacadista...">
                <datalist id="category-options"></datalist>
              </div>`;
  content = content.replace(emailGroupRegex, categoryHtml);
}

// 5. Update ClientApp for Categories
if (!content.includes("document.getElementById('client-form-category').value = c.category || '';")) {
  // Read category in openForm
  content = content.replace("document.getElementById('client-form-email').value = c.email || '';", 
    "document.getElementById('client-form-email').value = c.email || '';\n            document.getElementById('client-form-category').value = c.category || '';");
    
  // Save category in save
  content = content.replace("const email = document.getElementById('client-form-email').value.trim();", 
    "const email = document.getElementById('client-form-email').value.trim();\n        const category = document.getElementById('client-form-category').value.trim();");
  
  content = content.replace("target.email = email;", 
    "target.email = email;\n          target.category = category;");
  
  content = content.replace("email,", "email,\n            category,");
}

// 6. Add visual category badge in Clients List
if (!content.includes('<span class="client-category-badge"')) {
  const clientNameRegex = /<span style="font-weight: 600; color: #0f172a;">/;
  
  // Create a function to generate badges dynamically inside ClientApp render
  const renderClientRowTarget = `<div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; color: #0f172a;">
                      \${c.nomeFantasia}`;
                      
  const renderClientRowReplace = `<div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; color: #0f172a; display: flex; align-items: center; flex-wrap: wrap; gap: 5px;">
                      \${c.nomeFantasia} \${c.category ? \`<span style="background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; border: 1px solid #c7d2fe;">\${c.category}</span>\` : ''}`;
  content = content.replace(renderClientRowTarget, renderClientRowReplace);
}

// Update Datalist dynamically in ClientApp.render
if (!content.includes('ClientApp.updateCategoryDatalist()')) {
  content = content.replace("document.getElementById('header-clients-count').textContent = this.clients.length;", 
    "document.getElementById('header-clients-count').textContent = this.clients.length;\n        this.updateCategoryDatalist();");
    
  content = content.replace("const ClientApp = {", `const ClientApp = {
      updateCategoryDatalist() {
        const datalist = document.getElementById('category-options');
        if (!datalist) return;
        const categories = [...new Set(this.clients.map(c => c.category).filter(Boolean))];
        datalist.innerHTML = categories.map(cat => \`<option value="\${cat}"></option>\`).join('');
      },`);
}


fs.writeFileSync(file, content, 'utf8');
console.log('Script de patch inicial aplicado com sucesso!');
