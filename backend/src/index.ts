// index.ts
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
// import garageRoutes from './Routes/garageRoutes';
import reservationRoutes from './Routes/reservationRoutes';

config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
// app.use('/api/garages', garageRoutes);
app.use('/api/reservas', reservationRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send({ message: 'QuickPark API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
