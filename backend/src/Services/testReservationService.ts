import { ReservationService } from './reservationService';

async function test() {
  try {
    const all = await ReservationService.getAll();
    console.log('Reservas actuales:', all);

    const newRes = await ReservationService.create({
      usuario_id: 1,
      garaje_id: 7,
      fecha_inicio: '2025-11-10T09:00:00Z',
      fecha_fin: '2025-11-10T12:00:00Z',
      estado: 'pendiente',
    });
    console.log('Nueva reserva creada:', newRes);
  } catch (err: any) {
    console.error('Error:', err.code || err.message);
  }
}

test();