import { describe, it, expect, beforeEach } from 'vitest';
import { renderFlightsPanel } from '../../src/components/FlightsPanel.js';

describe('renderFlightsPanel', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('shows flight records, passenger lists, aircraft, and attribution caveats', () => {
    const panel = renderFlightsPanel();
    document.body.appendChild(panel);

    expect(panel.getAttribute('aria-label')).toBe('Voos e passageiros');
    expect(panel.querySelectorAll('.flight-card')).toHaveLength(26);
    expect(panel.textContent).toContain('Daniel Vorcaro');
    expect(panel.textContent).toContain('PR-NGM');
    expect(panel.textContent).toContain('Ciro Nogueira');
    expect(panel.textContent).toContain('O gabinete nega que o ministro tenha voado');
    expect(panel.textContent).toContain('Trecho cancelado · 20–23 nov 2025');
    expect(panel.textContent).toContain('Courchevel · 12–25 jan 2025 · viagem distinta');
    expect(panel.querySelector('.flight-passengers').getAttribute('aria-label')).toBe('Passageiros mencionados');
  });

  it('provides a working return action', () => {
    let returned = false;
    const panel = renderFlightsPanel({ onBack: () => { returned = true; } });
    panel.querySelector('.flights-back').click();
    expect(returned).toBe(true);
  });
});
