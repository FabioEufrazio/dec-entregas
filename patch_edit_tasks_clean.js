const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the Agenda Badge inline style
const agendaBadgeTarget = 'id="header-tasks-count" style="background: white; color: #3b82f6;"';
const agendaBadgeReplace = 'id="header-tasks-count"';
content = content.replace(agendaBadgeTarget, agendaBadgeReplace);

const agendaBadgeTarget2 = 'id="header-tasks-count" style="background: #1e293b; color: #3b82f6;"';
content = content.replace(agendaBadgeTarget2, agendaBadgeReplace);

// Fix the badge CSS to ensure centering
if (!content.includes('justify-content: center; /* center badge */')) {
  const badgeCssTarget = `.badge-count {
      display: inline-block;`;
  const badgeCssReplace = `.badge-count {
      display: inline-flex;
      align-items: center;
      justify-content: center; /* center badge */`;
  content = content.replace(badgeCssTarget, badgeCssReplace);
}

// 2. Add hidden ID and Cancel button to Task Form
const formTarget = '<form id="task-form" onsubmit="TaskApp.save(event)" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">';
const formReplace = `<form id="task-form" onsubmit="TaskApp.save(event)" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
            <input type="hidden" id="task-form-id">`;
content = content.replace(formTarget, formReplace);

const submitTarget = '<button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Agendar</button>';
const submitReplace = `<button type="button" class="btn btn-secondary" id="task-form-cancel" style="display: none; margin-right: 5px;" onclick="TaskApp.cancelEdit()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="task-form-btn"><i class="fa-solid fa-plus"></i> Agendar</button>`;
content = content.replace(submitTarget, submitReplace);

// 3. Update TaskApp Logic (inject edit methods and update save)
const taskAppTarget = `      save(event) {
        event.preventDefault();
        const clientId = document.getElementById('task-client-id').value;
        const desc = document.getElementById('task-desc').value.trim();
        const date = document.getElementById('task-date').value;

        if (!desc || !date) return;

        const newTask = {
          id: Date.now().toString(),
          clientId,
          description: desc,
          date, // YYYY-MM-DD
          completed: false,
          createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveToStorage();
        Cloud.syncTask(newTask);
        
        event.target.reset();
        showToast('Tarefa / Visita agendada!', 'success');
        this.render();
      },`;

const taskAppReplace = `      editTask(id) {
        const task = this.tasks.find(t => String(t.id) === String(id));
        if (!task) return;
        
        document.getElementById('task-form-id').value = task.id;
        document.getElementById('task-client-id').value = task.clientId || '';
        document.getElementById('task-desc').value = task.description || '';
        document.getElementById('task-date').value = task.date || '';
        
        document.getElementById('task-form-btn').innerHTML = '<i class="fa-solid fa-check"></i> Atualizar';
        document.getElementById('task-form-btn').classList.remove('btn-primary');
        document.getElementById('task-form-btn').classList.add('btn-purple');
        document.getElementById('task-form-cancel').style.display = 'inline-block';
      },
      
      cancelEdit() {
        document.getElementById('task-form').reset();
        document.getElementById('task-form-id').value = '';
        document.getElementById('task-form-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Agendar';
        document.getElementById('task-form-btn').classList.remove('btn-purple');
        document.getElementById('task-form-btn').classList.add('btn-primary');
        document.getElementById('task-form-cancel').style.display = 'none';
      },
      
      save(event) {
        event.preventDefault();
        const clientId = document.getElementById('task-client-id').value;
        const desc = document.getElementById('task-desc').value.trim();
        const date = document.getElementById('task-date').value;

        if (!desc || !date) return;
        
        const taskId = document.getElementById('task-form-id').value;
        
        if (taskId) {
           const task = this.tasks.find(t => String(t.id) === String(taskId));
           if (task) {
             task.clientId = clientId;
             task.description = desc;
             task.date = date;
             this.saveToStorage();
             Cloud.syncTask(task);
             showToast('Tarefa atualizada!', 'success');
           }
        } else {
           const newTask = {
             id: Date.now().toString(),
             clientId,
             description: desc,
             date,
             completed: false,
             createdAt: new Date().toISOString()
           };
           this.tasks.push(newTask);
           this.saveToStorage();
           Cloud.syncTask(newTask);
           showToast('Tarefa / Visita agendada!', 'success');
        }
        
        this.cancelEdit();
        this.render();
      },`;

// Check if Cloud is used, else FirebaseEngine
let finalTaskAppTarget = taskAppTarget;
let finalTaskAppReplace = taskAppReplace;
if (!content.includes('Cloud.syncTask(newTask);')) {
  finalTaskAppTarget = finalTaskAppTarget.replace(/Cloud\.syncTask/g, 'FirebaseEngine.syncTask');
  finalTaskAppReplace = finalTaskAppReplace.replace(/Cloud\.syncTask/g, 'FirebaseEngine.syncTask');
}

content = content.replace(finalTaskAppTarget, finalTaskAppReplace);

// 4. Update the Task row HTML to include Edit button
const taskHtmlTarget = `              <div>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\\$\\{t.id\\}')">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>`;

const taskHtmlReplace = `              <div style="display: flex; gap: 5px;">
                <button class="btn btn-secondary btn-icon-only" style="color: #3b82f6; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.editTask('\\$\\{t.id\\}')" title="Editar">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\\$\\{t.id\\}')" title="Excluir">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>`;

// Use literal string replacement
// Note: string in local.html actually contains \${t.id} without double slashes!
// We need to match exactly what is in local.html
const actualRowTarget = `              <div>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\${t.id}')">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>`;
              
const actualRowReplace = `              <div style="display: flex; gap: 5px;">
                <button class="btn btn-secondary btn-icon-only" style="color: #3b82f6; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.editTask('\${t.id}')" title="Editar">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\${t.id}')" title="Excluir">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>`;

content = content.replace(actualRowTarget, actualRowReplace);


// 5. Apply Dark Mode to the Agenda Modal
const agendaFormBgTarget = '<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">';
const agendaFormBgReplace = '<div style="background: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #334155;">';
content = content.replace(agendaFormBgTarget, agendaFormBgReplace);

const taskRowBgTarget = '<div style="background: white; border: 1px solid #e2e8f0;';
const taskRowBgReplace = '<div style="background: #1e293b; border: 1px solid #334155;';
content = content.replace(new RegExp(taskRowBgTarget, 'g'), taskRowBgReplace);

const taskRowTextTarget = 'color: #0f172a;';
const taskRowTextReplace = 'color: #f8fafc;';
// Replace only inside TaskApp.render
const renderSplit = content.split('render() {');
if (renderSplit.length > 1) {
  renderSplit[1] = renderSplit[1].replace(/color: #0f172a;/g, 'color: #f8fafc;');
  renderSplit[1] = renderSplit[1].replace(/color: #475569;/g, 'color: #94a3b8;');
  content = renderSplit[0] + 'render() {' + renderSplit[1];
}

fs.writeFileSync(file, content, 'utf8');
console.log('Patch limpo e correto aplicado com sucesso!');
