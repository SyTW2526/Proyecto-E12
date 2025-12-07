import cron from 'node-cron';
import Stripe from 'stripe';
import pool from '../db/pool.js';

// Crear objeto stripe para usar la api
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover',
});

/**
 * Procesa los pagos pendientes de transferir para reservas finalizadas
 */
export async function processCompletedReservations() {
  console.log('[CRON] Iniciando proceso de pagos pendientes...');
  
  try {
    // Buscar reservas finalizadas con pagos pendientes de transferir
    const query = `
      SELECT 
        r.id as reserva_id,
        r.estado as reserva_estado,
        r.fecha_fin,
        p.id as pago_id,
        p.monto_propietario,
        p.stripe_account_id,
        p.estado as pago_estado
      FROM reserva r
      JOIN pagos p ON r.id = p.reserva_id
      WHERE r.fecha_fin < NOW()
        AND r.estado = 'activa'
        AND p.estado = 'pendiente_transferir';
    `;
    
    const result = await pool.query(query);
    const reservasPendientes = result.rows;

    if (reservasPendientes.length === 0) {
      console.log('[CRON] No hay pagos pendientes de procesar.');
      return;
    }

    console.log(`[CRON] Encontradas ${reservasPendientes.length} reservas para procesar.`);

    let procesados = 0;
    let errores = 0;

    for (const reserva of reservasPendientes) {
      try {
        const montoPropietario = Number(reserva.monto_propietario);
        
        // Actualizar estado de la reserva a completada
        await pool.query(
          `UPDATE reserva SET estado = 'completada' WHERE id = $1`,
          [reserva.reserva_id]
        );

        // Si el propietario tiene cuenta Stripe conectada, transferir
        if (reserva.stripe_account_id) {
          const transfer = await stripe.transfers.create({
            amount: Math.round(montoPropietario * 100), // Convertir a centavos
            currency: 'eur',
            destination: reserva.stripe_account_id,
            description: `Pago automático por reserva #${reserva.reserva_id}`,
          });

          // Actualizar estado del pago
          await pool.query(
            `UPDATE pagos 
             SET estado = 'transferido', 
                 stripe_transfer_id = $1 
             WHERE id = $2`,
            [transfer.id, reserva.pago_id]
          );

          console.log(`[CRON] Reserva #${reserva.reserva_id}: Transferidos €${montoPropietario.toFixed(2)} (Transfer: ${transfer.id})`);
          procesados++;
        } else {
          // Propietario sin cuenta Stripe - mantener pendiente pero marcar reserva como completada
          console.log(`[CRON] Reserva #${reserva.reserva_id}: Propietario sin cuenta Stripe. Pago queda pendiente.`);
          procesados++;
        }
      } catch (error: any) {
        console.error(`[CRON] Error procesando reserva #${reserva.reserva_id}:`, error.message);
        errores++;
      }
    }

    console.log(`[CRON] Proceso completado: ${procesados} exitosos, ${errores} errores.`);
  } catch (error) {
    console.error('[CRON] Error en proceso de pagos:', error);
  }
}

/**
 * Inicializa el cron job para ejecutar diariamente a las 3 AM
 */
export function startPaymentCronJob() {
  // Ejecutar todos los días a las 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('\n[CRON] Ejecutando tarea programada de pagos (3:00 AM)...');
    await processCompletedReservations();
  });

  console.log('[CRON] Cron job de pagos iniciado: Se ejecutará diariamente a las 3:00 AM');
  
  // Opcional: Ejecutar también al iniciar el servidor (solo para testing)
  if (process.env.NODE_ENV === 'development') {
    console.log('[CRON] Ejecutando proceso de pagos al iniciar (5 segundos)...');
    setTimeout(() => {
      processCompletedReservations();
    }, 5000);
  }
}
