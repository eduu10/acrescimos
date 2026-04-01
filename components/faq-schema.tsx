import { JsonLd } from './json-ld'

interface FAQ {
  question: string
  answer: string
}

interface FaqSchemaProps {
  faqs: FAQ[]
}

export function FaqSchema({ faqs }: FaqSchemaProps) {
  if (faqs.length === 0) return null

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }}
    />
  )
}

const CATEGORY_FAQS: Record<string, (title: string) => FAQ[]> = {
  'Brasileirão': () => [
    { question: 'Quais são os destaques da rodada do Brasileirão?', answer: 'Confira os principais acontecimentos e resultados da rodada do Campeonato Brasileiro Série A, incluindo gols, cartões e mudanças na classificação no Acréscimos.' },
    { question: 'Como está a classificação do Brasileirão atualmente?', answer: 'A classificação do Brasileirão é atualizada em tempo real no Acréscimos. Acesse a página de classificação para ver a tabela completa com pontos, saldo de gols e próximos jogos.' },
    { question: 'Onde assistir aos jogos do Brasileirão?', answer: 'Os jogos do Brasileirão são transmitidos pela Globo, Premiere, SporTV e plataformas de streaming como Globoplay e Prime Video. Confira a programação no Acréscimos.' },
  ],
  'Campeonato Mineiro': () => [
    { question: 'Quem são os favoritos do Campeonato Mineiro?', answer: 'Atlético-MG, Cruzeiro e América-MG são os times de maior tradição no Mineiro. Acompanhe a classificação e todos os resultados no Acréscimos.' },
    { question: 'Como funciona o formato do Campeonato Mineiro?', answer: 'O Campeonato Mineiro tem fase de grupos, quartas de final, semifinais e final em dois jogos. O campeão representa Minas Gerais na Copa do Brasil.' },
    { question: 'Quando acontece o Campeonato Mineiro?', answer: 'O Campeonato Mineiro é disputado geralmente no primeiro semestre do ano, entre janeiro e abril. Acompanhe todas as datas e resultados no Acréscimos.' },
  ],
  'Mercado da Bola': () => [
    { question: 'Quais são as últimas transferências do futebol brasileiro?', answer: 'Acompanhe todas as contratações, empréstimos e negociações dos clubes brasileiros no Acréscimos. Cobertura completa do mercado da bola com informações atualizadas.' },
    { question: 'Quais jogadores estão sendo negociados?', answer: 'O Acréscimos acompanha todas as negociações em andamento no futebol brasileiro e internacional, com informações de bastidores e valores envolvidos.' },
    { question: 'Quando abre a janela de transferências?', answer: 'O futebol brasileiro tem duas janelas de transferências: a principal (janeiro-abril) e a intermediária (julho-agosto). Acompanhe datas e movimentações no Acréscimos.' },
  ],
  'Libertadores': () => [
    { question: 'Quais times brasileiros estão na Libertadores?', answer: 'Acompanhe a participação dos clubes brasileiros na Copa Libertadores da América, com resultados, classificação dos grupos e chaves do mata-mata.' },
    { question: 'Quando são os próximos jogos da Libertadores?', answer: 'Confira o calendário completo da Libertadores com datas, horários e locais de todos os jogos no Acréscimos.' },
    { question: 'Como funciona o formato da Libertadores?', answer: 'A Libertadores tem fase de grupos (8 grupos de 4 times), seguida de mata-mata com oitavas, quartas, semifinais e final. Os dois melhores de cada grupo avançam.' },
  ],
  'Copa do Brasil': () => [
    { question: 'Quando começa a Copa do Brasil?', answer: 'A Copa do Brasil começa geralmente em fevereiro com os clubes das divisões menores e vai até setembro com a grande final. Acompanhe todos os jogos no Acréscimos.' },
    { question: 'Quais times estão na Copa do Brasil?', answer: 'A Copa do Brasil reúne os campeões estaduais de todo o Brasil mais os times que se classificam por outros critérios, como posição no Brasileirão. São 92 times no total.' },
    { question: 'Quanto vale o prêmio da Copa do Brasil?', answer: 'O campeão da Copa do Brasil recebe um dos maiores prêmios do futebol nacional — mais de R$ 70 milhões — além da vaga garantida na fase de grupos da Libertadores.' },
  ],
  'Seleção Brasileira': () => [
    { question: 'Quais são os próximos jogos da Seleção Brasileira?', answer: 'Acompanhe o calendário completo da Seleção Brasileira com datas, adversários, horários e transmissões de todos os jogos no Acréscimos.' },
    { question: 'Quem é o técnico da Seleção Brasileira atualmente?', answer: 'Confira informações sobre o comando técnico, convocações e novidades da Seleção Brasileira no Acréscimos, com cobertura em tempo real.' },
    { question: 'Quando é a Copa do Mundo e o Brasil está classificado?', answer: 'Acompanhe as eliminatórias sul-americanas e a situação do Brasil na corrida para a Copa do Mundo com análises e notícias atualizadas no Acréscimos.' },
  ],
  'Futebol Internacional': () => [
    { question: 'O que está acontecendo no futebol europeu hoje?', answer: 'Acompanhe Premier League, La Liga, Serie A, Bundesliga e Ligue 1 com resultados, classificações e as principais notícias no Acréscimos.' },
    { question: 'Quais brasileiros se destacam no futebol europeu?', answer: 'O Acréscimos acompanha o desempenho dos jogadores brasileiros nas principais ligas europeias, com estatísticas, gols e notícias atualizadas.' },
    { question: 'Como está a Champions League esta temporada?', answer: 'Acompanhe a UEFA Champions League com resultados dos grupos, mata-mata, artilharia e as melhores análises táticas no Acréscimos.' },
  ],
  'Série B': () => [
    { question: 'Quem está liderando a Série B do Brasileirão?', answer: 'Acompanhe a classificação completa da Série B do Campeonato Brasileiro, com pontos, jogos, gols e a situação dos times na briga pelo acesso à Série A.' },
    { question: 'Quais times estão brigando pelo acesso na Série B?', answer: 'Os 4 primeiros colocados da Série B sobem para a Série A. Acompanhe a luta pelo acesso e os times em risco de rebaixamento para a Série C no Acréscimos.' },
    { question: 'Quando são jogados os jogos da Série B?', answer: 'A Série B começa em abril e vai até novembro, com jogos nas quartas e domingos. Confira o calendário completo e transmissões no Acréscimos.' },
  ],
}

const DEFAULT_FAQS: (title: string) => FAQ[] = (title) => [
  { question: `O que aconteceu no esporte hoje?`, answer: `Confira as principais notícias esportivas do dia no Acréscimos, com cobertura completa de futebol brasileiro, internacional e outros esportes.` },
  { question: `Onde encontrar resultados de jogos ao vivo?`, answer: `O Acréscimos oferece placar ao vivo de todos os principais campeonatos. Acesse a página de placar para acompanhar os jogos em tempo real.` },
  { question: `Quais campeonatos o Acréscimos cobre?`, answer: `O Acréscimos cobre Brasileirão, Copa do Brasil, Libertadores, Premier League, La Liga, Champions League, além de basquete, F1, tênis e vôlei.` },
]

export function generateArticleFAQs(category: string, title: string): FAQ[] {
  const categoryFn = CATEGORY_FAQS[category]
  if (categoryFn) return categoryFn(title)
  return DEFAULT_FAQS(title)
}
