import { neon } from '@neondatabase/serverless';

const KEY = 'liss_url_tracker_data';
const TABLE_NAME = 'url_tracker_data';

function normalizeBody(body) {
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object' && !Array.isArray(body) && Array.isArray(body.data)) {
    return body.data;
  }
  return null;
}

async function getSql() {
  const connectionString = process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || process.env.POSTGRES_URL_NON_POOLING
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL_NO_SSL;

  if (!connectionString) {
    throw new Error('No database connection string configured');
  }
  return neon(connectionString);
}

async function ensureTable(sql) {
  await sql(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )
  `);
}

export default async function handler(req, res) {
  try {
    const sql = await getSql();
    await ensureTable(sql);

    if (req.method === 'GET') {
      try {
        const rows = await sql(`SELECT value FROM ${TABLE_NAME} WHERE key = $1 LIMIT 1`, [KEY]);
        const stored = rows?.[0]?.value;
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored;
        return res.status(200).json({ data: Array.isArray(parsed) ? parsed : null });
      } catch (err) {
        console.error('Neon GET error', err);
        return res.status(503).json({ error: 'No se pudo leer desde Neon' });
      }
    }

    if (req.method === 'POST') {
      const body = normalizeBody(req.body);
      if (!Array.isArray(body)) {
        return res.status(400).json({ error: 'Formato inválido, se esperaba un arreglo.' });
      }

      try {
        await sql(
          `INSERT INTO ${TABLE_NAME} (key, value) VALUES ($1, $2::jsonb)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [KEY, JSON.stringify(body)]
        );
        return res.status(200).json({ ok: true });
      } catch (err) {
        console.error('Neon POST error', err);
        return res.status(503).json({ error: 'No se pudo guardar en Neon' });
      }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Unexpected error in /api/data', err);
    return res.status(503).json({ error: 'No se pudo conectar a Neon. Revisa DATABASE_URL.' });
  }
}
