-- ========================================
-- TABLA: Rol
-- ========================================
CREATE TABLE Rol (
    IdRol INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL
);

-- ========================================
-- TABLA: Usuario
-- ========================================
CREATE TABLE Usuario (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    NombreCompleto VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    NombreUsuario VARCHAR(50) UNIQUE,
    ClaveHash VARCHAR(255) NOT NULL,
    Estado VARCHAR(50) DEFAULT 'Activo',
    IntentosFallidos INT DEFAULT 0,
    Bloqueado BOOLEAN DEFAULT FALSE,
    FotoPerfil VARCHAR(255) DEFAULT NULL,
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UltimoAcceso TIMESTAMP
);

-- ========================================
-- TABLA: Usuario_Rol
-- ========================================
CREATE TABLE Usuario_Rol (
    IdUsuario INT,
    IdRol INT,
    PRIMARY KEY (IdUsuario, IdRol),
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE,
    FOREIGN KEY (IdRol) REFERENCES Rol(IdRol) ON DELETE CASCADE
);

-- ========================================
-- TABLA: Area
-- ========================================
CREATE TABLE Area (
    IdArea INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100),
    Descripcion TEXT
);

-- ========================================
-- TABLA: Trabajador
-- ========================================
CREATE TABLE Trabajador (
    IdTrabajador INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT NOT NULL,
    IdArea INT,
    Descripcion TEXT,
    Experiencia INT,
    Estado VARCHAR(50) DEFAULT 'Activo',
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE,
    FOREIGN KEY (IdArea) REFERENCES Area(IdArea)
);

-- ========================================
-- TABLA: Nivel
-- ========================================
CREATE TABLE Nivel (
    IdNivel INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50),
    PuntajeMin INT,
    PuntajeMax INT
);

-- ========================================
-- TABLA: Trabajador_Nivel
-- ========================================
CREATE TABLE Trabajador_Nivel (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IdTrabajador INT,
    IdNivel INT,
    FechaInicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FechaFin TIMESTAMP NULL,
    FOREIGN KEY (IdTrabajador) REFERENCES Trabajador(IdTrabajador) ON DELETE CASCADE,
    FOREIGN KEY (IdNivel) REFERENCES Nivel(IdNivel)
);

-- ========================================
-- TABLA: Solicitud
-- ========================================
CREATE TABLE Solicitud (
    IdSolicitud INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT,
    IdArea INT,
    Titulo VARCHAR(150),
    Descripcion TEXT,
    Estado VARCHAR(50) DEFAULT 'Pendiente',
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Precio DECIMAL(12,2),
    FechaServicio DATE,
    Direccion VARCHAR(255) DEFAULT NULL,
    HoraEncuentro VARCHAR(100) DEFAULT NULL,
    Notas TEXT DEFAULT NULL,
    Latitud DOUBLE DEFAULT NULL,
    Longitud DOUBLE DEFAULT NULL,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE,
    FOREIGN KEY (IdArea) REFERENCES Area(IdArea)
);

-- ========================================
-- TABLA: Pago
-- ========================================
CREATE TABLE Pago (
    IdPago INT AUTO_INCREMENT PRIMARY KEY,
    IdSolicitud INT NOT NULL,
    IdUsuario INT NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    Comision DECIMAL(10,2) NOT NULL,
    MontoNeto DECIMAL(10,2) NOT NULL,
    ReferenciaPago VARCHAR(100) UNIQUE NOT NULL,
    EstadoPago VARCHAR(50) DEFAULT 'Pendiente',
    MetodoPago VARCHAR(50) DEFAULT NULL,
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FechaActualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitud(IdSolicitud) ON DELETE CASCADE,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE
);

-- ========================================
-- TABLA: Solicitud_Historial
-- ========================================
CREATE TABLE Solicitud_Historial (
    IdHistorial INT AUTO_INCREMENT PRIMARY KEY,
    IdSolicitud INT,
    EstadoAnterior VARCHAR(50),
    EstadoNuevo VARCHAR(50),
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitud(IdSolicitud) ON DELETE CASCADE
);

-- ========================================
-- TABLA: Oferta
-- ========================================
CREATE TABLE Oferta (
    IdOferta INT AUTO_INCREMENT PRIMARY KEY,
    IdSolicitud INT,
    IdTrabajador INT,
    Precio DECIMAL(10,2),
    Descripcion TEXT,
    Estado VARCHAR(50) DEFAULT 'Pendiente',
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitud(IdSolicitud) ON DELETE CASCADE,
    FOREIGN KEY (IdTrabajador) REFERENCES Trabajador(IdTrabajador) ON DELETE CASCADE
);

