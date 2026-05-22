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
ALTER TABLE trabajador
ADD COLUMN Puntuacion INT DEFAULT 0;
ALTER TABLE Trabajador DROP COLUMN IF EXISTS Departamento;
ALTER TABLE Trabajador DROP COLUMN IF EXISTS Ciudad;
ALTER TABLE Trabajador ADD COLUMN IdDepartamento INT;
ALTER TABLE Trabajador ADD COLUMN IdCiudad INT;

ALTER TABLE Trabajador ADD CONSTRAINT fk_trabajador_depto FOREIGN KEY (IdDepartamento) REFERENCES Departamento(IdDepartamento);
ALTER TABLE Trabajador ADD CONSTRAINT fk_trabajador_ciudad FOREIGN KEY (IdCiudad) REFERENCES Ciudad(IdCiudad);
ALTER TABLE trabajador ADD COLUMN es_farming BOOLEAN DEFAULT FALSE;

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
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE,
    FOREIGN KEY (IdArea) REFERENCES Area(IdArea)
    ALTER TABLE Solicitud ADD COLUMN Precio DECIMAL(12, 2) DEFAULT 0.00;
    ALTER TABLE Solicitud ADD COLUMN PrecioNegociable BOOLEAN DEFAULT TRUE;
    ALTER TABLE Solicitud
    ADD COLUMN FechaServicio DATE NULL,
    ADD COLUMN Direccion VARCHAR(255) NULL,
    ADD COLUMN HoraEncuentro VARCHAR(50) NULL,
    ADD COLUMN Notas TEXT NULL;
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
ALTER TABLE Certificado
ADD COLUMN Estado VARCHAR(50) DEFAULT 'Pendiente',
ADD COLUMN PuntosOtorgados INT DEFAULT 0;
CREATE TABLE Departamento (
    IdDepartamento INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Ciudad (
    IdCiudad INT AUTO_INCREMENT PRIMARY KEY,
    IdDepartamento INT,
    Nombre VARCHAR(100) NOT NULL,
    FOREIGN KEY (IdDepartamento) REFERENCES Departamento(IdDepartamento)
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
INSERT INTO Rol (Nombre) VALUES ('ROLE_USUARIO'), ('ROLE_TRABAJADOR'), ("FARMING");

-- Áreas
INSERT INTO Area (Nombre, Descripcion) VALUES 
('Tecnología', 'Servicios tecnológicos y desarrollo de software'),
('Construcción', 'Servicios de construcción y obras'),
('Salud', 'Servicios médicos y de salud'),
('Educación', 'Servicios educativos y formación'),
('Transporte', 'Servicios de transporte y logística'),
('General', 'Servicios generales '),
('Agricultura', 'Produccion agricola y actividades del sector rural'),
('Diseño', 'Diseño grafico, multimedia y desarrollo creativo '),
('Contabilidad', 'Servicios de contabilidad y finanzas'),
('Administración', 'Gestion administrativa y organizacion empresarial'),
("Educación", "Servicios educativos y formación"),
("Carpinteria", "Fabricacion y reparacion de muebles y estructuras de madera");

--Departamentos y Ciudades  
INSERT INTO Departamento (Nombre) VALUES 
('Amazonas'), ('Antioquia'), ('Arauca'), ('Atlántico'), ('Bolívar'), ('Boyacá'), 
('Caldas'), ('Caquetá'), ('Casanare'), ('Cauca'), ('Cesar'), ('Chocó'), 
('Córdoba'), ('Cundinamarca'), ('Guainía'), ('Guaviare'), ('Huila'), ('La Guajira'), 
('Magdalena'), ('Meta'), ('Nariño'), ('Norte de Santander'), ('Putumayo'), ('Quindío'), 
('Risaralda'), ('San Andrés y Providencia'), ('Santander'), ('Sucre'), ('Tolima'), 
('Valle del Cauca'), ('Vaupés'), ('Vichada');
INSERT INTO Ciudad (IdDepartamento, Nombre) VALUES 
-- Amazonas
(1, 'Leticia'), (1, 'Puerto Nariño'),
-- Antioquia
(2, 'Medellín'), (2, 'Bello'), (2, 'Itagüí'), (2, 'Envigado'), (2, 'Apartadó'), (2, 'Rionegro'), (2, 'Caucasia'),
-- Arauca
(3, 'Arauca'), (3, 'Tame'), (3, 'Saravena'),
-- Atlántico
(4, 'Barranquilla'), (4, 'Soledad'), (4, 'Malambo'), (4, 'Sabanalarga'), (4, 'Puerto Colombia'),
-- Bolívar
(5, 'Cartagena'), (5, 'Magangué'), (5, 'Turbaco'), (5, 'Arjona'),
-- Boyacá
(6, 'Tunja'), (6, 'Duitama'), (6, 'Sogamoso'), (6, 'Chiquinquirá'),
-- Caldas
(7, 'Manizales'), (7, 'La Dorada'), (7, 'Villamaría'),
-- Caquetá
(8, 'Florencia'), (8, 'San Vicente del Caguán'),
-- Casanare
(9, 'Yopal'), (9, 'Aguazul'),
-- Cauca
(10, 'Popayán'), (10, 'Santander de Quilichao'),
-- Cesar
(11, 'Valledupar'), (11, 'Aguachica'), (11, 'Agustín Codazzi'),
-- Chocó
(12, 'Quibdó'), (12, 'Istmina'),
-- Córdoba
(13, 'Montería'), (13, 'Cereté'), (13, 'Sahagún'), (13, 'Lorica'),
-- Cundinamarca
(14, 'Bogotá'), (14, 'Soacha'), (14, 'Fusagasugá'), (14, 'Facatativá'), (14, 'Chía'), (14, 'Zipaquirá'), (14, 'Girardot'),
-- Guainía
(15, 'Inírida'),
-- Guaviare
(16, 'San José del Guaviare'),
-- Huila
(17, 'Neiva'), (17, 'Pitalito'), (17, 'Garzón'),
-- La Guajira
(18, 'Riohacha'), (18, 'Maicao'), (18, 'Uribia'),
-- Magdalena
(19, 'Santa Marta'), (19, 'Ciénaga'), (19, 'Fundación'),
-- Meta
(20, 'Villavicencio'), (20, 'Acacías'), (20, 'Granada'),
-- Nariño
(21, 'Pasto'), (21, 'Tumaco'), (21, 'Ipiales'),
-- Norte de Santander
(22, 'Cúcuta'), (22, 'Ocaña'), (22, 'Villa del Rosario'), (22, 'Pamplona'),
-- Putumayo
(23, 'Mocoa'), (23, 'Puerto Asís'),
-- Quindío
(24, 'Armenia'), (24, 'Calarcá'),
-- Risaralda
(25, 'Pereira'), (25, 'Dosquebradas'), (25, 'Santa Rosa de Cabal'),
-- San Andrés
(26, 'San Andrés'), (26, 'Providencia'),
-- Santander
(27, 'Bucaramanga'), (27, 'Floridablanca'), (27, 'Barrancabermeja'), (27, 'Girón'), (27, 'Piedecuesta'),
-- Sucre
(28, 'Sincelejo'), (28, 'Corozal'),
-- Tolima
(29, 'Ibagué'), (29, 'Espinal'), (29, 'Melgar'),
-- Valle del Cauca
(30, 'Cali'), (30, 'Buenaventura'), (30, 'Palmira'), (30, 'Tuluá'), (30, 'Cartago'), (30, 'Buga'), (30, 'Jamundí'),
-- Vaupés
(31, 'Mitú'),
-- Vichada
(32, 'Puerto Carreño');

--Nivel
INSERT INTO nivel (Nombre, PuntajeMin, PuntajeMax) VALUES
('Aprendiz', 0, 100),
('Profesional', 101, 500),
('Experto', 501, 1500),
('Elite', 1501, 3000),
('Maestro', 3001, 999999);