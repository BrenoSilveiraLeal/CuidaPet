# CuidaPet — guia para agentes de código

Protótipo de portfólio (site no computador + app instalável/PWA no celular) para tutores de pets: vários pets por tutor, carteira de vacinação automática por espécie, lembretes, agenda de consultas e loja. **Sem login e sem banco de dados**: abre direto no perfil base ("Olá, Tutor") e o visitante só altera a cópia salva no próprio navegador.

## Stack
- HTML, CSS e JavaScript puros. **Sem framework e sem build.** Não introduzir dependências de npm sem necessidade.
- Fontes: Fredoka (logo/títulos) e Plus Jakarta Sans (texto), via Google Fonts.

## Estrutura
- `cuidapet/index.html` — casca da aplicação (menu lateral, barra superior, área de telas, abas inferiores, modal e toast).
- `cuidapet/assets/data/vacinas.json` — base do calendário de saúde por espécie (cães e gatos: lista WSAVA 2024). Campos: `ages` (semanas de cada dose do filhote), `adultDoses`/`gap`, `interval` (dias até o reforço; `null` = dose única), `level`, `onlySex`, `onlyBreeds`.
- `cuidapet/assets/js/data.js` — espécies e raças, mascotes (`breedImages`, `breedImg(sp, raça, sexo)`), carregador `loadVaccines()` (URL em `VACCINE_DB`), produtos, categorias, dicas, serviços/unidades da agenda e dados de exemplo. Expõe `window.CP`.
- `cuidapet/assets/js/store.js` — `window.CPStore`: estado do visitante no `localStorage` (`cuidapet-demo`).
- `cuidapet/assets/js/app.js` — toda a interface. Roteamento por hash (`#/home`, `#/pet/:id`, `#/vacina/:key`, `#/loja`, `#/agendar` …). Cada tela é uma função `V.nome()` que devolve `{ html, cls, after }`. Ações de clique usam `data-act` → objeto `A`; formulários usam `data-form` → objeto `F`; navegação usa `data-go`, `data-tab`, `data-back`, `data-replace`.
- `cuidapet/assets/css/base.css` — tokens, reset e componentes comuns. `app.css` — layout e telas; a versão web fica em `@media (min-width: 900px)`.
- `cuidapet/assets/img/` — mascotes por espécie e `breeds/` (por raça). Cada PNG tem a versão fêmea `*-f.png`.
- `tools/chroma.ps1` — tira o fundo verde/magenta de mascotes novos (gerados no Figma, arquivo "CuidaPet – Mascotes") colocados em `tools/mascotes-brutos/` e salva o PNG 800×800 em `cuidapet/assets/img/`.
- `tools/rosa.ps1` — gera os `*-f.png` (troca o azul dos óculos e da coleira por rosa). Rode de novo ao adicionar mascotes.
- `tools/serve.ps1` — servidor estático para Windows (http://localhost:5180).
- `cuidapet/manifest.webmanifest`, `cuidapet/sw.js` — PWA. Ao mudar arquivos estáticos, aumente a versão `CACHE` no `sw.js`.

## Regras de negócio importantes
- Situação de cada item é **calculada** em `vInfo(p, v)` a partir do nascimento, da base de vacinas e das datas em `pet.records[key].applied`: monta `plan` (dose a dose) e o estado `ok` (Em dia/Completa), `soon` (≤30 dias), `late` (Atrasada), `miss` (Não tomou, essencial/obrigatória), `todo` (não essencial sem registro) e `wait` (Aguardando idade).
- Esquema de filhote vale se a 1ª dose foi (ou ainda pode ser) dada até 2 semanas depois da última idade de `ages`; senão usa o esquema de adulto.
- Mascote do pet: foto do tutor, senão `CP.breedImg(espécie, raça, sexo)`. Macho = acessórios azuis, fêmea = rosa.
- Textos da interface em português do Brasil. Logo: "CuidaPet".

## Pendências conhecidas
- Pagamento, parceiros (pet shops/clínicas) e agenda são simulados.
- Calendários precisam de revisão veterinária antes de uso real.
