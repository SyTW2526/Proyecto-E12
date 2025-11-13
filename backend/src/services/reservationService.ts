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
  fecha_fin: string
): Promise<Reservation> => {
  const query = `
    INSERT INTO reserva (usuario_id, garaje_id, fecha_inicio, fecha_fin, estado)
    VALUES ($1, $2, $3, $4, 'pendiente')
    RETURNING *;
  `;
  const result: QueryResult<Reservation> = await pool.query(query, [
    usuario_id,
    garaje_id,
    fecha_inicio,
    fecha_fin,
  ]);
  return result.rows[0];
};

/**
 * Obtiene las reservas asociadas a un usuario
 */
export const getReservationsByUser = async (userId: number): Promise<Reservation[]> => {
  const query = 'SELECT * FROM reserva WHERE usuario_id = $1 ORDER BY fecha_inicio DESC;';
  const result: QueryResult<Reservation> = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * Cancela una reserva por ID
 */
export const cancelReservation = async (id: number): Promise<Reservation | null> => {
  const query = `
    UPDATE reserva
    SET estado = 'cancelada'
    WHERE id = $1
    RETURNING *;
  `;
  const result: QueryResult<Reservation> = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Obtiene las reservas asociadas a un garaje
 */
export const getReservationsByGarage = async (garageId: number): Promise<Reservation[]> => {
  const query = `
    SELECT r.*, u.nombre AS usuario_nombre, u.email AS usuario_email
    FROM reserva r
    JOIN usuario u ON r.usuario_id = u.id
    WHERE r.garaje_id = $1
    ORDER BY r.fecha_inicio DESC;
  `;
  const result: QueryResult<Reservation> = await pool.query(query, [garageId]);
  return result.rows;
};
