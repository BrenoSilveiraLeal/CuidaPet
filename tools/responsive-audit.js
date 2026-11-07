// Executar com playwright-cli run-code --filename tools/responsive-audit.js
async (page) => {
  const routes = ['home', 'pets', 'pet/thor', 'vacinas', 'vacina/raiva', 'lembretes', 'agenda', 'agendar', 'loja', 'categoria/todos', 'produto/cachorro-racao-adulto', 'cadastro', 'perfil', 'config'];
  const sizes = [[320, 740], [390, 844], [600, 800], [768, 1024], [899, 768], [900, 768], [1024, 768], [1280, 720], [1366, 768], [1920, 1080]];
  const failures = [];
  const grids = [];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.waitForSelector('.view');
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    for (const route of routes) {
      await page.evaluate(route => { location.hash = '#/' + route; }, route);
      await page.waitForFunction(route => location.hash === '#/' + route && !!document.querySelector('.view'), route);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const result = await page.evaluate(() => {
        const screen = document.querySelector('.screen');
        const issues = [];
        for (const el of document.querySelectorAll('.view *, .desk-top, .side-logo, .side-nav button')) {
          const css = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          if (!box.width || !box.height || el.closest('svg, .hscroll, .pet-switch, .chips, .dose-track, .pet-hero, .promo')) continue;
          if (css.position === 'absolute' || css.position === 'fixed' || css.overflowX !== 'visible') continue;
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
            issues.push({ element: el.tagName.toLowerCase() + '.' + el.className, text: el.textContent.trim().slice(0, 65), width: el.clientWidth, content: el.scrollWidth });
          }
        }
        return { overflow: screen.scrollWidth > screen.clientWidth + 1, issues, grids: [...document.querySelectorAll('.pgrid')].map(g => ({ columns: getComputedStyle(g).gridTemplateColumns, width: g.clientWidth })) };
      });
      if (result.overflow || result.issues.length) failures.push({ width, route, ...result });
      if (route === 'loja') grids.push({ width, ...result });
    }
  }
  return { cases: sizes.length * routes.length, errors, failures, grids };
}