-- ========================================
-- TABLA: Oferta_Historial
-- ========================================
CREATE TABLE Oferta_Historial (
    IdHistorial INT AUTO_INCREMENT PRIMARY KEY,
    IdOferta INT,
    PrecioAnterior DECIMAL(10,2),
    PrecioNuevo DECIMAL(10,2),
    DescripcionAnterior TEXT,
    DescripcionNueva TEXT,
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdOferta) REFERENCES Oferta(IdOferta) ON DELETE CASCADE
);

-- ========================================
-- TABLA: Calificacion
-- ========================================
CREATE TABLE Calificacion (
    IdCalificacion INT AUTO_INCREMENT PRIMARY KEY,
    IdUsuario INT,
    IdTrabajador INT,
    IdSolicitud INT,
    Puntuacion INT,
    Comentario TEXT,
    FechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE,
    FOREIGN KEY (IdTrabajador) REFERENCES Trabajador(IdTrabajador) ON DELETE CASCADE,
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitud(IdSolicitud) ON DELETE CASCADE
);

-- ========================================
-- TABLA: Evaluacion
-- ========================================
CREATE TABLE Evaluacion (
    IdEvaluacion INT AUTO_INCREMENT PRIMARY KEY,
    IdTrabajador INT,
    IdAdministrador INT,
    Resultado VARCHAR(50),
    Estado VARCHAR(50) DEFAULT 'Pendiente',
    Fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdTrabajador) REFERENCES Trabajador(IdTrabajador) ON DELETE CASCADE,
    FOREIGN KEY (IdAdministrador) REFERENCES Usuario(IdUsuario)
);

-- ========================================
-- TABLA: Certificado
-- ========================================
CREATE TABLE Certificado (
    IdCertificado INT AUTO_INCREMENT PRIMARY KEY,
    IdTrabajador INT,
    Nombre VARCHAR(100),
    Entidad VARCHAR(100),
    Descripcion TEXT,
    Fecha TIMESTAMP,
    FOREIGN KEY (IdTrabajador) REFERENCES Trabajador(IdTrabajador) ON DELETE CASCADE
);

-- ========================================
-- TABLA: ChatMensaje
-- ========================================
CREATE TABLE ChatMensaje (
    IdMensaje INT AUTO_INCREMENT PRIMARY KEY,
    IdSolicitud INT NOT NULL,
    IdEmisor INT NOT NULL,
    Mensaje TEXT NOT NULL,
    FechaEnvio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdSolicitud) REFERENCES Solicitud(IdSolicitud) ON DELETE CASCADE,
    FOREIGN KEY (IdEmisor) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE
);

-- ========================================
-- DATOS INICIALES
-- ========================================

-- Roles
INSERT INTO Rol (Nombre) VALUES ('ROLE_USUARIO'), ('ROLE_TRABAJADOR');

-- Áreas
INSERT INTO Area (Nombre, Descripcion) VALUES 
('Tecnología', 'Servicios tecnológicos y desarrollo de software'),
('Construcción', 'Servicios de construcción y obras'),
('Salud', 'Servicios médicos y de salud'),
('Educación', 'Servicios educativos y formación'),
('Transporte', 'Servicios de transporte y logística');

-- ========================================
-- TABLA: Departamento
-- ========================================
CREATE TABLE IF NOT EXISTS Departamento (
    IdDepartamento INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
);

-- ========================================
-- TABLA: Ciudad
-- ========================================
CREATE TABLE IF NOT EXISTS Ciudad (
    IdCiudad INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    IdDepartamento INT,
    FOREIGN KEY (IdDepartamento) REFERENCES Departamento(IdDepartamento)
);

-- Departamentos de Colombia
INSERT IGNORE INTO Departamento (IdDepartamento, Nombre) VALUES
(1, 'Amazonas'), (2, 'Antioquia'), (3, 'Arauca'), (4, 'Atlántico'), (5, 'Bolívar'),
(6, 'Boyacá'), (7, 'Caldas'), (8, 'Caquetá'), (9, 'Casanare'), (10, 'Cauca'),
(11, 'Cesar'), (12, 'Chocó'), (13, 'Córdoba'), (14, 'Cundinamarca'), (15, 'Guainía'),
(16, 'Guaviare'), (17, 'Huila'), (18, 'La Guajira'), (19, 'Magdalena'), (20, 'Meta'),
(21, 'Nariño'), (22, 'Norte de Santander'), (23, 'Putumayo'), (24, 'Quindío'),
(25, 'Risaralda'), (26, 'San Andrés'), (27, 'Santander'), (28, 'Sucre'),
(29, 'Tolima'), (30, 'Valle del Cauca'), (31, 'Vaupés'), (32, 'Vichada'),
(33, 'Bogotá D.C.');

