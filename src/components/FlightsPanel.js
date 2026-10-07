const ICON_PLANE = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16Z"/></svg>';
const ICON_BACK = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/><path d="M9 12h12"/></svg>';

const SECTIONS = [
  {
    title: 'Voos com Vorcaro indicado a bordo',
    description: 'Trechos em que o material identifica Daniel Vorcaro como passageiro.',
    flights: [
      {
        date: '16 e 18 mai 2024',
        aircraft: 'Jato particular · prefixo não publicado',
        route: 'Nova York · semana do Person of the Year / Lide',
        passengers: ['Daniel Vorcaro', 'Ciro Nogueira'],
        note: 'Imagens da PF. O Park Hyatt também foi reservado para Fábio Faria; a Piauí o incluiu na lista de um trecho a Nova York. Ele afirma que pagou.',
      },
      {
        date: '20 ago 2024',
        aircraft: 'Gulfstream GV-SP · PR-PSE (Viking)',
        route: 'Flórida → Croácia',
        passengers: ['Daniel Vorcaro', 'Martha Graeff'],
        note: 'Diálogos apontam a matrícula PR-PSE.',
      },
      {
        date: '2–3 fev 2025',
        aircraft: 'Gulfstream GV-SP · PR-PSE (Viking)',
        route: 'Brasília → Trancoso · retorno em 3 fev: Trancoso → Guarulhos',
        passengers: ['Daniel Vorcaro'],
        note: 'Registro de hangar; demais passageiros não publicados.',
      },
      {
        date: '28 ago 2025',
        aircraft: 'Phenom 300 · PR-NGM (Aviation Management Services / Voar)',
        route: 'Brasília, 15h36 → Congonhas, 16h57',
        passengers: ['Daniel Vorcaro', 'Ciro Nogueira', 'Isnaldo Bulhões', 'Rodrigo Gambale', 'Fábio Faria', 'Bruno Bianco'],
      },
      {
        date: '29 ago 2025',
        aircraft: 'Jato citado nos diálogos com Martha',
        route: 'Gênova → Orlando · no dia seguinte: Orlando → São Paulo',
        passengers: ['Daniel Vorcaro'],
        note: 'Acompanhante não publicado.',
      },
      {
        date: '1 mai 2025',
        aircraft: 'Falcon 7X · PS-FST',
        route: 'Guarulhos → Flórida · pouso às 8h05',
        passengers: ['Daniel Vorcaro'],
        note: 'Flávio Bolsonaro pousou 19 minutos antes em outra aeronave.',
      },
    ],
  },
  {
    title: 'Moraes e Viviane Barci',
    description: 'Voos e cruzamentos de hangar citados no material. O gabinete nega que o ministro tenha voado em avião de Vorcaro; o escritório confirma o táxi aéreo e diz que Vorcaro não estava a bordo.',
    flights: [
      {
        date: '16 mai 2025',
        aircraft: 'Embraer 505 · PR-SAD (Prime)',
        route: 'Brasília, 9h37 → Congonhas',
        passengers: ['Alexandre de Moraes', 'Viviane Barci'],
      },
      {
        date: '22 mai 2025',
        aircraft: 'PR-SAD (Prime)',
        route: 'Brasília, 19h33 → Catarina',
        passengers: ['Alexandre de Moraes'],
      },
      {
        date: '29 mai 2025',
        aircraft: 'Phenom 300 · PT-PVH (Prime)',
        route: 'Brasília → São Paulo · entrada no hangar às 19h30',
        passengers: ['Alexandre de Moraes', 'Viviane Barci', 'Outras cinco pessoas'],
        note: 'O material situa as outras cinco pessoas no hangar.',
      },
      {
        date: '9 jul 2025',
        aircraft: 'Legacy 650 · PP-NLR (Prime)',
        route: 'Brasília, 22h34 → Catarina',
        passengers: ['Alexandre de Moraes identificado no hangar'],
        note: 'Caiado saiu antes em avião do governo, com destino a Goiânia.',
      },
      {
        date: '1 ago 2025',
        aircraft: 'Embraer 505 · PR-SAD (Prime)',
        route: 'Brasília, 12h40 → Congonhas',
        passengers: ['Alexandre de Moraes', 'Viviane Barci', 'Uma terceira pessoa'],
      },
      {
        date: '7 ago 2025',
        aircraft: 'Falcon 2000 · PS-FSW (FSW SPE)',
        route: 'Brasília, 19h → São Paulo',
        passengers: ['Alexandre de Moraes', 'Viviane Barci'],
        note: 'O material cita Fabiano Zettel como proprietário.',
      },
      {
        date: '20 ago 2025',
        aircraft: 'Phenom 300 · PT-PVH (Prime)',
        route: 'Brasília, 19h30 → Congonhas',
        passengers: ['Alexandre de Moraes', 'Viviane Barci'],
      },
      {
        date: '22 ago 2025',
        aircraft: 'Legacy 650 · PP-NLR (Prime)',
        route: 'Catarina, 13h → Santos Dumont',
        passengers: ['Alexandre de Moraes', 'Viviane Barci'],
        note: 'O material menciona vídeo do desembarque e mensagem de Vorcaro para atender Barci.',
      },
      {
        date: '16 out 2025',
        aircraft: 'Embraer 500 · PP-BIO (Prime)',
        route: 'Brasília, 19h26 → Catarina',
        passengers: ['Alexandre de Moraes', 'Viviane Barci'],
      },
    ],
  },
  {
    title: 'Flávio Bolsonaro',
    description: 'Registros envolvendo Flávio; não indicam Vorcaro como passageiro nesses trechos.',
    flights: [
      {
        date: '19 jan 2025',
        aircraft: 'Legacy 650 · PP-NLR',
        route: 'Fort Lauderdale, 10h21 → Brasília, 20h01',
        passengers: ['Flávio Bolsonaro', 'Fernanda', 'Duas filhas', 'Willer Tomaz'],
        note: 'Voo realizado. Cotas citadas: Prime You (Vorcaro, desde o fim de 2024), Willer Tomaz e Laércio Cosentino. Vorcaro não estava a bordo.',
      },
      {
        date: '14 jan 2024',
        aircraft: 'PP-NLR',
        route: 'Brasília → Congonhas',
        passengers: ['Flávio Bolsonaro', 'Fernanda', 'Filhas', 'Willer Tomaz e familiares'],
        status: 'Não realizado',
        note: 'Segundo a PF, Flávio entrou pelo Panamá em outro avião e seguiu em voo comercial.',
      },
      {
        date: '1 mai 2025',
        aircraft: 'Global 6000 · PS-UQN (União Química)',
        route: 'Brasília, 0h26 → Flórida, 7h46',
        passengers: ['Flávio Bolsonaro', 'Fernanda', 'Willer Tomaz'],
        note: 'Aeronave de outro proprietário. Mesmo destino do Falcon de Vorcaro, com 19 minutos de diferença.',
      },
    ],
  },
  {
    title: 'Outros registros ligados à frota',
    description: 'Passageiros citados em aeronaves relacionadas, sem Vorcaro indicado a bordo.',
    flights: [
      {
        date: '1 jun 2024',
        aircraft: 'PR-PSE · Gulfstream GV-SP',
        route: 'Encontro em Arusha, Tanzânia',
        passengers: ['Martha Graeff'],
        note: 'O material relata que Martha foi até Vorcaro.',
      },
      {
        date: '28–29 jun 2024',
        aircraft: 'Legacy 650 · PP-NLR',
        route: 'Cascais, 20h44 → Cabo Verde → Brasília, 3h07',
        passengers: ['Modelos que voltavam de Lisboa'],
        note: 'Fretamento citado no valor de US$ 232 mil. O material também menciona modelos voltando de Lisboa cerca de 10 dias depois.',
      },
      {
        date: '29 dez 2024',
        aircraft: 'PR-PSE · Gulfstream GV-SP',
        route: 'Para São Paulo',
        passengers: ['Martha Graeff'],
        note: 'O material diz que ela foi encontrá-lo.',
      },
      {
        date: '12 mai 2025',
        aircraft: 'PR-PSE · Gulfstream GV-SP',
        route: 'Flórida → São Paulo',
        passengers: ['Martha Graeff'],
      },
      {
        date: 'Segundo turno de 2022',
        aircraft: 'Jato ligado a Vorcaro · modelo não informado',
        route: 'Nove estados e o Distrito Federal',
        passengers: ['Nikolas Ferreira', 'Guilherme Batista'],
        note: 'O material diz que Vorcaro escreveu que pagou.',
      },
      {
        date: 'Após mar 2026',
        aircraft: 'PR-PSE · Gulfstream GV-SP',
        route: 'Miami, Nova York, Paris, Mônaco, Dubai, Anguilla, Filadélfia e Washington · sem pouso no Brasil',
        passengers: ['Não publicados'],
        note: 'Imprensa paraguaia citou fretamento com Horacio Cartes para os EUA durante a Copa.',
      },
    ],
  },
];

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderFlight(flight) {
  const card = makeElement('article', 'flight-card');
  const top = makeElement('div', 'flight-card-top');
  top.appendChild(makeElement('time', 'flight-date', flight.date));
  const aircraft = makeElement('span', 'flight-aircraft', flight.aircraft);
  top.appendChild(aircraft);
  if (flight.status) top.appendChild(makeElement('span', 'flight-status', flight.status));
  card.appendChild(top);

  const route = makeElement('div', 'flight-route');
  route.appendChild(makeElement('span', 'flight-route-place', flight.route));
  route.insertAdjacentHTML('afterbegin', `<span class="flight-route-icon">${ICON_PLANE}</span>`);
  card.appendChild(route);

  const passengerList = makeElement('ul', 'flight-passengers');
  passengerList.setAttribute('aria-label', 'Passageiros mencionados');
  for (const passenger of flight.passengers) {
    passengerList.appendChild(makeElement('li', 'flight-passenger', passenger));
  }
  card.appendChild(passengerList);
  if (flight.note) card.appendChild(makeElement('p', 'flight-note', flight.note));
  return card;
}

