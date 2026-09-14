const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the incorrectly injected editTask and cancelEdit from ClientApp
const wrongInjectionRegex = /editTask\(id\) \{[\s\S]*?cancelEdit\(\) \{[\s\S]*?\},/g;
content = content.replace(wrongInjectionRegex, '');

// 2. Inject editTask and cancelEdit into TaskApp
const correctInjectionTarget = /save\(event\) \{[\s\S]*?event\.preventDefault\(\);[\s\S]*?const taskId = document\.getElementById\('task-form-id'\)\.value;/;

const correctInjectionCode = `editTask(id) {
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
      
      save(event) {
        event.preventDefault();
        const clientId = document.getElementById('task-client-id').value;
        const desc = document.getElementById('task-desc').value.trim();
        const date = document.getElementById('task-date').value;

        if (!desc || !date) return;

        const taskId = document.getElementById('task-form-id').value;`;

if (content.match(correctInjectionTarget)) {
  content = content.replace(correctInjectionTarget, correctInjectionCode);
}

// 3. Fix the Agenda Badge to be white like the Client Badge
// Target: style="background: #1e293b; color: #3b82f6;"
// Replacement: style="background: rgba(255,255,255,0.25); color: white;" (or something that looks like the Client badge)
// Wait, the client badge uses: <span class="badge-count" id="header-clients-count">0</span> -> default styling in CSS.
// Let's remove the inline style from the Agenda badge and let it use the default .badge-count styling!
const agendaBadgeTarget = 'id="header-tasks-count" style="background: #1e293b; color: #3b82f6;"';
const agendaBadgeReplace = 'id="header-tasks-count"';

content = content.replace(agendaBadgeTarget, agendaBadgeReplace);

// Remove any other white/dark styling artifacts on the agenda badge if they exist
content = content.replace('id="header-tasks-count" style="background: white; color: #3b82f6;"', 'id="header-tasks-count"');

// Fix centering of badge: in css, .badge-count might not have display: flex.
// Let's add display: flex, align-items: center, justify-content: center to the badge count style if not already.
if (!content.includes('justify-content: center; /* fix badge */')) {
  const badgeCssTarget = '.badge-count {';
  const badgeCssReplace = `.badge-count {
      display: inline-flex;
      align-items: center;
      justify-content: center; /* fix badge */`;
  content = content.replace(badgeCssTarget, badgeCssReplace);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Correção final da edição e layout da badge concluída!');
