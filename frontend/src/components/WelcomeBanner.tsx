import username from '../assets/username.png';

interface WelcomeBannerProps {
  user?: any;
}

export default function WelcomeBanner({ user }: WelcomeBannerProps) {
  return (
    <div className="bg-linear-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                <img
                    alt="User"
                    src={user.imagen || username}
                    className="h-10 w-10 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10 object-cover"
                  />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Bienvenido, {user.nombre}
                </h2>
                <p className="text-sm text-gray-600">
                  Sesión iniciada correctamente
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                ¡Inicia sesión para comenzar!
              </h2>
              <p className="text-sm text-gray-600">
                Accede a todas las funcionalidades de QuickPark
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/login"
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Iniciar sesión
              </a>
              <a
                href="/register"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Registrar
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
