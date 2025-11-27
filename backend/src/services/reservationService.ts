// services/reservationService.ts
import pool from '../db/pool.js';
import { QueryResult } from 'pg';
import { Reservation } from '../models/reservation.js';

/**
 * Crea una nueva reserva
 */
export const createReservation = async (
  usuario_id: number,
  garaje_id: number,
  fecha_inicio: string,
  fecha_fin: string,
  precio_total: number // ahora puedes pasar el precio correcto
): Promise<Reservation> => {
  const query = `
    INSERT INTO reserva (usuario_id, garaje_id, fecha_inicio, fecha_fin, estado, precio_total)
    VALUES ($1, $2, $3, $4, 'pendiente', $5)
    RETURNING id, usuario_id, garaje_id, fecha_inicio, fecha_fin, estado, precio_total;
  `;
  const result: QueryResult<any> = await pool.query(query, [
    usuario_id,
    garaje_id,
    fecha_inicio,
    fecha_fin,
    precio_total,
  ]);

  return {
    ...result.rows[0],
    precio_total: Number(result.rows[0].precio_total),
  };
};

/**
 * Obtiene las reservas de un usuario (Mis Reservas)
 */
export const getReservationsByUser = async (userId: number): Promise<Reservation[]> => {
  const query = `
    SELECT id, usuario_id, garaje_id, fecha_inicio, fecha_fin, estado, precio_total
    FROM reserva
    WHERE usuario_id = $1
    ORDER BY fecha_inicio DESC;
  `;
  const result: QueryResult<any> = await pool.query(query, [userId]);

  return result.rows.map(row => ({
    ...row,
    precio_total: row.precio_total !== null ? Number(row.precio_total) : 0,
  }));
};



/**
 * Cancela una reserva por ID
 */
export const cancelReservation = async (id: number): Promise<Reservation | null> => {
  const query = `
    UPDATE reserva
    SET estado = 'cancelada'
    WHERE id = $1 AND estado != 'completada'
    RETURNING id, usuario_id, garaje_id, fecha_inicio, fecha_fin, estado, precio_total;
  `;
  const result: QueryResult<any> = await pool.query(query, [id]);

  if (!result.rows[0]) return null;

  return {
    ...result.rows[0],
    precio_total: result.rows[0].precio_total !== null ? Number(result.rows[0].precio_total) : 0,
  };
};

/**
 * Obtiene las reservas recibidas para los garajes de un propietario
 */
export const getReservationsForOwnerGarages = async (ownerId: number): Promise<Reservation[]> => {
  const query = `
    SELECT r.id, r.usuario_id, r.garaje_id, r.fecha_inicio, r.fecha_fin, r.estado, r.precio_total
    FROM reserva r
    JOIN garaje g ON r.garaje_id = g.id
    WHERE g.propietario_id = $1
    ORDER BY r.fecha_inicio DESC;
  `;
  const result: QueryResult<any> = await pool.query(query, [ownerId]);

  return result.rows.map(row => ({
    ...row,
    precio_total: Number(row.precio_total),
  }));
};
