import { useState } from 'react';
import axios from 'axios';

interface RegisterParkingProps {
  user: any;
}

export default function RegisterParking({ user }: RegisterParkingProps) {
  const [formData, setFormData] = useState({
    direccion: '',
    descripcion: '',
    precio: '',
  });
  const [imagenGaraje, setImagenGaraje] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenGaraje(file);
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('propietario_id', user.id);
      data.append('direccion', formData.direccion);
      if (formData.descripcion) {
        data.append('descripcion', formData.descripcion);
      }
      data.append('precio', formData.precio);
      
      if (imagenGaraje) {
        data.append('imagen_garaje', imagenGaraje);
      }

      const response = await axios.post(
        'http://localhost:3000/api/garages',
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Parking registrado:', response.data);
      
      // Resetear el formulario
      setFormData({
        direccion: '',
        descripcion: '',
        precio: '',
      });
      setImagenGaraje(null);
      setPreviewUrl('');
      setSuccess('¡Parking registrado exitosamente!');
      
    } catch (error: any) {
      console.error('Error al registrar parking:', error);
      setError(
        error.response?.data?.error || 
        'Error al registrar el parking. Por favor, intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Registrar Parking</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dirección */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-semibold text-gray-900 mb-2">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              required
              value={formData.direccion}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Ej: Calle Principal 123, Santa Cruz"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-900 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Describe las características del parking (espacio, seguridad, acceso, etc.)"
            />
          </div>

          {/* Precio */}
          <div>
            <label htmlFor="precio" className="block text-sm font-semibold text-gray-900 mb-2">
              Precio (€/hora) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="precio"
              name="precio"
              required
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Ej: 2.50"
            />
          </div>

          {/* Imagen del garaje */}
          <div>
            <label htmlFor="imagen_garaje" className="block text-sm font-semibold text-gray-900 mb-2">
              Imagen del garaje
            </label>
            <input
              type="file"
              id="imagen_garaje"
              name="imagen_garaje"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Registrando...' : 'Registrar Parking'}
            </button>
            
            <button
              type="reset"
              onClick={() => {
                setFormData({
                  direccion: '',
                  descripcion: '',
                  precio: '',
                });
                setImagenGaraje(null);
                setPreviewUrl('');
                setError('');
                setSuccess('');
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
