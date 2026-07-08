# Tracker de Indexación (Confecciones Liss)

Proyecto simple que guarda un arreglo de URLs con su estado `indexed` en Vercel KV. Interfaz estática en `index.html` y función serverless en `api/data.js` que lee/escribe el array en KV.

Despliegue en Vercel (pasos exactos):

1. Crear un nuevo repositorio en GitHub (o usar el existente) y subir este proyecto.
2. En el dashboard de Vercel, importar el repositorio.
3. En la página del proyecto en Vercel, abrir la pestaña **Storage** y crear una instancia de Vercel KV o conectar una existente.
4. Conectar la instancia de KV al proyecto (Vercel inyecta las variables y permisos necesarios automáticamente).
5. Hacer un redeploy desde la interfaz de Vercel (o push a la rama principal) para que la función `api/data.js` pueda acceder a KV.

Notas:
- No requiere configurar variables de entorno manualmente: al conectar KV desde la pestaña Storage, Vercel provee lo necesario.
- La función serverless es `api/data.js` y acepta `GET` (devuelve `{ data: [...] }` o `{ data: null }`) y `POST` (recibe directamente un arreglo JSON o `{ data: [...] }`).
- Si hay problemas de conexión a KV, la API devuelve códigos HTTP 503 con mensajes de error apropiados.
