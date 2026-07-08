import { kv } from '@vercel/kv';

const KEY = 'liss_url_tracker_data';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      try {
        const stored = await kv.get(KEY);
        return res.status(200).json({ data: Array.isArray(stored) ? stored : null });
      } catch (err) {
        console.error('KV GET error', err);
        return res.status(503).json({ error: 'Servicio KV no disponible' });
      }
    }

    if (req.method === 'POST') {
      let body = req.body;
      // Allow either a raw array or an object like { data: [...] }
      if (body && typeof body === 'object' && !Array.isArray(body) && Array.isArray(body.data)) {
        body = body.data;
      }

      if (!Array.isArray(body)) {
        return res.status(400).json({ error: 'Formato inválido, se esperaba un arreglo.' });
      }

      try {
        await kv.set(KEY, body);
        return res.status(200).json({ ok: true });
      } catch (err) {
        console.error('KV SET error', err);
        return res.status(503).json({ error: 'No se pudo guardar en KV' });
      }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (err) {
    console.error('Unexpected error in /api/data', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
