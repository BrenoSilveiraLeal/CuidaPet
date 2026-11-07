async page => {
  await page.goto('http://localhost:5180/#/cadastro');
  await page.waitForTimeout(700);
  const summary = await page.evaluate(async () => {
    const checks = [];
    for (const speciesId of window.CP.speciesOrder) {
      const species = window.CP.species[speciesId];
      for (const breed of species.breeds.filter(name => name !== 'Outra')) {
        for (const sex of ['Macho','Fêmea']) {
          const src = window.CP.breedImg(speciesId,breed,sex);
          const img = new Image(); img.src = src;
          try { await img.decode(); checks.push({speciesId,species:species.label,breed,sex,src:src.replace(location.origin+'/',''),ok:true,width:img.naturalWidth,height:img.naturalHeight}); }
          catch (error) { checks.push({speciesId,species:species.label,breed,sex,src,ok:false,error:String(error)}); }
        }
      }
    }
    return {checks,failed:checks.filter(x=>!x.ok).length,uniquePaths:new Set(checks.map(x=>x.src)).size,uniqueBreeds:new Set(checks.map(x=>x.speciesId+'|'+x.breed)).size};
  });
  await page.evaluate(async checks => {
    const cards=checks.checks.map(item=>`<article><img src="${location.origin}/${item.src}"><b>${item.species} — ${item.breed}</b><span>${item.sex}</span></article>`).join('');
    document.documentElement.innerHTML=`<head><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#f2f9fd;color:#17344b;font:12px Arial}h1{font-size:22px;color:#066c9c;margin:0 0 5px}p{color:#62798b;margin:0 0 16px}.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}article{background:#fff;border:1px solid #deebf4;border-radius:12px;padding:6px;text-align:center;display:flex;flex-direction:column;align-items:center;min-height:150px}img{width:120px;height:120px;object-fit:contain}b{font-size:11px;margin:3px 0}span{color:#60768a;font-size:10px}</style></head><body><h1>Auditoria visual do catálogo de raças — CuidaPet</h1><p>89 raças/tipos × macho e fêmea • 178 arquivos • opções “Outra” excluídas</p><div class="grid">${cards}</div>`;
  },summary);
  await page.waitForFunction(()=>[...document.images].length===178&&[...document.images].every(img=>img.complete&&img.naturalWidth>0));
  await page.screenshot({path:'qa-reports/2026-11-07/full-breed-contact-sheet.png',fullPage:true});
  return JSON.stringify({uniqueBreeds:summary.uniqueBreeds,checked:summary.checks.length,failed:summary.failed,uniquePaths:summary.uniquePaths,contactSheetImages:await page.locator('img').count(),contactSheetLoaded:await page.locator('img').evaluateAll(imgs=>imgs.filter(x=>x.naturalWidth>0).length)});
}
