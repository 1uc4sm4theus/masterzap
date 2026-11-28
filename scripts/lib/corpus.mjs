/**
 * What the build scripts share: where the conversations are, how to read them
 * and how the site's content links turn into plain Markdown or HTML.
 *
 * Versão independente: não usa src/lib/provenance.js, quote.js, utils.js nem
 * participants.js. A única dependência do app é src/config/site.js (domínio).
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from '../../src/config/site.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const DATA_DIR = join(ROOT, 'data');
export const PUBLIC_DATA = join(ROOT, 'public/data');

/** The site's address — src/config/site.js decides it, for the app and the build alike. */
export const SITE = SITE_URL;
export { REPO_URL as REPO } from '../../src/config/site.js';

// The phones were seized in Brazil and every timestamp in the sources is local
// wall-clock time. Brazil has had no daylight saving since 2019, so from the
// first message (December 2023) on the offset is a constant.
export const TIMEZONE = 'America/Sao_Paulo';
export const UTC_OFFSET = '-03:00';

/** The conversations as the site lists them, newest first. */
export function loadEntries() {
  return JSON.parse(readFileSync(join(PUBLIC_DATA, 'conversations.json'), 'utf-8')).conversations;
}

/** The Martha export is the one source without a per-conversation file. */
export function loadMessages(entry) {
  const fromReport = join(DATA_DIR, 'conversations', `${entry.id}.json`);
  if (existsSync(fromReport)) {
    return JSON.parse(readFileSync(fromReport, 'utf-8')).messages;
  }
  return JSON.parse(readFileSync(join(DATA_DIR, 'messages.json'), 'utf-8')).messages;
}

/** data/sources.json, by id, when the project has it; an empty map otherwise. */
let sourcesById = null;
export function loadSources() {
  if (!sourcesById) {
    const file = join(DATA_DIR, 'sources.json');
    sourcesById = existsSync(file)
      ? new Map(JSON.parse(readFileSync(file, 'utf-8')).sources.map(s => [s.id, s]))
      : new Map();
  }
  return sourcesById;
}

/** Kinds of source that are official records rather than reporting. */
export const OFFICIAL_KINDS = new Set(['laudo-pf', 'peticao-stf', 'police-report']);

// ── participants ───────────────────────────────────────────────────────────

/** The phone's owner, as titles name him. */
export const ownerName = (entry) => entry?.owner_name || 'Daniel Vorcaro';

/** The other side: the name split_data.py recorded, else the participant who is not the owner. */
export const contactOf = (entry) =>
  entry.contact
  || (entry.participants || []).find(p => p !== (entry.owner || 'DV'))
  || (entry.participants || [])[0]
  || entry.id;

/** How a conversation is titled: "Grupo Macallan", or "Daniel Vorcaro ↔ Fábio Faria". */
export const pairTitle = (entry, who) =>
  (entry?.is_group ? `Grupo ${contactOf(entry)}` : `${ownerName(entry)} ↔ ${who}`);

/** The person, as opposed to the name the phone saved them under. */
export const whoIs = (entry, profile) =>
  profile?.name || profile?.sections?.[0]?.title?.replace(/^Sobre /, '') || contactOf(entry);

// ── sources ────────────────────────────────────────────────────────────────

/**
 * Where a conversation's text came from, in the terms the reader will need.
 * Uses data/sources.json when the conversation has a source_id registered
 * there; otherwise falls back to what conversations.json carries.
 */
export function sourceOf(entry) {
  const src = entry.source_id ? loadSources().get(entry.source_id) : null;
  if (src) {
    return {
      id: src.id,
      kind: src.kind,
      label: src.titulo,
      name: src.nome || null,
      description: src.descricao || null,
      outlet: src.orgao_ou_veiculo || null,
      date: src.data || null,
      verification: entry.verification || null,
      document: src.file || null,
      document_url: src.url || null,
      document_download: src.download || null,
      document_sha256: src.sha256 || null,
      document_pages: src.pages || null,
      archive_url: src.archive_url || null,
      made_public: src.made_public || null,
      how: src.how,
    };
  }
  if (entry.source_detail) {
    return { ...entry.source_detail, label: entry.source_detail.label || entry.source };
  }
  if (entry.source?.startsWith('IPJ-A')) {
    const doc = entry.source_document || {};
    return {
      kind: 'police-report',
      label: entry.source,
      document: doc.file || null,
      document_url: doc.url || null,
      document_download: doc.download || null,
      document_sha256: doc.sha256 || null,
      document_pages: doc.pages || null,
      made_public: '2026-09-01',
      how: 'Transcrição manual das imagens do laudo; cada mensagem cita a página e a figura de origem.',
    };
  }
  if (entry.source === 'Conteúdo fornecido pelo usuário') {
    return {
      kind: 'user-provided',
      label: entry.source,
      document: null,
      document_sha256: null,
      made_public: null,
      how: 'Conteúdo fornecido diretamente para inclusão no projeto.',
    };
  }
  return {
    kind: 'leak',
    label: 'Vazamento das conversas com Martha Graeff, março de 2026',
    document: null,
    document_sha256: null,
    made_public: '2026-03',
    how: 'Export de WhatsApp extraído do celular apreendido, vazado para a imprensa.',
  };
}

