async (page) => {
 await page.goto('http://localhost:5180/#/cadastro'); await page.waitForTimeout(1200);
 return await page.evaluate(async()=>{
   const specs=[['coelho','Mini Lop'],['coelho','Angorá'],['coelho','Holandês'],['coelho','Lionhead'],['gato','Sem raça definida (SRD)'],['cachorro','Vira-lata caramelo']];
   const checks=[];
   for(const [sp,breed] of specs) for(const sex of ['Macho','Fêmea']){
     const src=window.CP.breedImg(sp,breed,sex); const img=new Image(); img.src=src;
     try { await img.decode(); checks.push({sp,breed,sex,src:src.replace(location.origin+'/',''),ok:true,w:img.naturalWidth,h:img.naturalHeight}); }
     catch(e){checks.push({sp,breed,sex,src,ok:false,error:String(e)});}
   }
   return JSON.stringify({checks,failed:checks.filter(x=>!x.ok).length});
 });
}
