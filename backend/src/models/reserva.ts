export interface Reserva {
  id: number;
  usuario_id: number;
  garaje_id: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  fecha_creacion: Date;
  estado: 'pendiente' | 'activa' | 'completada' | 'cancelada';
}