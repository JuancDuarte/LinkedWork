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
    FOREIGN KEY (IdUsuario) REFERENCES Usuario(IdUsuario) ON DELETE CASCADE,
    FOREIGN KEY (IdArea) REFERENCES Area(IdArea)
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
