# API EcoCampus - Instrucciones de Configuración

## Estructura de Datos
- `datos.json` - Base de datos principal
- Todos los datos comienzan en 0
- Se actualizan automáticamente con la interacción de usuarios

## Para Implementar en Servidor Real

1. **Subir a hosting:**
   - GitHub Pages (estático)
   - Netlify/Vercel (con funciones serverless)
   - Servidor propio con Node.js/PHP

2. **Endpoints necesarios:**
   - `GET /api/datos` - Obtener todos los datos
   - `POST /api/reportes` - Agregar nuevo reporte
   - `PUT /api/puntos/:id` - Actualizar punto de reciclaje

3. **Base de datos recomendada:**
   - JSON file (para inicio)
   - MongoDB/PostgreSQL (para producción)