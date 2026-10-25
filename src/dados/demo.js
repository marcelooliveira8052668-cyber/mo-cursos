// =============================================
// CURSO DE DEMONSTRAÇÃO
// =============================================

// Eu crio um curso completo para a plataforma nascer com conteúdo:
// vídeo, resumo, atividade e exercício em cada módulo. O professor
// de verdade apaga este curso e cria os seus (ou edita por cima).

// Vídeos públicos estáveis do YouTube — troque pelos seus vídeos
// não-listados: cole o link na hora de editar a aula.
const V1 = 'aqz-KE-bpKQ'
const V2 = 'YE7VzlLtp-4'
const V3 = 'M7lc1UVf-VE'

export const CURSO_DEMO = {
  id: 'c-demo-site',
  professorId: 'u-prof-demo',
  titulo: 'Seu Primeiro Site Profissional',
  resumo: 'Do zero ao site publicado: HTML, CSS, identidade visual e endereço próprio.',
  descricao:
    'Neste curso você monta um site completo do zero e coloca no ar gratuitamente. Cada aula tem exercício com correção automática e atividade prática para você fazer no seu ritmo — e, ao concluir, um certificado com o seu nome.',
  categoria: 'Programação',
  emoji: '💻',
  preco: 197,
  criadoEm: '2026-01-10T12:00:00.000Z',
  modulos: [
    {
      id: 'm-demo-1',
      titulo: 'Preparação',
      aulas: [
        {
          id: 'a-demo-1',
          titulo: 'Boas-vindas e como usar a plataforma',
          minutos: 8,
          resumo:
            'Bem-vindo ao curso! Nesta aula eu mostro como acompanhar as aulas, entregar atividades e tirar o certificado no final.',
          video: { tipo: 'youtube', url: V1 },
          atividade: {
            titulo: 'Apresente-se',
            descricao:
              'Escreva (ou grave um áudio de 1 minuto) apresentando-se: quem você é e o que espera deste curso. Envie abaixo como arquivo de texto, PDF ou áudio.',
            arquivoId: null,
          },
          exercicio: {
            perguntas: [
              {
                id: 'p-demo-1',
                enunciado: 'Onde ficam guardadas as atividades que você entrega?',
                alternativas: ['Na nuvem da escola', 'No seu aparelho, nesta plataforma', 'Em um e-mail'],
                correta: 1,
              },
              {
                id: 'p-demo-2',
                enunciado: 'O que você precisa para acompanhar o curso?',
                alternativas: ['Conta com e-mail e senha', 'Impressora', 'Programa pago'],
                correta: 0,
              },
            ],
          },
        },
        {
          id: 'a-demo-2',
          titulo: 'Como a internet funciona (visão prática)',
          minutos: 10,
          resumo:
            'Entenda domínio, hospedagem e navegador em linguagem simples — a base para publicar seu site depois.',
          video: { tipo: 'youtube', url: V2 },
          atividade: null,
          exercicio: {
            perguntas: [
              {
                id: 'p-demo-3',
                enunciado: 'Qual é o endereço que as pessoas digita para ver um site?',
                alternativas: ['O domínio', 'O IP do computador', 'A senha do Wi-Fi'],
                correta: 0,
              },
            ],
          },
        },
      ],
    },
    {
      id: 'm-demo-2',
      titulo: 'Montando o site',
      aulas: [
        {
          id: 'a-demo-3',
          titulo: 'HTML na prática: a estrutura de tudo',
          minutos: 15,
          resumo:
            'Título, parágrafo, imagem e link: você monta sua primeira página enquanto assiste.',
          video: { tipo: 'youtube', url: V3 },
          atividade: {
            titulo: 'Sua primeira página',
            descricao:
              'Monte uma página com seu nome, uma frase sobre você e um link. Cole o código em um arquivo .txt ou envie a página inteira (index.html).',
            arquivoId: null,
          },
          exercicio: {
            perguntas: [
              {
                id: 'p-demo-4',
                enunciado: 'Qual etiqueta cria o título principal de uma página?',
                alternativas: ['<h1>', '<title-page>', '<head-main>'],
                correta: 0,
              },
              {
                id: 'p-demo-5',
                enunciado: 'Qual etiqueta insere uma imagem?',
                alternativas: ['<pic>', '<img>', '<image>'],
                correta: 1,
              },
            ],
          },
        },
        {
          id: 'a-demo-4',
          titulo: 'CSS e identidade visual',
          minutos: 12,
          resumo:
            'Cores, fontes e espaçamento: sua página deixa de ser crua e ganha cara de profissional.',
          video: { tipo: 'youtube', url: V1 },
          atividade: null,
          exercicio: null,
        },
      ],
    },
    {
      id: 'm-demo-3',
      titulo: 'No ar',
      aulas: [
        {
          id: 'a-demo-5',
          titulo: 'Publicando seu site de graça',
          minutos: 9,
          resumo:
            'Passo a passo para colocar o site no ar em minutos, com endereço que você pode compartilhar.',
          video: { tipo: 'youtube', url: V2 },
          atividade: {
            titulo: 'Site no ar',
            descricao:
              'Publique seu site e envie aqui o endereço (em um arquivo .txt) — depois compartilhe com alguém da família!',
            arquivoId: null,
          },
          exercicio: {
            perguntas: [
              {
                id: 'p-demo-6',
                enunciado: 'O que é preciso para publicar um site estático?',
                alternativas: [
                  'Servidor pago obrigatório',
                  'Uma hospedagem gratuita já é suficiente',
                  'Nada, o site vai sozinho',
                ],
                correta: 1,
              },
            ],
          },
        },
        {
          id: 'a-demo-6',
          titulo: 'Próximos passos e como evoluir',
          minutos: 6,
          resumo: 'Para onde estudar depois: domínio próprio, formulários, JavaScript e portfólio.',
          video: { tipo: 'youtube', url: V3 },
          atividade: null,
          exercicio: null,
        },
      ],
    },
  ],
}
