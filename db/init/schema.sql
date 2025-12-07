-- 1 Crear tabla de usuarios
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    contrasena TEXT NOT NULL,
    imagen_perfil BYTEA,
    stripe_account_id TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 2 Crear tabla de garajes
CREATE TABLE garaje (
    id SERIAL PRIMARY KEY,
    propietario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    direccion TEXT NOT NULL,
    latitud NUMERIC(9,6),
    longitud NUMERIC(9,6),
    descripcion TEXT,
    imagen_garaje BYTEA,
    precio NUMERIC(8,2) NOT NULL CHECK (precio >= 0),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    disponible BOOLEAN DEFAULT TRUE
);

-- 3 Crear tabla de reservas
CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    garaje_id INTEGER NOT NULL REFERENCES garaje(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    tipo_vehiculo TEXT NOT NULL CHECK (tipo_vehiculo IN ('moto', 'coche', 'furgoneta')),
    precio_total NUMERIC(10,2) NOT NULL CHECK (precio_total >= 0),
    payment_intent_id TEXT,
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activa', 'completada', 'cancelada')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL REFERENCES reserva(id) ON DELETE CASCADE,
    total_pagado NUMERIC(10,2) NOT NULL CHECK (total_pagado >= 0),
    comision_quickpark NUMERIC(10,2) NOT NULL CHECK (comision_quickpark >= 0),
    monto_propietario NUMERIC(10,2) NOT NULL CHECK (monto_propietario >= 0),
    stripe_charge_id TEXT,
    stripe_transfer_id TEXT,
    stripe_account_id TEXT,
    estado TEXT DEFAULT 'pendiente_transferir' CHECK (estado IN ('pendiente_transferir', 'transferido', 'reembolso', 'reembolso_parcial')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

