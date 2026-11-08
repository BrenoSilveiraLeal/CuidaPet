/**
 * CuidaPet — dados compartilhados entre o site e o app.
 * Espécies, carteira de saúde, catálogo da loja, dicas, ícones e ilustrações de produtos.
 * Defina window.CP_IMG_BASE antes de carregar este arquivo (ex.: '../assets/img/').
 */
(function () {
  const IMG = window.CP_IMG_BASE || 'assets/img/';
  const DAY = 864e5;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const iso = (offset) => {
    const d = new Date(today.getTime() + offset * DAY);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  /* ------------------------------------------------------------------ Grupos */
  const groups = [
    { id: 'caes-gatos', label: 'Cães e gatos', blurb: 'Vacinas obrigatórias, vermífugos, antipulgas e a ração certa para cada fase da vida.' },
    { id: 'pequenos', label: 'Pequenos mamíferos', blurb: 'Coelhos, roedores e furões: vacinas específicas, saúde dentária e feno de qualidade.' },
    { id: 'aves', label: 'Aves', blurb: 'Check-up anual com veterinário de aves, bouba e Newcastle para aves de criação.' },
    { id: 'repteis', label: 'Répteis', blurb: 'Jabutis, serpentes e lagartos: parasitológico, cálcio e o terrário ideal com luz UVB.' },
    { id: 'peixes', label: 'Peixes', blurb: 'Teste mensal da água, quarentena e alimentação equilibrada para o aquário.' },
    { id: 'equinos', label: 'Equinos', blurb: 'Influenza, tétano, raiva e exames de AIE e Mormo para emissão da GTA.' },
    { id: 'fazenda', label: 'Animais de produção', blurb: 'Galinhas, patos, porcos, cabras, ovelhas e bovinos: vacinas oficiais do MAPA e manejo do rebanho.' },
    { id: 'outros', label: 'Anfíbios e aracnídeos', blurb: 'Água, umidade e temperatura certas e avaliação com veterinário de exóticos.' },
  ];

  /* ------------------------------------------------------------------ Mascotes */
  // Mascotes com óculos e coleira: azul para machos, rosa para fêmeas (arquivos <nome>-f.png, gerados por tools/rosa.ps1).
  const female = (sex) => sex === 'Fêmea';
  const femaleImg = (src) => src.replace(/\.png$/, '-f.png');

  /* ------------------------------------------------------------------ Espécies */
  // dos: "do seu" / "da sua" — para frases como "a saúde da sua cobra"
  const S = (id, label, plural, img, group, unit, dos, life, breeds) => ({ id, label, plural, img: IMG + img, group, unit, dos, life, breeds });

  const species = {
    cachorro: S('cachorro', 'Cachorro', 'Cães', 'dog.png', 'caes-gatos', 'kg', 'do seu', '10 a 15 anos', [
      'Sem raça definida (SRD)', 'Vira-lata caramelo', 'Afghan Hound', 'Airedale Terrier', 'Akita', 'American Bully', 'Basset Hound', 'Beagle', 'Bernese', 'Bichon Frisé',
      'Bloodhound', 'Border Collie', 'Boston Terrier', 'Boxer', 'Buldogue Campeiro', 'Bull Terrier', 'Bulldog Francês', 'Bulldog Inglês', 'Cane Corso', 'Cavalier King Charles',
      'Chihuahua', 'Chow Chow', 'Cocker Spaniel', 'Collie', 'Corgi', 'Dachshund (Salsicha)', 'Dálmata', 'Doberman', 'Dogo Argentino', 'Dogue Alemão', 'Dogue de Bordeaux',
      'Fila Brasileiro', 'Fox Paulistinha (Terrier Brasileiro)', 'Galgo', 'Golden Retriever', 'Husky Siberiano', 'Jack Russell Terrier', 'Labrador', 'Lhasa Apso', 'Malamute do Alasca',
      'Maltês', 'Mastiff', 'Pastor Alemão', 'Pastor Australiano', 'Pastor Belga Malinois', 'Pastor de Shetland', 'Pequinês', 'Pinscher', 'Pit Bull', 'Poodle', 'Pug', 'Rottweiler',
      'Samoieda', 'São Bernardo', 'Schnauzer', 'Shar-pei', 'Shiba Inu', 'Shih Tzu', 'Spitz Alemão', 'Staffordshire Bull Terrier', 'Weimaraner', 'West Highland White Terrier',
      'Whippet', 'Yorkshire Terrier', 'Outra']),
    gato: S('gato', 'Gato', 'Gatos', 'cat.png', 'caes-gatos', 'kg', 'do seu', '12 a 18 anos', [
      'Sem raça definida (SRD)', 'Abissínio', 'American Shorthair', 'Angorá', 'Azul Russo', 'Balinês', 'Bengal', 'Birmanês (Sagrado da Birmânia)', 'Bombaim', 'British Shorthair',
      'Burmês', 'Chartreux', 'Cornish Rex', 'Devon Rex', 'Exótico de Pelo Curto', 'Himalaio', 'Maine Coon', 'Manx', 'Munchkin', 'Norueguês da Floresta', 'Oriental', 'Persa',
      'Ragdoll', 'Savannah', 'Scottish Fold', 'Siamês', 'Siberiano', 'Somali', 'Sphynx', 'Tonquinês', 'Van Turco', 'Outra']),
    coelho: S('coelho', 'Coelho', 'Coelhos', 'rabbit.png', 'pequenos', 'kg', 'do seu', '8 a 12 anos', [
      'Mini Lop', 'Angorá', 'Califórnia', 'Fuzzy Lop', 'Gigante de Flandres', 'Holandês', 'Holandês Anão', 'Hotot Anão', 'Lionhead', 'Mini Rex', 'Nova Zelândia', 'Polish', 'Rex',
      'Teddy', 'Sem raça definida (SRD)', 'Outra']),
    hamster: S('hamster', 'Hamster', 'Hamsters', 'hamster.png', 'pequenos', 'g', 'do seu', '2 a 3 anos', [
      'Sírio', 'Sírio de pelo longo (Angorá)', 'Anão Russo', 'Anão Campbell', 'Anão Chinês', 'Roborovski', 'Outra']),
    roedor: S('roedor', 'Rato / Gerbil', 'Ratos e gerbils', 'rat.png', 'pequenos', 'g', 'do seu', '2 a 5 anos', [
      'Rato twister', 'Rato dumbo', 'Rato rex', 'Camundongo', 'Gerbil (esquilo-da-mongólia)', 'Degu', 'Outra']),
    chinchila: S('chinchila', 'Chinchila', 'Chinchilas', 'chinchilla.png', 'pequenos', 'g', 'da sua', '10 a 20 anos', [
      'Padrão (cinza)', 'Bege', 'Branca (Wilson)', 'Ébano', 'Violeta', 'Safira', 'Veludo-preto', 'Outra']),
    porquinho: S('porquinho', 'Porquinho-da-índia', 'Porquinhos-da-índia', 'guineapig.png', 'pequenos', 'g', 'do seu', '5 a 8 anos', [
      'Inglês (pelo curto)', 'Abissínio', 'Americano', 'Coronet', 'Crested', 'Peruano', 'Rex', 'Sheltie', 'Skinny (sem pelo)', 'Teddy', 'Texel', 'Sem raça definida (SRD)', 'Outra']),
    furao: S('furao', 'Furão', 'Furões', 'ferret.png', 'pequenos', 'kg', 'do seu', '6 a 10 anos', [
      'Sable', 'Black Sable', 'Albino', 'Canela', 'Champagne', 'Chocolate', 'Prata', 'Panda', 'Blaze', 'Outra']),
    passaro: S('passaro', 'Pássaro', 'Aves', 'breeds/bird-canario.png', 'aves', 'g', 'do seu', '5 a 30 anos', [
      'Canário-belga', 'Agapornis', 'Arara', 'Cacatua', 'Calafate', 'Calopsita', 'Canário-da-terra', 'Curió', 'Diamante-de-gould', 'Mandarim', 'Manon', 'Papagaio',
      'Periquito-australiano', 'Ring-neck', 'Rosela', 'Sabiá', 'Trinca-ferro', 'Outra']),
    galinha: S('galinha', 'Galinha', 'Galinhas', 'breeds/bird-galinha.png', 'fazenda', 'kg', 'da sua', '8 a 10 anos', [
      'Caipira', 'Australorp', 'Brahma', 'Embrapa 051', 'Garnisé', 'Índio Gigante', 'Legorne', 'Plymouth Rock', 'Polonesa', 'Rhode Island Red', 'Sedosa (Silkie)', 'Sussex', 'Outra']),
    pato: S('pato', 'Pato', 'Patos e gansos', 'duck.png', 'fazenda', 'kg', 'do seu', '8 a 15 anos', [
      'Pato-de-pequim', 'Pato-real (Mallard)', 'Pato-corredor-indiano', 'Pato-mandarim', 'Marreco', 'Ganso', 'Ganso-sinaleiro', 'Outra']),
    jabuti: S('jabuti', 'Jabuti', 'Jabutis', 'tortoise.png', 'repteis', 'kg', 'do seu', '40 a 80 anos', [
      'Jabuti-piranga', 'Jabuti-tinga', 'Outra']),
    tartaruga: S('tartaruga', 'Tartaruga aquática', 'Tartarugas aquáticas', 'turtle.png', 'repteis', 'kg', 'da sua', '20 a 40 anos', [
      'Tigre-d\'água', 'Cágado-de-barbicha', 'Muçuã', 'Outra']),
    cobra: S('cobra', 'Cobra', 'Cobras', 'snake.png', 'repteis', 'kg', 'da sua', '20 a 30 anos', [
      'Píton-real (Ball python)', 'Corn snake', 'Jiboia', 'King snake', 'Milk snake', 'Hognose', 'Gopher snake', 'Outra']),
    iguana: S('iguana', 'Lagarto / Iguana', 'Lagartos / Iguanas', 'iguana.png', 'repteis', 'kg', 'do seu', '10 a 20 anos', [
      'Iguana-verde', 'Pogona (Dragão-barbudo)', 'Gecko-leopardo', 'Gecko-de-crista', 'Teiú', 'Dragão-d\'água', 'Camaleão', 'Uromastyx', 'Outra']),
    anfibio: S('anfibio', 'Anfíbio', 'Anfíbios', 'frog.png', 'outros', 'g', 'do seu', '5 a 15 anos', [
      'Axolote', 'Sapo-boi (Pacman)', 'Perereca-de-olhos-vermelhos', 'Rã-touro', 'Salamandra', 'Outra']),
    aranha: S('aranha', 'Aranha', 'Aranhas', 'spider.png', 'outros', 'g', 'da sua', '5 a 25 anos', [
      'Caranguejeira-brasileira', 'Tarântula Chilean Rose', 'Tarântula Red Knee', 'Tarântula Pink Toe', 'Outra']),
    peixe: S('peixe', 'Peixe', 'Peixes', 'fish.png', 'peixes', 'g', 'do seu', '2 a 20 anos', [
      'Kinguio', 'Acará-bandeira', 'Acará-disco', 'Barbo', 'Betta', 'Carpa', 'Cascudo', 'Ciclídeo africano', 'Coridora', 'Espada', 'Guppy', 'Molinésia', 'Neon', 'Oscar',
      'Paulistinha (Zebrafish)', 'Peixe-palhaço (marinho)', 'Platy', 'Tetra-negro', 'Tricogaster', 'Outra']),
    cavalo: S('cavalo', 'Cavalo / Égua', 'Cavalos / Éguas', 'horse.png', 'equinos', 'kg', 'do seu', '25 a 30 anos', [
      'Mangalarga Marchador', 'Andaluz', 'Appaloosa', 'Árabe', 'Brasileiro de Hipismo', 'Bretão', 'Campolina', 'Crioulo', 'Frísio', 'Lusitano', 'Mangalarga Paulista', 'Marajoara',
      'Paint Horse', 'Pampa', 'Pantaneiro', 'Percheron', 'Piquira', 'Pônei', 'Puro-Sangue Inglês', 'Quarto de Milha', 'Jumento', 'Muar (burro/mula)', 'Sem raça definida (SRD)', 'Outra']),
    porco: S('porco', 'Mini porco', 'Mini porcos', 'pig.png', 'fazenda', 'kg', 'do seu', '12 a 18 anos', [
      'Mini pig', 'Vietnamita', 'Kunekune', 'Juliana', 'Piau', 'Outra']),
    cabra: S('cabra', 'Cabra / Bode', 'Cabras / Bodes', 'goat.png', 'fazenda', 'kg', 'da sua', '12 a 15 anos', [
      'Saanen', 'Anglo-nubiana', 'Boer', 'Canindé', 'Moxotó', 'Pigmeia', 'Toggenburg', 'Sem raça definida (SRD)', 'Outra']),
    ovelha: S('ovelha', 'Ovelha / Carneiro', 'Ovelhas', 'sheep.png', 'fazenda', 'kg', 'da sua', '10 a 12 anos', [
      'Santa Inês', 'Dorper', 'Lacaune', 'Merino', 'Morada Nova', 'Suffolk', 'Texel', 'Sem raça definida (SRD)', 'Outra']),
    bovino: S('bovino', 'Boi / Vaca', 'Bois / Vacas', 'cow.png', 'fazenda', 'kg', 'do seu', '15 a 20 anos', [
      'Nelore', 'Angus', 'Brahman', 'Gir', 'Girolando', 'Guzerá', 'Hereford', 'Holandesa', 'Jersey', 'Mini Jersey', 'Senepol', 'Tabapuã', 'Sem raça definida (SRD)', 'Outra']),
  };
  // Sele??o enxuta de ra?as para manter o cadastro simples e a galeria visual vi?vel.
  // Quatro ra?as representativas + "Outra" por esp?cie, quando dispon?veis.
  const curatedBreeds = {
    cachorro: ['Sem ra\u00e7a definida (SRD)', 'Vira-lata caramelo', 'Golden Retriever', 'Shih Tzu', 'Outra'],
    gato: ['Sem ra\u00e7a definida (SRD)', 'Siam\u00eas', 'Persa', 'Maine Coon', 'Outra'],
    coelho: ['Mini Lop', 'Angor\u00e1', 'Holand\u00eas', 'Lionhead', 'Outra'],
    hamster: ['S\u00edrio', 'An\u00e3o Russo', 'Roborovski', 'S\u00edrio de pelo longo (Angor\u00e1)', 'Outra'],
    roedor: ['Rato twister', 'Rato dumbo', 'Gerbil (esquilo-da-mong\u00f3lia)', 'Degu', 'Outra'],
    chinchila: ['Padr\u00e3o (cinza)', 'Bege', 'Branca (Wilson)', '\u00c9bano', 'Outra'],
    porquinho: ['Ingl\u00eas (pelo curto)', 'Abiss\u00ednio', 'Peruano', 'Rex', 'Outra'],
    furao: ['Sable', 'Albino', 'Canela', 'Champagne', 'Outra'],
    passaro: ['Can\u00e1rio-belga', 'Calopsita', 'Periquito-australiano', 'Papagaio', 'Outra'],
    galinha: ['Caipira', 'Brahma', 'Garnis\u00e9', 'Rhode Island Red', 'Outra'],
    pato: ['Pato-de-pequim', 'Pato-real (Mallard)', 'Pato-corredor-indiano', 'Marreco', 'Outra'],
    jabuti: ['Jabuti-piranga', 'Jabuti-tinga', 'Outra'],
    tartaruga: ['Tigre-d\u0027\u00e1gua', 'C\u00e1gado-de-barbicha', 'Mu\u00e7u\u00e3', 'Outra'],
    cobra: ['P\u00edton-real (Ball python)', 'Corn snake', 'Jiboia', 'King snake', 'Outra'],
    iguana: ['Iguana-verde', 'Pogona (Drag\u00e3o-barbudo)', 'Gecko-leopardo', 'Tei\u00fa', 'Outra'],
    anfibio: ['Axolote', 'Sapo-boi (Pacman)', 'Perereca-de-olhos-vermelhos', 'R\u00e3-touro', 'Outra'],
    aranha: ['Caranguejeira-brasileira', 'Tar\u00e2ntula Chilean Rose', 'Tar\u00e2ntula Red Knee', 'Tar\u00e2ntula Pink Toe', 'Outra'],
    peixe: ['Kinguio', 'Betta', 'Guppy', 'Peixe-palha\u00e7o (marinho)', 'Outra'],
    cavalo: ['Mangalarga Marchador', '\u00c1rabe', 'Crioulo', 'Quarto de Milha', 'Outra'],
    porco: ['Mini pig', 'Vietnamita', 'Kunekune', 'Juliana', 'Outra'],
    cabra: ['Saanen', 'Anglo-nubiana', 'Boer', 'Moxot\u00f3', 'Outra'],
    ovelha: ['Santa In\u00eas', 'Dorper', 'Merino', 'Suffolk', 'Outra'],
    bovino: ['Nelore', 'Angus', 'Girolando', 'Holandesa', 'Outra'],
  };
  Object.entries(curatedBreeds).forEach(([id, breeds]) => {
    species[id].breeds = breeds.filter((breed) => species[id].breeds.includes(breed));
  });

  // Porte estimado para as raças caninas mais comuns do cadastro. SRD e mestiços
  // variam bastante; nesses casos o tutor escolhe o porte manualmente.
  const dogBreedSizes = {
    'Golden Retriever': 'Grande',
    'Shih Tzu': 'Pequeno',
    'Corgi': 'Médio',
  };
  const dogBreedSize = (breed) => dogBreedSizes[breed] || null;

  const speciesOrder = ['cachorro', 'gato', 'coelho', 'hamster', 'roedor', 'chinchila', 'porquinho', 'furao', 'passaro', 'galinha', 'pato', 'jabuti', 'tartaruga', 'cobra', 'iguana',
    'anfibio', 'aranha', 'peixe', 'cavalo', 'porco', 'cabra', 'ovelha', 'bovino'];

  /* ------------------------------------------------------- Carteira de saúde */
  // O calendário de vacinas, exames e consultas de cada espécie vem da base assets/data/vacinas.json
  // (montada a partir de WSAVA, MAPA e Embrapa). O app lê a base ao abrir, como leria uma API;
  // para trocar por um serviço externo basta apontar VACCINE_DB para a nova URL.
  // Cada item: ages = idade em semanas de cada dose do filhote; adultDoses/gap = esquema de quem começa adulto;
  // interval = dias até cada reforço (null = dose única); level = obrigatoria | essencial | recomendada | opcional | regional.
  const VACCINE_DB = 'assets/data/vacinas.json';
  const vaccines = {};
  const vaccineSources = {};
  const vaccineDb = { loaded: false, version: null, disclaimer: '' };

  const loadVaccines = async () => {
    const res = await fetch(VACCINE_DB, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Base de vacinas indisponível (${res.status})`);
    const db = await res.json();
    Object.entries(db.species).forEach(([sp, entry]) => {
      vaccines[sp] = entry.items.map((it) => ({ adultDoses: 1, gap: 21, interval: null, onlySex: null, onlyBreeds: null, ...it }));
      vaccineSources[sp] = entry.sources.map((id) => db.sources[id]).filter(Boolean);
    });
    Object.assign(vaccineDb, { loaded: true, version: db.version, updated: db.updated, disclaimer: db.disclaimer });
    return vaccineDb;
  };

  const levels = {
    obrigatoria: { label: 'Obrigatória', cls: 'lv-req' },
    essencial: { label: 'Essencial', cls: 'lv-core' },
    recomendada: { label: 'Recomendada', cls: 'lv-rec' },
    opcional: { label: 'Opcional', cls: 'lv-opt' },
    regional: { label: 'Conforme região/lei', cls: 'lv-regional' },
    naorecomendada: { label: 'Não recomendada (WSAVA)', cls: 'lv-no' },
  };

  /* Mascote por raça (as demais raças usam o mascote da espécie) */
  const B = (f) => IMG + 'breeds/' + f + '.png';
  const breedImages = {
    cachorro: {
      'Sem raça definida (SRD)': B('dog-srd'), 'Vira-lata caramelo': B('dog-caramelo'), 'Golden Retriever': B('dog-golden'), Labrador: B('dog-labrador'), 'Shih Tzu': B('dog-shihtzu'),
      Poodle: B('dog-poodle'), 'Bulldog Francês': B('dog-bulldog'), 'Spitz Alemão': B('dog-spitz'), 'Border Collie': B('dog-border'),
    },
    gato: {
      'Sem raça definida (SRD)': B('cat-srd'),
      'Siamês': B('cat-siames'), Persa: B('cat-persa'), Himalaio: B('cat-persa'), 'Maine Coon': B('cat-mainecoon'), 'Norueguês da Floresta': B('cat-mainecoon'), Ragdoll: B('cat-ragdoll'),
      'Birmanês (Sagrado da Birmânia)': B('cat-ragdoll'), Sphynx: B('cat-sphynx'), Bengal: B('cat-bengal'), Savannah: B('cat-bengal'), 'Angorá': B('cat-angora'),
    },
    coelho: { 'Mini Lop': B('coelho-mini-lop'), 'Angorá': B('coelho-angora'), 'Holandês': B('coelho-holandes'), Lionhead: B('coelho-lionhead') },
    hamster: { 'Sírio': B('hamster-sirio'), 'Anão Russo': B('hamster-russo'), Roborovski: B('hamster-roborovski'), 'Sírio de pelo longo (Angorá)': B('hamster-angora') },
    roedor: { 'Rato twister': B('roedor-rato-twister'), 'Rato dumbo': B('roedor-rato-dumbo'), 'Gerbil (esquilo-da-mongólia)': B('roedor-gerbil'), Degu: B('roedor-degu') },
    chinchila: { 'Padrão (cinza)': B('chinchila-padrao-cinza'), Bege: B('chinchila-bege'), 'Branca (Wilson)': B('chinchila-branca-wilson'), Ébano: B('chinchila-ebano') },
    porquinho: { 'Inglês (pelo curto)': B('porquinho-ingles-pelo-curto'), Abissínio: B('porquinho-abissinio'), Peruano: B('porquinho-peruano'), Rex: B('porquinho-rex') },
    furao: { Sable: B('furao-sable'), Albino: B('furao-albino'), Canela: B('furao-canela'), Champagne: B('furao-champagne') },
    pato: { 'Pato-de-pequim': { male: B('pato-pequim'), female: B('pato-pequim-f') }, 'Pato-real (Mallard)': { male: B('pato-mallard'), female: B('pato-mallard-f') }, 'Pato-corredor-indiano': { male: B('pato-corredor-indiano'), female: B('pato-corredor-indiano-f') }, Marreco: { male: B('pato-marreco'), female: B('pato-marreco-f') } },
    anfibio: { Axolote: { male: B('anfibio-axolote'), female: B('anfibio-axolote-f') }, 'Sapo-boi (Pacman)': { male: B('anfibio-sapo-pacman'), female: B('anfibio-sapo-pacman-f') }, 'Perereca-de-olhos-vermelhos': { male: B('anfibio-perereca-olhos-vermelhos'), female: B('anfibio-perereca-olhos-vermelhos-f') }, 'Rã-touro': { male: B('anfibio-ra-touro'), female: B('anfibio-ra-touro-f') } },
    aranha: { 'Caranguejeira-brasileira': { male: B('aranha-caranguejeira-brasileira'), female: B('aranha-caranguejeira-brasileira-f') }, 'Tarântula Chilean Rose': { male: B('aranha-chilean-rose'), female: B('aranha-chilean-rose-f') }, 'Tarântula Red Knee': { male: B('aranha-red-knee'), female: B('aranha-red-knee-f') }, 'Tarântula Pink Toe': { male: B('aranha-pink-toe'), female: B('aranha-pink-toe-f') } },
    bovino: { Nelore: { male: B('bovino-nelore'), female: B('bovino-nelore-f') }, Angus: { male: B('bovino-angus'), female: B('bovino-angus-f') }, Girolando: { male: B('bovino-girolando'), female: B('bovino-girolando-f') }, Holandesa: { male: B('bovino-holandesa'), female: B('bovino-holandesa-f') } },
    ovelha: { 'Santa Inês': { male: B('ovelha-santa-ines'), female: B('ovelha-santa-ines-f') }, Dorper: { male: B('ovelha-dorper'), female: B('ovelha-dorper-f') }, Merino: { male: B('ovelha-merino'), female: B('ovelha-merino-f') }, Suffolk: { male: B('ovelha-suffolk'), female: B('ovelha-suffolk-f') } },
    cabra: { Saanen: { male: B('cabra-saanen'), female: B('cabra-saanen-f') }, 'Anglo-nubiana': { male: B('cabra-anglo-nubiana'), female: B('cabra-anglo-nubiana-f') }, Boer: { male: B('cabra-boer'), female: B('cabra-boer-f') }, Moxotó: { male: B('cabra-moxoto'), female: B('cabra-moxoto-f') } },
    cavalo: { 'Mangalarga Marchador': B('cavalo-mangalarga-marchador'), 'Árabe': B('cavalo-arabe'), 'Crioulo': B('cavalo-crioulo'), 'Quarto de Milha': B('cavalo-quarto-de-milha') },
    jabuti: { 'Jabuti-piranga': B('jabuti-piranga'), 'Jabuti-tinga': B('jabuti-tinga') },
    tartaruga: { 'Tigre-d\'água': B('tartaruga-tigre-dagua'), 'Cágado-de-barbicha': B('jabuti-cagado-barbicha'), 'Muçuã': { male: B('tartaruga-mucua'), female: B('tartaruga-mucua-f') } },
    passaro: {
      'Canário-belga': B('bird-canario'), Calopsita: B('bird-calopsita'), 'Periquito-australiano': B('bird-periquito'), Papagaio: B('bird-papagaio'), Agapornis: B('bird-agapornis'),
    },
    galinha: { Caipira: { male: IMG + 'galo.png', female: IMG + 'galinha-f.png' }, Brahma: { male: B('galinha-brahma'), female: B('galinha-brahma-f') }, 'Garnisé': { male: B('galinha-garnise'), female: B('galinha-garnise-f') }, 'Rhode Island Red': { male: B('galinha-rhode-island-red'), female: B('galinha-rhode-island-red-f') } },
    iguana: { 'Iguana-verde': { male: B('iguana-iguana-verde'), female: B('iguana-iguana-verde-f') }, 'Pogona (Dragão-barbudo)': B('lizard-pogona'), 'Gecko-leopardo': B('lizard-gecko'), 'Gecko-de-crista': B('lizard-gecko'), 'Teiú': { male: B('iguana-teiu'), female: B('iguana-teiu-f') } },
    peixe: { Betta: B('fish-betta'), Kinguio: { male: B('peixe-kinguio'), female: B('peixe-kinguio-f') }, Guppy: { male: B('peixe-guppy'), female: B('peixe-guppy-f') }, 'Peixe-palhaço (marinho)': { male: B('peixe-palhaco'), female: B('peixe-palhaco-f') } },
    porco: { 'Mini pig': { male: B('porco-mini-pig'), female: B('porco-mini-pig-f') }, Vietnamita: { male: B('porco-vietnamita'), female: B('porco-vietnamita-f') }, Kunekune: { male: B('porco-kunekune'), female: B('porco-kunekune-f') }, Juliana: { male: B('porco-juliana'), female: B('porco-juliana-f') } },
    cobra: { 'Píton-real (Ball python)': { male: B('cobra-piton-real-ball-python'), female: B('cobra-piton-real-ball-python-f') }, Jiboia: { male: B('cobra-jiboia'), female: B('cobra-jiboia-f') }, 'King snake': { male: B('cobra-king-snake'), female: B('cobra-king-snake-f') }, 'Corn snake': B('snake-corn') },
  };
  // Mascote do pet: raça + sexo (fêmeas usam a versão com óculos e coleira rosa)
  const maleSpeciesImages = { cabra: IMG + 'bode.png', bovino: IMG + 'boi.png', galinha: IMG + 'galo.png', ovelha: IMG + 'carneiro.png' };
  const femaleSpeciesImages = { galinha: IMG + 'galinha-f.png', ovelha: IMG + 'sheep-f.png' };
  const breedImg = (sp, breed, sex) => {
    const mapped = breedImages[sp] && breedImages[sp][breed];
    if (female(sex)) {
      if (mapped && typeof mapped === 'object') return mapped.female || femaleImg(mapped.male || species[sp].img);
      return mapped ? femaleImg(mapped) : (femaleSpeciesImages[sp] || femaleImg(species[sp].img));
    }
    if (mapped && typeof mapped === 'object') return mapped.male || maleSpeciesImages[sp] || species[sp].img;
    return mapped || maleSpeciesImages[sp] || species[sp].img;
  };

  const reminderTypes = {
    vermifugo: { label: 'Vermífugo', icon: 'pill' },
    antipulgas: { label: 'Antipulgas', icon: 'shield' },
    banho: { label: 'Banho & tosa', icon: 'drop' },
    casco: { label: 'Casqueamento', icon: 'scissors' },
    unhas: { label: 'Corte de unhas', icon: 'scissors' },
    limpeza: { label: 'Limpeza do habitat', icon: 'home2' },
    agua: { label: 'Troca de água', icon: 'drop' },
    consulta: { label: 'Consulta', icon: 'steth' },
    outro: { label: 'Outro', icon: 'bell' },
  };
  const reminderBySpecies = {
    cachorro: ['vermifugo', 'antipulgas', 'banho', 'unhas', 'consulta', 'outro'],
    gato: ['vermifugo', 'antipulgas', 'banho', 'unhas', 'consulta', 'outro'],
    coelho: ['vermifugo', 'unhas', 'limpeza', 'consulta', 'outro'],
    hamster: ['limpeza', 'consulta', 'outro'],
    porquinho: ['vermifugo', 'unhas', 'limpeza', 'consulta', 'outro'],
    furao: ['vermifugo', 'antipulgas', 'banho', 'unhas', 'consulta', 'outro'],
    passaro: ['vermifugo', 'unhas', 'limpeza', 'consulta', 'outro'],
    jabuti: ['vermifugo', 'unhas', 'limpeza', 'consulta', 'outro'],
    cobra: ['vermifugo', 'limpeza', 'consulta', 'outro'],
    iguana: ['vermifugo', 'unhas', 'limpeza', 'consulta', 'outro'],
    peixe: ['agua', 'limpeza', 'consulta', 'outro'],
    cavalo: ['vermifugo', 'casco', 'banho', 'consulta', 'outro'],
    roedor: ['limpeza', 'unhas', 'consulta', 'outro'],
    chinchila: ['banho', 'limpeza', 'consulta', 'outro'],
    galinha: ['vermifugo', 'limpeza', 'consulta', 'outro'],
    pato: ['vermifugo', 'limpeza', 'agua', 'consulta', 'outro'],
    tartaruga: ['agua', 'limpeza', 'consulta', 'outro'],
    anfibio: ['agua', 'limpeza', 'consulta', 'outro'],
    aranha: ['agua', 'limpeza', 'consulta', 'outro'],
    porco: ['vermifugo', 'casco', 'banho', 'consulta', 'outro'],
    cabra: ['vermifugo', 'casco', 'consulta', 'outro'],
    ovelha: ['vermifugo', 'casco', 'consulta', 'outro'],
    bovino: ['vermifugo', 'casco', 'consulta', 'outro'],
  };

  /* ---------------------------------------------------------------- Exemplo */
  // Perfil base do protótipo: quem abre o site já encontra estes pets (sem login nem banco de dados).
  const seedPets = [
    {
      id: 'thor', name: 'Thor', species: 'cachorro', breed: 'Corgi', sex: 'Macho', neutered: true, chip: '985 112 004 567 321', birth: iso(-2 * 365 - 40), weight: 12,
      records: {
        v10: { applied: [iso(-400), iso(-35)], place: 'Clínica CuidaPet Centro' },
        lepto: { applied: [iso(-400), iso(-379), iso(-35)], place: 'Clínica CuidaPet Centro' },
        raiva: { applied: [iso(-380), iso(-20)], place: 'Campanha municipal' },
        gripe: { applied: [iso(-321), iso(-300)] },
        giardia: { applied: [iso(-381), iso(-360)] },
      },
    },
    {
      id: 'bolinha', name: 'Bolinha', species: 'cachorro', breed: 'Golden Retriever', sex: 'Fêmea', neutered: false, birth: iso(-70), weight: 6.5,
      records: { v10: { applied: [iso(-14)], place: 'Clínica CuidaPet Centro' } },
    },
    {
      id: 'mia', name: 'Mia', species: 'gato', breed: 'Siamês', sex: 'Fêmea', neutered: true, birth: iso(-420), weight: 4.1,
      records: {
        v4: { applied: [iso(-81), iso(-60)] },
        raiva: { applied: [iso(-375)] },
      },
    },
    {
      id: 'pipoca', name: 'Pipoca', species: 'coelho', breed: 'Mini Lop', sex: 'Fêmea', neutered: false, birth: iso(-250), weight: 1.6,
      records: {
        checkup: { applied: [iso(-140)] },
      },
    },
    {
      id: 'trovao', name: 'Trovão', species: 'cavalo', breed: 'Mangalarga Marchador', sex: 'Macho', neutered: true, birth: iso(-4 * 365 - 90), weight: 430,
      records: {
        influenza: { applied: [iso(-205), iso(-170)] },
        tetano: { applied: [iso(-235), iso(-200)] },
        encef: { applied: [iso(-235), iso(-200)] },
        raiva: { applied: [iso(-180), iso(-150)] },
        aie: { applied: [iso(-50)] },
        mormo: { applied: [iso(-50)] },
      },
    },
    {
      id: 'sol', name: 'Sol', species: 'passaro', breed: 'Canário-belga', sex: 'Macho', neutered: false, birth: iso(-300), weight: 22,
      records: { checkup: { applied: [iso(-120)] } },
    },
    {
      id: 'penelope', name: 'Penélope', species: 'galinha', breed: 'Caipira', sex: 'Fêmea', neutered: false, birth: iso(-200), weight: 2.1,
      records: {
        marek: { applied: [iso(-200)] },
        newcastle: { applied: [iso(-193), iso(-172), iso(-85)] },
        gumboro: { applied: [iso(-186), iso(-179)] },
      },
    },
  ];

  const seedReminders = [
    { id: 'r1', petId: 'thor', type: 'vermifugo', title: 'Vermífugo', date: iso(18) },
    { id: 'r2', petId: 'thor', type: 'antipulgas', title: 'Antipulgas mastigável', date: iso(9) },
    { id: 'r3', petId: 'thor', type: 'banho', title: 'Banho & tosa', date: iso(3) },
    { id: 'r4', petId: 'mia', type: 'vermifugo', title: 'Vermífugo felino', date: iso(25) },
    { id: 'r5', petId: 'pipoca', type: 'unhas', title: 'Corte de unhas', date: iso(6) },
    { id: 'r6', petId: 'pipoca', type: 'limpeza', title: 'Trocar o substrato da gaiola', date: iso(2) },
    { id: 'r7', petId: 'trovao', type: 'casco', title: 'Casqueamento', date: iso(12) },
    { id: 'r8', petId: 'trovao', type: 'vermifugo', title: 'Vermífugo equino (pasta)', date: iso(40) },
    { id: 'r9', petId: 'sol', type: 'limpeza', title: 'Trocar areia e poleiros', date: iso(4) },
  ];

  const seedAddresses = [
    { id: 'a1', label: 'Casa', line: 'Rua das Palmeiras, 120 – Apto 32', city: 'São Paulo – SP', cep: '04567-010', main: true },
    { id: 'a2', label: 'Sítio', line: 'Estrada do Limoeiro, km 4', city: 'Atibaia – SP', cep: '12940-000', main: false },
  ];
  const seedAppointments = [
    { id: 'c1', petId: 'thor', service: 'consulta', clinic: 'centro', date: iso(4), time: '10:00', notes: 'Revisão anual e peso', status: 'agendado' },
    { id: 'c2', petId: 'trovao', service: 'domicilio', clinic: 'domicilio', date: iso(12), time: '08:00', notes: 'Coleta de AIE e Mormo', status: 'agendado' },
    { id: 'c3', petId: 'mia', service: 'vacina', clinic: 'centro', date: iso(-60), time: '15:30', notes: '', status: 'concluido' },
  ];

  // Serviços e unidades para o agendamento (species: null = todas)
  const services = [
    { id: 'consulta', label: 'Consulta clínica', icon: 'steth', minutes: 40, species: null },
    { id: 'vacina', label: 'Vacinação', icon: 'syringe', minutes: 20, species: null },
    { id: 'exames', label: 'Exames e diagnóstico', icon: 'file', minutes: 30, species: null },
    { id: 'banho', label: 'Banho & tosa', icon: 'drop', minutes: 90, species: ['cachorro', 'gato', 'coelho', 'porquinho', 'furao', 'porco'] },
    { id: 'exoticos', label: 'Consulta de exóticos', icon: 'sparkle', minutes: 40, species: ['coelho', 'hamster', 'roedor', 'chinchila', 'porquinho', 'furao', 'passaro', 'jabuti', 'tartaruga', 'cobra', 'iguana', 'anfibio', 'aranha', 'peixe'] },
    { id: 'domicilio', label: 'Atendimento na propriedade', icon: 'truck', minutes: 60, species: null },
  ];
  const clinics = [
    { id: 'centro', label: 'CuidaPet Centro', address: 'Av. Paulista, 1000 – São Paulo', h24: true },
    { id: 'sul', label: 'CuidaPet Zona Sul', address: 'Av. Santo Amaro, 2500 – São Paulo', h24: false },
    { id: 'domicilio', label: 'Na minha casa / propriedade', address: 'Equipe volante', h24: false },
  ];
  const slots = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30', '17:30'];

  const seedPayments = [
    { id: 'p1', kind: 'card', brand: 'Visa', last4: '4242', exp: '08/29', main: true },
    { id: 'p2', kind: 'pix', brand: 'Pix', main: false },
  ];

  /* ---------------------------------------------------------------- Loja */
  const cat = (id, label, icon) => ({ id, label, icon });
  const C_RACOES = cat('racoes', 'Rações', 'bowl');
  const C_PETISCOS = cat('petiscos', 'Petiscos', 'heart');
  const C_SAUDE = cat('saude', 'Saúde', 'pill');
  const categories = {
    cachorro: [C_RACOES, cat('petiscos', 'Petiscos', 'bone'), cat('higiene', 'Higiene', 'drop'), C_SAUDE, cat('brinquedos', 'Brinquedos', 'ball')],
    gato: [C_RACOES, C_PETISCOS, cat('higiene', 'Areia', 'drop'), C_SAUDE, cat('brinquedos', 'Brinquedos', 'ball')],
    coelho: [cat('racoes', 'Feno & ração', 'bowl'), C_PETISCOS, cat('higiene', 'Substrato', 'drop'), C_SAUDE, cat('acessorios', 'Casinhas', 'home2')],
    hamster: [C_RACOES, C_PETISCOS, cat('higiene', 'Substrato', 'drop'), cat('acessorios', 'Gaiolas', 'home2')],
    porquinho: [cat('racoes', 'Feno & ração', 'bowl'), C_PETISCOS, cat('higiene', 'Higiene', 'drop'), C_SAUDE, cat('acessorios', 'Casinhas', 'home2')],
    furao: [C_RACOES, C_PETISCOS, cat('higiene', 'Higiene', 'drop'), C_SAUDE, cat('brinquedos', 'Brinquedos', 'ball')],
    passaro: [cat('racoes', 'Sementes', 'bowl'), C_PETISCOS, cat('higiene', 'Higiene', 'drop'), C_SAUDE, cat('acessorios', 'Gaiolas', 'home2')],
    jabuti: [cat('racoes', 'Alimentação', 'bowl'), cat('higiene', 'Substrato', 'drop'), C_SAUDE, cat('acessorios', 'Terrário', 'sun')],
    cobra: [cat('racoes', 'Alimentação', 'bowl'), cat('higiene', 'Substrato', 'drop'), C_SAUDE, cat('acessorios', 'Terrário', 'sun')],
    iguana: [cat('racoes', 'Alimentação', 'bowl'), cat('higiene', 'Substrato', 'drop'), C_SAUDE, cat('acessorios', 'Terrário', 'sun')],
    peixe: [C_RACOES, cat('higiene', 'Água', 'drop'), C_SAUDE, cat('acessorios', 'Aquário', 'fish')],
    cavalo: [cat('racoes', 'Rações', 'bowl'), C_PETISCOS, cat('higiene', 'Higiene', 'drop'), C_SAUDE, cat('acessorios', 'Selaria', 'tag')],
    roedor: [C_RACOES, C_PETISCOS, cat('higiene', 'Substrato', 'drop'), cat('acessorios', 'Gaiolas', 'home2')],
    chinchila: [cat('racoes', 'Feno & ração', 'bowl'), cat('higiene', 'Pó de banho', 'drop'), C_SAUDE, cat('acessorios', 'Gaiolas', 'home2')],
    galinha: [C_RACOES, cat('higiene', 'Cama', 'drop'), C_SAUDE, cat('acessorios', 'Galinheiro', 'home2')],
    pato: [C_RACOES, cat('higiene', 'Água', 'drop'), C_SAUDE, cat('acessorios', 'Abrigo', 'home2')],
    tartaruga: [cat('racoes', 'Alimentação', 'bowl'), cat('higiene', 'Água', 'drop'), C_SAUDE, cat('acessorios', 'Aquaterrário', 'sun')],
    anfibio: [cat('racoes', 'Alimentação', 'bowl'), cat('higiene', 'Água', 'drop'), cat('acessorios', 'Terrário', 'sun')],
    aranha: [cat('racoes', 'Alimentação', 'bowl'), cat('higiene', 'Substrato', 'drop'), cat('acessorios', 'Terrário', 'sun')],
    porco: [C_RACOES, C_PETISCOS, cat('higiene', 'Higiene', 'drop'), C_SAUDE, cat('brinquedos', 'Brinquedos', 'ball')],
    cabra: [cat('racoes', 'Rações', 'bowl'), C_SAUDE, cat('acessorios', 'Manejo', 'tag')],
    ovelha: [cat('racoes', 'Rações', 'bowl'), C_SAUDE, cat('acessorios', 'Manejo', 'tag')],
    bovino: [cat('racoes', 'Rações', 'bowl'), C_SAUDE, cat('acessorios', 'Manejo', 'tag')],
  };

  const toyOfferings = [
    ['coelho', 'Brinquedo de Forrageamento para Coelhos', 34.9, '#65a30d', 'hay'],
    ['hamster', 'Roda de Madeira e Túnel para Hamster', 49.9, '#a16207', 'wheel'],
    ['roedor', 'Labirinto de Forrageamento para Roedores', 54.9, '#a16207', 'house'],
    ['chinchila', 'Bloco de Madeira e Brinquedos de Roer', 29.9, '#92400e', 'box'],
    ['porquinho', 'Túnel de Feno para Porquinhos-da-índia', 39.9, '#65a30d', 'hay'],
    ['passaro', 'Balanço Natural com Contas para Pássaros', 29.9, '#ca8a04', 'perch'],
    ['galinha', 'Bloco de Forrageamento para Galinhas', 44.9, '#ca8a04', 'box'],
    ['pato', 'Brinquedo Flutuante para Patos', 39.9, '#06b6d4', 'ball'],
    ['jabuti', 'Toca de Cortiça para Jabutis', 49.9, '#92400e', 'house'],
    ['tartaruga', 'Labirinto Flutuante para Tartarugas', 34.9, '#06b6d4', 'tank'],
    ['cobra', 'Abrigo e Galho de Escalada para Serpentes', 59.9, '#92400e', 'house'],
    ['iguana', 'Poleiro de Escalada para Iguanas', 69.9, '#15803d', 'perch'],
    ['anfibio', 'Abrigo de Cortiça para Anfíbios', 39.9, '#65a30d', 'house'],
    ['aranha', 'Toca de Casca Natural para Aranhas', 24.9, '#78350f', 'house'],
    ['peixe', 'Caverna e Anel de Alimentação para Peixes', 44.9, '#0284c7', 'tank'],
    ['cavalo', 'Bola de Brinquedo para Cavalos', 89.9, '#2563eb', 'ball'],
    ['cabra', 'Bola de Forrageamento para Cabras', 59.9, '#a16207', 'ball'],
    ['ovelha', 'Brinquedo de Enriquecimento para Ovelhas', 59.9, '#64748b', 'ball'],
    ['bovino', 'Bola e Escova de Enriquecimento para Bovinos', 129.9, '#15803d', 'ball'],
  ];
  toyOfferings.forEach(([sp]) => {
    if (!categories[sp].some((item) => item.id === 'brinquedos')) categories[sp].push(cat('brinquedos', 'Brinquedos', 'ball'));
  });

  const P = (sp, id, c, name, brand, price, extra = {}) => ({
    id: `${sp}-${id}`, sp, cat: c, name, brand, price,
    old: null, rating: 4.7, reviews: 80, sizes: null, art: 'bag', color: '#0284c7', tag: null, desc: '', ...extra,
  });

  const products = [
    // Cachorro
    P('cachorro', 'racao-adulto', 'racoes', 'Ração NutriPata Adultos – Frango & Arroz', 'NutriPata', 189.9, { tag: 'Adultos', old: 229.9, rating: 4.8, reviews: 320, color: '#0369a1', sizes: [['3 kg', 89.9], ['10 kg', 189.9], ['15 kg', 249.9]], desc: 'Ração completa e balanceada para cães adultos de raças médias e grandes, com proteína de frango e arroz integral.' }),
    P('cachorro', 'racao-filhote', 'racoes', 'Ração NutriPata Filhotes – Cordeiro', 'NutriPata', 159.9, { tag: 'Filhotes', reviews: 185, color: '#7c3aed', sizes: [['1 kg', 39.9], ['7 kg', 159.9]], desc: 'Grãos menores e DHA para o desenvolvimento do cérebro e da visão de filhotes até 12 meses.' }),
    P('cachorro', 'racao-senior', 'racoes', 'Ração NutriPata Sênior 7+', 'NutriPata', 174.9, { tag: 'Sênior', rating: 4.6, reviews: 96, color: '#0f766e', sizes: [['3 kg', 84.9], ['10 kg', 174.9]], desc: 'Menos calorias, condroitina e glucosamina para articulações de cães acima de 7 anos.' }),
    P('cachorro', 'sache', 'racoes', 'Sachê NutriPata Carne ao Molho (12 un.)', 'NutriPata', 38.9, { tag: 'Sachês', rating: 4.9, reviews: 274, art: 'box', color: '#b91c1c', desc: 'Alimento úmido completo, ótimo para misturar à ração seca.' }),
    P('cachorro', 'bifinho', 'petiscos', 'Petisco Bifinho Natural 200 g', 'Bicho Feliz', 29.9, { old: 34.9, rating: 4.9, reviews: 410, art: 'box', color: '#b45309', desc: 'Bifinhos de carne bovina desidratada, sem corantes. Ótimo para adestramento.' }),
    P('cachorro', 'osso', 'petiscos', 'Osso Mastigável Dental', 'Bicho Feliz', 24.9, { rating: 4.6, reviews: 98, art: 'bone', color: '#f59e0b', desc: 'Ajuda a reduzir a formação de tártaro enquanto diverte seu cão.' }),
    P('cachorro', 'shampoo', 'higiene', 'Shampoo Neutro Pelagem Macia 500 ml', 'Pata Limpa', 39.9, { reviews: 76, art: 'bottle', color: '#06b6d4', desc: 'pH balanceado para cães, com aveia e aloe vera. Não arde os olhos.' }),
    P('cachorro', 'tapete', 'higiene', 'Tapete Higiênico (30 un.)', 'Pata Limpa', 59.9, { rating: 4.6, reviews: 188, art: 'box', color: '#0ea5e9', desc: 'Gel superabsorvente e atrativo que ajuda no treino do filhote.' }),
    P('cachorro', 'antipulgas', 'saude', 'Antipulgas Mastigável 10–25 kg', 'VitaPet', 89.9, { old: 99.9, rating: 4.8, reviews: 254, art: 'box', color: '#16a34a', desc: 'Proteção contra pulgas e carrapatos por até 30 dias. Sabor carne.' }),
    P('cachorro', 'vermifugo', 'saude', 'Vermífugo Canino (4 comprimidos)', 'VitaPet', 36.9, { reviews: 131, art: 'box', color: '#15803d', desc: 'Amplo espectro. Dose conforme o peso, a cada 3 meses.' }),
    P('cachorro', 'bola', 'brinquedos', 'Bola Mordedor Super Resistente', 'Brinca+', 49.9, { old: 58.7, rating: 4.6, reviews: 142, art: 'ball', color: '#ef4444', desc: 'Borracha natural atóxica, com espaço para petiscos. Flutua na água.' }),
    P('cachorro', 'corda', 'brinquedos', 'Corda Cabo de Guerra', 'Brinca+', 34.9, { rating: 4.5, reviews: 61, art: 'rope', color: '#0ea5e9', desc: 'Algodão trançado que ajuda na limpeza dos dentes durante a brincadeira.' }),

    // Gato
    P('gato', 'racao-castrado', 'racoes', 'Ração Ronron Gatos Castrados – Salmão', 'Ronron', 109.9, { tag: 'Adultos', old: 129.9, rating: 4.8, reviews: 288, color: '#ea580c', sizes: [['1 kg', 44.9], ['3 kg', 109.9], ['10 kg', 279.9]], desc: 'Controle de peso e saúde urinária para gatos castrados, com salmão como primeiro ingrediente.' }),
    P('gato', 'racao-filhote', 'racoes', 'Ração Ronron Filhotes – Frango', 'Ronron', 54.9, { tag: 'Filhotes', reviews: 140, color: '#9333ea', sizes: [['1 kg', 54.9], ['3 kg', 129.9]], desc: 'Croquetes pequenos e mais proteína para gatinhos de 2 a 12 meses.' }),
    P('gato', 'sache', 'racoes', 'Sachê Ronron Patê de Atum (12 un.)', 'Ronron', 42.9, { tag: 'Sachês', rating: 4.9, reviews: 512, art: 'box', color: '#0891b2', desc: 'Patê úmido com pedaços de atum que ajuda na hidratação diária.' }),
    P('gato', 'cremoso', 'petiscos', 'Petisco Cremoso Lambeu (4 un.)', 'Bicho Feliz', 19.9, { rating: 4.9, reviews: 367, art: 'tube', color: '#db2777', desc: 'Petisco líquido para dar na mão e fortalecer o vínculo com o seu gato.' }),
    P('gato', 'areia', 'higiene', 'Areia Higiênica de Sílica 1,8 kg', 'Pata Limpa', 34.9, { old: 39.9, reviews: 201, color: '#64748b', desc: 'Alta absorção e controle de odor por até 30 dias para um gato.' }),
    P('gato', 'vermifugo', 'saude', 'Vermífugo Felino (2 comprimidos)', 'VitaPet', 32.9, { rating: 4.6, reviews: 88, art: 'box', color: '#16a34a', desc: 'Amplo espectro contra vermes redondos e chatos. Dose única a cada 3 meses.' }),
    P('gato', 'arranhador', 'brinquedos', 'Arranhador Torre com Bolinha', 'Brinca+', 119.9, { reviews: 133, art: 'tower', color: '#a16207', desc: 'Sisal natural e plataforma para descanso. Protege seus móveis.' }),
    P('gato', 'varinha', 'brinquedos', 'Varinha de Penas Divertida', 'Brinca+', 22.9, { old: 26.9, rating: 4.8, reviews: 240, art: 'feather', color: '#8b5cf6', desc: 'Estimula o instinto de caça e mantém o gato ativo dentro de casa.' }),

    // Coelho
    P('coelho', 'feno', 'racoes', 'Feno de Capim Timothy 500 g', 'Roedor Feliz', 29.9, { tag: 'Feno', old: 34.9, rating: 4.9, reviews: 211, art: 'hay', color: '#65a30d', desc: 'Base da dieta do coelho: fibras longas que gastam os dentes e mantêm o intestino funcionando.' }),
    P('coelho', 'racao', 'racoes', 'Ração Extrusada Coelhos Adultos 1,5 kg', 'Roedor Feliz', 49.9, { tag: 'Ração', reviews: 97, color: '#ea580c', desc: 'Pellets uniformes que evitam a seleção de ingredientes. Complementa o feno.' }),
    P('coelho', 'cenoura', 'petiscos', 'Petisco Bastão de Cenoura e Maçã', 'Roedor Feliz', 17.9, { rating: 4.8, reviews: 76, art: 'box', color: '#f97316', desc: 'Petisco assado para roer, sem açúcar adicionado.' }),
    P('coelho', 'substrato', 'higiene', 'Substrato de Papel Reciclado 10 L', 'Pata Limpa', 44.9, { reviews: 58, color: '#64748b', desc: 'Sem poeira, absorve até 3x seu peso e controla o odor.' }),
    P('coelho', 'vitamina', 'saude', 'Suplemento Vitamínico para Coelhos', 'VitaPet', 31.9, { reviews: 41, art: 'bottle', color: '#16a34a', desc: 'Vitaminas e minerais para pelagem e imunidade. Diluir na água.' }),
    P('coelho', 'toca', 'acessorios', 'Toca de Madeira para Coelhos', 'Roedor Feliz', 89.9, { old: 109.9, rating: 4.7, reviews: 39, art: 'house', color: '#a16207', desc: 'Madeira natural sem verniz: esconderijo e brinquedo de roer ao mesmo tempo.' }),

    // Hamster
    P('hamster', 'mix', 'racoes', 'Mix de Sementes e Grãos para Hamster 500 g', 'Roedor Feliz', 19.9, { old: 23.9, rating: 4.8, reviews: 164, color: '#ca8a04', desc: 'Girassol, milho, aveia e pellets vitaminados.' }),
    P('hamster', 'iogurte', 'petiscos', 'Petisco Gotas de Iogurte', 'Roedor Feliz', 12.9, { rating: 4.9, reviews: 88, art: 'box', color: '#db2777', desc: 'Recompensa para dar em pequenas quantidades, até 2 por dia.' }),
    P('hamster', 'maravalha', 'higiene', 'Maravalha de Pinus 1 kg', 'Pata Limpa', 16.9, { reviews: 120, color: '#d97706', desc: 'Substrato macio e sem pó, ideal para cavar e fazer ninho.' }),
    P('hamster', 'areia', 'higiene', 'Areia para Banho de Roedores', 'Pata Limpa', 14.9, { reviews: 52, art: 'tub', color: '#a8a29e', desc: 'Remove a oleosidade do pelo de hamsters anões.' }),
    P('hamster', 'roda', 'acessorios', 'Roda de Exercício Silenciosa 21 cm', 'Brinca+', 69.9, { old: 79.9, rating: 4.7, reviews: 143, art: 'wheel', color: '#0284c7', desc: 'Superfície contínua que protege as patinhas. Não faz barulho à noite.' }),
    P('hamster', 'gaiola', 'acessorios', 'Gaiola Hamster com Túnel e Casinha', 'Roedor Feliz', 189.9, { reviews: 47, art: 'cage', color: '#7c3aed', desc: 'Dois andares, bebedouro, comedouro e túnel transparente.' }),

    // Porquinho-da-índia
    P('porquinho', 'feno', 'racoes', 'Feno Timothy Premium 1 kg', 'Roedor Feliz', 49.9, { tag: 'Feno', rating: 4.9, reviews: 132, art: 'hay', color: '#65a30d', desc: 'Fibra de alta qualidade, à vontade todos os dias.' }),
    P('porquinho', 'racao', 'racoes', 'Ração com Vitamina C para Porquinhos 1,5 kg', 'Roedor Feliz', 54.9, { tag: 'Ração', old: 62.9, reviews: 84, color: '#16a34a', desc: 'Vitamina C estabilizada, que não se perde com o tempo.' }),
    P('porquinho', 'ervas', 'petiscos', 'Petisco Floco de Ervas e Flores', 'Roedor Feliz', 15.9, { rating: 4.8, reviews: 45, art: 'box', color: '#84cc16', desc: 'Camomila, dente-de-leão e pétalas desidratadas.' }),
    P('porquinho', 'tapete', 'higiene', 'Forro de Gaiola Lavável', 'Pata Limpa', 64.9, { reviews: 33, art: 'box', color: '#06b6d4', desc: 'Camada absorvente que mantém as patinhas secas. Lava na máquina.' }),
    P('porquinho', 'vitc', 'saude', 'Vitamina C em Gotas 30 ml', 'VitaPet', 24.9, { rating: 4.7, reviews: 71, art: 'bottle', color: '#f59e0b', desc: 'Suplemento diário para prevenir o escorbuto.' }),
    P('porquinho', 'iglu', 'acessorios', 'Casinha Iglu de Feltro', 'Roedor Feliz', 59.9, { reviews: 28, art: 'house', color: '#ec4899', desc: 'Esconderijo macio e lavável, para se sentir seguro.' }),

    // Furão
    P('furao', 'racao', 'racoes', 'Ração para Furões Alta Proteína 2 kg', 'NutriPata', 119.9, { old: 139.9, rating: 4.7, reviews: 52, color: '#7c2d12', desc: '38% de proteína animal, sem milho. Furões são carnívoros estritos.' }),
    P('furao', 'pasta', 'petiscos', 'Pasta Nutricional para Furões', 'VitaPet', 34.9, { rating: 4.8, reviews: 39, art: 'tube', color: '#dc2626', desc: 'Energia extra e ótimo truque para dar remédios.' }),
    P('furao', 'shampoo', 'higiene', 'Shampoo Suave para Furões 250 ml', 'Pata Limpa', 32.9, { reviews: 27, art: 'bottle', color: '#06b6d4', desc: 'Reduz o odor natural sem ressecar a pele.' }),
    P('furao', 'areia', 'higiene', 'Areia Granulada para Furões', 'Pata Limpa', 29.9, { reviews: 33, color: '#64748b', desc: 'Grãos grandes que não grudam nas patas.' }),
    P('furao', 'antipulgas', 'saude', 'Antipulgas Pipeta para Furões', 'VitaPet', 49.9, { reviews: 22, art: 'box', color: '#16a34a', desc: 'Proteção mensal contra pulgas.' }),
    P('furao', 'bola', 'brinquedos', 'Bolinha com Guizo para Furões', 'Brinca+', 19.9, { rating: 4.6, reviews: 18, art: 'ball', color: '#8b5cf6', desc: 'Leve e barulhenta, perfeita para perseguir pela casa.' }),

    // Pássaro
    P('passaro', 'sementes', 'racoes', 'Mistura de Sementes para Canários 500 g', 'Pena Viva', 18.9, { old: 22.9, rating: 4.8, reviews: 156, color: '#ca8a04', desc: 'Alpiste, painço, níger e linhaça selecionados.' }),
    P('passaro', 'extrusada', 'racoes', 'Ração Extrusada para Calopsitas 300 g', 'Pena Viva', 32.9, { reviews: 84, color: '#16a34a', desc: 'Nutrição completa com frutas e vegetais, sem seleção de sementes.' }),
    P('passaro', 'farinhada', 'petiscos', 'Farinhada com Ovo 250 g', 'Pena Viva', 14.9, { rating: 4.8, reviews: 63, art: 'tub', color: '#f59e0b', desc: 'Complemento proteico para a muda de penas e a reprodução.' }),
    P('passaro', 'painco', 'petiscos', 'Bastão de Painço e Mel (3 un.)', 'Pena Viva', 16.9, { rating: 4.9, reviews: 92, art: 'box', color: '#d97706', desc: 'Petisco para pendurar na gaiola. Estimula o forrageamento.' }),
    P('passaro', 'banheira', 'higiene', 'Banheira Externa para Pássaros', 'Pata Limpa', 24.9, { rating: 4.5, reviews: 27, art: 'tub', color: '#06b6d4', desc: 'Encaixa na porta da gaiola e evita respingos.' }),
    P('passaro', 'vitamina', 'saude', 'Suplemento Vitamínico em Gotas 20 ml', 'VitaPet', 27.9, { reviews: 58, art: 'bottle', color: '#e11d48', desc: 'Vitaminas A, D3 e E para a água de beber.' }),
    P('passaro', 'poleiro', 'acessorios', 'Poleiro Natural de Madeira', 'Pena Viva', 29.9, { rating: 4.6, reviews: 34, art: 'perch', color: '#92400e', desc: 'Diâmetros variados que exercitam as patas e desgastam as unhas.' }),
    P('passaro', 'gaiola', 'acessorios', 'Gaiola Viveiro Pintada', 'Pena Viva', 249.9, { old: 289.9, rating: 4.8, reviews: 41, art: 'cage', color: '#0284c7', desc: 'Pintura epóxi atóxica, bandeja removível e dois comedouros.' }),

    // Jabuti
    P('jabuti', 'racao', 'racoes', 'Ração para Jabutis e Quelônios Terrestres 300 g', 'Réptil Pro', 39.9, { old: 46.9, rating: 4.7, reviews: 64, art: 'tub', color: '#16a34a', desc: 'Fibras, cálcio e vegetais. Complementa folhas verde-escuras e frutas.' }),
    P('jabuti', 'calcio', 'saude', 'Cálcio em Pó para Répteis', 'Réptil Pro', 34.9, { rating: 4.8, reviews: 88, art: 'tub', color: '#f59e0b', desc: 'Polvilhe sobre a comida 3 vezes por semana para casco e ossos fortes.' }),
    P('jabuti', 'coco', 'higiene', 'Substrato Fibra de Coco 5 L', 'Réptil Pro', 29.9, { reviews: 41, color: '#92400e', desc: 'Mantém a umidade e permite cavar.' }),
    P('jabuti', 'uvb', 'acessorios', 'Lâmpada UVB 10.0 – 26 W', 'Réptil Pro', 129.9, { rating: 4.7, reviews: 57, art: 'lamp', color: '#0284c7', desc: 'Essencial para a síntese de vitamina D3. Troque a cada 6 a 12 meses.' }),
    P('jabuti', 'toca', 'acessorios', 'Toca de Cortiça Natural', 'Réptil Pro', 54.9, { reviews: 22, art: 'house', color: '#78350f', desc: 'Abrigo leve e resistente à umidade.' }),

    // Cobra
    P('cobra', 'alimento', 'racoes', 'Alimento Congelado para Serpentes (5 un.)', 'Réptil Pro', 44.9, { rating: 4.8, reviews: 73, art: 'box', color: '#64748b', desc: 'Presas congeladas de criação controlada. Descongele na geladeira antes de oferecer.' }),
    P('cobra', 'aspen', 'higiene', 'Substrato de Aspen 4 L', 'Réptil Pro', 39.9, { reviews: 48, color: '#d6b98c', desc: 'Lascas macias que a serpente usa para se enterrar.' }),
    P('cobra', 'spray', 'saude', 'Spray para Muda e Umidade 250 ml', 'Réptil Pro', 29.9, { reviews: 35, art: 'bottle', color: '#0891b2', desc: 'Ajuda a soltar a pele velha em mudas difíceis.' }),
    P('cobra', 'placa', 'acessorios', 'Placa Aquecedora 14 W com Termostato', 'Réptil Pro', 139.9, { old: 159.9, rating: 4.7, reviews: 51, art: 'box', color: '#ef4444', desc: 'Calor por baixo, com controle digital de temperatura.' }),
    P('cobra', 'bebedouro', 'acessorios', 'Bebedouro Pedra para Terrário', 'Réptil Pro', 34.9, { reviews: 26, art: 'tub', color: '#78716c', desc: 'Pesado, não vira. Grande o bastante para banhos.' }),

    // Iguana
    P('iguana', 'racao', 'racoes', 'Ração para Iguanas Juvenis 250 g', 'Réptil Pro', 36.9, { rating: 4.6, reviews: 39, art: 'tub', color: '#16a34a', desc: 'Base vegetal com cálcio. Ofereça junto com folhas e legumes frescos.' }),
    P('iguana', 'calcio', 'saude', 'Cálcio + Vitamina D3 em Pó', 'Réptil Pro', 39.9, { rating: 4.8, reviews: 71, art: 'tub', color: '#f59e0b', desc: 'Previne a doença metabólica óssea.' }),
    P('iguana', 'grama', 'higiene', 'Tapete de Grama Sintética para Terrário', 'Réptil Pro', 44.9, { reviews: 24, art: 'box', color: '#65a30d', desc: 'Lavável e sem risco de ingestão de substrato.' }),
    P('iguana', 'uvb', 'acessorios', 'Lâmpada UVB 10.0 – 26 W', 'Réptil Pro', 129.9, { rating: 4.7, reviews: 57, art: 'lamp', color: '#0284c7', desc: 'Luz UVB para absorver cálcio. Use com lâmpada de aquecimento.' }),
    P('iguana', 'galho', 'acessorios', 'Galho Natural para Escalada', 'Réptil Pro', 49.9, { old: 59.9, reviews: 19, art: 'perch', color: '#92400e', desc: 'Iguanas são arborícolas: precisam subir para se aquecer.' }),

    // Peixe
    P('peixe', 'flocos', 'racoes', 'Ração em Flocos para Peixes Tropicais 50 g', 'AquaVida', 19.9, { old: 24.9, rating: 4.8, reviews: 203, art: 'tub', color: '#ea580c', desc: 'Flocos coloridos com spirulina. Ofereça o que comem em 2 minutos.' }),
    P('peixe', 'kinguio', 'racoes', 'Ração para Kinguios 40 g', 'AquaVida', 16.9, { reviews: 118, art: 'tub', color: '#f59e0b', desc: 'Grânulos que afundam devagar, ideais para kinguios.' }),
    P('peixe', 'condicionador', 'higiene', 'Condicionador de Água 120 ml', 'AquaVida', 24.9, { rating: 4.9, reviews: 176, art: 'bottle', color: '#06b6d4', desc: 'Neutraliza cloro e metais pesados da água da torneira.' }),
    P('peixe', 'bacterias', 'higiene', 'Bactérias para Aquário 100 ml', 'AquaVida', 34.9, { reviews: 92, art: 'bottle', color: '#16a34a', desc: 'Acelera a ciclagem e mantém a amônia sob controle.' }),
    P('peixe', 'teste', 'saude', 'Kit Teste de pH, Amônia e Nitrito', 'AquaVida', 59.9, { rating: 4.7, reviews: 64, art: 'box', color: '#7c3aed', desc: 'Faz até 50 testes. Resultado em 5 minutos.' }),
    P('peixe', 'aquario', 'acessorios', 'Aquário 40 L com Filtro e Luminária', 'AquaVida', 299.9, { old: 349.9, rating: 4.8, reviews: 45, art: 'tank', color: '#0284c7', desc: 'Kit completo para começar: filtro, tampa e LED.' }),

    // Cavalo
    P('cavalo', 'racao', 'racoes', 'Ração Equi Forte Performance 40 kg', 'Equi Forte', 159.9, { old: 179.9, rating: 4.8, reviews: 96, color: '#15803d', desc: 'Energia e proteína para cavalos em trabalho, esporte e provas.' }),
    P('cavalo', 'mineral', 'racoes', 'Suplemento Mineral Equino 5 kg', 'Equi Forte', 119.9, { reviews: 54, art: 'tub', color: '#0369a1', desc: 'Cálcio, fósforo e microminerais para ossos, cascos e pelagem.' }),
    P('cavalo', 'petisco', 'petiscos', 'Petisco de Maçã e Cenoura 1 kg', 'Equi Forte', 39.9, { rating: 4.9, reviews: 71, art: 'box', color: '#dc2626', desc: 'Recompensa crocante para treino e manejo.' }),
    P('cavalo', 'shampoo', 'higiene', 'Shampoo Equino Brilho Intenso 1 L', 'Pata Limpa', 54.9, { rating: 4.6, reviews: 43, art: 'bottle', color: '#7c3aed', desc: 'Limpa sem ressecar e deixa crina e cauda desembaraçadas.' }),
    P('cavalo', 'casco', 'higiene', 'Óleo para Cascos 500 ml', 'Equi Forte', 44.9, { reviews: 38, art: 'bottle', color: '#92400e', desc: 'Hidrata e protege os cascos contra rachaduras.' }),
    P('cavalo', 'escova', 'higiene', 'Escova Rasqueadeira', 'Equi Forte', 29.9, { rating: 4.5, reviews: 29, art: 'brush', color: '#0ea5e9', desc: 'Remove sujeira e pelos mortos e massageia a pele.' }),
    P('cavalo', 'vermifugo', 'saude', 'Vermífugo Equino Pasta Oral', 'VitaPet', 34.9, { old: 39.9, rating: 4.8, reviews: 112, art: 'tube', color: '#16a34a', desc: 'Seringa dosadora para até 600 kg de peso vivo.' }),
    P('cavalo', 'cabresto', 'acessorios', 'Cabresto de Nylon Ajustável', 'Equi Forte', 69.9, { rating: 4.6, reviews: 47, art: 'halter', color: '#2563eb', desc: 'Fivelas reforçadas e argola de aço inox. Tamanho cavalo adulto.' }),

    // Rato / gerbil
    P('roedor', 'racao', 'racoes', 'Ração Extrusada para Ratos e Camundongos 500 g', 'Roedor Feliz', 24.9, { old: 29.9, rating: 4.7, reviews: 58, color: '#ca8a04', desc: 'Pellets completos que evitam a seleção de sementes e a obesidade.' }),
    P('roedor', 'mix', 'racoes', 'Mix para Gerbil e Degu 400 g', 'Roedor Feliz', 21.9, { reviews: 33, color: '#65a30d', desc: 'Sementes, ervas e pellets. Para degus, prefira a versão sem açúcar.' }),
    P('roedor', 'petisco', 'petiscos', 'Petisco Bastão de Grãos (2 un.)', 'Roedor Feliz', 13.9, { rating: 4.8, reviews: 41, art: 'box', color: '#d97706', desc: 'Para roer e gastar os dentes.' }),
    P('roedor', 'papel', 'higiene', 'Substrato de Papel Sem Pó 10 L', 'Pata Limpa', 39.9, { reviews: 36, color: '#64748b', desc: 'Protege o sistema respiratório sensível dos ratos.' }),
    P('roedor', 'gaiola', 'acessorios', 'Gaiola Alta com Rede e Plataformas', 'Roedor Feliz', 229.9, { old: 259.9, rating: 4.7, reviews: 22, art: 'cage', color: '#7c3aed', desc: 'Ratos adoram escalar: três andares, rede e rampas.' }),

    // Chinchila
    P('chinchila', 'feno', 'racoes', 'Feno de Alfafa e Timothy 500 g', 'Roedor Feliz', 32.9, { tag: 'Feno', rating: 4.9, reviews: 47, art: 'hay', color: '#65a30d', desc: 'Fibra longa à vontade para dentes e intestino saudáveis.' }),
    P('chinchila', 'racao', 'racoes', 'Ração para Chinchilas 1 kg', 'Roedor Feliz', 44.9, { reviews: 29, color: '#475569', desc: 'Pellets sem frutas secas nem sementes gordurosas.' }),
    P('chinchila', 'po', 'higiene', 'Pó de Banho Vulcânico 1 kg', 'Pata Limpa', 34.9, { old: 39.9, rating: 4.8, reviews: 63, art: 'tub', color: '#a8a29e', desc: 'Chinchilas não tomam banho de água: o pó limpa e solta o pelo.' }),
    P('chinchila', 'pedra', 'saude', 'Pedra Mineral para Roer', 'VitaPet', 14.9, { reviews: 21, art: 'box', color: '#16a34a', desc: 'Cálcio e minerais enquanto desgasta os dentes.' }),
    P('chinchila', 'gaiola', 'acessorios', 'Gaiola Vertical com Prateleiras de Madeira', 'Roedor Feliz', 389.9, { rating: 4.6, reviews: 14, art: 'cage', color: '#0284c7', desc: 'Espaço para saltar, sem pisos de arame.' }),

    // Galinha
    P('galinha', 'postura', 'racoes', 'Ração Postura Caipira 25 kg', 'Campo Forte', 109.9, { old: 124.9, rating: 4.8, reviews: 88, color: '#ca8a04', desc: 'Cálcio e proteína para casca firme e postura regular.' }),
    P('galinha', 'inicial', 'racoes', 'Ração Inicial para Pintinhos 5 kg', 'Campo Forte', 39.9, { tag: 'Filhotes', reviews: 52, color: '#f59e0b', desc: 'Primeiras semanas de vida, com coccidiostático.' }),
    P('galinha', 'maravalha', 'higiene', 'Maravalha para Galinheiro 15 kg', 'Pata Limpa', 34.9, { reviews: 40, color: '#d97706', desc: 'Cama seca que absorve umidade e reduz o odor.' }),
    P('galinha', 'vermifugo', 'saude', 'Vermífugo para Aves na Água 100 ml', 'VitaPet', 29.9, { rating: 4.6, reviews: 31, art: 'bottle', color: '#16a34a', desc: 'Diluir na água de bebida conforme a bula.' }),
    P('galinha', 'bebedouro', 'acessorios', 'Bebedouro Pendular 5 L', 'Campo Forte', 49.9, { reviews: 27, art: 'tub', color: '#0284c7', desc: 'Água sempre limpa e na altura certa.' }),

    // Pato
    P('pato', 'racao', 'racoes', 'Ração para Patos e Marrecos 5 kg', 'Campo Forte', 44.9, { rating: 4.7, reviews: 26, color: '#15803d', desc: 'Grânulos que flutuam, com niacina para pernas fortes.' }),
    P('pato', 'piscina', 'acessorios', 'Piscina Plástica para Aves 120 L', 'Campo Forte', 119.9, { old: 139.9, reviews: 12, art: 'tub', color: '#06b6d4', desc: 'Patos precisam mergulhar a cabeça para limpar olhos e narinas.' }),
    P('pato', 'vitamina', 'saude', 'Suplemento Vitamínico para Aves 100 ml', 'VitaPet', 24.9, { reviews: 18, art: 'bottle', color: '#e11d48', desc: 'Vitaminas A, D3 e E na água de bebida.' }),
    P('pato', 'abrigo', 'acessorios', 'Casinha Abrigo para Patos', 'Campo Forte', 249.9, { reviews: 9, art: 'house', color: '#a16207', desc: 'Protege do frio e de predadores durante a noite.' }),

    // Tartaruga aquática
    P('tartaruga', 'racao', 'racoes', 'Ração para Tartarugas Aquáticas 100 g', 'Réptil Pro', 22.9, { rating: 4.8, reviews: 74, art: 'tub', color: '#16a34a', desc: 'Bastões flutuantes com cálcio e vitamina D3.' }),
    P('tartaruga', 'condicionador', 'higiene', 'Condicionador de Água 120 ml', 'AquaVida', 24.9, { reviews: 46, art: 'bottle', color: '#06b6d4', desc: 'Neutraliza cloro e metais da água da torneira.' }),
    P('tartaruga', 'calcio', 'saude', 'Bloco de Cálcio Flutuante', 'Réptil Pro', 16.9, { reviews: 33, art: 'box', color: '#f59e0b', desc: 'Libera cálcio aos poucos e ajuda a manter o casco firme.' }),
    P('tartaruga', 'uvb', 'acessorios', 'Lâmpada UVB 5.0 – 26 W', 'Réptil Pro', 119.9, { rating: 4.7, reviews: 28, art: 'lamp', color: '#0284c7', desc: 'Para a área seca de descanso do aquaterrário.' }),

    // Anfíbio
    P('anfibio', 'grilos', 'racoes', 'Grilos Desidratados 40 g', 'Réptil Pro', 19.9, { reviews: 22, art: 'tub', color: '#92400e', desc: 'Complemento para sapos e rãs. Prefira presas vivas criadas para alimentação.' }),
    P('anfibio', 'axolote', 'racoes', 'Ração Afundante para Axolotes 100 g', 'AquaVida', 29.9, { reviews: 17, art: 'tub', color: '#ec4899', desc: 'Pellets que afundam devagar, ricos em proteína.' }),
    P('anfibio', 'condicionador', 'higiene', 'Condicionador de Água sem Cloro 120 ml', 'AquaVida', 24.9, { reviews: 31, art: 'bottle', color: '#06b6d4', desc: 'Anfíbios absorvem tudo pela pele: nunca use água da torneira sem tratar.' }),
    P('anfibio', 'musgo', 'acessorios', 'Musgo Sphagnum para Terrário', 'Réptil Pro', 27.9, { reviews: 19, color: '#65a30d', desc: 'Mantém a umidade e serve de esconderijo.' }),

    // Aranha
    P('aranha', 'grilos', 'racoes', 'Grilos Vivos (pote com 30)', 'Réptil Pro', 18.9, { reviews: 25, art: 'tub', color: '#92400e', desc: 'Ofereça presas menores que o corpo da aranha e retire as que sobrarem.' }),
    P('aranha', 'coco', 'higiene', 'Substrato Fibra de Coco 5 L', 'Réptil Pro', 29.9, { reviews: 21, color: '#78350f', desc: 'Permite cavar e mantém a umidade certa.' }),
    P('aranha', 'terrario', 'acessorios', 'Terrário de Acrílico com Ventilação', 'Réptil Pro', 159.9, { old: 179.9, reviews: 11, art: 'tank', color: '#7c3aed', desc: 'Tampa travada e ventilação lateral.' }),

    // Mini porco
    P('porco', 'racao', 'racoes', 'Ração para Mini Porcos 10 kg', 'Campo Forte', 129.9, { old: 149.9, rating: 4.7, reviews: 34, color: '#db2777', desc: 'Baixa caloria e alta fibra para controlar o peso.' }),
    P('porco', 'petisco', 'petiscos', 'Petisco de Legumes Desidratados', 'Bicho Feliz', 19.9, { reviews: 22, art: 'box', color: '#f97316', desc: 'Recompensa saudável para o treino.' }),
    P('porco', 'hidratante', 'higiene', 'Hidratante para Pele de Porcos 200 ml', 'Pata Limpa', 34.9, { reviews: 15, art: 'bottle', color: '#06b6d4', desc: 'A pele de porcos resseca e queima no sol.' }),
    P('porco', 'vermifugo', 'saude', 'Vermífugo para Suínos', 'VitaPet', 29.9, { reviews: 12, art: 'box', color: '#16a34a', desc: 'Dose conforme o peso, orientada pelo veterinário.' }),
    P('porco', 'bola', 'brinquedos', 'Bola de Forrageamento', 'Brinca+', 59.9, { rating: 4.8, reviews: 18, art: 'ball', color: '#8b5cf6', desc: 'Solta ração aos poucos: porcos adoram fuçar.' }),

    // Cabra
    P('cabra', 'racao', 'racoes', 'Ração para Caprinos 30 kg', 'Campo Forte', 99.9, { rating: 4.7, reviews: 29, color: '#a16207', desc: 'Complementa o pasto com proteína e minerais.' }),
    P('cabra', 'sal', 'saude', 'Sal Mineral para Caprinos e Ovinos 25 kg', 'Campo Forte', 119.9, { reviews: 33, art: 'tub', color: '#0369a1', desc: 'Sem excesso de cobre, que é tóxico para ovelhas.' }),
    P('cabra', 'vermifugo', 'saude', 'Vermífugo Oral para Caprinos', 'VitaPet', 39.9, { reviews: 21, art: 'bottle', color: '#16a34a', desc: 'Use conforme o exame OPG para evitar resistência.' }),
    P('cabra', 'colar', 'acessorios', 'Coleira com Sino para Cabras', 'Campo Forte', 29.9, { reviews: 14, art: 'halter', color: '#ec4899', desc: 'Ajustável e reforçada.' }),

    // Ovelha
    P('ovelha', 'racao', 'racoes', 'Ração para Ovinos 30 kg', 'Campo Forte', 99.9, { rating: 4.7, reviews: 26, color: '#64748b', desc: 'Para engorda e matrizes em lactação.' }),
    P('ovelha', 'sal', 'saude', 'Sal Mineral para Caprinos e Ovinos 25 kg', 'Campo Forte', 119.9, { reviews: 33, art: 'tub', color: '#0369a1', desc: 'Sem excesso de cobre, que é tóxico para ovelhas.' }),
    P('ovelha', 'vermifugo', 'saude', 'Vermífugo Oral para Ovinos', 'VitaPet', 39.9, { reviews: 19, art: 'bottle', color: '#16a34a', desc: 'Use conforme o exame OPG e o método Famacha.' }),
    P('ovelha', 'tesoura', 'acessorios', 'Tesoura de Tosquia Manual', 'Campo Forte', 79.9, { reviews: 11, art: 'brush', color: '#475569', desc: 'Aço inox para tosquia e casqueamento.' }),

    // Boi / vaca
    P('bovino', 'racao', 'racoes', 'Ração Bovinos Leite 40 kg', 'Campo Forte', 129.9, { old: 144.9, rating: 4.8, reviews: 61, color: '#15803d', desc: 'Concentrado para vacas em lactação.' }),
    P('bovino', 'sal', 'saude', 'Sal Mineral Bovinos 30 kg', 'Campo Forte', 139.9, { reviews: 47, art: 'tub', color: '#0369a1', desc: 'Fósforo e microminerais para reprodução e ganho de peso.' }),
    P('bovino', 'carrapaticida', 'saude', 'Carrapaticida Pour-on 1 L', 'VitaPet', 159.9, { rating: 4.6, reviews: 38, art: 'bottle', color: '#16a34a', desc: 'Aplicação no dorso. Respeite o período de carência do leite.' }),
    P('bovino', 'cabresto', 'acessorios', 'Cabresto de Corda para Bovinos', 'Campo Forte', 49.9, { reviews: 17, art: 'halter', color: '#92400e', desc: 'Corda trançada resistente para manejo.' }),
  ];

  products.push(...toyOfferings.map(([sp, name, price, color, art]) => P(
    sp, 'brinquedo-enriquecimento', 'brinquedos', name, 'Brinca+', price,
    { color, art, desc: 'Brinquedo de enriquecimento para o habitat. Supervisione o uso e confira o estado do produto regularmente.' },
  )));

  const brands = [
    { name: 'Royal Canin', kind: 'Alimentação', color: '#dc2626', font: 'sans', url: 'https://www.royalcanin.com/br' },
    { name: 'PremieRpet', kind: 'Alimentação', color: '#1d4ed8', font: 'logo', url: 'https://premierpet.com.br/' },
    { name: 'Purina', kind: 'Alimentação', color: '#b91c1c', font: 'sans', url: 'https://purina.com.br/nossas-marcas' },
    { name: "Hill's", kind: 'Alimentação', color: '#15803d', font: 'sans', url: 'https://www.hillsvet.com.br/' },
    { name: 'GranPlus', kind: 'Alimentação', color: '#ea580c', font: 'logo', url: 'https://granplus.com.br/pt' },
    { name: 'Special Dog Company', kind: 'Alimentação', color: '#7c2d12', font: 'sans', url: 'https://www.specialdog.com.br/' },
    { name: 'Vetnil', kind: 'Saúde animal', color: '#0284c7', font: 'logo', url: 'https://vetnil.com.br/' },
    { name: 'Ourofino Saúde Animal', kind: 'Saúde animal', color: '#15803d', font: 'sans', url: 'https://www.ourofinosaudeanimal.com/' },
    { name: 'Seres', kind: 'Atendimento veterinário', color: '#0e7490', font: 'logo', url: 'https://www.petz.com.br/seres' },
    { name: 'Cobasi', kind: 'Lojas e clínicas', color: '#ea580c', font: 'logo', url: 'https://www.cobasi.com.br/institucional/veterinarios' },
  ];

  /* ---------------------------------------------------------------- Cuidados */
  // Ficha rápida da espécie + dicas (usadas no perfil do pet e em "Dicas e conteúdos")
  const care = {
    cachorro: { food: 'Ração completa para a fase de vida', home: 'Passeios diários e cantinho próprio', alert: 'Vômito, apatia ou falta de apetite por mais de 24 h' },
    gato: { food: 'Ração seca + sachê para hidratação', home: 'Telas nas janelas e caixa de areia limpa', alert: 'Xixi fora da caixa ou esforço para urinar' },
    coelho: { food: '80% feno, folhas verdes e pouca ração', home: 'Espaço para correr e se esconder', alert: 'Parar de comer ou de fazer cocô por 12 h é emergência' },
    hamster: { food: 'Mix de sementes, pellets e pedacinhos de legumes', home: 'Gaiola ampla, roda e substrato fundo', alert: 'Rabo molhado, diarreia ou feridas' },
    porquinho: { food: 'Feno à vontade e vitamina C diária', home: 'Sempre em dupla: são animais sociais', alert: 'Perda de peso ou dificuldade para comer' },
    furao: { food: 'Ração rica em proteína animal', home: 'Horas de brincadeira fora da gaiola', alert: 'Queda de pelo na cauda ou fraqueza' },
    hamster: { 'Sírio': B('hamster-sirio'), 'Anão Russo': B('hamster-russo'), Roborovski: B('hamster-roborovski'), 'Sírio de pelo longo (Angorá)': B('hamster-angora') },
    roedor: { 'Rato twister': B('roedor-rato-twister'), 'Rato dumbo': B('roedor-rato-dumbo'), 'Gerbil (esquilo-da-mongólia)': B('roedor-gerbil'), Degu: B('roedor-degu') },
    chinchila: { 'Padrão (cinza)': B('chinchila-padrao-cinza'), Bege: B('chinchila-bege'), 'Branca (Wilson)': B('chinchila-branca-wilson'), Ébano: B('chinchila-ebano') },
    porquinho: { 'Inglês (pelo curto)': B('porquinho-ingles-pelo-curto'), Abissínio: B('porquinho-abissinio'), Peruano: B('porquinho-peruano'), Rex: B('porquinho-rex') },
    furao: { Sable: B('furao-sable'), Albino: B('furao-albino'), Canela: B('furao-canela'), Champagne: B('furao-champagne') },
    pato: { 'Pato-de-pequim': { male: B('pato-pequim'), female: B('pato-pequim-f') }, 'Pato-real (Mallard)': { male: B('pato-mallard'), female: B('pato-mallard-f') }, 'Pato-corredor-indiano': { male: B('pato-corredor-indiano'), female: B('pato-corredor-indiano-f') }, Marreco: { male: B('pato-marreco'), female: B('pato-marreco-f') } },
    jabuti: { 'Jabuti-piranga': B('jabuti-piranga'), 'Jabuti-tinga': B('jabuti-tinga') },
    tartaruga: { 'Tigre-d\'água': B('tartaruga-tigre-dagua'), 'Cágado-de-barbicha': B('jabuti-cagado-barbicha') },
    passaro: { food: 'Ração extrusada, sementes e frutas', home: 'Gaiola espaçosa, longe de correntes de ar', alert: 'Penas eriçadas e sono durante o dia' },
    jabuti: { food: 'Folhas escuras, legumes e frutas', home: 'Sol ou luz UVB e área para cavar', alert: 'Casco mole ou olhos inchados' },
    cobra: { food: 'Presas congeladas no tamanho certo', home: 'Terrário trancado com gradiente de calor', alert: 'Bolhas na boca ou respiração com chiado' },
    peixe: { food: 'Pouca ração, 1 a 2 vezes ao dia', home: 'Aquário ciclado, filtro e aquecedor', alert: 'Manchas brancas ou nadar de lado' },
    cavalo: { food: 'Volumoso (feno/capim) + concentrado', home: 'Piquete, baia limpa e água à vontade', alert: 'Rolar no chão e olhar para a barriga (cólica)' },
    roedor: { food: 'Ração extrusada, legumes e pouca fruta', home: 'Gaiola alta e ampla, com rede e esconderijos', alert: 'Espirros, chiado ou porfirina (secreção vermelha) nos olhos' },
    chinchila: { food: 'Feno à vontade e pouca ração', home: 'Ambiente fresco (até 24 °C) e banho de pó', alert: 'Parar de comer ou fazer cocôs pequenos' },
    galinha: { food: 'Ração de postura, verduras e milho com moderação', home: 'Galinheiro seco, poleiros e ninho', alert: 'Crista pálida, espirros ou diarreia' },
    pato: { food: 'Ração para aves aquáticas e verduras', home: 'Água para mergulhar a cabeça e abrigo à noite', alert: 'Mancar ou não conseguir ficar em pé' },
    tartaruga: { food: 'Ração com cálcio, peixinhos e verduras', home: 'Aquaterrário com filtro, área seca e UVB', alert: 'Olhos inchados ou casco mole' },
    iguana: { food: 'Iguana: vegetais. Gecko e pogona: insetos e verduras', home: 'Terrário com UVB e ponto quente na temperatura da espécie', alert: 'Tremores, mandíbula mole ou patas tortas' },
    anfibio: { food: 'Insetos ou ração específica da espécie', home: 'Água sem cloro, umidade alta e pouca luz', alert: 'Pele opaca, inchaço ou vermelhidão' },
    aranha: { food: 'Grilos ou baratas, 1 a 2 vezes por semana', home: 'Terrário fechado, substrato e potinho de água', alert: 'Ficar de barriga para cima fora da época de muda' },
    porco: { food: 'Ração para mini porco, verduras e muita fibra', home: 'Área para fuçar, sombra e cama macia', alert: 'Perda de apetite ou febre (orelhas quentes)' },
    cabra: { food: 'Pasto, feno, ração e sal mineral', home: 'Abrigo seco e alto: cabras odeiam chuva', alert: 'Mucosa do olho pálida (verminose) ou barriga inchada' },
    ovelha: { food: 'Pasto, feno, ração e sal mineral sem cobre', home: 'Pasto com sombra e abrigo', alert: 'Mucosa do olho pálida (verminose) ou isolamento do rebanho' },
    bovino: { food: 'Pasto ou volumoso, concentrado e sal mineral', home: 'Pasto com sombra, água limpa e curral seguro', alert: 'Parar de ruminar, barriga inchada ou febre' },
  };

  const tips = {
    cachorro: [
      ['Passeios diários', 'Pelo menos 30 minutos por dia ajudam a controlar o peso e reduzem a ansiedade.'],
      ['Escove os dentes', 'Três vezes por semana com creme dental veterinário previne tártaro e mau hálito.'],
      ['Chocolate é proibido', 'Teobromina é tóxica para cães. Uva, cebola e xilitol também.'],
      ['Vermífugo a cada 3 meses', 'Mesmo cães que vivem em apartamento pegam vermes pelo contato com a rua.'],
    ],
    gato: [
      ['Água corrente', 'Gatos bebem mais em fontes. Isso protege rins e trato urinário.'],
      ['Uma caixa por gato + 1', 'Evita brigas e xixi fora do lugar em casas com vários gatos.'],
      ['Telas nas janelas', 'Quedas são uma das principais emergências felinas em apartamentos.'],
      ['Arranhar é natural', 'Ofereça arranhadores verticais e horizontais para proteger os móveis.'],
    ],
    coelho: [
      ['Feno o dia todo', 'Feno deve ser 80% da dieta. Ração é complemento, não base.'],
      ['Nunca pegue pelas orelhas', 'Apoie o peito e as patas traseiras: a coluna do coelho é frágil.'],
      ['Proteja os fios', 'Coelhos roem tudo. Esconda cabos e plantas tóxicas.'],
      ['Castração', 'Reduz marcação de território e previne câncer de útero nas fêmeas.'],
    ],
    hamster: [
      ['Animal noturno', 'Não acorde o hamster durante o dia; ele fica estressado e pode morder.'],
      ['Sozinho é melhor', 'Hamsters sírios brigam com outros adultos. Um por gaiola.'],
      ['Nada de bola de acrílico', 'Ela limita a visão e superaquece. Prefira a roda e um cercadinho.'],
      ['Substrato fundo', 'Pelo menos 15 cm para cavar tocas, como fariam na natureza.'],
    ],
    porquinho: [
      ['Vitamina C todos os dias', 'Pimentão, couve e suplemento previnem o escorbuto.'],
      ['Sempre em dupla', 'Porquinhos sozinhos ficam deprimidos. Adote em pares do mesmo sexo.'],
      ['Pesagem semanal', 'Perda de peso é o primeiro sinal de doença.'],
      ['Sem banho frequente', 'Banho só quando necessário, com secagem completa.'],
    ],
    furao: [
      ['Casa à prova de furão', 'Eles entram em qualquer buraco: feche frestas atrás de móveis e eletrodomésticos.'],
      ['Carnívoro estrito', 'Frutas e açúcar podem causar insulinoma.'],
      ['Dormem muito', '14 a 18 horas por dia é normal. Ofereça uma rede ou cama macia.'],
      ['Cuidado com o calor', 'Acima de 30 °C furões sofrem com hipertermia.'],
    ],
    passaro: [
      ['Banho de sol', '15 minutos de sol da manhã ajudam na síntese de vitamina D.'],
      ['Gaiola espaçosa', 'A ave precisa abrir totalmente as asas e voar de um poleiro a outro.'],
      ['Sinais discretos', 'Penas eriçadas e sonolência durante o dia pedem visita ao veterinário.'],
      ['Teflon é perigoso', 'Panelas antiaderentes superaquecidas soltam gases tóxicos para aves.'],
    ],
    jabuti: [
      ['Sol ou UVB todo dia', 'Sem UVB o casco fica mole e deformado.'],
      ['Banho morno semanal', 'Ajuda na hidratação e no funcionamento do intestino.'],
      ['Origem legal', 'Jabutis precisam de nota fiscal e registro do criadouro autorizado pelo Ibama.'],
      ['Variedade no prato', 'Folhas escuras, abóbora, flores de hibisco e pouca fruta.'],
    ],
    cobra: [
      ['Gradiente de temperatura', 'Um lado quente (31–32 °C) e um lado frio (25–27 °C) no terrário.'],
      ['Não alimente presa viva', 'Presas vivas podem ferir a serpente. Use congeladas e descongeladas.'],
      ['Tampa sempre trancada', 'Serpentes são mestres em fugir.'],
      ['Respeite a muda', 'Olhos azulados indicam muda chegando; evite manusear nesses dias.'],
    ],
    iguana: [
      ['Dieta vegetal', 'Iguanas são herbívoras: proteína animal causa problemas renais.'],
      ['UVB e calor', 'Sem luz UVB a iguana desenvolve doença óssea em poucos meses.'],
      ['Terrário vertical', 'Elas gostam de altura. Ofereça galhos para escalar.'],
      ['Origem legal', 'Compre apenas de criadouros autorizados, com nota e registro.'],
    ],
    peixe: [
      ['Cicle o aquário', 'Espere 3 a 4 semanas com bactérias antes de colocar os peixes.'],
      ['Menos ração é mais', 'Sobras apodrecem e intoxicam a água.'],
      ['Troca parcial', 'Troque 20% da água por semana, sempre com condicionador.'],
      ['Quarentena', 'Peixes novos devem ficar 2 semanas separados antes de entrar no aquário.'],
    ],
    cavalo: [
      ['GTA em dia', 'AIE e Mormo negativos são exigidos para transportar seu cavalo.'],
      ['Casqueamento regular', 'A cada 30 a 45 dias, para evitar lesões e problemas de aprumo.'],
      ['Volumoso primeiro', 'Feno e capim devem ser a base da dieta; a ração complementa.'],
      ['Dentes a cada ano', 'Pontas dentárias machucam a boca e atrapalham a mastigação.'],
    ],
    roedor: [
      ['Nunca sozinhos', 'Ratos e gerbils são sociais: mantenha pelo menos dois do mesmo sexo.'],
      ['Sem serragem de pinho', 'O pó e o cheiro forte irritam as vias respiratórias. Use papel.'],
      ['Brincar todo dia', 'Ratos aprendem truques e gostam de passear fora da gaiola com supervisão.'],
      ['Gerbil não toma banho', 'Ofereça areia para banho seco, como fazem na natureza.'],
    ],
    chinchila: [
      ['Banho só de pó', 'Água encharca a pelagem densa e causa fungos.'],
      ['Calor é perigoso', 'Acima de 25 °C a chinchila pode ter insolação.'],
      ['Feno à vontade', 'A dieta deve ser quase toda feno para os dentes não crescerem demais.'],
      ['Animal noturno', 'Respeite o sono durante o dia.'],
    ],
    galinha: [
      ['Cálcio para a casca', 'Ofereça farinha de casca de ostra à parte para galinhas poedeiras.'],
      ['Galinheiro fechado à noite', 'Gambás e cachorros são os principais predadores.'],
      ['Vacinas no início da vida', 'Marek, Newcastle e Gumboro são dadas nas primeiras semanas.'],
      ['Banho de terra', 'Deixe uma área de terra seca: é assim que elas se livram de piolhos.'],
    ],
    pato: [
      ['Água para mergulhar a cabeça', 'Patos limpam olhos e narinas na água; só beber não basta.'],
      ['Pão faz mal', 'Pão causa deficiência nutricional e deformidade nas asas.'],
      ['Abrigo à noite', 'Proteja de predadores e do frio.'],
      ['Chão macio', 'Pisos duros e ásperos causam calos nas patas.'],
    ],
    tartaruga: [
      ['Filtro forte', 'Tartarugas sujam muito a água: o filtro deve ter o dobro da capacidade do aquário.'],
      ['Área seca com UVB', 'Elas precisam sair da água para se aquecer e sintetizar vitamina D.'],
      ['Lave as mãos', 'Répteis podem transmitir salmonela.'],
      ['Origem legal', 'Compre apenas de criadouros autorizados pelo Ibama.'],
    ],
    anfibio: [
      ['Pele sensível', 'Evite pegar com as mãos; sabonete e protetor solar fazem mal a eles.'],
      ['Água tratada sempre', 'Cloro da água da torneira pode matar anfíbios.'],
      ['Axolote gosta de frio', 'Mantenha a água entre 16 e 20 °C.'],
      ['Origem legal', 'Espécies nativas exigem registro e nota do criadouro.'],
    ],
    aranha: [
      ['Pouco manuseio', 'Quedas pequenas podem romper o abdômen da aranha.'],
      ['Época de muda', 'Antes da muda ela para de comer. Não ofereça presas vivas nesse período.'],
      ['Potinho de água', 'Mesmo espécies de clima seco precisam beber.'],
      ['Pelos urticantes', 'Algumas tarântulas soltam pelos que irritam a pele e os olhos.'],
    ],
    porco: [
      ['Cresce mais do que parece', 'Um mini porco adulto pode passar de 40 kg.'],
      ['Fuçar é natural', 'Ofereça uma área com terra ou brinquedos de forrageamento.'],
      ['Protetor solar', 'Porcos de pele clara se queimam: ofereça sombra e lama.'],
      ['Cascos e presas', 'Casqueamento e corte das presas dos machos com o veterinário.'],
    ],
    cabra: [
      ['Verminose é o maior risco', 'Faça o exame OPG e use o método Famacha antes de vermifugar.'],
      ['Nunca sozinha', 'Cabras são de rebanho e ficam estressadas isoladas.'],
      ['Cascos a cada 2 meses', 'Cascos compridos causam manqueira.'],
      ['Plantas tóxicas', 'Cuidado com espirradeira, azaleia e mandioca brava.'],
    ],
    ovelha: [
      ['Verminose é o maior risco', 'Faça o exame OPG e use o método Famacha antes de vermifugar.'],
      ['Sal mineral certo', 'Ovelhas são sensíveis a cobre; use sal próprio para ovinos.'],
      ['Tosquia anual', 'Raças lanadas precisam de tosquia antes do verão.'],
      ['Clostridioses', 'Vacine as ovelhas cerca de 30 dias antes do parto para proteger os cordeiros.'],
    ],
    bovino: [
      ['Brucelose obrigatória', 'Bezerras de 3 a 8 meses devem ser vacinadas por veterinário cadastrado.'],
      ['GTA para transportar', 'Leve a carteira de vacinação em dia para emitir a guia de trânsito.'],
      ['Água limpa à vontade', 'Uma vaca leiteira bebe mais de 60 litros por dia.'],
      ['Febre aftosa', 'O Brasil é livre de aftosa sem vacinação: não é mais preciso vacinar.'],
    ],
  };

  // Orientações alimentares por espécie; consulte veterinário para um plano individual.
  const nutritionTips = {
    cachorro: [['Alimentos tóxicos', 'Chocolate, uvas e passas, cebola, alho e xilitol podem intoxicar cães. Procure orientação veterinária se houver ingestão.'], ['Petiscos com moderação', 'Prefira petiscos próprios, evite restos temperados e ossos cozidos e não troque a ração de repente.']],
    gato: [['Alimentos perigosos', 'Cebola, alho, chocolate, álcool e cafeína podem fazer mal. Mantenha água fresca.'], ['Dieta completa', 'Escolha alimento completo adequado à fase de vida. Comida caseira não deve substituir a dieta sem orientação veterinária.']],
    coelho: [['Feno sempre disponível', 'Feno de capim é a base; complemente com folhas seguras e pellets próprios em quantidade adequada.'], ['Introdução gradual', 'Frutas devem ser limitadas. Confirme se folhas e plantas são seguras e introduza novidades aos poucos.']],
    hamster: [['Alimento próprio', 'Use alimento completo formulado para hamster; vegetais seguros podem entrar em pequenas porções. Retire sobras frescas.'], ['Evite doces e sal', 'Não ofereça chocolate ou alimentos salgados. Frutas e sementes gordurosas são apenas ocasionais.']],
    roedor: [['Dieta específica', 'Ratos, camundongos, gerbils e degus têm necessidades diferentes. Escolha alimento completo para a espécie.'], ['Petiscos em pequenas porções', 'Vegetais seguros podem complementar. Evite doces e alimentos salgados; consulte veterinário de exóticos.']],
    chinchila: [['Feno e pellets próprios', 'Mantenha feno de gramínea disponível e use alimento formulado para chinchilas.'], ['Evite excesso de açúcar', 'Frutas, sementes, nozes e petiscos doces não devem ser frequentes. Descarte alimento úmido ou mofado.']],
    porquinho: [['Feno e vitamina C', 'Ofereça feno à vontade, pellets próprios com vitamina C e vegetais adequados. Confira validade do alimento.'], ['Mudanças graduais', 'Introduza vegetais aos poucos. Não ofereça chocolate, cebola, alho ou alimentos processados.']],
    furao: [['Dieta de carnívoro', 'Use alimento completo formulado para furões. Dietas caseiras devem ser planejadas com veterinário experiente.'], ['Evite doces e frutas', 'Não ofereça açúcar, frutas, pão ou leite; evite trocas bruscas de alimento.']],
    passaro: [['Alimento adequado à ave', 'A dieta depende da espécie. Sementes não são automaticamente a base ideal; converse com veterinário de aves.'], ['Evite alimentos tóxicos', 'Não ofereça chocolate, cafeína, álcool, abacate, cebola ou comida muito salgada e doce.']],
    galinha: [['Ração conforme a fase', 'Use ração completa adequada à idade e finalidade. Milho e restos não substituem dieta balanceada.'], ['Água e alimento frescos', 'Mantenha água limpa e descarte comida úmida ou mofada. Evite restos muito salgados ou temperados.']],
    pato: [['Alimento para aves aquáticas', 'Prefira ração formulada para patos e para a fase de vida. Pão não é alimento completo nem deve ser rotina.'], ['Sem sobras estragadas', 'Disponibilize água limpa e descarte comida mofada, salgada ou temperada.']],
    jabuti: [['Vegetais adequados à espécie', 'A proporção de folhas e outros vegetais varia. Confirme a dieta com veterinário de répteis.'], ['Evite improvisar', 'Não baseie a dieta em frutas ou alimento de outros animais; variedade depende da espécie.']],
    tartaruga: [['Dieta conforme espécie e idade', 'A necessidade de proteína e vegetais varia. Use alimento apropriado e peça orientação de veterinário de répteis.'], ['Não ofereça pão', 'Evite comida temperada e retire sobras para preservar a qualidade da água.']],
    cobra: [['Presa adequada', 'Tamanho e intervalo dependem da espécie, idade e condição corporal. Siga o plano de veterinário de répteis.'], ['Alimentação segura', 'Use presas de origem confiável, descongeladas com segurança. Presas vivas podem ferir a cobra.']],
    iguana: [['Não confunda as espécies', 'Iguanas são herbívoras; geckos e pogonas têm outras necessidades. Identifique o animal antes de escolher.'], ['Dieta vegetal', 'Não ofereça carne, insetos ou ração de cão e gato à iguana. Consulte especialista sobre vegetais e suplementos.']],
    anfibio: [['Dieta específica', 'Axolotes, sapos e pererecas não comem a mesma coisa. Escolha alimento adequado à espécie e ao tamanho.'], ['Retire sobras', 'Use alimento de origem segura; frequência e suplementos devem ser definidos com veterinário de exóticos.']],
    aranha: [['Presas de origem segura', 'Tipo e tamanho dependem da espécie. Use insetos de criação confiável, sem exposição a pesticidas.'], ['Respeite a muda', 'A aranha pode recusar alimento antes da muda. Retire presas não consumidas para evitar ferimentos.']],
    peixe: [['Alimento conforme a espécie', 'Peixes herbívoros, onívoros e carnívoros precisam de dietas diferentes. Escolha alimento adequado.'], ['Evite sobras', 'Ofereça apenas o que será consumido rapidamente. Excesso de ração prejudica a água.']],
    cavalo: [['Forragem como base', 'Capim e feno de boa qualidade são fundamentais. Concentrados devem ser calculados individualmente.'], ['Mudanças graduais', 'Altere a dieta aos poucos, mantenha água limpa e evite plantas desconhecidas e alimento mofado.']],
    porco: [['Alimento completo', 'Use ração formulada para mini porcos e adequada à fase de vida; restos de cozinha não garantem equilíbrio.'], ['Controle os extras', 'Petiscos em excesso favorecem ganho de peso. Evite comida mofada, salgada ou temperada.']],
    cabra: [['Alimento e mineral caprinos', 'Pasto e feno de qualidade são importantes. Use suplemento mineral formulado para caprinos.'], ['Cuidado com plantas', 'Evite plantas desconhecidas e alimento mofado. Ajustes de dieta precisam de orientação técnica.']],
    ovelha: [['Mineral formulado para ovinos', 'O cobre pode ser perigoso para ovelhas; não compartilhe suplemento de bovinos ou caprinos.'], ['Pasto e feno de qualidade', 'Mude a dieta gradualmente e descarte alimento mofado. A quantidade de concentrado depende da fase.']],
    bovino: [['Dieta conforme a categoria', 'Pasto, volumoso, concentrado e minerais devem ser ajustados à fase e ao objetivo com apoio técnico.'], ['Evite mudanças bruscas', 'Alterações rápidas de grãos podem causar problemas digestivos. Mantenha água limpa e evite alimento mofado.']],
  };
  Object.entries(nutritionTips).forEach(([sp, items]) => {
    tips[sp] = [...(tips[sp] || []), ...items];
  });

  const articles = [
    ['Calendário de vacinas: o que é obrigatório?', 'Antirrábica é obrigatória por lei para cães e gatos. As demais dependem da espécie e do estilo de vida.', 'syringe'],
    ['Pets exóticos legalizados', 'Répteis, aves silvestres e alguns mamíferos precisam de origem comprovada e registro.', 'shield'],
    ['Como montar um kit de primeiros socorros', 'Gaze, soro fisiológico, luvas e o telefone do veterinário 24 h sempre à mão.', 'help'],
    ['Viagem com pets', 'Atestado de saúde, carteira de vacinação e caixa de transporte adequada.', 'truck'],
  ];

  const faq = [
    ['Preciso cadastrar as vacinas uma por uma?', 'Não. Ao cadastrar o pet com a data de nascimento, o app já monta o calendário completo da espécie, com cada dose e a idade certa. Você só marca as que ele já tomou.'],
    ['Como registro uma vacina antiga?', 'Abra a carteira do pet, toque na vacina e em “Marcar como tomada” na dose. Você pode escolher qualquer data passada.'],
    ['Preciso criar conta?', 'Não. Este é um protótipo de demonstração: tudo fica salvo só no seu navegador. Use “Restaurar exemplo” para voltar ao perfil inicial.'],
    ['Posso cadastrar mais de um pet?', 'Sim! Cadastre quantos quiser, de espécies diferentes. Cada um tem perfil, carteira, lembretes e loja próprios.'],
    ['O app substitui a carteira do veterinário?', 'Ele organiza e lembra as doses, mas a carteira assinada pelo veterinário continua sendo o documento oficial.'],
    ['Como funciona a loja?', 'Os produtos mudam conforme o pet selecionado. A entrega é feita em até 2 dias úteis nas capitais.'],
    ['Quais formas de pagamento são aceitas?', 'Cartão de crédito, Pix e boleto.'],
  ];

  /* ---------------------------------------------------------------- Ícones */
  const ICONS = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    syringe: '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    cart: '<path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    bulb: '<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    bone: '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M8 7c0-1.2.8-2 2-2M13 7c0-1.8 1-3 2.5-3.5"/>',
    drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    steth: '<path d="M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1"/>',
    arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    home2: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
    sparkle: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    fish: '<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5M7 10.67C5.5 9 2 8 2 8s1 3 1 4-1 4-1 4 3.5-1 5-2.67"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    weight: '<circle cx="12" cy="5" r="3"/><path d="M6.5 8a2 2 0 0 0-1.9 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.93-2.54l-2.5-9A2 2 0 0 0 17.5 8Z"/>',
    cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/>',
  };
  const icon = (name, size = 20, sw = 2) =>
    `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const paw = (size = 20) =>
    `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="5.2" cy="10.2" rx="2.2" ry="2.8" transform="rotate(-18 5.2 10.2)"/><ellipse cx="9.3" cy="5.6" rx="2.3" ry="3"/><ellipse cx="14.7" cy="5.6" rx="2.3" ry="3"/><ellipse cx="18.8" cy="10.2" rx="2.2" ry="2.8" transform="rotate(18 18.8 10.2)"/><path d="M12 11.5c-3.2 0-6.2 3.6-6.2 6.4 0 1.8 1.3 2.8 3 2.8 1.4 0 2.1-.7 3.2-.7s1.8.7 3.2.7c1.7 0 3-1 3-2.8 0-2.8-3-6.4-6.2-6.4z"/></svg>`;

  /* ------------------------------------------------- Ilustrações dos produtos */
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
    return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
  };

  const ART = {
    bag: (c, sp) => `
      <path d="M24 16h52l5 10 4 78q0 8-8 8H23q-8 0-8-8l4-78z" fill="${c}"/>
      <path d="M24 16h52l5 10H19z" fill="${shade(c, -0.25)}"/>
      <path d="M20 30h4l-3 74h-4z" fill="#fff" opacity=".12"/>
      <rect x="27" y="36" width="46" height="44" rx="12" fill="#fff"/>
      <image href="${species[sp].img}" x="28" y="36" width="44" height="44"/>
      <rect x="25" y="87" width="50" height="7" rx="3.5" fill="#fff" opacity=".9"/>
      <rect x="33" y="98" width="34" height="5" rx="2.5" fill="#fff" opacity=".55"/>`,
    box: (c, sp) => `
      <path d="M22 36l10-14h52l-10 14z" fill="${shade(c, 0.25)}"/>
      <path d="M74 36l10-14v68l-10 14z" fill="${shade(c, -0.3)}"/>
      <rect x="22" y="36" width="52" height="68" rx="4" fill="${c}"/>
      <circle cx="48" cy="62" r="17" fill="#fff"/>
      <image href="${species[sp].img}" x="32" y="45" width="32" height="32"/>
      <rect x="30" y="86" width="36" height="6" rx="3" fill="#fff" opacity=".85"/>`,
    bottle: (c) => `
      <rect x="42" y="8" width="16" height="13" rx="3" fill="#334155"/>
      <path d="M38 21h24v9q14 7 14 22v52q0 8-8 8H32q-8 0-8-8V52q0-15 14-22z" fill="${c}"/>
      <path d="M30 52q0-12 10-17v70h-6q-4 0-4-4z" fill="#fff" opacity=".15"/>
      <rect x="31" y="58" width="38" height="32" rx="7" fill="#fff" opacity=".92"/>
      <circle cx="50" cy="70" r="6" fill="${c}"/>
      <rect x="40" y="80" width="20" height="4" rx="2" fill="${shade(c, 0.4)}"/>`,
    tube: (c) => `
      <g transform="rotate(-28 50 60)">
        <rect x="40" y="10" width="20" height="14" rx="3" fill="#334155"/>
        <path d="M34 24h32l4 76H30z" fill="${c}"/>
        <rect x="28" y="98" width="44" height="8" rx="2" fill="${shade(c, -0.25)}"/>
        <rect x="38" y="44" width="24" height="34" rx="6" fill="#fff" opacity=".9"/>
      </g>`,
    ball: (c) => `
      <ellipse cx="50" cy="106" rx="30" ry="5" fill="#0f172a" opacity=".1"/>
      <circle cx="50" cy="62" r="40" fill="${c}"/>
      <path d="M22 34c16 16 16 40 0 56M78 34c-16 16-16 40 0 56" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>
      <ellipse cx="36" cy="42" rx="10" ry="6" fill="#fff" opacity=".3" transform="rotate(-35 36 42)"/>`,
    bone: (c) => `
      <g transform="rotate(-30 50 60)">
        <path d="M30 50a12 12 0 1 1 6-20 12 12 0 1 1 10 18h8a12 12 0 1 1 10-18 12 12 0 1 1 6 20 12 12 0 1 1-6 20 12 12 0 1 1-10-18h-8a12 12 0 1 1-10 18 12 12 0 1 1-6-20z" fill="${shade(c, 0.55)}" stroke="${c}" stroke-width="4" transform="translate(0 10)"/>
      </g>`,
    rope: (c) => `
      <circle cx="22" cy="60" r="13" fill="${shade(c, -0.2)}"/><circle cx="78" cy="60" r="13" fill="${shade(c, -0.2)}"/>
      <rect x="24" y="52" width="52" height="16" rx="8" fill="${c}"/>
      <path d="M32 52l8 16M44 52l8 16M56 52l8 16" stroke="#fff" stroke-width="4" opacity=".7"/>
      <path d="M10 66q-6 14 2 22M90 66q6 14-2 22" stroke="${shade(c, -0.2)}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    feather: (c) => `
      <path d="M18 108 66 30" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
      <path d="M66 30c10-18 24-22 24-22s4 20-10 36c-8 10-22 14-22 14s-4-14 8-28z" fill="${c}"/>
      <path d="M60 46c-8-8-24-8-24-8s0 16 12 24" fill="${shade(c, 0.3)}"/>
      <circle cx="18" cy="108" r="5" fill="#f59e0b"/>`,
    tower: (c) => `
      <rect x="18" y="100" width="64" height="10" rx="4" fill="${shade(c, -0.2)}"/>
      <rect x="40" y="34" width="20" height="68" fill="#d6b98c"/>
      <path d="M40 44h20M40 54h20M40 64h20M40 74h20M40 84h20M40 94h20" stroke="#b08a57" stroke-width="2"/>
      <rect x="20" y="22" width="60" height="14" rx="5" fill="${c}"/>
      <path d="M70 36v22" stroke="#334155" stroke-width="2"/><circle cx="70" cy="62" r="6" fill="#ef4444"/>`,
    tub: (c) => `
      <path d="M26 30h48" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
      <path d="M22 40h56l-6 64q-1 6-7 6H35q-6 0-7-6z" fill="${c}"/>
      <rect x="18" y="34" width="64" height="12" rx="5" fill="${shade(c, -0.25)}"/>
      <rect x="32" y="62" width="36" height="28" rx="6" fill="#fff" opacity=".9"/>
      <circle cx="50" cy="76" r="6" fill="${c}"/>`,
    brush: (c) => `
      <ellipse cx="50" cy="56" rx="38" ry="24" fill="${c}"/>
      <path d="M24 46h52" stroke="#fff" stroke-width="4" opacity=".35" stroke-linecap="round"/>
      <path d="M20 76v14M28 79v14M36 80v14M44 81v14M52 81v14M60 81v14M68 80v14M76 79v14" stroke="#334155" stroke-width="3" stroke-linecap="round"/>`,
    halter: (c) => `
      <path d="M30 22c-14 20-12 52 6 70M70 22c14 20 12 52-6 70" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M30 52h40M36 92h28" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="50" cy="100" r="8" fill="none" stroke="#94a3b8" stroke-width="4"/>
      <rect x="25" y="47" width="10" height="10" rx="2" fill="#94a3b8"/><rect x="65" y="47" width="10" height="10" rx="2" fill="#94a3b8"/>`,
    perch: (c) => `
      <path d="M10 70q20-8 40 0t40-4" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M36 66q-4-16 6-26M64 70q6-14 18-16" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="44" cy="38" rx="8" ry="5" fill="#16a34a" transform="rotate(-30 44 38)"/><ellipse cx="84" cy="54" rx="8" ry="5" fill="#22c55e" transform="rotate(20 84 54)"/>`,
    cage: (c, sp) => `
      <path d="M50 6v8" stroke="#334155" stroke-width="3"/><circle cx="50" cy="6" r="4" fill="none" stroke="#334155" stroke-width="3"/>
      <path d="M18 104V50a32 32 0 0 1 64 0v54" fill="${shade(c, 0.85)}" stroke="${c}" stroke-width="4"/>
      <path d="M30 104V40M42 104V22M50 104V18M58 104V22M70 104V40" stroke="${c}" stroke-width="2.5"/>
      <path d="M30 76h40" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
      <image href="${species[sp].img}" x="36" y="50" width="28" height="28"/>
      <rect x="12" y="102" width="76" height="10" rx="4" fill="${c}"/>`,
    hay: (c) => `
      <rect x="16" y="40" width="68" height="62" rx="8" fill="${shade(c, 0.35)}"/>
      <path d="M22 44l6 54M32 42l4 58M44 42l2 58M56 42l-2 58M68 42l-4 58M78 44l-6 54" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      <path d="M20 30q8 8 12 12M34 26q4 10 6 16M50 24v18M66 26q-4 10-6 16M80 30q-8 8-12 12" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      <rect x="12" y="62" width="76" height="12" rx="3" fill="#b45309"/>`,
    wheel: (c) => `
      <path d="M50 60 30 110M50 60l20 50" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
      <circle cx="50" cy="56" r="40" fill="${shade(c, 0.85)}" stroke="${c}" stroke-width="8"/>
      <circle cx="50" cy="56" r="8" fill="${c}"/>
      <path d="M50 16v80M10 56h80M22 28l56 56M78 28 22 84" stroke="${c}" stroke-width="2" opacity=".35"/>`,
    lamp: (c) => `
      <path d="M40 12h20v14H40z" fill="#94a3b8"/>
      <path d="M36 26h28l-2 8H38z" fill="#475569"/>
      <path d="M40 34h20v58a10 10 0 0 1-20 0z" fill="#f8fafc" stroke="${c}" stroke-width="3"/>
      <path d="M45 40v52M55 40v52" stroke="${c}" stroke-width="3" opacity=".45"/>
      <path d="M18 60l-8-4M18 76H8M82 60l8-4M82 76h10" stroke="#a855f7" stroke-width="4" stroke-linecap="round"/>`,
    tank: (c, sp) => `
      <rect x="10" y="30" width="80" height="70" rx="6" fill="${shade(c, 0.75)}" stroke="${c}" stroke-width="4"/>
      <path d="M10 44h80" stroke="${c}" stroke-width="2" opacity=".5"/>
      <rect x="6" y="24" width="88" height="10" rx="3" fill="${c}"/>
      <path d="M18 98q4-16 0-26M26 98q6-20 2-30M76 98q-4-18 2-28" stroke="#16a34a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <image href="${species[sp].img}" x="38" y="52" width="28" height="28"/>
      <path d="M12 94h76" stroke="#d6b98c" stroke-width="6"/>`,
    house: (c) => `
      <path d="M50 14 10 48h80z" fill="${shade(c, -0.25)}"/>
      <rect x="18" y="46" width="64" height="58" rx="4" fill="${c}"/>
      <path d="M38 104V78a12 12 0 0 1 24 0v26z" fill="#1e293b" opacity=".85"/>
      <path d="M22 58h56M22 70h56M22 82h12M66 82h12M22 94h12M66 94h12" stroke="#fff" stroke-width="2" opacity=".25"/>`,
  };

  const productPhotos = {
    'cachorro-sache': 'food-wet-pouches.jpg', 'gato-sache': 'food-wet-pouches.jpg',
    'cachorro-bifinho': 'treat-dog.jpg', 'cachorro-osso': 'treat-dog-bone.jpg', 'gato-cremoso': 'treat-cat.jpg',
    'coelho-cenoura': 'treat-rabbit.jpg', 'hamster-iogurte': 'treat-hamster.jpg', 'porquinho-ervas': 'treat-guinea-pig.jpg',
    'furao-pasta': 'treat-ferret-paste.jpg', 'passaro-farinhada': 'treat-bird.jpg', 'passaro-painco': 'treat-bird.jpg',
    'cavalo-petisco': 'treat-horse.jpg', 'roedor-petisco': 'treat-rodent.jpg', 'porco-petisco': 'treat-pig.jpg',
    'cachorro-shampoo': 'hygiene-shampoo.jpg', 'cachorro-tapete': 'hygiene-pads.jpg', 'gato-areia': 'hygiene-cat-litter.jpg',
    'coelho-substrato': 'hygiene-paper-bedding.jpg', 'hamster-maravalha': 'hygiene-wood-shavings.jpg',
    'hamster-areia': 'hygiene-bathing-sand.jpg', 'porquinho-tapete': 'hygiene-pads.jpg',
    'furao-shampoo': 'hygiene-shampoo.jpg', 'furao-areia': 'hygiene-cat-litter.jpg', 'passaro-banheira': 'hygiene-bird-bath.jpg',
    'jabuti-coco': 'hygiene-reptile-substrate.jpg', 'cobra-aspen': 'hygiene-reptile-substrate.jpg',
    'cobra-spray': 'health-reptile-mist.jpg', 'iguana-grama': 'hygiene-grass-mat.jpg',
    'peixe-condicionador': 'hygiene-water-conditioner.jpg', 'peixe-bacterias': 'hygiene-water-conditioner.jpg',
    'cavalo-shampoo': 'hygiene-shampoo.jpg', 'cavalo-casco': 'hygiene-hoof-oil.jpg',
    'cavalo-escova': 'hygiene-horse-grooming.jpg', 'roedor-papel': 'hygiene-paper-bedding.jpg',
    'chinchila-po': 'hygiene-bathing-sand.jpg', 'galinha-maravalha': 'hygiene-wood-shavings.jpg',
    'tartaruga-condicionador': 'hygiene-water-conditioner.jpg', 'anfibio-condicionador': 'hygiene-water-conditioner.jpg',
    'anfibio-musgo': 'hygiene-reptile-substrate.jpg', 'aranha-coco': 'hygiene-reptile-substrate.jpg',
    'porco-hidratante': 'hygiene-pig-skin.jpg', 'ovelha-tesoura': 'hygiene-horse-grooming.jpg',
    'cachorro-antipulgas': 'health-flea-chew.jpg', 'cachorro-vermifugo': 'health-deworm-tablets.jpg',
    'gato-vermifugo': 'health-deworm-tablets.jpg', 'coelho-vitamina': 'health-vitamin-drops.jpg',
    'porquinho-vitc': 'health-vitamin-drops.jpg', 'furao-antipulgas': 'health-ferret-pipette.jpg',
    'passaro-vitamina': 'health-vitamin-drops.jpg', 'jabuti-calcio': 'health-calcium-powder.jpg',
    'chinchila-pedra': 'health-mineral-block.jpg', 'iguana-calcio': 'health-calcium-powder.jpg',
    'peixe-teste': 'health-fish-test.jpg', 'cavalo-vermifugo': 'health-deworm-paste.jpg',
    'galinha-vermifugo': 'health-poultry-water.jpg', 'pato-vitamina': 'health-vitamin-drops.jpg',
    'tartaruga-calcio': 'health-mineral-block.jpg', 'porco-vermifugo': 'health-deworm-tablets.jpg',
    'cabra-sal': 'health-mineral-salt.jpg', 'ovelha-sal': 'health-mineral-salt.jpg',
    'cabra-vermifugo': 'health-livestock-pouron.jpg', 'ovelha-vermifugo': 'health-livestock-pouron.jpg',
    'bovino-sal': 'health-mineral-salt.jpg', 'bovino-carrapaticida': 'health-livestock-pouron.jpg',
    'coelho-toca': 'accessory-rabbit-house.jpg', 'hamster-roda': 'accessory-hamster-wheel.jpg',
    'hamster-gaiola': 'accessory-small-cage.jpg', 'porquinho-iglu': 'accessory-felt-hide.jpg',
    'passaro-poleiro': 'accessory-bird-perch.jpg', 'passaro-gaiola': 'accessory-bird-cage.jpg',
    'jabuti-uvb': 'accessory-uvb-lamp.jpg', 'jabuti-toca': 'jabuti-toy.jpg',
    'cobra-placa': 'accessory-heat-mat.jpg', 'cobra-bebedouro': 'accessory-reptile-water-dish.jpg',
    'iguana-uvb': 'accessory-uvb-lamp.jpg', 'iguana-galho': 'iguana-toy.jpg',
    'peixe-aquario': 'accessory-aquarium.jpg', 'cavalo-cabresto': 'accessory-horse-halter.jpg',
    'roedor-gaiola': 'accessory-small-cage.jpg', 'chinchila-gaiola': 'accessory-small-cage.jpg',
    'galinha-bebedouro': 'accessory-poultry-waterer.jpg', 'pato-piscina': 'accessory-duck-pool.jpg',
    'pato-abrigo': 'accessory-duck-shelter.jpg', 'tartaruga-uvb': 'accessory-uvb-lamp.jpg',
    'aranha-terrario': 'accessory-terrarium.jpg', 'cabra-colar': 'accessory-goat-bell-collar.jpg',
    'bovino-cabresto': 'accessory-livestock-halter.jpg',
  };
  const art = (p) => {
    const photo = productPhotos[p.id] || (p.cat === 'racoes' ? `${p.sp}-food.jpg` : p.cat === 'brinquedos' ? `${p.sp}-toy.jpg` : null);
    return `<div class="p-art" style="--art:${shade(p.color, 0.88)}">${photo ? `<img src="assets/img/products/${photo}" alt="${p.name}" loading="lazy">` : `<svg viewBox="0 0 100 120" aria-hidden="true">${(ART[p.art] || ART.bag)(p.color, p.sp)}</svg>`}</div>`;
  };

  /* ---------------------------------------------------------------- Utilidades */
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const discount = (p) => (p.old ? Math.round((1 - p.price / p.old) * 100) : 0);
  const fmtDate = (s) => (s ? s.split('-').reverse().join('/') : '—');
  const daysUntil = (s) => Math.round((new Date(s + 'T00:00:00') - today) / DAY);
  const addDays = (s, n) => {
    const d = new Date(s + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const everyText = (days) => {
    const m = Math.round(days / 30.4);
    if (m >= 24) return `a cada ${Math.round(m / 12)} anos`;
    return m <= 1 ? 'todo mês' : m === 12 ? 'todo ano' : `a cada ${m} meses`;
  };

  window.CP = {
    IMG, today, iso, addDays, groups, species, speciesOrder, vaccines, vaccineSources, vaccineDb, loadVaccines, reminderTypes, reminderBySpecies,
    levels, breedImages, breedImg, dogBreedSizes, dogBreedSize, seedPets, seedReminders, seedAddresses, seedPayments, seedAppointments, services, clinics, slots, categories, products, brands, care, tips, articles, faq,
    icon, paw, art, brl, discount, fmtDate, daysUntil, everyText,
  };
})();
