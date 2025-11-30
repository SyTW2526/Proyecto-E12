import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Reemplaza con tu clave pública de Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentCheckoutProps {
  garage: {
    id: number;
    direccion: string;
    precio: number;
    descripcion?: string;
  };
  fechaInicio: string;
  fechaFin: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Componente interno del formulario de pago
function CheckoutForm({ 
  totalAmount, 
  garage, 
  fechaInicio, 
  fechaFin, 
  onSuccess, 
  onCancel 
}: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!stripe || !elements) {
      setError("Stripe todavía no está listo");
      return;
    }
  
    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      setError("El formulario de pago no está cargado aún.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });
  
      if (submitError) {
        setError(submitError.message || "Error al procesar el pago");
        return;
      }
  
      await axios.post(
        "http://localhost:3000/api/reservas",
        {
          garaje_id: garage.id,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          precio_total: totalAmount,
        },
        { withCredentials: true }
      );
  
      onSuccess?.();
    } catch (err: any) {
      console.error("Error en el pago:", err);
      setError(err.response?.data?.error || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Procesando...' : `Pagar €${totalAmount.toFixed(2)}`}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none transition-all"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// Componente principal
export default function PaymentCheckout({ 
  garage, 
  fechaInicio, 
  fechaFin, 
  onSuccess, 
  onCancel 
}: PaymentCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Calcular el monto total
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);
        const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
        const precioNumerico = typeof garage.precio === 'string' ? parseFloat(garage.precio) : garage.precio;
        const amount = hours * precioNumerico;
        setTotalAmount(amount);

        // Crear Payment Intent
        const response = await axios.post(
          'http://localhost:3000/api/payment/create-payment-intent',
          {
            amount,
            garageId: garage.id,
            fechaInicio,
            fechaFin,
          },
          { withCredentials: true }
        );

        setClientSecret(response.data.clientSecret);
      } catch (err: any) {
        console.error('Error al inicializar el pago:', err);
        setError(err.response?.data?.error || 'Error al inicializar el pago');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [garage, fechaInicio, fechaFin]);

  const calculateDuration = () => {
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const diffMs = end.getTime() - start.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    const parts = [];
    if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    
    return parts.join(' y ') || 'Menos de una hora';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 font-medium mb-4">{error || 'Error al cargar el pago'}</p>
          <button
            onClick={onCancel}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirmar reserva y pago</h2>

      {/* Resumen de la reserva */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Detalles de la reserva</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Parking:</span>
            <span className="font-medium text-gray-900">{garage.direccion}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Entrada:</span>
            <span className="font-medium text-gray-900">
              {new Date(fechaInicio).toLocaleString('es-ES')}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Salida:</span>
            <span className="font-medium text-gray-900">
              {new Date(fechaFin).toLocaleString('es-ES')}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Duración:</span>
            <span className="font-medium text-gray-900">{calculateDuration()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Precio por hora:</span>
            <span className="font-medium text-gray-900">
              €{typeof garage.precio === 'string' ? parseFloat(garage.precio).toFixed(2) : garage.precio.toFixed(2)}
            </span>
          </div>
          
          <div className="border-t border-gray-300 pt-3 mt-3">
            <div className="flex justify-between text-lg">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-blue-600">€{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de pago */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">Método de pago</h3>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            totalAmount={totalAmount}
            garage={garage}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </div>

      {/* Nota de seguridad */}
      <div className="flex items-start gap-2 text-sm text-gray-500 mt-4">
        <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p>Pago seguro procesado por Stripe. Tus datos están protegidos.</p>
      </div>
    </div>
  );
}