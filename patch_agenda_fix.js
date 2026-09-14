const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Add TaskApp
if (!content.includes('const TaskApp = {')) {
  const taskAppJs = `const TaskApp = {
      tasks: [],
      filter: 'hoje', // hoje, semana, proxima, todas
      
      init() {
        this.loadFromStorage();
        this.render();
      },

      loadFromStorage() {
        try {
          const stored = localStorage.getItem(APP_ENV.tasksStorageKey);
          if (stored) this.tasks = JSON.parse(stored);
        } catch (e) {
          console.error('Erro ao ler tarefas:', e);
        }
      },

      saveToStorage() {
        localStorage.setItem(APP_ENV.tasksStorageKey, JSON.stringify(this.tasks));
      },

      populateClientSelect() {
        const select = document.getElementById('task-client-id');
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="">Selecione um cliente...</option>' + 
          ClientApp.clients.map(c => \`<option value="\${c.id}">\${c.nomeFantasia}</option>\`).join('');
        select.value = currentVal;
      },

      save(event) {
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
        FirebaseEngine.syncTask(newTask);
        
        event.target.reset();
        showToast('Tarefa / Visita agendada!', 'success');
        this.render();
      },

      toggleComplete(id) {
        const task = this.tasks.find(t => String(t.id) === String(id));
        if (task) {
          task.completed = !task.completed;
          this.saveToStorage();
          FirebaseEngine.syncTask(task);
          this.render();
        }
      },

      deleteTask(id) {
        if (!confirm('Excluir esta tarefa?')) return;
        this.tasks = this.tasks.filter(t => String(t.id) !== String(id));
        this.saveToStorage();
        FirebaseEngine.deleteTask(id);
        this.render();
      },

      setFilter(filter, el) {
        this.filter = filter;
        document.querySelectorAll('#agenda-modal .tab').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
        this.render();
      },

      render() {
        this.populateClientSelect();
        
        const container = document.getElementById('tasks-list-container');
        const countBadge = document.getElementById('header-tasks-count');
        if (!container) return;

        // Limpar meia-noite pra calculos precisos (TimeZone local)
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const todayTime = new Date(todayStr).getTime();
        const nextWeekTime = todayTime + (7 * 24 * 60 * 60 * 1000);
        const nextNextWeekTime = todayTime + (14 * 24 * 60 * 60 * 1000);

        let filtered = this.tasks.filter(t => !t.completed); // Default hide completed
        
        // Atualiza o contador de pendentes no Header
        if (countBadge) countBadge.textContent = filtered.length;

        // Apply tab filters
        filtered = filtered.filter(t => {
          if (!t.date) return false;
          const tTime = new Date(t.date).getTime();
          
          if (this.filter === 'hoje') {
            return t.date === todayStr || tTime < todayTime; // Hoje + atrasadas
          } else if (this.filter === 'semana') {
            return tTime >= todayTime && tTime < nextWeekTime;
          } else if (this.filter === 'proxima') {
            return tTime >= nextWeekTime && tTime < nextNextWeekTime;
          }
          return true; // 'todas'
        });

        // Ordenar por data crescente
        filtered.sort((a, b) => a.date.localeCompare(b.date));

        if (filtered.length === 0) {
          container.innerHTML = \`<div class="empty-state">Nenhuma tarefa pendente para este período.</div>\`;
          return;
        }

        container.innerHTML = filtered.map(t => {
          let clientHtml = '';
          if (t.clientId) {
            const client = ClientApp.getById(t.clientId);
            if (client) {
              clientHtml = \`<div style="font-size: 0.8rem; color: #475569; margin-top: 4px;"><i class="fa-solid fa-user"></i> \${client.nomeFantasia} \${client.locationUrl ? \`<a href="\${client.locationUrl}" target="_blank" style="color: #ef4444; margin-left: 5px;"><i class="fa-solid fa-location-dot"></i></a>\` : ''}</div>\`;
            }
          }
          
          let dateObj = new Date(t.date + 'T12:00:00');
          let displayDate = dateObj.toLocaleDateString('pt-BR');
          let isOverdue = new Date(t.date).getTime() < todayTime && t.date !== todayStr;
          
          return \`
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); \${isOverdue ? 'border-left: 4px solid #ef4444;' : 'border-left: 4px solid #3b82f6;'}">
              <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                <input type="checkbox" style="width: 20px; height: 20px; cursor: pointer; accent-color: #3b82f6;" onchange="TaskApp.toggleComplete('\${t.id}')">
                <div>
                  <div style="font-weight: 600; color: #0f172a;">\${t.description}</div>
                  \${clientHtml}
                  <div style="font-size: 0.75rem; font-weight: 600; margin-top: 4px; \${isOverdue ? 'color: #ef4444;' : 'color: #3b82f6;'}">
                    <i class="fa-regular fa-calendar"></i> \${displayDate} \${isOverdue ? '(Atrasada)' : ''}
                  </div>
                </div>
              </div>
              <div>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\${t.id}')">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>
            </div>
          \`;
        }).join('');
      }
    };

    const FirebaseEngine = {`;
    
  content = content.replace('const FirebaseEngine = {', taskAppJs);
}

