const fs = require('fs');

// Lê os dois arquivos
const indexHtml = fs.readFileSync('./index.html', 'utf8');
const localHtml = fs.readFileSync('./local.html', 'utf8');

// ---- PASSO 1: Extrair bloco <script> do local.html (tem JS correto) ----
const scriptStartLocal = localHtml.lastIndexOf('<script>');
const scriptEndLocal = localHtml.lastIndexOf('</script>');
const scriptBlockFromLocal = localHtml.substring(scriptStartLocal, scriptEndLocal + '</script>'.length);
console.log(`Script extraído do local.html: ${scriptBlockFromLocal.length} chars`);

// ---- PASSO 2: Extrair HTML do <body> do index.html (tem o HTML novo com as novas features) ----
// Pega tudo antes do <script> no index.html
const scriptStartIndex = indexHtml.lastIndexOf('<script>');
const htmlPartFromIndex = indexHtml.substring(0, scriptStartIndex);

// Pega o que vem depois do </script> do index.html  
const scriptEndIndex = indexHtml.lastIndexOf('</script>');
const tailFromIndex = indexHtml.substring(scriptEndIndex + '</script>'.length);

// ---- PASSO 3: Combinar: HTML novo do index.html + JS correto do local.html ----
let newIndexHtml = htmlPartFromIndex + scriptBlockFromLocal + tailFromIndex;

// ---- PASSO 4: Garantir que APP_ENV seja 'production' ----
newIndexHtml = newIndexHtml.replace(/env:\s*'staging'/, "env: 'production'");
newIndexHtml = newIndexHtml.replace(/name:\s*'Homolog[^']*'/, "name: 'Produção'");
newIndexHtml = newIndexHtml.replace(/isStaging:\s*true/, "isStaging: false");

// ---- PASSO 5: Adicionar campo observation em TaskApp.save() ----
// Antes:
const saveOld = `        const date = document.getElementById('task-date').value;

        if (!desc || !date) return;

        const newTask = {
          id: Date.now().toString(),
          clientId,
          description: desc,
          date, // YYYY-MM-DD
          completed: false,
          createdAt: new Date().toISOString()
        };`;

// Depois:
const saveNew = `        const date = document.getElementById('task-date').value;
        const observationEl = document.getElementById('task-observation');
        const observation = observationEl ? observationEl.value.trim() : '';

        if (!desc || !date) return;

        const newTask = {
          id: Date.now().toString(),
          clientId,
          description: desc,
          date, // YYYY-MM-DD
          observation,
          completed: false,
          createdAt: new Date().toISOString()
        };`;

if (newIndexHtml.includes(saveOld)) {
  newIndexHtml = newIndexHtml.replace(saveOld, saveNew);
  console.log('✅ TaskApp.save() atualizado com observation');
} else {
  console.warn('⚠️ Não encontrou padrão exato em TaskApp.save() - verificar manualmente');
}

// Adicionar reset do campo observation após salvar (logo depois de btnClear.style.display = 'none';)
const afterSaveOld = `        const btnClear = document.getElementById('btn-clear-task-client');
        if (btnClear) btnClear.style.display = 'none';

        showToast('Tarefa / Visita agendada!', 'success');`;
const afterSaveNew = `        const btnClear = document.getElementById('btn-clear-task-client');
        if (btnClear) btnClear.style.display = 'none';
        if (observationEl) observationEl.value = '';

        showToast('Tarefa / Visita agendada!', 'success');`;
if (newIndexHtml.includes(afterSaveOld)) {
  newIndexHtml = newIndexHtml.replace(afterSaveOld, afterSaveNew);
  console.log('✅ TaskApp.save() reset de observation adicionado');
}

// ---- PASSO 6: Adicionar campo observation em TaskApp.saveEdit() ----
const saveEditOld = `        const date = document.getElementById('edit-task-date').value;

        if (!desc || !date) return;

        const taskId = document.getElementById('edit-task-form-id').value;
        
        if (taskId) {
           const task = this.tasks.find(t => String(t.id) === String(taskId));
           if (task) {
             task.clientId = clientId;
             task.description = desc;
             task.date = date;
             this.saveToStorage();`;
