import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router as authRouter } from './routes/auth.js';
import { router as garageRoutes } from './routes/garageRoutes.js';
import { router as reservationRoutes } from './routes/reservationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { router as paymentRoutes } from './routes/payment.js';
import { router as stripeRoutes } from './routes/stripeRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api/garages', garageRoutes);
app.use('/api/reservas', reservationRoutes);
app.use("/api/auth", authRouter);
app.use("/api/contact", contactRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stripe', stripeRoutes);

app.get('/', (req, res) => {
    res.send('QuickPark backend is running');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
