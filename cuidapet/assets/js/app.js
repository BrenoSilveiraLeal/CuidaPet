/**
 * App CuidaPet (protótipo navegável de portfólio).
 * Sem login e sem banco de dados: abre direto no perfil base ("Olá, Tutor") e guarda as mudanças no localStorage.
 * Roteamento por hash e telas renderizadas como template strings.
 */
(function () {
  const C = window.CP;
  const { species, speciesOrder, vaccines, vaccineSources, products, categories, reminderTypes, icon, paw, art, brl, discount, fmtDate, daysUntil, iso, addDays, everyText } = C;
  const $ = (s, r = document) => r.querySelector(s);

  const Store = window.CPStore;

  /* ------------------------------------------------------------ Estado */
  // Perfil base, igual para qualquer visitante. demo = false começa sem pets (para testar o cadastro do zero).
  const STATE_VERSION = 4;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const fresh = (demo = true) => ({
    version: STATE_VERSION,
    profile: { name: 'Tutor', cpf: '', email: '', photo: null, phone: '', city: 'São Paulo – SP', cep: '04567-010' },
    pets: demo ? clone(C.seedPets) : [],
    active: demo ? 'thor' : null,
    reminders: demo ? clone(C.seedReminders) : [],
    appointments: demo ? clone(C.seedAppointments) : [],
    addresses: clone(C.seedAddresses),
    payments: clone(C.seedPayments),
    settings: { vacinas: true, lembretes: true, ofertas: false, antecedencia: 7 },
    cart: [],
    favs: [],
    coupon: null,
    cep: null,
    orders: [],
    checkout: { delivery: 'normal' },
  });

  let S = null;
  let booting = true;
  let bootError = null;
  const save = () => { if (S) Store.save(S); };

  const ui = { vacTab: 'geral', remTab: 'vacinas', petTab: 'carteira', agTab: 'proximas', query: '', spQuery: '', newPet: null, pd: null, booking: null, pendingBackup: null, photoCrop: null };
  let timers = [];
  const NAV_STACK_STATE = '__cuidapetNavStack';
  const NAV_ROUTE_STATE = '__cuidapetRoute';
  let photoCropDrag = null;
  let navStack = history.state?.[NAV_ROUTE_STATE] === location.hash
    && Array.isArray(history.state?.[NAV_STACK_STATE])
    ? [...history.state[NAV_STACK_STATE]]
    : [];
  const persistNavStack = () => history.replaceState({
    ...(history.state && typeof history.state === 'object' ? history.state : {}),
    [NAV_ROUTE_STATE]: location.hash,
    [NAV_STACK_STATE]: [...navStack],
  }, '', location.href);
  persistNavStack();

  /* ------------------------------------------------------------ Utilidades */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pet = () => S.pets.find((p) => p.id === S.active) || S.pets[0];
  const petById = (id) => S.pets.find((p) => p.id === id);
  const spOf = (p) => species[p.species];
  const firstName = () => (S.profile.name || '').trim().split(' ')[0] || 'Tutor';
  const userAvatar = (size) => {
    const st = size ? ` style="width:${size}px;height:${size}px"` : '';
    return S.profile.photo
      ? `<span class="avatar user photo"${st}><img src="${esc(S.profile.photo)}" alt="" referrerpolicy="no-referrer"></span>`
      : `<span class="avatar user"${st}>${esc(firstName()[0].toUpperCase())}</span>`;
  };
  const product = (id) => products.find((p) => p.id === id);
  const ratingSummary = (p) => {
    const reviews = (S?.orders || []).flatMap((order) => order.products || [])
      .filter((item) => item.id === p.id && item.review)
      .map((item) => item.review.rating);
    const count = p.reviews + reviews.length;
    const average = count ? (p.rating * p.reviews + reviews.reduce((sum, rating) => sum + rating, 0)) / count : p.rating;
    return { count, average };
  };
  const main = (list) => list.find((x) => x.main) || list[0];

  const maxPlausibleAge = (speciesId) => {
    const years = (species[speciesId]?.life.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => Number(n.replace(',', '.')));
    return years.length ? Math.ceil(Math.max(...years) * 1.5) : 40;
  };
  const earliestBirthDate = (speciesId) => iso(-Math.round(maxPlausibleAge(speciesId) * 365.2425));
  const validDate = (value) => {
    const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!parts || Number(parts[1]) < 1000) return false;
    const date = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    return date.getFullYear() === Number(parts[1]) && date.getMonth() === Number(parts[2]) - 1 && date.getDate() === Number(parts[3]);
  };
  const birthTextToISO = (value) => {
    const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((value || '').trim());
    if (!parts) return '';
    const isoValue = `${parts[3]}-${parts[2]}-${parts[1]}`;
    return validDate(isoValue) ? isoValue : '';
  };
  const birthISOToText = (value) => value ? value.split('-').reverse().join('/') : '';
  const birthCalendar = (np) => {
    const base = ui.birthCalendarMonth
      ? new Date(`${ui.birthCalendarMonth}-01T00:00:00`)
      : new Date(`${np.birth || iso(0)}T00:00:00`);
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const min = earliestBirthDate(np.species);
    const max = iso(0);
    const monthLabel = first.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const prev = new Date(year, month - 1, 1);
    const next = new Date(year, month + 1, 1);
    const prevLast = new Date(year, month, 0);
    const prevLastKey = `${prevLast.getFullYear()}-${String(prevLast.getMonth() + 1).padStart(2, '0')}-${String(prevLast.getDate()).padStart(2, '0')}`;
    const prevDisabled = prevLastKey < min;
    const nextDisabled = next > new Date(`${max}T00:00:00`);
    const cells = Array.from({ length: 42 }, (_, i) => {
      const day = i - offset + 1;
      if (day < 1 || day > daysInMonth) return '<span class="birth-calendar-empty"></span>';
      const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const disabled = value < min || value > max;
      return `<button type="button" class="birth-calendar-day${value === np.birth ? ' selected' : ''}${value === max ? ' today' : ''}" data-act="pickBirthDate" data-arg="${value}" ${disabled ? 'disabled' : ''} aria-label="${day} de ${monthLabel}" ${value === np.birth ? 'aria-pressed="true"' : ''}>${day}</button>`;
    }).join('');
    return `<div class="birth-calendar${ui.birthCalendarAbove ? ' above' : ''}" role="dialog" aria-label="Escolher data de nascimento">
      <div class="birth-calendar-head"><button type="button" data-act="birthCalendarMonth" data-arg="-1" aria-label="Mês anterior" ${prevDisabled ? 'disabled' : ''}>${icon('left', 16)}</button><strong>${monthLabel}</strong><button type="button" data-act="birthCalendarMonth" data-arg="1" aria-label="Próximo mês" ${nextDisabled ? 'disabled' : ''}>${icon('right', 16)}</button></div>
      <div class="birth-calendar-weekdays">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="birth-calendar-grid">${cells}</div>
      <div class="birth-calendar-foot"><button type="button" data-act="clearBirthDate">Limpar</button><button type="button" data-act="pickBirthDate" data-arg="${max}">Hoje</button></div>
    </div>`;
  };
  const validPetBirth = (birth, speciesId) => !birth || (validDate(birth) && birth >= earliestBirthDate(speciesId) && birth <= iso(0));
  const petBirthError = (birth, speciesId, badInput = false) => {
    if (badInput) return 'Data de nascimento inválida. Informe uma data completa.';
    if (!birth) return '';
    if (!validDate(birth)) return 'Data de nascimento inválida.';
    if (birth > iso(0)) return 'A data de nascimento não pode estar no futuro.';
    if (birth < earliestBirthDate(speciesId)) return `Data inválida. Use uma data a partir de ${fmtDate(earliestBirthDate(speciesId))}.`;
    return '';
  };
  const petWeightError = (value) => {
    const raw = String(value ?? '').trim();
    return raw && (!Number.isFinite(Number(raw)) || Number(raw) <= 0)
      ? 'Peso inválido. Informe um valor maior que zero.'
      : '';
  };
  const formatMicrochip = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 15).replace(/(\d{3})(?=\d)/g, '$1 ');
  const ageMonths = (birth, speciesId) => (validPetBirth(birth, speciesId) && birth ? Math.max(0, Math.floor(-daysUntil(birth) / 30.44)) : null);
  const ageText = (p) => {
    const m = ageMonths(p.birth, p.species);
    if (m === null) return p.birth ? 'data de nascimento inválida' : 'idade não informada';
    if (m < 1) return 'recém-chegado';
    if (m < 12) return `${m} ${m === 1 ? 'mês' : 'meses'}`;
    const y = Math.floor(m / 12);
    return `${y} ${y === 1 ? 'ano' : 'anos'}`;
  };
  const weightText = (p) => {
    const weight = Number(p.weight);
    return Number.isFinite(weight) && weight > 0 ? `${String(weight).replace('.', ',')} ${spOf(p).unit}` : '—';
  };

  // Mascote do pet conforme a raça e o sexo (macho: óculos e coleira azuis; fêmea: rosa)
  const petImg = (p) => C.breedImg(p.species, p.breed, p.sex);
  const lostMessage = (p) => {
    const report = p.lost || {};
    const seenAt = report.when ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(report.when)) : 'horário não informado';
    return [
      `🚨 PET PERDIDO — ${p.name}`,
      `Espécie: ${spOf(p).label} · Raça/tipo: ${p.breed || 'não informado'} · Sexo: ${p.sex || 'não informado'}`,
      `Visto pela última vez: ${report.lastSeen}, ${report.city} · ${seenAt}`,
      report.details ? `Informações: ${report.details}` : '',
      `Contato: ${report.phone}`,
      'Se encontrar, entre em contato. Compartilhe com grupos de proteção animal da região.',
    ].filter(Boolean).join('\n');
  };
  const lostPetCard = (p) => {
    if (!p.lost?.active) return `
      <section class="lost-entry" aria-label="Alerta de desaparecimento">
        <button class="lost-trigger" data-act="lostPet" data-arg="${p.id}" aria-label="Avisar que ${esc(p.name)} se perdeu">${icon('search', 15)}<span>Avisar que se perdeu</span></button>
      </section>`;
    const message = lostMessage(p);
    return `
      <section class="lost-alert" aria-labelledby="lostAlertTitle">
        <div class="lost-alert-head"><img src="${p.photo ? esc(p.photo) : petImg(p)}" alt="Foto de ${esc(p.name)}"><div><span class="status late">Pet perdido</span><h3 id="lostAlertTitle">Ajude a encontrar ${esc(p.name)}</h3><small>${esc(p.lost.lastSeen)} · ${esc(p.lost.city)}</small></div></div>
        ${p.lost.details ? `<p>${esc(p.lost.details)}</p>` : ''}
        <div class="lost-alert-actions"><button class="btn sm" data-act="shareLost" data-arg="${p.id}">${icon('arrow', 15)} Compartilhar alerta</button><button class="btn sm ghost" data-act="whatsappLost" data-arg="${p.id}">WhatsApp</button><button class="link-btn" data-act="markFound" data-arg="${p.id}">Marcar como encontrado</button></div>
        <details class="lost-message"><summary>Ver texto do alerta</summary><pre>${esc(message)}</pre></details>
        <small class="lost-local-note">O aviso fica salvo neste aparelho. Ele só é compartilhado quando você escolher um destino.</small>
      </section>`;
  };
  const localDateTimeValue = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const avatar = (p, size) => {
    const st = size ? ` style="width:${size}px;height:${size}px"` : '';
    return p.photo
      ? `<span class="avatar photo"${st}><img src="${p.photo}" alt=""></span>`
      : `<span class="avatar"${st}><img src="${petImg(p)}" alt=""></span>`;
  };

  const kindIcon = (v) => ({ exame: 'file', consulta: 'steth' }[v.kind] || 'syringe');
  const kindLabel = (v) => ({ vacina: 'Vacina', exame: 'Exame', consulta: 'Consulta' }[v.kind]);
  const whenText = (d) => (d === 0 ? 'hoje' : d === 1 ? 'amanhã' : d < 0 ? `há ${-d} dias` : `em ${d} dias`);
  const ageWords = (weeks) => (weeks === 0 ? '1º dia de vida' : weeks < 16 ? `${weeks} semana${weeks > 1 ? 's' : ''}` : `${Math.round(weeks / 4.345)} meses`);
  const nonCore = (v) => ['opcional', 'recomendada', 'regional', 'naorecomendada'].includes(v.level);
  const protocolText = (v) => {
    const parts = [];
    const a = v.ages;
    if (a.length > 1) parts.push(`${a.length} doses de filhote: com ${a.map(ageWords).join(', ').replace(/, ([^,]*)$/, ' e $1')}`);
    else parts.push(`${v.kind === 'vacina' ? 'dose' : v.kind === 'exame' ? 'primeiro exame' : 'primeira consulta'} ${a[0] === 0 ? 'desde o 1º dia de vida' : `a partir de ${ageWords(a[0])}`}`);
    if (a.length > 1 && v.adultDoses) parts.push(`${v.adultDoses === 1 ? '1 dose' : `${v.adultDoses} doses com ${v.gap} dias de intervalo`} se começar adulto`);
    parts.push(v.interval ? `${v.kind === 'vacina' ? 'reforço' : 'repetir'} ${everyText(v.interval)}` : 'dose única, sem reforço');
    const t = parts.join(' · ');
    return t[0].toUpperCase() + t.slice(1);
  };

  /* Calendário de cada item da carteira, montado a partir da base de vacinas + nascimento do pet + doses marcadas.
     plan = lista de doses esperadas ({ n, due, taken, ageW, booster }); st = situação do item:
     Em dia · Em breve (até 30 dias) · Atrasada · Não tomou · Aguardando idade · Completa */
  const vInfo = (p, v) => {
    const rec = p.records[v.key];
    const applied = rec && rec.applied ? rec.applied.slice().sort() : [];
    const n = applied.length;
    const fem = v.kind !== 'exame';
    const ages = v.ages;
    const birth = validPetBirth(p.birth, p.species) ? p.birth : '';
    const ageW = birth ? Math.max(0, -daysUntil(birth) / 7) : null;
    const ageAtW = (date) => (birth ? (new Date(date + 'T00:00:00') - new Date(birth + 'T00:00:00')) / 6048e5 : null);
    // Esquema de filhote: começou (ou ainda pode começar) dentro da janela de idade das doses de filhote
    const lastPuppyW = ages[ages.length - 1];
    const startW = n ? ageAtW(applied[0]) : ageW;
    const puppy = ages.length > 1 && startW !== null && startW <= lastPuppyW + 2;
    const series = puppy ? ages.length : (ages.length > 1 ? v.adultDoses : 1);

    const plan = [];
    for (let i = 0; i < series; i++) {
      let due = null;
      if (i === 0) due = birth ? addDays(birth, ages[0] * 7) : null;
      else if (puppy) due = applied[i - 1] ? addDays(applied[i - 1], (ages[i] - ages[i - 1]) * 7) : birth ? addDays(birth, ages[i] * 7) : null;
      else due = applied[i - 1] ? addDays(applied[i - 1], v.gap) : null;
      plan.push({ n: i + 1, due, taken: applied[i] || null, ageW: puppy || i === 0 ? ages[i] : null, booster: false });
    }
    // Reforços já feitos + o próximo
    if (v.interval) {
      for (let i = series; i <= n; i++) {
        plan.push({ n: i + 1, due: applied[i - 1] ? addDays(applied[i - 1], v.interval) : null, taken: applied[i] || null, ageW: null, booster: true });
      }
    }

    const pending = plan.find((x) => !x.taken);
    const next = pending ? pending.due : null;
    let st;
    let label;
    if (!pending) {
      st = { cls: 'ok', label: v.interval ? 'Em dia' : fem ? 'Completa' : 'Completo' };
      label = series > 1 ? `Esquema de ${series} doses completo` : `Feito em ${fmtDate(applied[n - 1])}`;
    } else if (!next) {
      st = { cls: 'todo', label: 'Sem data' };
      label = 'Informe a data de nascimento para calcular as datas';
    } else {
      const d = daysUntil(next);
      const what = pending.booster ? (v.kind === 'vacina' ? 'Reforço' : 'Próximo') : series > 1 ? `${pending.n}ª dose` : v.kind === 'vacina' ? 'Dose' : v.kind === 'exame' ? 'Exame' : 'Consulta';
      // Não essenciais que o pet nunca tomou não viram alerta: ficam como "avaliar com o veterinário"
      const optional = { opcional: 'Opcional', recomendada: 'Avaliar', regional: 'Conforme região', naorecomendada: 'Não indicada' }[v.level];
      if (!n && optional) {
        st = { cls: 'todo', label: optional };
        label = d > 0
          ? `Se indicada: ${what.toLowerCase()} com ${ageWords(ages[0])} · ${fmtDate(next)}`
          : v.level === 'naorecomendada' ? 'A WSAVA não recomenda o uso de rotina' : `Pode tomar desde ${fmtDate(next)} · converse com o veterinário`;
      } else if (!n && d > 0) {
        st = d <= 30 ? { cls: 'soon', label: 'Em breve' } : { cls: 'wait', label: 'Aguardando idade' };
        label = `${what} com ${ageWords(ages[0])} · ${fmtDate(next)} (${whenText(d)})`;
      } else if (d < 0) {
        if (!n) {
          const notDone = v.kind === 'vacina' ? 'Não tomou' : v.kind === 'exame' ? 'Não feito' : 'Não feita';
          st = { cls: 'miss', label: notDone };
          label = `${series > 1 ? `Esquema de ${series} doses` : 'Pendente'} desde ${fmtDate(next)}`;
        } else {
          st = { cls: 'late', label: fem ? 'Atrasada' : 'Atrasado' };
          label = `${what} venceu em ${fmtDate(next)} (${whenText(d)})`;
        }
      } else {
        st = d <= 30 ? { cls: 'soon', label: 'Em breve' } : { cls: 'ok', label: 'Em dia' };
        label = series > 1 && !pending.booster ? `Dose ${n} de ${series} · ${what} ${fmtDate(next)} (${whenText(d)})` : `${what} ${fmtDate(next)} · ${whenText(d)}`;
      }
    }
    return { v, rec, applied, n, series, puppy, plan, pending, next, st, label, remind: !rec || rec.remind !== false };
  };
  // Itens da espécie que valem para este pet (alguns só para fêmeas ou só para certas raças)
  const vaccinesFor = (p) => (vaccines[p.species] || []).filter((v) => (!v.onlySex || v.onlySex === p.sex) && (!v.onlyBreeds || v.onlyBreeds.includes(p.breed)));
  const petVaccines = (p) => vaccinesFor(p).map((v) => vInfo(p, v));
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
    const m = ageMonths(p.birth, p.species);
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
  let sheetCloseTimer;
  let sheetFocusTimer;
  let sheetDismissOnBackdrop = true;
  let sheetReturnFocus = null;
  const setSheetBackgroundInert = (inert) => {
    device.querySelectorAll('.main, .sidebar').forEach((region) => { region.inert = inert; });
  };
  const transitionTime = (el) => {
    const style = getComputedStyle(el);
    const durations = style.transitionDuration.split(',').map((value) => value.trim().endsWith('ms')
      ? parseFloat(value) : parseFloat(value) * 1000);
    const delays = style.transitionDelay.split(',').map((value) => value.trim().endsWith('ms')
      ? parseFloat(value) : parseFloat(value) * 1000);
    return Math.max(0, ...durations.map((duration, i) => duration + (delays[i % delays.length] || 0)));
  };
  const openSheet = (html, { dismissOnBackdrop = true } = {}) => {
    clearTimeout(sheetCloseTimer);
    clearTimeout(sheetFocusTimer);
    sheet.classList.remove('closing');
    backdrop.classList.remove('closing');
    sheet.innerHTML = html;
    sheetDismissOnBackdrop = dismissOnBackdrop;
    sheetReturnFocus = screen.querySelector('[data-act="addDetail"]') || screen.querySelector('button') || screen;
    sheet.classList.add('open');
    backdrop.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    setSheetBackgroundInert(true);
    const f = sheet.querySelector('input, select, button');
    if (f) sheetFocusTimer = setTimeout(() => {
      if (sheet.classList.contains('open')) f.focus({ preventScroll: true });
    }, 350);
  };
  const closeSheet = () => {
    if (!sheet.classList.contains('open')) return;
    clearTimeout(sheetFocusTimer);
    sheet.classList.remove('open');
    sheet.classList.add('closing');
    backdrop.classList.remove('open');
    backdrop.classList.add('closing');
    const delay = Math.max(transitionTime(sheet), transitionTime(backdrop)) + 32;
    clearTimeout(sheetCloseTimer);
    sheetCloseTimer = setTimeout(() => {
      sheet.classList.remove('closing');
      backdrop.classList.remove('closing');
      sheet.setAttribute('aria-hidden', 'true');
      setSheetBackgroundInert(false);
      const target = sheetReturnFocus?.isConnected ? sheetReturnFocus : screen;
      target.focus({ preventScroll: true });
      sheetReturnFocus = null;
    }, delay);
  };

  const photoCropMarkup = (label) => `
    <h3>Ajustar foto</h3>
    <p class="muted">Enquadre a foto do ${label}. Arraste a imagem ou ajuste os controles de zoom e posição.</p>
    <div class="photo-crop-preview" data-crop-preview><img src="${ui.photoCrop.src}" alt="Prévia da foto" draggable="false"></div>
    <div class="photo-crop-controls">
      <label class="photo-crop-control"><span>Zoom <output data-crop-value="zoom">100%</output></span><input type="range" min="1" max="3" step="0.05" value="1" data-photo-crop="zoom" aria-label="Zoom da foto"></label>
      <label class="photo-crop-control"><span>Esquerda / direita <output data-crop-value="x">Centro</output></span><input type="range" min="-100" max="100" step="1" value="0" data-photo-crop="x" aria-label="Posição horizontal da foto"></label>
      <label class="photo-crop-control"><span>Acima / abaixo <output data-crop-value="y">Centro</output></span><input type="range" min="-100" max="100" step="1" value="0" data-photo-crop="y" aria-label="Posição vertical da foto"></label>
    </div>
    <div class="photo-crop-actions"><button class="btn ghost" data-act="photoCropCancel">Cancelar</button><button class="btn" data-act="photoCropSave">Usar foto</button></div>`;
  const updatePhotoCropPreview = () => {
    const crop = ui.photoCrop;
    const preview = sheet.querySelector('[data-crop-preview]');
    const image = preview?.querySelector('img');
    if (!crop || !preview || !image) return;
    const box = preview.getBoundingClientRect();
    const scale = Math.max(box.width / crop.image.naturalWidth, box.height / crop.image.naturalHeight) * crop.zoom;
    const width = crop.image.naturalWidth * scale;
    const height = crop.image.naturalHeight * scale;
    image.style.width = `${width}px`;
    image.style.height = `${height}px`;
    image.style.left = `${(box.width - width) / 2 + crop.x / 100 * Math.max(0, width - box.width) / 2}px`;
    image.style.top = `${(box.height - height) / 2 + crop.y / 100 * Math.max(0, height - box.height) / 2}px`;
    const inputs = [...sheet.querySelectorAll('[data-photo-crop]')];
    inputs.forEach((input) => {
      if (input.dataset.photoCrop === 'zoom') input.disabled = false;
      else {
        const available = input.dataset.photoCrop === 'x' ? width > box.width + 1 : height > box.height + 1;
        input.disabled = !available;
      }
    });
  };
  const openPhotoCrop = (src, image, target) => {
    ui.photoCrop = { src, image, target, zoom: 1, x: 0, y: 0 };
    openSheet(photoCropMarkup(target === 'user' ? 'seu perfil' : 'seu pet'));
    requestAnimationFrame(updatePhotoCropPreview);
  };
  const finishPhotoCrop = () => {
    const crop = ui.photoCrop;
    if (!crop) return;
    const { image, target, zoom, x, y } = crop;
    const side = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    const sx = (image.naturalWidth - side) * (100 - x) / 200;
    const sy = (image.naturalHeight - side) * (100 - y) / 200;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 480;
    canvas.getContext('2d').drawImage(image, sx, sy, side, side, 0, 0, canvas.width, canvas.height);
    const photo = canvas.toDataURL('image/jpeg', 0.86);
    const isUser = target === 'user';
    ui.photoCrop = null;
    if (isUser) { S.profile.photo = photo; save(); }
    else if (ui.newPet) ui.newPet.photo = photo;
    closeSheet();
    render(true);
    if (isUser) toast('Foto do tutor atualizada');
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
  const setInlineFieldError = (input, message) => {
    const fieldEl = input?.closest('.field');
    const note = fieldEl?.querySelector('.field-error');
    if (!fieldEl || !note) return;
    fieldEl.classList.toggle('invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    note.textContent = message;
    note.hidden = !message;
  };

  const pcard = (p) => {
    const rating = ratingSummary(p);
    return `
    <button class="pcard" data-go="#/produto/${p.id}">
      ${p.old ? `<span class="badge-off">-${discount(p)}%</span>` : ''}
      ${art(p)}
      <strong>${p.name}</strong>
      <span class="stars">★ ${rating.average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} <small>(${rating.count})</small></span>
      <span class="pc-row">
        <span>${p.old ? `<span class="price-old">${brl(p.old)}</span><br>` : ''}<span class="price">${brl(p.price)}</span></span>
        <span class="add-mini" data-act="addCart" data-arg="${p.id}" role="button" aria-label="Adicionar ao carrinho">${icon('plus', 18)}</span>
      </span>
    </button>`;
  };

  const prow = (p) => {
    const rating = ratingSummary(p);
    return `
    <div class="prow">
      <button data-go="#/produto/${p.id}" class="prow-art" aria-label="${p.name}">${art(p)}</button>
      <div class="pr-main">
        <strong>${p.name}</strong>
        <span class="stars">★ ${rating.average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} <small>(${rating.count})</small></span>
        <span>${p.old ? `<span class="price-old">${brl(p.old)}</span> ` : ''}<span class="price">${brl(p.price)}</span></span>
      </div>
      <div class="pr-side">
        <button class="heart ${S.favs.includes(p.id) ? 'on' : ''}" data-act="fav" data-arg="${p.id}" aria-label="Favoritar">${icon('heart', 20)}</button>
        <button class="btn sm" data-act="addCart" data-arg="${p.id}">Adicionar</button>
      </div>
    </div>`;
  };

  const levelTag = (v) => `<span class="lv ${C.levels[v.level].cls}">${C.levels[v.level].label}</span>`;
  const vrow = ({ v, st, label }) => `
      <button class="row vaccine-row" data-go="#/vacina/${v.key}">
        <span class="r-ic ${st.cls}">${icon(kindIcon(v), 22)}</span>
        <span class="r-main"><strong>${v.name}</strong><small>${label}</small><small class="lv-line">${levelTag(v)}</small></span>
        <span class="r-end"><span class="status ${st.cls}">${st.label}</span>${icon('right', 18)}</span>
      </button>`;

  const emptyState = (title, text, img, cta = '') => `
    <div class="empty"><img src="${img || (S.pets.length ? petImg(pet()) : species.cachorro.img)}" alt=""><strong>${title}</strong><p>${text}</p>${cta}</div>`;

  const summaryCard = (p) => {
    const recs = petVaccines(p);
    const counts = { late: 0, miss: 0, soon: 0, ok: 0, todo: 0, wait: 0, registered: 0 };
    recs.forEach((r) => counts[r.st.cls]++);
    // Itens opcionais/recomendados não tomados e os que aguardam idade não contam contra o pet
    const total = recs.length - counts.todo - counts.wait - counts.registered;
    const good = counts.ok + counts.soon;
    const bad = counts.late + counts.miss;
    const state = bad ? 'late' : counts.soon ? 'soon' : counts.registered ? 'review' : good ? 'ok' : 'todo';
    const parts = [];
    if (counts.late) parts.push(`${counts.late} atrasad${counts.late > 1 ? 'as' : 'a'}`);
    if (counts.miss) parts.push(`${counts.miss} ${counts.miss > 1 ? 'nunca registradas' : 'nunca registrada'}`);
    const extra = [
      counts.wait ? `${counts.wait} aguardando idade` : '',
      counts.todo ? `${counts.todo} opciona${counts.todo > 1 ? 'is' : 'l'}/recomendada${counts.todo > 1 ? 's' : ''} sem registro` : '',
      counts.registered ? `${counts.registered} aplicada${counts.registered > 1 ? 's' : ''} sem próxima data` : '',
    ].filter(Boolean).join(' · ');
    const msg = {
      late: [parts.join(' e ').replace(/^./, (c) => c.toUpperCase()), `Agende com o veterinário e registre a aplicação para deixar a carteira de ${esc(p.name)} em dia.`],
      soon: ['Fique de olho!', `${counts.soon} ${counts.soon > 1 ? 'doses vencem' : 'dose vence'} nos próximos 30 dias.`],
      ok: ['Tudo em dia! 🎉', `${esc(p.name)} está com as doses essenciais atualizadas.`],
      review: ['Revise o calendário', `${counts.registered} vacina${counts.registered > 1 ? 's foram' : ' foi'} registrada${counts.registered > 1 ? 's' : ''}, mas sem próxima data. Confirme o reforço com o veterinário.`],
      todo: ['Carteira em branco', 'Registre as aplicações já feitas para o app calcular as próximas.'],
    }[state];
    const ringColor = { late: '#ef4444', soon: '#f59e0b', ok: '#22c55e', review: '#64748b', todo: '#94a3b8' }[state];
    const circ = 2 * Math.PI * 30;
    if (extra) msg[1] += ` <span class="sum-extra">${extra}.</span>`;
    return `
      <div class="card summary ${state === 'todo' ? '' : state}">
        <div class="ring">
          <svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="none" stroke="#e2e8f0" stroke-width="7"/><circle cx="36" cy="36" r="30" fill="none" stroke="${ringColor}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${circ * (total ? good / total : 0)} ${circ}"/></svg>
          <span class="ring-ic" style="color:${ringColor}">${icon('syringe', 26)}</span>
        </div>
        <div><strong>${msg[0]}</strong><small>${msg[1]}</small><small style="margin-top:6px;font-weight:700">${state === 'review' ? 'Próximas datas a confirmar' : `${good} de ${total} em dia`}</small></div>
      </div>`;
  };

  /* ------------------------------------------------------------ Telas */
  const V = {};

  /* Tutor sem nenhum pet ainda */
  V.semPet = () => ({
    html: `
    <div class="view narrow">
      ${emptyState('Olá, Tutor!', 'Adicione seu primeiro pet: com a espécie e a data de nascimento, a carteira de vacinação já vem pronta, com todas as doses e datas.', species.cachorro.img, `<button class="btn" style="margin-top:18px" data-act="newPet">${icon('plus', 20)} Adicionar meu primeiro pet</button><button class="link-btn" style="margin:14px auto 0" data-act="reset">Ver o perfil de exemplo</button>`)}
      <div class="mini-species">${speciesOrder.slice(0, 6).map((id) => `<img src="${species[id].img}" alt="">`).join('')}</div>
    </div>`,
  });

  /* Cadastro e edição usam o mesmo formulário */
  const blankPet = () => ({ species: 'cachorro', name: '', sex: 'Macho', breed: '', sizeClass: '', birth: '', weight: '', neutered: false, chip: '', registration: '', photo: null });

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
      : `<span class="avatar"><img src="${C.breedImg(np.species, np.breed || s.breeds[0], np.sex)}" alt=""></span>`;
    const recs = np.birth && validPetBirth(np.birth, np.species) ? vaccinesFor({ ...np, breed: np.breed || s.breeds[0] }) : [];
    const birthError = petBirthError(np.birth, np.species, np._birthInputInvalid);
    const weightError = petWeightError(np.weight);
    const dogSize = np.species === 'cachorro' ? C.dogBreedSize(np.breed) : null;
    const manualDogSize = np.species === 'cachorro' && !dogSize;
    const selectedDogSize = dogSize || np.sizeClass || '';
    return {
      cls: 'no-tabbar',
      html: `
      <div class="view">
        <div class="topbar">
          <button class="icon-btn" data-back aria-label="Voltar">${icon('left')}</button>
          ${editId ? '<h1>Editar pet</h1>' : `<div class="progress"><span id="onbProgress" style="width:${progress(np)}%"></span></div>`}
          <span style="color:var(--primary-blue-light);justify-self:end">${paw(22)}</span>
        </div>
        ${editId ? '' : `<h1 class="onb-title">Vamos conhecer<br>seu pet!</h1><p class="onb-sub">Escolha a espécie e informe o nascimento: as vacinas, exames e consultas da espécie entram sozinhos na carteira.</p>`}

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
            <div class="seg seg-sex" style="margin:0">${['Macho', 'Fêmea'].map((x, i) => `<button type="button" class="${np.sex === x ? 'on' : ''}" data-tab-index="${i}" data-act="pickSex" data-arg="${x}">${x}</button>`).join('')}</div>
          </div>
          ${field('Raça / tipo', `<select data-model="breed">${[...new Set([...s.breeds, ...(np.breed && !s.breeds.includes(np.breed) ? [np.breed] : [])])].map((b) => `<option ${b === np.breed ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>${icon('down', 18)}`)}
          ${np.species === 'cachorro' ? (manualDogSize
            ? `<div class="field dog-size-field"><span>Porte</span><label class="input"><select data-model="sizeClass" aria-label="Porte do cachorro"><option value="" ${selectedDogSize ? '' : 'selected'} disabled>Selecione o porte</option>${['Pequeno', 'Médio', 'Grande'].map((size) => `<option value="${size}" ${selectedDogSize === size ? 'selected' : ''}>${size}</option>`).join('')}</select>${icon('down', 18)}</label><small class="field-hint">Raça não identificada ou sem porte definido: escolha o porte do seu cachorro.</small></div>`
            : `<div class="field dog-size-field"><span>Porte estimado</span><div class="dog-size-value">${dogSize}</div><small class="field-hint">Estimativa baseada na raça.</small></div>`
          ) : ''}
          <div class="field-row">
            <div class="field birth-field${birthError ? ' invalid' : ''}"><span>Nascimento</span><label class="input birth-input-wrap"><input class="birth-date-input" type="text" inputmode="numeric" autocomplete="bday" data-model="birth" value="${esc(np._birthText ?? birthISOToText(np.birth))}" placeholder="dd/mm/aaaa" maxlength="10" aria-label="Data de nascimento" aria-invalid="${birthError ? 'true' : 'false'}"><button type="button" class="birth-calendar-toggle" data-act="toggleBirthCalendar" aria-label="Abrir calendário">${icon('calendar', 18)}</button></label>${ui.birthCalendarOpen ? birthCalendar(np) : ''}<small class="field-error" data-field-error="birth" aria-live="polite"${birthError ? '' : ' hidden'}>${esc(birthError)}</small></div>
            <div class="field${weightError ? ' invalid' : ''}"><span>Peso</span><label class="input"><input type="number" inputmode="decimal" min="0.1" step="0.1" data-model="weight" value="${esc(np.weight ?? '')}" placeholder="0,1" aria-invalid="${weightError ? 'true' : 'false'}"><span class="suffix">${s.unit}</span></label><small class="field-error" data-field-error="weight" aria-live="polite"${weightError ? '' : ' hidden'}>${esc(weightError)}</small></div>
          </div>
          <div class="card auto-wallet">
            <span class="r-ic">${icon('syringe', 20)}</span>
            <div><strong>${recs.length ? `${recs.length} itens na carteira de ${s.plural.toLowerCase()}` : 'Carteira automática'}</strong>
            <small>${recs.length ? recs.map((v) => esc(v.name.split(' (')[0].split(':')[0])).join(' · ') : 'Informe o nascimento para ver as vacinas e datas que o app vai calcular.'}</small></div>
          </div>
          ${field('Microchip (opcional)', `<input data-model="chip" value="${esc(formatMicrochip(np.chip))}" inputmode="numeric" maxlength="19" autocomplete="off" placeholder="000 000 000 000 000" aria-label="Microchip (apenas números)">`)}
          ${field('CPF / registro do pet (opcional)', `<input data-model="registration" value="${esc(np.registration || '')}" inputmode="text" maxlength="32" placeholder="CPF, RGA ou outro número">`)}
          <label class="card v-remind" style="margin:0 0 16px">
            <span class="t">${icon('shield', 20)} Castrado(a)</span>
            <span class="switch"><input type="checkbox" data-model-check="neutered" ${np.neutered ? 'checked' : ''} aria-label="Castrado"><span></span></span>
          </label>
          <button class="btn" type="submit">${editId ? 'Salvar alterações' : 'Adicionar pet'}</button>
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
    const nextUp = recs.filter((r) => r.next && ['ok', 'soon'].includes(r.st.cls)).sort((a, b) => a.next.localeCompare(b.next))[0];
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
          <div><small>Que bom te ver por aqui</small><strong>Olá, Tutor</strong></div>
          <button class="icon-btn" data-go="#/notificacoes" aria-label="Notificações">${icon('bell')}${alert ? '<span class="dot"></span>' : ''}</button>
        </div>

        <div class="pet-hero" data-go="#/pet/${p.id}" role="button" tabindex="0" aria-label="Abrir perfil de ${esc(p.name)}">
          <span class="spc">${paw(14)} ${s.label}</span>
          <h2>${esc(p.name)}</h2>
          <p>${esc(p.breed)}<br>${ageText(p)} · ${weightText(p)}</p>
          <span class="hero-actions">
            <button class="btn sm white" data-go="#/editar/${p.id}">${icon('edit', 15)} Editar pet</button>
          </span>
          ${p.photo ? `<img class="pet-photo" src="${p.photo}" alt="Foto de ${esc(p.name)}">` : `<img class="pet-img" src="${petImg(p)}" alt="">`}
        </div>

        <div class="pet-switch centered" aria-label="Seus pets">
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
        <div class="hscroll pet-offers">${offers.slice(0, 5).map(pcard).join('')}</div>
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
      const ORD = { late: 0, miss: 1, soon: 2, ok: 3, wait: 4, todo: 5, registered: 6 };
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
        ['Espécie', s.label], ['Raça / tipo', esc(p.breed)], ['Sexo', p.sex || '—'], ['Nascimento', p.birth ? `${validPetBirth(p.birth, p.species) ? fmtDate(p.birth) : 'Data inválida'} (${ageText(p)})` : '—'],
        ...(p.species === 'cachorro' ? [['Porte', esc(p.sizeClass || C.dogBreedSize(p.breed) || 'Não informado')]] : []), ['Peso', weightText(p)], ['Castrado(a)', p.neutered ? 'Sim' : 'Não'], ['Microchip', esc(p.chip) || '—'], ['CPF / registro', esc(p.registration) || '—'],
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
          <div>${icon('cake', 18)}<strong>${ageText(p)}</strong><small>Idade</small></div>
          <div>${icon('weight', 18)}<strong>${weightText(p)}</strong><small>Peso</small></div>
          <div>${paw(18)}<strong>${p.sex || '—'}</strong><small>Sexo</small></div>
        </div>
        ${lostPetCard(p)}
        <div class="pet-actions">
          <button class="btn sm" data-act="bookFor" data-arg="${p.id}|consulta">${icon('calendar', 16)} Agendar consulta</button>
          <button class="btn sm ghost" data-act="petTab" data-arg="produtos">${icon('bag', 16)} Itens para ${esc(p.name)}</button>
        </div>
          <div class="seg tabs4 pet-tabs" role="tablist" aria-label="Seções do perfil do pet">
          ${[['carteira', 'Carteira'], ['cuidados', 'Cuidados'], ['produtos', 'Produtos'], ['dados', 'Dados']].map(([k, l], i) => `<button class="${tab === k ? 'on' : ''}" data-tab-index="${i}" data-act="petTab" data-arg="${k}" role="tab" aria-selected="${tab === k}">${l}</button>`).join('')}
        </div>
        ${body}
      </div>`,
    };
  };

  // Fontes da base de vacinas para a espécie (WSAVA para cães e gatos)
  const sourcesText = (sp) => {
    const list = vaccineSources[sp] || [];
    const links = list.map((s) => (s.url ? `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>` : s.label)).join(' · ');
    return `${links || 'Referência geral'}. ${C.vaccineDb.disclaimer}`;
  };

  V.vacinas = () => {
    const p = pet();
    const recs = petVaccines(p);
    const byNext = (a, b) => (a.next || '9999').localeCompare(b.next || '9999');
    const groups = [
      ['Atenção', recs.filter(isAlert).sort(byNext)],
      ['Em dia', recs.filter((r) => ['ok', 'soon'].includes(r.st.cls)).sort(byNext)],
      ['Aguardando idade', recs.filter((r) => r.st.cls === 'wait').sort(byNext)],
      ['Não essenciais (avaliar com o veterinário)', recs.filter((r) => r.st.cls === 'todo')],
    ];
    const history = [];
    recs.forEach(({ v, rec, applied }) => applied.forEach((d, i) => history.push({ v, d, i, place: rec && rec.place })));
    history.sort((a, b) => b.d.localeCompare(a.d));

    const legend = `<div class="legend">${[['ok', 'Em dia'], ['soon', 'Em breve'], ['late', 'Atrasada'], ['miss', 'Não tomou'], ['wait', 'Aguardando idade'], ['todo', 'Não essencial']].map(([c, l]) => `<span><i class="dotc ${c}"></i>${l}</span>`).join('')}</div>`;

    const body = ui.vacTab === 'geral'
      ? `${summaryCard(p)}${legend}
        ${groups.filter(([, list]) => list.length).map(([title, list]) => `<div class="sec-title"><h2>${title}</h2></div><div class="list">${list.map(vrow).join('')}</div>`).join('')}
        <p class="muted-sm vaccine-source" style="margin-top:16px">${icon('info', 14)}<span>${sourcesText(p.species)}</span></p>`
      : history.length
        ? `<div class="list">${history.map(({ v, d, i }) => `
            <button class="row" data-go="#/vacina/${v.key}">
              <span class="r-ic ok">${icon('check', 22)}</span>
              <span class="r-main"><strong>${v.name}</strong><small>${kindLabel(v)} · ${i + 1}ª aplicação · ${fmtDate(d)}</small></span>
              <span class="r-end">${icon('right', 18)}</span>
            </button>`).join('')}</div>`
        : emptyState('Nenhuma aplicação ainda', 'Abra um item da carteira e toque em "Marcar como tomada".');

    return {
      html: `
      <div class="view">
        <div class="topbar left vet-ficha-topbar"><h1>${hasVaccine(p.species) ? 'Vacinas' : 'Saúde'}</h1><button class="btn sm vet-ficha-trigger" data-act="share">${icon('file', 17)} Gerar ficha</button></div>
        <div class="shop-for"><small>${walletName(p.species)} de</small>${petChip()}</div>
        <div class="seg vac-tabs" role="tablist" aria-label="Seções da carteira">
          <button class="${ui.vacTab === 'geral' ? 'on' : ''}" data-tab-index="0" data-act="vacTab" data-arg="geral" role="tab" aria-selected="${ui.vacTab === 'geral'}">Visão geral</button>
          <button class="${ui.vacTab === 'hist' ? 'on' : ''}" data-tab-index="1" data-act="vacTab" data-arg="hist" role="tab" aria-selected="${ui.vacTab === 'hist'}">Histórico</button>
        </div>
        ${body}
      </div>`,
    };
  };

  // Situação de uma dose do calendário (linha do tempo na tela da vacina)
  const doseState = (x) => {
    if (x.taken) return ['ok', `Tomada em ${fmtDate(x.taken)}`];
    if (!x.due) return ['todo', 'Depende da dose anterior'];
    const d = daysUntil(x.due);
    return d < 0 ? ['late', `Atrasada desde ${fmtDate(x.due)}`] : d <= 30 ? ['soon', `${fmtDate(x.due)} · ${whenText(d)}`] : ['wait', `Prevista para ${fmtDate(x.due)}`];
  };

  V.vacina = (key) => {
    const p = pet();
    const v = vaccinesFor(p).find((x) => x.key === key);
    if (!v) return V.vacinas();
    const r = vInfo(p, v);
    const { rec, st, n } = r;
    const last = n ? r.applied[n - 1] : null;
    const steps = Array.from({ length: Math.max(r.series, 1) }, (_, i) => i < Math.min(n, r.series));
    const doseName = (x) => (x.booster ? `${v.kind === 'vacina' ? 'Reforço' : 'Repetição'} ${x.n - r.series}` : r.series > 1 ? `${x.n}ª dose` : v.kind === 'vacina' ? 'Dose' : v.kind === 'exame' ? 'Exame' : 'Consulta');
    const doseAge = (x) => (x.booster ? everyText(v.interval) : x.ageW !== null ? `com ${ageWords(x.ageW)}` : `${v.gap} dias após a anterior`);
    const firstPending = r.plan.find((x) => !x.taken);
    return {
      html: `
      <div class="view">
        ${topbar(`Detalhes ${v.kind === 'vacina' ? 'da vacina' : v.kind === 'exame' ? 'do exame' : 'da consulta'}`)}
        <div class="card v-head">
          <span class="r-ic">${icon(kindIcon(v), 28)}</span>
          <div><strong>${v.name}</strong><small>${last ? `Última em ${fmtDate(last)}` : 'Ainda não registrada'} · ${esc(p.name)}</small><span class="lv-line">${levelTag(v)}</span></div>
        </div>
        <div class="card kv">
          <div><small>${firstPending ? doseName(firstPending) : 'Próxima'}</small><strong>${r.next ? fmtDate(r.next) : firstPending ? 'Informe o nascimento' : 'Nenhuma pendente'}</strong></div>
          <div><small>Situação</small><span class="status ${st.cls}">${st.label}</span></div>
        </div>
        ${r.series > 1 ? `
          <div class="card dose-track">
            <small>${r.puppy ? 'Esquema de filhote' : 'Esquema de adulto'} · ${Math.min(n, r.series)} de ${r.series} doses</small>
            <div>${steps.map((done, i) => `<span class="${done ? 'done' : i === n ? 'next' : ''}">${done ? icon('check', 14) : i + 1}</span>`).join('<i></i>')}${v.interval ? `<i></i><span class="${n >= r.series ? 'done' : ''}" title="Reforço">${icon('sparkle', 14)}</span>` : ''}</div>
          </div>` : ''}

        <div class="sec-title"><h2>Calendário de ${esc(p.name)}</h2></div>
        <div class="list dose-list">${r.plan.map((x) => {
          const [cls, txt] = doseState(x);
          const isNext = x === firstPending;
          return `
          <div class="row dose-row ${isNext ? 'is-next' : ''}">
            <span class="r-ic ${cls}">${x.taken ? icon('check', 18) : `<b>${x.booster ? icon('sparkle', 16) : x.n}</b>`}</span>
            <span class="r-main"><strong>${doseName(x)} <small class="dose-age">${doseAge(x)}</small></strong><small>${txt}${x.taken && rec && rec.place && x.taken === last ? ` · ${esc(rec.place)}` : ''}</small></span>
            <span class="r-end">${x.taken
              ? `<button class="icon-btn sm" data-act="removeDose" data-arg="${key}|${x.taken}" aria-label="Desmarcar dose">${icon('trash', 16)}</button>`
              : isNext && x.due ? `<button class="btn sm" data-act="openApply" data-arg="${key}|${x.due}">${icon('check', 14)} Marcar como tomada</button>` : ''}</span>
          </div>`;
        }).join('')}</div>

        <div class="card v-desc" style="margin-top:14px"><strong style="color:var(--text-dark)">${protocolText(v)}</strong><br>${v.desc}<br><small class="muted-sm">Fonte: ${sourcesText(p.species)}</small></div>
        <label class="card v-remind">
          <span class="t">${icon('bell', 20)} Me lembrar da próxima dose</span>
          <span class="switch"><input type="checkbox" data-act="toggleRemind" data-arg="${key}" ${r.remind ? 'checked' : ''} aria-label="Lembrete da próxima dose"><span></span></span>
        </label>
        <div class="pet-actions" style="margin-top:18px">
          <button class="btn" data-act="openApply" data-arg="${key}">${icon('plus', 20)} Registrar aplicação</button>
          <button class="btn ghost" data-act="bookFor" data-arg="${p.id}|${v.kind === 'vacina' ? 'vacina' : v.kind === 'exame' ? 'exames' : 'consulta'}|${esc(v.name)}">${icon('calendar', 18)} Agendar com veterinário</button>
        </div>
      </div>`,
    };
  };

  V.lembretes = () => {
    const p = pet();
    const tab = ui.remTab;
    const remStatus = (d) => (d < 0 ? ['late', 'Atrasado'] : d === 0 ? ['soon', 'Hoje'] : d <= 7 ? ['soon', 'Em breve'] : ['ok', 'Agendado']);
    let list;
    if (tab === 'vacinas') {
      const recs = petVaccines(p).filter((r) => r.next && r.remind && !['todo', 'wait'].includes(r.st.cls))
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
        <div class="seg rem-tabs" role="tablist" aria-label="Categorias de lembretes">
          ${[['vacinas', 'Vacinas'], ['vermifugos', 'Vermífugos'], ['outros', 'Outros']].map(([k, l], i) => `<button class="${tab === k ? 'on' : ''}" data-tab-index="${i}" data-act="remTab" data-arg="${k}" role="tab" aria-selected="${tab === k}">${l}</button>`).join('')}
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
          if (!next || ['todo', 'wait'].includes(st.cls)) return;
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
        <div class="seg agenda-tabs" role="tablist" aria-label="Seções da agenda">
          <button class="${tab === 'proximas' ? 'on' : ''}" data-tab-index="0" data-act="agTab" data-arg="proximas" role="tab" aria-selected="${tab === 'proximas'}">Próximas</button>
          <button class="${tab === 'hist' ? 'on' : ''}" data-tab-index="1" data-act="agTab" data-arg="hist" role="tab" aria-selected="${tab === 'hist'}">Histórico</button>
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
          <div class="pet-switch centered" style="margin-top:4px">${S.pets.map((x) => `<button class="${x.id === b.petId ? 'on' : ''}" data-act="bk" data-arg="petId:${x.id}">${avatar(x)}${esc(x.name)}</button>`).join('')}</div>
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
        ${list.length ? `<div class="list notification-list">${list.map((n) => `
          <button class="row notification-row" data-act="openNotif" data-arg="${n.p.id}" data-then="${n.go}">
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
        <div class="list category-results" aria-live="polite">${list.length ? list.map(prow).join('') : emptyState('Em breve', 'Estamos trazendo novidades para esta categoria.')}</div>
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
    const rating = ratingSummary(p);
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
        <span class="stars">★ ${rating.average.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} <small>(${rating.count} avaliações) · ${p.brand}</small></span>
        <div class="pd-price"><span class="price">${brl(price)}</span>${p.old && (!p.sizes || p.sizes[ui.pd.size][1] === p.price) ? `<span class="price-old">${brl(p.old)}</span><span class="badge-off">-${discount(p)}%</span>` : ''}</div>
        ${p.sizes ? `<div class="sizes">${p.sizes.map(([l, v], i) => `<button class="${i === ui.pd.size ? 'on' : ''}" data-act="size" data-arg="${i}">${l}<small>${brl(v)}</small></button>`).join('')}</div>` : ''}
        <div class="sec-title" style="margin-top:4px"><h2>Sobre o produto</h2></div>
        <p class="pd-desc">${p.desc}</p>
        <div class="pd-perks">
          <span>${icon('truck', 16)} Entrega em até 2 dias úteis</span>
          <span>${icon('shield', 16)} Troca grátis em 7 dias</span>
        </div>
        ${mismatch ? `<div class="warn">${icon('help', 18)}<span>Este produto é para ${sp.plural.toLowerCase()}. O pet selecionado é ${esc(active.name)} (${spOf(active).label.toLowerCase()}).</span></div>` : ''}
        ${similar.length ? `<div class="sec-title"><h2>Você também pode gostar</h2></div><div class="similar-products">${similar.slice(0, 3).map(pcard).join('')}</div>` : ''}
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

  V.parceiros = () => {
    const groups = [...new Set(C.brands.map((b) => b.kind))];
    return {
      html: `
      <div class="view">
        ${topbar('Marcas e serviços')}
        <p class="brand-note">Exemplos de marcas reais do setor pet. A presença nesta página é demonstrativa e não confirma parceria comercial com o CuidaPet.</p>
        ${groups.map((kind) => `<section class="brand-group"><div class="sec-title"><h2>${kind}</h2></div><div class="brands">${C.brands.filter((b) => b.kind === kind).map((b) => `<a class="brand-tile ${b.font}" style="--brand-color:${b.color}" href="${b.url}" target="_blank" rel="noopener noreferrer"><strong>${b.name}</strong><small>Visitar site oficial</small></a>`).join('')}</div></section>`).join('')}
        <button class="promo" data-go="#/loja"><strong>Encontre produtos para quem você ama</strong><small>Do cachorro ao peixinho.</small><span class="btn sm white">Ir à loja</span><img src="${petImg(pet())}" alt=""></button>
      </div>`,
    };
  };

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
        <button class="card profile" data-go="#/perfil">${userAvatar(56)}<span style="flex:1"><strong>${esc(S.profile.name)}</strong><small>Perfil de demonstração · sem login</small></span>${icon('right', 18)}</button>
        <div class="card menu">
          ${items.map(([ic, l, go]) => `<button data-go="${go}">${ic === 'paw' ? paw(20) : icon(ic, 20)}<span>${l}</span>${ic === 'paw' ? `<small class="count-pill">${S.pets.length}</small>` : ''}<span class="chev">${icon('right', 18)}</span></button>`).join('')}
          <button data-act="reset">${icon('sparkle', 20)}<span>Restaurar perfil de exemplo</span><span class="chev">${icon('right', 18)}</span></button>
        </div>
        <p class="muted-sm" style="text-align:center;margin-top:16px">CuidaPet · protótipo de portfólio · seus dados ficam só neste navegador</p>
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
            <span class="r-main"><strong>${esc(p.name)}</strong><small>${spOf(p).label} · ${esc(p.breed)}</small><small>${ageText(p)} · ${weightText(p)}</small></span>
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
        ? `<div class="list">${S.orders.map((o, orderIndex) => ({ o, orderIndex })).reverse().map(({ o, orderIndex }) => {
            const d = daysUntil(o.date);
            const st = d <= -2 ? ['ok', 'Entregue'] : ['soon', 'A caminho'];
            const productsHtml = (o.products || []).map((item, itemIndex) => {
              const bought = product(item.id);
              if (!bought) return '';
              return `<div class="order-review-row"><span><strong>${bought.name}</strong><small>${item.size ? `${item.size} · ` : ''}Qtd. ${item.qty}</small></span>${item.review ? `<span class="review-done" aria-label="Avaliado com ${item.review.rating} de 5 estrelas">${'★'.repeat(item.review.rating)}${'☆'.repeat(5 - item.review.rating)} <small>Avaliado</small></span>` : `<button class="link-btn" data-act="reviewProduct" data-arg="${orderIndex}:${itemIndex}">Avaliar produto</button>`}</div>`;
            }).join('');
            return `<div class="card order-card"><div class="row"><span class="r-ic">${icon('truck', 22)}</span>
              <span class="r-main"><strong>Pedido #${o.n}</strong><small>${fmtDate(o.date)} · ${o.items} ${o.items > 1 ? 'itens' : 'item'} · ${brl(o.total)}</small></span>
              <span class="status ${st[0]}">${st[1]}</span></div>${productsHtml ? `<div class="order-review-list">${productsHtml}</div>` : ''}</div>`;
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
      <div class="profile-head">${userAvatar(84)}<strong>${esc(S.profile.name)}</strong><small>Tutor(a) de ${S.pets.length} ${S.pets.length === 1 ? 'pet' : 'pets'} · perfil de demonstração</small></div>
      <label class="profile-photo-control">${icon('camera', 16)} ${S.profile.photo ? 'Trocar foto do tutor' : 'Adicionar foto do tutor'}<input type="file" accept="image/*" data-photo-user></label>
      <div class="sec-title" style="margin-top:0"><h2>Meus pets</h2><button class="link-btn" data-act="newPet">${icon('plus', 14)} Adicionar</button></div>
      <div class="pet-switch centered" style="margin-top:0">${S.pets.map((x) => `<button data-go="#/pet/${x.id}">${avatar(x)}${esc(x.name)}</button>`).join('')}<button class="add" data-act="newPet" aria-label="Cadastrar pet"><span class="avatar">${icon('plus', 22)}</span>Novo</button></div>
      <div class="sec-title"><h2>Dados pessoais</h2></div>
      <form data-form="perfil">
        ${field('Nome completo', `<input name="name" value="${esc(S.profile.name)}" autocomplete="name">`)}
        <div class="field"><span>CPF do tutor</span><label class="input"><input name="cpf" value="${esc(fmtCpf(S.profile.cpf || ''))}" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="000.000.000-00"></label></div>
        ${field('E-mail', `<input name="email" type="email" value="${esc(S.profile.email)}" autocomplete="email" placeholder="opcional">`)}
        ${field('Celular', `<input name="phone" type="tel" value="${esc(S.profile.phone)}" autocomplete="tel">`)}
        <div class="field-row">
          ${field('CEP', `<input name="cep" inputmode="numeric" maxlength="9" value="${esc(S.profile.cep)}">`)}
          ${field('Cidade – UF', `<input name="city" value="${esc(S.profile.city)}">`)}
        </div>
        <button class="btn" type="submit">Salvar</button>
      </form>
      <div class="sec-title"><h2>Backup dos seus dados</h2></div>
      <p class="muted-sm" style="margin:-8px 0 14px">O backup inclui pets, vacinas, consultas e dados pessoais salvos neste aparelho. O arquivo fica com você e não é enviado a um servidor.</p>
      <div class="list">
        <button class="row" data-act="exportBackup"><span class="r-ic">${icon('file', 20)}</span><span class="r-main"><strong>Baixar backup</strong><small>Salvar uma cópia em arquivo JSON</small></span><span class="chev">${icon('right', 18)}</span></button>
        <button class="row" data-act="importBackup"><span class="r-ic">${icon('file', 20)}</span><span class="r-main"><strong>Restaurar backup</strong><small>Carregar uma cópia deste CuidaPet</small></span><span class="chev">${icon('right', 18)}</span></button>
      </div>
      <input id="backupImportInput" type="file" accept="application/json,.json" hidden>
      <button class="btn ghost" style="margin-top:10px" data-act="reset">${icon('sparkle', 18)} Restaurar perfil de exemplo</button>
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
      <p class="muted-sm payment-privacy-note" style="margin-top:14px">${icon('lock', 14)} Protótipo: os dados do cartão não são enviados a lugar nenhum.</p>
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
          <div class="seg tabs4 seg-lead" style="margin:0">${[1, 3, 7, 15].map((d, i) => `<button class="${Number(S.settings.antecedencia) === d ? 'on' : ''}" data-tab-index="${i}" data-act="ahead" data-arg="${d}">${d} ${d > 1 ? 'dias' : 'dia'}</button>`).join('')}</div>
        </div>
        <div class="sec-title"><h2>Dados do protótipo</h2></div>
        <div class="card menu">
          <button data-go="#/perfil">${icon('user', 20)}<span>Dados do tutor</span><span class="chev">${icon('right', 18)}</span></button>
          <button data-act="reset">${icon('sparkle', 20)}<span>Restaurar perfil de exemplo</span><span class="chev">${icon('right', 18)}</span></button>
          <button class="danger" data-act="askWipe">${icon('trash', 20)}<span>Começar do zero (sem pets)</span></button>
        </div>
        <p class="muted-sm vaccine-source" style="margin-top:10px">${icon('info', 14)}<span>Sem login e sem banco de dados: o que você muda fica salvo só neste navegador. Base de vacinas versão ${esc(C.vaccineDb.version || '')}.</span></p>
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
  let renderedRoute = null;
  let renderedHash = location.hash;

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
      <a class="side-logo" href="#/home" data-tab="#/home">CuidaPet</a>
      <nav class="side-nav" aria-label="Menu">
        ${items.map(([k, l, ic, go]) => `<button class="${k === active ? 'on' : ''}" data-tab="${go}">${k === 'pets' ? paw(20) : icon(ic, 20)}<span>${l}</span>${k === 'vacinas' && late ? `<i class="side-badge late">${late}</i>` : ''}${k === 'loja' && n ? `<i class="side-badge">${n}</i>` : ''}</button>`).join('')}
      </nav>
      <div class="side-pets">
        <small>Seus pets</small>
        <div>${S.pets.map((p) => `<button class="${p.id === S.active ? 'on' : ''}" data-go="#/pet/${p.id}" title="${esc(p.name)}">${avatar(p, 40)}</button>`).join('')}<button class="add" data-act="newPet" title="Adicionar pet" aria-label="Adicionar pet">${icon('plus', 18)}</button></div>
      </div>
      <button class="side-user" data-go="#/perfil">${userAvatar(40)}<span><strong>${esc(S.profile.name || 'Meu perfil')}</strong><small>Perfil de demonstração</small></span></button>`;
    const titles = { home: 'Olá, Tutor', pets: 'Meus pets', vacinas: 'Carteira de saúde', lembretes: 'Lembretes', agenda: 'Agenda', loja: 'Loja', pedidos: 'Pedidos', conta: 'Minha conta' };
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
    if (booting || bootError) {
      if (bootError) document.getElementById('startupSplash')?.remove();
      screen.className = 'screen flush';
      screen.innerHTML = bootError
        ? `<div class="boot"><span class="boot-logo">CuidaPet</span><p class="muted-sm" style="max-width:320px;text-align:center">Não foi possível carregar a base de vacinas (${esc(bootError)}). Abra o site por um servidor (não direto do arquivo) e recarregue.</p></div>`
        : `<div class="boot"><span class="boot-logo">CuidaPet</span><span class="spinner"></span></div>`;
      document.body.classList.add('is-auth');
      return;
    }
    const startupSplash = document.getElementById('startupSplash');
    if (startupSplash) {
      document.body.classList.add('startup-revealing');
      startupSplash.classList.add('done');
      document.getElementById('startupBrand')?.classList.add('docked');
      setTimeout(() => document.body.classList.add('startup-sidebar-ready'), 1350);
      setTimeout(() => {
        startupSplash.remove();
        document.getElementById('startupBrand')?.remove();
        document.body.classList.remove('startup-revealing', 'startup-sidebar-ready');
      }, 2550);
    }
    let { name, args } = parse();
    if (!V[name]) name = 'home';
    if (!S.pets.length && NEEDS_PET.has(name)) name = 'semPet';
    renderedRoute = { name, args: [...args] };
    renderedHash = location.hash;
    const view = V[name](...args);
    const isAuth = /\bauth\b/.test(view.cls || '');
    document.body.classList.toggle('is-auth', isAuth);
    if (!isAuth) renderChrome(name);
    const top = screen.scrollTop;
    screen.className = 'screen ' + (view.cls || '');
    screen.innerHTML = view.html;
    screen.querySelectorAll('.seg').forEach((seg) => {
      let indicator = seg.querySelector(':scope > .seg-indicator');
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'seg-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        seg.prepend(indicator);
      }
      const buttons = [...seg.querySelectorAll(':scope > button')];
      const first = buttons[0];
      const selected = buttons.find((button) => button.classList.contains('on'));
      indicator.style.setProperty('--seg-indicator-offset', `${first && selected ? selected.offsetLeft - first.offsetLeft : 0}px`);
    });
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

  const updateCategoryView = () => {
    const next = parse();
    if (next.name !== 'categoria' || renderedRoute?.name !== 'categoria') return false;

    const [cat = 'todos', tag = ''] = next.args;
    const nextViewTemplate = document.createElement('template');
    nextViewTemplate.innerHTML = V.categoria(cat, tag).html.trim();
    const nextView = nextViewTemplate.content.querySelector('.view');
    const currentView = screen.querySelector('.view');
    if (!nextView || !currentView) return false;

    const title = currentView.querySelector('.topbar h1');
    const nextTitle = nextView.querySelector('.topbar h1');
    const chips = currentView.querySelector('.chips');
    const nextChips = nextView.querySelector('.chips');
    const results = currentView.querySelector('.category-results');
    const nextResults = nextView.querySelector('.category-results');
    if (!title || !nextTitle || !chips || !nextChips || !results || !nextResults) return false;

    title.textContent = nextTitle.textContent;
    title.classList.remove('category-title-refresh');
    void title.offsetWidth;
    title.classList.add('category-title-refresh');

    const oldChips = [...chips.children];
    const freshChips = [...nextChips.children];
    if (renderedRoute.args[0] === cat && oldChips.length === freshChips.length) {
      freshChips.forEach((chip, i) => { oldChips[i].className = chip.className; });
    } else {
      const horizontalPosition = chips.scrollLeft;
      chips.innerHTML = nextChips.innerHTML;
      chips.scrollLeft = horizontalPosition;
      chips.querySelector('.chip.on')?.focus({ preventScroll: true });
    }

    results.classList.remove('is-updating');
    results.innerHTML = nextResults.innerHTML;
    void results.offsetWidth;
    results.classList.add('is-updating');
    renderedRoute = { name: next.name, args: [...next.args] };
    renderedHash = location.hash;
    return true;
  };

  const renderTabChange = () => {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const activeIndexes = new Map([...device.querySelectorAll('.seg')].map((seg) => {
      const key = [...seg.classList].sort().join('.');
      const buttons = [...seg.querySelectorAll(':scope > button')];
      return [key, {
        index: buttons.findIndex((button) => button.classList.contains('on')),
        colors: buttons.map((button) => getComputedStyle(button).color),
        position: (() => {
          const indicator = seg.querySelector(':scope > .seg-indicator');
          const transform = indicator ? getComputedStyle(indicator).transform : 'none';
          try { return new DOMMatrixReadOnly(transform).m41; } catch { return 0; }
        })(),
      }];
    }));

    render(true);
    if (reduceMotion) return;

    device.querySelectorAll('.seg').forEach((seg) => {
      const key = [...seg.classList].sort().join('.');
      const previous = activeIndexes.get(key);
      const oldIndex = previous?.index;
      const buttons = [...seg.querySelectorAll(':scope > button')];
      const newIndex = buttons.findIndex((button) => button.classList.contains('on'));
      if (oldIndex == null || oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      if (typeof Element.prototype.animate === 'function') {
        buttons.forEach((button, i) => {
          const from = previous.colors[i];
          const to = getComputedStyle(button).color;
          if (from === to) return;
          button.animate([{ color: from }, { color: to }], {
            duration: 280,
            easing: 'cubic-bezier(.16, 1, .3, 1)',
          });
        });
      }

      const firstLeft = buttons[0].offsetLeft;
      const startX = Number.isFinite(previous.position) ? previous.position : buttons[oldIndex].offsetLeft - firstLeft;
      const endX = buttons[newIndex].offsetLeft - firstLeft;
      const indicator = seg.querySelector(':scope > .seg-indicator');
      if (indicator && typeof indicator.animate === 'function') {
        indicator.animate([
          { transform: `translateX(${startX}px)` },
          { transform: `translateX(${endX}px)` },
        ], { duration: 300, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      }
      seg.classList.add('is-sliding');
      setTimeout(() => seg.classList.remove('is-sliding'), 320);
    });
  };

  const go = (hash) => {
    if (hash === location.hash) return;
    navStack.push(location.hash || '#/home');
    history.pushState({ [NAV_ROUTE_STATE]: hash, [NAV_STACK_STATE]: [...navStack] }, '', hash);
    persistNavStack();
    closeSheet();
    if (updateCategoryView()) return;
    render();
  };
  const replace = (hash) => {
    if (hash === location.hash) return;
    history.replaceState({ [NAV_ROUTE_STATE]: hash, [NAV_STACK_STATE]: [...navStack] }, '', hash);
    persistNavStack();
    if (updateCategoryView()) return;
    render();
  };
  const back = () => {
    if (navStack.length) { history.back(); return; }
    if (location.hash !== '#/home') go('#/home');
  };

  window.addEventListener('hashchange', () => {
    const state = history.state;
    navStack = state?.[NAV_ROUTE_STATE] === location.hash && Array.isArray(state?.[NAV_STACK_STATE])
      ? [...state[NAV_STACK_STATE]]
      : [];
    persistNavStack();
    if (renderedHash === location.hash) return;
    if (updateCategoryView()) return;
    closeSheet();
    render();
  });
  window.addEventListener('popstate', (event) => {
    navStack = event.state?.[NAV_ROUTE_STATE] === location.hash && Array.isArray(event.state?.[NAV_STACK_STATE])
      ? [...event.state[NAV_STACK_STATE]]
      : [];
    persistNavStack();
    if (updateCategoryView()) return;
    closeSheet();
    render();
  });

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
    photoCropSave() { finishPhotoCrop(); },
    photoCropCancel() { ui.photoCrop = null; closeSheet(); },
    toggleBirthCalendar() {
      const np = ui.newPet;
      ui.birthCalendarOpen = !ui.birthCalendarOpen;
      if (ui.birthCalendarOpen) {
        const base = np.birth || iso(0);
        ui.birthCalendarMonth = base.slice(0, 7);
        const fieldRect = screen.querySelector('.birth-field')?.getBoundingClientRect();
        ui.birthCalendarAbove = false;
        if (fieldRect && window.innerHeight - fieldRect.bottom < 345) {
          const needed = 345 - (window.innerHeight - fieldRect.bottom);
          const scrollRoom = screen.scrollHeight - screen.clientHeight - screen.scrollTop;
          if (scrollRoom >= needed) screen.scrollTop += needed;
          else ui.birthCalendarAbove = fieldRect.top - 80 >= 345;
        }
      }
      render(true);
    },
    birthCalendarMonth(direction) {
      const base = ui.birthCalendarMonth || iso(0).slice(0, 7);
      const current = new Date(`${base}-01T00:00:00`);
      current.setMonth(current.getMonth() + Number(direction));
      ui.birthCalendarMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      render(true);
    },
    pickBirthDate(value) {
      const np = ui.newPet;
      if (!validDate(value) || value < earliestBirthDate(np.species) || value > iso(0)) return;
      np.birth = value;
      np._birthText = birthISOToText(value);
      np._birthInputInvalid = false;
      ui.birthCalendarOpen = false;
      render(true);
    },
    clearBirthDate() {
      const np = ui.newPet;
      np.birth = '';
      np._birthText = '';
      np._birthInputInvalid = false;
      ui.birthCalendarOpen = false;
      render(true);
    },
    // Atalho para agendar a partir do perfil do pet ou de uma vacina: "petId|serviço|observação"
    bookFor(arg) {
      const [petId, service, notes = ''] = arg.split('|');
      ui.booking = { petId, service, clinic: 'centro', date: iso(1), time: null, notes };
      go('#/agendar');
    },
    agTab(t) { ui.agTab = t; renderTabChange(); },
    bk(arg) {
      const i = arg.indexOf(':');
      const k = arg.slice(0, i);
      ui.booking[k] = arg.slice(i + 1);
      render(true);
    },
    confirmAppt() {
      const b = ui.booking;
      if (!b || !b.time) return;
      if (!validDate(b.date) || b.date < iso(1) || b.date > iso(90)) { toast('Escolha uma data entre amanhã e os próximos 90 dias'); return; }
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
      np.sizeClass = '';
      render(true);
    },
    pickSex(x) { ui.newPet.sex = x; renderTabChange(); },
    newPet() { closeSheet(); ui.newPet = null; ui.spQuery = ''; go('#/cadastro'); },
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
    petTab(t) { ui.petTab = t; renderTabChange(); },
    vacTab(t) { ui.vacTab = t; renderTabChange(); },
    remTab(t) { ui.remTab = t; renderTabChange(); },
    share() {
      const p = pet();
      if (!p) return;
      const records = petVaccines(p).filter(({ v }) => v.kind === 'vacina');
      const vaccineRows = records.length
        ? records.map(({ v, rec, st }) => `<li><strong>${esc(v.name)}</strong><span>${rec?.applied?.length ? `Aplicada${rec.applied.length > 1 ? 's' : ''}: ${rec.applied.map(fmtDate).join(', ')}` : 'Sem registro de aplicação no app'} · ${esc(st.label)}</span></li>`).join('')
        : '<li><strong>Sem vacinas cadastradas para esta espécie</strong><span>Leve os documentos de saúde disponíveis ao veterinário.</span></li>';
      openSheet(`
        <h3>Ficha para consulta veterinária</h3>
        <p class="muted">Os dados abaixo vêm do perfil e da carteira de ${esc(p.name)}. Confira e complete o motivo antes de compartilhar.</p>
        <section class="vet-ficha-summary">
          <h4>Dados do pet</h4>
          <div class="vet-ficha-facts"><span><small>Nome</small><strong>${esc(p.name)}</strong></span><span><small>Espécie / raça</small><strong>${esc(spOf(p).label)} · ${esc(p.breed || 'Não informada')}</strong></span><span><small>Sexo / idade</small><strong>${esc(p.sex || 'Não informado')} · ${ageText(p)}</strong></span><span><small>Peso</small><strong>${weightText(p)}</strong></span><span><small>Tutor</small><strong>${esc(S.profile.name || 'Não informado')}</strong></span><span><small>Contato</small><strong>${esc(S.profile.phone || 'Não informado')}</strong></span><span><small>Microchip / registro</small><strong>${esc(p.chip || '—')} / ${esc(p.registration || '—')}</strong></span></div>
          <details class="vet-vaccine-details"><summary>Vacinas no CuidaPet · ${records.length} no calendário</summary><ul class="vet-vaccine-list">${vaccineRows}</ul><p class="muted-sm">“Sem registro” significa que a aplicação não está anotada no app; confirme o histórico com o tutor e os documentos veterinários.</p></details>
        </section>
        <form data-form="vet-ficha">
          ${field('Motivo da consulta', '<textarea name="reason" rows="2" maxlength="300" placeholder="Ex.: coceira há três dias, retorno ou avaliação de rotina" required></textarea>')}
          ${field('Sintomas e observações (opcional)', '<textarea name="notes" rows="3" maxlength="700" placeholder="Quando começou, frequência, mudanças recentes e outras informações úteis"></textarea>')}
          <div class="vet-ficha-actions"><button class="btn" type="button" data-act="sendVetFicha">${icon('phone', 18)} Enviar ficha PDF pelo WhatsApp</button><button class="btn ghost" type="button" data-act="printVetFicha">${icon('file', 18)} Imprimir / salvar em PDF</button></div>
        </form>`);
    },
    sendVetFicha() { shareVetFicha('whatsapp'); },
    printVetFicha() { printVetFicha(); },
    chat() { toast('Um veterinário vai responder em instantes'); },
    lostPet(id) {
      const p = petById(id);
      if (!p) return;
      openSheet(`
        <h3>${p.lost?.active ? 'Atualizar alerta de desaparecimento' : `${esc(p.name)} se perdeu?`}</h3>
        <p class="muted">Informe onde foi visto e como entrar em contato. O CPF do tutor não entra no aviso.</p>
        <div class="lost-sheet-pet">${p.photo ? `<img src="${esc(p.photo)}" alt="Foto de ${esc(p.name)}">` : `<img src="${petImg(p)}" alt="Mascote de ${esc(p.name)}">`}<span><strong>${esc(p.name)}</strong><small>${esc(spOf(p).label)} · ${esc(p.breed || 'Tipo não informado')}</small></span></div>
        <form data-form="lost" data-pet="${p.id}">
          ${field('Local onde foi visto', `<input name="lastSeen" maxlength="160" value="${esc(p.lost?.lastSeen || '')}" placeholder="Rua, bairro ou ponto de referência" required>`)}
          ${field('Data e horário aproximados', `<input name="when" type="datetime-local" value="${esc(p.lost?.when || localDateTimeValue())}" max="${localDateTimeValue()}" required>`)}
          ${field('Cidade – UF', `<input name="city" maxlength="100" value="${esc(p.lost?.city || S.profile.city || '')}" placeholder="Ex.: São Paulo – SP" required>`)}
          ${field('Telefone para contato', `<input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="24" value="${esc(p.lost?.phone || S.profile.phone || '')}" placeholder="(11) 99999-9999" required>`)}
          ${field('Detalhes para ajudar a reconhecer (opcional)', `<textarea name="details" maxlength="500" rows="3" placeholder="Coleira, marcas e comportamento. Não inclua endereço residencial.">${esc(p.lost?.details || '')}</textarea>`)}
          <p class="lost-privacy-note">O alerta ficará salvo neste navegador. Nada será publicado sozinho: você revisa e escolhe onde compartilhar.</p>
          <button class="btn" type="submit">${p.lost?.active ? 'Salvar alterações do alerta' : 'Ativar alerta neste aparelho'}</button>
          <button class="btn ghost" type="button" data-act="closeSheet">Cancelar</button>
        </form>`);
    },
    async shareLost(id) {
      const p = petById(id);
      if (!p?.lost?.active) return;
      const text = lostMessage(p);
      try {
        if (navigator.share) {
          let file;
          const match = /^data:([^;,]+);base64,([\s\S]+)$/.exec(p.photo || '');
          if (match && typeof File === 'function') {
            const binary = atob(match[2]);
            const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
            file = new File([bytes], `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-foto.png`, { type: match[1] });
          }
          const files = file && navigator.canShare?.({ files: [file] }) ? [file] : undefined;
          await navigator.share({ title: `Pet perdido: ${p.name}`, text, ...(files ? { files } : {}) });
          return;
        }
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          toast('Texto do alerta copiado. Agora escolha onde compartilhar.');
          return;
        }
      } catch (error) {
        if (error?.name === 'AbortError') return;
        console.warn('Não foi possível abrir o compartilhamento nativo', error);
      }
      openSheet(`<h3>Texto do alerta</h3><p class="muted">Selecione e copie o aviso para compartilhar.</p><textarea class="lost-copy-text" readonly rows="10">${esc(text)}</textarea><button class="btn" data-act="closeSheet">Concluir</button>`);
    },
    whatsappLost(id) {
      const p = petById(id);
      if (!p?.lost?.active) return;
      window.open(`https://wa.me/?text=${encodeURIComponent(lostMessage(p))}`, '_blank', 'noopener,noreferrer');
    },
    markFound(id) {
      const p = petById(id);
      if (!p?.lost?.active) return;
      openSheet(`<h3>${esc(p.name)} foi encontrado?</h3><p class="muted">Isso vai encerrar o alerta salvo neste aparelho.</p><div class="list"><button class="btn" data-act="confirmFound" data-arg="${p.id}">Sim, encerrar alerta</button><button class="btn ghost" data-act="closeSheet">Continuar procurando</button></div>`);
    },
    confirmFound(id) {
      const p = petById(id);
      if (!p?.lost) return;
      p.lost.active = false;
      p.lost.foundAt = new Date().toISOString();
      save();
      closeSheet();
      render(true);
      toast(`${p.name} foi marcado como encontrado`);
    },
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
        <div class="list"><button class="btn" data-go="#/carrinho">Ver carrinho (${cartCount()})</button><button class="btn ghost" data-act="closeSheet">Continuar comprando</button></div>`, { dismissOnBackdrop: false });
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
    reviewProduct(arg) {
      const [orderIndex, itemIndex] = arg.split(':').map(Number);
      const item = S.orders[orderIndex]?.products?.[itemIndex];
      const bought = item && product(item.id);
      if (!item || !bought || item.review) return;
      openSheet(`
        <h3>Avaliar produto</h3>
        <p class="muted">${bought.name} · comprado no pedido #${S.orders[orderIndex].n}</p>
        <form data-form="review" data-order="${orderIndex}" data-item="${itemIndex}">
          ${field('Sua nota', `<select name="rating" required><option value="">Escolha de 1 a 5 estrelas</option><option value="5">★★★★★ · Adorei</option><option value="4">★★★★☆ · Gostei</option><option value="3">★★★☆☆ · Foi bom</option><option value="2">★★☆☆☆ · Não gostei</option><option value="1">★☆☆☆☆ · Não recomendo</option></select>`)}
          ${field('Comentário (opcional)', '<textarea name="comment" maxlength="500" rows="3" placeholder="Conte sua experiência com o produto"></textarea>')}
          <button class="btn" type="submit">Enviar avaliação</button>
        </form>`);
    },
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
      const order = { n: String(Math.floor(10000 + Math.random() * 89999)), date: iso(0), total: t.total, items: cartCount(), products: S.cart.map((item) => ({ id: item.id, size: item.size, qty: item.qty, review: null })) };
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
    // arg: "chave" ou "chave|data prevista" (sugere a data da dose, se já passou)
    openApply(arg) {
      const [key, due] = arg.split('|');
      const v = vaccinesFor(pet()).find((x) => x.key === key);
      const date = due && due < iso(0) ? due : iso(0);
      openSheet(`
        <h3>Marcar como tomada</h3>
        <p class="muted">${v.name} · ${esc(pet().name)}. O app recalcula as próximas doses: ${protocolText(v).toLowerCase()}.</p>
        <form data-form="apply" data-key="${key}">
          ${field('Data da aplicação', `<input type="date" name="date" value="${date}" max="${iso(0)}" required>`)}
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
    ahead(d) { S.settings.antecedencia = Number(d); save(); renderTabChange(); },
    exportBackup() {
      try {
        const backup = { app: 'CuidaPet', version: STATE_VERSION, exportedAt: new Date().toISOString(), state: S };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cuidapet-backup-${iso(0)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast('Backup baixado neste aparelho');
      } catch (e) {
        toast('Não foi possível criar o backup neste navegador');
      }
    },
    importBackup() { $('#backupImportInput')?.click(); },
    confirmImportBackup() {
      if (!ui.pendingBackup) return;
      S = clone(ui.pendingBackup.state);
      if (!S.pets.some((p) => p.id === S.active)) S.active = S.pets[0]?.id || null;
      ui.pendingBackup = null;
      ui.query = '';
      ui.booking = null;
      save();
      closeSheet();
      render();
      toast('Backup restaurado neste aparelho');
    },
    askWipe() {
      openSheet(`
        <h3>Começar do zero?</h3>
        <p class="muted">Os pets de exemplo, lembretes, consultas e pedidos saem deste navegador. Dá para voltar ao exemplo quando quiser em “Restaurar perfil de exemplo”.</p>
        <div class="list"><button class="btn danger" data-act="wipe">Começar do zero</button><button class="btn ghost" data-act="closeSheet">Cancelar</button></div>`);
    },
    wipe() {
      closeSheet();
      S = fresh(false);
      save();
      ui.query = '';
      navStack = [];
      replace('#/home');
      render();
    },
    reset() {
      closeSheet();
      S = fresh(true);
      save();
      ui.query = '';
      navStack = [];
      replace('#/home');
      render();
      toast('Perfil de exemplo restaurado');
    },
  };

  /* ------------------------------------------------------------ Formulários */
  const fmtCep = (v) => v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
  const fmtCpf = (v) => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  const vetFichaData = () => {
    const p = pet();
    const form = $('[data-form="vet-ficha"]');
    const vaccines = petVaccines(p).filter(({ v }) => v.kind === 'vacina').map(({ v, rec, st }) => ({
      name: v.name,
      applied: rec?.applied?.length ? rec.applied.map(fmtDate).join(', ') : 'Sem registro de aplicação no CuidaPet',
      status: st.label,
    }));
    return {
      p, reason: form?.elements.reason.value.trim() || '', notes: form?.elements.notes.value.trim() || '', vaccines,
      tutor: S.profile.name || 'Não informado', phone: S.profile.phone || 'Não informado',
    };
  };
  const vetFichaLines = (data) => [
    'CuidaPet · Ficha para consulta veterinária',
    `Emitida em: ${new Date().toLocaleDateString('pt-BR')}`,
    '', 'DADOS DO PET',
    `Nome: ${data.p.name}`, `Espécie: ${spOf(data.p).label}`, `Raça / tipo: ${data.p.breed || 'Não informada'}`,
    `Sexo: ${data.p.sex || 'Não informado'}`, `Idade: ${ageText(data.p)}`, `Nascimento: ${data.p.birth ? fmtDate(data.p.birth) : 'Não informado'}`,
    `Peso: ${weightText(data.p)}`, `Microchip: ${data.p.chip || 'Não informado'}`, `Registro: ${data.p.registration || 'Não informado'}`,
    '', 'DADOS DO TUTOR', `Nome: ${data.tutor}`, `Telefone: ${data.phone}`,
    '', 'MOTIVO DA CONSULTA', data.reason,
    ...(data.notes ? ['', 'SINTOMAS E OBSERVAÇÕES', data.notes] : []),
    '', 'VACINAS REGISTRADAS NO CUIDAPET',
    ...(data.vaccines.length ? data.vaccines.flatMap((v) => [`${v.name} — ${v.applied}`, `Situação na carteira: ${v.status}`]) : ['Nenhuma vacina cadastrada para esta espécie.']),
    '', 'Atenção: “Sem registro” indica ausência de anotação no app e não confirma que a vacina não foi aplicada. Confira a carteira e os comprovantes com o tutor.',
  ];
  const wrapFichaLines = (lines, max = 88) => lines.flatMap((line) => {
    const result = [];
    let current = '';
    line.split(/\s+/).forEach((word) => {
      if (current && `${current} ${word}`.length > max) { result.push(current); current = word; }
      else current = current ? `${current} ${word}` : word;
    });
    result.push(current);
    return result;
  });
  const winAnsiChar = (char) => {
    const cp = char.codePointAt(0);
    const special = { 0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f };
    return String.fromCharCode(special[cp] || (cp <= 0xff ? cp : 0x3f));
  };
  const makeVetFichaPdf = (data) => {
    const lines = wrapFichaLines(vetFichaLines(data));
    const pages = Array.from({ length: Math.ceil(lines.length / 48) }, (_, i) => lines.slice(i * 48, (i + 1) * 48));
    const objects = [];
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${4 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`;
    objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    pages.forEach((pageLines, i) => {
      const pageId = 4 + i * 2;
      const streamId = pageId + 1;
      const content = `BT\n/F1 10 Tf\n14 TL\n52 790 Td\n${pageLines.map((line) => `(${[...line].map(winAnsiChar).join('').replace(/[\\()]/g, '\\$&')}) Tj T*`).join('\n')}\nET`;
      objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamId} 0 R >>`;
      objects[streamId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    });
    let pdf = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
    const offsets = [0];
    for (let id = 1; id < objects.length; id++) {
      offsets[id] = pdf.length;
      pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objects.length; id++) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = Uint8Array.from(pdf, (char) => char.charCodeAt(0));
    return new Blob([bytes], { type: 'application/pdf' });
  };
  const fichaFileName = (p) => `ficha-veterinaria-${p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}.pdf`;
  const downloadVetFicha = (data) => {
    const url = URL.createObjectURL(makeVetFichaPdf(data));
    const link = document.createElement('a');
    link.href = url;
    link.download = fichaFileName(data.p);
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };
  const shareVetFicha = async () => {
    const data = vetFichaData();
    const form = $('[data-form="vet-ficha"]');
    if (!data.reason) { form.elements.reason.reportValidity(); return; }
    const file = new File([makeVetFichaPdf(data)], fichaFileName(data.p), { type: 'application/pdf' });
    const message = `Ficha veterinária de ${data.p.name} · motivo: ${data.reason}`;
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `Ficha de ${data.p.name}`, text: message });
        closeSheet();
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    downloadVetFicha(data);
    window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\nO PDF da ficha foi baixado. Anexe-o nesta conversa.`)}`, '_blank', 'noopener,noreferrer');
    closeSheet();
    toast('Ficha PDF baixada. Anexe o arquivo no WhatsApp.');
  };
  const printVetFicha = () => {
    const data = vetFichaData();
    const form = $('[data-form="vet-ficha"]');
    if (!data.reason) { form.elements.reason.reportValidity(); return; }
    const lines = vetFichaLines(data).map((line) => `<p>${esc(line) || '&nbsp;'}</p>`).join('');
    const w = window.open('', '_blank');
    if (!w) { downloadVetFicha(data); toast('Janela de impressão bloqueada. A ficha PDF foi baixada.'); return; }
    w.document.write(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Ficha veterinária · ${esc(data.p.name)}</title><style>body{font:12pt/1.45 Arial,sans-serif;color:#172033;max-width:780px;margin:32px auto;padding:0 28px}h1{color:#075985;font-size:20pt;margin-bottom:22px}p{margin:0 0 5px;white-space:pre-wrap}p:empty{height:9px}@media print{body{margin:12mm auto;padding:0}}</style><h1>CuidaPet · Ficha para consulta veterinária</h1>${lines}<script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></html>`);
    w.document.close();
  };
  const validCpf = (value) => {
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    const digit = (length) => {
      const sum = cpf.slice(0, length).split('').reduce((total, n, i) => total + Number(n) * (length + 1 - i), 0);
      const result = (sum * 10) % 11;
      return result === 10 ? 0 : result;
    };
    return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
  };

  const F = {
    review(form) {
      const order = S.orders[Number(form.dataset.order)];
      const item = order?.products?.[Number(form.dataset.item)];
      if (!item || item.review) { closeSheet(); return; }
      const rating = Number(form.elements.rating.value);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) { toast('Escolha uma nota de 1 a 5 estrelas'); return; }
      item.review = { rating, comment: form.elements.comment.value.trim().slice(0, 500), date: iso(0) };
      save();
      closeSheet();
      render(true);
      toast('Avaliação salva neste aparelho');
    },
    lost(form) {
      const p = petById(form.dataset.pet);
      if (!p) { closeSheet(); return; }
      const e = form.elements;
      const lastSeen = e.lastSeen.value.trim();
      const city = e.city.value.trim();
      const phone = e.phone.value.trim();
      if (!lastSeen || !city || !phone || !e.when.value) { toast('Informe local, horário, cidade e telefone para ativar o alerta'); return; }
      if (e.when.value > localDateTimeValue()) { toast('A data do desaparecimento não pode estar no futuro'); return; }
      p.lost = { active: true, lastSeen: lastSeen.slice(0, 160), when: e.when.value, city: city.slice(0, 100), phone: phone.slice(0, 24), details: e.details.value.trim().slice(0, 500), updatedAt: new Date().toISOString() };
      save();
      closeSheet();
      render(true);
      toast('Alerta pronto. Escolha onde compartilhar.');
    },
    pet(form) {
      const np = ui.newPet;
      if (!np.name.trim()) {
        $('#nameField').classList.add('error');
        $('#nameField input').focus();
        toast('Como seu pet se chama?');
        return;
      }
      const birthInput = form.querySelector('[data-model="birth"]');
      const birthError = petBirthError(np.birth, np.species, birthInput?.validity.badInput || np._birthInputInvalid);
      setInlineFieldError(birthInput, birthError);
      if (birthError) { birthInput?.focus(); return; }
      const weightValue = String(np.weight ?? '').trim();
      const weightInput = form.querySelector('[data-model="weight"]');
      const weightError = petWeightError(weightValue);
      setInlineFieldError(weightInput, weightError);
      if (weightError) { weightInput?.focus(); return; }
      const dogSize = np.species === 'cachorro' ? C.dogBreedSize(np.breed) : null;
      if (np.species === 'cachorro' && !dogSize && !['Pequeno', 'Médio', 'Grande'].includes(np.sizeClass)) {
        form.querySelector('[data-model="sizeClass"]')?.focus();
        toast('Escolha o porte do cachorro');
        return;
      }
      const data = {
        name: np.name.trim(),
        species: np.species,
        sex: np.sex,
        breed: np.breed || species[np.species].breeds[0],
        ...(np.species === 'cachorro' ? { sizeClass: dogSize || np.sizeClass } : {}),
        birth: np.birth,
        weight: weightValue ? Number(weightValue) : null,
        neutered: !!np.neutered,
        chip: formatMicrochip(np.chip),
        registration: (np.registration || '').trim(),
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
      ui.newPet = null;
      ui.spQuery = '';
      navStack = [];
      ui.petTab = 'carteira';
      replace(`#/pet/${id}`);
      const total = vaccinesFor(data).length;
      setTimeout(() => openSheet(`
        <div class="success"><img src="${C.breedImg(data.species, data.breed, data.sex)}" alt=""><h3>${esc(data.name)} entrou na família!</h3>
        <p class="muted">A carteira já veio pronta com ${total} ${total === 1 ? 'item' : 'itens'} para ${species[data.species].plural.toLowerCase()}${data.birth ? ', com as datas calculadas pela idade' : '. Informe o nascimento para calcular as datas'}. É só marcar o que ${data.sex === 'Fêmea' ? 'ela' : 'ele'} já tomou.</p></div>
        <div class="list"><button class="btn" data-act="closeSheet">Ver carteira de ${esc(data.name)}</button><button class="btn ghost" data-act="newPet">${icon('plus', 18)} Adicionar outro pet</button></div>`), 250);
    },
    apply(form) {
      const key = form.dataset.key;
      const date = form.elements.date.value;
      if (!validDate(date) || date > iso(0)) { toast('Informe uma data de aplicação válida, até hoje'); return; }
      const p = pet();
      const v = vaccinesFor(p).find((x) => x.key === key);
      const rec = p.records[key] || (p.records[key] = { applied: [] });
      if (!rec.applied.includes(date)) rec.applied.push(date);
      rec.applied.sort();
      rec.place = form.elements.place.value.trim() || rec.place;
      save();
      closeSheet();
      render(true);
      const info = vInfo(p, v);
      toast(info.pending && info.next
        ? `Registrado · ${info.pending.booster ? 'próximo reforço' : `${info.pending.n}ª dose`} em ${fmtDate(info.next)}`
        : 'Registrado · esquema completo');
    },
    reminder(form) {
      const type = form.elements.type.value;
      const date = form.elements.date.value;
      if (!validDate(date) || date < iso(0)) { toast('Escolha uma data válida a partir de hoje'); return; }
      S.reminders.push({
        id: 'r' + Date.now().toString(36),
        petId: pet().id,
        type,
        title: form.elements.title.value.trim() || reminderTypes[type].label,
        date,
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
      if (e.cpf.value.trim() && !validCpf(e.cpf.value)) {
        e.cpf.setCustomValidity('Informe um CPF válido para o tutor.');
        e.cpf.reportValidity();
        e.cpf.focus();
        return;
      }
      e.cpf.setCustomValidity('');
      Object.assign(S.profile, { name: e.name.value.trim() || S.profile.name, cpf: e.cpf.value.replace(/\D/g, '').slice(0, 11), email: e.email.value.trim() || S.profile.email, phone: e.phone.value.trim(), cep: fmtCep(e.cep.value), city: e.city.value.trim() });
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
  const SELECT_ACTIONS = new Set(['ahead', 'bk', 'fav', 'pickAddr', 'pickDelivery', 'pickPay', 'pickSex', 'pickSpecies', 'setPet', 'size']);
  const NOOP_IF_SELECTED_ACTIONS = new Set(['ahead', 'bk', 'pickAddr', 'pickDelivery', 'pickPay', 'pickSex', 'pickSpecies', 'setPet', 'size', 'petTab', 'vacTab', 'remTab', 'agTab']);
  const animateChoice = (action, arg) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || typeof Element.prototype.animate !== 'function') return;
    requestAnimationFrame(() => {
      const matching = [...device.querySelectorAll('[data-act]')].filter((node) => node.dataset.act === action && node.dataset.arg === arg);
      const selected = matching.find((node) => node.classList.contains('on')
        || node.getAttribute('aria-checked') === 'true'
        || node.querySelector('.radio.on'));
      if (!selected) return;
      selected.animate([
        { transform: 'scale(0.975)', boxShadow: '0 0 0 0 rgba(56, 189, 248, 0)' },
        { transform: 'scale(1.018)', boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.2)', offset: 0.58 },
        { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(56, 189, 248, 0)' },
      ], { duration: 300, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    });
  };
  device.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act],[data-go],[data-tab],[data-back],[data-replace]');
    if (!t || !device.contains(t)) return;
    if (t.dataset.act) {
      // Botões dentro de cartões clicáveis não abrem o cartão.
      e.stopPropagation();
      if (t.tagName === 'BUTTON' || t.getAttribute('role') === 'button') e.preventDefault();
      if (t.type === 'checkbox') { /* deixa o checkbox alternar */ }
      const action = t.dataset.act;
      const arg = t.dataset.arg || '';
      const wasSelected = t.classList.contains('on') || t.getAttribute('aria-checked') === 'true' || t.getAttribute('aria-pressed') === 'true' || t.getAttribute('aria-selected') === 'true' || !!t.querySelector('.radio.on');
      if (NOOP_IF_SELECTED_ACTIONS.has(action) && wasSelected) return;
      const fn = A[action];
      if (fn) fn(arg, t, e);
      if (fn && SELECT_ACTIONS.has(action) && !wasSelected) animateChoice(action, arg);
      return;
    }
    if (t.dataset.tab) { go(t.dataset.tab); return; }
    if (t.hasAttribute('data-back')) { back(); return; }
    if (t.dataset.replace) { replace(t.dataset.replace); return; }
    if (t.dataset.go) {
      if (t.dataset.pettab) ui.petTab = t.dataset.pettab;
      else if (t.dataset.go.startsWith('#/pet/')) ui.petTab = 'carteira';
      closeSheet();
      go(t.dataset.go);
    }
  });

  document.addEventListener('click', (e) => {
    if (!ui.birthCalendarOpen || e.target.closest('.birth-field')) return;
    ui.birthCalendarOpen = false;
    screen.querySelector('.birth-calendar')?.remove();
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
    if (el.dataset.photoCrop && ui.photoCrop) {
      const key = el.dataset.photoCrop;
      ui.photoCrop[key] = Number(el.value);
      const output = sheet.querySelector(`[data-crop-value="${key}"]`);
      if (output) output.textContent = key === 'zoom'
        ? `${Math.round(Number(el.value) * 100)}%`
        : Number(el.value) === 0 ? 'Centro'
          : key === 'x' ? Number(el.value) < 0 ? 'Mais à esquerda' : 'Mais à direita'
            : Number(el.value) < 0 ? 'Mais acima' : 'Mais abaixo';
      updatePhotoCropPreview();
      return;
    }
    if (el.dataset.model && ui.newPet) {
      if (el.dataset.model === 'breed') return;
      if (el.dataset.model === 'birth') {
        const typed = el.value;
        const parsed = birthTextToISO(typed);
        ui.newPet._birthText = typed;
        ui.newPet.birth = parsed;
        ui.newPet._birthInputInvalid = !!typed && !parsed;
        const error = petBirthError(parsed, ui.newPet.species, ui.newPet._birthInputInvalid);
        setInlineFieldError(el, error);
      } else {
        ui.newPet[el.dataset.model] = el.value;
        if (el.dataset.model === 'chip') {
          const formatted = formatMicrochip(el.value);
          if (el.value !== formatted) el.value = formatted;
          ui.newPet.chip = formatted;
        }
      }
      if (el.dataset.model === 'weight') setInlineFieldError(el, petWeightError(el.value));
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
    if (el.name === 'cpf') { el.setCustomValidity(''); el.value = fmtCpf(el.value); }
    if (el.name === 'cep' || el.name === 'number' || el.name === 'exp') {
      if (el.name === 'cep') el.value = fmtCep(el.value);
      if (el.name === 'number') el.value = el.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
      if (el.name === 'exp') el.value = el.value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2');
    }
  });

  device.addEventListener('change', (e) => {
    const el = e.target;
    if (el.id === 'backupImportInput' && el.files?.[0]) {
      const file = el.files[0];
      el.value = '';
      if (file.size > 50 * 1024 * 1024) { toast('O arquivo de backup é grande demais'); return; }
      file.text().then((contents) => {
        const backup = JSON.parse(contents);
        const state = backup?.state;
        const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
        const arraysOk = ['pets', 'reminders', 'appointments', 'addresses', 'payments', 'cart', 'favs', 'orders'].every((key) => Array.isArray(state?.[key]));
        const petsOk = Array.isArray(state?.pets) && state.pets.every((p) => isObject(p) && typeof p.id === 'string' && typeof p.name === 'string' && species[p.species] && isObject(p.records || {}));
        if (backup.app !== 'CuidaPet' || backup.version !== STATE_VERSION || state?.version !== STATE_VERSION || !isObject(state.profile) || !isObject(state.settings) || !isObject(state.checkout) || !arraysOk || !petsOk) {
          throw new Error('invalid-backup');
        }
        const restored = clone(state);
        let invalidBirths = 0;
        let invalidWeights = 0;
        restored.pets.forEach((p) => {
          if (p.birth && !validPetBirth(p.birth, p.species)) { p.birth = ''; invalidBirths++; }
          if (p.weight != null && p.weight !== '' && (!Number.isFinite(Number(p.weight)) || Number(p.weight) <= 0)) { p.weight = null; invalidWeights++; }
          else if (p.weight != null && p.weight !== '') p.weight = Number(p.weight);
        });
        ui.pendingBackup = { state: restored, invalidBirths, invalidWeights };
        openSheet(`
          <h3>Restaurar backup?</h3>
          <p class="muted">Esta cópia contém o perfil de ${esc(restored.profile.name || 'Tutor')} e ${restored.pets.length} ${restored.pets.length === 1 ? 'pet' : 'pets'}. Ao confirmar, os dados atuais deste aparelho serão substituídos.</p>
          ${invalidBirths ? `<p class="muted">${invalidBirths} ${invalidBirths === 1 ? 'data de nascimento inválida foi removida' : 'datas de nascimento inválidas foram removidas'} para evitar idades impossíveis.</p>` : ''}
          ${invalidWeights ? `<p class="muted">${invalidWeights} ${invalidWeights === 1 ? 'peso inválido foi removido' : 'pesos inválidos foram removidos'} para evitar valores impossíveis.</p>` : ''}
          <p class="muted-sm">O arquivo é lido neste navegador e não é enviado a um servidor.</p>
          <div class="list"><button class="btn" data-act="confirmImportBackup">Substituir e restaurar</button><button class="btn ghost" data-act="closeSheet">Cancelar</button></div>`);
      }).catch(() => toast('Esse arquivo não é um backup CuidaPet compatível'));
      return;
    }
    if (el.dataset.model && ui.newPet) {
      const previousBreed = ui.newPet.breed;
      if (el.dataset.model === 'breed') {
        ui.newPet[el.dataset.model] = el.value;
        if (ui.newPet.species === 'cachorro') ui.newPet.sizeClass = C.dogBreedSize(el.value) || (C.dogBreedSize(previousBreed) ? '' : ui.newPet.sizeClass);
        render(true);
      }
      if (el.dataset.model === 'birth') {
        const parsed = birthTextToISO(el.value);
        ui.newPet._birthText = el.value;
        ui.newPet.birth = parsed;
        ui.newPet._birthInputInvalid = !!el.value && !parsed;
        const error = petBirthError(parsed, ui.newPet.species, ui.newPet._birthInputInvalid);
        setInlineFieldError(el, error);
        if (!error) render(true);
      }
      if (el.dataset.model === 'weight') { ui.newPet.weight = el.value; setInlineFieldError(el, petWeightError(el.value)); }
    }
    if (el.dataset.modelCheck && ui.newPet) ui.newPet[el.dataset.modelCheck] = el.checked;
    if (el.dataset.bk === 'date' && ui.booking && el.value) {
      if (!validDate(el.value) || el.value < iso(1) || el.value > iso(90)) { toast('Escolha uma data entre amanhã e os próximos 90 dias'); render(true); return; }
      ui.booking.date = el.value;
      ui.booking.time = null;
      render(true);
    }
    if (el.dataset.setting) { S.settings[el.dataset.setting] = el.checked; save(); toast(el.checked ? 'Notificação ativada' : 'Notificação desativada'); }
    if ((el.hasAttribute('data-photo') || el.hasAttribute('data-photo-user')) && el.files && el.files[0]) {
      const target = el.hasAttribute('data-photo-user') ? 'user' : 'pet';
      const file = el.files[0];
      el.value = '';
      if (!file.type.startsWith('image/')) { toast('Escolha um arquivo de imagem'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => openPhotoCrop(reader.result, img, target);
        img.onerror = () => toast('Não foi possível abrir essa imagem');
        img.src = reader.result;
      };
      reader.onerror = () => toast('Não foi possível ler essa imagem');
      reader.readAsDataURL(file);
    }
  });

  backdrop.addEventListener('click', () => { if (sheetDismissOnBackdrop) closeSheet(); });
  sheet.addEventListener('pointerdown', (e) => {
    const preview = e.target.closest('[data-crop-preview]');
    if (!preview || !ui.photoCrop) return;
    e.preventDefault();
    photoCropDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, cropX: ui.photoCrop.x, cropY: ui.photoCrop.y };
    preview.setPointerCapture(e.pointerId);
  });
  sheet.addEventListener('pointermove', (e) => {
    if (!photoCropDrag || photoCropDrag.id !== e.pointerId || !ui.photoCrop) return;
    const preview = sheet.querySelector('[data-crop-preview]');
    const box = preview?.getBoundingClientRect();
    if (!box) return;
    const scale = Math.max(box.width / ui.photoCrop.image.naturalWidth, box.height / ui.photoCrop.image.naturalHeight) * ui.photoCrop.zoom;
    const width = ui.photoCrop.image.naturalWidth * scale;
    const height = ui.photoCrop.image.naturalHeight * scale;
    if (width > box.width + 1) ui.photoCrop.x = Math.max(-100, Math.min(100, photoCropDrag.cropX + (e.clientX - photoCropDrag.x) / (width - box.width) * 200));
    if (height > box.height + 1) ui.photoCrop.y = Math.max(-100, Math.min(100, photoCropDrag.cropY + (e.clientY - photoCropDrag.y) / (height - box.height) * 200));
    ['x', 'y'].forEach((key) => {
      const input = sheet.querySelector(`[data-photo-crop="${key}"]`);
      if (!input) return;
      input.value = String(Math.round(ui.photoCrop[key]));
      const output = sheet.querySelector(`[data-crop-value="${key}"]`);
      if (output) output.textContent = ui.photoCrop[key] === 0 ? 'Centro'
        : key === 'x' ? ui.photoCrop[key] < 0 ? 'Mais à esquerda' : 'Mais à direita'
          : ui.photoCrop[key] < 0 ? 'Mais acima' : 'Mais abaixo';
    });
    updatePhotoCropPreview();
  });
  const endPhotoCropDrag = (e) => { if (photoCropDrag?.id === e.pointerId) photoCropDrag = null; };
  sheet.addEventListener('pointerup', endPhotoCropDrag);
  sheet.addEventListener('pointercancel', endPhotoCropDrag);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ui.birthCalendarOpen) {
      ui.birthCalendarOpen = false;
      screen.querySelector('.birth-calendar')?.remove();
    }
    if (e.key === 'Escape' && sheet.classList.contains('open')) closeSheet();
  });

  /* ------------------------------------------------------------ Início */
  // Abre direto no perfil base: carrega a base de vacinas (como uma API) e o que este navegador já salvou.
  const start = async () => {
    const splashStartedAt = performance.now();
    render();
    try {
      await C.loadVaccines();
    } catch (e) {
      console.error(e);
      bootError = e.message;
      booting = false;
      render();
      return;
    }
    const saved = Store.load();
    S = saved && saved.version === STATE_VERSION ? saved : fresh(true);
    S.profile = S.profile || fresh(false).profile;
    S.profile.cpf = S.profile.cpf || '';
    let repairedWeights = 0;
    S.pets.forEach((p) => {
      p.chip = formatMicrochip(p.chip);
      if (p.weight == null || p.weight === '') return;
      const weight = Number(p.weight);
      if (!Number.isFinite(weight) || weight <= 0) { p.weight = null; repairedWeights++; }
      else p.weight = weight;
    });
    if (!S.pets.some((p) => p.id === S.active)) S.active = S.pets[0] ? S.pets[0].id : null;
    save();
    const splashRemaining = 1000 - (performance.now() - splashStartedAt);
    if (splashRemaining > 0) await new Promise((resolve) => setTimeout(resolve, splashRemaining));
    booting = false;
    render();
    if (repairedWeights) toast(`${repairedWeights} peso${repairedWeights === 1 ? '' : 's'} inválido${repairedWeights === 1 ? '' : 's'} removido${repairedWeights === 1 ? '' : 's'}. Informe o valor correto.`);
  };
  start();
  // App instalável (PWA)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
