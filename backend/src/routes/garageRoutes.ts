import express from 'express';
import multer from 'multer';
import pool from '../db/pool.js';
import { QueryResult } from 'pg';
import { Parking } from '../models/parking.js';
import { protect } from '../middleware/auth.js';

export const router = express.Router();

// Configuración de multer para manejar imágenes en memoria
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

/**
 * @route POST /garages
 * @param reqBody - Objeto con los datos del garaje a crear.
 * @returns El garaje creado o un error en caso de fallo.
 */
router.post('/', protect, upload.single('imagen_garaje'), async (req: any, res) => {
  const { direccion, descripcion, precio } = req.body;
  const propietario_id = req.user.id;

  // Validación básica
  if (!direccion || !precio) {
    return res.status(400).send({
      error: 'direccion y precio son campos requeridos',
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
      req.file ? req.file.buffer : null, // Guardar imagen como BYTEA
      precio,
      true, // Por defecto disponible
    ];

    const result: QueryResult<Parking> = await pool.query(query, values);
    const garage = result.rows[0];
    
    // Convertir imagen BYTEA a base64 si existe
    if (garage.imagen_garaje) {
      (garage as any).imagen = `data:image/jpeg;base64,${Buffer.from(garage.imagen_garaje).toString('base64')}`;
      delete (garage as any).imagen_garaje;
    }
    
    res.status(201).send(garage);
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
      // Convertir imágenes BYTEA a base64
      const garages = result.rows.map(garage => {
        if (garage.imagen_garaje) {
          return {
            ...garage,
            imagen: `data:image/jpeg;base64,${Buffer.from(garage.imagen_garaje).toString('base64')}`,
            imagen_garaje: undefined
          };
        }
        return garage;
      });
      
      res.status(200).send(garages);
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
    
    const garage = result.rows[0];
    
    // Convertir imagen BYTEA a base64 si existe
    if (garage.imagen_garaje) {
      (garage as any).imagen = `data:image/jpeg;base64,${Buffer.from(garage.imagen_garaje).toString('base64')}`;
      delete (garage as any).imagen_garaje;
    }
    
    res.status(200).send(garage);
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
router.patch('/:id', protect, upload.single('imagen_garaje'), async (req: any, res) => {
  const { id } = req.params;
  const { direccion, descripcion, precio, disponible } = req.body;
  const userId = req.user.id;
  
  try {
    // Verificar que el garaje existe y pertenece al usuario
    const checkQuery = 'SELECT * FROM garaje WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [Number(id)]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).send({ message: 'Garaje no encontrado' });
    }
    
    if (checkResult.rows[0].propietario_id !== userId) {
      return res.status(403).send({ error: 'No tienes permiso para modificar este garaje' });
    }
    
    // Construir la query dinámicamente
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (direccion !== undefined) {
      updates.push(`direccion = $${paramIndex}`);
      values.push(direccion);
      paramIndex++;
    }

    if (descripcion !== undefined) {
      updates.push(`descripcion = $${paramIndex}`);
      values.push(descripcion);
      paramIndex++;
    }

    if (precio !== undefined) {
      updates.push(`precio = $${paramIndex}`);
      values.push(precio);
      paramIndex++;
    }

    if (disponible !== undefined) {
      updates.push(`disponible = $${paramIndex}`);
      values.push(disponible === 'true' || disponible === true);
      paramIndex++;
    }

    if (req.file) {
      updates.push(`imagen_garaje = $${paramIndex}`);
      values.push(req.file.buffer);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).send({
        error: 'Debe proporcionar al menos un campo a modificar',
      });
    }

    values.push(Number(id));

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
    
    const garage = result.rows[0];
    
    // Convertir imagen BYTEA a base64 si existe
    if (garage.imagen_garaje) {
      (garage as any).imagen = `data:image/jpeg;base64,${Buffer.from(garage.imagen_garaje).toString('base64')}`;
      delete (garage as any).imagen_garaje;
    }
    
    res.status(200).send(garage);
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
router.delete('/:id', protect, async (req: any, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verificar que el garaje existe y pertenece al usuario
    const checkQuery = 'SELECT * FROM garaje WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [Number(id)]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).send({ message: 'Garaje no encontrado' });
    }
    
    if (checkResult.rows[0].propietario_id !== userId) {
      return res.status(403).send({ error: 'No tienes permiso para eliminar este garaje' });
    }
    
    const query = 'DELETE FROM garaje WHERE id = $1 RETURNING *';
    const result: QueryResult<Parking> = await pool.query(query, [Number(id)]);
    
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
