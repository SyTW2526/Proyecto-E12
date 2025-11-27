import { useState } from 'react';
import axios from 'axios';
import SearchResults from './SearchResults';

interface SearchFormProps {
  onSearch?: (data: SearchData) => void;
  user?: any;
}

export interface SearchData {
  fecha_inicio: string;
  fecha_fin: string;
  tipo_vehiculo: 'moto' | 'coche' | 'furgoneta';
}

interface Garage {
  id: number;
  direccion: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  propietario_id: number;
}

export default function SearchForm({ onSearch, user }: SearchFormProps) {
  const [formData, setFormData] = useState<SearchData>({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_vehiculo: 'coche',
  });
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que fecha_fin sea posterior a fecha_inicio
    if (new Date(formData.fecha_fin) <= new Date(formData.fecha_inicio)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await axios.get('http://localhost:3000/api/garages/available', {
        params: {
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
        },
        withCredentials: true,
      });

      setGarages(response.data);

      if (onSearch) {
        onSearch(formData);
      }
    } catch (err: any) {
      console.error('Error al buscar garajes:', err);
      if (err.response?.status === 404) {
        setGarages([]);
        setError('No se encontraron garajes disponibles para las fechas seleccionadas');
      } else {
        setError('Error al buscar garajes. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha y hora mínimas (ahora)
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Encuentra tu parking ideal
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de vehículo - Botones grandes */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Selecciona tu tipo de vehículo
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipo_vehiculo: 'moto' }))}
              className={`p-6 border-2 rounded-xl transition-all ${
                formData.tipo_vehiculo === 'moto'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-5xl mb-3">🏍️</div>
              <div className="text-lg font-bold text-gray-900">Moto</div>
              <div className="text-sm text-gray-500 mt-1">Espacios compactos</div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipo_vehiculo: 'coche' }))}
              className={`p-6 border-2 rounded-xl transition-all ${
                formData.tipo_vehiculo === 'coche'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-5xl mb-3">🚗</div>
              <div className="text-lg font-bold text-gray-900">Coche</div>
              <div className="text-sm text-gray-500 mt-1">Espacios estándar</div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, tipo_vehiculo: 'furgoneta' }))}
              className={`p-6 border-2 rounded-xl transition-all ${
                formData.tipo_vehiculo === 'furgoneta'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-5xl mb-3">🚐</div>
              <div className="text-lg font-bold text-gray-900">Furgoneta</div>
              <div className="text-sm text-gray-500 mt-1">Espacios amplios</div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha y hora de inicio */}
          <div>
            <label htmlFor="fecha_inicio" className="block text-sm font-semibold text-gray-900 mb-2">
              Fecha y hora de entrada
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="fecha_inicio"
                name="fecha_inicio"
                required
                min={minDateTime}
                value={formData.fecha_inicio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fecha y hora de fin */}
          <div>
            <label htmlFor="fecha_fin" className="block text-sm font-semibold text-gray-900 mb-2">
              Fecha y hora de salida
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="fecha_fin"
                name="fecha_fin"
                required
                min={formData.fecha_inicio || minDateTime}
                value={formData.fecha_fin}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {formData.fecha_inicio && formData.fecha_fin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Duración aproximada: {calculateDuration(formData.fecha_inicio, formData.fecha_fin)}
              </span>
            </div>
          </div>
        )}

        {/* Botón de búsqueda */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {loading ? 'Buscando...' : 'Buscar parkings disponibles'}
          </span>
        </button>
      </form>
    </div>

    {/* Resultados de búsqueda */}
    <SearchResults
      garages={garages}
      loading={loading}
      error={error}
      searched={searched}
      user={user}
      searchData={formData}
    />
  </div>
  );
}

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  const parts = [];
  if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
  
  return parts.join(', ') || 'Menos de un minuto';
}
