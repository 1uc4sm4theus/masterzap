/**
 * The Payments screen: transfers recorded in the material, including parties
 * that do not have a conversation in the viewer.
 */

const ICON_PAYMENT = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/></svg>`;
const ICON_TRANSFER = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/></svg>`;
const ICON_INTERNATIONAL = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>`;

export const PAYMENTS = [
  ['Banco Master', 'Barci de Moraes Sociedade de Advogados', '08/02/2024', 'R$ 3.422.268,14'],
  ['Banco Master', 'Barci de Moraes Sociedade de Advogados', 'Jul/2025', 'R$ 3.422.268,14'],
  ['Banco Master', 'Barci de Moraes Sociedade de Advogados', '01/10/2025', 'R$ 3.422.268,14'],
  ['Banco Master', 'Barci de Moraes Sociedade de Advogados', 'Fev/2024 – Out/2025', '4 comprovantes = R$ 13,6 milhões'],
  ['Banco Master (via fundos)', 'Empresas ligadas a familiares/sócios de Vorcaro', '2017–2025', '~R$ 1,8 bilhão'],
  ['Banco Master / fundos', 'Henrique Moura Vorcaro (pai)', 'Identificado em 2026', 'Saldo > R$ 2,2 bilhões'],
  ['Empresas/grupo Vorcaro (Multipar etc.)', 'Henrique Moura Vorcaro', '2020–2025', '~R$ 14,7 milhões'],
  ['Empresas/grupo Vorcaro (Multipar etc.)', 'Natália Vorcaro Zettel (irmã)', '2020–2025', '~R$ 6,4 milhões'],
  ['Empresas/grupo Vorcaro (Multipar etc.)', 'Aline Vorcaro (mãe)', '2020–2025', '~R$ 20,9 milhões'],
  ['Empresas/grupo Vorcaro', 'Milo Investimentos', 'Período anterior a 2026', '~R$ 64 milhões'],
  ['Empresas/grupo Vorcaro', 'Mercatto Incorporações', '< 8 meses', '> R$ 15 milhões'],
  ['Entre Investimentos (via Freixo/Zettel)', 'Havengate Development Fund (EUA)', 'Fev/2025', 'US$ 2 milhões'],
  ['Entre Investimentos (via Freixo/Zettel)', 'Havengate Development Fund (EUA)', '2025 (6 remessas)', '~US$ 1,67 milhão cada'],
  ['Entre Investimentos (via Freixo/Zettel)', 'Havengate Development Fund (EUA)', 'Set/2025', 'Última parcela (total 7 remessas = US$ 12,33 milhões)'],
  ['Master Participações / Banco Master', 'Titan Holding (Ilhas Cayman)', '31/01/2025', 'R$ 85,2 milhões'],
  ['Banco Master', 'Titan Holding (Ilhas Cayman)', '28/02/2025', 'R$ 66,3 milhões'],
  ['Banco Master', 'Fundo Krispy / Titan Holding (Ilhas Cayman)', '02/04/2025', 'R$ 555,8 milhões'],
  ['Royal Capital PSC', 'Conta de Vorcaro no exterior', '09/09 a 18/11/2025', 'US$ 26 milhões'],
  ['Fabiano Zettel (por ordem de Vorcaro)', 'Luiz Phillipi Machado de Moraes Mourão ("Sicário")', '2024–2025', '~R$ 24 milhões'],
  ['Fabiano Zettel', 'Fundo Leal', '28/10/2021', 'R$ 15 milhões'],
  ['Fabiano Zettel', 'Fundo Leal', '03/11/2021', 'R$ 5 milhões'],
  ['Fabiano Zettel', 'Fundo Leal', '08/07/2024', 'R$ 15 milhões'],
  ['Fabiano Zettel', 'Fundo Arleen', '10/02/2025', 'R$ 14.521.851,17'],
  ['Fabiano Zettel', 'Igreja Batista da Lagoinha Belvedere', '24/12/2024 – 08/12/2025', 'R$ 19,205 milhões'],
  // Aniversário no Rosewood (Sra. Yasmin) — orçamento enviado por Thatiane Prime em 29/05/2024; DV autorizou "Pode seguir" em 31/05/2024
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'Rosewood — aniversário (Sra. Yasmin)', 'Até 29/05/2024', 'R$ 690.036,00 (PAGO)'],
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'Decoração — aniversário Rosewood', '29/05/2024 (orçamento)', 'R$ 176.600,00 + 13% NF + R$ 14.000,00 (montagem) ≈ R$ 215.378,00'],
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'Iluminação e vídeo — aniversário Rosewood', '29/05/2024 (orçamento)', 'R$ 195.665,96'],
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'DJ Brunetta — aniversário Rosewood', '29/05/2024 (orçamento)', 'R$ 5.000,00'],
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'Produção Executiva — aniversário Rosewood', '29/05/2024 (orçamento)', 'R$ 65.000,00'],
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'Lembrancinhas — aniversário Rosewood', '29/05/2024 (orçamento)', 'R$ 35.940,00'],
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'Dennis DJ — aniversário Rosewood', '29/05/2024 (orçamento)', 'R$ 450.000,00 cachê + R$ 110.000,00 produção (crédito de evento anterior em Trancoso abatido; restam R$ 20.000,00 a pagar)'],
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'Os Locos — aniversário Rosewood', '29/05/2024 (orçamento)', 'R$ 35.000,00 cachê (som incluído no pacote Rosewood)'],
  ['Daniel Vorcaro (aporte via Thatiane Prime)', 'L7nnon — aniversário Rosewood', '29/05/2024 (orçamento)', 'R$ 250.000,00 cachê + despesas a confirmar (estimativa +R$ 50.000,00)'],
  ['Origem não especificada no resumo', 'Joalheria em São Paulo — 16 pagamentos', '2018–2019', 'R$ 1,7 milhão'],
  ['Origem não especificada no resumo', 'Concessionária de carros esportivos', 'Jun/2020', 'R$ 1,65 milhão'],
  ['Origem não especificada no resumo', 'Empresa de embarcações, Guaratuba/PR', 'Período analisado', 'R$ 1,3 milhão'],
  ['Origem não especificada no resumo', 'Revendedoras de Yves Saint Laurent, Hermès e Ermenegildo Zegna', 'Período analisado', 'R$ 2,2 milhões'],
  ['Origem não especificada no resumo', 'Hermès', '2021–2023', 'R$ 1,3 milhão'],
  ['Origem não especificada no resumo', 'Saint Laurent', 'Período analisado', 'R$ 366 mil'],
  ['Origem não especificada no resumo', 'Bvlgari', 'Período analisado', 'R$ 227 mil'],
  ['Origem não especificada no resumo', 'Bicicletas de alto valor', 'Período analisado', 'R$ 542 mil'],
  ['Origem não especificada no resumo', 'Festa com Alok — Belo Horizonte', '05/08/2023', 'R$ 1,83 milhão'],
  ['Origem não especificada no resumo', 'Festa com DJ Mochakk — Angra dos Reis', '28–29/07/2024', 'R$ 723 mil'],
  ['Origem não especificada no resumo', 'Festa com Goldfish — Angra dos Reis', '28–29/07/2024', 'R$ 380 mil'],
  ['Origem não especificada no resumo', 'Festas e eventos privados — Croácia', 'Ago/2024', 'Mais de R$ 25 milhões'],
  ['Origem não especificada no resumo', 'Eventos privados — Ilhas Baleares, Espanha', 'Verão de 2024', 'Mais de R$ 6,5 milhões'],
  ['Origem não especificada no resumo', 'Eventos privados — Córsega e Sardenha', 'Jun/2024', 'Cerca de R$ 7 milhões'],
  ['Origem não especificada no resumo', 'Eventos privados — Taghazout e Marrakech, Marrocos', 'Nov/2024', 'Mais de R$ 5 milhões'],
  ['Origem não especificada no resumo', 'Eventos de Carnaval — Rio de Janeiro', '02–09/03/2025', 'Cerca de R$ 11,5 milhões'],
  ['Banco Master', 'Lewandowski Advocacia', '', 'R$ 6,1 milhões'],
  ['Banco Master', 'Escritório de Michel Temer', '', 'R$ 10 milhões declarados'],
  ['Banco Master', 'Pollaris Consultoria (Guido Mantega)', '', 'R$ 14 milhões'],
  ['Banco Master', 'Henrique Meirelles', '', 'R$ 18,5 milhões'],
  ['Banco Master', 'WF Comunicação (Fabio Wajngarten)', '', 'R$ 3,8 milhões'],
  ['Banco Master', 'MV Projetos e Consultoria (Marconi Perillo)', '', 'R$ 14,5 milhões'],
  ['Banco Master', 'A&M Consultoria (ACM Neto)', '', 'R$ 5,45 milhões'],
  ['Banco Master', 'Antônio Rueda / escritórios ligados', '', 'R$ 6,4 milhões'],
  ['Banco Master', 'Empresa de Ronaldo Bento', '', 'R$ 6,2 milhões'],
  ['Banco Master', 'Metrópoles (Luiz Estevão)', '', 'R$ 27,2 milhões'],
  ['Banco Master', 'Massa Intermediação (Grupo Massa)', '', 'R$ 21 milhões'],
  ['Banco Master', 'Gralha Azul Empreendimentos', '', 'R$ 3 milhões'],
  ['Banco Master', 'BN Financeira (Bonnie Bonilha)', '', 'R$ 12 milhões a R$ 14,2 milhões'],
  ['Banco Master', 'Leo Dias Comunicação', '', 'R$ 9,9 milhões'],
  ['Banco Master / grupo', 'LD Produções', '', 'R$ 2 milhões'],
  ['Banco Master', 'Gustavo Loyola Consultoria', '', 'R$ 6,7 milhões'],
  ['Banco Master', 'Tendências Consultoria Integrada', '', 'Mais de R$ 430 mil líquidos'],
  ['Banco Master', 'Mirza & Malan Sociedade de Advogados', '', 'R$ 106,5 mil'],
  ['Origem não especificada no resumo', 'Jantar no restaurante Gigi — Paris', 'Abr/2024', 'R$ 10.100'],
  ['Origem não especificada no resumo', 'Suíte Royal do Park Hyatt — Nova York', 'Mai/2024', 'R$ 245.100'],
  ['Origem não especificada no resumo', 'Suíte no Four Seasons — Lisboa', 'Jun/2024', 'R$ 91.200'],
  ['Origem não especificada no resumo', 'Restaurantes La Soucoupe e Le Tremplin — Courchevel', 'Jan/2025', 'R$ 122.100'],
  ['Origem não especificada no resumo', 'Uso de apartamento de Vorcaro — São Paulo', 'Nov/2025', 'Sem aluguel identificado'],
  ['Origem não especificada no resumo', 'Voos em aeronaves particulares de Vorcaro', '2024–2025', 'Valor ainda não individualizado'],
  ['Origem não especificada no resumo', 'Viagem à Itália', '', 'Mais de R$ 6 milhões'],
  ['Origem não especificada no resumo', 'Viagem a Lisboa', '', 'Mais de R$ 1,2 milhão'],
  ['Daniel Vorcaro', 'José Maria Meira — chef e consultor de eventos de luxo', 'Fev/2023', 'R$ 300.000'],
  ['Daniel Vorcaro', "L'épicerie Produções Culinárias — buffet", 'Abr/2023', 'R$ 89.100'],
].map(([origin, recipient, date, amount]) => ({ origin, recipient, date, amount }));

const MONTHS = {
  jan: 1, janeiro: 1, fev: 2, fevereiro: 2, mar: 3, marco: 3, março: 3,
  abr: 4, abril: 4, mai: 5, maio: 5, jun: 6, junho: 6, jul: 7, julho: 7,
  ago: 8, agosto: 8, set: 9, setembro: 9, out: 10, outubro: 10,
  nov: 11, novembro: 11, dez: 12, dezembro: 12,
};

function dateOrder(date) {
  const text = String(date || '');
  const fullDates = [...text.matchAll(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g)];
  if (fullDates.length) {
    const [, day, month, year] = fullDates.at(-1);
    return Number(year) * 10000 + Number(month) * 100 + Number(day);
  }

  const monthDates = [...text.matchAll(/\b(jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço|co)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)\s*[./-]?\s*(\d{4})/gi)];
  if (monthDates.length) {
    const [, monthName, year] = monthDates.at(-1);
    const month = MONTHS[monthName.toLowerCase()] || 0;
    return Number(year) * 10000 + month * 100;
  }

  const years = [...text.matchAll(/\b(?:19|20)\d{2}\b/g)].map(match => Number(match[0]));
  if (years.length) return years.at(-1) * 10000;
  return 0;
}

function periodFor(date) {
  const text = String(date || '').trim();
  if (!text) return 'Data não identificada';

  const hasRange = /–|—|\b a \b|^\s*</i.test(text);
  const monthMatch = text.match(/\b(jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço|co)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)\s*[./-]?\s*(\d{4})/i);
  const fullDateMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  const yearMatch = text.match(/\b((?:19|20)\d{2})\b/);

  if (!hasRange && monthMatch) {
    const month = MONTHS[monthMatch[1].toLowerCase()];
    const year = monthMatch[2];
    return `${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(Number(year), month - 1, 1))} de ${year}`;
  }
  if (!hasRange && fullDateMatch) {
    const month = Number(fullDateMatch[2]);
    const year = fullDateMatch[3];
    return `${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(Number(year), month - 1, 1))} de ${year}`;
  }
  if (!hasRange && yearMatch && text.trim() === yearMatch[1]) return yearMatch[1];
  return text;
}

function paymentLabels(payment) {
  const origin = String(payment.origin || '');
  const recipient = String(payment.recipient || '');
  const date = String(payment.date || '');
  const amount = String(payment.amount || '');
  const text = `${origin} ${recipient} ${date} ${amount}`.toLocaleLowerCase('pt-BR');
  const labels = [];

  if (/orçamento/.test(text)) labels.push('Orçamento');
  else if (/saldo/.test(text)) labels.push('Saldo identificado');
  else if (/us\$|eua|cayman|exterior|remessa internacional/.test(text)) labels.push('Remessa internacional');
  else if (/despesa|evento|festa|jantar|suíte|restaurante|viagem|voos|aeronaves particulares|apartamento|joalheria|concessionária|embarcações|bicicletas|revendedoras|hermès|saint laurent|bvlgari|yves saint laurent|ermenegildo zegna/.test(text)) labels.push('Despesa ou evento');
  else labels.push('Transferência e pagamento');

  if (/fundo|fund\b|fundos/.test(text)) labels.push('Fundo');
  if (/comprovantes\s*=|total\s+\d+\s+remessas|total\s*=/i.test(amount)) labels.push('Consolidado');
  if (/~|≈|estimativa|a confirmar|mais de|cerca de/i.test(amount)) labels.push('Estimativa');
  return labels;
}

function makeSelect(label, className, options) {
  const wrapper = document.createElement('label');
  wrapper.className = 'payments-filter';
  const caption = document.createElement('span');
  caption.textContent = label;
  const select = document.createElement('select');
  select.className = className;
  select.setAttribute('aria-label', label);
  for (const [value, text] of options) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  }
  wrapper.append(caption, select);
  return { wrapper, select };
}

function makeRecord(payment) {
  const labels = paymentLabels(payment);
  const item = document.createElement('article');
  item.className = 'payments-record';
  item.setAttribute('role', 'listitem');

  const icon = document.createElement('span');
  icon.className = 'payments-record-icon';
  icon.innerHTML = labels.includes('Remessa internacional') ? ICON_INTERNATIONAL : ICON_TRANSFER;
  item.appendChild(icon);

  const details = document.createElement('div');
  details.className = 'payments-record-details';
  const recipient = document.createElement('p');
  recipient.className = 'payments-record-recipient';
  recipient.textContent = payment.recipient || 'Destinatário não identificado';
  const origin = document.createElement('p');
  origin.className = 'payments-record-origin';
  origin.textContent = payment.origin || 'Origem não identificada';
  details.append(recipient, origin);

  if (labels.length) {
    const badges = document.createElement('div');
    badges.className = 'payments-record-badges';
    for (const label of labels) {
      const badge = document.createElement('span');
      badge.className = 'payments-badge';
      badge.textContent = label;
      badges.appendChild(badge);
    }
    details.appendChild(badges);
  }

  const summary = document.createElement('div');
  summary.className = 'payments-record-summary';
  const amount = document.createElement('p');
  amount.className = 'payments-record-amount';
  amount.textContent = payment.amount || 'Valor não identificado';
  const date = document.createElement('p');
  date.className = 'payments-record-date';
  date.textContent = payment.date || 'Data não identificada';
  summary.append(amount, date);
  item.append(details, summary);
  return item;
}

export function renderPaymentsPanel(payments = PAYMENTS) {
  const panel = document.createElement('section');
  panel.className = 'payments-panel';
  panel.setAttribute('aria-label', 'Pagamentos');

  const header = document.createElement('div');
  header.className = 'payments-header';
  header.innerHTML = `<span class="payments-header-icon">${ICON_PAYMENT}</span><div><h2 class="payments-title">Pagamentos</h2><p class="payments-intro">Registros financeiros identificados no material.</p></div>`;
  panel.appendChild(header);

  const summary = document.createElement('div');
  summary.className = 'payments-overview';
  const years = payments.flatMap(payment => [...String(payment.date || '').matchAll(/\b(?:19|20)\d{2}\b/g)].map(match => Number(match[0])));
  const yearsText = years.length
    ? `${Math.min(...years)}${Math.min(...years) === Math.max(...years) ? '' : `–${Math.max(...years)}`}`
    : 'Não identificado';
  const summaryItems = [
    ['Registros', String(payments.length)],
    ['Total individualizado', 'Não consolidado'],
    ['Período abrangido', yearsText],
  ];
  for (const [label, value] of summaryItems) {
    const stat = document.createElement('div');
    stat.className = 'payments-overview-stat';
    const statLabel = document.createElement('span');
    statLabel.textContent = label;
    const statValue = document.createElement('strong');
    statValue.textContent = value;
    stat.append(statLabel, statValue);
    summary.appendChild(stat);
  }
  const note = document.createElement('p');
  note.className = 'payments-overview-note';
  note.textContent = 'Valores em moedas e contextos distintos, com totais consolidados e possíveis sobreposições; não é possível somá-los com segurança.';
  summary.appendChild(note);
  panel.appendChild(summary);

  const controls = document.createElement('div');
  controls.className = 'payments-controls';
  const searchLabel = document.createElement('label');
  searchLabel.className = 'payments-search';
  const searchCaption = document.createElement('span');
  searchCaption.textContent = 'Pesquisar';
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Origem ou destinatário';
  search.setAttribute('aria-label', 'Pesquisar por origem ou destinatário');
  searchLabel.append(searchCaption, search);

  const periods = [...new Set(payments.map(payment => periodFor(payment.date)))]
    .sort((a, b) => dateOrder(b) - dateOrder(a) || a.localeCompare(b, 'pt-BR'));
  const institutions = [...new Set(payments.flatMap(payment => [payment.origin, payment.recipient]).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const types = [...new Set(payments.flatMap(paymentLabels))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const periodFilter = makeSelect('Período', 'payments-period-filter', [['', 'Todos os períodos'], ...periods.map(value => [value, value])]);
  const institutionFilter = makeSelect('Instituição ou empresa', 'payments-institution-filter', [['', 'Todas as partes'], ...institutions.map(value => [value, value])]);
  const typeFilter = makeSelect('Tipo de registro', 'payments-type-filter', [['', 'Todos os tipos'], ...types.map(value => [value, value])]);
  const orderFilter = makeSelect('Ordenação cronológica', 'payments-order-filter', [['desc', 'Mais recentes primeiro'], ['asc', 'Mais antigos primeiro']]);
  controls.append(searchLabel, periodFilter.wrapper, institutionFilter.wrapper, typeFilter.wrapper, orderFilter.wrapper);
  panel.appendChild(controls);

  const list = document.createElement('div');
  list.className = 'payments-history';
  list.setAttribute('role', 'list');
  list.setAttribute('aria-label', 'Histórico de movimentações');
  list.setAttribute('aria-live', 'polite');
  panel.appendChild(list);

  const foot = document.createElement('p');
  foot.className = 'payments-foot';
  panel.appendChild(foot);

  const records = payments.map((payment, index) => ({
    payment,
    index,
    period: periodFor(payment.date),
    order: dateOrder(payment.date),
    labels: paymentLabels(payment),
  }));
  const renderHistory = () => {
    const query = search.value.trim().toLocaleLowerCase('pt-BR');
    const selectedPeriod = periodFilter.select.value;
    const selectedInstitution = institutionFilter.select.value;
    const selectedType = typeFilter.select.value;
    const direction = orderFilter.select.value === 'asc' ? 1 : -1;
    const filtered = records.filter(({ payment, period, labels }) => {
      const matchesSearch = !query || `${payment.origin || ''} ${payment.recipient || ''}`.toLocaleLowerCase('pt-BR').includes(query);
      const matchesPeriod = !selectedPeriod || period === selectedPeriod;
      const matchesInstitution = !selectedInstitution || payment.origin === selectedInstitution || payment.recipient === selectedInstitution;
      const matchesType = !selectedType || labels.includes(selectedType);
      return matchesSearch && matchesPeriod && matchesInstitution && matchesType;
    }).sort((a, b) => direction * (a.order - b.order) || direction * (a.index - b.index));

    list.replaceChildren();
    let activePeriod = null;
    for (const record of filtered) {
      if (record.period !== activePeriod) {
        activePeriod = record.period;
        const heading = document.createElement('h3');
        heading.className = 'payments-period-heading';
        heading.textContent = activePeriod;
        list.appendChild(heading);
      }
      list.appendChild(makeRecord(record.payment));
    }
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'payments-empty';
      empty.textContent = payments.length ? 'Nenhuma movimentação corresponde aos filtros selecionados.' : 'Nenhum registro financeiro disponível.';
      list.appendChild(empty);
    }
    foot.textContent = `${filtered.length} de ${payments.length} registros financeiros no material.`;
  };

  for (const control of [search, periodFilter.select, institutionFilter.select, typeFilter.select, orderFilter.select]) {
    control.addEventListener('input', renderHistory);
    control.addEventListener('change', renderHistory);
  }
  renderHistory();
  return panel;
}
