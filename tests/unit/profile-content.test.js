import { describe, it, expect } from 'vitest';
import { CONTACT_PROFILES, parseLinks } from '../../src/lib/profile-content.js';

describe('DV self-chat profile', () => {
  it('describes the press-media area and links to the Veja report', () => {
    const sections = CONTACT_PROFILES['dv-self'].sections;
    const mediaSection = sections.find(section => section.title === 'Mídias divulgadas pela imprensa');

    expect(mediaSection).toBeDefined();
    expect(mediaSection.paragraphs[0].text).toContain('não tiverem sido encontradas nos aparelhos examinados');
    expect(parseLinks(mediaSection.paragraphs[0].text)).toContain(
      'href="https://veja.abril.com.br/brasil/defesa-de-daniel-vorcaro-confirma-que-audio-sobre-lula-e-do-banqueiro/"'
    );
  });
});

describe('Luciano Huck profile', () => {
  it('includes reporting and attributes the response from his press office', () => {
    const sections = CONTACT_PROFILES['luciano-huck'].sections;
    const relation = sections.find(section => section.title === 'Relação com Daniel Vorcaro');
    const response = sections.find(section => section.title === 'Esclarecimentos');

    expect(relation.paragraphs[0].text).toContain('patrocínio do Will Bank ao Domingão com Huck');
    expect(parseLinks(relation.paragraphs[0].text)).toContain(
      'href="https://veja.abril.com.br/brasil/mensagens-da-pf-revelam-que-luciano-huck-foi-amigo-e-conselheiro-de-daniel-vorcaro/"'
    );
    expect(response.paragraphs[0].text).toContain('negou que ele e Vorcaro fossem sócios');
    expect(parseLinks(response.paragraphs[0].text)).toContain(
      'href="https://hugogloss.uol.com.br/brasil/luciano-huck-esclarece-relacao-com-vorcaro-apos-vazamento-de-mensagens/"'
    );
  });
});

describe('João Doria profile', () => {
  it('summarizes the reported message and attributes Doria’s response', () => {
    const sections = CONTACT_PROFILES['joao-doria'].sections;
    const messageSection = sections.find(section => section.title === 'A mensagem a Daniel Vorcaro');
    const report = parseLinks(messageSection.paragraphs[0].text);

    expect(messageSection.paragraphs[0].text).toContain('enviada em maio de 2025');
    expect(messageSection.paragraphs[0].text).toContain('não esclarece a que fatos Doria se referia');
    expect(report).toContain('https://www.poder360.com.br/poder-gente/foi-apenas-um-gesto-cordial-diz-doria-sobre-mensagem-a-vorcaro/');
    expect(report).toContain('https://www.metropoles.com/colunas/paulo-cappelli/doria-se-pronuncia-sobre-troca-de-mensagens-com-vorcaro');
    expect(messageSection.paragraphs[1].text).toContain('apenas um gesto cordial');
  });
});

describe('Nikolas Ferreira profile', () => {
  it('attributes the reporting and distinguishes the supplied audio from it', () => {
    const sections = CONTACT_PROFILES['nikolas-ferreira'].sections;
    const audio = sections.find(section => section.title === 'Áudio e pedido de ajuda');
    const otherReports = sections.find(section => section.title === 'Outras menções nas reportagens');

    expect(sections[0].title).toBe('Sobre Nikolas Ferreira');
    expect(audio.paragraphs[0].text).toContain('Thiago Rodrigues de Faria');
    expect(parseLinks(audio.paragraphs[0].text)).toContain(
      'href="https://www.facebook.com/watch/?v=1867100414673831"'
    );
    expect(audio.paragraphs[2].text).toContain('Não há confirmação de que seja a mesma gravação');
    expect(otherReports.paragraphs[0].text).toContain('Esse Nikolas eu banquei todos os voos dele');
    expect(parseLinks(otherReports.paragraphs[0].text)).toContain(
      'href="https://diplomatique.org.br/o-sugar-daddy-vorcaro-e-a-anatomia-de-seu-esquema-com-a-republica/"'
    );
  });
});
