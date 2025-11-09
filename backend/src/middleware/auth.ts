import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';

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

    req.user = user.rows[0];
    next();
  }
  catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
}