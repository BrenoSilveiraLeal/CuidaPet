# CuidaPet

Protótipo de portfólio para tutores de pets, com site responsivo e aplicativo instalável (PWA). Abre diretamente no perfil de demonstração “Olá, Tutor”, sem login ou banco de dados. As alterações ficam salvas no `localStorage` do navegador.

## Funcionalidades

- Cadastro local de vários pets e carteira de saúde calculada por espécie, idade e registros.
- Lembretes, agenda demonstrativa de consultas e loja simulada.
- Mascotes por espécie e raça ou variedade.
- Interface em português do Brasil para computador e celular.

O calendário de saúde é demonstrativo e precisa de revisão veterinária antes de qualquer uso real. Pagamentos, parceiros e agendamentos são simulados.

## Executar localmente no Windows

Na raiz do repositório, inicie o servidor:

```powershell
powershell -ExecutionPolicy Bypass -File tools/serve.ps1
```

Abra <http://localhost:5180> no navegador.

## Estrutura

- `index.html`: estrutura da aplicação, navegação, telas e componentes globais.
- `assets/js/data.js`: espécies, raças, mascotes, produtos e dados demonstrativos.
- `assets/js/store.js`: estado local do visitante em `localStorage`.
- `assets/js/app.js`: telas, navegação e interações.
- `assets/data/vacinas.json`: calendário de saúde por espécie.
- `assets/img/`: mascotes, imagens de raças/variedades e produtos.
- `assets/css/`: estilos comuns, componentes e layout responsivo.
- `manifest.webmanifest` e `sw.js`: configuração da PWA e cache offline.
- `tools/serve.ps1`: servidor estático local para Windows.
- `tools/chroma.ps1` e `tools/rosa.ps1`: preparação e variações dos mascotes.

## Adicionar uma raça ou variedade

1. Inclua o nome na espécie correspondente em `assets/js/data.js`.
2. Adicione a imagem masculina em `assets/img/` e associe o nome em `breedImages`.
3. Gere a versão feminina com `tools/rosa.ps1`.
4. Ao alterar arquivos estáticos, aumente a versão de `CACHE` em `sw.js`.
