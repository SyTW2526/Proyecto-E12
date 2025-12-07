import express from 'express';
import { protect } from '../middleware/auth.js'; 
import Stripe from 'stripe';
import pool from '../db/pool.js';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import ClientConfirmation from '../emails/ClientConfirmation.js';
import OwnerNotification from '../emails/OwnerNotification.js';

// Crear objeto stripe para usar la api
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

// Crear objeto resend para enviar emails
const resend = new Resend(process.env.RESEND_API_KEY);

export const router = express.Router();

/**
 * Crear una reserva comprobando que el pago fue exitoso, tambien crea el registro del pago asociado y envía los correos de confirmación.
 */
router.post('/', async (req, res) => {
  try {
    console.log('Intentando crear una nueva reserva...');
    console.log('Body:', req.body);
    
    const { usuario_id, garaje_id, fecha_inicio, fecha_fin, tipo_vehiculo, precio_total, payment_intent_id } = req.body;

    if (!usuario_id || !garaje_id || !fecha_inicio || !fecha_fin || !tipo_vehiculo || !precio_total || !payment_intent_id) {
      console.log('Faltan campos obligatorios');
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    // Verificar que el pago fue exitoso
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    console.log(`Verificando intento de pago: ${payment_intent_id} - Estado: ${paymentIntent.status}`);

    if (paymentIntent.status === 'requires_capture') {
      // Capturar el pago inmediatamente
      console.log(`Capturando pago`);
      await stripe.paymentIntents.capture(payment_intent_id);
      console.log(`Se ha capturado el pago correctamente`);
    } else if (paymentIntent.status !== 'succeeded') {
      console.log(`Pago inválido: ${paymentIntent.status}`);
      return res.status(400).json({ error: `El pago no está listo. Estado: ${paymentIntent.status}` });
    }

    console.log(`Pago verificado`);

    // Crear la reserva
    const query = `
      INSERT INTO reserva (usuario_id, garaje_id, fecha_inicio, fecha_fin, tipo_vehiculo, precio_total, payment_intent_id, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'activa')
      RETURNING *;
    `;
    const result = await pool.query(query, [
      usuario_id,
      garaje_id,
      fecha_inicio,
      fecha_fin,
      tipo_vehiculo,
      precio_total,
      payment_intent_id,
    ]);

    const reserva = result.rows[0];

    // Obtener información del garaje y propietario (incluyendo stripe_account_id)
    const garajeQuery = `
      SELECT g.*, u.nombre as propietario_nombre, u.email as propietario_email, u.stripe_account_id
      FROM garaje g
      JOIN usuario u ON g.propietario_id = u.id
      WHERE g.id = $1;
    `;
    const garajeResult = await pool.query(garajeQuery, [garaje_id]);
    const garaje = garajeResult.rows[0];

    // Calcular comisión de QuickPark (20%) y monto para el propietario (80%)
    const totalPagado = Number(precio_total);
    const comisionQuickpark = totalPagado * 0.20;
    const montoPropietario = totalPagado * 0.80;

    // Obtener el charge_id del Payment Intent
    const chargeId = paymentIntent.latest_charge as string;

    // Crear registro en tabla pagos con estado pendiente_transferir
    const pagoQuery = `
      INSERT INTO pagos (reserva_id, total_pagado, comision_quickpark, monto_propietario, stripe_charge_id, stripe_account_id, estado)
      VALUES ($1, $2, $3, $4, $5, $6, 'pendiente_transferir')
      RETURNING *;
    `;
    const pagoResult = await pool.query(pagoQuery, [
      reserva.id,
      totalPagado,
      comisionQuickpark,
      montoPropietario,
      chargeId,
      garaje.stripe_account_id || null,
    ]);

    console.log(`Se ha registrado el pago: ID ${pagoResult.rows[0].id}`);

    // Obtener información del cliente
    const clienteQuery = `SELECT nombre, email FROM usuario WHERE id = $1`;
    const clienteResult = await pool.query(clienteQuery, [usuario_id]);
    const cliente = clienteResult.rows[0];

    // Calcular duración en días
    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);
    const duracionDias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));

    // Enviar correo al cliente
    try {
      const clientEmailHtml = await render(ClientConfirmation({
        clientName: cliente.nombre,
        location: garaje.direccion || 'Dirección del garaje',
        checkInDate: fechaInicio.toLocaleDateString('es-ES'),
        checkInTime: fechaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        checkOutDate: fechaFin.toLocaleDateString('es-ES'),
        checkOutTime: fechaFin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        duration: `${duracionDias} día${duracionDias > 1 ? 's' : ''}`,
        daysCount: duracionDias.toString(),
        pricePerDay: `€${(precio_total / duracionDias).toFixed(2)}`,
        totalPrice: `€${precio_total}`,
      }));

      await resend.emails.send({
        from: 'QuickPark <onboarding@resend.dev>',
        to: ['quickparksc@gmail.com'],
        subject: '¡Reserva Confirmada en QuickPark!',
        html: clientEmailHtml,
      });

      console.log('Email de confirmación enviado al cliente');
    } catch (emailError) {
      console.error('Error al enviar email al cliente:', emailError);
    }

    // Enviar correo al propietario
    try {
      const ownerEmailHtml = await render(OwnerNotification({
        ownerName: garaje.propietario_nombre,
        totalAmount: `€${precio_total}`,
        clientName: cliente.nombre,
        clientEmail: cliente.email,
        location: garaje.direccion || 'Dirección del garaje',
        checkInDate: fechaInicio.toLocaleDateString('es-ES'),
        checkInTime: fechaInicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        checkOutDate: fechaFin.toLocaleDateString('es-ES'),
        checkOutTime: fechaFin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        duration: `${duracionDias} día${duracionDias > 1 ? 's completos' : ' completo'}`,
      }));

      await resend.emails.send({
        from: 'QuickPark <onboarding@resend.dev>',
        to: ['quickparksc@gmail.com'],
        subject: '¡Nueva Reserva Recibida en QuickPark!',
        html: ownerEmailHtml,
      });

      console.log('Email de notificación enviado al propietario');
    } catch (emailError) {
      console.error('Error al enviar email al propietario:', emailError);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva.' });
  }
});

