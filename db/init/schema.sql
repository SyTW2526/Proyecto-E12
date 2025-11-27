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

-- 4 Crear tabla de reseñas
CREATE TABLE resena (
    id SERIAL PRIMARY KEY,
    garaje_id INTEGER NOT NULL REFERENCES garaje(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
    comentario TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);