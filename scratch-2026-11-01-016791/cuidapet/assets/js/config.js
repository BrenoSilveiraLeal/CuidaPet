/**
 * Configuração do Firebase (login com Google + banco de dados na nuvem).
 *
 * Como ativar:
 * 1. Crie um projeto em https://console.firebase.google.com
 * 2. Authentication > Método de login > ative "Google"
 * 3. Firestore Database > Criar banco de dados
 * 4. Configurações do projeto > Seus apps > Web (</>) > copie o objeto firebaseConfig
 * 5. Cole abaixo, no lugar de null.
 *
 * Enquanto estiver null, o app roda em modo local: as contas e os dados ficam só neste navegador.
 */
window.CUIDAPET_FIREBASE = null;

/* Exemplo do formato:
window.CUIDAPET_FIREBASE = {
  apiKey: 'AIza...',
  authDomain: 'seu-projeto.firebaseapp.com',
  projectId: 'seu-projeto',
  storageBucket: 'seu-projeto.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000',
};
*/