/**
 * Obtiene las reservas que el usuario autenticado ha hecho (Cliente).
 */
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const user_id = (req as any).user?.id;
    if (!user_id) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const query = `
      SELECT 
        r.id, 
        r.usuario_id, 
        r.garaje_id, 
        r.fecha_inicio, 
        r.fecha_fin, 
        r.estado, 
        r.precio_total, 
        r.created_at,
        
        g.id AS garaje_id_nested,
        g.direccion AS garaje_direccion, 
        g.descripcion AS garaje_descripcion, 
        g.precio AS garaje_precio, 
        CASE 
          WHEN g.imagen_garaje IS NOT NULL 
          THEN CONCAT('data:image/jpeg;base64,', ENCODE(g.imagen_garaje, 'base64')) 
          ELSE NULL 
        END AS garaje_imagen,
        
        u.id AS cliente_id, 
        u.nombre AS cliente_nombre, 
        u.email AS cliente_email
      FROM reserva r
      LEFT JOIN garaje g ON r.garaje_id = g.id
      LEFT JOIN usuario u ON r.usuario_id = u.id
      WHERE r.usuario_id = $1
      ORDER BY r.fecha_inicio DESC;
    `;
    
    const result = await pool.query(query, [user_id]);

    // Transformar los datos a la estructura esperada
    const reservations = result.rows.map(row => ({
      id: row.id,
      usuario_id: row.usuario_id,
      garaje_id: row.garaje_id,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      estado: row.estado,
      precio_total: row.precio_total !== null ? Number(row.precio_total) : 0,
      created_at: row.created_at,
      
      garaje: {
        id: row.garaje_id_nested,
        direccion: row.garaje_direccion,
        descripcion: row.garaje_descripcion,
        precio: row.garaje_precio,
        imagen_garaje: row.garaje_imagen
      },
      
      cliente: {
        id: row.cliente_id,
        nombre: row.cliente_nombre,
        email: row.cliente_email
      }
    }));

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas.' }); 
  }
});

/**
 * Obtiene las reservas hechas en los parkings del usuario autenticado (Propietario).
 */
