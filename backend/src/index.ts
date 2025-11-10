import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import garageRoutes from './routes/garageRoutes';
import reviewRoutes from './routes/reviewRoutes';

// Cargar variables de entorno
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/garages', garageRoutes);
app.use('/api/reviews', reviewRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send({ message: 'QuickPark API is running!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
