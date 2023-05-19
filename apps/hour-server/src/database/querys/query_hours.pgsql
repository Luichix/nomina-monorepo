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

INSERT INTO time_logs (
  employee_id,
  start_time,
  end_time,
  duration,
  date
)
VALUES
  (2, '2023-05-01 08:00:00', '2023-05-01 12:00:00', '04:00:00', '2023-05-01'),
  (2, '2023-05-02 08:00:00', '2023-05-02 12:00:00', '04:00:00', '2023-05-02'),
  (2, '2023-05-03 08:00:00', '2023-05-03 12:00:00', '04:00:00', '2023-05-03'),
  (2, '2023-05-04 08:00:00', '2023-05-04 12:00:00', '04:00:00', '2023-05-04'),
  (2, '2023-05-05 08:00:00', '2023-05-05 12:00:00', '04:00:00', '2023-05-05'),
  (2, '2023-05-06 08:00:00', '2023-05-06 12:00:00', '04:00:00', '2023-05-06'),
  (2, '2023-05-07 08:00:00', '2023-05-07 12:00:00', '04:00:00', '2023-05-07'),
  (2, '2023-05-08 08:00:00', '2023-05-08 12:00:00', '04:00:00', '2023-05-08'),
  (2, '2023-05-09 08:00:00', '2023-05-09 12:00:00', '04:00:00', '2023-05-09'),
  (2, '2023-05-10 08:00:00', '2023-05-10 12:00:00', '04:00:00', '2023-05-10');
