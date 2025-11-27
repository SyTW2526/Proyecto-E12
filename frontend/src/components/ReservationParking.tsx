// ReservationParking.tsx (CORREGIDO)
import { useState, useEffect } from 'react';
import axios from 'axios';

interface ReservationParkingProps {
  user: any;
}

export interface Reservation {
  id: number;
  garaje_id: number;
  cliente_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  precio_total?: number;
  estado: string;
  created_at: string;
  garaje?: {
    id: number;
    direccion: string;
    descripcion: string;
    precio: number;
    imagen_garaje?: string;
  };
  cliente?: {
    id: number;
    nombre: string;
    email: string;
  };
}


export default function ReservationParking({ user }: ReservationParkingProps) {
  const [activeTab, setActiveTab] = useState<'mis-reservas' | 'reservas-recibidas'>('mis-reservas');
  const [misReservas, setMisReservas] = useState<Reservation[]>([]);
  const [reservasRecibidas, setReservasRecibidas] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [activeTab]);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'mis-reservas') {
        // Obtener reservas que hice -> RUTA CORREGIDA
        const response = await axios.get(
          'http://localhost:3000/api/reservas/my-bookings', // ⬅️ CAMBIADO
          { withCredentials: true }
        );
        setMisReservas(response.data);
      } else {
        // Obtener reservas que me hicieron en mis parkings -> RUTA CORREGIDA
        const response = await axios.get(
          'http://localhost:3000/api/reservas/received', // ⬅️ CAMBIADO
          { withCredentials: true }
        );
        setReservasRecibidas(response.data);
      }
    } catch (err: any) {
      console.error('Error al cargar reservas:', err);
      setError(err.response?.data?.error || 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/reservas/${id}/cancel`, // ⬅️ CAMBIADO
        {},
        { withCredentials: true }
      );
      
      alert('Reserva cancelada exitosamente');
      fetchReservations();
    } catch (err: any) {
      console.error('Error al cancelar reserva:', err);
      alert(err.response?.data?.error || 'Error al cancelar la reserva');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges: { [key: string]: { bg: string; text: string; label: string } } = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      confirmada: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
      completada: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completada' },
      cancelada: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
    };

    const badge = badges[estado] || badges.pendiente;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const renderMisReservas = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
        </div>
      );
    }

    if (misReservas.length === 0) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 font-medium">No tienes reservas activas</p>
          <p className="text-gray-500 text-sm mt-2">Busca un parking y haz tu primera reserva</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {misReservas.map((reserva) => (
          <div key={reserva.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row">
              {/* Imagen */}
              <div className="w-full md:w-48 h-48 md:h-auto">
                {reserva.garaje?.imagen_garaje ? (
                  <img
                    src={reserva.garaje.imagen_garaje}
                    alt={reserva.garaje.direccion}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {reserva.garaje?.direccion || 'Parking'}
                    </h3>
                    {reserva.garaje?.descripcion && (
                      <p className="text-sm text-gray-600">{reserva.garaje.descripcion}</p>
                    )}
                  </div>
                  {getEstadoBadge(reserva.estado)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Entrada</p>
                    <p className="font-medium text-gray-900">{formatDate(reserva.fecha_inicio)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salida</p>
                    <p className="font-medium text-gray-900">{formatDate(reserva.fecha_fin)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Total pagado</p>
                    <p className="text-2xl font-bold text-blue-600">€{(reserva.precio_total || 0).toFixed(2)}</p>
                  </div>

                  {reserva.estado !== 'cancelada' && reserva.estado !== 'completada' && (
                    <button
                      onClick={() => cancelReservation(reserva.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Cancelar reserva
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReservasRecibidas = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
        </div>
      );
    }

    if (reservasRecibidas.length === 0) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-600 font-medium">No tienes reservas recibidas</p>
          <p className="text-gray-500 text-sm mt-2">Registra un parking para empezar a recibir reservas</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reservasRecibidas.map((reserva) => (
          <div key={reserva.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {reserva.garaje?.direccion || 'Parking'}
                </h3>
                <p className="text-sm text-gray-600">
                  Cliente: <span className="font-medium">{reserva.cliente?.nombre}</span>
                </p>
                <p className="text-sm text-gray-500">{reserva.cliente?.email}</p>
              </div>
              {getEstadoBadge(reserva.estado)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Entrada</p>
                <p className="font-medium text-gray-900">{formatDate(reserva.fecha_inicio)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salida</p>
                <p className="font-medium text-gray-900">{formatDate(reserva.fecha_fin)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingreso</p>
                <p className="text-xl font-bold text-green-600">€{(reserva.precio_total ?? 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Reserva realizada el {new Date(reserva.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Reservas</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('mis-reservas')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'mis-reservas'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Mis Reservas
            </div>
          </button>

          <button
            onClick={() => setActiveTab('reservas-recibidas')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'reservas-recibidas'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reservas Recibidas
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'mis-reservas' ? renderMisReservas() : renderReservasRecibidas()}
        </div>
      </div>
    </div>
  );
}