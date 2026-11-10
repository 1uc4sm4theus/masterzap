import { EVENTS } from '../data/events.js';

const ICON_CALENDAR = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
const ICON_LOCATION = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
const ICON_CLOCK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ICON_PEOPLE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
const ICON_BACK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';

export function renderEventsPanel({ events = EVENTS, selectedId = events[0]?.id } = {}) {
  const sortDate = event => event.dateOrder?.length === 4
    ? `${event.dateOrder}-12-31`
    : event.dateOrder || '';
  const orderedEvents = [...events].sort((a, b) => sortDate(a).localeCompare(sortDate(b)));
  const panel = document.createElement('section');
  panel.className = 'events-panel';
  panel.setAttribute('aria-label', 'Agenda de eventos');

  const listPane = document.createElement('aside');
  listPane.className = 'events-list-pane';
  const listHeader = document.createElement('header');
  listHeader.className = 'events-list-header';
  listHeader.innerHTML = `${ICON_CALENDAR}<div><h1>Agenda</h1><p>${events.length} eventos mencionados</p></div>`;
  listPane.appendChild(listHeader);

  const notice = document.createElement('p');
  notice.className = 'events-source-note';
  notice.textContent = 'Cronologia organizada a partir dos relatos e fontes indicados. A menção de um evento ou pessoa não comprova presença nem a realização do encontro.';
  listPane.appendChild(notice);

  const list = document.createElement('div');
  list.className = 'events-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Eventos');
  const detailPane = document.createElement('article');
  detailPane.className = 'event-detail-pane';

  function renderDetail(event) {
    detailPane.replaceChildren();
    if (!event) {
      detailPane.classList.add('event-detail-empty');
      detailPane.textContent = 'Selecione um evento para ver os detalhes.';
      return;
    }

    detailPane.classList.remove('event-detail-empty');
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'event-detail-back';
    back.setAttribute('aria-label', 'Voltar à lista de eventos');
    back.innerHTML = ICON_BACK;
    back.addEventListener('click', () => {
      panel.classList.remove('event-selected');
      list.querySelectorAll('.event-list-item')
        .forEach(item => { if (item.dataset.eventId === selectedId) item.focus(); });
    });
    detailPane.appendChild(back);

    const heading = document.createElement('div');
    heading.className = 'event-detail-heading';
    const marker = document.createElement('span');
    marker.className = 'event-color-marker';
    marker.setAttribute('aria-hidden', 'true');
    heading.appendChild(marker);
    const title = document.createElement('h2');
    title.textContent = event.title;
    heading.appendChild(title);
    detailPane.appendChild(heading);

    const dateLine = document.createElement('p');
    dateLine.className = 'event-detail-date';
    dateLine.textContent = event.date;
    detailPane.appendChild(dateLine);

    const location = document.createElement('div');
    location.className = 'event-detail-meta';
    location.innerHTML = ICON_LOCATION;
    const locationText = document.createElement('span');
    locationText.textContent = event.location;
    location.appendChild(locationText);
    detailPane.appendChild(location);

    const time = document.createElement('div');
    time.className = 'event-detail-meta';
    time.innerHTML = ICON_CLOCK;
    const timeText = document.createElement('span');
    timeText.textContent = event.time === 'Não indicado'
      ? 'Horário não indicado'
      : `Horário aproximado: ${event.time}`;
    time.appendChild(timeText);
    detailPane.appendChild(time);

    const summary = document.createElement('p');
    summary.className = 'event-detail-summary';
    summary.textContent = event.summary;
    detailPane.appendChild(summary);

    const status = document.createElement('p');
    status.className = 'event-detail-status';
    status.textContent = `Situação documental: ${event.status || 'não especificada no resumo de origem.'}`;
    detailPane.appendChild(status);

    for (const detail of event.details) {
      const paragraph = document.createElement('p');
      paragraph.className = 'event-detail-copy';
      paragraph.textContent = detail;
      detailPane.appendChild(paragraph);
    }

    const peopleHeading = document.createElement('h3');
    peopleHeading.className = 'event-detail-section-title';
    peopleHeading.innerHTML = `${ICON_PEOPLE}<span>${event.peopleHeading}</span>`;
    detailPane.appendChild(peopleHeading);
    const peopleList = document.createElement('ul');
    peopleList.className = 'event-people-list';
    for (const person of event.people) {
      const item = document.createElement('li');
      item.textContent = person;
      peopleList.appendChild(item);
    }
    detailPane.appendChild(peopleList);

    if (event.messageLinks?.length) {
      const messagesHeading = document.createElement('h3');
      messagesHeading.className = 'event-detail-section-title';
      messagesHeading.textContent = 'Mensagens e registros';
      detailPane.appendChild(messagesHeading);
      const messagesList = document.createElement('ul');
      messagesList.className = 'event-sources-list';
      for (const reference of event.messageLinks) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#/chat/${encodeURIComponent(reference.conversationId)}/msg/${reference.messageId}`;
        link.textContent = reference.label;
        item.appendChild(link);
        messagesList.appendChild(item);
      }
      detailPane.appendChild(messagesList);
    }

    const sourcesHeading = document.createElement('h3');
    sourcesHeading.className = 'event-detail-section-title';
    sourcesHeading.textContent = 'Fontes indicadas';
    detailPane.appendChild(sourcesHeading);
    if (event.sources?.length) {
      const sourcesList = document.createElement('ul');
      sourcesList.className = 'event-sources-list';
      for (const source of event.sources) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = source.label;
        item.appendChild(link);
        sourcesList.appendChild(item);
      }
      detailPane.appendChild(sourcesList);
    } else {
      const noSources = document.createElement('p');
      noSources.className = 'event-detail-copy';
      noSources.textContent = 'Nenhuma fonte específica foi indicada para este item no material enviado.';
      detailPane.appendChild(noSources);
    }

    const footnote = document.createElement('p');
    footnote.className = 'event-detail-footnote';
    footnote.textContent = 'A classificação e os detalhes reproduzem o material fornecido; consulte as fontes originais antes de tratar um relato ou uma mensagem como confirmação de encontro.';
    detailPane.appendChild(footnote);
  }

  function selectEvent(event) {
    selectedId = event.id;
    for (const button of list.querySelectorAll('.event-list-item')) {
      const selected = button.dataset.eventId === selectedId;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-selected', String(selected));
    }
    panel.classList.add('event-selected');
    renderDetail(event);
    if (window.innerWidth <= 600) detailPane.querySelector('.event-detail-back').focus();
  }

  for (const event of orderedEvents) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'event-list-item';
    item.dataset.eventId = event.id;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(event.id === selectedId));
    if (event.id === selectedId) item.classList.add('selected');

    const marker = document.createElement('span');
    marker.className = 'event-color-marker';
    marker.setAttribute('aria-hidden', 'true');
    item.appendChild(marker);
    const content = document.createElement('span');
    content.className = 'event-list-content';
    const date = document.createElement('span');
    date.className = 'event-list-date';
    date.textContent = event.date;
    const title = document.createElement('span');
    title.className = 'event-list-title';
    title.textContent = event.title;
    const venue = document.createElement('span');
    venue.className = 'event-list-location';
    venue.textContent = event.location;
    content.append(date, title, venue);
    item.appendChild(content);
    item.addEventListener('click', () => selectEvent(event));
    list.appendChild(item);
  }
  listPane.appendChild(list);

  const selectedEvent = orderedEvents.find(event => event.id === selectedId);
  if (selectedEvent) renderDetail(selectedEvent);
  else renderDetail(null);

  panel.append(listPane, detailPane);
  return panel;
}
