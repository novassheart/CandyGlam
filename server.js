// Simple Node.js server to serve static files and accept orders
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
// change default port to 5000 to avoid conflicts with common dev preview ports
const PORT = process.env.PORT || 5000;

app.use(express.json());
// serve static files from the `public` folder only
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// ensure root serves public/candy.html
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'candy.html'));
});

app.post('/order', (req, res) => {
  const ordersFile = path.join(__dirname, 'orders.json');
  const order = req.body;
  if (!order || !order.user) return res.status(400).json({ error: 'invalid order' });
  let orders = [];
  try { orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8') || '[]'); } catch (e) { orders = []; }
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  res.json({ status: 'ok' });
});

app.listen(PORT, ()=>console.log('Server running on http://localhost:'+PORT));