// 2. Update Cloud Logic for Tasks
if (!content.includes('async syncTask(task)')) {
  // Add listeners
  const listenToCloudTarget = `this.db.collection(APP_ENV.clientsCollection).onSnapshot(snap => {`;
  const listenToCloudTasks = `this.db.collection(APP_ENV.tasksCollection).onSnapshot(snap => {
          let changed = false;
          snap.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = String(data.id || change.doc.id);
            
            if (change.type === 'added' || change.type === 'modified') {
              const idx = TaskApp.tasks.findIndex(t => String(t.id) === id);
              if (idx >= 0) {
                if (JSON.stringify(TaskApp.tasks[idx]) !== JSON.stringify(data)) {
                  TaskApp.tasks[idx] = data;
                  changed = true;
                }
              } else {
                TaskApp.tasks.push(data);
                changed = true;
              }
            }
            if (change.type === 'removed') {
              const oldLen = TaskApp.tasks.length;
              TaskApp.tasks = TaskApp.tasks.filter(t => String(t.id) !== id);
              if (oldLen !== TaskApp.tasks.length) changed = true;
            }
          });
          if (changed) {
            TaskApp.saveToStorage();
            TaskApp.render();
          }
        }, err => console.log("Erro escuta tarefas", err));
        
        this.db.collection(APP_ENV.clientsCollection).onSnapshot(snap => {`;
  if (content.includes(listenToCloudTarget)) {
    content = content.replace(listenToCloudTarget, listenToCloudTasks);
  }

  // Add sync and delete methods
  const syncMethodsTarget = `async syncClient(client) {`;
  const syncTaskMethods = `async syncTask(task) {
        if (!this.db || !task) return;
        try {
          await this.db.collection(APP_ENV.tasksCollection).doc(String(task.id)).set(task);
        } catch (e) {
          console.error("Erro ao sincronizar tarefa", e);
        }
      },

      async deleteTask(taskId) {
        if (!this.db || !taskId) return;
        try {
          await this.db.collection(APP_ENV.tasksCollection).doc(String(taskId)).delete();
        } catch (e) {
          console.error("Erro ao deletar tarefa do banco", e);
        }
      },
      
      async syncClient(client) {`;
  if (content.includes(syncMethodsTarget)) {
    content = content.replace(syncMethodsTarget, syncTaskMethods);
  }
}

// 3. Initialize TaskApp
if (!content.includes('TaskApp.init();')) {
  content = content.replace('ClientApp.init();', "ClientApp.init();\n        TaskApp.init();");
}

fs.writeFileSync(file, content, 'utf8');
console.log('Script de TaskApp FIX aplicado!');
