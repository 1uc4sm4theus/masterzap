import { MASTER_IA_CONFIG } from '../lib/master-ia-config.js';
import { MasterIAService, NO_EVIDENCE_MESSAGE } from '../lib/master-ia.js';
import { copyText } from '../lib/utils.js';

const EMPTY_HINT = 'Respostas baseadas nas mensagens do acervo. A atribuição não é comprovação. A pergunta e trechos encontrados podem ser enviados para análise externa.';
const SESSION_STORAGE_KEY = 'masterwhats:master-ia-sessions';
const MAX_SAVED_SESSIONS = 20;
const SUGGESTIONS = [
  { category: 'PESSOA', question: 'Quais conversas mencionam Alexandre de Moraes?' },
  { category: 'LINHA DO TEMPO', question: 'Quando começam e terminam as conversas com Martha Graeff?' },
  { category: 'REDE', question: 'Quem participa da conversa com Alexandre de Moraes?' },
  { category: 'CONVERSA', question: 'O que foi dito sobre o Banco Master?' },
  { category: 'ACERVO', question: 'Quantas vezes Martha Graeff é mencionada?' },
];

const services = new WeakMap();

function createSessionId() {
  return globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored
      .filter(session => session && typeof session.id === 'string' && Array.isArray(session.messages))
      .map(session => ({
        ...session,
        messages: session.messages
          .filter(message => message && ['user', 'assistant'].includes(message.role) && typeof message.text === 'string')
          .map(message => message.pending
            ? {
              ...message,
              id: message.id || createSessionId(),
              pending: false,
              state: 'cancelled',
              cancelled: true,
              text: message.text || 'Geração interrompida.',
            }
            : { ...message, id: message.id || createSessionId() }),
      }))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, MAX_SAVED_SESSIONS);
  } catch (error) {
    console.warn('O histórico da Master IA não pôde ser carregado.', error);
    return [];
  }
}

let savedSessions = loadSessions();
let activeSessionId = savedSessions[0]?.id || createSessionId();
let sessionHistory = savedSessions.find(session => session.id === activeSessionId)?.messages || [];

