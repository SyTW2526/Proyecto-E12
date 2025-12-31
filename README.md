# QuickPark 🚗

QuickPark es una plataforma web tipo Marketplace para el alquiler y la reserva de plazas de aparcamiento en Santa Cruz de Tenerife. La aplicación conecta a propietarios de plazas de garaje con usuarios que necesitan estacionamiento temporal, ofreciendo una experiencia sencilla, segura y visual.

[![Unit Tests](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/unit-tests.yml)
[![E2E Tests](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/e2e-tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/SyTW2526/Proyecto-E12/badge.svg?branch=dev)](https://coveralls.io/github/SyTW2526/Proyecto-E12?branch=dev)

## Descripción

QuickPark surge como un proyecto académico orientado a resolver uno de los principales problemas urbanos: la dificultad para encontrar aparcamiento. La plataforma permite optimizar el uso de plazas privadas disponibles, beneficiando tanto a propietarios como a usuarios finales.

La aplicación integra funcionalidades propias de un marketplace real, como autenticación, reservas, pagos online, visualización mediante mapas y envío de notificaciones por correo electrónico.

## Funcionalidades principales

- Búsqueda y filtrado de plazas de aparcamiento por ubicación, precio y disponibilidad
- Visualización de parkings mediante mapas interactivos
- Sistema de reservas con control de horarios
- Pagos online seguros integrados en la plataforma
- Autenticación y autorización de usuarios mediante tokens JWT
- Gestión de plazas para propietarios
- Envío de correos electrónicos de confirmación y notificaciones

## Stack tecnológico

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS y Material Tailwind
- Redux Toolkit
- Leaflet y Google Maps
- Stripe (React Stripe JS)

### Backend
- Node.js
- Express
- TypeScript
- JSON Web Tokens (JWT)
- PostgreSQL
- Stripe

### Emails
- Resend
- React Email

### Testing y calidad
- Vitest
- Supertest
- GitHub Actions (CI/CD)
- Coveralls

### Herramientas y entorno
- Docker y Docker Compose
- GitHub
- Jira
- Figma
- DBeaver
- Slack Webhooks

## Requisitos previos

- Node.js
- Docker y Docker Compose
- npm

## Instalación y ejecución

### Clonar el repositorio

```bash
git clone https://github.com/SyTW2526/Proyecto-E12.git
cd Proyecto-E12
```

### Levantar la base de datos

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

Los scripts de inicialización se encuentran en el directorio db/init/:
	•	schema.sql para la creación de tablas
	•	seed.sql para datos iniciales

Para detener y eliminar los contenedores y volúmenes:

```bash
docker-compose down -v
```

### Configuración de variables de entorno

Es necesario crear un archivo .env tanto en el directorio backend/ como en frontend/ con las variables correspondientes (base de datos, JWT, Stripe, etc.).

### Instalación de dependencias

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Ejecución de la aplicación

```bash
cd backend
npm run start

cd frontend
npm run dev
```

## Testing

El proyecto incluye tests unitarios y end-to-end ejecutados automáticamente mediante GitHub Actions.

Para ejecutar los tests de forma local:

```bash
npm run test
npm run test:e2e
```

## Estructura del proyecto

```text
Proyecto-E12/
├── backend/          API REST y lógica de negocio
├── frontend/         Aplicación React
├── db/
│   └── init/         Scripts SQL de inicialización
└── docker-compose.yml
```

## Equipo

Proyecto desarrollado de forma colaborativa por el equipo E12 – SyTW 2024/2025.
	•	Arun Daswani Lakhani
	•	Daniel Enrique Gómez Alcalá
	•	Jean Franco Hernández García

## Estado del proyecto

Proyecto académico funcional orientado a demostrar el desarrollo de una aplicación web full-stack utilizando tecnologías modernas y buenas prácticas de ingeniería del software.