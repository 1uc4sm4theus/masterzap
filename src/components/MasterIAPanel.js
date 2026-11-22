import { MASTER_IA_CONFIG } from '../lib/master-ia-config.js';
import { MasterIAService, NO_EVIDENCE_MESSAGE } from '../lib/master-ia.js';

const EMPTY_HINT = 'Respostas baseadas nas mensagens do acervo. A atribuição não é comprovação. A pergunta e trechos encontrados podem ser enviados para análise externa.';
const SUGGESTIONS = [
  { category: 'PESSOA', question: 'Quais conversas mencionam Alexandre de Moraes?' },
  { category: 'LINHA DO TEMPO', question: 'Quando começam e terminam as conversas com Martha Graeff?' },
  { category: 'REDE', question: 'Quem participa da conversa com Alexandre de Moraes?' },
  { category: 'CONVERSA', question: 'O que foi dito sobre o Banco Master?' },
  { category: 'ACERVO', question: 'Quantas vezes Martha Graeff é mencionada?' },
];

const services = new WeakMap();
let sessionHistory = [];

function makeIcon(path) {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shape.setAttribute('d', path);
  shape.setAttribute('fill', 'none');
  shape.setAttribute('stroke', 'currentColor');
  shape.setAttribute('stroke-width', '1.8');
  shape.setAttribute('stroke-linecap', 'round');
  shape.setAttribute('stroke-linejoin', 'round');
  icon.appendChild(shape);
  return icon;
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function appendInline(parent, text) {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) parent.appendChild(document.createTextNode(text.slice(cursor, match.index)));
    const token = match[0];
    let node;
    if (token.startsWith('**') || token.startsWith('__')) {
      node = document.createElement('strong');
      node.textContent = token.slice(2, -2);
    } else if (token.startsWith('`')) {
      node = document.createElement('code');
      node.textContent = token.slice(1, -1);
    } else if (token.startsWith('*') || token.startsWith('_')) {
      node = document.createElement('em');
      node.textContent = token.slice(1, -1);
    } else {
      let url;
      try {
        url = new URL(match[3]);
      } catch {
        url = null;
      }
      if (url && (url.protocol === 'https:' || url.protocol === 'http:')) {
        node = document.createElement('a');
        node.href = url.href;
        node.target = '_blank';
        node.rel = 'noopener noreferrer';
        node.textContent = match[2];
      } else {
        node = document.createTextNode(match[2]);
      }
    }
    parent.appendChild(node);
    cursor = match.index + token.length;
  }
  if (cursor < text.length) parent.appendChild(document.createTextNode(text.slice(cursor)));
}

export function renderMarkdown(text) {
  const content = document.createElement('div');
  content.className = 'master-ia-markdown';
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const p = document.createElement('p');
    paragraph.forEach((line, index) => {
      if (index) p.appendChild(document.createElement('br'));
      appendInline(p, line);
    });
    content.appendChild(p);
    paragraph = [];
  };
  const closeList = () => {
    list = null;
  };

  for (const line of String(text || '').split('\n')) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }
    if (heading) {
      flushParagraph();
      closeList();
      const element = document.createElement(`h${heading[1].length + 1}`);
      appendInline(element, heading[2]);
      content.appendChild(element);
      continue;
    }
    if (unordered || ordered) {
      flushParagraph();
      const tag = unordered ? 'ul' : 'ol';
      if (!list || list.tagName.toLowerCase() !== tag) {
        list = document.createElement(tag);
        content.appendChild(list);
      }
      const item = document.createElement('li');
      appendInline(item, (unordered || ordered)[1]);
      list.appendChild(item);
      continue;
    }
    closeList();
    paragraph.push(line);
  }
  flushParagraph();
  return content;
}

function renderDatasetChip(sources) {
  const years = [...new Set(sources.flatMap(source => {
    const range = source.dateRange || {};
    return [source.date, range.start, range.end]
      .filter(Boolean)
      .map(date => String(date).slice(0, 4));
  }))].sort();
  const period = years.length ? ` · ${years[0]}${years.at(-1) !== years[0] ? `–${years.at(-1)}` : ''}` : '';
  return makeElement('span', 'master-ia-dataset', `Conjunto: Acervo MasterWhats${period}`);
}

