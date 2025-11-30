import express from 'express';
import pool from '../db/pool.js';
import { QueryResult } from 'pg';
import { Parking } from '../models/parking.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../utils/multer.js';
import { getCoordinatesFromAddress } from '../utils/getCoordinatesFromAddress.js';
import Stripe from 'stripe';

// Crea objeto Stripe para usar la API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

export const router = express.Router();

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
    // Comprobar si el propietario ya tiene cuenta de Stripe
    let stripeAccountId = req.user.stripe_account_id;
    let needsOnboarding = false;
    
    if (!stripeAccountId) {
      try {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'ES',
          email: req.user.email || undefined,
          business_type: 'individual',
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });

        stripeAccountId = account.id;
        needsOnboarding = true;

        // Guardar stripe_account_id en la tabla usuario
        await pool.query('UPDATE usuario SET stripe_account_id = $1 WHERE id = $2', [stripeAccountId, propietario_id]);
      } catch (stripeError) {
        console.error('Error creando cuenta Stripe:', stripeError);
        return res.status(500).send({ error: 'Error al crear cuenta de Stripe para el propietario' });
      }
    } else {
      // Verificar si la cuenta ya completó el onboarding
      try {
        const account = await stripe.accounts.retrieve(stripeAccountId);
        needsOnboarding = !account.details_submitted || !account.charges_enabled;
      } catch (stripeError) {
        console.error('Error verificando estado de cuenta Stripe:', stripeError);
      }
    }

    // Obtener coordenadas de la dirección
    const coordinates = await getCoordinatesFromAddress(direccion);
    
    const query = `
      INSERT INTO garaje (propietario_id, direccion, latitud, longitud, descripcion, imagen_garaje, precio, disponible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      propietario_id,
      direccion,
      coordinates?.lat || null,
      coordinates?.lon || null,
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
    
    res.status(201).send({
      ...garage,
      needs_onboarding: needsOnboarding,
      stripe_account_id: needsOnboarding ? stripeAccountId : undefined,
    });
  } catch (error) {
    console.error('Error creating garage:', error);
    res.status(500).send({ error: 'Error al crear el garaje' });
  }
});

/**
 * @route GET /garages/available
 * @param reqQuery - fecha_inicio y fecha_fin para verificar disponibilidad
 * @returns Lista de garajes disponibles en el rango de fechas especificado
 */
router.get('/available', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Validar que se proporcionen las fechas
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).send({
        error: 'fecha_inicio y fecha_fin son requeridos',
      });
    }

    // Validar que fecha_fin sea posterior a fecha_inicio
    if (new Date(fecha_fin as string) <= new Date(fecha_inicio as string)) {
      return res.status(400).send({
        error: 'fecha_fin debe ser posterior a fecha_inicio',
      });
    }

    // Query para obtener garajes que NO tienen reservas que se solapen con las fechas solicitadas
    const query = `
      SELECT g.*
      FROM garaje g
      WHERE g.disponible = true
      AND NOT EXISTS (
        SELECT 1
        FROM reserva r
        WHERE r.garaje_id = g.id
        AND r.estado != 'cancelada'
        AND (
          (r.fecha_inicio <= $1 AND r.fecha_fin > $1) OR
          (r.fecha_inicio < $2 AND r.fecha_fin >= $2) OR
          (r.fecha_inicio >= $1 AND r.fecha_fin <= $2)
        )
      )
      ORDER BY g.fecha_creacion DESC
    `;

    const result: QueryResult<Parking> = await pool.query(query, [fecha_inicio, fecha_fin]);

    if (result.rows.length === 0) {
      return res.status(404).send({ message: 'No se encontraron garajes disponibles para las fechas seleccionadas' });
    }

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
  } catch (error) {
    console.error('Error fetching available garages:', error);
    res.status(500).send({ error: 'Error al obtener garajes disponibles' });
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
      // Si cambia la dirección, obtener nuevas coordenadas
      const coordinates = await getCoordinatesFromAddress(direccion);
      
      updates.push(`direccion = $${paramIndex}`);
      values.push(direccion);
      paramIndex++;
      
      updates.push(`latitud = $${paramIndex}`);
      values.push(coordinates?.lat || null);
      paramIndex++;
      
      updates.push(`longitud = $${paramIndex}`);
      values.push(coordinates?.lon || null);
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