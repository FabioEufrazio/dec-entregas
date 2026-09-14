const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove editTask from ClientApp completely
const editTaskBlock = `editTask(id) {
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
      },`;

// Since there are multiple white spaces, let's just use replace with a flexible regex
const blockRegex = /editTask\(id\) \{[\s\S]*?cancelEdit\(\) \{[\s\S]*?display: 'none';\s*\},/g;
content = content.replace(blockRegex, '');

// 2. Inject it into TaskApp BEFORE the save(event)
const taskAppSaveRegex = /(save\(event\) \{\s*event\.preventDefault\(\);\s*const clientId = document\.getElementById\('task-client-id'\)\.value;)/;

if (content.match(taskAppSaveRegex) && !content.includes('TaskApp editTask is safe now')) {
  // Let's insert a comment so we know it worked, and then the methods
  const injection = `// TaskApp editTask is safe now
      editTask(id) {
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
      
      $1`;
  content = content.replace(taskAppSaveRegex, injection);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Forced extraction of editTask completed!');