function renderSources(sources, onNavigate) {
  const section = makeElement('section', 'master-ia-sources');
  section.appendChild(makeElement('h3', 'master-ia-eyebrow', 'EVIDÊNCIAS'));
  section.appendChild(renderDatasetChip(sources));
  for (const source of sources) {
    const isMessage = Boolean(source.messageId);
    const link = makeElement('a', `master-ia-source${isMessage ? '' : ' master-ia-dossier'}`);
    link.href = source.messageId
      ? `#/chat/${encodeURIComponent(source.conversationId)}/msg/${encodeURIComponent(source.messageId)}`
      : `#/chat/${encodeURIComponent(source.conversationId)}`;
    link.addEventListener('click', onNavigate);

    if (isMessage) {
      link.appendChild(makeElement('span', 'master-ia-source-heading master-ia-eyebrow', source.sender || source.conversationName));
      link.appendChild(makeElement('span', 'master-ia-evidence-type', 'NA MENSAGEM'));
      link.appendChild(makeElement('q', 'master-ia-source-quote', source.content || 'Conteúdo da mensagem não disponível.'));
      link.appendChild(makeElement(
        'span',
        'master-ia-source-meta',
        `${source.conversationName} · ${source.date || 'Data não informada'}${source.time ? ` ${source.time}` : ''} · mensagem ${source.messageId}`,
      ));
    } else {
      link.appendChild(makeElement('span', 'master-ia-source-heading master-ia-eyebrow', 'DOSSIÊ'));
      link.appendChild(makeElement('strong', 'master-ia-dossier-name', source.conversationName));
      link.appendChild(makeElement(
        'span',
        'master-ia-source-meta',
        `${source.dateRange?.start || 'Data não informada'} a ${source.dateRange?.end || 'data não informada'} · 1 conversa · ${source.totalMessages ?? 0} mensagens`,
      ));
      link.appendChild(makeElement('span', 'master-ia-dossier-action', 'Ver conversa'));
    }
    section.appendChild(link);
  }
  return section;
}

function renderConnectionGraph(sources) {
  const conversations = new Map();
  for (const source of sources) {
    const participants = [...new Set(source.participants || [])].filter(Boolean);
    if (participants.length < 2 || !source.conversationId) continue;
    if (!conversations.has(source.conversationId)) conversations.set(source.conversationId, {
      id: source.conversationId,
      name: source.conversationName,
      participants,
    });
  }
  if (!conversations.size) return null;

  const section = makeElement('section', 'master-ia-connections');
  section.appendChild(makeElement('h3', 'master-ia-eyebrow', 'CONEXÕES NO ACERVO'));
  for (const conversation of conversations.values()) {
    const width = Math.max(360, conversation.participants.length * 104);
    const stage = makeElement('div', 'master-ia-graph-stage');
    stage.style.width = `${width}px`;
    const edges = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    edges.setAttribute('viewBox', `0 0 ${width} 112`);
    edges.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < conversation.participants.length; index++) {
      const x = width * (index + 0.5) / conversation.participants.length;
      const edge = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      edge.setAttribute('x1', String(width / 2));
      edge.setAttribute('y1', '37');
      edge.setAttribute('x2', String(x));
      edge.setAttribute('y2', '77');
      edge.setAttribute('stroke', 'currentColor');
      edges.appendChild(edge);
    }
    stage.appendChild(edges);

    const href = `#/chat/${encodeURIComponent(conversation.id)}`;
    const chatNode = makeElement('a', 'master-ia-graph-chat', conversation.name);
    chatNode.href = href;
    chatNode.style.left = `${width / 2}px`;
    stage.appendChild(chatNode);
    conversation.participants.forEach((participant, index) => {
      const x = width * (index + 0.5) / conversation.participants.length;
      const personNode = makeElement('a', 'master-ia-graph-person', participant);
      personNode.href = href;
      personNode.style.left = `${x}px`;
      stage.appendChild(personNode);
    });
    const viewport = makeElement('div', 'master-ia-graph-viewport');
    viewport.appendChild(stage);
    section.appendChild(viewport);
  }
  return section;
}

