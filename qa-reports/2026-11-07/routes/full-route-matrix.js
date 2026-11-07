async page => {
 const base='http://localhost:5180',dir='qa-reports/2026-11-07/routes';
 const sizes=[[375,812],[430,932],[768,1024],[1366,768],[1536,864],[1920,1080],[3840,2160]];
 const ids=await page.evaluate(()=>({product:CP.products[0]?.id,vaccine:Object.values(CP.vaccines).flat().find(v=>v.key)?.key}));
 const routes=[
  ['home','#/home'],['cadastro','#/cadastro'],['editar-pet','#/editar/thor'],['pet','#/pet/thor'],
  ['vacinas','#/vacinas'],['vacina-item',`#/vacina/${ids.vaccine||'raiva'}`],['lembretes','#/lembretes'],['agenda','#/agenda'],['agendar','#/agendar'],['notificacoes','#/notificacoes'],
  ['loja','#/loja'],['categoria','#/categoria/racoes'],['produto',`#/produto/${ids.product||'nutripata-adulto'}`],['carrinho','#/carrinho'],['checkout','#/checkout'],['parceiros','#/parceiros'],
  ['mais','#/mais'],['pets','#/pets'],['pedidos','#/pedidos'],['favoritos','#/favoritos'],['dicas','#/dicas'],['perfil','#/perfil'],['enderecos','#/enderecos'],['pagamentos','#/pagamentos'],['config','#/config'],['ajuda','#/ajuda']
 ];
 await page.goto(base+'/#/home'); const results=[];
 for(const [name,hash] of routes){
   await page.evaluate(h=>{location.hash=h},hash); await page.waitForTimeout(80);
   for(const [w,h] of sizes){
     await page.setViewportSize({width:w,height:h}); await page.waitForTimeout(30);
     const m=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src'))}));
     const filename=`${dir}/${name}-${w}x${h}.jpg`;
     await page.screenshot({path:filename,fullPage:true,type:'jpeg',quality:62});
     results.push({route:name,size:`${w}x${h}`,overflow:m.overflow,broken:m.broken.length,artifact:filename});
   }
 }
 return {routes:routes.map(x=>x[0]),total:results.length,overflow:results.filter(x=>x.overflow),broken:results.filter(x=>x.broken),screenshots:results.map(x=>x.artifact)};
}
