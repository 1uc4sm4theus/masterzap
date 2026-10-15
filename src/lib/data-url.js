const DATA_BUILD_ID = __DATA_BUILD_ID__;

export function dataUrl(path) {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}v=${encodeURIComponent(DATA_BUILD_ID)}`;
}
