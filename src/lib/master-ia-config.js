export const MASTER_IA_CONFIG = Object.freeze({
  baseUrl: '/api/master-ia',
  model: 'gpt-oss:20b',
  stream: true,
  requestTimeoutMs: 30000,
  maxEvidence: 8,
  maxContextChars: 12000,
});

export function chatCompletionsUrl(baseUrl = MASTER_IA_CONFIG.baseUrl) {
  return `${baseUrl.replace(/\/+$/, '')}/v1/chat/completions`;
}
