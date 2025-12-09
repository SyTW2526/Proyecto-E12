FROM node:20-alpine

WORKDIR /app

# Build arguments para variables de Vite
ARG VITE_STRIPE_PUBLISHABLE_KEY

COPY package*.json ./

RUN npm install

COPY . .

# Convertir ARG a ENV para que estén disponibles durante el build
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

RUN npm run build

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
