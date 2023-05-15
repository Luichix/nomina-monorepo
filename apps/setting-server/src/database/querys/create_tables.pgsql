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
