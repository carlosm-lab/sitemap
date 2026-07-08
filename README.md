# Tracker de Indexación (Confecciones Liss)

Proyecto simple que guarda un arreglo de URLs con su estado `indexed` en Neon Postgres. La interfaz estática en `index.html` y la función serverless en `api/data.js` leen y escriben el arreglo desde una base de datos conectada por `DATABASE_URL`.

Despliegue en Vercel (pasos exactos):

1. Crear un repositorio en GitHub y subir este proyecto.
2. En el dashboard de Vercel, importar el repositorio.
3. En la pestaña **Storage** del proyecto, crear o conectar una base Neon y dejar que Vercel inyecte `DATABASE_URL`.
4. Hacer un redeploy desde la interfaz de Vercel (o hacer push a la rama principal) para que la función `api/data.js` pueda acceder a Neon.

Notas:
- No requiere configurar variables de entorno manualmente si la base Neon se conectó desde Vercel; la app usará `DATABASE_URL` automáticamente.
- La función serverless es `api/data.js` y acepta `GET` (devuelve `{ data: [...] }` o `{ data: null }`) y `POST` (recibe directamente un arreglo JSON o `{ data: [...] }`).
- Si hay problemas de conexión a Neon, la API devuelve códigos HTTP 503 con mensajes de error apropiados.
