// app.js — client logic for Candy Glam
(() => {
  'use strict';

  // Simple in-memory cart while user is logged in
  const cart = [];
  const cartCount = document.getElementById('cartCount');
  const cartBtn = document.getElementById('cartBtn');
  const cartModal = document.getElementById('cartModal');
  const cartList = document.getElementById('cartList');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const loginBtn = document.getElementById('loginToggle');
  const loginModal = document.getElementById('loginModal');
  const closeModal = document.getElementById('closeModal');
  const closeCart = document.getElementById('closeCart');

  function updateCartUI(){
    cartCount.textContent = cart.length;
    cartList.innerHTML = '';
    cart.forEach((item, idx) => {
      const li = document.createElement('li');
      li.textContent = item;
      const rem = document.createElement('button');
      rem.textContent = 'Quitar';
      rem.addEventListener('click', () => { cart.splice(idx,1); updateCartUI(); });
      li.appendChild(rem);
      cartList.appendChild(li);
    });
  }

  // Add buttons
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.name;
      // require login before adding
      if (!isLoggedIn()){
        openLoginModal();
        alert('Debes iniciar sesión o crear una cuenta antes de añadir al carrito.');
        return;
      }
      cart.push(name);
      updateCartUI();
    });
  });

  function isLoggedIn(){
    return !!localStorage.getItem('candyUser');
  }

  // Login modal handlers
  loginBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(); });
  function openLoginModal(){ loginModal.setAttribute('aria-hidden','false'); }
  function closeLogin(){ loginModal.setAttribute('aria-hidden','true'); }
  closeModal.addEventListener('click', closeLogin);

  // Cart
  cartBtn.addEventListener('click', (e)=>{ e.preventDefault(); cartModal.setAttribute('aria-hidden','false'); updateCartUI(); });
  closeCart.addEventListener('click', ()=>{ cartModal.setAttribute('aria-hidden','true'); });

  // Auth handling - Login with server (Netlify Function)
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const fd = new FormData(loginForm);
    const email = fd.get('email');
    const password = fd.get('password');
    try {
      const res = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('candyToken', data.token);
        localStorage.setItem('candyUser', data.user.email);
        localStorage.setItem('candyUserName', data.user.name);
        closeLogin();
        alert('Sesión iniciada como ' + data.user.email);
      } else {
        const err = await res.json();
        alert('Error: ' + (err.error || 'Login fallido'));
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Error de conexión al servidor');
    }
  });

  document.getElementById('toSignup').addEventListener('click', (e)=>{
    e.preventDefault();
    toggleSignup();
  });

  function toggleSignup(){
    const container = document.getElementById('authContainer');
    container.innerHTML = `
      <h2>Regístrate</h2>
      <form id="signupForm">
        <input name="name" type="text" placeholder="Nombre" required>
        <input name="email" type="email" placeholder="Correo electrónico" required>
        <input name="password" type="password" placeholder="Contraseña" required>
        <button type="submit" class="btn-primary">Crear cuenta</button>
      </form>
      <p class="muted">¿Ya tienes cuenta? <a href="#" id="toLogin">Inicia sesión</a></p>
    `;
    document.getElementById('toLogin').addEventListener('click', (ev)=>{ ev.preventDefault(); restoreLogin(); });
    document.getElementById('signupForm').addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const f = ev.target;
      const d = new FormData(f);
      const obj = Object.fromEntries(d.entries());
      try {
        const res = await fetch('/.netlify/functions/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: obj.name, email: obj.email, password: obj.password })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('candyUser', data.user.email);
          localStorage.setItem('candyUserName', data.user.name);
          alert('Cuenta creada: ' + data.user.email);
          restoreLogin();
          loginModal.setAttribute('aria-hidden','true');
        } else {
          const err = await res.json();
          alert('Error: ' + (err.error || 'Signup fallido'));
        }
      } catch (err) {
        console.error('Signup error:', err);
        alert('Error de conexión al servidor');
      }
    });
  }

  function restoreLogin(){
    const container = document.getElementById('authContainer');
    container.innerHTML = `
      <h2 id="loginTitle">Iniciar sesión</h2>
      <form id="loginForm">
        <input name="email" type="email" placeholder="Correo electrónico" required>
        <input name="password" type="password" placeholder="Contraseña" required>
        <button type="submit" class="btn-primary">Entrar</button>
      </form>
      <p class="muted">¿No tienes cuenta? <a href="#" id="toSignup">Regístrate</a></p>
    `;
    document.getElementById('toSignup').addEventListener('click', (ev)=>{ ev.preventDefault(); toggleSignup(); });
    document.getElementById('loginForm').addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      localStorage.setItem('candyUser', fd.get('email'));
      alert('Sesión iniciada: ' + fd.get('email'));
      loginModal.setAttribute('aria-hidden','true');
    });
  }

  // Checkout: save order to server (Netlify Function)
  checkoutBtn.addEventListener('click', async ()=>{
    if (!isLoggedIn()){ openLoginModal(); alert('Debes iniciar sesión antes de pedir.'); return; }
    if (cart.length === 0){ alert('El carrito está vacío.'); return; }
    const user = localStorage.getItem('candyUser');
    const payload = { user, items: cart.slice(), date: new Date().toISOString() };
    try {
      const res = await fetch('/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Pedido guardado.');
        cart.length = 0;
        updateCartUI();
        cartModal.setAttribute('aria-hidden','true');
      } else {
        alert('Error guardando pedido.');
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo enviar el pedido (servidor).');
    }
  });

  // wire service buttons
  document.querySelectorAll('.go-products-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.dataset.target;
      document.querySelectorAll('.products-grid').forEach(g=>g.style.display='none');
      const el = document.getElementById(target);
      if (el) el.style.display = 'block';
      window.location.hash = '#'+target;
    });
  });

  // Comments section
  const commentsContainer = document.getElementById('commentsContainer');
  const commentForm = document.getElementById('commentForm');
  const commentText = document.getElementById('commentText');
  const commentsList = document.getElementById('commentsList');

  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('candyToken');
      if (!token) {
        alert('Debes iniciar sesión para comentar');
        return;
      }
      const text = commentText.value.trim();
      if (!text) return;
      try {
        const res = await fetch('/.netlify/functions/postComment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ text })
        });
        if (res.ok) {
          commentText.value = '';
          await loadComments();
        } else {
          const err = await res.json();
          alert('Error: ' + (err.error || 'No se pudo guardar el comentario'));
        }
      } catch (err) {
        console.error('Comment error:', err);
        alert('Error de conexión');
      }
    });
  }

  async function loadComments() {
    try {
      const res = await fetch('/.netlify/functions/getComments');
      if (res.ok) {
        const data = await res.json();
        if (commentsList) {
          commentsList.innerHTML = '';
          data.comments.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            // Safe rendering to avoid XSS
            const author = document.createElement('strong');
            author.textContent = c.user_name || 'Anónimo';
            const p = document.createElement('p');
            p.textContent = c.text || '';
            const small = document.createElement('small');
            small.textContent = new Date(c.created_at).toLocaleString();
            div.appendChild(author);
            div.appendChild(p);
            div.appendChild(small);
            commentsList.appendChild(div);
          });
        }
      }
    } catch (err) {
      console.error('Load comments error:', err);
    }
  }

  // Cargar comentarios al iniciar
  if (commentsContainer) {
    loadComments();
  }
})();
