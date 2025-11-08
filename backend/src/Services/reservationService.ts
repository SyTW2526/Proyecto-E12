// src/services/reservationService.ts
import pool from '../db/pool';
import { Reservation } from '../models/reservation';

type NewReservation = Omit<Reservation, 'id'>;

export const ReservationService = {
  getAll: async (): Promise<Reservation[]> => {
    const res = await pool.query('SELECT * FROM reserva ORDER BY id');
    return res.rows;
  },

  getById: async (id: number): Promise<Reservation | null> => {
    const res = await pool.query('SELECT * FROM reserva WHERE id = $1', [id]);
    return res.rows[0] || null;
  },

  create: async (data: NewReservation): Promise<Reservation> => {
    const { usuario_id, garaje_id, fecha_inicio, fecha_fin, estado } = data;
    // 1) Comprobar solapamiento de reservas 'pendiente' o 'activa'
    const conflictQuery = `
      SELECT 1 FROM reserva
      WHERE garaje_id = $1
        AND estado IN ('pendiente','activa')
        AND NOT (fecha_fin <= $2 OR fecha_inicio >= $3)
      LIMIT 1;
    `;
    const conflict = await pool.query(conflictQuery, [garaje_id, fecha_inicio, fecha_fin]);
    if (conflict.rowCount !== null && conflict.rowCount > 0) {
      const err: any = new Error('Garaje ocupado en ese intervalo');
      err.code = 'GARAGE_UNAVAILABLE';
      throw err;
    }
    // 2) Insertar reserva si no hay conflictos
    const insertQuery = `
      INSERT INTO reserva (usuario_id, garaje_id, fecha_inicio, fecha_fin, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const res = await pool.query(insertQuery, [usuario_id, garaje_id, fecha_inicio, fecha_fin, estado || 'pendiente']);
    return res.rows[0];
  },

  updateStatus: async (id: number, estado: Reservation['estado']): Promise<Reservation | null> => {
    const res = await pool.query(
      'UPDATE reserva SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    return res.rows[0] || null;
  },

  delete: async (id: number): Promise<boolean> => {
    const res = await pool.query('DELETE FROM reserva WHERE id = $1', [id]);
    return res.rowCount !== null && res.rowCount > 0;
  },
};