function persistSession() {
  if (!sessionHistory.length) {
    savedSessions = savedSessions.filter(item => item.id !== activeSessionId);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(savedSessions));
    } catch (error) {
      console.warn('O histórico da Master IA não pôde ser salvo.', error);
    }
    return;
  }
  const firstQuestion = sessionHistory.find(message => message.role === 'user')?.text || 'Nova conversa';
  const session = {
    id: activeSessionId,
    title: firstQuestion.length > 72 ? `${firstQuestion.slice(0, 69)}…` : firstQuestion,
    updatedAt: Date.now(),
    messages: sessionHistory,
  };
  savedSessions = [session, ...savedSessions.filter(item => item.id !== activeSessionId)]
    .slice(0, MAX_SAVED_SESSIONS);
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(savedSessions));
  } catch (error) {
    console.warn('O histórico da Master IA não pôde ser salvo.', error);
  }
}

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
  const pattern = /(`[^`]+`|~~[^~]+~~|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) parent.appendChild(document.createTextNode(text.slice(cursor, match.index)));
    const token = match[0];
    let node;
    if (token.startsWith('**') || token.startsWith('__')) {
      node = document.createElement('strong');
      node.textContent = token.slice(2, -2);
    } else if (token.startsWith('~~')) {
      node = document.createElement('del');
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

function splitTableRow(line) {
  const value = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let cell = '';
  let escaped = false;
  for (const char of value) {
    if (char === '|' && !escaped) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
    escaped = char === '\\' && !escaped;
    if (char !== '\\') escaped = false;
  }
  cells.push(cell.trim());
  return cells;
}

function isTableDivider(line) {
  return splitTableRow(line).length > 0
    && splitTableRow(line).every(cell => /^:?-{3,}:?$/.test(cell));
}

function renderCodeBlock(lines, language) {
  const pre = makeElement('pre', 'master-ia-code-block');
  const code = makeElement('code', language && /^[\w+-]+$/.test(language) ? `language-${language}` : '', lines.join('\n'));
  const copy = makeElement('button', 'master-ia-code-copy', 'Copiar código');
  const status = makeElement('span', 'master-ia-code-status');
  status.setAttribute('role', 'status');
  copy.type = 'button';
  copy.addEventListener('click', async () => {
    copy.disabled = true;
    const copied = await copyText(code.textContent);
    status.textContent = copied ? 'Código copiado.' : 'Não foi possível copiar o código.';
    copy.disabled = false;
  });
  pre.append(copy, status, code);
  return pre;
}

export function renderMarkdown(text) {
  const content = document.createElement('div');
  content.className = 'master-ia-markdown';
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index++;
      continue;
    }

    const fence = line.match(/^\s*(```+|~~~+)\s*([\w+-]*)\s*$/);
    if (fence) {
      const codeLines = [];
      index++;
      while (index < lines.length && !new RegExp(`^\\s*${fence[1][0]}{${fence[1].length},}\\s*$`).test(lines[index])) {
        codeLines.push(lines[index++]);
      }
      if (index < lines.length) index++;
      content.appendChild(renderCodeBlock(codeLines, fence[2]));
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const element = document.createElement(`h${heading[1].length}`);
      appendInline(element, heading[2]);
      content.appendChild(element);
      index++;
      continue;
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
      content.appendChild(document.createElement('hr'));
      index++;
      continue;
    }

    if (line.includes('|') && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = splitTableRow(line);
      const dividers = splitTableRow(lines[index + 1]);
      const table = makeElement('table', 'master-ia-table');
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headers.forEach((header, cellIndex) => {
        const cell = document.createElement('th');
        const divider = dividers[cellIndex] || '---';
        cell.style.textAlign = divider.startsWith(':') && divider.endsWith(':')
          ? 'center'
          : divider.endsWith(':') ? 'right' : 'left';
        appendInline(cell, header);
        headerRow.appendChild(cell);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        const row = document.createElement('tr');
        splitTableRow(lines[index++]).forEach((value, cellIndex) => {
          const cell = document.createElement('td');
          const divider = dividers[cellIndex] || '---';
          cell.style.textAlign = divider.startsWith(':') && divider.endsWith(':')
            ? 'center'
            : divider.endsWith(':') ? 'right' : 'left';
          appendInline(cell, value);
          row.appendChild(cell);
        });
        tbody.appendChild(row);
      }
      table.appendChild(tbody);
      const tableWrap = makeElement('div', 'master-ia-table-wrap');
      tableWrap.appendChild(table);
      content.appendChild(tableWrap);
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoteLines = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoteLines.push(lines[index++].replace(/^\s*>\s?/, ''));
      }
      const quote = document.createElement('blockquote');
      quote.append(...renderMarkdown(quoteLines.join('\n')).childNodes);
      content.appendChild(quote);
      continue;
    }

    const listMatch = line.match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1]);
      const list = document.createElement(ordered ? 'ol' : 'ul');
      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);
        if (!itemMatch || /^\d/.test(itemMatch[1]) !== ordered) break;
        const item = document.createElement('li');
        appendInline(item, itemMatch[2]);
        list.appendChild(item);
        index++;
      }
      content.appendChild(list);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && lines[index].trim()
        && !/^(?:#{1,6}\s|```+|~~~+|\s*>|\s*([-*+]|\d+[.)])\s+)/.test(lines[index])
        && !/^\s*(?:[-*_]\s*){3,}$/.test(lines[index])
        && !(lines[index].includes('|') && index + 1 < lines.length && isTableDivider(lines[index + 1]))) {
      paragraph.push(lines[index++]);
    }
    const element = document.createElement('p');
    paragraph.forEach((paragraphLine, lineIndex) => {
      if (lineIndex) element.appendChild(document.createElement('br'));
      appendInline(element, paragraphLine);
    });
    content.appendChild(element);
  }
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
  return [button, status];
}

function renderActivity(status) {
  const processing = makeElement('span', 'master-ia-processing');
  processing.setAttribute('role', 'status');
  processing.append(
    makeElement('span', 'master-ia-processing-label', status || 'A Master IA está respondendo…'),
    makeElement('span', 'master-ia-typing-dots', '•••'),
  );
  return processing;
}

