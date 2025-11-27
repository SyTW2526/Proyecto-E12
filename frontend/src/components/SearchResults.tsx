import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ReservationModal from './ReservationPopUP';

export interface Garage {
  id: number;
  direccion: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  propietario_id: number;
  latitud?: number;
  longitud?: number;
}

interface SearchResultsProps {
  garages: Garage[];
  loading: boolean;
  error: string | null;
  searched: boolean;
  user: any;
  searchData: {
    fecha_inicio: string;
    fecha_fin: string;
    tipo_vehiculo: 'moto' | 'coche' | 'furgoneta';
  };
}

export default function SearchResults({ garages, loading, error, searched, user, searchData }: SearchResultsProps) {
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.466316, -16.253688]); // Santa Cruz de Tenerife
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [garageToReserve, setGarageToReserve] = useState<Garage | null>(null);

  // Actualizar centro del mapa cuando se selecciona un garaje
  useEffect(() => {
    if (selectedGarage && selectedGarage.latitud && selectedGarage.longitud) {
      setMapCenter([selectedGarage.latitud, selectedGarage.longitud]);
    }
  }, [selectedGarage]);

  if (!searched) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-yellow-800 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (garages.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mapa con Leaflet */}
        <div className="bg-gray-100 rounded-lg overflow-hidden h-[600px]">
          <MapContainer
            center={mapCenter}
            zoom={selectedGarage && selectedGarage.latitud && selectedGarage.longitud ? 17 : 14}
            style={{ height: '100%', width: '100%' }}
            key={`${mapCenter[0]}-${mapCenter[1]}-${selectedGarage?.id || 'default'}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {garages.map((garage) => {
              if (!garage.latitud || !garage.longitud) return null;
              
              return (
                <Marker
                  key={garage.id}
                  position={[garage.latitud, garage.longitud]}
                  eventHandlers={{
                    click: () => setSelectedGarage(garage),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-sm mb-1">{garage.direccion}</h3>
                      <p className="text-xs text-gray-600 mb-2">{garage.descripcion}</p>
                      <p className="text-blue-600 font-bold">€{garage.precio}/hora</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Lista de resultados */}
        <div className="space-y-4 overflow-y-auto max-h-[600px] pr-5 pl-2">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {garages.length} parking{garages.length !== 1 ? 's' : ''} disponible{garages.length !== 1 ? 's' : ''}
          </h3>
          
          {garages.map((garage) => (
            <div
              key={garage.id}
              onClick={() => setSelectedGarage(garage)}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all cursor-pointer ${
                selectedGarage?.id === garage.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="flex">
                {/* Imagen */}
                <div className="w-32 h-32 shrink-0">
                  {garage.imagen ? (
                    <img
                      src={garage.imagen}
                      alt={garage.direccion}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información */}
                <div className="flex-1 p-4">
                  <h4 className="font-bold text-gray-900 mb-1">{garage.direccion}</h4>
                  {garage.descripcion && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{garage.descripcion}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-lg font-bold text-blue-600">
                      €{garage.precio}/hora
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          alert('Debes iniciar sesión para reservar un parking');
                          return;
                        }
                        setGarageToReserve(garage);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Modal */}
      {garageToReserve && (
        <ReservationModal
          garage={garageToReserve}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setGarageToReserve(null);
          }}
          user={user}
          initialStartDate={searchData.fecha_inicio}
          initialEndDate={searchData.fecha_fin}
          initialVehicleType={searchData.tipo_vehiculo}
        />
      )}
    </div>
  );
}
