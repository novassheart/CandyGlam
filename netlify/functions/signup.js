const { neon } = require('@netlify/neon');
const bcrypt = require('bcrypt');

const sql = neon(); // usa NETLIFY_DATABASE_URL automáticamente

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'missing fields (name, email, password required)' })
      };
    }

    // Validaciones básicas
    if (typeof name !== 'string' || name.length < 2) {
      return { statusCode: 400, body: JSON.stringify({ error: 'name too short' }) };
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'invalid email' }) };
    }
    if (typeof password !== 'string' || password.length < 8) {
      return { statusCode: 400, body: JSON.stringify({ error: 'password must be at least 8 characters' }) };
    }

    // Comprobar si el email ya existe
    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'email already exists' })
      };
    }

    // Hashear contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [user] = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashed})
      RETURNING id, name, email, created_at
    `;

    return {
      statusCode: 201,
      body: JSON.stringify({ ok: true, user })
    };
  } catch (err) {
    console.error('Signup error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'server error' })
    };
  }
};
