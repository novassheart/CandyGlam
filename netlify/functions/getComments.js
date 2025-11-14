const { neon } = require('@netlify/neon');

const sql = neon();

exports.handler = async () => {
  try {
    const rows = await sql`
      SELECT
        c.id,
        c.text,
        c.created_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 200
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ comments: rows })
    };
  } catch (err) {
    console.error('GetComments error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'server error' })
    };
  }
};
