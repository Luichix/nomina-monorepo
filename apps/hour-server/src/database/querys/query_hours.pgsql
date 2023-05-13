CREATE TABLE employees (
  employee_id serial PRIMARY KEY,
  personal_id int NOT NULL,
  full_name varchar(255) NOT NULL
);

CREATE TABLE hours (
  hours_id serial PRIMARY KEY,
  date timestamp NOT NULL,
  employee_id int NOT NULL,
  total_hours time NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees (employee_id)
);

CREATE TABLE hours_logs (
  hours_id int NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration time NOT NULL,
  FOREIGN KEY (hours_id) REFERENCES hours (hours_id)
);

CREATE TABLE employees (
  employee_id serial PRIMARY KEY,
  personal_id int NOT NULL,
  full_name varchar(255) NOT NULL
);

CREATE TABLE time_logs (
  time_log_id serial PRIMARY KEY,
  employee_id int NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration time NOT NULL,
  date date NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees (employee_id)
);

INSERT INTO employees (personalID, fullName)
VALUES
  (1, 'John Doe'),
  (2, 'Jane Doe'),
  (3, 'Peter Smith'),
  (4, 'Mary Jones'),
  (5, 'David Brown'),
  (6, 'Susan Green'),
  (7, 'Michael White'),
  (8, 'Sarah Black'),
  (9, 'William Gray'),
  (10, 'Elizabeth Pink');
