export interface CategoryMeta {
  slug: string;
  name: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { slug: 'brasileirao', name: 'Brasileirão', description: 'Cobertura completa do Campeonato Brasileiro Série A: resultados, tabela, gols e análises.' },
  { slug: 'campeonato-mineiro', name: 'Campeonato Mineiro', description: 'Tudo sobre o Campeonato Mineiro: Atlético-MG, Cruzeiro, América e os clubes de Minas Gerais.' },
  { slug: 'serie-b', name: 'Série B', description: 'Acompanhe a Série B do Brasileirão com resultados, classificação e destaques.' },
  { slug: 'copa-do-brasil', name: 'Copa do Brasil', description: 'Todos os jogos, resultados e destaques da Copa do Brasil.' },
  { slug: 'libertadores', name: 'Libertadores', description: 'Cobertura da CONMEBOL Libertadores com times brasileiros e sul-americanos.' },
  { slug: 'futebol-internacional', name: 'Futebol Internacional', description: 'Premier League, La Liga, Champions League e os principais campeonatos do mundo.' },
  { slug: 'selecao-brasileira', name: 'Seleção Brasileira', description: 'Notícias, convocações, resultados e análises da Seleção Brasileira de Futebol.' },
  { slug: 'copa-do-mundo', name: 'Copa do Mundo', description: 'Tudo sobre a Copa do Mundo FIFA: grupos, jogos, artilheiros e história.' },
  { slug: 'futebol-feminino', name: 'Futebol Feminino', description: 'Notícias do futebol feminino brasileiro e internacional.' },
  { slug: 'mercado-da-bola', name: 'Mercado da Bola', description: 'Transferências, contratações, renovações e rumores do mercado do futebol.' },
  { slug: 'basquete', name: 'Basquete', description: 'NBA, NBB e as principais notícias do basquete nacional e internacional.' },
  { slug: 'formula-1', name: 'Fórmula 1', description: 'Corridas, classificações, pilotos e equipes da Fórmula 1.' },
  { slug: 'tenis', name: 'Tênis', description: 'Grand Slams, ATP, WTA e os melhores momentos do tênis mundial.' },
  { slug: 'volei', name: 'Vôlei', description: 'Superliga, Seleção Brasileira e os destaques do vôlei.' },
  { slug: 'opiniao', name: 'Opinião', description: 'Colunas de opinião, análises táticas e debates do mundo esportivo.' },
  { slug: 'geral', name: 'Geral', description: 'Esportes em geral: atletismo, natação, MMA e muito mais.' },
];

export const CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.slug, c.name])
);

export const CATEGORY_NAMES: string[] = CATEGORIES.map(c => c.name);

export function getCategoryBySlug(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}

export function getCategorySlug(name: string): string {
  return CATEGORIES.find(c => c.name === name)?.slug ??
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
