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
  'Brasileirão': (title) => [
    { question: `Quais são os destaques da rodada do Brasileirão?`, answer: `Confira os principais acontecimentos e resultados da rodada do Campeonato Brasileiro Série A, incluindo gols, cartões e mudanças na classificação.` },
    { question: `Como está a classificação do Brasileirão atualmente?`, answer: `A classificação do Brasileirão é atualizada em tempo real no Acréscimos. Acesse a página de classificação para ver a tabela completa com pontos, saldo de gols e próximos jogos.` },
    { question: `Onde assistir aos jogos do Brasileirão?`, answer: `Os jogos do Brasileirão são transmitidos pela Globo, Premiere, SporTV e plataformas de streaming. Confira a programação completa de cada rodada no Acréscimos.` },
  ],
  'Mercado da Bola': (title) => [
    { question: `Quais são as últimas transferências do futebol brasileiro?`, answer: `Acompanhe todas as contratações, empréstimos e negociações dos clubes brasileiros no Acréscimos. Cobertura completa do mercado da bola com informações atualizadas.` },
    { question: `Quais jogadores estão sendo negociados?`, answer: `O Acréscimos acompanha todas as negociações em andamento no futebol brasileiro e internacional, com informações de bastidores e valores envolvidos.` },
    { question: `Quando abre a janela de transferências?`, answer: `O futebol brasileiro tem duas janelas de transferências: a principal no início do ano e a intermediária no meio do ano. Acompanhe datas e movimentações no Acréscimos.` },
  ],
  'Libertadores': (title) => [
    { question: `Quais times brasileiros estão na Libertadores?`, answer: `Acompanhe a participação dos clubes brasileiros na Copa Libertadores da América, com resultados, classificação dos grupos e chaves do mata-mata.` },
    { question: `Quando são os próximos jogos da Libertadores?`, answer: `Confira o calendário completo da Libertadores com datas, horários e locais de todos os jogos no Acréscimos.` },
    { question: `Como funciona o formato da Libertadores?`, answer: `A Libertadores tem fase de grupos com 8 grupos de 4 times, seguida de mata-mata com oitavas, quartas, semifinais e final. Os dois melhores de cada grupo avançam.` },
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
