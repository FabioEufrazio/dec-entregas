const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Add hidden ID and Cancel button to Task Form
const formTarget = '<form id="task-form" onsubmit="TaskApp.save(event)" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">';
const formReplace = `<form id="task-form" onsubmit="TaskApp.save(event)" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: end;">
            <input type="hidden" id="task-form-id">`;
            
if (content.includes(formTarget)) {
  content = content.replace(formTarget, formReplace);
}

const submitTarget = '<button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Agendar</button>';
const submitReplace = `<button type="button" class="btn btn-secondary" id="task-form-cancel" style="display: none; margin-right: 5px;" onclick="TaskApp.cancelEdit()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="task-form-btn"><i class="fa-solid fa-plus"></i> Agendar</button>`;
if (content.includes(submitTarget)) {
  content = content.replace(submitTarget, submitReplace);
}

// 2. Add editTask() and cancelEdit() to TaskApp
const saveMethodTarget = 'save(event) {';
const editMethods = `editTask(id) {
        const task = this.tasks.find(t => String(t.id) === String(id));
        if (!task) return;
        
        document.getElementById('task-form-id').value = task.id;
        document.getElementById('task-client-id').value = task.clientId || '';
        document.getElementById('task-desc').value = task.description || '';
        document.getElementById('task-date').value = task.date || '';
        
        document.getElementById('task-form-btn').innerHTML = '<i class="fa-solid fa-check"></i> Atualizar';
        document.getElementById('task-form-btn').classList.replace('btn-primary', 'btn-purple');
        document.getElementById('task-form-cancel').style.display = 'inline-block';
      },
      
      cancelEdit() {
        document.getElementById('task-form').reset();
        document.getElementById('task-form-id').value = '';
        document.getElementById('task-form-btn').innerHTML = '<i class="fa-solid fa-plus"></i> Agendar';
        document.getElementById('task-form-btn').classList.replace('btn-purple', 'btn-primary');
        document.getElementById('task-form-cancel').style.display = 'none';
      },
      
      save(event) {`;
      
if (content.includes(saveMethodTarget) && !content.includes('editTask(id)')) {
  content = content.replace(saveMethodTarget, editMethods);
}

// 3. Update save() logic in TaskApp to handle updates
const saveLogicTarget = `        const newTask = {
          id: Date.now().toString(),
          clientId,
          description: desc,
          date, // YYYY-MM-DD
          completed: false,
          createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveToStorage();
        FirebaseEngine.syncTask(newTask);
        
        event.target.reset();
        showToast('Tarefa / Visita agendada!', 'success');
        this.render();`;
        
const saveLogicReplace = `        const taskId = document.getElementById('task-form-id').value;
        
        if (taskId) {
           // Edição
           const task = this.tasks.find(t => String(t.id) === String(taskId));
           if (task) {
             task.clientId = clientId;
             task.description = desc;
             task.date = date;
             this.saveToStorage();
             FirebaseEngine.syncTask(task);
             showToast('Tarefa atualizada!', 'success');
           }
        } else {
           // Criação
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
           FirebaseEngine.syncTask(newTask);
           showToast('Tarefa / Visita agendada!', 'success');
        }
        
        this.cancelEdit();
        this.render();`;
        
if (content.includes(saveLogicTarget)) {
  content = content.replace(saveLogicTarget, saveLogicReplace);
}

// 4. Add the Edit button to the task row HTML
const actionsTarget = `              <div>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\\$\\{t.id\\}')">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>`;
              
const actionsReplace = `              <div style="display: flex; gap: 5px;">
                <button class="btn btn-secondary btn-icon-only" style="color: #3b82f6; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.editTask('\\$\\{t.id\\}')" title="Editar">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\\$\\{t.id\\}')" title="Excluir">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>`;

if (content.includes(actionsTarget)) {
  content = content.replace(actionsTarget, actionsReplace);
}


fs.writeFileSync(file, content, 'utf8');
console.log('Edição de tarefas aplicada!');
