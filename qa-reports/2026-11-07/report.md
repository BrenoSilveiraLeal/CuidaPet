# QA e refinamento CuidaPet — 07/11/2026

## Ambiente e método

- Aplicação local: `http://localhost:5180` (servidor documentado do projeto).
- Navegador: Playwright CLI, executado por `npx --yes @playwright/cli`; inspeção de páginas, interações, console, requests e screenshots.
- Revisão visual: 26 rotas em viewport móvel; home, loja, carteira e perfil em desktop; matriz automatizada para cada rota e resolução listada abaixo.
- Revisão de código: HTML/CSS/JS nativos do projeto; `node --check` em `app.js` e `data.js`.
- PWA: cache atualizado para `cuidapet-v34` para incluir os novos arquivos de mascote.
- A skill exata “Ultimate Website Design” não está instalada. Para a direção visual e movimento foi usada a skill Impeccable, mantendo o desenho já estabelecido pelo CuidaPet.

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

### QA-05 — Imagens personalizadas por raça incompletas (pendência)

- **Gravidade:** alta.
- **Local:** todas as opções de raça/tipo no cadastro.
- **Causa provável:** `breedImages` cobre apenas parte do catálogo e as demais opções recaem na imagem geral da espécie.
- **Correção nesta rodada:** mascotes específicos adicionados para galo/galinha e canário, sem mascarar a cobertura restante.
- **Reteste/medição:** no navegador, o catálogo contém 314 opções de raça/tipo; 31 têm mapeamento nominal e essas referências usam 25 assets distintos. **283 opções ainda não têm mapeamento de imagem próprio.** A imagem feminina é gerada por arquivo `-f.png` onde existe, mas isso não transforma uma imagem de espécie compartilhada numa imagem própria da raça.
- **Resultado:** esta exigência permanece incompleta. As capturas permitem revisar os fluxos, mas não aprovam como “personalizadas” as raças que ainda usam fallback.
- **Lista acionável:** `breed-image-coverage.csv` enumera as 628 combinações raça/tipo × sexo; 566 ainda precisam de arte dedicada por raça/sexo.

## Diferenças macho/fêmea ainda incompletas

- **Corrigido:** galinha → galo/galinha; pássaro padrão → canário adulto.
- **Já havia arquivos separados no código:** boi/vaca e bode/cabra.
- **Ainda requer arte própria:** cavalo/égua continuam com o mesmo corpo e acessórios por cor; ovelha continua sem carneiro adulto com chifres; outras espécies/raças com dimorfismo também não foram individualizadas. Não marquei esses casos como corrigidos.

## Limitações e fluxos não executados

- Não foi feito pedido real, pagamento, exclusão nem envio de formulário para serviço externo. Checkout e pagamentos continuam sendo simulações, conforme a documentação do projeto.
- Upload de fotografia do usuário não foi exercitado.
- A cobertura de interação foi direcionada às mudanças e não representa um teste exaustivo de cada botão/estado de cada rota.
- O Playwright CLI conferiu largura de documento e screenshots; não foi executada uma auditoria externa completa de WCAG/performance.

## Resultado geral

**Parcial — correções verificadas no navegador, com pendência de arte significativa.** A interface, transições, registro do pet e os mascotes de galinha/pássaro foram retestados. O requisito de imagens próprias para todas as raças e alguns dimorfismos permanece aberto, portanto o catálogo visual não deve ser considerado aprovado.
