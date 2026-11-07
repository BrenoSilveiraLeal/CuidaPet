# QA e refinamento CuidaPet — 07/11/2026

## Ambiente e método

- Aplicação local: `http://localhost:5180` (servidor documentado do projeto).
- Navegador: Playwright CLI, executado por `npx --yes @playwright/cli`; inspeção de páginas, interações, console, requests e screenshots.
- Revisão visual: 26 rotas em viewport móvel; home, loja, carteira e perfil em desktop; matriz automatizada para cada rota e resolução listada abaixo.
- Revisão de código: HTML/CSS/JS nativos do projeto; `node --check` em `app.js` e `data.js`.
- PWA: cache atualizado para `cuidapet-v34` para incluir os novos arquivos de mascote.
- A skill exata “Ultimate Website Design” não está instalada. Para a direção visual e movimento foi usada a skill Impeccable, mantendo o desenho já estabelecido pelo CuidaPet.

## Atualização posterior — catálogo de raças

- O cadastro foi reduzido para até cinco opções por espécie (quatro raças/tipos representativos e “Outra”, quando cabível): 112 opções em 23 espécies. “Outra” não exige ilustração exclusiva.
- O formulário de edição mantém selecionável a raça antiga de pets já salvos, mesmo quando ela saiu da lista de novos cadastros.
- Reteste com Playwright CLI em `/cadastro`: opções carregadas corretamente para cachorro, gato, galinha, cavalo e bovino; 5 opções em cada espécie. `/editar/thor` manteve “Corgi” como opção selecionada apesar da redução.
- Console do navegador: nenhum erro observado durante esse reteste. Evidências: `breed-form-375x812.png` e `breed-form-1366x768.png`.
- O catálogo reduzido ainda tem raças sem arte individual. A fila `image-generation-queue.csv` foi atualizada à medida que novos pares são gerados pelo ChatGPT no estilo dos mascotes do CuidaPet.
- A geração é feita pelo ChatGPT e as imagens finais são integradas diretamente em `cuidapet/assets/img/breeds/`.

## Atualização posterior — transições dos seletores

### QA-07 — rótulos piscavam durante a troca de abas (gravidade média)

- **Local:** abas da carteira, perfil do pet, lembretes e agenda; seletores de sexo e antecedência dos lembretes.
- **Causa provável:** `document.startViewTransition()` capturava a tela inteira antes/depois do rerender e fazia a palavra selecionada cruzar capturas com cores/fundos diferentes.
- **Correção:** removida a transição de página dessas trocas. O indicador deslizante agora usa transformação horizontal própria em todos os controles segmentados; o rótulo ativo conserva texto branco com contorno azul durante o movimento. A preferência `prefers-reduced-motion` desativa o movimento.
- **Reteste:** Playwright CLI trocou opções nos seis controles e confirmou que, a 100 ms, todos continuavam em movimento, com o rótulo presente, branco e contornado. Com movimento reduzido, o seletor aplicou a mudança sem animação (`transition-duration: 0s`). Console sem erros.
- **Evidências:** `transition-vaccine-375x812.png` e `transition-sex-1366x768.png` registram o estado durante a transição.

### QA-08 — confirmação de compra permitia interação com o fundo (gravidade média)

- **Local:** modal “Adicionado!” na tela de detalhes do produto.
- **Causa provável:** ao fechar, as classes que interceptavam ponteiro eram removidas antes da animação de saída; tocar no backdrop também dispensava a confirmação.
- **Correção:** o backdrop continua interceptando cliques durante a saída, e a área principal/menu ficam `inert` enquanto o modal abre, permanece aberto ou fecha. A confirmação de compra não fecha ao clicar fora; apenas “Ver carrinho” e “Continuar comprando” encerram o modal.
- **Reteste:** Playwright CLI clicou em um botão de produto atrás do modal aberto e durante a saída: o modal/lock permaneceram ativos e o carrinho não mudou. Após a animação, o backdrop voltou a `pointer-events: none`, a área principal deixou de ser `inert` e `aria-hidden` passou a `true`. Console sem erros; carrinho de teste restaurado.
- **Evidências:** capturas de entrada/saída em `cart-confirmation-open-1366x768.png`, `cart-confirmation-closing-1366x768.png`, `cart-confirmation-open-375x812.png` e `cart-confirmation-closing-375x812.png`.

### QA-09 — seleções e expansões sem resposta de movimento (gravidade baixa)

- **Local:** seleção de espécie, sexo, tamanho de produto, serviço/agendamento, pagamento/entrega; perguntas expansíveis da central de ajuda.
- **Correção:** opções selecionadas recebem um pulso curto com brilho azul; estados pressionados e seleções em cartões recebem transições de cor/escala; respostas da FAQ abrem e fecham com expansão suave e rotação do ícone. `prefers-reduced-motion` remove as animações.
- **Reteste:** no Playwright CLI, as escolhas de espécie, tamanho e serviço iniciaram animação (`getAnimations().length = 1`); FAQ passou de altura 0 para expandida e fechou suavemente. Com movimento reduzido, a seleção teve 0 animações e duração de transição 0s. Console sem erros.
- **Evidências:** `selection-pulse-1366x768.png` e `faq-expansion-375x812.png`.

