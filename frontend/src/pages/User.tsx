import { useState } from 'react';
import Sidebar from "../components/Sidebar"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserView from '../components/UserView';
import RegisterParking from '../components/RegisterParking';
import ManageParking from '../components/ManageParking';
import ReservationParking from '../components/ReservationParking.tsx';

interface NavbarProps {
  user?: any;
  setUser?: (user: any) => void;
}

export default function User({ user, setUser }: NavbarProps) {
  const [selectedOption, setSelectedOption] = useState('perfil');
  const navigate = useNavigate()

  // Si no hay usuario autenticado, mostrar mensaje
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Se debe iniciar sesión
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Por favor, inicia sesión para acceder a esta página
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout')
      if (setUser) setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const renderContent = () => {
    switch (selectedOption) {
      case 'perfil':
        return (
          <UserView user={user} handleLogout={handleLogout} setUser={setUser!} />
        );
      case 'registrar':
        return <RegisterParking user={user} />;
      case 'gestionar':
        return <ManageParking user={user} />;
      case 'reservas':
        return <ReservationParking user={user} />;
      case 'cerrar':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Cerrar Sesión</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">¿Estás seguro que deseas cerrar sesión?</p>
              <button 
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" 
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">Selecciona una opción</h1>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar selectedOption={selectedOption} onSelectOption={setSelectedOption} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}