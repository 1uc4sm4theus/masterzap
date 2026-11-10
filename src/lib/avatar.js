/**
 * Default contact avatars — the coloured monogram WhatsApp shows when a contact
 * has no photo: a solid circle with a lighter person glyph centred in it.
 *
 * The colour is picked deterministically from the conversation id, so a contact
 * keeps the same avatar across reloads and rebuilds.
 *
 * Palette: the first four pairs were sampled from a WhatsApp screenshot; the
 * rest follow the same construction (a dark, desaturated ground with a light,
 * high-key figure of the same hue). Swap in the real design-system values if
 * they ever turn up.
 */

const PALETTE = [
  { bg: '#235655', fg: '#BCE9E6' }, // teal      (amostrado)
  { bg: '#5E1C2F', fg: '#F09FAB' }, // bordô     (amostrado)
  { bg: '#204F7D', fg: '#AFDBFA' }, // azul      (amostrado)
  { bg: '#2F613E', fg: '#99E796' }, // verde     (amostrado)
  { bg: '#4A2E6B', fg: '#D6BDF2' }, // roxo
  { bg: '#7A3F1C', fg: '#F5C39A' }, // laranja
  { bg: '#2B3A6B', fg: '#B4C2F0' }, // índigo
  { bg: '#4F5820', fg: '#DCE7A0' }, // oliva
  { bg: '#5C2350', fg: '#EBB0DE' }, // ameixa
  { bg: '#2E4A52', fg: '#ADD3DC' }, // ardósia
];

/**
 * The Material "person" glyph, in its own 24×24 coordinate space.
 * Measured against the reference: body width ≈ 30% of the circle diameter and
 * body/head width ≈ 1.96, which is exactly this glyph's proportion.
 */
const PERSON_PATH = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';

// Maps the 24-unit glyph into the 212-unit avatar box: scaled to ~30% of the
// diameter and sitting a touch above centre, the way WhatsApp positions it.
const GLYPH_TRANSFORM = 'translate(58.3 51.3) scale(3.975)';

/**
 * Stable index into the palette. FNV-1a rather than the usual `hash * 31 + c`:
 * with a ten-colour palette, 31 ≡ 1 (mod 10) collapses that hash to a plain sum
 * of char codes, and ids as alike as ours then bunch onto the same few colours.
 * FNV's prime mixes the low bits properly and spreads them out.
 *
 * Not a security hash — it only has to be deterministic across runs.
 * @param {string} seed
 */
function paletteFor(seed) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

/**
 * Build the default avatar for a contact with no photograph.
 *
 * @param {string} seed - conversation id, so the colour is stable per contact
 * @param {number} [size] - rendered px size; omitted means "fill the container"
 * @returns {string} an SVG string, safe to assign with innerHTML (no user data)
 */
export function defaultAvatarSvg(seed, size) {
  const { bg, fg } = paletteFor(seed || '');
  const dimensions = size ? ` width="${size}" height="${size}"` : '';
  return `<svg viewBox="0 0 212 212"${dimensions} role="img" aria-hidden="true">` +
    `<circle cx="106" cy="106" r="106" fill="${bg}"/>` +
    `<path d="${PERSON_PATH}" fill="${fg}" transform="${GLYPH_TRANSFORM}"/>` +
    `</svg>`;
}

export function defaultGroupAvatarSvg(size) {
  const dimensions = size ? ` width="${size}" height="${size}"` : '';
  return `<svg viewBox="0 0 212 212"${dimensions} role="img" aria-hidden="true">` +
    '<circle cx="106" cy="106" r="106" fill="#dfe5e7"/>' +
    '<path d="M106 101a29 29 0 1 0 0-58 29 29 0 0 0 0 58zm0 12c-29 0-55 15-55 34v12h110v-12c0-19-26-34-55-34z" fill="#54656f"/>' +
    '<path d="M55 97a22 22 0 1 0 0-44 22 22 0 0 0 0 44zm-5 13c-16 2-29 11-35 22 8 5 15 13 18 24h12v-12c0-13 6-25 16-33-4-1-8-1-11-1zm112-13a22 22 0 1 0 0-44 22 22 0 0 0 0 44zm5 13c-4 0-8 0-11 1 10 8 16 20 16 33v12h12c3-11 10-19 18-24-6-11-19-20-35-22z" fill="#54656f"/>' +
    '</svg>';
}

export { PALETTE as AVATAR_PALETTE };
