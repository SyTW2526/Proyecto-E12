export interface Reservation {
  id: number;
  usuario_id: number;
  garaje_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_vehiculo?: string;
  precio_total: number;
  payment_intent_id?: string;
  estado: 'pendiente' | 'activa' | 'completada' | 'cancelada';
  created_at?: string;
}