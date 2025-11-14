const { neon } = require('@netlify/neon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sql = neon();
const JWT_SECRET = process.env.NETLIFY_JWT_SECRET || 'dev-secret-change-me';

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'missing fields (email, password required)' })
      };
    }

    // Buscar usuario por email
    const [user] = await sql`
      SELECT id, name, email, password FROM users WHERE email = ${email}
    `;
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'invalid credentials' })
      };
    }

    // Verificar contraseña
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'invalid credentials' })
      };
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: { id: user.id, name: user.name, email: user.email }
      })
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'server error' })
    };
  }
};
