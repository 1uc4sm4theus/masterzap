/**
 * Where the clean export lives and how to hand it to the browser.
 *
 * The files are written at build time by scripts/export.mjs, so "exporting"
 * here is only a download of something that already exists. Filenames match
 * what the script writes; if one changes, the other has to.
 */

export const EXPORT_BASE = '/export';
export const EXPORT_FORMATS = ['md', 'json'];

/** URL of one conversation's export in the given format. */
export function exportUrl(conversationId, format) {
  if (!EXPORT_FORMATS.includes(format)) throw new Error(`formato desconhecido: ${format}`);
  return `${EXPORT_BASE}/masterwhats-${conversationId}.${format}`;
}

/** URL of the zip with every conversation in both formats. */
export const EXPORT_ALL_URL = `${EXPORT_BASE}/masterwhats-export.zip`;

/** Start a download of a same-origin file, keeping its name. */
export function downloadFile(url) {
  const link = document.createElement('a');
  link.href = url;
  link.download = url.slice(url.lastIndexOf('/') + 1);
  document.body.appendChild(link);
  link.click();
  link.remove();
}