function renderAnswerActions(message, onRegenerate, canRegenerate) {
  const tools = makeElement('div', 'master-ia-answer-tools');
  const copy = makeElement('button', 'master-ia-copy-answer', 'Copiar resposta');
  const status = makeElement('span', 'master-ia-copy-status');
  copy.type = 'button';
  status.setAttribute('role', 'status');
  copy.addEventListener('click', async () => {
    copy.disabled = true;
    const copied = await copyText(message.text);
    status.textContent = copied ? 'Resposta copiada.' : 'Não foi possível copiar a resposta.';
    copy.disabled = false;
  });
  tools.append(copy, status);

  if (canRegenerate) {
    const regenerate = makeElement('button', 'master-ia-regenerate', 'Regenerar');
    regenerate.type = 'button';
    regenerate.addEventListener('click', onRegenerate);
    tools.appendChild(regenerate);
  }
  const [share, shareStatus] = renderShareAction(message);
  tools.append(share, shareStatus);
  return tools;
}

function renderMessage(message, onNavigate, { onRegenerate, canRegenerate = false } = {}) {
  const row = makeElement('article', `master-ia-message master-ia-message-${message.role}`);
  row.dataset.state = message.state || (message.pending ? 'thinking' : 'completed');
  if (message.error) row.setAttribute('role', 'alert');
  row.appendChild(makeElement('div', 'master-ia-message-label', message.role === 'user' ? 'Você' : 'Master IA'));
  const bubble = makeElement('div', 'master-ia-message-bubble');
  if (message.pending) {
    bubble.appendChild(renderActivity(message.status || 'Consultando o acervo…'));
  } else {
    bubble.appendChild(renderMarkdown(message.text));
    if (message.state === 'streaming') {
      bubble.appendChild(renderActivity(message.status));
    } else if (message.cancelled) {
      const cancelled = makeElement('span', 'master-ia-cancelled-label', 'Geração interrompida.');
      cancelled.setAttribute('role', 'status');
      bubble.appendChild(cancelled);
    }
    if (message.sources?.length) {
      bubble.appendChild(renderSources(message.sources, onNavigate));
      const graph = renderConnectionGraph(message.sources);
      if (graph) bubble.appendChild(graph);
    }
    else if (message.role === 'assistant' && message.text) bubble.appendChild(renderDatasetChip([]));
    if (message.role === 'assistant' && message.text) {
      bubble.appendChild(renderAnswerActions(message, onRegenerate, canRegenerate));
    }
  }
  row.appendChild(bubble);
  if (message.error) {
    row.setAttribute('role', 'alert');
    if (!message.local) row.classList.add('master-ia-message-error');
  }
  if (message.cancelled) row.classList.add('master-ia-message-cancelled');
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
  panel.dataset.generationState = 'idle';
  let activeController = null;
  let isGenerating = false;
  let autoFollow = true;
  let followFrame = null;
  let lastScrollTop = 0;

  const header = makeElement('header', 'master-ia-header');
  const back = makeElement('button', 'master-ia-back');
  back.appendChild(makeIcon('m15 18-6-6 6-6'));
  back.type = 'button';
  back.setAttribute('aria-label', 'Voltar para conversas');
  back.addEventListener('click', () => {
    activeController?.abort();
    onBack();
  });
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
  historyPopover.setAttribute('aria-label', 'Histórico de conversas');
  historyPopover.appendChild(makeElement('span', 'master-ia-eyebrow', 'HISTÓRICO DESTA CONVERSA'));
  const historyItems = makeElement('div', 'master-ia-history-items');
  historyPopover.appendChild(historyItems);
  historyPopover.appendChild(makeElement('span', 'master-ia-eyebrow master-ia-session-heading', 'SESSÕES RECENTES'));
  const sessionItems = makeElement('div', 'master-ia-history-items master-ia-session-items');
  historyPopover.appendChild(sessionItems);

  const menuPopover = makeElement('div', 'master-ia-popover master-ia-menu-popover');
  menuPopover.hidden = true;
  const reset = makeElement('button', 'master-ia-reset', 'Nova conversa');
  reset.type = 'button';
  reset.addEventListener('click', () => {
    if (isGenerating) return;
    persistSession();
    activeSessionId = createSessionId();
    sessionHistory = [];
    renderHistory();
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
  welcome.appendChild(makeElement('span', 'master-ia-eyebrow master-ia-welcome-eyebrow', 'ACERVO · 97 MIL MENSAGENS'));
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
    send.disabled = !isGenerating && !textarea.value.trim();
    textarea.disabled = isGenerating;
    reset.disabled = isGenerating;
    historyButton.disabled = isGenerating;
    menuButton.disabled = isGenerating;
    send.setAttribute('aria-label', isGenerating ? 'Parar geração' : 'Enviar pergunta');
    send.title = isGenerating ? 'Parar geração' : 'Enviar pergunta';
    send.classList.toggle('is-stop', isGenerating);
    send.replaceChildren(makeIcon(isGenerating
      ? 'M7 7h10v10H7z'
      : 'M5 12h14m-7-7 7 7-7 7'));
  };

  const service = getService(store, config, fetcher);
  const isNearBottom = () => messages.scrollHeight - messages.clientHeight - messages.scrollTop <= 64;
  const stopFollowing = () => {
    if (followFrame !== null) cancelAnimationFrame(followFrame);
    followFrame = null;
  };
  const scrollToBottom = () => {
    messages.scrollTop = messages.scrollHeight;
    lastScrollTop = messages.scrollTop;
  };
  const followToBottom = () => {
    if (followFrame !== null) return;
    followFrame = requestAnimationFrame(() => {
      followFrame = null;
      if (!autoFollow) return;
      const bottom = Math.max(0, messages.scrollHeight - messages.clientHeight);
      messages.scrollTop = bottom;
      lastScrollTop = messages.scrollTop;
    });
  };
  messages.addEventListener('scroll', () => {
    const currentScrollTop = messages.scrollTop;
    if (isGenerating || followFrame !== null) {
      if (currentScrollTop < lastScrollTop - 1) {
        autoFollow = false;
        stopFollowing();
      } else if (isNearBottom()) {
        autoFollow = true;
        if (isGenerating) followToBottom();
      }
    }
    lastScrollTop = currentScrollTop;
  }, { passive: true });

  function closePopovers() {
    historyPopover.hidden = true;
    historyButton.setAttribute('aria-expanded', 'false');
    menuPopover.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }

  const renderHistory = () => {
    stopFollowing();
    messages.replaceChildren();
    welcome.hidden = sessionHistory.length > 0;
    if (!sessionHistory.length) {
      messages.appendChild(welcome);
      return;
    }
    for (const [index, message] of sessionHistory.entries()) {
      const canRegenerate = index === sessionHistory.length - 1
        && message.role === 'assistant'
        && !message.pending;
      const rendered = renderMessage(message, () => {}, {
        canRegenerate,
        onRegenerate: () => regenerateLastResponse(message),
      });
      rendered.row.dataset.historyIndex = String(index);
      messages.appendChild(rendered.row);
    }
    autoFollow = true;
    scrollToBottom();
  };

  const updateHistoryPopover = () => {
    historyItems.replaceChildren();
    sessionItems.replaceChildren();
    const questions = sessionHistory
      .map((message, index) => ({ message, index }))
      .filter(({ message }) => message.role === 'user');
    if (!questions.length) {
      historyItems.appendChild(makeElement('p', 'master-ia-history-empty', 'As perguntas desta conversa aparecerão aqui.'));
    } else {
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
    }
    const previousSessions = savedSessions.filter(session => session.id !== activeSessionId);
    if (!previousSessions.length) {
      sessionItems.appendChild(makeElement('p', 'master-ia-history-empty', 'Suas outras conversas aparecerão aqui.'));
      return;
    }
    for (const session of previousSessions) {
      const item = makeElement('button', 'master-ia-history-item master-ia-session-item', session.title || 'Conversa sem título');
      item.type = 'button';
      item.addEventListener('click', () => {
        if (isGenerating) return;
        persistSession();
        const selected = savedSessions.find(entry => entry.id === session.id);
        if (!selected) return;
        activeSessionId = selected.id;
        sessionHistory = selected.messages;
        renderHistory();
        closePopovers();
      });
      sessionItems.appendChild(item);
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

  function setGenerationState(state, status, message, row) {
    panel.dataset.generationState = state;
    if (status) {
      message.status = status;
      const indicator = row.bubble.querySelector('.master-ia-processing-label');
      if (indicator) indicator.textContent = status;
    }
    message.state = state;
    row.row.dataset.state = state;
  }

  async function regenerateLastResponse(message) {
    if (isGenerating) return;
    const assistantIndex = sessionHistory.findIndex(item => item.id === message.id);
    const userMessage = sessionHistory[assistantIndex - 1];
    if (assistantIndex !== sessionHistory.length - 1 || userMessage?.role !== 'user') return;
    const question = userMessage.text;
    sessionHistory.splice(assistantIndex - 1);
    persistSession();
    renderHistory();
    await submitQuestion(question);
  }

  async function submitQuestion(question) {
    const text = question.trim();
    if (!text || isGenerating) return;
    const controller = new AbortController();
    activeController = controller;
    isGenerating = true;
    autoFollow = true;
    panel.dataset.generationState = 'sending';
    welcome.hidden = true;
    const userMessage = { id: createSessionId(), role: 'user', text };
    const assistantMessage = {
      id: createSessionId(),
      role: 'assistant',
      text: '',
      sources: [],
      pending: true,
      status: 'Pesquisando nas conversas…',
      state: 'thinking',
    };
    const userHistoryIndex = sessionHistory.length;
    sessionHistory.push(userMessage, assistantMessage);
    const userRow = renderMessage(userMessage, () => {});
    const assistantRow = renderMessage(assistantMessage, () => {}, {
      canRegenerate: true,
      onRegenerate: () => regenerateLastResponse(assistantMessage),
    });
    userRow.row.dataset.historyIndex = String(userHistoryIndex);
    assistantRow.row.dataset.historyIndex = String(userHistoryIndex + 1);
    messages.classList.add('is-generating');
    messages.append(userRow.row, assistantRow.row);
    textarea.value = '';
    updateComposer();
    persistSession();
    scrollToBottom();

    try {
      const result = await service.answer(text, conversations, {
        signal: controller.signal,
        onState: state => {
          const labels = {
            thinking: 'Analisando as evidências…',
            sending: 'Enviando solicitação segura…',
            streaming: 'Gerando resposta…',
          };
          setGenerationState(state, labels[state], assistantMessage, assistantRow);
        },
        onProgress: progress => {
          if (progress.stage === 'count') {
            setGenerationState('thinking', `Contando mensagens originais… ${progress.current} de ${progress.total}`, assistantMessage, assistantRow);
          } else if (progress.stage === 'deep-search') {
            setGenerationState('thinking', `Conferindo mensagens completas… ${progress.current} de ${progress.total}`, assistantMessage, assistantRow);
          } else {
            setGenerationState('thinking', `Pesquisando conversas… ${progress.current} de ${progress.total}`, assistantMessage, assistantRow);
          }
        },
        onToken: partial => {
          if (partial && assistantRow.row.isConnected) {
            const shouldFollow = autoFollow || isNearBottom();
            autoFollow = shouldFollow;
            assistantMessage.pending = false;
            assistantMessage.text = partial;
            assistantMessage.state = 'streaming';
            assistantRow.row.dataset.state = 'streaming';
            assistantRow.bubble.replaceChildren(
              renderMarkdown(partial),
              renderActivity(assistantMessage.status),
            );
            if (shouldFollow) followToBottom();
          }
        },
      });
      const shouldFollow = autoFollow || isNearBottom();
      assistantMessage.text = result.text;
      assistantMessage.sources = result.sources;
      assistantMessage.pending = false;
      assistantMessage.local = result.local;
      assistantMessage.error = result.synthesisAvailable === false;
      assistantMessage.state = assistantMessage.error ? 'error' : 'completed';
      assistantRow.row.replaceWith(renderMessage(assistantMessage, () => {}, {
        canRegenerate: true,
        onRegenerate: () => regenerateLastResponse(assistantMessage),
      }).row);
      if (shouldFollow) {
        autoFollow = true;
        followToBottom();
      }
      persistSession();
    } catch (error) {
      assistantMessage.pending = false;
      if (controller.signal.aborted) {
        assistantMessage.cancelled = true;
        assistantMessage.state = 'cancelled';
        assistantMessage.text ||= '';
      } else {
        assistantMessage.error = true;
        assistantMessage.state = 'error';
        console.error('Não foi possível consultar a Master IA.', error);
        assistantMessage.text = error?.message?.includes('tempo esperado')
          ? 'A análise demorou mais que o tempo esperado. Tente novamente em instantes.'
          : 'Não foi possível concluir sua pergunta agora. Tente novamente em instantes.';
      }
      assistantRow.row.replaceWith(renderMessage(assistantMessage, () => {}, {
        canRegenerate: true,
        onRegenerate: () => regenerateLastResponse(assistantMessage),
      }).row);
      if (autoFollow || isNearBottom()) {
        autoFollow = true;
        followToBottom();
      }
      persistSession();
    } finally {
      activeController = null;
      isGenerating = false;
      panel.dataset.generationState = 'idle';
      messages.classList.remove('is-generating');
      updateComposer();
      textarea.focus();
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (activeController) {
      activeController.abort();
      return;
    }
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
