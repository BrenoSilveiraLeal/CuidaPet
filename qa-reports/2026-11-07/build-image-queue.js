const fs = require('node:fs');
const path = require('node:path');
global.window = { CP_IMG_BASE: 'assets/img/' };
require(path.join(process.cwd(), 'cuidapet/assets/js/data.js'));
const C = window.CP;
const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const slug = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const genderNames = {
  cavalo: ['cavalo', 'égua'], bovino: ['touro', 'vaca'], ovelha: ['carneiro', 'ovelha'],
  cabra: ['bode', 'cabra'], galinha: ['galo', 'galinha'], pato: ['pato', 'pata'], porco: ['porco', 'porca'],
};
const breeds = C.speciesOrder.flatMap((id) => C.species[id].breeds
  .filter((breed) => breed !== 'Outra').map((breed) => ({ id, breed })));
const uses = new Map();
for (const { id, breed } of breeds) {
  for (const sex of ['Macho', 'Fêmea']) {
    const url = C.breedImg(id, breed, sex);
    uses.set(url, (uses.get(url) || 0) + 1);
  }
}
const isUniquePairOnDisk = ({ id, breed }) => ['Macho', 'Fêmea'].every((sex) => {
  const url = C.breedImg(id, breed, sex);
  return uses.get(url) === 1 && fs.existsSync(path.join(process.cwd(), 'cuidapet/assets', url.slice(7)));
});
const alreadyUnique = new Set(breeds.filter(isUniquePairOnDisk).map(({ id, breed }) => `${id}|${breed}`));
const rows = [];
for (const { id, breed } of breeds) {
  if (alreadyUnique.has(`${id}|${breed}`)) continue;
  const species = C.species[id];
  for (const sex of ['Macho', 'Fêmea']) {
    const female = sex === 'Fêmea';
    const animal = (genderNames[id] || [species.label, species.label])[female ? 1 : 0];
    const file = `cuidapet/assets/img/breeds/${id}-${slug(breed)}${female ? '-f' : ''}.png`;
    const accessories = female ? 'óculos e coleira rosa' : 'óculos e coleira azul';
    const prompt = `Mascote CuidaPet de ${animal}, raça/tipo ${breed}, ${sex.toLowerCase()}; identidade visual 3D polida e amigável, mesmo estilo e enquadramento dos mascotes CuidaPet: corpo inteiro, centralizado, vista frontal em leve 3/4, fundo transparente, imagem quadrada. Distinguir claramente a raça ${breed} por formato corporal, pelagem, cores e marcas reconhecíveis. Representar ${female ? 'anatomia adulta feminina' : 'anatomia adulta masculina'}; ${accessories}. Sem texto, sem filhote, sem cenário e sem acessórios extras.`;
    rows.push([id, species.label, breed, sex, file, prompt]);
  }
}
const headers = ['species_id', 'species_label', 'breed', 'sex', 'output_path', 'generation_prompt'];
const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n') + '\r\n';
fs.writeFileSync(path.join(process.cwd(), 'qa-reports/2026-11-07/image-generation-queue.csv'), csv, 'utf8');
console.log(JSON.stringify({ species: C.speciesOrder.length, breedVariants: breeds.length, alreadyUnique: alreadyUnique.size, toGenerate: rows.length / 2, images: rows.length }));
