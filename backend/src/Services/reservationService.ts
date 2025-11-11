import express from 'express';
import pool from '../db/pool';
import { QueryResult } from 'pg';
import { Reservation } from '../models/reservation';

const router = express.Router();

/**
 * @route POST /reservations
 * @desc Crea una nueva reserva
 */
router.post('/', async (req, res) => {
  const { usuario_id, garaje_id, fecha_inicio, fecha_fin } = req.body;

  if (!usuario_id || !garaje_id || !fecha_inicio || !fecha_fin) {
    return res.status(400).send({ error: 'usuario_id, garaje_id, fecha_inicio y fecha_fin son requeridos.' });
  }

  try {
    const query = `
      INSERT INTO reserva (usuario_id, garaje_id, fecha_inicio, fecha_fin, estado)
      VALUES ($1, $2, $3, $4, 'pendiente')
      RETURNING *
    `;
    const values = [usuario_id, garaje_id, fecha_inicio, fecha_fin];
    const result: QueryResult<Reservation> = await pool.query(query, values);

    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).send({ error: 'Error interno al crear la reserva.' });
  }
});

/**
 * @route GET /reservations
 * @desc Obtiene todas las reservas (con filtros opcionales)
 */
router.get('/', async (req, res) => {
  try {
    const { usuario_id, garaje_id, estado } = req.query;

    let query = 'SELECT * FROM reserva WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (usuario_id) {
      query += ` AND usuario_id = $${paramIndex++}`;
      values.push(Number(usuario_id));
    }

    if (garaje_id) {
      query += ` AND garaje_id = $${paramIndex++}`;
      values.push(Number(garaje_id));
    }

    if (estado) {
      query += ` AND estado = $${paramIndex++}`;
      values.push(estado);
    }

    query += ' ORDER BY fecha_inicio DESC';

    const result: QueryResult<Reservation> = await pool.query(query, values);

    res.status(200).send(result.rows);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).send({ error: 'Error interno al obtener las reservas.' });
  }
});

/**
 * @route GET /reservations/:id
 * @desc Obtiene una reserva específica por su ID
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result: QueryResult<Reservation> = await pool.query(
      'SELECT * FROM reserva WHERE id = $1',
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Reserva no encontrada.' });
    }

    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).send({ error: 'Error interno al obtener la reserva.' });
  }
});

/**
 * @route PATCH /reservations/:id
 * @desc Actualiza una reserva (por ejemplo cambiar estado o fechas)
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha_inicio, fecha_fin, estado } = req.body;

  if (!fecha_inicio && !fecha_fin && !estado) {
    return res.status(400).send({ error: 'Debe proporcionar al menos un campo para actualizar.' });
  }

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (fecha_inicio) {
      updates.push(`fecha_inicio = $${paramIndex++}`);
      values.push(fecha_inicio);
    }

    if (fecha_fin) {
      updates.push(`fecha_fin = $${paramIndex++}`);
      values.push(fecha_fin);
    }

    if (estado) {
      updates.push(`estado = $${paramIndex++}`);
      values.push(estado);
    }

    values.push(Number(id));

    const query = `
      UPDATE reserva
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result: QueryResult<Reservation> = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Reserva no encontrada.' });
    }

    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).send({ error: 'Error interno al actualizar la reserva.' });
  }
});

/**
 * @route DELETE /reservations/:id
 * @desc Elimina una reserva
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result: QueryResult<Reservation> = await pool.query(
      'DELETE FROM reserva WHERE id = $1 RETURNING *',
      [Number(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Reserva no encontrada.' });
    }

    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).send({ error: 'Error interno al eliminar la reserva.' });
  }
});

export default router;
