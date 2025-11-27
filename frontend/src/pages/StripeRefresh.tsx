import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StripeRefresh() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const retryOnboarding = async () => {
      try {
        // Obtener información del usuario
        const userResponse = await axios.get('http://localhost:3000/api/auth/me', {
          withCredentials: true,
        });

        const stripeAccountId = userResponse.data.stripe_account_id;

        if (!stripeAccountId) {
          setError('No se encontró cuenta de Stripe asociada.');
          setLoading(false);
          return;
        }

        // Generar nuevo link de onboarding
        const onboardingResponse = await axios.post(
          'http://localhost:3000/api/stripe/onboard-link',
          { accountId: stripeAccountId },
          { withCredentials: true }
        );

        if (onboardingResponse.data.url) {
          // Redirigir al nuevo link
          window.location.href = onboardingResponse.data.url;
        } else {
          setError('No se pudo generar el link de verificación.');
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error al reintentar onboarding:', err);
        setError(err.response?.data?.error || 'Error al conectar con el servidor.');
        setLoading(false);
      }
    };

    retryOnboarding();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {loading ? (
          <>
            {/* Spinner */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Reiniciando verificación...
            </h2>

            {/* Descripción */}
            <p className="text-gray-600">
              Por favor espera mientras preparamos el proceso de verificación de tu cuenta.
            </p>
          </>
        ) : error ? (
          <>
            {/* Icono de error */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>

            {/* Mensaje de error */}
            <p className="text-red-600 mb-6">{error}</p>

            {/* Botones */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Intentar de nuevo
              </button>
              
              <button
                onClick={() => navigate('/user')}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Volver a Mi Panel
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
