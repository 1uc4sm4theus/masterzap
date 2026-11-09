const GOOGLE_LOGO = `
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
    <path d="M12 3a9 9 0 0 0-7.35 3.8" fill="none" stroke="#EA4335" stroke-width="4"/>
    <path d="M4.65 6.8a9 9 0 0 0 0 10.4" fill="none" stroke="#FBBC05" stroke-width="4"/>
    <path d="M4.65 17.2A9 9 0 0 0 17.4 18.5" fill="none" stroke="#34A853" stroke-width="4"/>
    <path d="M17.4 18.5A9 9 0 0 0 20.7 10.2H12" fill="none" stroke="#4285F4" stroke-width="4"/>
  </svg>
`;

const ICON_BACK = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const ICON_SEARCH = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
const ICON_HISTORY = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

export const GOOGLE_SEARCHES = [
  {
    date: '16 de novembro de 2025',
    query: 'O que é Tremembé?',
    attribution: 'Pesquisa atribuída a Daniel Vorcaro · Fonte: reportagem sobre perícia do dispositivo',
  },
  {
    date: '16 de novembro de 2025',
    query: 'Quem é Ricardo Soares Leite?',
    attribution: 'Pesquisa atribuída a Daniel Vorcaro · Fonte: reportagem',
  },
  {
    date: '16 de novembro de 2025',
    query: 'Pesquisas sobre a 10ª Vara Criminal de Brasília',
    attribution: 'Registro descrito na cobertura jornalística',
  },
];

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderSearch(search) {
  const entry = makeElement('article', 'google-history-entry');
  entry.appendChild(makeElement('span', 'google-history-clock'));
  entry.querySelector('.google-history-clock').innerHTML = ICON_HISTORY;

  const details = makeElement('div', 'google-history-details');
  details.appendChild(makeElement('h3', 'google-history-query', search.query));

  const source = makeElement('p', 'google-history-source');
  source.appendChild(makeElement('span', 'google-history-product', 'Google'));
  source.appendChild(makeElement('span', 'google-history-attribution', search.attribution));
  details.appendChild(source);
  entry.appendChild(details);
  return entry;
}

export function renderGoogleHistoryPanel({ onBack = () => {} } = {}) {
  const panel = makeElement('section', 'google-history-panel');
  panel.setAttribute('aria-label', 'Histórico de pesquisas do Google');

  const header = makeElement('header', 'google-history-header');
  const back = makeElement('button', 'google-history-back');
  back.type = 'button';
  back.setAttribute('aria-label', 'Voltar para conversas');
  back.innerHTML = ICON_BACK;
  back.addEventListener('click', onBack);
  header.appendChild(back);

  const brand = makeElement('div', 'google-history-brand');
  brand.innerHTML = GOOGLE_LOGO;
  brand.appendChild(makeElement('h1', '', 'Google'));
  header.appendChild(brand);
  panel.appendChild(header);

  const disclaimer = makeElement(
    'p',
    'google-history-disclaimer',
    'Registros atribuídos pela cobertura jornalística; não correspondem a uma exportação ou verificação do histórico da conta Google.'
  );
  panel.appendChild(disclaimer);

  const searchForm = makeElement('label', 'google-history-search');
  searchForm.insertAdjacentHTML('afterbegin', ICON_SEARCH);
  const searchInput = makeElement('input', '');
  searchInput.type = 'search';
  searchInput.placeholder = 'Pesquisar no Google';
  searchInput.setAttribute('aria-label', 'Filtrar pesquisas do Google');
  searchForm.appendChild(searchInput);
  panel.appendChild(searchForm);

  const content = makeElement('div', 'google-history-content');
  const date = GOOGLE_SEARCHES[0]?.date;
  const group = makeElement('section', 'google-history-day');
  group.setAttribute('aria-label', date || 'Pesquisas');
  if (date) {
    const heading = makeElement('h2', 'google-history-date');
    const dateTime = makeElement('time', '', date);
    dateTime.setAttribute('datetime', '2025-11-16');
    heading.appendChild(dateTime);
    group.appendChild(heading);
  }

  const entries = GOOGLE_SEARCHES.map(renderSearch);
  entries.forEach(entry => group.appendChild(entry));
  content.appendChild(group);

  const empty = makeElement('p', 'google-history-empty', 'Nenhuma pesquisa encontrada.');
  empty.hidden = true;
  content.appendChild(empty);
  panel.appendChild(content);

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLocaleLowerCase('pt-BR');
    let visibleCount = 0;
    GOOGLE_SEARCHES.forEach((search, index) => {
      const haystack = `${search.date} ${search.query} ${search.attribution}`.toLocaleLowerCase('pt-BR');
      entries[index].hidden = !haystack.includes(query);
      if (!entries[index].hidden) visibleCount += 1;
    });
    empty.hidden = visibleCount > 0;
    group.hidden = visibleCount === 0;
  });

  return panel;
}
