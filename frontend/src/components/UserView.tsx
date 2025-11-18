import username from '../assets/username.png';
import { useState } from 'react';
import axios from 'axios';


interface ProfileProps {
  user?: any;
  handleLogout: () => void;
  setUser: (user: any) => void;
}

export default function UserView({ user, handleLogout, setUser }: ProfileProps ) {

  const [formData, setFormData] = useState({
    nombre: user.nombre || '',
    email: user.email || '',
  });
  const [imagenPerfil, setImagenPerfil] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.imagen || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenPerfil(file);
      
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
      data.append('nombre', formData.nombre);
      data.append('email', formData.email);
      
      if (imagenPerfil) {
        data.append('imagen', imagenPerfil);
      }

      const response = await axios.put(
        'http://localhost:3000/api/auth/updateUser',
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUser(response.data.user);
      setSuccess('¡Perfil actualizado exitosamente!');
      setImagenPerfil(null);
      
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      setError(
        error.response?.data?.error || 
        'Error al actualizar el perfil. Por favor, intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
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

        <form onSubmit={handleSubmit}>
          {/* Imagen de perfil */}
          <div className='flex flex-col items-center p-3'>
            <img
              alt="User"
              src={previewUrl || username}
              className="h-40 w-40 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10 mb-4 object-cover"
            />
            <div className="w-full max-w-md">
              <label htmlFor="imagen_perfil" className="block text-sm font-semibold text-gray-900 mb-2 text-center">
                Cambiar imagen de perfil
              </label>
              <input
                type="file"
                id="imagen_perfil"
                name="imagen_perfil"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-blue-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {/* Formulario de datos */}
          <div className='border-gray-300 border-2 p-6 rounded-2xl mt-6 space-y-4'>
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
                placeholder="Tu nombre"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {/* Botones */}
            <div className='flex gap-4 pt-4'>
              <button 
                type="submit"
                disabled={loading}
                className='flex items-center justify-center gap-4 bg-blue-500 p-3 rounded-2xl w-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              >
                <p className='text-white font-semibold text-xl p-2'>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </p>
              </button>

              <button 
                type="button"
                onClick={handleLogout}
                className='flex items-center justify-center gap-4 bg-black p-3 rounded-2xl w-full hover:bg-gray-600'
              >
                <p className='text-white font-semibold text-xl p-2'>Cerrar sesión</p>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
