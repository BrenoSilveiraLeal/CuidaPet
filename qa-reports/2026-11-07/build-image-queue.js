const fs=require('node:fs');const path=require('node:path');
global.window={CP_IMG_BASE:'assets/img/'};require(path.join(process.cwd(),'cuidapet/assets/js/data.js'));const C=window.CP;
const escape=v=>`"${String(v??'').replaceAll('"','""')}"`;
const slug=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const rows=[];
for(const sid of C.speciesOrder){const s=C.species[sid],map=C.breedImages[sid]||{},counts=new Map();for(const src of Object.values(map))counts.set(src,(counts.get(src)||0)+1);
 for(const breed of s.breeds){const src=map[breed];const needs=!src||counts.get(src)>1;if(!needs)continue;for(const sex of ['Macho','Fêmea']){
  const female=sex==='Fêmea';const base=`${sid}-${slug(breed)}`;const file=`cuidapet/assets/img/breeds/${base}${female?'-f':''}.png`;
  const accessories=female?'óculos e coleira rosa':'óculos e coleira azul';
  const prompt=`Mascote CuidaPet de ${speciesName(s.label)} da raça ${breed}, ${sex.toLowerCase()}; animal claramente reconhecível pela anatomia e pelagem típicas da raça; ${accessories}. Personagem amigável em 3D polido, mesmo estilo dos mascotes já usados pelo CuidaPet, corpo inteiro centralizado, recorte com fundo transparente, composição quadrada, sem texto e sem acessórios além dos óculos e coleira.`;
  rows.push([sid,s.label,breed,sex,file,prompt]);
 }}
}
function speciesName(label){return label.replace(/\s*\/.*$/,'').toLowerCase()}
const headers=['species_id','species_label','breed','sex','output_path','generation_prompt'];
fs.writeFileSync(path.join(process.cwd(),'qa-reports/2026-11-07/image-generation-queue.csv'),[headers,...rows].map(r=>r.map(escape).join(',')).join('\r\n')+'\r\n','utf8');console.log(JSON.stringify({breedVariants:new Set(rows.map(r=>`${r[0]}|${r[2]}`)).size,images:rows.length}));
