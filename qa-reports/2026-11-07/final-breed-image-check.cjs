async page => {
  await page.goto('http://localhost:5180/#/cadastro');
  await page.waitForTimeout(500);
  return await page.evaluate(async () => {
    const specs = [['peixe','Kinguio'],['peixe','Guppy'],['peixe','Peixe-palhaço (marinho)'],['porco','Mini pig'],['porco','Vietnamita'],['porco','Kunekune'],['porco','Juliana'],['tartaruga','Muçuã']];
    const checks = [];
    for (const [species,breed] of specs) for (const sex of ['Macho','Fêmea']) {
      const src = window.CP.breedImg(species,breed,sex);
      const img = new Image(); img.src = src;
      try { await img.decode(); checks.push({species,breed,sex,src:src.replace(location.origin+'/',''),ok:true,w:img.naturalWidth,h:img.naturalHeight}); }
      catch (error) { checks.push({species,breed,sex,src,ok:false,error:String(error)}); }
    }
    return JSON.stringify({checks,failed:checks.filter(x=>!x.ok).length,uniqueAssets:new Set(checks.map(x=>x.src)).size});
  });
}
