# CuidaPet

Um só sistema que funciona como **site no computador** (menu lateral) e como **app no celular** (abas embaixo, instalável na tela inicial). O tutor entra com a conta Google, cria o próprio perfil e, dentro dele, cadastra quantos pets quiser.

## Fluxo

1. **Entrar com Google** (ou conta de demonstração).
2. **Perfil do tutor**: nome, celular, CEP, cidade, endereço e aceite dos termos.
3. **Pets do tutor**: cada um com espécie (12 opções), raça, sexo, nascimento, peso, castração, microchip e foto.
4. Cada pet tem **perfil próprio** com: carteira de saúde (vacinas, exames e consultas da espécie), cuidados e dicas, produtos da espécie (ração, petiscos, brinquedos, acessórios) e dados.

### Carteira de vacinação

Cada espécie tem seu protocolo em `assets/js/data.js` (`vaccines`): idade mínima da 1ª dose, número de doses do esquema inicial (filhote ou adulto), intervalo entre doses, reforço e classificação (**obrigatória**, **essencial**, **recomendada**, **opcional**). Com a data de nascimento e as aplicações registradas, o app calcula a situação de cada item:

- **Em dia**: a próxima dose está a mais de 30 dias.
- **Em breve**: vence em até 30 dias.
- **Atrasada**: a data da próxima dose já passou.
- **Não tomou**: o pet já tem idade e nunca recebeu (em laranja se for obrigatória/essencial; em cinza se for recomendada/opcional).
- **Aguardando idade**: o pet ainda é novo demais; mostra a partir de quando pode tomar.

Os protocolos seguem referências gerais (WSAVA e práticas no Brasil) e devem ser revisados por um veterinário antes do lançamento.

### Mascote por raça

O mascote do pet muda conforme a raça escolhida: 8 raças de cão, 7 de gato, 5 aves, pogona, gecko, betta e corn snake (`assets/img/breeds/`). As outras raças usam o mascote da espécie. Para adicionar uma raça, coloque o PNG na pasta e registre em `breedImages` no `data.js`.

Além disso: lembretes, notificações de todos os pets, agenda de consultas (serviço, unidade, data e horário), loja com carrinho, cupom `CUIDA10`, frete por CEP, checkout com endereço, entrega e pagamento, pedidos, favoritos, endereços, formas de pagamento, configurações e ajuda.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | O sistema (site + app) |
| `assets/js/config.js` | **Credenciais do Firebase** (preencher para ativar o login com Google) |
| `assets/js/auth.js` | Login (Google/Firebase ou local) e gravação dos dados por usuário |
| `assets/js/app.js` | Telas, navegação e regras |
| `assets/js/data.js` | Espécies, carteiras de saúde, produtos, dicas, serviços e unidades |
| `manifest.webmanifest`, `sw.js`, `assets/icons/` | App instalável (PWA) e funcionamento offline |
| `../firebase.json`, `../firestore.rules` | Publicação no Firebase Hosting e regras de segurança do banco |

## Ativar o login com Google (Firebase)

1. Crie um projeto em https://console.firebase.google.com (plano gratuito serve).
2. **Authentication › Método de login › Google › Ativar.**
3. **Firestore Database › Criar banco de dados** (modo produção).
4. **Configurações do projeto › Seus apps › Web (`</>`)**: registre o app e copie o objeto `firebaseConfig`.
5. Cole o objeto em `assets/js/config.js`, no lugar de `null`.
6. Em **Authentication › Configurações › Domínios autorizados**, adicione o domínio onde o site vai ficar (o `localhost` já vem liberado).

Sem esses passos o sistema roda em **modo local**: as contas e os dados ficam só no navegador onde foram criados.

## Publicar

Com o [Firebase CLI](https://firebase.google.com/docs/cli) instalado, na pasta acima de `cuidapet`:

```
firebase login
firebase use --add
firebase deploy
```

Isso publica o site e as regras do banco (cada tutor só acessa os próprios dados). No celular, basta abrir o endereço e tocar em **Adicionar à tela inicial**.

## Ainda não incluído

- **Pagamento real**: o checkout registra o pedido, mas não cobra. Para cobrar é preciso integrar um gateway (Mercado Pago, Stripe, Pagar.me).
- **Catálogo e agenda administráveis**: produtos, horários e unidades estão em `data.js`. Uma área administrativa para a clínica e a loja seria o próximo passo.
- **Publicação nas lojas Google Play / App Store**: o app já é instalável pelo navegador; para as lojas, dá para empacotar este mesmo código com Capacitor.
- **Notificações push** fora do app.
