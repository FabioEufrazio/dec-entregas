const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// Replace the currently broken save(event) with the correct one
const brokenSaveRegex = /save\(event\) \{[\s\S]*?this\.render\(\);\s*\}/;

const fixedSave = `save(event) {
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
             FirebaseEngine.syncTask(task);
             showToast('Tarefa atualizada!', 'success');
           }
        } else {
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
        this.render();
      }`;

if (content.match(brokenSaveRegex)) {
  content = content.replace(brokenSaveRegex, fixedSave);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed save function in TaskApp!');