const saveEditNew = `        const date = document.getElementById('edit-task-date').value;
        const editObsEl = document.getElementById('edit-task-observation');
        const observation = editObsEl ? editObsEl.value.trim() : '';

        if (!desc || !date) return;

        const taskId = document.getElementById('edit-task-form-id').value;
        
        if (taskId) {
           const task = this.tasks.find(t => String(t.id) === String(taskId));
           if (task) {
             task.clientId = clientId;
             task.description = desc;
             task.date = date;
             task.observation = observation;
             task.updatedAt = new Date().toISOString();
             this.saveToStorage();`;

if (newIndexHtml.includes(saveEditOld)) {
  newIndexHtml = newIndexHtml.replace(saveEditOld, saveEditNew);
  console.log('✅ TaskApp.saveEdit() atualizado com observation');
} else {
  console.warn('⚠️ Não encontrou padrão exato em TaskApp.saveEdit()');
}

// ---- PASSO 7: Adicionar preenchimento do campo observation em editTask() ----
const editTaskOld = `        document.getElementById('edit-task-date').value = task.date || '';
        
        // Populando campo de busca para o modal de edição`;
const editTaskNew = `        document.getElementById('edit-task-date').value = task.date || '';
        const editObsFieldEl = document.getElementById('edit-task-observation');
        if (editObsFieldEl) editObsFieldEl.value = task.observation || '';
        
        // Populando campo de busca para o modal de edição`;

if (newIndexHtml.includes(editTaskOld)) {
  newIndexHtml = newIndexHtml.replace(editTaskOld, editTaskNew);
  console.log('✅ editTask() atualizado para preencher observation');
} else {
  console.warn('⚠️ Não encontrou padrão exato em editTask()');
}

// ---- PASSO 8: Adicionar switchTab e atualizar viewOrdersHistory em ClientApp ----
const viewOldHeader = `      viewOrdersHistory(clientId) {`;
const viewNewWithSwitch = `      switchTab(tab) {
        const ordersPanel = document.getElementById('tab-panel-orders');
        const tasksPanel = document.getElementById('tab-panel-tasks');
        const ordersBtn = document.getElementById('tab-btn-orders');
        const tasksBtn = document.getElementById('tab-btn-tasks');
        if (tab === 'orders') {
          if(ordersPanel) ordersPanel.style.display = '';
          if(tasksPanel) tasksPanel.style.display = 'none';
          if(ordersBtn){ ordersBtn.style.borderBottomColor = 'var(--accent-amber)'; ordersBtn.style.color = 'var(--accent-amber)'; }
          if(tasksBtn){ tasksBtn.style.borderBottomColor = 'transparent'; tasksBtn.style.color = 'var(--text-muted)'; }
        } else {
          if(ordersPanel) ordersPanel.style.display = 'none';
          if(tasksPanel) tasksPanel.style.display = '';
          if(tasksBtn){ tasksBtn.style.borderBottomColor = 'var(--accent-purple)'; tasksBtn.style.color = 'var(--accent-purple)'; }
          if(ordersBtn){ ordersBtn.style.borderBottomColor = 'transparent'; ordersBtn.style.color = 'var(--text-muted)'; }
        }
      },

      viewOrdersHistory(clientId) {`;

if (newIndexHtml.includes(viewOldHeader)) {
  newIndexHtml = newIndexHtml.replace(viewOldHeader, viewNewWithSwitch);
  console.log('✅ switchTab() adicionado antes de viewOrdersHistory()');
} else {
  console.warn('⚠️ Não encontrou viewOrdersHistory()');
}

// ---- PASSO 9: Atualizar viewOrdersHistory para mostrar tarefas + renderizar tasks list ----
// Encontrar o fechamento do viewOrdersHistory e adicionar lógica de tarefas
const oldViewEnd = `        ModalEngine.open('client-orders-history-modal');
      }
    };

    /* --------------------------------------------------------------------------
       CONTROLADOR DO BUSCADOR INTELIGENTE DE CLIENTES (CLIENT PICKER)`;