const SEAL_LABELS = {
  verificado: 'Verificado',
  'nao-verificado': 'Não verificado',
  imprensa: 'Imprensa',
};
const sealLabel = (seal) => (seal ? SEAL_LABELS[seal] || seal : null);

/** One line about where the conversation came from: "Verificado · <fonte>", or just the source. */
export function sealSummary(entry) {
  const source = sourceOf(entry);
  const where = source.outlet ? `${source.label}, ${source.outlet}` : source.label;
  const seal = sealLabel(entry.verification);
  return seal ? `${seal} · ${where}` : where;
}

/**
 * What a message from another source than its conversation's says beside it:
 * its own seal and source, when they differ from the conversation's.
 */
export function messageProvenanceTags(msg, entry, { standalone = false } = {}) {
  const tags = [];
  const seal = msg.verification || entry.verification;
  const baseline = standalone ? 'verificado' : entry.verification;
  if (seal && seal !== baseline && SEAL_LABELS[seal]) tags.push(SEAL_LABELS[seal].toLowerCase());
  if (msg.source_id && msg.source_id !== entry.source_id) {
    tags.push(`fonte: ${loadSources().get(msg.source_id)?.titulo || msg.source_id}`);
  }
  return tags;
}

// ── text helpers ───────────────────────────────────────────────────────────

export const urlsIn = (text) => [...text.matchAll(/\{[^}]+\}\[(https?:\/\/[^\]]+)\]/g)].map(m => m[1]);

export const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** The app's search normalisation (src/lib/search.js), mirrored. */
export const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ── highlights that point at a message ─────────────────────────────────────

/**
 * Turn the site's `action:search` links into a message each, at build time.
 * A term that matches nothing is a broken highlight, and the build fails on it.
 */
export function createResolver(entries) {
  const byId = new Map(entries.map(e => [e.id, e]));
  const cache = new Map();
  const messagesOf = (id) => {
    if (!cache.has(id)) {
      const entry = byId.get(id);
      if (!entry) throw new Error(`destaque aponta para conversa inexistente: ${id}`);
      cache.set(id, loadMessages(entry));
    }
    return cache.get(id);
  };
  function resolve(conversationId, term) {
    const needle = normalize(term);
    const msg = messagesOf(conversationId).find(m => normalize(m.content || '').includes(needle));
    if (!msg) throw new Error(`destaque sem mensagem: ${conversationId} "${term}"`);
    return { conversationId, msg };
  }
  resolve.messagesOf = messagesOf;
  return resolve;
}

/**
 * Every message that names a person, by conversation.
 *
 * @returns {Map<string, object[]>} conversation id → messages, in order; only
 *   conversations with at least one mention
 */
export function mentionsOf(person, entries, messagesOf) {
  const rules = person.aliases.map(a => ({
    re: new RegExp(`(^|[^a-z0-9])${normalize(a.match)}([^a-z0-9]|$)`),
    only: a.only ? new Set(a.only) : null,
    unless: a.unless ? new RegExp(a.unless) : null,
  }));
  const found = new Map();
  for (const entry of entries) {
    const hits = [];
    for (const m of messagesOf(entry.id)) {
      const text = normalize(m.content || '');
      const rule = rules.find(r => (!r.only || r.only.has(entry.id)) && r.re.test(text) && !(r.unless && r.unless.test(text)));
      if (rule) hits.push({ msg: m, alias: person.aliases[rules.indexOf(rule)].match });
    }
    if (hits.length) found.set(entry.id, hits);
  }
  return found;
}

