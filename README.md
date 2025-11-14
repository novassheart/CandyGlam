# Candy Glam — E-commerce Demo con Usuarios y Comentarios

Aplicación web de demostración para venta de productos (Candy y Glam) con sistema de usuarios, autenticación segura y comentarios.

## Stack Tecnológico

- **Frontend:** HTML, CSS, JavaScript vanilla (SPA con modales)
- **Backend:** Node.js + Express (local), Netlify Functions (producción)
- **Base de datos:** PostgreSQL (Neon)
- **Autenticación:** JWT (JSON Web Tokens)
- **Seguridad:** bcrypt para hashing de contraseñas
- **Hosting:** Netlify (frontend + funciones serverless)

## Estructura de Carpetas

```
e:\Candy Glam\
├── public/                     # Archivos estáticos servidos al cliente
│   ├── candy.html              # Página principal
│   ├── styles.css              # Estilos
│   └── app.js                  # Lógica del cliente
├── netlify/
│   └── functions/              # Funciones serverless (Netlify)
│       ├── signup.js           # Crear nueva cuenta
│       ├── login.js            # Iniciar sesión
│       ├── postComment.js      # Publicar comentario
│       └── getComments.js      # Obtener comentarios
├── .env                        # Variables de entorno (local, NO subir a Git)
├── .env.example                # Plantilla de .env
├── .gitignore                  # Archivos a ignorar en Git
├── package.json                # Dependencias
├── server.js                   # Servidor Express (para dev local)
└── README.md                   # Este archivo
```

## Setup Local

### 1. Instalar dependencias

```bash
npm install
```

Instala: `express`, `@netlify/neon`, `bcrypt`, `jsonwebtoken`, `dotenv`.

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y rellena:

```bash
NETLIFY_DATABASE_URL=postgresql://user:pass@host/dbname
NETLIFY_JWT_SECRET=tu_clave_secreta_aleatoria
```

Obtén la connection string de Neon en tu panel de proyecto.

### 3. Crear tablas en Neon

Entra en la consola SQL de Neon y ejecuta:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. Probar localmente

**Opción A: Con Node + Netlify CLI (recomendado)**

```bash
npm install -g netlify-cli
netlify dev
```

Abre `http://localhost:8888`.

**Opción B: Con Express directo**

```bash
node server.js
```

Abre `http://localhost:5000`.

## Despliegue en Netlify

### 1. Conectar repositorio Git

- Ve a [Netlify](https://app.netlify.com)
- Click en "New site from Git"
- Selecciona tu repositorio

### 2. Configurar variables de entorno

En Netlify → Site settings → Build & deploy → Environment:

- `NETLIFY_DATABASE_URL`: Connection string de Neon (con pooler)
- `NETLIFY_JWT_SECRET`: La misma clave que usas localmente

### 3. Deploy

Netlify detectará `netlify/functions/` y desplegará automáticamente. El frontend estático en `public/` se servará a través de CDN.

## Características

### Usuarios
- Registro con validación de contraseña (>= 8 caracteres)
- Login seguro con JWT
- Contraseñas hasheadas con bcrypt

### Carrito
- Agregar/quitar productos
- Requiere iniciar sesión

### Comentarios
- Publicar comentarios (autenticado)
- Ver comentarios con nombre del autor
- XSS protection (renderizado seguro)

### Órdenes
- Crear orden desde carrito
- Se guarda en `orders.json` (local) o en BD (future upgrade)

## Seguridad

- ✅ Archivos sensibles (`.env`, `netlify/functions/`) no servidos públicamente
- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación stateless
- ✅ XSS protection (textContent en lugar de innerHTML)
- ✅ `.env` en `.gitignore`
- ✅ Validaciones en servidor (longitud mínima de contraseña, formato email, etc.)

## Troubleshooting

**"Error: NETLIFY_DATABASE_URL no está definida"**
- Verifica que la variable existe en `.env` (local) y en Netlify dashboard (producción)

**"Comentarios no se cargan"**
- Revisa que la tabla `comments` existe en Neon
- Revisa logs de función en Netlify (Site settings → Functions)

**"XSS warning"**
- No uses `innerHTML` para comentarios; ya está solucionado en `app.js`

## Licencia

ISC
