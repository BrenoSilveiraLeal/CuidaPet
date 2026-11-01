/**
 * App CuidaPet (protótipo navegável).
 * Roteamento por hash, estado salvo no localStorage e telas renderizadas como template strings.
 */
(function () {
  const C = window.CP;
  const { species, speciesOrder, vaccines, products, categories, reminderTypes, icon, paw, art, brl, discount, fmtDate, daysUntil, iso, addDays, everyText } = C;
  const $ = (s, r = document) => r.querySelector(s);

  const Auth = window.CPAuth;
  const Store = window.CPStore;

  /* ------------------------------------------------------------ Estado */
  // Cada tutor (usuário logado) tem um documento com perfil, pets e tudo mais.
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const fresh = (demo, u = {}) => ({
    version: 3,
    profile: demo
      ? { name: 'Ana Silva', email: 'ana.silva@email.com', photo: null, phone: '(11) 98765-4321', city: 'São Paulo – SP', cep: '04567-010', complete: true }
      : { name: u.name || '', email: u.email || '', photo: u.photo || null, phone: '', city: '', cep: '', complete: false },
    pets: demo ? clone(C.seedPets) : [],
    active: demo ? 'thor' : null,
    reminders: demo ? clone(C.seedReminders) : [],
    appointments: demo ? clone(C.seedAppointments) : [],
    addresses: demo ? clone(C.seedAddresses) : [],
    payments: demo ? clone(C.seedPayments) : [{ id: 'p-pix', kind: 'pix', brand: 'Pix', main: true }],
    settings: { vacinas: true, lembretes: true, ofertas: false, antecedencia: 7 },
    cart: [],
    favs: [],
    coupon: null,
    cep: null,
    orders: [],
    checkout: { delivery: 'normal' },
  });

  let user = null; // { uid, name, email, photo, provider }
  let S = null;
  let booting = true;
  const save = () => { if (user && S) Store.save(user.uid, S); };

  const ui = { vacTab: 'geral', remTab: 'vacinas', petTab: 'carteira', agTab: 'proximas', query: '', spQuery: '', splashSp: 'cachorro', newPet: null, pd: null, onboarding: false, booking: null };
  let timers = [];
  let navStack = [];

  /* ------------------------------------------------------------ Utilidades */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pet = () => S.pets.find((p) => p.id === S.active) || S.pets[0];
  const petById = (id) => S.pets.find((p) => p.id === id);
  const spOf = (p) => species[p.species];
  const firstName = () => (S.profile.name || '').trim().split(' ')[0] || 'tutor';
  const userAvatar = (size) => {
    const st = size ? ` style="width:${size}px;height:${size}px"` : '';
    return S.profile.photo
      ? `<span class="avatar user photo"${st}><img src="${esc(S.profile.photo)}" alt="" referrerpolicy="no-referrer"></span>`
      : `<span class="avatar user"${st}>${esc(firstName()[0].toUpperCase())}</span>`;
  };
  const product = (id) => products.find((p) => p.id === id);
  const main = (list) => list.find((x) => x.main) || list[0];

  const ageMonths = (birth) => (birth ? Math.floor(-daysUntil(birth) / 30.44) : null);
  const ageText = (birth) => {
    const m = ageMonths(birth);
    if (m === null) return 'idade não informada';
    if (m < 1) return 'recém-chegado';
    if (m < 12) return `${m} ${m === 1 ? 'mês' : 'meses'}`;
    const y = Math.floor(m / 12);
    return `${y} ${y === 1 ? 'ano' : 'anos'}`;
  };
  const weightText = (p) => (p.weight ? `${String(p.weight).replace('.', ',')} ${spOf(p).unit}` : '—');

  // Mascote do pet conforme a raça escolhida pelo tutor
  const petImg = (p) => C.breedImg(p.species, p.breed);
  const avatar = (p, size) => {
    const st = size ? ` style="width:${size}px;height:${size}px"` : '';
    return p.photo
      ? `<span class="avatar photo"${st}><img src="${p.photo}" alt=""></span>`
      : `<span class="avatar"${st}><img src="${petImg(p)}" alt=""></span>`;
  };

  const kindIcon = (v) => ({ exame: 'file', consulta: 'steth' }[v.kind] || 'syringe');
  const kindLabel = (v) => ({ vacina: 'Vacina', exame: 'Exame', consulta: 'Consulta' }[v.kind]);
  const whenText = (d) => (d === 0 ? 'hoje' : d === 1 ? 'amanhã' : d < 0 ? `há ${-d} dias` : `em ${d} dias`);
  const ageWords = (weeks) => (weeks < 16 ? `${weeks} semanas` : `${Math.round(weeks / 4.345)} meses`);
  const protocolText = (v) => {
    const parts = [];
    if (v.start) parts.push(`a partir de ${ageWords(v.start)}`);
    if (v.doses > 1) parts.push(`${v.doses} doses com ${v.gap} dias de intervalo${v.adultDoses !== v.doses ? ` (${v.adultDoses} se começar adulto)` : ''}`);
    parts.push(`${v.kind === 'vacina' ? 'reforço' : 'repetir'} ${everyText(v.interval)}`);
    const t = parts.join(' · ');
    return t[0].toUpperCase() + t.slice(1);
  };

  /* Situação de cada item da carteira, calculada pela idade do pet e pelas doses registradas:
     Em dia · Em breve (até 30 dias) · Atrasada · Não tomou · Aguardando idade */
  const vInfo = (p, v) => {
    const rec = p.records[v.key];
    const applied = rec && rec.applied ? rec.applied.slice().sort() : [];
    const n = applied.length;
    const W = 7 * 864e5;
    const ageW = p.birth ? -daysUntil(p.birth) / 7 : null;
    const fem = v.kind !== 'exame';
    // Esquema de filhote só vale se a 1ª dose foi (ou será) dada antes das 16 semanas
    const firstAgeW = n ? (p.birth ? (new Date(applied[0] + 'T00:00:00') - new Date(p.birth + 'T00:00:00')) / W : 99) : ageW;
    const series = firstAgeW !== null && firstAgeW < 16 ? v.doses : v.adultDoses;
    let next = null;
    let st;
    let label;
    if (!n) {
      const startDate = p.birth && v.start ? addDays(p.birth, v.start * 7) : null;
      if (startDate && daysUntil(startDate) > 0) {
        next = startDate;
        st = { cls: 'wait', label: 'Aguardando idade' };
        label = `1ª dose a partir de ${fmtDate(startDate)} (${whenText(daysUntil(startDate))})`;
      } else {
        const notDone = v.kind === 'vacina' ? 'Não tomou' : v.kind === 'exame' ? 'Não feito' : 'Não feita';
        st = { cls: ['opcional', 'recomendada'].includes(v.level) ? 'todo' : 'miss', label: notDone };
        label = series > 1 ? `Esquema inicial de ${series} doses` : 'Nenhum registro ainda';
      }
    } else {
      const last = applied[n - 1];
      const inSeries = n < series;
      next = addDays(last, inSeries ? v.gap : v.interval);
      const d = daysUntil(next);
      st = d < 0 ? { cls: 'late', label: fem ? 'Atrasada' : 'Atrasado' } : d <= 30 ? { cls: 'soon', label: 'Em breve' } : { cls: 'ok', label: 'Em dia' };
      label = inSeries
        ? `Dose ${n} de ${series} · ${n + 1}ª dose ${fmtDate(next)} (${whenText(d)})`
        : `${v.kind === 'vacina' ? 'Reforço' : 'Próximo'} ${fmtDate(next)} · ${whenText(d)}`;
    }
    return { v, rec, applied, n, series, next, st, label, remind: !rec || rec.remind !== false };
  };
  const petVaccines = (p) => vaccines[p.species].map((v) => vInfo(p, v));
  const isAlert = (r) => r.st.cls === 'late' || r.st.cls === 'miss';
  const lateCount = (p) => petVaccines(p).filter(isAlert).length;
  const hasVaccine = (sp) => vaccines[sp].some((v) => v.kind === 'vacina');
  const walletName = (sp) => (hasVaccine(sp) ? 'Carteira de vacinação' : 'Carteira de saúde');

  const serviceOf = (id) => C.services.find((x) => x.id === id) || C.services[0];
  const clinicOf = (id) => C.clinics.find((x) => x.id === id) || C.clinics[0];
  const upcomingAppointments = () => (S.appointments || [])
    .filter((a) => a.status === 'agendado' && daysUntil(a.date) >= 0 && petById(a.petId))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const cartCount = () => S.cart.reduce((n, i) => n + i.qty, 0);
  const itemPrice = (i) => {
    const p = product(i.id);
    const sz = p.sizes && p.sizes.find((s) => s[0] === i.size);
    return sz ? sz[1] : p.price;
  };

  // Produtos indicados: respeita a fase de vida (filhote x adulto x sênior)
  const recommended = (p) => {
    const m = ageMonths(p.birth);
    const all = products.filter((x) => x.sp === p.species);
    const stage = m === null ? null : m < 12 ? 'Filhotes' : m >= 84 ? 'Sênior' : 'Adultos';
    return all.filter((x) => !['Filhotes', 'Sênior', 'Adultos'].includes(x.tag) || x.tag === stage || (stage === 'Sênior' && x.tag === 'Adultos'));
  };

  /* ------------------------------------------------------------ Feedback */
  let toastTimer;
  const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  };

  const sheet = $('#sheet');
  const backdrop = $('#sheetBackdrop');
  const openSheet = (html) => {
    sheet.innerHTML = html;
    sheet.classList.add('open');
    backdrop.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    const f = sheet.querySelector('input, select, button');
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 350);
  };
  const closeSheet = () => {
    sheet.classList.remove('open');
    backdrop.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
  };

  /* ------------------------------------------------------------ Componentes */
  const topbar = (title, right = '<span></span>', back = true) => `
    <div class="topbar">
      ${back ? `<button class="icon-btn" data-back aria-label="Voltar">${icon('left')}</button>` : '<span></span>'}
      <h1>${title}</h1>${right}
    </div>`;

  const cartBtn = () => {
    const n = cartCount();
    return `<button class="icon-btn" data-go="#/carrinho" aria-label="Carrinho">${icon('cart')}${n ? `<span class="count">${n}</span>` : ''}</button>`;
  };

  const petChip = () => {
    const p = pet();
    return `<button class="pet-chip" data-act="petSheet" aria-label="Trocar de pet">${avatar(p)}${esc(p.name)} ${icon('down', 16)}</button>`;
  };

  const field = (label, inner, cls = '') => `<label class="field ${cls}"><span>${label}</span><span class="input">${inner}</span></label>`;

  const pcard = (p) => `
    <button class="pcard" data-go="#/produto/${p.id}">
      ${p.old ? `<span class="badge-off">-${discount(p)}%</span>` : ''}
      ${art(p)}
      <strong>${p.name}</strong>
      <span class="stars">★ ${p.rating.toLocaleString('pt-BR')} <small>(${p.reviews})</small></span>
      <span class="pc-row">
        <span>${p.old ? `<span class="price-old">${brl(p.old)}</span><br>` : ''}<span class="price">${brl(p.price)}</span></span>
        <span class="add-mini" data-act="addCart" data-arg="${p.id}" role="button" aria-label="Adicionar ao carrinho">${icon('plus', 18)}</span>
      </span>
    </button>`;

  const prow = (p) => `
    <div class="prow">
      <button data-go="#/produto/${p.id}" class="prow-art" aria-label="${p.name}">${art(p)}</button>
      <div class="pr-main">
        <strong>${p.name}</strong>
        <span class="stars">★ ${p.rating.toLocaleString('pt-BR')} <small>(${p.reviews})</small></span>
        <span>${p.old ? `<span class="price-old">${brl(p.old)}</span> ` : ''}<span class="price">${brl(p.price)}</span></span>
      </div>
      <div class="pr-side">
        <button class="heart ${S.favs.includes(p.id) ? 'on' : ''}" data-act="fav" data-arg="${p.id}" aria-label="Favoritar">${icon('heart', 20)}</button>
        <button class="btn sm" data-act="addCart" data-arg="${p.id}">Adicionar</button>
      </div>
    </div>`;

  const levelTag = (v) => `<span class="lv ${C.levels[v.level].cls}">${C.levels[v.level].label}</span>`;
  const vrow = ({ v, st, label }) => `
      <button class="row" data-go="#/vacina/${v.key}">
        <span class="r-ic ${st.cls}">${icon(kindIcon(v), 22)}</span>
        <span class="r-main"><strong>${v.name}</strong><small>${label}</small><small class="lv-line">${levelTag(v)}</small></span>
        <span class="r-end"><span class="status ${st.cls}">${st.label}</span>${icon('right', 18)}</span>
      </button>`;

  const emptyState = (title, text, img, cta = '') => `
    <div class="empty"><img src="${img || (S.pets.length ? petImg(pet()) : species.cachorro.img)}" alt=""><strong>${title}</strong><p>${text}</p>${cta}</div>`;

  const summaryCard = (p) => {
    const recs = petVaccines(p);
    const counts = { late: 0, miss: 0, soon: 0, ok: 0, todo: 0, wait: 0 };
    recs.forEach((r) => counts[r.st.cls]++);
    // Itens opcionais/recomendados não tomados e os que aguardam idade não contam contra o pet
    const total = recs.length - counts.todo - counts.wait;
    const good = counts.ok + counts.soon;
    const bad = counts.late + counts.miss;
    const state = bad ? 'late' : counts.soon ? 'soon' : good ? 'ok' : 'todo';
    const parts = [];
    if (counts.late) parts.push(`${counts.late} atrasad${counts.late > 1 ? 'as' : 'a'}`);
    if (counts.miss) parts.push(`${counts.miss} ${counts.miss > 1 ? 'nunca registradas' : 'nunca registrada'}`);
    const extra = [
      counts.wait ? `${counts.wait} aguardando idade` : '',
      counts.todo ? `${counts.todo} opciona${counts.todo > 1 ? 'is' : 'l'}/recomendada${counts.todo > 1 ? 's' : ''} sem registro` : '',
    ].filter(Boolean).join(' · ');
    const msg = {
      late: [parts.join(' e ').replace(/^./, (c) => c.toUpperCase()), `Agende com o veterinário e registre a aplicação para deixar a carteira de ${esc(p.name)} em dia.`],
      soon: ['Fique de olho!', `${counts.soon} ${counts.soon > 1 ? 'doses vencem' : 'dose vence'} nos próximos 30 dias.`],
      ok: ['Tudo em dia! 🎉', `${esc(p.name)} está com as doses essenciais atualizadas.`],
      todo: ['Carteira em branco', 'Registre as aplicações já feitas para o app calcular as próximas.'],
    }[state];
    const ringColor = { late: '#ef4444', soon: '#f59e0b', ok: '#22c55e', todo: '#94a3b8' }[state];
    const circ = 2 * Math.PI * 30;
    if (extra) msg[1] += ` <span class="sum-extra">${extra}.</span>`;
    return `
      <div class="card summary ${state === 'todo' ? '' : state}">
        <div class="ring">
          <svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="none" stroke="#e2e8f0" stroke-width="7"/><circle cx="36" cy="36" r="30" fill="none" stroke="${ringColor}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${circ * (total ? good / total : 0)} ${circ}"/></svg>
          <span class="ring-ic" style="color:${ringColor}">${icon('syringe', 26)}</span>
        </div>
        <div><strong>${msg[0]}</strong><small>${msg[1]}</small><small style="margin-top:6px;font-weight:700">${good} de ${total} em dia</small></div>
      </div>`;
  };

  /* ------------------------------------------------------------ Telas */
  const V = {};

  const googleG = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

  /* Entrada: login com Google (ou conta local / demonstração) */
  V.login = () => ({
    cls: 'flush no-tabbar auth', dark: true,
    html: `
      <section class="splash login view">
        <div class="splash-hero">
          <div class="bg"></div>
          <div class="splash-word" aria-hidden="true">cuidapet</div>
          <div class="splash-mascot">
            <div class="light"></div>
            <div class="swap" id="splashSwap"><img id="splashImg" src="${species[ui.splashSp].img}" alt="Mascote CuidaPet"></div>
          </div>
        </div>
        <div class="splash-body">
          <div class="splash-name" id="splashName">${species[ui.splashSp].label}</div>
          <h1>Saúde, vacinas e tudo o que seu pet precisa</h1>
          <p>Crie seu perfil e cadastre todos os seus bichos: do cachorro ao jabuti, cada um com carteira de saúde, dicas e produtos.</p>
          <button class="btn-google" data-act="google">${googleG} Entrar com Google</button>
          <button class="link-btn" data-act="demo">Explorar com uma conta de demonstração</button>
          ${Auth.configured ? '' : '<p class="muted-sm mode-note">Modo local: o login com Google é ativado ao configurar o Firebase. Até lá, as contas ficam salvas só neste navegador.</p>'}
          <p class="muted-sm legal">Ao continuar, você concorda com os Termos de uso e a Política de privacidade da CuidaPet.</p>
        </div>
      </section>`,
    after() {
      timers.push(setInterval(() => splashTo(speciesOrder[(speciesOrder.indexOf(ui.splashSp) + 1) % speciesOrder.length]), 2400));
    },
  });

  const splashTo = (id) => {
    const swap = $('#splashSwap');
    if (!swap) return;
    ui.splashSp = id;
    swap.classList.remove('is-entering');
    swap.classList.add('is-leaving');
    setTimeout(() => {
      $('#splashImg').src = species[id].img;
      const n = $('#splashName');
      if (n) n.textContent = species[id].label;
      swap.classList.remove('is-leaving');
      void swap.offsetWidth;
      swap.classList.add('is-entering');
    }, 250);
  };

  /* Passo 1: perfil do tutor (humano). Os pets vêm depois, dentro deste perfil. */
  V.bemvindo = () => {
    const p = S.profile;
    return {
      cls: 'no-tabbar auth',
      html: `
      <div class="view narrow">
        <div class="steps-bar"><span class="on">1. Seu perfil</span><span>2. Seus pets</span></div>
        <h1 class="onb-title">Olá${p.name ? ', ' + esc(p.name.split(' ')[0]) : ''}! Vamos criar seu perfil</h1>
        <p class="onb-sub">Você é o tutor. Depois é só adicionar quantos pets quiser dentro da sua conta.</p>
        <div class="profile-head">${userAvatar(84)}<small>${user.provider === 'google' ? `Conectado com Google · ${esc(p.email)}` : esc(p.email)}</small></div>
        <form data-form="bemvindo" novalidate>
          ${field('Nome completo', `<input name="name" value="${esc(p.name)}" autocomplete="name" required>`, '" id="nameField')}
          ${field('Celular / WhatsApp', `<input name="phone" type="tel" value="${esc(p.phone)}" autocomplete="tel" placeholder="(11) 90000-0000">`)}
          <div class="field-row">
            ${field('CEP', `<input name="cep" inputmode="numeric" maxlength="9" value="${esc(p.cep)}" placeholder="00000-000">`)}
            ${field('Cidade – UF', `<input name="city" value="${esc(p.city)}" placeholder="São Paulo – SP">`)}
          </div>
          ${field('Endereço para entregas (opcional)', '<input name="line" placeholder="Rua, número e complemento" autocomplete="street-address">')}
          <label class="check"><input type="checkbox" name="terms" required> <span>Li e aceito os Termos de uso e a Política de privacidade.</span></label>
          <label class="check"><input type="checkbox" name="news"> <span>Quero receber lembretes e ofertas por e-mail.</span></label>
          <button class="btn" type="submit" style="margin-top:8px">Continuar</button>
        </form>
      </div>`,
    };
  };

  /* Tutor sem nenhum pet ainda */
  V.semPet = () => ({
    html: `
    <div class="view narrow">
      ${emptyState(`Bem-vindo(a), ${esc(firstName())}!`, 'Seu perfil está pronto. Agora adicione seu primeiro pet para liberar a carteira de saúde, os lembretes e a loja personalizada.', species.cachorro.img, `<button class="btn" style="margin-top:18px" data-act="newPet">${icon('plus', 20)} Adicionar meu primeiro pet</button>`)}
      <div class="mini-species">${speciesOrder.slice(0, 6).map((id) => `<img src="${species[id].img}" alt="">`).join('')}</div>
    </div>`,
  });

  /* Cadastro e edição usam o mesmo formulário */
  const blankPet = () => ({ species: 'cachorro', name: '', sex: 'Macho', breed: '', birth: '', weight: '', neutered: false, chip: '', photo: null });

  const speciesGrid = (np) => {
    const q = ui.spQuery.trim().toLowerCase();
    const list = speciesOrder.filter((id) => !q || (species[id].label + ' ' + species[id].plural).toLowerCase().includes(q));
    return list.length
      ? list.map((id) => `<button type="button" role="radio" aria-checked="${id === np.species}" class="${id === np.species ? 'on' : ''}" data-act="pickSpecies" data-arg="${id}"><img src="${species[id].img}" alt="">${species[id].label}</button>`).join('')
      : '<p class="muted-sm">Nenhuma espécie encontrada.</p>';
  };

  const petForm = (editId) => {
    const np = ui.newPet;
    const s = species[np.species];
    const preview = np.photo
      ? `<span class="avatar photo"><img src="${np.photo}" alt="Foto do pet"></span>`
      : `<span class="avatar"><img src="${C.breedImg(np.species, np.breed || s.breeds[0])}" alt=""></span>`;
    return {
      cls: 'no-tabbar',
      html: `
      <div class="view">
        ${ui.onboarding && !editId
          ? `<div class="steps-bar"><span class="done">${icon('check', 14)} Seu perfil</span><span class="on">2. Seus pets</span></div>`
          : `<div class="topbar">
          <button class="icon-btn" data-back aria-label="Voltar">${icon('left')}</button>
          ${editId ? '<h1>Editar pet</h1>' : `<div class="progress"><span id="onbProgress" style="width:${progress(np)}%"></span></div>`}
          <span style="color:var(--primary-blue-light);justify-self:end">${paw(22)}</span>
        </div>`}
        ${editId ? '' : `<h1 class="onb-title">Vamos conhecer<br>seu pet!</h1><p class="onb-sub">${S.pets.length ? `Ele vai entrar no perfil de ${esc(firstName())} junto com ${S.pets.map((x) => esc(x.name)).slice(0, 3).join(', ')}.` : 'Essas informações ajudam a cuidar ainda melhor dele.'}</p>`}

        <div class="photo-pick">
          ${preview}
          <label aria-label="Adicionar foto">${icon('camera', 18)}<input type="file" accept="image/*" data-photo></label>
        </div>

        <div class="field"><span>Espécie</span>
          <label class="input">${icon('search', 18)}<input data-spsearch value="${esc(ui.spQuery)}" placeholder="Buscar: coelho, cobra, peixe..." aria-label="Buscar espécie"></label>
        </div>
        <div class="species-pick" id="speciesPick" role="radiogroup" aria-label="Espécie">${speciesGrid(np)}</div>

        <form data-form="pet" data-edit="${editId || ''}" novalidate>
          ${field('Nome', `<input data-model="name" value="${esc(np.name)}" placeholder="Como ele se chama?" autocomplete="off">`, '" id="nameField')}
          <div class="field"><span>Sexo</span>
            <div class="seg" style="margin:0">${['Macho', 'Fêmea'].map((x) => `<button type="button" class="${np.sex === x ? 'on' : ''}" data-act="pickSex" data-arg="${x}">${x}</button>`).join('')}</div>
          </div>
          ${field('Raça / tipo', `<select data-model="breed">${s.breeds.map((b) => `<option ${b === np.breed ? 'selected' : ''}>${b}</option>`).join('')}</select>${icon('down', 18)}`)}
          <div class="field-row">
            ${field('Nascimento', `<input type="date" data-model="birth" value="${np.birth}" max="${iso(0)}">`)}
            ${field('Peso', `<input type="number" inputmode="decimal" min="0" step="0.1" data-model="weight" value="${np.weight ?? ''}" placeholder="0"><span class="suffix">${s.unit}</span>`)}
          </div>
          ${field('Microchip (opcional)', `<input data-model="chip" value="${esc(np.chip || '')}" inputmode="numeric" placeholder="000 000 000 000 000">`)}
          <label class="card v-remind" style="margin:0 0 16px">
            <span class="t">${icon('shield', 20)} Castrado(a)</span>
            <span class="switch"><input type="checkbox" data-model-check="neutered" ${np.neutered ? 'checked' : ''} aria-label="Castrado"><span></span></span>
          </label>
          <button class="btn" type="submit">${editId ? 'Salvar alterações' : 'Adicionar pet'}</button>
          ${ui.onboarding && !editId ? '<button type="button" class="link-btn skip" data-act="skipPets">Pular e adicionar depois</button>' : ''}
          ${editId && S.pets.length > 1 ? `<button type="button" class="btn danger" style="margin-top:10px" data-act="askRemove" data-arg="${editId}">Remover pet</button>` : ''}
        </form>
      </div>`,
    };
  };
  const progress = (np) => 25 + ['name', 'birth', 'weight'].filter((k) => String(np[k] || '').trim()).length * 25;

  V.cadastro = () => {
    if (!ui.newPet || ui.newPet._edit) ui.newPet = blankPet();
    return petForm(null);
  };

  V.editar = (id) => {
    const p = petById(id);
    if (!p) return V.home();
    if (!ui.newPet || ui.newPet._edit !== id) ui.newPet = { ...clone(p), _edit: id };
    return petForm(id);
  };

  V.home = () => {
    const p = pet();
    const s = spOf(p);
    const recs = petVaccines(p);
    const late = recs.filter(isAlert);
    const nextUp = recs.filter((r) => r.next && r.st.cls !== 'late').sort((a, b) => a.next.localeCompare(b.next))[0];
    const alert = notifications().some((n) => n.urgent);
    const offers = recommended(p).sort((a, b) => discount(b) - discount(a));

    let dose = null;
    if (late.length) dose = { r: late[0], title: `${late[0].v.name}: ${late[0].st.label.toLowerCase()}`, sub: late[0].st.cls === 'late' ? `Venceu ${fmtDate(late[0].next)} · toque para registrar` : `${C.levels[late[0].v.level].label} · toque para registrar` };
    else if (nextUp) dose = { r: nextUp, title: `Próximo: ${nextUp.v.name}`, sub: nextUp.label };

    return {
      html: `
      <div class="view">
        <div class="hello">
          <button class="avatar-btn" data-go="#/perfil" aria-label="Meu perfil">${userAvatar(46)}</button>
          <div><small>Que bom te ver por aqui</small><strong>Olá, ${esc(firstName())}! 👋</strong></div>
          <button class="icon-btn" data-go="#/notificacoes" aria-label="Notificações">${icon('bell')}${alert ? '<span class="dot"></span>' : ''}</button>
        </div>

        <div class="pet-hero" data-go="#/pet/${p.id}" role="button" tabindex="0" aria-label="Abrir perfil de ${esc(p.name)}">
          <span class="spc">${paw(14)} ${s.label}</span>
          <h2>${esc(p.name)}</h2>
          <p>${esc(p.breed)}<br>${ageText(p.birth)} · ${weightText(p)}</p>
          <span class="hero-actions">
            <button class="btn sm white" data-go="#/editar/${p.id}">${icon('edit', 15)} Editar pet</button>
          </span>
          ${p.photo ? `<img class="pet-photo" src="${p.photo}" alt="Foto de ${esc(p.name)}">` : `<img class="pet-img" src="${petImg(p)}" alt="">`}
        </div>

        <div class="pet-switch" aria-label="Seus pets">
          ${S.pets.map((x) => `<button class="${x.id === p.id ? 'on' : ''}" data-act="setPet" data-arg="${x.id}" aria-pressed="${x.id === p.id}">${avatar(x)}${esc(x.name)}${lateCount(x) ? '<i class="late-dot"></i>' : ''}</button>`).join('')}
          <button class="add" data-act="newPet" aria-label="Cadastrar pet"><span class="avatar">${icon('plus', 22)}</span>Novo</button>
        </div>

        <div class="quick">
          <button data-go="#/vacinas"><span class="q-ic" style="background:linear-gradient(135deg,#38bdf8,#0284c7)">${icon('syringe', 20)}</span>Carteira</button>
          <button data-go="#/loja"><span class="q-ic" style="background:linear-gradient(135deg,#fdba74,#f97316)">${icon('bag', 20)}</span>Produtos</button>
          <button data-go="#/lembretes"><span class="q-ic" style="background:linear-gradient(135deg,#86efac,#16a34a)">${icon('bell', 20)}</span>Lembretes</button>
          <button data-go="#/dicas"><span class="q-ic" style="background:linear-gradient(135deg,#fde047,#eab308)">${icon('bulb', 20)}</span>Dicas</button>
        </div>

        ${dose
          ? `<button class="row next-dose" data-go="#/vacina/${dose.r.v.key}">
              <span class="r-ic ${dose.r.st.cls}">${icon(kindIcon(dose.r.v), 22)}</span>
              <span class="r-main"><strong>${dose.title}</strong><small>${dose.sub}</small></span>
              <span class="r-end"><span class="status ${dose.r.st.cls}">${dose.r.st.label}</span></span>
            </button>`
          : `<button class="row next-dose" data-go="#/vacinas">
              <span class="r-ic todo">${icon('syringe', 22)}</span>
              <span class="r-main"><strong>Comece a carteira de ${esc(p.name)}</strong><small>Registre o que já foi aplicado</small></span>
              <span class="r-end">${icon('right', 18)}</span>
            </button>`}

        ${(() => {
          const a = upcomingAppointments()[0];
          return a
            ? `<button class="row next-dose appt" data-go="#/agenda">
                ${avatar(petById(a.petId), 44)}
                <span class="r-main"><strong>${serviceOf(a.service).label} · ${esc(petById(a.petId).name)}</strong><small>${fmtDate(a.date)} às ${a.time} · ${clinicOf(a.clinic).label}</small></span>
                <span class="r-end"><span class="status ok">${whenText(daysUntil(a.date))}</span></span>
              </button>`
            : `<button class="row next-dose" data-go="#/agendar">
                <span class="r-ic">${icon('calendar', 22)}</span>
                <span class="r-main"><strong>Agendar consulta</strong><small>Clínica, vacinação, exames ou atendimento em casa</small></span>
                <span class="r-end">${icon('right', 18)}</span>
              </button>`;
        })()}

        <div class="sec-title"></div>
        <button class="promo" data-go="#/categoria/todos">
          <strong>Tudo para a saúde ${s.dos} ${s.label.toLowerCase()}</strong>
          <small>Produtos selecionados para ${s.plural.toLowerCase()}, entregues em casa.</small>
          <span class="btn sm white">Ver produtos</span>
          <img src="${petImg(p)}" alt="">
        </button>

        <div class="sec-title"><h2>Ofertas para ${esc(p.name)}</h2><button class="link-btn" data-go="#/loja">Ver todas ${icon('right', 14)}</button></div>
        <div class="hscroll">${offers.map(pcard).join('')}</div>
      </div>`,
    };
  };

  /* Perfil do pet: carteira, cuidados, produtos e dados no mesmo lugar */
  V.pet = (id) => {
    const p = petById(id);
    if (!p) return V.pets();
    if (S.active !== id) { S.active = id; save(); }
    const s = spOf(p);
    const tab = ui.petTab;
    const care = C.care[p.species];
    let body = '';

    if (tab === 'carteira') {
      const ORD = { late: 0, miss: 1, soon: 2, ok: 3, wait: 4, todo: 5 };
      const recs = petVaccines(p).sort((a, b) => ORD[a.st.cls] - ORD[b.st.cls]);
      body = `${summaryCard(p)}<div class="sec-title"><h2>${walletName(p.species)}</h2><button class="link-btn" data-go="#/vacinas">Histórico ${icon('right', 14)}</button></div><div class="list">${recs.map(vrow).join('')}</div>`;
    } else if (tab === 'cuidados') {
      const rems = S.reminders.filter((r) => r.petId === p.id).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
      body = `
        <div class="card facts">
          <div><span class="r-ic">${icon('bowl', 20)}</span><span><small>Alimentação</small><strong>${care.food}</strong></span></div>
          <div><span class="r-ic">${icon('home2', 20)}</span><span><small>Ambiente</small><strong>${care.home}</strong></span></div>
          <div><span class="r-ic">${icon('clock', 20)}</span><span><small>Expectativa de vida</small><strong>${s.life}</strong></span></div>
          <div><span class="r-ic late">${icon('info', 20)}</span><span><small>Sinal de alerta</small><strong>${care.alert}</strong></span></div>
        </div>
        <div class="sec-title"><h2>Dicas para ${s.plural.toLowerCase()}</h2></div>
        <div class="list">${C.tips[p.species].map(([t, d]) => `<div class="card tip"><span class="r-ic">${icon('bulb', 20)}</span><div><strong>${t}</strong><p>${d}</p></div></div>`).join('')}</div>
        <div class="sec-title"><h2>Próximos lembretes</h2><button class="link-btn" data-go="#/lembretes">Ver todos ${icon('right', 14)}</button></div>
        <div class="list">${rems.length ? rems.map((r) => `<div class="row"><span class="r-ic">${icon(reminderTypes[r.type].icon, 20)}</span><span class="r-main"><strong>${esc(r.title)}</strong><small>${fmtDate(r.date)} · ${whenText(daysUntil(r.date))}</small></span></div>`).join('') : `<button class="row" data-act="openReminder"><span class="r-ic">${icon('plus', 20)}</span><span class="r-main"><strong>Criar lembrete</strong><small>Vermífugo, limpeza, unhas...</small></span></button>`}</div>`;
    } else if (tab === 'produtos') {
      const rec = recommended(p);
      body = categories[p.species].map((c) => {
        const list = rec.filter((x) => x.cat === c.id);
        return list.length ? `<div class="sec-title"><h2>${c.label}</h2><button class="link-btn" data-go="#/categoria/${c.id}">Ver ${icon('right', 14)}</button></div><div class="hscroll">${list.map(pcard).join('')}</div>` : '';
      }).join('');
    } else {
      const rows = [
        ['Espécie', s.label], ['Raça / tipo', esc(p.breed)], ['Sexo', p.sex || '—'], ['Nascimento', p.birth ? `${fmtDate(p.birth)} (${ageText(p.birth)})` : '—'],
        ['Peso', weightText(p)], ['Castrado(a)', p.neutered ? 'Sim' : 'Não'], ['Microchip', esc(p.chip) || '—'],
      ];
      body = `
        <div class="card kv-list">${rows.map(([k, v]) => `<div><small>${k}</small><strong>${v}</strong></div>`).join('')}</div>
        <button class="btn" style="margin-top:16px" data-go="#/editar/${p.id}">${icon('edit', 18)} Editar dados</button>
        <button class="btn ghost" style="margin-top:10px" data-act="share">${icon('file', 18)} Compartilhar ficha com o veterinário</button>`;
    }

    const late = lateCount(p);
    return {
      html: `
      <div class="view">
        ${topbar('', `<button class="icon-btn" data-go="#/editar/${p.id}" aria-label="Editar pet">${icon('edit')}</button>`)}
        <div class="pet-hero big">
          <span class="spc">${paw(14)} ${s.label}</span>
          <h2>${esc(p.name)}</h2>
          <p>${esc(p.breed)}</p>
          ${late ? `<span class="status late" style="margin-top:10px">${late} atrasado(s)</span>` : '<span class="status ok" style="margin-top:10px">Saúde em dia</span>'}
          ${p.photo ? `<img class="pet-photo" src="${p.photo}" alt="Foto de ${esc(p.name)}">` : `<img class="pet-img" src="${petImg(p)}" alt="">`}
        </div>
        <div class="stats">
          <div>${icon('cake', 18)}<strong>${ageText(p.birth)}</strong><small>Idade</small></div>
          <div>${icon('weight', 18)}<strong>${weightText(p)}</strong><small>Peso</small></div>
          <div>${paw(18)}<strong>${p.sex || '—'}</strong><small>Sexo</small></div>
        </div>
        <div class="seg tabs4" role="tablist">
          ${[['carteira', 'Carteira'], ['cuidados', 'Cuidados'], ['produtos', 'Produtos'], ['dados', 'Dados']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-act="petTab" data-arg="${k}" role="tab">${l}</button>`).join('')}
        </div>
        ${body}
      </div>`,
    };
  };

  V.vacinas = () => {
    const p = pet();
    const recs = petVaccines(p);
    const byNext = (a, b) => (a.next || '9999').localeCompare(b.next || '9999');
    const groups = [
      ['Atenção', recs.filter(isAlert).sort(byNext)],
      ['Em dia', recs.filter((r) => ['ok', 'soon'].includes(r.st.cls)).sort(byNext)],
      ['Aguardando idade', recs.filter((r) => r.st.cls === 'wait').sort(byNext)],
      ['Recomendadas e opcionais', recs.filter((r) => r.st.cls === 'todo')],
    ];
    const history = [];
    recs.forEach(({ v, rec, applied }) => applied.forEach((d, i) => history.push({ v, d, i, place: rec && rec.place })));
    history.sort((a, b) => b.d.localeCompare(a.d));

    const legend = `<div class="legend">${[['ok', 'Em dia'], ['soon', 'Em breve'], ['late', 'Atrasada'], ['miss', 'Não tomou'], ['wait', 'Aguardando idade']].map(([c, l]) => `<span><i class="dotc ${c}"></i>${l}</span>`).join('')}</div>`;

    const body = ui.vacTab === 'geral'
      ? `${summaryCard(p)}${legend}
        ${groups.filter(([, list]) => list.length).map(([title, list]) => `<div class="sec-title"><h2>${title}</h2></div><div class="list">${list.map(vrow).join('')}</div>`).join('')}
        <p class="muted-sm" style="margin-top:16px">${icon('info', 14)} Protocolo de referência para ${spOf(p).plural.toLowerCase()} (WSAVA e práticas no Brasil). Confirme sempre com o veterinário de ${esc(p.name)}.</p>`
      : history.length
        ? `<div class="list">${history.map(({ v, d, i }) => `
            <button class="row" data-go="#/vacina/${v.key}">
              <span class="r-ic ok">${icon('check', 22)}</span>
              <span class="r-main"><strong>${v.name}</strong><small>${kindLabel(v)} · ${i + 1}ª aplicação · ${fmtDate(d)}</small></span>
              <span class="r-end">${icon('right', 18)}</span>
            </button>`).join('')}</div>`
        : emptyState('Nenhuma aplicação ainda', 'Abra um item e toque em "Registrar nova aplicação".');

    return {
      html: `
      <div class="view">
        <div class="topbar left"><h1>${hasVaccine(p.species) ? 'Vacinas' : 'Saúde'}</h1><button class="icon-btn" data-act="share" aria-label="Compartilhar carteira">${icon('file')}</button></div>
        <div class="shop-for"><small>${walletName(p.species)} de</small>${petChip()}</div>
        <div class="seg" role="tablist">
          <button class="${ui.vacTab === 'geral' ? 'on' : ''}" data-act="vacTab" data-arg="geral" role="tab">Visão geral</button>
          <button class="${ui.vacTab === 'hist' ? 'on' : ''}" data-act="vacTab" data-arg="hist" role="tab">Histórico</button>
        </div>
        ${body}
      </div>`,
    };
  };

  V.vacina = (key) => {
    const p = pet();
    const v = vaccines[p.species].find((x) => x.key === key);
    if (!v) return V.vacinas();
    const r = vInfo(p, v);
    const { rec, st, n } = r;
    const last = n ? r.applied[n - 1] : null;
    const steps = Array.from({ length: Math.max(r.series, 1) }, (_, i) => i < Math.min(n, r.series));
    return {
      html: `
      <div class="view">
        ${topbar(`Detalhes ${v.kind === 'vacina' ? 'da vacina' : v.kind === 'exame' ? 'do exame' : 'da consulta'}`)}
        <div class="card v-head">
          <span class="r-ic">${icon(kindIcon(v), 28)}</span>
          <div><strong>${v.name}</strong><small>${last ? `Última em ${fmtDate(last)}` : 'Ainda não registrada'} · ${esc(p.name)}</small><span class="lv-line">${levelTag(v)}</span></div>
        </div>
        <div class="card kv">
          <div><small>${n && n < r.series ? `${n + 1}ª dose` : n ? 'Próximo reforço' : st.cls === 'wait' ? 'Pode tomar a partir de' : 'Próxima dose'}</small><strong>${r.next ? fmtDate(r.next) : 'Assim que possível'}</strong></div>
          <div><small>Situação</small><span class="status ${st.cls}">${st.label}</span></div>
        </div>
        ${r.series > 1 ? `
          <div class="card dose-track">
            <small>Esquema inicial · ${Math.min(n, r.series)} de ${r.series} doses</small>
            <div>${steps.map((done, i) => `<span class="${done ? 'done' : i === n ? 'next' : ''}">${done ? icon('check', 14) : i + 1}</span>`).join('<i></i>')}<i></i><span class="${n >= r.series ? 'done' : ''}" title="Reforço">${icon('sparkle', 14)}</span></div>
          </div>` : ''}
        <div class="card v-desc"><strong style="color:var(--text-dark)">${protocolText(v)}</strong><br>${v.desc}</div>
        <label class="card v-remind">
          <span class="t">${icon('bell', 20)} Me lembrar da próxima dose</span>
          <span class="switch"><input type="checkbox" data-act="toggleRemind" data-arg="${key}" ${r.remind ? 'checked' : ''} aria-label="Lembrete da próxima dose"><span></span></span>
        </label>
        ${n ? `
          <div class="sec-title"><h2>Aplicações</h2></div>
          <div class="list">${r.applied.slice().reverse().map((d, i) => `
            <div class="row"><span class="r-ic ok">${icon('check', 20)}</span><span class="r-main"><strong>${n - i}ª aplicação${n - i <= r.series && r.series > 1 ? ' (esquema inicial)' : n - i > r.series ? ' (reforço)' : ''}</strong><small>${fmtDate(d)}${rec.place && i === 0 ? ` · ${esc(rec.place)}` : ''}</small></span>
              <span class="r-end"><button class="icon-btn sm" data-act="removeDose" data-arg="${key}|${d}" aria-label="Remover aplicação">${icon('trash', 16)}</button></span></div>`).join('')}
          </div>` : ''}
        <button class="btn" style="margin-top:22px" data-act="openApply" data-arg="${key}">${icon('plus', 20)} Adicionar nova aplicação</button>
      </div>`,
    };
  };

  V.lembretes = () => {
    const p = pet();
    const tab = ui.remTab;
    const remStatus = (d) => (d < 0 ? ['late', 'Atrasado'] : d === 0 ? ['soon', 'Hoje'] : d <= 7 ? ['soon', 'Em breve'] : ['ok', 'Agendado']);
    let list;
    if (tab === 'vacinas') {
      const recs = petVaccines(p).filter((r) => r.next && r.remind && r.st.cls !== 'todo')
        .sort((a, b) => a.next.localeCompare(b.next));
      list = recs.length ? recs.map(vrow).join('') : emptyState('Sem lembretes da carteira', 'Registre uma aplicação para o app avisar a próxima.');
    } else {
      const items = S.reminders.filter((r) => r.petId === p.id && (tab === 'vermifugos' ? r.type === 'vermifugo' : r.type !== 'vermifugo'))
        .sort((a, b) => a.date.localeCompare(b.date));
      list = items.length
        ? items.map((r) => {
          const d = daysUntil(r.date);
          const [cls, label] = remStatus(d);
          return `
            <div class="row">
              <span class="r-ic ${cls}">${icon(reminderTypes[r.type].icon, 22)}</span>
              <span class="r-main"><strong>${esc(r.title)}</strong><small>${fmtDate(r.date)} · ${whenText(d)}</small></span>
              <span class="r-end"><span class="status ${cls}">${label}</span>
                <button class="icon-btn sm" data-act="remDone" data-arg="${r.id}" aria-label="Concluir">${icon('check', 18)}</button></span>
            </div>`;
        }).join('')
        : emptyState('Nada por aqui', 'Crie um lembrete para não esquecer.');
    }
    return {
      html: `
      <div class="view">
        ${topbar('Lembretes')}
        <div class="shop-for"><small>Lembretes de</small>${petChip()}</div>
        <div class="seg" role="tablist">
          ${[['vacinas', 'Vacinas'], ['vermifugos', 'Vermífugos'], ['outros', 'Outros']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-act="remTab" data-arg="${k}" role="tab">${l}</button>`).join('')}
        </div>
        <div class="list">${list}</div>
        <button class="btn" style="margin-top:22px" data-act="openReminder">${icon('plus', 20)} Adicionar lembrete</button>
      </div>`,
    };
  };

  /* Notificações de todos os pets */
  const notifications = () => {
    const out = [];
    const ahead = Number(S.settings.antecedencia) || 7;
    S.pets.forEach((p) => {
      if (S.settings.vacinas) {
        petVaccines(p).forEach(({ v, st, next, remind, label }) => {
          if (!remind) return;
          if (st.cls === 'miss') { out.push({ p, d: -1, urgent: true, ic: kindIcon(v), cls: 'miss', title: `${v.name} · ${p.name}`, sub: `${st.label} · ${C.levels[v.level].label.toLowerCase()}`, go: `#/vacina/${v.key}` }); return; }
          if (!next || st.cls === 'todo') return;
          const d = daysUntil(next);
          if (d < 0 || d <= Math.max(ahead, 14)) out.push({ p, d, urgent: d <= ahead, ic: kindIcon(v), cls: st.cls, title: `${v.name} · ${p.name}`, sub: d < 0 ? `Atrasada desde ${fmtDate(next)}` : label, go: `#/vacina/${v.key}` });
        });
      }
      if (S.settings.lembretes) {
        S.reminders.filter((r) => r.petId === p.id).forEach((r) => {
          const d = daysUntil(r.date);
          if (d <= 14) out.push({ p, d, urgent: d <= ahead, ic: reminderTypes[r.type].icon, cls: d < 0 ? 'late' : d <= 3 ? 'soon' : 'ok', title: `${r.title} · ${p.name}`, sub: `${fmtDate(r.date)} · ${whenText(d)}`, go: '#/lembretes' });
        });
      }
    });
    upcomingAppointments().forEach((a) => {
      const d = daysUntil(a.date);
      const p = petById(a.petId);
      if (d <= 7) out.push({ p, d, urgent: d <= 1, ic: 'calendar', cls: 'ok', title: `${serviceOf(a.service).label} · ${p.name}`, sub: `${fmtDate(a.date)} às ${a.time} · ${clinicOf(a.clinic).label}`, go: '#/agenda' });
    });
    return out.sort((a, b) => a.d - b.d);
  };

  /* Agenda de consultas */
  V.agenda = () => {
    const tab = ui.agTab;
    const all = (S.appointments || []).filter((a) => petById(a.petId));
    const list = tab === 'proximas'
      ? upcomingAppointments()
      : all.filter((a) => a.status !== 'agendado' || daysUntil(a.date) < 0).sort((a, b) => b.date.localeCompare(a.date));
    const stLabel = (a) => (a.status === 'cancelado' ? ['late', 'Cancelado'] : a.status === 'agendado' && daysUntil(a.date) >= 0 ? ['ok', whenText(daysUntil(a.date))] : ['todo', 'Concluído']);
    return {
      html: `
      <div class="view">
        ${topbar('Agenda de consultas', `<button class="icon-btn" data-go="#/agendar" aria-label="Nova consulta">${icon('plus')}</button>`)}
        <div class="seg" role="tablist">
          <button class="${tab === 'proximas' ? 'on' : ''}" data-act="agTab" data-arg="proximas" role="tab">Próximas</button>
          <button class="${tab === 'hist' ? 'on' : ''}" data-act="agTab" data-arg="hist" role="tab">Histórico</button>
        </div>
        <div class="list">${list.length ? list.map((a) => {
          const p = petById(a.petId);
          const s = serviceOf(a.service);
          const [cls, lab] = stLabel(a);
          return `
          <div class="card appt-card">
            <div class="appt-date"><strong>${a.date.slice(8, 10)}</strong><small>${['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(a.date.slice(5, 7)) - 1]}</small><span>${a.time}</span></div>
            <div class="appt-main">
              <strong>${s.label}</strong>
              <small>${avatar(p, 20)} ${esc(p.name)} · ${clinicOf(a.clinic).label}</small>
              ${a.notes ? `<small class="muted-sm">${esc(a.notes)}</small>` : ''}
              <span class="status ${cls}">${lab}</span>
            </div>
            ${a.status === 'agendado' && daysUntil(a.date) >= 0 ? `<button class="icon-btn sm" data-act="cancelAppt" data-arg="${a.id}" aria-label="Cancelar consulta">${icon('x', 16)}</button>` : ''}
          </div>`;
        }).join('') : emptyState(tab === 'proximas' ? 'Nenhuma consulta marcada' : 'Sem histórico ainda', 'Agende consultas, vacinas e exames com a equipe CuidaPet.', null, tab === 'proximas' ? `<button class="btn" style="margin-top:18px" data-go="#/agendar">${icon('calendar', 18)} Agendar consulta</button>` : '')}</div>
      </div>`,
    };
  };

  const takenSlots = (date) => {
    // Simula horários ocupados de forma estável para cada data
    let h = 0;
    for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) % 9973;
    return C.slots.filter((_, i) => (h + i * 7) % 4 === 0);
  };

  V.agendar = () => {
    const b = ui.booking || (ui.booking = { petId: S.active, service: 'consulta', clinic: 'centro', date: iso(1), time: null, notes: '' });
    if (!petById(b.petId)) b.petId = S.pets[0].id;
    const p = petById(b.petId);
    const services = C.services.filter((s) => !s.species || s.species.includes(p.species));
    if (!services.some((s) => s.id === b.service)) b.service = services[0].id;
    const taken = takenSlots(b.date);
    return {
      cls: 'no-tabbar',
      html: `
      <div class="view">
        ${topbar('Agendar consulta')}
        <div class="field"><span>Para qual pet?</span>
          <div class="pet-switch" style="margin-top:4px">${S.pets.map((x) => `<button class="${x.id === b.petId ? 'on' : ''}" data-act="bk" data-arg="petId:${x.id}">${avatar(x)}${esc(x.name)}</button>`).join('')}</div>
        </div>
        <div class="field"><span>Serviço</span>
          <div class="opt-grid">${services.map((s) => `<button class="opt ${s.id === b.service ? 'on' : ''}" data-act="bk" data-arg="service:${s.id}">${icon(s.icon, 20)}<span>${s.label}</span><small>${s.minutes} min</small></button>`).join('')}</div>
        </div>
        <div class="field"><span>Onde</span>
          <div class="list">${C.clinics.map((c) => `<button class="row" data-act="bk" data-arg="clinic:${c.id}"><span class="radio ${c.id === b.clinic ? 'on' : ''}"></span><span class="r-main"><strong>${c.label}</strong><small>${c.address}${c.h24 ? ' · 24 horas' : ''}</small></span></button>`).join('')}</div>
        </div>
        ${field('Data', `<input type="date" data-bk="date" value="${b.date}" min="${iso(1)}" max="${iso(90)}">`)}
        <div class="field"><span>Horário</span>
          <div class="slots">${C.slots.map((t) => `<button class="${t === b.time ? 'on' : ''}" ${taken.includes(t) ? 'disabled' : ''} data-act="bk" data-arg="time:${t}">${t}</button>`).join('')}</div>
        </div>
        ${field('Observações (opcional)', `<input data-bk="notes" value="${esc(b.notes)}" placeholder="Ex.: está coçando a orelha">`)}
        <button class="btn" data-act="confirmAppt" ${b.time ? '' : 'disabled'}>${icon('check', 18)} Confirmar agendamento</button>
      </div>`,
    };
  };

  V.notificacoes = () => {
    const list = notifications();
    return {
      html: `
      <div class="view">
        ${topbar('Notificações', `<button class="icon-btn" data-go="#/config" aria-label="Configurar notificações">${icon('sliders')}</button>`)}
        ${list.length ? `<div class="list">${list.map((n) => `
          <button class="row" data-act="openNotif" data-arg="${n.p.id}" data-then="${n.go}">
            ${avatar(n.p, 44)}
            <span class="r-main"><strong>${esc(n.title)}</strong><small>${n.sub}</small></span>
            <span class="r-end"><span class="r-ic ${n.cls}" style="width:34px;height:34px;border-radius:10px">${icon(n.ic, 16)}</span></span>
          </button>`).join('')}</div>`
        : emptyState('Tudo tranquilo!', 'Nenhuma vacina ou lembrete para os próximos dias.')}
        ${S.settings.ofertas ? `<div class="sec-title"><h2>Ofertas</h2></div><button class="row" data-go="#/loja"><span class="r-ic soon">${icon('tag', 20)}</span><span class="r-main"><strong>Cupom CUIDA10</strong><small>10% de desconto em qualquer compra</small></span></button>` : ''}
      </div>`,
    };
  };

  /* Loja */
  const shopBody = () => {
    const p = pet();
    const s = spOf(p);
    const all = products.filter((x) => x.sp === p.species);
    const q = ui.query.trim().toLowerCase();
    if (q) {
      const res = all.filter((x) => (x.name + ' ' + x.brand).toLowerCase().includes(q));
      return res.length
        ? `<div class="sec-title"><h2>${res.length} resultado${res.length > 1 ? 's' : ''} para ${s.plural.toLowerCase()}</h2></div><div class="list">${res.map(prow).join('')}</div>`
        : emptyState('Nada encontrado', `Não achamos “${esc(ui.query)}” para ${s.plural.toLowerCase()}.`);
    }
    const offers = all.filter((x) => x.old).slice(0, 4);
    const rec = recommended(p).filter((x) => !offers.includes(x));
    return `
      <div class="cats">
        ${categories[p.species].map((c) => `<button data-go="#/categoria/${c.id}"><span class="c-ic">${icon(c.icon, 24)}</span>${c.label}</button>`).join('')}
      </div>
      ${offers.length ? `<div class="sec-title"><h2>Ofertas da semana</h2><button class="link-btn" data-go="#/categoria/todos">Ver todos ${icon('right', 14)}</button></div><div class="pgrid">${offers.map(pcard).join('')}</div>` : ''}
      <div class="sec-title"></div>
      <button class="promo" data-go="#/pet/${p.id}" data-pettab="produtos">
        <strong>Produtos indicados para ${esc(p.name)}</strong>
        <small>Com base na espécie, idade e porte cadastrados.</small>
        <span class="btn sm white">Ver todos</span>
        ${p.photo ? '' : `<img src="${petImg(p)}" alt="">`}
      </button>
      <div class="sec-title"><h2>Mais vendidos</h2></div>
      <div class="pgrid">${rec.map(pcard).join('')}</div>
      <div class="sec-title"></div>
      <button class="row" data-go="#/parceiros"><span class="r-ic">${icon('sparkle', 22)}</span><span class="r-main"><strong>Nossas marcas parceiras</strong><small>Qualidade para o bem-estar do seu pet</small></span><span class="r-end">${icon('right', 18)}</span></button>`;
  };

  V.loja = () => ({
    html: `
    <div class="view">
      <div class="topbar left"><h1>Produtos</h1>${cartBtn()}</div>
      <label class="input search">${icon('search', 18)}<input type="search" data-search value="${esc(ui.query)}" placeholder="Buscar produtos, marcas..." aria-label="Buscar produtos"></label>
      <div class="shop-for"><small>Comprando para</small>${petChip()}</div>
      <div id="shopBody">${shopBody()}</div>
    </div>`,
  });

  V.categoria = (cat = 'todos', tag = '') => {
    const p = pet();
    const cats = categories[p.species];
    const c = cats.find((x) => x.id === cat);
    let list = products.filter((x) => x.sp === p.species && (cat === 'todos' || x.cat === cat));
    const tags = [...new Set(list.map((x) => x.tag).filter(Boolean))];
    if (tag) list = list.filter((x) => x.tag === tag);
    const chips = cat === 'todos'
      ? `<button class="chip on">Todos</button>${cats.map((x) => `<button class="chip" data-replace="#/categoria/${x.id}">${x.label}</button>`).join('')}`
      : `<button class="chip ${!tag ? 'on' : ''}" data-replace="#/categoria/${cat}">Todos</button>${tags.map((t) => `<button class="chip ${t === tag ? 'on' : ''}" data-replace="#/categoria/${cat}/${encodeURIComponent(t)}">${spOf(p).plural} ${t.toLowerCase()}</button>`).join('')}${cats.filter((x) => x.id !== cat).map((x) => `<button class="chip ghost" data-replace="#/categoria/${x.id}">${x.label}</button>`).join('')}`;
    return {
      html: `
      <div class="view">
        ${topbar(c ? c.label : `Para ${spOf(p).plural.toLowerCase()}`, cartBtn())}
        <div class="chips">${chips}</div>
        <div class="list">${list.length ? list.map(prow).join('') : emptyState('Em breve', 'Estamos trazendo novidades para esta categoria.')}</div>
      </div>`,
    };
  };

  V.produto = (id) => {
    const p = product(id);
    if (!p) return V.loja();
    if (!ui.pd || ui.pd.id !== id) {
      ui.pd = { id, size: p.sizes ? Math.max(0, p.sizes.findIndex((s) => s[1] === p.price)) : 0, qty: 1 };
    }
    const price = p.sizes ? p.sizes[ui.pd.size][1] : p.price;
    const sp = species[p.sp];
    const active = pet();
    const mismatch = active.species !== p.sp;
    const similar = products.filter((x) => x.sp === p.sp && x.id !== p.id && x.cat === p.cat).concat(products.filter((x) => x.sp === p.sp && x.cat !== p.cat)).slice(0, 6);
    return {
      cls: 'no-tabbar',
      html: `
      <div class="view pd">
        ${topbar('', `<button class="icon-btn fav ${S.favs.includes(p.id) ? 'on' : ''}" data-act="fav" data-arg="${p.id}" aria-label="Favoritar">${icon('heart')}</button>`)}
        <div class="pd-art">${p.old ? `<span class="badge-off" style="position:absolute;top:10px;right:30px;z-index:1">-${discount(p)}%</span>` : ''}${art(p)}</div>
        <span class="for-chip"><img src="${sp.img}" alt="">Para ${sp.plural.toLowerCase()}</span>
        <h1 class="pd-name">${p.name}</h1>
        <span class="stars">★ ${p.rating.toLocaleString('pt-BR')} <small>(${p.reviews} avaliações) · ${p.brand}</small></span>
        <div class="pd-price"><span class="price">${brl(price)}</span>${p.old && (!p.sizes || p.sizes[ui.pd.size][1] === p.price) ? `<span class="price-old">${brl(p.old)}</span><span class="badge-off">-${discount(p)}%</span>` : ''}</div>
        ${p.sizes ? `<div class="sizes">${p.sizes.map(([l, v], i) => `<button class="${i === ui.pd.size ? 'on' : ''}" data-act="size" data-arg="${i}">${l}<small>${brl(v)}</small></button>`).join('')}</div>` : ''}
        <div class="sec-title" style="margin-top:4px"><h2>Sobre o produto</h2></div>
        <p class="pd-desc">${p.desc}</p>
        <div class="pd-perks">
          <span>${icon('truck', 16)} Entrega em até 2 dias úteis</span>
          <span>${icon('shield', 16)} Troca grátis em 7 dias</span>
        </div>
        ${mismatch ? `<div class="warn">${icon('help', 18)}<span>Este produto é para ${sp.plural.toLowerCase()}. O pet selecionado é ${esc(active.name)} (${spOf(active).label.toLowerCase()}).</span></div>` : ''}
        ${similar.length ? `<div class="sec-title"><h2>Você também pode gostar</h2></div><div class="hscroll">${similar.map(pcard).join('')}</div>` : ''}
        <div class="buybar">
          <div class="stepper"><button data-act="qty" data-arg="-1" aria-label="Diminuir">${icon('minus', 16)}</button><span>${ui.pd.qty}</span><button data-act="qty" data-arg="1" aria-label="Aumentar">${icon('plus', 16)}</button></div>
          <button class="btn" data-act="addDetail">Adicionar ao carrinho</button>
        </div>
      </div>`,
    };
  };

  const shipping = (sub, mode = 'normal') => (mode === 'expressa' ? 24.9 : sub >= 199 || sub === 0 ? 0 : 14.9);
  const cartTotals = (mode) => {
    const sub = S.cart.reduce((t, i) => t + itemPrice(i) * i.qty, 0);
    const disc = S.coupon === 'CUIDA10' ? sub * 0.1 : 0;
    const ship = shipping(sub - disc, mode);
    return { sub, disc, ship, total: sub - disc + ship };
  };

  V.carrinho = () => {
    if (!S.cart.length) {
      return {
        cls: 'no-tabbar',
        html: `<div class="view">${topbar('Meu carrinho')}${emptyState('Seu carrinho está vazio', 'Que tal um petisco ou brinquedo novo?', null, '<button class="btn" style="margin-top:18px" data-go="#/loja">Ir para a loja</button>')}</div>`,
      };
    }
    const t = cartTotals('normal');
    return {
      cls: 'no-tabbar',
      html: `
      <div class="view">
        ${topbar('Meu carrinho')}
        <div class="list">
          ${S.cart.map((i, idx) => {
            const p = product(i.id);
            return `
            <div class="card cart-item">
              ${art(p)}
              <div class="ci-main">
                <strong>${p.name}</strong>
                <small>${i.size ? i.size + ' · ' : ''}${species[p.sp].plural}</small>
                <div class="ci-row"><span class="price">${brl(itemPrice(i))}</span>
                  <div class="stepper sm"><button data-act="cartQty" data-arg="${idx}:-1" aria-label="Diminuir">${icon('minus', 14)}</button><span>${i.qty}</span><button data-act="cartQty" data-arg="${idx}:1" aria-label="Aumentar">${icon('plus', 14)}</button></div>
                </div>
              </div>
              <button class="trash" data-act="cartRemove" data-arg="${idx}" aria-label="Remover">${icon('trash', 18)}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="sec-title"><h2>Possui cupom de desconto?</h2></div>
        <form class="coupon" data-form="coupon">
          <label class="input">${icon('tag', 18)}<input name="code" value="${esc(S.coupon || '')}" placeholder="Digite o cupom" autocapitalize="characters"></label>
          <button class="btn sm" type="submit">Aplicar</button>
        </form>
        <div class="card totals">
          <h3>Resumo do pedido</h3>
          <div><span>Subtotal</span><span>${brl(t.sub)}</span></div>
          ${t.disc ? `<div class="disc"><span>Cupom CUIDA10</span><span>− ${brl(t.disc)}</span></div>` : ''}
          <div><span>Frete</span>${S.cep ? `<span>${t.ship ? brl(t.ship) : 'Grátis'} <button class="link-btn" data-act="openCep">${esc(S.cep)}</button></span>` : '<button class="link-btn" data-act="openCep">Calcular</button>'}</div>
          <div class="total"><span>Total</span><span>${brl(S.cep ? t.total : t.sub - t.disc)}</span></div>
        </div>
        ${t.ship ? `<p class="muted-sm" style="text-align:center;margin-top:10px">Faltam ${brl(199 - (t.sub - t.disc))} para frete grátis</p>` : ''}
        <button class="btn" style="margin-top:18px" data-go="#/checkout">Finalizar compra</button>
      </div>`,
    };
  };

  V.checkout = () => {
    if (!S.cart.length) return V.carrinho();
    const mode = S.checkout.delivery;
    const t = cartTotals(mode);
    const addr = S.addresses.find((a) => a.id === S.checkout.addr) || main(S.addresses);
    const pay = S.payments.find((x) => x.id === S.checkout.pay) || main(S.payments);
    const radio = (on) => `<span class="radio ${on ? 'on' : ''}"></span>`;
    return {
      cls: 'no-tabbar',
      html: `
      <div class="view">
        ${topbar('Finalizar compra')}
        <div class="sec-title" style="margin-top:0"><h2>Endereço de entrega</h2><button class="link-btn" data-go="#/enderecos">Gerenciar</button></div>
        <div class="list">${S.addresses.length ? S.addresses.map((a) => `
          <button class="row" data-act="pickAddr" data-arg="${a.id}">${radio(addr && a.id === addr.id)}
            <span class="r-main"><strong>${esc(a.label)}</strong><small>${esc(a.line)} · ${esc(a.city)}</small></span></button>`).join('')
          : `<button class="row" data-go="#/enderecos"><span class="r-ic">${icon('plus', 20)}</span><span class="r-main"><strong>Adicionar endereço</strong></span></button>`}</div>

        <div class="sec-title"><h2>Entrega</h2></div>
        <div class="list">
          <button class="row" data-act="pickDelivery" data-arg="normal">${radio(mode === 'normal')}<span class="r-main"><strong>Normal</strong><small>Até 2 dias úteis</small></span><span class="r-end"><strong style="color:var(--text-dark)">${shipping(t.sub - t.disc, 'normal') ? brl(shipping(t.sub - t.disc, 'normal')) : 'Grátis'}</strong></span></button>
          <button class="row" data-act="pickDelivery" data-arg="expressa">${radio(mode === 'expressa')}<span class="r-main"><strong>Expressa</strong><small>Hoje, para pedidos até 14h</small></span><span class="r-end"><strong style="color:var(--text-dark)">${brl(24.9)}</strong></span></button>
        </div>

        <div class="sec-title"><h2>Pagamento</h2><button class="link-btn" data-go="#/pagamentos">Gerenciar</button></div>
        <div class="list">${S.payments.map((x) => `
          <button class="row" data-act="pickPay" data-arg="${x.id}">${radio(pay && x.id === pay.id)}
            <span class="r-ic">${icon(x.kind === 'card' ? 'card' : x.kind === 'pix' ? 'qr' : 'file', 20)}</span>
            <span class="r-main"><strong>${x.kind === 'card' ? `${x.brand} •••• ${x.last4}` : x.brand}</strong><small>${x.kind === 'card' ? `Validade ${x.exp}` : x.kind === 'pix' ? 'Aprovação na hora' : 'Vence em 3 dias úteis'}</small></span></button>`).join('')}</div>

        <div class="card totals">
          <div><span>Produtos (${cartCount()})</span><span>${brl(t.sub)}</span></div>
          ${t.disc ? `<div class="disc"><span>Cupom</span><span>− ${brl(t.disc)}</span></div>` : ''}
          <div><span>Frete</span><span>${t.ship ? brl(t.ship) : 'Grátis'}</span></div>
          <div class="total"><span>Total</span><span>${brl(t.total)}</span></div>
        </div>
        <button class="btn" style="margin-top:18px" data-act="confirmOrder" ${!addr || !pay ? 'disabled' : ''}>${icon('lock', 18)} Confirmar pedido</button>
      </div>`,
    };
  };

  V.parceiros = () => ({
    html: `
    <div class="view">
      ${topbar('Nossas marcas parceiras')}
      <p class="muted-sm" style="text-align:center;margin:-6px 0 18px">Produtos de qualidade para o bem-estar do seu pet.</p>
      <div class="brands">${C.brands.map((b) => `<div class="brand-tile ${b.font}" style="color:${b.color}">${b.name}</div>`).join('')}</div>
      <div class="sec-title"></div>
      <button class="promo" data-go="#/loja"><strong>As melhores marcas para quem você ama</strong><small>Do cachorro ao peixinho.</small><span class="btn sm white">Ir à loja</span><img src="${petImg(pet())}" alt=""></button>
    </div>`,
  });

  V.mais = () => {
    const items = [
      ['paw', 'Meus pets', '#/pets'], ['calendar', 'Agenda de consultas', '#/agenda'], ['box', 'Meus pedidos', '#/pedidos'], ['heart', 'Favoritos', '#/favoritos'],
      ['pin', 'Endereços', '#/enderecos'], ['card', 'Formas de pagamento', '#/pagamentos'], ['bell', 'Lembretes', '#/lembretes'],
      ['bulb', 'Dicas e conteúdos', '#/dicas'], ['sparkle', 'Marcas parceiras', '#/parceiros'], ['sliders', 'Configurações', '#/config'],
      ['help', 'Ajuda e suporte', '#/ajuda'],
    ];
    return {
      html: `
      <div class="view">
        <div class="topbar left"><h1>Mais</h1><span></span></div>
        <button class="card profile" data-go="#/perfil">${userAvatar(56)}<span style="flex:1"><strong>${esc(S.profile.name)}</strong><small>${esc(S.profile.email)}${user.provider === 'google' ? ' · Google' : ''}</small></span>${icon('right', 18)}</button>
        <div class="card menu">
          ${items.map(([ic, l, go]) => `<button data-go="${go}">${ic === 'paw' ? paw(20) : icon(ic, 20)}<span>${l}</span>${ic === 'paw' ? `<small class="count-pill">${S.pets.length}</small>` : ''}<span class="chev">${icon('right', 18)}</span></button>`).join('')}
          <button class="danger" data-act="logout">${icon('logout', 20)}<span>Sair</span></button>
        </div>
        <p class="muted-sm" style="text-align:center;margin-top:16px">CuidaPet · versão protótipo 2.0</p>
      </div>`,
    };
  };

  V.pets = () => ({
    html: `
    <div class="view">
      ${topbar('Meus pets', `<button class="icon-btn" data-act="newPet" aria-label="Cadastrar pet">${icon('plus')}</button>`)}
      <p class="muted-sm" style="margin:-8px 0 14px">${S.pets.length} ${S.pets.length > 1 ? 'pets cadastrados' : 'pet cadastrado'}. Toque para ver o perfil completo.</p>
      <div class="list">
        ${S.pets.map((p) => {
          const late = lateCount(p);
          return `
          <button class="row pet-row" data-go="#/pet/${p.id}">
            ${avatar(p, 56)}
            <span class="r-main"><strong>${esc(p.name)}</strong><small>${spOf(p).label} · ${esc(p.breed)}</small><small>${ageText(p.birth)} · ${weightText(p)}</small></span>
            <span class="r-end">${late ? `<span class="status late">${late} atrasado${late > 1 ? 's' : ''}</span>` : '<span class="status ok">Em dia</span>'}${icon('right', 18)}</span>
          </button>`;
        }).join('')}
      </div>
      <button class="btn" style="margin-top:20px" data-act="newPet">${icon('plus', 20)} Cadastrar novo pet</button>
    </div>`,
  });

  V.pedidos = () => ({
    html: `
    <div class="view">
      ${topbar('Meus pedidos')}
      ${S.orders.length
        ? `<div class="list">${S.orders.slice().reverse().map((o) => {
            const d = daysUntil(o.date);
            const st = d <= -2 ? ['ok', 'Entregue'] : ['soon', 'A caminho'];
            return `<div class="row"><span class="r-ic">${icon('truck', 22)}</span>
              <span class="r-main"><strong>Pedido #${o.n}</strong><small>${fmtDate(o.date)} · ${o.items} ${o.items > 1 ? 'itens' : 'item'} · ${brl(o.total)}</small></span>
              <span class="status ${st[0]}">${st[1]}</span></div>`;
          }).join('')}</div>`
        : emptyState('Nenhum pedido ainda', 'Seus pedidos da loja aparecem aqui.', null, '<button class="btn" style="margin-top:18px" data-go="#/loja">Ir para a loja</button>')}
    </div>`,
  });

  V.favoritos = () => {
    const list = S.favs.map(product).filter(Boolean);
    return {
      html: `<div class="view">${topbar('Favoritos')}${list.length ? `<div class="list">${list.map(prow).join('')}</div>` : emptyState('Nenhum favorito', 'Toque no coração de um produto para salvá-lo aqui.')}</div>`,
    };
  };

  V.dicas = () => {
    const p = pet();
    const s = spOf(p);
    return {
      html: `
      <div class="view">
        ${topbar('Dicas e conteúdos')}
        <div class="shop-for"><small>Dicas para</small>${petChip()}</div>
        <div class="list">${C.tips[p.species].map(([t, d]) => `<div class="card tip"><span class="r-ic">${icon('bulb', 20)}</span><div><strong>${t}</strong><p>${d}</p></div></div>`).join('')}</div>
        <div class="sec-title"><h2>Para todos os tutores</h2></div>
        <div class="list">${C.articles.map(([t, d, ic]) => `<div class="card tip"><span class="r-ic blue">${icon(ic, 20)}</span><div><strong>${t}</strong><p>${d}</p></div></div>`).join('')}</div>
        <div class="sec-title"></div>
        <button class="promo" data-go="#/pet/${p.id}"><strong>Ficha de cuidados ${s.dos} ${s.label.toLowerCase()}</strong><small>Alimentação, ambiente e sinais de alerta.</small><span class="btn sm white">Abrir perfil</span><img src="${petImg(p)}" alt=""></button>
      </div>`,
    };
  };

  V.perfil = () => ({
    cls: 'no-tabbar',
    html: `
    <div class="view">
      ${topbar('Meu perfil')}
      <div class="profile-head">${userAvatar(84)}<strong>${esc(S.profile.name)}</strong><small>Tutor(a) de ${S.pets.length} ${S.pets.length === 1 ? 'pet' : 'pets'}${user.provider === 'google' ? ' · conta Google' : ''}</small></div>
      <div class="sec-title" style="margin-top:0"><h2>Meus pets</h2><button class="link-btn" data-act="newPet">${icon('plus', 14)} Adicionar</button></div>
      <div class="pet-switch" style="margin-top:0">${S.pets.map((x) => `<button data-go="#/pet/${x.id}">${avatar(x)}${esc(x.name)}</button>`).join('')}<button class="add" data-act="newPet" aria-label="Cadastrar pet"><span class="avatar">${icon('plus', 22)}</span>Novo</button></div>
      <div class="sec-title"><h2>Dados pessoais</h2></div>
      <form data-form="perfil">
        ${field('Nome completo', `<input name="name" value="${esc(S.profile.name)}" autocomplete="name">`)}
        ${field('E-mail', `<input name="email" type="email" value="${esc(S.profile.email)}" autocomplete="email" ${user.provider === 'google' ? 'readonly' : ''}>`)}
        ${field('Celular', `<input name="phone" type="tel" value="${esc(S.profile.phone)}" autocomplete="tel">`)}
        <div class="field-row">
          ${field('CEP', `<input name="cep" inputmode="numeric" maxlength="9" value="${esc(S.profile.cep)}">`)}
          ${field('Cidade – UF', `<input name="city" value="${esc(S.profile.city)}">`)}
        </div>
        <button class="btn" type="submit">Salvar</button>
      </form>
      <button class="btn ghost" style="margin-top:10px" data-act="logout">${icon('logout', 18)} Sair da conta</button>
    </div>`,
  });

  V.enderecos = () => ({
    html: `
    <div class="view">
      ${topbar('Endereços')}
      <div class="list">${S.addresses.length ? S.addresses.map((a) => `
        <div class="row">
          <span class="r-ic">${icon(a.label.toLowerCase().includes('casa') ? 'home2' : 'pin', 20)}</span>
          <span class="r-main"><strong>${esc(a.label)} ${a.main ? '<span class="status ok">Principal</span>' : ''}</strong><small>${esc(a.line)}</small><small>${esc(a.city)} · CEP ${esc(a.cep)}</small></span>
          <span class="r-end">
            ${a.main ? '' : `<button class="icon-btn sm" data-act="mainAddr" data-arg="${a.id}" aria-label="Tornar principal">${icon('star', 16)}</button>`}
            <button class="icon-btn sm" data-act="removeAddr" data-arg="${a.id}" aria-label="Remover endereço">${icon('trash', 16)}</button>
          </span>
        </div>`).join('') : emptyState('Nenhum endereço', 'Cadastre onde quer receber seus pedidos.')}</div>
      <button class="btn" style="margin-top:20px" data-act="openAddr">${icon('plus', 20)} Adicionar endereço</button>
    </div>`,
  });

  V.pagamentos = () => ({
    html: `
    <div class="view">
      ${topbar('Formas de pagamento')}
      <div class="list">${S.payments.map((x) => `
        <div class="row">
          <span class="r-ic">${icon(x.kind === 'card' ? 'card' : x.kind === 'pix' ? 'qr' : 'file', 20)}</span>
          <span class="r-main"><strong>${x.kind === 'card' ? `${x.brand} •••• ${x.last4}` : x.brand} ${x.main ? '<span class="status ok">Principal</span>' : ''}</strong><small>${x.kind === 'card' ? `Cartão de crédito · validade ${x.exp}` : x.kind === 'pix' ? 'Pagamento instantâneo' : 'Boleto bancário'}</small></span>
          <span class="r-end">
            ${x.main ? '' : `<button class="icon-btn sm" data-act="mainPay" data-arg="${x.id}" aria-label="Tornar principal">${icon('star', 16)}</button>`}
            ${x.kind === 'card' ? `<button class="icon-btn sm" data-act="removePay" data-arg="${x.id}" aria-label="Remover cartão">${icon('trash', 16)}</button>` : ''}
          </span>
        </div>`).join('')}</div>
      <button class="btn" style="margin-top:20px" data-act="openCard">${icon('plus', 20)} Adicionar cartão</button>
      ${S.payments.some((x) => x.kind === 'boleto') ? '' : `<button class="btn ghost" style="margin-top:10px" data-act="addBoleto">${icon('file', 18)} Habilitar boleto</button>`}
      <p class="muted-sm" style="text-align:center;margin-top:14px">${icon('lock', 14)} Protótipo: os dados do cartão não são enviados a lugar nenhum.</p>
    </div>`,
  });

  V.config = () => {
    const sw = (k, label, sub) => `
      <label class="card v-remind" style="margin-top:10px">
        <span class="t" style="flex-direction:column;align-items:flex-start;gap:2px">${label}<small class="muted-sm" style="font-weight:500">${sub}</small></span>
        <span class="switch"><input type="checkbox" data-setting="${k}" ${S.settings[k] ? 'checked' : ''} aria-label="${label}"><span></span></span>
      </label>`;
    return {
      html: `
      <div class="view">
        ${topbar('Configurações')}
        <div class="sec-title" style="margin-top:0"><h2>Notificações</h2></div>
        ${sw('vacinas', 'Vacinas e exames', 'Aviso antes de cada dose vencer')}
        ${sw('lembretes', 'Lembretes', 'Vermífugo, limpeza, unhas e outros')}
        ${sw('ofertas', 'Ofertas e cupons', 'Promoções para os seus pets')}
        <div class="field" style="margin-top:16px"><span>Avisar com antecedência de</span>
          <div class="seg" style="margin:0">${[1, 3, 7, 15].map((d) => `<button class="${Number(S.settings.antecedencia) === d ? 'on' : ''}" data-act="ahead" data-arg="${d}">${d} ${d > 1 ? 'dias' : 'dia'}</button>`).join('')}</div>
        </div>
        <div class="sec-title"><h2>Conta</h2></div>
        <div class="card menu">
          <button data-go="#/perfil">${icon('user', 20)}<span>Dados pessoais</span><span class="chev">${icon('right', 18)}</span></button>
          ${user.uid === 'demo' ? `<button data-act="reset">${icon('sparkle', 20)}<span>Restaurar dados de exemplo</span><span class="chev">${icon('right', 18)}</span></button>` : ''}
          <button data-act="logout">${icon('logout', 20)}<span>Sair da conta</span><span class="chev">${icon('right', 18)}</span></button>
          <button class="danger" data-act="askWipe">${icon('trash', 20)}<span>Excluir minha conta e dados</span></button>
        </div>
      </div>`,
    };
  };

  V.ajuda = () => ({
    html: `
    <div class="view">
      ${topbar('Ajuda e suporte')}
      <div class="sec-title" style="margin-top:0"><h2>Perguntas frequentes</h2></div>
      <div class="faq">${C.faq.map(([q, a]) => `<details class="card"><summary>${q}${icon('down', 18)}</summary><p>${a}</p></details>`).join('')}</div>
      <div class="sec-title"><h2>Fale com a gente</h2></div>
      <div class="list">
        <a class="row" href="tel:+5511999999999"><span class="r-ic">${icon('phone', 20)}</span><span class="r-main"><strong>Telefone</strong><small>(11) 99999-9999 · seg a sáb, 8h às 20h</small></span></a>
        <button class="row" data-act="chat"><span class="r-ic ok">${icon('chat', 20)}</span><span class="r-main"><strong>Chat com veterinário</strong><small>Tire dúvidas rápidas</small></span></button>
        <a class="row" href="mailto:contato@cuidapet.com.br"><span class="r-ic">${icon('mail', 20)}</span><span class="r-main"><strong>E-mail</strong><small>contato@cuidapet.com.br</small></span></a>
      </div>
      <div class="card emergency"><strong>${icon('info', 18)} Emergência?</strong><p>Plantão 24 h na Clínica CuidaPet Centro. Ligue antes de sair de casa.</p></div>
    </div>`,
  });

  /* ------------------------------------------------------------ Roteador */
  const TAB_OF = {
    home: 'home', dicas: 'home', lembretes: 'home', notificacoes: 'home', pet: 'home', editar: 'home', semPet: 'home', agenda: 'home', agendar: 'home', cadastro: 'home',
    vacinas: 'vacinas', vacina: 'vacinas',
    loja: 'loja', categoria: 'loja', produto: 'loja', carrinho: 'loja', checkout: 'loja',
    parceiros: 'mais', mais: 'mais', pets: 'mais', pedidos: 'mais', favoritos: 'mais', perfil: 'mais', enderecos: 'mais', pagamentos: 'mais', config: 'mais', ajuda: 'mais',
  };
  // Menu lateral (versão web)
  const SIDE_OF = {
    home: 'home', notificacoes: 'home', semPet: 'home', dicas: 'home',
    pets: 'pets', pet: 'pets', editar: 'pets', cadastro: 'pets',
    vacinas: 'vacinas', vacina: 'vacinas', lembretes: 'lembretes',
    agenda: 'agenda', agendar: 'agenda',
    loja: 'loja', categoria: 'loja', produto: 'loja', carrinho: 'loja', checkout: 'loja', parceiros: 'loja', favoritos: 'loja',
    pedidos: 'pedidos', mais: 'conta', perfil: 'conta', enderecos: 'conta', pagamentos: 'conta', config: 'conta', ajuda: 'conta',
  };
  const NEEDS_PET = new Set(['home', 'pet', 'vacinas', 'vacina', 'lembretes', 'loja', 'categoria', 'produto', 'dicas', 'editar', 'agendar', 'parceiros', 'checkout']);
  const parse = () => {
    const [name = '', ...args] = location.hash.replace(/^#\/?/, '').split('/');
    return { name, args: args.map(decodeURIComponent) };
  };

  const screen = $('#screen');
  const device = $('#device');
  const tabbar = $('#tabbar');
  const sidebar = $('#sidebar');
  const deskTop = $('#deskTop');

  const renderChrome = (name) => {
    const active = SIDE_OF[name] || 'home';
    const n = cartCount();
    const late = S.pets.reduce((t, p) => t + lateCount(p), 0);
    const items = [
      ['home', 'Início', 'home', '#/home'], ['pets', 'Meus pets', 'paw', '#/pets'], ['vacinas', 'Carteira de saúde', 'syringe', '#/vacinas'],
      ['lembretes', 'Lembretes', 'bell', '#/lembretes'], ['agenda', 'Agenda', 'calendar', '#/agenda'], ['loja', 'Loja', 'bag', '#/loja'],
      ['pedidos', 'Pedidos', 'box', '#/pedidos'], ['conta', 'Minha conta', 'user', '#/mais'],
    ];
    sidebar.innerHTML = `
      <a class="side-logo" href="#/home" data-tab="#/home">cuidapet</a>
      <nav class="side-nav" aria-label="Menu">
        ${items.map(([k, l, ic, go]) => `<button class="${k === active ? 'on' : ''}" data-tab="${go}">${k === 'pets' ? paw(20) : icon(ic, 20)}<span>${l}</span>${k === 'vacinas' && late ? `<i class="side-badge late">${late}</i>` : ''}${k === 'loja' && n ? `<i class="side-badge">${n}</i>` : ''}</button>`).join('')}
      </nav>
      <div class="side-pets">
        <small>Seus pets</small>
        <div>${S.pets.map((p) => `<button class="${p.id === S.active ? 'on' : ''}" data-go="#/pet/${p.id}" title="${esc(p.name)}">${avatar(p, 40)}</button>`).join('')}<button class="add" data-act="newPet" title="Adicionar pet" aria-label="Adicionar pet">${icon('plus', 18)}</button></div>
      </div>
      <button class="side-user" data-go="#/perfil">${userAvatar(40)}<span><strong>${esc(S.profile.name || 'Meu perfil')}</strong><small>${esc(S.profile.email)}</small></span></button>`;
    const titles = { home: `Olá, ${esc(firstName())}! 👋`, pets: 'Meus pets', vacinas: 'Carteira de saúde', lembretes: 'Lembretes', agenda: 'Agenda', loja: 'Loja', pedidos: 'Pedidos', conta: 'Minha conta' };
    deskTop.innerHTML = `
      <div class="dt-title">${titles[active] || ''}</div>
      <label class="input dt-search">${icon('search', 18)}<input type="search" data-globalsearch placeholder="Buscar produtos para ${S.pets.length ? esc(pet().name) : 'seu pet'}..." aria-label="Buscar produtos"></label>
      <div class="dt-actions">
        <button class="icon-btn" data-go="#/agendar" title="Agendar consulta" aria-label="Agendar consulta">${icon('calendar')}</button>
        <button class="icon-btn" data-go="#/notificacoes" aria-label="Notificações">${icon('bell')}${S.pets.length && notifications().some((x) => x.urgent) ? '<span class="dot"></span>' : ''}</button>
        <button class="icon-btn" data-go="#/carrinho" aria-label="Carrinho">${icon('cart')}${n ? `<span class="count">${n}</span>` : ''}</button>
        <button class="avatar-btn" data-go="#/perfil" aria-label="Meu perfil">${userAvatar(42)}</button>
      </div>`;
  };

  const renderTabbar = (active, hidden) => {
    const n = cartCount();
    const tabs = [['home', 'Início', 'home'], ['vacinas', 'Vacinas', 'syringe'], ['loja', 'Produtos', 'bag'], ['mais', 'Mais', 'menu']];
    tabbar.classList.toggle('hidden', hidden);
    tabbar.innerHTML = tabs.map(([k, l, ic]) => `
      <button class="tab ${k === active ? 'active' : ''}" data-tab="#/${k}" ${k === active ? 'aria-current="page"' : ''}>
        <span class="tab-ic">${icon(ic, 22)}</span>${l}${k === 'loja' && n ? `<span class="dot">${n}</span>` : ''}
      </button>`).join('');
  };

  const render = (keepScroll = false) => {
    timers.forEach(clearInterval);
    timers = [];
    if (booting) {
      screen.className = 'screen flush';
      screen.innerHTML = `<div class="boot"><span class="boot-logo">cuidapet</span><span class="spinner"></span></div>`;
      document.body.classList.add('is-auth');
      return;
    }
    let { name, args } = parse();
    if (!user) name = 'login';
    else if (!S.profile.complete) name = 'bemvindo';
    else {
      if (!V[name] || name === 'login' || name === 'bemvindo') name = 'home';
      if (!S.pets.length && NEEDS_PET.has(name)) name = 'semPet';
    }
    const view = V[name](...args);
    const isAuth = /\bauth\b/.test(view.cls || '');
    document.body.classList.toggle('is-auth', isAuth);
    if (!isAuth) renderChrome(name);
    const top = screen.scrollTop;
    screen.className = 'screen ' + (view.cls || '');
    screen.innerHTML = view.html;
    if (keepScroll) {
      screen.scrollTop = top;
      const v = screen.querySelector('.view');
      if (v) v.style.animation = 'none';
    } else {
      screen.scrollTop = 0;
    }
    device.classList.toggle('on-dark', !!view.dark);
    renderTabbar(TAB_OF[name], /no-tabbar/.test(view.cls || ''));
    if (view.after) view.after();
  };

  const go = (hash) => {
    if (hash === location.hash) return render();
    navStack.push(location.hash || '#/home');
    location.hash = hash;
  };
  const replace = (hash) => { location.replace(hash); };
  const back = () => { location.hash = navStack.pop() || '#/home'; };

  window.addEventListener('hashchange', () => { closeSheet(); render(); });

  /* ------------------------------------------------------------ Ações */
  const addToCart = (id, size, qty = 1) => {
    const ex = S.cart.find((i) => i.id === id && i.size === size);
    if (ex) ex.qty += qty; else S.cart.push({ id, size, qty });
    save();
  };
  const refreshCartBadges = () => {
    renderTabbar(TAB_OF[parse().name] || 'loja', tabbar.classList.contains('hidden'));
    renderChrome(parse().name);
    screen.querySelectorAll('[data-go="#/carrinho"]').forEach((b) => {
      let c = b.querySelector('.count');
      if (!c) { c = document.createElement('span'); c.className = 'count'; b.appendChild(c); }
      c.textContent = cartCount();
    });
  };

  const petSheet = () => openSheet(`
    <h3>Escolha o pet</h3>
    <p class="muted">A carteira, os lembretes e a loja mudam conforme o animal.</p>
    <div class="list">
      ${S.pets.map((p) => `
        <button class="row" data-act="setPet" data-arg="${p.id}">
          ${avatar(p, 44)}
          <span class="r-main"><strong>${esc(p.name)}</strong><small>${spOf(p).label} · ${esc(p.breed)}</small></span>
          <span class="r-end">${p.id === S.active ? `<span class="status ok">${icon('check', 12)} Selecionado</span>` : ''}</span>
        </button>`).join('')}
      <button class="btn ghost" data-act="newPet">${icon('plus', 18)} Cadastrar novo pet</button>
    </div>`);

  const removeById = (list, id) => {
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list.splice(i, 1);
    if (list.length && !list.some((x) => x.main)) list[0].main = true;
  };
  const setMain = (list, id) => list.forEach((x) => { x.main = x.id === id; });

  const A = {
    async google() {
      if (Auth.configured) {
        try { await Auth.signInGoogle(); } catch (e) { if (e.code !== 'auth/popup-closed-by-user') toast('Não foi possível entrar com Google. Tente de novo.'); }
        return;
      }
      openSheet(`
        <h3>Criar conta local</h3>
        <p class="muted">O login com Google ainda não foi configurado neste servidor (veja o LEIA-ME). Para testar agora, crie uma conta que fica salva só neste navegador.</p>
        <form data-form="localLogin">
          ${field('Seu nome', '<input name="name" autocomplete="name" placeholder="Nome e sobrenome" required>')}
          ${field('E-mail', '<input name="email" type="email" autocomplete="email" placeholder="voce@email.com" required>')}
          <button class="btn" type="submit">Continuar</button>
        </form>`);
    },
    demo() { Auth.signInLocal({ uid: 'demo', name: 'Ana Silva', email: 'ana.silva@email.com', photo: null, provider: 'demo' }); },
    skipPets() { ui.onboarding = false; ui.newPet = null; navStack = []; replace('#/home'); },
    agTab(t) { ui.agTab = t; render(true); },
    bk(arg) {
      const i = arg.indexOf(':');
      const k = arg.slice(0, i);
      ui.booking[k] = arg.slice(i + 1);
      render(true);
    },
    confirmAppt() {
      const b = ui.booking;
      if (!b || !b.time) return;
      S.appointments = S.appointments || [];
      S.appointments.push({ id: 'c' + Date.now().toString(36), petId: b.petId, service: b.service, clinic: b.clinic, date: b.date, time: b.time, notes: b.notes.trim(), status: 'agendado' });
      save();
      const p = petById(b.petId);
      ui.booking = null;
      ui.agTab = 'proximas';
      navStack = [];
      replace('#/agenda');
      setTimeout(() => openSheet(`
        <div class="success"><img src="${petImg(p)}" alt=""><h3>Consulta agendada!</h3>
        <p class="muted">${serviceOf(b.service).label} para ${esc(p.name)}<br>${fmtDate(b.date)} às ${b.time} · ${clinicOf(b.clinic).label}</p></div>
        <div class="list"><button class="btn" data-act="closeSheet">Ok</button></div>`), 200);
    },
    cancelAppt(id) {
      const a = S.appointments.find((x) => x.id === id);
      openSheet(`
        <h3>Cancelar consulta?</h3>
        <p class="muted">${serviceOf(a.service).label} de ${esc(petById(a.petId).name)} em ${fmtDate(a.date)} às ${a.time}.</p>
        <div class="list"><button class="btn danger" data-act="doCancelAppt" data-arg="${id}">Cancelar consulta</button><button class="btn ghost" data-act="closeSheet">Manter</button></div>`);
    },
    doCancelAppt(id) {
      S.appointments.find((x) => x.id === id).status = 'cancelado';
      save();
      closeSheet();
      render(true);
      toast('Consulta cancelada');
    },
    pickSpecies(id) {
      const np = ui.newPet;
      np.species = id;
      np.breed = species[id].breeds[0];
      render(true);
    },
    pickSex(x) { ui.newPet.sex = x; render(true); },
    newPet() { closeSheet(); ui.newPet = null; ui.spQuery = ''; ui.onboarding = false; go('#/cadastro'); },
    setPet(id) {
      const changed = id !== S.active;
      S.active = id;
      ui.query = '';
      save();
      closeSheet();
      render(true);
      if (changed) toast(`Mostrando ${pet().name} · ${spOf(pet()).label}`);
    },
    openNotif(id, el) { S.active = id; save(); go(el.dataset.then); },
    petSheet,
    petTab(t) { ui.petTab = t; render(true); },
    vacTab(t) { ui.vacTab = t; render(true); },
    remTab(t) { ui.remTab = t; render(true); },
    share() { toast(`Ficha de ${pet().name} pronta para enviar ao veterinário`); },
    chat() { toast('Um veterinário vai responder em instantes'); },
    addCart(id) {
      const p = product(id);
      const size = p.sizes ? (p.sizes.find((s) => s[1] === p.price) || p.sizes[0])[0] : null;
      addToCart(id, size);
      refreshCartBadges();
      toast('Adicionado ao carrinho');
    },
    fav(id) {
      const i = S.favs.indexOf(id);
      if (i >= 0) S.favs.splice(i, 1); else S.favs.push(id);
      save();
      render(true);
      toast(i >= 0 ? 'Removido dos favoritos' : 'Salvo nos favoritos');
    },
    size(i) { ui.pd.size = Number(i); render(true); },
    qty(d) { ui.pd.qty = Math.max(1, ui.pd.qty + Number(d)); render(true); },
    addDetail() {
      const p = product(ui.pd.id);
      addToCart(p.id, p.sizes ? p.sizes[ui.pd.size][0] : null, ui.pd.qty);
      ui.pd.qty = 1;
      render(true);
      openSheet(`
        <div class="success"><img src="${species[p.sp].img}" alt=""><h3>Adicionado!</h3><p class="muted">${p.name}</p></div>
        <div class="list"><button class="btn" data-go="#/carrinho">Ver carrinho (${cartCount()})</button><button class="btn ghost" data-act="closeSheet">Continuar comprando</button></div>`);
    },
    closeSheet,
    cartQty(arg) {
      const [idx, d] = arg.split(':').map(Number);
      const it = S.cart[idx];
      it.qty += d;
      if (it.qty <= 0) S.cart.splice(idx, 1);
      save();
      render(true);
    },
    cartRemove(idx) { S.cart.splice(Number(idx), 1); save(); render(true); toast('Item removido'); },
    openCep() {
      openSheet(`
        <h3>Calcular frete</h3>
        <p class="muted">Grátis para compras acima de R$ 199 na entrega normal.</p>
        <form data-form="cep">
          ${field('CEP', `<input name="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" value="${esc(S.cep || main(S.addresses)?.cep || '')}" required>`)}
          <button class="btn" type="submit">Calcular</button>
        </form>`);
    },
    pickAddr(id) { S.checkout.addr = id; save(); render(true); },
    pickPay(id) { S.checkout.pay = id; save(); render(true); },
    pickDelivery(m) { S.checkout.delivery = m; save(); render(true); },
    confirmOrder() {
      const t = cartTotals(S.checkout.delivery);
      const addr = S.addresses.find((a) => a.id === S.checkout.addr) || main(S.addresses);
      const order = { n: String(Math.floor(10000 + Math.random() * 89999)), date: iso(0), total: t.total, items: cartCount() };
      S.orders.push(order);
      S.cart = [];
      S.coupon = null;
      save();
      replace('#/pedidos');
      setTimeout(() => openSheet(`
        <div class="success"><img src="${petImg(pet())}" alt=""><h3>Pedido confirmado!</h3>
        <p class="muted">Pedido #${order.n} · ${brl(order.total)}<br>${S.checkout.delivery === 'expressa' ? 'Chega hoje' : 'Chega em até 2 dias úteis'} em ${esc(addr.label)}.</p></div>
        <div class="list"><button class="btn" data-act="closeSheet">Acompanhar pedido</button><button class="btn ghost" data-tab="#/home">Voltar ao início</button></div>`), 200);
    },
    openApply(key) {
      const v = vaccines[pet().species].find((x) => x.key === key);
      openSheet(`
        <h3>Registrar aplicação</h3>
        <p class="muted">${v.name} · ${esc(pet().name)}. O app calcula a próxima dose pelo protocolo: ${protocolText(v).toLowerCase()}.</p>
        <form data-form="apply" data-key="${key}">
          ${field('Data da aplicação', `<input type="date" name="date" value="${iso(0)}" max="${iso(0)}" required>`)}
          ${field('Clínica ou veterinário (opcional)', '<input name="place" placeholder="Ex.: Clínica CuidaPet Centro">')}
          <button class="btn" type="submit">Salvar na carteira</button>
        </form>`);
    },
    removeDose(arg) {
      const [key, date] = arg.split('|');
      const rec = pet().records[key];
      if (!rec) return;
      rec.applied = rec.applied.filter((d) => d !== date);
      save();
      render(true);
      toast(`Aplicação de ${fmtDate(date)} removida`);
    },
    toggleRemind(key, el) {
      const p = pet();
      const rec = p.records[key] || (p.records[key] = { applied: [], next: iso(0) });
      rec.remind = el.checked;
      save();
      toast(el.checked ? 'Lembrete ativado' : 'Lembrete desativado');
    },
    remDone(id) {
      const r = S.reminders.find((x) => x.id === id);
      S.reminders = S.reminders.filter((x) => x.id !== id);
      save();
      render(true);
      toast(`“${r.title}” concluído`);
    },
    openReminder() {
      const p = pet();
      const allowed = C.reminderBySpecies[p.species];
      openSheet(`
        <h3>Novo lembrete</h3>
        <p class="muted">Para ${esc(p.name)}. Avisaremos no dia.</p>
        <form data-form="reminder">
          ${field('Tipo', `<select name="type">${allowed.map((k) => `<option value="${k}">${reminderTypes[k].label}</option>`).join('')}</select>${icon('down', 18)}`)}
          ${field('Descrição', '<input name="title" placeholder="Ex.: Vermífugo trimestral">')}
          ${field('Data', `<input type="date" name="date" min="${iso(0)}" value="${iso(7)}" required>`)}
          <button class="btn" type="submit">Salvar lembrete</button>
        </form>`);
    },
    askRemove(id) {
      const p = petById(id);
      openSheet(`
        <h3>Remover ${esc(p.name)}?</h3>
        <p class="muted">A carteira, os lembretes e o perfil deste pet serão apagados.</p>
        <div class="list"><button class="btn danger" data-act="removePet" data-arg="${id}">Remover</button><button class="btn ghost" data-act="closeSheet">Cancelar</button></div>`);
    },
    removePet(id) {
      S.pets = S.pets.filter((x) => x.id !== id);
      S.reminders = S.reminders.filter((r) => r.petId !== id);
      if (S.active === id) S.active = S.pets[0].id;
      save();
      closeSheet();
      ui.newPet = null;
      navStack = [];
      replace('#/pets');
      toast('Pet removido');
    },
    openAddr() {
      openSheet(`
        <h3>Novo endereço</h3>
        <form data-form="addr">
          ${field('Nome do endereço', '<input name="label" placeholder="Casa, Trabalho, Sítio..." required>')}
          ${field('CEP', '<input name="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" required>')}
          ${field('Rua, número e complemento', '<input name="line" placeholder="Rua das Flores, 45 – Apto 12" required>')}
          ${field('Cidade – UF', '<input name="city" placeholder="São Paulo – SP" required>')}
          <button class="btn" type="submit">Salvar endereço</button>
        </form>`);
    },
    mainAddr(id) { setMain(S.addresses, id); save(); render(true); toast('Endereço principal atualizado'); },
    removeAddr(id) { removeById(S.addresses, id); save(); render(true); toast('Endereço removido'); },
    openCard() {
      openSheet(`
        <h3>Adicionar cartão</h3>
        <p class="muted">Protótipo: apenas os 4 últimos dígitos ficam salvos neste aparelho.</p>
        <form data-form="card" autocomplete="off">
          ${field('Nome impresso', '<input name="holder" placeholder="ANA SILVA" required>')}
          ${field('Número do cartão', '<input name="number" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" required>')}
          <div class="field-row">
            ${field('Validade', '<input name="exp" inputmode="numeric" maxlength="5" placeholder="MM/AA" required>')}
            ${field('CVV', '<input name="cvv" inputmode="numeric" maxlength="4" placeholder="123" required>')}
          </div>
          <button class="btn" type="submit">${icon('lock', 18)} Salvar cartão</button>
        </form>`);
    },
    mainPay(id) { setMain(S.payments, id); save(); render(true); toast('Forma de pagamento principal atualizada'); },
    removePay(id) { removeById(S.payments, id); save(); render(true); toast('Cartão removido'); },
    addBoleto() { S.payments.push({ id: 'p' + Date.now().toString(36), kind: 'boleto', brand: 'Boleto', main: false }); save(); render(true); },
    ahead(d) { S.settings.antecedencia = Number(d); save(); render(true); },
    askWipe() {
      openSheet(`
        <h3>Excluir sua conta?</h3>
        <p class="muted">Seu perfil, todos os pets, carteiras, lembretes, consultas, endereços e pedidos serão apagados. Não dá para desfazer.</p>
        <div class="list"><button class="btn danger" data-act="wipe">Excluir tudo</button><button class="btn ghost" data-act="closeSheet">Cancelar</button></div>`);
    },
    async wipe() {
      closeSheet();
      try { await Store.remove(user.uid); } catch (e) { toast('Não foi possível excluir agora.'); return; }
      navStack = [];
      replace('#/');
      await Auth.signOut();
    },
    reset() {
      S = fresh(true);
      save();
      ui.query = '';
      navStack = [];
      replace('#/home');
      toast('Dados de exemplo restaurados');
    },
    async logout() { closeSheet(); navStack = []; replace('#/'); await Auth.signOut(); },
  };

  /* ------------------------------------------------------------ Formulários */
  const fmtCep = (v) => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');

  const F = {
    pet(form) {
      const np = ui.newPet;
      if (!np.name.trim()) {
        $('#nameField').classList.add('error');
        $('#nameField input').focus();
        toast('Como seu pet se chama?');
        return;
      }
      const data = {
        name: np.name.trim(),
        species: np.species,
        sex: np.sex,
        breed: np.breed || species[np.species].breeds[0],
        birth: np.birth,
        weight: np.weight ? Number(np.weight) : null,
        neutered: !!np.neutered,
        chip: (np.chip || '').trim(),
        photo: np.photo || null,
      };
      const editId = form.dataset.edit;
      if (editId) {
        const p = petById(editId);
        if (p.species !== data.species) p.records = {};
        Object.assign(p, data);
        save();
        ui.newPet = null;
        back();
        toast('Dados atualizados');
        return;
      }
      const id = data.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '') + '-' + Date.now().toString(36);
      S.pets.push({ id, ...data, records: {} });
      S.active = id;
      save();
      const wasOnboarding = ui.onboarding;
      ui.onboarding = false;
      ui.newPet = null;
      ui.spQuery = '';
      navStack = [];
      ui.petTab = 'carteira';
      replace(`#/pet/${id}`);
      if (wasOnboarding) {
        setTimeout(() => openSheet(`
          <div class="success"><img src="${C.breedImg(data.species, data.breed)}" alt=""><h3>${esc(data.name)} entrou na família!</h3>
          <p class="muted">A carteira de saúde já está pronta para ${species[data.species].plural.toLowerCase()}. Tem outros bichos em casa?</p></div>
          <div class="list"><button class="btn" data-act="newPet">${icon('plus', 18)} Adicionar outro pet</button><button class="btn ghost" data-act="closeSheet">Ver perfil de ${esc(data.name)}</button></div>`), 250);
      } else {
        toast(`${data.name} foi adicionado ao seu perfil!`);
      }
    },
    localLogin(form) {
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim().toLowerCase();
      if (!name || !/^\S+@\S+\.\S+$/.test(email)) { toast('Informe nome e um e-mail válido'); return; }
      let h = 0;
      for (const ch of email) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      closeSheet();
      Auth.signInLocal({ uid: 'local-' + h.toString(36), name, email, photo: null, provider: 'local' });
    },
    bemvindo(form) {
      const e = form.elements;
      if (!e.name.value.trim()) { $('#nameField').classList.add('error'); toast('Informe seu nome'); return; }
      if (!e.terms.checked) { toast('Aceite os termos para continuar'); return; }
      Object.assign(S.profile, {
        name: e.name.value.trim(), phone: e.phone.value.trim(), cep: fmtCep(e.cep.value), city: e.city.value.trim(),
        news: e.news.checked, complete: true, createdAt: iso(0),
      });
      S.settings.ofertas = e.news.checked;
      if (e.line.value.trim()) {
        S.addresses.push({ id: 'a' + Date.now().toString(36), label: 'Casa', line: e.line.value.trim(), city: S.profile.city, cep: S.profile.cep, main: true });
      }
      save();
      ui.onboarding = true;
      ui.newPet = null;
      navStack = [];
      replace('#/cadastro');
      render();
    },
    apply(form) {
      const key = form.dataset.key;
      const date = form.elements.date.value || iso(0);
      const p = pet();
      const v = vaccines[p.species].find((x) => x.key === key);
      const rec = p.records[key] || (p.records[key] = { applied: [] });
      if (!rec.applied.includes(date)) rec.applied.push(date);
      rec.applied.sort();
      delete rec.next;
      rec.place = form.elements.place.value.trim() || rec.place;
      save();
      closeSheet();
      render(true);
      const info = vInfo(p, v);
      toast(`Registrado · ${info.n < info.series ? `${info.n + 1}ª dose` : 'próximo reforço'} em ${fmtDate(info.next)}`);
    },
    reminder(form) {
      const type = form.elements.type.value;
      S.reminders.push({
        id: 'r' + Date.now().toString(36),
        petId: pet().id,
        type,
        title: form.elements.title.value.trim() || reminderTypes[type].label,
        date: form.elements.date.value || iso(7),
      });
      ui.remTab = type === 'vermifugo' ? 'vermifugos' : 'outros';
      save();
      closeSheet();
      render(true);
      toast('Lembrete criado');
    },
    coupon(form) {
      const code = form.elements.code.value.trim().toUpperCase();
      if (code === 'CUIDA10') { S.coupon = code; toast('Cupom aplicado: 10% de desconto'); } else { S.coupon = null; toast('Cupom inválido. Tente CUIDA10'); }
      save();
      render(true);
    },
    cep(form) {
      const v = fmtCep(form.elements.cep.value);
      if (v.length !== 9) { toast('Digite um CEP com 8 números'); return; }
      S.cep = v;
      save();
      closeSheet();
      render(true);
    },
    perfil(form) {
      const e = form.elements;
      Object.assign(S.profile, { name: e.name.value.trim() || S.profile.name, email: e.email.value.trim() || S.profile.email, phone: e.phone.value.trim(), cep: fmtCep(e.cep.value), city: e.city.value.trim() });
      save();
      render(true);
      toast('Perfil atualizado');
    },
    addr(form) {
      const e = form.elements;
      if (![e.label, e.cep, e.line, e.city].every((x) => x.value.trim())) { toast('Preencha todos os campos'); return; }
      S.addresses.push({ id: 'a' + Date.now().toString(36), label: e.label.value.trim(), cep: fmtCep(e.cep.value), line: e.line.value.trim(), city: e.city.value.trim(), main: !S.addresses.length });
      save();
      closeSheet();
      render(true);
      toast('Endereço salvo');
    },
    card(form) {
      const e = form.elements;
      const digits = e.number.value.replace(/\D/g, '');
      if (digits.length < 13 || !/^\d{2}\/\d{2}$/.test(e.exp.value) || !e.holder.value.trim()) { toast('Confira os dados do cartão'); return; }
      const brand = digits[0] === '4' ? 'Visa' : digits[0] === '5' ? 'Mastercard' : digits[0] === '3' ? 'Amex' : 'Elo';
      S.payments.push({ id: 'p' + Date.now().toString(36), kind: 'card', brand, last4: digits.slice(-4), exp: e.exp.value, main: false });
      save();
      closeSheet();
      render(true);
      toast(`${brand} final ${digits.slice(-4)} adicionado`);
    },
  };

  /* ------------------------------------------------------------ Eventos */
  device.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act],[data-go],[data-tab],[data-back],[data-replace]');
    if (!t || !device.contains(t)) return;
    if (t.dataset.act) {
      // Botões dentro de cartões clicáveis não abrem o cartão.
      e.stopPropagation();
      if (t.tagName === 'BUTTON' || t.getAttribute('role') === 'button') e.preventDefault();
      if (t.type === 'checkbox') { /* deixa o checkbox alternar */ }
      const fn = A[t.dataset.act];
      if (fn) fn(t.dataset.arg, t, e);
      return;
    }
    if (t.dataset.tab) { navStack = []; closeSheet(); if (location.hash === t.dataset.tab) render(); else location.hash = t.dataset.tab; return; }
    if (t.hasAttribute('data-back')) { back(); return; }
    if (t.dataset.replace) { replace(t.dataset.replace); return; }
    if (t.dataset.go) {
      if (t.dataset.pettab) ui.petTab = t.dataset.pettab;
      else if (t.dataset.go.startsWith('#/pet/')) ui.petTab = 'carteira';
      closeSheet();
      go(t.dataset.go);
    }
  });

  device.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-go]')) { e.preventDefault(); e.target.click(); }
  });

  device.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    F[f.dataset.form](f);
  });

  device.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.model && ui.newPet) {
      ui.newPet[el.dataset.model] = el.value;
      const bar = $('#onbProgress');
      if (bar) bar.style.width = progress(ui.newPet) + '%';
      if (el.dataset.model === 'name') $('#nameField').classList.remove('error');
    }
    if (el.hasAttribute('data-spsearch')) {
      ui.spQuery = el.value;
      $('#speciesPick').innerHTML = speciesGrid(ui.newPet);
    }
    if (el.hasAttribute('data-search')) {
      ui.query = el.value;
      $('#shopBody').innerHTML = shopBody();
    }
    if (el.dataset.bk === 'notes' && ui.booking) ui.booking.notes = el.value;
    if (el.hasAttribute('data-globalsearch')) {
      ui.query = el.value;
      const body = $('#shopBody');
      if (body) {
        body.innerHTML = shopBody();
        const s = screen.querySelector('[data-search]');
        if (s) s.value = el.value;
      } else if (el.value.trim().length >= 2) {
        go('#/loja');
        setTimeout(() => { const g = $('[data-globalsearch]'); if (g) { g.focus(); g.value = ui.query; } }, 30);
      }
    }
    if (el.name === 'cep' || el.name === 'number' || el.name === 'exp') {
      if (el.name === 'cep') el.value = fmtCep(el.value);
      if (el.name === 'number') el.value = el.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
      if (el.name === 'exp') el.value = el.value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
    }
  });

  device.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.model && ui.newPet) {
      ui.newPet[el.dataset.model] = el.value;
      if (el.dataset.model === 'breed') render(true); // atualiza o mascote conforme a raça
    }
    if (el.dataset.modelCheck && ui.newPet) ui.newPet[el.dataset.modelCheck] = el.checked;
    if (el.dataset.bk === 'date' && ui.booking && el.value) { ui.booking.date = el.value; ui.booking.time = null; render(true); }
    if (el.dataset.setting) { S.settings[el.dataset.setting] = el.checked; save(); toast(el.checked ? 'Notificação ativada' : 'Notificação desativada'); }
    if (el.hasAttribute('data-photo') && el.files && el.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const size = 240;
          const c = document.createElement('canvas');
          c.width = c.height = size;
          const s = Math.min(img.width, img.height);
          c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
          ui.newPet.photo = c.toDataURL('image/jpeg', 0.82);
          render(true);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(el.files[0]);
    }
  });

  backdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet.classList.contains('open')) closeSheet(); });

  /* ------------------------------------------------------------ Início */
  Auth.onError = (e) => { console.error(e); toast('Falha de conexão com a nuvem. Seus dados foram mantidos neste aparelho.'); };

  render();
  Auth.init(async (u) => {
    booting = true;
    render();
    user = u;
    if (u) {
      const saved = await Store.load(u.uid);
      if (saved && saved.version === 3) {
        S = saved;
        // Atualiza nome/foto vindos do Google sem sobrescrever edições do tutor
        if (u.provider === 'google') {
          if (!S.profile.photo && u.photo) S.profile.photo = u.photo;
          if (!S.profile.email) S.profile.email = u.email;
        }
      } else {
        S = fresh(u.uid === 'demo', u);
        save();
      }
      if (!S.pets.some((p) => p.id === S.active)) S.active = S.pets[0] ? S.pets[0].id : null;
    } else {
      S = null;
    }
    booting = false;
    ui.newPet = null;
    ui.booking = null;
    navStack = [];
    render();
  });

  // App instalável (PWA)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
