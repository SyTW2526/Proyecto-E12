export interface Parking {
  id: number;
  propietario_id: number;
  direccion: string;
  descripcion?: string;
  imagen_garaje?: string;
  precio: string;
  fecha_creacion: string;
  disponible: boolean;
}