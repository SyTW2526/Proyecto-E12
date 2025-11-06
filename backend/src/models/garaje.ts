export interface Garaje {
  id: number;
  propietario_id: number;
  direccion: string;
  descripcion: string;
  precio: number;
  fecha_creacion: Date;
  disponible: boolean
}