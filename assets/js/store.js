/**
 * Armazenamento do protótipo: sem login e sem banco de dados.
 * Quem abre o site já entra no perfil base de demonstração; o que a pessoa muda fica só
 * no localStorage deste navegador (e some ao limpar os dados do site ou "Restaurar exemplo").
 */
(function () {
  const KEY = 'cuidapet-demo';
  let timer = null;
  let pending = null;

  const flush = () => {
    if (!pending) return;
    try { localStorage.setItem(KEY, JSON.stringify(pending)); } catch (e) { /* cheio ou bloqueado: segue só em memória */ }
    pending = null;
  };

  window.CPStore = {
    load() {
      try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
    },
    save(state) {
      pending = state;
      clearTimeout(timer);
      timer = setTimeout(flush, 300);
    },
    clear() {
      pending = null;
      clearTimeout(timer);
      try { localStorage.removeItem(KEY); } catch (e) { /* ignora */ }
    },
  };

  window.addEventListener('beforeunload', flush);
})();
