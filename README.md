# CuidaPet

Protótipo de portfólio para tutores de pets, com site para computador e aplicativo instalável (PWA) no celular. O visitante entra diretamente no perfil de demonstração “Olá, Tutor”; não há login nem banco de dados. As alterações ficam salvas apenas no navegador, em `localStorage`.

## Funcionalidades

- Cadastro e gerenciamento local de vários pets por tutor.
- Carteira de vacinação calculada conforme espécie, idade e registros de doses do pet.
- Lembretes e agenda demonstrativa de consultas.
- Loja demonstrativa com produtos organizados por espécie.
- Mascotes por espécie e raça, tipo ou variedade, com acessórios azuis para machos e rosas para fêmeas.
- Interface em português do Brasil, adaptada para computador e celular.

O catálogo inclui cães, gatos e outras espécies. Algumas opções são variedades, padrões ou tipos de animal, e não raças formais. O calendário de saúde é conteúdo demonstrativo e precisa de revisão veterinária antes de qualquer uso real. Pagamentos, parceiros e agendamentos são simulados.

## Tecnologias

- HTML, CSS e JavaScript puros, sem framework ou etapa de build.
- Google Fonts: Fredoka e Plus Jakarta Sans.
- PWA com manifesto e service worker.

## Executar localmente no Windows

Na raiz do repositório, inicie o servidor estático:

```powershell
powershell -ExecutionPolicy Bypass -File tools/serve.ps1
```

Abra `http://localhost:5180` no navegador.

## Estrutura

- `cuidapet/index.html`: estrutura da aplicação, navegação, telas e componentes globais.
- `cuidapet/assets/js/data.js`: espécies, raças, mascotes, produtos e dados de demonstração.
- `cuidapet/assets/js/store.js`: estado local do visitante em `localStorage`.
- `cuidapet/assets/js/app.js`: telas, navegação e interações.
- `cuidapet/assets/data/vacinas.json`: calendário de saúde por espécie.
- `cuidapet/assets/img/`: mascotes por espécie e imagens de raças/variedades.
- `cuidapet/assets/css/`: estilos compartilhados, componentes e layout responsivo.
- `cuidapet/manifest.webmanifest` e `cuidapet/sw.js`: configuração da PWA e cache offline.
- `tools/serve.ps1`: servidor estático local para Windows.
- `tools/chroma.ps1` e `tools/rosa.ps1`: preparação dos mascotes e geração das versões femininas.

## Adicionar uma raça ou variedade

1. Inclua o nome na espécie correspondente em `cuidapet/assets/js/data.js` e na seleção do cadastro.
2. Adicione o retrato masculino em `cuidapet/assets/img/` e associe o rótulo ao arquivo em `breedImages`.
3. Gere a versão feminina com `tools/rosa.ps1`.
4. Ao alterar arquivos estáticos, aumente a versão de `CACHE` em `cuidapet/sw.js`.

As vacinas são definidas em `cuidapet/assets/data/vacinas.json`; as datas e situações exibidas são calculadas a partir do nascimento e dos registros do pet.
