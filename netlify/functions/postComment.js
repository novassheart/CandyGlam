const { neon } = require('@netlify/neon');
const jwt = require('jsonwebtoken');

const sql = neon();
const JWT_SECRET = process.env.NETLIFY_JWT_SECRET || 'dev-secret-change-me';

exports.handler = async (event) => {
  try {
    // Obtener token del header Authorization
    const auth = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'no authorization token' })
      };
    }

    // Verificar token JWT
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'invalid or expired token' })
      };
    }

    // Obtener texto del comentario
    const { text } = JSON.parse(event.body || '{}');
    if (!text || typeof text !== 'string' || !text.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'missing text field' })
      };
    }
    const cleanText = text.trim();
    if (cleanText.length > 1000) {
      return { statusCode: 400, body: JSON.stringify({ error: 'text too long (max 1000 chars)' }) };
    }

    // Insertar comentario
    const [res] = await sql`
      INSERT INTO comments (user_id, text)
      VALUES (${payload.userId}, ${cleanText})
      RETURNING id, user_id, text, created_at
    `;

    return {
      statusCode: 201,
      body: JSON.stringify({ comment: res })
    };
  } catch (err) {
    console.error('PostComment error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'server error' })
    };
  }
};
