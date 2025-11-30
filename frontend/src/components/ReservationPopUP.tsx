import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import axios from 'axios';

// Cargar Stripe con tu clave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Garage {
  id: number;
  direccion: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  propietario_id: number;
}

interface ReservationPopUpProps {
  garage: Garage;
  isOpen: boolean;
  onClose: () => void;
  user: any;
  initialStartDate?: string;
  initialEndDate?: string;
  initialVehicleType?: 'moto' | 'coche' | 'furgoneta';
}

export default function ReservationPopUp({ garage, isOpen, onClose, user, initialStartDate = '', initialEndDate = '', initialVehicleType = 'coche' }: ReservationPopUpProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [vehicleType, setVehicleType] = useState<'moto' | 'coche' | 'furgoneta'>(initialVehicleType);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState(false);
  const [reservationDetails, setReservationDetails] = useState<{
    hours: number;
    totalPrice: number;
    applicationFee: number;
  } | null>(null);

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  const getTotalPrice = () => {
    const hours = calculateDuration();
    return hours > 0 ? garage.precio * hours : 0;
  };

  const handleContinueToPayment = async () => {
    if (!user) {
      setError('Debes iniciar sesión para realizar una reserva');
      return;
    }

    if (!startDate || !endDate) {
      setError('Por favor selecciona las fechas de inicio y fin');
      return;
    }

    const hours = calculateDuration();
    if (hours <= 0) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/api/stripe/create-payment-intent', {
        garageId: garage.id,
        startDate,
        endDate,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setClientSecret(response.data.clientSecret);
      setReservationDetails({
        hours: response.data.hours,
        totalPrice: response.data.totalPrice,
        applicationFee: response.data.applicationFee,
      });
      setPaymentStep(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear el pago');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    console.log('Creando reserva con payment intent:', paymentIntentId);
    try {
      await axios.post(
        'http://localhost:3000/api/reservas',
        {
          usuario_id: user.id,
          garaje_id: garage.id,
          fecha_inicio: startDate,
          fecha_fin: endDate,
          tipo_vehiculo: vehicleType,
          precio_total: reservationDetails?.totalPrice,
          payment_intent_id: paymentIntentId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      console.log('Reserva creada exitosamente');
      alert('¡Reserva confirmada exitosamente!');
      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error('Error al crear reserva:', err);
      setError(err.response?.data?.error || 'Error al confirmar la reserva');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl" style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {paymentStep ? 'Completar Pago' : 'Confirmar Reserva'}
              </h2>
              <p className="text-blue-100">{garage.direccion}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!paymentStep ? (
            <>
              {/* Garage Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-4">
                  {garage.imagen && (
                    <img
                      src={garage.imagen}
                      alt={garage.direccion}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{garage.direccion}</h3>
                    <p className="text-gray-600 text-sm mb-2">{garage.descripcion}</p>
                    <p className="text-blue-600 font-bold">€{garage.precio}/hora</p>
                  </div>
                </div>
              </div>

              {/* Reservation Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Vehículo
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="moto">Moto</option>
                    <option value="coche">Coche</option>
                    <option value="furgoneta">Furgoneta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Price Summary */}
              {startDate && endDate && calculateDuration() > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Duración:</span>
                    <span className="font-medium">{calculateDuration()} hora(s)</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Precio por hora:</span>
                    <span className="font-medium">€{garage.precio}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-xl text-blue-600">€{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleContinueToPayment}
                disabled={loading || !startDate || !endDate}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Continuar al Pago'}
              </button>
            </>
          ) : (
            <>
              {/* Payment Step */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-3">Resumen de la Reserva</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span>{reservationDetails?.hours} hora(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de vehículo:</span>
                    <span className="capitalize">{vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inicio:</span>
                    <span>{new Date(startDate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fin:</span>
                    <span>{new Date(endDate).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                    <span>Total a pagar:</span>
                    <span className="text-blue-600">€{reservationDetails?.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {clientSecret && (
                <>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={(error: string) => setError(error)}
                    />
                  </Elements>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
