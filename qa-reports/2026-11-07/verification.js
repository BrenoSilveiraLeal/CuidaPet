async page => {
  const base = 'http://localhost:5180';
  const dir = 'qa-reports/2026-11-07';
  const sizes = [[375,812],[430,932],[768,1024],[1366,768],[1536,864],[1920,1080],[3840,2160]];
  const routes = [['home','/'],['vaccines','/#/vacinas'],['shop','/#/loja']];
  const measurements = [];
  for (const [routeName, route] of routes) {
    await page.goto(base + route);
    for (const [w,h] of sizes) {
      await page.setViewportSize({width:w,height:h});
      await page.waitForTimeout(200);
      const metrics = await page.evaluate(() => ({
        viewport:[innerWidth,innerHeight], documentWidth:document.documentElement.scrollWidth,
        overflow:document.documentElement.scrollWidth>innerWidth,
        imagesBroken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src'))
      }));
      await page.screenshot({path:`${dir}/${routeName}-${w}x${h}.png`,fullPage:true});
      measurements.push({route:routeName,size:`${w}x${h}`,...metrics});
    }
  }
  await page.goto(base + '/#/vacinas');
  await page.getByRole('tab',{name:'Histórico'}).click();
  await page.waitForTimeout(350);
  const history = await page.evaluate(() => ({selected:document.querySelector('.vac-tabs [aria-selected="true"]')?.textContent.trim(),indicator:getComputedStyle(document.querySelector('.vac-tabs'),'::before').transform}));
  await page.screenshot({path:`${dir}/vaccines-history-375x812.png`,fullPage:true});
  await page.goto(base + '/#/loja');
  const categoryLayout = await page.evaluate(() => {
    const wrap=document.querySelector('.cats'), buttons=[...wrap.querySelectorAll('button')];
    const rect=wrap.getBoundingClientRect();
    const centers=buttons.map(b=>{const r=b.getBoundingClientRect();return r.left+r.width/2});
    return {count:buttons.length,centerError:Math.round(Math.abs((Math.min(...centers)+Math.max(...centers))/2-(rect.left+rect.width/2))),labels:buttons.map(b=>b.innerText.trim())};
  });
  await page.screenshot({path:`${dir}/shop-categories-375x812.png`,fullPage:true});
  await page.goto(base + '/#/pet/thor');
  await page.getByRole('tab',{name:'Dados',exact:true}).click();
  await page.waitForTimeout(320);
  const petData = await page.evaluate(() => ({selected:document.querySelector('.pet-tabs [aria-selected="true"]')?.textContent.trim(),hasRegistration:document.body.innerText.includes('CPF / registro')}));
  await page.screenshot({path:`${dir}/pet-data-375x812.png`,fullPage:true});
  await page.goto(base + '/#/cadastro');
  await page.getByLabel('Buscar espécie').fill('galinha');
  await page.getByRole('radio',{name:'Galinha'}).click();
  const animalImages = await page.evaluate(async () => {
    const male=CP.breedImg('galinha','Caipira','Macho');
    const female=CP.breedImg('galinha','Caipira','Fêmea');
    const bird=CP.breedImg('passaro','Canário-belga','Macho');
    const check=async src=>{const img=new Image();img.src=src;await img.decode();return {src,width:img.naturalWidth,height:img.naturalHeight}};
    return {male:await check(male),female:await check(female),bird:await check(bird),distinct:male!==female};
  });
  await page.screenshot({path:`${dir}/registration-rooster-375x812.png`,fullPage:true});
  return {measurements,history,categoryLayout,petData,animalImages};
}


