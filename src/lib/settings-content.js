/**
 * Settings/About content for the MasterWhats Settings drawer.
 *
 * Link format, same as profile-content.js:
 * - External: {text}[https://...]
 * - Search the open conversation: {text}[action:search:term]
 * - Search a specific one: {text}[action:search@conversation-id:term]
 * - Open a contact drawer: {text}[action:contact:conversation-id]
 *
 * Structure: the project sections come first, then one "O vazamento…" block per
 * leak, newest first, each followed by its own "Destaques" sections. A new leak
 * slots in as another block — nothing above it needs rewriting.
 */

export const SETTINGS_CONTENT = {
  sections: [
    {
      title: 'Sobre o Projeto',
      paragraphs: [
        { text: 'MasterWhats é um visualizador das conversas extraídas dos celulares apreendidos de Daniel Vorcaro, ex-dono do Banco Master, na Operação Compliance Zero — e de outros trechos tornados públicos pela imprensa e por documentos cujo sigilo foi levantado. São 66 mil mensagens em dezenas de conversas, de 2016 a novembro de 2025 — navegáveis, pesquisáveis e compartilháveis no estilo WhatsApp Web.' },
        { text: 'O núcleo do acervo chegou ao público em dois momentos: o vazamento das conversas com Martha Graeff, em março de 2026, e o relatório da Polícia Federal (IPJ-A nº 3298613/2026) sobre os contatos com o ministro Alexandre de Moraes, cujo sigilo caiu em setembro de 2026. Em torno desses dois eixos há as conversas com a diretoria do banco, com Fábio Faria, com Flávio e Eduardo Bolsonaro, e com o circuito do evento de Londres.' },
        { text: 'Busca com suporte a acentos e resultados em tempo real. Calendário para navegar por data. Compartilhamento por link direto — quem clicar cai na mensagem exata. Menu de contexto em cada mensagem. Responsivo no desktop e no celular.' },
      ],
    },

    // ── Vazamento 2: relatório da PF sobre Alexandre de Moraes ──
    {
      title: 'O relatório sobre Alexandre de Moraes',
      paragraphs: [
        { text: 'Em 1º de setembro de 2026, o ministro {André Mendonça derrubou o sigilo}[https://www.poder360.com.br/poder-justica/mendonca-retira-sigilo-de-acao-sobre-vorcaro-e-moraes/] da IPJ-A nº 3298613/2026 — 218 páginas em que a Polícia Federal reconstrói, a partir do iPhone apreendido de Vorcaro, sua relação com o ministro {Alexandre de Moraes}[action:contact:alexandre-de-moraes] e com outras autoridades.' },
        { text: 'Não é um export de WhatsApp: as mensagens estavam em imagens dentro do laudo e foram transcritas uma a uma. Vorcaro escrevia no bloco de notas do iPhone, tirava um print e enviava em visualização única — a PF {recuperou 52 dessas notas}[https://www.cnnbrasil.com.br/blogs/jussara-soares/politica/como-a-pf-rastreou-as-mensagens-de-vorcaro-a-contato-atribuido-a-moraes/] cruzando logs do sistema. As respostas do outro lado eram igualmente efêmeras e continuam ilegíveis.' },
        { text: 'A PF ressalva que não fez diligências contra magistrados e que o relatório não conclui pela prática de crime. Juristas também {apontaram uso político}[https://www.brasildefato.com.br/2026/09/01/entenda-o-caso-moraes-e-vorcaro-juristas-veem-uso-politico-e-crise-de-credibilidade/] na divulgação.' },
      ],
    },
    {
      title: 'Destaques: O Pedido de Socorro',
      paragraphs: [
        { text: '"{Acha que segunda ja tenho que estar fora?}[action:search@alexandre-de-moraes:estar fora]" — dois dias antes de ser preso no aeroporto.' },
        { text: '"{É importante reforçar com Andrei e Paulo pra nao deixar ninguem de baixo fazer uma sacanagem}[action:search@alexandre-de-moraes:Andrei]" — em referência ao diretor-geral da PF e ao procurador-geral da República. A palavra "{sacanagem}[action:search@alexandre-de-moraes:sacanagem]" aparece nove vezes.' },
        { text: '"{Conseguiu bloquear a maldade e sacanagem?}[action:search@alexandre-de-moraes:bloquear]" e "{tentar que o Galipolo me receba}[action:search@alexandre-de-moraes:Galipolo]" — pedidos de intervenção junto ao Banco Central.' },
        { text: '"{Voce sabe que tenho gratidao da minha vida a você}[action:search@alexandre-de-moraes:gratidao]" — depois de um encontro presencial, três dias antes da prisão.' },
      ],
    },
    {
      title: 'Destaques: Contratos e Eventos',
      paragraphs: [
        { text: 'A PF {contabilizou R$ 208 milhões}[https://www.poder360.com.br/poder-justica/pf-encontra-contratos-de-r-208-mi-entre-vorcaro-e-barci-de-moraes/] em contratos entre o Banco Master e o escritório Barci de Moraes, da esposa do ministro. Nos metadados da minuta, o campo "Última modificação por" traz "Ministro Alexandre de Moraes".' },
        { text: '"{É o pgto mais importante que temos}[action:search@romy-banco-master:mais importante]" e "{Pode pagar sempre, sem nota}[action:search@romy-banco-master:sem nota]" — Vorcaro à diretoria, sobre o contrato do escritório.' },
        { text: '"{Alexandre morre se vc fizer isso}[action:search@ana-matos-mkt:Alexandre morre]" — sobre um convidado vetado no {fórum jurídico de Londres}[https://www.metropoles.com/colunas/demetrio-vecchioli/dialogos-mostram-que-vorcaro-e-moraes-montaram-evento-juntos], bancado pelo banco sem aparecer como realizador.' },
        { text: '"{O Gonet perguntou se o filho dele pode ir com a gente para Londres?}[action:search@ciro-soares:filho dele]" — o procurador-geral aparece nas tratativas do evento, {charuto e Macallan}[https://www.poder360.com.br/poder-justica/gonet-sobre-evento-com-vorcaro-que-tenha-charuto-e-macallan/] inclusos.' },
      ],
    },

    // ── Flávio Bolsonaro + filme Dark Horse ──
    {
      title: 'As cobranças de Flávio Bolsonaro',
      paragraphs: [
        { text: 'A conversa com {Flávio Bolsonaro}[action:contact:flavio-bolsonaro] mistura o pedido de parcelas do filme {filme}[action:search@flavio-bolsonaro:filme] — com Jim Caviezel no elenco — e a agenda pessoal do senador com Vorcaro no segundo semestre de 2025. O áudio de 8 de setembro de 2025, reproduzido pelo {The Intercept}[https://www.intercept.com.br/], é o ponto de partida: Flávio cobra atrasados e diz que um calote em Hollywood teria "efeito elevado a menos um".' },
        { text: 'Nas semanas seguintes eles marcam encontros ("{Quarta 14:30?}[action:search@flavio-bolsonaro:Quarta]"), Flávio atualiza a gravação ("{Já estamos no terceiro dia de gravação}[action:search@flavio-bolsonaro:gravação]") e fecha o fio com "{Amém!}[action:search@flavio-bolsonaro:Amém]".' },
      ],
    },
    {
      title: 'Destaques: Dark Horse',
      paragraphs: [
        { text: '"{Imagina a gente dando calote num Jim Caviezel}[action:search@flavio-bolsonaro:Caviezel]" — Flávio, no áudio de 8/9/2025, sobre as parcelas atrasadas do filme.' },
        { text: '"{já tem muita conta para pagar esse mês e o mês seguinte também}[action:search@flavio-bolsonaro:conta para pagar]" — o senador descreve a reta final da produção.' },
        { text: '"{Poderíamos marcar terça final do dia ou quarta qq hora?}[action:search@flavio-bolsonaro:quarta]" — Vorcaro reagendando o encontro presencial em São Paulo.' },
      ],
    },

    // ── Eduardo Bolsonaro ──
    {
      title: 'Eduardo Bolsonaro e as sanções',
      paragraphs: [
        { text: 'Com {Eduardo Bolsonaro}[action:contact:eduardo-bolsonaro] o fio é curto e político: o deputado encaminha a Vorcaro, em julho de 2025, o recorte "{Trump está avaliando uma série de sanções contra Alexandre de Moraes}[action:search@eduardo-bolsonaro:sanções]", atribuído ao Washington Examiner. Não há resposta longa no recorte público — o valor do trecho é o encaminhamento em si, no mesmo mês em que o banco já estava sob pressão.' },
      ],
    },

    // ── Fábio Faria / Halloween ──
    {
      title: 'Fábio Faria, o intermediário',
      paragraphs: [
        { text: 'A PF descreve {Fábio Faria}[action:contact:fabio-faria] como {o elo entre Vorcaro e Moraes}[https://www.cnnbrasil.com.br/blogs/jussara-soares/politica/fabio-faria-intermediou-contatos-entre-moraes-e-vorcaro-diz-pf/]. Em dezembro de 2023 ele leva o banqueiro ao primeiro encontro e {passa o telefone}[action:search@fabio-faria:telefone] que Vorcaro salvaria como "Alexandre de Moraes BRASILIA".' },
        { text: 'Antes disso, em outubro de 2023, os dois organizam a festa de Halloween no Madame Satã: "{120 mulheres e 20 homens}[action:search@fabio-faria:120 mulheres]", "{Só menina nova}[action:search@fabio-faria:menina nova]", convites a {Alcolumbre}[action:search@fabio-faria:Davi], {Pacheco}[action:search@fabio-faria:Pacheco] e {Toffoli}[action:search@fabio-faria:Toffoli]. Vorcaro teme vazamento depois da festa do Neymar: "{Se vazar, eu tô morto}[action:search@fabio-faria:eu tô morto]". Faria responde que, se alguém falar, "{era evento do banco para parceiros de Halloween}[action:search@fabio-faria:Halloween]".' },
      ],
    },
    {
      title: 'Destaques: Halloween e o telefone do ministro',
      paragraphs: [
        { text: '"{Davi tá louco perguntando se as suíças vão vir}[action:search@fabio-faria:suíças]" — Faria sobre Alcolumbre na véspera da festa.' },
        { text: '"{Mandei aqui pro Toffoli. Pô, dá até para trazer o Alexandre}[action:search@fabio-faria:Toffoli]" — o ex-ministro costurando a lista.' },
        { text: '"{Vai ser num lugar perto do Rosewood, ultra tranquilo}[action:search@fabio-faria:Rosewood]" e "{Telefone na porta. E segurança dentro}[action:search@fabio-faria:Telefone na porta]".' },
        { text: '"{Se vazar, eu tô morto. Peguei equipe só de controle disso}[action:search@fabio-faria:equipe só de controle]" — Vorcaro, um dia depois do vazamento da festa de Neymar.' },
      ],
    },

    // ── Barci / pagamentos ──
    {
      title: 'O contrato com o escritório Barci de Moraes',
      paragraphs: [
        { text: 'Em {Viviane Barci de Moraes}[action:contact:vivi-moraes] está a minuta: pró-labore de {36 parcelas de R$ 3 milhões líquidos}[action:search@vivi-moraes:3.000.000] (bruto R$ 3.646.529,77/mês). Vorcaro pede para trocar, na cláusula I.3, "sócios da CONTRATADA" por "do CONTRATANTE".' },
        { text: 'No mesmo dia 15 de março de 2024, {Romy}[action:contact:romy-banco-master] da tesouraria recebe a ordem: "{Romy esse barci moraes por favor nao deixe atrasar um dia}[action:search@romy-banco-master:nao deixe atrasar]", "{É o pgto mais importante que temos}[action:search@romy-banco-master:mais importante]", "{Pode pagar sempre, sem nota}[action:search@romy-banco-master:sem nota]". O comprovante STR0007 — Banco Master → Barci de Moraes, {R$ 3.422.268,14}[action:search@romy-banco-master:3.422] — vai anexo no chat.' },
        { text: '{Ângelo Silva}[action:contact:angelo-silva] é cobrado quando o pagamento não cai: "{Nao pagaram barci de moraes}[action:search@angelo-silva:Nao pagaram]", "{Contrato mais importantw que temos}[action:search@angelo-silva:importantw]", "{Ninguem ter acesso}[action:search@angelo-silva:Ninguem ter acesso]". {Alberto Felix}[action:contact:alberto-felix] confirma o PIX e ouve "{Nao e bom}[action:search@alberto-felix:Nao e bom]" — Vorcaro não queria PIX para o escritório. {Fabiano Zettel}[action:contact:fabiano-zettel] fecha o fluxo: "{Ta no fluxo de pagamento para hj}[action:search@fabiano-zettel:fluxo de pagamento]".' },
      ],
    },

    // ── Londres / Ana Matos / Ciro / Conjur ──
    {
      title: 'O fórum de Londres',
      paragraphs: [
        { text: 'O evento jurídico-político de abril de 2024 em Londres — Conjur, Correio Braziliense e Banco Master — é montado no chat com {Ana Matos}[action:contact:ana-matos-mkt], {Ciro Soares}[action:contact:ciro-soares], {Márcio Chaer}[action:contact:marcio-conjur] e {Geraldo Samor}[action:contact:geraldo-brazil-journal]. Vorcaro manda: "{Ideal nos convites nao sair o Banco como realizador do evento, concorda?}[action:search@marcio-conjur:realizador]". Chaer: "{Sem dúvida}[action:search@marcio-conjur:Sem dúvida]".' },
        { text: 'Ana Matos opera a lista VIP: "{Posso confirmar vc entregando o troféu do Min Alexandre?}[action:search@ana-matos-mkt:troféu]", "{O alexandre sugeriu participacao do temer}[action:search@ana-matos-mkt:temer]", "{Filha alexandre moraes vai te chamar ai}[action:search@ana-matos-mkt:Filha]", "{Deixa eu aprovar com alexandre}[action:search@ana-matos-mkt:aprovar com alexandre]". O save-the-date, segundo ela, já saía do próprio ministro: "{O min Alexandre já está mandando save the date, segundo Andrei me disse}[action:search@ana-matos-mkt:save the date]".' },
        { text: 'No Conjur, Chaer relata o WhatsApp que "{Xandão}[action:search@marcio-conjur:Xandão]" mandou a Gilmar Mendes convidando para Londres, "com a presença do Financial Times". A assessora do diretor-geral da PF pergunta se hospedagem e passagem são cobertas. Resposta: "{Todas as despesas bancadas por nós}[action:search@marcio-conjur:despesas bancadas]".' },
      ],
    },
    {
      title: 'Destaques: Londres',
      paragraphs: [
        { text: '"{Alexandre morre se vc fizer isso}[action:search@ana-matos-mkt:Alexandre morre]" — Vorcaro vetando um nome na lista da Ana Matos.' },
        { text: '"{O Gonet perguntou se o filho dele pode ir com a gente para Londres?}[action:search@ciro-soares:filho dele]" — Ciro Soares relatando o pedido do PGR.' },
        { text: '"{Antes do meu debate com o tony Blair, os 3 ministros do STF se reuniram privadam}[action:search@geraldo-brazil-journal:tony Blair]" — Vorcaro para Geraldo Samor, do Brazil Journal.' },
        { text: '"{Difícil alguém não aceitar convite de AM}[action:search@marcio-conjur:convite de AM]" — Chaer, depois de falar com Gilmar Mendes.' },
      ],
    },

    // ── Encontros anunciados em tempo real ──
    {
      title: 'Os encontros anunciados em tempo real',
      paragraphs: [
        { text: 'A perícia usou mensagens curtas para datar encontros presenciais. Para a filha {Stella Vorcaro}[action:contact:stella-vorcaro], em 5 de novembro de 2024, depois de uma chamada de 46 segundos: "{To com alexandre moraes}[action:search@stella-vorcaro:alexandre moraes] 😂". É o mesmo padrão que a PF viu com Martha e com o {diretor Paulo Sérgio, do Banco Central}[action:contact:diretor-paulo-sergio-bacen]: o banqueiro avisando gente próxima, ao vivo, que estava com o ministro. A PF {mapeou ao menos seis reuniões privadas}[https://www.brasilemfolhas.com.br/2026/09/pf-identifica-seis-reunioes-privadas-entre-moraes-e-dono-de-banco/].' },
        { text: 'No chat com o diretor do BC, o recado operacional é "{Vai chamar paulo pra dar um aperto}[action:search@diretor-paulo-sergio-bacen:aperto]". Com {Michael}[action:contact:michael], mordomo da casa, Vorcaro microgerencia a visita: "{Nao precisa ficar indo em todos locais dentro dacasa pra nao ficar forçado demais. Deixa ser bem natural}[action:search@michael:forçado]". Quando um funcionário tira foto com o ministro, Vorcaro: "{Isso nao podia ne}[action:search@michael:nao podia]". Michael: "{Mas se foi o ministro que pediu tudo bem}[action:search@michael:ministro que pediu]".' },
      ],
    },

    // ── Kassio / Rayanna / Serrano ──
    {
      title: 'Kassio, a viagem e o grupo',
      paragraphs: [
        { text: '{Leandro Serrano}[action:contact:leo-serrano] avisa, em dezembro de 2024: "{Aquele Kassio que pediu a viagem pra aquele grupo em janeiro sumiu}[action:search@leo-serrano:Kassio]". {Rayanna}[action:contact:rayanna] troca dados de pagamento no mesmo circuito; o material público registra que Kassio Nunes {negou o encontro}[action:search@rayanna:Kassio] e não participou. São recortes curtos — o relatório da PF só cita o que cabe na narrativa do evento e das viagens.' },
      ],
    },

    // ── Thatiane / Marcus Prime ──
    {
      title: 'Thatiane Garcia e Marcus Matta',
      paragraphs: [
        { text: '{Thatiane Garcia}[action:contact:thatiane-prime] e {Marcus Matta}[action:contact:marcos-prime] aparecem no laudo como o circuito "Prime" em volta do banco — agendas, prints e um recorte em que Marcos encaminha conversa com {Vivi Moraes}[action:contact:vivi-moraes]. São 28 e 21 mensagens, respectivamente; a conversa completa não está no PDF. Thatiane fecha um dos fios com "{Vou ver outra forma}[action:search@thatiane-prime:outra forma]".' },
      ],
    },

    // ── Leo Palhares / Bacen operacional ──
    {
      title: 'Leo Palhares e a estrutura societária',
      paragraphs: [
        { text: '{Leonardo Palhares}[action:contact:leo-palhares] opera o desenho societário quando a pressão chega: "{Está sob controle. Eles queriam que a empresa que fosse dona do ativo fosse uma}[action:search@leo-palhares:dona do ativo]". É o fio técnico do banco — 37 mensagens entre maio e julho de 2025 — paralelo às cobranças de Barci e às tratativas com o BC.' },
      ],
    },

    // ── Vazamento 1: Martha (mantido) ──
    {
      title: 'O vazamento das conversas com Martha Graeff',
      paragraphs: [
        { text: 'Em março de 2026, {as conversas de Vorcaro com a então noiva}[https://ndmais.com.br/justica/vorcaro-momolada-peleleca-conversas-martha-graeff/] {Martha Graeff}[action:contact:martha-graeff] vazaram para a imprensa — 65.772 mensagens que viraram o centro de uma onda de memes. A linguagem íntima do casal, com apelidos como "{colação}[action:search@martha-graeff:colação]" e "{peleleca}[action:search@martha-graeff:peleleca]", alcançou o topo dos assuntos mais comentados. Em várias mensagens eles trocam o "R" pelo "L", imitando o Cebolinha — "{PALAAAAAAA AGOLAAAA}[action:search@martha-graeff:PALAAAAA]".' },
        { text: 'Por trás do meme, as falas revelam uma vida de influência. Vorcaro relatou ter dado um "{discurso}[action:search@martha-graeff:discurso]" para "{ministros}[action:search@martha-graeff:ministros]" do STF e do STJ, descreveu jantares em um "{inner circle}[action:search@martha-graeff:inner circle]" exclusivo e se gabou de que o presidente do "{Banco Central}[action:search@martha-graeff:banco central]" comentou sobre sua "{casa de Miami}[action:search@martha-graeff:casa de Miami]". Martha reagia chamando a vida dele de "{surreal}[action:search@martha-graeff:surreal]".' },
      ],
    },
    {
      title: 'Destaques: Poder e Influência',
      paragraphs: [
        { text: '"{Fala que eu sou a anarquia do sistema}[action:search@martha-graeff:anarquia do sistema]" — Vorcaro descrevendo a si mesmo após encontros com autoridades.' },
        { text: '"{Acredita que o presidente bacen ja falou da nossa casa}[action:search@martha-graeff:bacen]" — o presidente do Banco Central comentando sobre a residência de Vorcaro em Miami.' },
        { text: '"{Acredita que um cara do middle east ofereceu 100mm de dolares}[action:search@martha-graeff:middle east]" — oferta milionária por um barco.' },
        { text: '"{Vou ter que mudar urgente pra miami}[action:search@martha-graeff:mudar urgente pra miami]" — planos de mudança às pressas.' },
      ],
    },
    {
      title: 'Destaques: Guerra com André Esteves',
      paragraphs: [
        { text: 'Vorcaro descreveu André Esteves do BTG Pactual como "{ardiloso}[action:search@martha-graeff:ardiloso]" e relatou que a "{guerra com andre}[action:search@martha-graeff:guerra com andre]" ficou exposta.' },
        { text: '"{Andre disse que era o maior banqueiro do mundo}[action:search@martha-graeff:maior banqueiro]". Vorcaro afirmou ter "{provas de quase todas}[action:search@martha-graeff:provas de quase todas]" as acusações contra políticos.' },
      ],
    },
    {
      title: 'Destaques: Política',
      paragraphs: [
        { text: '"{O pior de ontem foi ter o bolsonaro}[action:search@martha-graeff:bolsonaro]" — Vorcaro chamou o ex-presidente de "{idiota}[action:search@martha-graeff:idiota]" após uma postagem sobre o Banco Master.' },
        { text: 'Reuniões com "{Ciro}[action:search@martha-graeff:ciro]" Nogueira, menções à "{Interpol}[action:search@martha-graeff:Interpol]" e ao "{reporter da folha}[action:search@martha-graeff:reporter da folha]" que ligou perguntando sobre o barco.' },
      ],
    },
    {
      title: 'Destaques: Linguagem Afetiva',
      paragraphs: [
        { text: '"{Mora no meu colação}[action:search@martha-graeff:colação]" — apelido que aparece 26 vezes nas conversas.' },
        { text: '"{Peleleca vai estar cabelo branco e eu chupando}[action:search@martha-graeff:peleleca]" — o termo que dominou as redes.' },
        { text: '"{O meu vc ja roubou pra sempre}[action:search@martha-graeff:roubou pra sempre]" e "{querendo ficar horas no seu cangote}[action:search@martha-graeff:cangote]" — declarações de Vorcaro.' },
        { text: '"{Abstinencia do meu amor}[action:search@martha-graeff:abstinencia]" — Martha sobre a saudade. "Igual droga."' },
      ],
    },
    {
      title: 'Destaques: Conteúdo Íntimo',
      paragraphs: [
        { text: '"{Fiquei ali de amante pra nada?}[action:search@martha-graeff:amante pra nada]" — Martha admitindo ter sido amante por 6 meses antes do casal assumir publicamente.' },
        { text: '"{Você dentro de mim devagarinho}[action:search@martha-graeff:dentro de mim devagarinho]", "{Fico toda molhada só de pensar}[action:search@martha-graeff:toda molhada]" e "{Não usei o brinquedo mas usei o dedo}[action:search@martha-graeff:brinquedo mas usei o dedo]" — trechos íntimos que viralizaram.' },
      ],
    },
    {
      title: 'Destaques: Momentos Surreais',
      paragraphs: [
        { text: 'A palavra "{surreal}[action:search@martha-graeff:surreal]" aparece 91 vezes nas conversas — é a expressão mais repetida pelo casal para descrever sua vida.' },
        { text: 'Vorcaro foi ao "{hospital}[action:search@martha-graeff:hospital]" por questões emocionais, e o casal compartilhava gostos musicais como "{Gilsons}[action:search@martha-graeff:Gilsons]" e "{Rubel}[action:search@martha-graeff:Rubel]".' },
      ],
    },

    {
      title: 'Fontes e reportagens consultadas',
      paragraphs: [
        { text: 'Os trechos deste site foram cruzados com reportagens e documentos já públicos. A lista abaixo é referência de leitura — não esgota o noticiário nem autentica mensagem alguma.' },
        { text: '{Mendonça retira o sigilo da ação Vorcaro–Moraes}[https://www.poder360.com.br/poder-justica/mendonca-retira-sigilo-de-acao-sobre-vorcaro-e-moraes/] (Poder360). {Íntegra e síntese do relatório da PF}[https://www.jota.info/stf/do-supremo/saiba-tudo-o-que-diz-o-relatorio-da-pf-sobre-moraes-e-vorcaro-leia-a-integra-do-documento] (JOTA). {Prints das conversas no laudo}[https://g1.globo.com/politica/noticia/2026/09/02/vorcaro-e-moraes-veja-prints-de-conversas-reveladas-em-relatorio-da-pf.ghtml] (g1). {Como a PF rastreou as notas de visualização única}[https://www.cnnbrasil.com.br/blogs/jussara-soares/politica/como-a-pf-rastreou-as-mensagens-de-vorcaro-a-contato-atribuido-a-moraes/] (CNN). {Agência Brasil sobre a retirada de sigilo}[https://agenciabrasil.ebc.com.br/justica/noticia/2026-09/mendonca-retira-sigilo-de-processo-sobre-rede-de-pagamentos-de-vorcaro].' },
        { text: '{Contratos com o escritório Barci}[https://www.poder360.com.br/poder-justica/pf-encontra-contratos-de-r-208-mi-entre-vorcaro-e-barci-de-moraes/] (Poder360). {O que a PF descreve como benefícios à família Moraes}[https://g1.globo.com/politica/noticia/2026/09/02/que-vorcaro-ofereceu-a-moraes-e-sua-familia-segundo-a-pf.ghtml] (g1). {“Gratidão da minha vida a você”}[https://www.jota.info/stf/do-supremo/estamos-juntos-sempre-gratidao-da-minha-vida-a-voce-disse-vorcaro-a-moraes-segundo-a-pf] (JOTA). {Gonet, Londres, charuto e Macallan}[https://www.poder360.com.br/poder-justica/gonet-sobre-evento-com-vorcaro-que-tenha-charuto-e-macallan/] (Poder360). {O Globo: contrato, PF e viagem do filho}[https://oglobo.globo.com/politica/noticia/2026/09/02/contrato-intervencao-junto-a-pf-viagem-de-filho-entenda-como-novas-revelacoes-ligam-moraes-e-gonet-a-vorcaro.ghtml]. {Seis reuniões privadas}[https://www.brasilemfolhas.com.br/2026/09/pf-identifica-seis-reunioes-privadas-entre-moraes-e-dono-de-banco/].' },
        { text: '{Fórum de Londres}[https://www.metropoles.com/colunas/demetrio-vecchioli/dialogos-mostram-que-vorcaro-e-moraes-montaram-evento-juntos] (Metrópoles). {Fábio Faria como intermediário}[https://www.cnnbrasil.com.br/blogs/jussara-soares/politica/fabio-faria-intermediou-contatos-entre-moraes-e-vorcaro-diz-pf/] (CNN). {Juristas sobre uso político do relatório}[https://www.brasildefato.com.br/2026/09/01/entenda-o-caso-moraes-e-vorcaro-juristas-veem-uso-politico-e-crise-de-credibilidade/] (Brasil de Fato). {Panorama CNN}[https://www.cnnbrasil.com.br/politica/voo-em-jatinho-e-mensagens-o-que-se-sabe-sobre-o-caso-moraes-e-vorcaro/].' },
        { text: '{Folha: trânsito entre os três Poderes}[https://www1.folha.uol.com.br/mercado/2026/03/mensagens-de-vorcaro-mostram-transito-entre-stf-congresso-governo-e-empresarios.shtml]. {Folha: encontro com Moraes relatado a Martha}[https://www1.folha.uol.com.br/mercado/2026/03/vorcaro-relatou-encontro-com-moraes-em-troca-de-mensagens-com-namorada.shtml]. {Folha: CPI, luxo e rede}[https://www1.folha.uol.com.br/mercado/2026/03/cpi-expoe-luxo-acesso-ao-poder-e-rede-de-intrigas-de-vorcaro.shtml]. {Folha: Miami e trust}[https://www1.folha.uol.com.br/mercado/2026/03/vorcaro-discutiu-registrar-bens-no-nome-da-ex-namorada-em-negociacao-de-casa-de-r-490-milhoes.shtml]. {Estadão: “extorsão bem chata”}[https://www.estadao.com.br/politica/blog-do-fausto-macedo/vorcaro-relata-em-conversa-com-a-namorada-ter-sofrido-extorsao-bem-chata-em-brasilia/]. {Estadão: banco “igual máfia”}[https://www.estadao.com.br/politica/blog-do-fausto-macedo/esse-negocio-de-banco-sempre-falei-que-e-igual-mafia-nao-da-para-sair-disse-vorcaro-em-conversa/]. {Estadão: “me derrubar só matando”}[https://www.estadao.com.br/politica/coluna-do-estadao/me-derrubar-so-matando-e-isso-eles-nao-tem-coragem-disse-vorcaro-a-namorada/]. {Estadão: Martha diz que soube pela imprensa}[https://www.estadao.com.br/economia/negocios/ex-noiva-de-vorcaro-diz-que-soube-das-acusacoes-contra-o-banqueiro-pela-imprensa/]. {ND+ sobre o vazamento com Martha}[https://ndmais.com.br/justica/vorcaro-momolada-peleleca-conversas-martha-graeff/].' },
        { text: '{BBC: Dark Horse e as duas apurações}[https://www.bbc.com/portuguese/articles/cj9xz29p70eo]. {Agência Brasil: Flávio no inquérito Dark Horse}[https://agenciabrasil.ebc.com.br/justica/noticia/2026-09/mendonca-incluiu-flavio-bolsonaro-como-investigado-no-caso-dark-horse]. {g1: cronologia PF Flávio–Vorcaro}[https://g1.globo.com/politica/noticia/2026/09/12/pf-lista-serie-de-contatos-e-encontros-entre-flavio-bolsonaro-e-vorcaro-veja-cronologia.ghtml]. {Valor: cobranças de Flávio no relatório}[https://valor.globo.com/politica/noticia/2026/09/12/relatrio-da-pf-sobre-dark-horse-mostra-mensagens-de-flvio-cobrando-vorcaro.ghtml].' },
      ],
    },

    {
      title: 'Contato e irregularidades',
      paragraphs: [
        { text: 'Para contato institucional ou para reportar erro, trecho indevido, falha de atribuição ou qualquer irregularidade neste site, escreva para {steve.jkl5@gmail.com}[mailto:steve.jkl5@gmail.com]. O pedido é analisado e, quando cabível, o conteúdo é corrigido ou retirado.' },
      ],
    },
    {
      title: 'Aviso legal',
      paragraphs: [
        { text: 'Esta plataforma apenas organiza e exibe informações que já circulavam em fontes abertas — reportagens, documentos públicos e peças cujo sigilo foi levantado por decisão judicial. Não produz, não autentica e não garante a integralidade, a autoria ou a veracidade de cada mensagem.' },
        { text: 'Os trechos aqui reunidos não constituem aconselhamento jurídico, juízo de valor sobre pessoas citadas nem acusação. Qualquer uso, reprodução, edição ou interpretação desses trechos é de responsabilidade exclusiva de quem os utiliza. A plataforma não se responsabiliza por danos, ofensas ou consequências decorrentes desse uso por terceiros.' },
        { text: 'A presença de um nome, cargo ou conversa neste site não implica relação, endosso ou vínculo com as pessoas, empresas ou instituições mencionadas. Pedidos fundamentados de correção ou remoção devem ser enviados ao e-mail acima.' },
      ],
    },
  ],
};

export const SETTINGS_CREDITS = 'Contato e denúncia de irregularidades: {steve.jkl5@gmail.com}[mailto:steve.jkl5@gmail.com]. Projeto original de {Rafael Bressan}[https://linkedin.com/in/rafaelbressan] ({código no GitHub}[https://github.com/rafaelbressan/masterzap]). Material de fonte aberta; a plataforma não se responsabiliza pelo uso que terceiros façam dos trechos exibidos.';