import username from '../assets/username.png';

interface ProfileProps {
  user?: any;
}

export default function UserView({ user }: ProfileProps ) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Perfil</h1>
      <div className="bg-white rounded-lg shadow p-6">

        {/* Aquí va el contenido del perfil */}
        <div>
          <div className='flex justify-center p-3'>
            {/* Imagen de perfil */}
            <img
              alt="User"
              src={user.imagen || username}
              className="h-50 w-50 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10 mb-4"
            />
          </div>
          <div className='flex justify-center p-3'>
            {/* Texto */}
            <p className='font-semibold text-black text-2xl'>Bienvenido, {user.nombre}</p>
          </div>
        </div>
        <div>
          {/* Aquí va el bloque de información */}
          <div className='border-gray-300 border-2 p-4 rounded-2xl'>
            <div className='flex gap-4'>
              <button className='flex items-center justify-center gap-4 bg-black p-3 rounded-2xl w-full hover:bg-gray-600'>
                <p className='text-white font-semibold text-xl p-2'>Configuración</p>
              </button>

              <button className='flex items-center justify-center gap-4 bg-black p-3 rounded-2xl w-full hover:bg-gray-600'>
                <p className='text-white font-semibold text-xl p-2'>Cerrar sesión</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
