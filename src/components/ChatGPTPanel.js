const CHATGPT_ICON = '<img src="/assets/chatgpt-logo.png" alt="" aria-hidden="true">';

export const CHATGPT_CONVERSATIONS = [
  {
    date: '19/05/2025',
    title: 'Anel Oura',
    messages: [
      { role: 'user', text: 'How to take out an oura ring that is stuck in the charger?', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '23/05/2025',
    title: 'Ações da Hapvida',
    messages: [
      { role: 'user', text: 'Qual cotação Hapvida hoje.', source: 'transcribed' },
      { role: 'assistant', text: 'A reportagem informa que a resposta foi R$ 2,82.', source: 'reported' },
    ],
  },
  {
    date: '29/05/2025',
    title: 'Saúde',
    messages: [
      { role: 'user', text: 'O que fazer de modo caseiro quando acontece um fechamento de glote', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '02/06/2025',
    title: 'Identificação de um xeique',
    messages: [
      { role: 'user', text: 'Quem é esse', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
      { role: 'user', text: 'Shaik al mahktoum', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '05/06/2025',
    title: 'Estiramento muscular',
    messages: [
      { role: 'user', text: 'Qual seria o melhor anti-inflamatório para estiramento muscular.', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '14/06/2025',
    title: 'Medicamentos para emagrecimento',
    messages: [
      { role: 'user', text: 'Qual diferença ozempic e mounjaro.', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '17/06/2025',
    title: 'Temperatura em Taormina',
    messages: [
      { role: 'user', text: 'Temperatura Taormina em 17 de junho.', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '25–26/06/2025',
    title: 'Família real de Dubai',
    messages: [
      { role: 'user', text: 'Perguntas sobre os principais xeiques de Dubai, quem é Suhail Al Maktoum e qual é sua posição na família real.', source: 'summarized' },
      { role: 'assistant', text: 'Respostas não reproduzidas integralmente na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '14/08/2025',
    title: 'Pesquisa sobre si mesmo',
    messages: [
      { role: 'user', text: 'Daniel vorcaro', source: 'transcribed' },
      { role: 'assistant', text: 'A IA apresentou uma descrição biográfica e empresarial de Vorcaro. Segundo a reportagem, a resposta o descreveu como alguém conhecido por tomar decisões ousadas e transformadoras, ganhando notoriedade pela velocidade e pelo impacto de suas ações.', source: 'reported' },
    ],
  },
  {
    date: '19/08/2025',
    title: 'Charuto e peso',
    messages: [
      { role: 'user', text: 'Charuto engorda?', source: 'transcribed' },
      { role: 'assistant', text: 'Segundo a reportagem, a IA explicou que a fumaça do tabaco não fornece calorias.', source: 'reported' },
    ],
  },
  {
    date: '21/08/2025',
    title: 'Diretores do Banco Central',
    messages: [
      { role: 'user', text: 'Quais são os diretores banco central', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '30/08/2025',
    title: 'Impeachment de diretor do Banco Central',
    messages: [
      { role: 'user', text: 'Quais requisitos e regulamento para pedir impeachment de diretor banco central', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
    context: 'Cerca de 40 minutos antes, no WhatsApp, Vorcaro pediu ao advogado Marcel Mascarenhas que lhe passasse as condições para pedir o impeachment de um diretor do Banco Central.',
  },
  {
    date: '31/08/2025',
    title: 'Banqueiros presos',
    messages: [
      { role: 'user', text: 'Quais banqueiros brasileiros foram presos', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '07/09/2025',
    title: 'Séries de televisão',
    messages: [
      { role: 'user', text: 'Melhores séries lançadas recentemente', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '04/10/2025',
    title: 'Luís Octávio Índio da Costa',
    messages: [
      { role: 'user', text: 'Por onde anda Índio da Costa [do banco] Cruzeiro do Sul', source: 'transcribed' },
      { role: 'assistant', text: 'A IA informou que havia mais de uma pessoa com esse nome e apresentou informações sobre o político carioca e o ex-banqueiro.', source: 'reported' },
      { role: 'user', text: 'Luis Octavio', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta específica não reproduzida na reportagem.', source: 'unpublished' },
      { role: 'user', text: 'Onde mora', source: 'transcribed' },
      { role: 'assistant', text: 'A IA recusou-se a informar o endereço residencial e mencionou Cidreira, no Rio Grande do Sul, como localidade associada ao perfil do ex-banqueiro no LinkedIn.', source: 'reported' },
    ],
  },
  {
    date: '09/10/2025',
    title: 'Longevidade',
    messages: [
      { role: 'user', text: 'Qual média idade pessoas muito altas morrem', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '14/10/2025',
    title: 'Lei Magnitsky',
    messages: [
      { role: 'user', text: 'Pergunta sobre a data da aplicação da Lei Magnitsky contra Viviane Barci de Moraes.', source: 'summarized' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
    note: 'A formulação da pergunta foi resumida; o texto da reportagem não a transcreve literalmente.',
  },
  {
    date: '22/10/2025',
    title: 'Ações do BRB',
    messages: [
      { role: 'user', text: 'Pergunta sobre o volume diário histórico das ações do BRB.', source: 'summarized' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '31/10/2025',
    title: 'Restaurantes em Miami',
    messages: [
      { role: 'user', text: 'Quais restaurantes em Coconut Grove abrem as 7am', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
  },
  {
    date: '15/11/2025',
    title: 'Juízes das varas criminais de Brasília',
    messages: [
      { role: 'user', text: 'Quem são os juízes das varas criminais de Brasília', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
    context: 'No mesmo período, em conversa no grupo de WhatsApp “Daniel e os Leões”, com os advogados Marcel Mascarenhas e Walfrido Warde, Vorcaro escreveu: “Na iminência da solução de tudo estou percebendo comportamentos estranhos.”',
  },
  {
    date: '16/11/2025',
    title: 'Varas criminais federais',
    messages: [
      { role: 'user', text: 'Quais são as varas criminais federais de Brasília', source: 'transcribed' },
      { role: 'assistant', text: 'Resposta não reproduzida na reportagem.', source: 'unpublished' },
    ],
    note: 'Última consulta ao ChatGPT mencionada no texto, na véspera da prisão de Vorcaro, em 17/11/2025.',
  },
];

const SOURCE_LABELS = {
  transcribed: 'Pergunta transcrita na reportagem',
  summarized: 'Tema resumido pela reportagem; não é citação literal',
  reported: 'Resposta resumida conforme a reportagem',
  unpublished: 'Conteúdo não reproduzido na reportagem',
};

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderConversation(conversation) {
  const thread = makeElement('article', 'chatgpt-thread');
  thread.setAttribute('aria-label', `${conversation.title}, ${conversation.date}`);

  for (const message of conversation.messages) {
    const isUser = message.role === 'user';
    const row = makeElement('section', `chatgpt-message chatgpt-message-${message.role}`);
    const label = makeElement('div', 'chatgpt-message-label', isUser ? 'Daniel Vorcaro' : 'ChatGPT');
    const bubble = makeElement('p', 'chatgpt-message-bubble', message.text);
    const source = makeElement('span', 'chatgpt-source', SOURCE_LABELS[message.source]);
    row.append(label, bubble, source);
    thread.appendChild(row);
  }

  if (conversation.context || conversation.note) {
    const notes = makeElement('aside', 'chatgpt-editorial-notes');
    if (conversation.context) notes.appendChild(makeElement('p', '', conversation.context));
    if (conversation.note) notes.appendChild(makeElement('p', '', conversation.note));
    thread.appendChild(notes);
  }

  return thread;
}

export function renderChatGPTPanel({ conversations = CHATGPT_CONVERSATIONS, onBack = () => {} } = {}) {
  const panel = makeElement('section', 'chatgpt-panel');
  panel.setAttribute('aria-label', 'Consultas ao ChatGPT citadas na reportagem');

  const header = makeElement('header', 'chatgpt-header');
  const back = makeElement('button', 'chatgpt-back');
  back.type = 'button';
  back.setAttribute('aria-label', 'Voltar para conversas');
  back.textContent = '‹';
  back.addEventListener('click', onBack);
  header.append(back);
  const brand = makeElement('span', 'chatgpt-brand');
  brand.innerHTML = CHATGPT_ICON;
  const title = makeElement('h1', '', 'Consultas ao ChatGPT');
  brand.appendChild(title);
  header.appendChild(brand);
  panel.appendChild(header);

  const disclaimer = makeElement(
    'p',
    'chatgpt-disclaimer',
    'Seleção de consultas citadas na reportagem; não representa o histórico completo de 151 interações. Respostas não publicadas não foram reconstruídas.'
  );
  panel.appendChild(disclaimer);

  const body = makeElement('div', 'chatgpt-body');
  const list = makeElement('nav', 'chatgpt-list');
  list.setAttribute('aria-label', 'Conversas citadas');
  const search = makeElement('input', 'chatgpt-search');
  search.type = 'search';
  search.placeholder = 'Buscar por assunto ou pergunta';
  search.setAttribute('aria-label', 'Buscar consultas');
  list.appendChild(search);
  const listItems = makeElement('div', 'chatgpt-list-items');
  list.appendChild(listItems);

  const reader = makeElement('div', 'chatgpt-reader');
  body.append(list, reader);
  panel.appendChild(body);

  const listBack = makeElement('button', 'chatgpt-mobile-back', '‹ Todas as consultas');
  listBack.type = 'button';
  listBack.addEventListener('click', () => {
    list.classList.remove('chatgpt-list-hidden');
    reader.classList.remove('chatgpt-reader-visible');
  });

  const orderedConversations = [...conversations].reverse();
  let selectedIndex = 0;
  const buttons = [];

  function selectConversation(index, showReader = true) {
    selectedIndex = index;
    buttons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-current', selected ? 'page' : 'false');
    });
    const conversation = orderedConversations[index];
    reader.replaceChildren(listBack);
    if (!conversation) return;
    const heading = makeElement('div', 'chatgpt-conversation-heading');
    heading.append(makeElement('h2', '', conversation.title), makeElement('time', '', conversation.date));
    reader.append(heading, renderConversation(conversation));
    if (showReader && window.innerWidth <= 600) {
      list.classList.add('chatgpt-list-hidden');
      reader.classList.add('chatgpt-reader-visible');
    }
  }

  orderedConversations.forEach((conversation, index) => {
    const button = makeElement('button', 'chatgpt-list-item');
    button.type = 'button';
    button.append(makeElement('span', 'chatgpt-list-title', conversation.title));
    button.append(makeElement('time', 'chatgpt-list-date', conversation.date));
    button.addEventListener('click', () => selectConversation(index));
    buttons.push(button);
    listItems.appendChild(button);
  });

  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase('pt-BR');
    orderedConversations.forEach((conversation, index) => {
      const haystack = `${conversation.title} ${conversation.date} ${conversation.messages.map(message => message.text).join(' ')}`.toLocaleLowerCase('pt-BR');
      buttons[index].hidden = !haystack.includes(query);
    });
  });

  selectConversation(selectedIndex, false);
  return panel;
}
