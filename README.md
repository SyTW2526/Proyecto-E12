# QuickPark 🚗

Plataforma web para reservar y alquilar plazas de garaje en Santa Cruz de Tenerife.

[![Unit Tests](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/unit-tests.yml)
[![E2E Tests](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/SyTW2526/Proyecto-E12/actions/workflows/e2e-tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/SyTW2526/Proyecto-E12/badge.svg?branch=dev)](https://coveralls.io/github/SyTW2526/Proyecto-E12?branch=dev)

## Descripción

QuickPark conecta a propietarios de plazas de garaje con personas que necesitan estacionamiento en Santa Cruz de Tenerife. La aplicación permite publicar plazas disponibles, buscar y reservar espacios de forma rápida y segura.

## Características principales

- 🔍 Búsqueda y filtrado de plazas disponibles
- 📅 Sistema de reservas en tiempo real
- 🏠 Gestión de plazas propias para alquiler
- 🔐 Autenticación segura de usuarios

## Stack tecnológico

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + TypeScript
- **Base de datos**: PostgreSQL
- **Containerización**: Docker

## Requisitos previos

> ⚠️ **Sección en desarrollo** - Los requisitos específicos de versiones de Node.js y variables de entorno se documentarán próximamente.

- Node.js (versión por especificar)
- Docker y Docker Compose
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/SyTW2526/Proyecto-E12.git
cd Proyecto-E12
```

### 2. Levantar la base de datos

Ejecuta Docker Compose desde la raíz del proyecto:

```bash
docker-compose up -d
```

Los scripts de inicialización están en `db/init/`:
- `schema.sql` — Creación de tablas
- `seed.sql` — Datos iniciales

Para detener y limpiar completamente (eliminar contenedores y volúmenes):

```bash
docker-compose down -v
```

### 3. Configurar variables de entorno

> ⚠️ **Pendiente de documentar** - Instrucciones para `.env` en desarrollo.

### 4. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Ejecutar la aplicación

```bash
# Terminal 1 - Backend
cd backend
npm run start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Testing

El proyecto incluye tests unitarios y end-to-end que se ejecutan automáticamente via GitHub Actions. Los badges de estado están disponibles en la parte superior de este README.

Para ejecutar los tests localmente:

```bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e
```

## Estructura del proyecto

```
Proyecto-E12/
├── backend/          # API REST + lógica de negocio
├── frontend/         # Aplicación React
├── db/
│   └── init/        # Scripts SQL de inicialización
└── docker-compose.yml
```

## Contribución

Si deseas contribuir al proyecto, por favor abre un issue o pull request en el repositorio.

---

Desarrollado por el equipo E12 - SyTW 2024/2025
- Arun Daswani Lakhani
- Daniel Enrique Gómez Alcalá
- Jean Franco Hernández García