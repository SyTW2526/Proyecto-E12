import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

/**
 * Middleware para proteger rutas y verificar autenticación del usuario.
 * 
 * @param req - La solicitud entrante
 * @param res - La respuesta que se enviará
 * @param next - La función para pasar al siguiente middleware
 * @returns 
 */
export const protect = async (req: any, res: any, next: any) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };
    const user = await pool.query('SELECT * FROM usuario WHERE id = $1', [decoded.id]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    const userData = user.rows[0];
    
    // Convertir imagen BYTEA a base64 si existe
    if (userData.imagen_perfil) {
      userData.imagen = `data:image/jpeg;base64,${userData.imagen_perfil.toString('base64')}`;
      delete userData.imagen_perfil;
    }

    req.user = userData;
    next();
  }
  catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
}