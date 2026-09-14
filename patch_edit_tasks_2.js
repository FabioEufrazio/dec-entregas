const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the missing Edit button in TaskApp.render
const rowTarget = `<button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\${t.id}')">`;
const rowReplace = `<div style="display: flex; gap: 5px;">
                <button class="btn btn-secondary btn-icon-only" style="color: #3b82f6; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.editTask('\${t.id}')" title="Editar">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\${t.id}')" title="Excluir">`;

if (content.includes(rowTarget) && !content.includes('TaskApp.editTask(')) {
  content = content.replace(rowTarget, rowReplace);
} else if (content.includes('TaskApp.editTask(')) {
  // Já foi injetado (de alguma forma) mas vamos garantir que não injete duplo
}

// Se o replace acima falhar porque a div envolta mudou, vamos tentar algo mais largo
if (!content.includes('TaskApp.editTask(')) {
  const rowTargetFallback = /<button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask\('\$\{t\.id\}'\)">/;
  const rowReplaceFallback = `<div style="display: flex; gap: 5px;">
                <button class="btn btn-secondary btn-icon-only" style="color: #3b82f6; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.editTask('\${t.id}')" title="Editar">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\${t.id}')" title="Excluir">`;
  content = content.replace(rowTargetFallback, rowReplaceFallback);
}

// Tem um </div> faltando fechar se eu fiz o replace acima, porque o original estava dentro de <div><button>...</div>
// Vou corrigir a injeção do botão de editar re-escrevendo a linha inteira da lixeira
const trashLineRegex = /<div>\s*<button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp\.deleteTask\('\$\{t\.id\}'\)">\s*<i class="fa-regular fa-trash-can"><\/i>\s*<\/button>\s*<\/div>/g;

const correctButtons = `<div style="display: flex; gap: 5px;">
                <button class="btn btn-secondary btn-icon-only" style="color: #3b82f6; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.editTask('\${t.id}')" title="Editar">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-secondary btn-icon-only" style="color: #ef4444; border: none; background: transparent; box-shadow: none;" onclick="TaskApp.deleteTask('\${t.id}')">
                  <i class="fa-regular fa-trash-can"></i>
                </button>
              </div>`;
              
if (content.match(trashLineRegex)) {
   content = content.replace(trashLineRegex, correctButtons);
}

// 2. Fix the white backgrounds to make it dark mode compliant
content = content.replace(/background: #f1f5f9;/g, 'background: #1e293b;');
content = content.replace(/background: white;/g, 'background: #1e293b;');
content = content.replace(/color: #0f172a;/g, 'color: #e2e8f0;');
content = content.replace(/color: #475569;/g, 'color: #94a3b8;');
content = content.replace(/border: 1px solid #e2e8f0;/g, 'border: 1px solid #334155;');
// Fix tabs background that might have been affected by #f1f5f9
content = content.replace(/background: #1e293b;(\s*color: #64748b;)/g, 'background: #0f172a;$1'); // Just in case

fs.writeFileSync(file, content, 'utf8');
console.log('Botão Editar corrigido e Tema Escuro aplicado na Agenda!');
