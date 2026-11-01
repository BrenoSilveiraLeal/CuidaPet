# CuidaPet

Protótipo de portfólio: um só sistema que funciona como **site no computador** (menu lateral) e como **app no celular** (abas embaixo, instalável na tela inicial), com carteira de vacinação, lembretes, agenda de consultas e loja para todos os pets do tutor.

## Sem login e sem banco de dados

Quem abre o site já entra no **perfil base** ("Olá, Tutor") com pets de exemplo. Não há cadastro, login nem servidor de dados: o que o visitante muda fica salvo só no `localStorage` do navegador dele. Em **Configurações** dá para **Restaurar perfil de exemplo** ou **Começar do zero** (sem pets) para testar o cadastro.

## Carteira de vacinação automática

O tutor não cadastra vacina por vacina. Ao adicionar um pet com espécie e data de nascimento, o app monta sozinho o calendário completo da espécie, dose a dose, a partir da base `assets/data/vacinas.json`:

- **Cães e gatos**: lista e calendário da **WSAVA (Diretrizes de vacinação 2024)** — vacinas essenciais, não essenciais e não recomendadas. Única adaptação: a antirrábica tem reforço anual por ser exigência legal no Brasil.
- **Equinos, bovinos, caprinos, ovinos**: programas do MAPA (AIE/Mormo para a GTA, brucelose, raiva dos herbívoros) e manejo usual.
- **Aves de criação e suínos**: referências da Embrapa Suínos e Aves.
- **Exóticos** (coelho, roedores, répteis, anfíbios, aranhas, peixes): check-ups e exames de rotina.

Cada item tem a idade de cada dose do filhote (`ages`, em semanas), o esquema de quem começa adulto (`adultDoses`/`gap`), o intervalo de reforço (`interval`) e o nível (obrigatória, essencial, recomendada, opcional, conforme região, não recomendada). Itens podem valer só para um sexo (`onlySex`, ex.: brucelose em fêmeas) ou raças (`onlyBreeds`).

Com o nascimento e as doses marcadas, cada dose aparece como **tomada**, **atrasada**, **em breve** (até 30 dias), **prevista** ou **aguardando idade**. O tutor só toca em **Marcar como tomada**.

O app carrega o JSON ao abrir, como faria com uma API: para usar um serviço externo no futuro, basta trocar `VACCINE_DB` em `assets/js/data.js`. Não existe hoje uma API pública com calendários veterinários; por isso a base foi montada a partir das diretrizes citadas. **Revise com um veterinário antes de qualquer uso real.**

## Espécies, raças e mascotes

23 espécies e mais de 300 raças/tipos (`species` em `assets/js/data.js`). O mascote muda conforme a raça e o **sexo**: machos usam óculos e coleira **azuis**, fêmeas o mesmo mascote com acessórios **rosa** (arquivos `*-f.png`, gerados por `tools/rosa.ps1`). Os mascotes das espécies novas foram gerados no Figma no mesmo estilo e tiveram o fundo removido com `tools/chroma.ps1`. Espécies sem vacina (roedores, répteis, peixes, anfíbios, aranhas) têm carteira de saúde com check-ups e exames, além de dicas e produtos.

## Loja e consultas

Cada pet tem a aba **Produtos** com itens da espécie (ração, petiscos, higiene, saúde, acessórios), carrinho, cupom `CUIDA10`, frete e checkout simulados. No perfil do pet e em cada vacina há **Agendar consulta / Agendar com veterinário**, que abre a agenda já preenchida — ponto de integração futuro com pet shops e clínicas parceiras.

## Rodar localmente

O site precisa ser aberto por um servidor (o navegador bloqueia a leitura do JSON direto do arquivo):

- `npx serve cuidapet`, ou
- `python -m http.server 5180 -d cuidapet`, ou
- no Windows sem Node/Python: `powershell -ExecutionPolicy Bypass -File tools/serve.ps1` e abrir http://localhost:5180

Qualquer hospedagem estática serve (GitHub Pages, Netlify, Vercel, Firebase Hosting).

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | O sistema (site + app) |
| `assets/data/vacinas.json` | Base de vacinas, exames e consultas por espécie |
| `assets/js/data.js` | Espécies, raças, mascotes, produtos, dicas, serviços e carregador da base de vacinas |
| `assets/js/store.js` | Salva o estado do visitante no `localStorage` |
| `assets/js/app.js` | Telas, navegação e cálculo do calendário |
| `manifest.webmanifest`, `sw.js`, `assets/icons/` | App instalável (PWA) e funcionamento offline |