-- Ciudades por Departamento
INSERT IGNORE INTO Ciudad (IdCiudad, Nombre, IdDepartamento) VALUES
-- Amazonas
(1, 'Leticia', 1), (2, 'Puerto Nariño', 1),
-- Antioquia
(3, 'Medellín', 2), (4, 'Bello', 2), (5, 'Itagüí', 2), (6, 'Envigado', 2), (7, 'Apartadó', 2), (8, 'Turbo', 2), (9, 'Rionegro', 2), (10, 'Sabaneta', 2),
-- Arauca
(11, 'Arauca', 3), (12, 'Tame', 3),
-- Atlántico
(13, 'Barranquilla', 4), (14, 'Soledad', 4), (15, 'Malambo', 4), (16, 'Sabanalarga', 4),
-- Bolívar
(17, 'Cartagena', 5), (18, 'Magangué', 5), (19, 'Turbaco', 5),
-- Boyacá
(20, 'Tunja', 6), (21, 'Duitama', 6), (22, 'Sogamoso', 6), (23, 'Chiquinquirá', 6),
-- Caldas
(24, 'Manizales', 7), (25, 'La Dorada', 7), (26, 'Villamaría', 7),
-- Caquetá
(27, 'Florencia', 8), (28, 'San Vicente del Caguán', 8),
-- Casanare
(29, 'Yopal', 9), (30, 'Aguazul', 9),
-- Cauca
(31, 'Popayán', 10), (32, 'Puerto Tejada', 10), (33, 'Santander de Quilichao', 10),
-- Cesar
(34, 'Valledupar', 11), (35, 'Aguachica', 11), (36, 'Bosconia', 11),
-- Chocó
(37, 'Quibdó', 12), (38, 'Istmina', 12),
-- Córdoba
(39, 'Montería', 13), (40, 'Lorica', 13), (41, 'Cereté', 13),
-- Cundinamarca
(42, 'Soacha', 14), (43, 'Facatativá', 14), (44, 'Fusagasugá', 14), (45, 'Zipaquirá', 14), (46, 'Chía', 14), (47, 'Mosquera', 14), (48, 'Madrid', 14),
-- Guainía
(49, 'Inírida', 15),
-- Guaviare
(50, 'San José del Guaviare', 16),
-- Huila
(51, 'Neiva', 17), (52, 'Pitalito', 17), (53, 'Garzón', 17),
-- La Guajira
(54, 'Riohacha', 18), (55, 'Maicao', 18), (56, 'Uribia', 18),
-- Magdalena
(57, 'Santa Marta', 19), (58, 'Ciénaga', 19), (59, 'Fundación', 19),
-- Meta
(60, 'Villavicencio', 20), (61, 'Acacías', 20), (62, 'Granada', 20),
-- Nariño
(63, 'Pasto', 21), (64, 'Ipiales', 21), (65, 'Tumaco', 21),
-- Norte de Santander
(66, 'Cúcuta', 22), (67, 'Ocaña', 22), (68, 'Villa del Rosario', 22),
-- Putumayo
(69, 'Mocoa', 23), (70, 'Puerto Asís', 23),
-- Quindío
(71, 'Armenia', 24), (72, 'Calarcá', 24), (73, 'Montenegro', 24),
-- Risaralda
(74, 'Pereira', 25), (75, 'Dosquebradas', 25), (76, 'Santa Rosa de Cabal', 25),
-- San Andrés
(77, 'San Andrés', 26), (78, 'Providencia', 26),
-- Santander
(79, 'Bucaramanga', 27), (80, 'Floridablanca', 27), (81, 'Girón', 27), (82, 'Piedecuesta', 27), (83, 'Barrancabermeja', 27),
-- Sucre
(84, 'Sincelejo', 28), (85, 'Corozal', 28),
-- Tolima
(86, 'Ibagué', 29), (87, 'Espinal', 29), (88, 'Melgar', 29),
-- Valle del Cauca
(89, 'Cali', 30), (90, 'Buenaventura', 30), (91, 'Palmira', 30), (92, 'Buga', 30), (93, 'Tuluá', 30), (94, 'Yumbo', 30), (95, 'Cartago', 30),
-- Vaupés
(96, 'Mitú', 31),
-- Vichada
(97, 'Puerto Carreño', 32),
-- Bogotá D.C.
(98, 'Bogotá', 33);
