/**
 * The Payments screen: transfers recorded in the material, including parties
 * that do not have a conversation in the viewer.
 */

const ICON_PAYMENT = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/></svg>`;

export const PAYMENTS = [
  ['Banco Master', 'Barci de Moraes Sociedade de Advogados', '08/02/2024', 'R$ 3.422.268,14'],
  ['Banco Master', 'Barci de Moraes Sociedade de Advogados', 'Jul/2025', 'R$ 3.422.268,14'],
  ['Banco Master', 'Barci de Moraes Sociedade de Advogados', '01/10/2025', 'R$ 3.422.268,14'],
  ['Banco Master', 'Barci de Moraes Sociedade de Advogados', 'Fev/2024 – Out/2025', '4 comprovantes = R$ 13,6 milhões'],
  ['Banco Master (via fundos)', 'Empresas ligadas a familiares/sócios de Vorcaro', '2017–2025', '~R$ 1,8 bilhão'],
  ['Banco Master / fundos', 'Henrique Moura Vorcaro (pai)', 'Identificado em 2026', 'Saldo > R$ 2,2 bilhões'],
  ['Empresas/grupo Vorcaro (Multipar etc.)', 'Henrique Moura Vorcaro', '2020–2025', '~R$ 14,7 milhões'],
  ['Empresas/grupo Vorcaro (Multipar etc.)', 'Natália Vorcaro Zettel (irmã)', '2020–2025', '~R$ 6,4 milhões'],
  ['Empresas/grupo Vorcaro (Multipar etc.)', 'Aline Vorcaro (mãe)', '2020–2025', '~R$ 20,9 milhões'],
  ['Empresas/grupo Vorcaro', 'Milo Investimentos', 'Período anterior a 2026', '~R$ 64 milhões'],
  ['Empresas/grupo Vorcaro', 'Mercatto Incorporações', '< 8 meses', '> R$ 15 milhões'],
  ['Entre Investimentos (via Freixo/Zettel)', 'Havengate Development Fund (EUA)', 'Fev/2025', 'US$ 2 milhões'],
  ['Entre Investimentos (via Freixo/Zettel)', 'Havengate Development Fund (EUA)', '2025 (6 remessas)', '~US$ 1,67 milhão cada'],
  ['Entre Investimentos (via Freixo/Zettel)', 'Havengate Development Fund (EUA)', 'Set/2025', 'Última parcela (total 7 remessas = US$ 12,33 milhões)'],
  ['Master Participações / Banco Master', 'Titan Holding (Ilhas Cayman)', '31/01/2025', 'R$ 85,2 milhões'],
  ['Banco Master', 'Titan Holding (Ilhas Cayman)', '28/02/2025', 'R$ 66,3 milhões'],
  ['Banco Master', 'Fundo Krispy / Titan Holding (Ilhas Cayman)', '02/04/2025', 'R$ 555,8 milhões'],
  ['Royal Capital PSC', 'Conta de Vorcaro no exterior', '09/09 a 18/11/2025', 'US$ 26 milhões'],
  ['Fabiano Zettel (por ordem de Vorcaro)', 'Luiz Phillipi Machado de Moraes Mourão ("Sicário")', '2024–2025', '~R$ 24 milhões'],
  ['Fabiano Zettel', 'Fundo Leal', '28/10/2021', 'R$ 15 milhões'],
  ['Fabiano Zettel', 'Fundo Leal', '03/11/2021', 'R$ 5 milhões'],
  ['Fabiano Zettel', 'Fundo Leal', '08/07/2024', 'R$ 15 milhões'],
  ['Fabiano Zettel', 'Fundo Arleen', '10/02/2025', 'R$ 14.521.851,17'],
  ['Fabiano Zettel', 'Igreja Batista da Lagoinha Belvedere', '24/12/2024 – 08/12/2025', 'R$ 19,205 milhões'],
].map(([origin, recipient, date, amount]) => ({ origin, recipient, date, amount }));

export function renderPaymentsPanel(payments = PAYMENTS) {
  const panel = document.createElement('section');
  panel.className = 'payments-panel';
  panel.setAttribute('aria-label', 'Pagamentos');

  const header = document.createElement('div');
  header.className = 'payments-header';
  header.innerHTML = `<span class="payments-header-icon">${ICON_PAYMENT}</span><h2 class="payments-title">Pagamentos</h2>`;
  panel.appendChild(header);

  const intro = document.createElement('p');
  intro.className = 'payments-intro';
  intro.textContent = 'Registros financeiros identificados no material.';
  panel.appendChild(intro);

  const table = document.createElement('div');
  table.className = 'payments-table';
  table.setAttribute('role', 'table');
  const headings = ['Origem', 'Destinatário', 'Data', 'Valor'];
  const headerRow = document.createElement('div');
  headerRow.className = 'payments-row payments-row-header';
  headerRow.setAttribute('role', 'row');
  for (const heading of headings) {
    const cell = document.createElement('span');
    cell.className = 'payments-cell';
    cell.setAttribute('role', 'columnheader');
    cell.textContent = heading;
    headerRow.appendChild(cell);
  }
  table.appendChild(headerRow);

  for (const payment of payments) {
    const row = document.createElement('div');
    row.className = 'payments-row';
    row.setAttribute('role', 'row');
    for (const [key, value] of Object.entries(payment)) {
      const cell = document.createElement('span');
      cell.className = `payments-cell payments-cell-${key}`;
      cell.setAttribute('role', 'cell');
      cell.textContent = value;
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  panel.appendChild(table);

  const foot = document.createElement('p');
  foot.className = 'payments-foot';
  foot.textContent = `${payments.length} registros financeiros no material.`;
  panel.appendChild(foot);
  return panel;
}
