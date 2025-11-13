import express from 'express';
import pool from '../db/pool.js';
import { QueryResult } from 'pg';
import { Parking } from '../models/parking.js';

export const router = express.Router();

/**
 * @route POST /garages
 * @param reqBody - Objeto con los datos del garaje a crear.
 * @returns El garaje creado o un error en caso de fallo.
 */
router.post('/', async (req, res) => {
  const { propietario_id, direccion, descripcion, imagen_garaje, precio, disponible } = req.body;

  // Validación básica
  if (!propietario_id || !direccion || !precio) {
    return res.status(400).send({
      error: 'propietario_id, direccion y precio son campos requeridos',
    });
  }

  try {
    const query = `
      INSERT INTO garaje (propietario_id, direccion, descripcion, imagen_garaje, precio, disponible)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      propietario_id,
      direccion,
      descripcion || null,
      imagen_garaje || null,
      precio,
      disponible !== undefined ? disponible : true,
    ];

    const result: QueryResult<Parking> = await pool.query(query, values);
    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error('Error creating garage:', error);
    res.status(500).send({ error: 'Error al crear el garaje' });
  }
});

/**
 * @route GET /garages
 * @param reqQuery - Filtros para buscar garajes (disponible, propietario_id, etc.).
 * @returns Lista de garajes que coinciden con el filtro o un mensaje de error.
 */
router.get('/', async (req, res) => {
  try {
    const { disponible, propietario_id, precio_min, precio_max } = req.query;
    
    let query = 'SELECT * FROM garaje WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    // Filtros dinámicos
    if (disponible !== undefined) {
      query += ` AND disponible = $${paramIndex}`;
      values.push(disponible === 'true');
      paramIndex++;
    }

    if (propietario_id) {
      query += ` AND propietario_id = $${paramIndex}`;
      values.push(Number(propietario_id));
      paramIndex++;
    }

    if (precio_min) {
      query += ` AND precio >= $${paramIndex}`;
      values.push(Number(precio_min));
      paramIndex++;
    }

    if (precio_max) {
      query += ` AND precio <= $${paramIndex}`;
      values.push(Number(precio_max));
      paramIndex++;
    }

    query += ' ORDER BY fecha_creacion DESC';

    const result: QueryResult<Parking> = await pool.query(query, values);
    
    if (result.rows.length !== 0) {
      res.status(200).send(result.rows);
    } else {
      res.status(404).send({ message: 'No se encontraron garajes' });
    }
  } catch (error) {
    console.error('Error fetching garages:', error);
    res.status(500).send({ error: 'Error al obtener garajes' });
  }
});

/**
 * @route GET /garages/:id
 * @param reqParamsId - ID del garaje a buscar.
 * @returns El garaje encontrado o un mensaje de error si no existe.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM garaje WHERE id = $1';
    const result: QueryResult<Parking> = await pool.query(query, [Number(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Garaje no encontrado' });
    }
    
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error fetching garage by id:', error);
    res.status(500).send({ error: 'Error al obtener el garaje' });
  }
});

/**
 * @route PATCH /garages/:id
 * @param reqParamsId - ID del garaje a modificar.
 * @param reqBody - Campos a modificar.
 * @returns El garaje modificado o un mensaje de error si no existe.
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send({
      error: 'Debe proporcionar campos a modificar en el cuerpo de la solicitud',
    });
  }

  const allowedUpdates = ['direccion', 'descripcion', 'imagen_garaje', 'precio', 'disponible'];
  const actualUpdates = Object.keys(req.body);
  const isValidUpdate = actualUpdates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Actualización no permitida. Campos válidos: ' + allowedUpdates.join(', '),
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
      UPDATE garaje 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result: QueryResult<Parking> = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Garaje no encontrado' });
    }
    
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error updating garage:', error);
    res.status(500).send({ error: 'Error al actualizar el garaje' });
  }
});

/**
 * @route DELETE /garages/:id
 * @param reqParamsId - ID del garaje a eliminar.
 * @returns El garaje eliminado o un mensaje de error si no existe.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM garaje WHERE id = $1 RETURNING *';
    const result: QueryResult<Parking> = await pool.query(query, [Number(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'Garaje no encontrado' });
    }
    
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error('Error deleting garage:', error);
    res.status(500).send({ error: 'Error al eliminar el garaje' });
  }
});

/**
 * @route GET /garages/:id/reservations
 * @param reqParamsId - ID del garaje.
 * @returns Lista de reservas asociadas al garaje.
 */
router.get('/:id/reservations', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT r.*, u.nombre as usuario_nombre, u.email as usuario_email
      FROM reserva r
      JOIN usuario u ON r.usuario_id = u.id
      WHERE r.garaje_id = $1
      ORDER BY r.fecha_inicio DESC
    `;
    const result = await pool.query(query, [Number(id)]);
    
    res.status(200).send(result.rows);
  } catch (error) {
    console.error('Error fetching garage reservations:', error);
    res.status(500).send({ error: 'Error al obtener las reservas del garaje' });
  }
});

/**
 * @route GET /garages/:id/reviews
 * @param reqParamsId - ID del garaje.
 * @returns Lista de reseñas asociadas al garaje.
 */
router.get('/:id/reviews', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT r.*, u.nombre as usuario_nombre
      FROM resena r
      JOIN usuario u ON r.usuario_id = u.id
      WHERE r.garaje_id = $1
      ORDER BY r.fecha_creacion DESC
    `;
    const result = await pool.query(query, [Number(id)]);
    
    res.status(200).send(result.rows);
  } catch (error) {
    console.error('Error fetching garage reviews:', error);
    res.status(500).send({ error: 'Error al obtener las reseñas del garaje' });
  }
});
