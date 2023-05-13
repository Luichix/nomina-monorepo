-- Tabla de Empleados
CREATE TABLE empleados (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo_electronico VARCHAR(255) NOT NULL,
  contrasena VARCHAR(255) NOT NULL
);

-- Tabla de Registros de Horas
CREATE TABLE registros_horas (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE
);


CREATE TABLE company_configuration (
  company_id INTEGER NOT NULL,
  parameter_name TEXT NOT NULL,
  parameter_value TEXT,
  PRIMARY KEY (company_id, parameter_name)
);


CREATE TABLE company_config (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  min_work_hours INT NOT NULL,
  max_work_hours INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
