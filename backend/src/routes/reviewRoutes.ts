import express from 'express';
import pool from '../db/pool';
import { QueryResult } from 'pg';
import { Review } from '../models/review';

const router = express.Router();

/**
 * @route POST /reviews
 * @param reqBody - Objeto con los datos de la reseña a crear.
 * @returns La reseña creada o un error en caso de fallo.
 */
router.post('/', async (req, res) => {
  const { garaje_id, usuario_id, calificacion, comentario } = req.body;

  // Validación básica
  if (!garaje_id || !usuario_id || !calificacion) {
    return res.status(400).send({
      error: 'garaje_id, usuario_id y calificacion son campos requeridos',
    });
  }

  // Validar rango de calificación
  if (calificacion < 1 || calificacion > 5) {
    return res.status(400).send({
      error: 'La calificacion debe estar entre 1 y 5',
    });
  }

  try {
    const query = `
      INSERT INTO resena (garaje_id, usuario_id, calificacion, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [garaje_id, usuario_id, calificacion, comentario || null];

    const result: QueryResult<Review> = await pool.query(query, values);
    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).send({ error: 'Error al crear la reseña' });
  }
});

/**
 * @route GET /reviews
 * @param reqQuery - Filtros para buscar reseñas (garaje_id, usuario_id, calificacion_min).
 * @returns Lista de reseñas que coinciden con el filtro o un mensaje de error.
 */
router.get('/', async (req, res) => {
  try {
    const { garaje_id, usuario_id, calificacion_min } = req.query;
    
    let query = `
      SELECT r.*, u.nombre as usuario_nombre, g.direccion as garaje_direccion
      FROM resena r
      JOIN usuario u ON r.usuario_id = u.id
      JOIN garaje g ON r.garaje_id = g.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    // Filtros dinámicos
    if (garaje_id) {
      query += ` AND r.garaje_id = $${paramIndex}`;
      values.push(Number(garaje_id));
      paramIndex++;
    }

    if (usuario_id) {
      query += ` AND r.usuario_id = $${paramIndex}`;
      values.push(Number(usuario_id));
      paramIndex++;
    }

    if (calificacion_min) {
      query += ` AND r.calificacion >= $${paramIndex}`;
      values.push(Number(calificacion_min));
      paramIndex++;
    }

    query += ' ORDER BY r.fecha_creacion DESC';

    const result = await pool.query(query, values);
    
    if (result.rows.length !== 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send({ message: 'No se encontraron reseñas' });
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send({ error: 'Error al obtener reseñas' });
  }
});

/**
 * @route GET /reviews/:id
 * @param reqParamsId - ID de la reseña a buscar.
 * @returns La reseña encontrada o un mensaje de error si no existe.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT r.*, u.nombre as usuario_nombre, u.email as usuario_email, 
             g.direccion as garaje_direccion
      FROM resena r
      JOIN usuario u ON r.usuario_id = u.id
      JOIN garaje g ON r.garaje_id = g.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [Number(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Reseña no encontrada' });
    }
    
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error fetching review by id:', error);
    res.status(500).send({ error: 'Error al obtener la reseña' });
  }
});

/**
 * @route PATCH /reviews/:id
 * @param reqParamsId - ID de la reseña a modificar.
 * @param reqBody - Campos a modificar.
 * @returns La reseña modificada o un mensaje de error si no existe.
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({
      error: 'Debe proporcionar campos a modificar en el cuerpo de la solicitud',
    });
  }

  const allowedUpdates = ['calificacion', 'comentario'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Actualización no permitida. Campos válidos: ' + allowedUpdates.join(', '),
    });
  }

  // Validar calificación si se está actualizando
  if (req.body.calificacion && (req.body.calificacion < 1 || req.body.calificacion > 5)) {
    return res.status(400).send({
      error: 'La calificacion debe estar entre 1 y 5',
    });
  }

  try {
    // Construir la query dinámicamente
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    actualUpdates.forEach((field) => {
      updates.push(`${field} = $${paramIndex}`);
      values.push(req.body[field]);
      paramIndex++;
    });

    values.push(Number(id)); // El ID va al final

    const query = `
      UPDATE resena 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result: QueryResult<Review> = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Reseña no encontrada' });
    }
    
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).send({ error: 'Error al actualizar la reseña' });
  }
});

/**
 * @route DELETE /reviews/:id
 * @param reqParamsId - ID de la reseña a eliminar.
 * @returns La reseña eliminada o un mensaje de error si no existe.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM resena WHERE id = $1 RETURNING *';
    const result: QueryResult<Review> = await pool.query(query, [Number(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Reseña no encontrada' });
    }
    
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).send({ error: 'Error al eliminar la reseña' });
  }
});

/**
 * @route GET /reviews/garage/:garageId/average
 * @param reqParamsGarageId - ID del garaje.
 * @returns Promedio de calificaciones del garaje y número total de reseñas.
 */
router.get('/garage/:garageId/average', async (req, res) => {
  const { garageId } = req.params;

  try {
    const query = `
      SELECT 
        COUNT(*) as total_resenas,
        AVG(calificacion) as promedio_calificacion,
        MIN(calificacion) as calificacion_minima,
        MAX(calificacion) as calificacion_maxima
      FROM resena
      WHERE garaje_id = $1
    `;
    const result = await pool.query(query, [Number(garageId)]);
    
    const stats = result.rows[0];
    
    // Si no hay reseñas, devolver valores por defecto
    if (stats.total_resenas === '0') {
      return res.status(200).send({
        total_resenas: 0,
        promedio_calificacion: null,
        calificacion_minima: null,
        calificacion_maxima: null
      });
    }
    
    res.status(200).send({
      total_resenas: Number(stats.total_resenas),
      promedio_calificacion: parseFloat(stats.promedio_calificacion).toFixed(2),
      calificacion_minima: stats.calificacion_minima,
      calificacion_maxima: stats.calificacion_maxima
    });
  } catch (error) {
    console.error('Error fetching garage review average:', error);
    res.status(500).send({ error: 'Error al obtener estadísticas de reseñas' });
  }
});

export default router;