function wrapCanvasText(context, text, maxWidth) {
  const lines = [];
  for (const paragraph of String(text || '').split('\n')) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

async function createAnswerImage(message) {
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  const width = 1200;
  const padding = 72;
  const contentWidth = width - padding * 2;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas indisponível neste navegador.');

  context.font = '30px Figtree, sans-serif';
  const answerLines = wrapCanvasText(context, message.text, contentWidth);
  const citations = (message.sources || []).map(source => {
    context.font = '23px Figtree, sans-serif';
    const quote = source.content || `${source.dateRange?.start || 'Data não informada'} a ${source.dateRange?.end || 'data não informada'} · ${source.totalMessages ?? 0} mensagens`;
    return {
      source,
      quote,
      lines: wrapCanvasText(context, quote, contentWidth - 48),
    };
  });
  const height = padding + 116 + answerLines.length * 43
    + (citations.length ? 76 + citations.reduce((sum, item) => sum + 120 + item.lines.length * 34, 0) : 0)
    + 76;
  canvas.width = width;
  canvas.height = Math.max(640, height);

  context.fillStyle = '#091827';
  context.fillRect(0, 0, width, canvas.height);
  context.fillStyle = '#6bd8c7';
  context.font = '700 22px Figtree, sans-serif';
  context.fillText('MASTERIA', padding, padding + 14);
  context.fillStyle = '#b0bfca';
  context.font = '500 16px Figtree, sans-serif';
  context.fillText('RECOMENDEME · ACERVO MASTERWHATS', padding, padding + 44);

  let y = padding + 106;
  context.fillStyle = '#f2f5f7';
  context.font = '30px Figtree, sans-serif';
  for (const line of answerLines) {
    if (line) context.fillText(line, padding, y);
    y += 43;
  }

  if (citations.length) {
    y += 22;
    context.fillStyle = '#b0bfca';
    context.font = '600 14px Figtree, sans-serif';
    context.fillText('EVIDÊNCIAS', padding, y);
    y += 24;
    for (const { source, lines } of citations) {
      const cardHeight = 108 + lines.length * 34;
      context.fillStyle = '#102235';
      context.fillRect(padding, y, contentWidth, cardHeight);
      context.fillStyle = '#6bd8c7';
      context.fillRect(padding, y, 4, cardHeight);
      context.fillStyle = '#6bd8c7';
      context.font = '600 18px Figtree, sans-serif';
      context.fillText(source.sender || source.conversationName || 'Conversa', padding + 22, y + 28);
      context.fillStyle = '#f2f5f7';
      context.font = '23px Figtree, sans-serif';
      let quoteY = y + 62;
      for (const line of lines) {
        context.fillText(line, padding + 22, quoteY);
        quoteY += 34;
      }
      context.fillStyle = '#b0bfca';
      context.font = '16px Figtree, sans-serif';
      const metadata = source.messageId
        ? `${source.conversationName} · ${source.date || 'Data não informada'}${source.time ? ` ${source.time}` : ''} · mensagem ${source.messageId}`
        : `${source.dateRange?.start || 'Data não informada'} a ${source.dateRange?.end || 'data não informada'}`;
      context.fillText(metadata, padding + 22, y + cardHeight - 14);
      y += cardHeight + 12;
    }
  }

  context.fillStyle = '#b0bfca';
  context.font = '500 16px Figtree, sans-serif';
  context.fillText('Atribuição não é comprovação.', padding, canvas.height - 30);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Não foi possível gerar a imagem.'));
    }, 'image/png');
  });
}

function renderShareAction(message) {
  const tools = makeElement('div', 'master-ia-answer-tools');
  const button = makeElement('button', 'master-ia-share');
  button.type = 'button';
  button.appendChild(makeIcon('M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5'));
  button.appendChild(makeElement('span', '', 'Compartilhar imagem'));
  const status = makeElement('span', 'master-ia-share-status');
  status.setAttribute('role', 'status');
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = '';
    try {
      const blob = await createAnswerImage(message);
      const file = new File([blob], 'resposta-masteria.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Resposta da MasterIA' });
      } else {
        const url = URL.createObjectURL(blob);
        const download = makeElement('a');
        download.href = url;
        download.download = 'resposta-masteria.png';
        download.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = 'Imagem baixada.';
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        status.textContent = 'Não foi possível gerar ou compartilhar a imagem.';
        console.error('Falha ao compartilhar resposta da MasterIA:', error);
      }
    } finally {
      button.disabled = false;
    }
  });
  tools.append(button, status);
  return tools;
}

