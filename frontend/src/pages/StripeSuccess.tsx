import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StripeSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Verificar si venimos de crear un parking
    const parkingCreated = sessionStorage.getItem('parkingCreated');
    if (parkingCreated) {
      sessionStorage.removeItem('parkingCreated');
    }

    // Redirigir después de 5 segundos
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/user');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Icono de éxito */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Cuenta Verificada!
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 mb-6">
          Tu cuenta de Stripe ha sido configurada correctamente. Ahora puedes recibir pagos por tus parkings.
        </p>

        {/* Info adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>¿Qué sigue?</strong>
            <br />
            Podrás gestionar tus parkings y ver las reservas desde tu panel de usuario.
          </p>
        </div>

        {/* Contador y botones */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Serás redirigido automáticamente en {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
          
          <button
            onClick={() => navigate('/user')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ir a Mi Panel
          </button>
        </div>
      </div>
    </div>
  );
}
