import axios from 'axios';

/**
 * Obtiene latitud y longitud de una dirección usando Nominatim API
 */
export async function getCoordinatesFromAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'QuickPark/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener coordenadas:', error);
    return null;
  }
}