// ── dates ──────────────────────────────────────────────────────────────────

// A message's date may be partial ("2024-07", "2024") or absent ("sem-data").
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MONTH = /^\d{4}-\d{2}$/;
const YEAR = /^\d{4}$/;
export const NO_DATE = 'Data não informada';

/** "2024-07-02" → "02/07/2024"; "2024-07" → "07/2024"; "2024" → "2024". */
export const brDate = (iso) => (DAY.test(iso || '') ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
  : MONTH.test(iso || '') ? `${iso.slice(5, 7)}/${iso.slice(0, 4)}`
  : YEAR.test(iso || '') ? iso
  : NO_DATE);

/** The month a message belongs to, for the per-month pages. */
export const monthOf = (date) => (DAY.test(date || '') || MONTH.test(date || '') ? date.slice(0, 7) : YEAR.test(date || '') ? date : 'sem-data');

const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const monthYearFmt = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

/** "15 de novembro de 2025"; a partial date says only what it knows. */
export const longDate = (iso) => (DAY.test(iso || '') ? dateFmt.format(new Date(`${iso}T12:00:00`))
  : MONTH.test(iso || '') ? monthYearFmt.format(new Date(`${iso}-15T12:00:00`))
  : YEAR.test(iso || '') ? iso
  : NO_DATE);

/** A conversation's period in words: "de X a Y", "em X", or "sem data conhecida". */
export function periodOf(range) {
  const { start, end } = range || {};
  if (!start || start === 'sem-data') return 'sem data conhecida';
  return start === end ? `em ${start}` : `de ${start} a ${end}`;
}

/** A timestamp with the zone, or null when the time is not known. */
export const zonedTimestamp = (msg) => {
  if (!msg.timestamp) return null;
  return /[+-]\d{2}:\d{2}$/.test(msg.timestamp) ? msg.timestamp : `${msg.timestamp}${UTC_OFFSET}`;
};

// ── citations and locations ────────────────────────────────────────────────

let entriesById = null;
const entryOf = (conversationId) => {
  if (!conversationId) return null;
  entriesById ??= new Map(loadEntries().map(e => [e.id, e]));
  return entriesById.get(conversationId) || null;
};

/** Where in its document a message is: "laudo p. 109, fig. 108", or ''. */
export function pageOf(msg, conversationId) {
  if (!msg.source_page) return '';
  const sourceId = msg.source_id || entryOf(conversationId)?.source_id;
  const word = loadSources().get(sourceId)?.cita || 'laudo';
  return `${word} p. ${msg.source_page}${msg.source_figure ? `, fig. ${msg.source_figure}` : ''}`;
}

/** "15/11/2025 18:22 · laudo p. 109, fig. 108" — what a quote needs to be checked. */
export function citationOf(msg, conversationId, { standalone = false } = {}) {
  const parts = [msg.time ? `${brDate(msg.date)} ${msg.time.slice(0, 5)}` : `${brDate(msg.date)}, horário não informado`];
  const page = pageOf(msg, conversationId);
  if (page) parts.push(page);
  const entry = entryOf(conversationId);
  if (entry) parts.push(...messageProvenanceTags(msg, entry, { standalone }));
  return parts.join(' · ');
}

/** A conversation with more messages than this gets one static page per month. */
export const PREVIEW_MESSAGES = 200;
export const isPaged = (entry) => entry.total_messages > PREVIEW_MESSAGES;

/** Where a message's anchor lives in the static site. */
export function createLocator(entries) {
  const byId = new Map(entries.map(e => [e.id, e]));
  return (conversationId, msg) => {
    const entry = byId.get(conversationId);
    if (!entry) return null;
    return isPaged(entry) ? `/chat/${conversationId}/${monthOf(msg.date)}#msg-${msg.id}` : `/chat/${conversationId}#msg-${msg.id}`;
  };
}

export const messageUrl = (conversationId, msg) => `${SITE}/#/chat/${conversationId}/msg/${msg.id}`;

// ── the site's {text}[url] links ───────────────────────────────────────────

function targetOf(url, { resolve, context } = {}) {
  if (!url.startsWith('action:')) return { kind: 'external', url };
  const search = url.match(/^action:search(?:@([^:]+))?:(.+)$/);
  if (search) {
    const conversationId = search[1] || context;
    if (!resolve) return { kind: 'text' };
    if (!conversationId) throw new Error(`destaque sem conversa de contexto: ${url}`);
    return { kind: 'message', ...resolve(conversationId, search[2]) };
  }
  const contact = url.match(/^action:contact:(.+)$/);
  if (contact) return { kind: 'conversation', conversationId: contact[1] };
  if (url === 'action:contact-martha') return { kind: 'conversation', conversationId: 'martha-graeff' };
  return { kind: 'text' };
}

