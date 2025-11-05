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

-- Entradas garajes
INSERT INTO garaje (propietario_id, direccion, descripcion, precio, disponible)
VALUES
(1, 'Calle del Pilar 12', 'Garaje amplio cerca del centro', 2.50, TRUE),
(2, 'Avenida Anaga 45', 'Garaje subterráneo con vigilancia', 3.00, TRUE),
(3, 'Calle Castillo 7', 'Garaje techado y seguro', 2.00, TRUE),
(4, 'Calle Bethencourt 23', 'Garaje privado con acceso 24h', 3.50, FALSE),
(5, 'Calle San Sebastián 10', 'Garaje pequeño pero céntrico', 1.80, TRUE),
(6, 'Avenida Venezuela 32', 'Garaje techado con rampa', 2.70, TRUE),
(7, 'Calle Ramón y Cajal 18', 'Garaje amplio y bien iluminado', 2.90, FALSE),
(8, 'Calle Imeldo Serís 5', 'Garaje con buena ventilación', 2.20, TRUE),
(9, 'Calle San Roque 9', 'Garaje con puerta automática', 3.10, TRUE),
(10, 'Avenida Bélgica 14', 'Garaje privado cerca de la playa', 3.20, TRUE);

-- Entradas reservas
INSERT INTO reserva (usuario_id, garaje_id, fecha_inicio, fecha_fin, estado)
VALUES
(11, 1, '2025-11-05 10:00', '2025-11-05 12:00', 'completada'),
(12, 2, '2025-11-06 09:00', NULL, 'activa');

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