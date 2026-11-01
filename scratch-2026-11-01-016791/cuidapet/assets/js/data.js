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
  ];

  /* ------------------------------------------------------------------ Espécies */
  // dos: "do seu" / "da sua" — para frases como "a saúde da sua cobra"
  const S = (id, label, plural, img, group, unit, dos, life, extra) => ({ id, label, plural, img: IMG + img, group, unit, dos, life, ...extra });

  const species = {
    cachorro: S('cachorro', 'Cachorro', 'Cães', 'dog.png', 'caes-gatos', 'kg', 'do seu', '10 a 15 anos', {
      heroCopy: ['Atendimento dedicado,', 'acompanhamento clínico completo', 'e muito carinho em todas as fases', 'da vida do seu melhor amigo!'],
      breeds: ['Sem raça definida (SRD)', 'Corgi', 'Golden Retriever', 'Labrador', 'Shih Tzu', 'Poodle', 'Bulldog Francês', 'Spitz Alemão', 'Border Collie', 'Outra'],
    }),
    gato: S('gato', 'Gato', 'Gatos', 'cat.png', 'caes-gatos', 'kg', 'do seu', '12 a 18 anos', {
      heroCopy: ['Cuidado sem estresse,', 'consultas pensadas para felinos', 'e lembretes para cada vacina', 'do seu gatinho!'],
      breeds: ['Sem raça definida (SRD)', 'Siamês', 'Persa', 'Maine Coon', 'Ragdoll', 'Sphynx', 'Bengal', 'Angorá', 'Outra'],
    }),
    coelho: S('coelho', 'Coelho', 'Coelhos', 'rabbit.png', 'pequenos', 'kg', 'do seu', '8 a 12 anos', {
      heroCopy: ['Orelhas em pé e saúde em dia:', 'mixomatose, doença hemorrágica', 'e check-up dentário', 'para o seu coelho!'],
      breeds: ['Mini Lop', 'Fuzzy Lop', 'Lionhead', 'Holandês Anão', 'Mini Rex', 'Angorá', 'Sem raça definida (SRD)', 'Outra'],
    }),
    hamster: S('hamster', 'Hamster', 'Hamsters', 'hamster.png', 'pequenos', 'g', 'do seu', '2 a 3 anos', {
      heroCopy: ['Pequeno no tamanho,', 'gigante no carinho: check-ups,', 'alimentação certa e uma gaiola', 'cheia de diversão!'],
      breeds: ['Sírio', 'Anão Russo', 'Anão Chinês', 'Roborovski', 'Outra'],
    }),
    porquinho: S('porquinho', 'Porquinho-da-índia', 'Porquinhos-da-índia', 'guineapig.png', 'pequenos', 'g', 'do seu', '5 a 8 anos', {
      heroCopy: ['Vitamina C, feno à vontade', 'e consultas para dentes', 'sempre saudáveis', 'do seu porquinho!'],
      breeds: ['Inglês (pelo curto)', 'Abissínio', 'Peruano', 'Teddy', 'Sheltie', 'Sem raça definida (SRD)', 'Outra'],
    }),
    furao: S('furao', 'Furão', 'Furões', 'ferret.png', 'pequenos', 'kg', 'do seu', '6 a 10 anos', {
      heroCopy: ['Energia sem fim', 'e proteção de verdade:', 'cinomose e raiva em dia', 'para o seu furão!'],
      breeds: ['Sable', 'Albino', 'Champagne', 'Prata', 'Panda', 'Outra'],
    }),
    passaro: S('passaro', 'Pássaro', 'Aves', 'bird.png', 'aves', 'g', 'do seu', '5 a 30 anos', {
      heroCopy: ['Atenção às penas,', 'check-ups com veterinário de aves', 'e a alimentação ideal', 'para o seu passarinho!'],
      breeds: ['Canário-belga', 'Calopsita', 'Periquito-australiano', 'Agapornis', 'Papagaio', 'Galinha', 'Mandarim', 'Outra'],
    }),
    jabuti: S('jabuti', 'Jabuti', 'Jabutis', 'tortoise.png', 'repteis', 'kg', 'do seu', '40 a 80 anos', {
      heroCopy: ['Um companheiro para', 'a vida toda: casco forte,', 'luz UVB e check-ups', 'para o seu jabuti!'],
      breeds: ['Jabuti-piranga', 'Jabuti-tinga', 'Tartaruga-tigre-d\'água', 'Outra'],
    }),
    cobra: S('cobra', 'Cobra', 'Cobras', 'snake.png', 'repteis', 'kg', 'da sua', '20 a 30 anos', {
      heroCopy: ['Terrário na temperatura certa,', 'muda tranquila e exames', 'parasitológicos em dia', 'para a sua serpente!'],
      breeds: ['Píton-real (Ball python)', 'Corn snake', 'Jiboia', 'King snake', 'Outra'],
    }),
    iguana: S('iguana', 'Iguana', 'Iguanas', 'iguana.png', 'repteis', 'kg', 'da sua', '15 a 20 anos', {
      heroCopy: ['Cálcio, luz UVB', 'e alimentação vegetal', 'para ossos fortes', 'da sua iguana!'],
      breeds: ['Iguana-verde', 'Pogona (Dragão-barbudo)', 'Gecko-leopardo', 'Teiú', 'Outra'],
    }),
    peixe: S('peixe', 'Peixe', 'Peixes', 'fish.png', 'peixes', 'g', 'do seu', '2 a 20 anos', {
      heroCopy: ['Água sempre testada,', 'aquário equilibrado', 'e a ração ideal', 'para o seu peixinho!'],
      breeds: ['Kinguio', 'Betta', 'Guppy', 'Neon', 'Acará-disco', 'Carpa', 'Outra'],
    }),
    cavalo: S('cavalo', 'Cavalo', 'Cavalos', 'horse.png', 'equinos', 'kg', 'do seu', '25 a 30 anos', {
      heroCopy: ['Medicina equina completa,', 'vacinas, exames de AIE e Mormo', 'e atendimento na fazenda', 'para o seu companheiro de lida!'],
      breeds: ['Mangalarga Marchador', 'Quarto de Milha', 'Crioulo', 'Árabe', 'Puro-Sangue Inglês', 'Campolina', 'Pônei', 'Sem raça definida (SRD)', 'Outra'],
    }),
  };
  const speciesOrder = ['cachorro', 'gato', 'coelho', 'hamster', 'porquinho', 'furao', 'passaro', 'jabuti', 'cobra', 'iguana', 'peixe', 'cavalo'];

  /* ------------------------------------------------------- Carteira de saúde */
  // Protocolo de cada item da carteira:
  //   interval   = dias entre reforços depois do esquema inicial
  //   kind       = vacina | exame | consulta
  //   level      = obrigatoria (por lei) | essencial | recomendada | opcional
  //   start      = idade mínima para a 1ª dose, em semanas
  //   doses      = doses do esquema inicial do filhote; adultDoses = esquema para quem começa adulto
  //   gap        = dias entre as doses do esquema inicial
  // Referências gerais: diretrizes WSAVA e protocolos usados no Brasil. A palavra final é sempre do veterinário.
  const V = (key, name, interval, kind, desc, o = {}) => ({ key, name, interval, kind, desc, level: 'essencial', start: 0, doses: 1, adultDoses: 1, gap: 21, ...o });
  const checkup = (desc, o) => V('checkup', 'Check-up Anual', 365, 'consulta', desc, o);
  const parasito = V('parasito', 'Exame Parasitológico', 180, 'exame', 'Pesquisa de vermes e protozoários nas fezes. Parasitas são a causa mais comum de doença em pets exóticos.');

  const vaccines = {
    cachorro: [
      V('v10', 'V10 (Polivalente)', 365, 'vacina', 'Protege contra cinomose, parvovirose, hepatite infecciosa, adenovirose, parainfluenza, coronavirose e quatro tipos de leptospirose.', { start: 6, doses: 3, adultDoses: 2, gap: 21 }),
      V('raiva', 'Antirrábica', 365, 'vacina', 'Obrigatória por lei. Protege contra o vírus da raiva, fatal para animais e humanos.', { level: 'obrigatoria', start: 12 }),
      V('gripe', 'Gripe Canina (Tosse dos canis)', 365, 'vacina', 'Previne a traqueobronquite infecciosa, comum em creches, hotéis, parques e pet shops.', { level: 'recomendada', start: 8, doses: 2, adultDoses: 2, gap: 21 }),
      V('giardia', 'Giárdia', 365, 'vacina', 'Reduz a eliminação de cistos e os sintomas da giardíase, parasita intestinal muito comum.', { level: 'opcional', start: 8, doses: 2, adultDoses: 2, gap: 21 }),
      V('leish', 'Leishmaniose', 365, 'vacina', 'Indicada em regiões com casos da doença. Exige exame de sangue negativo antes da 1ª dose.', { level: 'opcional', start: 16, doses: 3, adultDoses: 3, gap: 21 }),
    ],
    gato: [
      V('v4', 'V4 (Quádrupla Felina)', 365, 'vacina', 'Protege contra panleucopenia, rinotraqueíte, calicivirose e clamidiose.', { start: 8, doses: 3, adultDoses: 2, gap: 21 }),
      V('raiva', 'Antirrábica', 365, 'vacina', 'Obrigatória por lei, inclusive para gatos que não saem de casa.', { level: 'obrigatoria', start: 12 }),
      V('felv', 'FeLV (Leucemia Felina)', 365, 'vacina', 'Indicada para gatos com acesso à rua ou que convivem com outros gatos. Requer teste negativo antes.', { level: 'recomendada', start: 8, doses: 2, adultDoses: 2, gap: 21 }),
    ],
    coelho: [
      V('mixo', 'Mixomatose', 365, 'vacina', 'Doença viral transmitida por mosquitos e pulgas, muito grave em coelhos. A disponibilidade da vacina no Brasil varia; consulte o veterinário.', { level: 'recomendada', start: 5 }),
      V('rhd', 'Doença Hemorrágica Viral (RHDV)', 365, 'vacina', 'Protege contra as variantes RHDV1 e RHDV2, altamente contagiosas. A disponibilidade varia conforme a região.', { level: 'recomendada', start: 5 }),
      V('checkup', 'Check-up e Avaliação Dentária', 365, 'consulta', 'Os dentes do coelho crescem a vida toda. A consulta anual previne má oclusão e abscessos.', { start: 8 }),
    ],
    hamster: [
      checkup('Roedores pequenos não têm vacinas. O check-up detecta tumores, problemas dentários e de pele no início.', { start: 4 }),
      parasito,
    ],
    porquinho: [
      V('checkup', 'Check-up e Avaliação Dentária', 365, 'consulta', 'Avalia dentes, pele e peso. Porquinhos escondem sinais de dor e precisam de acompanhamento.', { start: 4 }),
      V('vitc', 'Avaliação Nutricional (Vitamina C)', 365, 'consulta', 'Porquinhos-da-índia não produzem vitamina C. A avaliação previne escorbuto e problemas articulares.', { level: 'recomendada', start: 4 }),
      parasito,
    ],
    furao: [
      V('cinomose', 'Cinomose', 365, 'vacina', 'A cinomose é quase sempre fatal em furões. A vacinação é indispensável.', { start: 8, doses: 3, adultDoses: 2, gap: 21 }),
      V('raiva', 'Antirrábica', 365, 'vacina', 'Recomendada para todos os furões, especialmente os que passeiam ao ar livre.', { level: 'recomendada', start: 12 }),
      checkup('Avalia glândulas adrenais e insulinoma, doenças comuns em furões a partir dos 3 anos.', { start: 8 }),
    ],
    passaro: [
      checkup('Aves escondem sinais de doença. Uma consulta anual com veterinário de aves é a principal prevenção.', { start: 8 }),
      V('bouba', 'Bouba Aviária', 365, 'vacina', 'Para aves de criação e viveiros; previne lesões de pele e mucosas causadas por poxvírus.', { level: 'opcional', start: 4 }),
      V('newcastle', 'Doença de Newcastle', 180, 'vacina', 'Para galinhas e aves de criação. Doença de notificação obrigatória.', { level: 'opcional', start: 2 }),
    ],
    jabuti: [
      checkup('Avalia casco, bico, unhas, peso e hidratação. Ideal antes e depois do período de menor atividade no inverno.'),
      parasito,
    ],
    cobra: [
      checkup('Avalia muda, peso, boca e respiração. Problemas respiratórios são comuns quando a temperatura do terrário cai.'),
      parasito,
    ],
    iguana: [
      checkup('Avalia pele, unhas, peso e comportamento. Lagartos estressados param de comer.'),
      V('calcio', 'Exame de Sangue (Cálcio e Fósforo)', 365, 'exame', 'Previne a doença metabólica óssea, comum em répteis com pouca luz UVB ou dieta pobre em cálcio.', { level: 'recomendada' }),
      parasito,
    ],
    peixe: [
      V('agua', 'Teste da Água (pH, Amônia, Nitrito)', 30, 'exame', 'A maior parte das doenças em peixes vem da qualidade da água. Faça o teste todo mês e anote os resultados.'),
      V('checkup', 'Avaliação com Veterinário de Peixes', 365, 'consulta', 'Indicada para aquários com espécies sensíveis ou ao notar manchas, nadadeiras fechadas ou falta de apetite.', { level: 'recomendada' }),
    ],
    cavalo: [
      V('influenza', 'Influenza Equina', 180, 'vacina', 'Previne a gripe equina, altamente contagiosa em haras, provas e eventos.', { start: 26, doses: 2, adultDoses: 2, gap: 30 }),
      V('tetano', 'Tétano', 365, 'vacina', 'Essencial: cavalos são muito sensíveis à toxina tetânica, presente no solo e em ferimentos.', { start: 20, doses: 2, adultDoses: 2, gap: 30 }),
      V('encef', 'Encefalomielite', 365, 'vacina', 'Protege contra as encefalomielites equinas Leste e Oeste, transmitidas por mosquitos.', { start: 20, doses: 2, adultDoses: 2, gap: 30 }),
      V('raiva', 'Antirrábica', 365, 'vacina', 'Transmitida principalmente por morcegos hematófagos; obrigatória em áreas de risco e indispensável no campo.', { level: 'obrigatoria', start: 16, doses: 2, adultDoses: 2, gap: 30 }),
      V('aie', 'Exame de Anemia Infecciosa (AIE)', 60, 'exame', 'Obrigatório para emitir a GTA e participar de eventos. Validade usual de 60 dias (pode variar por estado).', { level: 'obrigatoria', start: 26 }),
      V('mormo', 'Exame de Mormo', 60, 'exame', 'Exigido junto com o AIE para transporte (GTA), leilões e competições. Validade usual de 60 dias.', { level: 'obrigatoria', start: 26 }),
    ],
  };

  const levels = {
    obrigatoria: { label: 'Obrigatória', cls: 'lv-req' },
    essencial: { label: 'Essencial', cls: 'lv-core' },
    recomendada: { label: 'Recomendada', cls: 'lv-rec' },
    opcional: { label: 'Opcional', cls: 'lv-opt' },
  };

  /* Mascote por raça (as demais raças usam o mascote da espécie) */
  const B = (f) => IMG + 'breeds/' + f + '.png';
  const breedImages = {
    cachorro: {
      'Sem raça definida (SRD)': B('dog-srd'), 'Golden Retriever': B('dog-golden'), Labrador: B('dog-labrador'), 'Shih Tzu': B('dog-shihtzu'),
      Poodle: B('dog-poodle'), 'Bulldog Francês': B('dog-bulldog'), 'Spitz Alemão': B('dog-spitz'), 'Border Collie': B('dog-border'),
    },
    gato: {
      'Siamês': B('cat-siames'), Persa: B('cat-persa'), 'Maine Coon': B('cat-mainecoon'), Ragdoll: B('cat-ragdoll'),
      Sphynx: B('cat-sphynx'), Bengal: B('cat-bengal'), 'Angorá': B('cat-angora'),
    },
    passaro: {
      Calopsita: B('bird-calopsita'), 'Periquito-australiano': B('bird-periquito'), Papagaio: B('bird-papagaio'), Agapornis: B('bird-agapornis'), Galinha: B('bird-galinha'),
    },
    iguana: { 'Pogona (Dragão-barbudo)': B('lizard-pogona'), 'Gecko-leopardo': B('lizard-gecko') },
    peixe: { Betta: B('fish-betta') },
    cobra: { 'Corn snake': B('snake-corn') },
  };
  const breedImg = (sp, breed) => (breedImages[sp] && breedImages[sp][breed]) || species[sp].img;

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
  };

  /* ---------------------------------------------------------------- Exemplo */
  const seedPets = [
    {
      id: 'thor', name: 'Thor', species: 'cachorro', breed: 'Corgi', sex: 'Macho', neutered: true, chip: '985 112 004 567 321', birth: iso(-2 * 365 - 40), weight: 12,
      records: {
        v10: { applied: [iso(-400), iso(-35)], next: iso(330), place: 'Clínica CuidaPet Centro' },
        raiva: { applied: [iso(-380), iso(-20)], next: iso(345), place: 'Campanha municipal' },
        gripe: { applied: [iso(-321), iso(-300)] },
        giardia: { applied: [iso(-381), iso(-360)] },
      },
    },
    {
      id: 'bolinha', name: 'Bolinha', species: 'cachorro', breed: 'Golden Retriever', sex: 'Fêmea', neutered: false, birth: iso(-70), weight: 6.5,
      records: { v10: { applied: [iso(-14)], place: 'Clínica CuidaPet Centro' } },
    },
    {
      id: 'mia', name: 'Mia', species: 'gato', breed: 'Sem raça definida (SRD)', sex: 'Fêmea', neutered: true, birth: iso(-420), weight: 4.1,
      records: {
        v4: { applied: [iso(-81), iso(-60)] },
        raiva: { applied: [iso(-375)], next: iso(-10) },
      },
    },
    {
      id: 'pipoca', name: 'Pipoca', species: 'coelho', breed: 'Mini Lop', sex: 'Fêmea', neutered: false, birth: iso(-250), weight: 1.6,
      records: {
        rhd: { applied: [iso(-140)], next: iso(225) },
        checkup: { applied: [iso(-140)], next: iso(225) },
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
      records: { checkup: { applied: [iso(-120)], next: iso(245) } },
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
    { id: 'banho', label: 'Banho & tosa', icon: 'drop', minutes: 90, species: ['cachorro', 'gato', 'coelho', 'porquinho', 'furao'] },
    { id: 'exoticos', label: 'Consulta de exóticos', icon: 'sparkle', minutes: 40, species: ['coelho', 'hamster', 'porquinho', 'furao', 'passaro', 'jabuti', 'cobra', 'iguana', 'peixe'] },
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
  };

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
  ];

  const brands = [
    { name: 'NutriPata', color: '#0369a1', font: 'logo' },
    { name: 'Ronron', color: '#ea580c', font: 'logo' },
    { name: 'Roedor Feliz', color: '#65a30d', font: 'logo' },
    { name: 'Réptil Pro', color: '#15803d', font: 'sans' },
    { name: 'AquaVida', color: '#0891b2', font: 'logo' },
    { name: 'Pena Viva', color: '#ca8a04', font: 'logo' },
    { name: 'Equi Forte', color: '#166534', font: 'sans' },
    { name: 'Bicho Feliz', color: '#b45309', font: 'logo' },
    { name: 'VitaPet', color: '#16a34a', font: 'sans' },
    { name: 'Pata Limpa', color: '#0e7490', font: 'sans' },
    { name: 'Brinca+', color: '#dc2626', font: 'logo' },
    { name: 'CuidaPet Vet', color: '#0284c7', font: 'logo' },
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
    passaro: { food: 'Ração extrusada, sementes e frutas', home: 'Gaiola espaçosa, longe de correntes de ar', alert: 'Penas eriçadas e sono durante o dia' },
    jabuti: { food: 'Folhas escuras, legumes e frutas', home: 'Sol ou luz UVB e área para cavar', alert: 'Casco mole ou olhos inchados' },
    cobra: { food: 'Presas congeladas no tamanho certo', home: 'Terrário trancado com gradiente de calor', alert: 'Bolhas na boca ou respiração com chiado' },
    iguana: { food: 'Dieta 100% vegetal com cálcio', home: 'Terrário alto, UVB e 30–35 °C no ponto quente', alert: 'Tremores, mandíbula mole ou patas tortas' },
    peixe: { food: 'Pouca ração, 1 a 2 vezes ao dia', home: 'Aquário ciclado, filtro e aquecedor', alert: 'Manchas brancas ou nadar de lado' },
    cavalo: { food: 'Volumoso (feno/capim) + concentrado', home: 'Piquete, baia limpa e água à vontade', alert: 'Rolar no chão e olhar para a barriga (cólica)' },
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
  };

  const articles = [
    ['Calendário de vacinas: o que é obrigatório?', 'Antirrábica é obrigatória por lei para cães e gatos. As demais dependem da espécie e do estilo de vida.', 'syringe'],
    ['Pets exóticos legalizados', 'Répteis, aves silvestres e alguns mamíferos precisam de origem comprovada e registro.', 'shield'],
    ['Como montar um kit de primeiros socorros', 'Gaze, soro fisiológico, luvas e o telefone do veterinário 24 h sempre à mão.', 'help'],
    ['Viagem com pets', 'Atestado de saúde, carteira de vacinação e caixa de transporte adequada.', 'truck'],
  ];

  const faq = [
    ['Como registro uma vacina antiga?', 'Abra a carteira do pet, toque na vacina e em “Registrar nova aplicação”. Você pode escolher qualquer data passada.'],
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

  const art = (p) =>
    `<div class="p-art" style="--art:${shade(p.color, 0.88)}"><svg viewBox="0 0 100 120" aria-hidden="true">${(ART[p.art] || ART.bag)(p.color, p.sp)}</svg></div>`;

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
    return m <= 1 ? 'todo mês' : m === 12 ? 'a cada 12 meses' : `a cada ${m} meses`;
  };

  window.CP = {
    IMG, today, iso, addDays, groups, species, speciesOrder, vaccines, reminderTypes, reminderBySpecies,
    levels, breedImages, breedImg, seedPets, seedReminders, seedAddresses, seedPayments, seedAppointments, services, clinics, slots, categories, products, brands, care, tips, articles, faq,
    icon, paw, art, brl, discount, fmtDate, daysUntil, everyText,
  };
})();