function renderMessage(message, onNavigate) {
  const row = makeElement('article', `master-ia-message master-ia-message-${message.role}`);
  row.appendChild(makeElement('div', 'master-ia-message-label', message.role === 'user' ? 'Você' : 'Master IA'));
  const bubble = makeElement('div', 'master-ia-message-bubble');
  if (message.pending) {
    const processing = makeElement('span', 'master-ia-processing');
    processing.setAttribute('role', 'status');
    processing.appendChild(makeElement('span', 'master-ia-processing-label', message.status || 'Consultando o acervo…'));
    processing.appendChild(makeElement('span', 'master-ia-typing-dots', '•••'));
    bubble.appendChild(processing);
  } else {
    bubble.appendChild(renderMarkdown(message.text));
    if (message.sources?.length) {
      bubble.appendChild(renderSources(message.sources, onNavigate));
      const graph = renderConnectionGraph(message.sources);
      if (graph) bubble.appendChild(graph);
    }
    else if (message.role === 'assistant' && message.text) bubble.appendChild(renderDatasetChip([]));
    if (message.role === 'assistant' && message.text) bubble.appendChild(renderShareAction(message));
  }
  row.appendChild(bubble);
  if (message.error) row.classList.add('master-ia-message-error');
  if (message.text === NO_EVIDENCE_MESSAGE) row.classList.add('master-ia-message-no-evidence');
  return { row, bubble };
}

function getService(store, config, fetcher) {
  if (!services.has(store)) {
    services.set(store, new MasterIAService({ store, config, fetcher }));
  }
  return services.get(store);
}

