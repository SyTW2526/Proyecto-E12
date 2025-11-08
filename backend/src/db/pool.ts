// npm install pg @types/pg
// npm install pg dotenv

import { config } from 'dotenv';
config({ path: '/Users/arundaswani/Desktop/SyTW/Proyecto-E12/.env' });

import { Pool } from 'pg';

// Se leen las variables de entorno -> .env
const pool = new Pool({
  user: process.env.DB_USER || 'myuser',
  host: process.env.DB_HOST || 'db',     // 'db' para docker-compose, 'localhost' si ejecutas el backend local
  database: process.env.DB_NAME || 'myapp',
  password: process.env.DB_PASSWORD || 'mypassword',
  port: Number(process.env.DB_PORT || 5432),

  // Opciones útiles del pool:
  max: Number(process.env.DB_POOL_MAX ?? 10),          // número máximo de conexiones en el pool
  idleTimeoutMillis: Number(process.env.DB_IDLE_MS ?? 30000), // tiempo para liberar conexiones inactivas
  connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS ?? 5000), // tiempo de espera para obtener conexión
});

// Log básico de errores no manejados del pool
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export default pool;