/**
 * The site's {text}[url] links, rendered for a medium that is not the app.
 * opts: mode ('md' | 'html' | 'text'), resolve, context, samePage, hrefFor, fromPath.
 */
export function renderLinks(text, opts = {}) {
  const mode = opts.mode || 'md';
  const esc = mode === 'html' ? escapeHtml : (s) => s;
  const link = (label, href) => (mode === 'md' ? `[${label}](${href})`
    : mode === 'html' ? `<a href="${escapeHtml(href)}"${href.startsWith('http') ? ' rel="noopener"' : ''}>${escapeHtml(label)}</a>`
    : label);
  const cite = (msg, conversationId) => {
    const where = citationOf(msg, conversationId, { standalone: conversationId !== (opts.samePage ?? opts.context) });
    return mode === 'html' ? ` <small>⟨${escapeHtml(where)}⟩</small>` : ` ⟨${where}⟩`;
  };

  let out = '';
  let last = 0;
  for (const m of text.matchAll(/\{([^}]+)\}\[([^\]]+)\]/g)) {
    out += esc(text.slice(last, m.index));
    const [, label, url] = m;
    const target = targetOf(url, opts);
    switch (target.kind) {
      case 'external':
        out += link(label, target.url); break;
      case 'message': {
        let placed = opts.hrefFor?.(target.conversationId, target.msg) || null;
        if (placed && opts.fromPath && placed.startsWith(`${opts.fromPath}#`)) placed = placed.slice(opts.fromPath.length);
        if (placed && mode === 'md' && placed.startsWith('/')) placed = `${SITE}${placed}`;
        const href = placed || ((mode === 'html' && opts.samePage === target.conversationId)
          ? `#msg-${target.msg.id}` : messageUrl(target.conversationId, target.msg));
        out += link(label, href) + cite(target.msg, target.conversationId); break;
      }
      case 'conversation':
        out += link(label, mode === 'html' ? `/chat/${target.conversationId}` : `${SITE}/chat/${target.conversationId}`); break;
      default:
        out += esc(label);
    }
    last = m.index + m[0].length;
  }
  return out + esc(text.slice(last));
}

export const linksToMarkdown = (text, opts) => renderLinks(text, { ...opts, mode: 'md' });
export const linksToHtml = (text, opts) => renderLinks(text, { ...opts, mode: 'html' });
export const linksToText = (text) => renderLinks(text, { mode: 'text' });

// ── messages ───────────────────────────────────────────────────────────────

export const phonePretty = (p) => (p && /^55\d{10,11}$/.test(p)
  ? `+55 ${p.slice(2, 4)} ${p.slice(4, -4)}-${p.slice(-4)}`
  : p || null);

export const MEDIA = {
  image: 'Foto', video: 'Vídeo', audio: 'Áudio', sticker: 'Sticker',
  document: 'Documento', call: 'Chamada', deleted: 'Mensagem apagada', system: 'Sistema',
};

/** One message as plain text, media and system events in brackets. */
export function messageText(msg) {
  const text = (msg.content || '').trim();
  switch (msg.type) {
    case 'text': return text;
    case 'document': return `[Documento${msg.attachment ? `: ${msg.attachment}` : ''}]${text ? ` ${text}` : ''}`;
    case 'image':
      if (text.startsWith('[')) return text;
      return `[Foto]${text ? ` ${text}` : ''}`;
    case 'video': case 'audio': case 'sticker': return `[${MEDIA[msg.type]}]${text ? ` ${text}` : ''}`;
    case 'call': return `[${text || 'Chamada'}]`;
    case 'deleted': return `[${text || 'Mensagem apagada'}]`;
    case 'system': return `(${text})`;
    default: return text;
  }
}

/** One message in a static page: escaped, line breaks kept, "Encaminhada" first if it was. */
export function messageHtml(msg) {
  const text = escapeHtml(messageText(msg)).replace(/\n/g, '<br>');
  const forwarded = msg.is_forwarded || msg.forwarded;
  return `${forwarded ? '<i>Encaminhada</i> ' : ''}${text}`;
}