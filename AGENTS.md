# CuidaPet — guia para agentes de código

Sistema único (site no computador + app instalável/PWA no celular) para tutores de pets: login com Google, perfil do tutor, vários pets por tutor, carteira de vacinação por espécie, lembretes, agenda de consultas e loja.

## Stack
- HTML, CSS e JavaScript puros. **Sem framework e sem build.** Não introduzir dependências de npm sem necessidade.
- Firebase (Auth com Google + Firestore) via SDK compat carregado por CDN em `cuidapet/index.html`. Só é usado se `cuidapet/assets/js/config.js` tiver o `firebaseConfig`; sem isso roda em modo local (localStorage).
- Fontes: Fredoka (logo/títulos) e Plus Jakarta Sans (texto), via Google Fonts.

## Estrutura
- `cuidapet/index.html` — casca da aplicação (menu lateral, barra superior, área de telas, abas inferiores, modal e toast).
- `cuidapet/assets/js/data.js` — dados: espécies, raças e mascote por raça (`breedImages`), protocolos de vacina (`vaccines`), produtos, categorias, dicas, serviços/unidades da agenda, dados de demonstração. Expõe `window.CP`.
- `cuidapet/assets/js/auth.js` — `window.CPAuth` (login Google/local/demonstração) e `window.CPStore` (salva o estado do tutor no Firestore em `users/{uid}` como JSON, ou no localStorage).
- `cuidapet/assets/js/app.js` — toda a interface. Roteamento por hash (`#/home`, `#/pet/:id`, `#/vacina/:key`, `#/loja`, `#/agendar` …). Cada tela é uma função `V.nome()` que devolve `{ html, cls, after }`. Ações de clique usam `data-act` → objeto `A`; formulários usam `data-form` → objeto `F`; navegação usa `data-go`, `data-tab`, `data-back`, `data-replace`.
- `cuidapet/assets/css/base.css` — tokens de cor, reset e componentes comuns. `app.css` — layout e telas; a versão web fica em `@media (min-width: 900px)`.
- `cuidapet/assets/img/` — fundo `hero.jpg`, mascotes por espécie e `breeds/` (mascotes por raça, PNG com transparência).
- `cuidapet/manifest.webmanifest`, `cuidapet/sw.js`, `cuidapet/assets/icons/` — PWA. Ao mudar arquivos estáticos, aumente a versão `CACHE` no `sw.js`.
- `firebase.json`, `firestore.rules` — hospedagem no Firebase Hosting e regras (cada usuário só acessa o próprio documento).

## Regras de negócio importantes
- Fluxo: sem login → tela de entrada; logado sem perfil completo → `#/bemvindo` (perfil do tutor); depois cadastro de pets. Guardas no `render()` de `app.js`.
- Situação das vacinas é **calculada** em `vInfo(p, v)` a partir da data de nascimento e das datas em `pet.records[key].applied` (não há campo `next` salvo). Estados: `ok` (Em dia), `soon` (Em breve, ≤30 dias), `late` (Atrasada), `miss` (Não tomou, obrigatória/essencial), `todo` (Não tomou, recomendada/opcional), `wait` (Aguardando idade).
- Mascote do pet: `petImg(p)` → foto do tutor, senão `CP.breedImg(especie, raça)`, senão mascote da espécie.
- Textos da interface em português do Brasil.

## Rodar localmente
Qualquer servidor estático apontando para `cuidapet/`:
- `npx serve cuidapet` (Node), ou
- `python -m http.server 5180 -d cuidapet`, ou
- no Windows sem Node/Python: `powershell -ExecutionPolicy Bypass -File tools/serve.ps1` e abrir http://localhost:5180

Conta de demonstração disponível na tela de entrada ("Explorar com uma conta de demonstração").

## Pendências conhecidas
- Pagamento real (gateway) não integrado; checkout só registra o pedido.
- Catálogo, horários e unidades fixos em `data.js` (sem painel administrativo).
- Protocolos de vacina precisam de revisão veterinária.
- Publicação nas lojas (Capacitor) e notificações push não feitas.