export function renderMasterIAPanel({
  store,
  conversations = store?.getConversations() || [],
  onBack = () => {},
  config = MASTER_IA_CONFIG,
  fetcher,
} = {}) {
  if (!store) throw new Error('renderMasterIAPanel requer o DataStore da aplicação.');
  const panel = makeElement('section', 'master-ia-panel');
  panel.setAttribute('aria-label', 'Master IA');

  const header = makeElement('header', 'master-ia-header');
  const back = makeElement('button', 'master-ia-back');
  back.appendChild(makeIcon('m15 18-6-6 6-6'));
  back.type = 'button';
  back.setAttribute('aria-label', 'Voltar para conversas');
  back.addEventListener('click', onBack);
  const brand = makeElement('div', 'master-ia-brand');
  const logo = makeElement('img', 'master-ia-logo');
  logo.src = '/assets/masterzap-logo.png';
  logo.alt = 'MasterWhats';
  logo.width = 32;
  logo.height = 32;
  const title = makeElement('h1', '', 'MasterIA');
  title.appendChild(makeElement('span', 'master-ia-verified', '✓'));
  brand.append(logo, title);
  const headerActions = makeElement('div', 'master-ia-header-actions');
  const historyButton = makeElement('button', 'master-ia-icon-button master-ia-history-button');
  historyButton.appendChild(makeIcon('M3 12a9 9 0 1 1 3 6.7M3 12V6m0 6h6m3-6v6l4 2'));
  historyButton.type = 'button';
  historyButton.setAttribute('aria-label', 'Histórico da conversa');
  historyButton.setAttribute('aria-expanded', 'false');
  const menuButton = makeElement('button', 'master-ia-icon-button master-ia-menu-button');
  menuButton.appendChild(makeIcon('M5 6h14M5 12h14M5 18h14'));
  menuButton.type = 'button';
  menuButton.setAttribute('aria-label', 'Menu');
  menuButton.setAttribute('aria-expanded', 'false');
  headerActions.append(historyButton, menuButton);

  const historyPopover = makeElement('section', 'master-ia-popover master-ia-history-popover');
  historyPopover.hidden = true;
  historyPopover.setAttribute('aria-label', 'Perguntas desta conversa');
  historyPopover.appendChild(makeElement('span', 'master-ia-eyebrow', 'HISTÓRICO DESTA CONVERSA'));
  const historyItems = makeElement('div', 'master-ia-history-items');
  historyPopover.appendChild(historyItems);

  const menuPopover = makeElement('div', 'master-ia-popover master-ia-menu-popover');
  menuPopover.hidden = true;
  const reset = makeElement('button', 'master-ia-reset', 'Nova conversa');
  reset.type = 'button';
  reset.addEventListener('click', () => {
    if (send.disabled) return;
    sessionHistory = [];
    messages.replaceChildren();
    welcome.hidden = false;
    historyPopover.hidden = true;
    historyButton.setAttribute('aria-expanded', 'false');
    menuPopover.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    textarea.value = '';
    resizeInput();
    updateComposer();
    textarea.focus();
  });
  menuPopover.appendChild(reset);
  header.append(back, brand, headerActions, historyPopover, menuPopover);
  panel.appendChild(header);

  const messages = makeElement('div', 'master-ia-messages');
  messages.setAttribute('aria-live', 'polite');
  const welcome = makeElement('section', 'master-ia-welcome');
  const welcomeLogo = makeElement('img', 'master-ia-welcome-logo');
  welcomeLogo.src = '/assets/masterzap-logo.png';
  welcomeLogo.alt = 'MasterWhats';
  welcomeLogo.width = 54;
  welcomeLogo.height = 54;
  welcome.appendChild(welcomeLogo);
  welcome.appendChild(makeElement('span', 'master-ia-eyebrow master-ia-welcome-eyebrow', 'ACERVO · 94 MIL MENSAGENS'));
  welcome.appendChild(makeElement('h2', '', 'Boa noite. O que você quer encontrar no acervo?'));
  welcome.appendChild(makeElement('p', '', 'Consulte pessoas, conversas e datas com fontes verificáveis.'));
  const suggestions = makeElement('div', 'master-ia-suggestions');
  for (const suggestion of SUGGESTIONS) {
    const button = makeElement('button', 'master-ia-suggestion');
    button.type = 'button';
    button.append(
      makeElement('span', 'master-ia-eyebrow', suggestion.category),
      makeElement('span', 'master-ia-suggestion-question', suggestion.question),
    );
    suggestions.appendChild(button);
  }
  welcome.appendChild(suggestions);
  messages.appendChild(welcome);

  const footer = makeElement('footer', 'master-ia-footer');
  const notice = makeElement('p', 'master-ia-notice', EMPTY_HINT);
  const form = makeElement('form', 'master-ia-composer');
  const textarea = makeElement('textarea', 'master-ia-input');
  textarea.rows = 1;
  textarea.maxLength = 2000;
  textarea.placeholder = 'Digite sua pergunta sobre o acervo';
  textarea.setAttribute('aria-label', 'Pergunta para a Master IA');
  textarea.setAttribute('enterkeyhint', 'send');
  textarea.setAttribute('autocomplete', 'off');
  textarea.spellcheck = true;
  const send = makeElement('button', 'master-ia-send');
  send.append(makeIcon('M5 12h14m-7-7 7 7-7 7'));
  send.type = 'submit';
  send.setAttribute('aria-label', 'Enviar pergunta');
  send.disabled = true;
  form.append(textarea, send);
  footer.append(notice, form);
  panel.append(messages, footer);

  const resizeInput = () => {
    textarea.style.height = '0';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };
  const updateComposer = () => {
    resizeInput();
    send.disabled = textarea.disabled || !textarea.value.trim();
  };

  const service = getService(store, config, fetcher);
  const renderHistory = () => {
    messages.replaceChildren();
    welcome.hidden = sessionHistory.length > 0;
    if (!sessionHistory.length) {
      messages.appendChild(welcome);
      return;
    }
    for (const [index, message] of sessionHistory.entries()) {
      const rendered = renderMessage(message, () => {});
      rendered.row.dataset.historyIndex = String(index);
      messages.appendChild(rendered.row);
    }
    messages.scrollTop = messages.scrollHeight;
  };

  const updateHistoryPopover = () => {
    historyItems.replaceChildren();
    const questions = sessionHistory
      .map((message, index) => ({ message, index }))
      .filter(({ message }) => message.role === 'user');
    if (!questions.length) {
      historyItems.appendChild(makeElement('p', 'master-ia-history-empty', 'As perguntas desta conversa aparecerão aqui.'));
      return;
    }
    for (const { message, index } of questions) {
      const item = makeElement('button', 'master-ia-history-item', message.text);
      item.type = 'button';
      item.addEventListener('click', () => {
        historyPopover.hidden = true;
        historyButton.setAttribute('aria-expanded', 'false');
        messages.querySelector(`[data-history-index="${index}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      historyItems.appendChild(item);
    }
  };

  historyButton.addEventListener('click', () => {
    const isOpening = historyPopover.hidden;
    menuPopover.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    if (isOpening) updateHistoryPopover();
    historyPopover.hidden = !isOpening;
    historyButton.setAttribute('aria-expanded', String(isOpening));
  });
  menuButton.addEventListener('click', () => {
    const isOpening = menuPopover.hidden;
    historyPopover.hidden = true;
    historyButton.setAttribute('aria-expanded', 'false');
    menuPopover.hidden = !isOpening;
    menuButton.setAttribute('aria-expanded', String(isOpening));
  });

  async function submitQuestion(question) {
    const text = question.trim();
    if (!text || send.disabled) return;
    welcome.hidden = true;
    const userMessage = { role: 'user', text };
    const assistantMessage = {
      role: 'assistant',
      text: '',
      sources: [],
      pending: true,
      status: 'Pesquisando nas conversas…',
    };
    const userHistoryIndex = sessionHistory.length;
    sessionHistory.push(userMessage, assistantMessage);
    const userRow = renderMessage(userMessage, () => {});
    const assistantRow = renderMessage(assistantMessage, () => {});
    userRow.row.dataset.historyIndex = String(userHistoryIndex);
    assistantRow.row.dataset.historyIndex = String(userHistoryIndex + 1);
    messages.append(userRow.row, assistantRow.row);
    textarea.value = '';
    resizeInput();
    send.disabled = true;
    textarea.disabled = true;
    reset.disabled = true;
    send.setAttribute('aria-label', 'Aguarde');
    messages.scrollTop = messages.scrollHeight;

    const updateStatus = status => {
      assistantMessage.status = status;
      const indicator = assistantRow.bubble.querySelector('.master-ia-processing-label');
      if (indicator) indicator.textContent = status;
    };

    try {
      const result = await service.answer(text, conversations, {
        onProgress: progress => {
          if (progress.stage === 'count') {
            updateStatus(`Contando mensagens originais… ${progress.current} de ${progress.total}`);
          } else if (progress.stage === 'deep-search') {
            updateStatus(`Conferindo mensagens completas… ${progress.current} de ${progress.total}`);
          } else {
            updateStatus(`Pesquisando conversas… ${progress.current} de ${progress.total}`);
          }
        },
        onToken: partial => {
          if (partial && assistantRow.row.isConnected) {
            assistantMessage.pending = false;
            assistantMessage.text = partial;
            assistantRow.bubble.replaceChildren(renderMarkdown(partial));
            messages.scrollTop = messages.scrollHeight;
          }
        },
      });
      assistantMessage.text = result.text;
      assistantMessage.sources = result.sources;
      assistantMessage.pending = false;
      assistantMessage.local = result.local;
      assistantRow.row.replaceWith(renderMessage(assistantMessage, () => {} ).row);
      messages.scrollTop = messages.scrollHeight;
    } catch (error) {
      assistantMessage.pending = false;
      assistantMessage.error = true;
      console.error('Não foi possível consultar a Master IA.', error);
      assistantMessage.text = 'Não foi possível concluir sua pergunta agora. Tente novamente em instantes.';
      assistantRow.row.replaceWith(renderMessage(assistantMessage, () => {}).row);
      messages.scrollTop = messages.scrollHeight;
    } finally {
      send.disabled = false;
      textarea.disabled = false;
      reset.disabled = false;
      send.setAttribute('aria-label', 'Enviar pergunta');
      updateComposer();
      textarea.focus();
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    submitQuestion(textarea.value);
  });
  textarea.addEventListener('input', updateComposer);
  textarea.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  suggestions.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    textarea.value = button.querySelector('.master-ia-suggestion-question')?.textContent || '';
    updateComposer();
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  });

  renderHistory();
  return panel;
}
