const fs = require('node:fs');
const file = 'qa-reports/2026-11-07/image-generation-queue.csv';
const source = fs.readFileSync(file, 'utf8');
const rows = [];
let row = [], field = '', quoted = false;
for (let i = 0; i < source.length; i++) {
  const c = source[i];
  if (quoted) {
    if (c === '"' && source[i + 1] === '"') { field += '"'; i++; }
    else if (c === '"') quoted = false;
    else field += c;
  } else if (c === '"') quoted = true;
  else if (c === ',') { row.push(field); field = ''; }
  else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
  else field += c;
}
if (field || row.length) { row.push(field); rows.push(row); }
const remove = new Set(['Mangalarga Marchador','Árabe','Crioulo','Quarto de Milha','Jabuti-piranga','Jabuti-tinga',"Tigre-d'água",'Cágado-de-barbicha']);
const header = rows.shift();
const next = rows.filter(r => !(r[0] === 'cavalo' && remove.has(r[2]) || r[0] === 'jabuti' && remove.has(r[2]) || r[0] === 'tartaruga' && remove.has(r[2])));
const csv = [header,...next].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
fs.writeFileSync(file,csv,'utf8');
console.log(JSON.stringify({removed:rows.length-next.length,remaining:next.length}));
