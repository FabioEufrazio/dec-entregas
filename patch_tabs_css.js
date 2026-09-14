const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'local.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Inject CSS for Tabs
if (!content.includes('.tabs-container {')) {
  const cssTarget = `</style>`;
  const cssTabs = `
    .tabs-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 1px solid #334155;
      padding-bottom: 10px;
      padding-top: 10px;
    }
    .tab {
      padding: 6px 14px;
      border-radius: 20px;
      background: #1e293b;
      color: #94a3b8;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #334155;
    }
    .tab:hover {
      background: #334155;
      color: white;
    }
    .tab.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
  </style>`;
  
  if (content.includes(cssTarget)) {
    content = content.replace(cssTarget, cssTabs);
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('CSS das abas injetado!');
