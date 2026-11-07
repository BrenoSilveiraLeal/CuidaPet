async page => {
 const base='http://localhost:5180'; await page.setViewportSize({width:375,height:812});
 const out={}; const native=await page.evaluate(()=>{window.__vt=0;const f=document.startViewTransition.bind(document);document.startViewTransition=cb=>{window.__vt++;return f(cb)};return true});
 await page.goto(base+'/#/lembretes'); await page.getByRole('tab',{name:'Vermífugos'}).click(); await page.waitForTimeout(340);
 out.reminders=await page.evaluate(()=>({selected:document.querySelector('.rem-tabs [aria-selected="true"]')?.textContent.trim(),indicator:getComputedStyle(document.querySelector('.rem-tabs'),'::before').transform,transitions:window.__vt}));
 await page.goto(base+'/#/agenda'); await page.getByRole('tab',{name:'Histórico'}).click(); await page.waitForTimeout(340);
 out.agenda=await page.evaluate(()=>({selected:document.querySelector('.agenda-tabs [aria-selected="true"]')?.textContent.trim(),indicator:getComputedStyle(document.querySelector('.agenda-tabs'),'::before').transform,transitions:window.__vt}));
 await page.goto(base+'/#/loja'); await page.getByRole('button',{name:'Petiscos',exact:true}).click();
 out.category=await page.evaluate(()=>({hash:location.hash,title:document.querySelector('.topbar h1')?.textContent.trim(),items:document.querySelectorAll('.prow').length,overflow:document.documentElement.scrollWidth>innerWidth}));
 return {native,...out};
}
