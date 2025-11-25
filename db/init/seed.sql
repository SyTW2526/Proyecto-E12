-- Entradas usuarios
INSERT INTO usuario (nombre, email, contrasena)
VALUES
('Carlos Pérez', 'carlos@gmail.com', 'pepearturo'),
('Laura Díaz', 'laura@gmail.com', 'lauritalamasguapita43'),
('Marcos Gómez', 'marcos@gmail.com', 'marquitos89'),
('Lucía Torres', 'lucia@gmail.com', 'lugoat77'),
('Ana Martín', 'ana@gmail.com', 'chufi33'),
('Sergio López', 'sergio@gmail.com', 'yanblock444'),
('Isabel Romero', 'isabel@gmail.com', 'soyelcuti66'),
('Raúl Sánchez', 'raul@gmail.com', 'raulitoelmejor90'),
('Elena Vargas', 'elena@gmail.com', 'vivachile43'),
('Javier Ruiz', 'javier@gmail.com', 'javielmasguapi22'),
('Patricia León', 'patricia@gmail.com', 'patricialamasmolona77'),
('Alberto Navarro', 'alberto@gmail.com', 'choclock66'),
('Marta Ortiz', 'marta@gmail.com', 'recycledJ11'),
('Daniel Herrera', 'daniel@gmail.com', 'vivaanderherrera9'),
('Lucía Méndez', 'luciamendez@gmail.com', 'alamnyomMVP8'),
('Fernando Gil', 'fernando@gmail.com', 'fernandogilcontraseña8'),
('Paula Rojas', 'paula@gmail.com', 'paulitadomina3'),
('Andrés Campos', 'andres@gmail.com', 'pasteldepuerro66'),
('Nuria Vega', 'nuria@gmail.com', 'nurialadelcampoLoL0'),
('David Castro', 'david@gmail.com', 'ilikethispass90');

-- Entrada usuario imagen
-- INSERT INTO usuario (nombre, email, contrasena, imagen_perfil)
-- VALUES 
-- ('Juan Pérez', 'juan@example.com', '1234', pg_read_binary_file('../imagenes/FotoPerfil.jpg'));

-- Entradas garajes
INSERT INTO garaje (propietario_id, direccion, latitud, longitud, descripcion, precio, disponible)
VALUES
(1, 'Calle del Pilar 12, Santa Cruz de Tenerife', 28.4698, -16.2535, 'Garaje amplio cerca del centro', 2.50, TRUE),
(2, 'Avenida Anaga 45, Santa Cruz de Tenerife', 28.4756, -16.2489, 'Garaje subterráneo con vigilancia', 3.00, FALSE),
(3, 'Calle Castillo 7, Santa Cruz de Tenerife', 28.4680, -16.2523, 'Garaje techado y seguro', 2.00, TRUE),
(4, 'Calle Bethencourt 23, Santa Cruz de Tenerife', 28.4645, -16.2551, 'Garaje privado con acceso 24h', 3.50, TRUE),
(5, 'Calle San Sebastián 10, Santa Cruz de Tenerife', 28.4672, -16.2510, 'Garaje pequeño pero céntrico', 1.80, TRUE),
(6, 'Avenida Venezuela 32, Santa Cruz de Tenerife', 28.4620, -16.2580, 'Garaje techado con rampa', 2.70, TRUE),
(7, 'Calle Ramón y Cajal 18, Santa Cruz de Tenerife', 28.4710, -16.2495, 'Garaje amplio y bien iluminado', 2.90, TRUE),
(8, 'Calle Imeldo Serís 5, Santa Cruz de Tenerife', 28.4665, -16.2540, 'Garaje con buena ventilación', 2.20, TRUE),
(9, 'Calle San Roque 9, Santa Cruz de Tenerife', 28.4688, -16.2515, 'Garaje con puerta automática', 3.10, TRUE),
(10, 'Avenida Bélgica 14, Santa Cruz de Tenerife', 28.4595, -16.2610, 'Garaje privado cerca de la playa', 3.20, TRUE);

-- Entradas reservas
INSERT INTO reserva (usuario_id, garaje_id, fecha_inicio, fecha_fin, estado)
VALUES
(11, 1, '2025-11-05 10:00', '2025-11-05 12:00', 'completada'),
(12, 2, '2025-11-06 09:00', '2025-11-06 15:00', 'activa');

-- Entradas resenas
INSERT INTO resena (garaje_id, usuario_id, calificacion, comentario)
VALUES
(1, 13, 5, 'Muy buen garaje, amplio y limpio.'),
(2, 14, 4, 'Cómodo pero algo caro.'),
(3, 15, 5, 'Excelente ubicación y trato del propietario.'),
(4, 16, 3, 'El acceso es un poco estrecho.'),
(5, 17, 4, 'Todo correcto, repetiría.'),
(6, 18, 5, 'Garaje techado, perfecto para días de lluvia.'),
(7, 19, 4, 'Buena seguridad y fácil de encontrar.'),
(8, 20, 5, 'Muy buen precio y buena ubicación.'),
(9, 11, 4, 'Buena experiencia, aunque un poco oscuro.'),
(10, 12, 5, 'Excelente, cerca de la playa y fácil acceso.');