router.get('/received', protect, async (req, res) => {
  try {
    const owner_id = (req as any).user?.id;

    const query = `
      SELECT 
        r.id,
        r.usuario_id,
        r.garaje_id,
        r.fecha_inicio,
        r.fecha_fin,
        r.estado,
        r.precio_total,
        r.created_at,
        
        g.direccion AS garaje_direccion,
        g.descripcion AS garaje_descripcion,
        g.precio AS garaje_precio,
        CASE 
          WHEN g.imagen_garaje IS NOT NULL 
          THEN CONCAT('data:image/jpeg;base64,', ENCODE(g.imagen_garaje, 'base64')) 
          ELSE NULL 
        END AS garaje_imagen,

        u.nombre AS cliente_nombre,
        u.email AS cliente_email

      FROM reserva r
      JOIN garaje g ON r.garaje_id = g.id
      JOIN usuario u ON r.usuario_id = u.id
      WHERE g.propietario_id = $1
      ORDER BY r.fecha_inicio DESC;
    `;

    const result = await pool.query(query, [owner_id]);

    const reservations = result.rows.map(row => ({
      id: row.id,
      estado: row.estado,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      created_at: row.created_at,
      precio_total: Number(row.precio_total),

      garaje: {
        id: row.garaje_id,
        direccion: row.garaje_direccion,
        descripcion: row.garaje_descripcion,
        precio: row.garaje_precio,
        imagen_garaje: row.garaje_imagen
      },

      cliente: {
        nombre: row.cliente_nombre,
        email: row.cliente_email
      }
    }));

    res.status(200).json(reservations);
  } catch (error) {
    console.error('Error al obtener reservas recibidas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas recibidas.' });
  }
});


/**
 * Cancela una reserva existente y reembolsa el 50% del pago
 */
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información de la reserva antes de cancelarla
    const getReservaQuery = `
      SELECT id, usuario_id, garaje_id, fecha_inicio, fecha_fin, estado, precio_total, payment_intent_id
      FROM reserva
      WHERE id = $1 AND estado != 'completada' AND estado != 'cancelada';
    `;
    const reservaResult = await pool.query(getReservaQuery, [id]);

    if (!reservaResult.rows[0]) {
      return res.status(404).json({ error: 'Reserva no encontrada o no cancelable.' });
    }

    const reserva = reservaResult.rows[0];
    const paymentIntentId = reserva.payment_intent_id;
    const precioTotal = Number(reserva.precio_total);
    let refundAmount = 0;

    // Si existe un Payment Intent, reembolsar el 50%
    if (paymentIntentId) {
      try {
        const amountToRefund = Math.round(precioTotal * 0.5 * 100); // 50% en centavos
        
        console.log(`Reembolsando 50% por cancelación: €${amountToRefund/100} de €${precioTotal}`);
        
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: amountToRefund,
          reason: 'requested_by_customer',
        });

        refundAmount = amountToRefund / 100;
        console.log(`Reembolso exitoso. ID: ${refund.id}`);
      } catch (stripeError: any) {
        console.error('Error al procesar el reembolso:', stripeError);
        
        if (stripeError.code === 'charge_already_refunded') {
          console.log('El pago ya fue reembolsado previamente');
        } else {
          throw new Error(`Error en Stripe: ${stripeError.message}`);
        }
      }
    }

    // Actualizar el estado de la reserva a cancelada
    const updateQuery = `
      UPDATE reserva
      SET estado = 'cancelada'
      WHERE id = $1
      RETURNING id, usuario_id, garaje_id, fecha_inicio, fecha_fin, estado, precio_total;
    `;
    const result = await pool.query(updateQuery, [id]);

    // Actualizar estado del pago a reembolso_parcial
    await pool.query(
      `UPDATE pagos SET estado = 'reembolso_parcial' WHERE reserva_id = $1`,
      [id]
    );

    const reservation = {
      ...result.rows[0],
      precio_total: result.rows[0].precio_total !== null ? Number(result.rows[0].precio_total) : 0,
    };

    res.status(200).json({
      ...reservation,
      refundAmount,
      chargedAmount: precioTotal - refundAmount,
      message: paymentIntentId 
        ? `Reserva cancelada. Se han reembolsado €${refundAmount.toFixed(2)} (50%).` 
        : 'Reserva cancelada.',
    });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error al cancelar la reserva.' });
  }
});