## Inventário e cobertura de navegador

Rotas carregadas e capturadas: `home`, `cadastro`, `editar-pet`, `pet`, `vacinas`, `vacina-item`, `lembretes`, `agenda`, `agendar`, `notificacoes`, `loja`, `categoria`, `produto`, `carrinho`, `checkout`, `parceiros`, `mais`, `pets`, `pedidos`, `favoritos`, `dicas`, `perfil`, `enderecos`, `pagamentos`, `config` e `ajuda`.

Cada rota tem screenshot full-page nos tamanhos 375×812, 430×932, 768×1024, 1366×768, 1536×864, 1920×1080 e 3840×2160. São **182 combinações**. Os arquivos ficam em `routes/<rota>-<largura>x<altura>.jpg` nesta pasta. Exemplo: `routes/loja-375x812.jpg`.

| Verificação | Resultado | Evidência |
|---|---|---|
| Rotas × resoluções | 182/182 capturadas | Pasta `routes/` |
| Overflow horizontal | 0/182 | Matriz Playwright `routes/full-route-matrix.js` |
| Imagens quebradas observadas | 0/182 | A mesma matriz + checagem visual |
| Erros de console | 0 | `playwright-cli console error` |
| Base de vacinas | HTTP 200 nas navegações testadas | `playwright-cli requests` |
| Navegação de categorias | Loja → Petiscos abre `#/categoria/petiscos` com 2 produtos | `segment-and-category-checks.js` |
| Transição de abas | Carteira, lembretes e agenda atualizam a aba e deslizam o indicador | `interaction-checks.js`, `segment-and-category-checks.js` |
| Redução de movimento | Ao emular `prefers-reduced-motion: reduce`, não iniciou nova View Transition | `interaction-checks.js` |
| Cadastro do registro | RGA de teste persistiu no pet de teste; o valor original do navegador foi restaurado após o teste | `interaction-checks.js` |
| Mascotes de galinha e pássaro | URLs distintas e imagens decodificadas no navegador | `interaction-checks.js` |

O registro adicional é testado como valor opcional do protótipo: não há validação oficial de CPF/RGA nem consulta a cadastro externo.

## Alterações e retestes

### QA-01 — Categorias da loja desalinhadas

- **Gravidade:** média.
- **Local:** `#/loja`, grupo Rações/Petiscos/Higiene/Saúde/Brinquedos.
- **Causa provável:** grade com margens especiais só no primeiro e último item.
- **Correção:** categorias agora formam uma linha flexível centralizada, com quebra centralizada em larguras menores.
- **Reteste:** a 375×812 os cinco itens ficam lado a lado; erro de centro medido em 0 px; clicar em Petiscos abre a categoria correta. Sem overflow.
- **Evidência:** `shop-categories-375x812.png`, `routes/loja-375x812.jpg`, `segment-and-category-checks.js`.

### QA-02 — Troca de abas sem continuidade visual

- **Gravidade:** média.
- **Local:** Carteira, perfil do pet, lembretes e agenda.
- **Causa provável:** renderização substituía o conteúdo sem preservar a posição do indicador ativo.
- **Correção:** indicador azul compartilhado com View Transitions nas abas correspondentes; respeita redução de movimento. Incluídos estados `aria-selected` e nomes acessíveis nos grupos.
- **Reteste:** ao abrir Histórico na carteira, o indicador percorreu 166,5 px; nas abas de lembretes e agenda também mudou de posição. Sob `prefers-reduced-motion`, a chamada de transição não se repetiu. Console sem erros.
- **Evidência:** `vaccines-history-375x812.png`, `pet-data-375x812.png`, `interaction-checks.js`, `segment-and-category-checks.js`.

### QA-03 — Galinha macho e pássaro exibiam o mascote inadequado

- **Gravidade:** alta.
- **Local:** cadastro, avatar do pet e seleção de espécie.
- **Causa provável:** a galinha usava o mesmo arquivo independentemente do sexo; o mascote base de pássaro era um pintinho.
- **Correção:** foram adicionados assets CuidaPet distintos de galo e galinha, com acessórios azul/rosa, e um canário adulto como mascote base de pássaro. A regra `breedImg` usa esses caminhos por sexo/espécie. Os novos assets de pássaro foram incluídos no cache PWA.
- **Reteste:** no formulário real, Macho carregou `assets/img/galo.png` e Fêmea carregou `assets/img/galinha-f.png`; ambos decodificaram com largura natural de 1254 px. O canário carregou `assets/img/breeds/bird-canario.png`.
- **Evidência:** `registration-rooster-375x812.png`, `interaction-checks.js`.

### QA-04 — Faltava campo para CPF/registro do pet

