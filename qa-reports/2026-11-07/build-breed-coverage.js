const fs = require('node:fs');
const path = require('node:path');
global.window = { CP_IMG_BASE: 'assets/img/' };
require(path.join(process.cwd(), 'cuidapet/assets/js/data.js'));
const C = window.CP;
const rows = [];
const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
for (const speciesId of C.speciesOrder) {
  const species = C.species[speciesId];
  const mapped = C.breedImages[speciesId] || {};
  for (const breed of species.breeds) {
    const hasMap = Boolean(mapped[breed]);
    const male = C.breedImg(speciesId, breed, 'Macho');
    const female = C.breedImg(speciesId, breed, 'Fêmea');
    rows.push([speciesId, species.label, breed, 'Macho', hasMap, male, !hasMap]);
    rows.push([speciesId, species.label, breed, 'Fêmea', hasMap, female, !hasMap]);
  }
}
const headers = ['species_id','species_label','breed_or_type','sex','named_breed_mapping','current_asset_path','needs_dedicated_breed_asset'];
const csv = [headers,...rows].map(row=>row.map(escape).join(',')).join('\r\n')+'\r\n';
fs.writeFileSync(path.join(process.cwd(),'qa-reports/2026-11-07/breed-image-coverage.csv'),csv,'utf8');
console.log(JSON.stringify({species:Object.keys(C.species).length,breeds:rows.length/2,sexSlots:rows.length,mapped:Object.values(C.breedImages).reduce((n,m)=>n+Object.keys(m).length,0),uniqueMappedAssets:new Set(Object.values(C.breedImages).flatMap(m=>Object.values(m))).size,slotsNeedingBreedSpecificAsset:rows.filter(r=>r[6]).length}));
