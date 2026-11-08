# CuidaPet

Protótipo de portfólio para tutores de animais. O site funciona no computador e pode ser instalado como PWA no celular. Não exige login nem banco de dados: os dados de demonstração e as alterações do visitante ficam no navegador.

## Funcionalidades

- Cadastro local de pets, lembretes, consultas e agenda demonstrativa.
- Carteira de saúde calculada a partir da espécie, idade e registros do pet.
- Loja demonstrativa com produtos organizados por espécie.
- Mascotes próprios para 23 espécies, com cerca de 15 raças, tipos ou variedades por espécie.
- Cada variedade usa um retrato 3D personalizado em versão masculina, com óculos e coleira azuis, e feminina, com acessórios rosas.

As espécies disponíveis são cachorro, gato, coelho, hamster, rato/gerbil, chinchila, porquinho-da-índia, furão, pássaro, galinha, pato/ganso, jabuti, tartaruga aquática, cobra, lagarto/iguana, anfíbio, aranha, peixe, cavalo, porco, cabra, ovelha e bovino. Algumas opções representam variedades, padrões ou tipos de animal, em vez de raças formais.

## Tecnologias

- HTML, CSS e JavaScript sem framework e sem etapa de build.
- Google Fonts: Fredoka e Plus Jakarta Sans.
- PWA com manifesto e service worker.

## Executar localmente no Windows

Inicie o servidor estático:

```powershell
powershell -ExecutionPolicy Bypass -File tools/serve.ps1
```

Abra `http://localhost:5180` no navegador.

## Estrutura

- `cuidapet/index.html`: casca e pontos de entrada da interface.
- `cuidapet/assets/js/data.js`: espécies, raças, imagens, produtos e dados de demonstração.
- `cuidapet/assets/js/store.js`: estado local salvo em `localStorage`.
- `cuidapet/assets/js/app.js`: telas, navegação e interações.
- `cuidapet/assets/data/vacinas.json`: calendário de saúde por espécie.
- `cuidapet/assets/img/breeds/`: retratos masculinos e femininos por raça/variedade.
- `cuidapet/assets/css/`: estilos compartilhados e layout do app.
- `tools/split-breed-sheet.ps1`: recorta pranchas de mascotes em PNGs individuais e remove o fundo magenta.
- `tools/rosa.ps1`: gera as versões femininas rosas a partir dos acessórios azuis.
- `tools/serve.ps1`: servidor estático local.

## Adicionar uma raça ou variedade

1. Adicione o nome à lista da espécie em `cuidapet/assets/js/data.js` e à seleção apresentada no cadastro.
2. Gere um retrato masculino consistente com os mascotes existentes, em uma prancha 5×3 com fundo magenta sólido.
3. Recorte a prancha e gere o par feminino:

```powershell
powershell -ExecutionPolicy Bypass -File tools/split-breed-sheet.ps1 -Source caminho/para/prancha.png -Names @('id-da-imagem-1', 'id-da-imagem-2')
```

4. Associe o rótulo da raça ao nome do PNG em `breedImages` dentro de `data.js`.
5. Ao alterar arquivos estáticos, aumente a versão `CACHE` em `cuidapet/sw.js`.

Os calendários de saúde são conteúdo de demonstração e precisam de revisão veterinária antes de qualquer uso real. Pagamentos, parceiros e agendamentos também são simulados.
