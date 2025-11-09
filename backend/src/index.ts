import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('QuickPark backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
