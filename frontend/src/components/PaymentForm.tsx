import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export default function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log('Stripe no está listo');
      return;
    }

    setLoading(true);
    onError('');

    try {
      console.log('Confirmando pago...');
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      console.log('Resultado del pago:', { error, paymentIntent });

      if (error) {
        console.error('Error en el pago:', error);
        onError(error.message || 'Error al procesar el pago');
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Pago exitoso:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else {
        console.log('Estado del pago:', paymentIntent?.status);
        onError('El pago no se completó correctamente');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error capturado:', err);
      onError(err.message || 'Error inesperado al procesar el pago');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Procesando...</span>
          </div>
        ) : (
          'Confirmar Pago y Reservar'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Pago seguro procesado por Stripe. Tus datos están protegidos.
      </p>
    </form>
  );
}
