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
const remove = new Set(['Mangalarga Marchador','Árabe','Crioulo','Quarto de Milha','Jabuti-piranga','Jabuti-tinga',"Tigre-d'água",'Cágado-de-barbicha','Nelore','Angus','Girolando','Holandesa','Saanen','Anglo-nubiana','Boer','Moxotó','Santa Inês','Dorper','Merino','Suffolk','Píton-real (Ball python)','Jiboia','King snake','Iguana-verde','Teiú','Axolote','Sapo-boi (Pacman)','Perereca-de-olhos-vermelhos','Rã-touro','Caranguejeira-brasileira','Tarântula Chilean Rose','Tarântula Red Knee','Tarântula Pink Toe','Muçuã','Kinguio','Guppy','Peixe-palhaço (marinho)','Mini pig','Vietnamita','Kunekune','Juliana']);
const header = rows.shift();
const next = rows.filter(r => !(r[0] === 'cavalo' && remove.has(r[2]) || r[0] === 'jabuti' && remove.has(r[2]) || r[0] === 'tartaruga' && remove.has(r[2]) || r[0] === 'bovino' && remove.has(r[2]) || r[0] === 'cabra' && remove.has(r[2]) || r[0] === 'ovelha' && remove.has(r[2]) || r[0] === 'cobra' && remove.has(r[2]) || r[0] === 'iguana' && remove.has(r[2]) || r[0] === 'anfibio' && remove.has(r[2]) || r[0] === 'aranha' && remove.has(r[2]) || r[0] === 'peixe' && remove.has(r[2]) || r[0] === 'porco' && remove.has(r[2])));
const csv = [header,...next].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
fs.writeFileSync(file,csv,'utf8');
console.log(JSON.stringify({removed:rows.length-next.length,remaining:next.length}));
