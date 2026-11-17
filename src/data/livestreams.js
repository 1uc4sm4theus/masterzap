export const MASTERWHATS_TEST_EVENT = {
  id: 'stf-banco-master-2026-09-15',
  title: 'Sessão do STF — Caso Banco Master',
  description:
    'Sessão plenária do Supremo Tribunal Federal sobre o Caso Banco Master, com discussão de petições, pedido de vista e confronto entre ministros.',
  institution: 'Supremo Tribunal Federal',
  location: 'Plenário do STF',
  participants: [
    { name: 'Alexandre de Moraes', role: 'Ministro do STF (Relator)', avatarConvId: 'alexandre-de-moraes' },
    { name: 'André Mendonça', role: 'Ministro do STF', avatarConvId: null },
    { name: 'Paulo Gonet', role: 'Procurador-Geral da República', avatarConvId: null },
    { name: 'Flávio Dino', role: 'Ministro do STF', avatarConvId: null },
    { name: 'Daniel Vorcaro', role: 'Presidente do Banco Master (citado)', avatarConvId: 'dv-self' },
  ],
  date: '2026-09-15',
  time: '14:00',
  officialUrl:
    'https://noticias.stf.jus.br/postsnoticias/pedido-de-vista-suspende-discussao-sobre-julgamento-conjunto-de-duas-peticoes-do-caso-master/',
  youtubeVideoId: 'f_DVZoQLvZI',
  status: 'ended',
  isTest: true,
  documents: [
    {
      title: 'STF: pedido de vista suspende discussão — Caso Master',
      url: 'https://noticias.stf.jus.br/postsnoticias/pedido-de-vista-suspende-discussao-sobre-julgamento-conjunto-de-duas-peticoes-do-caso-master/',
    },
    {
      title: 'Moraes acusa Mendonça de querer incluir seu nome em delação de Vorcaro',
      url: 'https://agenciabrasil.ebc.com.br/justica/noticia/2026-09/moraes-acusa-mendonca-de-querer-incluir-seu-nome-em-delacao-de-vorcaro',
    },
  ],
  relatedConversations: [],

  // Estrutura para checagem de fatos.
  // factChecks é o array canônico de verificações associadas a este evento.
  // Cada item pode ser enriquecido posteriormente com:
  //   - timestampSeconds (number | null): segundo exato na gravação
  //   - relatedConversations: conversas do acervo MasterWhats
  //   - relatedDocuments: documentos do acervo MasterWhats
  // Nenhuma classificação automática deve ser publicada sem revisão humana.
  factChecks: [
    {
      id: 'fc-moraes-mendonca-delacao',
      statement:
        'Alexandre de Moraes afirmou que André Mendonça teria tentado incluir seu nome em uma proposta de delação de Daniel Vorcaro. Mendonça contestou: "Isso é mentira!".',
      speaker: 'Alexandre de Moraes / André Mendonça',
      speakerRole: 'Ministros do STF',
      context:
        'Durante a sessão, Moraes acusou Mendonça de articular para que seu nome fosse inserido na delação de Vorcaro. Mendonça negou categoricamente a afirmação.',
      classification: 'DECLARAÇÃO CONTESTADA',
      explanation:
        'Registra-se a existência do confronto público entre as declarações dos dois ministros. A afirmação de Moraes e a negação de Mendonça são fatos verificáveis (os ministros realmente fizeram essas declarações). O mérito — se a tentativa de inclusão ocorreu ou não — não pode ser classificado como verdadeiro ou falso com base nas fontes disponíveis. Confirmar a declaração de alguém não equivale a confirmar o conteúdo do que foi dito.',
      sources: [
        {
          title: 'Agência Brasil — Moraes acusa Mendonça de querer incluir seu nome em delação de Vorcaro',
          url: 'https://agenciabrasil.ebc.com.br/justica/noticia/2026-09/moraes-acusa-mendonca-de-querer-incluir-seu-nome-em-delacao-de-vorcaro',
        },
      ],
      // 6h30min — horário confirmado por revisão humana, não estimado.
      // Para mover este horário para outra verificação, basta trocar o campo
      // timestampSeconds de lugar: nada mais depende dele.
      timestampSeconds: 23400,
      relatedMasterwhatsDocs: [],
      // O acervo documenta o contato direto entre Vorcaro e Moraes. Isso
      // contextualiza por que o nome do ministro aparece no caso, mas NÃO
      // confirma nem desmente a alegação sobre a proposta de delação.
      archiveNote: 'Os registros abaixo documentam o contato direto entre Vorcaro e Moraes. Eles não confirmam nem desmentem a alegação sobre a proposta de delação.',
      relatedMasterwhatsConvs: [
        {
          id: 'alexandre-de-moraes',
          messageId: 25,
          title: 'Vorcaro pede a Moraes que "bloqueie toda maldade" (04/11/2025)',
        },
        {
          id: 'alexandre-de-moraes',
          messageId: 29,
          title: '"Conseguiu bloquear a maldade e sacanagem?" (05/11/2025)',
        },
        {
          id: 'alexandre-de-moraes',
          messageId: 69,
          title: 'Vorcaro pede que Moraes "sensibilize" Andrei Rodrigues (16/11/2025)',
        },
      ],
    },
    {
      id: 'fc-gonet-encontro-vorcaro',
      statement:
        'Paulo Gonet declarou que seu único encontro com Daniel Vorcaro ocorreu em abril de 2024, na presença de outras autoridades.',
      speaker: 'Paulo Gonet',
      speakerRole: 'Procurador-Geral da República',
      context:
        'Durante o julgamento, Gonet prestou esclarecimentos sobre seus contatos com Vorcaro, afirmando que houve um único encontro, em circunstância coletiva.',
      classification: 'DECLARAÇÃO REGISTRADA — CONTEXTO DOCUMENTAL PENDENTE',
      explanation:
        'Registra-se o que foi declarado pelo PGR. A confirmação independente — se o encontro ocorreu apenas uma vez, naquela data e naquelas condições — depende de documentação não disponível publicamente até o momento desta verificação. Declaração registrada não equivale a fato comprovado.',
      sources: [],
      timestampSeconds: null, // Trecho ainda não identificado na gravação
      relatedMasterwhatsDocs: [],
      archiveNote: 'O acervo registra um evento em Londres em abril de 2024 com presença de Gonet e de Vorcaro, compatível com a data declarada. Os registros não estabelecem se houve outros encontros.',
      relatedMasterwhatsConvs: [
        {
          id: 'ciro-soares',
          messageId: 107,
          title: 'Foto de Gonet ao lado de Vorcaro em Londres, abril de 2024 (O Globo)',
        },
        {
          id: 'flavio-carneiro',
          messageId: 3326,
          title: 'Poder360: STF, STJ e PGR em Londres na mesma semana (27/04/2024)',
        },
      ],
    },
    {
      id: 'fc-dino-pedido-vista',
      statement: 'Flávio Dino pediu vista durante a discussão processual sobre o julgamento conjunto de petições relacionadas ao Caso Master.',
      speaker: 'Flávio Dino',
      speakerRole: 'Ministro do STF',
      context:
        'O pedido de vista foi feito durante a sessão plenária, interrompendo a deliberação sobre a unificação do julgamento de duas petições do Caso Master.',
      classification: 'CONFIRMADO POR REGISTRO OFICIAL',
      explanation:
        'O acontecimento processual é confirmado por nota oficial publicada pelo próprio STF em seu portal de notícias. O pedido de vista suspendeu a discussão e está documentado no registro institucional da Corte.',
      sources: [
        {
          title: 'STF — Pedido de vista suspende discussão sobre julgamento conjunto de duas petições do Caso Master',
          url: 'https://noticias.stf.jus.br/postsnoticias/pedido-de-vista-suspende-discussao-sobre-julgamento-conjunto-de-duas-peticoes-do-caso-master/',
        },
      ],
      timestampSeconds: null, // Trecho ainda não identificado na gravação
      relatedMasterwhatsDocs: [],
      relatedMasterwhatsConvs: [],
    },
  ],

  // Estrutura reservada para checagem em tempo real (fase futura).
  // Campos preparados, não implementados nesta versão:
  //   realtimeTranscript: null,         // transcrição recebida por streaming
  //   suggestedChecks: [],              // verificações sugeridas automaticamente
  //   pendingReview: [],                // aguardando revisão humana antes de publicar
};

export const LIVESTREAMS = [
  MASTERWHATS_TEST_EVENT,
  {
    id: 'audiencia-banco-master-2026',
    title: 'Audiência pública — Caso Banco Master',
    description: 'Audiência pública sobre o Caso Banco Master.',
    institution: 'Senado Federal',
    location: 'Senado Federal',
    participants: [
      { name: 'Andrei Rodrigues', role: 'Diretor-geral da Polícia Federal' },
      { name: 'Wellington César Lima e Silva', role: 'Ministro da Justiça' },
    ],
    date: '2026-11-18',
    time: '14:00',
    officialUrl: null,
    youtubeVideoId: null,
    status: 'scheduled',
    isTest: true,
    documents: [],
    relatedConversations: [],
  },
];

export function getLivestream(id) {
  return LIVESTREAMS.find(event => event.id === id) || null;
}