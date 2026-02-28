import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function setup() {
    console.log('Creating tables...');

  await sql`CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
              slug TEXT UNIQUE NOT NULL,
                  content TEXT NOT NULL,
                      image TEXT DEFAULT '',
                          category TEXT DEFAULT 'Geral',
                              author TEXT DEFAULT 'Redação Acréscimos',
                                  published BOOLEAN DEFAULT true,
                                      featured BOOLEAN DEFAULT false,
                                          clicks INTEGER DEFAULT 0,
                                              created_at TIMESTAMPTZ DEFAULT NOW(),
                                                  updated_at TIMESTAMPTZ DEFAULT NOW()
                                                    )`;

  await sql`CREATE TABLE IF NOT EXISTS analytics (
      id SERIAL PRIMARY KEY,
          type TEXT NOT NULL,
              article_id INTEGER,
                  date DATE DEFAULT CURRENT_DATE,
                      count INTEGER DEFAULT 1
                        )`;

  await sql`CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL
                )`;

  await sql`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
          value TEXT NOT NULL
            )`;

  console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published)`;

  console.log('Inserting admin user...');
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
          throw new Error('ADMIN_PASSWORD environment variable is not set');
    }
    await sql`INSERT INTO admin_users (username, password)
        VALUES ('admin', ${adminPassword})
            ON CONFLICT (username) DO NOTHING`;

  console.log('Inserting settings...');
    await sql`INSERT INTO site_settings (key, value) VALUES ('site_name', 'Acréscimos') ON CONFLICT (key) DO NOTHING`;
    await sql`INSERT INTO site_settings (key, value) VALUES ('site_description', 'A Notícia Além do Tempo') ON CONFLICT (key) DO NOTHING`;
    await sql`INSERT INTO site_settings (key, value) VALUES ('breaking_news', 'URGENTE: Treinador da seleção convoca substituto.|MERCADO: Clube saudita faz proposta milionária.|LIBERTADORES: Conmebol define datas das finais.|BASQUETE: Astro da NBA anuncia aposentadoria.') ON CONFLICT (key) DO NOTHING`;

  console.log('Seeding articles...');
    const articles = [
      {
              title: 'Final eletrizante: Virada histórica nos acréscimos garante o título',
              slug: 'final-eletrizante-virada-historica',
              content: 'Em jogo de tirar o fôlego, equipe da casa busca o resultado impossível e levanta a taça diante de 50 mil torcedores. O gol decisivo saiu aos 47 minutos do segundo tempo.',
              category: 'Brasileirão',
              author: 'Redação Acréscimos',
              featured: true,
              clicks: 1250
      },
      {
              title: 'Atacante da seleção é sondado por gigantes europeus',
              slug: 'atacante-selecao-sondado-gigantes-europeus',
              content: 'O jovem atacante que brilhou nas últimas rodadas do Brasileirão entrou no radar de clubes como Real Madrid e Manchester City.',
              category: 'Mercado da Bola',
              author: 'Redação Acréscimos',
              featured: false,
              clicks: 890
      },
      {
              title: 'Análise: O que esperar da próxima rodada decisiva',
              slug: 'analise-proxima-rodada-decisiva',
              content: 'Com a reta final do campeonato se aproximando, cada ponto vale ouro. Analisamos os confrontos mais importantes da próxima rodada.',
              category: 'Brasileirão',
              author: 'Colunista 1',
              featured: false,
              clicks: 456
      },
      {
              title: 'Lakers vencem mais uma com show de LeBron',
              slug: 'lakers-vencem-show-lebron',
              content: 'LeBron James teve mais uma noite inspirada e comandou a vitória dos Lakers com 35 pontos, 8 rebotes e 11 assistências.',
              category: 'Basquete',
              author: 'Redação Acréscimos',
              featured: false,
              clicks: 320
      },
        ];

  for (const a of articles) {
        await sql`INSERT INTO articles (title, slug, content, category, author, published, featured, clicks)
              VALUES (${a.title}, ${a.slug}, ${a.content}, ${a.category}, ${a.author}, true, ${a.featured}, ${a.clicks})
                    ON CONFLICT (slug) DO NOTHING`;
  }

  const result = await sql`SELECT count(*) FROM articles`;
    console.log('Setup complete! Articles:', result[0].count);
}

setup().catch(e => {
    console.error(e);
    process.exit(1);
});