export function renderFlightsPanel({ onBack = () => {} } = {}) {
  const panel = makeElement('section', 'flights-panel');
  panel.setAttribute('aria-label', 'Voos e passageiros');

  const header = makeElement('header', 'flights-header');
  const back = makeElement('button', 'flights-back');
  back.type = 'button';
  back.setAttribute('aria-label', 'Voltar às conversas');
  back.innerHTML = ICON_BACK;
  back.addEventListener('click', onBack);
  header.appendChild(back);
  const heading = makeElement('div', 'flights-heading');
  heading.appendChild(makeElement('h1', '', 'Voos e passageiros'));
  heading.appendChild(makeElement('p', '', 'Registros reunidos no material fornecido.'));
  header.appendChild(heading);
  panel.appendChild(header);

  const content = makeElement('div', 'flights-content');
  for (const section of SECTIONS) {
    const group = makeElement('section', 'flight-group');
    const groupHeading = makeElement('div', 'flight-group-heading');
    groupHeading.appendChild(makeElement('h2', '', section.title));
    groupHeading.appendChild(makeElement('p', '', section.description));
    group.appendChild(groupHeading);
    const list = makeElement('div', 'flight-list');
    for (const flight of section.flights) list.appendChild(renderFlight(flight));
    group.appendChild(list);
    content.appendChild(group);
  }

  const courchevel = makeElement('article', 'flight-card flight-context-card');
  courchevel.appendChild(makeElement('h2', 'flight-canceled-title', 'Courchevel · 12–25 jan 2025 · viagem distinta'));
  courchevel.appendChild(makeElement('p', 'flight-canceled-detail', 'Ciro Nogueira e Flávia Rosalen saíram de Guarulhos para Paris e depois seguiram à estação. Vorcaro e Martha chegaram dias depois.'));
  courchevel.appendChild(makeElement('p', 'flight-note', 'A PF trata o custeio como sendo de Vorcaro. O material ressalta que não se trata do mesmo voo.'));
  content.appendChild(courchevel);

  const canceled = makeElement('article', 'flight-card flight-card-canceled');
  canceled.appendChild(makeElement('h2', 'flight-canceled-title', 'Trecho cancelado · 20–23 nov 2025'));
  canceled.appendChild(makeElement('p', 'flight-canceled-detail', 'PP-NLR (Brasília–São Paulo) e helicóptero EC-155 (para Campos do Jordão) · 8 pessoas.'));
  canceled.appendChild(makeElement('p', 'flight-note', 'Pedido em 24 out; cancelado às 8h34 de 18 nov, após a prisão. Cadastro interno lista Vorcaro como cotista do PP-NLR e do EC-155.'));
  content.appendChild(canceled);

  const aircraft = makeElement('aside', 'flight-aircraft-notes');
  aircraft.appendChild(makeElement('h2', '', 'Matrículas mencionadas'));
  aircraft.appendChild(makeElement('p', '', 'PR-PSE — Gulfstream GV-SP, Viking; cerca de R$ 120 milhões em jun/2023. Bloqueio de venda; fora do Brasil desde ago/2025.'));
  aircraft.appendChild(makeElement('p', '', 'PP-NLR — Legacy 650, Fraction 024 / Prime Aviation. Também citado em registros de Flávio Bolsonaro.'));
  aircraft.appendChild(makeElement('p', '', 'PR-SAD e PT-PVH — Embraer 505 e Phenom 300, Prime. PP-BIO — Embraer 500, Prime.'));
  aircraft.appendChild(makeElement('p', '', 'PR-NGM — Phenom 300. PS-FST — Falcon 7X. PS-FSW — Falcon 2000, citado como de Fabiano Zettel.'));
  content.appendChild(aircraft);
  panel.appendChild(content);
  return panel;
}
