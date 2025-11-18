import { useState, useEffect } from 'react';
import axios from 'axios';

interface ManageParkingProps {
  user: any;
}

interface Parking {
  id: number;
  direccion: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  disponible: boolean;
  fecha_creacion: string;
}

export default function ManageParking({ user }: ManageParkingProps) {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Estados para edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    direccion: '',
    descripcion: '',
    precio: '',
    disponible: true,
  });
  const [imagenGaraje, setImagenGaraje] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    fetchParkings();
  }, [user.id]);

  const fetchParkings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/garages?propietario_id=${user.id}`,
        { withCredentials: true }
      );
      setParkings(response.data);
      setError('');
    } catch (error: any) {
      console.error('Error al obtener parkings:', error);
      if (error.response?.status === 404) {
        setParkings([]);
        setError('');
      } else {
        setError('Error al cargar los parkings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este parking?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3000/api/garages/${id}`,
        { withCredentials: true }
      );
      setParkings(parkings.filter(p => p.id !== id));
      alert('Parking eliminado exitosamente');
    } catch (error: any) {
      console.error('Error al eliminar parking:', error);
      alert('Error al eliminar el parking');
    }
  };

  const startEdit = (parking: Parking) => {
    setEditingId(parking.id);
    setEditFormData({
      direccion: parking.direccion,
      descripcion: parking.descripcion || '',
      precio: parking.precio.toString(),
      disponible: parking.disponible,
    });
    setPreviewUrl(parking.imagen || '');
    setUpdateError('');
    setUpdateSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({ direccion: '', descripcion: '', precio: '', disponible: true });
    setImagenGaraje(null);
    setPreviewUrl('');
    setUpdateError('');
    setUpdateSuccess('');
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData(prev => ({
      ...prev,
      disponible: e.target.checked
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagenGaraje(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (id: number) => {
    setUpdateLoading(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const data = new FormData();
      data.append('direccion', editFormData.direccion);
      if (editFormData.descripcion) {
        data.append('descripcion', editFormData.descripcion);
      }
      data.append('precio', editFormData.precio);
      data.append('disponible', String(editFormData.disponible));

      if (imagenGaraje) {
        data.append('imagen_garaje', imagenGaraje);
      }

      const response = await axios.patch(
        `http://localhost:3000/api/garages/${id}`,
        data,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Actualizar la lista
      setParkings(parkings.map(p => p.id === id ? response.data : p));
      setUpdateSuccess('¡Parking actualizado exitosamente!');

      setTimeout(() => {
        cancelEdit();
        fetchParkings();
      }, 1500);

    } catch (error: any) {
      console.error('Error al actualizar parking:', error);
      setUpdateError(
        error.response?.data?.error ||
        'Error al actualizar el parking. Por favor, intenta de nuevo.'
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestionar Parkings</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Cargando parkings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestionar Parkings</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestionar Parkings</h1>

      {parkings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No tienes parkings registrados</p>
          <p className="text-sm text-gray-500">Ve a "Registrar Parking" para agregar uno nuevo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {parkings.map((parking) => (
            <div key={parking.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header del parking */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === parking.id ? null : parking.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{parking.direccion}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">
                        Precio: <span className="font-semibold text-blue-600">{parking.precio}€/hora</span>
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full ${parking.disponible
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {parking.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${expandedId === parking.id ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Contenido expandible */}
              {expandedId === parking.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {editingId === parking.id ? (
                    /* Modo edición */
                    <div>
                      {updateError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-sm">{updateError}</p>
                        </div>
                      )}

                      {updateSuccess && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-sm">{updateSuccess}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Dirección */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Dirección <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="direccion"
                            required
                            value={editFormData.direccion}
                            onChange={handleEditInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Descripción */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Descripción
                          </label>
                          <textarea
                            name="descripcion"
                            rows={3}
                            value={editFormData.descripcion}
                            onChange={handleEditInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </div>

                        {/* Precio */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Precio (€/hora) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="precio"
                            required
                            min="0"
                            step="0.01"
                            value={editFormData.precio}
                            onChange={handleEditInputChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Disponible */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`disponible-${parking.id}`}
                            checked={editFormData.disponible}
                            onChange={handleEditCheckboxChange}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`disponible-${parking.id}`} className="ml-3 text-sm font-medium text-gray-900">
                            Marcar como disponible
                          </label>
                        </div>

                        {/* Imagen */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Cambiar imagen
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {previewUrl && (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="mt-4 w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
                            />
                          )}
                        </div>

                        {/* Botones de edición */}
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => handleUpdate(parking.id)}
                            disabled={updateLoading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {updateLoading ? 'Guardando...' : 'Guardar cambios'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={updateLoading}
                            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Modo visualización */
                    <div>
                      {parking.imagen && (
                        <img
                          src={parking.imagen}
                          alt={parking.direccion}
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                      )}

                      {parking.descripcion && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Descripción:</h4>
                          <p className="text-gray-600">{parking.descripcion}</p>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mb-4">
                        Registrado el {new Date(parking.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(parking)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                        >
                          Modificar
                        </button>
                        <button
                          onClick={() => handleDelete(parking.id)}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
