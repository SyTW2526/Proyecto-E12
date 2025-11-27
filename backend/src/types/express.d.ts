// src/types/express.d.ts
import * as express from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
    }

    interface Request {
      user?: User; // Agrega la propiedad `user` opcional
    }
  }
}