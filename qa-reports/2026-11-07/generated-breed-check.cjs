async (page) => {
  await page.goto('http://localhost:5180/#/cadastro'); await page.waitForTimeout(1200);
  return await page.evaluate(async()=>{
    const specs=[['coelho','Mini Lop'],['coelho','Angorá'],['coelho','Holandês'],['coelho','Lionhead'],['gato','Sem raça definida (SRD)'],['cachorro','Vira-lata caramelo'],['hamster','Sírio'],['hamster','Anão Russo'],['hamster','Roborovski'],['hamster','Sírio de pelo longo (Angorá)'],['roedor','Rato twister'],['roedor','Rato dumbo'],['roedor','Gerbil (esquilo-da-mongólia)'],['roedor','Degu'],['chinchila','Padrão (cinza)'],['chinchila','Bege'],['chinchila','Branca (Wilson)'],['chinchila','Ébano'],['porquinho','Inglês (pelo curto)'],['porquinho','Abissínio'],['porquinho','Peruano'],['porquinho','Rex'],['furao','Sable'],['furao','Albino'],['furao','Canela'],['furao','Champagne'],['pato','Pato-de-pequim'],['pato','Pato-real (Mallard)'],['pato','Pato-corredor-indiano'],['pato','Marreco'],['galinha','Caipira'],['galinha','Brahma'],['galinha','Garnisé'],['galinha','Rhode Island Red'],['jabuti','Jabuti-piranga'],['jabuti','Jabuti-tinga'],['tartaruga',"Tigre-d'água"],['tartaruga','Cágado-de-barbicha'],['cavalo','Mangalarga Marchador'],['cavalo','Árabe'],['cavalo','Crioulo'],['cavalo','Quarto de Milha']];
    const checks=[];
    for(const [sp,breed] of specs) for(const sex of ['Macho','Fêmea']){
      const src=window.CP.breedImg(sp,breed,sex); const img=new Image(); img.src=src;
      try { await img.decode(); checks.push({sp,breed,sex,src:src.replace(location.origin+'/',''),ok:true,w:img.naturalWidth,h:img.naturalHeight}); }
      catch(e){checks.push({sp,breed,sex,src,ok:false,error:String(e)});}
    }
    return JSON.stringify({checks,failed:checks.filter(x=>!x.ok).length,uniqueAssets:new Set(checks.map(x=>x.src)).size});
  });
}
