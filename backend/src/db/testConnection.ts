import 'dotenv/config';
import pool from './pool';

async function test() {
  try {
    const r = await pool.query('SELECT now() as now');
    console.log('DB connected, now =', r.rows[0].now);
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  } finally {
    await pool.end(); // cerrar pool para que el proceso termine
  }
}

if (require.main === module) {
  test();
}