const newViewEnd = `        // Renderizar tarefas do cliente
        const clientTasks = (TaskApp.tasks || []).filter(t => String(t.clientId) === String(clientId)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        const tasksList = document.getElementById('client-tasks-list');
        const openTasks = clientTasks.filter(t => !t.completed).length;
        const doneTasks = clientTasks.filter(t => t.completed).length;
        
        // Atualizar summary com info de tarefas
        const existingSummary = document.getElementById('client-orders-summary-box');
        if (existingSummary) {
          const totalSpentCalc = clientOrders.reduce((sum, o) => sum + (Number(o.totalValue) || 0), 0);
          existingSummary.innerHTML = \`
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div><b>Cód:</b> \${escapeHtml(c.code || '-')} | <b>Razão:</b> \${escapeHtml(c.razaoSocial || c.nomeFantasia)}</div>
              <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <span><b>Pedidos:</b> \${clientOrders.length} | <b>Financeiro:</b> <span style="color: var(--accent-green); font-weight: 700;">\${formatCurrency(totalSpentCalc)}</span></span>
                <span><i class="fa-regular fa-clock" style="color: var(--accent-amber);"></i> <b>\${openTasks}</b> em aberto &nbsp; <i class="fa-solid fa-check" style="color: var(--accent-green);"></i> <b>\${doneTasks}</b> concluídas</span>
              </div>
            </div>
          \`;
        }

        if (tasksList) {
          if (clientTasks.length === 0) {
            tasksList.innerHTML = \`<div style="text-align: center; color: var(--text-muted); padding: 2rem;"><i class="fa-regular fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>Nenhuma tarefa registrada para este cliente.</div>\`;
          } else {
            tasksList.innerHTML = clientTasks.map(t => {
              const isCompleted = t.completed;
              const statusColor = isCompleted ? 'var(--accent-green)' : 'var(--accent-amber)';
              const statusIcon = isCompleted ? 'fa-circle-check' : 'fa-circle-half-stroke';
              const statusLabel = isCompleted ? 'Concluída' : 'Em Aberto';
              const dateFormatted = t.date ? new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-';
              const obs = t.observation ? \`<div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(255,255,255,0.04); border-radius: 4px; border-left: 2px solid var(--border); font-size: 0.8rem; color: var(--text-muted); white-space: pre-line;">\${escapeHtml(t.observation)}</div>\` : '';
              return \`
                <div style="background: var(--bg-input); border: 1px solid var(--border); border-left: 3px solid \${statusColor}; border-radius: 6px; padding: 0.75rem 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                    <div style="flex: 1;">
                      <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">\${escapeHtml(t.description)}</div>
                      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem;"><i class="fa-regular fa-calendar"></i> \${dateFormatted}</div>
                      \${obs}
                    </div>
                    <span style="color: \${statusColor}; font-size: 0.78rem; font-weight: 600; white-space: nowrap;"><i class="fa-solid \${statusIcon}"></i> \${statusLabel}</span>
                  </div>
                </div>
              \`;
            }).join('');
          }
        }

        // Começar na aba de pedidos
        this.switchTab('orders');
        ModalEngine.open('client-orders-history-modal');
      }
    };

    /* --------------------------------------------------------------------------
       CONTROLADOR DO BUSCADOR INTELIGENTE DE CLIENTES (CLIENT PICKER)`;

if (newIndexHtml.includes(oldViewEnd)) {
  newIndexHtml = newIndexHtml.replace(oldViewEnd, newViewEnd);
  console.log('✅ viewOrdersHistory() atualizado para renderizar tarefas');
} else {
  console.warn('⚠️ Não encontrou final de viewOrdersHistory() - verificar manualmente');
}

// ---- Salvar ----
fs.writeFileSync('./index.html', newIndexHtml, 'utf8');
const lineCount = newIndexHtml.split('\n').length;
console.log(`\n✅ index.html reconstruído com sucesso!`);
console.log(`   Tamanho: ${newIndexHtml.length} bytes, Linhas: ${lineCount}`);
