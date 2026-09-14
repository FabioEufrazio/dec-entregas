const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
const lines = html.split('\n');

console.log(`Total de linhas: ${lines.length}`);

// Encontrar as duas ocorrências de id="agenda-modal"
const agendaLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('id="agenda-modal"')) {
    agendaLines.push(i + 1); // 1-indexed
    console.log(`Encontrou agenda-modal na linha ${i + 1}: ${lines[i].trim().substring(0, 80)}`);
  }
}

if (agendaLines.length < 2) {
  console.log('Menos de 2 occorrências de agenda-modal. Nada a fazer.');
  process.exit(0);
}

// O primeiro bloco de agenda-modal começa pouco antes (no comentário)
// Encontrar o início do comentário <!-- MODAL AGENDA antes da primeira ocorrência
let firstBlockStart = agendaLines[0] - 1; // 0-indexed
while (firstBlockStart > 0 && !lines[firstBlockStart].includes('MODAL AGENDA')) {
  firstBlockStart--;
}
console.log(`\nPrimeiro bloco inicia em linha ${firstBlockStart + 1}: ${lines[firstBlockStart].trim()}`);

// O segundo bloco começa no comentário antes da segunda ocorrência
let secondBlockStart = agendaLines[1] - 1; // 0-indexed
while (secondBlockStart > 0 && !lines[secondBlockStart].includes('MODAL AGENDA')) {
  secondBlockStart--;
}
console.log(`Segundo bloco inicia em linha ${secondBlockStart + 1}: ${lines[secondBlockStart].trim()}`);

// Remover as linhas do primeiro bloco (firstBlockStart até secondBlockStart - 1, excluindo a linha em branco antes do comentário)
// Encontrar a linha em branco antes do comentário do primeiro bloco
let removeFrom = firstBlockStart;
while (removeFrom > 0 && lines[removeFrom - 1].trim() === '') {
  removeFrom--;
}
// Vamos remover de removeFrom até secondBlockStart - 1 (inclusive)
// Mas queremos manter a linha em branco antes do segundo bloco
const removeEnd = secondBlockStart; // Não incluir o comentário do segundo bloco
console.log(`\nRemovendo linhas ${removeFrom + 1} até ${removeEnd} (${removeEnd - removeFrom} linhas)`);

// Reconstruir
const newLines = [...lines.slice(0, removeFrom), ...lines.slice(removeEnd)];
console.log(`Novas linhas: ${newLines.length} (removidas: ${lines.length - newLines.length})`);

fs.writeFileSync('./index.html', newLines.join('\n'), 'utf8');
console.log('✅ Duplicação removida com sucesso!');
