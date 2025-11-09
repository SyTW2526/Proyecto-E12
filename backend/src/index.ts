import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router as authRouter } from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.get('/', (req, res) => {
    res.send('QuickPark backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
