QuickPark 🚗

Plataforma web tipo Marketplace para el alquiler y la reserva de plazas de aparcamiento en Santa Cruz de Tenerife.

QuickPark conecta a propietarios de plazas de garaje con usuarios que necesitan estacionamiento temporal, ofreciendo una experiencia sencilla, segura y visual mediante mapas interactivos, reservas online y pagos integrados.

[![Unit Tests](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/unit-tests.yml)
[![E2E Tests](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/e2e-tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/SyTW2526/Proyecto-E12/badge.svg?branch=dev)](https://coveralls.io/github/SyTW2526/Proyecto-E12?branch=dev)


Descripción

QuickPark nace como un proyecto académico con el objetivo de dar respuesta a uno de los principales problemas urbanos: la dificultad para encontrar aparcamiento. La plataforma permite optimizar el uso de plazas privadas disponibles, beneficiando tanto a propietarios como a usuarios finales.

La aplicación integra funcionalidades propias de un marketplace real, como autenticación, reservas, pagos online y notificaciones, ofreciendo una solución completa y funcional.


Funcionalidades principales
	•	Búsqueda avanzada de parkings mediante filtros por ubicación, precio y disponibilidad
	•	Visualización en mapas interactivos para facilitar la elección de plaza
	•	Sistema de reservas con control de horarios
	•	Pagos online seguros integrados en la plataforma
	•	Autenticación y autorización mediante JWT
	•	Gestión de plazas para propietarios
	•	Envío de correos transaccionales (confirmaciones y notificaciones)


Stack tecnológico

Frontend
	•	React
	•	TypeScript
	•	Vite
	•	Tailwind CSS + Material Tailwind
	•	Redux Toolkit
	•	Leaflet / Google Maps
	•	Stripe (React Stripe JS)

Backend
	•	Node.js
	•	Express
	•	TypeScript
	•	JWT (jsonwebtoken)
	•	PostgreSQL
	•	Stripe

Emails
	•	Resend
	•	React Email

Testing y calidad
	•	Vitest
	•	Supertest
	•	GitHub Actions (CI/CD)
	•	Coveralls

Herramientas y entorno
	•	Docker & Docker Compose
	•	GitHub
	•	Jira
	•	Figma
	•	DBeaver
	•	Slack Webhooks


⚙️ Requisitos previos
	•	Node.js
	•	Docker y Docker Compose
	•	npm


Instalación y ejecución

1. Clonar el repositorio

git clone https://github.com/SyTW2526/Proyecto-E12.git
cd Proyecto-E12

2. Levantar la base de datos

Desde la raíz del proyecto:

docker-compose up -d

Los scripts de inicialización se encuentran en db/init/:
	•	schema.sql — creación de tablas
	•	seed.sql — datos iniciales

Para detener y limpiar los contenedores:

docker-compose down -v

3. Configurar variables de entorno

Crear un archivo .env tanto en backend/ como en frontend/ con las variables necesarias (base de datos, JWT, Stripe, etc.).

4. Instalar dependencias

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

5. Ejecutar la aplicación

# Backend
cd backend
npm run start

# Frontend
cd frontend
npm run dev



Testing

El proyecto incluye tests unitarios y end-to-end ejecutados automáticamente mediante GitHub Actions.

Para ejecutar los tests localmente:

# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e



Estructura del proyecto

Proyecto-E12/
├── backend/          # API REST y lógica de negocio
├── frontend/         # Aplicación React
├── db/
│   └── init/         # Scripts SQL de inicialización
└── docker-compose.yml



Equipo

Proyecto desarrollado de forma colaborativa por el equipo E12 – SyTW 2024/2025:
	•	Arun Daswani Lakhani
	•	Daniel Enrique Gómez Alcalá
	•	Jean Franco Hernández García


Estado del proyecto

Proyecto académico funcional orientado a demostrar el desarrollo de una aplicación web full-stack con tecnologías modernas y buenas prácticas de ingeniería del software.