- **Gravidade:** média.
- **Local:** cadastro/edição e aba Dados do perfil.
- **Causa provável:** o modelo tinha só o campo `chip` para microchip.
- **Correção:** campo opcional `registration` (“CPF / registro do pet”), distinto do microchip; valor persistido no `localStorage` e exibido na ficha. Compatível com perfis antigos sem esse campo.
- **Reteste:** o formulário salvou `RGA-TESTE-001` no pet de teste, e a tela Dados expôs o novo campo. O estado inicial do navegador foi restaurado após a verificação.
- **Evidência:** `pet-data-375x812.png`, `interaction-checks.js`.

### QA-05 — Imagens personalizadas por raça

- **Gravidade:** alta.
- **Local:** todas as opções de raça/tipo no cadastro.
- **Causa provável:** `breedImages` cobre apenas parte do catálogo e as demais opções recaem na imagem geral da espécie.
- **Correção:** mascotes próprios foram gerados e ligados às opções de raça/tipo, incluindo novas artes de coelho, gato, cão, roedores, aves, répteis, anfíbios, aranhas, peixes e animais de fazenda. As 23 opções “Outra” seguem como opção genérica do formulário.
- **Reteste completo:** o Playwright percorreu as 89 raças/tipos definidos × dois sexos. As 178 imagens decodificaram no navegador, sem falhas e sem caminhos repetidos. A folha de contato completa foi capturada para revisão visual.
- **Resultado:** aprovado para todas as raças/tipos definidos. O catálogo tem 112 opções incluindo 23 “Outra”; estas não representam raças específicas.
- **Lista de cobertura:** `breed-image-coverage.csv` enumera as 224 combinações opção × sexo. `image-generation-queue.csv` está vazia após a geração de todas as opções específicas.

## Diferenças macho/fêmea

- **Diferenças visuais conferidas:** galo/galinha, touro/vaca, bode/cabra e carneiro/ovelha têm artes próprias para cada sexo. As demais opções também possuem arquivos individuais para cada sexo, com acessórios azuis e rosas.

## Limitações e fluxos não executados

- Não foi feito pedido real, pagamento, exclusão nem envio de formulário para serviço externo. Checkout e pagamentos continuam sendo simulações, conforme a documentação do projeto.
- Upload de fotografia do usuário não foi exercitado.
- A cobertura de interação foi direcionada às mudanças e não representa um teste exaustivo de cada botão/estado de cada rota.
- O Playwright CLI conferiu largura de documento e screenshots; não foi executada uma auditoria externa completa de WCAG/performance.

## Resultado geral

**Concluído — o catálogo tem imagens distintas para as 89 raças/tipos definidos e ambos os sexos. As 178 imagens foram carregadas e verificadas no Playwright; a fila está vazia.

### QA-09 — filtros da categoria recarregavam a tela inteira

- **Gravidade:** média.
- **Local:** `#/categoria/:categoria` e chips de filtro por espécie/porte.
- **Causa provável:** cada alteração de hash chamava o renderizador geral, substituindo o cabeçalho, o botão voltar, o carrinho e a faixa de filtros.
- **Correção:** a troca entre filtros da loja atualiza o título, o chip ativo e os resultados no lugar. O cabeçalho e os controles persistem no DOM; a lista de resultados anuncia mudanças com `aria-live` e recebe uma entrada sutil que respeita `prefers-reduced-motion`. A posição horizontal dos filtros é preservada.
- **Reteste real no Playwright CLI:** em 1366×768 e 375×812, “Cães adultos” atualizou a rota para `#/categoria/racoes/Adultos`, manteve o título “Rações”, marcou o chip correto, exibiu 1 produto e preservou os mesmos nós de cabeçalho, botão, filtros e lista. A transição dos resultados estava ativa. A troca para Petiscos atualizou o título, marcou “Todos”, exibiu 2 produtos e preservou o cabeçalho.
- **Console:** 0 erros, 0 avisos.
- **Evidências:** `category-filter-adultos-1366x768.png`, `category-filter-adultos-375x812.png`.

### Atualização — mascotes de raças gerados pelo ChatGPT

- Gerados pelo próprio ChatGPT mascotes personalizados para as raças/tipos priorizados, com imagens de macho e fêmea distintas. Os animais com dimorfismo visível, como aves e animais de fazenda, receberam anatomia própria por sexo.
- As imagens foram integradas em `cuidapet/assets/img/breeds/` como PNG 800×800 e ligadas ao seletor. “Vira-lata caramelo” deixou de reutilizar a imagem SRD; gato SRD agora tem arquivos próprios. O pônei Shetland, gerado durante a preparação, não faz parte do catálogo ativo e não foi mapeado.
- `tools/rosa.ps1` agora aceita `-Only <nome>` para gerar uma versão feminina isolada sem reprocessar todos os mascotes.
- Todas as entradas específicas foram removidas de `image-generation-queue.csv`; restam apenas as opções genéricas “Outra”, fora da geração de raças.
- Reteste completo no navegador via Playwright CLI: 178/178 arquivos carregaram e decodificaram; há 178 caminhos distintos, sem erros de console. Ver `full-breed-image-audit.cjs` e `full-breed-contact-sheet.png`.
